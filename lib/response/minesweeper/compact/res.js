//#region src/response/minesweeper/compact/res.ts
const compactCommandPattern = /^(?:[!！/#＃]\s*)?(扫雷翻开|扫镭翻开|扫雷标记|扫镭标记|扫雷取消标记|扫镭取消标记)\s*([a-zA-Z]\d+(?:\s+[a-zA-Z]\d+)*)$/;
var res_default = async (event) => {
	const match = String(event.MessageText ?? "").trim().match(compactCommandPattern);
	if (!match) return;
	const [, command, coords] = match;
	event.MessageText = `${command} ${coords}`;
	if (command.includes("翻开")) {
		await (await import("../open/res.js")).default(event);
		return false;
	}
	await (await import("../mark/res.js")).default(event);
	return false;
};

//#endregion
export { res_default as default };