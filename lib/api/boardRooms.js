const buildRoomScopeKey = (event) => {
    const guid = String(event.guid ?? "").trim();
    if (guid) {
        return `guid:${guid}`;
    }
    if (event.IsPrivate) {
        return `private:${event.UserId ?? "anonymous"}`;
    }
    return `space:${event.ChannelId ?? event.GuildId ?? event.SpaceId ?? "global"}`;
};
const rooms = new Map();
const boardRooms = {
    getScopeKey: buildRoomScopeKey,
    getRoom: (event, game) => {
        const scopeKey = buildRoomScopeKey(event);
        return rooms.get(`${scopeKey}:${game}`);
    },
    getRoomByGuid: (guid, game) => {
        return rooms.get(`guid:${guid}:${game}`);
    },
    saveRoom: (event, game, room) => {
        const scopeKey = buildRoomScopeKey(event);
        room.updatedAt = Date.now();
        rooms.set(`${scopeKey}:${game}`, room);
        return room;
    },
    removeRoom: (event, game) => {
        const scopeKey = buildRoomScopeKey(event);
        rooms.delete(`${scopeKey}:${game}`);
    },
    saveRoomByGuid: (guid, game, room) => {
        room.updatedAt = Date.now();
        rooms.set(`guid:${guid}:${game}`, room);
        return room;
    },
};

export { boardRooms };
