import { boardRooms } from './boardRooms.js';
import { gamePools } from './gamePools.js';
import { gameSession } from './gameSession.js';
import { POINTS24_GAME, evaluatePoints24Answer, createPoints24Game } from './games/points24.js';
import { SOKOBAN_GAME, undoSokoban, getCurrentSokobanMap, sokobanLevelCount, moveSokoban, createSokobanGame } from './games/sokoban.js';
import { ANIMAL_CHESS_GAME, parseAnimalChessMove, validateAnimalChessMove, applyAnimalChessMove, createAnimalChessRoom } from './games/animalChess.js';
import { CHINESE_CHESS_GAME } from './games/chineseChess.js';
import { createChineseChessRoom, CHINESE_CHESS_ROWS, CHINESE_CHESS_COLS, pointKey } from './games/chineseChess/state.js';
import { parseChineseChessCoordinateMove, parseChineseChessNotationMove } from './games/chineseChess/parser.js';
import { validateChineseChessMove, applyChineseChessMove } from './games/chineseChess/rules.js';

const singleScopes = new Map();
const singleKey = (guid, game) => `${guid}:${game}`;
const identity = (input) => {
    const guid = String(input.guid ?? "").trim();
    const userId = String(input.session?.UserId ?? "").trim();
    if (!guid || !userId)
        return { error: "需要当前会话的 guid 和 session.UserId" };
    return { guid, event: { ...input.session, guid, UserId: userId } };
};
const singleSession = (input, game) => {
    const guid = String(input.guid ?? "").trim();
    if (!guid)
        return { error: "当前会话缺少 guid" };
    if (input.session?.UserId) {
        return { guid, event: { ...input.session, guid } };
    }
    const event = singleScopes.get(singleKey(guid, game));
    return event ? { guid, event } : { error: "缺少玩家作用域，请提供 session.UserId" };
};
const bindSingleGameSession = (guid, game, event) => {
    const safeGuid = String(guid ?? "").trim();
    if (safeGuid)
        singleScopes.set(singleKey(safeGuid, game), { ...event, guid: safeGuid });
};
const unbindSingleGameSession = (guid, game) => {
    singleScopes.delete(singleKey(String(guid ?? "").trim(), game));
};
const bindSingle = bindSingleGameSession;
const snapshotPoints24 = (guid, game) => ({
    game: POINTS24_GAME, guid, status: game.status, cards: [...game.cards], title: game.title,
    elapsedSeconds: Math.floor((Date.now() - game.startTime) / 1000),
});
const points24Snapshot = (input) => {
    const scope = singleSession(input, POINTS24_GAME);
    if ("error" in scope)
        return null;
    const game = gamePools.getGame(scope.event, POINTS24_GAME);
    return game ? snapshotPoints24(scope.guid, game) : null;
};
const points24Start = (input) => {
    const scope = identity(input);
    if ("error" in scope)
        return { ok: false, error: scope.error };
    const current = gamePools.getGame(scope.event, POINTS24_GAME);
    if (current?.status === "playing") {
        bindSingle(scope.guid, POINTS24_GAME, scope.event);
        return { ok: true, started: false, snapshot: snapshotPoints24(scope.guid, current) };
    }
    const game = createPoints24Game();
    gamePools.saveGame(scope.event, POINTS24_GAME, game);
    gameSession.activate(scope.event, POINTS24_GAME);
    bindSingle(scope.guid, POINTS24_GAME, scope.event);
    return { ok: true, started: true, snapshot: snapshotPoints24(scope.guid, game) };
};
const points24Action = (input) => {
    const scope = singleSession(input, POINTS24_GAME);
    if ("error" in scope)
        return { ok: false, error: scope.error };
    const game = gamePools.getGame(scope.event, POINTS24_GAME);
    if (!game)
        return { ok: false, error: "当前没有进行中的24点游戏" };
    const result = evaluatePoints24Answer(game.cards, String(input.expression ?? ""));
    if (result.ok && result.solved) {
        gamePools.removeGame(scope.event, POINTS24_GAME);
        gameSession.deactivate(scope.event, POINTS24_GAME);
        unbindSingleGameSession(scope.guid, POINTS24_GAME);
    }
    return { ...result, snapshot: result.ok && result.solved ? null : snapshotPoints24(scope.guid, game) };
};
const points24Exit = (input) => {
    const scope = singleSession(input, POINTS24_GAME);
    if ("error" in scope)
        return { ok: false, error: scope.error };
    const ended = Boolean(gamePools.getGame(scope.event, POINTS24_GAME));
    gamePools.removeGame(scope.event, POINTS24_GAME);
    gameSession.deactivate(scope.event, POINTS24_GAME);
    unbindSingleGameSession(scope.guid, POINTS24_GAME);
    return { ok: true, ended };
};
const snapshotSokoban = (guid, game) => ({
    game: SOKOBAN_GAME, guid, status: game.status, level: game.levelIndex + 1,
    levelCount: sokobanLevelCount, moveCount: game.moveCount,
    coordinateSystem: { origin: "左上角", boardIndex: "board[row][col]" },
    legend: { 0: "空", 1: "墙", 2: "目标", 3: "箱子", 4: "玩家", 5: "目标上的箱子", 6: "目标上的玩家" },
    board: getCurrentSokobanMap(game).map((row) => [...row]),
});
const sokobanSnapshot = (input) => {
    const scope = singleSession(input, SOKOBAN_GAME);
    if ("error" in scope)
        return null;
    const game = gamePools.getGame(scope.event, SOKOBAN_GAME);
    return game ? snapshotSokoban(scope.guid, game) : null;
};
const sokobanStart = (input) => {
    const scope = identity(input);
    if ("error" in scope)
        return { ok: false, error: scope.error };
    const current = gamePools.getGame(scope.event, SOKOBAN_GAME);
    if (current?.status === "playing") {
        bindSingle(scope.guid, SOKOBAN_GAME, scope.event);
        return { ok: true, started: false, snapshot: snapshotSokoban(scope.guid, current) };
    }
    const level = input.level ?? 1;
    if (!Number.isInteger(level) || level < 1 || level > sokobanLevelCount) {
        return { ok: false, error: `关卡必须为 1-${sokobanLevelCount} 的整数` };
    }
    const game = createSokobanGame(level - 1);
    gamePools.saveGame(scope.event, SOKOBAN_GAME, game);
    gameSession.activate(scope.event, SOKOBAN_GAME);
    bindSingle(scope.guid, SOKOBAN_GAME, scope.event);
    return { ok: true, started: true, snapshot: snapshotSokoban(scope.guid, game) };
};
const sokobanAction = (input) => {
    const scope = singleSession(input, SOKOBAN_GAME);
    if ("error" in scope)
        return { ok: false, error: scope.error };
    const game = gamePools.getGame(scope.event, SOKOBAN_GAME);
    if (!game)
        return { ok: false, error: "当前没有进行中的推箱子游戏" };
    if (input.operation === "undo") {
        if (!undoSokoban(game))
            return { ok: false, error: "当前没有可撤回的移动", snapshot: snapshotSokoban(scope.guid, game) };
    }
    else if (input.operation === "move") {
        const directions = String(input.directions ?? "").trim();
        if (!/^[wasd]+$/i.test(directions) || directions.length > 100) {
            return { ok: false, error: "directions 必须为不超过100个 wasd 字符" };
        }
        const result = moveSokoban(game, directions);
        if (!result.moved)
            return { ok: false, error: "这一步没有移动成功", snapshot: snapshotSokoban(scope.guid, game) };
        if (result.won) {
            const next = createSokobanGame(game.levelIndex + 1);
            if (next) {
                gamePools.saveGame(scope.event, SOKOBAN_GAME, next);
                return { ok: true, completedLevel: game.levelIndex + 1, snapshot: snapshotSokoban(scope.guid, next) };
            }
        }
    }
    else
        return { ok: false, error: "operation 必须为 move 或 undo" };
    gamePools.saveGame(scope.event, SOKOBAN_GAME, game);
    if (game.status === "win")
        gameSession.deactivate(scope.event, SOKOBAN_GAME);
    else
        gameSession.activate(scope.event, SOKOBAN_GAME);
    return { ok: true, snapshot: snapshotSokoban(scope.guid, game) };
};
const sokobanExit = (input) => {
    const scope = singleSession(input, SOKOBAN_GAME);
    if ("error" in scope)
        return { ok: false, error: scope.error };
    const ended = Boolean(gamePools.getGame(scope.event, SOKOBAN_GAME));
    gamePools.removeGame(scope.event, SOKOBAN_GAME);
    gameSession.deactivate(scope.event, SOKOBAN_GAME);
    unbindSingleGameSession(scope.guid, SOKOBAN_GAME);
    return { ok: true, ended };
};
const roomPlayers = (room) => Object.values(room.players).map((player) => ({
    userId: player.userId, nickname: player.nickname, team: player.team,
}));
const snapshotChineseChess = (guid, room) => ({
    game: CHINESE_CHESS_GAME, guid, status: room.status, current: room.state.current, winner: room.winner,
    coordinateSystem: { origin: "左上角", input: "A1 至 J9", boardIndex: "board[row][col]" },
    board: Array.from({ length: CHINESE_CHESS_ROWS }, (_, row) => Array.from({ length: CHINESE_CHESS_COLS }, (_, col) => {
        const key = pointKey({ row, col });
        return { piece: room.state.board[key], owner: room.state.ownership[key] };
    })),
    lastMove: room.state.lastMove ? structuredClone(room.state.lastMove) : undefined,
    players: roomPlayers(room),
});
const snapshotAnimalChess = (guid, room) => ({
    game: ANIMAL_CHESS_GAME, guid, status: room.status, current: room.state.current, winner: room.winner,
    coordinateSystem: { origin: "左上角", input: "A0 至 I6", boardIndex: "board[row][col]" },
    board: room.state.board.map((row) => row.map((cell) => ({ ...cell }))),
    lastMove: room.state.lastMove ? structuredClone(room.state.lastMove) : undefined,
    moveCount: room.state.moveCount, players: roomPlayers(room),
});
const chineseChessSnapshot = (input) => {
    const guid = String(input.guid ?? "").trim();
    const room = guid ? boardRooms.getRoomByGuid(guid, CHINESE_CHESS_GAME) : undefined;
    return room ? snapshotChineseChess(guid, room) : null;
};
const animalChessSnapshot = (input) => {
    const guid = String(input.guid ?? "").trim();
    const room = guid ? boardRooms.getRoomByGuid(guid, ANIMAL_CHESS_GAME) : undefined;
    return room ? snapshotAnimalChess(guid, room) : null;
};
const chineseChessStart = (input) => {
    const scope = identity(input);
    if ("error" in scope)
        return { ok: false, error: scope.error };
    const room = boardRooms.getRoomByGuid(scope.guid, CHINESE_CHESS_GAME) ?? createChineseChessRoom();
    if (!room.players[scope.event.UserId]) {
        const count = Object.keys(room.players).length;
        if (count >= 2 || room.status === "finished")
            return { ok: false, error: "当前对局无法加入" };
        const team = count === 0 ? "红" : "黑";
        room.players[scope.event.UserId] = { userId: scope.event.UserId, nickname: input.nickname || scope.event.UserId, team };
        if (count === 1)
            room.status = "playing";
    }
    boardRooms.saveRoomByGuid(scope.guid, CHINESE_CHESS_GAME, room);
    gameSession.activate(scope.event, CHINESE_CHESS_GAME);
    return { ok: true, snapshot: snapshotChineseChess(scope.guid, room) };
};
const chineseChessAction = (input) => {
    const scope = identity(input);
    if ("error" in scope)
        return { ok: false, error: scope.error };
    const room = boardRooms.getRoomByGuid(scope.guid, CHINESE_CHESS_GAME);
    if (!room || room.status !== "playing")
        return { ok: false, error: "当前没有进行中的中国象棋对局" };
    const raw = String(input.move ?? "").trim();
    const intent = parseChineseChessCoordinateMove(raw) ?? parseChineseChessCoordinateMove(`移子 ${raw}`)
        ?? parseChineseChessNotationMove(raw, room, scope.event.UserId);
    if (!intent)
        return { ok: false, error: "走法格式不正确" };
    const result = validateChineseChessMove(room, intent, scope.event.UserId);
    if (!result.ok)
        return { ok: false, error: result.message, snapshot: snapshotChineseChess(scope.guid, room) };
    applyChineseChessMove(room, intent);
    if (result.win) {
        room.status = "finished";
        room.winner = room.players[scope.event.UserId].team;
        gameSession.deactivate(scope.event, CHINESE_CHESS_GAME);
    }
    boardRooms.saveRoomByGuid(scope.guid, CHINESE_CHESS_GAME, room);
    return { ok: true, check: result.check, snapshot: snapshotChineseChess(scope.guid, room) };
};
const chineseChessExit = (input) => {
    const scope = identity(input);
    if ("error" in scope)
        return { ok: false, error: scope.error };
    const room = boardRooms.getRoomByGuid(scope.guid, CHINESE_CHESS_GAME);
    if (!room)
        return { ok: true, ended: false };
    if (!room.players[scope.event.UserId])
        return { ok: false, error: "只有对局参与者可以结束对局" };
    boardRooms.removeRoom(scope.event, CHINESE_CHESS_GAME);
    gameSession.deactivate(scope.event, CHINESE_CHESS_GAME);
    return { ok: true, ended: true, winner: Object.values(room.players).find((player) => player.userId !== scope.event.UserId)?.team };
};
const animalChessStart = (input) => {
    const scope = identity(input);
    if ("error" in scope)
        return { ok: false, error: scope.error };
    const room = boardRooms.getRoomByGuid(scope.guid, ANIMAL_CHESS_GAME) ?? createAnimalChessRoom();
    if (!room.players[scope.event.UserId]) {
        const count = Object.keys(room.players).length;
        if (count >= 2 || room.status === "finished")
            return { ok: false, error: "当前对局无法加入" };
        const team = count === 0 ? "红" : "蓝";
        room.players[scope.event.UserId] = { userId: scope.event.UserId, nickname: input.nickname || scope.event.UserId, team };
        if (count === 1)
            room.status = "playing";
    }
    boardRooms.saveRoomByGuid(scope.guid, ANIMAL_CHESS_GAME, room);
    gameSession.activate(scope.event, ANIMAL_CHESS_GAME);
    return { ok: true, snapshot: snapshotAnimalChess(scope.guid, room) };
};
const animalChessAction = (input) => {
    const scope = identity(input);
    if ("error" in scope)
        return { ok: false, error: scope.error };
    const room = boardRooms.getRoomByGuid(scope.guid, ANIMAL_CHESS_GAME);
    if (!room || room.status !== "playing")
        return { ok: false, error: "当前没有进行中的斗兽棋对局" };
    const raw = String(input.move ?? "").trim();
    const intent = parseAnimalChessMove(raw) ?? parseAnimalChessMove(`移动 ${raw}`);
    if (!intent)
        return { ok: false, error: "走法格式不正确" };
    const result = validateAnimalChessMove(room, intent, scope.event.UserId);
    if (!result.ok)
        return { ok: false, error: result.message, snapshot: snapshotAnimalChess(scope.guid, room) };
    const team = room.players[scope.event.UserId].team;
    applyAnimalChessMove(room, intent, team);
    if (result.win) {
        room.status = "finished";
        room.winner = team;
        gameSession.deactivate(scope.event, ANIMAL_CHESS_GAME);
    }
    boardRooms.saveRoomByGuid(scope.guid, ANIMAL_CHESS_GAME, room);
    return { ok: true, snapshot: snapshotAnimalChess(scope.guid, room) };
};
const animalChessExit = (input) => {
    const scope = identity(input);
    if ("error" in scope)
        return { ok: false, error: scope.error };
    const room = boardRooms.getRoomByGuid(scope.guid, ANIMAL_CHESS_GAME);
    if (!room)
        return { ok: true, ended: false };
    if (!room.players[scope.event.UserId])
        return { ok: false, error: "只有对局参与者可以结束对局" };
    boardRooms.removeRoom(scope.event, ANIMAL_CHESS_GAME);
    gameSession.deactivate(scope.event, ANIMAL_CHESS_GAME);
    return { ok: true, ended: true, winner: Object.values(room.players).find((player) => player.userId !== scope.event.UserId)?.team };
};

export { animalChessAction, animalChessExit, animalChessSnapshot, animalChessStart, bindSingleGameSession, chineseChessAction, chineseChessExit, chineseChessSnapshot, chineseChessStart, points24Action, points24Exit, points24Snapshot, points24Start, sokobanAction, sokobanExit, sokobanSnapshot, sokobanStart, unbindSingleGameSession };
