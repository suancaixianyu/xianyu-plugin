import { useMessage, Text } from 'alemonjs';
import { gamePools } from '../../../api/gamePools.js';
import { gameSession } from '../../../api/gameSession.js';
import { MINESWEEPER_GAME } from '../../../api/games/minesweeper.js';
import '../../../api/games/points24.js';
import '../../../api/games/sokoban.js';
import '../../../api/games/chineseChess.js';
import '../../../api/games/gobang.js';
import '../../../api/games/animalChess.js';
import { unbindMinesweeperSession } from '../../../api/gameAgents.js';

var res = async (event) => {
    const [message] = useMessage();
    const game = gamePools.getGame(event, MINESWEEPER_GAME);
    if (game) {
        gamePools.removeGame(event, MINESWEEPER_GAME);
        gameSession.deactivate(event, MINESWEEPER_GAME);
        // 同步清理 AI 接管作用域，避免 AI 继续操作已经不存在的对局。
        unbindMinesweeperSession(event.guid);
        await message.send(format(Text("已结束游戏")));
        return;
    }
    await message.send(format(Text("没有正在进行的游戏")));
};

export { res as default };
