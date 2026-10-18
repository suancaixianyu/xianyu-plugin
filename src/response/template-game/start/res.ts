import { Text, useMessage } from "alemonjs";
import { gamePools, gameSession } from "@src/api";
import { TEMPLATE_GAME, type TemplateGameState } from "@src/api/games/template";

const createTemplateState = (): TemplateGameState => ({
  step: 0,
  startedAt: Date.now(),
  lastInput: null,
  status: "playing",
});

export default async (event) => {
  const [message] = useMessage(event);
  const current = gamePools.getGame<TemplateGameState>(event, TEMPLATE_GAME);

  if (current?.status === "playing") {
    gameSession.activate(event, TEMPLATE_GAME);
    await message.send(format(Text(`示例游戏进行中，当前已操作 ${current.step} 次`)));
    return;
  }

  const state = createTemplateState();
  gamePools.saveGame(event, TEMPLATE_GAME, state);
  gameSession.activate(event, TEMPLATE_GAME);
  await message.send(format(Text("示例游戏已开始，发送“操作 任何内容”体验会话接管。")));
};
