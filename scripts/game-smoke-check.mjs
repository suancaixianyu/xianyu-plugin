import "../lib/api/games/index.js";
import { boardRooms } from "../lib/api/boardRooms.js";
import { gameRegistry } from "../lib/api/gameRegistry.js";
import { gameSession } from "../lib/api/gameSession.js";
import { createChineseChessRoom } from "../lib/api/games/chineseChess/state.js";
import {
  parseChineseChessCoordinateMove,
  parseChineseChessNotationMove,
} from "../lib/api/games/chineseChess/parser.js";
import {
  applyChineseChessMove,
  rollbackChineseChessMove,
  validateChineseChessMove,
} from "../lib/api/games/chineseChess/rules.js";

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

if (!minesweeper.routes.some((route) => route.aliases.includes("扫雷"))) {
  throw new Error("minesweeper start route is missing");
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

if (!chineseChess.compactRoutes?.some((route) => route.pattern.test("发起中国象棋"))) {
  throw new Error("chinese-chess compact join route is missing");
}

if (!chineseChess.compactRoutes?.some((route) => route.pattern.test("移子 A1 A2"))) {
  throw new Error("chinese-chess coordinate move route is missing");
}

if (!chineseChess.compactRoutes?.some((route) => route.pattern.test("兵一进一"))) {
  throw new Error("chinese-chess notation move route is missing");
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

gameSession.deactivate(groupEvent, "chinese-chess");

const redEvent = { ...groupEvent, UserId: "red-user" };
const blackEvent = { ...groupEvent, UserId: "black-user" };
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

if (notationIntent.from.row !== 3 || notationIntent.from.col !== 0) {
  throw new Error(`unexpected notation source: ${JSON.stringify(notationIntent.from)}`);
}

if (notationIntent.to.row !== 4 || notationIntent.to.col !== 0) {
  throw new Error(`unexpected notation target: ${JSON.stringify(notationIntent.to)}`);
}

boardRooms.removeRoom(redEvent, "chinese-chess");

console.log("game smoke check passed");
