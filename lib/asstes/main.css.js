const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../assets/main.css-C2Fh7i1P.css', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
