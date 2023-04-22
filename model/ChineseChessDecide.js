
export default class panduan{
  /**
   * @param {Object} e 机器人参数
   * @param {Array} emsg 所有的坐标
   * @param {String} tp1 选择坐标
   * @param {String} tp2 目的地坐标
   * @param {String} team 玩家组
   * @param {Object} metadata 游戏全部内容
   * @returns 判断棋子移动是否正确和是否胜利，返回数组[true,true]
   */
  async Audit(e, emsg, tp1, tp2, team, metadata) {

    try {
      const rows = 9 // 棋盘宽度
      const cols = 10 // 棋盘高度 
      console.log(emsg, tp1, tp2, team);
      // 目的地是否为自己棋子
      if (metadata[e.group_id].archive[tp2] == team) return false;
    
      // 获取选择的棋子信息
      let A = metadata[e.group_id].chessman[tp1]
    
      console.log(A);
    
      // 对方组
      let isAB = '黑红'
      isAB = isAB.replace(new RegExp(team), '')
    
      // 重定义坐标
      let x1 = +emsg[1]
      let x2 = +emsg[3]
      let y1 = +emsg[0]
      let y2 = +emsg[2]
    
      // 胜利判断
      let isok = false

      // 棋子判断部分
      if (A == '車') {
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
          let tps = [
            `${y1}-${x1 - i}`,
            `${y1}-${x1 + i}`,
            `${y1 - i}-${x1}`,
            `${y1 + i}-${x1}`,
          ]
          let ev = tps[tp]
          console.log(tp)
          // 此块存在
          if (metadata[e.group_id].chessman[ev]) {
            // 目的地判断
            if (ev == tp2) { // 是目的地
              // 目的地不为自己
              if (metadata[e.group_id].archive[ev] !== team) {
                isok = true
                break
              } else {
                break
              }
            } else {// 不是目的地
              if (metadata[e.group_id].chessman[ev] !== '空') {
                break
              }
            }
          }
        }
      }

      if (A == '馬'){
        // 可移动位置
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
        // 绊脚棋子
        let p = [
          `${+y1 + 1}-${x1}`,
          `${+y1 + 1}-${x1}`,
          `${+y1}-${+x1 - 1}`,
          `${+y1}-${+x1 + 1}`,
          `${+y1}-${+x1 - 1}`,
          `${+y1}-${+x1 + 1}`,
          `${+y1 - 1}-${+x1}`,
          `${+y1 - 1}-${+x1}`,
        ]
        tps.forEach((ev,index) => {
          if(metadata[e.group_id].chessman[ev] && ev == tp2 && metadata[e.group_id].archive[tp2] != team){
            if(metadata[e.group_id].chessman[p[index]] && metadata[e.group_id].chessman[p[index]] === '空'){
              console.log('条件符合',metadata[e.group_id].archive[ev],tp2)
              isok = true;
            }
          }
        });
      }

      if (A == '象'){
        let tps = [
          `${+y1 - 2}-${+x1 - 2}`,
          `${+y1 - 2}-${+x1 + 2}`,
          `${+y1 + 2}-${+x1 - 2}`,
          `${+y1 + 2}-${+x1 + 2}`,
        ]
        // 绊脚棋子
        let p = [
          `${+y1 - 1}-${+x1 - 1}`,
          `${+y1 - 1}-${+x1 + 1}`,
          `${+y1 + 1}-${+x1 - 1}`,
          `${+y1 + 1}-${+x1 + 1}`,
        ]

        tps.forEach((ev,index) => {
          if(metadata[e.group_id].chessman[ev] && ev == tp2 && metadata[e.group_id].archive[tp2] != team){
            if(metadata[e.group_id].chessman[p[index]] && metadata[e.group_id].chessman[p[index]] === '空'){
              console.log('条件符合',metadata[e.group_id].archive[ev],tp2)
              isok = true;
            }
          }
        });
      }

      if (A == '士'){
        let tps = [
          `${+y1 - 1}-${+x1 - 1}`,
          `${+y1 - 1}-${+x1 + 1}`,
          `${+y1 + 1}-${+x1 - 1}`,
          `${+y1 + 1}-${+x1 + 1}`,
        ]
        tps.forEach(ev => {
          if(metadata[e.group_id].chessman[ev] && ev == tp2 && metadata[e.group_id].archive[tp2] != team){
            let p;
            if(team === '红'){
              p = [
                '0-3',
                '0-5',
                '1-4',
                '2-3',
                '2-5',
              ]
            }else{
              p = [
                '7-3',
                '7-5',
                '8-4',
                '9-3',
                '9-5',
              ]
            }
            p.forEach(ev1 => {
              if(tp2 === ev1){
                console.log('条件符合',metadata[e.group_id].archive[ev],tp2)
                isok = true;
              }
            })
          }
        });
      }


      if (A == '将'){
        
        let tps = [
          `${+y1 - 1}-${x1}`,
          `${+y1 + 1}-${x1}`,
          `${y1}-${+x1 - 1}`,
          `${y1}-${+x1 + 1}`,
        ]
        // 定义活动区域
        let p;

        tps.forEach(ev => {
          if(metadata[e.group_id].chessman[ev] && ev == tp2 && metadata[e.group_id].archive[tp2] != team){
            if(team === '红'){
              p = [
                '0-3','0-4','0-5',
                '1-3','1-4','1-5',
                '2-3','2-4','2-5',
              ]
            }else{
              p = [
                '7-3','7-4','7-5',
                '8-3','8-4','8-5',
                '9-3','9-4','9-5',
              ]
            }
            p.forEach(ev1 => {
              if(tp2 === ev1){
                console.log('条件符合',metadata[e.group_id].archive[ev],tp2)
                isok = true;
              }
            })
          }
        });

        // 循环完之后依旧是false，可能是飞将
        if(isok == false && metadata[e.group_id].chessman[tp2] === '将' && x1 == x2){
          let t = 0
          if(team === '红'){
            for (let i = +y1 + 1; i < cols; i++) {
              if(metadata[e.group_id].chessman[`${i}-${x1}`] !== '空'){
                ++t
              }
            }
          }else{
            for (let i = +y1 - 1; i < cols; i = i - 1) {
              if(metadata[e.group_id].chessman[`${i}-${x1}`] !== '空'){
                ++t
              }
            }
          }
          if (t == 0) isok == true
        }
      }


      if (A == '兵'){
        // 先判断是否过河
        if(team === '红' && +y1 < 5 && +y1 + 1 == y2 && x1 == x2 && metadata[e.group_id].archive[tp2] != team){
          isok = true
        }
        if(team === '黑' && +y1 > 4 && +y1 - 1 == y2 && x1 == x2 && metadata[e.group_id].archive[tp2] != team){
          isok = true
        }

        let tps
        // 过河后不能倒退
        if(team == '红' && +y1 > 4){
          tps = [
            `${+y1 + 1}-${x1}`,
            `${y1}-${+x1 - 1}`,
            `${y1}-${+x1 + 1}`,
          ]
        }else if(team === '黑' && +y1 < 5){
          tps = [
            `${+y1 - 1}-${x1}`,
            `${y1}-${+x1 - 1}`,
            `${y1}-${+x1 + 1}`,
          ]
        }
        if(tps){
          tps.forEach(ev => {
            if(metadata[e.group_id].chessman[ev] && ev == tp2 && metadata[e.group_id].archive[tp2] != team){
              console.log('条件符合',metadata[e.group_id].archive[ev],tp2)
              isok = true;
            }
          });
        }
      }


      if (A == '炮') {
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

        // 跨过的棋子
        let p = 0
    
        for (let i = 1; i < cols + 1; i++) {
          let tps = [
            `${y1}-${x1 - i}`,
            `${y1}-${x1 + i}`,
            `${y1 - i}-${x1}`,
            `${y1 + i}-${x1}`,
          ]
          let ev = tps[tp]
          // 此块存在
          if (metadata[e.group_id].chessman[ev]) {
            // 目的地判断
            if (ev == tp2) { // 是目的地
              // 目的地不为自己
              if (metadata[e.group_id].archive[ev] !== team) {
                isok = true
                break
              } else {
                break
              }
            } else {// 不是目的地
              if (metadata[e.group_id].chessman[ev] !== '空') {
                // 炮可以跳棋，记录中途有多少棋子
                p += 1
              }
            }
          }
        }
        console.log(p);
        // 判断越过的棋子
        if(p < 2 ){
          if(p == 1 && metadata[e.group_id].chessman[tp2] !== '空'){
            isok = true
          }else if(p == 0 && metadata[e.group_id].chessman[tp2] === '空'){
            isok = true
          }else{
            isok = false
          }
        }else{
          isok = false
        }

      }

      if (isok && metadata[e.group_id].chessman[tp2] === '将' && metadata[e.group_id].archive[tp2] == isAB) {
        return [true, true]
      } else if (isok) {
        return [true, false]
      }
    } catch (error) {
      return [false, false]
    }
  }
}

