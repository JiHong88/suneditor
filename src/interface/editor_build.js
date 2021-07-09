'use strict';

import Editor from './editor';

if (typeof noGlobal === typeof undefined) {
    if (!window.SUNEDITOR_MODULES) {
        Object.defineProperty(window, 'SUNEDITOR_MODULES', {
            enumerable: true,
            writable: false,
            configurable: false,
            value: {}
        });
    }

    Object.defineProperty(window.SUNEDITOR_MODULES, 'interface', {
        enumerable: true,
        writable: false,
        configurable: false,
        value: Editor
    });
}