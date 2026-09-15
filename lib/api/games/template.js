//#region src/api/games/template.ts
const TEMPLATE_GAME = "template-game";
const templateCompactCommandPattern = /^(操作|示例操作|结束操作|示例结束操作)\s*(.+)?$/;
const templateRewriteMap = {
	操作: "示例操作",
	结束操作: "示例结束操作"
};
const templateGameCommandController = {
	game: TEMPLATE_GAME,
	rewriteCommand(event) {
		const match = String(event.MessageText ?? "").trim().replace(/^(?:[!！/#＃]\s*)/, "").match(templateCompactCommandPattern);
		if (!match) return null;
		const [, command, rest = ""] = match;
		const rewritten = templateRewriteMap[command];
		if (!rewritten) return null;
		return `${rewritten} ${rest}`.trim();
	}
};
const templateGameDefinition = {
	game: TEMPLATE_GAME,
	controller: templateGameCommandController,
	compactRoutes: [{
		pattern: /^(?:[!！/#＃]\s*)?(示例操作|示例结束操作)\s*(.+)?$/,
		importer: () => import("../../response/template-game/compact/res.js")
	}],
	routes: [
		{
			aliases: ["示例游戏", "模板游戏"],
			importer: () => import("../../response/template-game/start/res.js")
		},
		{
			aliases: [
				"示例游戏帮助",
				"模板游戏帮助",
				"示例说明"
			],
			importer: () => import("../../response/template-game/help/res.js")
		},
		{
			aliases: ["示例操作", "模板操作"],
			importer: () => import("../../response/template-game/action/res.js")
		},
		{
			aliases: [
				"退出示例游戏",
				"结束示例游戏",
				"关闭示例游戏"
			],
			importer: () => import("../../response/template-game/exit/res.js")
		}
	]
};

//#endregion
export { TEMPLATE_GAME, templateGameCommandController, templateGameDefinition };