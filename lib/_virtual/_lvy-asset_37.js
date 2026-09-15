//#region \0lvy-asset:37
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/3-BVdLjqqd.gif", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };