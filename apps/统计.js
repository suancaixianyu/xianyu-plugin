import plugin from "../../../lib/plugins/plugin.js"
import puppeteer from "../../../lib/puppeteer/puppeteer.js"
import { command } from '../config/global/command.js'
import { cwd } from '../config/global/metadata.js'
import fs from "fs"

const File = `${process.cwd()}/package.json`
var id = {}

export default class xianyu_tonji extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: "咸鱼插件_用户统计",
      /** 功能描述 */
      dsc: "咸鱼插件_用户统计",
      /** https://oicqjs.github.io/oicq/#events */
      event: "message",
      /** 优先级，数字越小等级越高 */
      priority: 1000,
      rule: [
        ...command.tonji
      ],
    })
  }

  async jsrun(e) {
    try {
      const content = e.message[0].text.split("//")[1]
      if (content === undefined) return

      let res = await eval(content)
      const dataType = (res && res.data) || res
      if (typeof dataType === "string") return e.reply(dataType)
      if (dataType === undefined) return e.reply("程序无返回值")
      await e.reply(JSON.stringify(dataType, null, 4))
    } catch (error) {
      await e.reply("错误：\n" + error.message)
      console.log(error)
    }
  }

  /**
   * 提交统计
   */
  async tonji(e) {
    let pluginname = await matchCommand(e.msg)
    if (pluginname) {
      let s = await token()
      tj(e, s, pluginname)
      return false
    }
  }

  /**
   * 查看统计
   */
  async xianyu_tonji(e) {
    let s = await token()
    let pluginname = await matchCommand(e.msg)
    tj(e, s, pluginname)

    if (e.isMaster) {
      let obj = await fetch("http:suancaixianyu.cn/api/tonji.php?token=" + s)
      obj = await obj.json()

      let result = []
      let frequency = {}
      let usernumber = {}

      if (obj.code == 200) {

        // 遍历bot
        for (let key in obj.data) {
          result.push('---' + key + '---\n')
          let users = obj.data[key].uin
          usernumber[key] = []

          // 遍历用户id
          for (let user in users) {
            result.push(`${users[user].nickname} (${users[user].uin})\n`)
            usernumber[key].push(users[user].nickname)
          }

          // uin用完了可以删掉了
          delete obj.data[key].uin
        }

        // 添加插件
        for (let key in obj.data) {
          let obj2 = obj.data[key];
          for (let subKey in obj2) {
            if (frequency[subKey] == undefined) {
              frequency[subKey] = obj2[subKey];
            } else {
              frequency[subKey] += obj2[subKey];
            }
          }
        }

        let num = result.length - Object.keys(obj.data).length
        result.push("总用户数量：" + num)

        if ((/.*id$/).test(e.msg)) {
          // 显示id需要主人权限
          if (e.isMaster) {
            e.reply(result)
          }
        } else {
          if (obj.message == '获取失败') {
            e.reply(result)
          } else {
            // 将用户转为数字 
            for (let key in usernumber) {
              usernumber[key] = usernumber[key].length
            }
            // 发送图片
            let data = {
              quality: 100,
              tplFile: `./plugins/xianyu-plugin/resources/html/统计.html`,
              usernumber: JSON.stringify(usernumber),
              frequency: JSON.stringify(frequency),
              _res: cwd
            }
            console.log(data)
            let img = await puppeteer.screenshot("统计", {
              ...data,
            })
            e.reply(img)
          }
        }
      }
    }
    return false
  }
}

/**
 * 
 * @param {*} msg 消息内容
 * @returns 获取指令对应的js
 */
async function matchCommand(msg) {
  if (msg) {
    let keys = Object.keys(command)
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i]
      let arr = command[key]
      for (let j = 0; j < arr.length; j++) {
        let reg = new RegExp(arr[j].reg)
        if (msg.match(reg) && arr[j].fnc != 'tonji') {
          return key
        }
      }
    }
  }
  return null
}

/**
 * @returns 生成密钥
 */
async function token() {
  // token
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const product = month * day * hour * minute
  const hex = product.toString(16)

  const random = 3
  let mul = BigInt(`0x${hex}`);
  for (let i = 0; i < random; i++) {
    mul *= BigInt(`0x${hex}`)
  }
  let num = mul.toString(16)
  while (num[num.length - 1] === '0') {
    num = num.slice(0, num.length - 1)
  }
  return num
}

/**
 * 提交统计
 */
async function tj(e, token, pluginname = '') {
  let uin = e.self_id // 机器人账号
  let name = Bot.nickname || Bot[uin].nickname // 机器人昵称

  let json = fs.readFileSync(File, 'utf8') //打开文件
  let data = JSON.parse(json)
  let botname = data.name // 机器人版本


  let obj = await fetch(
    `http:suancaixianyu.cn/api/xyjs.php?uin=${uin}&nickname=${name}&bot=${botname}&token=${token}&plugin=${pluginname}`
  ).catch(err => console.error('咸鱼服务器连接错误', err))
  obj = await obj.json()
  if (obj.code == 200) {
    if (!id[uin]) {
      console.log('感谢您使用本插件', name, uin, token)
      id[uin] = true
    }
  }
}
