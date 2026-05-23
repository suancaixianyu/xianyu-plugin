const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../../assets/1-CiycXx2s.gif', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
