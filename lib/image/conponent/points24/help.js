import React from 'react';
import GameHelp from '../game-help.js';

function Points24Help() {
    return (React.createElement(GameHelp, { title: "24\u70B9", badge: "\u901F\u7B97\u6311\u6218", subtitle: "\u62BD\u53D6 4 \u5F20\u724C\u540E\uFF0C\u7528\u52A0\u51CF\u4E58\u9664\u548C\u62EC\u53F7\u7EC4\u6210\u7B49\u4E8E 24 \u7684\u8868\u8FBE\u5F0F\u3002\u9002\u5408\u5FEB\u901F\u5F00\u5C40\u3001\u5FEB\u901F\u4F5C\u7B54\u3002", theme: { primary: "#287a4b", accent: "#8bd47a", soft: "#dff5df" }, commands: [
            { name: "开始游戏", desc: "抽取一组新牌并进入当前会话。", use: "开始24点" },
            { name: "提交答案", desc: "用完整命令提交表达式，系统会校验数字和结果。", use: "24点解 (8-2)*4" },
            { name: "局内短答", desc: "游戏激活后可省略 24点 前缀。", use: "解 (8-2)*4" },
            { name: "等号快捷", desc: "把等号作为答题入口，适合连续尝试。", use: "= (8-2)*4" },
            { name: "结束游戏", desc: "放弃当前牌组并清理会话状态。", use: "结束24点" },
        ], flow: ["发送开始命令抽牌。", "观察 4 个数字，构造一个等于 24 的表达式。", "答对后自动结束本局，想继续就重新开始。"], tips: ["表达式只能使用本局抽到的数字。", "支持括号和四则运算。", "局内可用“解”“答”“=”直接作答。"] }));
}

export { Points24Help as default };
