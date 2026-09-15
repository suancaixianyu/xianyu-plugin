//#region src/api/gamePools.ts
const buildScopeKey = (event) => {
	const userId = event.UserId ?? "anonymous";
	if (event.IsPrivate) return `private:${userId}`;
	return `space:${event.ChannelId ?? event.GuildId ?? event.SpaceId ?? "global"}:user:${userId}`;
};
const pools = () => {
	const games = /* @__PURE__ */ new Map();
	const sessionMeta = /* @__PURE__ */ new Map();
	return {
		getScopeKey: buildScopeKey,
		getGame: (event, game) => {
			const scopeKey = buildScopeKey(event);
			return games.get(`${scopeKey}:${game}`)?.state;
		},
		saveGame: (event, game, state) => {
			const scopeKey = buildScopeKey(event);
			games.set(`${scopeKey}:${game}`, {
				game,
				state,
				updatedAt: Date.now()
			});
			return scopeKey;
		},
		removeGame: (event, game) => {
			const scopeKey = buildScopeKey(event);
			games.delete(`${scopeKey}:${game}`);
			return scopeKey;
		},
		getSessionMeta: (event) => {
			return sessionMeta.get(buildScopeKey(event));
		},
		setSessionMeta: (event, meta) => {
			const scopeKey = buildScopeKey(event);
			const next = {
				...sessionMeta.get(scopeKey) ?? { updatedAt: Date.now() },
				...meta,
				updatedAt: Date.now()
			};
			sessionMeta.set(scopeKey, next);
			return next;
		},
		clearSessionMeta: (event) => {
			sessionMeta.delete(buildScopeKey(event));
		}
	};
};
const gamePools = pools();

//#endregion
export { gamePools };