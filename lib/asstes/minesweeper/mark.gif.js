const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../../assets/mark-Bog1rWtz.gif', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
