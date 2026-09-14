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

export type GameType = string;

export interface ScopedEvent {
  /** AlemonJS 会话标识。棋类 AI 对手配置必须与 Aichat 使用同一 guid。 */
  guid?: string;
  UserId?: string;
  ChannelId?: string;
  GuildId?: string;
  SpaceId?: string;
  IsPrivate?: boolean;
  MessageText?: string;
  __route?: {
    key?: string;
    parsedArgs?: string[];
  };
}

export interface GameSessionRecord<T = unknown> {
  game: GameType;
  state: T;
  updatedAt: number;
}

export interface GameSessionMeta {
  activeGame?: GameType;
  updatedAt: number;
}

export interface GameCommandController {
  game: GameType;
  rewriteCommand(event: ScopedEvent): string | null;
}

export interface GameRouteDefinition {
  aliases: string[];
  importer: () => Promise<unknown>;
}

export interface GameCompactRouteDefinition {
  pattern: RegExp;
  importer: () => Promise<unknown>;
}

export interface GameDefinition {
  game: GameType;
  routes: GameRouteDefinition[];
  compactRoutes?: GameCompactRouteDefinition[];
  controller?: GameCommandController;
}
