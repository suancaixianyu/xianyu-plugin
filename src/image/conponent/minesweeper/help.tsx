import React from "react";
import GameHelp from "../game-help";

export default function MinesweeperHelp() {
  return (
    <GameHelp
      title="扫雷"
      badge="单人推理"
      subtitle="经典扫雷棋盘，支持难度选择、多坐标操作和局内短指令。开始后可直接发送翻开、标记、取消标记。"
      theme={{ primary: "#475569", accent: "#f6c445", soft: "#fff3c4" }}
      commands={[
        { name: "开始游戏", desc: "用默认简单难度开启一局扫雷。", use: "扫雷" },
        { name: "选择难度", desc: "可选简单、中等、困难，适合不同棋盘规模。", use: "扫雷难度 困难" },
        { name: "翻开格子", desc: "翻开一个或多个坐标，不区分大小写。", use: "翻开 A1 B2" },
        { name: "标记地雷", desc: "给疑似地雷格做旗标，剩余雷数会同步刷新。", use: "标记 C3" },
        { name: "取消标记", desc: "移除已标记的旗标，可一次处理多个坐标。", use: "取消标记 C3" },
        { name: "结束游戏", desc: "主动结束当前扫雷局并释放会话。", use: "结束扫雷" },
      ]}
      flow={["发送扫雷或指定难度开始。", "根据棋盘坐标翻开安全格。", "用标记管理可疑地雷，完成全部安全格获胜。"]}
      tips={["开局后可省略“扫雷”前缀。", "坐标格式为字母加数字，例如 A1。", "命令前可带 /、#、! 等常见前缀。"]}
    />
  );
}
