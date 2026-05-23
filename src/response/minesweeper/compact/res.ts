const compactCommandPattern =
  /^(?:[!！/#＃]\s*)?(翻开|扫雷翻开|扫镭翻开|标记|扫雷标记|扫镭标记|取消标记|扫雷取消标记|扫镭取消标记)([a-zA-Z]\d+(?:\s+[a-zA-Z]\d+)*)$/;

export default async (event) => {
  const messageText = String(event.MessageText ?? "").trim();
  const match = messageText.match(compactCommandPattern);

  if (!match) {
    return;
  }

  const [, command, coords] = match;
  event.MessageText = `${command} ${coords}`;

  if (command.includes("翻开")) {
    const module = await import("../open/res");
    await module.default(event);
    return false;
  }

  const module = await import("../mark/res");
  await module.default(event);
  return false;
};
