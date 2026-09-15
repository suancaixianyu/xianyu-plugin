import { gamePools } from "../../../api/gamePools.js";
import { gameSession } from "../../../api/gameSession.js";
import { TEMPLATE_GAME } from "../../../api/games/template.js";
import "../../../api/index.js";
import { Text, useMessage } from "alemonjs";

//#region src/response/template-game/exit/res.ts
var res_default = async (event) => {
	const [message] = useMessage();
	const state = gamePools.getGame(event, TEMPLATE_GAME);
	if (!state) {
		await message.send(format(Text("当前没有进行中的示例游戏")));
		return;
	}
	state.status = "finished";
	gamePools.removeGame(event, TEMPLATE_GAME);
	gameSession.deactivate(event, TEMPLATE_GAME);
	await message.send(format(Text("示例游戏已结束")));
};

//#endregion
export { res_default as default };