import { Text, useSend } from "alemonjs";
import { gamePools } from "../api";
export const name = "扫雷_结束";
export const regular = /^(#|\/)?(结束|关闭|退出)(扫雷|扫镭) ?$/;

export default OnResponse(async (e, next) => {
  // 创建一个send
  const Send = useSend(e);
  const game = gamePools.getGame(e.ChannelId);

  if (game) {
    gamePools.removeGame(e.ChannelId);
    Send(Text("已结束游戏"));
    next();
    return;
  }

  Send(Text("没有正在进行的游戏"));
  next();
}, "message.create");
