import React from 'react';
import fileUrl from '../../../asstes/main.css.js';
import { description } from '../../../config/plugin.js';
import fileUrl$4 from '../../../asstes/minesweeper/num0.gif.js';
import fileUrl$d from '../../../asstes/minesweeper/num1.gif.js';
import fileUrl$c from '../../../asstes/minesweeper/num2.gif.js';
import fileUrl$b from '../../../asstes/minesweeper/num3.gif.js';
import fileUrl$a from '../../../asstes/minesweeper/num4.gif.js';
import fileUrl$9 from '../../../asstes/minesweeper/num5.gif.js';
import fileUrl$8 from '../../../asstes/minesweeper/num6.gif.js';
import fileUrl$7 from '../../../asstes/minesweeper/num7.gif.js';
import fileUrl$6 from '../../../asstes/minesweeper/num8.gif.js';
import fileUrl$5 from '../../../asstes/minesweeper/num9.gif.js';
import fileUrl$q from '../../../asstes/minesweeper/0.gif.js';
import fileUrl$p from '../../../asstes/minesweeper/1.gif.js';
import fileUrl$o from '../../../asstes/minesweeper/2.gif.js';
import fileUrl$n from '../../../asstes/minesweeper/3.gif.js';
import fileUrl$m from '../../../asstes/minesweeper/4.gif.js';
import fileUrl$l from '../../../asstes/minesweeper/5.gif.js';
import fileUrl$k from '../../../asstes/minesweeper/6.gif.js';
import fileUrl$j from '../../../asstes/minesweeper/7.gif.js';
import fileUrl$i from '../../../asstes/minesweeper/8.gif.js';
import fileUrl$e from '../../../asstes/minesweeper/boom.gif.js';
import fileUrl$g from '../../../asstes/minesweeper/mark.gif.js';
import fileUrl$f from '../../../asstes/minesweeper/mine.gif.js';
import fileUrl$h from '../../../asstes/minesweeper/off.gif.js';
import fileUrl$1 from '../../../asstes/minesweeper/ongoing.gif.js';
import fileUrl$3 from '../../../asstes/minesweeper/over.gif.js';
import fileUrl$2 from '../../../asstes/minesweeper/win.gif.js';

const boardMaxWidth = 792;
const getCellSize = (game) => {
    return boardMaxWidth / game.col;
};
const getN = (num) => {
    switch (num) {
        case 0:
            return fileUrl$q;
        case 1:
            return fileUrl$p;
        case 2:
            return fileUrl$o;
        case 3:
            return fileUrl$n;
        case 4:
            return fileUrl$m;
        case 5:
            return fileUrl$l;
        case 6:
            return fileUrl$k;
        case 7:
            return fileUrl$j;
        case 8:
            return fileUrl$i;
        case 9:
            return fileUrl$5;
        default:
            return fileUrl$4;
    }
};
const getNum = (num) => {
    // 将数字转为字符串，再转为数组，并确保数字至少有三位
    const numArr = num.toString().padStart(3, "0").split("");
    // 生成图片数组
    const imgArr = numArr.map((num) => {
        switch (num) {
            case "0":
                return fileUrl$4;
            case "1":
                return fileUrl$d;
            case "2":
                return fileUrl$c;
            case "3":
                return fileUrl$b;
            case "4":
                return fileUrl$a;
            case "5":
                return fileUrl$9;
            case "6":
                return fileUrl$8;
            case "7":
                return fileUrl$7;
            case "8":
                return fileUrl$6;
            case "9":
                return fileUrl$5;
            default:
                return fileUrl$4;
        }
    });
    return imgArr;
};
const getSrc = (game, key, isMine, value, isOpen, isFlag) => {
    if (game.state === "lose") {
        // 如果游戏失败，显示所有地雷,并标记出触发地雷的位置
        if (isMine) {
            return key === `${game.select.x}-${game.select.y}` ? fileUrl$e : fileUrl$f;
        }
        // 显示所有的格子
        return getN(value);
    }
    // 游戏进行中
    if (isOpen) {
        // 如果格子已经打开
        return isMine ? fileUrl$f : getN(value);
    }
    else {
        // 如果格子未打开
        return isFlag ? fileUrl$g : fileUrl$h;
    }
};
/**
 * @param param
 * @returns
 */
function App({ game }) {
    const cellSize = getCellSize(game);
    const boardWidth = cellSize * game.col;
    const panelWidth = boardWidth + 8;
    return (React.createElement("html", null,
        React.createElement("head", null,
            React.createElement("link", { rel: "stylesheet", href: fileUrl })),
        React.createElement("body", { style: { background: "#CCCCCC", width: `${panelWidth}px` } },
            React.createElement("div", { style: { width: `${panelWidth}px` } },
                React.createElement("div", { className: "flex justify-between border-4 border-b-white border-r-white border-t-gray-500 border-l-gray-500" },
                    React.createElement("div", { className: "flex" }, getNum(game.remain).map((img, index) => (React.createElement("img", { key: index, src: img, alt: "", className: "w-auto h-16" })))),
                    React.createElement("div", { className: "flex" },
                        React.createElement("img", { src: game.state === "playing"
                                ? fileUrl$1
                                : game.state === "win"
                                    ? fileUrl$2
                                    : fileUrl$3, alt: "", className: "w-auto h-16" })),
                    React.createElement("div", { className: "flex" }, getNum(game.time).map((img, index) => (React.createElement("img", { key: index, src: img, alt: "", className: "w-auto h-16" }))))),
                React.createElement("div", { className: "border-4 border-b-white border-r-white border-t-gray-500 border-l-gray-500", style: {
                        display: "grid",
                        gridTemplateColumns: `repeat(${game.col}, ${cellSize}px)`,
                        gridAutoRows: `${cellSize}px`,
                        width: `${boardWidth}px`,
                    } }, Object.keys(game.map).map((key) => {
                    const { isMine, value, isOpen, isFlag, name } = game.map[key];
                    return (React.createElement("div", { className: "flex justify-center items-center", key: key, style: {
                            width: `${cellSize}px`,
                            height: `${cellSize}px`,
                            backgroundImage: `url(${getSrc(game, key, isMine, value, isOpen, isFlag)})`,
                            backgroundSize: "100% 100%",
                            fontSize: `${Math.max(10, Math.floor(cellSize * 0.4))}px`,
                            lineHeight: 1,
                        } }, !isOpen && game.state === "playing" ? name : ""));
                })),
                React.createElement("div", { className: "flex justify-center", style: { width: `${panelWidth}px` } }, description)))));
}

export { App as default };
