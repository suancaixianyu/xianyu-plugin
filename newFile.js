import fs from 'node:fs'
import { AppName } from './config/metadata'
import { configPath } from '.'

if (!fs.existsSync(configPath)) {
  fs.mkdirSync(`./data/${AppName}`, { recursive: true })
  fs.writeFileSync(configPath, `# 咸鱼插件配置\n# 设置项\nset:\n  # 是否开启按钮\n  - btn: true`)
}
