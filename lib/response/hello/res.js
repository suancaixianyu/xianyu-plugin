import { useMessage, Text } from 'alemonjs';

const selects = onSelects(["message.create"]);
const regular = /^(\/|#)?hello$/;
var res = onResponse(selects, (event) => {
    logger.info("有人触发hello指令");
    // 创建
    const [message] = useMessage(event);
    // 发送消息
    message.send(format(Text("hello Word")));
});

export { res as default, regular, selects };
