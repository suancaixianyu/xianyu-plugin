//#region \0lvy-asset:23
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/8-DFkJiCrK.gif", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };