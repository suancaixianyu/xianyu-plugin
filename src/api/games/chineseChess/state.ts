import type { BoardRoom } from "../../boardRooms";

export type ChineseChessTeam = "红" | "黑";
export type ChineseChessPiece = "車" | "馬" | "象" | "士" | "将" | "炮" | "兵" | "空";

export interface ChineseChessPoint {
  row: number;
  col: number;
}

export interface ChineseChessMoveIntent {
  from: ChineseChessPoint;
  to: ChineseChessPoint;
  input: {
    raw: string;
    mode: "coordinate" | "notation";
  };
}

export interface ChineseChessState {
  board: Record<string, ChineseChessPiece>;
  ownership: Record<string, ChineseChessTeam | "0">;
  current: ChineseChessTeam;
  lastMove?: ChineseChessMoveIntent;
}

export interface ChineseChessUndoRequest {
  requesterUserId: string;
  approverUserId: string;
  requestedAt: number;
}

export interface ChineseChessRoom extends BoardRoom<ChineseChessState> {
  undoRequest?: ChineseChessUndoRequest;
}

export const CHINESE_CHESS_ROWS = 10;
export const CHINESE_CHESS_COLS = 9;

export const initialChineseChessBoard: ChineseChessPiece[][] = [
  ["車", "馬", "象", "士", "将", "士", "象", "馬", "車"],
  ["空", "空", "空", "空", "空", "空", "空", "空", "空"],
  ["空", "炮", "空", "空", "空", "空", "空", "炮", "空"],
  ["兵", "空", "兵", "空", "兵", "空", "兵", "空", "兵"],
  ["空", "空", "空", "空", "空", "空", "空", "空", "空"],
  ["空", "空", "空", "空", "空", "空", "空", "空", "空"],
  ["兵", "空", "兵", "空", "兵", "空", "兵", "空", "兵"],
  ["空", "炮", "空", "空", "空", "空", "空", "炮", "空"],
  ["空", "空", "空", "空", "空", "空", "空", "空", "空"],
  ["車", "馬", "象", "士", "将", "士", "象", "馬", "車"],
];

export const pointKey = (point: ChineseChessPoint) => `${point.row}-${point.col}`;

export const isInsideChineseChessBoard = (point: ChineseChessPoint) =>
  point.row >= 0 && point.row < CHINESE_CHESS_ROWS && point.col >= 0 && point.col < CHINESE_CHESS_COLS;

export const cloneChineseChessState = (state: ChineseChessState): ChineseChessState => ({
  board: { ...state.board },
  ownership: { ...state.ownership },
  current: state.current,
  lastMove: state.lastMove
    ? {
        from: { ...state.lastMove.from },
        to: { ...state.lastMove.to },
        input: { ...state.lastMove.input },
      }
    : undefined,
});

export const createChineseChessState = (): ChineseChessState => {
  const board: ChineseChessState["board"] = {};
  const ownership: ChineseChessState["ownership"] = {};

  for (let row = 0; row < CHINESE_CHESS_ROWS; row += 1) {
    for (let col = 0; col < CHINESE_CHESS_COLS; col += 1) {
      const piece = initialChineseChessBoard[row][col];
      const key = pointKey({ row, col });
      board[key] = piece;

      if (piece === "空") {
        ownership[key] = "0";
      } else if (row < 4) {
        ownership[key] = "红";
      } else {
        ownership[key] = "黑";
      }
    }
  }

  return {
    board,
    ownership,
    current: "红",
  };
};

export const createChineseChessRoom = (): ChineseChessRoom => {
  const state = createChineseChessState();
  const now = Date.now();

  return {
    game: "chinese-chess",
    status: "waiting",
    players: {},
    state,
    history: [cloneChineseChessState(state)],
    turn: "红",
    createdAt: now,
    updatedAt: now,
  };
};

export const opponentTeam = (team: ChineseChessTeam): ChineseChessTeam => (team === "红" ? "黑" : "红");
