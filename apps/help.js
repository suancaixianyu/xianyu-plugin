import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from "../../../lib/puppeteer/puppeteer.js"
import { cwd } from '../config/global/metadata.js'
import { command } from '../config/global/command.js'

export class xianyuhelp extends plugin {
  constructor() {
    super({
      name: '咸鱼帮助',
      dsc: '咸鱼插件帮助',
      event: 'message',
      priority: 5000,
      rule: [
        ...command.help
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