import { renderComponentIsHtmlToBuffer } from 'jsxp';
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
const isCancelMark = (event) => {
    return Boolean(event.__route?.key?.includes("取消标记") ||
        event.MessageText?.includes("取消"));
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
    const mark = (game, x, y) => {
        game.select = { x, y };
        if (isCancelMark(event)) {
            game.map[`${x}-${y}`].isFlag = false;
        }
        else {
            game.map[`${x}-${y}`].isFlag = true;
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
        mark(game, x, y);
    }
    // 设置剩余雷数
    const mapCells = Object.values(game.map);
    game.remain = game.mine - mapCells.filter((cell) => cell.isFlag).length;
    game.time = timeDiff(game.startTime, Date.now());
    gameSession.activate(event, MINESWEEPER_GAME);
    const img = await renderComponentIsHtmlToBuffer(App, { game });
    if (typeof img != "boolean") {
        await message.send(format(Image(img)));
    }
    else {
        await message.send(format(Text("图片加载失败")));
    }
};

export { res as default };
