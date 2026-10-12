const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../../assets/b_j-DxjXQusb.png', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
