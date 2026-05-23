import { gameRegistry } from '../gameRegistry.js';

const MINESWEEPER_GAME = "minesweeper";
const compactCommandPattern = /^(翻开|扫雷翻开|扫镭翻开|标记|扫雷标记|扫镭标记|取消标记|扫雷取消标记|扫镭取消标记)\s*([a-zA-Z]\d+(?:\s+[a-zA-Z]\d+)*)$/;
const rewriteMap = {
    翻开: "扫雷翻开",
    标记: "扫雷标记",
    取消标记: "扫雷取消标记",
};
const minesweeperCommandController = {
    game: MINESWEEPER_GAME,
    rewriteCommand(event) {
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
const minesweeperGameDefinition = {
    game: MINESWEEPER_GAME,
    controller: minesweeperCommandController,
    compactRoutes: [
        {
            pattern: /^(?:[!！/#＃]\s*)?(扫雷翻开|扫镭翻开|扫雷标记|扫镭标记|扫雷取消标记|扫镭取消标记)\s*([a-zA-Z]\d+(?:\s+[a-zA-Z]\d+)*)$/,
            importer: () => import('../../response/minesweeper/compact/res.js'),
        },
    ],
    routes: [
        {
            aliases: ["扫雷", "扫镭", "扫雷难度", "扫镭难度"],
            importer: () => import('../../response/minesweeper/start/res.js'),
        },
        {
            aliases: ["扫雷帮助", "扫镭帮助", "扫雷 帮助", "扫镭 帮助", "扫雷说明", "扫镭说明"],
            importer: () => import('../../response/minesweeper/help/res.js'),
        },
        {
            aliases: ["扫雷翻开", "扫镭翻开", "扫雷 翻开", "扫镭 翻开"],
            importer: () => import('../../response/minesweeper/open/res.js'),
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
            importer: () => import('../../response/minesweeper/mark/res.js'),
        },
        {
            aliases: ["结束扫雷", "关闭扫雷", "退出扫雷", "结束扫镭", "关闭扫镭", "退出扫镭"],
            importer: () => import('../../response/minesweeper/exit/res.js'),
        },
    ],
};
gameRegistry.register(minesweeperGameDefinition);

export { MINESWEEPER_GAME, minesweeperGameDefinition };
