import { getGameHubStatus, setSelectedOpponent } from "../../api/gameAgents.js";
import { Text, useMessage } from "alemonjs";

//#region src/response/game-agent/res.ts
const readArgument = (event) => {
	const routeArgs = event.__route?.parsedArgs?.join(" ").trim();
	if (routeArgs) return routeArgs;
	return String(event.MessageText ?? "").replace(/^(?:[!！/#＃]\s*)?(?:xy|xianyu|咸鱼)设置AI对手\s*/i, "").trim();
};
const renderStatus = (status) => {
	const agentLines = status.agents.length ? status.agents.map((agent) => {
		const support = agent.games?.join("、") || "未声明游戏";
		return `- ${agent.id}（${agent.name}）：${agent.ready ? "可用" : "不可用"}，支持 ${support}${agent.reason ? `；${agent.reason}` : ""}`;
	}) : ["- 暂无插件订阅"];
	const games = status.games.map((game) => game.name).join("、");
	return [
		`当前会话 guid：${status.guid || "未知"}`,
		`当前 AI 对手：${status.selectedOpponent === "builtin" ? "内置 AI" : status.selectedOpponent}`,
		`对手状态：${status.selectedAvailable ? "可用" : "不可用，将在新对局中回退为内置 AI"}`,
		`可用游戏：${games}`,
		"已订阅 AI：",
		...agentLines,
		"用法：#xy设置AI对手 aichat；#xy设置AI对手 关闭"
	].join("\n");
};
var res_default = async (event) => {
	const [message] = useMessage();
	const value = readArgument(event).toLowerCase();
	const guid = String(event.guid ?? "").trim();
	if (!value) {
		await message.send(format(Text(renderStatus(await getGameHubStatus(guid)))));
		return;
	}
	if ([
		"关闭",
		"close",
		"off",
		"builtin",
		"内置"
	].includes(value)) {
		await setSelectedOpponent(guid);
		await message.send(format(Text("已为当前会话恢复内置 AI。")));
		return;
	}
	const status = await getGameHubStatus(guid);
	const target = status.agents.find((agent) => agent.id.toLowerCase() === value);
	if (!target) {
		await message.send(format(Text(`未找到订阅的 AI 对手“${value}”。\n${renderStatus(status)}`)));
		return;
	}
	if (!target.ready) {
		await message.send(format(Text(`AI 对手“${target.name}”当前不可接管：${target.reason || "未处于默认工具模式"}`)));
		return;
	}
	await setSelectedOpponent(guid, target.id);
	await message.send(format(Text(`已为当前会话设置 AI 对手：${target.name}。新的五子棋将由它执白棋。`)));
};

//#endregion
export { res_default as default };