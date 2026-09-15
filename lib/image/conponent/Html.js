import fileUrl from "../../_virtual/_lvy-css_0.js";
import React from "react";

//#region src/image/conponent/Html.tsx
function Html({ children }) {
	return /* @__PURE__ */ React.createElement("html", null, /* @__PURE__ */ React.createElement("head", null, /* @__PURE__ */ React.createElement("link", {
		rel: "stylesheet",
		href: fileUrl
	})), /* @__PURE__ */ React.createElement("body", null, children));
}

//#endregion
export { Html as default };