const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../../assets/num1-YLAo96zO.gif', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
