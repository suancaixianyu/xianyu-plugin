import { Text, useMessage } from "alemonjs";
import { boardRooms, gameSession } from "@src/api";
import {
  ANIMAL_CHESS_GAME,
  opponentAnimalChessTeam,
  type AnimalChessRoom,
  type AnimalChessTeam,
} from "@src/api/games/animalChess";
import { getEventUserId } from "../shared";

export default async (event) => {
  const [message] = useMessage(event);
  const userId = getEventUserId(event);
  const room = boardRooms.getRoom(event, ANIMAL_CHESS_GAME) as AnimalChessRoom | undefined;

  if (!room) {
    await message.send(format(Text("没有正在进行的斗兽棋。")));
    return;
  }

  if (!room.players[userId]) {
    await message.send(format(Text("你还没加入斗兽棋，不能结束本局。")));
    return;
  }

  const loser = room.players[userId].team as AnimalChessTeam;
  const winner = opponentAnimalChessTeam(loser);
  boardRooms.removeRoom(event, ANIMAL_CHESS_GAME);
  gameSession.deactivate(event, ANIMAL_CHESS_GAME);
  await message.send(format(Text(`斗兽棋已结束，${winner}队获胜。`)));
};
