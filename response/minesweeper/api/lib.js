// 时间差计算，返回秒数，传入都是Date.now()的返回值
function timeDiff(start, end) {
    return Math.floor((end - start) / 1000);
}

export { timeDiff };
