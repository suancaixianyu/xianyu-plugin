import GobangHelp from "../../../image/conponent/gobang/help.js";
import { Image, Text, useMessage } from "alemonjs";
import { renderComponentIsHtmlToBuffer } from "jsxp";

//#region src/response/gobang/help/res.ts
var res_default = async () => {
	const [message] = useMessage();
	const img = await renderComponentIsHtmlToBuffer(GobangHelp, {});
	if (typeof img !== "boolean") {
		await message.send(format(Image(img)));
		return;
	}
	await message.send(format(Text("五子棋帮助图加载失败")));
};

//#endregion
export { res_default as default };