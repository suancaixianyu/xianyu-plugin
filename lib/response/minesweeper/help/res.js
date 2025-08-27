import { renderComponentToBuffer } from 'jsxp';
import { useMessage, Image, Text } from 'alemonjs';
import App from '../../../image/conponent/minesweeper/help.js';

const name = "扫雷_帮助";
const selects = onSelects(["message.create", "private.message.create"]);
const regular = /^(\/|#)?(扫雷|扫镭)(help|帮助) ?$/;
var res = onResponse(selects, async (e) => {
    const [message] = useMessage(e);
    const img = await renderComponentToBuffer("minesweeperHelp", App, {});
    if (typeof img != "boolean") {
        message.send(format(Image(img)));
    }
    else {
        message.send(format(Text("图片加载失败")));
    }
});

export { res as default, name, regular, selects };
