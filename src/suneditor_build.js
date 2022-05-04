"use strict";

import "./assets/suneditor.css";
import "./assets/suneditor-content.css";

import plugins from "./plugins";
import suneditor from "./suneditor";

if (!window.SUNEDITOR) {
    Object.defineProperty(window, "SUNEDITOR", {
        enumerable: true,
        writable: false,
        configurable: false,
        value: suneditor.init({
            plugins: plugins
        })
    });
}