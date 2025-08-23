const pools = () => {
    const games = {};
    return {
        getGame: (gameId) => {
            return games[gameId];
        },
        saveGame: (gameId, game) => {
            games[gameId] = game;
        },
        removeGame: (gameId) => {
            delete games[gameId];
        },
    };
};
const gamePools = pools();

export { gamePools };
