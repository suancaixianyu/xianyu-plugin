import { gameRegistry } from '../gameRegistry.js';

const POINTS24_GAME = "points24";
const createPoints24Game = () => {
    const deck = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
        .flatMap((value) => Array(4).fill(value));
    const cards = Array.from({ length: 4 }, () => deck.splice(Math.floor(Math.random() * deck.length), 1)[0]);
    return { cards, title: cards.join(" "), startTime: Date.now(), status: "playing" };
};
const evaluatePoints24Answer = (cards, raw) => {
    const expression = raw.replace(/×/g, "*").replace(/÷/g, "/")
        .replace(/﹢/g, "+").replace(/﹣/g, "-").replace(/\s+/g, "").toUpperCase();
    if (!expression || !/^(?:10|11|12|13|[1-9AJQK]|[()+*/-])+$/.test(expression)) {
        return { ok: false, error: "表达式包含不允许的字符" };
    }
    const values = { A: 1, J: 11, Q: 12, K: 13 };
    const numberOf = (card) => values[card] ?? Number(card);
    const tokens = expression.match(/10|11|12|13|[1-9AJQK]|[()+*/-]/g) ?? [];
    const used = tokens.filter((token) => /^(?:10|11|12|13|[1-9AJQK])$/.test(token));
    const remaining = cards.map(numberOf);
    for (const token of used) {
        const index = remaining.indexOf(numberOf(token));
        if (index < 0)
            return { ok: false, error: `使用了未抽取的牌：${token}` };
        remaining.splice(index, 1);
    }
    if (remaining.length)
        return { ok: false, error: "必须使用全部四张牌" };
    try {
        const numeric = tokens.map((token) => /^[AJQK]$/.test(token) ? String(numberOf(token)) : token).join(" ");
        const result = Function(`"use strict"; return (${numeric});`)();
        if (typeof result !== "number" || !Number.isFinite(result)) {
            return { ok: false, error: "表达式计算结果无效" };
        }
        return { ok: true, expression, result, solved: result === 24 };
    }
    catch {
        return { ok: false, error: "表达式有误" };
    }
};
const answerCommandPattern = /^(解|答|答题|=)\s*(.+)$/i;
const explicitAnswerPattern = /^(?:[!！/#＃]\s*)?(24点解|24点答|24点答题)\s+(.+)$/i;
const createRewriteCommand = (command, expression) => {
    if (command === "=") {
        return `24点解 ${expression}`;
    }
    return `24点${command} ${expression}`;
};
const points24CommandController = {
    game: POINTS24_GAME,
    rewriteCommand(event) {
        const text = String(event.MessageText ?? "").trim().replace(/^(?:[!！/#＃]\s*)/, "");
        const match = text.match(answerCommandPattern);
        if (!match) {
            return null;
        }
        const [, command, expression] = match;
        return createRewriteCommand(command, expression.trim());
    },
};
const points24GameDefinition = {
    game: POINTS24_GAME,
    controller: points24CommandController,
    compactRoutes: [
        {
            pattern: explicitAnswerPattern,
            importer: () => import('../../response/points24/answer/res.js'),
        },
    ],
    routes: [
        {
            aliases: ["开始24点", "24点", "二十四点"],
            importer: () => import('../../response/points24/start/res.js'),
        },
        {
            aliases: ["结束24点", "退出24点", "关闭24点"],
            importer: () => import('../../response/points24/exit/res.js'),
        },
        {
            aliases: ["24点帮助", "二十四点帮助", "24点说明"],
            importer: () => import('../../response/points24/help/res.js'),
        },
        {
            aliases: ["24点解", "24点答", "24点答题"],
            importer: () => import('../../response/points24/answer/res.js'),
        },
    ],
};
gameRegistry.register(points24GameDefinition);

export { POINTS24_GAME, createPoints24Game, evaluatePoints24Answer, points24CommandController, points24GameDefinition };
