import { renderComponentToBuffer } from 'jsxp';
import { useMessage, Image, Text } from 'alemonjs';
import { gamePools } from '../../../api/gamePools.js';
import { gameSession } from '../../../api/gameSession.js';
import { MINESWEEPER_GAME } from '../../../api/games/minesweeper.js';
import '../../../api/games/points24.js';
import '../../../api/games/sokoban.js';
import '../../../api/games/chineseChess.js';
import '../../../api/games/gobang.js';
import '../../../api/games/animalChess.js';
import { gameLevels } from '../../../api/map.js';
import { timeDiff } from '../../../api/lib.js';
import App from '../../../image/conponent/minesweeper/map.js';
import { bindMinesweeperSession } from '../../../api/gameAgents.js';

const findLevel = (event) => {
    const routeArgs = event.__route?.parsedArgs?.join(" ") ?? "";
    const source = `${event.MessageText ?? ""} ${routeArgs}`;
    return source.match(/(简单|中等|困难)/)?.[0] || "简单";
};
var res = async (event) => {
    const [message] = useMessage();
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
    const level = findLevel(event);
    const newgame = newGame(level);
    gamePools.saveGame(event, MINESWEEPER_GAME, newgame);
    gameSession.activate(event, MINESWEEPER_GAME);
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
function newGame(level) {
    const { row, col, mine } = gameLevels[level];
    const map = {};
    const getName = (i, j) => String.fromCharCode(65 + i) + j;
    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            map[`${i}-${j}`] = {
                isMine: false,
                value: 0,
                isOpen: false,
                isFlag: false,
                name: getName(i, j),
            };
        }
    }
    for (let i = 0; i < mine; i++) {
        let x = Math.floor(Math.random() * row);
        let y = Math.floor(Math.random() * col);
        if (map[`${x}-${y}`].isMine) {
            i--;
            continue;
        }
        map[`${x}-${y}`].isMine = true;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx == 0 && dy == 0) {
                    continue;
                }
                if (map[`${x + dx}-${y + dy}`]) {
                    map[`${x + dx}-${y + dy}`].value++;
                }
            }
        }
    }
    return {
        row,
        col,
        mine,
        map,
        remain: mine,
        state: "playing",
        time: 0,
        startTime: Date.now(),
        select: { x: -1, y: -1 },
    };
}

export { res as default, newGame };
