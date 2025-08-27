import { renderComponentToBuffer } from "jsxp";
import { Text, useMessage, Image } from "alemonjs";
import Help from "@src/image/conponent/minesweeper/help";

export const name = "扫雷_帮助";
export const selects = onSelects(["message.create", "private.message.create"]);
export const regular = /^(\/|#)?(扫雷|扫镭)(help|帮助) ?$/;

export default onResponse(selects, async (e) => {
  const [message] = useMessage(e);
  const img = await renderComponentToBuffer("minesweeperHelp", Help, {});

  if (typeof img != "boolean") {
    message.send(format(Image(img)));
  } else {
    message.send(format(Text("图片加载失败")));
  }
});
