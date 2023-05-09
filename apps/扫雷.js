import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from "../../../lib/puppeteer/puppeteer.js";

let cwd = `${process.cwd()}/plugins/xianyu-plugin/resources/html/`
cwd = cwd.replace(/\\/g,'/')

/**
  * @param {*} mines 标记雷：{1-1：true}
  * @param {*} isopen 标记翻开：{1-1：true}
  * @param {*} archive 标记值：{1-1：1}
  * @param {*} game 游戏是否正在运行
  * @param {*} z 雷数量
  * @param {*} rows 横
  * @param {*} cols 竖
  * @param {*} mun 左上角显示雷数量
  * @param {*} data_map1 添加数字后的地图数据
  * @param {*} mark 标记样式
  * @param {*} player 游戏发起人
  * @returns 
 */
var gamemap = {}

/* gamemap中存储的数据
  mines = {} // 标记雷：{1-1：true}
  isopen = {} // 标记翻开：{1-1：true}
  archive = {} // 标记值：{1-1：1}
  game = false // 游戏是否正在运行
  z = 10 // 雷数量
  rows = 9 // 横
  cols = 9 // 竖
  mun = [] // 左上角显示雷数量
  data_map1 = [] // 添加数字后的地图数据
  mark = {} // 标记样式
  player = QQ // 游戏发起人
*/

// 不建议修改
const c = 768 // 总宽度760px多一点点
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' // 显示的字母
var ishelp = 'off' // 帮助菜单

// 可以修改的内容
var prefix = '#' // 设置指令前缀，可在此设置默认前缀



export class newcomer extends plugin {
  constructor() {
    super({
      name: '扫雷',
      dsc: '扫雷小游戏',
      event: 'message',
      priority: 5000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: `^(${prefix})?扫雷(帮助|菜单|说明)$`,
          /** 执行方法 */
          fnc: 'help'
        },
        {
          /** 命令正则匹配 */
          reg: `^(${prefix})?扫雷$`,
          /** 执行方法 */
          fnc: 'goo'
        },
        {
          /** 命令正则匹配 */
          reg: `^(${prefix})?扫雷难度(:|：)?.+$`,
          /** 执行方法 */
          fnc: 'goolevel'
        },
        {
          /** 命令正则匹配 */
          reg: `^(${prefix})?结束扫雷$`,
          /** 执行方法 */
          fnc: 'ov'
        },
        {
          /** 命令正则匹配 */
          reg: `^(${prefix})?翻开([a-zA-Z]{1}[0-9]+){1,}$`,
          /** 执行方法 */
          fnc: 'gooplye'
        },
        {
          /** 命令正则匹配 */
          reg: `^(${prefix})?标记([a-zA-Z]{1}[0-9]+){1,}$`,
          /** 执行方法 */
          fnc: 'mark'
        },
        {
          /** 命令正则匹配 */
          reg: `^(${prefix})?取消标记([a-zA-Z]{1}[0-9]+){1,}$`,
          /** 执行方法 */
          fnc: 'removemark'
        },
        {
          /** 命令正则匹配 */
          reg: `^扫雷设置指令前缀.*$`,
          /** 执行方法 */
          fnc: 'SetupPrefix'
        },
        {
          /** 命令正则匹配 */
          reg: `^扫雷设置(地?雷数量?|布局|初始化).*$`,
          /** 执行方法 */
          fnc: 'setup'
        },
      ]
    })
  }

  async help(e) {
    newgame(e)
    gamemap[e.group_id].command = e.msg
    ishelp = 'open'
    generate(e)
  }

  /**
   * 游戏设置
   */
  async setup(e) {
    newgame(e)
    if (gamemap[e.group_id].game) return e.reply(`游戏已开始，不可设置`);
    if((/^扫雷设置地?雷数量?\d+/).test(e.msg)){
      let emsg = e.msg.match(/\d+/)
      if(+emsg[0] > +gamemap[e.group_id].rows * +gamemap[e.group_id].cols) return e.reply('设置超出阈值')
      gamemap[e.group_id].z = emsg[0] ? emsg[0] : 10
      
      e.reply('修改雷数：' + gamemap[e.group_id].z)
    }
    
    if((/^扫雷设置布局 ?\d+\s\d+(\s\d+)?/).test(e.msg)){
      let emsg = e.msg.match(/\d+/g)
      if(+emsg[0] > 1000 || +emsg[1] > 26 || +emsg[2] > +emsg[0] * +emsg[1]) return e.reply('设置超出阈值')
      gamemap[e.group_id].z = emsg[2] ? emsg[2] : 10
      gamemap[e.group_id].rows = emsg[0] ? emsg[0] : 9
      gamemap[e.group_id].cols = emsg[1] ? emsg[1] : 9
      e.reply(`修改布局\n宽：${gamemap[e.group_id].rows}\n高：${gamemap[e.group_id].cols}\n雷：${gamemap[e.group_id].z}`)
    }
    if((/^扫雷设置布局初始化/).test(e.msg)){
      gamemap[e.group_id].z = 10
      gamemap[e.group_id].rows = 9
      gamemap[e.group_id].cols = 9
      e.reply(`初始化布局\n宽：${gamemap[e.group_id].rows}\n高：${gamemap[e.group_id].cols}\n雷：${gamemap[e.group_id].z}`)
    }

  }

  /**
   * 更新html模板
   */
  async loadtemplate(e) {
    loadtemplate(e)
  }

  /**
   * 开始游戏
   */
  async goo(e) {
    newgame(e)
    gamemap[e.group_id].command = e.msg
    goo(e)
  }

  
  /**
   * 设置难度
   */
  async goolevel(e) {
    newgame(e)
    if (gamemap[e.group_id].game) return e.reply(`游戏已开始，发送“${prefix}扫雷”查看当前状态`);
    let emsg = e.msg.replace(new RegExp(`^(${prefix})?扫雷难度(:|：)?`),'')
    switch (emsg) {
      case '简单':
        gamemap[e.group_id].z = 10
        gamemap[e.group_id].rows = 10
        gamemap[e.group_id].rows = 9
        gamemap[e.group_id].cols = 9
        break;
      case '困难':
        gamemap[e.group_id].z = 60
        gamemap[e.group_id].rows = 26
        gamemap[e.group_id].cols = 26
        break;
      case '中等':
        gamemap[e.group_id].z = 40
        gamemap[e.group_id].rows = 16
        gamemap[e.group_id].cols = 16
        break;
      default:
        break;
    }
    gamemap[e.group_id].command = e.msg
    goo(e)
  }

  /**
   * 设置指令前缀
   */
  async SetupPrefix(e) {
    if (!e.isMaster) {
      e.reply("主人不允许你设置哦！")
      return
    }
    newgame(e)
    prefix = e.msg.replace(/^扫雷设置指令前缀 ?/,'')
    e.reply(`已添加前缀"${prefix}"\n不带前缀内容可移除前缀`)
  }

  /**
   * 结束游戏
   */
  async ov(e) {
    newgame(e)
    if(gamemap[e.group_id].player == e.user_id || e.isMaster){
      e.reply('已结束扫雷游戏')
      over(e)
    }else{
      e.reply('你不是游戏发起人，不能主动结束游戏')
    }
  }

  /**
   * 取消标记
   */
  async removemark(e) {
    newgame(e)
    if (!gamemap[e.group_id].game) return false;
    gamemap[e.group_id].command = e.msg

    e.msg.match(/([a-zA-Z])(\d+)/g).forEach(v => {
      // 获取坐标
      // emsg[1]为字母，emsg[2]为数字
      let emsg = v.match(/([a-zA-Z])(\d+)/)
      let letter = emsg[1].toUpperCase() // 大写字母
      letter = letter.charCodeAt(0) - 65 // 转数字 A = 0

      let axis = `${letter}-${emsg[2]}`
      // console.log('获取坐标' + axis);

      // 判断坐标是否存在
      if (gamemap[e.group_id].archive[axis]) {
        // 判断坐标是否显示
        if(!gamemap[e.group_id].isopen[axis]){
          gamemap[e.group_id].mark[axis] = false
        }
      }

    })
    generate(e)
    
  }

  /**
   * 标记
   */
  async mark(e) {
    newgame(e)
    if (!gamemap[e.group_id].game) return false;
    gamemap[e.group_id].command = e.msg

    e.msg.match(/([a-zA-Z])(\d+)/g).forEach(v => {
      // 获取坐标
      // emsg[1]为字母，emsg[2]为数字
      let emsg = v.match(/([a-zA-Z])(\d+)/)
      let letter = emsg[1].toUpperCase() // 大写字母
      letter = letter.charCodeAt(0) - 65 // 转数字 A = 0

      let axis = `${letter}-${emsg[2]}`

      // 判断坐标是否存在
      if (gamemap[e.group_id].archive[axis]) {
        // 判断坐标是否显示
        if(!gamemap[e.group_id].isopen[axis]){
          gamemap[e.group_id].mark[axis] = true
          console.log('标记了：' + axis,emsg[1] + emsg[2],gamemap[e.group_id].mark[axis]);
        }
      }

    })
    generate(e)
    
  }

  /**
   * 游戏指令
   */
  async gooplye(e) {
    newgame(e)
    if(!gamemap[e.group_id].game)return false;
    gamemap[e.group_id].command = e.msg

    /**
     * 玩家点击 A1 获得坐标 01
     * 判断 ‘标记雷’ 点击的是否为雷 -> 结束游戏
     * 判断 ‘标记翻开’ 得到剩余数量与雷数量是否一致，一致则胜利 -> 结束游戏
     * 判断 ‘添加数字后的地图数据’ 是否为‘-’，扩散显示，遇到数字停下
     */

    let gameover = false
    let outcome =''
    let kk = 0


    // 获取坐标
    // emsg[1]为字母，emsg[2]为数字
    e.msg.match(/([a-zA-Z])(\d+)/g).forEach(v => {
      let emsg = v.match(/([a-zA-Z])(\d+)/)
      let letter = emsg[1].toUpperCase() // 大写字母
      letter = letter.charCodeAt(0) - 65 // 转数字 A = 0

      let axis = `${letter}-${emsg[2]}`
      console.log('获取坐标' + axis);

      // 判断坐标是否存在
      if (gamemap[e.group_id].archive[axis]) {
        // 判断雷
        if (gamemap[e.group_id].mines[axis]) {
          gamemap[e.group_id].archive[axis] = 'x'
          gamemap[e.group_id].isopen[axis] = true
          gameover = true
          outcome = 'fail'
          return
        }

        // 扩散显示
        // 当前位置
        let indexs = axis.split('-')

        if(gamemap[e.group_id].archive[axis] === '0'){
          const loop = (indexs) => {
            [
              [+indexs[0] - 1, +indexs[1] - 1],
              [+indexs[0] - 1, +indexs[1]],
              [+indexs[0] - 1, +indexs[1] + 1],
              [+indexs[0], +indexs[1] - 1],
              [+indexs[0], +indexs[1] + 1],
              [+indexs[0] + 1, +indexs[1] - 1],
              [+indexs[0] + 1, +indexs[1]],
              [+indexs[0] + 1, +indexs[1] + 1]
            ].forEach(subIndexs => {
              // console.log('subIndexs:',subIndexs);
              let el = gamemap[e.group_id].archive[subIndexs.join('-')]
              // console.log('el:',el);
              if (el) {
                let thisel = gamemap[e.group_id].mark[subIndexs.join('-')]

                // 值为’-‘开始扩散
                if (el === '0' && gamemap[e.group_id].isopen[subIndexs.join('-')] === false) {
                  if(thisel !== true){ // 没被标记显示
                    gamemap[e.group_id].isopen[subIndexs.join('-')] = true
                    ++kk
                    loop(subIndexs)
                  }
                }else{
                  if(thisel !== true){ // 没被标记显示
                    gamemap[e.group_id].isopen[subIndexs.join('-')] = true
                  }
                }
              }
            })
          }
          loop(indexs)
        }
        // 显示指定坐标块
        gamemap[e.group_id].isopen[axis] = true
      }
    })
    console.log('本次循环' + kk + '次')
    if(outcome == 'fail'){
      e.reply('踩雷，游戏结束')
    }
    // 判断胜利
    if(+gamemap[e.group_id].rows * +gamemap[e.group_id].cols - Object.values(gamemap[e.group_id].isopen).filter(v => v).length == gamemap[e.group_id].z){ 
      e.reply('恭喜您成功了')
      gameover = true
    }
    generate(e)
    if(gameover){
      over(e)
    }
  }

}

// 以下为定义方法

/**
 * 初始化游戏
 */
async function newgame(e) {
  if (!gamemap[e.group_id]) {
    gamemap[e.group_id] = {};
    gamemap[e.group_id].mines = {} // 标记雷：{1-1：true}
    gamemap[e.group_id].isopen = {} // 标记翻开：{1-1：true}
    gamemap[e.group_id].archive = {} // 标记值：{1-1：1}
    gamemap[e.group_id].game = false // 游戏是否正在运行
    gamemap[e.group_id].z = 10 // 雷数量
    gamemap[e.group_id].rows = 9 // 横
    gamemap[e.group_id].cols = 9 // 竖
    gamemap[e.group_id].mun = [] // 左上角显示雷数量
    gamemap[e.group_id].data_map1 = [] // 添加数字后的地图数据
    gamemap[e.group_id].mark = {} // 标记样式
    gamemap[e.group_id].player = e.user_id // 游戏发起人
    gamemap[e.group_id].command = '' // 当前指令
  }
}


async function goo(e) {
  /**
   * 开始游戏
   * 生成随机地图
   * 生成各类坐标
   * 
   * 输出
   * 标记雷：{1-1：true}
   * 标记翻开：{1-1：true}
   * 标记样式：{1-1：true}
   * 标记值：{1-1：1}
   * 
   * 输出无误设置游戏状态
   * game = true
   */

  if(gamemap[e.group_id].game){
    e.reply('扫雷游戏已经开始') 
    generate(e)
    return
  };

  var data_map = [] // 雷数据
  

  // 生成x*y个字符，值为'-'，表示未翻开
  var numbers = Array.from({length: +gamemap[e.group_id].rows * +gamemap[e.group_id].cols}, () => '0')

  // 随机替换z个数字为9，表示雷
  let indexes = [];
  while (indexes.length < gamemap[e.group_id].z) {
    var index = Math.floor(Math.random() * +gamemap[e.group_id].rows * +gamemap[e.group_id].cols);
    if (!indexes.includes(index)) {
      indexes.push(index)
      numbers[index] = 9
    }
  }
  // 遍历numbers，每rows个数换一行
  for (var i = 0; i < numbers.length; i += +gamemap[e.group_id].rows) {
    data_map.push(numbers.slice(i, i + +gamemap[e.group_id].rows))
  }


  /**
   * 添加坐标，标记雷
   * 设置玩家看到的样式，是否翻开
   * 设置标记
   * 设置显示的坐标
   */
  for (let i = 0; i < +gamemap[e.group_id].cols; i++) {
    for (let j = 0; j < +gamemap[e.group_id].rows; j++) {
      // 标记雷
      if(data_map[i][j] == 9){
        gamemap[e.group_id].mines[i + '-' + j] = true
      }else{
        gamemap[e.group_id].mines[i + '-' + j] = false
      }

      // 设置样式是否翻开
      gamemap[e.group_id].isopen[i + '-' + j] = false

      // 设置标记
      gamemap[e.group_id].mark[i + '-' + j] = false

      // 设置显示的坐标
      gamemap[e.group_id].mun.push(ABC[i] + j)
      
    }
  }
  // 实际雷数量
  console.log(Object.values(gamemap[e.group_id].mines).filter(v => v).length)

  for (let i = 0; i < gamemap[e.group_id].cols; i++) {
    for (let j = 0; j < gamemap[e.group_id].rows; j++) {
      const isMines = gamemap[e.group_id].mines[i + '-' + j]
      const number = Object.values({
        0: gamemap[e.group_id].mines[`${i - 1}-${j - 1}`],
        1: gamemap[e.group_id].mines[`${i - 1}-${j}`],
        2: gamemap[e.group_id].mines[`${i - 1}-${j + 1}`],
        3: gamemap[e.group_id].mines[`${i}-${j - 1}`],
        4: gamemap[e.group_id].mines[`${i}-${j + 1}`],
        5: gamemap[e.group_id].mines[`${i + 1}-${j - 1}`],
        6: gamemap[e.group_id].mines[`${i + 1}-${j}`],
        7: gamemap[e.group_id].mines[`${i + 1}-${j + 1}`],
      }).filter(v => v).length
      if(isMines){
        gamemap[e.group_id].archive[i + '-' + j] = 9
        gamemap[e.group_id].data_map1.push(9)
      }else{
        gamemap[e.group_id].archive[i + '-' + j] = number ? number : '0'
        gamemap[e.group_id].data_map1.push(number ? number : '-')
      }
    }
  }
  // 上帝地图
  console.log(gamemap[e.group_id].archive);
  gamemap[e.group_id].mun = String(gamemap[e.group_id].mun)
  generate(e)
  gamemap[e.group_id].game = true
}

/**
 * 重置游戏
 */
async function over(e){
  gamemap[e.group_id].mines = {} // 标记雷：{1-1：true}
  gamemap[e.group_id].isopen = {} // 标记翻开：{1-1：true}
  gamemap[e.group_id].archive = {} // 标记值：{1-1：1}
  gamemap[e.group_id].game = false // 游戏是否正在运行
  gamemap[e.group_id].mun = [] // 左上角显示雷数量
  gamemap[e.group_id].data_map1 = [] // 添加数字后的地图数据
}


/**
 * 发送图片
 */
async function generate(e){
  // console.log('地图' + data_map1)
  // console.log('雷' + mun)
  // console.log('值' , archive)
  // console.log('标记' ,isopen)


  /**
     * 0：翻开空
     * 1-8：雷数量
     * 9：雷
     * -：未翻开
     * +：标记
     * x：踩中的雷
    */


  let data_map = [] // 输出的地图
  let val = Object.values(gamemap[e.group_id].archive)
  // console.log(val)
  let a = +gamemap[e.group_id].z // 输出的地雷数量

  let mark1 = Object.values(gamemap[e.group_id].mark) // 标记的坐标
  // console.log(gamemap[e.group_id].archive);
  // console.log(gamemap[e.group_id].mark);
  // console.log(gamemap[e.group_id].isopen);

  // 遍历翻开
  Object.values(gamemap[e.group_id].isopen).forEach((el,index) => {
    if(el){ // 显示翻开
      data_map.push(val[index])
    }else if(mark1[index]){
      a = a-1
      data_map.push('+')
    }else{
      data_map.push('-')
    }
  })

  // 创建地图数组
  let map = String(data_map)
  // console.log(map);

  let uid = e.user_id

  // 设置右上角头像，区分群和频道
  if(e.message_type === 'guild'){
    uid = Bot.uin
  }

  /**
   * map 地图
   * headurl 右上角头像
   * l 左上角雷数量
   * x 宽度
   * c 画布尺寸
   * muns 地图中显示的数字
   * ishelp 是否为帮助
   * prefix 前缀，帮助中使用
   * command 当前指令
   */
  let data = {
    quality:100,
    tplFile:'./plugins/xianyu-plugin/resources/html/扫雷.html',
    map:map,
    headurl:'http://q1.qlogo.cn/g?b=qq&s=100&nk=' + uid,
    l:a,
    x:gamemap[e.group_id].rows,
    c:c,
    muns:gamemap[e.group_id].mun,
    ishelp:ishelp,
    prefix:prefix,
    command:gamemap[e.group_id].command,
    鸡鸡地址:cwd
  }

  let img = await puppeteer.screenshot("扫雷", {
    ...data,
  })
  e.reply(img)
  ishelp = 'off'
}