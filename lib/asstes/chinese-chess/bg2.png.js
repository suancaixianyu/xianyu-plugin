const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../../assets/bg2-CYc_tMS_.png', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
