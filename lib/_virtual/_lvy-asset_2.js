//#region \0lvy-asset:2
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/b_j-DxjXQusb.png", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };