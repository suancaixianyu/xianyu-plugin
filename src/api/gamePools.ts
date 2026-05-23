import type { GameSessionMeta, GameSessionRecord, GameType, ScopedEvent } from "./type";

const buildScopeKey = (event: ScopedEvent) => {
  const userId = event.UserId ?? "anonymous";

  if (event.IsPrivate) {
    return `private:${userId}`;
  }

  const spaceId = event.ChannelId ?? event.GuildId ?? event.SpaceId ?? "global";
  return `space:${spaceId}:user:${userId}`;
};

const pools = () => {
  const games = new Map<string, GameSessionRecord>();
  const sessionMeta = new Map<string, GameSessionMeta>();

  return {
    getScopeKey: buildScopeKey,
    getGame: <T>(event: ScopedEvent, game: GameType) => {
      const scopeKey = buildScopeKey(event);
      return games.get(`${scopeKey}:${game}`)?.state as T | undefined;
    },
    saveGame: <T>(event: ScopedEvent, game: GameType, state: T) => {
      const scopeKey = buildScopeKey(event);
      games.set(`${scopeKey}:${game}`, {
        game,
        state,
        updatedAt: Date.now(),
      });
      return scopeKey;
    },
    removeGame: (event: ScopedEvent, game: GameType) => {
      const scopeKey = buildScopeKey(event);
      games.delete(`${scopeKey}:${game}`);
      return scopeKey;
    },
    getSessionMeta: (event: ScopedEvent) => {
      return sessionMeta.get(buildScopeKey(event));
    },
    setSessionMeta: (event: ScopedEvent, meta: Partial<GameSessionMeta>) => {
      const scopeKey = buildScopeKey(event);
      const current = sessionMeta.get(scopeKey) ?? { updatedAt: Date.now() };
      const next = {
        ...current,
        ...meta,
        updatedAt: Date.now(),
      };
      sessionMeta.set(scopeKey, next);
      return next;
    },
    clearSessionMeta: (event: ScopedEvent) => {
      sessionMeta.delete(buildScopeKey(event));
    },
  };
};

export const gamePools = pools();
