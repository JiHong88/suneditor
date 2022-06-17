'use strict';

import './assets/suneditor.css';
import './assets/suneditor-content.css';

import plugins from './plugins';
import suneditor from './suneditor';

// classes
import colorPicker from './class/colorPicker';

if (!window.SUNEDITOR) {
    Object.defineProperty(window, 'SUNEDITOR', {
        enumerable: true,
        writable: false,
        configurable: false,
        value: suneditor.init({
            plugins: plugins
        })
    });
}

if (!window.SUNEDITOR_CLASS) {
    Object.defineProperty(window, 'SUNEDITOR_CLASS', {
        enumerable: true,
        writable: false,
        configurable: false,
        value: {}
    });
}

Object.defineProperty(window.SUNEDITOR_CLASS, 'colorPicker', {
    enumerable: true,
    writable: false,
    configurable: false,
    value: colorPicker
});