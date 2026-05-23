import { renderComponentToBuffer } from "jsxp";
import { Text, useMessage, Image } from "alemonjs";
import { Game, gameLevels, timeDiff } from "../../../api";
import { gamePools } from "@src/api";
import GameMap from "@src/image/conponent/minesweeper/map";

const findLevel = (event: { __route?: { parsedArgs?: string[] }; MessageText?: string }) => {
  const routeArgs = event.__route?.parsedArgs?.join(" ") ?? "";
  const source = `${event.MessageText ?? ""} ${routeArgs}`;
  return source.match(/(简单|中等|困难)/)?.[0] || "简单";
};

export default async (event) => {
  const [message] = useMessage();
  // 获取游戏，如果游戏的状态不是playing，那么就是结束了，可以开始新的游戏
  const game = gamePools.getGame(event.ChannelId);
  if (game && game.state != "playing") {
    gamePools.removeGame(event.ChannelId);
  } else if (game && game.state == "playing") {
    game.time = timeDiff(game.startTime, Date.now());
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

  const level = findLevel(event);
  const newgame = newGame(level as "简单" | "中等" | "困难");
  const img = await renderComponentToBuffer("minesweeper", GameMap, {
    game: newgame,
  });
  if (typeof img != "boolean") {
    await message.send(format(Image(img)));
  } else {
    await message.send(format(Text("图片加载失败")));
  }

  gamePools.saveGame(event.ChannelId, newgame);
};

export function newGame(level: "简单" | "中等" | "困难") {
  const { row, col, mine } = gameLevels[level];
  const map = {};
  const getName = (i: number, j: number) => String.fromCharCode(65 + i) + j;

  for (let i = 0; i < row; i++) {
    for (let j = 0; j < col; j++) {
      map[`${i}-${j}`] = {
        isMine: false,
        value: 0,
        isOpen: false,
        isFlag: false,
        name: getName(i, j),
      };
    }
  }
  for (let i = 0; i < mine; i++) {
    let x = Math.floor(Math.random() * row);
    let y = Math.floor(Math.random() * col);
    if (map[`${x}-${y}`].isMine) {
      i--;
      continue;
    }
    map[`${x}-${y}`].isMine = true;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx == 0 && dy == 0) {
          continue;
        }
        if (map[`${x + dx}-${y + dy}`]) {
          map[`${x + dx}-${y + dy}`].value++;
        }
      }
    }
  }
  return {
    row,
    col,
    mine,
    map,
    remain: mine,
    state: "playing",
    time: 0,
    startTime: Date.now(),
    select: { x: -1, y: -1 },
  } as Game;
}
