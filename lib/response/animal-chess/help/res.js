import { renderComponentIsHtmlToBuffer } from 'jsxp';
import { useMessage, Image, Text } from 'alemonjs';
import AnimalChessHelp from '../../../image/conponent/animal-chess/help.js';

var res = async () => {
    const [message] = useMessage();
    const img = await renderComponentIsHtmlToBuffer(AnimalChessHelp, {});
    if (typeof img !== "boolean") {
        await message.send(format(Image(img)));
        return;
    }
    await message.send(format(Text("斗兽棋帮助图加载失败")));
};

export { res as default };
