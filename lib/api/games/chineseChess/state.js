//#region src/api/games/chineseChess/state.ts
const CHINESE_CHESS_ROWS = 10;
const CHINESE_CHESS_COLS = 9;
const initialChineseChessBoard = [
	[
		"車",
		"馬",
		"象",
		"士",
		"将",
		"士",
		"象",
		"馬",
		"車"
	],
	[
		"空",
		"空",
		"空",
		"空",
		"空",
		"空",
		"空",
		"空",
		"空"
	],
	[
		"空",
		"炮",
		"空",
		"空",
		"空",
		"空",
		"空",
		"炮",
		"空"
	],
	[
		"兵",
		"空",
		"兵",
		"空",
		"兵",
		"空",
		"兵",
		"空",
		"兵"
	],
	[
		"空",
		"空",
		"空",
		"空",
		"空",
		"空",
		"空",
		"空",
		"空"
	],
	[
		"空",
		"空",
		"空",
		"空",
		"空",
		"空",
		"空",
		"空",
		"空"
	],
	[
		"兵",
		"空",
		"兵",
		"空",
		"兵",
		"空",
		"兵",
		"空",
		"兵"
	],
	[
		"空",
		"炮",
		"空",
		"空",
		"空",
		"空",
		"空",
		"炮",
		"空"
	],
	[
		"空",
		"空",
		"空",
		"空",
		"空",
		"空",
		"空",
		"空",
		"空"
	],
	[
		"車",
		"馬",
		"象",
		"士",
		"将",
		"士",
		"象",
		"馬",
		"車"
	]
];
const pointKey = (point) => `${point.row}-${point.col}`;
const formatChineseChessPoint = (point) => `${String.fromCharCode(65 + point.row)}${point.col + 1}`;
const formatChineseChessMoveIntent = (intent) => `${formatChineseChessPoint(intent.from)} -> ${formatChineseChessPoint(intent.to)}`;
const isInsideChineseChessBoard = (point) => point.row >= 0 && point.row < 10 && point.col >= 0 && point.col < 9;
const cloneChineseChessState = (state) => ({
	board: { ...state.board },
	ownership: { ...state.ownership },
	current: state.current,
	lastMove: state.lastMove ? {
		from: { ...state.lastMove.from },
		to: { ...state.lastMove.to },
		input: { ...state.lastMove.input }
	} : void 0
});
const createChineseChessState = () => {
	const board = {};
	const ownership = {};
	for (let row = 0; row < 10; row += 1) for (let col = 0; col < 9; col += 1) {
		const piece = initialChineseChessBoard[row][col];
		const key = pointKey({
			row,
			col
		});
		board[key] = piece;
		if (piece === "空") ownership[key] = "0";
		else if (row < 4) ownership[key] = "红";
		else ownership[key] = "黑";
	}
	return {
		board,
		ownership,
		current: "红"
	};
};
const createChineseChessRoom = () => {
	const state = createChineseChessState();
	const now = Date.now();
	return {
		game: "chinese-chess",
		status: "waiting",
		players: {},
		state,
		history: [cloneChineseChessState(state)],
		turn: "红",
		createdAt: now,
		updatedAt: now
	};
};
const opponentTeam = (team) => team === "红" ? "黑" : "红";

//#endregion
export { CHINESE_CHESS_COLS, CHINESE_CHESS_ROWS, cloneChineseChessState, createChineseChessRoom, createChineseChessState, formatChineseChessMoveIntent, formatChineseChessPoint, initialChineseChessBoard, isInsideChineseChessBoard, opponentTeam, pointKey };