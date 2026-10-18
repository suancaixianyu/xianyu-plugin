import { useMessage, Text } from 'alemonjs';
import { boardRooms } from '../../../api/boardRooms.js';
import { gameSession } from '../../../api/gameSession.js';
import '../../../api/games/minesweeper.js';
import '../../../api/games/points24.js';
import '../../../api/games/sokoban.js';
import '../../../api/games/chineseChess.js';
import { GOBANG_GAME, GOBANG_AI_USER_ID, GOBANG_AGENT_USER_ID } from '../../../api/games/gobang.js';
import '../../../api/games/animalChess.js';
import { getEventUserId } from '../shared.js';

var res = async (event) => {
    const [message] = useMessage(event);
    const userId = getEventUserId(event);
    const room = boardRooms.getRoom(event, GOBANG_GAME);
    if (!room) {
        await message.send(format(Text("没有正在进行的五子棋。")));
        return;
    }
    if (!room.players[userId]) {
        await message.send(format(Text("你还没加入五子棋，不能结束本局。")));
        return;
    }
    const loser = room.players[userId].team;
    const opponent = Object.values(room.players).find((player) => player.team !== loser &&
        player.userId !== GOBANG_AI_USER_ID &&
        player.userId !== GOBANG_AGENT_USER_ID);
    const winner = room.state.mode === "ai"
        ? "AI"
        : room.state.mode === "agent"
            ? room.players[GOBANG_AGENT_USER_ID]?.nickname || "Aichat"
            : opponent?.nickname || "对方";
    boardRooms.removeRoom(event, GOBANG_GAME);
    gameSession.deactivate(event, GOBANG_GAME);
    await message.send(format(Text(`五子棋已结束，${winner}获胜。`)));
};

export { res as default };
