import { useMessage, Text } from 'alemonjs';
import { gamePools } from '../../../api/gamePools.js';
import { gameSession } from '../../../api/gameSession.js';
import '../../../api/games/minesweeper.js';
import '../../../api/games/points24.js';
import { SOKOBAN_GAME, createSokobanGame, sokobanLevelCount } from '../../../api/games/sokoban.js';
import '../../../api/games/chineseChess.js';
import '../../../api/games/gobang.js';
import '../../../api/games/animalChess.js';
import { bindSingleGameSession } from '../../../api/gameToolActions.js';
import { renderSokobanMessage, parseSokobanLevelNumber } from '../shared.js';

var res = async (event) => {
    const [message] = useMessage();
    const current = gamePools.getGame(event, SOKOBAN_GAME);
    if (current?.status === "playing") {
        bindSingleGameSession(event.guid, SOKOBAN_GAME, event);
        gameSession.activate(event, SOKOBAN_GAME);
        await message.send(await renderSokobanMessage(current, "当前已有推箱子游戏进行中"));
        return;
    }
    const levelNumber = parseSokobanLevelNumber(event);
    const levelIndex = levelNumber - 1;
    const game = createSokobanGame(levelIndex);
    if (!game) {
        await message.send(format(Text(`没有第 ${levelNumber} 关，目前共有 ${sokobanLevelCount} 关。`)));
        return;
    }
    gamePools.saveGame(event, SOKOBAN_GAME, game);
    bindSingleGameSession(event.guid, SOKOBAN_GAME, event);
    gameSession.activate(event, SOKOBAN_GAME);
    await message.send(await renderSokobanMessage(game, `推箱子开始：第 ${levelNumber} 关`));
};

export { res as default };
