import { Text, useMessage } from "alemonjs";
import { boardRooms, gameSession } from "../../../api";
import { CHINESE_CHESS_GAME } from "../../../api/games/chineseChess";
import { rollbackChineseChessMove } from "../../../api/games/chineseChess/rules";
import type { ChineseChessRoom, ChineseChessTeam } from "../../../api/games/chineseChess/state";
import { getEventUserId, renderChineseChessMessage } from "../shared";

const findTeamUserId = (room: ChineseChessRoom, team: ChineseChessTeam) => {
  return Object.values(room.players).find((player) => player.team === team)?.userId;
};

const getUndoAction = (event) => {
  const text = String(event.MessageText ?? "").trim().replace(/^(?:[!！/#＃]\s*)/, "");

  if (text.includes("同意")) return "approve";
  if (text.includes("拒绝")) return "reject";
  return "request";
};

export default async (event) => {
  const [message] = useMessage(event);
  const userId = getEventUserId(event);
  const room = boardRooms.getRoom(event, CHINESE_CHESS_GAME) as ChineseChessRoom | undefined;

  if (!room || room.status !== "playing") {
    await message.send(format(Text("当前没有正在进行的中国象棋。")));
    return;
  }

  const player = room.players[userId];
  if (!player) {
    await message.send(format(Text("你还没加入中国象棋，不能操作悔棋。")));
    return;
  }

  const action = getUndoAction(event);

  if (action === "request") {
    if (room.history.length <= 1 || !room.state.lastMove) {
      await message.send(format(Text("当前没有可悔棋的步。")));
      return;
    }

    if (player.team === room.state.current) {
      await message.send(format(Text("当前是你的回合，无法申请悔棋。")));
      return;
    }

    const approverUserId = findTeamUserId(room, room.state.current);
    if (!approverUserId) {
      await message.send(format(Text("没有找到需要同意悔棋的对手。")));
      return;
    }

    room.undoRequest = {
      requesterUserId: userId,
      approverUserId,
      requestedAt: Date.now(),
    };
    boardRooms.saveRoom(event, CHINESE_CHESS_GAME, room);
    gameSession.activate(event, CHINESE_CHESS_GAME);
    await message.send(
      format(
        Text(
          `${player.nickname || userId} 请求悔棋，${room.players[approverUserId].nickname || approverUserId} 可回复“同意”或“拒绝”。`
        )
      )
    );
    return;
  }

  if (!room.undoRequest) {
    await message.send(format(Text("当前没有待处理的悔棋请求。")));
    return;
  }

  if (room.undoRequest.approverUserId !== userId) {
    await message.send(format(Text("只有对方可以同意或拒绝这次悔棋。")));
    return;
  }

  const requester = room.players[room.undoRequest.requesterUserId];

  if (action === "reject") {
    room.undoRequest = undefined;
    boardRooms.saveRoom(event, CHINESE_CHESS_GAME, room);
    gameSession.activate(event, CHINESE_CHESS_GAME);
    await message.send(format(Text(`已拒绝悔棋，继续由${room.state.current}方行动。`)));
    return;
  }

  if (!rollbackChineseChessMove(room)) {
    room.undoRequest = undefined;
    boardRooms.saveRoom(event, CHINESE_CHESS_GAME, room);
    await message.send(format(Text("悔棋失败，当前没有可回退的历史。")));
    return;
  }

  boardRooms.saveRoom(event, CHINESE_CHESS_GAME, room);
  gameSession.activate(event, CHINESE_CHESS_GAME);
  await message.send(
    await renderChineseChessMessage(
      room,
      `已同意悔棋，回到上一步。${requester?.nickname || "申请方"} 继续行动。`
    )
  );
};
