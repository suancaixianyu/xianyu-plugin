import { Text, useMessage } from "alemonjs";

export default async () => {
  const [message] = useMessage();

  await message.send(
    format(
      Text(
        [
          "旧版关卡制作工具：",
          "https://suancaixianyu.cn/MapEditor.html",
          "新版暂未接入自定义关卡保存，当前先保留工具入口。",
        ].join("\n")
      )
    )
  );
};
