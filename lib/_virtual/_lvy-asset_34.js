//#region \0lvy-asset:34
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/mark-Bog1rWtz.gif", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };