const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../assets/alemonjs-BOK2_txv.png', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
