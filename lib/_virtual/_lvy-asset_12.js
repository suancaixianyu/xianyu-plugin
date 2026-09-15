//#region \0lvy-asset:12
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/r_p-TknxQ8-4.png", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };