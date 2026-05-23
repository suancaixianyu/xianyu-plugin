import { Text, useMessage } from "alemonjs";
import { gamePools, gameSession } from "@src/api";
import { TEMPLATE_GAME, type TemplateGameState } from "@src/api/games/template";

export default async (event) => {
  const [message] = useMessage();
  const state = gamePools.getGame<TemplateGameState>(event, TEMPLATE_GAME);

  if (!state) {
    await message.send(format(Text("当前没有进行中的示例游戏")));
    return;
  }

  state.status = "finished";
  gamePools.removeGame(event, TEMPLATE_GAME);
  gameSession.deactivate(event, TEMPLATE_GAME);
  await message.send(format(Text("示例游戏已结束")));
};
