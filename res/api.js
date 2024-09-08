import { AppName } from '../config/metadata.js'
import fs from 'node:fs'
import YAML from 'yaml'
/** 获取yaml文件 */
export function getYaml(name) {
  let path = `./data/${AppName}/${name}.yaml`
  return YAML.parse(fs.readFileSync(path, 'utf8'))
}

/** 保存yaml文件 */
export function saveYaml(name, obj) {
  let path = `./data/${AppName}/${name}.yaml`
  fs.writeFile(path, YAML.stringify(obj), (err) => {
    if (err) {
      console.log('保存失败', err)
    } else {
      console.log('保存成功')
    }
  })
}

/** 获取json */
export function getJson(name) {
  let path = `./data/${AppName}/${name}.json`
  return JSON.parse(fs.readFileSync(path, 'utf8'))
}

/** 保存json */
export function saveJson(name, obj) {
  let path = `./data/${AppName}/${name}.json`
  fs.writeFile(path, JSON.stringify(obj), (err) => {
    if (err) {
      console.log('保存失败', err)
    } else {
      console.log('保存成功')
    }
  })
}

/** 获取按钮是否显示 */
export function getBtn() {
  let config = getYaml('config')
  return config.set.btn
}

/** 使用map方法实现深备份数组 */
export function deepCopy(obj) {
  return obj.map((item) => {
    if (Array.isArray(item)) {
      return deepCopy(item)
    } else {
      return item
    }
  })
}

/** 深度备份对象 */
export function deepCopyObj(obj) {
  if (obj instanceof RegExp) {
    // 如果是正则表达式，直接返回一个新的正则表达式实例
    return new RegExp(obj)
  }

  let newObj = {}
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      newObj[key] = deepCopyObj(obj[key])
    } else {
      newObj[key] = obj[key]
    }
  }
  return newObj
}

/** 深度备份数组对象 */
// 对象中每个key对应一个数组，数组中每个元素是一个对象
export function deepCopyArrObj(obj) {
  let newObj = {}
  for (let key in obj) {
    newObj[key] = obj[key].map((item) => {
      return deepCopyObj(item)
    })
  }
  return newObj
}

/** 上传统计 */
export function adduser(e, app) {
  const bottype = JSON.parse(fs.readFileSync(`./package.json`, 'utf-8'))
  let nickname = e.sender.nickname || e.user_name || e.nickname || '匿名'

  let myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  const raw = JSON.stringify({
    user_id: e.user_id,
    user_name: nickname,
    group_id: e.group_id,
    group_name: e.group_name,
    bot_name: e.bot.nickname,
    bot_type: bottype.name,
    bot_id: e.bot.uin,
    app: app,
    plugin_name: AppName,
    platform: e.adapter_id,
  })

  let requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  }

  fetch('http://xy.suancaixianyu.cn/xyapi/record', requestOptions)
    // fetch('http://[::1]:8000/xyapi/record', requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then((result) => {
      // console.log(result)
      if (result.code == 200) {
        // console.log('记录成功')
      }
    })
    .catch((err) => {
      console.log('记录失败', err)
    })

  return false
}

/**
 * 获取时间区-小时
 * [开始时间, 结束时间, 小时数]
 */
export function getHourlyIntervals(hours) {
  const intervals = []
  const currentTime = new Date()

  for (let i = 0; i < hours; i++) {
    // 结束时间为当前时间 - i 个小时
    const endTime = new Date(currentTime.getTime() - i * 60 * 60 * 1000)
    // 开始时间为结束时间再减去 1 小时
    const startTime = new Date(endTime.getTime() - 60 * 60 * 1000)
    // 获取结束时间的小时数
    const hour = endTime.getHours()
    // 保存 [开始时间, 结束时间, 小时数] 作为一组
    intervals.push([startTime.getTime(), endTime.getTime(), hour])
  }

  return intervals
}
