//#region \0lvy-asset:33
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/7-D4TlgN7q.gif", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };