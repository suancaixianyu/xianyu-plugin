const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../../assets/b_x-DK3K9Pdv.png', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
