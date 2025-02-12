export interface Game {
  row: number; // 行数
  col: number; // 行列数
  mine: number; // 雷数
  state: "playing" | "win" | "lose"; // 游戏状态
  remain: number; // 剩余雷数
  // 当前选择的位置
  select: {
    x: number;
    y: number;
  };
  time: number;
  startTime: number;
  map: {
    [key: string]: {
      isMine: boolean; // 是否是雷
      value: number; // 周围雷数
      isOpen: boolean; // 是否打开
      isFlag: boolean; // 是否标记
      name: string; // 显示的名字
    };
  };
}
