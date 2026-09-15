import { gamePools } from "../../../api/gamePools.js";
import { gameSession } from "../../../api/gameSession.js";
import { MINESWEEPER_GAME } from "../../../api/games/minesweeper.js";
import "../../../api/index.js";
import { Text, useMessage } from "alemonjs";

//#region src/response/minesweeper/exit/res.ts
var res_default = async (event) => {
	const [message] = useMessage();
	if (gamePools.getGame(event, "minesweeper")) {
		gamePools.removeGame(event, MINESWEEPER_GAME);
		gameSession.deactivate(event, MINESWEEPER_GAME);
		await message.send(format(Text("已结束游戏")));
		return;
	}
	await message.send(format(Text("没有正在进行的游戏")));
};

//#endregion
export { res_default as default };