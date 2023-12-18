import { chinesechessname } from './metadata.js'

/**
 * 指令集
 */
let command = {
  /** 统计 */
  tongji: [
    {
      reg: /.*/gi,
      fnc: 'adduser',
      doc: '咸鱼统计',
    },
    {
      reg: /^(\/|#)?(xianyu|xy|咸鱼)统计$/i,
      fnc: 'tongji',
      doc: '查看统计',
    },
  ],
  /** 五子棋 */
  gobang: [
    {
      reg: /^(\/|#)?(开始|发起|加入)?五子棋$/,
      fnc: 'goo',
    },
    {
      reg: /^(\/|#)?结束五子棋$/,
      fnc: 'ov',
    },
    {
      reg: /^(\/|#)?落子 ?\d+[\S\s]\d+/,
      fnc: 'game',
    },
  ],
  /** 扫雷 */
  minesweeper: [
    {
      reg: /^(\/|#)?(扫雷|排雷) ?$/,
      fnc: 'goo',
    },
    {
      reg: /^(\/|#)?(扫雷|排雷)难度(:|：)? ?.+$/,
      fnc: 'goolevel',
    },
    {
      reg: /^(\/|#)?结束(扫雷|排雷)$/,
      fnc: 'ov',
    },
    {
      reg: /^(\/|#)?翻开 ?(([a-zA-Z]{1}[0-9]+){1,} ?)+/,
      fnc: 'gooplye',
    },
    {
      reg: /^(\/|#)?标记 ?(([a-zA-Z]{1}[0-9]+){1,} ?)+/,
      fnc: 'mark',
    },
    {
      reg: /^(\/|#)?取消标记 ?(([a-zA-Z]{1}[0-9]+){1,} ?)+/,
      fnc: 'removemark',
    },
    {
      reg: /^(\/|#)?(扫雷|排雷)设置(地?雷数量?|布局|初始化) ?.*$/,
      fnc: 'setup',
    },
  ],
  /** 斗兽棋 */
  animalchess: [
    {
      reg: /^(\/|#)?(发起|加入)(斗兽|动物)棋 ?[红蓝]?$/,
      fnc: 'LaunchGame',
    },
    {
      reg: /^(\/|#)?(移动|瞬移).*$/,
      fnc: 'game',
    },
    {
      reg: /^(\/|#)?结束斗兽棋$/,
      fnc: 'ov',
    },
    {
      reg: /^(\/|#)?图片$/,
      fnc: 'tupian',
      permission: 'master',
    },
  ],
  /** 更新 */
  update: [
    {
      reg: /^(\/|#)?(咸鱼|xianyu|xy)(插件)?(强制)?更新$/,
      fnc: 'update_plugin',
      /** 执行权限 */
      permission: 'master',
    },
  ],
  /** 国际象棋 */
  chess: [
    {
      reg: /^(\/|#)?(发起|加入)国际象棋[黑白]?$/,
      fnc: 'LaunchGame',
    },
    {
      reg: /^(\/|#)?移动.*$/,
      fnc: 'game',
    },
    {
      reg: /^(\/|#)?结束国际象棋$/,
      fnc: 'ov',
    },
  ],
  /** 中国象棋 */
  chinesechess: [
    {
      reg: /^(\/|#)?(发起|加入)中国象棋[黑红]?$/,
      fnc: 'LaunchGame',
    },
    {
      reg: /^(\/|#)?结束中国象棋$/,
      fnc: 'ov',
    },
    {
      reg: /^(\/|#)?移子.*$/,
      fnc: 'game',
    },
    {
      reg: `^(\/|#)?(${chinesechessname.join('|')}).*[一二三四五六七八九十壹贰叁肆伍陆柒捌玖拾]$`,
      fnc: 'game',
    },
  ],
  /** 帮助 */
  help: [
    {
      reg: /^(\/|#)?(咸鱼|xianyu|xy)(插件)?(帮助|help)/i,
      fnc: 'help',
    },
    {
      reg: /^(\/|#)?(排雷|扫雷)(帮助|help)/i,
      fnc: 'saolei',
    },
    {
      reg: /^(\/|#)?(中国)?象棋(帮助|help)/i,
      fnc: 'xiangqi',
    },
    {
      reg: /^(\/|#)?国际象棋(帮助|help)/i,
      fnc: 'guojixiangqi',
    },
    {
      reg: /^(\/|#)?斗兽棋(帮助|help)/i,
      fnc: 'doushouqi',
    },
    {
      reg: /^(\/|#)?(咸鱼)?五子棋(帮助|help)/i,
      fnc: 'wuziqi',
    },
  ],
}

export { command }
