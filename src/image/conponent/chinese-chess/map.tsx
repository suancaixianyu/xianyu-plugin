import React from "react";
import css_output from "../../../asstes/main.css";
import type {
  ChineseChessPiece,
  ChineseChessRoom,
  ChineseChessTeam,
} from "../../../api/games/chineseChess/state";
import { CHINESE_CHESS_COLS, CHINESE_CHESS_ROWS, pointKey } from "../../../api/games/chineseChess/state";
import bg from "../../../asstes/chinese-chess/bg.png";
import bg2 from "../../../asstes/chinese-chess/bg2.png";
import bBox from "../../../asstes/chinese-chess/b_box.png";
import rBox from "../../../asstes/chinese-chess/r_box.png";
import bC from "../../../asstes/chinese-chess/b_c.png";
import bJ from "../../../asstes/chinese-chess/b_j.png";
import bM from "../../../asstes/chinese-chess/b_m.png";
import bP from "../../../asstes/chinese-chess/b_p.png";
import bS from "../../../asstes/chinese-chess/b_s.png";
import bX from "../../../asstes/chinese-chess/b_x.png";
import bZ from "../../../asstes/chinese-chess/b_z.png";
import rC from "../../../asstes/chinese-chess/r_c.png";
import rJ from "../../../asstes/chinese-chess/r_j.png";
import rM from "../../../asstes/chinese-chess/r_m.png";
import rP from "../../../asstes/chinese-chess/r_p.png";
import rS from "../../../asstes/chinese-chess/r_s.png";
import rX from "../../../asstes/chinese-chess/r_x.png";
import rZ from "../../../asstes/chinese-chess/r_z.png";

const pieceImages: Record<ChineseChessTeam, Record<Exclude<ChineseChessPiece, "空">, string>> = {
  红: {
    車: rC,
    馬: rM,
    象: rX,
    士: rS,
    将: rJ,
    炮: rP,
    兵: rZ,
  },
  黑: {
    車: bC,
    馬: bM,
    象: bX,
    士: bS,
    将: bJ,
    炮: bP,
    兵: bZ,
  },
};

const activePieceImages: Record<ChineseChessTeam, string> = {
  红: rJ,
  黑: bJ,
};

const highlightImages: Record<ChineseChessTeam, string> = {
  红: rBox,
  黑: bBox,
};

const boardWidth = 780;
const boardHeight = 830;
const boardPaddingX = 40;
const boardPaddingY = 40;
const pieceWidth = 73;
const pieceHeight = 75;
const columnPitch = (boardWidth - boardPaddingX * 2) / CHINESE_CHESS_COLS;
const rowPitch = (boardHeight - boardPaddingY * 2) / CHINESE_CHESS_ROWS;

const getPlayerName = (room: ChineseChessRoom) => {
  return (
    Object.values(room.players).find((player) => player.team === room.state.current)?.nickname ?? ""
  );
};

const getCells = (room: ChineseChessRoom) => {
  const cells: Array<{
    key: string;
    piece: ChineseChessPiece;
    owner: ChineseChessTeam | "0";
  }> = [];
  const lastMoveKeys = room.state.lastMove
    ? [pointKey(room.state.lastMove.from), pointKey(room.state.lastMove.to)]
    : [];
  const highlightTeam = room.state.current === "红" ? "黑" : "红";
  const rotated = room.state.current === "红";

  for (let row = 0; row < CHINESE_CHESS_ROWS; row += 1) {
    for (let col = 0; col < CHINESE_CHESS_COLS; col += 1) {
      const key = pointKey({ row, col });
      const viewRow = rotated ? CHINESE_CHESS_ROWS - 1 - row : row;
      const viewCol = rotated ? CHINESE_CHESS_COLS - 1 - col : col;
      cells.push({
        key,
        piece: room.state.board[key],
        owner: room.state.ownership[key],
        left: boardPaddingX + viewCol * columnPitch + (columnPitch - pieceWidth) / 2,
        top: boardPaddingY + viewRow * rowPitch,
      });
    }
  }

  return cells.map((cell) => ({
    ...cell,
    isLastMove: lastMoveKeys.includes(cell.key),
    highlightTeam,
  }));
};

export default function ChineseChessMap({ room }: { room: ChineseChessRoom }) {
  const cells = getCells(room);
  const isRollback = room.state.current === "红";

  return (
    <html>
      <head>
        <link rel="stylesheet" href={css_output} />
      </head>
      <body style={{ backgroundColor: "bisque", width: "780px" }}>
        <div
          style={{
            position: "relative",
            width: `${boardWidth}px`,
            height: `${boardHeight}px`,
            backgroundImage: `url(${isRollback ? bg2 : bg})`,
            backgroundSize: "cover",
            margin: "10px 0",
          }}
        >
          {cells.map((cell) => {
            const pieceImage =
              cell.piece !== "空" && cell.owner !== "0" ? pieceImages[cell.owner][cell.piece] : null;
            const highlightImage = cell.isLastMove ? highlightImages[cell.highlightTeam] : null;

            return (
              <div
                key={cell.key}
                style={{
                  position: "absolute",
                  left: `${cell.left}px`,
                  top: `${cell.top}px`,
                  width: "73px",
                  height: "75px",
                  backgroundImage: pieceImage ? `url(${pieceImage})` : undefined,
                  backgroundSize: "cover",
                }}
              >
                {highlightImage ? (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundImage: `url(${highlightImage})`,
                      backgroundSize: "cover",
                    }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <h1 style={{ margin: "16px 8px" }}>当前行动：</h1>
          <div
            style={{
              width: "73px",
              height: "75px",
              margin: "0 0.15rem",
              backgroundSize: "cover",
              backgroundImage: `url(${activePieceImages[room.state.current]})`,
            }}
          />
          <h2>{getPlayerName(room)}</h2>
          <h4 style={{ margin: "16px" }}>Created by Yunzai-Bot & xianyu-plugin</h4>
        </div>
      </body>
    </html>
  );
}
