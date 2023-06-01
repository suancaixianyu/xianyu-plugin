import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs'

const File = `${process.cwd()}/package.json`
var A = false


export class xianyu_tonji extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '咸鱼插件_用户统计',
      /** 功能描述 */
      dsc: '咸鱼插件_用户统计',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#?(咸鱼|xianyu|xy)(插件)?(用户)?统计$',
          /** 执行方法 */
          fnc: 'xianyu_tonji',

        },
        {
          /** 命令正则匹配 */
          reg: '^.*',
          /** 执行方法 */
          fnc: 'tonji',
          log: false,
        },
      ],
    });
  }

  async tonji(e) {
    tj()
    return false
  }

  async xianyu_tonji(e) {
    tj()
    let obj = await fetch('http:suancaixianyu.cn/api/tonji.php')
    obj = await obj.json()

    if (obj.code == 200) {
      let result = []

      for (let key in obj.data) {
        result.push(key + "：\n")
        let users = obj.data[key]
        for (let user in users) {
          result.push(`${users[user].nickname} (${users[user].uin})\n`)
        }
      }
      console.log(result)
      let num = result.length - Object.keys(obj.data).length
      result.push('总用户数量：' + num)
      e.reply(result)
    }
    return false
  }
}

async function tj() {
  if (A || Bot[Bot.uin[0]].nickname == '标准输入') return false
  let json = fs.readFileSync(File, 'utf8'); //打开文件
  let data = JSON.parse(json)
  let botname = data.name
  console.log(Bot[Bot.uin[0]].nickname, Bot.uin)
  let obj = await fetch(`http:suancaixianyu.cn/api/xyjs.php?uin=${Bot.uin}&nickname=${Bot[Bot.uin[0]].nickname}&bot=${botname}`)
    .catch((err) => logger.error('咸鱼服务器连接错误', err))
  obj = await obj.json()
  if (obj.code == 200) {
    logger.info('咸鱼服务器连接正常')
  }
  A = true
}
