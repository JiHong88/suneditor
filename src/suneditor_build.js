'use strict';

import './assets/css/suneditor.css';
import './assets/css/suneditor-contents.css';

import plugins from './plugins';
import suneditor from './suneditor';

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