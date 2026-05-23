export default async (event) => {
  const messageText = String(event.MessageText ?? "").trim();
  const match = messageText.match(/^(?:[!！/#＃]\s*)?(24点解|24点答|24点答题)\s+(.+)$/i);

  if (!match) {
    return;
  }

  const [, command, expression] = match;
  event.MessageText = `${command} ${expression}`.trim();

  const module = await import("../answer/res");
  await module.default(event);
  return false;
};
