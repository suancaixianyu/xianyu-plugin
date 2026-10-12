const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../../assets/r_c-BiSHSeqS.png', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
