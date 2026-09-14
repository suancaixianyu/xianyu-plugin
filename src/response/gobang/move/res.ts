import { Text, useMessage } from "alemonjs";
import { boardRooms, gameSession } from "@src/api";
import {
  checkGobangWin,
  chooseGobangAiMove,
  GOBANG_AGENT_USER_ID,
  GOBANG_AI_USER_ID,
  GOBANG_GAME,
  getGobangPlayerTeam,
  isGobangBoardFull,
  parseGobangMove,
  placeGobangMove,
  type GobangRoom,
} from "@src/api/games/gobang";
import { requestGobangAgentTurn } from "@src/api/gameAgents";
import { getEventUserId, getTeamUserId, renderGobangMessage } from "../shared";

const finishRoom = (event, room: GobangRoom, title: string) => {
  room.status = "finished";
  boardRooms.saveRoom(event, GOBANG_GAME, room);
  gameSession.deactivate(event, GOBANG_GAME);
  return renderGobangMessage(room, title);
};

export default async (event) => {
  const [message] = useMessage();
  const userId = getEventUserId(event);
  const room = boardRooms.getRoom(event, GOBANG_GAME) as GobangRoom | undefined;

  if (!room || room.status === "finished") {
    await message.send(format(Text("请先开始五子棋。")));
    return;
  }

  if (room.status === "waiting") {
    await message.send(format(Text("五子棋正在等待第二位玩家加入。")));
    return;
  }

  const team = getGobangPlayerTeam(room, userId);
  if (!team || userId === GOBANG_AI_USER_ID) {
    await message.send(format(Text("你还没加入五子棋，不能落子。")));
    return;
  }

  if (team !== room.state.current) {
    await message.send(format(Text(`当前不是你的回合，现在轮到${room.state.current}棋。`)));
    return;
  }

  const point = parseGobangMove(String(event.MessageText ?? ""));
  if (!point) {
    await message.send(format(Text("落子格式不正确，请按“横坐标 纵坐标”发送，例如“落子 8 8”。")));
    return;
  }

  if (room.state.board[point.row][point.col] !== "-") {
    await message.send(format(Text("此处已有棋子。")));
    return;
  }

  placeGobangMove(room, team, point);

  if (checkGobangWin(room.state.board, point)) {
    const winner = room.players[userId]?.nickname || `${team}棋`;
    await message.send(await finishRoom(event, room, `${winner} 获胜！`));
    return;
  }

  if (isGobangBoardFull(room.state.board)) {
    await message.send(await finishRoom(event, room, "棋盘已满，本局平局。"));
    return;
  }

  if (room.state.mode === "ai") {
    const aiPoint = chooseGobangAiMove(room);
    if (aiPoint) {
      placeGobangMove(room, "白", aiPoint);

      if (checkGobangWin(room.state.board, aiPoint)) {
        await message.send(await finishRoom(event, room, "AI 获胜。"));
        return;
      }
    }

    if (isGobangBoardFull(room.state.board)) {
      await message.send(await finishRoom(event, room, "棋盘已满，本局平局。"));
      return;
    }
  }

  if (room.state.mode === "agent") {
    const beforeMoveCount = room.state.moveCount;
    const result = await requestGobangAgentTurn(event.guid);
    const moved = room.state.moveCount > beforeMoveCount;
    if (!moved) {
      const fallbackPoint = chooseGobangAiMove(room);
      if (fallbackPoint) {
        placeGobangMove(room, "白", fallbackPoint);
      }
      const reason = result.ok ? "未调用游戏工具" : result.reason || "不可用";
      if (room.state.lastMove && checkGobangWin(room.state.board, room.state.lastMove)) {
        await message.send(await finishRoom(event, room, `Aichat 未完成落子（${reason}），本回合已由内置 AI 补位并获胜。`));
        return;
      }
    }

    if (isGobangBoardFull(room.state.board)) {
      await message.send(await finishRoom(event, room, "棋盘已满，本局平局。"));
      return;
    }

    if (room.status === "finished") {
      const winner = room.players[GOBANG_AGENT_USER_ID]?.nickname || "Aichat";
      await message.send(await finishRoom(event, room, `${winner} 获胜。`));
      return;
    }
  }

  boardRooms.saveRoom(event, GOBANG_GAME, room);
  gameSession.activate(event, GOBANG_GAME);

  const currentUserId = getTeamUserId(room, room.state.current);
  const currentName = currentUserId ? room.players[currentUserId]?.nickname : "";
  await message.send(await renderGobangMessage(room, currentName ? `轮到 ${currentName}。` : undefined));
};
