import { gameRegistry } from '../gameRegistry.js';

const SOKOBAN_GAME = "sokoban";
const sokobanLevelLayouts = [
    [
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000001110000000",
        "0000001210000000",
        "0000001011110000",
        "0000111303210000",
        "0000120341110000",
        "0000111131000000",
        "0000000121000000",
        "0000000111000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
    ],
    [
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000111110000000",
        "0000140010000000",
        "0000103310111000",
        "0000103010121000",
        "0000111011121000",
        "0000011000021000",
        "0000010001001000",
        "0000010001111000",
        "0000011111000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
    ],
    [
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000111111100000",
        "0000100000111000",
        "0001131110001000",
        "0001040300301000",
        "0001022103011000",
        "0001122100010000",
        "0000111111110000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
    ],
    [
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000011110000000",
        "0000110010000000",
        "0000143010000000",
        "0000113011000000",
        "0000110301000000",
        "0000123001000000",
        "0000122521000000",
        "0000111111000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
    ],
    [
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000011111000000",
        "0000014011100000",
        "0000010300100000",
        "0000111010110000",
        "0000121010010000",
        "0000123001010000",
        "0000120003010000",
        "0000111111110000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
    ],
    [
        "0000000000000000",
        "0000000000000000",
        "0000111111100000",
        "0111100000100000",
        "0100021110100000",
        "0101010000110000",
        "0101030312010000",
        "0101005001010000",
        "0102130301010000",
        "0110000101011100",
        "0010111200004100",
        "0010000011000100",
        "0011111111111100",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
    ],
    [
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000001111111000",
        "0000011001041000",
        "0000010001001000",
        "0000013030301000",
        "0000010311001000",
        "0001110301011000",
        "0001222220010000",
        "0001111111110000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
    ],
    [
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000001111110000",
        "0000111000010000",
        "0001120311011000",
        "0001223030041000",
        "0001220303011000",
        "0001111110010000",
        "0000000011110000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
    ],
    [
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0001111111110000",
        "0001001100010000",
        "0001000300010000",
        "0001301110310000",
        "0001012221010000",
        "0011012221011000",
        "0010300300301000",
        "0010000010401000",
        "0011111111111000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
    ],
    [
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000001111110000",
        "0000001000010000",
        "0000111333010000",
        "0000140322010000",
        "0000103222110000",
        "0000111100100000",
        "0000000111100000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
    ],
    [
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0001111001111100",
        "0011001001000100",
        "0010301111300100",
        "0010032222030100",
        "0011000010401100",
        "0001111111111000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
    ],
    [
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000001111100000",
        "0000111004100000",
        "0000100320110000",
        "0000100232010000",
        "0000111053010000",
        "0000001000110000",
        "0000001111100000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
    ],
    [
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000001111000000",
        "0000001221000000",
        "0000011021100000",
        "0000010032100000",
        "0000110300110000",
        "0000100133010000",
        "0000100400010000",
        "0000111111110000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
    ],
    [
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000111111110000",
        "0000100100010000",
        "0000103223010000",
        "0000143250110000",
        "0000103223010000",
        "0000100100010000",
        "0000111111110000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
    ],
    [
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000011111110000",
        "0000110000100000",
        "0000103033010000",
        "0000122222210000",
        "0000103303010000",
        "0000111041110000",
        "0000001111000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
    ],
];
const directionMap = {
    w: [-1, 0],
    a: [0, -1],
    s: [1, 0],
    d: [0, 1],
};
const parseLevel = (rows) => rows.map((row) => row.split("").map((cell) => Number(cell)));
const sokobanLevelCount = sokobanLevelLayouts.length;
const getSokobanLevels = () => sokobanLevelLayouts.map(parseLevel);
const cloneSokobanMap = (map) => map.map((row) => [...row]);
const getCurrentSokobanMap = (game) => game.history[game.history.length - 1];
const createSokobanGame = (levelIndex = 0) => {
    const level = sokobanLevelLayouts[levelIndex];
    if (!level) {
        return null;
    }
    return {
        levelIndex,
        history: [parseLevel(level)],
        moveCount: 0,
        startedAt: Date.now(),
        status: "playing",
    };
};
const findSokobanPlayer = (map) => {
    for (let x = 0; x < map.length; x += 1) {
        for (let y = 0; y < map[x].length; y += 1) {
            if (map[x][y] === 4 || map[x][y] === 6) {
                return { x, y };
            }
        }
    }
    return null;
};
const isSokobanWin = (map) => map.every((row) => row.every((cell) => cell !== 2 && cell !== 6));
const movePlayerFrom = (cell) => (cell === 6 ? 2 : 0);
const movePlayerTo = (cell) => (cell === 2 ? 6 : 4);
const moveBoxFrom = (cell) => (cell === 5 ? 2 : 0);
const moveBoxTo = (cell) => (cell === 2 ? 5 : 3);
const tryMove = (map, direction) => {
    const player = findSokobanPlayer(map);
    if (!player) {
        return false;
    }
    const [dx, dy] = directionMap[direction];
    const x = player.x + dx;
    const y = player.y + dy;
    const target = map[x]?.[y];
    if (target === undefined || target === 1) {
        return false;
    }
    if (target === 3 || target === 5) {
        const boxX = x + dx;
        const boxY = y + dy;
        const boxTarget = map[boxX]?.[boxY];
        if (boxTarget !== 0 && boxTarget !== 2) {
            return false;
        }
        map[boxX][boxY] = moveBoxTo(boxTarget);
        map[x][y] = moveBoxFrom(target);
    }
    map[player.x][player.y] = movePlayerFrom(map[player.x][player.y]);
    map[x][y] = movePlayerTo(map[x][y]);
    return true;
};
const moveSokoban = (game, directions) => {
    if (game.status !== "playing") {
        return { moved: false, won: game.status === "win" };
    }
    const map = cloneSokobanMap(getCurrentSokobanMap(game));
    let moved = false;
    for (const direction of directions.toLowerCase()) {
        if (!Object.hasOwn(directionMap, direction)) {
            continue;
        }
        moved = tryMove(map, direction) || moved;
    }
    if (!moved) {
        return { moved: false, won: false };
    }
    game.history.push(map);
    game.moveCount += 1;
    if (isSokobanWin(map)) {
        game.status = "win";
        return { moved: true, won: true };
    }
    return { moved: true, won: false };
};
const undoSokoban = (game) => {
    if (game.history.length <= 1) {
        return false;
    }
    game.history.pop();
    game.status = "playing";
    game.moveCount = Math.max(0, game.moveCount - 1);
    return true;
};
const activeMovePattern = /^(?:移动\s*)?([wasd]+)$/i;
const sokobanCommandController = {
    game: SOKOBAN_GAME,
    rewriteCommand(event) {
        const text = String(event.MessageText ?? "").trim().replace(/^(?:[!！/#＃]\s*)/, "");
        if (/^撤回$/i.test(text)) {
            return "推箱子撤回";
        }
        const moveMatch = text.match(activeMovePattern);
        if (!moveMatch) {
            return null;
        }
        return `推箱子移动 ${moveMatch[1]}`;
    },
};
const sokobanGameDefinition = {
    game: SOKOBAN_GAME,
    controller: sokobanCommandController,
    compactRoutes: [
        {
            pattern: /^(?:[!！/#＃]\s*)?推箱子\s*\d*$/i,
            importer: () => import('../../response/sokoban/start/res.js'),
        },
        {
            pattern: /^(?:[!！/#＃]\s*)?(?:推箱子)?移动\s*[wasd]+$/i,
            importer: () => import('../../response/sokoban/move/res.js'),
        },
        {
            pattern: /^(?:[!！/#＃]\s*)?(?:推箱子)?撤回$/i,
            importer: () => import('../../response/sokoban/undo/res.js'),
        },
    ],
    routes: [
        {
            aliases: ["开始推箱子"],
            importer: () => import('../../response/sokoban/start/res.js'),
        },
        {
            aliases: ["结束推箱子", "退出推箱子", "关闭推箱子"],
            importer: () => import('../../response/sokoban/exit/res.js'),
        },
        {
            aliases: ["推箱子帮助", "咸鱼推箱子帮助"],
            importer: () => import('../../response/sokoban/help/res.js'),
        },
        {
            aliases: ["推箱子关卡列表"],
            importer: () => import('../../response/sokoban/list/res.js'),
        },
        {
            aliases: ["推箱子关卡工具"],
            importer: () => import('../../response/sokoban/tool/res.js'),
        },
    ],
};
gameRegistry.register(sokobanGameDefinition);

export { SOKOBAN_GAME, cloneSokobanMap, createSokobanGame, findSokobanPlayer, getCurrentSokobanMap, getSokobanLevels, isSokobanWin, moveSokoban, sokobanCommandController, sokobanGameDefinition, sokobanLevelCount, undoSokoban };
