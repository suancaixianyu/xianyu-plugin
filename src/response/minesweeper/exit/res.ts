import { Text, useMessage } from "alemonjs";
import { gamePools } from "../../../api";

export default async (event) => {
  const [message] = useMessage();
  const game = gamePools.getGame(event.ChannelId);

  if (game) {
    gamePools.removeGame(event.ChannelId);
    await message.send(format(Text("已结束游戏")));
    return;
  }

  await message.send(format(Text("没有正在进行的游戏")));
};
