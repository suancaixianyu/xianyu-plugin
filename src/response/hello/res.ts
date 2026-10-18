import { Text, useMessage } from "alemonjs";

export default async (event) => {
  const [message] = useMessage(event);
  await message.send(format(Text("你好")));
};
