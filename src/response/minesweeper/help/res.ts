import { renderComponentIsHtmlToBuffer } from "jsxp";
import { Text, useMessage, Image } from "alemonjs";
import Help from "@src/image/conponent/minesweeper/help";

export default async (event) => {
  const [message] = useMessage(event);
  const img = await renderComponentIsHtmlToBuffer(Help, {});

  if (typeof img != "boolean") {
    await message.send(format(Image(img)));
    return;
  } else {
    await message.send(format(Text("扫雷帮助图加载失败")));
  }
};
