import { renderComponentIsHtmlToBuffer } from 'jsxp';
import { useMessage, Image, Text } from 'alemonjs';
import ChineseChessHelp from '../../../image/conponent/chinese-chess/help.js';

var res = async () => {
    const [message] = useMessage();
    const img = await renderComponentIsHtmlToBuffer(ChineseChessHelp, {});
    if (typeof img !== "boolean") {
        await message.send(format(Image(img)));
        return;
    }
    await message.send(format(Text("中国象棋帮助图加载失败")));
};

export { res as default };
