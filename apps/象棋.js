import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from "../../../lib/puppeteer/puppeteer.js";
import panduan from "../lib/ChineseChessDecide.js";
import { cwd, initialmap, chinesechessname, chineseNumbers } from '../config/metadata.js'
const as = new panduan()

// 全局变量
let isrollback = 'off' // 颠倒棋盘

/**
 * 游戏过程中所有数据
 * @param {Object} chessman 渲染后的地图
 * @param {Object} archive 双方棋子位置标记A,B,'0'
 * @param {Boolean} game 游戏是否开始
 * @param {Object} players 参与游戏的玩家编号
 * @param {Object} nickname 参与游戏的玩家昵称
 * @param {Object} current 当前可以操作的队伍
 */
var metadata = {}

// 上一步的地图存档
var repent = {}

// 初始地图，不可修改
const map = initialmap.chinesechess
const rows = 9 // 棋盘宽度
const cols = 10 // 棋盘高度 

export class ChineseChess extends plugin {
  constructor() {
    super({
      name: '中国象棋',
      dsc: '中国象棋',
      event: 'message',
      priority: 5000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: /^(\/|#)?(发起|加入)中国象棋[黑红]?$/,
          /** 执行方法 */
          fnc: 'LaunchGame'
        },
        {
          /** 命令正则匹配 */
          reg: /^(\/|#)?结束中国象棋$/,
          /** 执行方法 */
          fnc: 'ov'
        },
        {
          /** 命令正则匹配 */
          reg: /^(\/|#)?移子.*$/,
          /** 执行方法 */
          fnc: 'game'
        },
        // {
        //   /** 命令正则匹配 */
        //   reg: /^(同意)?悔棋$/,
        //   /** 执行方法 */
        //   fnc: 'repenting'
        // },
        {
          /** 单字棋子匹配 */
          reg: `^(\/|#)?(${chinesechessname.join('|')}).*[一二三四五六七八九十壹贰叁肆伍陆柒捌玖拾]$`,
          /** 执行方法 */
          fnc: 'game'
        },
        {
          /** 命令正则匹配 */
          reg: /^(\/|#)?象棋帮助$/,
          /** 执行方法 */
          fnc: 'help'
        },
      ]
    })
  }


  /**
   * 认输
   */
  async ov(e) {
    if (metadata[e.group_id] && metadata[e.group_id].nickname[e.user_id] === e.sender.nickname) {
      // 判断玩家是否在游戏中
      let team = metadata[e.group_id].players[e.user_id]
      console.log("player：" + team)
      // 对方组
      let isAB = '黑红'
      isAB = isAB.replace(new RegExp(team), '')
      e.reply(`恭喜${isAB}队获得胜利`)
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
    let emsg = e.msg.match(/[黑红]/)
    let players = Object.values(metadata[e.group_id].players).length
    // console.log(players);

    // 判断是否在游戏内
    if (metadata[e.group_id].players[e.user_id]) {
      e.reply('你已加入游戏，队伍：' + metadata[e.group_id].players[e.user_id])
      return
    }

    // 判断是玩家几
    if (players == 0) {
      metadata[e.group_id].nickname[e.user_id] = e.sender.nickname
      metadata[e.group_id].players[e.user_id] = '红'
      e.reply(`玩家${e.sender.nickname}发起了中国象棋，其他成员可发送“加入中国象棋”加入游戏`)
    }
    if (players == 1) {
      metadata[e.group_id].nickname[e.user_id] = e.sender.nickname
      metadata[e.group_id].players[e.user_id] = '黑'

      let players_nickname = Object.keys(metadata[e.group_id].players)

      let A = metadata[e.group_id].players[players_nickname[0]]
      let B = metadata[e.group_id].players[players_nickname[1]]

      e.reply([`本群游戏开始\n`,
        `${A}棋:${metadata[e.group_id].nickname[players_nickname[0]]}\n`,
        `${B}棋:${metadata[e.group_id].nickname[players_nickname[1]]}\n`,
        `${A}棋先手\n`,
        `其他成员发送“加入中国象棋黑/红”加入队伍中`
      ])
      metadata[e.group_id].current = '红'
      await newgame(e)
    }
    if (players >= 2 && emsg[0]) {
      metadata[e.group_id].nickname[e.user_id] = e.sender.nickname
      metadata[e.group_id].players[e.user_id] = emsg[0]
      e.reply(`玩家${e.sender.nickname}加入队伍“${emsg[0]}”`)
    }
  }

  /**
   * 游戏指令
   */
  async game(e) {

    if (!metadata[e.group_id] || !metadata[e.group_id].game) return false
    // await beifen(e)
    // 判断玩家是否在游戏中
    let team = metadata[e.group_id].players[e.user_id]
    if (!team) {
      e.reply(`你还没加入游戏，可发送”加入中国象棋黑/白“加入队伍中`)
      return
    }
    // console.log("player：" + team)

    // 移除消息中的前缀
    e.msg = e.msg.replace(/(\/|#)/, '')

    // 对方组
    let isAB = '黑红'
    isAB = isAB.replace(new RegExp(team), '')

    // 判断是否可操作
    if (team != metadata[e.group_id].current) {
      e.reply(`当前不是你的回合`)
      return
    }

    // 0：选择，1：目的地
    let emsg = e.msg.toUpperCase() // 大写字母
    emsg = emsg.match(/([a-zA-Z])(\d+)[\s\S]?([a-zA-Z])(\d+)/)

    let tp1, tp2
    let letter1, num1, letter2, num2

    if (!emsg) {
      let iszh_cn = await as.Chineseinstructions(e, e.msg, metadata)
      if (!iszh_cn) {
        return e.reply('指令不正确')
      } else {
        // console.log(iszh_cn)

        [letter1, num1, letter2, num2] = iszh_cn;
        // 选择
        tp1 = `${letter1}-${num1}`
        // 目的地
        tp2 = `${letter2}-${num2}`
      }
    } else {
      // 选择
      letter1 = emsg[1].charCodeAt(0) - 65 // 转数字 A = 0
      num1 = emsg[2]
      tp1 = `${letter1}-${num1}`

      // 目的地
      letter2 = emsg[3].charCodeAt(0) - 65 // 转数字 A = 0
      num2 = emsg[4]
      tp2 = `${letter2}-${num2}`
    }

    // console.log('+++++',letter1,num1,letter2,num2,'+++++',tp1,tp2,team)

    // 判断移动是否正确
    let iscorrect = await as.Audit(e, [letter1, num1, letter2, num2], tp1, tp2, team, metadata)
    // console.log(iscorrect)
    if (!iscorrect || iscorrect[0] !== true) {
      e.reply(`移动不正确`)
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
      // 传入两个tp点
      await generate(e, tp1, tp2)
      // 胜利提示
      if (iscorrect[1] === true) {
        e.reply(`恭喜${team}队获得胜利`)
        over(e)
      }
    } else if (metadata[e.group_id].archive[tp1] == '0') {
      // 移动空气
      e.reply('你不能操作棋盘中的空气：' + emsg[1] + emsg[2])
    } else {
      // 移动对方棋子
      e.reply('你不能操作对方的棋子')
    }
  }

}


/**
 * 新游戏
 */
async function newgame(e) {
  // 初始化双方棋子
  for (let i in map) {
    for (let j in map[i]) {
      if (i < 4 && map[i][j] !== '空') {
        // 前排
        metadata[e.group_id].archive[i + '-' + j] = '红'
      } else if (i > 5 && map[i][j] !== '空') {
        // 后排
        metadata[e.group_id].archive[i + '-' + j] = '黑'
      } else {
        // 空位
        metadata[e.group_id].archive[i + '-' + j] = '0'
      }
      // 地图
      metadata[e.group_id].chessman[i + '-' + j] = map[i][j]
    }
  }
  // 开始游戏
  metadata[e.group_id].game = true
  generate(e)
}


/**
 * 初始化游戏
 */
async function over(e) {
  metadata[e.group_id] = {} // 创建群数据
  metadata[e.group_id].chessman = {} // 渲染后地图
  metadata[e.group_id].archive = {} // 双方棋子位置标记
  metadata[e.group_id].game = false // 游戏是否正在运行
  metadata[e.group_id].players = {} // 参与游戏的玩家
  metadata[e.group_id].nickname = {} // 参与游戏的玩家昵称
  metadata[e.group_id].current = {} // 当前可操作的玩家
}

/**
 * 发送图片
 */
async function generate(e, tp1, tp2) {

  let data_map = metadata[e.group_id].chessman // 拉取地图数据
  let biaoji = Object.values(metadata[e.group_id].archive) // 获取双方棋子标记
  let ss = {} // 标记框
  let isAB

  if (metadata[e.group_id].current === '红') {
    isAB = '黑box'
  } else {
    isAB = '红box'
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
  ss = Object.values(ss)
  biaoji = Object.values(biaoji)
  data_map = Object.values(data_map)
  // 颠倒棋盘
  if (metadata[e.group_id].current === '红') {
    data_map = data_map.reverse()
    biaoji = biaoji.reverse()
    ss = ss.reverse()

    isrollback = 'on'
  }

  data_map = String(data_map) // 格式化地图
  // console.log(data_map);
  biaoji = String(biaoji)
  // console.log(biaoji);
  ss = String(ss) // 格式化地图

  /**
   * map 地图
   */
  let data = {
    quality: 100,
    tplFile: `./plugins/xianyu-plugin/resources/html/象棋.html`,
    map: data_map,
    archive: biaoji,
    isrollback: isrollback,
    _res: cwd,
    ss: ss
  }
  let img = await puppeteer.screenshot("象棋", {
    ...data,
  })
  e.reply(img)
  isrollback = 'off'
}