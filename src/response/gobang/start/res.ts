import { useMessage } from "alemonjs";
import { boardRooms, gameSession } from "@src/api";
import {
  GOBANG_AGENT_USER_ID,
  GOBANG_AI_USER_ID,
  GOBANG_GAME,
  createGobangRoom,
  type GobangRoom,
} from "@src/api/games/gobang";
import { getGameHubStatus } from "@src/api/gameAgents";
import { getEventNickname, getEventUserId, renderGobangMessage } from "../shared";

export default async (event) => {
  const [message] = useMessage(event);
  const userId = getEventUserId(event);
  const nickname = getEventNickname(event);
  const current = boardRooms.getRoom(event, GOBANG_GAME) as GobangRoom | undefined;

  if (current?.status === "playing" || current?.status === "waiting") {
    gameSession.activate(event, GOBANG_GAME);
    await message.send(await renderGobangMessage(current, "当前已有五子棋对局进行中"));
    return;
  }

  const hubStatus = await getGameHubStatus(event.guid);
  const agent = hubStatus.agents.find(
    (entry) => entry.id === hubStatus.selectedOpponent && entry.ready && entry.games?.includes(GOBANG_GAME)
  );
  const room = createGobangRoom(agent ? "agent" : "ai");
  room.players[userId] = {
    userId,
    nickname,
    team: "黑",
    meta: { symbol: "X" },
  };
  const opponentId = agent ? GOBANG_AGENT_USER_ID : GOBANG_AI_USER_ID;
  room.players[opponentId] = {
    userId: opponentId,
    nickname: agent?.name || "AI",
    team: "白",
    meta: { symbol: "O" },
  };

  boardRooms.saveRoom(event, GOBANG_GAME, room);
  gameSession.activate(event, GOBANG_GAME);
  const title = agent
    ? `五子棋开始，${agent.name} 执白棋。它将通过默认工具读取棋局并落子。黑棋先手，发送“落子 横坐标 纵坐标”，例如“落子 8 8”。`
    : "五子棋开始，人机对战，黑棋先手。发送“落子 横坐标 纵坐标”，例如“落子 8 8”。";
  await message.send(await renderGobangMessage(room, title));
};
