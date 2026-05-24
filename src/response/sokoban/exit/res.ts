import { Text, useMessage } from "alemonjs";
import { gamePools, gameSession } from "@src/api";
import { SOKOBAN_GAME, type SokobanGameState } from "@src/api/games/sokoban";

export default async (event) => {
  const [message] = useMessage();
  const game = gamePools.getGame<SokobanGameState>(event, SOKOBAN_GAME);

  if (game) {
    gamePools.removeGame(event, SOKOBAN_GAME);
    gameSession.deactivate(event, SOKOBAN_GAME);
    await message.send(format(Text("推箱子游戏已结束")));
    return;
  }

  await message.send(format(Text("没有正在进行的推箱子游戏")));
};
