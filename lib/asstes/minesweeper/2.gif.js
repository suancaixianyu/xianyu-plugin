const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../../assets/2-5AOtC-Oo.gif', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
