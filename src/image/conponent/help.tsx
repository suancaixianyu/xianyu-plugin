import React from "react";
import css_output from "@src/asstes/main.css";
import { description, helpPrefix, version } from "@src/config/plugin";

const gameCards = [
  {
    name: "扫雷",
    status: "已上线",
    color: "#f4c542",
    commands: ["扫雷", "扫雷难度 困难", "翻开 A1", "标记 B2", "结束扫雷"],
    desc: "单人棋盘游戏，支持会话接管，开始后可直接用翻开/标记短指令。",
  },
  {
    name: "24点",
    status: "已上线",
    color: "#67c587",
    commands: ["开始24点", "24点解 3*3+3*5", "结束24点", "解 (8-2)*4"],
    desc: "纯文本速算小游戏，开始后可直接用解/答/= 快速作答。",
  },
  {
    name: "更多游戏",
    status: "迁移中",
    color: "#7fa7ff",
    commands: ["推箱子", "五子棋", "斗兽棋", "中国象棋", "国际象棋"],
    desc: "老版本游戏正在逐个迁移，会继续接入当前注册中心和状态控制器。",
  },
];

const quickCommands = [
  "帮助 / 咸鱼帮助",
  "扫雷帮助",
  "24点帮助",
];

export default function App() {
  return (
    <html>
      <head>
        <link rel="stylesheet" href={css_output} />
      </head>
      <body
        style={{
          margin: 0,
          background:
            "linear-gradient(145deg, #f7f2e9 0%, #e8e0d2 42%, #d7dfe9 100%)",
          fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
        }}
      >
        <div className="p-8">
          <div
            style={{
              background: "rgba(255,255,255,0.88)",
              border: "4px solid #2f3542",
              boxShadow: "10px 10px 0 #9ca7b5",
              padding: "28px",
            }}
          >
            <div className="flex items-start justify-between gap-6 mb-6">
              <div>
                <div
                  style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    background: "#2f3542",
                    color: "#fff7da",
                    fontSize: "18px",
                    fontWeight: 700,
                    letterSpacing: "2px",
                  }}
                >
                  咸鱼插件帮助
                </div>
                <h1
                  className="mt-4 mb-2"
                  style={{
                    fontSize: "40px",
                    lineHeight: 1.1,
                    color: "#233142",
                    fontWeight: 800,
                  }}
                >
                  小游戏合集菜单
                </h1>
                <p
                  style={{
                    margin: 0,
                    color: "#49566a",
                    fontSize: "18px",
                    maxWidth: "760px",
                  }}
                >
                  当前已经接入扫雷和24点，并完成统一状态控制。后续迁移的新游戏也会沿用这一套命令与会话架构。
                </p>
              </div>
              <div
                style={{
                  minWidth: "180px",
                  background: "#233142",
                  color: "#fff",
                  padding: "16px 18px",
                  borderRadius: "14px",
                }}
              >
                <div style={{ fontSize: "14px", opacity: 0.8 }}>版本</div>
                <div style={{ fontSize: "26px", fontWeight: 800 }}>v{version}</div>
                <div style={{ fontSize: "14px", marginTop: "10px", color: "#d6dde8" }}>
                  {description}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.3fr 0.9fr",
                gap: "20px",
                alignItems: "start",
              }}
            >
              <div
                style={{
                  background: "#fffaf1",
                  border: "3px solid #424a57",
                  padding: "18px",
                }}
              >
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    color: "#2f3542",
                    marginBottom: "14px",
                  }}
                >
                  快速入口
                </div>
                <div className="flex flex-wrap gap-3">
                  {quickCommands.map((item) => (
                    <div
                      key={item}
                      style={{
                        background: "#2f3542",
                        color: "#fff8de",
                        padding: "10px 14px",
                        borderRadius: "999px",
                        fontSize: "17px",
                        fontWeight: 700,
                      }}
                    >
                      {helpPrefix}
                      {item}
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: "16px",
                    color: "#5a6473",
                    fontSize: "16px",
                    lineHeight: 1.7,
                  }}
                >
                  提示：游戏开始后，部分短指令会自动切到当前激活游戏，例如扫雷的“翻开 A1”和24点的“解 3*3+3*5”。
                </div>
              </div>

              <div
                style={{
                  background: "#eef3f9",
                  border: "3px solid #424a57",
                  padding: "18px",
                }}
              >
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    color: "#2f3542",
                    marginBottom: "10px",
                  }}
                >
                  当前状态
                </div>
                <div style={{ color: "#49566a", fontSize: "16px", lineHeight: 1.75 }}>
                  <div>已接入游戏：2 个</div>
                  <div>状态控制：已启用</div>
                  <div>老版本迁移：进行中</div>
                  <div>推荐入口：先发帮助，再进入单个游戏帮助</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              {gameCards.map((item) => (
                <div
                  key={item.name}
                  style={{
                    background: "rgba(255,255,255,0.92)",
                    border: "3px solid #414b57",
                    padding: "18px 20px",
                    display: "grid",
                    gridTemplateColumns: "200px 1fr",
                    gap: "18px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "inline-block",
                        background: item.color,
                        color: "#1f2933",
                        fontWeight: 800,
                        padding: "6px 10px",
                        borderRadius: "999px",
                        fontSize: "14px",
                        marginBottom: "12px",
                      }}
                    >
                      {item.status}
                    </div>
                    <div
                      style={{
                        fontSize: "28px",
                        fontWeight: 800,
                        color: "#233142",
                        lineHeight: 1.1,
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        marginTop: "10px",
                        color: "#586578",
                        fontSize: "16px",
                        lineHeight: 1.6,
                      }}
                    >
                      {item.desc}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 800,
                        color: "#2f3542",
                        marginBottom: "10px",
                      }}
                    >
                      常用命令
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {item.commands.map((command) => (
                        <div
                          key={command}
                          style={{
                            background: "#f4f6f8",
                            border: "2px solid #ccd4dd",
                            padding: "10px 12px",
                            color: "#2f3542",
                            fontSize: "16px",
                            fontWeight: 600,
                          }}
                        >
                          {helpPrefix}
                          {command}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
