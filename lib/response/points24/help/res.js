import { useMessage, Text } from 'alemonjs';

var res = async () => {
    const [message] = useMessage();
    await message.send(format(Text("24点命令：/开始24点、/24点解 表达式、/结束24点。开始后也可以直接发送“解 表达式”或“答 表达式”。")));
};

export { res as default };
