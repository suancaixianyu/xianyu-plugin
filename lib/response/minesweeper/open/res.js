import { gamePools } from "../../../api/gamePools.js";
import { gameSession } from "../../../api/gameSession.js";
import { MINESWEEPER_GAME, openMinesweeperCells } from "../../../api/games/minesweeper.js";
import { timeDiff } from "../../../api/lib.js";
import "../../../api/index.js";
import App from "../../../image/conponent/minesweeper/map.js";
import { Image, Text, useMessage } from "alemonjs";
import { renderComponentToBuffer } from "jsxp";

//#region src/response/minesweeper/open/res.ts
const findInput = (event) => {
	return ((event.__route?.parsedArgs?.join(" ") ?? "") || event.MessageText || "").match(/[a-zA-Z][0-9]+/g);
};
var res_default = async (event) => {
	const [message] = useMessage(event);
	const game = gamePools.getGame(event, MINESWEEPER_GAME);
	if (!game) {
		await message.send(format(Text("请先开始游戏：/扫雷")));
		return;
	}
	if (game.state != "playing") return;
	const input = findInput(event);
	if (!input) {
		await message.send(format(Text("输入错误，请查看 /扫雷帮助")));
		return;
	}
	openMinesweeperCells(game, input);
	game.time = timeDiff(game.startTime, Date.now());
	if (game.state !== "playing") gameSession.deactivate(event, MINESWEEPER_GAME);
	else gameSession.activate(event, MINESWEEPER_GAME);
	const img = await renderComponentToBuffer("minesweeper", App, { game });
	if (typeof img != "boolean") await message.send(format(Image(img)));
	else await message.send(format(Text("图片加载失败")));
};

//#endregion
export { res_default as default };