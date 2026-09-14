import React from "react";
import GameHelp from "../game-help";

export default function GobangHelp() {
  return (
    <GameHelp
      title="五子棋"
      badge="人机与双人"
      subtitle="17 路棋盘五子棋，支持人机练习和群内双人对战。开局后可直接发送坐标落子。"
      theme={{ primary: "#315caa", accent: "#91b7ff", soft: "#e2ecff" }}
      commands={[
        { name: "人机开局", desc: "开启一局人机对战，你执黑先手。", use: "开始五子棋" },
        { name: "发起对局", desc: "创建双人房间，等待另一位玩家加入。", use: "发起五子棋" },
        { name: "加入对局", desc: "加入当前等待中的双人五子棋房间。", use: "加入五子棋" },
        { name: "落子", desc: "按横坐标、纵坐标落子，范围均为 1 到 17。", use: "落子 8 8" },
        { name: "坐标短指令", desc: "游戏激活后可直接发送坐标。", use: "8 8" },
        { name: "结束游戏", desc: "认输并结束当前对局。", use: "结束五子棋" },
      ]}
      flow={["选择人机或双人模式。", "黑方先手，轮流发送坐标。", "任意方向连成五子即获胜。"]}
      tips={["坐标格式为“横坐标 纵坐标”：左到右为横坐标，上到下为纵坐标。", "双人模式需要第二位玩家加入后才会开始。", "游戏激活后短坐标会优先交给五子棋处理。"]}
    />
  );
}
