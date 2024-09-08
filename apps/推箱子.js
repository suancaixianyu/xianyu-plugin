import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import { command, cwd } from '../config.js'
import { initialmap } from '../config.js'
import { getJson, saveJson, adduser } from '../res/api.js'

// 按钮点击事件排队表
let btns = []

function gameState() {
  let game = {
    level: {},
  }
  return {
    get: (key) => {
      return game[key]
    },
    getEnd: (key) => {
      return game[key][game[key].length - 1]
    },
    set: (key, value) => {
      game[key] = value
    },
    setLevel: (key, value) => {
      game.level[key] = value
    },
    getLevel: (key) => {
      return game.level[key]
    },
  }
}
const game = gameState()

export class xianyu_PushBox extends plugin {
  constructor() {
    super({
      name: '咸鱼_推箱子',
      dsc: '推箱子小游戏',
      event: 'message',
      priority: 5000,
      rule: [...command.sokoban],
    })
  }

  async mapTool(e) {
    adduser(e, this.name)
    e.reply(['关卡制作地址：', 'https://suancaixianyu.cn/MapEditor.html'])
  }

  // 撤回
  async undo(e) {
    adduser(e, this.name)
    let msgid = e.msg.match(/(?<=\<msg ?)([A-Za-z0-9]*-?)+(?=>)/)?.[0]
    e.msg = e.msg.replace(/<msg.*>/, '')
    if (!game.get(e.group_id)) {
      return false
    }
    let map = game.get(e.group_id)
    map.pop()
    game.set(e.group_id, map)
    if (map.length >= 1) {
      if (msgid) {
        let img = await image(e, 'sokoban', { map: map[map.length - 1], _res: cwd }, null, false)
        let replydata = await e.bot.adapter.makeCardMsg(e, [img, segment?.button(getBtn(msgid))])
        console.log(replydata.msgs[0][1])
        await e.bot.sdk.API.message.rest.axios.post('/message/update', {
          msg_id: msgid,
          content: replydata.msgs[0][1],
        })
      } else {
        await image(e, 'sokoban', { map: map[map.length - 1], _res: cwd }, null)
      }
    }
  }

  // 添加关卡
  async addLevel(e) {
    adduser(e, this.name)
    let level = e.msg
      .replace(/(\/|#)?推箱子添加关卡/, '')
      .replace(/\n/g, '')
      .trim()
    if (!level) {
      // 创建上下文
      this.setContext('add')
      /** 回复 */
      await e.reply('请发送关卡数据', true)
      return true
    }
  }

  // 添加关卡内容
  async add(e) {
    // console.log('add', this.e)
    let level = getJson('level')
    let msg = this.e.msg.replace(/\n/g, '').replace(/,\]/g, ']').replace(/,\}/g, '}').trim()
    try {
      let leveljson = JSON.parse(msg)
      // console.log(leveljson)
      // 验证是否为二维数组
      if (!Array.isArray(leveljson))
        return this.e.reply('添加失败，只能添加二维数组，请使用“#推箱子关卡工具”制作关卡', true)
      level.push({
        user: this.e.user_id,
        nickname: this.e.nickname || this.e.sender.nickname || '',
        name: '自定义关卡' + level.length + 1,
        map: leveljson,
      })
      saveJson('level', level)
      this.e.reply('添加成功，起个名字吧', true)
      this.setContext('setname')
    } catch (error) {
      console.log(error)
      this.e.reply('添加失败，只能添加二维数组，请使用“#推箱子关卡工具”制作关卡', true)
    }
    this.finish('add')
  }

  // 设置关卡名称
  async setname(e) {
    let level = getJson('level')
    let last = level.filter((el) => el.user === this.e.user_id)
    if (!last.length) return this.e.reply('没有找到关卡', true)
    last = last[last.length - 1]
    last.name = this.e.msg
    saveJson('level', level)
    this.e.reply('设置成功', true)
    this.finish('setname')
  }

  // 关卡列表
  async list(e) {
    adduser(e, this.name)
    let level1 = initialmap.sokoban
    let level2 = getJson('level')
    let level = [...level1, ...level2]
    let list = level.map((el, index) => `${index + 1}: ${el?.name || '原版关卡'}`)
    e.reply(list.join('\n'))
  }

  // 新游戏
  async newGame(e) {
    adduser(e, this.name)
    let msgid = e.msg.match(/(?<=\<msg ?)([A-Za-z0-9]*-?)+(?=>)/)?.[0]
    e.msg = e.msg.replace(/<msg.*>/, '')

    // 取出关卡号
    let gameLevel = e.msg.match(/\d+/)
    // 取出地图
    let localLevel = getJson('level')
    localLevel = [...initialmap.sokoban.map((el) => el), ...localLevel.map((el) => el.map)]

    // console.log(localLevel, localLevel[gameLevel])
    // 如果有本地关卡，就合并
    if (localLevel.length) {
      gameLevel = gameLevel ? gameLevel[0] - 1 : 0
      let map = localLevel[gameLevel]
      if (!map) {
        return e.reply('没有这个关卡')
      }
      game.set(e.group_id, [map])
      // console.log("e.bot.adapter.id", e.bot.adapter.id);
      if (e.bot?.adapter?.id == 'KOOK') {
        // 续杯
        if (msgid) {
          updateReply(e, map, msgid)
        } else {
          // 开始新游戏
          let replyID = await e.reply(`开始第${gameLevel + 1}关`)
          updateReply(e, map, replyID.message_id[0])
        }
      } else {
        // 开始新游戏
        e.reply(`开始第${gameLevel + 1}关`)
        image(e, 'sokoban', { map: map, _res: cwd }, null)
      }
    } else {
      // 可能获取不到关卡，如果获取不到，就默认第一关
      gameLevel = gameLevel ? gameLevel[0] - 1 : 0
      if (!map) {
        return e.reply('没有这个关卡')
      }
      game.set(e.group_id, [map])
    }
    game.setLevel(e.group_id, gameLevel)
  }

  // 结束游戏
  async ov(e) {
    game.set(e.group_id, null)
    e.reply('游戏结束')
  }

  // 移动
  async move(e) {
    let msgid = e.msg.match(/(?<=\<msg ?)([A-Za-z0-9]*-?)+(?=>)/)?.[0]
    e.msg = e.msg.replace(/<msg.*>/, '')

    if (!game.get(e.group_id)) return false
    adduser(e, this.name)

    // 取出所有的wasd
    let wasd = e.msg.match(/[wasd]/gi)
    if (!wasd) {
      return false
    }
    // 取出地图中，最后一步
    let last = game.getEnd(e.group_id)
    let map = [...last.map((el) => [...el])] // 拷贝地图
    // 找到玩家的位置，玩家为4，map是二维数组
    let player = findPlayer(map)

    // 1是墙，2是终点，3是箱子，4是玩家，5是箱子到终点，6是玩家到终点，0是空地
    // 遍历指令，移动玩家，如果玩家移动到箱子，箱子也移动
    wasd.forEach((w) => {
      let x = player.x
      let y = player.y
      switch (w) {
        case 'w':
          x--
          break
        case 'a':
          y--
          break
        case 's':
          x++
          break
        case 'd':
          y++
          break
      }
      // 如果是墙，返回
      if (map[x] === undefined || map[x][y] === undefined || map[x][y] === 1) {
        return
      }
      // 如果是箱子，箱子的下一个位置是空地或者终点，箱子移动
      if (map[x][y] === 3 || map[x][y] === 5) {
        let nextx = x
        let nexty = y
        switch (w) {
          case 'w':
            nextx--
            break
          case 'a':
            nexty--
            break
          case 's':
            nextx++
            break
          case 'd':
            nexty++
            break
        }
        // 检查箱子移动方向上的下一个位置是否为空或者为目标点
        if (map[nextx][nexty] === 0 || map[nextx][nexty] === 2) {
          map[nextx][nexty] = map[nextx][nexty] === 2 ? 5 : 3
          map[x][y] = map[x][y] === 5 ? 2 : 0
        } else if (map[nextx][nexty] === 1 || map[nextx][nexty] === 3 || !map[nextx][nexty]) {
          // 如果下一个位置是墙或者另一个箱子，则箱子不能移动
          return
        }
      }
      // 玩家移动
      map[player.x][player.y] = map[player.x][player.y] === 6 ? 2 : 0
      map[x][y] = map[x][y] === 2 ? 6 : 4
      player = { x, y }
    })
    if (msgid) {
      updateReply(e, map, msgid)
    } else {
      await image(e, 'sokoban', { map: map, _res: cwd }, null)
    }

    // 保存地图
    let oldarr = game.get(e.group_id)
    let newarr = [...oldarr, map]
    game.set(e.group_id, newarr)

    // 判断是否胜利
    let win = true
    map.forEach((row) => {
      row.forEach((col) => {
        if (col === 2) {
          win = false
        }
      })
    })
    if (win) {
      let initialLevel = initialmap.sokoban
      let localLevel = getJson('level')
      let level = game.getLevel(e.group_id)
      game.setLevel(e.group_id, null)
      if (initialLevel.length + localLevel.length == level + 1) {
        game.setLevel(e.group_id, 0)
        e.reply('恭喜你通关了')
      } else {
        if (msgid) {
          e.msg = '#推箱子' + (level + 2) + `<msg ${msgid}>`
        } else {
          e.msg = '#推箱子' + (level + 2)
        }
        this.newGame(e)
      }
    }
  }
}

/**
 * @param {*} map 地图
 * @returns 玩家的位置
 */
function findPlayer(map) {
  let player = {}
  map.forEach((row, x) => {
    row.forEach((col, y) => {
      if (col === 4 || col === 6) {
        player = { x, y }
      }
    })
  })
  return player
}
/**
 * @param {*} e 消息对象
 * @param {*} flie 文件名称
 * @param {*} obj 传入对象
 * @returns 发送帮助截图
 */
async function image(e, flie, obj, btns, isreply = true) {
  // console.log("btns", btns);
  let data = {
    quality: 100,
    tplFile: `./plugins/xianyu-plugin/public/html/${flie}.html`,
    ...obj,
  }
  let img = await puppeteer.screenshot('xianyu-plugin', {
    ...data,
  })
  // console.log(await Bot[e.bot.uin])

  if (isreply) {
    await e.reply([img, btns && getBtn(e.message_id) ? segment?.button(btns) : ''])
  } else {
    return img
  }
}

function getBtn(msgid) {
  return [
    {
      text: '上',
      clicked_text: '/推箱子移动w' + `<msg ${msgid}>`,
      callback: '/推箱子移动w' + `<msg ${msgid}>`,
      send: true,
    },
    {
      text: '下',
      clicked_text: '/推箱子移动s' + `<msg ${msgid}>`,
      callback: '/推箱子移动s' + `<msg ${msgid}>`,
      send: true,
    },
    {
      text: '左',
      clicked_text: '/推箱子移动a' + `<msg ${msgid}>`,
      callback: '/推箱子移动a' + `<msg ${msgid}>`,
      send: true,
    },
    {
      text: '右',
      clicked_text: '/推箱子移动d' + `<msg ${msgid}>`,
      callback: '/推箱子移动d' + `<msg ${msgid}>`,
      send: true,
    },
    {
      text: '撤回',
      clicked_text: '/推箱子撤回' + `<msg ${msgid}>`,
      callback: '/推箱子撤回' + `<msg ${msgid}>`,
      send: true,
    },
    {
      text: '结束游戏',
      clicked_text: '/结束推箱子',
      callback: '/结束推箱子',
      send: true,
    },
  ]
}

async function updateReply(e, map, msgid) {
  let img = await image(e, 'sokoban', { map: map, _res: cwd }, null, false)
  let level = game.getLevel(e.group_id)
  let replydata = await e.bot.adapter.makeCardMsg(e, [
    '当前关卡：' + (level + 1),
    img,
    segment?.button(getBtn(msgid)),
  ])
  await e.bot.sdk.API.message.rest.axios.post('/message/update', {
    msg_id: msgid,
    content: replydata.msgs[0][1],
  })
}
