import fs from 'node:fs'
import { AppName } from './config/metadata.js'

logger.info(logger.green('-------  <・)))><<  -------'))
logger.info(logger.blue('咸鱼插件开始加载~~'))

if (!global.segment) {
  global.segment = (await import('oicq')).segment
}

const files = fs.readdirSync(`./plugins/${AppName}/apps`).filter((file) => file.endsWith('.js'))

let ret = []

files.forEach((file) => {
  ret.push(import(`./apps/${file}`))
})

ret = await Promise.allSettled(ret)

let apps = {}
for (let i in files) {
  let name = files[i].replace('.js', '')

  if (ret[i].status != 'fulfilled') {
    logger.error(`载入插件错误：${logger.red(name)}`)
    logger.error(ret[i].reason)
    continue
  }
  let plugin = ret[i].value[Object.keys(ret[i].value)[0]]
  apps[name] = plugin
}
export { apps }
logger.info(logger.blue('咸鱼插件指令加载完成~~'))

let configPath = `./data/${AppName}/config.yaml`
let LevelPath = `./data/${AppName}/level.json`

if (!fs.existsSync(configPath)) {
  fs.mkdirSync(`./data/${AppName}`, { recursive: true })
  fs.writeFileSync(configPath, `# 咸鱼插件配置\n# 设置项\nset:\n  # 是否开启按钮\n  btn: false`)
  logger.info(logger.blue('咸鱼插件配置文件创建完成~~'))
}

if (!fs.existsSync(LevelPath)) {
  fs.writeFileSync(LevelPath, '[]')
  logger.info(logger.blue('推箱子自定义关卡文件创建完成~~'))
}
logger.info(logger.blue('咸鱼插件加载完成~~'))
logger.info(logger.green('-------  >><(((・> -------'))
