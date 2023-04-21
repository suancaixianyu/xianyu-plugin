import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from "../../../lib/puppeteer/puppeteer.js";

let cwd = `${process.cwd()}/plugins/xianyu-plugin/resources/html/`
cwd = cwd.replace(/\\/g,'/')

// 不建议修改
var ishelp = 'off' // 帮助菜单

// 可以修改的内容
var prefix = '#' // 设置指令前缀，可在此设置默认前缀

/**
 * 游戏过程中所有数据
 * @param {Object} chessman 渲染后的地图
 * @param {Object} archive 双方棋子位置标记A,B,'0'
 * @param {Boolean} game 游戏是否开始
 * @param {Object} players 参与游戏的玩家编号
 * @param {Object} nickname 参与游戏的玩家昵称
 * @param {Object} current 参与游戏的玩家昵称
 */
var metadata = {}

// 初始地图，不可修改
var map = [
  '车', '马', '象', '王', '后', '象', '马', '车',
  '兵', '兵', '兵', '兵', '兵', '兵', '兵', '兵',
  '空', '空', '空', '空', '空', '空', '空', '空',
  '空', '空', '空', '空', '空', '空', '空', '空',
  '空', '空', '空', '空', '空', '空', '空', '空', 
  '空', '空', '空', '空', '空', '空', '空', '空',
  '兵', '兵', '兵', '兵', '兵', '兵', '兵', '兵', 
  '车', '马', '象', '王', '后', '象', '马', '车'
]
const rows = 8 // 棋盘宽度
const cols = 8 // 棋盘高度


export class newcomer extends plugin {
  constructor() {
    super({
      name: '象棋',
      dsc: '象棋',
      event: 'message',
      priority: 5000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: `^(${prefix})?(发起|加入)国际象棋[黑白]?$`,
          /** 执行方法 */
          fnc: 'LaunchGame'
        },
        {
          /** 命令正则匹配 */
          reg: `^(${prefix})?移动.*$`,
          /** 执行方法 */
          fnc: 'game'
        },
        {
          /** 命令正则匹配 */
          reg: `^(${prefix})?国际象棋帮助$`,
          /** 执行方法 */
          fnc: 'help'
        },
        {
          /** 命令正则匹配 */
          reg: `^(${prefix})?结束国际象棋$`,
          /** 执行方法 */
          fnc: 'ov'
        },
        {
          /** 命令正则匹配 */
          reg: `^国际象棋设置指令前缀.*$`,
          /** 执行方法 */
          fnc: 'SetupPrefix'
        },
      ]
    })
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
    prefix = e.msg.replace(/^国际象棋设置指令前缀 ?/,'')
    e.reply(`已添加前缀"${prefix}"\n不带前缀内容可移除前缀`)
  }
  
  /**
   * 认输
   */
  async ov(e) {
    if(metadata[e.group_id] && metadata[e.group_id].nickname[e.user_id] === e.sender.nickname){
      // 判断玩家是否在游戏中
      let team = metadata[e.group_id].players[e.user_id]
      console.log("player：" + team)
      // 对方组
      let isAB = '黑白'
      isAB = isAB.replace(new RegExp(team),'')
      e.reply(`恭喜${isAB}队获得胜利`)
      over(e)
    }else{
      e.reply(`你还没加入游戏，不能主动结束游戏`)
    }
  }
  /**
   * 帮助
   */
  async help(e) {
    if(!metadata[e.group_id]){
      await over(e)
    }
    ishelp = 'open'
    generate(e)
  }

  /**
   * 发起游戏
   */
  async LaunchGame(e) {
    if(!metadata[e.group_id]){
      await over(e)
    }
    let emsg = e.msg.match(/[黑白]/)
    let players = Object.values(metadata[e.group_id].players).length
    // console.log(players);

    // 判断是否在游戏内
    if(metadata[e.group_id].players[e.user_id]){
      e.reply('你已加入游戏，队伍：' + metadata[e.group_id].players[e.user_id])
      return
    }

    // 判断是玩家几
    if(players == 0){
      metadata[e.group_id].nickname[e.user_id] = e.sender.nickname
      metadata[e.group_id].players[e.user_id] = '黑'
      e.reply(`玩家${e.sender.nickname}发起了国际象棋，其他成员可发送“${prefix}加入国际象棋”加入游戏`)
    }
    if(players == 1){
      metadata[e.group_id].nickname[e.user_id] = e.sender.nickname
      metadata[e.group_id].players[e.user_id] = '白'
      let players_nickname = Object.keys(metadata[e.group_id].players)
      e.reply([`本群游戏开始\n`,
      `黑棋:${metadata[e.group_id].nickname[players_nickname[1]]}\n`,
      `白棋:${metadata[e.group_id].nickname[players_nickname[0]]}\n`,
      `黑棋先手\n`,
      `其他成员发送“${prefix}加入国际象棋黑/白”加入队伍中`
      ])
      metadata[e.group_id].current = '黑'
      newgame(e)
    }
    if(players >= 2 && emsg[0]){
      metadata[e.group_id].nickname[e.user_id] = e.sender.nickname
      metadata[e.group_id].players[e.user_id] = emsg[0]
      e.reply(`玩家${e.sender.nickname}加入队伍“${emsg[0]}”`)
    }
  }

  /**
   * 游戏指令
   */
  async game(e) {

    if(!metadata[e.group_id] || !metadata[e.group_id].game){e.reply(`国际象棋未开始，发送：“${prefix}国际象棋”发起游戏`);return false};

    // 判断玩家是否在游戏中
    let team = metadata[e.group_id].players[e.user_id]
    if(!team){
      e.reply(`你还没加入游戏，可发送”${prefix}加入国际象棋黑/白“加入队伍中`)
      return
    }
    console.log("player：" + team)

    // 对方组
    let isAB = '黑白'
    isAB = isAB.replace(new RegExp(team),'')

    // 判断是否可操作
    if(team != metadata[e.group_id].current){
      e.reply(`当前不是你的回合`)
      return
    }

    // 0：选择，1：目的地
    let emsg = e.msg.toUpperCase() // 大写字母
    emsg = emsg.match(/([a-zA-Z])(\d+)[\s\S]?([a-zA-Z])(\d+)/)

    // 选择
    let letter1 = emsg[1].charCodeAt(0) - 65 // 转数字 A = 0
    let num1 = emsg[2]
    let tp1 = `${letter1}-${num1}`

    // 目的地
    let letter2 = emsg[3].charCodeAt(0) - 65 // 转数字 A = 0
    let num2 = emsg[4]
    let tp2 = `${letter2}-${num2}`
    // console.log(tp1,tp2);

    // 判断移动是否正确
    let iscorrect = await Audit(e,[letter1,num1,letter2,num2],tp1,tp2,team)
    // console.log(iscorrect)
    if(!iscorrect || iscorrect[0] !== true){
      e.reply(`移动不正确`)
      return
    }

    let target = metadata[e.group_id].chessman[letter1 + '-' + num1]

    // 移动自己的棋子
    if(metadata[e.group_id].archive[tp1] == team){
      if (metadata[e.group_id].chessman[tp2] && metadata[e.group_id].chessman[tp2] != team){
        // 清空原本位置，添加新的位置
        metadata[e.group_id].chessman[tp1] = '空'
        metadata[e.group_id].chessman[tp2] = target
        metadata[e.group_id].archive[tp1] = '0'
        metadata[e.group_id].archive[tp2] = team
        metadata[e.group_id].current = isAB // 设置组
      }
      await generate(e)
      // 胜利提示
      if(iscorrect[1] === true){
        e.reply(`恭喜${team}队获得胜利`)
        over(e)
      }
    }else if(metadata[e.group_id].archive[tp1] == '0'){
      // 移动空气
      e.reply('你不能操作棋盘中的空气：' + emsg[1] + emsg[2])
    }else{
      // 移动对方棋子
      e.reply('你不能操作对方的棋子')
    }
  }
}

/**
 * @param {Array} emsg 所有的坐标
 * @param {String} tp1 选择坐标
 * @param {String} tp2 目的地坐标
 * @param {String} team 玩家组
 */
async function Audit(e,emsg,tp1,tp2,team) {
  
  try {
    console.log(emsg,tp1,tp2,team);
    // 目的地是否为自己棋子
    if(metadata[e.group_id].archive[tp2] == team)return false;

    // 获取选择的棋子信息
    let A = metadata[e.group_id].chessman[tp1]

    // 对方组
    let isAB = '黑白'
    isAB = isAB.replace(new RegExp(team),'')

    // 重定义坐标
    let x1 = +emsg[1]
    let x2 = +emsg[3]
    let y1 = +emsg[0]
    let y2 = +emsg[2]

    // 胜利判断
    let isok = false

    // 兵的移动
    if(A == '兵'){
      if(x1 == x2 && metadata[e.group_id].chessman[tp2] === '空'){ // 垂直移动，前方不能有棋子
        if(team == '白'){
          if(y1 - y2 == -1)isok = true // 等于1格
          if(y1 - y2 == -2 && y1 == 1)isok = true // 等于2格
        }
        if(team == '黑'){
          if(y1 - y2 == 1)isok = true // 等于1格
          if(y1 - y2 == 2 && y1 == 6)isok = true // 等于2格
        }
      }
      if(x1 + 1 == x2 || x1 - 1 == x2 && metadata[e.group_id].archive[tp2] && metadata[e.group_id].archive[tp2] == isAB){ // 吃棋
        if(team == '白' && y1 + 1 == y2)isok = true
        if(team == '黑' && y1 - 1 == y2)isok = true
      }
    }

    
    if(A == '马'){
      let tps = [
        `${+y1 + 2}-${+x1 - 1}`,
        `${+y1 + 2}-${+x1 + 1}`,
        `${+y1 + 1}-${+x1 - 2}`,
        `${+y1 + 1}-${+x1 + 2}`,
        `${+y1 - 1}-${+x1 - 2}`,
        `${+y1 - 1}-${+x1 + 2}`,
        `${+y1 - 2}-${+x1 - 1}`,
        `${+y1 - 2}-${+x1 + 1}`,
      ]
      tps.forEach(ev => {
        if(metadata[e.group_id].chessman[ev] && ev == tp2 && metadata[e.group_id].archive[tp2] != team){
          console.log('条件符合',metadata[e.group_id].archive[ev],tp2)
          isok = true;
        }
      });
    }

    if(A == '象'){
      let tp // 坐标
      // 判断目的地方向
      if(y2 < y1 && x2 < x1){
        console.log('左上角')
        tp = 0
      }
      if(y2 < y1 && x2 > x1){
        console.log('右上角')
        tp = 1
      }
      if(y2 > y1 && x2 < x1){
        console.log('左下角')
        tp = 2
      }
      if(y2 > y1 && x2 > x1){
        console.log('右下角')
        tp = 3
      }

      for (let i = 1; i < rows+1; i++) {
        let tps = [
          `${y1 - i}-${x1 - i}`,
          `${y1 - i}-${x1 + i}`,
          `${y1 + i}-${x1 - i}`,
          `${y1 + i}-${x1 + i}`,
        ]
        let ev = tps[tp]
        // console.log(tp)
        // 此块存在
        if(metadata[e.group_id].chessman[ev]){
          // 目的地判断
          if(ev == tp2){ // 是目的地
            // 目的地不为自己
            if(metadata[e.group_id].archive[ev] !== team){
              isok = true
              break
            }else{
              break
            }
          }else{// 不是目的地
            if(metadata[e.group_id].chessman[ev] !== '空'){
              break
            }
          }
        }
      }
    }

    if(A == '车'){
      let tp // 坐标
      // 判断目的地方向
      if(y2 == y1 && x2 < x1){
        console.log('往左')
        tp = 0
      }
      if(y2 == y1 && x2 > x1){
        console.log('往右')
        tp = 1
      }
      if(y2 < y1 && x2 == x1){
        console.log('往上')
        tp = 2
      }
      if(y2 > y1 && x2 == x1){
        console.log('往下')
        tp = 3
      }

      for (let i = 1; i < rows+1; i++) {
        let tps = [
          `${y1}-${x1 - i}`,
          `${y1}-${x1 + i}`,
          `${y1 - i}-${x1}`,
          `${y1 + i}-${x1}`,
        ]
        let ev = tps[tp]
        // console.log(tp)
        // 此块存在
        if(metadata[e.group_id].chessman[ev]){
          // 目的地判断
          if(ev == tp2){ // 是目的地
            // 目的地不为自己
            if(metadata[e.group_id].archive[ev] !== team){
              isok = true
              break
            }else{
              break
            }
          }else{// 不是目的地
            if(metadata[e.group_id].chessman[ev] !== '空'){
              break
            }
          }
        }
      }
    }

    if(A == '后'){
      let tp // 坐标
      // 判断目的地方向
      if(y2 < y1 && x2 < x1){
        console.log('左上角')
        tp = 0
      }
      if(y2 < y1 && x2 > x1){
        console.log('右上角')
        tp = 1
      }
      if(y2 > y1 && x2 < x1){
        console.log('左下角')
        tp = 2
      }
      if(y2 > y1 && x2 > x1){
        console.log('右下角')
        tp = 3
      }
      if(y2 == y1 && x2 < x1){
        console.log('往左')
        tp = 4
      }
      if(y2 == y1 && x2 > x1){
        console.log('往右')
        tp = 5
      }
      if(y2 < y1 && x2 == x1){
        console.log('往上')
        tp = 6
      }
      if(y2 > y1 && x2 == x1){
        console.log('往下')
        tp = 7
      }

      for (let i = 1; i < rows+1; i++) {
        let tps = [
          `${y1 - i}-${x1 - i}`,
          `${y1 - i}-${x1 + i}`,
          `${y1 + i}-${x1 - i}`,
          `${y1 + i}-${x1 + i}`,
          `${y1}-${x1 - i}`,
          `${y1}-${x1 + i}`,
          `${y1 - i}-${x1}`,
          `${y1 + i}-${x1}`,
        ]
        let ev = tps[tp]
        // console.log(tp)
        // 此块存在
        if(metadata[e.group_id].chessman[ev]){
          // 目的地判断
          if(ev == tp2){ // 是目的地
            // 目的地不为自己
            if(metadata[e.group_id].archive[ev] !== team){
              isok = true
              break
            }else{
              break
            }
          }else{// 不是目的地
            if(metadata[e.group_id].chessman[ev] !== '空'){
              break
            }
          }
        }
      }
    }

    if(A == '王'){
      // 定义出周围8个格子
      try {
        [
          `${y1 - 1}-${x1 - 1}`,
          `${y1 - 1}-${x1}`,
          `${y1 - 1}-${x1 + 1}`,
          `${y1}-${x1 - 1}`,
          `${y1}-${x1 + 1}`,
          `${y1 + 1}-${x1 - 1}`,
          `${y1 + 1}-${x1}`,
          `${y1 + 1}-${x1 + 1}`,
        ].forEach(ev => {
          // 遍历格子是否为目的地
          if(ev == tp2 && metadata[e.group_id].chessman[ev] && metadata[e.group_id].archive[ev] !== team){
            throw new Error()
          }
        })
      } catch (error) {
        isok = true
      }

    }

    if (isok && metadata[e.group_id].chessman[tp2] === '王' && metadata[e.group_id].archive[tp2] == isAB){
      return [true,true]
    }else if(isok){
      return [true,false]
    }
  } catch (err) {
    return [false,false]
  }

}

/**
 * 新游戏
 */
async function newgame(e) {

  let data_map1 = []
  // 遍历numbers，每x个数换一行
  for (var i = 0; i < map.length; i += rows) {
    data_map1.push(map.slice(i, i + rows))
  }

  // 初始化双方棋子
  for(let i in data_map1){
    for(let j in data_map1[i]){
      // 前排
      if(i == 0 || i == 1 ){
        metadata[e.group_id].archive[i + '-' + j] = '白'
      }else if(i == 6 || i == 7 ){
        // 后排
        metadata[e.group_id].archive[i + '-' + j] = '黑'
      }else{
        // 空位
        metadata[e.group_id].archive[i + '-' + j] = '0'
      }
      metadata[e.group_id].chessman[i + '-' + j] = data_map1[i][j]
    }
  }
  metadata[e.group_id].game = true
  generate(e)
}

/**
 * 初始化游戏
 */
async function over(e) {
  metadata[e.group_id] = {}
  metadata[e.group_id].chessman = {} 
  metadata[e.group_id].archive = {} // 双方棋子位置标记
  metadata[e.group_id].game = false // 游戏是否正在运行
  metadata[e.group_id].players = {} // 参与游戏的玩家
  metadata[e.group_id].nickname = {} // 参与游戏的玩家
  metadata[e.group_id].current = {} // 当前可操作的玩家
}


/**
 * 发送图片
 */
async function generate(e){

  // 获取双方棋子标记
  let biaoji = String(Object.values(metadata[e.group_id].archive))

  // 获取地图
  let data_map = String(Object.values(metadata[e.group_id].chessman))

  /**
   * map 地图
   */
  let data = {
    quality:100,
    tplFile:'./plugins/xianyu-plugin/resources/html/国际象棋.html',
    map:data_map,
    archive:biaoji,
    ishelp:ishelp,
    prefix:prefix,
    鸡鸡地址:cwd
  }
  let img = await puppeteer.screenshot("国际象棋", {
    ...data,
  })
  e.reply(img)
  ishelp = 'off'
}