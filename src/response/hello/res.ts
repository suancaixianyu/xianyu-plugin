import { Text, useMessage } from "alemonjs";

export default async () => {
  const [message] = useMessage();
  await message.send(format(Text("你好")));
};
