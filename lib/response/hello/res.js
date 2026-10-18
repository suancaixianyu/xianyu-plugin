import { useMessage, Text } from 'alemonjs';

var res = async (event) => {
    const [message] = useMessage(event);
    await message.send(format(Text("你好")));
};

export { res as default };
