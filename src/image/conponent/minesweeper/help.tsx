import React from "react";
import css_output from "@src/asstes/main.css";
import { LinkStyleSheet } from "jsxp";
import { description, helpPrefix } from "@src/config/plugin";

const th = [
  {
    name: "扫雷",
    desc: "用当前配置开始游戏，默认为简单",
    use: "扫雷",
  },
  {
    name: "扫雷难度<难度等级>",
    desc: "使用预设难度进行游戏，默认预设为：简单、中等、困难",
    use: "扫雷难度 困难",
  },
  {
    name: "翻开<坐标>",
    desc: "翻开指定坐标的格子，可同时输入多个坐标，不区分大小写",
    use: "翻开 A1",
  },
  {
    name: "标记<坐标>",
    desc: "标记指定坐标的格子，可同时输入多个坐标，不区分大小写",
    use: "标记 A1",
  },
  {
    name: "取消标记<坐标>",
    desc: "取消标记指定坐标的格子，可同时输入多个坐标，不区分大小写",
    use: "取消标记 A1",
  },
  {
    name: "结束扫雷",
    desc: "结束当前游戏",
    use: "结束扫雷",
  },
];
/**
 * @param param0
 * @returns
 */
export default function App() {
  return (
    <html>
      <head>
        <LinkStyleSheet src={css_output} />
      </head>
      <body style={{ background: "#CCCCCC" }}>
        <div className="p-8">
          <h1 className="text-center mb-6 font-sans text-2xl">扫雷指令列表</h1>
          <table className="w-full border-collapse overflow-hidden border-4 border-t-white border-l-white border-b-gray-500 border-r-gray-500 ">
            <thead>
              <tr>
                {["指令", "描述", "使用"].map((item, index) => (
                  <th
                    className="border border-gray-500 p-2 tracking-widest font-bold"
                    key={index}
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {th.map((item, index) => (
                <tr
                  key={index}
                  className={`${index % 2 === 0 ? "bg-gray-300" : ""}`}
                >
                  <td className="border border-gray-500 p-2 text-lg font-bold">
                    {item.name}
                  </td>
                  <td className="border border-gray-500 p-2">{item.desc}</td>
                  <td className="border border-gray-500 p-2">
                    {helpPrefix}
                    {item.use}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center">{description}</div>
      </body>
    </html>
  );
}
