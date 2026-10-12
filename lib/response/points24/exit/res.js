import { useMessage, Text } from 'alemonjs';
import { gamePools } from '../../../api/gamePools.js';
import { gameSession } from '../../../api/gameSession.js';
import '../../../api/games/minesweeper.js';
import { POINTS24_GAME } from '../../../api/games/points24.js';
import '../../../api/games/sokoban.js';
import '../../../api/games/chineseChess.js';
import '../../../api/games/gobang.js';
import '../../../api/games/animalChess.js';
import { unbindSingleGameSession } from '../../../api/gameToolActions.js';

var res = async (event) => {
    const [message] = useMessage();
    const game = gamePools.getGame(event, POINTS24_GAME);
    if (!game) {
        await message.send(format(Text("当前没有进行中的24点游戏。")));
        return;
    }
    gamePools.removeGame(event, POINTS24_GAME);
    unbindSingleGameSession(event.guid, POINTS24_GAME);
    gameSession.deactivate(event, POINTS24_GAME);
    await message.send(format(Text("24点游戏已结束。")));
};

export { res as default };
