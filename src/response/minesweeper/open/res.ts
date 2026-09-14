import { renderComponentToBuffer } from "jsxp";
import { Text, useMessage, Image } from "alemonjs";
import {
  Game,
  MINESWEEPER_GAME,
  gamePools,
  gameSession,
  openMinesweeperCells,
  timeDiff,
} from "../../../api";
import GamaeMap from "@src/image/conponent/minesweeper/map";

const findInput = (event: {
  __route?: { parsedArgs?: string[] };
  MessageText?: string;
}) => {
  const routeArgs = event.__route?.parsedArgs?.join(" ") ?? "";
  const source = routeArgs || event.MessageText || "";
  return source.match(/[a-zA-Z][0-9]+/g);
};

export default async (event) => {
  const [message] = useMessage(event);
  const game = gamePools.getGame<Game>(event, MINESWEEPER_GAME);

  if (!game) {
    await message.send(format(Text("请先开始游戏：/扫雷")));
    return;
  }

  if (game.state != "playing") {
    return;
  }

  const input = findInput(event);
  if (!input) {
    await message.send(format(Text("输入错误，请查看 /扫雷帮助")));
    return;
  }

  openMinesweeperCells(game, input);

  game.time = timeDiff(game.startTime, Date.now());
  if (game.state !== "playing") {
    gameSession.deactivate(event, MINESWEEPER_GAME);
  } else {
    gameSession.activate(event, MINESWEEPER_GAME);
  }

  const img = await renderComponentToBuffer("minesweeper", GamaeMap, { game });
  if (typeof img != "boolean") {
    await message.send(format(Image(img)));
  } else {
    await message.send(format(Text("图片加载失败")));
  }
};
