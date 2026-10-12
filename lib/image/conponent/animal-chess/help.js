import React from 'react';
import GameHelp from '../game-help.js';

function AnimalChessHelp() {
    return (React.createElement(GameHelp, { title: "\u6597\u517D\u68CB", badge: "\u53CC\u4EBA\u68CB\u5C40", subtitle: "\u7FA4\u5185\u53CC\u4EBA\u6597\u517D\u68CB\uFF0C\u6309\u5750\u6807\u79FB\u52A8\u68CB\u5B50\u3002\u623F\u95F4\u4F1A\u8BB0\u5F55\u5F53\u524D\u9635\u8425\u3001\u56DE\u5408\u548C\u4E0A\u4E00\u624B\u4F4D\u7F6E\u3002", theme: { primary: "#7c3f19", accent: "#f2b35f", soft: "#ffe7c2" }, commands: [
            { name: "发起对局", desc: "创建斗兽棋房间，默认红方先手。", use: "发起斗兽棋" },
            { name: "加入对局", desc: "加入等待中的房间，通常作为蓝方。", use: "加入斗兽棋" },
            { name: "指定阵营", desc: "按需要加入红方或蓝方。", use: "加入斗兽棋蓝" },
            { name: "移动棋子", desc: "用起点和终点坐标移动棋子。", use: "移动 A0 B0" },
            { name: "局内短移", desc: "游戏激活后可直接发送连续坐标。", use: "A0B0" },
            { name: "结束游戏", desc: "认输并结束当前斗兽棋对局。", use: "结束斗兽棋" },
        ], flow: ["先由一名玩家发起房间。", "第二位玩家加入后开始轮流行动。", "按棋子强弱、河道和陷阱规则吃子取胜。"], tips: ["坐标使用字母列加数字行，例如 A0。", "也可使用“动物棋”作为别名。", "只有轮到自己的阵营时才能移动。"] }));
}

export { AnimalChessHelp as default };
