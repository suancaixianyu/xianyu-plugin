import { Text, useMessage } from "alemonjs";
import { gamePools, gameSession } from "@src/api";
import { POINTS24_GAME } from "@src/api/games/points24";

export default async (event) => {
  const [message] = useMessage();
  const game = gamePools.getGame(event, POINTS24_GAME);

  if (!game) {
    await message.send(format(Text("当前没有进行中的24点游戏。")));
    return;
  }

  gamePools.removeGame(event, POINTS24_GAME);
  gameSession.deactivate(event, POINTS24_GAME);
  await message.send(format(Text("24点游戏已结束。")));
};
