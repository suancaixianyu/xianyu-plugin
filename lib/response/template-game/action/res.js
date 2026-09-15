import { gamePools } from "../../../api/gamePools.js";
import { gameSession } from "../../../api/gameSession.js";
import { TEMPLATE_GAME } from "../../../api/games/template.js";
import "../../../api/index.js";
import { Text, useMessage } from "alemonjs";

//#region src/response/template-game/action/res.ts
const extractInput = (event) => {
	const routeArgs = event.__route?.parsedArgs?.join(" ")?.trim();
	if (routeArgs) return routeArgs;
	return String(event.MessageText ?? "").replace(/^(?:[!！/#＃]\s*)?/, "").replace(/^(?:示例操作|模板操作)\s*/, "").trim() || "未提供内容";
};
var res_default = async (event) => {
	const [message] = useMessage();
	const state = gamePools.getGame(event, TEMPLATE_GAME);
	if (!state || state.status !== "playing") {
		await message.send(format(Text("请先开始示例游戏：/示例游戏")));
		return;
	}
	const input = extractInput(event);
	state.step += 1;
	state.lastInput = input;
	gameSession.activate(event, TEMPLATE_GAME);
	await message.send(format(Text(`示例游戏收到：${input}，当前第 ${state.step} 步`)));
};

//#endregion
export { res_default as default };