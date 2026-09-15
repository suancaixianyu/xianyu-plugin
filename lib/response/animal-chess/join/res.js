import { gameSession } from "../../../api/gameSession.js";
import { ANIMAL_CHESS_GAME, createAnimalChessRoom } from "../../../api/games/animalChess.js";
import { boardRooms } from "../../../api/boardRooms.js";
import "../../../api/index.js";
import { getEventNickname, getEventUserId, parseRequestedTeam, renderAnimalChessMessage } from "../shared.js";
import { Text, useMessage } from "alemonjs";

//#region src/response/animal-chess/join/res.ts
const getNextTeam = (room, requested) => {
	const playerCount = Object.keys(room.players).length;
	if (playerCount === 0) return "红";
	if (playerCount === 1) return "蓝";
	return requested;
};
var res_default = async (event) => {
	const [message] = useMessage();
	const userId = getEventUserId(event);
	const nickname = getEventNickname(event);
	const requestedTeam = parseRequestedTeam(event);
	const room = boardRooms.getRoom(event, "animal-chess") ?? createAnimalChessRoom();
	if (room.players[userId]) {
		gameSession.activate(event, ANIMAL_CHESS_GAME);
		await message.send(format(Text(`你已加入斗兽棋，当前是${room.players[userId].team}队。`)));
		return;
	}
	const team = getNextTeam(room, requestedTeam);
	if (!team) {
		await message.send(format(Text("当前已有对局，请发送“加入斗兽棋红”或“加入斗兽棋蓝”加入队伍。")));
		return;
	}
	room.players[userId] = {
		userId,
		nickname,
		team
	};
	if (Object.keys(room.players).length >= 2) room.status = "playing";
	boardRooms.saveRoom(event, ANIMAL_CHESS_GAME, room);
	gameSession.activate(event, ANIMAL_CHESS_GAME);
	if (room.status === "waiting") {
		await message.send(format(Text(`${nickname} 发起了斗兽棋，执红先手。其他玩家发送“加入斗兽棋”。`)));
		return;
	}
	await message.send(await renderAnimalChessMessage(room, `${nickname} 加入斗兽棋，加入${team}队。`));
};

//#endregion
export { res_default as default };