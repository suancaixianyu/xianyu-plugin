import plugin from '../../../lib/plugins/plugin.js'
import { command } from '../config/command'
import fs from 'fs'
import axios from 'axios'
import plugin from '../../../lib/plugins/plugin.js'
import { AppName, DirPath } from '../config/global/metadata.js'
import { command } from '../config/global/command.js'

export class xianyuhelp extends plugin {
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
    axios
      .get('http://api.suancaixianyu.cn/userlist')
      .then((response) => {
        const obj = response.data
        if (obj.code == 200) {
          const list = {}
          obj.data.forEach((el) => {
            list[el.bot] = list[el.bot] ? list[el.bot] + 1 : 1
          })
          const botsname = Object.keys(list)
          let a = ''
          botsname.forEach((el) => {
            a += `\n${el}：${list[el]}人`
          })
          e.reply(`用户列表(机器人：数量)：${a}`)
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }

  async adduser(e) {
    let isok = false
    const command = JSON.parse(fs.readFileSync(`${DirPath}/${AppName}.json`, 'utf-8'))
    const botname = JSON.parse(fs.readFileSync(`./package.json`, 'utf-8'))

    command.forEach((el) => {
      if (el.doc != '咸鱼统计' && new RegExp(el.reg.replace(/^\//, '').replace(/\/[a-z]?$/, '')).test(e.msg)) {
        isok = true
        return
      }
    })
    if (!isok) return false

    const data = JSON.stringify({
      userid: e.user_id,
      nickname: e.nickname,
      plugin: AppName,
      bot: botname.name,
    })

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'http://api.suancaixianyu.cn/adduser',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    }

    axios.request(config).catch((error) => {
      console.log(error)
    })
    return false
  }
}
