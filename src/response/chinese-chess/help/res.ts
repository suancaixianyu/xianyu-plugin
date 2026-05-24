import { Text, useMessage } from "alemonjs";

export default async () => {
  const [message] = useMessage();

  await message.send(
    format(
      Text(
        [
          "中国象棋指令：",
          "发起中国象棋：创建房间，默认执红",
          "加入中国象棋：第二位玩家加入并执黑",
          "加入中国象棋红/黑：加入指定阵营",
          "移子 A1 A2：坐标移子，行 A-J，列 1-9",
          "兵一进一 / 車一平二 / 前兵进一：中文棋谱指令",
          "结束中国象棋：认输并结束本局",
          "当前已完成多人房间、坐标移子和中文棋谱 parser 的第一版迁移。",
        ].join("\n")
      )
    )
  );
};
