export const Btns = {
  斗兽棋: {
    发起: {
      text: '发起游戏',
      clicked_text: '/发起斗兽棋',
      callback: '/发起斗兽棋',
      send: true,
    },
    加入: {
      text: '加入游戏',
      clicked_text: '/加入斗兽棋',
      callback: '/加入斗兽棋',
      send: true,
    },
    结束: {
      text: '结束游戏',
      clicked_text: '/结束斗兽棋',
      callback: '/结束斗兽棋',
      send: true,
    },
    帮助: {
      text: '游戏帮助',
      clicked_text: '/斗兽棋帮助',
      callback: '/斗兽棋帮助',
      send: true,
    },
    移动: {
      text: '移动',
      input: '/移动',
      send: false,
    },
  },
  推箱子: {
    发起: {
      text: '推箱子',
      clicked_text: '/推箱子',
      callback: '/推箱子',
      send: true,
    },
    列表: {
      text: '关卡列表',
      clicked_text: '/关卡列表',
      callback: '/关卡列表',
      send: true,
    },
    结束: {
      text: '结束游戏',
      clicked_text: '/结束推箱子',
      callback: '/结束推箱子',
      send: true,
    },
    移动: {
      text: '移动',
      input: '/推箱子移动',
      send: false,
    },
  },
  国际象棋: {
    发起: {
      text: '发起游戏',
      clicked_text: '/发起国际象棋',
      callback: '/发起国际象棋',
      send: true,
    },
    加入: {
      text: '加入游戏',
      clicked_text: '/加入国际象棋',
      callback: '/加入国际象棋',
      send: true,
    },
    结束: {
      text: '结束游戏',
      clicked_text: '/结束国际象棋',
      callback: '/结束国际象棋',
      send: true,
    },
    帮助: {
      text: '游戏帮助',
      clicked_text: '/国际象棋帮助',
      callback: '/国际象棋帮助',
      send: true,
    },
    移动: {
      text: '移动',
      input: '/移动',
      send: false,
    },
  },
  象棋: {
    发起: {
      text: '发起游戏',
      clicked_text: '/发起中国象棋',
      callback: '/发起中国象棋',
      send: true,
    },
    加入: {
      text: '加入游戏',
      clicked_text: '/加入中国象棋',
      callback: '/加入中国象棋',
      send: true,
    },
    结束: {
      text: '结束游戏',
      clicked_text: '/结束中国象棋',
      callback: '/结束中国象棋',
      send: true,
    },
    帮助: {
      text: '游戏帮助',
      clicked_text: '/中国象棋帮助',
      callback: '/中国象棋帮助',
      send: true,
    },
    移子: {
      text: '移子',
      input: '/移子',
      send: false,
    },
  },
  扫雷: {
    开始: {
      text: '开始游戏',
      clicked_text: '/扫镭',
      callback: '/扫镭',
      send: true,
    },
    简单: {
      text: '简单',
      clicked_text: '/扫镭难度简单',
      callback: '/扫镭难度简单',
      send: true,
    },
    中等: {
      text: '中等',
      clicked_text: '/扫镭难度中等',
      callback: '/扫镭难度中等',
      send: true,
    },
    困难: {
      text: '困难',
      clicked_text: '/扫镭难度困难',
      callback: '/扫镭难度困难',
      send: true,
    },
    设置布局: {
      text: '设置布局',
      input: '/扫镭设置布局9 9 10',
      send: false,
    },
    设置雷数: {
      text: '设置雷数',
      input: '/扫镭设置地雷10',
      send: false,
    },
    设置初始化: {
      text: '初始化',
      clicked_text: '/扫镭设置布局初始化',
      callback: '/扫镭设置布局初始化',
      send: true,
    },
    结束: {
      text: '结束扫镭',
      clicked_text: '/结束扫镭',
      callback: '/结束扫镭',
      send: true,
    },
    帮助: {
      text: '游戏帮助',
      clicked_text: '/扫镭帮助',
      callback: '/扫镭帮助',
      send: true,
    },
    翻开: {
      text: '翻开',
      input: '/翻开',
      send: false,
    },
    标记: {
      text: '标记',
      input: '/标记',
      send: false,
    },
    取消: {
      text: '取消标记',
      input: '/取消标记',
      send: false,
    },
  },
  五子棋: {
    开始: {
      text: '开始游戏',
      clicked_text: '/五子棋',
      callback: '/五子棋',
      send: true,
    },
    帮助: {
      text: '帮助',
      clicked_text: '/五子棋帮助',
      callback: '/五子棋帮助',
      send: true,
    },
    发起: {
      text: '发起游戏',
      clicked_text: '/发起五子棋',
      callback: '/发起五子棋',
      send: true,
    },
    加入: {
      text: '加入游戏',
      clicked_text: '/加入五子棋',
      callback: '/加入五子棋',
      send: true,
    },
    结束: {
      text: '结束游戏',
      clicked_text: '/结束五子棋',
      callback: '/结束五子棋',
      send: true,
    },
    落子: {
      text: '落子',
      input: '/落子',
      send: false,
    },
  },
  帮助: {
    扫雷: {
      text: '扫镭',
      clicked_text: '/扫镭帮助',
      callback: '/扫镭帮助',
      send: true, // 是否直接发送
    },
    象棋: {
      text: '象棋',
      clicked_text: '/中国象棋帮助',
      callback: '/中国象棋帮助',
      send: true, // 是否直接发送
    },
    五子棋: {
      text: '五子棋',
      clicked_text: '/五子棋帮助',
      callback: '/五子棋帮助',
      send: true, // 是否直接发送
    },
    国际象棋: {
      text: '国际象棋',
      clicked_text: '/国际象棋帮助',
      callback: '/国际象棋帮助',
      send: true, // 是否直接发送
    },
    斗兽棋: {
      text: '斗兽棋',
      clicked_text: '/斗兽棋帮助',
      callback: '/斗兽棋帮助',
      send: true, // 是否直接发送
    },
    铅弹轮盘: {
      text: '恶魔轮盘',
      clicked_text: '/铅弹帮助',
      callback: '/铅弹帮助',
      send: true, // 是否直接发送
    },
    推箱子: {
      text: '推箱子',
      clicked_text: '/推箱子',
      callback: '/推箱子',
      send: true, // 是否直接发送
    },
    统计: {
      text: '用户使用数',
      clicked_text: '/咸鱼统计',
      callback: '/咸鱼统计',
      send: true, // 是否直接发送
    },
  },
  铅弹轮盘: {
    查看道具: { text: '查看道具', clicked_text: '/查看道具', callback: '/查看道具', send: true },
    使用道具: { text: '使用道具', clicked_text: '/使用道具', callback: '/使用道具', send: false },
    打对方: { text: '->对手', clicked_text: '/-对方', callback: '/-对方', send: true },
    打自己: { text: '->自己', clicked_text: '/-自己', callback: '/-自己', send: true },
    开始游戏: { text: '开始游戏', clicked_text: '/开始游戏', callback: '/开始游戏', send: true },
    人机战: { text: '人机战', clicked_text: '/开始游戏', callback: '/开始游戏', send: true },
    发起游戏: { text: '发起游戏', clicked_text: '/发起游戏', callback: '/发起游戏', send: true },
    加入游戏: { text: '加入游戏', clicked_text: '/加入游戏', callback: '/加入游戏', send: true },
    帮助: {
      text: '游戏帮助',
      clicked_text: '/铅弹游戏帮助',
      callback: '/铅弹游戏帮助',
      send: true,
    },
    原神: {
      text: '没意思，原神，启动！',
      type: 3,
      link: 'https://ys.mihoyo.com/cloud/?utm_source=default#/',
    },
  },
}
