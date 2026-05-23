import "../lib/api/games/index.js";
import { gameRegistry } from "../lib/api/gameRegistry.js";
import { gameSession } from "../lib/api/gameSession.js";

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

if (!minesweeper) {
  throw new Error("minesweeper is not registered");
}

if (!points24) {
  throw new Error("points24 is not registered");
}

if (!minesweeper.routes.some((route) => route.aliases.includes("扫雷"))) {
  throw new Error("minesweeper start route is missing");
}

if (!points24.routes.some((route) => route.aliases.includes("开始24点"))) {
  throw new Error("points24 start route is missing");
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

console.log("game smoke check passed");
