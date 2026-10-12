import React from 'react';
import fileUrl from '../../../asstes/main.css.js';
import { description } from '../../../config/plugin.js';
import { getCurrentSokobanMap, sokobanLevelCount } from '../../../api/games/sokoban.js';

const cellView = {
    0: { text: "", bg: "#f3ead9", fg: "#5f4a34" },
    1: { text: "", bg: "#6b4b30", fg: "#fff7ed" },
    2: { text: "·", bg: "#f8d97a", fg: "#7c4a03" },
    3: { text: "□", bg: "#c27b39", fg: "#fff4dc" },
    4: { text: "人", bg: "#5ba7a4", fg: "#f8fffb" },
    5: { text: "■", bg: "#68a357", fg: "#f5ffe8" },
    6: { text: "人", bg: "#7cc36d", fg: "#f5ffe8" },
};
const countCells = (map) => {
    let boxes = 0;
    let targets = 0;
    for (const row of map) {
        for (const cell of row) {
            if (cell === 3 || cell === 5)
                boxes += 1;
            if (cell === 2 || cell === 5 || cell === 6)
                targets += 1;
        }
    }
    return { boxes, targets };
};
function SokobanMapView({ game }) {
    const map = getCurrentSokobanMap(game);
    const { boxes, targets } = countCells(map);
    const colCount = map[0]?.length ?? 0;
    const cellSize = 34;
    const cellGap = 2;
    const boardPadding = 8;
    const boardWidth = colCount * cellSize + Math.max(0, colCount - 1) * cellGap + boardPadding * 2;
    return (React.createElement("html", null,
        React.createElement("head", null,
            React.createElement("link", { rel: "stylesheet", href: fileUrl })),
        React.createElement("body", { style: { background: "#eadbc6", width: "720px" } },
            React.createElement("div", { className: "p-6", style: { fontFamily: "serif", color: "#3c2f23" } },
                React.createElement("div", { className: "rounded-2xl p-5 shadow-xl", style: {
                        background: "linear-gradient(135deg, #fff7e8 0%, #d8b98e 100%)",
                        border: "6px solid #6b4b30",
                    } },
                    React.createElement("div", { className: "flex justify-between items-end mb-4" },
                        React.createElement("div", null,
                            React.createElement("div", { className: "text-3xl font-bold tracking-widest" }, "\u63A8\u7BB1\u5B50"),
                            React.createElement("div", { className: "text-sm mt-1" },
                                "\u7B2C ",
                                game.levelIndex + 1,
                                " / ",
                                sokobanLevelCount,
                                " \u5173")),
                        React.createElement("div", { className: "text-right text-sm" },
                            React.createElement("div", null,
                                "\u6B65\u6570\uFF1A",
                                game.moveCount),
                            React.createElement("div", null,
                                "\u7BB1\u5B50\uFF1A",
                                boxes,
                                " / \u76EE\u6807\uFF1A",
                                targets))),
                    React.createElement("div", { style: {
                            display: "grid",
                            gridTemplateColumns: `repeat(${colCount}, ${cellSize}px)`,
                            gridAutoRows: `${cellSize}px`,
                            gap: `${cellGap}px`,
                            padding: `${boardPadding}px`,
                            width: `${boardWidth}px`,
                            boxSizing: "border-box",
                            background: "#2f261d",
                            borderRadius: "14px",
                        } }, map.flatMap((row, x) => row.map((cell, y) => {
                        const view = cellView[cell];
                        return (React.createElement("div", { key: `${x}-${y}`, className: "flex items-center justify-center font-bold", style: {
                                width: `${cellSize}px`,
                                height: `${cellSize}px`,
                                borderRadius: "8px",
                                background: view.bg,
                                color: view.fg,
                                fontSize: cell === 0 ? "0" : "22px",
                                boxShadow: cell === 1
                                    ? "inset 0 2px 0 rgba(255,255,255,.2), inset 0 -3px 0 rgba(0,0,0,.22)"
                                    : "inset 0 1px 0 rgba(255,255,255,.35)",
                            } }, view.text));
                    }))),
                    React.createElement("div", { className: "mt-4 text-sm leading-6" },
                        "\u64CD\u4F5C\uFF1A\u53D1\u9001\u201C\u79FB\u52A8 wasd\u201D\u6216\u76F4\u63A5\u53D1\u9001\u201Cwasd\u201D\uFF0C\u64A4\u56DE\u7528\u201C\u64A4\u56DE\u201D\u3002",
                        game.status === "win" ? " 本关已完成，发送“推箱子”可重新开始。" : "")),
                React.createElement("div", { className: "flex justify-center mt-3 text-xs" }, description)))));
}

export { SokobanMapView as default };
