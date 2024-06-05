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
  let newObj = {}
  for (let key in obj) {
    if (typeof obj[key] === 'object') {
      newObj[key] = deepCopyObj(obj[key])
    } else {
      newObj[key] = obj[key]
    }
  }
  return newObj
}
