import React from "react";
import css_output from "../../../asstes/main.css";
import type {
  AnimalChessCell,
  AnimalChessRoom,
  AnimalChessTeam,
} from "../../../api/games/animalChess";
import {
  ANIMAL_CHESS_COLS,
  ANIMAL_CHESS_ROWS,
  formatAnimalChessPoint,
} from "../../../api/games/animalChess";

const cellSize = 86;
const axisSize = 42;
const boardWidth = axisSize * 2 + cellSize * ANIMAL_CHESS_COLS;
const boardHeight = axisSize * 2 + cellSize * ANIMAL_CHESS_ROWS;

const terrainColors: Record<AnimalChessCell["terrain"], string> = {
  空: "#d9b36f",
  河: "#5ea6cf",
  井: "#c7b28e",
  穴: "#a98654",
};

const teamColors: Record<AnimalChessTeam, string> = {
  红: "#b91c1c",
  蓝: "#2563eb",
};

const getCellLabel = (cell: AnimalChessCell) => {
  if (cell.piece !== "空") return cell.piece;
  if (cell.terrain === "河") return "河";
  if (cell.terrain === "井") return "陷";
  if (cell.terrain === "穴") return "穴";
  return "";
};

const getCurrentPlayerName = (room: AnimalChessRoom) =>
  Object.values(room.players).find((player) => player.team === room.state.current)?.nickname ?? "";

export default function AnimalChessMap({ room }: { room: AnimalChessRoom }) {
  const cells = room.state.board.flatMap((row, rowIndex) =>
    row.map((cell, colIndex) => ({
      cell,
      row: rowIndex,
      col: colIndex,
      key: formatAnimalChessPoint({ row: rowIndex, col: colIndex }),
      isLastMove:
        (room.state.lastMove?.from.row === rowIndex && room.state.lastMove?.from.col === colIndex) ||
        (room.state.lastMove?.to.row === rowIndex && room.state.lastMove?.to.col === colIndex),
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
          width: `${boardWidth}px`,
          background: "#efe4c8",
          fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
          color: "#312312",
        }}
      >
        <div
          style={{
            position: "relative",
            width: `${boardWidth}px`,
            height: `${boardHeight}px`,
            background: "#c99b57",
            border: "6px solid #4d321d",
            boxSizing: "border-box",
          }}
        >
          {Array.from({ length: ANIMAL_CHESS_ROWS }).map((_, row) => (
            <div
              key={`row-${row}`}
              style={{
                position: "absolute",
                left: "4px",
                top: `${axisSize + row * cellSize + 29}px`,
                width: `${axisSize - 8}px`,
                textAlign: "center",
                fontSize: "20px",
                fontWeight: 800,
              }}
            >
              {String.fromCharCode(65 + row)}
            </div>
          ))}

          {Array.from({ length: ANIMAL_CHESS_COLS }).map((_, col) => (
            <div
              key={`col-${col}`}
              style={{
                position: "absolute",
                left: `${axisSize + col * cellSize + 29}px`,
                top: "10px",
                width: "28px",
                textAlign: "center",
                fontSize: "20px",
                fontWeight: 800,
              }}
            >
              {col}
            </div>
          ))}

          {cells.map(({ cell, row, col, key, isLastMove }) => (
            <div
              key={key}
              style={{
                position: "absolute",
                left: `${axisSize + col * cellSize}px`,
                top: `${axisSize + row * cellSize}px`,
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                boxSizing: "border-box",
                border: "2px solid #6a4827",
                background: terrainColors[cell.terrain],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "4px",
                  top: "3px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "rgba(49,35,18,0.72)",
                }}
              >
                {key}
              </div>
              {isLastMove ? (
                <div
                  style={{
                    position: "absolute",
                    inset: "5px",
                    border: "4px solid #f7e26b",
                    boxSizing: "border-box",
                  }}
                />
              ) : null}
              {getCellLabel(cell) ? (
                <div
                  style={{
                    width: "58px",
                    height: "58px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      cell.piece === "空" ? "rgba(255,255,255,0.34)" : "#fff7dd",
                    border:
                      cell.piece !== "空" && cell.owner !== "0"
                        ? `5px solid ${teamColors[cell.owner]}`
                        : "2px solid rgba(80,54,29,0.45)",
                    fontSize: cell.piece === "空" ? "22px" : "34px",
                    fontWeight: 900,
                    color:
                      cell.piece !== "空" && cell.owner !== "0"
                        ? teamColors[cell.owner]
                        : "#51371f",
                    boxSizing: "border-box",
                  }}
                >
                  {getCellLabel(cell)}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "18px",
            padding: "16px 18px 20px",
            color: "#3a2618",
          }}
        >
          <h2 style={{ margin: 0 }}>当前行动：{room.state.current}队</h2>
          <h3 style={{ margin: 0 }}>{getCurrentPlayerName(room)}</h3>
          <h3 style={{ margin: 0 }}>步数：{room.state.moveCount}</h3>
        </div>
      </body>
    </html>
  );
}
