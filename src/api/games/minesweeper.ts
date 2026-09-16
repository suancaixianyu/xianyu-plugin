import { gameRegistry } from "../gameRegistry";
import { gameLevels } from "../map";
import type { Game, GameCommandController, GameDefinition, ScopedEvent } from "../type";

export const MINESWEEPER_GAME = "minesweeper" as const;
export type MinesweeperLevel = keyof typeof gameLevels;

export type MinesweeperVisibleCell = "unknown" | "flag" | number;

export const createMinesweeperGame = (level: MinesweeperLevel): Game => {
  const { row, col, mine } = gameLevels[level];
  const map: Game["map"] = {};

  for (let x = 0; x < row; x += 1) {
    for (let y = 0; y < col; y += 1) {
      map[`${x}-${y}`] = {
        isMine: false,
        value: 0,
        isOpen: false,
        isFlag: false,
        name: `${String.fromCharCode(65 + x)}${y}`,
      };
    }
  }

  for (let placed = 0; placed < mine; placed += 1) {
    const x = Math.floor(Math.random() * row);
    const y = Math.floor(Math.random() * col);
    if (map[`${x}-${y}`].isMine) {
      placed -= 1;
      continue;
    }
    map[`${x}-${y}`].isMine = true;
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        if ((dx !== 0 || dy !== 0) && map[`${x + dx}-${y + dy}`]) {
          map[`${x + dx}-${y + dy}`].value += 1;
        }
      }
    }
  }

  return {
    row,
    col,
    mine,
    map,
    remain: mine,
    state: "playing",
    time: 0,
    startTime: Date.now(),
    select: { x: -1, y: -1 },
  };
};

export const parseMinesweeperCoordinate = (input: string) => {
  const match = String(input ?? "").trim().match(/^([a-zA-Z])(\d+)$/);
  if (!match) return null;
  return {
    x: match[1].toUpperCase().charCodeAt(0) - 65,
    y: Number(match[2]),
    label: `${match[1].toUpperCase()}${Number(match[2])}`,
  };
};

const getNeighbors = (game: Game, x: number, y: number) => {
  const neighbors: Array<{ x: number; y: number }> = [];
  for (let dx = -1; dx <= 1; dx += 1) {
    for (let dy = -1; dy <= 1; dy += 1) {
      if (dx === 0 && dy === 0) continue;
      if (game.map[`${x + dx}-${y + dy}`]) {
        neighbors.push({ x: x + dx, y: y + dy });
      }
    }
  }
  return neighbors;
};

const refreshMinesweeperState = (game: Game) => {
  const cells = Object.values(game.map);
  game.remain = game.mine - cells.filter((cell) => cell.isFlag).length;
  if (
    game.state === "playing" &&
    cells.every((cell) => cell.isMine || cell.isOpen)
  ) {
    game.state = "win";
  }
  return game;
};

const openCell = (game: Game, x: number, y: number) => {
  const cell = game.map[`${x}-${y}`];
  if (!cell || cell.isOpen || cell.isFlag || game.state !== "playing") return false;
  game.select = { x, y };
  if (cell.isMine) {
    game.state = "lose";
    return true;
  }
  cell.isOpen = true;
  if (cell.value === 0) {
    for (const neighbor of getNeighbors(game, x, y)) {
      openCell(game, neighbor.x, neighbor.y);
    }
  }
  return true;
};

export const openMinesweeperCells = (game: Game, coordinates: string[]) => {
  const changed: string[] = [];
  for (const value of coordinates) {
    const point = parseMinesweeperCoordinate(value);
    if (!point || !game.map[`${point.x}-${point.y}`]) continue;
    if (openCell(game, point.x, point.y)) changed.push(point.label);
    if (game.state !== "playing") break;
  }
  refreshMinesweeperState(game);
  return changed;
};

export const markMinesweeperCells = (
  game: Game,
  coordinates: string[],
  flagged: boolean,
) => {
  const changed: string[] = [];
  for (const value of coordinates) {
    const point = parseMinesweeperCoordinate(value);
    const cell = point ? game.map[`${point.x}-${point.y}`] : undefined;
    if (!point || !cell || cell.isOpen || cell.isFlag === flagged) continue;
    cell.isFlag = flagged;
    game.select = { x: point.x, y: point.y };
    changed.push(point.label);
  }
  refreshMinesweeperState(game);
  return changed;
};

/**
 * 只生成玩家当前能够看到的棋盘。隐藏格的 value/isMine 均不会进入返回值，
 * 这个函数是所有跨插件扫雷快照的唯一出口。
 */
export const snapshotVisibleMinesweeper = (game: Game, guid: string) => {
  const board: MinesweeperVisibleCell[][] = [];
  for (let y = 0; y < game.col; y += 1) {
    const row: MinesweeperVisibleCell[] = [];
    for (let x = 0; x < game.row; x += 1) {
      const cell = game.map[`${x}-${y}`];
      row.push(cell.isOpen ? cell.value : cell.isFlag ? "flag" : "unknown");
    }
    board.push(row);
  }
  const cells = Object.values(game.map);
  return {
    game: MINESWEEPER_GAME,
    guid,
    status: game.state,
    width: game.row,
    height: game.col,
    mineCount: game.mine,
    remainingMineEstimate: game.remain,
    openedCount: cells.filter((cell) => cell.isOpen).length,
    flagCount: cells.filter((cell) => cell.isFlag).length,
    coordinateSystem: {
      origin: "左上角",
      input: "字母列加数字行，例如 A0",
      xAxis: `A-${String.fromCharCode(64 + game.row)}`,
      yAxis: `0-${game.col - 1}`,
      boardIndex: "board[数字行][字母列索引]，即 board[y][x]",
    },
    legend: {
      unknown: "未翻开的未知格",
      flag: "已标记的疑似地雷",
      "0-8": "已翻开格周围的地雷数",
    },
    board,
  };
};

const compactCommandPattern =
  /^(翻开|扫雷翻开|扫镭翻开|标记|扫雷标记|扫镭标记|取消标记|扫雷取消标记|扫镭取消标记)\s*([a-zA-Z]\d+(?:\s+[a-zA-Z]\d+)*)$/;

const rewriteMap: Record<string, string> = {
  翻开: "扫雷翻开",
  标记: "扫雷标记",
  取消标记: "扫雷取消标记",
};

const minesweeperCommandController: GameCommandController = {
  game: MINESWEEPER_GAME,
  rewriteCommand(event: ScopedEvent) {
    const text = String(event.MessageText ?? "").trim().replace(/^(?:[!！/#＃]\s*)/, "");
    const match = text.match(compactCommandPattern);

    if (!match) {
      return null;
    }

    const [, command, coords] = match;
    const rewritten = rewriteMap[command];
    if (!rewritten) {
      return null;
    }

    return `${rewritten} ${coords}`;
  },
};

export const minesweeperGameDefinition: GameDefinition = {
  game: MINESWEEPER_GAME,
  controller: minesweeperCommandController,
  compactRoutes: [
    {
      pattern:
        /^(?:[!！/#＃]\s*)?(扫雷翻开|扫镭翻开|扫雷标记|扫镭标记|扫雷取消标记|扫镭取消标记)\s*([a-zA-Z]\d+(?:\s+[a-zA-Z]\d+)*)$/,
      importer: () => import("@src/response/minesweeper/compact/res"),
    },
  ],
  routes: [
    {
      aliases: ["扫雷", "扫镭", "扫雷难度", "扫镭难度"],
      importer: () => import("@src/response/minesweeper/start/res"),
    },
    {
      aliases: ["扫雷帮助", "扫镭帮助", "扫雷 帮助", "扫镭 帮助", "扫雷说明", "扫镭说明"],
      importer: () => import("@src/response/minesweeper/help/res"),
    },
    {
      aliases: ["扫雷翻开", "扫镭翻开", "扫雷 翻开", "扫镭 翻开"],
      importer: () => import("@src/response/minesweeper/open/res"),
    },
    {
      aliases: [
        "扫雷标记",
        "扫镭标记",
        "扫雷 标记",
        "扫镭 标记",
        "扫雷取消标记",
        "扫镭取消标记",
        "扫雷 取消标记",
        "扫镭 取消标记",
      ],
      importer: () => import("@src/response/minesweeper/mark/res"),
    },
    {
      aliases: ["结束扫雷", "关闭扫雷", "退出扫雷", "结束扫镭", "关闭扫镭", "退出扫镭"],
      importer: () => import("@src/response/minesweeper/exit/res"),
    },
  ],
};

gameRegistry.register(minesweeperGameDefinition);
