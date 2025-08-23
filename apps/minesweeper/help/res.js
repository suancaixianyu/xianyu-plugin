import { Pictures } from '../../../image/index.js';
import { useSend, Image, Text } from 'alemonjs';

var res = OnResponse(async (e, next) => {
    if (!/^(\/|#)?(扫雷|扫镭)(help|帮助) ?$/.test(e.MessageText)) {
        next();
        return;
    }
    // 创建一个send
    const Send = useSend(e);
    const img = await Pictures("minesweeperHelp", {});
    if (typeof img != "boolean") {
        Send(Image(img));
    }
    else {
        Send(Text("图片加载失败"));
    }
}, "message.create");

export { res as default };
