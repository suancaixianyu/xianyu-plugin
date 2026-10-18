import { useMessage, Text } from 'alemonjs';
import { boardRooms } from '../../../api/boardRooms.js';
import { gameSession } from '../../../api/gameSession.js';
import '../../../api/games/minesweeper.js';
import '../../../api/games/points24.js';
import '../../../api/games/sokoban.js';
import '../../../api/games/chineseChess.js';
import '../../../api/games/gobang.js';
import { ANIMAL_CHESS_GAME, opponentAnimalChessTeam } from '../../../api/games/animalChess.js';
import { getEventUserId } from '../shared.js';

var res = async (event) => {
    const [message] = useMessage(event);
    const userId = getEventUserId(event);
    const room = boardRooms.getRoom(event, ANIMAL_CHESS_GAME);
    if (!room) {
        await message.send(format(Text("没有正在进行的斗兽棋。")));
        return;
    }
    if (!room.players[userId]) {
        await message.send(format(Text("你还没加入斗兽棋，不能结束本局。")));
        return;
    }
    const loser = room.players[userId].team;
    const winner = opponentAnimalChessTeam(loser);
    boardRooms.removeRoom(event, ANIMAL_CHESS_GAME);
    gameSession.deactivate(event, ANIMAL_CHESS_GAME);
    await message.send(format(Text(`斗兽棋已结束，${winner}队获胜。`)));
};

export { res as default };
