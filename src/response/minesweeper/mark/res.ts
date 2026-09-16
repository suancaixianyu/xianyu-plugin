import { renderComponentIsHtmlToBuffer } from "jsxp";
import { Text, useMessage, Image } from "alemonjs";
import {
  Game,
  MINESWEEPER_GAME,
  gamePools,
  gameSession,
  markMinesweeperCells,
  timeDiff,
} from "../../../api";
import GamaeMap from "@src/image/conponent/minesweeper/map";
import { bindMinesweeperSession } from "@src/api/gameAgents";

const findInput = (event: {
  __route?: { parsedArgs?: string[] };
  MessageText?: string;
}) => {
  const routeArgs = event.__route?.parsedArgs?.join(" ") ?? "";
  const source = routeArgs || event.MessageText || "";
  return source.match(/[a-zA-Z][0-9]+/g);
};

const isCancelMark = (event: {
  __route?: { key?: string };
  MessageText?: string;
}) => {
  return Boolean(
    event.__route?.key?.includes("取消标记") ||
    event.MessageText?.includes("取消"),
  );
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

  markMinesweeperCells(game, input, !isCancelMark(event));

  game.time = timeDiff(game.startTime, Date.now());
  gameSession.activate(event, MINESWEEPER_GAME);
  // 玩家在哪个会话操作，AI 接管作用域就跟随到哪个会话。
  bindMinesweeperSession(event.guid, event);
  const img = await renderComponentIsHtmlToBuffer(GamaeMap, { game });
  if (typeof img != "boolean") {
    await message.send(format(Image(img)));
  } else {
    await message.send(format(Text("图片加载失败")));
  }
};
