import type { GameCommandController, GameDefinition, ScopedEvent } from "../type";

// Scaffold only: this file is a copy template for future games and is not auto-registered.
export const TEMPLATE_GAME = "template-game" as const;

const templateCompactCommandPattern =
  /^(操作|示例操作|结束操作|示例结束操作)\s*(.+)?$/;

const templateRewriteMap: Record<string, string> = {
  操作: "示例操作",
  结束操作: "示例结束操作",
};

export interface TemplateGameState {
  step: number;
  startedAt: number;
  lastInput: string | null;
  status: "idle" | "playing" | "finished";
}

export const templateGameCommandController: GameCommandController = {
  game: TEMPLATE_GAME,
  rewriteCommand(event: ScopedEvent) {
    const text = String(event.MessageText ?? "").trim().replace(/^(?:[!！/#＃]\s*)/, "");
    const match = text.match(templateCompactCommandPattern);

    if (!match) {
      return null;
    }

    const [, command, rest = ""] = match;
    const rewritten = templateRewriteMap[command];
    if (!rewritten) {
      return null;
    }

    return `${rewritten} ${rest}`.trim();
  },
};

// Usage:
// 1. Copy this file to a new game file, then rename game id and command words.
// 2. Copy src/response/template-game to src/response/<your-game>.
// 3. Register the new file with `import "./<your-game>"` in src/api/games/index.ts.
export const templateGameDefinition: GameDefinition = {
  game: TEMPLATE_GAME,
  controller: templateGameCommandController,
  compactRoutes: [
    {
      pattern: /^(?:[!！/#＃]\s*)?(示例操作|示例结束操作)\s*(.+)?$/,
      importer: () => import("@src/response/template-game/compact/res"),
    },
  ],
  routes: [
    {
      aliases: ["示例游戏", "模板游戏"],
      importer: () => import("@src/response/template-game/start/res"),
    },
    {
      aliases: ["示例游戏帮助", "模板游戏帮助", "示例说明"],
      importer: () => import("@src/response/template-game/help/res"),
    },
    {
      aliases: ["示例操作", "模板操作"],
      importer: () => import("@src/response/template-game/action/res"),
    },
    {
      aliases: ["退出示例游戏", "结束示例游戏", "关闭示例游戏"],
      importer: () => import("@src/response/template-game/exit/res"),
    },
  ],
};
