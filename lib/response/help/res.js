import { renderComponentToBuffer } from 'jsxp';
import { useMessage, Image, Text } from 'alemonjs';
import App from '../../image/conponent/help.js';

var res = async () => {
    const [message] = useMessage();
    const img = await renderComponentToBuffer("/help", App, {
        data: "AlemonJS 跨平台开发框架",
    });
    if (typeof img !== "boolean") {
        await message.send(format(Image(img)));
        return;
    }
    await message.send(format(Text("图片加载失败")));
};

export { res as default };
