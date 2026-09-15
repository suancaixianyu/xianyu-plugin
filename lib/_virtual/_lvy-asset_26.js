//#region \0lvy-asset:26
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/off-AXiWnwTw.gif", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };