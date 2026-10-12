import React from 'react';
import GameHelp from '../game-help.js';

function ChineseChessHelp() {
    return (React.createElement(GameHelp, { title: "\u4E2D\u56FD\u8C61\u68CB", badge: "\u5750\u6807\u4E0E\u68CB\u8C31", subtitle: "\u652F\u6301\u7FA4\u5185\u53CC\u4EBA\u8C61\u68CB\u3001\u5750\u6807\u79FB\u5B50\u3001\u4E2D\u6587\u68CB\u8C31\u3001\u6094\u68CB\u7533\u8BF7\u3001\u68CB\u76D8\u53CD\u8F6C\u548C\u4E0A\u4E00\u6B65\u6807\u8BB0\u3002", theme: { primary: "#9c2f2f", accent: "#f2c36b", soft: "#ffe8d6" }, commands: [
            { name: "发起对局", desc: "创建中国象棋房间，默认执红。", use: "发起中国象棋" },
            { name: "加入对局", desc: "加入等待中的房间并执黑。", use: "加入中国象棋" },
            { name: "指定阵营", desc: "按需要加入红方或黑方。", use: "加入中国象棋黑" },
            { name: "坐标移子", desc: "按起点和终点坐标移动棋子，行 A-J，列 1-9。", use: "移子 A1 A2" },
            { name: "中文棋谱", desc: "支持常见中文记谱，如进、退、平。", use: "兵一进一" },
            { name: "悔棋处理", desc: "发起悔棋请求，对方可同意或拒绝。", use: "悔棋" },
            { name: "结束游戏", desc: "认输并结束当前象棋对局。", use: "结束中国象棋" },
        ], flow: ["一名玩家发起房间。", "另一名玩家加入后红方先行。", "用坐标或中文棋谱走子，将死对方获胜。"], tips: ["也可发送“发起象棋”“象棋帮助”等别名。", "中文棋谱支持車/车、馬/马、象/相、士/仕等写法。", "悔棋需要对方同意才会回退。"] }));
}

export { ChineseChessHelp as default };
