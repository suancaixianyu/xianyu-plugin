//#region \0lvy-asset:35
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/num2-CF1cKu1i.gif", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };