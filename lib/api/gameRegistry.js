import { gameSession } from './gameSession.js';

const games = new Map();
const gameRegistry = {
    register(definition) {
        games.set(definition.game, definition);
        if (definition.controller) {
            gameSession.registerController(definition.controller);
        }
    },
    list() {
        return [...games.values()];
    },
    get(game) {
        return games.get(game);
    },
    getRoutes() {
        return this.list().flatMap((definition) => definition.routes);
    },
    getCompactRoutes() {
        return this.list().flatMap((definition) => definition.compactRoutes ?? []);
    },
};

export { gameRegistry };
