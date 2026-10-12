import { useMessage, Text } from 'alemonjs';
import { gamePools } from '../../../api/gamePools.js';
import { gameSession } from '../../../api/gameSession.js';
import '../../../api/games/minesweeper.js';
import { POINTS24_GAME, createPoints24Game } from '../../../api/games/points24.js';
import '../../../api/games/sokoban.js';
import '../../../api/games/chineseChess.js';
import '../../../api/games/gobang.js';
import '../../../api/games/animalChess.js';
import { bindSingleGameSession } from '../../../api/gameToolActions.js';

var res = async (event) => {
    const [message] = useMessage();
    const current = gamePools.getGame(event, POINTS24_GAME);
    if (current?.status === "playing") {
        bindSingleGameSession(event.guid, POINTS24_GAME, event);
        gameSession.activate(event, POINTS24_GAME);
        await message.send(format(Text(`当前已有24点游戏进行中，抽取的牌是：${current.title}`)));
        return;
    }
    const game = createPoints24Game();
    gamePools.saveGame(event, POINTS24_GAME, game);
    bindSingleGameSession(event.guid, POINTS24_GAME, event);
    gameSession.activate(event, POINTS24_GAME);
    await message.send(format(Text(`24点游戏开始！你抽取的牌是：\n${game.title}\n请使用“24点解 表达式”作答，开始后也可以直接发送“解 表达式”。`)));
};

export { res as default };
