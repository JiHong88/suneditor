/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

(function (global, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = global.document ?
            factory(global, true) :
            function (w) {
                if (!w.document) {
                    throw new Error('SUNEDITOR_MODULES a window with a document');
                }
                return factory(w);
            };
    } else {
        factory(global);
    }
}(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
    const browser = {
        name: 'browser',
        /**
         * @description Constructor
         * @param {Object} core Core object 
         */
        add: function (core) {
            const context = core.context;
            context.browser = {
                _closeSignal: false
            };

            /** browser */
            let browser_div = core.util.createElement('DIV');
            browser_div.className = 'se-browser sun-editor-common';

            let back = core.util.createElement('DIV');
            back.className = 'se-browser-back';

            let content = core.util.createElement('DIV');
            content.className = 'se-browser-inner';
            content.innerHTML = this.set_browser(core);

            browser_div.appendChild(back);
            browser_div.appendChild(content);

            context.browser.area = browser_div;
            context.browser.list = content.querySelector('.se-browser-lis');
            context.browser.tags = content.querySelector('.se-browser-tags');

            /** add event listeners */
            content.addEventListener('mousedown', this._onMouseDown_browser.bind(core));
            content.addEventListener('click', this._onClick_browser.bind(core));
            
            /** append html */
            context.element.relative.appendChild(browser_div);
            
            /** empty memory */
            browser_div = null, back = null, content = null;
        },

        set_browser: function (core) {
            const lang = core.lang;

            return '<div class="se-browser-content">' +
                    '<div class="se-browser-header">' +
                        '<button type="button" data-command="close" class="se-btn se-browser-close" class="close" aria-label="Close" title="' + lang.dialogBox.close + '">' +
                        core.icons.cancel +
                        '</button>' +
                        '<span class="se-browser-title">' + lang.toolbar.imageGallery + '</span>' +
                        '<div class="se-browser-tags"><a>aaa</a><a>bbb</a><a>ccc</a><a>ddd</a></div>' +
                    '</div>' +
                    '<div class="se-browser-body">' +
                        '<div class="se-browser-list"></div>' +
                    '</div>' +
                '</div>';
        },

        /**
         * @description Event to control the behavior of closing the browser
         * @param {MouseEvent} e Event object
         * @private
         */
        _onMouseDown_browser: function (e) {
            if (/se-browser-inner/.test(e.target.className)) {
                this.context.browser._closeSignal = true;
            } else {
                this.context.browser._closeSignal = false;
            }
        },

        /**
         * @description Event to close the window when the outside area of the browser or close button is click
         * @param {MouseEvent} e Event object
         * @private
         */
        _onClick_browser: function (e) {
            e.stopPropagation();

            if (/close/.test(e.target.getAttribute('data-command')) || this.context.browser._closeSignal) {
                this.plugins.browser.close.call(this);
            }
        },

        /**
         * @description Open a browser plugin
         * @param {String} styles browser style
         */
        open: function (styles)  {
            if (this.plugins.browser._bindClose) {
                this._d.removeEventListener('keydown', this.plugins.browser._bindClose);
                this.plugins.browser._bindClose = null;
            }

            this.plugins.browser._bindClose = function (e) {
                if (!/27/.test(e.keyCode)) return;
                this.plugins.browser.close.call(this);
            }.bind(this);
            this._d.addEventListener('keydown', this.plugins.browser._bindClose);

            if (this.context.option.popupDisplay === 'full') {
                this.context.browser.area.style.position = 'fixed';
            } else {
                this.context.browser.area.style.position = 'absolute';
            }

            this.context.browser.area.style.display = 'block';
        },

        _bindClose: null,
        
        /**
         * @description Close a browser plugin
         * The plugin's "init" method is called.
         */
        close: function () {
            if (this.plugins.browser._bindClose) {
                this._d.removeEventListener('keydown', this.plugins.browser._bindClose);
                this.plugins.browser._bindClose = null;
            }

            this.context.browser.area.style.display = 'none';
        }
    };

    if (typeof noGlobal === typeof undefined) {
        if (!window.SUNEDITOR_MODULES) {
            Object.defineProperty(window, 'SUNEDITOR_MODULES', {
                enumerable: true,
                writable: false,
                configurable: false,
                value: {}
            });
        }

        Object.defineProperty(window.SUNEDITOR_MODULES, 'browser', {
            enumerable: true,
            writable: false,
            configurable: false,
            value: browser
        });
    }

    return browser;
}));