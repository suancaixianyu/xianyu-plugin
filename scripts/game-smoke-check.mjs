import "../lib/api/games/index.js";
import { boardRooms } from "../lib/api/boardRooms.js";
import { gameRegistry } from "../lib/api/gameRegistry.js";
import { gameSession } from "../lib/api/gameSession.js";
import { createChineseChessRoom, pointKey } from "../lib/api/games/chineseChess/state.js";
import {
  parseChineseChessCoordinateMove,
  parseChineseChessNotationMove,
} from "../lib/api/games/chineseChess/parser.js";
import {
  applyChineseChessMove,
  rollbackChineseChessMove,
  validateChineseChessMove,
} from "../lib/api/games/chineseChess/rules.js";
import {
  checkGobangWin,
  analyzeGobangTactics,
  rankGobangAiMoves,
  chooseGobangAiMove,
  createGobangRoom,
  parseGobangMove,
  placeGobangMove,
} from "../lib/api/games/gobang.js";
import {
  markMinesweeperCells,
  openMinesweeperCells,
  snapshotVisibleMinesweeper,
} from "../lib/api/games/minesweeper.js";
import {
  applyAnimalChessMove,
  createAnimalChessRoom,
  parseAnimalChessMove,
  validateAnimalChessMove,
} from "../lib/api/games/animalChess.js";

const groupEvent = {
  UserId: "user-1",
  ChannelId: "group-1",
  IsPrivate: false,
};

const otherGroupEvent = {
  UserId: "user-1",
  ChannelId: "group-2",
  IsPrivate: false,
};

const minesweeper = gameRegistry.get("minesweeper");
const points24 = gameRegistry.get("points24");
const sokoban = gameRegistry.get("sokoban");
const chineseChess = gameRegistry.get("chinese-chess");
const gobang = gameRegistry.get("gobang");
const animalChess = gameRegistry.get("animal-chess");

if (!minesweeper) {
  throw new Error("minesweeper is not registered");
}

if (!points24) {
  throw new Error("points24 is not registered");
}

if (!sokoban) {
  throw new Error("sokoban is not registered");
}

if (!chineseChess) {
  throw new Error("chinese-chess is not registered");
}

if (!gobang) {
  throw new Error("gobang is not registered");
}

if (!animalChess) {
  throw new Error("animal-chess is not registered");
}

if (!minesweeper.routes.some((route) => route.aliases.includes("扫雷"))) {
  throw new Error("minesweeper start route is missing");
}

const minesweeperVisibilityGame = {
  row: 2,
  col: 2,
  mine: 1,
  state: "playing",
  remain: 1,
  select: { x: -1, y: -1 },
  time: 0,
  startTime: Date.now(),
  map: {
    "0-0": { isMine: true, value: 0, isOpen: false, isFlag: false, name: "A0" },
    "0-1": { isMine: false, value: 1, isOpen: false, isFlag: false, name: "A1" },
    "1-0": { isMine: false, value: 1, isOpen: false, isFlag: false, name: "B0" },
    "1-1": { isMine: false, value: 1, isOpen: true, isFlag: false, name: "B1" },
  },
};
const hiddenSnapshot = snapshotVisibleMinesweeper(minesweeperVisibilityGame, "guid-test");
const hiddenJson = JSON.stringify(hiddenSnapshot);
if (
  hiddenJson.includes("isMine") ||
  hiddenJson.includes('"A0"') ||
  hiddenSnapshot.board[0][0] !== "unknown" ||
  hiddenSnapshot.board[1][0] !== "unknown" ||
  hiddenSnapshot.board[1][1] !== 1
) {
  throw new Error(`minesweeper snapshot leaked hidden state: ${hiddenJson}`);
}
markMinesweeperCells(minesweeperVisibilityGame, ["A0"], true);
if (snapshotVisibleMinesweeper(minesweeperVisibilityGame, "guid-test").board[0][0] !== "flag") {
  throw new Error("minesweeper flag was not represented in visible snapshot");
}
openMinesweeperCells(minesweeperVisibilityGame, ["A1"]);
if (snapshotVisibleMinesweeper(minesweeperVisibilityGame, "guid-test").board[1][0] !== 1) {
  throw new Error("minesweeper opened number was not represented in visible snapshot");
}

if (!points24.routes.some((route) => route.aliases.includes("开始24点"))) {
  throw new Error("points24 start route is missing");
}

if (!sokoban.routes.some((route) => route.aliases.includes("开始推箱子"))) {
  throw new Error("sokoban start route is missing");
}

if (!sokoban.compactRoutes?.some((route) => route.pattern.test("推箱子1"))) {
  throw new Error("sokoban compact start route is missing");
}

if (!chineseChess.routes.some((route) => route.aliases.includes("发起中国象棋"))) {
  throw new Error("chinese-chess start route is missing");
}

if (!gobang.routes.some((route) => route.aliases.includes("开始五子棋"))) {
  throw new Error("gobang start route is missing");
}

if (!animalChess.routes.some((route) => route.aliases.includes("发起斗兽棋"))) {
  throw new Error("animal-chess start route is missing");
}

if (!chineseChess.compactRoutes?.some((route) => route.pattern.test("发起中国象棋"))) {
  throw new Error("chinese-chess compact join route is missing");
}

if (!chineseChess.compactRoutes?.some((route) => route.pattern.test("移子 A1 A2"))) {
  throw new Error("chinese-chess coordinate move route is missing");
}

if (!chineseChess.compactRoutes?.some((route) => route.pattern.test("兵一进一"))) {
  throw new Error("chinese-chess notation move route is missing");
}

if (!chineseChess.compactRoutes?.some((route) => route.pattern.test("中国象棋兵一进一"))) {
  throw new Error("chinese-chess prefixed notation move route is missing");
}

if (!chineseChess.compactRoutes?.some((route) => route.pattern.test("中国象棋 前兵一进一"))) {
  throw new Error("chinese-chess front/back notation move route is missing");
}

if (!gobang.compactRoutes?.some((route) => route.pattern.test("发起五子棋"))) {
  throw new Error("gobang compact join route is missing");
}

if (!gobang.compactRoutes?.some((route) => route.pattern.test("落子 8 8"))) {
  throw new Error("gobang compact move route is missing");
}

if (!animalChess.compactRoutes?.some((route) => route.pattern.test("发起斗兽棋"))) {
  throw new Error("animal-chess compact join route is missing");
}

if (!animalChess.compactRoutes?.some((route) => route.pattern.test("移动 A0 B0"))) {
  throw new Error("animal-chess compact move route is missing");
}

if (gameSession.rewriteActiveCommand({ ...groupEvent, MessageText: "翻开A1" }) !== null) {
  throw new Error("inactive session should not rewrite command");
}

gameSession.activate(groupEvent, "minesweeper");

const openCommand = gameSession.rewriteActiveCommand({
  ...groupEvent,
  MessageText: "翻开A1",
});

if (openCommand !== "扫雷翻开 A1") {
  throw new Error(`unexpected open command rewrite: ${openCommand}`);
}

const markCommand = gameSession.rewriteActiveCommand({
  ...groupEvent,
  MessageText: "标记 B2",
});

if (markCommand !== "扫雷标记 B2") {
  throw new Error(`unexpected mark command rewrite: ${markCommand}`);
}

const cancelMarkCommand = gameSession.rewriteActiveCommand({
  ...groupEvent,
  MessageText: "取消标记C3",
});

if (cancelMarkCommand !== "扫雷取消标记 C3") {
  throw new Error(`unexpected cancel command rewrite: ${cancelMarkCommand}`);
}

if (gameSession.rewriteActiveCommand({ ...otherGroupEvent, MessageText: "翻开A1" }) !== null) {
  throw new Error("session rewrite leaked into another group scope");
}

gameSession.deactivate(groupEvent, "minesweeper");

if (gameSession.rewriteActiveCommand({ ...groupEvent, MessageText: "翻开A1" }) !== null) {
  throw new Error("deactivate did not clear active session");
}

gameSession.activate(groupEvent, "points24");

const solveCommand = gameSession.rewriteActiveCommand({
  ...groupEvent,
  MessageText: "解 3*3+3*5",
});

if (solveCommand !== "24点解 3*3+3*5") {
  throw new Error(`unexpected points24 solve command rewrite: ${solveCommand}`);
}

const equalCommand = gameSession.rewriteActiveCommand({
  ...groupEvent,
  MessageText: "= (8-2)*4",
});

if (equalCommand !== "24点解 (8-2)*4") {
  throw new Error(`unexpected points24 equal command rewrite: ${equalCommand}`);
}

gameSession.deactivate(groupEvent, "points24");

gameSession.activate(groupEvent, "sokoban");

const sokobanMoveCommand = gameSession.rewriteActiveCommand({
  ...groupEvent,
  MessageText: "wasd",
});

if (sokobanMoveCommand !== "推箱子移动 wasd") {
  throw new Error(`unexpected sokoban move command rewrite: ${sokobanMoveCommand}`);
}

const sokobanUndoCommand = gameSession.rewriteActiveCommand({
  ...groupEvent,
  MessageText: "撤回",
});

if (sokobanUndoCommand !== "推箱子撤回") {
  throw new Error(`unexpected sokoban undo command rewrite: ${sokobanUndoCommand}`);
}

gameSession.deactivate(groupEvent, "sokoban");

gameSession.activate(groupEvent, "chinese-chess");

const chineseChessCoordinateCommand = gameSession.rewriteActiveCommand({
  ...groupEvent,
  MessageText: "移子 A1 A2",
});

if (chineseChessCoordinateCommand !== "中国象棋移子 A1 A2") {
  throw new Error(
    `unexpected chinese-chess coordinate rewrite: ${chineseChessCoordinateCommand}`
  );
}

const chineseChessNotationCommand = gameSession.rewriteActiveCommand({
  ...groupEvent,
  MessageText: "兵一进一",
});

if (chineseChessNotationCommand !== "中国象棋棋谱 兵一进一") {
  throw new Error(`unexpected chinese-chess notation rewrite: ${chineseChessNotationCommand}`);
}

const chineseChessSpacedNotationCommand = gameSession.rewriteActiveCommand({
  ...groupEvent,
  MessageText: "前 兵 一 进 一",
});

if (chineseChessSpacedNotationCommand !== "中国象棋棋谱 前 兵 一 进 一") {
  throw new Error(
    `unexpected chinese-chess spaced notation rewrite: ${chineseChessSpacedNotationCommand}`
  );
}

gameSession.deactivate(groupEvent, "chinese-chess");

gameSession.activate(groupEvent, "gobang");

const gobangMoveCommand = gameSession.rewriteActiveCommand({
  ...groupEvent,
  MessageText: "8 8",
});

if (gobangMoveCommand !== "五子棋8 8") {
  throw new Error(`unexpected gobang move rewrite: ${gobangMoveCommand}`);
}

const gobangDropCommand = gameSession.rewriteActiveCommand({
  ...groupEvent,
  MessageText: "落子 9 9",
});

if (gobangDropCommand !== "五子棋落子 9 9") {
  throw new Error(`unexpected gobang drop rewrite: ${gobangDropCommand}`);
}

gameSession.deactivate(groupEvent, "gobang");

gameSession.activate(groupEvent, "animal-chess");

const animalMoveCommand = gameSession.rewriteActiveCommand({
  ...groupEvent,
  MessageText: "A0B0",
});

if (animalMoveCommand !== "斗兽棋A0B0") {
  throw new Error(`unexpected animal-chess move rewrite: ${animalMoveCommand}`);
}

const animalFullMoveCommand = gameSession.rewriteActiveCommand({
  ...groupEvent,
  MessageText: "移动 A0 B0",
});

if (animalFullMoveCommand !== "斗兽棋移动 A0 B0") {
  throw new Error(`unexpected animal-chess full move rewrite: ${animalFullMoveCommand}`);
}

gameSession.deactivate(groupEvent, "animal-chess");

const redEvent = { ...groupEvent, UserId: "red-user" };
const blackEvent = { ...groupEvent, UserId: "black-user" };

const createPlayingChineseChessRoom = () => {
  const room = createChineseChessRoom();
  room.status = "playing";
  room.players["red-user"] = {
    userId: "red-user",
    nickname: "red",
    team: "红",
  };
  room.players["black-user"] = {
    userId: "black-user",
    nickname: "black",
    team: "黑",
  };
  return room;
};

const clearChineseChessBoard = (room) => {
  for (const key of Object.keys(room.state.board)) {
    room.state.board[key] = "空";
    room.state.ownership[key] = "0";
  }
};

const setChineseChessPiece = (room, row, col, piece, team) => {
  const key = pointKey({ row, col });
  room.state.board[key] = piece;
  room.state.ownership[key] = team;
};

const chineseRoom = createChineseChessRoom();

chineseRoom.status = "playing";
chineseRoom.players["red-user"] = {
  userId: "red-user",
  nickname: "red",
  team: "红",
};
chineseRoom.players["black-user"] = {
  userId: "black-user",
  nickname: "black",
  team: "黑",
};

boardRooms.saveRoom(redEvent, "chinese-chess", chineseRoom);

if (boardRooms.getRoom(blackEvent, "chinese-chess") !== chineseRoom) {
  throw new Error("board room did not share state across users in the same group");
}

const coordinateIntent = parseChineseChessCoordinateMove("移子 D1 E1");

if (!coordinateIntent) {
  throw new Error("chinese-chess coordinate parser failed");
}

const fullCoordinateIntent = parseChineseChessCoordinateMove("中国象棋移子 D1 E1");

if (!fullCoordinateIntent) {
  throw new Error("chinese-chess full coordinate parser failed");
}

const shortFullCoordinateIntent = parseChineseChessCoordinateMove("象棋移子 D1 E1");

if (!shortFullCoordinateIntent) {
  throw new Error("chinese-chess short full coordinate parser failed");
}

const coordinateValidation = validateChineseChessMove(chineseRoom, coordinateIntent, "red-user");

if (!coordinateValidation.ok) {
  throw new Error(`chinese-chess coordinate validation failed: ${coordinateValidation.message}`);
}

applyChineseChessMove(chineseRoom, coordinateIntent);

if (chineseRoom.state.current !== "黑") {
  throw new Error("chinese-chess move did not switch turn");
}

if (!rollbackChineseChessMove(chineseRoom)) {
  throw new Error("chinese-chess rollback failed");
}

if (chineseRoom.state.current !== "红") {
  throw new Error("chinese-chess rollback did not restore turn");
}

const notationIntent = parseChineseChessNotationMove("兵一进一", chineseRoom, "red-user");

if (!notationIntent) {
  throw new Error("chinese-chess notation parser failed");
}

const prefixedNotationIntent = parseChineseChessNotationMove(
  "中国象棋棋谱 兵一进一",
  chineseRoom,
  "red-user"
);

if (!prefixedNotationIntent) {
  throw new Error("chinese-chess prefixed notation parser failed");
}

const directPrefixedNotationIntent = parseChineseChessNotationMove(
  "中国象棋兵一进一",
  chineseRoom,
  "red-user"
);

if (!directPrefixedNotationIntent) {
  throw new Error("chinese-chess direct prefixed notation parser failed");
}

const prefixedFrontNotationRoom = createPlayingChineseChessRoom();
clearChineseChessBoard(prefixedFrontNotationRoom);
setChineseChessPiece(prefixedFrontNotationRoom, 0, 4, "将", "红");
setChineseChessPiece(prefixedFrontNotationRoom, 9, 4, "将", "黑");
setChineseChessPiece(prefixedFrontNotationRoom, 3, 0, "兵", "红");
setChineseChessPiece(prefixedFrontNotationRoom, 4, 0, "兵", "红");

const frontNotationIntent = parseChineseChessNotationMove(
  "中国象棋 前 兵 一 进 一",
  prefixedFrontNotationRoom,
  "red-user"
);

if (!frontNotationIntent) {
  throw new Error("chinese-chess front notation parser failed");
}

if (frontNotationIntent.from.row !== 4 || frontNotationIntent.to.row !== 5) {
  throw new Error(`unexpected front notation move: ${JSON.stringify(frontNotationIntent)}`);
}

if (notationIntent.from.row !== 3 || notationIntent.from.col !== 0) {
  throw new Error(`unexpected notation source: ${JSON.stringify(notationIntent.from)}`);
}

if (notationIntent.to.row !== 4 || notationIntent.to.col !== 0) {
  throw new Error(`unexpected notation target: ${JSON.stringify(notationIntent.to)}`);
}

const elephantRoom = createPlayingChineseChessRoom();
clearChineseChessBoard(elephantRoom);
setChineseChessPiece(elephantRoom, 0, 4, "将", "红");
setChineseChessPiece(elephantRoom, 9, 3, "将", "黑");
setChineseChessPiece(elephantRoom, 4, 4, "象", "红");

const elephantCrossRiver = validateChineseChessMove(
  elephantRoom,
  {
    from: { row: 4, col: 4 },
    to: { row: 6, col: 6 },
    input: { raw: "移子 E5 G7", mode: "coordinate" },
  },
  "red-user"
);

if (elephantCrossRiver.ok) {
  throw new Error("chinese-chess elephant should not cross the river");
}

const exposedGeneralsRoom = createPlayingChineseChessRoom();
clearChineseChessBoard(exposedGeneralsRoom);
setChineseChessPiece(exposedGeneralsRoom, 0, 4, "将", "红");
setChineseChessPiece(exposedGeneralsRoom, 9, 4, "将", "黑");
setChineseChessPiece(exposedGeneralsRoom, 5, 4, "車", "红");

const exposedGeneralsMove = validateChineseChessMove(
  exposedGeneralsRoom,
  {
    from: { row: 5, col: 4 },
    to: { row: 5, col: 5 },
    input: { raw: "移子 F5 F6", mode: "coordinate" },
  },
  "red-user"
);

if (exposedGeneralsMove.ok) {
  throw new Error("chinese-chess should reject moves that expose facing generals");
}

const exposedRookRoom = createPlayingChineseChessRoom();
clearChineseChessBoard(exposedRookRoom);
setChineseChessPiece(exposedRookRoom, 0, 4, "将", "红");
setChineseChessPiece(exposedRookRoom, 9, 3, "将", "黑");
setChineseChessPiece(exposedRookRoom, 5, 4, "車", "黑");
setChineseChessPiece(exposedRookRoom, 2, 4, "車", "红");

const exposedRookMove = validateChineseChessMove(
  exposedRookRoom,
  {
    from: { row: 2, col: 4 },
    to: { row: 2, col: 5 },
    input: { raw: "移子 C5 C6", mode: "coordinate" },
  },
  "red-user"
);

if (exposedRookMove.ok) {
  throw new Error("chinese-chess should reject moves that expose the general to a rook");
}

const exposedCannonRoom = createPlayingChineseChessRoom();
clearChineseChessBoard(exposedCannonRoom);
setChineseChessPiece(exposedCannonRoom, 0, 4, "将", "红");
setChineseChessPiece(exposedCannonRoom, 9, 3, "将", "黑");
setChineseChessPiece(exposedCannonRoom, 5, 4, "炮", "黑");
setChineseChessPiece(exposedCannonRoom, 2, 4, "兵", "红");
setChineseChessPiece(exposedCannonRoom, 3, 4, "車", "红");

const exposedCannonMove = validateChineseChessMove(
  exposedCannonRoom,
  {
    from: { row: 3, col: 4 },
    to: { row: 3, col: 5 },
    input: { raw: "移子 D5 D6", mode: "coordinate" },
  },
  "red-user"
);

if (exposedCannonMove.ok) {
  throw new Error("chinese-chess should reject moves that expose the general to a cannon");
}

const ignoredHorseCheckRoom = createPlayingChineseChessRoom();
clearChineseChessBoard(ignoredHorseCheckRoom);
setChineseChessPiece(ignoredHorseCheckRoom, 0, 4, "将", "红");
setChineseChessPiece(ignoredHorseCheckRoom, 9, 3, "将", "黑");
setChineseChessPiece(ignoredHorseCheckRoom, 2, 5, "馬", "黑");
setChineseChessPiece(ignoredHorseCheckRoom, 3, 0, "兵", "红");

const ignoredHorseCheckMove = validateChineseChessMove(
  ignoredHorseCheckRoom,
  {
    from: { row: 3, col: 0 },
    to: { row: 4, col: 0 },
    input: { raw: "移子 D1 E1", mode: "coordinate" },
  },
  "red-user"
);

if (ignoredHorseCheckMove.ok) {
  throw new Error("chinese-chess should reject moves that leave a horse check unresolved");
}

const ignoredPawnCheckRoom = createPlayingChineseChessRoom();
clearChineseChessBoard(ignoredPawnCheckRoom);
setChineseChessPiece(ignoredPawnCheckRoom, 1, 4, "将", "红");
setChineseChessPiece(ignoredPawnCheckRoom, 9, 3, "将", "黑");
setChineseChessPiece(ignoredPawnCheckRoom, 1, 3, "兵", "黑");
setChineseChessPiece(ignoredPawnCheckRoom, 3, 0, "兵", "红");

const ignoredPawnCheckMove = validateChineseChessMove(
  ignoredPawnCheckRoom,
  {
    from: { row: 3, col: 0 },
    to: { row: 4, col: 0 },
    input: { raw: "移子 D1 E1", mode: "coordinate" },
  },
  "red-user"
);

if (ignoredPawnCheckMove.ok) {
  throw new Error("chinese-chess should reject moves that leave a pawn check unresolved");
}

const checkRoom = createPlayingChineseChessRoom();
clearChineseChessBoard(checkRoom);
setChineseChessPiece(checkRoom, 0, 3, "将", "红");
setChineseChessPiece(checkRoom, 9, 4, "将", "黑");
setChineseChessPiece(checkRoom, 8, 0, "車", "红");

const checkingMove = validateChineseChessMove(
  checkRoom,
  {
    from: { row: 8, col: 0 },
    to: { row: 8, col: 4 },
    input: { raw: "移子 I1 I5", mode: "coordinate" },
  },
  "red-user"
);

if (!checkingMove.ok || !checkingMove.check) {
  throw new Error(`chinese-chess should report check: ${checkingMove.message}`);
}

const gobangPoint = parseGobangMove("落子 8 8");

if (!gobangPoint || gobangPoint.row !== 7 || gobangPoint.col !== 7) {
  throw new Error(`gobang move parser failed: ${JSON.stringify(gobangPoint)}`);
}

const prefixedGobangPoint = parseGobangMove("五子棋8 9");

if (!prefixedGobangPoint || prefixedGobangPoint.row !== 8 || prefixedGobangPoint.col !== 7) {
  throw new Error(`gobang prefixed move parser failed: ${JSON.stringify(prefixedGobangPoint)}`);
}

const gobangRoom = createGobangRoom("versus");
gobangRoom.status = "playing";
gobangRoom.players["black-user"] = {
  userId: "black-user",
  nickname: "black",
  team: "黑",
  meta: { symbol: "X" },
};
gobangRoom.players["white-user"] = {
  userId: "white-user",
  nickname: "white",
  team: "白",
  meta: { symbol: "O" },
};

for (let col = 0; col < 5; col += 1) {
  gobangRoom.state.board[8][col] = "X";
}

if (!checkGobangWin(gobangRoom.state.board, { row: 8, col: 4 })) {
  throw new Error("gobang horizontal win check failed");
}

const tacticalGobangBoard = createGobangRoom().state.board;
for (let col = 4; col < 8; col += 1) {
  tacticalGobangBoard[8][col] = "X";
}
const tacticalGobang = analyzeGobangTactics(tacticalGobangBoard);
if (
  tacticalGobang.whiteWinningMoves.length !== 0 ||
  !tacticalGobang.blackWinningMoves.some((move) => move.x === 4 && move.y === 9) ||
  !tacticalGobang.blackWinningMoves.some((move) => move.x === 9 && move.y === 9) ||
  tacticalGobang.priorityMoves.length !== 2
) {
  throw new Error(`gobang tactics analysis failed: ${JSON.stringify(tacticalGobang)}`);
}
if (
  tacticalGobang.recommendedMoves.length === 0 ||
  rankGobangAiMoves(tacticalGobangBoard, 3).length !== 3
) {
  throw new Error("gobang move ranking failed");
}

const gobangAiRoom = createGobangRoom("ai");
gobangAiRoom.players["black-user"] = {
  userId: "black-user",
  nickname: "black",
  team: "黑",
  meta: { symbol: "X" },
};
gobangAiRoom.players["__gobang_ai__"] = {
  userId: "__gobang_ai__",
  nickname: "AI",
  team: "白",
  meta: { symbol: "O" },
};

placeGobangMove(gobangAiRoom, "黑", { row: 8, col: 8 });
const gobangAiMove = chooseGobangAiMove(gobangAiRoom);

if (!gobangAiMove || gobangAiRoom.state.board[gobangAiMove.row][gobangAiMove.col] !== "-") {
  throw new Error(`gobang AI move failed: ${JSON.stringify(gobangAiMove)}`);
}

const animalPoint = parseAnimalChessMove("移动 A0 B0");

if (!animalPoint || animalPoint.from.row !== 0 || animalPoint.from.col !== 0) {
  throw new Error(`animal-chess move parser failed: ${JSON.stringify(animalPoint)}`);
}

const animalRoom = createAnimalChessRoom();
animalRoom.status = "playing";
animalRoom.players["red-user"] = {
  userId: "red-user",
  nickname: "red",
  team: "红",
};
animalRoom.players["blue-user"] = {
  userId: "blue-user",
  nickname: "blue",
  team: "蓝",
};

const animalMove = parseAnimalChessMove("移动 A0 A1");
if (!animalMove) {
  throw new Error("animal-chess adjacent move parser failed");
}

const animalValidation = validateAnimalChessMove(animalRoom, animalMove, "red-user");
if (!animalValidation.ok) {
  throw new Error(`animal-chess adjacent move validation failed: ${animalValidation.message}`);
}

applyAnimalChessMove(animalRoom, animalMove, "红");

if (animalRoom.state.current !== "蓝") {
  throw new Error("animal-chess move did not switch turn");
}

const animalRiverMove = parseAnimalChessMove("移动 A1 D1");
if (!animalRiverMove) {
  throw new Error("animal-chess river jump parser failed");
}

const animalRiverValidation = validateAnimalChessMove(animalRoom, animalRiverMove, "blue-user");
if (animalRiverValidation.ok) {
  throw new Error("animal-chess should reject moving the wrong team piece");
}

const animalWinRoom = createAnimalChessRoom();
animalWinRoom.status = "playing";
animalWinRoom.players["red-user"] = {
  userId: "red-user",
  nickname: "red",
  team: "红",
};
animalWinRoom.players["blue-user"] = {
  userId: "blue-user",
  nickname: "blue",
  team: "蓝",
};

for (const row of animalWinRoom.state.board) {
  for (const cell of row) {
    cell.piece = "空";
    cell.owner = "0";
  }
}

animalWinRoom.state.board[7][3].piece = "鼠";
animalWinRoom.state.board[7][3].owner = "红";
const animalWinMove = parseAnimalChessMove("移动 H3 I3");

if (!animalWinMove) {
  throw new Error("animal-chess win move parser failed");
}

const animalWinValidation = validateAnimalChessMove(animalWinRoom, animalWinMove, "red-user");

if (!animalWinValidation.ok || !animalWinValidation.win) {
  throw new Error(`animal-chess den win validation failed: ${animalWinValidation.message}`);
}

boardRooms.removeRoom(redEvent, "chinese-chess");

console.log("game smoke check passed");
