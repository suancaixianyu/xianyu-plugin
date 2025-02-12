import { Pictures } from "@src/image";
import { Text, useSend, Image } from "alemonjs";
import { Game, gamePools, timeDiff } from "../api";
export const name = "扫雷_标记";
export const regular = /^(#|\/)?(扫雷|扫镭)?(取消)?标记 ?([a-zA-z][0-9]+)+ ?$/;

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

  const mark = (game: Game, x: number, y: number) => {
    game.select = { x, y };
    if (e.MessageText.includes("取消")) {
      game.map[`${x}-${y}`].isFlag = false;
    } else {
      game.map[`${x}-${y}`].isFlag = true;
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

    mark(game, x, y);
  }

  // 设置剩余雷数
  game.remain =
    game.mine - Object.values(game.map).filter((v) => v.isFlag).length;

  game.time = timeDiff(game.startTime, Date.now());
  const img = await Pictures("minesweeper", { game });
  if (typeof img != "boolean") {
    Send(Image(img));
  } else {
    Send(Text("图片加载失败"));
  }

  next();
}, "message.create");
