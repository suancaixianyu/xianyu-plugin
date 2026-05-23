const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../../assets/num8-DGF5BD4I.gif', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
