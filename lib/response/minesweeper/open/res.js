import { renderComponentToBuffer } from 'jsxp';
import { useMessage, Text, Image } from 'alemonjs';
import { gamePools } from '../../../api/gamePools.js';
import { gameSession } from '../../../api/gameSession.js';
import { MINESWEEPER_GAME } from '../../../api/games/minesweeper.js';
import '../../../api/games/points24.js';
import '../../../api/games/sokoban.js';
import '../../../api/games/chineseChess.js';
import { timeDiff } from '../../../api/lib.js';
import App from '../../../image/conponent/minesweeper/map.js';

const findInput = (event) => {
    const routeArgs = event.__route?.parsedArgs?.join(" ") ?? "";
    const source = routeArgs || event.MessageText || "";
    return source.match(/[a-zA-Z][0-9]+/g);
};
var res = async (event) => {
    const [message] = useMessage(event);
    const game = gamePools.getGame(event, MINESWEEPER_GAME);
    if (!game) {
        await message.send(format(Text("请先开始游戏：/扫雷")));
        return;
    }
    if (game.state != "playing") {
        return;
    }
    const input = findInput(event);
    if (!input) {
        await message.send(format(Text("输入错误，请查看 /扫雷帮助")));
        return;
    }
    const open = (game, x, y) => {
        game.select = { x, y };
        if (game.map[`${x}-${y}`].isMine) {
            game.state = "lose";
            return;
        }
        if (game.map[`${x}-${y}`].isOpen) {
            return;
        }
        game.map[`${x}-${y}`].isOpen = true;
        if (game.map[`${x}-${y}`].value != 0) {
            return;
        }
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx == 0 && dy == 0) {
                    continue;
                }
                if (game.map[`${x + dx}-${y + dy}`]) {
                    open(game, x + dx, y + dy);
                }
            }
        }
    };
    for (const v of input) {
        // 将输入转换为坐标，a0 => 0-0,A0 => 0-0
        const [a] = v.toUpperCase();
        const x = a.charCodeAt(0) - 65;
        const y = parseInt(v.slice(1));
        if (!game.map[`${x}-${y}`] || game.map[`${x}-${y}`].isOpen) {
            continue;
        }
        open(game, x, y);
    }
    // 自动标记
    for (const key in game.map) {
        const [x, y] = key.split("-").map(Number);
        const neighbors = [
            `${x - 1}-${y - 1}`,
            `${x - 1}-${y}`,
            `${x - 1}-${y + 1}`,
            `${x}-${y - 1}`,
            `${x}-${y + 1}`,
            `${x + 1}-${y - 1}`,
            `${x + 1}-${y}`,
            `${x + 1}-${y + 1}`,
        ];
        // 只处理已翻开的格子
        if (!game.map[key].isOpen) {
            continue;
        }
        // 获取周围8个位置
        const unopened = [];
        for (const n of neighbors) {
            const cell = game.map[n];
            if (!cell)
                continue;
            if (!cell.isOpen) {
                unopened.push(n);
                if (cell.isMine)
                    ;
            }
        }
        // 如果有未翻开的格子
        if (unopened.length > 0) {
            // 如果所有未翻开的格子都是雷，则全部标记
            const allMines = unopened.every((n) => game.map[n].isMine);
            if (allMines) {
                for (const n of unopened) {
                    game.map[n].isFlag = true;
                }
            }
        }
    }
    // 判断是否胜利,除了雷的格子都已经打开
    let win = true;
    for (const key in game.map) {
        if (!game.map[key].isMine && !game.map[key].isOpen) {
            win = false;
            break;
        }
    }
    if (win) {
        game.state = "win";
    }
    game.time = timeDiff(game.startTime, Date.now());
    if (game.state !== "playing") {
        gameSession.deactivate(event, MINESWEEPER_GAME);
    }
    else {
        gameSession.activate(event, MINESWEEPER_GAME);
    }
    const img = await renderComponentToBuffer("minesweeper", App, { game });
    if (typeof img != "boolean") {
        await message.send(format(Image(img)));
    }
    else {
        await message.send(format(Text("图片加载失败")));
    }
};

export { res as default };
