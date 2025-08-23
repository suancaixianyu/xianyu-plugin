import { useSend, Text } from 'alemonjs';
import { gamePools } from '../api/gamePools.js';

const name = "扫雷_结束";
const regular = /^(#|\/)?(结束|关闭|退出)(扫雷|扫镭) ?$/;
var res = OnResponse(async (e, next) => {
    // 创建一个send
    const Send = useSend(e);
    const game = gamePools.getGame(e.ChannelId);
    if (game) {
        gamePools.removeGame(e.ChannelId);
        Send(Text("已结束游戏"));
        next();
        return;
    }
    Send(Text("没有正在进行的游戏"));
    next();
}, "message.create");

export { res as default, name, regular };
