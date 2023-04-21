import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from "../../../lib/puppeteer/puppeteer.js";

export class newcomer extends plugin {
  constructor() {
    super({
      name: '咸鱼帮助',
      dsc: '咸鱼插件帮助',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: "^#?(咸鱼|xianyu|xy)(插件)?(帮助|help)",
          fnc: 'help'
        },
      ]
    })
  }
	async help(e) {
    let cwd = `${process.cwd()}/plugins/xianyu-plugin/resources/`
    cwd = cwd.replace(/\\/g,'/')

    let data = {
      quality:100,
      tplFile:`./plugins/xianyu-plugin/resources/html/help.html`,
      鸡鸡地址:cwd
    }
    let img = await puppeteer.screenshot("xianyu", {
      ...data,
    })
    e.reply(img)
	}

}