import React from "react";
import css_output from "@src/asstes/main.css";
import { description } from "@src/config/plugin";
import type { SokobanGameState, SokobanMap } from "@src/api/games/sokoban";
import { getCurrentSokobanMap, sokobanLevelCount } from "@src/api/games/sokoban";

const cellView: Record<number, { text: string; bg: string; fg: string }> = {
  0: { text: "", bg: "#f3ead9", fg: "#5f4a34" },
  1: { text: "", bg: "#6b4b30", fg: "#fff7ed" },
  2: { text: "·", bg: "#f8d97a", fg: "#7c4a03" },
  3: { text: "□", bg: "#c27b39", fg: "#fff4dc" },
  4: { text: "人", bg: "#5ba7a4", fg: "#f8fffb" },
  5: { text: "■", bg: "#68a357", fg: "#f5ffe8" },
  6: { text: "人", bg: "#7cc36d", fg: "#f5ffe8" },
};

const countCells = (map: SokobanMap) => {
  let boxes = 0;
  let targets = 0;

  for (const row of map) {
    for (const cell of row) {
      if (cell === 3 || cell === 5) boxes += 1;
      if (cell === 2 || cell === 5 || cell === 6) targets += 1;
    }
  }

  return { boxes, targets };
};

export default function SokobanMapView({ game }: { game: SokobanGameState }) {
  const map = getCurrentSokobanMap(game);
  const { boxes, targets } = countCells(map);
  const colCount = map[0]?.length ?? 0;
  const cellSize = 34;
  const cellGap = 2;
  const boardPadding = 8;
  const boardWidth = colCount * cellSize + Math.max(0, colCount - 1) * cellGap + boardPadding * 2;

  return (
    <html>
      <head>
        <link rel="stylesheet" href={css_output} />
      </head>
      <body style={{ background: "#eadbc6", width: "720px" }}>
        <div className="p-6" style={{ fontFamily: "serif", color: "#3c2f23" }}>
          <div
            className="rounded-2xl p-5 shadow-xl"
            style={{
              background: "linear-gradient(135deg, #fff7e8 0%, #d8b98e 100%)",
              border: "6px solid #6b4b30",
            }}
          >
            <div className="flex justify-between items-end mb-4">
              <div>
                <div className="text-3xl font-bold tracking-widest">推箱子</div>
                <div className="text-sm mt-1">
                  第 {game.levelIndex + 1} / {sokobanLevelCount} 关
                </div>
              </div>
              <div className="text-right text-sm">
                <div>步数：{game.moveCount}</div>
                <div>箱子：{boxes} / 目标：{targets}</div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${colCount}, ${cellSize}px)`,
                gridAutoRows: `${cellSize}px`,
                gap: `${cellGap}px`,
                padding: `${boardPadding}px`,
                width: `${boardWidth}px`,
                boxSizing: "border-box",
                background: "#2f261d",
                borderRadius: "14px",
              }}
            >
              {map.flatMap((row, x) =>
                row.map((cell, y) => {
                  const view = cellView[cell];
                  return (
                    <div
                      key={`${x}-${y}`}
                      className="flex items-center justify-center font-bold"
                      style={{
                        width: `${cellSize}px`,
                        height: `${cellSize}px`,
                        borderRadius: "8px",
                        background: view.bg,
                        color: view.fg,
                        fontSize: cell === 0 ? "0" : "22px",
                        boxShadow:
                          cell === 1
                            ? "inset 0 2px 0 rgba(255,255,255,.2), inset 0 -3px 0 rgba(0,0,0,.22)"
                            : "inset 0 1px 0 rgba(255,255,255,.35)",
                      }}
                    >
                      {view.text}
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 text-sm leading-6">
              操作：发送“移动 wasd”或直接发送“wasd”，撤回用“撤回”。
              {game.status === "win" ? " 本关已完成，发送“推箱子”可重新开始。" : ""}
            </div>
          </div>
          <div className="flex justify-center mt-3 text-xs">{description}</div>
        </div>
      </body>
    </html>
  );
}
