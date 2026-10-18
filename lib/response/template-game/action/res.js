import { useMessage, Text } from 'alemonjs';
import { gamePools } from '../../../api/gamePools.js';
import { gameSession } from '../../../api/gameSession.js';
import '../../../api/games/minesweeper.js';
import '../../../api/games/points24.js';
import '../../../api/games/sokoban.js';
import '../../../api/games/chineseChess.js';
import '../../../api/games/gobang.js';
import '../../../api/games/animalChess.js';
import { TEMPLATE_GAME } from '../../../api/games/template.js';

const extractInput = (event) => {
    const routeArgs = event.__route?.parsedArgs?.join(" ")?.trim();
    if (routeArgs) {
        return routeArgs;
    }
    const messageText = String(event.MessageText ?? "")
        .replace(/^(?:[!！/#＃]\s*)?/, "")
        .replace(/^(?:示例操作|模板操作)\s*/, "")
        .trim();
    return messageText || "未提供内容";
};
var res = async (event) => {
    const [message] = useMessage(event);
    const state = gamePools.getGame(event, TEMPLATE_GAME);
    if (!state || state.status !== "playing") {
        await message.send(format(Text("请先开始示例游戏：/示例游戏")));
        return;
    }
    const input = extractInput(event);
    state.step += 1;
    state.lastInput = input;
    gameSession.activate(event, TEMPLATE_GAME);
    await message.send(format(Text(`示例游戏收到：${input}，当前第 ${state.step} 步`)));
};

export { res as default };
