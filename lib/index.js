import { Router, defineChildren, logger } from 'alemonjs';
import './api/games/minesweeper.js';
import './api/games/points24.js';
import './api/games/sokoban.js';
import './api/games/chineseChess.js';
import { gameRegistry } from './api/gameRegistry.js';

const events = [
    "message.create",
    "private.message.create",
    "interaction.create",
    "private.interaction.create",
];
const router = Router.create({ events: [...events] });
router.res({
    events: [...events],
}, () => import('./response/session/res.js'));
const appGroup = router.group({
    routeText: {
        prefixes: ["/", "#"],
        stripPrefix: true,
        allowBare: true,
    },
    fallback: {
        suggest: true,
        allowPrefixMatch: true,
    },
});
const registerAliases = (paths, importer) => {
    for (const path of paths) {
        appGroup.use(path, importer);
    }
};
for (const compactRoute of gameRegistry.getCompactRoutes()) {
    router.res({
        events: [...events],
        regular: compactRoute.pattern,
    }, compactRoute.importer);
}
registerAliases(["你好"], () => import('./response/hello/res.js'));
registerAliases(["帮助", "菜单", "指令", "咸鱼帮助", "xianyu帮助", "xy帮助", "咸鱼菜单", "插件帮助"], () => import('./response/help/res.js'));
for (const route of gameRegistry.getRoutes()) {
    registerAliases(route.aliases, route.importer);
}
var index = defineChildren({
    register() {
        return {
            responseRouter: router.define,
        };
    },
    onCreated() {
        logger.info("\u54B8\u9C7C\u63D2\u4EF6\u542F\u52A8");
    },
});

export { index as default };
