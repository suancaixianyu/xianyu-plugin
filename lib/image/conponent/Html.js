import React from 'react';
import fileUrl from '../../asstes/main.css.js';

function Html({ children }) {
    return (React.createElement("html", null,
        React.createElement("head", null,
            React.createElement("link", { rel: "stylesheet", href: fileUrl })),
        React.createElement("body", null, children)));
}

export { Html as default };
