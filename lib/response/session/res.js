import { gameSession } from '../../api/gameSession.js';
import '../../api/games/minesweeper.js';
import '../../api/games/points24.js';

var res = async (event, next) => {
    const rewritten = gameSession.rewriteActiveCommand(event);
    if (rewritten) {
        event.MessageText = rewritten;
    }
    if (typeof next === "function") {
        await next();
    }
};

export { res as default };
