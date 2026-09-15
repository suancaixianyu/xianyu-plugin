import { gameSession } from "../../../api/gameSession.js";
import { CHINESE_CHESS_GAME } from "../../../api/games/chineseChess.js";
import { boardRooms } from "../../../api/boardRooms.js";
import "../../../api/index.js";
import { getEventUserId } from "../shared.js";
import { Text, useMessage } from "alemonjs";

//#region src/response/chinese-chess/exit/res.ts
var res_default = async (event) => {
	const [message] = useMessage();
	const userId = getEventUserId(event);
	const room = boardRooms.getRoom(event, CHINESE_CHESS_GAME);
	if (!room) {
		await message.send(format(Text("没有正在进行的中国象棋。")));
		return;
	}
	if (!room.players[userId]) {
		await message.send(format(Text("你还没加入中国象棋，不能结束本局。")));
		return;
	}
	const winner = room.players[userId].team === "红" ? "黑" : "红";
	boardRooms.removeRoom(event, CHINESE_CHESS_GAME);
	gameSession.deactivate(event, CHINESE_CHESS_GAME);
	await message.send(format(Text(`中国象棋已结束，${winner}方获胜。`)));
};

//#endregion
export { res_default as default };