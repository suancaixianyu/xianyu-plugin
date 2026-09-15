import { description, helpPrefix } from "../../config/plugin.js";
import React from "react";

//#region src/image/conponent/game-help.tsx
const commandIndex = (index) => String(index + 1).padStart(2, "0");
function GameHelp({ title, subtitle, badge, theme, commands, tips, flow }) {
	return /* @__PURE__ */ React.createElement("html", null, /* @__PURE__ */ React.createElement("body", { style: {
		margin: 0,
		background: `linear-gradient(145deg, ${theme.soft} 0%, #f7f8fb 54%, #eef1f4 100%)`,
		fontFamily: "\"Segoe UI\", \"Microsoft YaHei\", sans-serif",
		color: "#26313f"
	} }, /* @__PURE__ */ React.createElement("div", { style: {
		width: "980px",
		padding: "28px",
		boxSizing: "border-box"
	} }, /* @__PURE__ */ React.createElement("div", { style: {
		background: "rgba(255,255,255,0.95)",
		border: "3px solid #26313f",
		boxShadow: "8px 8px 0 rgba(38,49,63,0.22)",
		padding: "28px"
	} }, /* @__PURE__ */ React.createElement("div", { style: {
		display: "flex",
		alignItems: "flex-start",
		justifyContent: "space-between",
		gap: "24px",
		marginBottom: "22px"
	} }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: {
		display: "inline-block",
		background: theme.primary,
		color: "#ffffff",
		padding: "7px 14px",
		borderRadius: "999px",
		fontSize: "18px",
		fontWeight: 800
	} }, badge), /* @__PURE__ */ React.createElement("div", { style: {
		marginTop: "14px",
		fontSize: "42px",
		lineHeight: 1.05,
		fontWeight: 900
	} }, title, "帮助图"), /* @__PURE__ */ React.createElement("div", { style: {
		marginTop: "10px",
		fontSize: "18px",
		lineHeight: 1.55,
		color: "#5d6978",
		maxWidth: "660px"
	} }, subtitle)), /* @__PURE__ */ React.createElement("div", { style: {
		minWidth: "190px",
		background: "#26313f",
		color: "#ffffff",
		padding: "16px",
		borderRadius: "8px"
	} }, /* @__PURE__ */ React.createElement("div", { style: {
		fontSize: "14px",
		opacity: .78
	} }, "统一前缀"), /* @__PURE__ */ React.createElement("div", { style: {
		marginTop: "6px",
		fontSize: "23px",
		fontWeight: 900
	} }, helpPrefix), /* @__PURE__ */ React.createElement("div", { style: {
		marginTop: "12px",
		fontSize: "14px",
		color: "#d9e0e8"
	} }, "开局后支持当前游戏短指令"))), /* @__PURE__ */ React.createElement("div", { style: {
		display: "grid",
		gridTemplateColumns: "1.35fr 0.9fr",
		gap: "18px",
		alignItems: "start"
	} }, /* @__PURE__ */ React.createElement("div", { style: {
		border: "2px solid #ccd3dc",
		background: "#ffffff"
	} }, commands.map((item, index) => /* @__PURE__ */ React.createElement("div", {
		key: item.name,
		style: {
			display: "grid",
			gridTemplateColumns: "68px 1fr",
			borderTop: index === 0 ? "none" : "2px solid #e2e6eb"
		}
	}, /* @__PURE__ */ React.createElement("div", { style: {
		background: index % 2 === 0 ? theme.soft : "#f5f7fa",
		color: theme.primary,
		fontWeight: 900,
		fontSize: "22px",
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
	} }, commandIndex(index)), /* @__PURE__ */ React.createElement("div", { style: { padding: "13px 16px" } }, /* @__PURE__ */ React.createElement("div", { style: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "baseline",
		gap: "12px"
	} }, /* @__PURE__ */ React.createElement("div", { style: {
		fontSize: "20px",
		fontWeight: 900
	} }, item.name), /* @__PURE__ */ React.createElement("div", { style: {
		background: "#f3f5f7",
		border: "1px solid #d8dee6",
		color: "#26313f",
		padding: "5px 9px",
		fontSize: "15px",
		fontWeight: 800,
		whiteSpace: "nowrap"
	} }, helpPrefix, item.use)), /* @__PURE__ */ React.createElement("div", { style: {
		marginTop: "6px",
		color: "#5d6978",
		fontSize: "15px",
		lineHeight: 1.55
	} }, item.desc))))), /* @__PURE__ */ React.createElement("div", { style: {
		display: "flex",
		flexDirection: "column",
		gap: "16px"
	} }, /* @__PURE__ */ React.createElement("div", { style: {
		background: theme.primary,
		color: "#ffffff",
		padding: "18px",
		borderRadius: "8px"
	} }, /* @__PURE__ */ React.createElement("div", { style: {
		fontSize: "22px",
		fontWeight: 900,
		marginBottom: "10px"
	} }, "推荐流程"), flow.map((item, index) => /* @__PURE__ */ React.createElement("div", {
		key: item,
		style: {
			display: "grid",
			gridTemplateColumns: "30px 1fr",
			gap: "9px",
			alignItems: "start",
			marginTop: index === 0 ? 0 : "10px",
			fontSize: "16px",
			lineHeight: 1.5
		}
	}, /* @__PURE__ */ React.createElement("div", { style: {
		height: "26px",
		lineHeight: "26px",
		textAlign: "center",
		borderRadius: "999px",
		background: theme.accent,
		color: "#1f2933",
		fontWeight: 900
	} }, index + 1), /* @__PURE__ */ React.createElement("div", null, item)))), /* @__PURE__ */ React.createElement("div", { style: {
		background: "#fffaf1",
		border: `3px solid ${theme.accent}`,
		padding: "16px 18px"
	} }, /* @__PURE__ */ React.createElement("div", { style: {
		fontSize: "21px",
		fontWeight: 900,
		marginBottom: "10px",
		color: "#26313f"
	} }, "小提示"), tips.map((item) => /* @__PURE__ */ React.createElement("div", {
		key: item,
		style: {
			fontSize: "15px",
			lineHeight: 1.65,
			color: "#4f5d6d",
			marginTop: "6px"
		}
	}, item))))), /* @__PURE__ */ React.createElement("div", { style: {
		marginTop: "18px",
		paddingTop: "14px",
		borderTop: "2px solid #dfe5ec",
		color: "#687485",
		fontSize: "14px",
		display: "flex",
		justifyContent: "space-between"
	} }, /* @__PURE__ */ React.createElement("div", null, description), /* @__PURE__ */ React.createElement("div", null, "发送“帮助”查看全部游戏入口"))))));
}

//#endregion
export { GameHelp as default };