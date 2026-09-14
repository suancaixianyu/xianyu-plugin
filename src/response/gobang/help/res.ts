import { renderComponentIsHtmlToBuffer } from "jsxp";
import { Image, Text, useMessage } from "alemonjs";
import Help from "@src/image/conponent/gobang/help";

export default async () => {
  const [message] = useMessage();
  const img = await renderComponentIsHtmlToBuffer(Help, {});

  if (typeof img !== "boolean") {
    await message.send(format(Image(img)));
    return;
  }

  await message.send(format(Text("五子棋帮助图加载失败")));
};
