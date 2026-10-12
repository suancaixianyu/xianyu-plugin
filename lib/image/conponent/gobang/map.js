import React from 'react';
import fileUrl from '../../../asstes/main.css.js';
import { GOBANG_SIZE } from '../../../api/games/gobang.js';

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
};
const pieceStyle = (cell) => {
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
const getPlayerName = (room) => {
    return (Object.values(room.players).find((player) => player.team === room.state.current)?.nickname ?? "");
};
function GobangMap({ room }) {
    const cells = room.state.board.flatMap((row, rowIndex) => row.map((cell, colIndex) => ({
        cell,
        row: rowIndex,
        col: colIndex,
        isLastMove: room.state.lastMove?.row === rowIndex && room.state.lastMove?.col === colIndex,
    })));
    return (React.createElement("html", null,
        React.createElement("head", null,
            React.createElement("link", { rel: "stylesheet", href: fileUrl })),
        React.createElement("body", { style: {
                margin: 0,
                width: `${boardSize}px`,
                background: "#efe1c3",
                fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
            } },
            React.createElement("div", { style: {
                    position: "relative",
                    width: `${boardSize}px`,
                    height: `${boardSize}px`,
                    background: "linear-gradient(135deg, #dcb36f 0%, #bf8743 100%)",
                    border: "6px solid #4f3320",
                    boxSizing: "border-box",
                } },
                Array.from({ length: GOBANG_SIZE }).map((_, index) => (React.createElement(React.Fragment, { key: index },
                    React.createElement("div", { style: {
                            ...axisLabelStyle,
                            left: `${boardPadding + index * cellSize - 14}px`,
                            top: "12px",
                        } }, axisLabels[index]),
                    React.createElement("div", { style: {
                            ...axisLabelStyle,
                            left: `${boardPadding + index * cellSize - 14}px`,
                            top: `${boardSize - 34}px`,
                        } }, axisLabels[index]),
                    React.createElement("div", { style: {
                            ...axisLabelStyle,
                            left: "10px",
                            top: `${boardPadding + index * cellSize - 11}px`,
                        } }, axisLabels[index]),
                    React.createElement("div", { style: {
                            ...axisLabelStyle,
                            left: `${boardSize - 38}px`,
                            top: `${boardPadding + index * cellSize - 11}px`,
                        } }, axisLabels[index]),
                    React.createElement("div", { style: {
                            position: "absolute",
                            left: `${boardPadding}px`,
                            top: `${boardPadding + index * cellSize}px`,
                            width: `${boardSize - boardPadding * 2}px`,
                            height: "2px",
                            background: "#4f3320",
                        } }),
                    React.createElement("div", { style: {
                            position: "absolute",
                            left: `${boardPadding + index * cellSize}px`,
                            top: `${boardPadding}px`,
                            width: "2px",
                            height: `${boardSize - boardPadding * 2}px`,
                            background: "#4f3320",
                        } })))),
                cells.map(({ cell, row, col, isLastMove }) => {
                    if (cell === "-") {
                        return null;
                    }
                    return (React.createElement("div", { key: `${row}-${col}`, style: {
                            position: "absolute",
                            left: `${boardPadding + col * cellSize - pieceSize / 2}px`,
                            top: `${boardPadding + row * cellSize - pieceSize / 2}px`,
                            width: `${pieceSize}px`,
                            height: `${pieceSize}px`,
                            borderRadius: "50%",
                            boxSizing: "border-box",
                            ...pieceStyle(cell),
                        } }, isLastMove ? (React.createElement("div", { style: {
                            position: "absolute",
                            left: "10px",
                            top: "10px",
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: cell === "X" ? "#f7e58a" : "#8d1d18",
                        } })) : null));
                })),
            React.createElement("div", { style: {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "18px",
                    padding: "18px 20px 22px",
                    color: "#3a2618",
                } },
                React.createElement("h2", { style: { margin: 0 } },
                    "\u5F53\u524D\u884C\u52A8\uFF1A",
                    room.state.current,
                    "\u68CB"),
                React.createElement("h3", { style: { margin: 0 } }, getPlayerName(room)),
                React.createElement("h3", { style: { margin: 0 } },
                    "\u6B65\u6570\uFF1A",
                    room.state.moveCount),
                React.createElement("h3", { style: { margin: 0, fontSize: "16px" } }, "\u5750\u6807\uFF1A\u6A2A x\uFF08\u5DE6\u2192\u53F3\uFF09\uFF0C\u7EB5 y\uFF08\u4E0A\u2192\u4E0B\uFF09")))));
}

export { GobangMap as default };
