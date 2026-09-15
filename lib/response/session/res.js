import { gameSession } from "../../api/gameSession.js";
import "../../api/index.js";

//#region src/response/session/res.ts
var res_default = async (event, next) => {
	const rewritten = gameSession.rewriteActiveCommand(event);
	if (rewritten) event.MessageText = rewritten;
	if (typeof next === "function") await next();
};

//#endregion
export { res_default as default };