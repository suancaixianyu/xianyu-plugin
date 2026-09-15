import fileUrl from "../../../_virtual/_lvy-css_0.js";
import { CHINESE_CHESS_COLS, CHINESE_CHESS_ROWS, formatChineseChessMoveIntent, pointKey } from "../../../api/games/chineseChess/state.js";
import fileUrl$1 from "../../../_virtual/_lvy-asset_14.js";
import fileUrl$2 from "../../../_virtual/_lvy-asset_15.js";
import fileUrl$3 from "../../../_virtual/_lvy-asset_1.js";
import fileUrl$4 from "../../../_virtual/_lvy-asset_6.js";
import fileUrl$5 from "../../../_virtual/_lvy-asset_10.js";
import fileUrl$6 from "../../../_virtual/_lvy-asset_2.js";
import fileUrl$7 from "../../../_virtual/_lvy-asset_16.js";
import fileUrl$8 from "../../../_virtual/_lvy-asset_11.js";
import fileUrl$9 from "../../../_virtual/_lvy-asset_17.js";
import fileUrl$10 from "../../../_virtual/_lvy-asset_7.js";
import fileUrl$11 from "../../../_virtual/_lvy-asset_8.js";
import fileUrl$12 from "../../../_virtual/_lvy-asset_0.js";
import fileUrl$13 from "../../../_virtual/_lvy-asset_4.js";
import fileUrl$14 from "../../../_virtual/_lvy-asset_5.js";
import fileUrl$15 from "../../../_virtual/_lvy-asset_12.js";
import fileUrl$16 from "../../../_virtual/_lvy-asset_3.js";
import fileUrl$17 from "../../../_virtual/_lvy-asset_13.js";
import fileUrl$18 from "../../../_virtual/_lvy-asset_9.js";
import React from "react";

//#region src/image/conponent/chinese-chess/map.tsx
const pieceImages = {
	红: {
		車: fileUrl$12,
		馬: fileUrl$14,
		象: fileUrl$17,
		士: fileUrl$16,
		将: fileUrl$13,
		炮: fileUrl$15,
		兵: fileUrl$18
	},
	黑: {
		車: fileUrl$5,
		馬: fileUrl$7,
		象: fileUrl$10,
		士: fileUrl$9,
		将: fileUrl$6,
		炮: fileUrl$8,
		兵: fileUrl$11
	}
};
const activePieceImages = {
	红: fileUrl$13,
	黑: fileUrl$6
};
const highlightImages = {
	红: fileUrl$4,
	黑: fileUrl$3
};
const boardWidth = 780;
const boardHeight = 830;
const boardPaddingX = 40;
const boardPaddingY = 40;
const pieceWidth = 73;
const columnPitch = 700 / 9;
const rowPitch = 750 / 10;
const getPlayerName = (room) => {
	return Object.values(room.players).find((player) => player.team === room.state.current)?.nickname ?? "";
};
const getCells = (room, viewTeam) => {
	const cells = [];
	const lastMoveKeys = room.state.lastMove ? [pointKey(room.state.lastMove.from), pointKey(room.state.lastMove.to)] : [];
	const highlightTeam = room.state.current === "红" ? "黑" : "红";
	const rotated = viewTeam === "红";
	for (let row = 0; row < 10; row += 1) for (let col = 0; col < 9; col += 1) {
		const key = pointKey({
			row,
			col
		});
		const viewRow = rotated ? 10 - 1 - row : row;
		const viewCol = rotated ? 9 - 1 - col : col;
		cells.push({
			key,
			piece: room.state.board[key],
			owner: room.state.ownership[key],
			left: boardPaddingX + viewCol * columnPitch + (columnPitch - pieceWidth) / 2,
			top: boardPaddingY + viewRow * rowPitch
		});
	}
	return cells.map((cell) => ({
		...cell,
		isLastMove: lastMoveKeys.includes(cell.key),
		highlightTeam
	}));
};
function ChineseChessMap({ room, viewTeam = room.state.current }) {
	const cells = getCells(room, viewTeam);
	const isRollback = viewTeam === "红";
	const lastMoveText = room.state.lastMove ? `${room.state.lastMove.input.raw}（${formatChineseChessMoveIntent(room.state.lastMove)}）` : "暂无";
	return /* @__PURE__ */ React.createElement("html", null, /* @__PURE__ */ React.createElement("head", null, /* @__PURE__ */ React.createElement("link", {
		rel: "stylesheet",
		href: fileUrl
	})), /* @__PURE__ */ React.createElement("body", { style: {
		backgroundColor: "bisque",
		width: "780px"
	} }, /* @__PURE__ */ React.createElement("div", { style: {
		position: "relative",
		width: `${boardWidth}px`,
		height: `${boardHeight}px`,
		backgroundImage: `url(${isRollback ? fileUrl$2 : fileUrl$1})`,
		backgroundSize: "cover",
		margin: "10px 0"
	} }, cells.map((cell) => {
		const pieceImage = cell.piece !== "空" && cell.owner !== "0" ? pieceImages[cell.owner][cell.piece] : null;
		const highlightImage = cell.isLastMove ? highlightImages[cell.highlightTeam] : null;
		return /* @__PURE__ */ React.createElement("div", {
			key: cell.key,
			style: {
				position: "absolute",
				left: `${cell.left}px`,
				top: `${cell.top}px`,
				width: "73px",
				height: "75px",
				backgroundImage: pieceImage ? `url(${pieceImage})` : void 0,
				backgroundSize: "cover"
			}
		}, highlightImage ? /* @__PURE__ */ React.createElement("div", { style: {
			width: "100%",
			height: "100%",
			backgroundImage: `url(${highlightImage})`,
			backgroundSize: "cover"
		} }) : null);
	})), /* @__PURE__ */ React.createElement("div", { style: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center"
	} }, /* @__PURE__ */ React.createElement("h1", { style: { margin: "16px 8px" } }, "当前行动："), /* @__PURE__ */ React.createElement("div", { style: {
		width: "73px",
		height: "75px",
		margin: "0 0.15rem",
		backgroundSize: "cover",
		backgroundImage: `url(${activePieceImages[room.state.current]})`
	} }), /* @__PURE__ */ React.createElement("h2", null, getPlayerName(room)), /* @__PURE__ */ React.createElement("h3", { style: {
		margin: "16px",
		color: "#6b4f2f"
	} }, "上一步：", lastMoveText), /* @__PURE__ */ React.createElement("h4", { style: { margin: "16px" } }, "Created by Yunzai-Bot & xianyu-plugin"))));
}

//#endregion
export { ChineseChessMap as default };