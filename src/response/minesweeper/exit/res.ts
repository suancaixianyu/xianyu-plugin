import { Text, useMessage } from "alemonjs";
import { Game, MINESWEEPER_GAME, gamePools, gameSession } from "../../../api";

export default async (event) => {
  const [message] = useMessage();
  const game = gamePools.getGame<Game>(event, MINESWEEPER_GAME);

  if (game) {
    gamePools.removeGame(event, MINESWEEPER_GAME);
    gameSession.deactivate(event, MINESWEEPER_GAME);
    await message.send(format(Text("已结束游戏")));
    return;
  }

  await message.send(format(Text("没有正在进行的游戏")));
};
