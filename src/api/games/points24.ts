import { gameRegistry } from "../gameRegistry";
import type { GameCommandController, GameDefinition, ScopedEvent } from "../type";

export const POINTS24_GAME = "points24" as const;

export interface Points24GameState {
  cards: string[];
  title: string;
  startTime: number;
  status: "playing";
}

export const createPoints24Game = (): Points24GameState => {
  const deck = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
    .flatMap((value) => Array(4).fill(value) as string[]);
  const cards = Array.from({ length: 4 }, () => deck.splice(Math.floor(Math.random() * deck.length), 1)[0]);
  return { cards, title: cards.join(" "), startTime: Date.now(), status: "playing" };
};

export const evaluatePoints24Answer = (cards: string[], raw: string) => {
  const expression = raw.replace(/×/g, "*").replace(/÷/g, "/")
    .replace(/﹢/g, "+").replace(/﹣/g, "-").replace(/\s+/g, "").toUpperCase();
  if (!expression || !/^(?:10|11|12|13|[1-9AJQK]|[()+*/-])+$/.test(expression)) {
    return { ok: false, error: "表达式包含不允许的字符" };
  }
  const values = { A: 1, J: 11, Q: 12, K: 13 } as const;
  const numberOf = (card: string) => values[card as keyof typeof values] ?? Number(card);
  const tokens = expression.match(/10|11|12|13|[1-9AJQK]|[()+*/-]/g) ?? [];
  const used = tokens.filter((token) => /^(?:10|11|12|13|[1-9AJQK])$/.test(token));
  const remaining = cards.map(numberOf);
  for (const token of used) {
    const index = remaining.indexOf(numberOf(token));
    if (index < 0) return { ok: false, error: `使用了未抽取的牌：${token}` };
    remaining.splice(index, 1);
  }
  if (remaining.length) return { ok: false, error: "必须使用全部四张牌" };
  try {
    const numeric = tokens.map((token) => /^[AJQK]$/.test(token) ? String(numberOf(token)) : token).join(" ");
    const result = Function(`"use strict"; return (${numeric});`)();
    if (typeof result !== "number" || !Number.isFinite(result)) {
      return { ok: false, error: "表达式计算结果无效" };
    }
    return { ok: true, expression, result, solved: result === 24 };
  } catch {
    return { ok: false, error: "表达式有误" };
  }
};

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
