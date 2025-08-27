import React from 'react';
import fileUrl from '../../asstes/main.css.js';
import { LinkStyleSheet } from 'jsxp';

function Html({ children }) {
    return (React.createElement("html", null,
        React.createElement("head", null,
            React.createElement(LinkStyleSheet, { src: fileUrl })),
        React.createElement("body", null, children)));
}

export { Html as default };
