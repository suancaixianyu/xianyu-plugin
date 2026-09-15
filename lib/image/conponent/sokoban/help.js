import { sokobanLevelCount } from "../../../api/games/sokoban.js";
import GameHelp from "../game-help.js";
import React from "react";

//#region src/image/conponent/sokoban/help.tsx
function SokobanHelp() {
	return /* @__PURE__ */ React.createElement(GameHelp, {
		title: "推箱子",
		badge: "关卡解谜",
		subtitle: `旧版内置关卡已迁移 ${sokobanLevelCount} 关。推动箱子到目标点，支持连续移动和撤回一步。`,
		theme: {
			primary: "#5f4b8b",
			accent: "#c3a6ff",
			soft: "#efe7ff"
		},
		commands: [
			{
				name: "开始游戏",
				desc: "从默认关卡开始推箱子。",
				use: "推箱子"
			},
			{
				name: "指定关卡",
				desc: "直接进入指定关卡编号。",
				use: "推箱子3"
			},
			{
				name: "移动角色",
				desc: "用 wasd 表示上下左右，可一次输入多步。",
				use: "移动 wasd"
			},
			{
				name: "短移动",
				desc: "游戏激活后可直接发送方向序列。",
				use: "wasd"
			},
			{
				name: "撤回一步",
				desc: "回到上一步棋盘状态。",
				use: "撤回"
			},
			{
				name: "关卡列表",
				desc: "查看当前内置关卡数量和入口。",
				use: "推箱子关卡列表"
			},
			{
				name: "结束游戏",
				desc: "清理当前推箱子进度。",
				use: "结束推箱子"
			}
		],
		flow: [
			"发送推箱子或指定关卡开始。",
			"用 wasd 推动箱子到目标点。",
			"通关后会自动进入下一关，全部完成后结束。"
		],
		tips: [
			"方向可连续输入，例如 wwaassdd。",
			"撤回只回退一步。",
			"箱子只能推不能拉，卡住时可以结束后重开。"
		]
	});
}

//#endregion
export { SokobanHelp as default };