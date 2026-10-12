import { renderComponentIsHtmlToBuffer } from 'jsxp';
import { useMessage, Image, Text } from 'alemonjs';
import App from '../../image/conponent/help.js';

var res = async () => {
    const [message] = useMessage();
    const img = await renderComponentIsHtmlToBuffer(App, {});
    if (typeof img !== "boolean") {
        await message.send(format(Image(img)));
        return;
    }
    await message.send(format(Text("图片加载失败")));
};

export { res as default };
