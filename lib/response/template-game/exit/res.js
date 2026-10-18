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

var res = async (event) => {
    const [message] = useMessage(event);
    const state = gamePools.getGame(event, TEMPLATE_GAME);
    if (!state) {
        await message.send(format(Text("当前没有进行中的示例游戏")));
        return;
    }
    state.status = "finished";
    gamePools.removeGame(event, TEMPLATE_GAME);
    gameSession.deactivate(event, TEMPLATE_GAME);
    await message.send(format(Text("示例游戏已结束")));
};

export { res as default };
