import { useMessage, Text } from 'alemonjs';
import { gamePools } from '../../../api/gamePools.js';
import { gameSession } from '../../../api/gameSession.js';
import { MINESWEEPER_GAME } from '../../../api/games/minesweeper.js';
import '../../../api/games/points24.js';

var res = async (event) => {
    const [message] = useMessage();
    const game = gamePools.getGame(event, MINESWEEPER_GAME);
    if (game) {
        gamePools.removeGame(event, MINESWEEPER_GAME);
        gameSession.deactivate(event, MINESWEEPER_GAME);
        await message.send(format(Text("已结束游戏")));
        return;
    }
    await message.send(format(Text("没有正在进行的游戏")));
};

export { res as default };
