import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import panduan from '../lib/AnimalChessDecision.js'
import { command, ABC, cwd, initialmap, Btns } from '../config.js'
const as = new panduan()

var meadow = Math.floor(Math.random() * 5) + 1 // 以随机数开头
/** 初始地图布局 */
let map = initialmap.animalchess

/**
 * 游戏过程中所有数据
 * @param {Object} chessman 渲染后的地图 name棋子 id地形 archive标记
 * @param {Object} players 参与游戏的玩家 team队伍 name名称
 * @param {Object} current 当前回合操作方
 * @param {Boolean} game 游戏是否开始
 */
var metadata = {}

// 上一步的地图存档
var repent = {}

const rows = 7 // 棋盘宽度
const cols = 9 // 棋盘高度

let btn = Btns.斗兽棋
export class AnimalChess extends plugin {
  constructor() {
    super({
      name: '咸鱼_斗兽棋',
      dsc: '咸鱼_斗兽棋',
      event: 'message',
      priority: 5000,
      rule: [...command.animalchess],
    })
  }

  /**
   * 认输
   */
  async ov(e) {
    // 判断玩家是否在游戏中
    if (metadata[e.group_id] && metadata[e.group_id].players[e.user_id]) {
      let team = metadata[e.group_id].players[e.user_id].team
      // console.log('player：' + team)
      // 对方组
      let isAB = '红蓝'
      isAB = isAB.replace(new RegExp(team), '')
      e.reply([`恭喜${isAB}队获得胜利`, segment.button([btn.发起, btn.帮助])])
      over(e)
    } else {
      e.reply(`你还没加入游戏，不能主动结束游戏`)
    }
  }

  /**
   * 发起游戏
   */
  async LaunchGame(e) {
    // 没有本群数据则创建
    if (!metadata[e.group_id]) {
      await over(e)
    }
    let emsg = e.msg.match(/[红蓝]/) // 加入方
    let players = Object.values(metadata[e.group_id].players).length // 玩家数量
    // console.log(players);

    // 判断是否在游戏内
    if (metadata[e.group_id].players[e.user_id]) {
      e.reply('你已加入游戏，队伍：' + metadata[e.group_id].players[e.user_id].team)
      return false
    }

    // 判断是玩家几
    if (players == 0) {
      metadata[e.group_id].players[e.user_id] = {}
      metadata[e.group_id].players[e.user_id].name = e.sender.nickname
      metadata[e.group_id].players[e.user_id].team = '红'
      e.reply([`玩家${e.sender.nickname}发起了斗兽棋，其他成员可发送“加入斗兽棋”加入游戏`, segment.button([btn.加入, btn.帮助])])
    }
    if (players == 1) {
      metadata[e.group_id].players[e.user_id] = {}
      metadata[e.group_id].players[e.user_id].name = e.sender.nickname
      metadata[e.group_id].players[e.user_id].team = '蓝'

      let players_nickname = Object.keys(metadata[e.group_id].players)

      let A = metadata[e.group_id].players[players_nickname[0]]
      let B = metadata[e.group_id].players[players_nickname[1]]

      e.reply([
        `本群游戏开始\n`,
        `${A.team}棋:${A.name}\n`,
        `${B.team}棋:${B.name}\n`,
        `${A.team}棋先手\n`,
        `其他成员发送“加入斗兽棋(红/蓝)”加入队伍中`,
        segment.button([btn.移子, btn.帮助]),
      ])
      metadata[e.group_id].current = '红'
      await newgame(e)
    }
    if (players >= 2 && emsg[0]) {
      metadata[e.group_id].players[e.user_id].name = e.sender.nickname
      metadata[e.group_id].players[e.user_id].team = emsg[0]
      e.reply([`玩家${metadata[e.group_id].players[e.user_id].name}加入队伍“${emsg[0]}”`, segment.button([btn.移子, btn.帮助])])
    }
  }

  /**
   * 游戏指令
   */
  async game(e) {
    if (!metadata[e.group_id] || !metadata[e.group_id].game) return false

    // 判断玩家是否在游戏中
    /** 自己组颜色 */
    let team = metadata[e.group_id].players[e.user_id].team
    if (!team) {
      e.reply([`你还没加入游戏，可发送”加入斗兽棋(红/蓝)”加入队伍中`, segment.button([btn.加入, btn.帮助])])
      return false
    }
    // console.log("player：" + team)

    /** 对方组颜色 */
    let isAB = '红蓝'
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
      e.reply([`移动不正确`, segment.button([btn.移子, btn.帮助])])
      return
    }

    /** 选择的棋子名称 */
    let target = metadata[e.group_id].chessman[tp1].name

    // 移动正确
    if (iscorrect[0]) {
      if (metadata[e.group_id].chessman[tp1].archive != team) {
        e.reply([
          `只能操作自己的棋子，你是${metadata[e.group_id].players[e.user_id].team}队`,
          segment.button([btn.移子, btn.帮助]),
        ])
        return
      }
      // 清空原本位置，添加新的位置
      metadata[e.group_id].chessman[tp1].name = '空'
      metadata[e.group_id].chessman[tp2].name = target
      metadata[e.group_id].chessman[tp1].archive = '空'
      metadata[e.group_id].chessman[tp2].archive = team

      metadata[e.group_id].current = isAB // 设置组

      // 胜利提示
      if (iscorrect[1] === true) {
        e.reply([`恭喜${team}队获得胜利`, await generate(e, tp1, tp2), segment.button([btn.发起, btn.帮助])])
        over(e)
      } else {
        e.reply([await generate(e, tp1, tp2), segment.button([btn.移动, btn.帮助])])
      }
    }
  }
}

/**
 * 新游戏
 */
async function newgame(e) {
  let data_map1 = []
  // 遍历numbers，每rows个数换一行
  for (var i = 0; i < map.length; i += rows) {
    data_map1.push(map.slice(i, i + rows))
  }

  // 初始化双方棋子
  for (let i in data_map1) {
    for (let j in data_map1[i]) {
      // 创建棋子
      metadata[e.group_id].chessman[i + '-' + j] = {}
      // 前排名称不为空
      if (i >= 0 && i <= 2 && data_map1[i][j] != '空') {
        // 是陷阱和洞穴
        if (data_map1[i][j] == '井' || data_map1[i][j] == '穴') {
          metadata[e.group_id].chessman[i + '-' + j].name = '空'
          metadata[e.group_id].chessman[i + '-' + j].id = data_map1[i][j]
          metadata[e.group_id].chessman[i + '-' + j].archive = '空'
          metadata[e.group_id].chessman[i + '-' + j].archive_home = '红'
        } else {
          metadata[e.group_id].chessman[i + '-' + j].name = data_map1[i][j]
          metadata[e.group_id].chessman[i + '-' + j].id = '空'
          metadata[e.group_id].chessman[i + '-' + j].archive = '红'
          metadata[e.group_id].chessman[i + '-' + j].archive_home = '空'
        }
      } else if (i >= 6 && i <= 8 && data_map1[i][j] != '空') {
        // 后排
        // 是陷阱和洞穴
        if (data_map1[i][j] == '井' || data_map1[i][j] == '穴') {
          metadata[e.group_id].chessman[i + '-' + j].name = '空'
          metadata[e.group_id].chessman[i + '-' + j].id = data_map1[i][j]
          metadata[e.group_id].chessman[i + '-' + j].archive = '空'
          metadata[e.group_id].chessman[i + '-' + j].archive_home = '红'
        } else {
          metadata[e.group_id].chessman[i + '-' + j].name = data_map1[i][j]
          metadata[e.group_id].chessman[i + '-' + j].id = '空'
          metadata[e.group_id].chessman[i + '-' + j].archive = '蓝'
          metadata[e.group_id].chessman[i + '-' + j].archive_home = '空'
        }
      } else {
        // 空位
        metadata[e.group_id].chessman[i + '-' + j].name = '空'
        metadata[e.group_id].chessman[i + '-' + j].id = '空'
        metadata[e.group_id].chessman[i + '-' + j].archive = '空'
        metadata[e.group_id].chessman[i + '-' + j].archive_home = '空'
        // 公共
        if (data_map1[i][j] == '河') {
          metadata[e.group_id].chessman[i + '-' + j].id = data_map1[i][j]
        }
      }

      // 设置显示的坐标
      metadata[e.group_id].num.push(ABC[i] + j)
    }
  }
  metadata[e.group_id].num = String(metadata[e.group_id].num)
  metadata[e.group_id].game = true
  e.reply([await generate(e, tp1, tp2), segment.button([btn.移动, btn.帮助])])
}

/**
 * 初始化游戏
 */
async function over(e) {
  metadata[e.group_id] = {}
  metadata[e.group_id].chessman = {} // 棋子
  metadata[e.group_id].players = {} // 参与游戏的玩家
  metadata[e.group_id].current = '' // 当前可操作的玩家
  metadata[e.group_id].game = false // 游戏是否正在运行
  metadata[e.group_id].num = [] // 显示的坐标
}

/**
 * 发送图片
 */
async function generate(e, tp1, tp2) {
  let data_map = metadata[e.group_id].chessman

  let isAB
  if (metadata[e.group_id].current === '红') {
    isAB = 'b_box'
  } else {
    isAB = 'r_box'
  }

  // 设置标记框
  if (tp1 && tp2) {
    for (const key in data_map) {
      if (tp1 == key || tp2 == key) {
        data_map[key]['ss'] = isAB
      } else {
        data_map[key]['ss'] = '0'
      }
    }
  } else {
    for (const key in data_map) {
      data_map[key]['ss'] = '0'
    }
  }

  /**
   * map 地图
   */
  let data = {
    quality: 100,
    tplFile: './plugins/xianyu-plugin/resources/html/斗兽棋.html',
    _res: cwd,
    metadata: JSON.stringify(data_map),
    num: metadata[e.group_id].num,
    草地颜色: meadow,
  }

  // console.log('截图：', data)

  let img = await puppeteer.screenshot('斗兽棋', {
    ...data,
  })
  // meadow颜色
  if (meadow < 3) {
    meadow += 1
  } else {
    meadow = 1
  }
  return img
}
