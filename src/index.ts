import { Router, defineChildren, logger } from "alemonjs";
import "@src/api/games";
import { gameRegistry } from "@src/api";
import { xianyuGameExpose } from "@src/api/gameAgents";

const events = [
  "message.create",
  "private.message.create",
  "interaction.create",
  "private.interaction.create",
] as const;

const router = Router.create({ events: [...events] });

router.res(
  {
    events: [...events],
  },
  () => import("./response/session/res")
);

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

const registerAliases = (paths: string[], importer: () => Promise<unknown>) => {
  for (const path of paths) {
    appGroup.use(path, importer);
  }
};

for (const compactRoute of gameRegistry.getCompactRoutes()) {
  router.res(
    {
      events: [...events],
      regular: compactRoute.pattern,
    },
    compactRoute.importer
  );
}

registerAliases(["你好"], () => import("./response/hello/res"));
registerAliases(
  ["帮助", "菜单", "指令", "咸鱼帮助", "xianyu帮助", "xy帮助", "咸鱼菜单", "插件帮助"],
  () => import("./response/help/res")
);
registerAliases(
  ["xy设置AI对手", "xianyu设置AI对手", "咸鱼设置AI对手"],
  () => import("./response/game-agent/res")
);

for (const route of gameRegistry.getRoutes()) {
  registerAliases(route.aliases, route.importer);
}

export default defineChildren({
  register() {
    return {
      responseRouter: router.define,
      expose: xianyuGameExpose,
    };
  },
  onCreated() {
    logger.info("\u54B8\u9C7C\u63D2\u4EF6\u542F\u52A8");
  },
});
