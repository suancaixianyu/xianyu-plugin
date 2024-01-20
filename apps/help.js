import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import { cwd, command, Btns } from '../config.js'

export class xianyuhelp extends plugin {
  constructor() {
    super({
      name: '咸鱼_帮助',
      dsc: '咸鱼_插件帮助',
      event: 'message',
      priority: 5000,
      rule: [...command.help],
    })
  }

  async doushouqi(e) {
    let btn = Btns.斗兽棋
    image(e, 'doushouqi', '斗兽棋帮助', { _res: cwd }, [
      [btn.发起, btn.加入],
      [btn.结束, btn.帮助],
    ])
  }

  async guojixiangqi(e) {
    let btn = Btns.国际象棋

    image(e, 'guojixiangqi', '国际象棋帮助', { _res: cwd }, [
      [btn.发起, btn.加入],
      [btn.结束, btn.帮助],
    ])
  }

  async xiangqi(e) {
    let btn = Btns.象棋
    image(e, 'xiangqi', '象棋帮助', { _res: cwd }, [
      [btn.发起, btn.加入],
      [btn.结束, btn.帮助],
    ])
  }

  async saolei(e) {
    let btn = Btns.扫雷
    let btns = [[btn.开始], [btn.简单, btn.中等, btn.困难], [btn.设置布局, btn.设置雷数, btn.设置初始化], [btn.结束]]
    image(e, 'saolei', '扫雷帮助', {}, btns)
  }

  async wuziqi(e) {
    let btn = Btns.五子棋
    let btns = [
      [btn.开始, btn.帮助],
      [btn.发起, btn.加入, btn.结束],
    ]

    image(e, 'wuziqi', '五子棋帮助', {}, btns)
  }

  async help(e) {
    let _res = `${process.cwd()}/plugins/xianyu-plugin/resources/`
    _res = _res.replace(/\\/g, '/')
    let btn = Btns.帮助

    let btns = [
      [btn.扫雷, btn.象棋],
      [btn.五子棋, btn.国际象棋],
      [btn.斗兽棋, btn.统计],
    ]
    image(e, 'help', '咸鱼帮助', { _res: _res }, btns)
  }
}

/**
 * @param {*} e 消息对象
 * @param {*} flie 文件名称
 * @param {*} name 模板名称
 * @param {*} obj 传入对象
 * @returns 发送帮助截图
 */
async function image(e, flie, name, obj, btns) {
  let data = {
    quality: 100,
    tplFile: `./plugins/xianyu-plugin/resources/html/help/${flie}.html`,
    ...obj,
  }
  let img = await puppeteer.screenshot(name, {
    ...data,
  })

  e.reply([img, btns ? segment.button(...btns) : ''])
}
