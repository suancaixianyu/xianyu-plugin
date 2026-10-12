const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../../assets/r_z-Do8ujijT.png', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
