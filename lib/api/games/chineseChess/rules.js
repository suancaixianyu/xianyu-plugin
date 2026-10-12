import { isInsideChineseChessBoard, pointKey, opponentTeam, cloneChineseChessState } from './state.js';

const sameLine = (from, to) => from.row === to.row || from.col === to.col;
const countPiecesBetween = (room, from, to) => {
    if (!sameLine(from, to)) {
        return Number.POSITIVE_INFINITY;
    }
    const rowStep = Math.sign(to.row - from.row);
    const colStep = Math.sign(to.col - from.col);
    let row = from.row + rowStep;
    let col = from.col + colStep;
    let count = 0;
    while (row !== to.row || col !== to.col) {
        if (room.state.board[pointKey({ row, col })] !== "空") {
            count += 1;
        }
        row += rowStep;
        col += colStep;
    }
    return count;
};
const inPalace = (point, team) => {
    const palaceRows = team === "红" ? [0, 1, 2] : [7, 8, 9];
    return palaceRows.includes(point.row) && point.col >= 3 && point.col <= 5;
};
const isElephantOnOwnSide = (point, team) => team === "红" ? point.row <= 4 : point.row >= 5;
const findGeneral = (state, team) => {
    for (const [key, piece] of Object.entries(state.board)) {
        if (piece !== "将" || state.ownership[key] !== team) {
            continue;
        }
        const [row, col] = key.split("-").map(Number);
        return { row, col };
    }
    return null;
};
const countPiecesBetweenState = (state, from, to) => {
    if (!sameLine(from, to)) {
        return Number.POSITIVE_INFINITY;
    }
    const rowStep = Math.sign(to.row - from.row);
    const colStep = Math.sign(to.col - from.col);
    let row = from.row + rowStep;
    let col = from.col + colStep;
    let count = 0;
    while (row !== to.row || col !== to.col) {
        if (state.board[pointKey({ row, col })] !== "空") {
            count += 1;
        }
        row += rowStep;
        col += colStep;
    }
    return count;
};
const canPieceAttack = (state, from, to, attackerTeam) => {
    if (!isInsideChineseChessBoard(from) || !isInsideChineseChessBoard(to)) {
        return false;
    }
    const piece = state.board[pointKey(from)];
    const rowDelta = to.row - from.row;
    const colDelta = to.col - from.col;
    const absRow = Math.abs(rowDelta);
    const absCol = Math.abs(colDelta);
    if (!piece || piece === "空") {
        return false;
    }
    if (piece === "車") {
        return sameLine(from, to) && countPiecesBetweenState(state, from, to) === 0;
    }
    if (piece === "馬") {
        if (!((absRow === 2 && absCol === 1) || (absRow === 1 && absCol === 2))) {
            return false;
        }
        const leg = absRow === 2
            ? { row: from.row + Math.sign(rowDelta), col: from.col }
            : { row: from.row, col: from.col + Math.sign(colDelta) };
        return state.board[pointKey(leg)] === "空";
    }
    if (piece === "象") {
        if (absRow !== 2 || absCol !== 2 || !isElephantOnOwnSide(to, attackerTeam)) {
            return false;
        }
        const eye = { row: from.row + rowDelta / 2, col: from.col + colDelta / 2 };
        return state.board[pointKey(eye)] === "空";
    }
    if (piece === "士") {
        return absRow === 1 && absCol === 1 && inPalace(to, attackerTeam);
    }
    if (piece === "将") {
        if (from.col === to.col && state.board[pointKey(to)] === "将") {
            return countPiecesBetweenState(state, from, to) === 0;
        }
        return absRow + absCol === 1 && inPalace(to, attackerTeam);
    }
    if (piece === "兵") {
        const forward = attackerTeam === "红" ? 1 : -1;
        const crossedRiver = attackerTeam === "红" ? from.row > 4 : from.row < 5;
        if (rowDelta === forward && colDelta === 0) {
            return true;
        }
        return crossedRiver && rowDelta === 0 && absCol === 1;
    }
    if (piece === "炮") {
        return sameLine(from, to) && countPiecesBetweenState(state, from, to) === 1;
    }
    return false;
};
const isTeamInCheckOnState = (state, team) => {
    const general = findGeneral(state, team);
    if (!general) {
        return true;
    }
    const opponent = opponentTeam(team);
    for (const [key, owner] of Object.entries(state.ownership)) {
        if (owner !== opponent) {
            continue;
        }
        const [row, col] = key.split("-").map(Number);
        if (canPieceAttack(state, { row, col }, general, opponent)) {
            return true;
        }
    }
    return false;
};
const previewMoveState = (state, intent, team) => {
    const next = cloneChineseChessState(state);
    const fromKey = pointKey(intent.from);
    const toKey = pointKey(intent.to);
    next.board[toKey] = next.board[fromKey];
    next.board[fromKey] = "空";
    next.ownership[toKey] = team;
    next.ownership[fromKey] = "0";
    next.lastMove = intent;
    next.current = opponentTeam(team);
    return next;
};
const validatePieceMove = (room, intent, team) => {
    const { from, to } = intent;
    const fromKey = pointKey(from);
    const toKey = pointKey(to);
    const piece = room.state.board[fromKey];
    const targetPiece = room.state.board[toKey];
    const rowDelta = to.row - from.row;
    const colDelta = to.col - from.col;
    const absRow = Math.abs(rowDelta);
    const absCol = Math.abs(colDelta);
    if (piece === "車") {
        return sameLine(from, to) && countPiecesBetween(room, from, to) === 0;
    }
    if (piece === "馬") {
        if (!((absRow === 2 && absCol === 1) || (absRow === 1 && absCol === 2))) {
            return false;
        }
        const leg = absRow === 2
            ? { row: from.row + Math.sign(rowDelta), col: from.col }
            : { row: from.row, col: from.col + Math.sign(colDelta) };
        return room.state.board[pointKey(leg)] === "空";
    }
    if (piece === "象") {
        if (absRow !== 2 || absCol !== 2 || !isElephantOnOwnSide(to, team)) {
            return false;
        }
        const eye = { row: from.row + rowDelta / 2, col: from.col + colDelta / 2 };
        return room.state.board[pointKey(eye)] === "空";
    }
    if (piece === "士") {
        return absRow === 1 && absCol === 1 && inPalace(to, team);
    }
    if (piece === "将") {
        if (targetPiece === "将" && from.col === to.col) {
            return countPiecesBetween(room, from, to) === 0;
        }
        return absRow + absCol === 1 && inPalace(to, team);
    }
    if (piece === "兵") {
        const forward = team === "红" ? 1 : -1;
        const crossedRiver = team === "红" ? from.row > 4 : from.row < 5;
        if (rowDelta === forward && colDelta === 0) {
            return true;
        }
        return crossedRiver && rowDelta === 0 && absCol === 1;
    }
    if (piece === "炮") {
        if (!sameLine(from, to)) {
            return false;
        }
        const between = countPiecesBetween(room, from, to);
        return targetPiece === "空" ? between === 0 : between === 1;
    }
    return false;
};
const validateChineseChessMove = (room, intent, userId) => {
    const player = room.players[userId];
    if (!player) {
        return { ok: false, message: "你还没加入中国象棋" };
    }
    const team = player.team;
    if (team !== room.state.current) {
        return { ok: false, message: "当前不是你的回合" };
    }
    if (!isInsideChineseChessBoard(intent.from) || !isInsideChineseChessBoard(intent.to)) {
        return { ok: false, message: "坐标超出棋盘" };
    }
    const fromKey = pointKey(intent.from);
    const toKey = pointKey(intent.to);
    const piece = room.state.board[fromKey];
    if (!piece || piece === "空") {
        return { ok: false, message: "起点没有棋子" };
    }
    if (room.state.ownership[fromKey] !== team) {
        return { ok: false, message: `只能操作自己的棋子，你是${team}方` };
    }
    if (room.state.ownership[toKey] === team) {
        return { ok: false, message: "目标位置是自己的棋子" };
    }
    if (!validatePieceMove(room, intent, team)) {
        return { ok: false, message: "移动不正确" };
    }
    const nextState = previewMoveState(room.state, intent, team);
    if (isTeamInCheckOnState(nextState, team)) {
        return { ok: false, message: "不能让自己的将处于被将军状态" };
    }
    return {
        ok: true,
        win: room.state.board[toKey] === "将" && room.state.ownership[toKey] === opponentTeam(team),
        check: isTeamInCheckOnState(nextState, opponentTeam(team)),
    };
};
const applyChineseChessMove = (room, intent) => {
    const fromKey = pointKey(intent.from);
    const toKey = pointKey(intent.to);
    const team = room.state.current;
    room.history.push(cloneChineseChessState(room.state));
    room.state.board[toKey] = room.state.board[fromKey];
    room.state.board[fromKey] = "空";
    room.state.ownership[toKey] = team;
    room.state.ownership[fromKey] = "0";
    room.state.lastMove = intent;
    room.state.current = opponentTeam(team);
    room.turn = room.state.current;
    room.undoRequest = undefined;
};
const rollbackChineseChessMove = (room) => {
    if (room.history.length <= 1) {
        return false;
    }
    const previous = room.history.pop();
    if (!previous) {
        return false;
    }
    room.state = cloneChineseChessState(previous);
    room.turn = room.state.current;
    room.status = "playing";
    room.winner = undefined;
    room.undoRequest = undefined;
    return true;
};

export { applyChineseChessMove, rollbackChineseChessMove, validateChineseChessMove };
