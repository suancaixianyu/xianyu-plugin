import { gamePools } from "./gamePools.js";
import { gameSession } from "./gameSession.js";
import { MINESWEEPER_GAME, markMinesweeperCells, openMinesweeperCells, snapshotVisibleMinesweeper } from "./games/minesweeper.js";
import { GOBANG_AGENT_USER_ID, GOBANG_GAME, analyzeGobangTactics, checkGobangWin, isGobangBoardFull, placeGobangMove } from "./games/gobang.js";
import { boardRooms } from "./boardRooms.js";
import { timeDiff } from "./lib.js";
import { Expose } from "alemonjs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

//#region src/api/gameAgents.ts
const XIANYU_GAME_PROTOCOL = "xianyu-game-v1";
const XIANYU_GAME_AGENT_PROTOCOL = "xianyu-game-agent-v1";
const settingsPath = resolve(dirname(fileURLToPath(import.meta.url)), "../../data/ai-opponents.json");
const opponentSettings = /* @__PURE__ */ new Map();
const pendingTurns = /* @__PURE__ */ new Map();
const minesweeperSessions = /* @__PURE__ */ new Map();
let settingsLoaded = false;
const availableGames = [
	{
		id: "minesweeper",
		name: "扫雷",
		type: "single"
	},
	{
		id: "points24",
		name: "24点",
		type: "single"
	},
	{
		id: "sokoban",
		name: "推箱子",
		type: "single"
	},
	{
		id: "gobang",
		name: "五子棋",
		type: "board",
		supportsAIOpponent: true
	},
	{
		id: "chinese-chess",
		name: "中国象棋",
		type: "board"
	},
	{
		id: "animal-chess",
		name: "斗兽棋",
		type: "board"
	}
];
const loadSettings = async () => {
	if (settingsLoaded) return;
	settingsLoaded = true;
	try {
		const raw = await readFile(settingsPath, "utf8");
		const values = JSON.parse(raw);
		for (const [guid, opponent] of Object.entries(values)) if (guid && typeof opponent === "string" && opponent) opponentSettings.set(guid, opponent);
	} catch (error) {
		if (error?.code !== "ENOENT") console.warn("[xianyu-game] 读取 AI 对手配置失败，将使用内存配置", error);
	}
};
const persistSettings = async () => {
	await mkdir(dirname(settingsPath), { recursive: true });
	const tempPath = `${settingsPath}.${process.pid}.${Date.now()}.tmp`;
	await writeFile(tempPath, JSON.stringify(Object.fromEntries(opponentSettings), null, 2), "utf8");
	await rename(tempPath, settingsPath);
};
const listAgents = async (guid) => {
	const providers = Expose.create().list(XIANYU_GAME_AGENT_PROTOCOL);
	return (await Promise.all(providers.map(async (provider) => {
		try {
			const descriptor = await provider.invoke("describe", { guid });
			if (!descriptor?.id || !descriptor?.name) return null;
			return {
				descriptor,
				invoke: provider.invoke
			};
		} catch {
			return null;
		}
	}))).filter((entry) => Boolean(entry));
};
const findAgent = async (id, guid) => (await listAgents(guid)).find((entry) => entry.descriptor.id === id) ?? null;
const getSelectedOpponent = async (guid) => {
	const safeGuid = String(guid ?? "").trim();
	if (!safeGuid) return "";
	await loadSettings();
	return opponentSettings.get(safeGuid) ?? "";
};
const setSelectedOpponent = async (guid, opponentId) => {
	const safeGuid = String(guid ?? "").trim();
	if (!safeGuid) throw new Error("当前会话缺少 guid，无法设置 AI 对手");
	await loadSettings();
	if (opponentId) opponentSettings.set(safeGuid, opponentId);
	else opponentSettings.delete(safeGuid);
	await persistSettings();
};
const getGameHubStatus = async (guid) => {
	const selectedOpponent = await getSelectedOpponent(guid);
	const agents = await listAgents(guid);
	const selected = agents.find((agent) => agent.descriptor.id === selectedOpponent);
	return {
		protocol: XIANYU_GAME_PROTOCOL,
		guid: String(guid ?? "").trim() || void 0,
		games: availableGames,
		selectedOpponent: selectedOpponent || "builtin",
		selectedAvailable: selectedOpponent ? Boolean(selected?.descriptor.ready) : true,
		agents: agents.map((agent) => agent.descriptor)
	};
};
const snapshotGobang = (guid) => {
	const room = boardRooms.getRoomByGuid(guid, GOBANG_GAME);
	if (!room) return null;
	return {
		game: GOBANG_GAME,
		guid,
		status: room.status,
		mode: room.state.mode,
		current: room.state.current,
		coordinateSystem: {
			base: 1,
			origin: "左上角",
			inputOrder: "x y（横坐标、纵坐标）",
			boardIndex: "board[y - 1][x - 1]",
			moveArguments: "gobang_move 传 x（横坐标）和 y（纵坐标）"
		},
		tactics: analyzeGobangTactics(room.state.board),
		board: room.state.board.map((row) => [...row]),
		lastMove: room.state.lastMove ? {
			x: room.state.lastMove.col + 1,
			y: room.state.lastMove.row + 1
		} : void 0,
		moveCount: room.state.moveCount,
		players: Object.values(room.players).map((player) => ({
			userId: player.userId,
			nickname: player.nickname,
			team: player.team
		}))
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
	if (!safeGuid) return;
	minesweeperSessions.set(safeGuid, {
		...event,
		guid: safeGuid
	});
};
const getMinesweeperGame = (guid) => {
	const event = minesweeperSessions.get(guid);
	if (!event) return void 0;
	return gamePools.getGame(event, MINESWEEPER_GAME);
};
const snapshotMinesweeper = (guid) => {
	const game = getMinesweeperGame(guid);
	return game ? snapshotVisibleMinesweeper(game, guid) : null;
};
const renderMinesweeperProgress = async (game, operation, progress) => {
	try {
		const [{ renderComponentToBuffer }, { default: GameMap }] = await Promise.all([import("jsxp"), import("../image/conponent/minesweeper/map.js")]);
		const image = await renderComponentToBuffer("minesweeper", GameMap, { game });
		const actionText = operation === "open" ? `本次新增翻开 ${progress.openedDelta} 格` : operation === "mark" ? `本次新增标记 ${Math.max(0, progress.flagDelta)} 格` : `本次取消标记 ${Math.max(0, -progress.flagDelta)} 格`;
		const resultText = progress.status === "win" ? "扫雷成功" : progress.status === "lose" ? "踩雷，游戏结束" : "游戏继续";
		const summary = `${actionText}；累计翻开 ${progress.openedCount}/${progress.totalCells} 格，已标记 ${progress.flagCount}/${progress.mineCount}，${resultText}。`;
		return {
			summary: typeof image === "boolean" ? `${summary}\n棋盘图片渲染失败。` : summary,
			image: typeof image === "boolean" ? void 0 : image,
			final: progress.status !== "playing"
		};
	} catch (error) {
		console.warn("[xianyu-game] 渲染扫雷 AI 操作棋盘失败", error);
		return;
	}
};
const actMinesweeperFromTool = async (input) => {
	const guid = String(input.guid ?? "").trim();
	if (!guid) return {
		ok: false,
		error: "当前会话缺少 guid"
	};
	const event = minesweeperSessions.get(guid);
	const game = event ? gamePools.getGame(event, MINESWEEPER_GAME) : void 0;
	if (!event || !game || game.state !== "playing") return {
		ok: false,
		error: "当前没有可由 AI 操作的扫雷对局"
	};
	const cells = Array.isArray(input.cells) ? input.cells.map(String).slice(0, 100) : [];
	if (cells.length === 0) return {
		ok: false,
		error: "至少需要一个扫雷坐标"
	};
	const beforeCells = Object.values(game.map);
	const beforeOpened = beforeCells.filter((cell) => cell.isOpen).length;
	const beforeFlags = beforeCells.filter((cell) => cell.isFlag).length;
	const operation = input.operation;
	const changed = operation === "open" ? openMinesweeperCells(game, cells) : operation === "mark" || operation === "unmark" ? markMinesweeperCells(game, cells, operation === "mark") : [];
	if (!operation || changed.length === 0) return {
		ok: false,
		error: operation ? "坐标无效、状态未变化或格子不可操作" : "扫雷操作无效",
		snapshot: snapshotVisibleMinesweeper(game, guid)
	};
	game.time = timeDiff(game.startTime, Date.now());
	gamePools.saveGame(event, MINESWEEPER_GAME, game);
	if (game.state === "playing") gameSession.activate(event, MINESWEEPER_GAME);
	else gameSession.deactivate(event, MINESWEEPER_GAME);
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
		status: game.state
	};
	const progressMedia = await renderMinesweeperProgress(game, operation, progress);
	return {
		ok: true,
		changed,
		progress,
		snapshot: snapshotVisibleMinesweeper(game, guid),
		progressMedia
	};
};
const moveGobangFromAgent = async (input) => {
	const guid = String(input.guid ?? "").trim();
	const row = Number(input.row);
	const col = Number(input.col);
	if (!guid || !Number.isInteger(row) || !Number.isInteger(col)) return {
		ok: false,
		error: "guid、row、col 必须有效"
	};
	const pending = getPendingTurn(guid, String(input.token ?? ""));
	if (!pending) return {
		ok: false,
		error: "AI 落子令牌无效或已过期"
	};
	if (pending.completed) return {
		ok: true,
		duplicate: true,
		snapshot: pending.completed
	};
	const room = boardRooms.getRoomByGuid(guid, GOBANG_GAME);
	if (!room || room.status !== "playing" || room.state.mode !== "agent") return {
		ok: false,
		error: "当前没有由 AI 对手接管的五子棋"
	};
	if (room.state.current !== "白" || !room.players["__gobang_agent__"]) return {
		ok: false,
		error: "当前不是 AI 的回合"
	};
	const point = {
		row: row - 1,
		col: col - 1
	};
	if (point.row < 0 || point.col < 0 || point.row >= room.state.board.length || point.col >= room.state.board.length || room.state.board[point.row][point.col] !== "-") return {
		ok: false,
		error: "落子坐标越界或已有棋子"
	};
	placeGobangMove(room, "白", point);
	if (checkGobangWin(room.state.board, point)) {
		room.status = "finished";
		room.winner = "白";
	} else if (isGobangBoardFull(room.state.board)) room.status = "finished";
	boardRooms.saveRoomByGuid(guid, GOBANG_GAME, room);
	const snapshot = snapshotGobang(guid);
	pending.completed = snapshot;
	return {
		ok: true,
		snapshot
	};
};
const requestGobangAgentTurn = async (guid) => {
	const safeGuid = String(guid ?? "").trim();
	const opponentId = await getSelectedOpponent(safeGuid);
	if (!safeGuid || !opponentId) return {
		ok: false,
		reason: "当前会话未选择 AI 对手"
	};
	const agent = await findAgent(opponentId, safeGuid);
	if (!agent || agent.descriptor.ready !== true || !agent.descriptor.games?.includes("gobang")) return {
		ok: false,
		reason: "所选 AI 对手未订阅、不可用或不支持五子棋"
	};
	const snapshot = snapshotGobang(safeGuid);
	if (!snapshot || snapshot.status !== "playing" || snapshot.current !== "白") return {
		ok: false,
		reason: "当前不是 AI 的五子棋回合"
	};
	const token = randomUUID();
	pendingTurns.set(safeGuid, {
		token,
		expiresAt: Date.now() + 12e4
	});
	try {
		return {
			ok: true,
			result: await agent.invoke("takeTurn", {
				game: GOBANG_GAME,
				guid: safeGuid,
				token,
				snapshot
			})
		};
	} catch (error) {
		return {
			ok: false,
			reason: error?.message || "AI 对手处理失败"
		};
	} finally {
		if (pendingTurns.get(safeGuid)?.token === token) pendingTurns.delete(safeGuid);
	}
};
const xianyuGameExpose = Expose.create().provide({
	name: XIANYU_GAME_PROTOCOL,
	description: "咸鱼插件游戏服务：查询可用游戏，并提供五子棋与扫雷的安全操作接口。",
	actions: {
		status: {
			description: "检查咸鱼游戏插件是否可用，并返回可用游戏和当前 guid 的 AI 对手状态。",
			handler: (input = {}) => getGameHubStatus(input.guid)
		},
		gobangSnapshot: {
			description: "读取当前 guid 的五子棋结构化棋盘。",
			handler: (input = {}) => snapshotGobang(String(input.guid ?? "").trim())
		},
		gobangMove: {
			description: "在当前 AI 回合代白棋落子；需要系统分配的回合令牌。",
			handler: (input = {}) => moveGobangFromAgent(input)
		},
		minesweeperSnapshot: {
			description: "读取当前 guid 的扫雷可见棋盘；绝不返回雷区答案或隐藏格数字。",
			handler: (input = {}) => snapshotMinesweeper(String(input.guid ?? "").trim())
		},
		minesweeperAction: {
			description: "供 Aichat 工具按当前 guid 批量翻开、标记或取消标记扫雷格。",
			handler: (input = {}) => actMinesweeperFromTool(input)
		}
	}
});

//#endregion
export { XIANYU_GAME_AGENT_PROTOCOL, XIANYU_GAME_PROTOCOL, actMinesweeperFromTool, availableGames, bindMinesweeperSession, getGameHubStatus, getSelectedOpponent, moveGobangFromAgent, requestGobangAgentTurn, setSelectedOpponent, xianyuGameExpose };