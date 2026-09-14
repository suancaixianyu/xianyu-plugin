import React from "react";
import GameHelp from "../game-help";

export default function ChineseChessHelp() {
  return (
    <GameHelp
      title="中国象棋"
      badge="坐标与棋谱"
      subtitle="支持群内双人象棋、坐标移子、中文棋谱、悔棋申请、棋盘反转和上一步标记。"
      theme={{ primary: "#9c2f2f", accent: "#f2c36b", soft: "#ffe8d6" }}
      commands={[
        { name: "发起对局", desc: "创建中国象棋房间，默认执红。", use: "发起中国象棋" },
        { name: "加入对局", desc: "加入等待中的房间并执黑。", use: "加入中国象棋" },
        { name: "指定阵营", desc: "按需要加入红方或黑方。", use: "加入中国象棋黑" },
        { name: "坐标移子", desc: "按起点和终点坐标移动棋子，行 A-J，列 1-9。", use: "移子 A1 A2" },
        { name: "中文棋谱", desc: "支持常见中文记谱，如进、退、平。", use: "兵一进一" },
        { name: "悔棋处理", desc: "发起悔棋请求，对方可同意或拒绝。", use: "悔棋" },
        { name: "结束游戏", desc: "认输并结束当前象棋对局。", use: "结束中国象棋" },
      ]}
      flow={["一名玩家发起房间。", "另一名玩家加入后红方先行。", "用坐标或中文棋谱走子，将死对方获胜。"]}
      tips={["也可发送“发起象棋”“象棋帮助”等别名。", "中文棋谱支持車/车、馬/马、象/相、士/仕等写法。", "悔棋需要对方同意才会回退。"]}
    />
  );
}
