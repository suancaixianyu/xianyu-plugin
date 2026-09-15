import { gamePools } from "../../../api/gamePools.js";
import { gameSession } from "../../../api/gameSession.js";
import { SOKOBAN_GAME, undoSokoban } from "../../../api/games/sokoban.js";
import "../../../api/index.js";
import { renderSokobanMessage } from "../shared.js";
import { Text, useMessage } from "alemonjs";

//#region src/response/sokoban/undo/res.ts
var res_default = async (event) => {
	const [message] = useMessage();
	const game = gamePools.getGame(event, SOKOBAN_GAME);
	if (!game) {
		await message.send(format(Text("请先开始游戏：/推箱子")));
		return;
	}
	if (!undoSokoban(game)) {
		gameSession.activate(event, SOKOBAN_GAME);
		await message.send(format(Text("已经是初始状态，不能继续撤回。")));
		return;
	}
	gamePools.saveGame(event, SOKOBAN_GAME, game);
	gameSession.activate(event, SOKOBAN_GAME);
	await message.send(await renderSokobanMessage(game, "已撤回一步"));
};

//#endregion
export { res_default as default };