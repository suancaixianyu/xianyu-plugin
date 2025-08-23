const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../../assets/0-Ajv8yUOv.gif', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
