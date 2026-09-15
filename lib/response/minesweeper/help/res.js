import MinesweeperHelp from "../../../image/conponent/minesweeper/help.js";
import { Image, Text, useMessage } from "alemonjs";
import { renderComponentIsHtmlToBuffer } from "jsxp";

//#region src/response/minesweeper/help/res.ts
var res_default = async () => {
	const [message] = useMessage();
	const img = await renderComponentIsHtmlToBuffer(MinesweeperHelp, {});
	if (typeof img != "boolean") {
		await message.send(format(Image(img)));
		return;
	} else await message.send(format(Text("扫雷帮助图加载失败")));
};

//#endregion
export { res_default as default };