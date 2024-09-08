import plugin from '../../../lib/plugins/plugin.js'
import { AppName, cwd } from '../config.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import { getHourlyIntervals } from '../res/api.js'

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
        text: '',
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
    let timeArr = getHourlyIntervals(24)
    let datas = {}
    let sum = 0

    // 遍历时间
    for (const i in timeArr) {
      // 获取数据
      fetch(
        `https://xy.suancaixianyu.cn/xyapi/rank/count?plugin=${AppName}&end=${timeArr[i][1]}&start=${timeArr[i][0]}`
      )
        .then((res) => res.json())
        .then((res) => {
          sum++
          if (res.code != 200 || Object.keys(res.data).length == 0) return

          let apps = Object.keys(res.data).flatMap((e) =>
            Object.values({ ...res.data[e], sum: undefined }).filter(Boolean)
          )

          datas[i] = apps.reduce((acc, app) => {
            Object.keys(app).forEach((el) => {
              acc[el] = (acc[el] || 0) + app[el]
            })
            return acc
          }, {})
        })
    }

    // 定时器
    const intervalId = setInterval(() => {
      if (sum === 24) {
        clearTimeout(intervalId)

        // 提取所有可能的 key
        const allKeys = new Set(Object.values(datas).flatMap(Object.keys))
        const keys = Array.from(allKeys)

        // 生成结果
        const result = Array.from({ length: 24 }, (_, i) =>
          keys.reduce((acc, key) => {
            acc[key] = datas[i]?.[key] || 0
            return acc
          }, {})
        )

        // 更新 option 数据
        result.forEach((el, i) => {
          option.xAxis.data.push(timeArr[i][2])
          keys.forEach((key) => {
            if (key === 'PluginName') return
            let series = option.series.find((e) => e.name === key)
            if (!series) {
              series = {
                name: key,
                type: 'line',
                data: [],
                markPoint: { data: [{ type: 'max', name: 'Max' }] },
              }
              option.series.push(series)
            }
            series.data.push(el[key])
          })
        })

        // 倒序处理
        option.series.forEach((serie) => serie.data.reverse())
        option.xAxis.data.reverse()

        // 合成图片
        image(e, '统计', { option, cwd })
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

  e.reply(img)
}
