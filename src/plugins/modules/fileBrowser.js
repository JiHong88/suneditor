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
    const fileBrowser = {
        name: 'fileBrowser',
        /**
         * @description Constructor
         * @param {Object} core Core object 
         */
        add: function (core) {
            const context = core.context;
            context.fileBrowser = {
                _closeSignal: false
            };

            /** fileBrowser */
            let browser_div = core.util.createElement('DIV');
            browser_div.className = 'se-file-browser sun-editor-common';

            let back = core.util.createElement('DIV');
            back.className = 'se-file-browser-back';

            let content = core.util.createElement('DIV');
            content.className = 'se-file-browser-inner';
            content.innerHTML = this.set_browser(core);

            browser_div.appendChild(back);
            browser_div.appendChild(content);

            context.fileBrowser.area = browser_div;
            context.fileBrowser.header = content.querySelector('.se-file-browser-header');
            context.fileBrowser.body = content.querySelector('.se-file-browser-body');
            context.fileBrowser.list = content.querySelector('.se-file-browser-list');
            context.fileBrowser.tags = content.querySelector('.se-file-browser-tags');

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

            return '<div class="se-file-browser-content">' +
                    '<div class="se-file-browser-header">' +
                        '<button type="button" data-command="close" class="se-btn se-file-browser-close" class="close" aria-label="Close" title="' + lang.dialogBox.close + '">' +
                        core.icons.cancel +
                        '</button>' +
                        '<span class="se-file-browser-title">' + lang.toolbar.imageGallery + '</span>' +
                        '<div class="se-file-browser-tags"><a>aaa</a><a>bbb</a><a>ccc</a><a>ddd</a></div>' +
                    '</div>' +
                    '<div class="se-file-browser-body">' +
                        '<div class="se-file-browser-list"></div>' +
                    '</div>' +
                '</div>';
        },

        /**
         * @description Event to control the behavior of closing the browser
         * @param {MouseEvent} e Event object
         * @private
         */
        _onMouseDown_browser: function (e) {
            if (/se-file-browser-inner/.test(e.target.className)) {
                this.context.fileBrowser._closeSignal = true;
            } else {
                this.context.fileBrowser._closeSignal = false;
            }
        },

        /**
         * @description Event to close the window when the outside area of the browser or close button is click
         * @param {MouseEvent} e Event object
         * @private
         */
        _onClick_browser: function (e) {
            e.stopPropagation();

            if (/close/.test(e.target.getAttribute('data-command')) || this.context.fileBrowser._closeSignal) {
                this.plugins.fileBrowser.close.call(this);
            }
        },

        /**
         * @description Open a browser plugin
         * @param {String} styles browser style
         */
        open: function (listClassName)  {
            if (this.plugins.fileBrowser._bindClose) {
                this._d.removeEventListener('keydown', this.plugins.fileBrowser._bindClose);
                this.plugins.fileBrowser._bindClose = null;
            }

            this.plugins.fileBrowser.drawFileList.call(this);

            this.plugins.fileBrowser._bindClose = function (e) {
                if (!/27/.test(e.keyCode)) return;
                this.plugins.fileBrowser.close.call(this);
            }.bind(this);
            this._d.addEventListener('keydown', this.plugins.fileBrowser._bindClose);

            if (!this.util.hasClass(this.context.fileBrowser.list, listClassName)) {
                this.context.fileBrowser.list.className = 'se-file-browser-list ' + listClassName;
            }

            if (this.context.option.popupDisplay === 'full') {
                this.context.fileBrowser.area.style.position = 'fixed';
            } else {
                this.context.fileBrowser.area.style.position = 'absolute';
            }

            this.context.fileBrowser.area.style.visibility = 'hidden';
            this.context.fileBrowser.area.style.display = 'block';
            this.context.fileBrowser.body.style.height = (this._w.innerHeight - this.context.fileBrowser.header.offsetHeight - 40) + 'px';
            this.context.fileBrowser.area.style.visibility = '';
        },

        _bindClose: null,
        
        /**
         * @description Close a fileBrowser plugin
         * The plugin's "init" method is called.
         */
        close: function () {
            if (this.plugins.fileBrowser._bindClose) {
                this._d.removeEventListener('keydown', this.plugins.fileBrowser._bindClose);
                this.plugins.fileBrowser._bindClose = null;
            }

            this.context.fileBrowser.area.style.display = 'none';
        },

        drawFileList: function () {
            const temp = [
                {
                    src: 'http://suneditor.com/docs/cat.jpg',
                    tag: 'tag'
                },
                {
                    src: 'http://suneditor.com/docs/cat2.jpg',
                    tag: 'tag-2'
                },
                {
                    src: 'http://suneditor.com/docs/cat.jpg',
                    tag: 'tag'
                },
                {
                    src: 'http://suneditor.com/docs/cat1.jpg',
                    tag: 'tag-1'
                },
                {
                    src: 'http://suneditor.com/docs/cat.jpg',
                    tag: 'tag'
                },
                {
                    src: 'http://suneditor.com/docs/cat1.jpg',
                    tag: 'tag-1'
                },
                {
                    src: 'http://suneditor.com/docs/cat1.jpg',
                    tag: 'tag-1'
                },
                {
                    src: 'http://suneditor.com/docs/cat2.jpg',
                    tag: 'tag-2'
                },
                {
                    src: 'http://suneditor.com/docs/cat2.jpg',
                    tag: 'tag-2'
                },
                {
                    src: 'http://suneditor.com/docs/cat2.jpg',
                    tag: 'tag-2'
                },
                {
                    src: 'http://suneditor.com/docs/cat2.jpg',
                    tag: 'tag-2'
                },
                {
                    src: 'http://suneditor.com/docs/cat2.jpg',
                    tag: 'tag-2'
                },
                {
                    src: 'http://suneditor.com/docs/cat2.jpg',
                    tag: 'tag-2'
                },
                {
                    src: 'http://suneditor.com/docs/cat2.jpg',
                    tag: 'tag-2'
                },
            ];

            this.plugins.fileBrowser._tags = [];
            const html = this.plugins.fileBrowser._drawListItem(temp);
            this.context.fileBrowser.list.innerHTML = html;
        },

        _drawListItem: function (items) {
            const len = items.length;
            const splitSize = Math.round(len/3) || 1;
            
            let html = '';//'<div class="se-file-item-column">';
            let columns = 1;
            for (let i = 0, item; i < len; i++) {
                item = items[i];
                html += '<div class="se-file-item-img"><img src="' + item.src + '"></div>';
                // if ((i + 1) % splitSize === 0 && columns < 3) {
                //     columns++;
                //     html += '</div><div class="se-file-item-column">'
                // }

                if (item.tag && this._tags.indexOf(item.tag) === -1) {
                    this._tags.push(item.tag);
                }
            }
            // html += '</div>';

            return html;
        },

        _tags: []
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

        Object.defineProperty(window.SUNEDITOR_MODULES, 'fileBrowser', {
            enumerable: true,
            writable: false,
            configurable: false,
            value: fileBrowser
        });
    }

    return fileBrowser;
}));