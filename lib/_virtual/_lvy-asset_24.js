//#region \0lvy-asset:24
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/num6-o5cVJBER.gif", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };