//#region \0lvy-asset:14
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/bg-L7G-ud6J.png", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };