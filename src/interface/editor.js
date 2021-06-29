/*
 * suneditor.js
 * Copyright JiHong Lee.
 * MIT license.
 */
'use strict';

(function (global, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = global.document ?
            factory(global, true) :
            function (w) {
                if (!w.document) {
                    throw new Error('SUNEDITOR a window with a document');
                }
                return factory(w);
            };
    } else {
        factory(global);
    }
}(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
    function Editor(editor) {
		// // import CoreInterface from "./_core";
		// CoreInterface.call(this, editor);
		this.editor = core;
		this._w = core._w;
		this._d = core._d;
		this.plugins = core.plugins;
		this.status = core.status;
		this.options = core.options;
		this.context = core.context;
		this.history = core.history;
		this.util = core.util;
	
		// classes
		this.char = editor.char;
		this.component = editor.component;
		this.events = editor.events;
		this.format = editor.format;
		this.node = editor.node;
		this.notice = editor.notice;
		this.selection = editor.selection;
		this.shortcuts = editor.shortcuts;
		this.toolbar = editor.toolbar;
	}

    if (typeof noGlobal === typeof undefined) {
        if (!window.SUNEDITOR) {
            Object.defineProperty(window, 'SUNEDITOR_MODULES', {
                enumerable: true,
                writable: false,
                configurable: false,
                value: {}
            });
        }

        Object.defineProperty(window.SUNEDITOR, 'interface', {
            enumerable: true,
            writable: false,
            configurable: false,
            value: Editor
        });
    }

    return Editor;
}));
