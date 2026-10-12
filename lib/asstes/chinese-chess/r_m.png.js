const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../../assets/r_m-Ben_wGjg.png', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
