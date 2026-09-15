import Points24Help from "../../../image/conponent/points24/help.js";
import { Image, Text, useMessage } from "alemonjs";
import { renderComponentIsHtmlToBuffer } from "jsxp";

//#region src/response/points24/help/res.ts
var res_default = async () => {
	const [message] = useMessage();
	const img = await renderComponentIsHtmlToBuffer(Points24Help, {});
	if (typeof img !== "boolean") {
		await message.send(format(Image(img)));
		return;
	}
	await message.send(format(Text("24点帮助图加载失败")));
};

//#endregion
export { res_default as default };