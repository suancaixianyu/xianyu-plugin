import { renderComponentToBuffer } from 'jsxp';
import { useMessage, Text, Image } from 'alemonjs';
import { gamePools } from '../api/gamePools.js';
import { timeDiff } from '../api/lib.js';
import App from '../../../image/conponent/minesweeper/map.js';

const name = "扫雷_标记";
const regular = /^(#|\/)?(扫雷|扫镭)?(取消)?标记/;
const selects = onSelects(["message.create"]);
var res = onResponse(selects, async (e) => {
    const [message] = useMessage(e);
    // 创建一个send
    const game = gamePools.getGame(e.ChannelId);
    if (!game) {
        message.send(format(Text("请先开始游戏: /扫镭")));
        return;
    }
    if (game.state != "playing") {
        return;
    }
    const input = e.MessageText.match(/[a-zA-z][0-9]+/g);
    if (!input) {
        message.send(format(Text("输入错误，请查看 /扫镭帮助")));
        return;
    }
    const mark = (game, x, y) => {
        game.select = { x, y };
        if (e.MessageText.includes("取消")) {
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
    game.remain =
        game.mine - Object.values(game.map).filter((v) => v.isFlag).length;
    game.time = timeDiff(game.startTime, Date.now());
    const img = await renderComponentToBuffer("minesweeper", App, { game });
    if (typeof img != "boolean") {
        message.send(format(Image(img)));
    }
    else {
        message.send(format(Text("图片加载失败")));
    }
});

export { res as default, name, regular, selects };
