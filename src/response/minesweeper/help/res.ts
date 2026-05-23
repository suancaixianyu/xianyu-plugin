import { renderComponentToBuffer } from "jsxp";
import { Text, useMessage, Image } from "alemonjs";
import Help from "@src/image/conponent/minesweeper/help";

export default async () => {
  const [message] = useMessage();
  const img = await renderComponentToBuffer("minesweeperHelp", Help, {});

  if (typeof img != "boolean") {
    await message.send(format(Image(img)));
  } else {
    await message.send(format(Text("图片加载失败")));
  }
};
