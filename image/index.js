import { renders } from 'jsxp';
import App$2 from './conponent/help.js';
import App from './conponent/minesweeper/help.js';
import App$1 from './conponent/minesweeper/map.js';

const Pictures = renders({
    help: App$2,
    minesweeper: App$1,
    minesweeperHelp: App,
});

export { Pictures };
