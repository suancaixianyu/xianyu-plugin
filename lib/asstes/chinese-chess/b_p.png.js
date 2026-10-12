const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../../assets/b_p-BZaVE1Cp.png', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
