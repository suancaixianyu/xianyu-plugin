import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import { cwd } from '../config/global/metadata.js'
import { command } from '../config/global/command.js'

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
    let btns = [
      [
        {
          text: '发起斗兽棋',
          clicked_text: '/发起斗兽棋',
          callback: '/发起斗兽棋',
          send: true,
        },
        {
          text: '加入斗兽棋',
          clicked_text: '/加入斗兽棋',
          callback: '/加入斗兽棋',
          send: true,
        },
      ],
      [
        {
          text: '结束斗兽棋',
          clicked_text: '/结束斗兽棋',
          callback: '/结束斗兽棋',
          send: true,
        },
        {
          text: '帮助',
          clicked_text: '/斗兽棋帮助',
          callback: '/斗兽棋帮助',
          send: true,
        },
      ],
    ]
    image(e, 'doushouqi', '斗兽棋帮助', { _res: cwd }, btns)
  }

  async guojixiangqi(e) {
    let btns = [
      [
        {
          text: '发起国际象棋',
          clicked_text: '/发起国际象棋',
          callback: '/发起国际象棋',
          send: true,
        },
        {
          text: '加入国际象棋',
          clicked_text: '/加入国际象棋',
          callback: '/加入国际象棋',
          send: true,
        },
      ],
      [
        {
          text: '结束国际象棋',
          clicked_text: '/结束国际象棋',
          callback: '/结束国际象棋',
          send: true,
        },
        {
          text: '帮助',
          clicked_text: '/国际象棋帮助',
          callback: '/国际象棋帮助',
          send: true,
        },
      ],
    ]
    image(e, 'guojixiangqi', '国际象棋帮助', { _res: cwd }, btns)
  }

  async xiangqi(e) {
    let btns = [
      [
        {
          text: '发起中国象棋',
          clicked_text: '/发起中国象棋',
          callback: '/发起中国象棋',
          send: true,
        },
        {
          text: '加入中国象棋',
          clicked_text: '/加入中国象棋',
          callback: '/加入中国象棋',
          send: true,
        },
      ],
      [
        {
          text: '结束中国象棋',
          clicked_text: '/结束中国象棋',
          callback: '/结束中国象棋',
          send: true,
        },
        {
          text: '帮助',
          clicked_text: '/中国象棋帮助',
          callback: '/中国象棋帮助',
          send: true,
        },
      ],
    ]
    image(e, 'xiangqi', '象棋帮助', { _res: cwd }, btns)
  }

  async saolei(e) {
    let btns = [
      [
        {
          text: '开始游戏',
          clicked_text: '/扫雷',
          callback: '/扫雷',
          send: true,
        },
      ],
      [
        {
          text: '简单',
          clicked_text: '/扫雷难度简单',
          callback: '/扫雷难度简单',
          send: true,
        },
        {
          text: '中等',
          clicked_text: '/扫雷难度中等',
          callback: '/扫雷难度中等',
          send: true,
        },
        {
          text: '困难',
          clicked_text: '/扫雷难度困难',
          callback: '/扫雷难度困难',
          send: true,
        },
      ],
      [
        {
          text: '设置布局',
          input: '/扫雷设置布局9 9 10',
          send: false,
        },
        {
          text: '设置雷数',
          input: '/扫雷设置地雷10',
          send: false,
        },
        {
          text: '初始化',
          clicked_text: '/扫雷设置布局初始化',
          callback: '/扫雷设置布局初始化',
          send: true,
        },
      ],
      [
        {
          text: '结束扫雷',
          clicked_text: '/结束扫雷',
          callback: '/结束扫雷',
          send: true,
        },
      ],
    ]
    image(e, 'saolei', '扫雷帮助', {}, btns)
  }

  async wuziqi(e) {
    let btns = [
      [
        {
          text: '开始游戏',
          clicked_text: '/五子棋',
          callback: '/五子棋',
          send: true,
        },
        {
          text: '帮助',
          clicked_text: '/五子棋帮助',
          callback: '/五子棋帮助',
          send: true,
        },
      ],
      [
        {
          text: '发起五子棋',
          clicked_text: '/发起五子棋',
          callback: '/发起五子棋',
          send: true,
        },
        {
          text: '加入五子棋',
          clicked_text: '/加入五子棋',
          callback: '/加入五子棋',
          send: true,
        },
        {
          text: '结束五子棋',
          clicked_text: '/结束五子棋',
          callback: '/结束五子棋',
          send: true,
        },
      ],
    ]

    image(e, 'wuziqi', '五子棋帮助', {}, btns)
  }

  async help(e) {
    let _res = `${process.cwd()}/plugins/xianyu-plugin/resources/`
    _res = _res.replace(/\\/g, '/')

    let btns = [
      [
        {
          text: '扫雷',
          clicked_text: '/扫雷帮助',
          callback: '/扫雷帮助',
          send: true, // 是否直接发送
        },
        {
          text: '象棋',
          clicked_text: '/中国象棋帮助',
          callback: '/中国象棋帮助',
          send: true, // 是否直接发送
        },
      ],
      [
        {
          text: '五子棋',
          clicked_text: '/五子棋帮助',
          callback: '/五子棋帮助',
          send: true, // 是否直接发送
        },
        {
          text: '国际象棋',
          clicked_text: '/国际象棋帮助',
          callback: '/国际象棋帮助',
          send: true, // 是否直接发送
        },
        {
          text: '斗兽棋',
          clicked_text: '/斗兽棋帮助',
          callback: '/斗兽棋帮助',
          send: true, // 是否直接发送
        },
      ],
      [
        {
          text: '用户使用数',
          clicked_text: '/咸鱼统计',
          callback: '/咸鱼统计',
          send: true, // 是否直接发送
        },
      ],
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
