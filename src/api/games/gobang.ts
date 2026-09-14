import { gameRegistry } from "../gameRegistry";
import type { BoardRoom } from "../boardRooms";
import type { GameCommandController, GameDefinition, ScopedEvent } from "../type";

export const GOBANG_GAME = "gobang" as const;
export const GOBANG_SIZE = 17;
export const GOBANG_AI_USER_ID = "__gobang_ai__";
export const GOBANG_AGENT_USER_ID = "__gobang_agent__";

export type GobangCell = "-" | "X" | "O";
export type GobangTeam = "黑" | "白";
export type GobangMode = "ai" | "agent" | "versus";

export interface GobangPoint {
  row: number;
  col: number;
}

export interface GobangState {
  board: GobangCell[][];
  mode: GobangMode;
  current: GobangTeam;
  moveCount: number;
  lastMove?: GobangPoint;
}

export interface GobangPlayerMeta {
  symbol: Exclude<GobangCell, "-">;
}

export type GobangRoom = BoardRoom<GobangState, GobangPlayerMeta>;

const movePattern = /^(?:[!！/#＃]\s*)?(?:五子棋)?(?:落子\s*)?(\d+)[^\d]+(\d+)$/;

const teamSymbols: Record<GobangTeam, Exclude<GobangCell, "-">> = {
  黑: "X",
  白: "O",
};

export const createGobangBoard = () =>
  Array.from({ length: GOBANG_SIZE }, () => Array<GobangCell>(GOBANG_SIZE).fill("-"));

export const cloneGobangState = (state: GobangState): GobangState => ({
  board: state.board.map((row) => [...row]),
  mode: state.mode,
  current: state.current,
  moveCount: state.moveCount,
  lastMove: state.lastMove ? { ...state.lastMove } : undefined,
});

export const createGobangRoom = (mode: GobangMode = "ai"): GobangRoom => {
  const state: GobangState = {
    board: createGobangBoard(),
    mode,
    current: "黑",
    moveCount: 0,
  };
  const now = Date.now();

  return {
    game: GOBANG_GAME,
    status: mode === "versus" ? "waiting" : "playing",
    players: {},
    state,
    history: [cloneGobangState(state)],
    turn: "黑",
    createdAt: now,
    updatedAt: now,
  };
};

export const parseGobangMove = (input: string): GobangPoint | null => {
  const match = input.trim().match(movePattern);
  if (!match) {
    return null;
  }

  // 面向用户的落子坐标统一采用 x y：第一个数字是横坐标（从左到右），
  // 第二个数字是纵坐标（从上到下）。棋盘内部仍使用 board[row][col]。
  const col = Number(match[1]) - 1;
  const row = Number(match[2]) - 1;

  if (!Number.isInteger(row) || !Number.isInteger(col)) {
    return null;
  }

  if (row < 0 || row >= GOBANG_SIZE || col < 0 || col >= GOBANG_SIZE) {
    return null;
  }

  return { row, col };
};

export const getGobangPlayerTeam = (room: GobangRoom, userId: string) => {
  return room.players[userId]?.team as GobangTeam | undefined;
};

export const getGobangTeamSymbol = (team: GobangTeam) => teamSymbols[team];

const countDirection = (
  board: GobangCell[][],
  point: GobangPoint,
  symbol: GobangCell,
  rowStep: number,
  colStep: number
) => {
  let row = point.row + rowStep;
  let col = point.col + colStep;
  let count = 0;

  while (
    row >= 0 &&
    row < GOBANG_SIZE &&
    col >= 0 &&
    col < GOBANG_SIZE &&
    board[row][col] === symbol
  ) {
    count += 1;
    row += rowStep;
    col += colStep;
  }

  return count;
};

export const checkGobangWin = (board: GobangCell[][], point: GobangPoint) => {
  const symbol = board[point.row]?.[point.col];
  if (!symbol || symbol === "-") {
    return false;
  }

  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ] as const;

  return directions.some(([rowStep, colStep]) => {
    const count =
      1 +
      countDirection(board, point, symbol, rowStep, colStep) +
      countDirection(board, point, symbol, -rowStep, -colStep);
    return count >= 5;
  });
};

const toGobangCoordinate = (point: GobangPoint) => ({
  x: point.col + 1,
  y: point.row + 1,
});

/** 返回指定棋方下一手即可获胜的所有空位，内部坐标仍是 row/col。 */
export const findGobangWinningMoves = (board: GobangCell[][], team: GobangTeam): GobangPoint[] => {
  const symbol = getGobangTeamSymbol(team);
  const wins: GobangPoint[] = [];

  for (let row = 0; row < GOBANG_SIZE; row += 1) {
    for (let col = 0; col < GOBANG_SIZE; col += 1) {
      if (board[row][col] !== "-") continue;
      const point = { row, col };
      board[row][col] = symbol;
      const winsHere = checkGobangWin(board, point);
      board[row][col] = "-";
      if (winsHere) wins.push(point);
    }
  }

  return wins;
};

/**
 * 给外部 AI 的战术建议。白棋能直接获胜时优先先赢；否则优先阻止黑棋下一手获胜。
 * 这里只处理确定的一手胜负，最终落点和其他中盘策略仍交由订阅的 AI 决定。
 */
export const analyzeGobangTactics = (board: GobangCell[][]) => {
  const whiteWinningPoints = findGobangWinningMoves(board, "白");
  const blackWinningPoints = findGobangWinningMoves(board, "黑");
  const whiteWinningMoves = whiteWinningPoints.map(toGobangCoordinate);
  const blackWinningMoves = blackWinningPoints.map(toGobangCoordinate);
  const priorityMoves = whiteWinningMoves.length > 0 ? whiteWinningMoves : blackWinningMoves;
  const recommendedMoves = rankGobangAiMoves(board).map((move) => ({
    ...toGobangCoordinate(move),
    score: move.score,
  }));
  const priorityReason = whiteWinningMoves.length > 0
    ? "白棋本回合可直接获胜，建议优先落在 whiteWinningMoves 之一。"
    : blackWinningMoves.length > 0
      ? "黑棋下一手可直接获胜，建议优先落在 blackWinningMoves 之一进行封堵。"
      : "当前没有一手必胜或必须封堵点。";

  return {
    whiteWinningMoves,
    blackWinningMoves,
    priorityMoves,
    priorityReason,
    recommendedMoves,
  };
};

export const isGobangBoardFull = (board: GobangCell[][]) =>
  board.every((row) => row.every((cell) => cell !== "-"));

export const placeGobangMove = (room: GobangRoom, team: GobangTeam, point: GobangPoint) => {
  const symbol = getGobangTeamSymbol(team);

  room.history.push(cloneGobangState(room.state));
  room.state.board[point.row][point.col] = symbol;
  room.state.lastMove = point;
  room.state.moveCount += 1;
  room.state.current = team === "黑" ? "白" : "黑";
  room.turn = room.state.current;
};

const evaluateLineCount = (count: number) => {
  if (count <= 0) return 0;
  if (count === 1) return 10;
  if (count === 2) return 100;
  if (count === 3) return 1000;
  return 10000;
};

const evaluateGobangMove = (board: GobangCell[][], point: GobangPoint, symbol: GobangCell) => {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ] as const;

  return directions.reduce((score, [rowStep, colStep]) => {
    const count =
      countDirection(board, point, symbol, rowStep, colStep) +
      countDirection(board, point, symbol, -rowStep, -colStep);
    return score + evaluateLineCount(count);
  }, 0);
};

export type GobangScoredMove = GobangPoint & { score: number };

/**
 * 复用内置 AI 的攻防评分，返回由高到低的候选空位。
 * 分数同时考虑白棋延长连线、阻止黑棋连线和靠近棋盘中心。
 */
export const rankGobangAiMoves = (board: GobangCell[][], limit = 8): GobangScoredMove[] => {
  const aiSymbol = getGobangTeamSymbol("白");
  const humanSymbol = getGobangTeamSymbol("黑");
  const candidates: GobangScoredMove[] = [];

  for (let row = 0; row < GOBANG_SIZE; row += 1) {
    for (let col = 0; col < GOBANG_SIZE; col += 1) {
      if (board[row][col] !== "-") continue;
      const point = { row, col };
      const attackScore = evaluateGobangMove(board, point, aiSymbol) + 8;
      const defendScore = evaluateGobangMove(board, point, humanSymbol);
      const centerScore = GOBANG_SIZE - Math.abs(row - 8) - Math.abs(col - 8);
      candidates.push({
        ...point,
        score: Math.max(attackScore, defendScore) + centerScore,
      });
    }
  }

  return candidates
    .sort((a, b) => b.score - a.score || a.row - b.row || a.col - b.col)
    .slice(0, Math.max(1, limit));
};

export const chooseGobangAiMove = (room: GobangRoom): GobangPoint | null => {
  const [best] = rankGobangAiMoves(room.state.board, 1);
  return best ? { row: best.row, col: best.col } : null;
};

export const gobangCommandController: GameCommandController = {
  game: GOBANG_GAME,
  rewriteCommand(event: ScopedEvent) {
    const text = String(event.MessageText ?? "").trim().replace(/^(?:[!！/#＃]\s*)/, "");

    if (movePattern.test(text)) {
      return text.startsWith("五子棋") ? text : `五子棋${text}`;
    }

    return null;
  },
};

export const gobangGameDefinition: GameDefinition = {
  game: GOBANG_GAME,
  controller: gobangCommandController,
  compactRoutes: [
    {
      pattern: /^(?:[!！/#＃]\s*)?(?:开始)?五子棋$/,
      importer: () => import("@src/response/gobang/start/res"),
    },
    {
      pattern: /^(?:[!！/#＃]\s*)?(?:发起|加入)五子棋$/,
      importer: () => import("@src/response/gobang/join/res"),
    },
    {
      pattern: movePattern,
      importer: () => import("@src/response/gobang/move/res"),
    },
  ],
  routes: [
    {
      aliases: ["五子棋", "开始五子棋"],
      importer: () => import("@src/response/gobang/start/res"),
    },
    {
      aliases: ["发起五子棋", "加入五子棋"],
      importer: () => import("@src/response/gobang/join/res"),
    },
    {
      aliases: ["结束五子棋", "退出五子棋"],
      importer: () => import("@src/response/gobang/exit/res"),
    },
    {
      aliases: ["五子棋帮助"],
      importer: () => import("@src/response/gobang/help/res"),
    },
    {
      aliases: ["五子棋落子"],
      importer: () => import("@src/response/gobang/move/res"),
    },
  ],
};

gameRegistry.register(gobangGameDefinition);
