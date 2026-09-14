import { Image, Text } from "alemonjs";
import { renderComponentToBuffer } from "jsxp";
import type { ChineseChessRoom, ChineseChessTeam } from "../../api/games/chineseChess/state";
import ChineseChessMap from "../../image/conponent/chinese-chess/map";

export const getEventUserId = (event) => String(event.UserId ?? event.user_id ?? "anonymous");

export const getEventNickname = (event) =>
  String(event.UserName ?? event.MemberName ?? event.sender?.nickname ?? event.nickname ?? getEventUserId(event));

export const parseRequestedTeam = (event): ChineseChessTeam | null => {
  const text = String(event.MessageText ?? "").trim();
  const match = text.match(/[黑红]/);
  return (match?.[0] as ChineseChessTeam | undefined) ?? null;
};

export const renderChineseChessMessage = async (room: ChineseChessRoom, title?: string) => {
  const img = await renderComponentToBuffer("chineseChess", ChineseChessMap, {
    room,
    viewTeam: room.state.current,
  });

  if (typeof img === "boolean") {
    return format(Text(title ? `${title}\n图片加载失败` : "图片加载失败"));
  }

  if (title) {
    return format(Text(title), Image(img));
  }

  return format(Image(img));
};
