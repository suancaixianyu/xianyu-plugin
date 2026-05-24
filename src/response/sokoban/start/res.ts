import { Text, useMessage } from "alemonjs";
import { gamePools, gameSession } from "@src/api";
import {
  createSokobanGame,
  SOKOBAN_GAME,
  sokobanLevelCount,
  type SokobanGameState,
} from "@src/api/games/sokoban";
import { parseSokobanLevelNumber, renderSokobanMessage } from "../shared";

export default async (event) => {
  const [message] = useMessage();
  const current = gamePools.getGame<SokobanGameState>(event, SOKOBAN_GAME);

  if (current?.status === "playing") {
    gameSession.activate(event, SOKOBAN_GAME);
    await message.send(await renderSokobanMessage(current, "当前已有推箱子游戏进行中"));
    return;
  }

  const levelNumber = parseSokobanLevelNumber(event);
  const levelIndex = levelNumber - 1;
  const game = createSokobanGame(levelIndex);

  if (!game) {
    await message.send(format(Text(`没有第 ${levelNumber} 关，目前共有 ${sokobanLevelCount} 关。`)));
    return;
  }

  gamePools.saveGame(event, SOKOBAN_GAME, game);
  gameSession.activate(event, SOKOBAN_GAME);
  await message.send(await renderSokobanMessage(game, `推箱子开始：第 ${levelNumber} 关`));
};
