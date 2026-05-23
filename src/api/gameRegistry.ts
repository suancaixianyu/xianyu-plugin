import { gameSession } from "./gameSession";
import type { GameCompactRouteDefinition, GameDefinition, GameRouteDefinition, GameType } from "./type";

const games = new Map<GameType, GameDefinition>();

export const gameRegistry = {
  register(definition: GameDefinition) {
    games.set(definition.game, definition);

    if (definition.controller) {
      gameSession.registerController(definition.controller);
    }
  },
  list() {
    return [...games.values()];
  },
  get(game: GameType) {
    return games.get(game);
  },
  getRoutes() {
    return this.list().flatMap((definition): GameRouteDefinition[] => definition.routes);
  },
  getCompactRoutes() {
    return this.list().flatMap(
      (definition): GameCompactRouteDefinition[] => definition.compactRoutes ?? []
    );
  },
};
