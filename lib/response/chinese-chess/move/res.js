import { gameSession } from "../../../api/gameSession.js";
import { CHINESE_CHESS_GAME } from "../../../api/games/chineseChess.js";
import { boardRooms } from "../../../api/boardRooms.js";
import "../../../api/index.js";
import { getEventUserId, renderChineseChessMessage } from "../shared.js";
import { parseChineseChessCoordinateMove, parseChineseChessNotationMove } from "../../../api/games/chineseChess/parser.js";
import { applyChineseChessMove, validateChineseChessMove } from "../../../api/games/chineseChess/rules.js";
import { Text, useMessage } from "alemonjs";

//#region src/response/chinese-chess/move/res.ts
var res_default = async (event) => {
	const [message] = useMessage();
	const userId = getEventUserId(event);
	const room = boardRooms.getRoom(event, CHINESE_CHESS_GAME);
	if (!room || room.status === "waiting") {
		await message.send(format(Text("请先发起并加入中国象棋。")));
		return;
	}
	if (room.status === "finished") {
		await message.send(format(Text("本局中国象棋已经结束，请重新发起。")));
		return;
	}
	const raw = String(event.MessageText ?? "").trim();
	const intent = parseChineseChessCoordinateMove(raw) ?? parseChineseChessNotationMove(raw, room, userId);
	if (!intent) {
		await message.send(format(Text("指令不正确。可使用“移子 A1 A2”或“兵一进一”。")));
		return;
	}
	const result = validateChineseChessMove(room, intent, userId);
	if (!result.ok) {
		await message.send(format(Text(result.message ?? "移动不正确")));
		return;
	}
	applyChineseChessMove(room, intent);
	if (result.win) {
		room.status = "finished";
		room.winner = room.players[userId]?.team;
		boardRooms.saveRoom(event, CHINESE_CHESS_GAME, room);
		gameSession.deactivate(event, CHINESE_CHESS_GAME);
		await message.send(await renderChineseChessMessage(room, `恭喜${room.winner}方获得胜利！`));
		return;
	}
	boardRooms.saveRoom(event, CHINESE_CHESS_GAME, room);
	gameSession.activate(event, CHINESE_CHESS_GAME);
	await message.send(await renderChineseChessMessage(room, result.check ? `${room.state.current}方被将军。` : void 0));
};

//#endregion
export { res_default as default };