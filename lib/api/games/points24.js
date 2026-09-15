import { gameRegistry } from "../gameRegistry.js";

//#region src/api/games/points24.ts
const POINTS24_GAME = "points24";
const answerCommandPattern = /^(解|答|答题|=)\s*(.+)$/i;
const explicitAnswerPattern = /^(?:[!！/#＃]\s*)?(24点解|24点答|24点答题)\s+(.+)$/i;
const createRewriteCommand = (command, expression) => {
	if (command === "=") return `24点解 ${expression}`;
	return `24点${command} ${expression}`;
};
const points24CommandController = {
	game: POINTS24_GAME,
	rewriteCommand(event) {
		const match = String(event.MessageText ?? "").trim().replace(/^(?:[!！/#＃]\s*)/, "").match(answerCommandPattern);
		if (!match) return null;
		const [, command, expression] = match;
		return createRewriteCommand(command, expression.trim());
	}
};
const points24GameDefinition = {
	game: POINTS24_GAME,
	controller: points24CommandController,
	compactRoutes: [{
		pattern: explicitAnswerPattern,
		importer: () => import("../../response/points24/answer/res.js")
	}],
	routes: [
		{
			aliases: [
				"开始24点",
				"24点",
				"二十四点"
			],
			importer: () => import("../../response/points24/start/res.js")
		},
		{
			aliases: [
				"结束24点",
				"退出24点",
				"关闭24点"
			],
			importer: () => import("../../response/points24/exit/res.js")
		},
		{
			aliases: [
				"24点帮助",
				"二十四点帮助",
				"24点说明"
			],
			importer: () => import("../../response/points24/help/res.js")
		},
		{
			aliases: [
				"24点解",
				"24点答",
				"24点答题"
			],
			importer: () => import("../../response/points24/answer/res.js")
		}
	]
};
gameRegistry.register(points24GameDefinition);

//#endregion
export { POINTS24_GAME, points24CommandController, points24GameDefinition };