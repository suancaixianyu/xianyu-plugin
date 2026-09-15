//#region \0lvy-asset:31
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/num5-O5L7fvOD.gif", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };