import ChineseChessHelp from "../../../image/conponent/chinese-chess/help.js";
import { Image, Text, useMessage } from "alemonjs";
import { renderComponentIsHtmlToBuffer } from "jsxp";

//#region src/response/chinese-chess/help/res.ts
var res_default = async () => {
	const [message] = useMessage();
	const img = await renderComponentIsHtmlToBuffer(ChineseChessHelp, {});
	if (typeof img !== "boolean") {
		await message.send(format(Image(img)));
		return;
	}
	await message.send(format(Text("中国象棋帮助图加载失败")));
};

//#endregion
export { res_default as default };