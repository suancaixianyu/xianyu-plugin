import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import panduan from '../lib/ChessDecides.js'
import { command, initialmap, cwd, Btns } from '../config.js'
import { getBtn } from '../res/api.js'

const as = new panduan()

/**
 * 游戏过程中所有数据
 * @param {Object} chessman 渲染后的地图
 * @param {Object} archive 双方棋子位置标记A,B,'0'
 * @param {Boolean} game 游戏是否开始
 * @param {Object} players 参与游戏的玩家编号
 * @param {Object} nickname 参与游戏的玩家昵称
 * @param {Object} current 参与游戏的玩家昵称
 */
let metadata = {}

// 初始地图，不可修改
let map = initialmap.chess
const rows = 8 // 棋盘宽度
const cols = 8 // 棋盘高度

const btn = Btns.国际象棋

export class Chess extends plugin {
  constructor() {
    super({
      name: '咸鱼_国际象棋',
      dsc: '咸鱼_国际象棋',
      event: 'message',
      priority: 5000,
      rule: [...command.chess],
    })
  }

  /**
   * 认输
   */
  async ov(e) {
    if (metadata[e.group_id] && metadata[e.group_id].nickname[e.user_id] === e.sender.nickname) {
      // 判断玩家是否在游戏中
      let team = metadata[e.group_id].players[e.user_id]
      // console.log('player：' + team)
      // 对方组
      let isAB = '黑白'
      isAB = isAB.replace(new RegExp(team), '')
      e.reply([`恭喜${isAB}队获得胜利`, getBtn() ? segment.button([btn.发起, btn.帮助]) : ''])
      over(e)
    } else {
      e.reply(`你还没加入游戏，不能主动结束游戏`)
    }
  }

  /**
   * 发起游戏
   */
  async LaunchGame(e) {
    if (!metadata[e.group_id]) {
      await over(e)
    }
    let emsg = e.msg.match(/[黑白]/)
    let players = Object.values(metadata[e.group_id].players).length
    // console.log(players);

    // 判断是否在游戏内
    if (metadata[e.group_id].players[e.user_id]) {
      e.reply('你已加入游戏，队伍：' + metadata[e.group_id].players[e.user_id])
      return
    }

    // 判断是玩家几
    if (players == 0) {
      metadata[e.group_id].nickname[e.user_id] = e.sender.nickname || ''
      metadata[e.group_id].players[e.user_id] = '黑'
      e.reply([
        `玩家${e.sender.nickname || ''}发起了国际象棋，其他成员可发送“加入国际象棋”加入游戏`,
        getBtn() ? segment.button([btn.加入]) : '',
      ])
    }
    if (players == 1) {
      metadata[e.group_id].nickname[e.user_id] = e.sender.nickname || ''
      metadata[e.group_id].players[e.user_id] = '白'

      let players_nickname = Object.keys(metadata[e.group_id].players)

      let A = metadata[e.group_id].players[players_nickname[0]]
      let B = metadata[e.group_id].players[players_nickname[1]]

      e.reply([
        `本群游戏开始\n`,
        `${A}棋:${metadata[e.group_id].nickname[players_nickname[0]]}\n`,
        `${B}棋:${metadata[e.group_id].nickname[players_nickname[1]]}\n`,
        `${A}棋先手\n`,
        `其他成员发送“加入国际象棋黑或白”加入队伍中`,
        getBtn() ? segment.button([btn.移动, btn.帮助]) : '',
      ])
      metadata[e.group_id].current = '黑'
      await newgame(e)
    }
    if (players >= 2 && emsg[0]) {
      metadata[e.group_id].nickname[e.user_id] = e.sender.nickname || ''
      metadata[e.group_id].players[e.user_id] = emsg[0]
      e.reply([
        `玩家${e.sender.nickname || ''}加入队伍“${emsg[0]}”`,
        getBtn() ? segment.button([btn.移动, btn.帮助]) : '',
      ])
    }
  }

  /**
   * 游戏指令
   */
  async game(e) {
    if (!metadata[e.group_id] || !metadata[e.group_id].game) return false

    // 判断玩家是否在游戏中
    let team = metadata[e.group_id].players[e.user_id]
    if (!team) {
      e.reply([
        `你还没加入游戏，可发送”加入国际象棋黑或白“加入队伍中`,
        getBtn() ? segment.button([btn.加入]) : '',
      ])
      return false
    }
    // console.log("player：" + team)

    // 对方组
    let isAB = '黑白'
    isAB = isAB.replace(new RegExp(team), '')

    // 判断是否可操作
    if (team != metadata[e.group_id].current) {
      e.reply(`当前不是你的回合`)
      return
    }

    // 0：选择，1：目的地
    let emsg = e.msg.toUpperCase() // 大写字母
    emsg = emsg.match(/([a-zA-Z])(\d+)[\s\S]?([a-zA-Z])(\d+)/)

    // 选择
    let letter1 = emsg[1].charCodeAt(0) - 65 // 转数字 A = 0
    let num1 = emsg[2]
    let tp1 = `${letter1}-${num1}`

    // 目的地
    let letter2 = emsg[3].charCodeAt(0) - 65 // 转数字 A = 0
    let num2 = emsg[4]
    let tp2 = `${letter2}-${num2}`
    // console.log(tp1,tp2);

    // 判断移动是否正确
    let iscorrect = await as.Audit(e, [letter1, num1, letter2, num2], tp1, tp2, team, metadata)
    // console.log(iscorrect)
    if (!iscorrect || iscorrect[0] !== true) {
      e.reply([`移动不正确`, getBtn() ? segment.button([btn.移动, btn.帮助]) : ''])
      return
    }

    let target = metadata[e.group_id].chessman[letter1 + '-' + num1]

    // 移动自己的棋子
    if (metadata[e.group_id].archive[tp1] == team) {
      if (metadata[e.group_id].chessman[tp2] && metadata[e.group_id].chessman[tp2] != team) {
        // 清空原本位置，添加新的位置
        metadata[e.group_id].chessman[tp1] = '空'
        metadata[e.group_id].chessman[tp2] = target
        metadata[e.group_id].archive[tp1] = '0'
        metadata[e.group_id].archive[tp2] = team
        metadata[e.group_id].current = isAB // 设置组
      }
      // 胜利提示
      if (iscorrect[1] === true) {
        e.reply([
          `恭喜${team}队获得胜利`,
          await generate(e, tp1, tp2),
          getBtn() ? segment.button([btn.发起, btn.帮助]) : '',
        ])
        over(e)
      } else {
        // 传入两个tp点
        e.reply([await generate(e, tp1, tp2), getBtn() ? segment.button([btn.移子, btn.帮助]) : ''])
      }
    }
  }
}

/**
 * 新游戏
 */
async function newgame(e) {
  let data_map1 = []
  // 遍历numbers，每x个数换一行
  for (let i = 0; i < map.length; i += rows) {
    data_map1.push(map.slice(i, i + rows))
  }

  // 初始化双方棋子
  for (let i in data_map1) {
    for (let j in data_map1[i]) {
      // 前排
      if (i == 0 || i == 1) {
        metadata[e.group_id].archive[i + '-' + j] = '白'
      } else if (i == 6 || i == 7) {
        // 后排
        metadata[e.group_id].archive[i + '-' + j] = '黑'
      } else {
        // 空位
        metadata[e.group_id].archive[i + '-' + j] = '0'
      }
      metadata[e.group_id].chessman[i + '-' + j] = data_map1[i][j]
    }
  }
  metadata[e.group_id].game = true
  e.reply([await generate(e), getBtn() ? segment.button([btn.移子, btn.帮助]) : ''])
}

/**
 * 初始化游戏
 */
async function over(e) {
  metadata[e.group_id] = {}
  metadata[e.group_id].chessman = {}
  metadata[e.group_id].archive = {} // 双方棋子位置标记
  metadata[e.group_id].game = false // 游戏是否正在运行
  metadata[e.group_id].players = {} // 参与游戏的玩家
  metadata[e.group_id].nickname = {} // 参与游戏的玩家
  metadata[e.group_id].current = {} // 当前可操作的玩家
}

/**
 * 发送图片
 */
async function generate(e, tp1, tp2) {
  let data_map = metadata[e.group_id].chessman // 拉取地图数据
  let biaoji = String(Object.values(metadata[e.group_id].archive)) // 获取双方棋子标记
  let ss = {} // 标记框
  let isAB
  if (metadata[e.group_id].current === '白') {
    isAB = '黑box'
  } else {
    isAB = '白box'
  }
  // 设置标记框
  if (tp1 && tp2) {
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (tp1 == `${i}-${j}` || tp2 == `${i}-${j}`) {
          ss[`${i}-${j}`] = isAB
        } else {
          ss[`${i}-${j}`] = '0'
        }
      }
    }
  }
  data_map = String(Object.values(data_map)) // 格式化地图
  ss = String(Object.values(ss)) // 格式化标记地图

  /**
   * map 地图
   */
  let data = {
    quality: 100,
    tplFile: './plugins/xianyu-plugin/public/html/国际象棋.html',
    map: data_map,
    archive: biaoji,
    _res: cwd,
    ss: ss,
  }
  let img = await puppeteer.screenshot('xianyu-plugin', {
    ...data,
  })
  return img
}
