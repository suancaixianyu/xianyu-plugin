import { Text, useMessage } from "alemonjs";
import { sokobanLevelCount } from "@src/api/games/sokoban";

export default async () => {
  const [message] = useMessage();

  await message.send(
    format(
      Text(
        [
          "推箱子指令：",
          "推箱子 / 推箱子1：开始指定关卡",
          "移动 wasd：按方向移动，可一次输入多步",
          "wasd：游戏激活后可直接发送方向",
          "撤回：撤回一步",
          "推箱子关卡列表：查看内置关卡",
          "结束推箱子：结束当前游戏",
          `当前已迁移旧版内置关卡 ${sokobanLevelCount} 关。`,
        ].join("\n")
      )
    )
  );
};
