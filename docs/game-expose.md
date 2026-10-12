# 游戏对外接口

插件通过 AlemonJS `Expose` 提供 `xianyu-game-v1` 服务。使用 `Expose.create().list("xianyu-game-v1")` 获取服务，再调用对应 action。`status` 返回可用游戏。

| 游戏 | 快照 | 开始 | 操作 | 退出 |
| --- | --- | --- | --- | --- |
| 24 点 | `points24Snapshot` | `points24Start` | `points24Action` | `points24Exit` |
| 推箱子 | `sokobanSnapshot` | `sokobanStart` | `sokobanAction` | `sokobanExit` |
| 中国象棋 | `chineseChessSnapshot` | `chineseChessStart` | `chineseChessAction` | `chineseChessExit` |
| 斗兽棋 | `animalChessSnapshot` | `animalChessStart` | `animalChessAction` | `animalChessExit` |

所有 action 接受 `guid`。开始、操作、退出还需传入宿主会话 `session`，其中必须包含 `UserId`；单人游戏还使用 `IsPrivate`、`ChannelId`、`GuildId` 或 `SpaceId` 定位玩家作用域。快照在没有对局时返回 `null`。失败的操作返回 `{ ok: false, error }`。

调用示例：

```ts
const input = {
  guid: event.guid,
  session: {
    UserId: event.UserId,
    IsPrivate: event.IsPrivate,
    ChannelId: event.ChannelId,
    GuildId: event.GuildId,
    SpaceId: event.SpaceId,
  },
};
await service.invoke("sokobanStart", { ...input, level: 1 });
await service.invoke("sokobanAction", { ...input, operation: "move", directions: "wasd" });
await service.invoke("sokobanSnapshot", { guid: event.guid });
```

- 24 点：`points24Action` 传 `expression`，使用抽到的四张牌各一次，计算结果为 24 时结束该局。
- 推箱子：`sokobanStart` 的 `level` 从 1 开始；`sokobanAction` 的 `operation` 为 `move` 或 `undo`，移动时传 `directions`（`wasd`）。通关后按原玩法自动进入下一关。
- 中国象棋：`chineseChessStart` 由首位玩家发起、第二位玩家加入；`chineseChessAction` 的 `move` 支持 `A1 A2` 或棋谱写法。快照中的棋盘按 `board[row][col]` 排列，坐标为 `A1` 至 `J9`。
- 斗兽棋：同样需要两位玩家开始；`animalChessAction` 的 `move` 如 `A0 B0`。快照中的棋盘按 `board[row][col]` 排列，坐标为 `A0` 至 `I6`。

两款棋类游戏的操作只允许轮到的参与者执行，结束只允许参与者执行。棋类对局结束后可用快照读取最终棋盘，退出接口会移除对局。
