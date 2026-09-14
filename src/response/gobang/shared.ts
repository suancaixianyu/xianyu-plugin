import { Image, Text } from "alemonjs";
import { renderComponentToBuffer } from "jsxp";
import type { GobangRoom, GobangTeam } from "@src/api/games/gobang";
import GobangMap from "@src/image/conponent/gobang/map";

export const getEventUserId = (event) => String(event.UserId ?? event.user_id ?? "anonymous");

export const getEventNickname = (event) =>
  String(event.UserName ?? event.MemberName ?? event.sender?.nickname ?? event.nickname ?? getEventUserId(event));

export const renderGobangMessage = async (room: GobangRoom, title?: string) => {
  const img = await renderComponentToBuffer("gobang", GobangMap, { room });

  if (typeof img === "boolean") {
    return format(Text(title ? `${title}\n图片加载失败` : "图片加载失败"));
  }

  if (title) {
    return format(Text(title), Image(img));
  }

  return format(Image(img));
};

export const getTeamUserId = (room: GobangRoom, team: GobangTeam) => {
  return Object.values(room.players).find((player) => player.team === team)?.userId;
};
