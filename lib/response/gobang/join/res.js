import { gameSession } from "../../../api/gameSession.js";
import { GOBANG_GAME, createGobangRoom } from "../../../api/games/gobang.js";
import { boardRooms } from "../../../api/boardRooms.js";
import "../../../api/index.js";
import { getEventNickname, getEventUserId, renderGobangMessage } from "../shared.js";
import { Text, useMessage } from "alemonjs";

//#region src/response/gobang/join/res.ts
const isJoinCommand = (event) => /加入/.test(String(event.MessageText ?? ""));
const getNextTeam = (room) => {
	const used = new Set(Object.values(room.players).map((player) => player.team));
	if (!used.has("黑")) return "黑";
	if (!used.has("白")) return "白";
	return null;
};
var res_default = async (event) => {
	const [message] = useMessage();
	const userId = getEventUserId(event);
	const nickname = getEventNickname(event);
	let room = boardRooms.getRoom(event, GOBANG_GAME);
	if (!room) room = createGobangRoom("versus");
	if (room.state.mode !== "versus") {
		await message.send(format(Text("当前是人机五子棋，请先结束后再发起双人对战。")));
		return;
	}
	if (room.players[userId]) {
		gameSession.activate(event, GOBANG_GAME);
		await message.send(format(Text(`你已加入五子棋，当前是${room.players[userId].team}棋。`)));
		return;
	}
	const team = getNextTeam(room);
	if (!team) {
		await message.send(format(Text("当前五子棋已有两位玩家。")));
		return;
	}
	room.players[userId] = {
		userId,
		nickname,
		team,
		meta: { symbol: team === "黑" ? "X" : "O" }
	};
	if (Object.keys(room.players).length >= 2) room.status = "playing";
	boardRooms.saveRoom(event, GOBANG_GAME, room);
	gameSession.activate(event, GOBANG_GAME);
	if (room.status === "waiting") {
		const verb = isJoinCommand(event) ? "加入" : "发起";
		await message.send(format(Text(`${nickname} ${verb}了五子棋，执黑先手。其他玩家发送“加入五子棋”。`)));
		return;
	}
	await message.send(await renderGobangMessage(room, `${nickname} 加入五子棋，执${team}棋。`));
};

//#endregion
export { res_default as default };