//#region \0lvy-asset:43
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/boom-DqLQxvk7.gif", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };