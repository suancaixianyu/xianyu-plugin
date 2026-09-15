//#region \0lvy-asset:27
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/5-CWJOTn6X.gif", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };