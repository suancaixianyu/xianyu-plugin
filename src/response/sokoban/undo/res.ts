import { Text, useMessage } from "alemonjs";
import { gamePools, gameSession } from "@src/api";
import { SOKOBAN_GAME, undoSokoban, type SokobanGameState } from "@src/api/games/sokoban";
import { renderSokobanMessage } from "../shared";

export default async (event) => {
  const [message] = useMessage();
  const game = gamePools.getGame<SokobanGameState>(event, SOKOBAN_GAME);

  if (!game) {
    await message.send(format(Text("请先开始游戏：/推箱子")));
    return;
  }

  if (!undoSokoban(game)) {
    gameSession.activate(event, SOKOBAN_GAME);
    await message.send(format(Text("已经是初始状态，不能继续撤回。")));
    return;
  }

  gamePools.saveGame(event, SOKOBAN_GAME, game);
  gameSession.activate(event, SOKOBAN_GAME);
  await message.send(await renderSokobanMessage(game, "已撤回一步"));
};
