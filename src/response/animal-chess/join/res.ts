import { Text, useMessage } from "alemonjs";
import { boardRooms, gameSession } from "@src/api";
import {
  ANIMAL_CHESS_GAME,
  createAnimalChessRoom,
  type AnimalChessRoom,
  type AnimalChessTeam,
} from "@src/api/games/animalChess";
import {
  getEventNickname,
  getEventUserId,
  parseRequestedTeam,
  renderAnimalChessMessage,
} from "../shared";

const getNextTeam = (room: AnimalChessRoom, requested: AnimalChessTeam | null) => {
  const playerCount = Object.keys(room.players).length;

  if (playerCount === 0) return "红" as const;
  if (playerCount === 1) return "蓝" as const;
  return requested;
};

export default async (event) => {
  const [message] = useMessage();
  const userId = getEventUserId(event);
  const nickname = getEventNickname(event);
  const requestedTeam = parseRequestedTeam(event);
  const room = boardRooms.getRoom(event, ANIMAL_CHESS_GAME) ?? createAnimalChessRoom();

  if (room.players[userId]) {
    gameSession.activate(event, ANIMAL_CHESS_GAME);
    await message.send(format(Text(`你已加入斗兽棋，当前是${room.players[userId].team}队。`)));
    return;
  }

  const team = getNextTeam(room, requestedTeam);
  if (!team) {
    await message.send(format(Text("当前已有对局，请发送“加入斗兽棋红”或“加入斗兽棋蓝”加入队伍。")));
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

  boardRooms.saveRoom(event, ANIMAL_CHESS_GAME, room);
  gameSession.activate(event, ANIMAL_CHESS_GAME);

  if (room.status === "waiting") {
    await message.send(format(Text(`${nickname} 发起了斗兽棋，执红先手。其他玩家发送“加入斗兽棋”。`)));
    return;
  }

  await message.send(await renderAnimalChessMessage(room, `${nickname} 加入斗兽棋，加入${team}队。`));
};
