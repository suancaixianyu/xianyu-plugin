import { CHINESE_CHESS_COLS, CHINESE_CHESS_ROWS, pointKey } from './state.js';

const pieceAliases = {
    車: "車",
    车: "車",
    馬: "馬",
    马: "馬",
    象: "象",
    相: "象",
    士: "士",
    仕: "士",
    将: "将",
    帅: "将",
    炮: "炮",
    兵: "兵",
    卒: "兵",
};
const chineseNumbers = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
const formalChineseNumbers = ["壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖", "拾"];
const parseFileNumber = (input, team) => {
    const chineseIndex = chineseNumbers.indexOf(input);
    const formalIndex = formalChineseNumbers.indexOf(input);
    const numeric = /^\d$/.test(input) ? Number(input) - 1 : -1;
    const index = chineseIndex >= 0 ? chineseIndex : formalIndex >= 0 ? formalIndex : numeric;
    if (index < 0 || index >= CHINESE_CHESS_COLS) {
        return null;
    }
    return team === "黑" ? CHINESE_CHESS_COLS - 1 - index : index;
};
const parseStepNumber = (input) => {
    const chineseIndex = chineseNumbers.indexOf(input);
    const formalIndex = formalChineseNumbers.indexOf(input);
    const numeric = /^\d$/.test(input) ? Number(input) - 1 : -1;
    const index = chineseIndex >= 0 ? chineseIndex : formalIndex >= 0 ? formalIndex : numeric;
    return index < 0 ? null : index;
};
const parseChineseChessCoordinate = (input) => {
    const match = input.trim().match(/^([a-jA-J])\s*(\d)$/);
    if (!match) {
        return null;
    }
    const row = match[1].toUpperCase().charCodeAt(0) - 65;
    const col = Number(match[2]) - 1;
    if (row < 0 || row >= CHINESE_CHESS_ROWS || col < 0 || col >= CHINESE_CHESS_COLS) {
        return null;
    }
    return { row, col };
};
const parseChineseChessCoordinateMove = (raw) => {
    const text = raw.trim().replace(/^(?:[!！/#＃]\s*)/, "");
    const match = text.match(/^(?:中国象棋|象棋)?移子\s*([a-jA-J]\s*\d)\s*([a-jA-J]\s*\d)$/);
    if (!match) {
        return null;
    }
    const from = parseChineseChessCoordinate(match[1]);
    const to = parseChineseChessCoordinate(match[2]);
    if (!from || !to) {
        return null;
    }
    return {
        from,
        to,
        input: {
            raw,
            mode: "coordinate",
        },
    };
};
const findNotationSource = (room, piece, col, prefix, team) => {
    const points = [];
    for (let row = 0; row < CHINESE_CHESS_ROWS; row += 1) {
        const point = { row, col };
        const key = pointKey(point);
        if (room.state.board[key] === piece && room.state.ownership[key] === team) {
            points.push(point);
        }
    }
    if (points.length === 0) {
        return null;
    }
    if (points.length === 1) {
        return points[0];
    }
    if (prefix === "前") {
        return team === "红" ? points[points.length - 1] : points[0];
    }
    if (prefix === "后") {
        return team === "红" ? points[0] : points[points.length - 1];
    }
    return null;
};
const findCandidateByDestinationCol = (candidates, targetCol) => candidates.find((point) => point.col === targetCol) ?? null;
const parseChineseChessNotationMove = (raw, room, userId) => {
    const team = room.players[userId]?.team;
    if (!team) {
        return null;
    }
    let text = raw
        .trim()
        .replace(/^(?:[!！/#＃]\s*)/, "")
        .replace(/^(?:中国象棋|象棋)?棋谱\s*/, "")
        .replace(/^(?:中国象棋|象棋)/, "")
        .replace(/\s+/g, "");
    const prefixMatch = text.match(/^(前|后)/);
    const prefix = prefixMatch?.[1];
    if (prefix) {
        text = text.slice(1);
    }
    const match = text.match(/^([車车馬马象相士仕将帅炮兵卒])([一二三四五六七八九十壹贰叁肆伍陆柒捌玖拾\d])(进|退|平)([一二三四五六七八九十壹贰叁肆伍陆柒捌玖拾\d])$/);
    if (!match) {
        return null;
    }
    const piece = pieceAliases[match[1]];
    const col = parseFileNumber(match[2], team);
    const action = match[3];
    const target = parseStepNumber(match[4]);
    if (!piece || col === null || target === null) {
        return null;
    }
    const from = findNotationSource(room, piece, col, prefix, team);
    if (!from) {
        return null;
    }
    let to = null;
    if (piece === "兵" || piece === "炮" || piece === "車" || piece === "将") {
        if (team === "红") {
            if (action === "进")
                to = { row: from.row + target + 1, col: from.col };
            if (action === "退")
                to = { row: from.row - target - 1, col: from.col };
            if (action === "平")
                to = { row: from.row, col: target };
        }
        else {
            if (action === "进")
                to = { row: from.row - target - 1, col: from.col };
            if (action === "退")
                to = { row: from.row + target + 1, col: from.col };
            if (action === "平")
                to = { row: from.row, col: CHINESE_CHESS_COLS - 1 - target };
        }
    }
    else {
        const targetCol = team === "黑" ? CHINESE_CHESS_COLS - 1 - target : target;
        const forward = team === "红" ? 1 : -1;
        const backward = -forward;
        const direction = action === "进" ? forward : action === "退" ? backward : 0;
        const candidates = [];
        if (piece === "馬") {
            candidates.push({ row: from.row + direction * 2, col: from.col - 1 }, { row: from.row + direction * 2, col: from.col + 1 }, { row: from.row + direction, col: from.col - 2 }, { row: from.row + direction, col: from.col + 2 });
        }
        if (piece === "士") {
            candidates.push({ row: from.row + direction, col: from.col - 1 }, { row: from.row + direction, col: from.col + 1 });
        }
        if (piece === "象") {
            candidates.push({ row: from.row + direction * 2, col: from.col - 2 }, { row: from.row + direction * 2, col: from.col + 2 });
        }
        if (action === "平") {
            return null;
        }
        to = findCandidateByDestinationCol(candidates, targetCol);
    }
    if (!to) {
        return null;
    }
    return {
        from,
        to,
        input: {
            raw,
            mode: "notation",
        },
    };
};

export { parseChineseChessCoordinate, parseChineseChessCoordinateMove, parseChineseChessNotationMove };
