'use strict';

import Editor from './editor';

if (typeof noGlobal === typeof undefined) {
    if (!window.SUNEDITOR_INTERFACE) {
        Object.defineProperty(window, 'SUNEDITOR_INTERFACE', {
            enumerable: true,
            writable: false,
            configurable: false,
            value: {}
        });
    }

    Object.defineProperty(window.SUNEDITOR_INTERFACE, 'interface', {
        enumerable: true,
        writable: false,
        configurable: false,
        value: Editor
    });
}