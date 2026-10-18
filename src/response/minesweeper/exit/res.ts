import { Text, useMessage } from "alemonjs";
import { Game, MINESWEEPER_GAME, gamePools, gameSession } from "../../../api";
import { unbindMinesweeperSession } from "@src/api/gameAgents";

export default async (event) => {
  const [message] = useMessage(event);
  const game = gamePools.getGame<Game>(event, MINESWEEPER_GAME);

  if (game) {
    gamePools.removeGame(event, MINESWEEPER_GAME);
    gameSession.deactivate(event, MINESWEEPER_GAME);
    // 同步清理 AI 接管作用域，避免 AI 继续操作已经不存在的对局。
    unbindMinesweeperSession(event.guid);
    await message.send(format(Text("已结束游戏")));
    return;
  }

  await message.send(format(Text("没有正在进行的游戏")));
};
