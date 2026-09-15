import { sokobanLevelCount } from "../../../api/games/sokoban.js";
import { Text, useMessage } from "alemonjs";

//#region src/response/sokoban/list/res.ts
var res_default = async () => {
	const [message] = useMessage();
	const levels = Array.from({ length: sokobanLevelCount }, (_, index) => {
		return `${index + 1}: 原版关卡`;
	});
	await message.send(format(Text(["推箱子关卡列表：", ...levels].join("\n"))));
};

//#endregion
export { res_default as default };