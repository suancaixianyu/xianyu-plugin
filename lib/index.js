import { gameRegistry } from "./api/gameRegistry.js";
import "./api/games/index.js";
import "./api/index.js";
import { xianyuGameExpose } from "./api/gameAgents.js";
import { Router, defineChildren, logger } from "alemonjs";

//#region src/index.ts
const events = [
	"message.create",
	"private.message.create",
	"interaction.create",
	"private.interaction.create"
];
const router = Router.create({ events: [...events] });
router.res({ events: [...events] }, () => import("./response/session/res.js"));
const appGroup = router.group({
	routeText: {
		prefixes: ["/", "#"],
		stripPrefix: true,
		allowBare: true
	},
	fallback: {
		suggest: true,
		allowPrefixMatch: true
	}
});
const registerAliases = (paths, importer) => {
	for (const path of paths) appGroup.use(path, importer);
};
for (const compactRoute of gameRegistry.getCompactRoutes()) router.res({
	events: [...events],
	regular: compactRoute.pattern
}, compactRoute.importer);
registerAliases(["你好"], () => import("./response/hello/res.js"));
registerAliases([
	"帮助",
	"菜单",
	"指令",
	"咸鱼帮助",
	"xianyu帮助",
	"xy帮助",
	"咸鱼菜单",
	"插件帮助"
], () => import("./response/help/res.js"));
registerAliases([
	"xy设置AI对手",
	"xianyu设置AI对手",
	"咸鱼设置AI对手"
], () => import("./response/game-agent/res.js"));
for (const route of gameRegistry.getRoutes()) registerAliases(route.aliases, route.importer);
var src_default = defineChildren({
	register() {
		return {
			responseRouter: router.define,
			expose: xianyuGameExpose
		};
	},
	onCreated() {
		logger.info("咸鱼插件启动");
	}
});

//#endregion
export { src_default as default };