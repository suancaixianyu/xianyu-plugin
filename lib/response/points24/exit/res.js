import { gamePools } from "../../../api/gamePools.js";
import { gameSession } from "../../../api/gameSession.js";
import { POINTS24_GAME } from "../../../api/games/points24.js";
import "../../../api/index.js";
import { Text, useMessage } from "alemonjs";

//#region src/response/points24/exit/res.ts
var res_default = async (event) => {
	const [message] = useMessage();
	if (!gamePools.getGame(event, "points24")) {
		await message.send(format(Text("当前没有进行中的24点游戏。")));
		return;
	}
	gamePools.removeGame(event, POINTS24_GAME);
	gameSession.deactivate(event, POINTS24_GAME);
	await message.send(format(Text("24点游戏已结束。")));
};

//#endregion
export { res_default as default };