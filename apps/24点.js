import plugin from "../../../lib/plugins/plugin.js"
import { command, points24game } from "../config.js"

export class newcomer extends plugin {
  constructor() {
    super({
      name: "咸鱼_24点",
      dsc: "咸鱼_24点",
      event: "message",
      priority: 5000,
      rule: [...command.points24],
    })
  }

  /** 生成扑克牌 */
  createDeck() {
    const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
    const deck = []
    for (let i = 0; i < 4; i++) {
      // 四种花色
      for (let value of values) {
        deck.push(value)
      }
    }
    return deck
  }

  async newGame(e) {
    const id = e.group_id ?? e.user_id
    if (e.group_id && points24game[id]) {
      return e.reply(`当前已有24点游戏进行中，当前抽取的牌是：${points24game[id].title}`)
    }
    const deck = this.createDeck()
    // 随机抽取4张牌
    const hand = []
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * deck.length)
      hand.push(deck.splice(randomIndex, 1)[0])
    }
    points24game[id] = {
      title: hand.join(" "),
      startTime: Date.now(),
    }
    return e.reply(
      `24点游戏开始！你抽取的牌是：\n${hand.join(" ")}\n请使用 /解 或 /答 加上你的计算式来回答，例如：/解 3*3+3*5`,
    )
  }

  async game(e) {
    const id = e.group_id ?? e.user_id
    if (!id || !points24game[id]) {
      return e.reply("当前没有进行中的24点游戏，请使用 /开始24点 来开始游戏。")
    }
    // 提取用户输入的表达式并将所有字母大写
    const expression = e.msg.replace(/^(\/|#)?(解|答|答题|=) ?/, "").toUpperCase()
    try {
      // 检查是否只用了允许的字符
      if (!/^[\d\+\-\*\/\(\)a-zA-Z]+$/.test(expression)) {
        return e.reply("表达式包含不允许的字符，请只使用数字和运算符（+、-、*、/、括号）。")
      }
      // 检查是否只用了抽取的牌
      const usedCards = expression.match(/\d+/g).map(Number)
      const drawnCards = points24game[id].title
        .split(" ")
        .map(card =>
          card === "A"
            ? 1
            : card === "J"
              ? 11
              : card === "Q"
                ? 12
                : card === "K"
                  ? 13
                  : Number(card),
        )
      const tempDrawnCards = [...drawnCards]
      for (let card of usedCards) {
        const index = tempDrawnCards.indexOf(card)
        if (index === -1) {
          return e.reply(`你使用了未抽取的牌：${card}，请重新计算。`)
        }
        tempDrawnCards.splice(index, 1)
      }
      // 将AJQK转换为对应的数字
      const evalExpression = expression
        .replace(/A/g, "1")
        .replace(/J/g, "11")
        .replace(/Q/g, "12")
        .replace(/K/g, "13")
      // 计算表达式的值
      const result = eval(evalExpression)
      if (result === 24) {
        const endTime = Date.now()
        const timeTaken = ((endTime - points24game[id].startTime) / 1000).toFixed(2)
        e.reply(`恭喜你，计算正确！${expression} = 24\n游戏结束。使用时间：${timeTaken} 秒。`)
        delete points24game[id]
        return
      } else {
        return e.reply(`计算结果是 ${result}，不等于24，请重新计算。`)
      }
    } catch (error) {
      return e.reply("表达式有误，请检查后重新输入。")
    }
  }

  async ov(e) {
    const id = e.group_id ?? e.user_id
    if (!id || !points24game[id]) {
      return e.reply("当前没有进行中的24点游戏。")
    }
    delete points24game[id]
    return e.reply("24点游戏已结束。")
  }
}
