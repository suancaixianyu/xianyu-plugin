import { gameSession } from '../../api/gameSession.js';
import '../../api/games/minesweeper.js';
import '../../api/games/points24.js';
import '../../api/games/sokoban.js';
import '../../api/games/chineseChess.js';
import '../../api/games/gobang.js';
import '../../api/games/animalChess.js';

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
