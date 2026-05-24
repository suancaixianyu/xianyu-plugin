import type { GameType, ScopedEvent } from "./type";

export interface BoardRoomPlayer<TMeta = unknown> {
  userId: string;
  nickname: string;
  team: string;
  meta?: TMeta;
}

export interface BoardRoom<TState = unknown, TPlayerMeta = unknown> {
  game: GameType;
  status: "waiting" | "playing" | "finished";
  players: Record<string, BoardRoomPlayer<TPlayerMeta>>;
  state: TState;
  history: TState[];
  turn?: string;
  winner?: string;
  createdAt: number;
  updatedAt: number;
}

const buildRoomScopeKey = (event: ScopedEvent) => {
  if (event.IsPrivate) {
    return `private:${event.UserId ?? "anonymous"}`;
  }

  return `space:${event.ChannelId ?? event.GuildId ?? event.SpaceId ?? "global"}`;
};

const rooms = new Map<string, BoardRoom>();

export const boardRooms = {
  getScopeKey: buildRoomScopeKey,
  getRoom: <TState, TPlayerMeta = unknown>(event: ScopedEvent, game: GameType) => {
    const scopeKey = buildRoomScopeKey(event);
    return rooms.get(`${scopeKey}:${game}`) as BoardRoom<TState, TPlayerMeta> | undefined;
  },
  saveRoom: <TState, TPlayerMeta = unknown>(
    event: ScopedEvent,
    game: GameType,
    room: BoardRoom<TState, TPlayerMeta>
  ) => {
    const scopeKey = buildRoomScopeKey(event);
    room.updatedAt = Date.now();
    rooms.set(`${scopeKey}:${game}`, room as BoardRoom);
    return room;
  },
  removeRoom: (event: ScopedEvent, game: GameType) => {
    const scopeKey = buildRoomScopeKey(event);
    rooms.delete(`${scopeKey}:${game}`);
  },
};
