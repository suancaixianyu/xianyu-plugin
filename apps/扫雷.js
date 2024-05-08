import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import { command, gamemap, ABC, cwd, Btns } from '../config.js'
import { getBtn } from '../res/api.js'
let btn = Btns.扫雷

export class newcomer extends plugin {
  constructor() {
    super({
      name: '咸鱼_扫雷',
      dsc: '咸鱼_扫雷',
      event: 'message',
      priority: 5000,
      rule: [...command.minesweeper],
    })
  }
  /**
   * 游戏设置
   */
  async setup(e) {
    newgame(e)
    if (gamemap[e.group_id].game) return e.reply(`游戏已开始，不可设置`)
    if (/^(#|\/)?(扫雷|排雷)设置地?雷数量?\d+/.test(e.msg)) {
      let emsg = e.msg.match(/\d+/)
      if (+emsg[0] > +gamemap[e.group_id].rows * +gamemap[e.group_id].cols) {
        return e.reply(['设置超出阈值', getBtn() ? segment.button([btn.帮助]) : ''])
      }
      gamemap[e.group_id].z = emsg[0] ? emsg[0] : 10

      e.reply(['修改雷数：' + gamemap[e.group_id].z, getBtn() ? segment.button([btn.开始]) : ''])
    }

    if (/^(#|\/)?(扫雷|排雷)设置布局 ?\d+\s\d+(\s\d+)?/.test(e.msg)) {
      let emsg = e.msg.match(/\d+/g)
      if (+emsg[0] > 100 || +emsg[1] > 26 || +emsg[2] > +emsg[0] * +emsg[1]) return e.reply('设置超出阈值')
      gamemap[e.group_id].z = emsg[2] ? emsg[2] : 10
      gamemap[e.group_id].rows = emsg[0] ? emsg[0] : 9
      gamemap[e.group_id].cols = emsg[1] ? emsg[1] : 9
      e.reply([
        `修改游戏布局\n宽：${gamemap[e.group_id].rows}\n高：${gamemap[e.group_id].cols}\n雷：${gamemap[e.group_id].z}`,
        getBtn() ? segment.button([btn.开始]) : '',
      ])
    }
    if (/^(#|\/)?(扫雷|排雷)设置布局初始化/.test(e.msg)) {
      gamemap[e.group_id].z = 10
      gamemap[e.group_id].rows = 9
      gamemap[e.group_id].cols = 9
      e.reply([
        `初始化布局\n宽：${gamemap[e.group_id].rows}\n高：${gamemap[e.group_id].cols}\n雷：${gamemap[e.group_id].z}`,
        getBtn() ? segment.button([btn.开始]) : '',
      ])
    }
  }

  /**
   * 开始游戏
   */
  async goo(e) {
    newgame(e)
    gamemap[e.group_id].command = e.msg
    goo(e)
  }

  /**
   * 设置难度
   */
  async goolevel(e) {
    newgame(e)
    if (gamemap[e.group_id].game)
      return e.reply(['游戏已经开始', getBtn() ? segment.button([btn.翻开, btn.标记, btn.取消], [btn.结束]) : ''])
    let emsg = e.msg.replace(new RegExp(`^(#|\/)?(扫雷|排雷)难度(:|：)?`), '')
    switch (emsg) {
      case '简单':
        gamemap[e.group_id].z = 10
        gamemap[e.group_id].rows = 9
        gamemap[e.group_id].cols = 9
        break
      case '困难':
        gamemap[e.group_id].z = 60
        gamemap[e.group_id].rows = 26
        gamemap[e.group_id].cols = 26
        break
      case '中等':
        gamemap[e.group_id].z = 40
        gamemap[e.group_id].rows = 16
        gamemap[e.group_id].cols = 16
        break
      case '普通':
        gamemap[e.group_id].z = 40
        gamemap[e.group_id].rows = 16
        gamemap[e.group_id].cols = 16
        break
      default:
        break
    }
    gamemap[e.group_id].command = e.msg
    goo(e)
  }

  /**
   * 结束游戏
   */
  async ov(e) {
    newgame(e)
    if (gamemap[e.group_id].player == e.user_id || e.isMaster) {
      e.reply(['已结束扫雷游戏', getBtn() ? segment.button([btn.开始], [btn.简单, btn.中等, btn.困难], [btn.帮助]) : ''])
      over(e)
    } else {
      e.reply('你不是游戏发起人，不能主动结束游戏')
    }
  }

  /**
   * 取消标记
   * @param {*} e 消息体
   * @param {*} isreply 是否发送消息
   * @param {*} active 是否主动触发
   */
  async removemark(e, isreply = true, active = true) {
    newgame(e)
    if (!gamemap[e.group_id].game) {
      e.reply(['游戏未开始', getBtn() ? segment.button([btn.开始], [btn.简单, btn.中等, btn.困难], [btn.帮助]) : ''])
      return false
    }
    if (active) gamemap[e.group_id].command = e.msg

    let msg = e.msg.match(/((\/|#)取消标记 ?(([a-zA-Z]{1}[0-9]+){1,} ?)+)/g)
    let datamsg = msg.join(',').match(/[a-zA-Z]{1}[0-9]+/g)
    datamsg = Array.from(new Set(datamsg))

    for (const v of datamsg) {
      // 获取坐标
      // emsg[1]为字母，emsg[2]为数字
      let emsg1 = v.replace(/[0-9]+/, '')
      let emsg2 = v.replace(/[a-zA-Z]/, '')
      let letter = emsg1.toUpperCase() // 大写字母
      letter = letter.charCodeAt(0) - 65 // 转数字 A = 0

      let axis = `${letter}-${emsg2}`
      // console.log('取消标记axis', axis)

      // 判断坐标是否存在
      if (gamemap[e.group_id].archive[axis]) {
        // 判断坐标是否显示
        if (gamemap[e.group_id].isopen[axis] == false) {
          gamemap[e.group_id].mark[axis] = false
          // console.log('当前标记：', gamemap[e.group_id].archive[axis], axis)
        }
      }
    }

    if (active) {
      // 处理其他指令
      let mark = e.msg.match(/((\/|#)标记 ?(([a-zA-Z]{1}[0-9]+){1,} ?)+)/)
      let mark2 = e.msg.match(/((\/|#)翻开 ?(([a-zA-Z]{1}[0-9]+){1,} ?)+)/)
      if (mark) {
        await this.mark(e, false, false)
      }
      if (mark2) {
        this.gooplye(e, true, false)
        isreply = false
      }
    }
    if (isreply) e.reply([await image(e), getBtn() ? segment.button([btn.翻开, btn.标记, btn.取消]) : ''])
  }

  /**
   * 标记
   * @param {*} e 消息体
   * @param {*} isreply 是否发送消息
   * @param {*} active 是否主动触发
   */
  async mark(e, isreply = true, active = true) {
    newgame(e)
    if (!gamemap[e.group_id].game) {
      e.reply(['游戏未开始', getBtn() ? segment.button([btn.开始], [btn.简单, btn.中等, btn.困难], [btn.帮助]) : ''])
      return false
    }
    if (active) gamemap[e.group_id].command = e.msg

    let msg = e.msg.match(/((\/|#)标记 ?(([a-zA-Z]{1}[0-9]+){1,} ?)+)/g)
    let datamsg = msg.join(',').match(/[a-zA-Z]{1}[0-9]+/g)
    datamsg = Array.from(new Set(datamsg))

    for (const v of datamsg) {
      // 获取坐标
      // emsg[1]为字母，emsg[2]为数字
      let emsg1 = v.replace(/[0-9]+/, '')
      let emsg2 = v.replace(/[a-zA-Z]/, '')
      let letter = emsg1.toUpperCase() // 大写字母
      letter = letter.charCodeAt(0) - 65 // 转数字 A = 0

      let axis = `${letter}-${emsg2}`
      // console.log('标记axis', axis)

      // 判断坐标是否存在
      if (gamemap[e.group_id].archive[axis]) {
        // 判断坐标是否显示
        if (gamemap[e.group_id].isopen[axis] == false) {
          gamemap[e.group_id].mark[axis] = true
          // console.log('当前标记：', gamemap[e.group_id].archive[axis], axis)
        }
      }
    }
    // 处理其他指令
    let mark = e.msg.match(/((\/|#)取消标记 ?(([a-zA-Z]{1}[0-9]+){1,} ?)+)/)
    let mark2 = e.msg.match(/((\/|#)翻开 ?(([a-zA-Z]{1}[0-9]+){1,} ?)+)/)
    if (active) {
      if (mark) {
        await this.removemark(e, false, false)
      }
      if (mark2) {
        this.gooplye(e, true, false)
        isreply = false
      }
    }
    if (isreply) e.reply([await image(e), getBtn() ? segment.button([btn.翻开, btn.标记, btn.取消]) : ''])
  }

  /**
   * 翻开
   * @param {*} e 消息体
   * @param {*} isreply 是否发送消息
   * @param {*} active 是否主动触发
   */
  async gooplye(e, isreply = true, active = true) {
    newgame(e)
    if (!gamemap[e.group_id].game) {
      e.reply(['游戏未开始', getBtn() ? segment.button([btn.开始], [btn.简单, btn.中等, btn.困难], [btn.帮助]) : ''])
      return false
    }
    if (active) gamemap[e.group_id].command = e.msg

    /**
     * 玩家点击 A1 获得坐标 01
     * 判断 ‘标记雷’ 点击的是否为雷 -> 结束游戏
     * 判断 ‘标记翻开’ 得到剩余数量与雷数量是否一致，一致则胜利 -> 结束游戏
     * 判断 ‘添加数字后的地图数据’ 是否为‘-’，扩散显示，遇到数字停下
     */

    let gameover = false
    let outcome = ''
    let kk = 0

    let msg = e.msg.match(/((\/|#)翻开 ?(([a-zA-Z]{1}[0-9]+){1,} ?)+)/g)
    // 获取坐标
    // emsg[1]为字母，emsg[2]为数字
    let datamsg = msg.join(',').match(/[a-zA-Z]{1}[0-9]+/g)
    datamsg = Array.from(new Set(datamsg))

    for (const v of datamsg) {
      let emsg1 = v.replace(/[0-9]+/, '')
      let emsg2 = v.replace(/[a-zA-Z]/, '')
      let letter = emsg1.toUpperCase() // 大写字母
      letter = letter.charCodeAt(0) - 65 // 转数字 A = 0

      let axis = `${letter}-${emsg2}`

      // 判断坐标是否存在
      if (gamemap[e.group_id].archive[axis]) {
        // 判断雷
        if (gamemap[e.group_id].mines[axis]) {
          gamemap[e.group_id].archive[axis] = 'x'
          gamemap[e.group_id].isopen[axis] = true
          gameover = true
          outcome = 'fail'
          break
        }

        // 扩散显示
        // 当前位置
        let indexs = axis.split('-')

        if (gamemap[e.group_id].archive[axis] === '0') {
          try {
            const loop = (indexs) => {
              ;[
                [+indexs[0] - 1, +indexs[1] - 1],
                [+indexs[0] - 1, +indexs[1]],
                [+indexs[0] - 1, +indexs[1] + 1],
                [+indexs[0], +indexs[1] - 1],
                [+indexs[0], +indexs[1] + 1],
                [+indexs[0] + 1, +indexs[1] - 1],
                [+indexs[0] + 1, +indexs[1]],
                [+indexs[0] + 1, +indexs[1] + 1],
              ].forEach((subIndexs) => {
                // console.log('subIndexs:',subIndexs);
                let el = gamemap[e.group_id].archive[subIndexs.join('-')]
                // console.log('el:',el);
                if (el) {
                  let thisel = gamemap[e.group_id].mark[subIndexs.join('-')]

                  // 值为’-‘开始扩散
                  if (el === '0' && gamemap[e.group_id].isopen[subIndexs.join('-')] === false) {
                    if (thisel !== true) {
                      // 没被标记显示
                      gamemap[e.group_id].isopen[subIndexs.join('-')] = true
                      ++kk
                      loop(subIndexs)
                    }
                  } else {
                    if (thisel !== true) {
                      // 没被标记显示
                      gamemap[e.group_id].isopen[subIndexs.join('-')] = true
                    }
                  }
                }
              })
            }
            loop(indexs)
          } catch (error) {
            gameover = true
            e.reply(['调用栈溢出，请缩小布局大小', getBtn() ? segment.button([btn.设置], [btn.帮助]) : ''])
            break
          }
        }
        // 显示指定坐标块
        gamemap[e.group_id].isopen[axis] = true
      }
    }

    // 处理其他指令
    let mark = e.msg.match(/((\/|#)标记 ?(([a-zA-Z]{1}[0-9]+){1,} ?)+)/)
    let mark2 = e.msg.match(/((\/|#)取消标记 ?(([a-zA-Z]{1}[0-9]+){1,} ?)+)/)
    if (active) {
      if (mark) {
        await this.mark(e, false, false)
      }
      if (mark2) {
        await this.removemark(e, false, false)
      }
    }

    if (outcome == 'fail') {
      gameover = true
      e.reply([
        '踩雷，游戏结束',
        await image(e),
        getBtn() ? segment.button([btn.开始], [btn.简单, btn.中等, btn.困难], [btn.帮助]) : '',
      ])
    }
    // 判断胜利
    if (
      +gamemap[e.group_id].rows * +gamemap[e.group_id].cols - Object.values(gamemap[e.group_id].isopen).filter((v) => v).length ==
        gamemap[e.group_id].z &&
      !gameover
    ) {
      e.reply([
        '恭喜您成功了',
        await image(e),
        getBtn() ? segment.button([btn.开始], [btn.简单, btn.中等, btn.困难], [btn.帮助]) : '',
      ])
      gameover = true
    } else {
      if (isreply) e.reply([await image(e), getBtn() ? segment.button([btn.翻开, btn.标记, btn.取消]) : ''])
    }
    if (gameover) {
      over(e)
    }
  }
}

// 以下为定义方法

/**
 * 初始化游戏
 */
async function newgame(e) {
  if (!gamemap[e.group_id]) {
    gamemap[e.group_id] = {}
    gamemap[e.group_id].mines = {} // 标记雷：{1-1：true}
    gamemap[e.group_id].isopen = {} // 标记翻开：{1-1：true}
    gamemap[e.group_id].archive = {} // 标记值：{1-1：1}
    gamemap[e.group_id].game = false // 游戏是否正在运行
    gamemap[e.group_id].z = 10 // 雷数量
    gamemap[e.group_id].rows = 9 // 横
    gamemap[e.group_id].cols = 9 // 竖
    gamemap[e.group_id].mun = [] // 左上角显示雷数量
    gamemap[e.group_id].data_map1 = [] // 添加数字后的地图数据
    gamemap[e.group_id].mark = {} // 标记样式
    gamemap[e.group_id].player = e.user_id // 游戏发起人
    gamemap[e.group_id].command = '' // 当前指令
  }
}

async function goo(e) {
  /**
   * 开始游戏
   * 生成随机地图
   * 生成各类坐标
   *
   * 输出
   * 标记雷：{1-1：true}
   * 标记翻开：{1-1：true}
   * 标记样式：{1-1：true}
   * 标记值：{1-1：1}
   *
   * 输出无误设置游戏状态
   * game = true
   */

  if (gamemap[e.group_id].game) {
    // e.reply(['扫雷游戏已经开始', await image(e),getBtn()? segment.button([btn.翻开], [btn.帮助], [btn.结束])])
    e.reply(['扫雷游戏已经开始', await image(e), getBtn() ? segment.button([btn.翻开], [btn.帮助], [btn.结束]) : ''])
    return
  }

  let data_map = [] // 雷数据

  // 生成x*y个字符，值为'-'，表示未翻开
  let numbers = Array.from({ length: +gamemap[e.group_id].rows * +gamemap[e.group_id].cols }, () => '0')

  // 随机替换z个数字为9，表示雷
  let indexes = []
  while (indexes.length < gamemap[e.group_id].z) {
    let index = Math.floor(Math.random() * +gamemap[e.group_id].rows * +gamemap[e.group_id].cols)
    if (!indexes.includes(index)) {
      indexes.push(index)
      numbers[index] = 9
    }
  }
  // 遍历numbers，每rows个数换一行
  for (let i = 0; i < numbers.length; i += +gamemap[e.group_id].rows) {
    data_map.push(numbers.slice(i, i + +gamemap[e.group_id].rows))
  }

  /**
   * 添加坐标，标记雷
   * 设置玩家看到的样式，是否翻开
   * 设置标记
   * 设置显示的坐标
   */
  for (let i = 0; i < +gamemap[e.group_id].cols; i++) {
    for (let j = 0; j < +gamemap[e.group_id].rows; j++) {
      // 标记雷
      if (data_map[i][j] == 9) {
        gamemap[e.group_id].mines[i + '-' + j] = true
      } else {
        gamemap[e.group_id].mines[i + '-' + j] = false
      }

      // 设置样式是否翻开
      gamemap[e.group_id].isopen[i + '-' + j] = false

      // 设置标记
      gamemap[e.group_id].mark[i + '-' + j] = false

      // 设置显示的坐标
      // gamemap[e.group_id].mun.push(ABC[i] + j)
    }
  }
  // 实际雷数量
  // console.log(Object.values(gamemap[e.group_id].mines).filter((v) => v).length)

  for (let i = 0; i < gamemap[e.group_id].cols; i++) {
    for (let j = 0; j < gamemap[e.group_id].rows; j++) {
      const isMines = gamemap[e.group_id].mines[i + '-' + j]
      const number = Object.values({
        0: gamemap[e.group_id].mines[`${i - 1}-${j - 1}`],
        1: gamemap[e.group_id].mines[`${i - 1}-${j}`],
        2: gamemap[e.group_id].mines[`${i - 1}-${j + 1}`],
        3: gamemap[e.group_id].mines[`${i}-${j - 1}`],
        4: gamemap[e.group_id].mines[`${i}-${j + 1}`],
        5: gamemap[e.group_id].mines[`${i + 1}-${j - 1}`],
        6: gamemap[e.group_id].mines[`${i + 1}-${j}`],
        7: gamemap[e.group_id].mines[`${i + 1}-${j + 1}`],
      }).filter((v) => v).length
      if (isMines) {
        gamemap[e.group_id].archive[i + '-' + j] = 9
        gamemap[e.group_id].data_map1.push(9)
      } else {
        gamemap[e.group_id].archive[i + '-' + j] = number ? number : '0'
        gamemap[e.group_id].data_map1.push(number ? number : '-')
      }
    }
  }
  // 上帝地图
  // console.log(gamemap[e.group_id].archive);
  gamemap[e.group_id].mun = String(gamemap[e.group_id].mun)
  // e.reply([await image(e),getBtn()? segment.button([btn.翻开, btn.帮助])])
  e.reply([await image(e), getBtn() ? segment.button([btn.翻开, btn.帮助]) : ''])

  gamemap[e.group_id].game = true
}

/**
 * 重置游戏
 */
async function over(e) {
  gamemap[e.group_id].mines = {} // 标记雷：{1-1：true}
  gamemap[e.group_id].isopen = {} // 标记翻开：{1-1：true}
  gamemap[e.group_id].archive = {} // 标记值：{1-1：1}
  gamemap[e.group_id].game = false // 游戏是否正在运行
  gamemap[e.group_id].mun = [] // 左上角显示雷数量
  gamemap[e.group_id].data_map1 = [] // 添加数字后的地图数据
}

async function image(e) {
  // gamemap[e.group_id].rows = 9   x
  // gamemap[e.group_id].cols = 9   y

  let mark = gamemap[e.group_id].mark // 插旗
  let isopen = gamemap[e.group_id].isopen // 翻开
  let archive = gamemap[e.group_id].archive // 地图样貌
  let gameover = Object.values(archive).includes('x') // 是否踩雷
  let z = String(gamemap[e.group_id].z - Object.values(mark).filter(Boolean).length) // 剩余未标记数
  z = z.length <= 2 ? '0' + z : z // 补一个0
  z = z.split('')

  let map = [] // 最终地图，二维数组
  let axis = [] // 坐标显示，二维数组

  // 遍历地图
  for (let i = 0; i < gamemap[e.group_id].cols; i++) {
    map[i] = map[i] ?? []
    axis[i] = axis[i] ?? []
    for (let j = 0; j < gamemap[e.group_id].rows; j++) {
      axis[i][j] = ''
      // 如果踩雷
      if (gameover) {
        map[i][j] = archive[`${i}-${j}`]
      } else if (isopen[`${i}-${j}`]) {
        // 被翻开，显示数字
        map[i][j] = archive[`${i}-${j}`]
      } else {
        // 没有被翻开，有棋子显示旗子
        map[i][j] = mark[`${i}-${j}`] ? 'on' : 'off'
        axis[i][j] = `${ABC[i]}${j}`
      }
    }
  }

  // console.log('axis', axis, 'map', map)

  let data = {
    quality: 100,
    tplFile: './plugins/xianyu-plugin/public/html/扫雷1.html',
    _mapData: {
      z,
      map,
      axis,
      size: 768 / gamemap[e.group_id].rows, // 每一格大小
      command: gamemap[e.group_id].command, // 当前指令
      _res: cwd,
    },
  }
  let img = await puppeteer.screenshot('xianyu-plugin', {
    ...data,
  })
  return img
}
