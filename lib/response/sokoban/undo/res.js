import { useMessage, Text } from 'alemonjs';
import { gamePools } from '../../../api/gamePools.js';
import { gameSession } from '../../../api/gameSession.js';
import '../../../api/games/minesweeper.js';
import '../../../api/games/points24.js';
import { SOKOBAN_GAME, undoSokoban } from '../../../api/games/sokoban.js';
import '../../../api/games/chineseChess.js';
import '../../../api/games/gobang.js';
import '../../../api/games/animalChess.js';
import { renderSokobanMessage } from '../shared.js';

var res = async (event, next) => {
    const [message] = useMessage(event);
    const game = gamePools.getGame(event, SOKOBAN_GAME);
    if (!game) {
        if (typeof next === "function") {
            await next();
        }
        return;
    }
    if (!undoSokoban(game)) {
        gameSession.activate(event, SOKOBAN_GAME);
        await message.send(format(Text("已经是初始状态，不能继续撤回。")));
        return;
    }
    gamePools.saveGame(event, SOKOBAN_GAME, game);
    gameSession.activate(event, SOKOBAN_GAME);
    await message.send(await renderSokobanMessage(game, "已撤回一步"));
};

export { res as default };
