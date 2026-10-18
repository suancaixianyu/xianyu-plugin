import { Text, useMessage } from "alemonjs";
import { gamePools, gameSession } from "@src/api";
import { createPoints24Game, POINTS24_GAME, type Points24GameState } from "@src/api/games/points24";
import { bindSingleGameSession } from "@src/api/gameToolActions";

export default async (event) => {
  const [message] = useMessage(event);
  const current = gamePools.getGame<Points24GameState>(event, POINTS24_GAME);

  if (current?.status === "playing") {
    bindSingleGameSession(event.guid, POINTS24_GAME, event);
    gameSession.activate(event, POINTS24_GAME);
    await message.send(format(Text(`当前已有24点游戏进行中，抽取的牌是：${current.title}`)));
    return;
  }

  const game = createPoints24Game();
  gamePools.saveGame(event, POINTS24_GAME, game);
  bindSingleGameSession(event.guid, POINTS24_GAME, event);
  gameSession.activate(event, POINTS24_GAME);
  await message.send(
    format(
      Text(
        `24点游戏开始！你抽取的牌是：\n${game.title}\n请使用“24点解 表达式”作答，开始后也可以直接发送“解 表达式”。`
      )
    )
  );
};
