import { gamePools } from "./gamePools";
import type { GameCommandController, GameType, ScopedEvent } from "./type";

const controllers = new Map<GameType, GameCommandController>();

export const gameSession = {
  registerController(controller: GameCommandController) {
    controllers.set(controller.game, controller);
  },
  activate(event: ScopedEvent, game: GameType) {
    gamePools.setSessionMeta(event, { activeGame: game });
  },
  deactivate(event: ScopedEvent, game?: GameType) {
    const meta = gamePools.getSessionMeta(event);

    if (!meta?.activeGame) {
      return;
    }

    if (game && meta.activeGame !== game) {
      return;
    }

    gamePools.setSessionMeta(event, { activeGame: undefined });
  },
  getActiveGame(event: ScopedEvent) {
    return gamePools.getSessionMeta(event)?.activeGame;
  },
  rewriteActiveCommand(event: ScopedEvent) {
    const activeGame = gamePools.getSessionMeta(event)?.activeGame;
    if (!activeGame) {
      return null;
    }

    const controller = controllers.get(activeGame);
    if (!controller) {
      return null;
    }

    return controller.rewriteCommand(event);
  },
};
