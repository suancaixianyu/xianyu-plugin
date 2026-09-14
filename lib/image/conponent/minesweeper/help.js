import React from 'react';
import GameHelp from '../game-help.js';

function MinesweeperHelp() {
    return (React.createElement(GameHelp, { title: "\u626B\u96F7", badge: "\u5355\u4EBA\u63A8\u7406", subtitle: "\u7ECF\u5178\u626B\u96F7\u68CB\u76D8\uFF0C\u652F\u6301\u96BE\u5EA6\u9009\u62E9\u3001\u591A\u5750\u6807\u64CD\u4F5C\u548C\u5C40\u5185\u77ED\u6307\u4EE4\u3002\u5F00\u59CB\u540E\u53EF\u76F4\u63A5\u53D1\u9001\u7FFB\u5F00\u3001\u6807\u8BB0\u3001\u53D6\u6D88\u6807\u8BB0\u3002", theme: { primary: "#475569", accent: "#f6c445", soft: "#fff3c4" }, commands: [
            { name: "开始游戏", desc: "用默认简单难度开启一局扫雷。", use: "扫雷" },
            { name: "选择难度", desc: "可选简单、中等、困难，适合不同棋盘规模。", use: "扫雷难度 困难" },
            { name: "翻开格子", desc: "翻开一个或多个坐标，不区分大小写。", use: "翻开 A1 B2" },
            { name: "标记地雷", desc: "给疑似地雷格做旗标，剩余雷数会同步刷新。", use: "标记 C3" },
            { name: "取消标记", desc: "移除已标记的旗标，可一次处理多个坐标。", use: "取消标记 C3" },
            { name: "结束游戏", desc: "主动结束当前扫雷局并释放会话。", use: "结束扫雷" },
        ], flow: ["发送扫雷或指定难度开始。", "根据棋盘坐标翻开安全格。", "用标记管理可疑地雷，完成全部安全格获胜。"], tips: ["开局后可省略“扫雷”前缀。", "坐标格式为字母加数字，例如 A1。", "命令前可带 /、#、! 等常见前缀。"] }));
}

export { MinesweeperHelp as default };
