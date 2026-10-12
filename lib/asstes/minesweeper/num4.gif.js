const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../../assets/num4-C6piR4m0.gif', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
