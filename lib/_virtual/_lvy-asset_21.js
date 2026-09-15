//#region \0lvy-asset:21
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/over-B9BtpNNa.gif", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };