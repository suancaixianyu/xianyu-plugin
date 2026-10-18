import { useMessage, Text } from 'alemonjs';
import { gamePools } from '../../../api/gamePools.js';
import { gameSession } from '../../../api/gameSession.js';
import '../../../api/games/minesweeper.js';
import '../../../api/games/points24.js';
import { SOKOBAN_GAME, moveSokoban, createSokobanGame, sokobanLevelCount } from '../../../api/games/sokoban.js';
import '../../../api/games/chineseChess.js';
import '../../../api/games/gobang.js';
import '../../../api/games/animalChess.js';
import { parseSokobanDirections, renderSokobanMessage } from '../shared.js';

var res = async (event) => {
    const [message] = useMessage(event);
    const game = gamePools.getGame(event, SOKOBAN_GAME);
    if (!game) {
        await message.send(format(Text("请先开始游戏：/推箱子")));
        return;
    }
    const directions = parseSokobanDirections(event);
    if (!directions) {
        await message.send(format(Text("请输入移动方向，例如：推箱子移动 wasd")));
        return;
    }
    const result = moveSokoban(game, directions);
    if (!result.moved) {
        gameSession.activate(event, SOKOBAN_GAME);
        await message.send(await renderSokobanMessage(game, "这一步没有移动成功"));
        return;
    }
    if (result.won) {
        const nextLevelIndex = game.levelIndex + 1;
        const nextGame = createSokobanGame(nextLevelIndex);
        if (nextGame) {
            gamePools.saveGame(event, SOKOBAN_GAME, nextGame);
            gameSession.activate(event, SOKOBAN_GAME);
            await message.send(await renderSokobanMessage(nextGame, `恭喜通过第 ${game.levelIndex + 1} 关，自动进入第 ${nextLevelIndex + 1} 关`));
            return;
        }
        gamePools.saveGame(event, SOKOBAN_GAME, game);
        gameSession.deactivate(event, SOKOBAN_GAME);
        await message.send(await renderSokobanMessage(game, `恭喜你通关了，已完成全部 ${sokobanLevelCount} 关！`));
        return;
    }
    gamePools.saveGame(event, SOKOBAN_GAME, game);
    gameSession.activate(event, SOKOBAN_GAME);
    await message.send(await renderSokobanMessage(game));
};

export { res as default };
