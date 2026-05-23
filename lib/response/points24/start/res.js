import { useMessage, Text } from 'alemonjs';
import { gamePools } from '../../../api/gamePools.js';
import { gameSession } from '../../../api/gameSession.js';
import '../../../api/games/minesweeper.js';
import { POINTS24_GAME } from '../../../api/games/points24.js';

const createDeck = () => {
    const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const deck = [];
    for (let i = 0; i < 4; i += 1) {
        for (const value of values) {
            deck.push(value);
        }
    }
    return deck;
};
const createGame = () => {
    const deck = createDeck();
    const cards = [];
    for (let i = 0; i < 4; i += 1) {
        const randomIndex = Math.floor(Math.random() * deck.length);
        cards.push(deck.splice(randomIndex, 1)[0]);
    }
    return {
        cards,
        title: cards.join(" "),
        startTime: Date.now(),
        status: "playing",
    };
};
var res = async (event) => {
    const [message] = useMessage();
    const current = gamePools.getGame(event, POINTS24_GAME);
    if (current?.status === "playing") {
        gameSession.activate(event, POINTS24_GAME);
        await message.send(format(Text(`当前已有24点游戏进行中，抽取的牌是：${current.title}`)));
        return;
    }
    const game = createGame();
    gamePools.saveGame(event, POINTS24_GAME, game);
    gameSession.activate(event, POINTS24_GAME);
    await message.send(format(Text(`24点游戏开始！你抽取的牌是：\n${game.title}\n请使用“24点解 表达式”作答，开始后也可以直接发送“解 表达式”。`)));
};

export { res as default };
