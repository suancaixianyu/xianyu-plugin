import { Text, Image } from 'alemonjs';
import { renderComponentToBuffer } from 'jsxp';
import ChineseChessMap from '../../image/conponent/chinese-chess/map.js';

const getEventUserId = (event) => String(event.UserId ?? event.user_id ?? "anonymous");
const getEventNickname = (event) => String(event.UserName ?? event.MemberName ?? event.sender?.nickname ?? event.nickname ?? getEventUserId(event));
const parseRequestedTeam = (event) => {
    const text = String(event.MessageText ?? "").trim();
    const match = text.match(/[黑红]/);
    return match?.[0] ?? null;
};
const renderChineseChessMessage = async (room, title) => {
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

export { getEventNickname, getEventUserId, parseRequestedTeam, renderChineseChessMessage };
