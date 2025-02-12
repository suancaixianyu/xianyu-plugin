import { Pictures } from "@src/image";
import { Text, useSend, Image } from "alemonjs";
import { Game, gamePools, timeDiff } from "../api";
export const name = "扫雷_翻开";
export const regular = /^(#|\/)?(扫雷|扫镭)?翻开 ?([a-zA-z][0-9]+)+ ?$/;

export default OnResponse(async (e, next) => {
  // 创建一个send
  const Send = useSend(e);
  const game = gamePools.getGame(e.ChannelId);

  if (!game) {
    Send(Text("请先开始游戏"));
    next();
    return;
  }

  if (game.state != "playing") {
    next();
    return;
  }

  const input = e.MessageText.match(/[a-zA-z][0-9]+/g);
  if (!input) {
    Send(Text("输入错误"));
    next();
    return;
  }

  const open = (game: Game, x: number, y: number) => {
    game.select = { x, y };
    if (game.map[`${x}-${y}`].isMine) {
      game.state = "lose";
      return;
    }
    if (game.map[`${x}-${y}`].isOpen) {
      return;
    }
    game.map[`${x}-${y}`].isOpen = true;
    if (game.map[`${x}-${y}`].value != 0) {
      return;
    }
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx == 0 && dy == 0) {
          continue;
        }
        if (game.map[`${x + dx}-${y + dy}`]) {
          open(game, x + dx, y + dy);
        }
      }
    }
  };

  for (const v of input) {
    // 将输入转换为坐标，a0 => 0-0,A0 => 0-0
    const [a, b] = v.toUpperCase();
    const x = a.charCodeAt(0) - 65;
    const y = parseInt(b);

    if (!game.map[`${x}-${y}`]) {
      Send(Text("输入错误"));
      next();
      return;
    }

    if (game.map[`${x}-${y}`].isOpen) {
      continue;
    }

    open(game, x, y);
  }

  // 判断是否胜利,除了雷的格子都已经打开
  let win = true;
  for (const key in game.map) {
    if (!game.map[key].isMine && !game.map[key].isOpen) {
      win = false;
      break;
    }
  }
  if (win) {
    game.state = "win";
  }

  game.time = timeDiff(game.startTime, Date.now());

  const img = await Pictures("minesweeper", { game });
  if (typeof img != "boolean") {
    Send(Image(img));
  } else {
    Send(Text("图片加载失败"));
  }

  next();
}, "message.create");
