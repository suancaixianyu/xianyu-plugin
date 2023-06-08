import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from "../../../lib/puppeteer/puppeteer.js";
import { cwd } from '../config/metadata.js'

export class xianyuhelp extends plugin {
  constructor() {
    super({
      name: '咸鱼帮助',
      dsc: '咸鱼插件帮助',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: /^(#|\/)?(咸鱼|xianyu|xy)(插件)?(帮助|help)/i,
          fnc: 'help'
        },
        {
          reg: /^(#|\/)?(排雷|扫雷)(帮助|help)/i,
          fnc: 'saolei'
        },
        {
          reg: /^(#|\/)?(中国)?象棋(帮助|help)/i,
          fnc: 'xiangqi'
        },
        {
          reg: /^(#|\/)?国际象棋(帮助|help)/i,
          fnc: 'guojixiangqi'
        },
        {
          reg: /^(#|\/)?斗兽棋(帮助|help)/i,
          fnc: 'doushouqi'
        },
      ]
    })
  }

  async doushouqi(e) {
    image(e, 'doushouqi', '斗兽棋帮助', { _res: cwd })
  }

  async guojixiangqi(e) {
    image(e, 'guojixiangqi', '国际象棋帮助', { _res: cwd })
  }

  async xiangqi(e) {
    image(e, 'xiangqi', '象棋帮助', { _res: cwd })
  }

  async saolei(e) {
    image(e, 'saolei', '扫雷帮助')
  }

  async help(e) {
    let _res = `${process.cwd()}/plugins/xianyu-plugin/resources/`
    _res = _res.replace(/\\/g, '/')
    image(e, 'help', '咸鱼帮助', { _res: _res })
  }

}

/**
 * @param {*} e 消息对象
 * @param {*} flie 文件名称
 * @param {*} name 模板名称
 * @param {*} obj 传入对象
 * @returns 发送帮助截图
 */
async function image(e, flie, name, obj) {
  let data = {
    quality: 100,
    tplFile: `./plugins/xianyu-plugin/resources/html/help/${flie}.html`,
    ...obj
  }
  let img = await puppeteer.screenshot(name, {
    ...data,
  })
  e.reply(img)
}