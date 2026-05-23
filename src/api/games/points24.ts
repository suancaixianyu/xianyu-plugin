import { gameRegistry } from "../gameRegistry";
import type { GameCommandController, GameDefinition, ScopedEvent } from "../type";

export const POINTS24_GAME = "points24" as const;

const answerCommandPattern = /^(解|答|答题|=)\s*(.+)$/i;
const explicitAnswerPattern = /^(?:[!！/#＃]\s*)?(24点解|24点答|24点答题)\s+(.+)$/i;

const createRewriteCommand = (command: string, expression: string) => {
  if (command === "=") {
    return `24点解 ${expression}`;
  }

  return `24点${command} ${expression}`;
};

export const points24CommandController: GameCommandController = {
  game: POINTS24_GAME,
  rewriteCommand(event: ScopedEvent) {
    const text = String(event.MessageText ?? "").trim().replace(/^(?:[!！/#＃]\s*)/, "");
    const match = text.match(answerCommandPattern);

    if (!match) {
      return null;
    }

    const [, command, expression] = match;
    return createRewriteCommand(command, expression.trim());
  },
};

export const points24GameDefinition: GameDefinition = {
  game: POINTS24_GAME,
  controller: points24CommandController,
  compactRoutes: [
    {
      pattern: explicitAnswerPattern,
      importer: () => import("@src/response/points24/answer/res"),
    },
  ],
  routes: [
    {
      aliases: ["开始24点", "24点", "二十四点"],
      importer: () => import("@src/response/points24/start/res"),
    },
    {
      aliases: ["结束24点", "退出24点", "关闭24点"],
      importer: () => import("@src/response/points24/exit/res"),
    },
    {
      aliases: ["24点帮助", "二十四点帮助", "24点说明"],
      importer: () => import("@src/response/points24/help/res"),
    },
    {
      aliases: ["24点解", "24点答", "24点答题"],
      importer: () => import("@src/response/points24/answer/res"),
    },
  ],
};

gameRegistry.register(points24GameDefinition);
