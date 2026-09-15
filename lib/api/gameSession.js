import { gamePools } from "./gamePools.js";

//#region src/api/gameSession.ts
const controllers = /* @__PURE__ */ new Map();
const gameSession = {
	registerController(controller) {
		controllers.set(controller.game, controller);
	},
	activate(event, game) {
		gamePools.setSessionMeta(event, { activeGame: game });
	},
	deactivate(event, game) {
		const meta = gamePools.getSessionMeta(event);
		if (!meta?.activeGame) return;
		if (game && meta.activeGame !== game) return;
		gamePools.setSessionMeta(event, { activeGame: void 0 });
	},
	getActiveGame(event) {
		return gamePools.getSessionMeta(event)?.activeGame;
	},
	rewriteActiveCommand(event) {
		const activeGame = gamePools.getSessionMeta(event)?.activeGame;
		if (!activeGame) return null;
		const controller = controllers.get(activeGame);
		if (!controller) return null;
		return controller.rewriteCommand(event);
	}
};

//#endregion
export { gameSession };