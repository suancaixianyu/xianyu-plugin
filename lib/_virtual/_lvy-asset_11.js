//#region \0lvy-asset:11
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/b_p-BZaVE1Cp.png", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };