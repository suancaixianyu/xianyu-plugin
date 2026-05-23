import { useMessage, Text } from 'alemonjs';
import { gamePools } from '../../../api/gamePools.js';

var res = async (event) => {
    const [message] = useMessage();
    const game = gamePools.getGame(event.ChannelId);
    if (game) {
        gamePools.removeGame(event.ChannelId);
        await message.send(format(Text("已结束游戏")));
        return;
    }
    await message.send(format(Text("没有正在进行的游戏")));
};

export { res as default };
