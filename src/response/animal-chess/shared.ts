import { Image, Text } from "alemonjs";
import { renderComponentToBuffer } from "jsxp";
import type { AnimalChessRoom, AnimalChessTeam } from "@src/api/games/animalChess";
import AnimalChessMap from "@src/image/conponent/animal-chess/map";

export const getEventUserId = (event) => String(event.UserId ?? event.user_id ?? "anonymous");

export const getEventNickname = (event) =>
  String(event.UserName ?? event.MemberName ?? event.sender?.nickname ?? event.nickname ?? getEventUserId(event));

export const parseRequestedTeam = (event): AnimalChessTeam | null => {
  const text = String(event.MessageText ?? "").trim();
  const match = text.match(/[红蓝]/);
  return (match?.[0] as AnimalChessTeam | undefined) ?? null;
};

export const renderAnimalChessMessage = async (room: AnimalChessRoom, title?: string) => {
  const img = await renderComponentToBuffer("animalChess", AnimalChessMap, { room });

  if (typeof img === "boolean") {
    return format(Text(title ? `${title}\n图片加载失败` : "图片加载失败"));
  }

  if (title) {
    return format(Text(title), Image(img));
  }

  return format(Image(img));
};
