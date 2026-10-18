import { useMessage, Text } from 'alemonjs';
import { sokobanLevelCount } from '../../../api/games/sokoban.js';

var res = async (event) => {
    const [message] = useMessage(event);
    const levels = Array.from({ length: sokobanLevelCount }, (_, index) => {
        return `${index + 1}: 原版关卡`;
    });
    await message.send(format(Text(["推箱子关卡列表：", ...levels].join("\n"))));
};

export { res as default };
