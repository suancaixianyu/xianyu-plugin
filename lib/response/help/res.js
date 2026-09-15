import App from "../../image/conponent/help.js";
import { Image, Text, useMessage } from "alemonjs";
import { renderComponentIsHtmlToBuffer } from "jsxp";

//#region src/response/help/res.ts
var res_default = async () => {
	const [message] = useMessage();
	const img = await renderComponentIsHtmlToBuffer(App, {});
	if (typeof img !== "boolean") {
		await message.send(format(Image(img)));
		return;
	}
	await message.send(format(Text("图片加载失败")));
};

//#endregion
export { res_default as default };