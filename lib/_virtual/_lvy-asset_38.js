//#region \0lvy-asset:38
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/6-CMnNMC4l.gif", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };