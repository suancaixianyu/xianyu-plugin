import { Text, useMessage } from "alemonjs";
import { gamePools, gameSession } from "@src/api";
import { TEMPLATE_GAME, type TemplateGameState } from "@src/api/games/template";

const extractInput = (event: { __route?: { parsedArgs?: string[] }; MessageText?: string }) => {
  const routeArgs = event.__route?.parsedArgs?.join(" ")?.trim();
  if (routeArgs) {
    return routeArgs;
  }

  const messageText = String(event.MessageText ?? "")
    .replace(/^(?:[!！/#＃]\s*)?/, "")
    .replace(/^(?:示例操作|模板操作)\s*/, "")
    .trim();

  return messageText || "未提供内容";
};

export default async (event) => {
  const [message] = useMessage();
  const state = gamePools.getGame<TemplateGameState>(event, TEMPLATE_GAME);

  if (!state || state.status !== "playing") {
    await message.send(format(Text("请先开始示例游戏：/示例游戏")));
    return;
  }

  const input = extractInput(event);
  state.step += 1;
  state.lastInput = input;
  gameSession.activate(event, TEMPLATE_GAME);

  await message.send(format(Text(`示例游戏收到：${input}，当前第 ${state.step} 步`)));
};
