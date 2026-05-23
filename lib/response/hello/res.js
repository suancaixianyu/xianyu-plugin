import { useMessage, Text } from 'alemonjs';

var res = async () => {
    const [message] = useMessage();
    await message.send(format(Text("你好")));
};

export { res as default };
