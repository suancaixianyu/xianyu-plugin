import { useMessage, Text } from 'alemonjs';
import { gamePools } from '../../../api/gamePools.js';
import { gameSession } from '../../../api/gameSession.js';
import '../../../api/games/minesweeper.js';
import '../../../api/games/points24.js';
import { SOKOBAN_GAME } from '../../../api/games/sokoban.js';
import '../../../api/games/chineseChess.js';
import '../../../api/games/gobang.js';
import '../../../api/games/animalChess.js';
import { unbindSingleGameSession } from '../../../api/gameToolActions.js';

var res = async (event) => {
    const [message] = useMessage();
    const game = gamePools.getGame(event, SOKOBAN_GAME);
    if (game) {
        gamePools.removeGame(event, SOKOBAN_GAME);
        unbindSingleGameSession(event.guid, SOKOBAN_GAME);
        gameSession.deactivate(event, SOKOBAN_GAME);
        await message.send(format(Text("推箱子游戏已结束")));
        return;
    }
    await message.send(format(Text("没有正在进行的推箱子游戏")));
};

export { res as default };
