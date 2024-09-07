import plugin from '../../../lib/plugins/plugin.js'
import { AppName, cwd } from '../config.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'

export class xianyu_tongji extends plugin {
  constructor() {
    super({
      name: '咸鱼_统计',
      dsc: '咸鱼_统计',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: /^(\/|#)?(xianyu|xy|咸鱼)统计$/i,
          fnc: 'tongji',
        },
      ],
    })
  }

  async tongji(e) {
    let option = {
      animation: false, // 关闭动画
      title: {
        text: '近24小时内插件使用触发次数',
      },
      tooltip: {
        trigger: 'axis',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      legend: {},
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: [], // 时间
      },
      yAxis: {},
      series: [],
    }
    // 列出从当前时间开始的24小时内的时间，每个小时的时间区间
    let time = new Date().getTime()
    let timeArr = []
    for (let i = 1; i < 25; i++) {
      timeArr.push(time - i * 3600 * 1000)
    }
    let serie = []
    let datas = {}
    let sum = 0

    // 遍历时间
    for (const i in timeArr) {
      // 当前时间段数据
      let values = {}
      // 获取数据
      fetch(
        `https://xy.suancaixianyu.cn/xyapi/rank/count?plugin=xianyu-plugin&end=${
          timeArr[i] + 1 * 3600 * 1000
        }&start=${timeArr[i]}`
      )
        .then((res) => res.json())
        .then((res) => {
          sum++
          // console.log(res, res.code == 200)

          if (res.code == 200) {
            // data有数据
            // 遍历bot
            if (Object.keys(res.data).length == 0) return
            // console.log(res.data)
            for (const j in res.data) {
              let bot = res.data[j]
              // console.log('bot', bot)
              delete bot.sum
              // 遍历plugin

              for (const plugin in bot) {
                if (bot.hasOwnProperty(plugin)) {
                  const el_plugin = bot[plugin]
                  // 遍历app
                  for (const app in el_plugin) {
                    // console.log('app', app)
                    // 累加
                    const el_app = el_plugin[app]
                    // console.log('el_app', el_app)

                    if (!values[app]) values[app] = el_app
                    else values[app] += el_app
                  }
                }
              }
            }

            // 添加到serie
            datas[i] = values
            // console.log(datas)
          }
        })
    }

    // 定时器
    const intervalId = setInterval(function () {
      if (sum == 24) {
        // 结束循环
        clearTimeout(intervalId)
        const result = {}
        // 提取所有可能的 key
        const allKeys = new Set()
        for (const key in datas) {
          if (datas.hasOwnProperty(key)) {
            for (const subKey in datas[key]) {
              if (datas[key].hasOwnProperty(subKey)) {
                allKeys.add(subKey)
              }
            }
          }
        }

        // 将 Set 转换为数组
        const keys = Array.from(allKeys)

        // 遍历从 0 到 23 的数字
        for (let i = 0; i <= 23; i++) {
          result[i] = {}
          for (const key of keys) {
            result[i][key] = datas[i] ? datas[i][key] || 0 : 0
          }
        }
        // console.log('result', result)
        for (const key in result) {
          let el = result[key]
          option.xAxis.data.push(new Date(timeArr[key]).getHours() + 1)
          for (const k in el) {
            if (el.hasOwnProperty(k)) {
              const element = el[k]
              if (option.series.findIndex((e) => e.name == k) == -1) {
                option.series.push({
                  name: k,
                  type: 'line',
                  data: [],
                  markPoint: {
                    data: [{ type: 'max', name: 'Max' }],
                  },
                })
              }
              option.series.find((e) => e.name == k).data.push(element)
            }
          }
        }
        // 将option.series.data倒序
        for (const key in option.series) {
          if (option.series.hasOwnProperty(key)) {
            const element = option.series[key]
            element.data = element.data.reverse()
          }
        }
        option.xAxis.data = option.xAxis.data.reverse()
        image(e, '统计', { option: option, cwd: cwd })
      } else {
        // console.log('sum', sum)
      }
    }, 1000)
  }
}

/**
 * @param {*} e 消息对象
 * @param {*} flie 文件名称
 * @param {*} obj 传入对象
 * @returns 发送帮助截图
 */
async function image(e, flie, obj = {}) {
  let data = {
    quality: 100,
    tplFile: `./plugins/${AppName}/public/html/${flie}.html`,
    ...obj,
  }
  let img = await puppeteer.screenshot('tongji', {
    ...data,
  })

  // console.log(btns)

  e.reply(img)
}
