//#region \0lvy-asset:29
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/ongoing-Dvoqg8pc.gif", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };