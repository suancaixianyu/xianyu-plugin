import { Text, useMessage } from "alemonjs";
import { gamePools } from "../../../api";

export const name = "扫雷_结束";
export const regular = /^(#|\/)?(结束|关闭|退出)(扫雷|扫镭) ?$/;
export const selects = onSelects(["message.create"]);

export default onResponse(selects, async (e) => {
  const [message] = useMessage(e);
  // 创建一个send

  const game = gamePools.getGame(e.ChannelId);

  if (game) {
    gamePools.removeGame(e.ChannelId);
    message.send(format(Text("已结束游戏")));

    return;
  }

  message.send(format(Text("没有正在进行的游戏")));
});
