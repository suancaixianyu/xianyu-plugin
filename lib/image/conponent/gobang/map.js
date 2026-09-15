import { GOBANG_SIZE } from "../../../api/games/gobang.js";
import fileUrl from "../../../_virtual/_lvy-css_0.js";
import React from "react";

//#region src/image/conponent/gobang/map.tsx
const boardSize = 760;
const boardPadding = 40;
const cellSize = 680 / (17 - 1);
const pieceSize = 32;
const axisLabels = Array.from({ length: 17 }, (_, index) => index + 1);
const axisLabelStyle = {
	position: "absolute",
	width: "28px",
	height: "22px",
	lineHeight: "22px",
	textAlign: "center",
	color: "#3d2513",
	fontSize: "18px",
	fontWeight: 700
};
const pieceStyle = (cell) => {
	if (cell === "X") return {
		background: "radial-gradient(circle at 35% 30%, #5a5148 0%, #201b18 58%, #050505 100%)",
		border: "2px solid #090909",
		boxShadow: "0 3px 8px rgba(0,0,0,0.36)"
	};
	return {
		background: "radial-gradient(circle at 35% 30%, #ffffff 0%, #f1ede4 54%, #b8ad9e 100%)",
		border: "2px solid #776d61",
		boxShadow: "0 3px 8px rgba(0,0,0,0.24)"
	};
};
const getPlayerName = (room) => {
	return Object.values(room.players).find((player) => player.team === room.state.current)?.nickname ?? "";
};
function GobangMap({ room }) {
	const cells = room.state.board.flatMap((row, rowIndex) => row.map((cell, colIndex) => ({
		cell,
		row: rowIndex,
		col: colIndex,
		isLastMove: room.state.lastMove?.row === rowIndex && room.state.lastMove?.col === colIndex
	})));
	return /* @__PURE__ */ React.createElement("html", null, /* @__PURE__ */ React.createElement("head", null, /* @__PURE__ */ React.createElement("link", {
		rel: "stylesheet",
		href: fileUrl
	})), /* @__PURE__ */ React.createElement("body", { style: {
		margin: 0,
		width: `${boardSize}px`,
		background: "#efe1c3",
		fontFamily: "\"Segoe UI\", \"Microsoft YaHei\", sans-serif"
	} }, /* @__PURE__ */ React.createElement("div", { style: {
		position: "relative",
		width: `${boardSize}px`,
		height: `${boardSize}px`,
		background: "linear-gradient(135deg, #dcb36f 0%, #bf8743 100%)",
		border: "6px solid #4f3320",
		boxSizing: "border-box"
	} }, Array.from({ length: 17 }).map((_, index) => /* @__PURE__ */ React.createElement(React.Fragment, { key: index }, /* @__PURE__ */ React.createElement("div", { style: {
		...axisLabelStyle,
		left: `${boardPadding + index * cellSize - 14}px`,
		top: "12px"
	} }, axisLabels[index]), /* @__PURE__ */ React.createElement("div", { style: {
		...axisLabelStyle,
		left: `${boardPadding + index * cellSize - 14}px`,
		top: `726px`
	} }, axisLabels[index]), /* @__PURE__ */ React.createElement("div", { style: {
		...axisLabelStyle,
		left: "10px",
		top: `${boardPadding + index * cellSize - 11}px`
	} }, axisLabels[index]), /* @__PURE__ */ React.createElement("div", { style: {
		...axisLabelStyle,
		left: `722px`,
		top: `${boardPadding + index * cellSize - 11}px`
	} }, axisLabels[index]), /* @__PURE__ */ React.createElement("div", { style: {
		position: "absolute",
		left: `${boardPadding}px`,
		top: `${boardPadding + index * cellSize}px`,
		width: `680px`,
		height: "2px",
		background: "#4f3320"
	} }), /* @__PURE__ */ React.createElement("div", { style: {
		position: "absolute",
		left: `${boardPadding + index * cellSize}px`,
		top: `${boardPadding}px`,
		width: "2px",
		height: `680px`,
		background: "#4f3320"
	} }))), cells.map(({ cell, row, col, isLastMove }) => {
		if (cell === "-") return null;
		return /* @__PURE__ */ React.createElement("div", {
			key: `${row}-${col}`,
			style: {
				position: "absolute",
				left: `${boardPadding + col * cellSize - pieceSize / 2}px`,
				top: `${boardPadding + row * cellSize - pieceSize / 2}px`,
				width: `${pieceSize}px`,
				height: `${pieceSize}px`,
				borderRadius: "50%",
				boxSizing: "border-box",
				...pieceStyle(cell)
			}
		}, isLastMove ? /* @__PURE__ */ React.createElement("div", { style: {
			position: "absolute",
			left: "10px",
			top: "10px",
			width: "8px",
			height: "8px",
			borderRadius: "50%",
			background: cell === "X" ? "#f7e58a" : "#8d1d18"
		} }) : null);
	})), /* @__PURE__ */ React.createElement("div", { style: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		gap: "18px",
		padding: "18px 20px 22px",
		color: "#3a2618"
	} }, /* @__PURE__ */ React.createElement("h2", { style: { margin: 0 } }, "当前行动：", room.state.current, "棋"), /* @__PURE__ */ React.createElement("h3", { style: { margin: 0 } }, getPlayerName(room)), /* @__PURE__ */ React.createElement("h3", { style: { margin: 0 } }, "步数：", room.state.moveCount), /* @__PURE__ */ React.createElement("h3", { style: {
		margin: 0,
		fontSize: "16px"
	} }, "坐标：横 x（左→右），纵 y（上→下）"))));
}

//#endregion
export { GobangMap as default };