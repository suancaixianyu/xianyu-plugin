import SokobanMapView from "../../image/conponent/sokoban/map.js";
import { Image, Text } from "alemonjs";
import { renderComponentToBuffer } from "jsxp";

//#region src/response/sokoban/shared.ts
const renderSokobanMessage = async (game, title) => {
	const img = await renderComponentToBuffer("sokoban", SokobanMapView, { game });
	if (typeof img === "boolean") return format(Text(title ? `${title}\n图片加载失败` : "图片加载失败"));
	if (title) return format(Text(title), Image(img));
	return format(Image(img));
};
const parseSokobanLevelNumber = (event) => {
	const routeArgs = event.__route?.parsedArgs?.join(" ") ?? "";
	const match = `${event.MessageText ?? ""} ${routeArgs}`.match(/\d+/);
	return match ? Number(match[0]) : 1;
};
const parseSokobanDirections = (event) => {
	return ((event.__route?.parsedArgs?.join(" ") ?? "") || event.MessageText || "").match(/[wasd]+/i)?.[0] ?? "";
};

//#endregion
export { parseSokobanDirections, parseSokobanLevelNumber, renderSokobanMessage };