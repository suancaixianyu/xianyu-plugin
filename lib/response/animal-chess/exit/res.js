import { gameSession } from "../../../api/gameSession.js";
import { ANIMAL_CHESS_GAME, opponentAnimalChessTeam } from "../../../api/games/animalChess.js";
import { boardRooms } from "../../../api/boardRooms.js";
import "../../../api/index.js";
import { getEventUserId } from "../shared.js";
import { Text, useMessage } from "alemonjs";

//#region src/response/animal-chess/exit/res.ts
var res_default = async (event) => {
	const [message] = useMessage();
	const userId = getEventUserId(event);
	const room = boardRooms.getRoom(event, ANIMAL_CHESS_GAME);
	if (!room) {
		await message.send(format(Text("没有正在进行的斗兽棋。")));
		return;
	}
	if (!room.players[userId]) {
		await message.send(format(Text("你还没加入斗兽棋，不能结束本局。")));
		return;
	}
	const loser = room.players[userId].team;
	const winner = opponentAnimalChessTeam(loser);
	boardRooms.removeRoom(event, ANIMAL_CHESS_GAME);
	gameSession.deactivate(event, ANIMAL_CHESS_GAME);
	await message.send(format(Text(`斗兽棋已结束，${winner}队获胜。`)));
};

//#endregion
export { res_default as default };