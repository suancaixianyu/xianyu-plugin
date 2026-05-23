export default async (event) => {
  const messageText = String(event.MessageText ?? "").trim();
  const match = messageText.match(/^(?:[!！/#＃]\s*)?(示例操作|示例结束操作)\s*(.+)?$/);

  if (!match) {
    return;
  }

  const [, command, rest = ""] = match;
  event.MessageText = `${command} ${rest}`.trim();

  if (command === "示例结束操作") {
    const module = await import("../exit/res");
    await module.default(event);
    return false;
  }

  const module = await import("../action/res");
  await module.default(event);
  return false;
};
