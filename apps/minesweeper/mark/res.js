import { Pictures } from '../../../image/index.js';
import { useSend, Text, Image } from 'alemonjs';
import { gamePools } from '../api/gamePools.js';
import { timeDiff } from '../api/lib.js';

const name = "扫雷_标记";
const regular = /^(#|\/)?(扫雷|扫镭)?(取消)?标记/;
var res = OnResponse(async (e, next) => {
    // 创建一个send
    const Send = useSend(e);
    const game = gamePools.getGame(e.ChannelId);
    if (!game) {
        Send(Text("请先开始游戏: /扫镭"));
        next();
        return;
    }
    if (game.state != "playing") {
        next();
        return;
    }
    const input = e.MessageText.match(/[a-zA-z][0-9]+/g);
    if (!input) {
        Send(Text("输入错误，请查看 /扫镭帮助"));
        next();
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
    const img = await Pictures("minesweeper", { game });
    if (typeof img != "boolean") {
        Send(Image(img));
    }
    else {
        Send(Text("图片加载失败"));
    }
    next();
}, "message.create");

export { res as default, name, regular };
