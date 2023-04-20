# xianyu-Plugin 说明

`xianyu-plugin`是一个`Yunzai-Bot`的小游戏插件，目前提供一些棋类游戏，例如`象棋` `国际象棋` 以及 `扫雷`

具体功能可在安装插件后 ~~**自行摸索**~~

---

## 安装与更新

### 使用Git安装（推荐）

请使用 git 进行安装，以方便后续升级。在 Yunzai-Bot 根目录夹打开终端，运行下述指令之一

```
// 使用gitee
git clone --depth=1 https://gitee.com/suancaixianyu/xianyu-plugin.git ./plugins/xianyu-Plugin/
```

进行安装。安装完毕后，管理员只需发送 `#咸鱼更新` 即可自动更新 xianyu-plugin。

### 手工下载安装（不推荐）

手工下载安装包，解压后将`xianyu-plugin-master`更名为`xianyu-plugin`，然后放置在Yunzai的plugins目录内

虽然此方式能够使用，但无法使用`#咸鱼更新`进行更新，不利于后续升级，故不推荐使用

---
## 指令

### 象棋

| 指令 | 说明 | 注意 | 示例指令 |
|------| ---- | ------ | ----- |
| 发起中国象棋 |  |  |  |
| 移子 | 移动棋子到指定为止，规则与象棋一致 | `移子a0b0`，不区分大小写，此处意思是将`a0`位置的`車`移动至`b0`位置 | 移子a0b0 |

暂时没有帮助菜单，其他js正在逐步移植中...

---

## Yunzai版本与支持

`xianyu-plugin` 仅支持 V3 版本的 Yunzai-Bot

目前我试过的有这两个版本

* [Yunzai-V3](https://gitee.com/Le-niao/Yunzai-Bot) ：Yunzai V3 - 乐神原版，使用oicq，可能会遇到登录问题

* [Yunzai-V3](https://gitee.com/TimeRainStarSky/Yunzai) ：Yunzai V3 - 时雨版，使用gocq，可以直接在频道使用

其他版本自行测试，如有报错可以提交一个`lssues`反馈

其他js正在逐步添加至`xianyu-plugin`，有点忙，稍微等几天

~~也可以关注一下`xianyu-plugin`官网~~ [☛咸鱼插件](http://suancaixianyu.cn/xyjs/)