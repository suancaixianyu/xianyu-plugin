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

const createTemplateState = () => ({
    step: 0,
    startedAt: Date.now(),
    lastInput: null,
    status: "playing",
});
var res = async (event) => {
    const [message] = useMessage(event);
    const current = gamePools.getGame(event, TEMPLATE_GAME);
    if (current?.status === "playing") {
        gameSession.activate(event, TEMPLATE_GAME);
        await message.send(format(Text(`示例游戏进行中，当前已操作 ${current.step} 次`)));
        return;
    }
    const state = createTemplateState();
    gamePools.saveGame(event, TEMPLATE_GAME, state);
    gameSession.activate(event, TEMPLATE_GAME);
    await message.send(format(Text("示例游戏已开始，发送“操作 任何内容”体验会话接管。")));
};

export { res as default };
