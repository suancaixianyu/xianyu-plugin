import React from 'react';
import { sokobanLevelCount } from '../../../api/games/sokoban.js';
import GameHelp from '../game-help.js';

function SokobanHelp() {
    return (React.createElement(GameHelp, { title: "\u63A8\u7BB1\u5B50", badge: "\u5173\u5361\u89E3\u8C1C", subtitle: `旧版内置关卡已迁移 ${sokobanLevelCount} 关。推动箱子到目标点，支持连续移动和撤回一步。`, theme: { primary: "#5f4b8b", accent: "#c3a6ff", soft: "#efe7ff" }, commands: [
            { name: "开始游戏", desc: "从默认关卡开始推箱子。", use: "推箱子" },
            { name: "指定关卡", desc: "直接进入指定关卡编号。", use: "推箱子3" },
            { name: "移动角色", desc: "用 wasd 表示上下左右，可一次输入多步。", use: "移动 wasd" },
            { name: "短移动", desc: "游戏激活后可直接发送方向序列。", use: "wasd" },
            { name: "撤回一步", desc: "回到上一步棋盘状态。", use: "撤回" },
            { name: "关卡列表", desc: "查看当前内置关卡数量和入口。", use: "推箱子关卡列表" },
            { name: "结束游戏", desc: "清理当前推箱子进度。", use: "结束推箱子" },
        ], flow: ["发送推箱子或指定关卡开始。", "用 wasd 推动箱子到目标点。", "通关后会自动进入下一关，全部完成后结束。"], tips: ["方向可连续输入，例如 wwaassdd。", "撤回只回退一步。", "箱子只能推不能拉，卡住时可以结束后重开。"] }));
}

export { SokobanHelp as default };
