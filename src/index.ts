import { Router, defineChildren, logger } from "alemonjs";

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
    regular:
      /^(?:[!！/#＃]\s*)?(翻开|扫雷翻开|扫镭翻开|标记|扫雷标记|扫镭标记|取消标记|扫雷取消标记|扫镭取消标记)([a-zA-Z]\d+(?:\s+[a-zA-Z]\d+)*)$/,
  },
  () => import("./response/minesweeper/compact/res")
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

registerAliases(["你好"], () => import("./response/hello/res"));
registerAliases(["帮助", "菜单", "指令"], () => import("./response/help/res"));

registerAliases(["扫雷", "扫镭", "扫雷难度", "扫镭难度"], () =>
  import("./response/minesweeper/start/res")
);

registerAliases(
  ["扫雷帮助", "扫镭帮助", "扫雷 帮助", "扫镭 帮助", "扫雷说明", "扫镭说明"],
  () => import("./response/minesweeper/help/res")
);

registerAliases(["翻开", "扫雷翻开", "扫镭翻开", "扫雷 翻开", "扫镭 翻开"], () =>
  import("./response/minesweeper/open/res")
);

registerAliases(
  [
    "标记",
    "扫雷标记",
    "扫镭标记",
    "扫雷 标记",
    "扫镭 标记",
    "取消标记",
    "扫雷取消标记",
    "扫镭取消标记",
    "扫雷 取消标记",
    "扫镭 取消标记",
  ],
  () => import("./response/minesweeper/mark/res")
);

registerAliases(
  ["结束扫雷", "关闭扫雷", "退出扫雷", "结束扫镭", "关闭扫镭", "退出扫镭"],
  () => import("./response/minesweeper/exit/res")
);

export default defineChildren({
  register() {
    return {
      responseRouter: router.define,
    };
  },
  onCreated() {
    logger.info("\u54B8\u9C7C\u63D2\u4EF6\u542F\u52A8");
  },
});
