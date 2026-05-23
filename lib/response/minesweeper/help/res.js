import { renderComponentToBuffer } from 'jsxp';
import { useMessage, Image, Text } from 'alemonjs';
import App from '../../../image/conponent/minesweeper/help.js';

var res = async () => {
    const [message] = useMessage();
    const img = await renderComponentToBuffer("minesweeperHelp", App, {});
    if (typeof img != "boolean") {
        await message.send(format(Image(img)));
    }
    else {
        await message.send(format(Text("图片加载失败")));
    }
};

export { res as default };
