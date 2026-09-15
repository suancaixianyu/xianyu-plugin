import { description } from "../../../config/plugin.js";
import fileUrl from "../../../_virtual/_lvy-css_0.js";
import fileUrl$1 from "../../../_virtual/_lvy-asset_32.js";
import fileUrl$2 from "../../../_virtual/_lvy-asset_42.js";
import fileUrl$3 from "../../../_virtual/_lvy-asset_35.js";
import fileUrl$4 from "../../../_virtual/_lvy-asset_18.js";
import fileUrl$5 from "../../../_virtual/_lvy-asset_30.js";
import fileUrl$6 from "../../../_virtual/_lvy-asset_31.js";
import fileUrl$7 from "../../../_virtual/_lvy-asset_24.js";
import fileUrl$8 from "../../../_virtual/_lvy-asset_39.js";
import fileUrl$9 from "../../../_virtual/_lvy-asset_40.js";
import fileUrl$10 from "../../../_virtual/_lvy-asset_41.js";
import fileUrl$11 from "../../../_virtual/_lvy-asset_20.js";
import fileUrl$12 from "../../../_virtual/_lvy-asset_28.js";
import fileUrl$13 from "../../../_virtual/_lvy-asset_36.js";
import fileUrl$14 from "../../../_virtual/_lvy-asset_37.js";
import fileUrl$15 from "../../../_virtual/_lvy-asset_19.js";
import fileUrl$16 from "../../../_virtual/_lvy-asset_27.js";
import fileUrl$17 from "../../../_virtual/_lvy-asset_38.js";
import fileUrl$18 from "../../../_virtual/_lvy-asset_33.js";
import fileUrl$19 from "../../../_virtual/_lvy-asset_23.js";
import fileUrl$20 from "../../../_virtual/_lvy-asset_43.js";
import fileUrl$21 from "../../../_virtual/_lvy-asset_34.js";
import fileUrl$22 from "../../../_virtual/_lvy-asset_25.js";
import fileUrl$23 from "../../../_virtual/_lvy-asset_26.js";
import fileUrl$24 from "../../../_virtual/_lvy-asset_29.js";
import fileUrl$25 from "../../../_virtual/_lvy-asset_21.js";
import fileUrl$26 from "../../../_virtual/_lvy-asset_22.js";
import React from "react";

//#region src/image/conponent/minesweeper/map.tsx
const boardMaxWidth = 792;
const getCellSize = (game) => {
	return boardMaxWidth / game.col;
};
const getN = (num) => {
	switch (num) {
		case 0: return fileUrl$11;
		case 1: return fileUrl$12;
		case 2: return fileUrl$13;
		case 3: return fileUrl$14;
		case 4: return fileUrl$15;
		case 5: return fileUrl$16;
		case 6: return fileUrl$17;
		case 7: return fileUrl$18;
		case 8: return fileUrl$19;
		case 9: return fileUrl$10;
		default: return fileUrl$1;
	}
};
const getNum = (num) => {
	return num.toString().padStart(3, "0").split("").map((num) => {
		switch (num) {
			case "0": return fileUrl$1;
			case "1": return fileUrl$2;
			case "2": return fileUrl$3;
			case "3": return fileUrl$4;
			case "4": return fileUrl$5;
			case "5": return fileUrl$6;
			case "6": return fileUrl$7;
			case "7": return fileUrl$8;
			case "8": return fileUrl$9;
			case "9": return fileUrl$10;
			default: return fileUrl$1;
		}
	});
};
const getSrc = (game, key, isMine, value, isOpen, isFlag) => {
	if (game.state === "lose") {
		if (isMine) return key === `${game.select.x}-${game.select.y}` ? fileUrl$20 : fileUrl$22;
		return getN(value);
	}
	if (isOpen) return isMine ? fileUrl$22 : getN(value);
	else return isFlag ? fileUrl$21 : fileUrl$23;
};
/**
* @param param
* @returns
*/
function App({ game }) {
	const cellSize = getCellSize(game);
	const boardWidth = cellSize * game.col;
	const panelWidth = boardWidth + 8;
	return /* @__PURE__ */ React.createElement("html", null, /* @__PURE__ */ React.createElement("head", null, /* @__PURE__ */ React.createElement("link", {
		rel: "stylesheet",
		href: fileUrl
	})), /* @__PURE__ */ React.createElement("body", { style: {
		background: "#CCCCCC",
		width: `${panelWidth}px`
	} }, /* @__PURE__ */ React.createElement("div", { style: { width: `${panelWidth}px` } }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between border-4 border-b-white border-r-white border-t-gray-500 border-l-gray-500" }, /* @__PURE__ */ React.createElement("div", { className: "flex" }, getNum(game.remain).map((img, index) => /* @__PURE__ */ React.createElement("img", {
		key: index,
		src: img,
		alt: "",
		className: "w-auto h-16"
	}))), /* @__PURE__ */ React.createElement("div", { className: "flex" }, /* @__PURE__ */ React.createElement("img", {
		src: game.state === "playing" ? fileUrl$24 : game.state === "win" ? fileUrl$26 : fileUrl$25,
		alt: "",
		className: "w-auto h-16"
	})), /* @__PURE__ */ React.createElement("div", { className: "flex" }, getNum(game.time).map((img, index) => /* @__PURE__ */ React.createElement("img", {
		key: index,
		src: img,
		alt: "",
		className: "w-auto h-16"
	})))), /* @__PURE__ */ React.createElement("div", {
		className: "border-4 border-b-white border-r-white border-t-gray-500 border-l-gray-500",
		style: {
			display: "grid",
			gridTemplateColumns: `repeat(${game.col}, ${cellSize}px)`,
			gridAutoRows: `${cellSize}px`,
			width: `${boardWidth}px`
		}
	}, Object.keys(game.map).map((key) => {
		const { isMine, value, isOpen, isFlag, name } = game.map[key];
		return /* @__PURE__ */ React.createElement("div", {
			className: "flex justify-center items-center",
			key,
			style: {
				width: `${cellSize}px`,
				height: `${cellSize}px`,
				backgroundImage: `url(${getSrc(game, key, isMine, value, isOpen, isFlag)})`,
				backgroundSize: "100% 100%",
				fontSize: `${Math.max(10, Math.floor(cellSize * .4))}px`,
				lineHeight: 1
			}
		}, !isOpen && game.state === "playing" ? name : "");
	})), /* @__PURE__ */ React.createElement("div", {
		className: "flex justify-center",
		style: { width: `${panelWidth}px` }
	}, description))));
}

//#endregion
export { App as default };