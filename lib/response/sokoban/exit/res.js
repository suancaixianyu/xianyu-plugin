import { gamePools } from "../../../api/gamePools.js";
import { gameSession } from "../../../api/gameSession.js";
import { SOKOBAN_GAME } from "../../../api/games/sokoban.js";
import "../../../api/index.js";
import { Text, useMessage } from "alemonjs";

//#region src/response/sokoban/exit/res.ts
var res_default = async (event) => {
	const [message] = useMessage();
	if (gamePools.getGame(event, "sokoban")) {
		gamePools.removeGame(event, SOKOBAN_GAME);
		gameSession.deactivate(event, SOKOBAN_GAME);
		await message.send(format(Text("推箱子游戏已结束")));
		return;
	}
	await message.send(format(Text("没有正在进行的推箱子游戏")));
};

//#endregion
export { res_default as default };