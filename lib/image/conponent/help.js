import React from 'react';
import { BackgroundImage } from 'jsxp';
import fileUrl from '../../asstes/alemonjs.png.js';
import Html from './Html.js';

/**
 * @param param0
 * @returns
 */
function App({ data, theme }) {
    return (React.createElement(Html, null,
        React.createElement("section", { id: "root", "data-theme": theme, className: "flex flex-col" },
            React.createElement(BackgroundImage, { className: "min-h-[31rem] w-full h-full flex items-end justify-center", url: fileUrl, size: '100% auto' },
                React.createElement("div", { className: "text-blue-400 text-5xl" }, data)))));
}

export { App as default };
