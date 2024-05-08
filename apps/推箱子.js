import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import { command, cwd } from '../config.js'
import { initialmap } from '../config.js'
import { getJson, saveJson } from '../res/api.js'

let game = {
  level: {},
}

export class xianyu_PushBox extends plugin {
  constructor() {
    super({
      name: 'PluginName',
      dsc: 'PluginName',
      event: 'message',
      priority: 5000,
      rule: [...command.sokoban],
    })
  }

  // 撤回
  async undo(e) {
    if (!game[e.group_id]) {
      return false
    }
    let map = game[e.group_id]
    if (map.length > 1) {
      map.pop()
      await image(e, 'sokoban', { map: map[map.length - 1], _res: cwd }, null)
    }
  }

  // 添加关卡
  async addLevel(e) {
    let level = e.raw_message
      .replace(/(\/|#)?推箱子添加关卡/, '')
      .replace(/\n/g, '')
      .trim()
    if (!level) {
      // 创建上下文
      this.setContext('add')
      /** 回复 */
      await e.reply('请发送关卡内容', true)
      return true
    }
  }

  // 添加关卡内容
  async add(e) {
    console.log('add', this.e)
    let level = getJson('level')
    let msg = this.e.msg.replace(/\n/g, '').replace(/,\]/g, ']').replace(/,\}/g, '}').trim()
    try {
      let leveljson = JSON.parse(msg)
      console.log(leveljson)
      // 验证是否为二维数组
      if (!Array.isArray(leveljson)) return this.e.reply('添加失败，只能添加二维数组', true)
      level.push({
        user: this.e.user_id,
        nickname: this.e.nickname ?? this.e.sender.nickname,
        name: '自定义关卡' + level.length + 1,
        map: leveljson,
      })
      saveJson('level', level)
      this.e.reply('添加成功，起个名字吧', true)
      this.setContext('setname')
    } catch (error) {
      console.log(error)
      this.e.reply('添加失败，只能添加二维数组', true)
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
    let level1 = initialmap.sokoban
    let level2 = getJson('level')
    let level = [...level1, ...level2]
    let list = level.map((el, index) => `${index + 1}: ${el?.name || '原版关卡'}`)
    e.reply(list.join('\n'))
  }

  // 新游戏
  async newGame(e) {
    // 取出关卡号
    let gameLevel = e.msg.match(/\d+/)
    // 取出地图
    let map = initialmap.sokoban[gameLevel]
    let localLevel = getJson('level')
    localLevel = [...initialmap.sokoban, ...localLevel.map((el) => el.map)]

    console.log(localLevel, localLevel[gameLevel])
    // 如果有本地关卡，就合并
    if (localLevel.length) {
      gameLevel = gameLevel ? gameLevel[0] - 1 : 0
      let map = localLevel[gameLevel]
      if (!map) {
        return e.reply('没有这个关卡')
      }
      game[e.group_id] = [map]
      e.reply(`开始第${gameLevel + 1}关`)
      image(e, 'sokoban', { map: map, _res: cwd }, null)
    } else {
      // 可能获取不到关卡，如果获取不到，就默认第一关
      gameLevel = gameLevel ? gameLevel[0] - 1 : 0

      if (!map) {
        return e.reply('没有这个关卡')
      }
      game[e.group_id] = [map]
      e.reply(`开始第${gameLevel + 1}关`)
      image(e, 'sokoban', { map: map, _res: cwd }, null)
    }
    game.level[e.group_id] = gameLevel
  }
  // 结束游戏
  async ov(e) {
    console.log('ov')
    game[e.group_id] = []
    game.level[e.group_id] = -1
    e.reply('游戏结束')
  }
  // 移动
  async move(e) {
    if (!game[e.group_id]) {
      return false
    }
    // 取出所有的wasd
    let wasd = e.raw_message.match(/[wasd]/gi)
    if (!wasd) {
      return false
    }
    // 取出地图中，最后一步
    let map = game[e.group_id][game[e.group_id].length - 1]
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
    game[e.group_id].push(map)
    await image(e, 'sokoban', { map: map, _res: cwd }, null)
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
      let map = initialmap.sokoban
      let localLevel = getJson('level')

      delete game[e.group_id]
      if (map.length + localLevel.length == game.level[e.group_id] + 1) {
        game.level[e.group_id] = -1
        e.reply('恭喜你通关了')
      } else {
        e.msg = '#推箱子' + (game.level[e.group_id] + 2)
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
async function image(e, flie, obj, btns) {
  let data = {
    quality: 100,
    tplFile: `./plugins/xianyu-plugin/public/html/${flie}.html`,
    ...obj,
  }
  let img = await puppeteer.screenshot('xianyu-plugin', {
    ...data,
  })

  e.reply([img, btns && getBtn() ? segment.button(...btns) : ''])
}
