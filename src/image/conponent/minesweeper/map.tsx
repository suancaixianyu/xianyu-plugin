import React from "react";
import css_output from "@src/asstes/main.css";
import { description } from "@src/config/plugin";
import { Game } from "@src/api";
import num0 from "@src/asstes/minesweeper/num0.gif";
import num1 from "@src/asstes/minesweeper/num1.gif";
import num2 from "@src/asstes/minesweeper/num2.gif";
import num3 from "@src/asstes/minesweeper/num3.gif";
import num4 from "@src/asstes/minesweeper/num4.gif";
import num5 from "@src/asstes/minesweeper/num5.gif";
import num6 from "@src/asstes/minesweeper/num6.gif";
import num7 from "@src/asstes/minesweeper/num7.gif";
import num8 from "@src/asstes/minesweeper/num8.gif";
import num9 from "@src/asstes/minesweeper/num9.gif";
import n0 from "@src/asstes/minesweeper/0.gif";
import n1 from "@src/asstes/minesweeper/1.gif";
import n2 from "@src/asstes/minesweeper/2.gif";
import n3 from "@src/asstes/minesweeper/3.gif";
import n4 from "@src/asstes/minesweeper/4.gif";
import n5 from "@src/asstes/minesweeper/5.gif";
import n6 from "@src/asstes/minesweeper/6.gif";
import n7 from "@src/asstes/minesweeper/7.gif";
import n8 from "@src/asstes/minesweeper/8.gif";
import boom from "@src/asstes/minesweeper/boom.gif";
import mark from "@src/asstes/minesweeper/mark.gif";
import mine from "@src/asstes/minesweeper/mine.gif";
import off from "@src/asstes/minesweeper/off.gif";
import ongoing from "@src/asstes/minesweeper/ongoing.gif";
import over from "@src/asstes/minesweeper/over.gif";
import win from "@src/asstes/minesweeper/win.gif";

const boardMaxWidth = 792;
const getCellSize = (game: Game) => {
  return boardMaxWidth / game.col;
};
const getN = (num: number) => {
  switch (num) {
    case 0:
      return n0;
    case 1:
      return n1;
    case 2:
      return n2;
    case 3:
      return n3;
    case 4:
      return n4;
    case 5:
      return n5;
    case 6:
      return n6;
    case 7:
      return n7;
    case 8:
      return n8;
    case 9:
      return num9;
    default:
      return num0;
  }
};
const getNum = (num: number) => {
  // 将数字转为字符串，再转为数组，并确保数字至少有三位
  const numArr = num.toString().padStart(3, "0").split("");

  // 生成图片数组
  const imgArr = numArr.map((num) => {
    switch (num) {
      case "0":
        return num0;
      case "1":
        return num1;
      case "2":
        return num2;
      case "3":
        return num3;
      case "4":
        return num4;
      case "5":
        return num5;
      case "6":
        return num6;
      case "7":
        return num7;
      case "8":
        return num8;
      case "9":
        return num9;
      default:
        return num0;
    }
  });
  return imgArr;
};

const getSrc = (
  game: Game,
  key: string,
  isMine: boolean,
  value: number,
  isOpen: boolean,
  isFlag: boolean
) => {
  if (game.state === "lose") {
    // 如果游戏失败，显示所有地雷,并标记出触发地雷的位置
    if (isMine) {
      return key === `${game.select.x}-${game.select.y}` ? boom : mine;
    }
    // 显示所有的格子
    return getN(value);
  }
  // 游戏进行中
  if (isOpen) {
    // 如果格子已经打开
    return isMine ? mine : getN(value);
  } else {
    // 如果格子未打开
    return isFlag ? mark : off;
  }
};
/**
 * @param param
 * @returns
 */
export default function App({ game }: { game: Game }) {
  const cellSize = getCellSize(game);
  const boardWidth = cellSize * game.col;
  const panelWidth = boardWidth + 8;

  return (
    <html>
      <head>
        <link rel="stylesheet" href={css_output} />
      </head>
      <body style={{ background: "#CCCCCC", width: `${panelWidth}px` }}>
        <div style={{ width: `${panelWidth}px` }}>
          <div className="flex justify-between border-4 border-b-white border-r-white border-t-gray-500 border-l-gray-500">
            <div className="flex">
              {getNum(game.remain).map((img, index) => (
                <img key={index} src={img} alt="" className="w-auto h-16" />
              ))}
            </div>

            <div className="flex">
              <img
                src={
                  game.state === "playing"
                    ? ongoing
                    : game.state === "win"
                      ? win
                      : over
                }
                alt=""
                className="w-auto h-16"
              />
            </div>

            <div className="flex">
              {getNum(game.time).map((img, index) => (
                <img key={index} src={img} alt="" className="w-auto h-16" />
              ))}
            </div>
          </div>
          <div
            className="border-4 border-b-white border-r-white border-t-gray-500 border-l-gray-500"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${game.col}, ${cellSize}px)`,
              gridAutoRows: `${cellSize}px`,
              width: `${boardWidth}px`,
            }}
          >
            {Object.keys(game.map).map((key) => {
              const { isMine, value, isOpen, isFlag, name } = game.map[key];
              return (
                <div
                  className="flex justify-center items-center"
                  key={key}
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    backgroundImage: `url(${getSrc(game, key, isMine, value, isOpen, isFlag)})`,
                    backgroundSize: "100% 100%",
                    fontSize: `${Math.max(10, Math.floor(cellSize * 0.4))}px`,
                    lineHeight: 1,
                  }}
                >
                  {!isOpen && game.state === "playing" ? name : ""}
                </div>
              );
            })}
          </div>

          <div className="flex justify-center" style={{ width: `${panelWidth}px` }}>
            {description}
          </div>
        </div>
      </body>
    </html>
  );
}
