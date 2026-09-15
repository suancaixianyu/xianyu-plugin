//#region src/response/points24/compact/res.ts
var res_default = async (event) => {
	const match = String(event.MessageText ?? "").trim().match(/^(?:[!！/#＃]\s*)?(24点解|24点答|24点答题)\s+(.+)$/i);
	if (!match) return;
	const [, command, expression] = match;
	event.MessageText = `${command} ${expression}`.trim();
	await (await import("../answer/res.js")).default(event);
	return false;
};

//#endregion
export { res_default as default };