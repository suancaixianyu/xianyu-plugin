const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../../assets/num3-BTQcFW_N.gif', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
