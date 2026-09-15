import { gameSession } from "../../../api/gameSession.js";
import { GOBANG_AGENT_USER_ID, GOBANG_AI_USER_ID, GOBANG_GAME } from "../../../api/games/gobang.js";
import { boardRooms } from "../../../api/boardRooms.js";
import "../../../api/index.js";
import { getEventUserId } from "../shared.js";
import { Text, useMessage } from "alemonjs";

//#region src/response/gobang/exit/res.ts
var res_default = async (event) => {
	const [message] = useMessage();
	const userId = getEventUserId(event);
	const room = boardRooms.getRoom(event, GOBANG_GAME);
	if (!room) {
		await message.send(format(Text("没有正在进行的五子棋。")));
		return;
	}
	if (!room.players[userId]) {
		await message.send(format(Text("你还没加入五子棋，不能结束本局。")));
		return;
	}
	const loser = room.players[userId].team;
	const opponent = Object.values(room.players).find((player) => player.team !== loser && player.userId !== "__gobang_ai__" && player.userId !== "__gobang_agent__");
	const winner = room.state.mode === "ai" ? "AI" : room.state.mode === "agent" ? room.players["__gobang_agent__"]?.nickname || "Aichat" : opponent?.nickname || "对方";
	boardRooms.removeRoom(event, GOBANG_GAME);
	gameSession.deactivate(event, GOBANG_GAME);
	await message.send(format(Text(`五子棋已结束，${winner}获胜。`)));
};

//#endregion
export { res_default as default };