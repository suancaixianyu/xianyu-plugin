import { description, helpPrefix, version } from "../../config/plugin.js";
import React from "react";

//#region src/image/conponent/help.tsx
const gameCards = [
	{
		name: "扫雷",
		status: "已上线",
		color: "#f4c542",
		commands: [
			"扫雷",
			"扫雷难度 困难",
			"翻开 A1",
			"标记 B2",
			"结束扫雷"
		],
		desc: "单人棋盘游戏，支持会话接管，开始后可直接用翻开/标记短指令。"
	},
	{
		name: "24点",
		status: "已上线",
		color: "#67c587",
		commands: [
			"开始24点",
			"24点解 3*3+3*5",
			"结束24点",
			"解 (8-2)*4"
		],
		desc: "纯文本速算小游戏，开始后可直接用解/答/= 快速作答。"
	},
	{
		name: "五子棋",
		status: "已上线",
		color: "#7fa7ff",
		commands: [
			"开始五子棋",
			"发起五子棋",
			"加入五子棋",
			"落子 8 8",
			"结束五子棋"
		],
		desc: "支持人机和双人对战，开始后可直接发送坐标短指令落子。"
	},
	{
		name: "推箱子",
		status: "已上线",
		color: "#b58be8",
		commands: [
			"推箱子",
			"推箱子3",
			"移动 wasd",
			"撤回",
			"结束推箱子"
		],
		desc: "旧版内置关卡已迁移，支持指定关卡、连续移动、撤回和自动下一关。"
	},
	{
		name: "中国象棋",
		status: "已上线",
		color: "#e26d5c",
		commands: [
			"发起中国象棋",
			"加入中国象棋",
			"移子 A1 A2",
			"兵一进一",
			"悔棋"
		],
		desc: "支持双人房间、坐标移子、中文棋谱、悔棋申请、棋盘反转和上一步标记。"
	},
	{
		name: "斗兽棋",
		status: "已上线",
		color: "#d99a4e",
		commands: [
			"发起斗兽棋",
			"加入斗兽棋",
			"加入斗兽棋蓝",
			"移动 A0 B0",
			"结束斗兽棋"
		],
		desc: "群内双人棋局，按坐标移动棋子，支持红蓝阵营、回合控制和胜负判定。"
	}
];
const quickCommands = [
	"帮助 / 咸鱼帮助",
	"扫雷帮助",
	"24点帮助",
	"五子棋帮助",
	"推箱子帮助",
	"中国象棋帮助",
	"斗兽棋帮助"
];
function App() {
	return /* @__PURE__ */ React.createElement("html", null, /* @__PURE__ */ React.createElement("body", { style: {
		margin: 0,
		background: "linear-gradient(145deg, #f7f2e9 0%, #e8e0d2 42%, #d7dfe9 100%)",
		fontFamily: "\"Segoe UI\", \"Microsoft YaHei\", sans-serif"
	} }, /* @__PURE__ */ React.createElement("div", { style: { padding: "32px" } }, /* @__PURE__ */ React.createElement("div", { style: {
		background: "rgba(255,255,255,0.88)",
		border: "4px solid #2f3542",
		boxShadow: "10px 10px 0 #9ca7b5",
		padding: "28px"
	} }, /* @__PURE__ */ React.createElement("div", { style: {
		display: "flex",
		alignItems: "flex-start",
		justifyContent: "space-between",
		gap: "24px",
		marginBottom: "24px"
	} }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: {
		display: "inline-block",
		padding: "6px 12px",
		background: "#2f3542",
		color: "#fff7da",
		fontSize: "18px",
		fontWeight: 700,
		letterSpacing: "2px"
	} }, "咸鱼插件帮助"), /* @__PURE__ */ React.createElement("h1", { style: {
		margin: "16px 0 8px",
		fontSize: "40px",
		lineHeight: 1.1,
		color: "#233142",
		fontWeight: 800
	} }, "小游戏合集菜单"), /* @__PURE__ */ React.createElement("p", { style: {
		margin: 0,
		color: "#49566a",
		fontSize: "18px",
		maxWidth: "760px"
	} }, "当前已接入 6 个小游戏，并完成统一状态控制。每个游戏都有独立帮助图，开局后短指令会自动交给当前激活游戏。")), /* @__PURE__ */ React.createElement("div", { style: {
		minWidth: "180px",
		background: "#233142",
		color: "#fff",
		padding: "16px 18px",
		borderRadius: "14px"
	} }, /* @__PURE__ */ React.createElement("div", { style: {
		fontSize: "14px",
		opacity: .8
	} }, "版本"), /* @__PURE__ */ React.createElement("div", { style: {
		fontSize: "26px",
		fontWeight: 800
	} }, "v", version), /* @__PURE__ */ React.createElement("div", { style: {
		fontSize: "14px",
		marginTop: "10px",
		color: "#d6dde8"
	} }, description))), /* @__PURE__ */ React.createElement("div", { style: {
		display: "grid",
		gridTemplateColumns: "1.3fr 0.9fr",
		gap: "20px",
		alignItems: "start"
	} }, /* @__PURE__ */ React.createElement("div", { style: {
		background: "#fffaf1",
		border: "3px solid #424a57",
		padding: "18px"
	} }, /* @__PURE__ */ React.createElement("div", { style: {
		fontSize: "22px",
		fontWeight: 800,
		color: "#2f3542",
		marginBottom: "14px"
	} }, "快速入口"), /* @__PURE__ */ React.createElement("div", { style: {
		display: "flex",
		flexWrap: "wrap",
		gap: "12px"
	} }, quickCommands.map((item) => /* @__PURE__ */ React.createElement("div", {
		key: item,
		style: {
			background: "#2f3542",
			color: "#fff8de",
			padding: "10px 14px",
			borderRadius: "999px",
			fontSize: "17px",
			fontWeight: 700
		}
	}, helpPrefix, item))), /* @__PURE__ */ React.createElement("div", { style: {
		marginTop: "16px",
		color: "#5a6473",
		fontSize: "16px",
		lineHeight: 1.7
	} }, "提示：游戏开始后，部分短指令会自动切到当前激活游戏，例如扫雷的“翻开 A1”和24点的“解 3*3+3*5”。")), /* @__PURE__ */ React.createElement("div", { style: {
		background: "#eef3f9",
		border: "3px solid #424a57",
		padding: "18px"
	} }, /* @__PURE__ */ React.createElement("div", { style: {
		fontSize: "22px",
		fontWeight: 800,
		color: "#2f3542",
		marginBottom: "10px"
	} }, "当前状态"), /* @__PURE__ */ React.createElement("div", { style: {
		color: "#49566a",
		fontSize: "16px",
		lineHeight: 1.75
	} }, /* @__PURE__ */ React.createElement("div", null, "已接入游戏：6 个"), /* @__PURE__ */ React.createElement("div", null, "状态控制：已启用"), /* @__PURE__ */ React.createElement("div", null, "帮助图：插件总览 + 单游戏说明"), /* @__PURE__ */ React.createElement("div", null, "推荐入口：先发帮助，再查看单个游戏帮助")))), /* @__PURE__ */ React.createElement("div", { style: {
		marginTop: "24px",
		display: "flex",
		flexDirection: "column",
		gap: "16px"
	} }, gameCards.map((item) => /* @__PURE__ */ React.createElement("div", {
		key: item.name,
		style: {
			background: "rgba(255,255,255,0.92)",
			border: "3px solid #414b57",
			padding: "18px 20px",
			display: "grid",
			gridTemplateColumns: "200px 1fr",
			gap: "18px"
		}
	}, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: {
		display: "inline-block",
		background: item.color,
		color: "#1f2933",
		fontWeight: 800,
		padding: "6px 10px",
		borderRadius: "999px",
		fontSize: "14px",
		marginBottom: "12px"
	} }, item.status), /* @__PURE__ */ React.createElement("div", { style: {
		fontSize: "28px",
		fontWeight: 800,
		color: "#233142",
		lineHeight: 1.1
	} }, item.name), /* @__PURE__ */ React.createElement("div", { style: {
		marginTop: "10px",
		color: "#586578",
		fontSize: "16px",
		lineHeight: 1.6
	} }, item.desc)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: {
		fontSize: "18px",
		fontWeight: 800,
		color: "#2f3542",
		marginBottom: "10px"
	} }, "常用命令"), /* @__PURE__ */ React.createElement("div", { style: {
		display: "grid",
		gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
		gap: "12px"
	} }, item.commands.map((command) => /* @__PURE__ */ React.createElement("div", {
		key: command,
		style: {
			background: "#f4f6f8",
			border: "2px solid #ccd4dd",
			padding: "10px 12px",
			color: "#2f3542",
			fontSize: "16px",
			fontWeight: 600
		}
	}, helpPrefix, command)))))))))));
}

//#endregion
export { App as default };