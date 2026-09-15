import GameHelp from "../game-help.js";
import React from "react";

//#region src/image/conponent/points24/help.tsx
function Points24Help() {
	return /* @__PURE__ */ React.createElement(GameHelp, {
		title: "24点",
		badge: "速算挑战",
		subtitle: "抽取 4 张牌后，用加减乘除和括号组成等于 24 的表达式。适合快速开局、快速作答。",
		theme: {
			primary: "#287a4b",
			accent: "#8bd47a",
			soft: "#dff5df"
		},
		commands: [
			{
				name: "开始游戏",
				desc: "抽取一组新牌并进入当前会话。",
				use: "开始24点"
			},
			{
				name: "提交答案",
				desc: "用完整命令提交表达式，系统会校验数字和结果。",
				use: "24点解 (8-2)*4"
			},
			{
				name: "局内短答",
				desc: "游戏激活后可省略 24点 前缀。",
				use: "解 (8-2)*4"
			},
			{
				name: "等号快捷",
				desc: "把等号作为答题入口，适合连续尝试。",
				use: "= (8-2)*4"
			},
			{
				name: "结束游戏",
				desc: "放弃当前牌组并清理会话状态。",
				use: "结束24点"
			}
		],
		flow: [
			"发送开始命令抽牌。",
			"观察 4 个数字，构造一个等于 24 的表达式。",
			"答对后自动结束本局，想继续就重新开始。"
		],
		tips: [
			"表达式只能使用本局抽到的数字。",
			"支持括号和四则运算。",
			"局内可用“解”“答”“=”直接作答。"
		]
	});
}

//#endregion
export { Points24Help as default };