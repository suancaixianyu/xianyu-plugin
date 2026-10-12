import { renderComponentIsHtmlToBuffer } from 'jsxp';
import { useMessage, Image, Text } from 'alemonjs';
import SokobanHelp from '../../../image/conponent/sokoban/help.js';

var res = async () => {
    const [message] = useMessage();
    const img = await renderComponentIsHtmlToBuffer(SokobanHelp, {});
    if (typeof img !== "boolean") {
        await message.send(format(Image(img)));
        return;
    }
    await message.send(format(Text("推箱子帮助图加载失败")));
};

export { res as default };
