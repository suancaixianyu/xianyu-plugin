import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import { command, cwd } from '../config.js'
import { initialmap } from '../config.js'

let game = {}

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

  async newGame(e) {
    // 取出关卡
    let gameLevel = e.raw_message.match(/\d+/)
    // 可能获取不到关卡，如果获取不到，就默认第一关
    gameLevel = gameLevel ? gameLevel[0] : 1
    // 取出地图
    let map = initialmap.sokoban[gameLevel]
    game[e.group_id] = [map]
    image(e, 'sokoban', { map: map, _res: cwd }, null)
  }
  async ov(e) {
    console.log('ov')
    game[e.group_id] = []
    e.reply('游戏结束')
  }

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
      if (map[x][y] === 1) {
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
        } else if (map[nextx][nexty] === 1 || map[nextx][nexty] === 3) {
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
    image(e, 'sokoban', { map: map, _res: cwd }, null)
  }
}

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
