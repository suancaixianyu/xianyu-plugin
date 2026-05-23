import { gameRegistry } from "../gameRegistry";
import type { GameCommandController, GameDefinition, ScopedEvent } from "../type";

export const MINESWEEPER_GAME = "minesweeper" as const;

const compactCommandPattern =
  /^(翻开|扫雷翻开|扫镭翻开|标记|扫雷标记|扫镭标记|取消标记|扫雷取消标记|扫镭取消标记)\s*([a-zA-Z]\d+(?:\s+[a-zA-Z]\d+)*)$/;

const rewriteMap: Record<string, string> = {
  翻开: "扫雷翻开",
  标记: "扫雷标记",
  取消标记: "扫雷取消标记",
};

const minesweeperCommandController: GameCommandController = {
  game: MINESWEEPER_GAME,
  rewriteCommand(event: ScopedEvent) {
    const text = String(event.MessageText ?? "").trim().replace(/^(?:[!！/#＃]\s*)/, "");
    const match = text.match(compactCommandPattern);

    if (!match) {
      return null;
    }

    const [, command, coords] = match;
    const rewritten = rewriteMap[command];
    if (!rewritten) {
      return null;
    }

    return `${rewritten} ${coords}`;
  },
};

export const minesweeperGameDefinition: GameDefinition = {
  game: MINESWEEPER_GAME,
  controller: minesweeperCommandController,
  compactRoutes: [
    {
      pattern:
        /^(?:[!！/#＃]\s*)?(扫雷翻开|扫镭翻开|扫雷标记|扫镭标记|扫雷取消标记|扫镭取消标记)\s*([a-zA-Z]\d+(?:\s+[a-zA-Z]\d+)*)$/,
      importer: () => import("@src/response/minesweeper/compact/res"),
    },
  ],
  routes: [
    {
      aliases: ["扫雷", "扫镭", "扫雷难度", "扫镭难度"],
      importer: () => import("@src/response/minesweeper/start/res"),
    },
    {
      aliases: ["扫雷帮助", "扫镭帮助", "扫雷 帮助", "扫镭 帮助", "扫雷说明", "扫镭说明"],
      importer: () => import("@src/response/minesweeper/help/res"),
    },
    {
      aliases: ["扫雷翻开", "扫镭翻开", "扫雷 翻开", "扫镭 翻开"],
      importer: () => import("@src/response/minesweeper/open/res"),
    },
    {
      aliases: [
        "扫雷标记",
        "扫镭标记",
        "扫雷 标记",
        "扫镭 标记",
        "扫雷取消标记",
        "扫镭取消标记",
        "扫雷 取消标记",
        "扫镭 取消标记",
      ],
      importer: () => import("@src/response/minesweeper/mark/res"),
    },
    {
      aliases: ["结束扫雷", "关闭扫雷", "退出扫雷", "结束扫镭", "关闭扫镭", "退出扫镭"],
      importer: () => import("@src/response/minesweeper/exit/res"),
    },
  ],
};

gameRegistry.register(minesweeperGameDefinition);
