//#region \0lvy-asset:32
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/num0-XSW6EgG3.gif", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };