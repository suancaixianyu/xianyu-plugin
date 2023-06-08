const rows = 7 // 棋盘宽度
const cols = 9 // 棋盘高度

/** 关系表 */
const size = {
  "象": ["象", "狮", "虎", "豹", "狼", "狗", "猫"],
  "狮": ["狮", "虎", "豹", "狼", "狗", "猫", "鼠"],
  "虎": ["虎", "豹", "狼", "狗", "猫", "鼠"],
  "豹": ["豹", "狼", "狗", "猫", "鼠"],
  "狼": ["狼", "狗", "猫", "鼠"],
  "狗": ["狗", "猫", "鼠"],
  "猫": ["猫", "鼠"],
  "鼠": ["鼠", "象"],
  "空": [null]
}

/** 可以跳过小河的棋子 */
const special = ['虎', '狮', '豹']

export default class panduan {
  /**
   * @param {Object} e 机器人参数
   * @param {Array} emsg 所有的坐标
   * @param {String} tp1 选择坐标
   * @param {String} tp2 目的地坐标
   * @param {String} team 当前组颜色
   * @param {Object} metadata 游戏全部内容
   * @returns 判断棋子移动是否正确和是否胜利，返回数组[true,true]
   */
  async Audit(e, emsg, tp1, tp2, team, metadata) {
    try {
      // 获取选择的棋子信息
      /** 选择的棋子名称 */
      let name1 = metadata[e.group_id].chessman[tp1].name
      /** 目的地棋子名称 */
      let name2 = metadata[e.group_id].chessman[tp2].name
      /** 选择的地地形 */
      let id1 = metadata[e.group_id].chessman[tp1].id
      /** 目的地地形 */
      let id2 = metadata[e.group_id].chessman[tp2].id
      /** 选择的棋子颜色 */
      let archive1 = metadata[e.group_id].chessman[tp1].archive
      /** 目的地棋子颜色 */
      let archive2 = metadata[e.group_id].chessman[tp2].archive

      // 目的地是否为自己棋子
      if (archive2 == team) return [false, false]

      // console.log(emsg, tp1, tp2, team, name1, name2)
      // console.log(A)

      /** 对方组 */
      let isAB = '红蓝'
      isAB = isAB.replace(new RegExp(team), '')

      // 重定义坐标
      let x1 = parseInt(emsg[1]) || 0
      let x2 = parseInt(emsg[3]) || 0
      let y1 = parseInt(emsg[0]) || 0
      let y2 = parseInt(emsg[2]) || 0
      // console.log('坐标值:', x1, x2, y1, y2);

      // 胜利判断
      let isok = false

      // 棋子判断部分
      if (emsg) {
        // 上下左右
        let tps = [
          `${y1 + 1}-${x1}`, // 往下
          `${y1 - 1}-${x1}`, // 往上
          `${y1}-${x1 - 1}`, // 往左
          `${y1}-${x1 + 1}`, // 往右
        ]
        console.log('tp', tp1, tp2)

        // 普通棋子判定
        try {
          tps.forEach((ev, index) => {
            console.log(ev)
            // 棋子存在，坐标匹配，目的地不为自己棋子
            if (metadata[e.group_id].chessman[ev] && ev == tp2 && archive2 != team) {

              // 目的地为空，不为河 或 目的地为空，陷阱，洞穴
              if (name2 == '空' && id2 == '空' || name2 == '空' && ['穴', '井'].includes(id2)) {
                isok = true
                console.log('条件符合')
                throw new Error()
              }

              // 老鼠可以进河 可以直接吃掉河里的老鼠
              if (name1 == '鼠' && id2 == '河') {
                isok = true
                console.log('条件符合')
                throw new Error()
              }
            }
          })
        } catch (error) { }

        // 可以跳过小河的棋子
        if (special.includes(name1)) {

          let tp // 坐标
          // 判断目的地方向
          if (y2 == y1 && x2 < x1) {
            console.log('往左')
            tp = 0
          }
          if (y2 == y1 && x2 > x1) {
            console.log('往右')
            tp = 1
          }
          if (y2 < y1 && x2 == x1) {
            console.log('往上')
            tp = 2
          }
          if (y2 > y1 && x2 == x1) {
            console.log('往下')
            tp = 3
          }

          for (let i = 1; i < cols + 1; i++) {
            // console.log('开始-------')
            let tps1 = [
              `${y1}-${x1 - i}`,
              `${y1}-${x1 + i}`,
              `${y1 - i}-${x1}`,
              `${y1 + i}-${x1}`,
            ]
            let el = tps1[tp]

            if (metadata[e.group_id].chessman[el].id !== '河') {
              // 是否到达目的地
              if (el == tp2) {
                // console.log('成功抵达')
                break
              }
              // console.log('不是河')
              // console.log('结束-------')
            }
          }

        }

        // 吃子
        if (size[name1].includes(name2)) {
          // 老鼠不能从水里出来直接吃象
          if (id1 == '河') {
            console.log('老鼠不能从水里出来直接吃象')
          } else {
            isok = true
            console.log('条件符合')
          }
        } else if (metadata[e.group_id].chessman[tp2].archive_home == team){
          // 对方棋子在己方陷阱内，所有棋子均可吃掉
          isok = true
          console.log('捕获陷阱内棋子')
        } else if(name2 == '空') {
          isok = true
          console.log('条件符合')
        } else {
          console.log('棋子不够大',name1,name2)
        }
      }

      if((/瞬移/).test(e.msg)) isok = true;

      // console.log(isok,id2,metadata[e.group_id].chessman[tp2].archive_home,isAB)
      // 目的地为洞穴，目的地为对方棋子
      if (isok && id2 == '穴' && metadata[e.group_id].chessman[tp2].archive_home == isAB) {
        console.log('获胜')
        return [true, true]
      } else if (isok) {
        return [true, false]
      }
    } catch (error) {
      console.log('遇到报错：', error)
      return [false, false]
    }
  }
}