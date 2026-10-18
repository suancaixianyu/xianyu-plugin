import { Text, useMessage } from "alemonjs";
import { boardRooms, gameSession } from "../../../api";
import { CHINESE_CHESS_GAME } from "../../../api/games/chineseChess";
import type { ChineseChessRoom } from "../../../api/games/chineseChess/state";
import { getEventUserId } from "../shared";

export default async (event) => {
  const [message] = useMessage(event);
  const userId = getEventUserId(event);
  const room = boardRooms.getRoom(event, CHINESE_CHESS_GAME) as ChineseChessRoom | undefined;

  if (!room) {
    await message.send(format(Text("没有正在进行的中国象棋。")));
    return;
  }

  if (!room.players[userId]) {
    await message.send(format(Text("你还没加入中国象棋，不能结束本局。")));
    return;
  }

  const loser = room.players[userId].team;
  const winner = loser === "红" ? "黑" : "红";
  boardRooms.removeRoom(event, CHINESE_CHESS_GAME);
  gameSession.deactivate(event, CHINESE_CHESS_GAME);
  await message.send(format(Text(`中国象棋已结束，${winner}方获胜。`)));
};
