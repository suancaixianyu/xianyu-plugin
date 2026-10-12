import { Text, Image } from 'alemonjs';
import { renderComponentToBuffer } from 'jsxp';
import GobangMap from '../../image/conponent/gobang/map.js';

const getEventUserId = (event) => String(event.UserId ?? event.user_id ?? "anonymous");
const getEventNickname = (event) => String(event.UserName ?? event.MemberName ?? event.sender?.nickname ?? event.nickname ?? getEventUserId(event));
const renderGobangMessage = async (room, title) => {
    const img = await renderComponentToBuffer("gobang", GobangMap, { room });
    if (typeof img === "boolean") {
        return format(Text(title ? `${title}\n图片加载失败` : "图片加载失败"));
    }
    if (title) {
        return format(Text(title), Image(img));
    }
    return format(Image(img));
};
const getTeamUserId = (room, team) => {
    return Object.values(room.players).find((player) => player.team === team)?.userId;
};

export { getEventNickname, getEventUserId, getTeamUserId, renderGobangMessage };
