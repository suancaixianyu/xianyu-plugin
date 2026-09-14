import { gameRegistry } from "../gameRegistry";
import type { GameCommandController, GameDefinition, ScopedEvent } from "../type";

export const CHINESE_CHESS_GAME = "chinese-chess" as const;

const coordinateMovePattern =
  /^(?:[!！/#＃]\s*)?(?:中国象棋)?移子\s*([a-jA-J]\s*\d)\s*([a-jA-J]\s*\d)$/;

const notationMovePattern =
  /^(?:[!！/#＃]\s*)?(?:(?:中国)?象棋(?:棋谱)?\s*)?(?:前|后)?\s*[車车馬马象相士仕将帅炮兵卒]\s*[一二三四五六七八九十壹贰叁肆伍陆柒捌玖拾\d]\s*(?:进|退|平)\s*[一二三四五六七八九十壹贰叁肆伍陆柒捌玖拾\d]$/;

export const chineseChessCommandController: GameCommandController = {
  game: CHINESE_CHESS_GAME,
  rewriteCommand(event: ScopedEvent) {
    const text = String(event.MessageText ?? "").trim().replace(/^(?:[!！/#＃]\s*)/, "");

    if (coordinateMovePattern.test(text)) {
      return text.startsWith("中国象棋") ? text : `中国象棋${text}`;
    }

    if (notationMovePattern.test(text)) {
      return text.startsWith("中国象棋棋谱") ? text : `中国象棋棋谱 ${text}`;
    }

    if (/^悔棋$/.test(text)) {
      return "中国象棋悔棋";
    }

    if (/^(同意|拒绝)$/.test(text)) {
      return `中国象棋${text}`;
    }

    return null;
  },
};

export const chineseChessGameDefinition: GameDefinition = {
  game: CHINESE_CHESS_GAME,
  controller: chineseChessCommandController,
  compactRoutes: [
    {
      pattern: /^(?:[!！/#＃]\s*)?(?:发起|加入)(?:中国)?象棋\s*[黑红]?$/,
      importer: () => import("../../response/chinese-chess/join/res"),
    },
    {
      pattern: coordinateMovePattern,
      importer: () => import("../../response/chinese-chess/move/res"),
    },
    {
      pattern: notationMovePattern,
      importer: () => import("../../response/chinese-chess/move/res"),
    },
  ],
  routes: [
    {
      aliases: ["发起中国象棋", "加入中国象棋", "发起象棋", "加入象棋"],
      importer: () => import("../../response/chinese-chess/join/res"),
    },
    {
      aliases: ["结束中国象棋", "退出中国象棋", "结束象棋"],
      importer: () => import("../../response/chinese-chess/exit/res"),
    },
    {
      aliases: ["中国象棋帮助", "象棋帮助"],
      importer: () => import("../../response/chinese-chess/help/res"),
    },
    {
      aliases: ["中国象棋移子"],
      importer: () => import("../../response/chinese-chess/move/res"),
    },
    {
      aliases: ["中国象棋棋谱"],
      importer: () => import("../../response/chinese-chess/move/res"),
    },
    {
      aliases: ["中国象棋悔棋", "中国象棋同意", "中国象棋拒绝"],
      importer: () => import("../../response/chinese-chess/undo/res"),
    },
  ],
};

gameRegistry.register(chineseChessGameDefinition);
