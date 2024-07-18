import plugin from '../../../lib/plugins/plugin.js'
import fs from 'node:fs'
import { command, AppName } from '../config.js'

export class xianyu_tongji extends plugin {
  constructor() {
    super({
      name: '咸鱼_统计',
      dsc: '咸鱼_统计',
      event: 'message',
      priority: 1,
      rule: [...command.tongji],
    })
  }

  async tongji(e) {
    let res = await fetch('https://suancaixianyu.cn/xyapi/userlist')
    let obj = await res.json()
    if (obj.code == 200) {
      e.reply(`用户列表(机器人：数量)：${obj.data}`)
    }
  }

  async adduser(e) {
    let isok = false
    let comd = Object.values(command).flat()
    const botname = JSON.parse(fs.readFileSync(`./package.json`, 'utf-8'))
    let nickname = e.sender.nickname || ''
    nickname = nickname ?? e.user_name
    comd.forEach((el) => {
      if (typeof el.reg == 'string') el.reg = new RegExp(el.reg)
      if (`${el.reg}` != '/.*/gi' && el.reg.test(e.msg)) {
        isok = true
        return
      }
    })
    if (!isok) return false

    let myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')

    const raw = JSON.stringify({
      userid: e.user_id,
      nickname: nickname,
      plugin: AppName,
      bot: botname.name,
      channel: e.bot?.adapter?.name ?? 'unknown', // 添加安全检查
    })

    let requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    }

    fetch('https://suancaixianyu.cn/xyapi/adduser', requestOptions)
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

    return false
  }
}
