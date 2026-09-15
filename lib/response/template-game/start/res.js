import { gamePools } from "../../../api/gamePools.js";
import { gameSession } from "../../../api/gameSession.js";
import { TEMPLATE_GAME } from "../../../api/games/template.js";
import "../../../api/index.js";
import { Text, useMessage } from "alemonjs";

//#region src/response/template-game/start/res.ts
const createTemplateState = () => ({
	step: 0,
	startedAt: Date.now(),
	lastInput: null,
	status: "playing"
});
var res_default = async (event) => {
	const [message] = useMessage();
	const current = gamePools.getGame(event, TEMPLATE_GAME);
	if (current?.status === "playing") {
		gameSession.activate(event, TEMPLATE_GAME);
		await message.send(format(Text(`示例游戏进行中，当前已操作 ${current.step} 次`)));
		return;
	}
	const state = createTemplateState();
	gamePools.saveGame(event, TEMPLATE_GAME, state);
	gameSession.activate(event, TEMPLATE_GAME);
	await message.send(format(Text("示例游戏已开始，发送“操作 任何内容”体验会话接管。")));
};

//#endregion
export { res_default as default };