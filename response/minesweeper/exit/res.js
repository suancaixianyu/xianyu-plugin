import { useMessage, Text } from 'alemonjs';
import { gamePools } from '../api/gamePools.js';

const name = "扫雷_结束";
const regular = /^(#|\/)?(结束|关闭|退出)(扫雷|扫镭) ?$/;
const selects = onSelects(["message.create"]);
var res = onResponse(selects, async (e) => {
    const [message] = useMessage(e);
    // 创建一个send
    const game = gamePools.getGame(e.ChannelId);
    if (game) {
        gamePools.removeGame(e.ChannelId);
        message.send(format(Text("已结束游戏")));
        return;
    }
    message.send(format(Text("没有正在进行的游戏")));
});

export { res as default, name, regular, selects };
