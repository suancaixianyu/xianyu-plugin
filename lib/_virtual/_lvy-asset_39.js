//#region \0lvy-asset:39
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/num7-_n-35lnI.gif", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };