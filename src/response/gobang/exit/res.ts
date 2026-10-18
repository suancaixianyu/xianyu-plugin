import { Text, useMessage } from "alemonjs";
import { boardRooms, gameSession } from "@src/api";
import { GOBANG_AGENT_USER_ID, GOBANG_AI_USER_ID, GOBANG_GAME, type GobangRoom } from "@src/api/games/gobang";
import { getEventUserId } from "../shared";

export default async (event) => {
  const [message] = useMessage(event);
  const userId = getEventUserId(event);
  const room = boardRooms.getRoom(event, GOBANG_GAME) as GobangRoom | undefined;

  if (!room) {
    await message.send(format(Text("没有正在进行的五子棋。")));
    return;
  }

  if (!room.players[userId]) {
    await message.send(format(Text("你还没加入五子棋，不能结束本局。")));
    return;
  }

  const loser = room.players[userId].team;
  const opponent = Object.values(room.players).find(
    (player) =>
      player.team !== loser &&
      player.userId !== GOBANG_AI_USER_ID &&
      player.userId !== GOBANG_AGENT_USER_ID
  );
  const winner =
    room.state.mode === "ai"
      ? "AI"
      : room.state.mode === "agent"
        ? room.players[GOBANG_AGENT_USER_ID]?.nickname || "Aichat"
        : opponent?.nickname || "对方";

  boardRooms.removeRoom(event, GOBANG_GAME);
  gameSession.deactivate(event, GOBANG_GAME);
  await message.send(format(Text(`五子棋已结束，${winner}获胜。`)));
};
