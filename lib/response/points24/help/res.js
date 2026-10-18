import { renderComponentIsHtmlToBuffer } from 'jsxp';
import { useMessage, Image, Text } from 'alemonjs';
import Points24Help from '../../../image/conponent/points24/help.js';

var res = async (event) => {
    const [message] = useMessage(event);
    const img = await renderComponentIsHtmlToBuffer(Points24Help, {});
    if (typeof img !== "boolean") {
        await message.send(format(Image(img)));
        return;
    }
    await message.send(format(Text("24点帮助图加载失败")));
};

export { res as default };
