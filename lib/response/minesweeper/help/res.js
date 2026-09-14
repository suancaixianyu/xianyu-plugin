import { renderComponentIsHtmlToBuffer } from 'jsxp';
import { useMessage, Image, Text } from 'alemonjs';
import MinesweeperHelp from '../../../image/conponent/minesweeper/help.js';

var res = async () => {
    const [message] = useMessage();
    const img = await renderComponentIsHtmlToBuffer(MinesweeperHelp, {});
    if (typeof img != "boolean") {
        await message.send(format(Image(img)));
        return;
    }
    else {
        await message.send(format(Text("扫雷帮助图加载失败")));
    }
};

export { res as default };
