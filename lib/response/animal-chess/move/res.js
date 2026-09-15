import { gameSession } from "../../../api/gameSession.js";
import { ANIMAL_CHESS_GAME, applyAnimalChessMove, parseAnimalChessMove, validateAnimalChessMove } from "../../../api/games/animalChess.js";
import { boardRooms } from "../../../api/boardRooms.js";
import "../../../api/index.js";
import { getEventUserId, renderAnimalChessMessage } from "../shared.js";
import { Text, useMessage } from "alemonjs";

//#region src/response/animal-chess/move/res.ts
var res_default = async (event) => {
	const [message] = useMessage();
	const userId = getEventUserId(event);
	const room = boardRooms.getRoom(event, ANIMAL_CHESS_GAME);
	if (!room || room.status === "finished") {
		await message.send(format(Text("请先发起并加入斗兽棋。")));
		return;
	}
	if (room.status === "waiting") {
		await message.send(format(Text("斗兽棋正在等待第二位玩家加入。")));
		return;
	}
	const intent = parseAnimalChessMove(String(event.MessageText ?? ""));
	if (!intent) {
		await message.send(format(Text("移动格式不正确，可发送“移动 A0 B0”。")));
		return;
	}
	const result = validateAnimalChessMove(room, intent, userId);
	if (!result.ok) {
		await message.send(format(Text(result.message ?? "移动不正确")));
		return;
	}
	const team = room.players[userId].team;
	applyAnimalChessMove(room, intent, team);
	if (result.win) {
		room.status = "finished";
		room.winner = team;
		boardRooms.saveRoom(event, ANIMAL_CHESS_GAME, room);
		gameSession.deactivate(event, ANIMAL_CHESS_GAME);
		await message.send(await renderAnimalChessMessage(room, `恭喜${team}队获得胜利！`));
		return;
	}
	boardRooms.saveRoom(event, ANIMAL_CHESS_GAME, room);
	gameSession.activate(event, ANIMAL_CHESS_GAME);
	await message.send(await renderAnimalChessMessage(room));
};

//#endregion
export { res_default as default };