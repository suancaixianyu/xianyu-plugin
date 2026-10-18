import { Text, useMessage } from "alemonjs";
import { boardRooms, gameSession } from "@src/api";
import { createGobangRoom, GOBANG_GAME, type GobangRoom, type GobangTeam } from "@src/api/games/gobang";
import { getEventNickname, getEventUserId, renderGobangMessage } from "../shared";

const isJoinCommand = (event) => /加入/.test(String(event.MessageText ?? ""));

const getNextTeam = (room: GobangRoom): GobangTeam | null => {
  const used = new Set(Object.values(room.players).map((player) => player.team));

  if (!used.has("黑")) return "黑";
  if (!used.has("白")) return "白";
  return null;
};

export default async (event) => {
  const [message] = useMessage(event);
  const userId = getEventUserId(event);
  const nickname = getEventNickname(event);
  let room = boardRooms.getRoom(event, GOBANG_GAME) as GobangRoom | undefined;

  if (!room) {
    room = createGobangRoom("versus");
  }

  if (room.state.mode !== "versus") {
    await message.send(format(Text("当前是人机五子棋，请先结束后再发起双人对战。")));
    return;
  }

  if (room.players[userId]) {
    gameSession.activate(event, GOBANG_GAME);
    await message.send(format(Text(`你已加入五子棋，当前是${room.players[userId].team}棋。`)));
    return;
  }

  const team = getNextTeam(room);
  if (!team) {
    await message.send(format(Text("当前五子棋已有两位玩家。")));
    return;
  }

  room.players[userId] = {
    userId,
    nickname,
    team,
    meta: { symbol: team === "黑" ? "X" : "O" },
  };

  if (Object.keys(room.players).length >= 2) {
    room.status = "playing";
  }

  boardRooms.saveRoom(event, GOBANG_GAME, room);
  gameSession.activate(event, GOBANG_GAME);

  if (room.status === "waiting") {
    const verb = isJoinCommand(event) ? "加入" : "发起";
    await message.send(format(Text(`${nickname} ${verb}了五子棋，执黑先手。其他玩家发送“加入五子棋”。`)));
    return;
  }

  await message.send(await renderGobangMessage(room, `${nickname} 加入五子棋，执${team}棋。`));
};
