import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import { cwd, command, Btns, AppName } from '../config.js'
import { getYaml, saveYaml } from '../res/api.js'

export class xianyu_setup extends plugin {
  constructor() {
    super({
      name: '咸鱼_插件设置',
      dsc: '咸鱼_插件设置',
      event: 'message',
      priority: 3000,
      rule: [
        {
          reg: /^(\/|#)?(咸鱼|xianyu|xy)(插件)?设置 ?.*$/i,
          fnc: 'setup',
        },
      ],
    })
  }

  async setup(e) {
    // 获取配置文件
    let config = getYaml('config')
    console.log('config', config)
    let msg = e.msg.replace(/^(\/|#)?(咸鱼|xianyu|xy)(插件)?设置/, '').trim()
    if (msg == '') {
      // image(e, 'set', '咸鱼插件设置', { _res: cwd })
      return
    }
    if (/^按钮/.test(msg)) {
      let state = msg.replace(/^按钮/, '').trim()
      console.log('state', state)
      if (state == '开启') {
        config.set.btn = true
      } else if (state == '关闭') {
        config.set.btn = false
      }
      console.log('config', config)
      saveYaml('config', config)
      e.reply('设置成功')
    }
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
    tplFile: `./plugins/${AppName}/public/html/${flie}.html`,
    ...obj,
  }
  let img = await puppeteer.screenshot(name, {
    ...data,
  })

  e.reply([img, btns ? segment.button(...btns) : ''])
}
