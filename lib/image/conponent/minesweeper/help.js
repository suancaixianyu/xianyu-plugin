import React from 'react';
import fileUrl from '../../../asstes/main.css.js';
import { helpPrefix, description } from '../../../config/plugin.js';

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
function App() {
    return (React.createElement("html", null,
        React.createElement("head", null,
            React.createElement("link", { rel: "stylesheet", href: fileUrl })),
        React.createElement("body", { style: { background: "#CCCCCC" } },
            React.createElement("div", { className: "p-8" },
                React.createElement("h1", { className: "text-center mb-6 font-sans text-2xl" }, "\u626B\u96F7\u6307\u4EE4\u5217\u8868"),
                React.createElement("table", { className: "w-full border-collapse overflow-hidden border-4 border-t-white border-l-white border-b-gray-500 border-r-gray-500 " },
                    React.createElement("thead", null,
                        React.createElement("tr", null, ["指令", "描述", "使用"].map((item, index) => (React.createElement("th", { className: "border border-gray-500 p-2 tracking-widest font-bold", key: index }, item))))),
                    React.createElement("tbody", null, th.map((item, index) => (React.createElement("tr", { key: index, className: `${index % 2 === 0 ? "bg-gray-300" : ""}` },
                        React.createElement("td", { className: "border border-gray-500 p-2 text-lg font-bold" }, item.name),
                        React.createElement("td", { className: "border border-gray-500 p-2" }, item.desc),
                        React.createElement("td", { className: "border border-gray-500 p-2" },
                            helpPrefix,
                            item.use))))))),
            React.createElement("div", { className: "flex justify-center" }, description))));
}

export { App as default };
