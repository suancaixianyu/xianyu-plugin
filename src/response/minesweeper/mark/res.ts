import { renderComponentToBuffer } from "jsxp";
import { Text, useMessage, Image } from "alemonjs";
import { Game, gamePools, timeDiff } from "../../../api";
import GamaeMap from "@src/image/conponent/minesweeper/map";

export const name = "扫雷_标记";
export const regular = /^(#|\/)?(扫雷|扫镭)?(取消)?标记/;
export const selects = onSelects(["message.create", "private.message.create"]);

export default onResponse(selects, async (e) => {
  const [message] = useMessage(e);
  // 创建一个send

  const game = gamePools.getGame(e.ChannelId);

  if (!game) {
    message.send(format(Text("请先开始游戏: /扫镭")));

    return;
  }

  if (game.state != "playing") {
    return;
  }

  const input = e.MessageText.match(/[a-zA-z][0-9]+/g);
  if (!input) {
    message.send(format(Text("输入错误，请查看 /扫镭帮助")));

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
    const [a] = v.toUpperCase();
    const x = a.charCodeAt(0) - 65;
    const y = parseInt(v.slice(1));

    if (!game.map[`${x}-${y}`] || game.map[`${x}-${y}`].isOpen) {
      continue;
    }

    mark(game, x, y);
  }

  // 设置剩余雷数
  game.remain =
    game.mine - Object.values(game.map).filter((v) => v.isFlag).length;

  game.time = timeDiff(game.startTime, Date.now());
  const img = await renderComponentToBuffer("minesweeper", GamaeMap, { game });
  if (typeof img != "boolean") {
    message.send(format(Image(img)));
  } else {
    message.send(format(Text("图片加载失败")));
  }
});
