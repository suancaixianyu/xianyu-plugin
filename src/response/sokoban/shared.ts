import { renderComponentToBuffer } from "jsxp";
import { Image, Text } from "alemonjs";
import type { SokobanGameState } from "@src/api/games/sokoban";
import SokobanMapView from "@src/image/conponent/sokoban/map";

export const renderSokobanMessage = async (game: SokobanGameState, title?: string) => {
  const img = await renderComponentToBuffer("sokoban", SokobanMapView, { game });

  if (typeof img === "boolean") {
    return format(Text(title ? `${title}\n图片加载失败` : "图片加载失败"));
  }

  if (title) {
    return format(Text(title), Image(img));
  }

  return format(Image(img));
};

export const parseSokobanLevelNumber = (event: {
  __route?: { parsedArgs?: string[] };
  MessageText?: string;
}) => {
  const routeArgs = event.__route?.parsedArgs?.join(" ") ?? "";
  const source = `${event.MessageText ?? ""} ${routeArgs}`;
  const match = source.match(/\d+/);
  return match ? Number(match[0]) : 1;
};

export const parseSokobanDirections = (event: {
  __route?: { parsedArgs?: string[] };
  MessageText?: string;
}) => {
  const routeArgs = event.__route?.parsedArgs?.join(" ") ?? "";
  const source = routeArgs || event.MessageText || "";
  const match = source.match(/[wasd]+/i);
  return match?.[0] ?? "";
};
