import { Expose } from 'alemonjs';
import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { animalChessExit, animalChessAction, animalChessStart, animalChessSnapshot, chineseChessExit, chineseChessAction, chineseChessStart, chineseChessSnapshot, sokobanExit, sokobanAction, sokobanStart, sokobanSnapshot, points24Exit, points24Action, points24Start, points24Snapshot } from './gameToolActions.js';
import { boardRooms } from './boardRooms.js';
import { gamePools } from './gamePools.js';
import { gameSession } from './gameSession.js';
import { timeDiff } from './lib.js';
import { openMinesweeperCells, markMinesweeperCells, snapshotVisibleMinesweeper, MINESWEEPER_GAME, createMinesweeperGame } from './games/minesweeper.js';
import { GOBANG_GAME, analyzeGobangTactics, GOBANG_AGENT_USER_ID, placeGobangMove, checkGobangWin, isGobangBoardFull } from './games/gobang.js';

const XIANYU_GAME_PROTOCOL = "xianyu-game-v1";
const XIANYU_GAME_AGENT_PROTOCOL = "xianyu-game-agent-v1";
const settingsPath = resolve(dirname(fileURLToPath(import.meta.url)), "../../data/ai-opponents.json");
const opponentSettings = new Map();
const pendingTurns = new Map();
/** 记录每个会话当前由 AI 接管的扫雷玩家作用域；AI 后续操作必须使用同一作用域。 */
const minesweeperScopes = new Map();
const minesweeperLevels = new Set(["简单", "中等", "困难"]);
let settingsLoaded = false;
const availableGames = [
    { id: "minesweeper", name: "扫雷", type: "single" },
    { id: "points24", name: "24点", type: "single" },
    { id: "sokoban", name: "推箱子", type: "single" },
    { id: "gobang", name: "五子棋", type: "board", supportsAIOpponent: true },
    { id: "chinese-chess", name: "中国象棋", type: "board" },
    { id: "animal-chess", name: "斗兽棋", type: "board" },
];
const loadSettings = async () => {
    if (settingsLoaded)
        return;
    settingsLoaded = true;
    try {
        const raw = await readFile(settingsPath, "utf8");
        const values = JSON.parse(raw);
        for (const [guid, opponent] of Object.entries(values)) {
            if (guid && typeof opponent === "string" && opponent) {
                opponentSettings.set(guid, opponent);
            }
        }
    }
    catch (error) {
        if (error?.code !== "ENOENT") {
            console.warn("[xianyu-game] 读取 AI 对手配置失败，将使用内存配置", error);
        }
    }
};
const persistSettings = async () => {
    await mkdir(dirname(settingsPath), { recursive: true });
    const tempPath = `${settingsPath}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tempPath, JSON.stringify(Object.fromEntries(opponentSettings), null, 2), "utf8");
    await rename(tempPath, settingsPath);
};
const listAgents = async (guid) => {
    const expose = Expose.create();
    const providers = expose.list(XIANYU_GAME_AGENT_PROTOCOL);
    const entries = await Promise.all(providers.map(async (provider) => {
        try {
            const descriptor = (await provider.invoke("describe", { guid }));
            if (!descriptor?.id || !descriptor?.name)
                return null;
            return { descriptor, invoke: provider.invoke };
        }
        catch {
            return null;
        }
    }));
    return entries.filter((entry) => Boolean(entry));
};
const findAgent = async (id, guid) => (await listAgents(guid)).find((entry) => entry.descriptor.id === id) ?? null;
const getSelectedOpponent = async (guid) => {
    const safeGuid = String(guid ?? "").trim();
    if (!safeGuid)
        return "";
    await loadSettings();
    return opponentSettings.get(safeGuid) ?? "";
};
const setSelectedOpponent = async (guid, opponentId) => {
    const safeGuid = String(guid ?? "").trim();
    if (!safeGuid)
        throw new Error("当前会话缺少 guid，无法设置 AI 对手");
    await loadSettings();
    if (opponentId) {
        opponentSettings.set(safeGuid, opponentId);
    }
    else {
        opponentSettings.delete(safeGuid);
    }
    await persistSettings();
};
const getGameHubStatus = async (guid) => {
    const selectedOpponent = await getSelectedOpponent(guid);
    const agents = await listAgents(guid);
    const selected = agents.find((agent) => agent.descriptor.id === selectedOpponent);
    return {
        protocol: XIANYU_GAME_PROTOCOL,
        guid: String(guid ?? "").trim() || undefined,
        games: availableGames,
        selectedOpponent: selectedOpponent || "builtin",
        selectedAvailable: selectedOpponent ? Boolean(selected?.descriptor.ready) : true,
        agents: agents.map((agent) => agent.descriptor),
    };
};
const snapshotGobang = (guid) => {
    const room = boardRooms.getRoomByGuid(guid, GOBANG_GAME);
    if (!room)
        return null;
    return {
        game: GOBANG_GAME,
        guid,
        status: room.status,
        mode: room.state.mode,
        current: room.state.current,
        // 二维数组按 board[y - 1][x - 1] 访问；用 x/y 而不是 row/col
        // 避免模型将“行”理解成水平方向后把坐标转置。
        coordinateSystem: {
            base: 1,
            origin: "左上角",
            inputOrder: "x y（横坐标、纵坐标）",
            boardIndex: "board[y - 1][x - 1]",
            moveArguments: "gobang_move 传 x（横坐标）和 y（纵坐标）",
        },
        tactics: analyzeGobangTactics(room.state.board),
        board: room.state.board.map((row) => [...row]),
        lastMove: room.state.lastMove
            ? { x: room.state.lastMove.col + 1, y: room.state.lastMove.row + 1 }
            : undefined,
        moveCount: room.state.moveCount,
        players: Object.values(room.players).map((player) => ({
            userId: player.userId,
            nickname: player.nickname,
            team: player.team,
        })),
    };
};
const getPendingTurn = (guid, token) => {
    const pending = pendingTurns.get(guid);
    if (!pending || pending.expiresAt < Date.now() || pending.token !== token) {
        pendingTurns.delete(guid);
        return null;
    }
    return pending;
};
const bindMinesweeperSession = (guid, event) => {
    const safeGuid = String(guid ?? "").trim();
    if (!safeGuid)
        return;
    minesweeperScopes.set(safeGuid, {
        ...event,
        guid: safeGuid,
    });
};
/** 用户结束扫雷时清理 AI 接管的作用域，避免留下已失效的玩家作用域。 */
const unbindMinesweeperSession = (guid) => {
    const safeGuid = String(guid ?? "").trim();
    if (!safeGuid)
        return;
    minesweeperScopes.delete(safeGuid);
};
const getMinesweeperGame = (guid) => {
    const event = minesweeperScopes.get(guid);
    if (!event)
        return undefined;
    return gamePools.getGame(event, MINESWEEPER_GAME);
};
const snapshotMinesweeper = (guid) => {
    const game = getMinesweeperGame(guid);
    return game ? snapshotVisibleMinesweeper(game, guid) : null;
};
/**
 * 解析扫雷玩家作用域：优先使用宿主注入的真实会话，其次复用插件记录的会话。
 * 宿主注入优先，是为了让 AI 新建的对局落在当前真实会话作用域，
 * 而不是上一次 #扫雷 留下的旧作用域。
 */
const resolveMinesweeperSession = (guid, session) => {
    const injected = session && session.UserId ? { ...session, guid } : undefined;
    const event = injected ?? minesweeperScopes.get(guid);
    if (!event?.UserId) {
        return {
            error: "当前会话缺少扫雷玩家作用域，请先调用 minesweeper_start 开始对局。",
        };
    }
    return { event };
};
const sessionKeyOf = (event) => `${event.UserId ?? ""}|${event.IsPrivate ? "private" : "group"}`.toLowerCase();
/**
 * 解析当前实际持有的扫雷作用域：会话里只有一张棋盘，
 * 所以先看宿主注入的作用域，再回退到插件记录的接管作用域。
 */
const resolveActiveMinesweeperSession = (guid, session) => {
    const candidates = [];
    if (session?.UserId)
        candidates.push({ ...session, guid });
    const bound = minesweeperScopes.get(guid);
    if (bound)
        candidates.push(bound);
    const seen = new Set();
    for (const event of candidates) {
        const key = sessionKeyOf(event);
        if (seen.has(key))
            continue;
        seen.add(key);
        const game = gamePools.getGame(event, MINESWEEPER_GAME);
        if (!game)
            continue;
        if (game.state !== "playing") {
            return {
                error: "当前扫雷对局已经结束，请按快照确认结果，或用 minesweeper_start 开始新的一局。",
            };
        }
        return { event, game };
    }
    return {
        error: "当前没有可由 AI 操作的扫雷对局，请先调用 minesweeper_start 开始一局。",
    };
};
const renderMinesweeperMedia = async (game, summary, final = false) => {
    try {
        const [{ renderComponentToBuffer }, { default: GameMap }] = await Promise.all([
            import('jsxp'),
            import('../image/conponent/minesweeper/map.js'),
        ]);
        const image = await renderComponentToBuffer("minesweeper", GameMap, { game });
        return {
            summary: typeof image === "boolean" ? `${summary}\n棋盘图片渲染失败。` : summary,
            image: typeof image === "boolean" ? undefined : image,
            final,
        };
    }
    catch (error) {
        console.warn("[xianyu-game] 渲染扫雷 AI 操作棋盘失败", error);
        return { summary: `${summary}\n棋盘图片渲染失败。`, final };
    }
};
const startMinesweeperFromTool = async (input) => {
    const guid = String(input.guid ?? "").trim();
    if (!guid)
        return { ok: false, error: "当前会话缺少 guid" };
    const difficulty = input.difficulty ?? "简单";
    if (!minesweeperLevels.has(difficulty)) {
        return { ok: false, error: "扫雷难度仅支持：简单、中等、困难" };
    }
    const resolved = resolveMinesweeperSession(guid, input.session);
    if ("error" in resolved)
        return { ok: false, error: resolved.error };
    const { event } = resolved;
    const scopeKey = gamePools.getScopeKey(event);
    const current = gamePools.getGame(event, MINESWEEPER_GAME);
    if (current?.state === "playing") {
        return {
            ok: true,
            started: false,
            alreadyRunning: true,
            scopeKey,
            snapshot: snapshotVisibleMinesweeper(current, guid),
            hint: "当前会话已有进行中的扫雷，已直接返回该棋盘，不会重开；请按快照继续操作。",
        };
    }
    // 同一个会话里只有一张棋盘：别人正在玩的对局不能被静默接管或重置。
    const active = resolveActiveMinesweeperSession(guid, event);
    if ("game" in active && sessionKeyOf(active.event) !== sessionKeyOf(event)) {
        return {
            ok: false,
            error: "当前会话已有其他成员正在进行的扫雷对局，不能抢占或重置。请先由该成员结束对局，或用 minesweeper_exit 结束当前对局后再开始。",
        };
    }
    if (current)
        gamePools.removeGame(event, MINESWEEPER_GAME);
    const game = createMinesweeperGame(difficulty);
    gamePools.saveGame(event, MINESWEEPER_GAME, game);
    bindMinesweeperSession(guid, event);
    gameSession.activate(event, MINESWEEPER_GAME);
    const summary = `已开始${difficulty}扫雷：${game.row}×${game.col}，共 ${game.mine} 雷。`;
    return {
        ok: true,
        started: true,
        difficulty,
        scopeKey,
        snapshot: snapshotVisibleMinesweeper(game, guid),
        progressMedia: await renderMinesweeperMedia(game, summary),
    };
};
const exitMinesweeperFromTool = (input) => {
    const guid = String(input.guid ?? "").trim();
    if (!guid)
        return { ok: false, error: "当前会话缺少 guid" };
    const resolved = resolveMinesweeperSession(guid, input.session);
    if ("error" in resolved)
        return { ok: false, error: resolved.error };
    // 结束对局时同样要覆盖插件记录的接管作用域，
    // 否则其他成员的结束请求会漏掉真正的棋盘。
    const active = resolveActiveMinesweeperSession(guid, resolved.event);
    const event = "event" in active ? active.event : resolved.event;
    const existed = Boolean(gamePools.getGame(event, MINESWEEPER_GAME));
    if (existed)
        gamePools.removeGame(event, MINESWEEPER_GAME);
    gameSession.deactivate(event, MINESWEEPER_GAME);
    unbindMinesweeperSession(guid);
    return { ok: true, ended: existed };
};
const renderMinesweeperProgress = async (game, operation, changedCells, progress) => {
    try {
        const coordinateText = changedCells.join("、");
        const actionText = operation === "open"
            ? `翻开 ${coordinateText}`
            : operation === "mark"
                ? `标记 ${coordinateText}`
                : `取消标记 ${coordinateText}`;
        const resultText = progress.status === "win"
            ? "扫雷成功"
            : progress.status === "lose"
                ? "踩雷，游戏结束"
                : "游戏继续";
        const summary = `${actionText}；累计翻开 ${progress.openedCount}/${progress.totalCells} 格，已标记 ${progress.flagCount}/${progress.mineCount}，${resultText}。`;
        return renderMinesweeperMedia(game, summary, progress.status !== "playing");
    }
    catch (error) {
        console.warn("[xianyu-game] 渲染扫雷 AI 操作棋盘失败", error);
        return undefined;
    }
};
const actMinesweeperFromTool = async (input) => {
    const guid = String(input.guid ?? "").trim();
    if (!guid)
        return { ok: false, error: "当前会话缺少 guid" };
    const resolved = resolveMinesweeperSession(guid, input.session);
    if ("error" in resolved)
        return { ok: false, error: resolved.error };
    // 同一个会话只有一张棋盘：优先用宿主注入的作用域，
    // 找不到对局时回退到插件记录的接管作用域（例如另一位群成员发起的操作）。
    const active = resolveActiveMinesweeperSession(guid, resolved.event);
    if ("error" in active)
        return { ok: false, error: active.error };
    const { event, game } = active;
    const cells = Array.isArray(input.cells)
        ? input.cells.map(String).slice(0, 100)
        : [];
    if (cells.length === 0) {
        return { ok: false, error: "至少需要一个扫雷坐标" };
    }
    const beforeCells = Object.values(game.map);
    const beforeOpened = beforeCells.filter((cell) => cell.isOpen).length;
    const beforeFlags = beforeCells.filter((cell) => cell.isFlag).length;
    const operation = input.operation;
    const changed = operation === "open"
        ? openMinesweeperCells(game, cells)
        : operation === "mark" || operation === "unmark"
            ? markMinesweeperCells(game, cells, operation === "mark")
            : [];
    if (!operation || changed.length === 0) {
        return {
            ok: false,
            error: operation ? "坐标无效、状态未变化或格子不可操作" : "扫雷操作无效",
            snapshot: snapshotVisibleMinesweeper(game, guid),
        };
    }
    game.time = timeDiff(game.startTime, Date.now());
    gamePools.saveGame(event, MINESWEEPER_GAME, game);
    if (game.state === "playing")
        gameSession.activate(event, MINESWEEPER_GAME);
    else
        gameSession.deactivate(event, MINESWEEPER_GAME);
    const afterCells = Object.values(game.map);
    const openedCount = afterCells.filter((cell) => cell.isOpen).length;
    const flagCount = afterCells.filter((cell) => cell.isFlag).length;
    const progress = {
        openedDelta: openedCount - beforeOpened,
        flagDelta: flagCount - beforeFlags,
        openedCount,
        totalCells: afterCells.length,
        flagCount,
        mineCount: game.mine,
        status: game.state,
    };
    const progressMedia = await renderMinesweeperProgress(game, operation, changed, progress);
    return {
        ok: true,
        changed,
        progress,
        snapshot: snapshotVisibleMinesweeper(game, guid),
        progressMedia,
    };
};
const moveGobangFromAgent = async (input) => {
    const guid = String(input.guid ?? "").trim();
    const row = Number(input.row);
    const col = Number(input.col);
    if (!guid || !Number.isInteger(row) || !Number.isInteger(col)) {
        return { ok: false, error: "guid、row、col 必须有效" };
    }
    const pending = getPendingTurn(guid, String(input.token ?? ""));
    if (!pending) {
        return { ok: false, error: "AI 落子令牌无效或已过期" };
    }
    if (pending.completed) {
        return { ok: true, duplicate: true, snapshot: pending.completed };
    }
    const room = boardRooms.getRoomByGuid(guid, GOBANG_GAME);
    if (!room || room.status !== "playing" || room.state.mode !== "agent") {
        return { ok: false, error: "当前没有由 AI 对手接管的五子棋" };
    }
    if (room.state.current !== "白" || !room.players[GOBANG_AGENT_USER_ID]) {
        return { ok: false, error: "当前不是 AI 的回合" };
    }
    const point = { row: row - 1, col: col - 1 };
    if (point.row < 0 ||
        point.col < 0 ||
        point.row >= room.state.board.length ||
        point.col >= room.state.board.length ||
        room.state.board[point.row][point.col] !== "-") {
        return { ok: false, error: "落子坐标越界或已有棋子" };
    }
    placeGobangMove(room, "白", point);
    if (checkGobangWin(room.state.board, point)) {
        room.status = "finished";
        room.winner = "白";
    }
    else if (isGobangBoardFull(room.state.board)) {
        room.status = "finished";
    }
    boardRooms.saveRoomByGuid(guid, GOBANG_GAME, room);
    const snapshot = snapshotGobang(guid);
    pending.completed = snapshot;
    return { ok: true, snapshot };
};
const requestGobangAgentTurn = async (guid) => {
    const safeGuid = String(guid ?? "").trim();
    const opponentId = await getSelectedOpponent(safeGuid);
    if (!safeGuid || !opponentId) {
        return { ok: false, reason: "当前会话未选择 AI 对手" };
    }
    const agent = await findAgent(opponentId, safeGuid);
    if (!agent || agent.descriptor.ready !== true || !agent.descriptor.games?.includes(GOBANG_GAME)) {
        return { ok: false, reason: "所选 AI 对手未订阅、不可用或不支持五子棋" };
    }
    const snapshot = snapshotGobang(safeGuid);
    if (!snapshot || snapshot.status !== "playing" || snapshot.current !== "白") {
        return { ok: false, reason: "当前不是 AI 的五子棋回合" };
    }
    const token = randomUUID();
    pendingTurns.set(safeGuid, { token, expiresAt: Date.now() + 120000 });
    try {
        const result = await agent.invoke("takeTurn", {
            game: GOBANG_GAME,
            guid: safeGuid,
            token,
            snapshot,
        });
        return { ok: true, result };
    }
    catch (error) {
        return { ok: false, reason: error?.message || "AI 对手处理失败" };
    }
    finally {
        const pending = pendingTurns.get(safeGuid);
        if (pending?.token === token)
            pendingTurns.delete(safeGuid);
    }
};
const xianyuGameExpose = Expose.create().provide({
    name: XIANYU_GAME_PROTOCOL,
    description: "咸鱼插件游戏服务：查询可用游戏，并提供各游戏的开始、操作、退出和快照接口。",
    actions: {
        status: {
            description: "检查咸鱼游戏插件是否可用，并返回可用游戏和当前 guid 的 AI 对手状态。",
            handler: (input = {}) => getGameHubStatus(input.guid),
        },
        gobangSnapshot: {
            description: "读取当前 guid 的五子棋结构化棋盘。",
            handler: (input = {}) => snapshotGobang(String(input.guid ?? "").trim()),
        },
        gobangMove: {
            description: "在当前 AI 回合代白棋落子；需要系统分配的回合令牌。",
            handler: (input = {}) => moveGobangFromAgent(input),
        },
        minesweeperSnapshot: {
            description: "读取当前 guid 的扫雷可见棋盘；绝不返回雷区答案或隐藏格数字。",
            handler: (input = {}) => snapshotMinesweeper(String(input.guid ?? "").trim()),
        },
        minesweeperStart: {
            description: "由 Aichat 在当前真实会话中选择难度并开始扫雷。",
            handler: (input = {}) => startMinesweeperFromTool(input),
        },
        minesweeperExit: {
            description: "由 Aichat 随时结束当前会话中的扫雷。",
            handler: (input = {}) => exitMinesweeperFromTool(input),
        },
        minesweeperAction: {
            description: "供 Aichat 工具按当前 guid 批量翻开、标记或取消标记扫雷格。",
            handler: (input = {}) => actMinesweeperFromTool(input),
        },
        points24Snapshot: { description: "读取当前24点牌面。", handler: (input = {}) => points24Snapshot(input) },
        points24Start: { description: "在当前玩家作用域开始24点。", handler: (input = {}) => points24Start(input) },
        points24Action: { description: "提交24点表达式。", handler: (input = {}) => points24Action(input) },
        points24Exit: { description: "结束当前24点游戏。", handler: (input = {}) => points24Exit(input) },
        sokobanSnapshot: { description: "读取当前推箱子关卡和棋盘。", handler: (input = {}) => sokobanSnapshot(input) },
        sokobanStart: { description: "开始指定推箱子关卡，level 从1开始。", handler: (input = {}) => sokobanStart(input) },
        sokobanAction: { description: "推箱子移动或撤回；移动方向使用 wasd。", handler: (input = {}) => sokobanAction(input) },
        sokobanExit: { description: "结束当前推箱子游戏。", handler: (input = {}) => sokobanExit(input) },
        chineseChessSnapshot: { description: "读取当前中国象棋棋盘。", handler: (input = {}) => chineseChessSnapshot(input) },
        chineseChessStart: { description: "发起或加入中国象棋对局。", handler: (input = {}) => chineseChessStart(input) },
        chineseChessAction: { description: "按坐标或棋谱移动中国象棋棋子。", handler: (input = {}) => chineseChessAction(input) },
        chineseChessExit: { description: "由参与者结束当前中国象棋对局。", handler: (input = {}) => chineseChessExit(input) },
        animalChessSnapshot: { description: "读取当前斗兽棋棋盘。", handler: (input = {}) => animalChessSnapshot(input) },
        animalChessStart: { description: "发起或加入斗兽棋对局。", handler: (input = {}) => animalChessStart(input) },
        animalChessAction: { description: "按 A0 B0 格式移动斗兽棋棋子。", handler: (input = {}) => animalChessAction(input) },
        animalChessExit: { description: "由参与者结束当前斗兽棋对局。", handler: (input = {}) => animalChessExit(input) },
    },
});

export { XIANYU_GAME_AGENT_PROTOCOL, XIANYU_GAME_PROTOCOL, actMinesweeperFromTool, availableGames, bindMinesweeperSession, exitMinesweeperFromTool, getGameHubStatus, getSelectedOpponent, moveGobangFromAgent, requestGobangAgentTurn, setSelectedOpponent, startMinesweeperFromTool, unbindMinesweeperSession, xianyuGameExpose };
