import { renderComponentToBuffer } from "jsxp";
import { Text, Image, useMessage } from "alemonjs";
import Help from "@src/image/conponent/help";

export default async () => {
  const [message] = useMessage();
  const img = await renderComponentToBuffer("pluginHelp", Help, {});

  if (typeof img !== "boolean") {
    await message.send(format(Image(img)));
    return;
  }

  await message.send(format(Text("图片加载失败")));
};
