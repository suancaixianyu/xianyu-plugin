import React from "react";
import css_output from "../../../asstes/main.css";
import type { GobangCell, GobangRoom } from "../../../api/games/gobang";
import { GOBANG_SIZE } from "../../../api/games/gobang";

const boardSize = 760;
const boardPadding = 40;
const cellSize = (boardSize - boardPadding * 2) / (GOBANG_SIZE - 1);
const pieceSize = 32;
const axisLabels = Array.from({ length: GOBANG_SIZE }, (_, index) => index + 1);
const axisLabelStyle = {
  position: "absolute",
  width: "28px",
  height: "22px",
  lineHeight: "22px",
  textAlign: "center",
  color: "#3d2513",
  fontSize: "18px",
  fontWeight: 700,
} as const;

const pieceStyle = (cell: GobangCell) => {
  if (cell === "X") {
    return {
      background: "radial-gradient(circle at 35% 30%, #5a5148 0%, #201b18 58%, #050505 100%)",
      border: "2px solid #090909",
      boxShadow: "0 3px 8px rgba(0,0,0,0.36)",
    };
  }

  return {
    background: "radial-gradient(circle at 35% 30%, #ffffff 0%, #f1ede4 54%, #b8ad9e 100%)",
    border: "2px solid #776d61",
    boxShadow: "0 3px 8px rgba(0,0,0,0.24)",
  };
};

const getPlayerName = (room: GobangRoom) => {
  return (
    Object.values(room.players).find((player) => player.team === room.state.current)?.nickname ?? ""
  );
};

export default function GobangMap({ room }: { room: GobangRoom }) {
  const cells = room.state.board.flatMap((row, rowIndex) =>
    row.map((cell, colIndex) => ({
      cell,
      row: rowIndex,
      col: colIndex,
      isLastMove:
        room.state.lastMove?.row === rowIndex && room.state.lastMove?.col === colIndex,
    }))
  );

  return (
    <html>
      <head>
        <link rel="stylesheet" href={css_output} />
      </head>
      <body
        style={{
          margin: 0,
          width: `${boardSize}px`,
          background: "#efe1c3",
          fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
        }}
      >
        <div
          style={{
            position: "relative",
            width: `${boardSize}px`,
            height: `${boardSize}px`,
            background: "linear-gradient(135deg, #dcb36f 0%, #bf8743 100%)",
            border: "6px solid #4f3320",
            boxSizing: "border-box",
          }}
        >
          {Array.from({ length: GOBANG_SIZE }).map((_, index) => (
            <React.Fragment key={index}>
              <div
                style={{
                  ...axisLabelStyle,
                  left: `${boardPadding + index * cellSize - 14}px`,
                  top: "12px",
                }}
              >
                {axisLabels[index]}
              </div>
              <div
                style={{
                  ...axisLabelStyle,
                  left: `${boardPadding + index * cellSize - 14}px`,
                  top: `${boardSize - 34}px`,
                }}
              >
                {axisLabels[index]}
              </div>
              <div
                style={{
                  ...axisLabelStyle,
                  left: "10px",
                  top: `${boardPadding + index * cellSize - 11}px`,
                }}
              >
                {axisLabels[index]}
              </div>
              <div
                style={{
                  ...axisLabelStyle,
                  left: `${boardSize - 38}px`,
                  top: `${boardPadding + index * cellSize - 11}px`,
                }}
              >
                {axisLabels[index]}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: `${boardPadding}px`,
                  top: `${boardPadding + index * cellSize}px`,
                  width: `${boardSize - boardPadding * 2}px`,
                  height: "2px",
                  background: "#4f3320",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: `${boardPadding + index * cellSize}px`,
                  top: `${boardPadding}px`,
                  width: "2px",
                  height: `${boardSize - boardPadding * 2}px`,
                  background: "#4f3320",
                }}
              />
            </React.Fragment>
          ))}

          {cells.map(({ cell, row, col, isLastMove }) => {
            if (cell === "-") {
              return null;
            }

            return (
              <div
                key={`${row}-${col}`}
                style={{
                  position: "absolute",
                  left: `${boardPadding + col * cellSize - pieceSize / 2}px`,
                  top: `${boardPadding + row * cellSize - pieceSize / 2}px`,
                  width: `${pieceSize}px`,
                  height: `${pieceSize}px`,
                  borderRadius: "50%",
                  boxSizing: "border-box",
                  ...pieceStyle(cell),
                }}
              >
                {isLastMove ? (
                  <div
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: "10px",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: cell === "X" ? "#f7e58a" : "#8d1d18",
                    }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "18px",
            padding: "18px 20px 22px",
            color: "#3a2618",
          }}
        >
          <h2 style={{ margin: 0 }}>当前行动：{room.state.current}棋</h2>
          <h3 style={{ margin: 0 }}>{getPlayerName(room)}</h3>
          <h3 style={{ margin: 0 }}>步数：{room.state.moveCount}</h3>
          <h3 style={{ margin: 0, fontSize: "16px" }}>坐标：横 x（左→右），纵 y（上→下）</h3>
        </div>
      </body>
    </html>
  );
}
