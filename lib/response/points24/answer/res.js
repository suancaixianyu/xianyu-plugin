import { gamePools } from "../../../api/gamePools.js";
import { gameSession } from "../../../api/gameSession.js";
import { POINTS24_GAME } from "../../../api/games/points24.js";
import "../../../api/index.js";
import { Text, useMessage } from "alemonjs";

//#region src/response/points24/answer/res.ts
const normalizeExpression = (expression) => {
	return expression.replace(/×/g, "*").replace(/÷/g, "/").replace(/﹢/g, "+").replace(/﹣/g, "-").replace(/\s+/g, "").toUpperCase();
};
const cardToNumber = (card) => {
	if (card === "A") return 1;
	if (card === "J") return 11;
	if (card === "Q") return 12;
	if (card === "K") return 13;
	return Number(card);
};
const readExpression = (event) => {
	const routeArgs = event.__route?.parsedArgs?.join(" ")?.trim();
	if (routeArgs) return routeArgs;
	return String(event.MessageText ?? "").replace(/^(?:[!！/#＃]\s*)?/, "").replace(/^(?:24点解|24点答|24点答题)\s*/i, "").trim();
};
var res_default = async (event) => {
	const [message] = useMessage();
	const game = gamePools.getGame(event, POINTS24_GAME);
	if (!game) {
		await message.send(format(Text("当前没有进行中的24点游戏，请先发送“/开始24点”。")));
		return;
	}
	const rawExpression = readExpression(event);
	if (!rawExpression) {
		await message.send(format(Text("请输入表达式，例如：24点解 3*3+3*5")));
		return;
	}
	const expression = normalizeExpression(rawExpression);
	if (!/^[\d+\-*/()A-Z]+$/.test(expression)) {
		await message.send(format(Text("表达式包含不允许的字符，请只使用数字、AJQK、括号和运算符。")));
		return;
	}
	const usedCards = expression.match(/\d+/g)?.map(Number) ?? [];
	const remainingCards = [...game.cards.map(cardToNumber)];
	for (const card of usedCards) {
		const index = remainingCards.indexOf(card);
		if (index === -1) {
			await message.send(format(Text(`你使用了未抽取的牌：${card}，请重新计算。`)));
			return;
		}
		remainingCards.splice(index, 1);
	}
	const evalExpression = expression.replace(/A/g, "1").replace(/J/g, "11").replace(/Q/g, "12").replace(/K/g, "13");
	try {
		const result = Function(`"use strict"; return (${evalExpression});`)();
		if (result === 24) {
			const timeTaken = ((Date.now() - game.startTime) / 1e3).toFixed(2);
			gamePools.removeGame(event, POINTS24_GAME);
			gameSession.deactivate(event, POINTS24_GAME);
			await message.send(format(Text(`恭喜你，计算正确！${expression} = 24\n游戏结束。使用时间：${timeTaken} 秒。`)));
			return;
		}
		gameSession.activate(event, POINTS24_GAME);
		await message.send(format(Text(`计算结果是 ${result}，不等于24，请重新计算。`)));
	} catch {
		await message.send(format(Text("表达式有误，请检查后重新输入。")));
	}
};

//#endregion
export { res_default as default };