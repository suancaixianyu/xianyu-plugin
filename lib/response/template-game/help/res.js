import { Text, useMessage } from "alemonjs";

//#region src/response/template-game/help/res.ts
var res_default = async () => {
	const [message] = useMessage();
	await message.send(format(Text("示例游戏命令：/示例游戏、/示例操作 内容、/退出示例游戏。启动后也可直接发送“操作 内容”。")));
};

//#endregion
export { res_default as default };