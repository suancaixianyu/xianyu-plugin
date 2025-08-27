import { useMessage, Text } from 'alemonjs';

const selects = onSelects(["message.create", "private.message.create"]);
const regular = /^(\/|#)?hello$/;
var res = onResponse(selects, (event) => {
    // 创建
    const [message] = useMessage(event);
    // 发送消息
    message.send(format(Text("hello Word")));
});

export { res as default, regular, selects };
