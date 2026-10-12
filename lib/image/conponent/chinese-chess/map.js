import React from 'react';
import fileUrl from '../../../asstes/main.css.js';
import { formatChineseChessMoveIntent, pointKey, CHINESE_CHESS_ROWS, CHINESE_CHESS_COLS } from '../../../api/games/chineseChess/state.js';
import fileUrl$2 from '../../../asstes/chinese-chess/bg.png.js';
import fileUrl$1 from '../../../asstes/chinese-chess/bg2.png.js';
import fileUrl$h from '../../../asstes/chinese-chess/b_box.png.js';
import fileUrl$i from '../../../asstes/chinese-chess/r_box.png.js';
import fileUrl$9 from '../../../asstes/chinese-chess/b_c.png.js';
import fileUrl$5 from '../../../asstes/chinese-chess/b_j.png.js';
import fileUrl$8 from '../../../asstes/chinese-chess/b_m.png.js';
import fileUrl$4 from '../../../asstes/chinese-chess/b_p.png.js';
import fileUrl$6 from '../../../asstes/chinese-chess/b_s.png.js';
import fileUrl$7 from '../../../asstes/chinese-chess/b_x.png.js';
import fileUrl$3 from '../../../asstes/chinese-chess/b_z.png.js';
import fileUrl$g from '../../../asstes/chinese-chess/r_c.png.js';
import fileUrl$c from '../../../asstes/chinese-chess/r_j.png.js';
import fileUrl$f from '../../../asstes/chinese-chess/r_m.png.js';
import fileUrl$b from '../../../asstes/chinese-chess/r_p.png.js';
import fileUrl$d from '../../../asstes/chinese-chess/r_s.png.js';
import fileUrl$e from '../../../asstes/chinese-chess/r_x.png.js';
import fileUrl$a from '../../../asstes/chinese-chess/r_z.png.js';

const pieceImages = {
    红: {
        車: fileUrl$g,
        馬: fileUrl$f,
        象: fileUrl$e,
        士: fileUrl$d,
        将: fileUrl$c,
        炮: fileUrl$b,
        兵: fileUrl$a,
    },
    黑: {
        車: fileUrl$9,
        馬: fileUrl$8,
        象: fileUrl$7,
        士: fileUrl$6,
        将: fileUrl$5,
        炮: fileUrl$4,
        兵: fileUrl$3,
    },
};
const activePieceImages = {
    红: fileUrl$c,
    黑: fileUrl$5,
};
const highlightImages = {
    红: fileUrl$i,
    黑: fileUrl$h,
};
const boardWidth = 780;
const boardHeight = 830;
const boardPaddingX = 40;
const boardPaddingY = 40;
const pieceWidth = 73;
const columnPitch = (boardWidth - boardPaddingX * 2) / CHINESE_CHESS_COLS;
const rowPitch = (boardHeight - boardPaddingY * 2) / CHINESE_CHESS_ROWS;
const getPlayerName = (room) => {
    return (Object.values(room.players).find((player) => player.team === room.state.current)?.nickname ?? "");
};
const getCells = (room, viewTeam) => {
    const cells = [];
    const lastMoveKeys = room.state.lastMove
        ? [pointKey(room.state.lastMove.from), pointKey(room.state.lastMove.to)]
        : [];
    const highlightTeam = room.state.current === "红" ? "黑" : "红";
    const rotated = viewTeam === "红";
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
function ChineseChessMap({ room, viewTeam = room.state.current, }) {
    const cells = getCells(room, viewTeam);
    const isRollback = viewTeam === "红";
    const lastMoveText = room.state.lastMove
        ? `${room.state.lastMove.input.raw}（${formatChineseChessMoveIntent(room.state.lastMove)}）`
        : "暂无";
    return (React.createElement("html", null,
        React.createElement("head", null,
            React.createElement("link", { rel: "stylesheet", href: fileUrl })),
        React.createElement("body", { style: { backgroundColor: "bisque", width: "780px" } },
            React.createElement("div", { style: {
                    position: "relative",
                    width: `${boardWidth}px`,
                    height: `${boardHeight}px`,
                    backgroundImage: `url(${isRollback ? fileUrl$1 : fileUrl$2})`,
                    backgroundSize: "cover",
                    margin: "10px 0",
                } }, cells.map((cell) => {
                const pieceImage = cell.piece !== "空" && cell.owner !== "0" ? pieceImages[cell.owner][cell.piece] : null;
                const highlightImage = cell.isLastMove ? highlightImages[cell.highlightTeam] : null;
                return (React.createElement("div", { key: cell.key, style: {
                        position: "absolute",
                        left: `${cell.left}px`,
                        top: `${cell.top}px`,
                        width: "73px",
                        height: "75px",
                        backgroundImage: pieceImage ? `url(${pieceImage})` : undefined,
                        backgroundSize: "cover",
                    } }, highlightImage ? (React.createElement("div", { style: {
                        width: "100%",
                        height: "100%",
                        backgroundImage: `url(${highlightImage})`,
                        backgroundSize: "cover",
                    } })) : null));
            })),
            React.createElement("div", { style: { display: "flex", justifyContent: "center", alignItems: "center" } },
                React.createElement("h1", { style: { margin: "16px 8px" } }, "\u5F53\u524D\u884C\u52A8\uFF1A"),
                React.createElement("div", { style: {
                        width: "73px",
                        height: "75px",
                        margin: "0 0.15rem",
                        backgroundSize: "cover",
                        backgroundImage: `url(${activePieceImages[room.state.current]})`,
                    } }),
                React.createElement("h2", null, getPlayerName(room)),
                React.createElement("h3", { style: { margin: "16px", color: "#6b4f2f" } },
                    "\u4E0A\u4E00\u6B65\uFF1A",
                    lastMoveText),
                React.createElement("h4", { style: { margin: "16px" } }, "Created by Yunzai-Bot & xianyu-plugin")))));
}

export { ChineseChessMap as default };
