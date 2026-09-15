import { Text, useMessage } from "alemonjs";

//#region src/response/hello/res.ts
var res_default = async () => {
	const [message] = useMessage();
	await message.send(format(Text("你好")));
};

//#endregion
export { res_default as default };