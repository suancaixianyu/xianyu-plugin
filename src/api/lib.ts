// 时间差计算，返回秒数，传入都是Date.now()的返回值
export function timeDiff(start: number, end: number) {
  return Math.floor((end - start) / 1000);
}
