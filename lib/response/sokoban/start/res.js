import { gamePools } from "../../../api/gamePools.js";
import { gameSession } from "../../../api/gameSession.js";
import { SOKOBAN_GAME, createSokobanGame, sokobanLevelCount } from "../../../api/games/sokoban.js";
import "../../../api/index.js";
import { parseSokobanLevelNumber, renderSokobanMessage } from "../shared.js";
import { Text, useMessage } from "alemonjs";

//#region src/response/sokoban/start/res.ts
var res_default = async (event) => {
	const [message] = useMessage();
	const current = gamePools.getGame(event, SOKOBAN_GAME);
	if (current?.status === "playing") {
		gameSession.activate(event, SOKOBAN_GAME);
		await message.send(await renderSokobanMessage(current, "当前已有推箱子游戏进行中"));
		return;
	}
	const levelNumber = parseSokobanLevelNumber(event);
	const levelIndex = levelNumber - 1;
	const game = createSokobanGame(levelIndex);
	if (!game) {
		await message.send(format(Text(`没有第 ${levelNumber} 关，目前共有 ${sokobanLevelCount} 关。`)));
		return;
	}
	gamePools.saveGame(event, SOKOBAN_GAME, game);
	gameSession.activate(event, SOKOBAN_GAME);
	await message.send(await renderSokobanMessage(game, `推箱子开始：第 ${levelNumber} 关`));
};

//#endregion
export { res_default as default };