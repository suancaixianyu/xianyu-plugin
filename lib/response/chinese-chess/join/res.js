import { useMessage, Text } from 'alemonjs';
import { boardRooms } from '../../../api/boardRooms.js';
import { gameSession } from '../../../api/gameSession.js';
import '../../../api/games/minesweeper.js';
import '../../../api/games/points24.js';
import '../../../api/games/sokoban.js';
import { CHINESE_CHESS_GAME } from '../../../api/games/chineseChess.js';
import '../../../api/games/gobang.js';
import '../../../api/games/animalChess.js';
import { createChineseChessRoom } from '../../../api/games/chineseChess/state.js';
import { getEventUserId, getEventNickname, parseRequestedTeam, renderChineseChessMessage } from '../shared.js';

const getNextTeam = (room, requested) => {
    const playerCount = Object.keys(room.players).length;
    if (playerCount === 0) {
        return "红";
    }
    if (playerCount === 1) {
        return "黑";
    }
    return requested;
};
var res = async (event) => {
    const [message] = useMessage();
    const userId = getEventUserId(event);
    const nickname = getEventNickname(event);
    const requestedTeam = parseRequestedTeam(event);
    const room = boardRooms.getRoom(event, CHINESE_CHESS_GAME) ?? createChineseChessRoom();
    if (room.players[userId]) {
        gameSession.activate(event, CHINESE_CHESS_GAME);
        await message.send(format(Text(`你已加入中国象棋，当前是${room.players[userId].team}方。`)));
        return;
    }
    const team = getNextTeam(room, requestedTeam);
    if (!team) {
        await message.send(format(Text("当前已有对局，请发送“加入中国象棋红”或“加入中国象棋黑”加入对应阵营。")));
        return;
    }
    room.players[userId] = {
        userId,
        nickname,
        team,
    };
    if (Object.keys(room.players).length >= 2) {
        room.status = "playing";
    }
    boardRooms.saveRoom(event, CHINESE_CHESS_GAME, room);
    gameSession.activate(event, CHINESE_CHESS_GAME);
    if (room.status === "waiting") {
        await message.send(format(Text(`${nickname} 发起了中国象棋，执红先手。其他玩家发送“加入中国象棋”开始。`)));
        return;
    }
    await message.send(await renderChineseChessMessage(room, `${nickname} 加入中国象棋，执${team}方。`));
};

export { res as default };
