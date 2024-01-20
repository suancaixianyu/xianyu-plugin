import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import { command, Btns } from '../config.js'

/** 游戏地图 */
let board = {}
/** 游戏状态 */
let games = {}
/** 人机输了的玩家 */
let players = []
/** 玩家标识 */
let player = {}
/** 本轮下棋的玩家 */
let user = {}
/** 赛博嘲讽 */
let taunts = [
  '你的挑战就像是四季更迭，而我的胜利是永恒的春天',
  '你像黎明前的黑暗，再来一次，只会增添我的光芒',
  '你的执着是一首悲壮的诗，但结局依然是悲剧的终章',
  '你的勇气如同夜空中的微弱星光，最终也会在我的胜利之前渐渐消失',
  '哟，又是你，小样',
]
let btn = Btns.五子棋

export class xianyu_gobang extends plugin {
  constructor() {
    super({
      name: '咸鱼_五子棋',
      dsc: '咸鱼_五子棋',
      event: 'message',
      priority: 5000,
      rule: [...command.gobang],
    })
  }

  /** 结束游戏 */
  async ov(e) {
    if (games[e.group_id]) {
      board[e.group_id] = []
      games[e.group_id] = false
      player[e.group_id] = {}
      e.reply(['游戏结束', segment.button([btn.开始, btn.发起])])
    }
  }

  /** 创建游戏 */
  async goo(e) {
    if (games[e.group_id]) {
      e.reply('本群游戏已开始')
      return false
    }
    ov(e)
    if (typeof player[e.group_id] === 'undefined') player[e.group_id] = {}

    // 玩家对战
    if (/发起|加入/.test(e.msg)) {
      player[e.group_id][e.user_id] = Object.keys(player[e.group_id]).length > 0 ? 'X' : 'O'
      if (Object.keys(player[e.group_id]).length == 2) {
        e.reply(`游戏开始，发起人先手`)
        user[e.group_id] = e.user_id
        createBoard(e)
        image(e)
        games[e.group_id] = true
      } else {
        e.reply([`玩家${e.nickname}发起了 五子棋，其他玩家发送"加入五子棋"进行游戏`, segment.button([btn.加入])])
      }
    } else {
      player[e.group_id] = {}
      // 人机对战
      if (players.includes(e.user_id)) {
        e.reply(taunts[Math.floor(Math.random() * taunts.length)])
      }
      games[e.group_id] = true
      createBoard(e)
      makeAIMove(e)
      image(e)
    }
  }

  async game(e) {
    if (!games[e.group_id]) return e.reply(['本群未开启游戏', segment.button([btn.开始], [btn.发起])])
    if (user[e.group_id] && user[e.group_id] == e.user_id) {
      e.reply('不是你的回合')
      return true
    }
    user[e.group_id] = user[e.group_id] ? e.user_id : ''

    // 用户输入
    const userInput = e.msg.match(/\d+/g)
    const userRow = parseInt(userInput[0]) - 1
    const userCol = parseInt(userInput[1]) - 1

    // 用户下棋
    if (board[e.group_id][userRow][userCol] == '-') {
      board[e.group_id][userRow][userCol] = player[e.group_id][e.user_id] ?? 'X'
    } else {
      e.reply(['此处已有棋子', segment.button([btn.落子])])
      return true
    }

    // 检查用户是否获胜
    if (checkWin(userRow, userCol, board[e.group_id][userRow][userCol], e)) {
      e.reply(`${e.nickname}获胜！`)
      players.forEach((e) => players.splice(e.user_id, 1))
      player[e.group_id] = {}
      image(e)
      ov(e)
      return true
    }

    // 玩家对战
    if (player[e.group_id][e.user_id]) {
      image(e)
    } else {
      // 人机对战
      // AI下棋
      makeAIMove(e)

      // 检查AI是否获胜
      if (checkWin(userRow, userCol, 'O', e)) {
        // 连输嘲讽
        if (players.includes(e.user_id)) {
          e.reply(['依旧没有进展🤣👉', segment.button([btn.开始], [btn.发起])])
        } else {
          e.reply(['你输了', segment.button([btn.开始], [btn.发起])])
        }
        players.push(e.user_id)
        ov(e)
        return
      }
      image(e, false)
    }
    return true
  }
}

function ov(e) {
  board[e.group_id] = []
  games[e.group_id] = false
  user[e.group_id] = false
}

/**
 * @param {*} e 消息对象
 * @returns 发送截图
 */
async function image(e, btn = true) {
  let data = {
    quality: 100,
    tplFile: `./plugins/xianyu-plugin/resources/html/五子棋.html`,
    _data: board[e.group_id],
    _res: `${process.cwd().replace(/\\/g, '/')}/plugins/xianyu-plugin/resources`,
  }
  let img = await puppeteer.screenshot('五子棋', {
    ...data,
  })
  e.reply([img, btn ? segment.button([btn.落子], [btn.帮助]) : ''])
}

/**
 * 生成游戏地图
 * @returns 返回游戏地图
 */
function createBoard(e) {
  for (let i = 0; i < 17; i++) {
    board[e.group_id].push(Array(17).fill('-'))
  }
}

/**
 * 判断玩家是否获胜
 * @param {*} row 宽
 * @param {*} col 高
 * @param {*} player 玩家
 * @returns
 */
function checkWin(row, col, player, e) {
  // 检查水平方向
  let count = 0
  for (let i = col - 4; i <= col + 4; i++) {
    if (i >= 0 && i < 17 && board[e.group_id][row][i] == player) {
      count++
      if (count === 5) {
        return true
      }
    } else {
      count = 0
    }
  }

  // 检查垂直方向
  count = 0
  for (let i = row - 4; i <= row + 4; i++) {
    if (i >= 0 && i < 17 && board[e.group_id][i][col] == player) {
      count++
      if (count === 5) {
        return true
      }
    } else {
      count = 0
    }
  }

  // 检查主对角线方向
  count = 0
  for (let i = -4; i <= 4; i++) {
    const r = row + i
    const c = col + i
    if (r >= 0 && r < 17 && c >= 0 && c < 17 && board[e.group_id][r][c] == player) {
      count++
      if (count === 5) {
        return true
      }
    } else {
      count = 0
    }
  }

  // 检查副对角线方向
  count = 0
  for (let i = -4; i <= 4; i++) {
    const r = row + i
    const c = col - i
    if (r >= 0 && r < 17 && c >= 0 && c < 17 && board[e.group_id][r][c] == player) {
      count++
      if (count === 5) {
        return true
      }
    } else {
      count = 0
    }
  }
  return false
}

// AI下棋
function makeAIMove(e) {
  const availableMovesAI = []
  const availableMovesUser = []
  const aiPlayer = 'O'
  const userPlayer = 'X'

  // 遍历AI所有可能的移动
  for (let i = 0; i < 17; i++) {
    for (let j = 0; j < 17; j++) {
      if (board[e.group_id][i][j] == '-') {
        // 计算每个可能移动的分数
        const score = evaluateMove(i, j, aiPlayer, e)
        availableMovesAI.push({ row: i, col: j, score })
      }
    }
  }

  // 遍历玩家所有可能的移动
  for (let i = 0; i < 17; i++) {
    for (let j = 0; j < 17; j++) {
      if (board[e.group_id][i][j] === '-') {
        // 计算每个可能移动的分数
        const score = evaluateMove(i, j, userPlayer, e)
        availableMovesUser.push({ row: i, col: j, score })
      }
    }
  }

  // 根据分数排序可用移动，选择最高分数的移动
  availableMovesAI.sort((a, b) => b.score - a.score)
  availableMovesUser.sort((a, b) => b.score - a.score)

  // 执行AI的移动
  const bestMove =
    availableMovesAI[0].score > availableMovesUser[0].score && availableMovesAI[0].score - 100 > availableMovesUser[0].score
      ? availableMovesAI[0]
      : availableMovesUser[0]
  board[e.group_id][bestMove.row][bestMove.col] = 'O'
}

function evaluateMove(row, col, player, e) {
  let score = 0

  // 水平方向
  let horizontalCount = 0
  for (let i = col - 4; i <= col + 4; i++) {
    if (i >= 0 && i < 17) {
      if (board[e.group_id][row][i] == player) {
        horizontalCount++
      } else if (board[e.group_id][row][i] == '-') {
        score += 1 // 空位有一定的分数
      }
    }
  }
  score += evaluateCount(horizontalCount)

  // 垂直方向
  let verticalCount = 0
  for (let i = row - 4; i <= row + 4; i++) {
    if (i >= 0 && i < 17) {
      if (board[e.group_id][i][col] === player) {
        verticalCount++
      } else if (board[e.group_id][i][col] === '-') {
        score += 1 // 空位有一定的分数
      }
    }
  }
  score += evaluateCount(verticalCount)

  // 主对角线方向
  let mainDiagonalCount = 0
  for (let i = -4; i <= 4; i++) {
    const r = row + i
    const c = col + i
    if (r >= 0 && r < 17 && c >= 0 && c < 17) {
      if (board[e.group_id][r][c] === player) {
        mainDiagonalCount++
      } else if (board[e.group_id][r][c] === '-') {
        score += 1 // 空位有一定的分数
      }
    }
  }
  score += evaluateCount(mainDiagonalCount)

  // 副对角线方向
  let antiDiagonalCount = 0
  for (let i = -4; i <= 4; i++) {
    const r = row + i
    const c = col - i
    if (r >= 0 && r < 17 && c >= 0 && c < 17) {
      if (board[e.group_id][r][c] === player) {
        antiDiagonalCount++
      } else if (board[e.group_id][r][c] === '-') {
        score += 1 // 空位有一定的分数
      }
    }
  }
  score += evaluateCount(antiDiagonalCount)

  return score
}

function evaluateCount(count) {
  // 根据连珠的数量来评估得分
  if (count === 1) {
    return 10 // 一个子的连珠有一定分数
  } else if (count === 2) {
    return 100 // 两个子的连珠有更高分数
  } else if (count === 3) {
    return 1000 // 三个子的连珠更高分数
  } else if (count === 4) {
    return 10000 // 四个子的连珠更高分数
  }
  return 0 // 没有连珠的情况
}
