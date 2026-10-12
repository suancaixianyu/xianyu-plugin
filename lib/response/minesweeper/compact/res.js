const compactCommandPattern = /^(?:[!！/#＃]\s*)?(扫雷翻开|扫镭翻开|扫雷标记|扫镭标记|扫雷取消标记|扫镭取消标记)\s*([a-zA-Z]\d+(?:\s+[a-zA-Z]\d+)*)$/;
var res = async (event) => {
    const messageText = String(event.MessageText ?? "").trim();
    const match = messageText.match(compactCommandPattern);
    if (!match) {
        return;
    }
    const [, command, coords] = match;
    event.MessageText = `${command} ${coords}`;
    if (command.includes("翻开")) {
        const module = await import('../open/res.js');
        await module.default(event);
        return false;
    }
    const module = await import('../mark/res.js');
    await module.default(event);
    return false;
};

export { res as default };
