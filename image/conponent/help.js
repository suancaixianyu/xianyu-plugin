import React from 'react';
import { LinkStyleSheet, BackgroundImage } from 'jsxp';
import fileUrl$1 from '../../asstes/alemonjs.png.js';
import fileUrl from '../../asstes/main.css.js';

/**
 * @param param0
 * @returns
 */
function App({ data, theme }) {
    return (React.createElement("html", null,
        React.createElement("head", null,
            React.createElement(LinkStyleSheet, { src: fileUrl })),
        React.createElement("body", null,
            React.createElement("section", { id: "root", "data-theme": theme, className: "flex flex-col" },
                React.createElement(BackgroundImage, { className: "min-h-[31rem] w-full h-full flex items-end justify-center", url: fileUrl$1, size: '100% auto' },
                    React.createElement("div", { className: "text-blue-400 text-5xl" }, data))))));
}

export { App as default };
