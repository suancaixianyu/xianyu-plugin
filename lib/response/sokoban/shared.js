import { renderComponentToBuffer } from 'jsxp';
import { Text, Image } from 'alemonjs';
import SokobanMapView from '../../image/conponent/sokoban/map.js';

const renderSokobanMessage = async (game, title) => {
    const img = await renderComponentToBuffer("sokoban", SokobanMapView, { game });
    if (typeof img === "boolean") {
        return format(Text(title ? `${title}\n图片加载失败` : "图片加载失败"));
    }
    if (title) {
        return format(Text(title), Image(img));
    }
    return format(Image(img));
};
const parseSokobanLevelNumber = (event) => {
    const routeArgs = event.__route?.parsedArgs?.join(" ") ?? "";
    const source = `${event.MessageText ?? ""} ${routeArgs}`;
    const match = source.match(/\d+/);
    return match ? Number(match[0]) : 1;
};
const parseSokobanDirections = (event) => {
    const routeArgs = event.__route?.parsedArgs?.join(" ") ?? "";
    const source = routeArgs || event.MessageText || "";
    const match = source.match(/[wasd]+/i);
    return match?.[0] ?? "";
};

export { parseSokobanDirections, parseSokobanLevelNumber, renderSokobanMessage };
