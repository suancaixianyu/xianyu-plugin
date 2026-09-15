//#region \0lvy-asset:22
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/win-BTnYKlb2.gif", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };