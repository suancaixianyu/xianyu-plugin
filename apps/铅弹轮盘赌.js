import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import { propName } from '../config.js'

/** 游戏数据 */
const game = {}
const btns = {
  查看道具: { text: '查看道具', type: 2, input: '/查看道具' },
  使用道具: { text: '使用道具', type: 2, input: '/使用道具' },
  打对方: { text: '->对手', type: 2, input: '-对方' },
  打自己: { text: '->自己', type: 2, input: '-自己' },
  开始游戏: { text: '开始游戏', type: 2, input: '/开始游戏' },
  人机战: { text: '人机战', type: 2, input: '/开始游戏' },
  发起游戏: { text: '发起游戏', type: 2, input: '/发起游戏' },
  加入游戏: { text: '加入游戏', type: 2, input: '/加入游戏' },
  帮助: { text: '游戏帮助', type: 2, input: '/铅弹游戏帮助' },
  测试: {
    text: '测试',
    type: 3,
    input: '/链接',
    link: 'https://ys.mihoyo.com/cloud/?utm_source=default#/',
  },
  原神: {
    text: '没意思，原神，启动！',
    type: 3,
    input: '/链接',
    link: 'https://ys.mihoyo.com/cloud/?utm_source=default#/',
  },
}

export class StartGame extends plugin {
  constructor() {
    super({
      name: '咸鱼_铅弹轮盘赌',
      dsc: '咸鱼_铅弹轮盘赌',
      event: 'message',
      priority: 4000,
      rule: [
        {
          reg: /^(#|\/)?(发起|加入)游戏$/,
          fnc: 'newgame',
        },
        {
          reg: /^(#|\/)?开始游戏$/,
          fnc: 'start',
        },
        {
          reg: /^(#|\/)?使用(放大镜|酒|烟|手铐|锯子)/,
          fnc: 'operate',
        },
        {
          reg: /^(#|\/)?(-|打|射)(对方|自己)$/,
          fnc: 'attack',
        },
        {
          reg: /^(#|\/)?查看道具$/,
          fnc: 'look',
        },
        {
          reg: /^(#|\/)?(铅弹(游戏)?|游戏|轮盘赌)帮助$/,
          fnc: 'help',
        },
        {
          reg: /^(#|\/)?退出游戏$/,
          fnc: 'gameover',
        },
        {
          reg: /^(#|\/)?打印$/,
          fnc: 'log',
        },
      ],
    })
  }

  async gameover(e) {
    isgame(e)
    /** 当前游戏 */
    let g = game[e.group_id]
    if (g && !g.isGame) {
      sendCard(e, '当前房间没有进行中的游戏', [[btns.发起游戏], [btns.帮助]])
      return
    }
    if (!g.player[e.user_id]) return e.reply('你不在游戏中，无法操作')

    sendCard(e, `${e.sender.nickname}退出游戏，游戏结束`, [[btns.发起游戏], [btns.帮助]])
    delete game[e.group_id]
  }

  async help(e) {
    sendCard(
      e,
      `BUCKSHOT ROULETTE游戏帮助
＿＿＿＿＿＿＿＿＿＿
一共三个回合，击败对方获胜。
道具说明：
放大镜：查看当前子弹
酒：抛出当前子弹
烟：恢复一点血
手铐：限制对方一回合
锯子：当前回合增加一点伤害
＿＿＿＿＿＿＿＿＿＿
行动规则：使用道具不会结束当前行动，打自己时如果没有受到伤害也不会结束当前行动，反之会。打对方则会结束当前行动
＿＿＿＿＿＿＿＿＿＿
道具在第二轮发放，为性能考虑，AI的每一步操作都会有一到两秒的等待时间。机器人发送的消息前后顺序可能不一致，请仔细观察发送的内容
＿＿＿＿＿＿＿＿＿＿
游戏指令：
发起：/发起游戏、/加入游戏
开始：/开始游戏
结束：/结束游戏
查看道具：/查看道具
使用道具：/使用+道具名称
射击：/打对方、/打自己`,
      [[btns.发起游戏]]
    )
  }

  /**
   * 创建游戏
   */
  async newgame(e) {
    isgame(e)
    /** 当前游戏 */
    let g = game[e.group_id]
    if (Object.keys(g.player).length >= 2) return e.reply('当前房间的游戏人数已满')

    // 创建角色
    g.player[e.user_id] = {
      name: e.sender.nickname,
      prop: getProp(10),
      health: 2,
      islock: false,
      isProp: false,
    }

    // this.start(e)

    if (Object.keys(g.player).length == 2) {
      sendCard(e, '你已加入游戏，成员已满，可以开始了', [[btns.开始游戏], [btns.帮助]])
    } else {
      sendCard(e, '你发起了游戏，可直接发送“开始游戏”与人机对战', [[btns.人机战], [btns.加入游戏], [btns.帮助]])
    }
  }

  /**
   * 开始游戏
   */
  async start(e) {
    isgame(e)
    /** 当前游戏 */
    let g = game[e.group_id]
    if (g && g.isGame) return e.reply('当前房间有正在进行的游戏')
    if (!g.player[e.user_id]) return e.reply('你未加入游戏，无法开始游戏')

    // 只有一名玩家，添加人机
    if (Object.keys(g.player).length == 1) {
      g.player['<人机>'] = {
        name: '<人机>',
        prop: [],
        health: 2,
        islock: false,
        isProp: false,
      }
    }

    /** 生成的子弹 */
    let arr = UpperBullet(2)
    let sortarr = sort(arr) // 排序
    let bullet = sortarr.shift() // 取出一枚子弹

    g.bullet = sortarr // 上子弹
    g.current = bullet // 设置第一个子弹
    g.round = 1 // 设置游戏轮数第一轮
    g.isGame = true // 设置游戏状态

    // 设置行动人
    if (g.player['<人机>']) {
      g.action = e.sender.nickname
    } else {
      g.action = Object.keys(g.player)[0]
    }
    let zzz = arr.map((boolValue) => (boolValue ? '真' : '假'))

    // 回复消息
    sendCard(e, `游戏开始！\n当前回合: ${g.round}\n行动者: ${g.action}\n当前子弹为: ${zzz.join(',')}`, [[btns.打对方, btns.打自己], [btns.帮助]])
  }

  async look(e) {
    isgame(e)
    /** 当前游戏 */
    let g = game[e.group_id]
    if (g && !g.isGame) {
      sendCard(e, '当前房间没有进行中的游戏', [[btns.发起游戏], [btns.帮助]])
      return
    }
    if (!g.player[e.user_id]) return e.reply('你不在游戏中，无法操作')
    if (g.action !== e.sender.nickname) return e.reply('当前不是你的回合')

    let opponent = Object.keys(g.player).find((el) => el !== e.user_id)

    let msg = '你的道具：'
    let arrbtn = []

    for (const el of g.player[e.user_id].prop) {
      msg += `${propName[el]}；`
      arrbtn.push({
        text: `使用${propName[el]}`,
        type: 2,
        input: `/使用道具${el}`,
      })
    }
    msg += `\n对方道具：`
    if (g.player[opponent].prop.length) {
      for (const el of g.player[opponent].prop) {
        msg += `${propName[el]}；`
      }
    } else {
      msg += `空`
    }

    sendCard(e, `${msg}\n＿＿＿＿＿＿＿＿＿＿`, [getbtnB(e), [btns.打对方], [btns.打自己]])
  }

  /**
   * 游戏操作-使用道具
   */
  async operate(e) {
    isgame(e)
    /** 当前游戏 */
    let g = game[e.group_id]
    if (g && !g.isGame) {
      sendCard(e, '当前房间没有进行中的游戏', [[btns.发起游戏], [btns.帮助]])
      return
    }
    if (!g.player[e.user_id]) return e.reply('你不在游戏中，无法操作')
    if (g.action !== e.sender.nickname) return e.reply('当前不是你的回合')

    let propid
    let id

    if (/\d+$/.test(e.msg)) propid = e.msg.match(/\d/)
    else propid = e.msg.match(/放大镜|酒|烟|手铐|锯子/)

    if (/\d+$/.test(e.msg)) id = Number(propid[0])
    else id = Object.keys(propName).find((key) => propName[key] === propid[0])

    if (!propid[0]) return e.reply('使用道具格式为：使用+道具名称')
    if (g.player[e.user_id].prop.length == 0) return e.reply('你现在没有道具可以用')
    if (!g.player[e.user_id].prop.find((el) => el == id)) return e.reply('你没有该道具')

    /** 本次是否为人机 */
    let isAI = e.user_id == '<人机>'
    if (typeof id === 'string') id = Number(id)

    // 删除道具
    let delid = g.player[e.user_id].prop.indexOf(id)
    if (delid !== -1) {
      g.player[e.user_id].prop.splice(delid, 1)
    } else {
      e.reply('移除道具失败')
    }

    // 开始使用道具
    /**
     * 1. 查看
     * 2. 抛子弹
     * 3. 回血
     * 4. 锁住对方一回合
     * 5. 加伤害
     */
    switch (id) {
      case 1:
        if (isAI) {
          g.aimsg += `\n使用了${propName[id]}\n枪里的子弹为：${g.current ? '真弹' : '假弹'}`
        } else {
          sendCard(e, `你使用了${propName[id]}\n枪里的子弹为：${g.current ? '真弹' : '假弹'}\n＿＿＿＿＿＿＿＿＿＿\n持有道具：\n${getbtn(e)}\n＿＿＿＿＿＿＿＿＿＿`, [
            getbtnB(e),
            [btns.打对方],
            [btns.打自己],
          ])
        }
        break
      case 2:
        if (isAI) {
          g.aimsg += `\n使用了${propName[id]}\n抛出了一枚：${g.current ? '真弹' : '假弹'}`
        } else {
          sendCard(e, `你使用了${propName[id]}\n抛出了一枚：${g.current ? '真弹' : '假弹'}\n＿＿＿＿＿＿＿＿＿＿\n持有道具：\n${getbtn(e)}\n＿＿＿＿＿＿＿＿＿＿`, [
            getbtnB(e),
            [btns.打对方],
            [btns.打自己],
          ])
        }

        if (g.bullet.length == 0) {
          if (isAI) e.reply(`${g.aimsg}\n子弹已空`)
          else e.reply('子弹已空')
          g.aimsg = 'AI行动：'

          nextGame(e, false)
          return
        }
        g.current = g.bullet.splice(0, 1)[0]
        break
      case 3:
        let h = g.player[e.user_id].health
        if (g.round == 3 && h <= 2) {
          if (isAI) g.aimsg += `\n使用了${propName[id]}，但是没有奏效`
          else {
            sendCard(e, `你使用了${propName[id]}，但是没有奏效\n＿＿＿＿＿＿＿＿＿＿\n持有道具：\n${getbtn(e)}\n＿＿＿＿＿＿＿＿＿＿`, [getbtnB(e), [btns.打对方], [btns.打自己]])
          }
        } else {
          g.player[e.user_id].health = Math.min(h + 1, 6)
          if (isAI) g.aimsg += `\n使用了${propName[id]}\n当前血量为：${g.player[e.user_id].health}`
          else
            sendCard(e, `你使用了${propName[id]}\n当前血量为：${g.player[e.user_id].health}\n＿＿＿＿＿＿＿＿＿＿\n持有道具：\n${getbtn(e)}\n＿＿＿＿＿＿＿＿＿＿`, [
              getbtnB(e),
              [btns.打对方],
              [btns.打自己],
            ])
        }

        break
      case 4:
        let opponent = Object.keys(g.player).find((el) => el !== e.sender.nickname)
        g.player[opponent].islock = true
        if (isAI) g.aimsg += `\n使用了${propName[id]}，你受限一回合`
        else sendCard(e, `你使用了${propName[id]}，对方受限一回合\n＿＿＿＿＿＿＿＿＿＿\n持有道具：\n${getbtn(e)}\n＿＿＿＿＿＿＿＿＿＿`, [getbtnB(e), [btns.打对方], [btns.打自己]])
        break
      case 5:
        g.player[e.user_id].isProp = true
        if (isAI) g.aimsg += `\n使用了${propName[id]}，当前回合伤害加一`
        else sendCard(e, `你使用了${propName[id]}，当前回合伤害加一\n＿＿＿＿＿＿＿＿＿＿\n持有道具：\n${getbtn(e)}\n＿＿＿＿＿＿＿＿＿＿`, [getbtnB(e), [btns.打对方], [btns.打自己]])
        break
    }

    if (e.user_id == '<人机>') {
      await 延迟()
      console.log('ai行动4')
      this.AI(e)
    }
  }

  /**
   * 游戏操作-攻击
   */
  async attack(e) {
    isgame(e)
    /** 当前游戏 */
    let g = game[e.group_id]
    if (g && !g.isGame) {
      sendCard(e, '当前房间没有进行中的游戏', [[btns.发起游戏], [btns.帮助]])
      return
    }
    if (!g.player[e.user_id]) return e.reply('你不在游戏中，无法操作')
    if (g.action !== e.sender.nickname) return e.reply('当前不是你的回合')

    let target = e.msg.replace(/^(#|\/)?-/, '')
    /** 对手 */
    let opponent = Object.keys(g.player).find((el) => el !== e.sender.nickname)

    /** 是否有玩家死亡 */
    let die = false

    /** 是否可以继续行动 */
    let iskeep = false

    /** 本次伤害值 */
    let damage = 1

    /** 本次是否为人机 */
    let isAI = e.sender.nickname == '<人机>'

    // console.log(
    //   '扣血前血量',
    //   g.player[e.user_id].health,
    //   g.player[opponent].health
    // )

    if (target == '自己') {
      // 真弹，扣血
      if (g.current) {
        if (g.player[e.user_id].isProp) damage = 2
        g.player[e.user_id].health -= damage
        if (g.player[e.user_id].health <= 0) {
          if (isAI) {
            g.aimsg += `\nAI朝自己射击，造成了${damage}点伤害，噶掉了自己`
          } else {
            e.reply(`朝自己射击，造成了${damage}点伤害，你噶掉了自己`)
          }
          die = true
        } else {
          if (isAI) g.aimsg += `\n朝自己射击，造成了${damage}点伤害，当前剩余${g.player[e.user_id].health}`
          else sendCard(e, `朝自己射击，造成了${damage}点伤害，当前剩余${g.player[e.user_id].health}`, [[btns.打对方, btns.打自己], [btns.查看道具]])
        }
      } else {
        if (isAI) g.aimsg += '\n朝自己射击，没有受到伤害'
        else e.reply('你朝自己射击，没有受到伤害')
        iskeep = true
      }
    } else {
      // 对手
      // 真弹，扣血
      if (g.current) {
        if (g.player[e.user_id].isProp) damage = 2
        g.player[opponent].health -= damage

        if (g.player[opponent].health <= 0) {
          if (isAI) g.aimsg += `\n朝你射击，对你造成了${damage}点伤害，AI击败了你`
          else e.reply(`朝对方射击，造成了${damage}点伤害，你击败了对方`)
          die = true
        } else {
          if (isAI) g.aimsg += `\n朝你射击，造成了${damage}点伤害，你血量剩余${g.player[opponent].health}`
          else sendCard(e, `朝对方射击，造成了${damage}点伤害，对方血量剩余${g.player[opponent].health}`, [[btns.打对方, btns.打自己], [btns.查看道具]])
        }
      } else {
        if (isAI) g.aimsg += '\n朝你射击，没有受到伤害'
        else sendCard(e, '你朝对方射击，没有受到伤害', [[btns.打对方, btns.打自己], [btns.查看道具]])
      }
    }

    // console.log(
    //   '扣血后血量',
    //   g.player[e.user_id].health,
    //   g.player[opponent].health
    // )

    // 游戏设置
    // 弹夹清空，新一轮
    if (g.bullet.length == 0) {
      if (g.round < 3) {
        console.log('一轮结束')
        if (isAI) e.reply(g.aimsg)
        g.aimsg = 'AI行动：'

        nextGame(e, die)
        return
      }
      if (isAI) sendCard(e, `${g.aimsg}\n游戏结束`, [[btns.发起游戏], [btns.帮助], [btns.原神]])
      else sendCard(e, `游戏结束`, [[btns.发起游戏], [btns.帮助], [btns.原神]])
      delete game[e.group_id]
      return
    } else {
      if (die) {
        console.log('有玩家死亡')
        if (isAI) e.reply(g.aimsg)
        g.aimsg = 'AI行动：'

        nextGame(e, die)
        return
      }
      console.log('没有玩家死亡')
      g.current = g.bullet.splice(0, 1)[0] // 设置当前子弹，并减少一颗
      console.log('当前子弹', g.bullet)

      g.player[e.user_id].isProp = false // 移除加伤效果

      // 下一轮，要判断ai行动，需要提前更新游戏
      // 对方被锁
      if (g.player[opponent].islock) {
        g.player[opponent].islock = false
        if (isAI) g.aimsg += '\n对方被锁，继续行动'
        else sendCard(e, `对方被锁，你继续行动\n＿＿＿＿＿＿＿＿＿＿\n持有道具：\n${getbtn(e)}\n＿＿＿＿＿＿＿＿＿＿`, [getbtnB(e), [btns.打对方], [btns.打自己]])

        if (isAI) {
          await 延迟()
          console.log('ai行动2')
          this.AI(e)
        }
      } else {
        if (!iskeep) {
          g.action = opponent // 设置行动玩家
          e.sender.nickname = opponent
        }
        if (g.action == '<人机>' && !iskeep) {
          await 延迟()
          e.reply(`接下来是${g.action}行动`)
          console.log('ai行动1')

          this.AI(e)
        } else {
          console.log('是否能继续行动', iskeep)

          if (iskeep) {
            if (isAI) {
              g.aimsg += `\n继续行动`

              await 延迟()
              console.log('ai行动3')
              this.AI(e)
            } else {
              sendCard(e, `继续行动\n＿＿＿＿＿＿＿＿＿＿\n持有道具：\n${getbtn(e)}\n＿＿＿＿＿＿＿＿＿＿`, [getbtnB(e), [btns.打对方], [btns.打自己]])
            }
          } else {
            if (isAI) {
              e.user_id = g.action
              sendCard(e, `${g.aimsg}\n接下来是${g.action}行动\n＿＿＿＿＿＿＿＿＿＿\n${g.action}持有道具：\n${getbtn(e)}\n＿＿＿＿＿＿＿＿＿＿`, [getbtnB(e), [btns.打对方], [btns.打自己]])

              g.aimsg = 'AI行动：'
            } else {
              e.user_id = g.action
              sendCard(e, `接下来是${g.action}行动\n＿＿＿＿＿＿＿＿＿＿\n${g.action}持有道具：\n${getbtn(e)}\n＿＿＿＿＿＿＿＿＿＿`, [getbtnB(e), [btns.打对方], [btns.打自己]])
            }
          }
        }
      }
    }
  }

  /**
   * 人机行动
   * 如果有道具，随机选择使用什么道具
   */
  async AI(e) {
    await 延迟()
    isgame(e)

    /** 当前游戏 */
    let g = game[e.group_id]
    e.user_id = '<人机>'
    let user = g.player[e.user_id]

    // 如果手里没有道具，直接射击
    if (user.prop.length == 0) {
      if (g.aiview || g.ai) {
        e.msg = '-对方'
      } else {
        if (Math.floor(Math.random() * (2 - 1 + 1)) + 1 == 1 || (g.bullet <= 1 && g.current)) {
          e.msg = '-对方'
        } else {
          e.msg = '-自己'
        }
      }
      this.attack(e)
    } else {
      // 如果知道是真弹，直接射击
      if (g.aiview || g.ai) {
        e.msg = '-对方'
        this.attack(e)
      } else {
        if (user.health < 6 && user.prop.find((el) => el == 3)) {
          // 如果有回血道具，优先使用
          e.msg = `使用道具3`
        } else {
          // 如果有查看道具，优先使用
          if (user.prop.find((el) => el == 1)) {
            g.ai = true
            e.msg = `使用道具1`
          } else {
            let propid = user.prop[Math.floor(Math.random() * user.prop.length)]
            if (propid == 5) {
              g.ai = true
            }
            e.msg = `使用道具${propid}`
          }
        }
        this.operate(e)
      }
    }
  }

  async log(e) {
    console.log('game', JSON.stringify(game), e)
    sendCard(e, '测试按钮', [[btns.测试, btns.测试, btns.测试, btns.原神]])
    return
  }
}

async function 延迟() {
  return new Promise((resolve) => setTimeout(resolve, 1000))
}

/**
 * 下一轮游戏
 */
function nextGame(e, die = false) {
  /** 当前游戏 */
  let g = game[e.group_id]
  if (die) g.round += 1 // 轮数加一
  /** 生成的子弹 */
  let arr = UpperBullet(g.round == 1 ? 2 : 0)
  /** 玩家 */
  let players = Object.keys(g.player)
  let sortarr = sort(arr) // 排序
  let bullet = sortarr.shift() // 取出一枚子弹

  g.bullet = sortarr // 上子弹
  g.current = bullet // 设置第一个子弹
  g.action = players[0] == '<人机>' ? players[1] : players[0]
  for (const el of players) {
    g.player[el] = {
      health: die ? 2 * g.round : g.player[el].health,
      isProp: false,
      islock: false,
      prop: [...g.player[el].prop, ...getProp(g.round == 2 ? 2 : 4)],
    }
    // if (g.round == 1) g.player[el].prop = []
    if (g.player[el].prop.length > 8) g.player[el].prop = g.player[el].prop.slice(0, 8)
  }

  let zzz = arr.map((boolValue) => (boolValue ? '真' : '假'))
  if (die) {
    sendCard(e, `新一轮开始\n当前回合：${g.round}\n当前子弹为：${zzz.join(',')}\n${g.player[g.action].name}行动：`, [[btns.查看道具], [btns.打对方], [btns.打自己]])
  } else {
    sendCard(e, `子弹重新填满\n当前子弹为：${zzz.join(',')}\n${g.player[g.action].name}行动：`, [[btns.查看道具], [btns.打对方], [btns.打自己]])
  }
}

function sendCard(e, msg, arr) {
  e.reply([msg, segment.button(arr)])
}
/**
 * 获取道具文本
 */
function getbtn(e) {
  let g = game[e.group_id]
  let text = ''

  for (const el of g.player[e.user_id].prop) {
    text += `${propName[el]};`
  }
  return text
}

/**
 * 获取道具按钮
 */
function getbtnB(e) {
  let arrbtn = []
  let g = game[e.group_id]

  let uniqueArray = [...new Set(g.player[e.user_id].prop)]

  for (const el of uniqueArray) {
    arrbtn.push({
      text: `使用${propName[el]}`,
      clicked_text: `/使用道具${el}`,
      callback: `/使用道具${el}`,
      send: true,
    })
  }
  return arrbtn
}

/**
 * 初始化游戏
 */
function isgame(e) {
  adduser(e)
  if (!game[e.group_id]) {
    game[e.group_id] = {
      isGame: false,
      player: {},
      bullet: [],
      current: false,
      round: 1,
      action: '',
      aiview: false,
      aimsg: 'AI行动：',
      ai: false,
    }
  }
}

/**
 * 随机生成子弹
 */
function UpperBullet(num) {
  var arr = []
  var hasTrue = false
  var hasFalse = false
  if (num) var count = num
  else var count = Math.floor(Math.random() * 7) + 2 // 生成2到8之间的随机整数

  for (var i = 0; i < count; i++) {
    var randomBool = Math.random() < 0.5 // 以50%的概率生成true或false
    arr.push(randomBool)

    if (randomBool) {
      hasTrue = true
    } else {
      hasFalse = true
    }
  }

  // 如果结果中不存在true或者不存在false，则随机替换一个元素
  if (!hasTrue || !hasFalse) {
    var indexToReplace = Math.floor(Math.random() * count)
    arr[indexToReplace] = !arr[indexToReplace] // 反转原来的值
  }

  return arr
}

/**
 * 子弹排序
 */
function sort(arr) {
  var newArr = []
  var randomIndex = Math.floor(Math.random() * arr.length) // 随机选择一个元素的索引

  // 将随机选择的元素之后的部分移到新数组的开头
  for (var i = randomIndex; i < arr.length; i++) {
    newArr.push(arr[i])
  }

  // 将剩下的部分保持原顺序添加到新数组的末尾
  for (var i = 0; i < randomIndex; i++) {
    newArr.push(arr[i])
  }

  return newArr
}

/**
 * 获取道具
 * 1. 查看
 * 2. 抛子弹
 * 3. 回血
 * 4. 锁住对方一回合
 * 5. 加伤害
 */
function getProp(count, arr = [1, 2, 3, 4, 5]) {
  const result = []
  const tempArray = arr.slice() // 复制原数组，避免修改原数组

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * tempArray.length)
    result.push(tempArray[randomIndex])
  }

  return result
}

async function adduser(e) {
  const botname = JSON.parse(fs.readFileSync(`./package.json`, 'utf-8'))
  const nickname = e.sender.nickname

  try {
    const raw = JSON.stringify({
      userid: e.user_id,
      nickname: nickname,
      plugin: 'Buckshot-Roulette',
      bot: botname.name,
      channel: e.bot.adapter.name,
    })

    let requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    }

    fetch('https://www.schub.wiki/xyapi/adduser', requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        // console.log('请求成功')
        return response.json()
      })
      .catch(() => {
        return false
      })
  } catch (error) {}

  return false
}
