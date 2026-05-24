import { gameRegistry } from "../gameRegistry";
import type { GameCommandController, GameDefinition, ScopedEvent } from "../type";

export const SOKOBAN_GAME = "sokoban" as const;

export type SokobanCell = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type SokobanMap = SokobanCell[][];

export interface SokobanGameState {
  levelIndex: number;
  history: SokobanMap[];
  moveCount: number;
  startedAt: number;
  status: "playing" | "win";
}

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
] as const;

const directionMap = {
  w: [-1, 0],
  a: [0, -1],
  s: [1, 0],
  d: [0, 1],
} as const;

const parseLevel = (rows: readonly string[]): SokobanMap =>
  rows.map((row) => row.split("").map((cell) => Number(cell) as SokobanCell));

export const sokobanLevelCount = sokobanLevelLayouts.length;

export const getSokobanLevels = () => sokobanLevelLayouts.map(parseLevel);

export const cloneSokobanMap = (map: SokobanMap): SokobanMap =>
  map.map((row) => [...row]);

export const getCurrentSokobanMap = (game: SokobanGameState) =>
  game.history[game.history.length - 1];

export const createSokobanGame = (levelIndex = 0): SokobanGameState | null => {
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

export const findSokobanPlayer = (map: SokobanMap) => {
  for (let x = 0; x < map.length; x += 1) {
    for (let y = 0; y < map[x].length; y += 1) {
      if (map[x][y] === 4 || map[x][y] === 6) {
        return { x, y };
      }
    }
  }

  return null;
};

export const isSokobanWin = (map: SokobanMap) =>
  map.every((row) => row.every((cell) => cell !== 2 && cell !== 6));

const movePlayerFrom = (cell: SokobanCell): SokobanCell => (cell === 6 ? 2 : 0);
const movePlayerTo = (cell: SokobanCell): SokobanCell => (cell === 2 ? 6 : 4);
const moveBoxFrom = (cell: SokobanCell): SokobanCell => (cell === 5 ? 2 : 0);
const moveBoxTo = (cell: SokobanCell): SokobanCell => (cell === 2 ? 5 : 3);

const tryMove = (map: SokobanMap, direction: keyof typeof directionMap) => {
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

export const moveSokoban = (game: SokobanGameState, directions: string) => {
  if (game.status !== "playing") {
    return { moved: false, won: game.status === "win" };
  }

  const map = cloneSokobanMap(getCurrentSokobanMap(game));
  let moved = false;

  for (const direction of directions.toLowerCase()) {
    if (!Object.hasOwn(directionMap, direction)) {
      continue;
    }

    moved = tryMove(map, direction as keyof typeof directionMap) || moved;
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

export const undoSokoban = (game: SokobanGameState) => {
  if (game.history.length <= 1) {
    return false;
  }

  game.history.pop();
  game.status = "playing";
  game.moveCount = Math.max(0, game.moveCount - 1);
  return true;
};

const activeMovePattern = /^(?:移动\s*)?([wasd]+)$/i;

export const sokobanCommandController: GameCommandController = {
  game: SOKOBAN_GAME,
  rewriteCommand(event: ScopedEvent) {
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

export const sokobanGameDefinition: GameDefinition = {
  game: SOKOBAN_GAME,
  controller: sokobanCommandController,
  compactRoutes: [
    {
      pattern: /^(?:[!！/#＃]\s*)?推箱子\s*\d*$/i,
      importer: () => import("@src/response/sokoban/start/res"),
    },
    {
      pattern: /^(?:[!！/#＃]\s*)?(?:推箱子)?移动\s*[wasd]+$/i,
      importer: () => import("@src/response/sokoban/move/res"),
    },
    {
      pattern: /^(?:[!！/#＃]\s*)?(?:推箱子)?撤回$/i,
      importer: () => import("@src/response/sokoban/undo/res"),
    },
  ],
  routes: [
    {
      aliases: ["开始推箱子"],
      importer: () => import("@src/response/sokoban/start/res"),
    },
    {
      aliases: ["结束推箱子", "退出推箱子", "关闭推箱子"],
      importer: () => import("@src/response/sokoban/exit/res"),
    },
    {
      aliases: ["推箱子帮助", "咸鱼推箱子帮助"],
      importer: () => import("@src/response/sokoban/help/res"),
    },
    {
      aliases: ["推箱子关卡列表"],
      importer: () => import("@src/response/sokoban/list/res"),
    },
    {
      aliases: ["推箱子关卡工具"],
      importer: () => import("@src/response/sokoban/tool/res"),
    },
  ],
};

gameRegistry.register(sokobanGameDefinition);
