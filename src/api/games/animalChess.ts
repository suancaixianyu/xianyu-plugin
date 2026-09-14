import { gameRegistry } from "../gameRegistry";
import type { BoardRoom } from "../boardRooms";
import type { GameCommandController, GameDefinition, ScopedEvent } from "../type";

export const ANIMAL_CHESS_GAME = "animal-chess" as const;
export const ANIMAL_CHESS_ROWS = 9;
export const ANIMAL_CHESS_COLS = 7;

export type AnimalChessTeam = "红" | "蓝";
export type AnimalChessPiece = "象" | "狮" | "虎" | "豹" | "狼" | "狗" | "猫" | "鼠" | "空";
export type AnimalChessTerrain = "空" | "河" | "井" | "穴";

export interface AnimalChessPoint {
  row: number;
  col: number;
}

export interface AnimalChessCell {
  piece: AnimalChessPiece;
  terrain: AnimalChessTerrain;
  owner: AnimalChessTeam | "0";
  home: AnimalChessTeam | "0";
}

export interface AnimalChessMoveIntent {
  from: AnimalChessPoint;
  to: AnimalChessPoint;
  raw: string;
}

export interface AnimalChessState {
  board: AnimalChessCell[][];
  current: AnimalChessTeam;
  lastMove?: AnimalChessMoveIntent;
  moveCount: number;
}

export type AnimalChessRoom = BoardRoom<AnimalChessState>;

const animalMovePattern =
  /^(?:[!！/#＃]\s*)?(?:(?:斗兽|动物)棋)?(?:移动\s*)?([a-iA-I]\s*[0-6])\s*([a-iA-I]\s*[0-6])$/;

const initialAnimalChessLayout: (AnimalChessPiece | AnimalChessTerrain)[][] = [
  ["狮", "空", "井", "穴", "井", "空", "虎"],
  ["空", "狗", "空", "井", "空", "猫", "空"],
  ["鼠", "空", "豹", "空", "狼", "空", "象"],
  ["空", "河", "河", "空", "河", "河", "空"],
  ["空", "河", "河", "空", "河", "河", "空"],
  ["空", "河", "河", "空", "河", "河", "空"],
  ["象", "空", "狼", "空", "豹", "空", "鼠"],
  ["空", "猫", "空", "井", "空", "狗", "空"],
  ["虎", "空", "井", "穴", "井", "空", "狮"],
];

const pieceRanks: Record<Exclude<AnimalChessPiece, "空">, number> = {
  鼠: 1,
  猫: 2,
  狗: 3,
  狼: 4,
  豹: 5,
  虎: 6,
  狮: 7,
  象: 8,
};

const riverJumpPieces = new Set<AnimalChessPiece>(["狮", "虎", "豹"]);

export const opponentAnimalChessTeam = (team: AnimalChessTeam): AnimalChessTeam =>
  team === "红" ? "蓝" : "红";

export const cloneAnimalChessState = (state: AnimalChessState): AnimalChessState => ({
  board: state.board.map((row) => row.map((cell) => ({ ...cell }))),
  current: state.current,
  lastMove: state.lastMove
    ? {
        from: { ...state.lastMove.from },
        to: { ...state.lastMove.to },
        raw: state.lastMove.raw,
      }
    : undefined,
  moveCount: state.moveCount,
});

export const formatAnimalChessPoint = (point: AnimalChessPoint) =>
  `${String.fromCharCode(65 + point.row)}${point.col}`;

export const parseAnimalChessPoint = (input: string): AnimalChessPoint | null => {
  const match = input.trim().match(/^([a-iA-I])\s*([0-6])$/);
  if (!match) {
    return null;
  }

  return {
    row: match[1].toUpperCase().charCodeAt(0) - 65,
    col: Number(match[2]),
  };
};

export const parseAnimalChessMove = (raw: string): AnimalChessMoveIntent | null => {
  const text = raw.trim().replace(/^(?:[!！/#＃]\s*)/, "");
  const match = text.match(animalMovePattern);
  if (!match) {
    return null;
  }

  const from = parseAnimalChessPoint(match[1]);
  const to = parseAnimalChessPoint(match[2]);
  if (!from || !to) {
    return null;
  }

  return { from, to, raw };
};

export const isInsideAnimalChessBoard = (point: AnimalChessPoint) =>
  point.row >= 0 &&
  point.row < ANIMAL_CHESS_ROWS &&
  point.col >= 0 &&
  point.col < ANIMAL_CHESS_COLS;

const createCell = (
  value: AnimalChessPiece | AnimalChessTerrain,
  row: number
): AnimalChessCell => {
  const isTerrain = value === "河" || value === "井" || value === "穴";
  const home = row <= 2 ? "红" : row >= 6 ? "蓝" : "0";

  return {
    piece: isTerrain ? "空" : value,
    terrain: isTerrain ? value : "空",
    owner: isTerrain || value === "空" ? "0" : row <= 2 ? "红" : "蓝",
    home: isTerrain && value !== "河" ? home : "0",
  };
};

export const createAnimalChessState = (): AnimalChessState => ({
  board: initialAnimalChessLayout.map((row, rowIndex) =>
    row.map((cell) => createCell(cell, rowIndex))
  ),
  current: "红",
  moveCount: 0,
});

export const createAnimalChessRoom = (): AnimalChessRoom => {
  const state = createAnimalChessState();
  const now = Date.now();

  return {
    game: ANIMAL_CHESS_GAME,
    status: "waiting",
    players: {},
    state,
    history: [cloneAnimalChessState(state)],
    turn: "红",
    createdAt: now,
    updatedAt: now,
  };
};

const getCell = (room: AnimalChessRoom, point: AnimalChessPoint) =>
  room.state.board[point.row]?.[point.col];

const isAdjacent = (from: AnimalChessPoint, to: AnimalChessPoint) =>
  Math.abs(from.row - to.row) + Math.abs(from.col - to.col) === 1;

const getRiverJumpDestination = (
  room: AnimalChessRoom,
  from: AnimalChessPoint,
  to: AnimalChessPoint
) => {
  const fromCell = getCell(room, from);
  if (!fromCell || !riverJumpPieces.has(fromCell.piece)) {
    return null;
  }

  if (from.row !== to.row && from.col !== to.col) {
    return null;
  }

  const rowStep = Math.sign(to.row - from.row);
  const colStep = Math.sign(to.col - from.col);
  let row = from.row + rowStep;
  let col = from.col + colStep;
  let crossedRiver = false;

  while (row >= 0 && row < ANIMAL_CHESS_ROWS && col >= 0 && col < ANIMAL_CHESS_COLS) {
    const cell = room.state.board[row][col];

    if (cell.terrain !== "河") {
      return crossedRiver && row === to.row && col === to.col ? to : null;
    }

    if (cell.piece === "鼠") {
      return null;
    }

    crossedRiver = true;
    row += rowStep;
    col += colStep;
  }

  return null;
};

const canCapture = (
  attacker: AnimalChessCell,
  target: AnimalChessCell,
  attackerTeam: AnimalChessTeam
) => {
  if (target.piece === "空") {
    return true;
  }

  if (target.home === attackerTeam && target.terrain === "井") {
    return true;
  }

  if (attacker.piece === "鼠" && target.piece === "象") {
    return attacker.terrain !== "河";
  }

  if (attacker.terrain === "河" && target.terrain !== "河") {
    return false;
  }

  if (attacker.piece === "象" && target.piece === "鼠") {
    return false;
  }

  if (attacker.piece === "空" || target.piece === "空") {
    return true;
  }

  return pieceRanks[attacker.piece] >= pieceRanks[target.piece];
};

export interface AnimalChessMoveResult {
  ok: boolean;
  message?: string;
  win?: boolean;
}

export const validateAnimalChessMove = (
  room: AnimalChessRoom,
  intent: AnimalChessMoveIntent,
  userId: string
): AnimalChessMoveResult => {
  const player = room.players[userId];
  if (!player) {
    return { ok: false, message: "你还没加入斗兽棋" };
  }

  const team = player.team as AnimalChessTeam;
  if (team !== room.state.current) {
    return { ok: false, message: `当前不是你的回合，现在轮到${room.state.current}队。` };
  }

  if (!isInsideAnimalChessBoard(intent.from) || !isInsideAnimalChessBoard(intent.to)) {
    return { ok: false, message: "坐标超出棋盘" };
  }

  const fromCell = getCell(room, intent.from);
  const toCell = getCell(room, intent.to);
  if (!fromCell || !toCell || fromCell.piece === "空") {
    return { ok: false, message: "起点没有棋子" };
  }

  if (fromCell.owner !== team) {
    return { ok: false, message: `只能操作自己的棋子，你是${team}队。` };
  }

  if (toCell.owner === team) {
    return { ok: false, message: "目标位置是自己的棋子" };
  }

  if (toCell.terrain === "穴" && toCell.home === team) {
    return { ok: false, message: "不能进入自己的兽穴" };
  }

  const riverJumpDestination = getRiverJumpDestination(room, intent.from, intent.to);
  const normalStep = isAdjacent(intent.from, intent.to);

  if (!normalStep && !riverJumpDestination) {
    return { ok: false, message: "移动不正确" };
  }

  if (toCell.terrain === "河" && fromCell.piece !== "鼠") {
    return { ok: false, message: "只有鼠可以进入河流" };
  }

  if (!canCapture(fromCell, toCell, team)) {
    return { ok: false, message: "目标棋子更强，不能吃子" };
  }

  return {
    ok: true,
    win: toCell.terrain === "穴" && toCell.home === opponentAnimalChessTeam(team),
  };
};

export const applyAnimalChessMove = (
  room: AnimalChessRoom,
  intent: AnimalChessMoveIntent,
  team: AnimalChessTeam
) => {
  const fromCell = getCell(room, intent.from);
  const toCell = getCell(room, intent.to);
  if (!fromCell || !toCell) {
    return;
  }

  room.history.push(cloneAnimalChessState(room.state));
  toCell.piece = fromCell.piece;
  toCell.owner = team;
  fromCell.piece = "空";
  fromCell.owner = "0";
  room.state.lastMove = intent;
  room.state.moveCount += 1;
  room.state.current = opponentAnimalChessTeam(team);
  room.turn = room.state.current;
};

export const animalChessCommandController: GameCommandController = {
  game: ANIMAL_CHESS_GAME,
  rewriteCommand(event: ScopedEvent) {
    const text = String(event.MessageText ?? "").trim().replace(/^(?:[!！/#＃]\s*)/, "");

    if (animalMovePattern.test(text)) {
      return text.startsWith("斗兽棋") || text.startsWith("动物棋") ? text : `斗兽棋${text}`;
    }

    return null;
  },
};

export const animalChessGameDefinition: GameDefinition = {
  game: ANIMAL_CHESS_GAME,
  controller: animalChessCommandController,
  compactRoutes: [
    {
      pattern: /^(?:[!！/#＃]\s*)?(?:发起|加入)(?:斗兽|动物)棋\s*[红蓝]?$/,
      importer: () => import("@src/response/animal-chess/join/res"),
    },
    {
      pattern: animalMovePattern,
      importer: () => import("@src/response/animal-chess/move/res"),
    },
  ],
  routes: [
    {
      aliases: ["发起斗兽棋", "加入斗兽棋", "发起动物棋", "加入动物棋"],
      importer: () => import("@src/response/animal-chess/join/res"),
    },
    {
      aliases: ["斗兽棋移动", "动物棋移动"],
      importer: () => import("@src/response/animal-chess/move/res"),
    },
    {
      aliases: ["结束斗兽棋", "退出斗兽棋", "结束动物棋"],
      importer: () => import("@src/response/animal-chess/exit/res"),
    },
    {
      aliases: ["斗兽棋帮助", "动物棋帮助"],
      importer: () => import("@src/response/animal-chess/help/res"),
    },
  ],
};

gameRegistry.register(animalChessGameDefinition);
