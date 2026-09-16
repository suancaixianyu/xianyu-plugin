import { renderComponentToBuffer } from "jsxp";
import { Text, useMessage, Image } from "alemonjs";
import {
  Game,
  MINESWEEPER_GAME,
  createMinesweeperGame,
  gamePools,
  gameSession,
  timeDiff,
} from "../../../api";
import GameMap from "@src/image/conponent/minesweeper/map";
import { bindMinesweeperSession } from "@src/api/gameAgents";

const getDifficulty = (event: {
  __route?: { parsedArgs?: string[] };
  MessageText?: string;
}) => {
  const routeArgs = event.__route?.parsedArgs?.join(" ") ?? "";
  const source = `${event.MessageText ?? ""} ${routeArgs}`;
  return source.match(/(简单|中等|困难)/)?.[0] || "简单";
};

export default async (event) => {
  const [message] = useMessage();
  // 获取游戏，如果游戏的状态不是playing，那么就是结束了，可以开始新的游戏
  const game = gamePools.getGame<Game>(event, MINESWEEPER_GAME);
  if (game && game.state != "playing") {
    gamePools.removeGame(event, MINESWEEPER_GAME);
    gameSession.deactivate(event, MINESWEEPER_GAME);
  } else if (game && game.state == "playing") {
    bindMinesweeperSession(event.guid, event);
    game.time = timeDiff(game.startTime, Date.now());
    gameSession.activate(event, MINESWEEPER_GAME);
    const img = await renderComponentToBuffer("minesweeper", GameMap, {
      game: game,
    });
    if (typeof img != "boolean") {
      await message.send(format(Image(img)));
    } else {
      await message.send(format(Text("图片加载失败")));
    }
    return;
  }

  const level = getDifficulty(event);
  const newgame = createMinesweeperGame(level as "简单" | "中等" | "困难");
  gamePools.saveGame(event, MINESWEEPER_GAME, newgame);
  gameSession.activate(event, MINESWEEPER_GAME);
  // 作用域绑定放在开局之后：此时 gamePools 已经写入该会话的对局。
  bindMinesweeperSession(event.guid, event);
  const img = await renderComponentToBuffer("minesweeper", GameMap, {
    game: newgame,
  });
  if (typeof img != "boolean") {
    await message.send(format(Image(img)));
  } else {
    await message.send(format(Text("图片加载失败")));
  }
};
