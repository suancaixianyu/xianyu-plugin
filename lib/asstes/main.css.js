const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../assets/main.css-CbBQ7NB_.css', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
