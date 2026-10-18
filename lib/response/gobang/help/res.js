import { renderComponentIsHtmlToBuffer } from 'jsxp';
import { useMessage, Image, Text } from 'alemonjs';
import GobangHelp from '../../../image/conponent/gobang/help.js';

var res = async (event) => {
    const [message] = useMessage(event);
    const img = await renderComponentIsHtmlToBuffer(GobangHelp, {});
    if (typeof img !== "boolean") {
        await message.send(format(Image(img)));
        return;
    }
    await message.send(format(Text("五子棋帮助图加载失败")));
};

export { res as default };
