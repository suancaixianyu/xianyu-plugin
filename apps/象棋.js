import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import panduan from '../lib/ChineseChessDecide.js'
import { getBtn, deepCopyObj, adduser } from '../res/api.js'
import { cwd, command, initialmap, Btns } from '../config.js'
const as = new panduan()

// 全局变量
let isrollback = 'off' // 颠倒棋盘
// 按钮
let btn = Btns.象棋

// 当前悔棋
let undoGame = {}

/**
 * 游戏过程中所有数据
 * @param {Object} chessman 渲染后的地图
 * @param {Object} archive 双方棋子位置标记A,B,'0'
 * @param {Boolean} game 游戏是否开始
 * @param {Object} players 参与游戏的玩家编号
 * @param {Object} nickname 参与游戏的玩家昵称
 * @param {Object} current 当前可以操作的队伍
 */
let map_bak = {}

// 初始地图，不可修改
const map = initialmap.chinesechess
const rows = 9 // 棋盘宽度
const cols = 10 // 棋盘高度

export class ChineseChess extends plugin {
  constructor() {
    super({
      name: '咸鱼_中国象棋',
      dsc: '咸鱼_中国象棋',
      event: 'message',
      priority: 5000,
      rule: [...command.chinesechess],
    })
  }

  /** 悔棋 */
  async undo(e) {
    adduser(e, this.name)
    let game = deepCopyObj(map_bak[e.group_id]?.[map_bak[e.group_id].length - 1])
    if (game && game.nickname[e.user_id] === e.sender.nickname) {
      // 获取当前行动者
      let team = game.players[e.user_id]
      // 获取对方uid
      let players_uid = Object.keys(game.players).find((item) => game.players[item] !== team)

      if (e.msg.includes('同意')) {
        // 对方没有悔棋
        if (!undoGame[e.group_id]?.[players_uid]) {
          return
        }
        undoGame[e.group_id][e.user_id] = true
        // 当undoGame[e.group_id]都为true
        if (Object.values(undoGame[e.group_id]).length === 2) {
          undoGame[e.group_id] = {}
          // 悔棋
          map_bak[e.group_id].pop()
          e.reply(`同意悔棋，${game.nickname[players_uid]}继续行动`)
          e.reply([await generate(e), getBtn() ? segment.button([btn.移子, btn.帮助]) : ''])
          return
        }
        return
      }

      if (e.msg.includes('拒绝')) {
        // 对方没有悔棋
        if (!undoGame[e.group_id]?.[players_uid]) {
          return
        }
        undoGame[e.group_id] = {}
        e.reply(`拒绝悔棋，${game.nickname[players_uid]}继续行动`)
        return
      }

      // 判断玩家是否正是行动者
      if (game.players[e.user_id] !== game.current) {
        undoGame[e.group_id] = {
          [e.user_id]: true,
        }
        e.reply(
          `${e.sender.nickname || ''}请求悔棋，${game.nickname[players_uid]} 可回复“同意”或“拒绝”`
        )
        return
      }
      e.reply(`当前是你的回合，无法悔棋`)
      return
    }
  }

  /**
   * 认输
   */
  async ov(e) {
    let game = deepCopyObj(map_bak[e.group_id]?.[map_bak[e.group_id].length - 1])
    if (game && game.nickname[e.user_id] === e.sender.nickname) {
      // 判断玩家是否在游戏中
      let team = game.players[e.user_id]
      // console.log('player：' + team)
      // 对方组
      let isAB = '黑红'
      isAB = isAB.replace(new RegExp(team), '')
      e.reply([`恭喜${isAB}队获得胜利`, getBtn() ? segment.button([btn.发起]) : ''])
      over(e)
      return
    }
    e.reply(`你还没加入游戏，不能主动结束游戏`)
  }

  /**
   * 发起游戏
   */
  async LaunchGame(e) {
    adduser(e, this.name)
    let game = deepCopyObj(map_bak[e.group_id]?.[map_bak[e.group_id].length - 1])
    if (Object.keys(game).length === 0) {
      game = getGame()
    }
    // console.log(game)
    let emsg = e.msg.match(/[黑红]/)
    let players = Object.values(game.players).length
    // console.log(players);

    // 判断是否在游戏内
    if (game.players[e.user_id]) {
      e.reply('你已加入游戏，队伍：' + game.players[e.user_id])
      return
    }

    // 判断是玩家几
    if (players == 0) {
      game.nickname[e.user_id] = e.sender.nickname || ''
      game.players[e.user_id] = '红'
      e.reply([
        `玩家${e.sender.nickname || ''}发起了中国象棋，其他成员可发送“加入中国象棋”加入游戏`,
        getBtn() ? segment.button([btn.加入]) : '',
      ])
    }
    if (players == 1) {
      game.nickname[e.user_id] = e.sender.nickname || ''
      game.players[e.user_id] = '黑'

      let players_nickname = Object.keys(game.players)

      let A = game.players[players_nickname[0]]
      let B = game.players[players_nickname[1]]

      e.reply([
        `本群游戏开始\n`,
        `${A}棋:${game.nickname[players_nickname[0]]}\n`,
        `${B}棋:${game.nickname[players_nickname[1]]}\n`,
        `${A}棋先手\n`,
        `其他成员发送“加入中国象棋黑/红”加入队伍中`,
        getBtn() ? segment.button([btn.移子, btn.帮助]) : '',
      ])
      game.current = '红'
      map_bak[e.group_id].push(deepCopyObj(game))
      await newgame(e)
      return
    }
    if (players >= 2 && emsg[0]) {
      game.nickname[e.user_id] = e.sender.nickname || ''
      game.players[e.user_id] = emsg[0]
      e.reply([
        `玩家${e.sender.nickname || ''}加入队伍“${emsg[0]}”`,
        getBtn() ? segment.button([btn.移子, btn.帮助]) : '',
      ])
    }
    map_bak[e.group_id] = [game]
  }

  /**
   * 游戏指令
   */
  async game(e) {
    let game = deepCopyObj(map_bak[e.group_id]?.[map_bak[e.group_id].length - 1])
    // console.log(game)
    if (!game || !game.game) return false
    adduser(e, this.name)
    // await beifen(e)
    // 判断玩家是否在游戏中
    let team = game.players[e.user_id]
    if (!team) {
      e.reply([
        `你还没加入游戏，可发送”加入中国象棋黑/白“加入队伍中`,
        getBtn() ? segment.button([btn.加入, btn.帮助]) : '',
      ])
      return
    }
    // console.log("player：" + team)

    // 移除消息中的前缀
    e.msg = e.msg.replace(/(\/|#)/, '').trim()

    // 对方组
    let isAB = '黑红'
    isAB = isAB.replace(new RegExp(team), '')

    // 判断是否可操作
    if (team != game.current) {
      e.reply(`当前不是你的回合`)
      return
    }

    // 0：选择，1：目的地
    let emsg = e.msg.toUpperCase() // 大写字母
    emsg = emsg.match(/([a-zA-Z])(\d+)[\s\S]?([a-zA-Z])(\d+)/)

    let tp1, tp2
    let letter1, num1, letter2, num2

    if (!emsg) {
      let iszh_cn = await as.Chineseinstructions(e, e.msg, game)
      if (!iszh_cn) {
        return e.reply(['指令不正确', getBtn() ? segment.button([btn.帮助]) : ''])
      } else {
        // console.log(iszh_cn)

        ;[letter1, num1, letter2, num2] = iszh_cn
        // 选择
        tp1 = `${letter1}-${num1}`
        // 目的地
        tp2 = `${letter2}-${num2}`
      }
    } else {
      // 选择
      letter1 = emsg[1].charCodeAt(0) - 65 // 转数字 A = 0
      num1 = Number(emsg[2]) - 1
      tp1 = `${letter1}-${num1}`

      // 目的地
      letter2 = emsg[3].charCodeAt(0) - 65 // 转数字 A = 0
      num2 = Number(emsg[4]) - 1
      tp2 = `${letter2}-${num2}`
    }

    // console.log('+++++',letter1,num1,letter2,num2,'+++++',tp1,tp2,team)

    // 判断移动是否正确
    let iscorrect = await as.Audit(e, [letter1, num1, letter2, num2], tp1, tp2, team, game)
    // console.log(iscorrect)
    if (!iscorrect || iscorrect[0] !== true) {
      e.reply([`移动不正确`, getBtn() ? segment.button([btn.移子, btn.帮助]) : ''])
      return
    }

    let target = game.chessman[letter1 + '-' + num1]

    // 移动自己的棋子
    if (game.archive[tp1] == team) {
      if (game.chessman[tp2] && game.chessman[tp2] != team) {
        // 清空原本位置，添加新的位置
        game.chessman[tp1] = '空'
        game.chessman[tp2] = target
        game.archive[tp1] = '0'
        game.archive[tp2] = team
        game.current = isAB // 设置组
      }
      // 胜利提示
      if (iscorrect[1] === true) {
        map_bak[e.group_id].push(deepCopyObj(game))
        e.reply([
          `恭喜${team}队获得胜利`,
          await generate(e, tp1, tp2),
          getBtn() ? segment.button([btn.发起, btn.帮助]) : '',
        ])
        over(e)
        return true
      }
      map_bak[e.group_id].push(deepCopyObj(game))
      // 传入两个tp点
      e.reply([await generate(e, tp1, tp2), getBtn() ? segment.button([btn.移子, btn.帮助]) : ''])
      undoGame[e.group_id] = {}
    }
  }
}

/**
 * 新游戏
 */
async function newgame(e) {
  let game = deepCopyObj(map_bak[e.group_id][map_bak[e.group_id].length - 1])
  // 初始化双方棋子
  for (let i in map) {
    for (let j in map[i]) {
      if (i < 4 && map[i][j] !== '空') {
        // 前排
        game.archive[i + '-' + j] = '红'
      } else if (i > 5 && map[i][j] !== '空') {
        // 后排
        game.archive[i + '-' + j] = '黑'
      } else {
        // 空位
        game.archive[i + '-' + j] = '0'
      }
      // 地图
      game.chessman[i + '-' + j] = map[i][j]
    }
  }
  // 开始游戏
  game.game = true
  map_bak[e.group_id].push(deepCopyObj(game))
  e.reply([await generate(e), getBtn() ? segment.button([btn.移子, btn.帮助]) : ''])
}

/**
 * 初始化游戏
 */
async function over(e) {
  // 创建群数据
  map_bak[e.group_id] = [
    {
      chessman: {}, // 渲染后地图
      archive: {}, // 双方棋子位置标记
      players: {}, // 参与游戏的玩家
      nickname: {}, // 参与游戏的玩家昵称
      current: '', // 当前可操作的玩家
      game: false, // 游戏是否正在运行
    },
  ]
}

/**
 * 获取游戏基础数据
 */
function getGame() {
  return {
    chessman: {}, // 渲染后地图
    archive: {}, // 双方棋子位置标记
    players: {}, // 参与游戏的玩家
    nickname: {}, // 参与游戏的玩家昵称
    current: '', // 当前可操作的玩家
    game: false, // 游戏是否正在运行
  }
}

/**
 * 发送图片
 */
async function generate(e, tp1, tp2) {
  let game = deepCopyObj(map_bak[e.group_id]?.[map_bak[e.group_id].length - 1])
  let data_map = game.chessman // 拉取地图数据
  let biaoji = Object.values(game.archive) // 获取双方棋子标记
  let ss = {} // 标记框
  let isAB

  if (game.current === '红') {
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
  if (game.current === '红') {
    data_map = data_map.reverse()
    biaoji = biaoji.reverse()
    ss = ss.reverse()

    isrollback = 'on'
  }

  let user_name =
    game.nickname[Object.keys(game.players).find((item) => game.players[item] === game.current)]

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
    tplFile: `./plugins/xianyu-plugin/public/html/象棋.html`,
    map: data_map,
    archive: biaoji,
    isrollback: isrollback,
    _res: cwd,
    ss: ss,
    player: game.current,
    user_name: user_name,
  }
  let img = await puppeteer.screenshot('xianyu-plugin', {
    ...data,
  })
  isrollback = 'off'
  return img
}
