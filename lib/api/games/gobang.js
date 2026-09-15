import { gameRegistry } from "../gameRegistry.js";

//#region src/api/games/gobang.ts
const GOBANG_GAME = "gobang";
const GOBANG_SIZE = 17;
const GOBANG_AI_USER_ID = "__gobang_ai__";
const GOBANG_AGENT_USER_ID = "__gobang_agent__";
const movePattern = /^(?:[!！/#＃]\s*)?(?:五子棋)?(?:落子\s*)?(\d+)[^\d]+(\d+)$/;
const teamSymbols = {
	黑: "X",
	白: "O"
};
const createGobangBoard = () => Array.from({ length: 17 }, () => Array(17).fill("-"));
const cloneGobangState = (state) => ({
	board: state.board.map((row) => [...row]),
	mode: state.mode,
	current: state.current,
	moveCount: state.moveCount,
	lastMove: state.lastMove ? { ...state.lastMove } : void 0
});
const createGobangRoom = (mode = "ai") => {
	const state = {
		board: createGobangBoard(),
		mode,
		current: "黑",
		moveCount: 0
	};
	const now = Date.now();
	return {
		game: GOBANG_GAME,
		status: mode === "versus" ? "waiting" : "playing",
		players: {},
		state,
		history: [cloneGobangState(state)],
		turn: "黑",
		createdAt: now,
		updatedAt: now
	};
};
const parseGobangMove = (input) => {
	const match = input.trim().match(movePattern);
	if (!match) return null;
	const col = Number(match[1]) - 1;
	const row = Number(match[2]) - 1;
	if (!Number.isInteger(row) || !Number.isInteger(col)) return null;
	if (row < 0 || row >= 17 || col < 0 || col >= 17) return null;
	return {
		row,
		col
	};
};
const getGobangPlayerTeam = (room, userId) => {
	return room.players[userId]?.team;
};
const getGobangTeamSymbol = (team) => teamSymbols[team];
const countDirection = (board, point, symbol, rowStep, colStep) => {
	let row = point.row + rowStep;
	let col = point.col + colStep;
	let count = 0;
	while (row >= 0 && row < 17 && col >= 0 && col < 17 && board[row][col] === symbol) {
		count += 1;
		row += rowStep;
		col += colStep;
	}
	return count;
};
const checkGobangWin = (board, point) => {
	const symbol = board[point.row]?.[point.col];
	if (!symbol || symbol === "-") return false;
	return [
		[0, 1],
		[1, 0],
		[1, 1],
		[1, -1]
	].some(([rowStep, colStep]) => {
		return 1 + countDirection(board, point, symbol, rowStep, colStep) + countDirection(board, point, symbol, -rowStep, -colStep) >= 5;
	});
};
const toGobangCoordinate = (point) => ({
	x: point.col + 1,
	y: point.row + 1
});
/** 返回指定棋方下一手即可获胜的所有空位，内部坐标仍是 row/col。 */
const findGobangWinningMoves = (board, team) => {
	const symbol = getGobangTeamSymbol(team);
	const wins = [];
	for (let row = 0; row < 17; row += 1) for (let col = 0; col < 17; col += 1) {
		if (board[row][col] !== "-") continue;
		const point = {
			row,
			col
		};
		board[row][col] = symbol;
		const winsHere = checkGobangWin(board, point);
		board[row][col] = "-";
		if (winsHere) wins.push(point);
	}
	return wins;
};
/**
* 给外部 AI 的战术建议。白棋能直接获胜时优先先赢；否则优先阻止黑棋下一手获胜。
* 这里只处理确定的一手胜负，最终落点和其他中盘策略仍交由订阅的 AI 决定。
*/
const analyzeGobangTactics = (board) => {
	const whiteWinningPoints = findGobangWinningMoves(board, "白");
	const blackWinningPoints = findGobangWinningMoves(board, "黑");
	const whiteWinningMoves = whiteWinningPoints.map(toGobangCoordinate);
	const blackWinningMoves = blackWinningPoints.map(toGobangCoordinate);
	const priorityMoves = whiteWinningMoves.length > 0 ? whiteWinningMoves : blackWinningMoves;
	const recommendedMoves = rankGobangAiMoves(board).map((move) => ({
		...toGobangCoordinate(move),
		score: move.score
	}));
	return {
		whiteWinningMoves,
		blackWinningMoves,
		priorityMoves,
		priorityReason: whiteWinningMoves.length > 0 ? "白棋本回合可直接获胜，建议优先落在 whiteWinningMoves 之一。" : blackWinningMoves.length > 0 ? "黑棋下一手可直接获胜，建议优先落在 blackWinningMoves 之一进行封堵。" : "当前没有一手必胜或必须封堵点。",
		recommendedMoves
	};
};
const isGobangBoardFull = (board) => board.every((row) => row.every((cell) => cell !== "-"));
const placeGobangMove = (room, team, point) => {
	const symbol = getGobangTeamSymbol(team);
	room.history.push(cloneGobangState(room.state));
	room.state.board[point.row][point.col] = symbol;
	room.state.lastMove = point;
	room.state.moveCount += 1;
	room.state.current = team === "黑" ? "白" : "黑";
	room.turn = room.state.current;
};
const evaluateLineCount = (count) => {
	if (count <= 0) return 0;
	if (count === 1) return 10;
	if (count === 2) return 100;
	if (count === 3) return 1e3;
	return 1e4;
};
const evaluateGobangMove = (board, point, symbol) => {
	return [
		[0, 1],
		[1, 0],
		[1, 1],
		[1, -1]
	].reduce((score, [rowStep, colStep]) => {
		const count = countDirection(board, point, symbol, rowStep, colStep) + countDirection(board, point, symbol, -rowStep, -colStep);
		return score + evaluateLineCount(count);
	}, 0);
};
/**
* 复用内置 AI 的攻防评分，返回由高到低的候选空位。
* 分数同时考虑白棋延长连线、阻止黑棋连线和靠近棋盘中心。
*/
const rankGobangAiMoves = (board, limit = 8) => {
	const aiSymbol = getGobangTeamSymbol("白");
	const humanSymbol = getGobangTeamSymbol("黑");
	const candidates = [];
	for (let row = 0; row < 17; row += 1) for (let col = 0; col < 17; col += 1) {
		if (board[row][col] !== "-") continue;
		const point = {
			row,
			col
		};
		const attackScore = evaluateGobangMove(board, point, aiSymbol) + 8;
		const defendScore = evaluateGobangMove(board, point, humanSymbol);
		const centerScore = 17 - Math.abs(row - 8) - Math.abs(col - 8);
		candidates.push({
			...point,
			score: Math.max(attackScore, defendScore) + centerScore
		});
	}
	return candidates.sort((a, b) => b.score - a.score || a.row - b.row || a.col - b.col).slice(0, Math.max(1, limit));
};
const chooseGobangAiMove = (room) => {
	const [best] = rankGobangAiMoves(room.state.board, 1);
	return best ? {
		row: best.row,
		col: best.col
	} : null;
};
const gobangCommandController = {
	game: GOBANG_GAME,
	rewriteCommand(event) {
		const text = String(event.MessageText ?? "").trim().replace(/^(?:[!！/#＃]\s*)/, "");
		if (movePattern.test(text)) return text.startsWith("五子棋") ? text : `五子棋${text}`;
		return null;
	}
};
const gobangGameDefinition = {
	game: GOBANG_GAME,
	controller: gobangCommandController,
	compactRoutes: [
		{
			pattern: /^(?:[!！/#＃]\s*)?(?:开始)?五子棋$/,
			importer: () => import("../../response/gobang/start/res.js")
		},
		{
			pattern: /^(?:[!！/#＃]\s*)?(?:发起|加入)五子棋$/,
			importer: () => import("../../response/gobang/join/res.js")
		},
		{
			pattern: movePattern,
			importer: () => import("../../response/gobang/move/res.js")
		}
	],
	routes: [
		{
			aliases: ["五子棋", "开始五子棋"],
			importer: () => import("../../response/gobang/start/res.js")
		},
		{
			aliases: ["发起五子棋", "加入五子棋"],
			importer: () => import("../../response/gobang/join/res.js")
		},
		{
			aliases: ["结束五子棋", "退出五子棋"],
			importer: () => import("../../response/gobang/exit/res.js")
		},
		{
			aliases: ["五子棋帮助"],
			importer: () => import("../../response/gobang/help/res.js")
		},
		{
			aliases: ["五子棋落子"],
			importer: () => import("../../response/gobang/move/res.js")
		}
	]
};
gameRegistry.register(gobangGameDefinition);

//#endregion
export { GOBANG_AGENT_USER_ID, GOBANG_AI_USER_ID, GOBANG_GAME, GOBANG_SIZE, analyzeGobangTactics, checkGobangWin, chooseGobangAiMove, cloneGobangState, createGobangBoard, createGobangRoom, findGobangWinningMoves, getGobangPlayerTeam, getGobangTeamSymbol, gobangCommandController, gobangGameDefinition, isGobangBoardFull, parseGobangMove, placeGobangMove, rankGobangAiMoves };