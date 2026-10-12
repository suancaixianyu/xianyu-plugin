import React from 'react';
import fileUrl from '../../../asstes/main.css.js';
import { formatAnimalChessPoint, ANIMAL_CHESS_ROWS, ANIMAL_CHESS_COLS } from '../../../api/games/animalChess.js';

const cellSize = 86;
const axisSize = 42;
const boardWidth = axisSize * 2 + cellSize * ANIMAL_CHESS_COLS;
const boardHeight = axisSize * 2 + cellSize * ANIMAL_CHESS_ROWS;
const terrainColors = {
    空: "#d9b36f",
    河: "#5ea6cf",
    井: "#c7b28e",
    穴: "#a98654",
};
const teamColors = {
    红: "#b91c1c",
    蓝: "#2563eb",
};
const getCellLabel = (cell) => {
    if (cell.piece !== "空")
        return cell.piece;
    if (cell.terrain === "河")
        return "河";
    if (cell.terrain === "井")
        return "陷";
    if (cell.terrain === "穴")
        return "穴";
    return "";
};
const getCurrentPlayerName = (room) => Object.values(room.players).find((player) => player.team === room.state.current)?.nickname ?? "";
function AnimalChessMap({ room }) {
    const cells = room.state.board.flatMap((row, rowIndex) => row.map((cell, colIndex) => ({
        cell,
        row: rowIndex,
        col: colIndex,
        key: formatAnimalChessPoint({ row: rowIndex, col: colIndex }),
        isLastMove: (room.state.lastMove?.from.row === rowIndex && room.state.lastMove?.from.col === colIndex) ||
            (room.state.lastMove?.to.row === rowIndex && room.state.lastMove?.to.col === colIndex),
    })));
    return (React.createElement("html", null,
        React.createElement("head", null,
            React.createElement("link", { rel: "stylesheet", href: fileUrl })),
        React.createElement("body", { style: {
                margin: 0,
                width: `${boardWidth}px`,
                background: "#efe4c8",
                fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
                color: "#312312",
            } },
            React.createElement("div", { style: {
                    position: "relative",
                    width: `${boardWidth}px`,
                    height: `${boardHeight}px`,
                    background: "#c99b57",
                    border: "6px solid #4d321d",
                    boxSizing: "border-box",
                } },
                Array.from({ length: ANIMAL_CHESS_ROWS }).map((_, row) => (React.createElement("div", { key: `row-${row}`, style: {
                        position: "absolute",
                        left: "4px",
                        top: `${axisSize + row * cellSize + 29}px`,
                        width: `${axisSize - 8}px`,
                        textAlign: "center",
                        fontSize: "20px",
                        fontWeight: 800,
                    } }, String.fromCharCode(65 + row)))),
                Array.from({ length: ANIMAL_CHESS_COLS }).map((_, col) => (React.createElement("div", { key: `col-${col}`, style: {
                        position: "absolute",
                        left: `${axisSize + col * cellSize + 29}px`,
                        top: "10px",
                        width: "28px",
                        textAlign: "center",
                        fontSize: "20px",
                        fontWeight: 800,
                    } }, col))),
                cells.map(({ cell, row, col, key, isLastMove }) => (React.createElement("div", { key: key, style: {
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
                    } },
                    React.createElement("div", { style: {
                            position: "absolute",
                            left: "4px",
                            top: "3px",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "rgba(49,35,18,0.72)",
                        } }, key),
                    isLastMove ? (React.createElement("div", { style: {
                            position: "absolute",
                            inset: "5px",
                            border: "4px solid #f7e26b",
                            boxSizing: "border-box",
                        } })) : null,
                    getCellLabel(cell) ? (React.createElement("div", { style: {
                            width: "58px",
                            height: "58px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: cell.piece === "空" ? "rgba(255,255,255,0.34)" : "#fff7dd",
                            border: cell.piece !== "空" && cell.owner !== "0"
                                ? `5px solid ${teamColors[cell.owner]}`
                                : "2px solid rgba(80,54,29,0.45)",
                            fontSize: cell.piece === "空" ? "22px" : "34px",
                            fontWeight: 900,
                            color: cell.piece !== "空" && cell.owner !== "0"
                                ? teamColors[cell.owner]
                                : "#51371f",
                            boxSizing: "border-box",
                        } }, getCellLabel(cell))) : null)))),
            React.createElement("div", { style: {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "18px",
                    padding: "16px 18px 20px",
                    color: "#3a2618",
                } },
                React.createElement("h2", { style: { margin: 0 } },
                    "\u5F53\u524D\u884C\u52A8\uFF1A",
                    room.state.current,
                    "\u961F"),
                React.createElement("h3", { style: { margin: 0 } }, getCurrentPlayerName(room)),
                React.createElement("h3", { style: { margin: 0 } },
                    "\u6B65\u6570\uFF1A",
                    room.state.moveCount)))));
}

export { AnimalChessMap as default };
