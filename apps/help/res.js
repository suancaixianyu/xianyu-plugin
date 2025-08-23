import { useSend, Image, Text } from 'alemonjs';
import { Pictures } from '../../image/index.js';

var res = OnResponse(async (event, next) => {
    if (!/^(\/|#)?(xianyu|xy|咸鱼)(帮助|help| -h)$/.test(event.MessageText)) {
        next();
        return;
    }
    // 创建一个send
    const Send = useSend(event);
    // pic
    const img = await Pictures("help", {
        data: "AlemonJS 跨平台开发框架",
    });
    // send
    if (typeof img != "boolean") {
        Send(Image(img));
    }
    else {
        Send(Text("图片加载失败"));
    }
}, "message.create");

export { res as default };
