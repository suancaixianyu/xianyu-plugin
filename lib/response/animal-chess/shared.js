import AnimalChessMap from "../../image/conponent/animal-chess/map.js";
import { Image, Text } from "alemonjs";
import { renderComponentToBuffer } from "jsxp";

//#region src/response/animal-chess/shared.ts
const getEventUserId = (event) => String(event.UserId ?? event.user_id ?? "anonymous");
const getEventNickname = (event) => String(event.UserName ?? event.MemberName ?? event.sender?.nickname ?? event.nickname ?? getEventUserId(event));
const parseRequestedTeam = (event) => {
	return String(event.MessageText ?? "").trim().match(/[红蓝]/)?.[0] ?? null;
};
const renderAnimalChessMessage = async (room, title) => {
	const img = await renderComponentToBuffer("animalChess", AnimalChessMap, { room });
	if (typeof img === "boolean") return format(Text(title ? `${title}\n图片加载失败` : "图片加载失败"));
	if (title) return format(Text(title), Image(img));
	return format(Image(img));
};

//#endregion
export { getEventNickname, getEventUserId, parseRequestedTeam, renderAnimalChessMessage };