//#region src/response/template-game/compact/res.ts
var res_default = async (event) => {
	const match = String(event.MessageText ?? "").trim().match(/^(?:[!！/#＃]\s*)?(示例操作|示例结束操作)\s*(.+)?$/);
	if (!match) return;
	const [, command, rest = ""] = match;
	event.MessageText = `${command} ${rest}`.trim();
	if (command === "示例结束操作") {
		await (await import("../exit/res.js")).default(event);
		return false;
	}
	await (await import("../action/res.js")).default(event);
	return false;
};

//#endregion
export { res_default as default };