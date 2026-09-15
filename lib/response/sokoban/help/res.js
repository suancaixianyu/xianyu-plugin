import SokobanHelp from "../../../image/conponent/sokoban/help.js";
import { Image, Text, useMessage } from "alemonjs";
import { renderComponentIsHtmlToBuffer } from "jsxp";

//#region src/response/sokoban/help/res.ts
var res_default = async () => {
	const [message] = useMessage();
	const img = await renderComponentIsHtmlToBuffer(SokobanHelp, {});
	if (typeof img !== "boolean") {
		await message.send(format(Image(img)));
		return;
	}
	await message.send(format(Text("推箱子帮助图加载失败")));
};

//#endregion
export { res_default as default };