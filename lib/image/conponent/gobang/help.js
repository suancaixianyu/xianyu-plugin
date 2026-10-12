import React from 'react';
import GameHelp from '../game-help.js';

function GobangHelp() {
    return (React.createElement(GameHelp, { title: "\u4E94\u5B50\u68CB", badge: "\u4EBA\u673A\u4E0E\u53CC\u4EBA", subtitle: "17 \u8DEF\u68CB\u76D8\u4E94\u5B50\u68CB\uFF0C\u652F\u6301\u4EBA\u673A\u7EC3\u4E60\u548C\u7FA4\u5185\u53CC\u4EBA\u5BF9\u6218\u3002\u5F00\u5C40\u540E\u53EF\u76F4\u63A5\u53D1\u9001\u5750\u6807\u843D\u5B50\u3002", theme: { primary: "#315caa", accent: "#91b7ff", soft: "#e2ecff" }, commands: [
            { name: "人机开局", desc: "开启一局人机对战，你执黑先手。", use: "开始五子棋" },
            { name: "发起对局", desc: "创建双人房间，等待另一位玩家加入。", use: "发起五子棋" },
            { name: "加入对局", desc: "加入当前等待中的双人五子棋房间。", use: "加入五子棋" },
            { name: "落子", desc: "按横坐标、纵坐标落子，范围均为 1 到 17。", use: "落子 8 8" },
            { name: "坐标短指令", desc: "游戏激活后可直接发送坐标。", use: "8 8" },
            { name: "结束游戏", desc: "认输并结束当前对局。", use: "结束五子棋" },
        ], flow: ["选择人机或双人模式。", "黑方先手，轮流发送坐标。", "任意方向连成五子即获胜。"], tips: ["坐标格式为“横坐标 纵坐标”：左到右为横坐标，上到下为纵坐标。", "双人模式需要第二位玩家加入后才会开始。", "游戏激活后短坐标会优先交给五子棋处理。"] }));
}

export { GobangHelp as default };
