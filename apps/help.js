import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import { cwd, command, Btns } from '../config.js'
import { getBtn } from '../res/api.js'

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
    let btns = [
      [btn.发起, btn.加入],
      [btn.结束, btn.帮助],
    ]
    image(e, 'doushouqi', { _res: cwd }, btns)
  }

  async guojixiangqi(e) {
    let btn = Btns.国际象棋
    let btns = [
      [btn.发起, btn.加入],
      [btn.结束, btn.帮助],
    ]

    image(e, 'guojixiangqi', { _res: cwd }, btns)
  }

  async xiangqi(e) {
    let btn = Btns.象棋
    let btns = [
      [btn.发起, btn.加入],
      [btn.结束, btn.帮助],
    ]
    image(e, 'xiangqi', { _res: cwd }, btns)
  }

  async saolei(e) {
    let btn = Btns.扫雷
    let btns = [
      [btn.开始],
      [btn.简单, btn.中等, btn.困难],
      [btn.设置布局, btn.设置雷数, btn.设置初始化],
      [btn.结束],
    ]
    image(e, 'saolei', {}, btns)
  }

  async wuziqi(e) {
    let btn = Btns.五子棋
    let btns = [
      [btn.开始, btn.帮助],
      [btn.发起, btn.加入, btn.结束],
    ]

    image(e, 'wuziqi', {}, btns)
  }

  async tuixiangzi(e) {
    let btn = Btns.推箱子
    let btns = [[btn.发起], [btn.列表, btn.结束]]

    image(e, 'tuixiangzi', {}, btns)
  }

  async help(e) {
    let _res = `${process.cwd()}/plugins/xianyu-plugin/public/`
    _res = _res.replace(/\\/g, '/')
    let btn = Btns.帮助

    let btns = [
      [btn.扫雷, btn.象棋, btn.铅弹轮盘],
      [btn.五子棋, btn.国际象棋, btn.推箱子],
      [btn.斗兽棋, btn.统计],
    ]
    image(e, 'help', { _res: _res }, btns)
  }
}

/**
 * @param {*} e 消息对象
 * @param {*} flie 文件名称
 * @param {*} obj 传入对象
 * @returns 发送帮助截图
 */
async function image(e, flie, obj, btns) {
  let data = {
    quality: 100,
    tplFile: `./plugins/xianyu-plugin/public/html/help/${flie}.html`,
    ...obj,
  }
  let img = await puppeteer.screenshot('xianyu-plugin', {
    ...data,
  })

  e.reply([img, btns && getBtn() ? segment.button(...btns) : ''])
}
