# Game Scaffold

这个项目现在已经有一套可复用的小游戏接入骨架，目标是让新游戏只改业务，不反复改路由和状态控制。

## 现有结构

- `src/api/gameRegistry.ts`
  - 统一注册游戏定义
- `src/api/gameSession.ts`
  - 维护当前作用域下的激活游戏
- `src/api/gamePools.ts`
  - 按 `群/私聊 + 用户 + 游戏类型` 保存状态
- `src/api/games/minesweeper.ts`
  - 已接入的真实游戏示例
- `src/api/games/template.ts`
  - 新游戏脚手架定义，不会自动注册
- `src/response/template-game/*`
  - 与脚手架配套的 handler 模板

## 新增一个游戏的最小步骤

1. 复制 `src/api/games/template.ts` 为 `src/api/games/<your-game>.ts`
2. 复制 `src/response/template-game` 为 `src/response/<your-game>`
3. 在新文件里替换这些内容
   - `TEMPLATE_GAME`
   - 命令别名
   - 紧凑命令重写规则
   - 游戏状态类型
   - 各个 handler 的业务逻辑
4. 在 `src/api/games/index.ts` 增加 `import "./<your-game>";`
5. 运行
   - `npm.cmd run build`
   - `npm.cmd run smoke:games`

## 推荐约定

- 启动命令只负责创建或恢复当前游戏
- 裸命令接管只处理“当前激活游戏”的短操作词
- 退出命令要同时清理 `gamePools` 和 `gameSession`
- 多游戏共存时，不要复用完全相同的显式命令

## 路由定义建议

- `routes`
  - 放显式命令，如 `扫雷`、`扫雷帮助`、`退出扫雷`
- `compactRoutes`
  - 放短指令入口，如 `扫雷翻开 A1`
- `controller.rewriteCommand`
  - 放激活状态下的裸命令重写，如 `翻开A1 -> 扫雷翻开 A1`

## 当前可用性

- 扫雷已按这套结构接入并验证可用
- `smoke:games` 当前至少覆盖扫雷注册和会话接管行为
