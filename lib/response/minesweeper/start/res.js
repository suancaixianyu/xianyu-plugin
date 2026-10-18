import { renderComponentToBuffer } from 'jsxp';
import { useMessage, Image, Text } from 'alemonjs';
import { gamePools } from '../../../api/gamePools.js';
import { gameSession } from '../../../api/gameSession.js';
import { MINESWEEPER_GAME, createMinesweeperGame } from '../../../api/games/minesweeper.js';
import '../../../api/games/points24.js';
import '../../../api/games/sokoban.js';
import '../../../api/games/chineseChess.js';
import '../../../api/games/gobang.js';
import '../../../api/games/animalChess.js';
import { timeDiff } from '../../../api/lib.js';
import App from '../../../image/conponent/minesweeper/map.js';
import { bindMinesweeperSession } from '../../../api/gameAgents.js';

const getDifficulty = (event) => {
    const routeArgs = event.__route?.parsedArgs?.join(" ") ?? "";
    const source = `${event.MessageText ?? ""} ${routeArgs}`;
    return source.match(/(简单|中等|困难)/)?.[0] || "简单";
};
var res = async (event) => {
    const [message] = useMessage(event);
    // 获取游戏，如果游戏的状态不是playing，那么就是结束了，可以开始新的游戏
    const game = gamePools.getGame(event, MINESWEEPER_GAME);
    if (game && game.state != "playing") {
        gamePools.removeGame(event, MINESWEEPER_GAME);
        gameSession.deactivate(event, MINESWEEPER_GAME);
    }
    else if (game && game.state == "playing") {
        bindMinesweeperSession(event.guid, event);
        game.time = timeDiff(game.startTime, Date.now());
        gameSession.activate(event, MINESWEEPER_GAME);
        const img = await renderComponentToBuffer("minesweeper", App, {
            game: game,
        });
        if (typeof img != "boolean") {
            await message.send(format(Image(img)));
        }
        else {
            await message.send(format(Text("图片加载失败")));
        }
        return;
    }
    const level = getDifficulty(event);
    const newgame = createMinesweeperGame(level);
    gamePools.saveGame(event, MINESWEEPER_GAME, newgame);
    gameSession.activate(event, MINESWEEPER_GAME);
    // 作用域绑定放在开局之后：此时 gamePools 已经写入该会话的对局。
    bindMinesweeperSession(event.guid, event);
    const img = await renderComponentToBuffer("minesweeper", App, {
        game: newgame,
    });
    if (typeof img != "boolean") {
        await message.send(format(Image(img)));
    }
    else {
        await message.send(format(Text("图片加载失败")));
    }
};

export { res as default };
