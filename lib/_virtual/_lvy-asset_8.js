//#region \0lvy-asset:8
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/b_z-BPOt0D3f.png", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };