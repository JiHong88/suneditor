/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

import util from './util';

/**
 * @description document create - call _createToolBar()
 * @param {element} element - textarea
 * @param {JSON} options - user options
 * @param {JSON} lang - user language
 * @param {JSON} _plugins - plugins object
 * @returns {JSON}
 * @private
 */
const _Constructor = {
    init: function (element, options, lang, _plugins) {
        if (typeof options !== 'object') options = {};
    
        /** user options */
        options.lang = lang;
        options.stickyToolbar = options.stickyToolbar === undefined ? 0 : (/\d+/.test(options.stickyToolbar) ? options.stickyToolbar.toString().match(/\d+/)[0] * 1 : -1);
        options.resizingBar = options.resizingBar === undefined ? true : options.resizingBar;
        options.showPathLabel = typeof options.showPathLabel === 'boolean' ? options.showPathLabel : true;
        options.popupDisplay = options.popupDisplay || 'full';
        options.display = options.display || (element.style.display === 'none' || !element.style.display ? 'block' : element.style.display);
        options.width = options.width ? (/^\d+$/.test(options.width) ? options.width + 'px' : options.width) : (element.clientWidth ? element.clientWidth + 'px' : '100%');
        options.height = options.height ? (/^\d+$/.test(options.height) ? options.height + 'px' : options.height) : (element.clientHeight ? element.clientHeight + 'px' : 'auto');
        options.minHeight = (/^\d+$/.test(options.minHeight) ? options.height + 'px' : options.minHeight) || '';
        options.maxHeight = (/^\d+$/.test(options.maxHeight) ? options.maxHeight + 'px' : options.maxHeight) || '';
        options.font = options.font || null;
        options.fontSize = options.fontSize || null;
        options.colorList = options.colorList || null;
        options.imageResizing = options.imageResizing === undefined ? true : options.imageResizing;
        options.imageWidth = options.imageWidth || 'auto';
        options.imageFileInput = options.imageFileInput === undefined ? true : options.imageFileInput;
        options.imageUrlInput = (options.imageUrlInput === undefined || !options.imageFileInput) ? true : options.imageUrlInput;
        options.imageUploadUrl = options.imageUploadUrl || null;
        options.videoResizing = options.videoResizing === undefined ? true : options.videoResizing;
        options.videoWidth = options.videoWidth || 560;
        options.videoHeight = options.videoHeight || 315;
        options.buttonList = options.buttonList || [
            ['undo', 'redo'],
            ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
            ['removeFormat'],
            ['indent', 'outdent'],
            ['fullScreen', 'showBlocks', 'codeView'],
            ['preview', 'print']
        ];
    
        const doc = document;
    
        /** suneditor div */
        const top_div = doc.createElement('DIV');
        top_div.className = 'sun-editor';
        if (element.id) top_div.id = 'suneditor_' + element.id;
        top_div.style.width = options.width;
        top_div.style.display = options.display;
    
        /** relative div */
        const relative = doc.createElement('DIV');
        relative.className = 'sun-editor-container';
    
        /** toolbar */
        const tool_bar = this._createToolBar(doc, options.buttonList, _plugins, lang);

        /** sticky toolbar dummy */
        const sticky_dummy = doc.createElement('DIV');
        sticky_dummy.className = 'sun-editor-sticky-dummy';
    
        /** inner editor div */
        const editor_div = doc.createElement('DIV');
        editor_div.className = 'sun-editor-id-editorArea';
    
        /** wysiwyg div */
        const wysiwyg_div = doc.createElement('DIV');
        wysiwyg_div.setAttribute('contenteditable', true);
        wysiwyg_div.setAttribute('scrolling', 'auto');
        wysiwyg_div.className = 'input_editor sun-editor-id-wysiwyg sun-editor-editable';
        wysiwyg_div.style.display = 'block';
        wysiwyg_div.innerHTML = util.convertContentsForEditor(element.value);
        wysiwyg_div.style.height = options.height;
        wysiwyg_div.style.minHeight = options.minHeight;
        wysiwyg_div.style.maxHeight = options.maxHeight;
    
        /** textarea for code view */
        const textarea = doc.createElement('TEXTAREA');
        textarea.className = 'input_editor sun-editor-id-code';
        textarea.style.display = 'none';
        textarea.style.height = options.height;
        textarea.style.minHeight = options.minHeight;
        textarea.style.maxHeight = options.maxHeight;
    
        /** resize bar */
        let resizing_bar = null;
        if (options.resizingBar) {
            resizing_bar = doc.createElement('DIV');
            resizing_bar.className = 'sun-editor-id-resizingBar sun-editor-common';
        }
    
        /** navigation */
        const navigation = doc.createElement('SPAN');
        navigation.className = 'sun-editor-id-navigation sun-editor-common';
    
        /** loading box */
        const loading_box = doc.createElement('DIV');
        loading_box.className = 'sun-editor-id-loading sun-editor-common';
        loading_box.innerHTML = '<div class="loading-effect"></div>';
    
        /** resize operation background */
        const resize_back = doc.createElement('DIV');
        resize_back.className = 'sun-editor-id-resize-background';
    
        /** append html */
        editor_div.appendChild(wysiwyg_div);
        editor_div.appendChild(textarea);
        relative.appendChild(tool_bar.element);
        relative.appendChild(sticky_dummy);
        relative.appendChild(editor_div);
        relative.appendChild(resize_back);
        relative.appendChild(loading_box);

        if (resizing_bar) {
            resizing_bar.appendChild(navigation);
            relative.appendChild(resizing_bar);
        }
        
        top_div.appendChild(relative);
    
        return {
            constructed: {
                _top: top_div,
                _relative: relative,
                _toolBar: tool_bar.element,
                _editorArea: editor_div,
                _wysiwygArea: wysiwyg_div,
                _codeArea: textarea,
                _resizingBar: resizing_bar,
                _navigation: navigation,
                _loading: loading_box,
                _resizeBack: resize_back,
                _stickyDummy: sticky_dummy
            },
            options: options,
            plugins: tool_bar.plugins
        };
    },

    /**
     * @description Suneditor's Default button list
     * @private
     */
    _defaultButtons: function (lang) {
        return {
            /** command */
            bold: ['sun-editor-id-bold', lang.toolbar.bold + '(Ctrl+B)', 'bold', '',
                '<div class="icon-bold"></div>'
            ],

            underline: ['sun-editor-id-underline', lang.toolbar.underline + '(Ctrl+U)', 'underline', '',
                '<div class="icon-underline"></div>'
            ],

            italic: ['sun-editor-id-italic', lang.toolbar.italic + '(Ctrl+I)', 'italic', '',
                '<div class="icon-italic"></div>'
            ],

            strike: ['sun-editor-id-strike', lang.toolbar.strike + '(Ctrl+SHIFT+S)', 'strikethrough', '',
                '<div class="icon-strokethrough"></div>'
            ],

            subscript: ['sun-editor-id-subscript', lang.toolbar.subscript, 'subscript', '',
                '<div class="icon-subscript"></div>'
            ],

            superscript: ['sun-editor-id-superscript', lang.toolbar.superscript, 'superscript', '',
                '<div class="icon-superscript"></div>'
            ],

            removeFormat: ['', lang.toolbar.removeFormat, 'removeFormat', '',
                '<div class="icon-erase"></div>'
            ],

            indent: ['', lang.toolbar.indent + '(Ctrl + ])', 'indent', '',
                '<div class="icon-indent-right"></div>'
            ],

            outdent: ['', lang.toolbar.outdent + '(Ctrl + [)', 'outdent', '',
                '<div class="icon-indent-left"></div>'
            ],

            fullScreen: ['code-view-enabled', lang.toolbar.fullScreen, 'fullScreen', '',
                '<div class="icon-expansion"></div>'
            ],

            showBlocks: ['', lang.toolbar.showBlocks, 'showBlocks', '',
                '<div class="icon-showBlocks"></div>'
            ],

            codeView: ['code-view-enabled', lang.toolbar.codeView, 'codeView', '',
                '<div class="icon-code-view"></div>'
            ],

            undo: ['code-view-enabled', lang.toolbar.undo + ' (Ctrl+Z)', 'undo', '',
                '<div class="icon-undo"></div>'
            ],

            redo: ['code-view-enabled', lang.toolbar.redo + ' (Ctrl+Y)', 'redo', '',
                '<div class="icon-redo"></div>'
            ],

            preview: ['', lang.toolbar.preview, 'preview', '',
                '<div class="icon-preview"></div>'
            ],

            print: ['', lang.toolbar.print, 'print', '',
                '<div class="icon-print"></div>'
            ],

            /** plugins - submenu */
            font: ['btn_font', lang.toolbar.font, 'font', 'submenu',
                '<span class="txt sun-editor-font-family">' + lang.toolbar.font + '</span><span class="icon-arrow-down"></span>'
            ],
            formatBlock: ['btn_format', lang.toolbar.formats, 'formatBlock', 'submenu',
                '<span class="txt sun-editor-font-format">' + lang.toolbar.formats + '</span><span class="icon-arrow-down"></span>'
            ],

            fontSize: ['btn_size', lang.toolbar.fontSize, 'fontSize', 'submenu',
                '<span class="txt sun-editor-font-size">' + lang.toolbar.fontSize + '</span><span class="icon-arrow-down"></span>'
            ],

            fontColor: ['', lang.toolbar.fontColor, 'fontColor', 'submenu',
                '<div class="icon-fontColor"></div>'
            ],

            hiliteColor: ['', lang.toolbar.hiliteColor, 'hiliteColor', 'submenu',
                '<div class="icon-hiliteColor"></div>'
            ],

            align: ['btn_align', lang.toolbar.align, 'align', 'submenu',
                '<div class="icon-align-left"></div>'
            ],

            list: ['', lang.toolbar.list, 'list', 'submenu',
                '<div class="icon-list-number"></div>'
            ],

            horizontalRule: ['btn_line', lang.toolbar.horizontalRule, 'horizontalRule', 'submenu',
                '<div class="icon-hr"></div>'
            ],

            table: ['', lang.toolbar.table, 'table', 'submenu',
                '<div class="icon-grid"></div>'
            ],

            /** plugins - dialog */
            link: ['', lang.toolbar.link, 'link', 'dialog',
                '<div class="icon-link"></div>'
            ],

            image: ['', lang.toolbar.image, 'image', 'dialog',
                '<div class="icon-image"></div>'
            ],

            video: ['', lang.toolbar.video, 'video', 'dialog',
                '<div class="icon-video"></div>'
            ]
        };
    },

    /**
     * @description Create a group div containing each module
     * @returns {Element}
     * @private
     */
    _createModuleGroup: function (oneModule) {
        const oDiv = document.createElement('DIV');
        oDiv.className = 'tool_module' + (oneModule ? '' : ' sun-editor-module-border');

        const oUl = document.createElement('UL');
        oUl.className = 'editor_tool';
        oDiv.appendChild(oUl);

        return {
            'div': oDiv,
            'ul': oUl
        };
    },

    /**
     * @description Create a button element
     * @param {string} buttonClass - className in button
     * @param {string} title - Title in button
     * @param {string} dataCommand - The data-command property of the button
     * @param {string} dataDisplay - The data-display property of the button ('dialog', 'submenu')
     * @param {string} innerHTML - Html in button
     * @returns {Element}
     * @private
     */
    _createButton: function (buttonClass, title, dataCommand, dataDisplay, innerHTML) {
        const oLi = document.createElement('LI');
        const oButton = document.createElement('BUTTON');

        oButton.setAttribute('type', 'button');
        oButton.setAttribute('class', 'btn_editor ' + buttonClass);
        oButton.setAttribute('title', title);
        oButton.setAttribute('data-command', dataCommand);
        oButton.setAttribute('data-display', dataDisplay);
        oButton.innerHTML = innerHTML;
        oLi.appendChild(oButton);

        return {
            'li': oLi,
            'button': oButton
        };
    },

    /**
     * @description Create editor HTML
     * @param {Array} doc - document object
     * @param {Array} buttonList - option.buttonList
     * @param {Array} lang - option.lang
     * @private
     */
    _createToolBar: function (doc, buttonList, _plugins, lang) {
        const separator_vertical = doc.createElement('DIV');
        separator_vertical.className = 'sun-editor-toolbar-separator-vertical';

        const tool_bar = doc.createElement('DIV');
        tool_bar.className = 'sun-editor-id-toolbar sun-editor-common';

        /** create button list */
        const defaultButtonList = this._defaultButtons(lang);
        const plugins = {};
        if (_plugins) {
            const pluginsValues = _plugins.length ? _plugins : Object.keys(_plugins).map(function(e) { return _plugins[e]; });
            for (let i = 0, len = pluginsValues.length; i < len; i++) {
                plugins[pluginsValues[i].name] = pluginsValues[i];
            }
        }

        let module = null;
        let button = null;
        let moduleElement = null;
        let buttonElement = null;
        let pluginName = '';
        let vertical = false;
        const oneModule = buttonList.length === 1;

        for (let i = 0; i < buttonList.length; i++) {

            const buttonGroup = buttonList[i];
            moduleElement = this._createModuleGroup(oneModule);

            /** button object */
            if (typeof buttonGroup === 'object') {
                for (let j = 0; j < buttonGroup.length; j++) {

                    button = buttonGroup[j];
                    if (typeof button === 'object') {
                        if (typeof button.add === 'function') {
                            pluginName = button.name;
                            module = defaultButtonList[pluginName];
                            plugins[pluginName] = button;
                        } else {
                            pluginName = button.name;
                            module = [button.className, button.title, button.dataCommand, button.dataDisplay, button.displayOption, button.innerHTML];
                        }
                    } else {
                        module = defaultButtonList[button];
                        pluginName = button;
                    }

                    buttonElement = this._createButton(module[0], module[1], module[2], module[3], module[4]);
                    moduleElement.ul.appendChild(buttonElement.li);

                    if (plugins[pluginName]) {
                        plugins[pluginName].buttonElement = buttonElement.button;
                    }
                }

                if (vertical) tool_bar.appendChild(separator_vertical.cloneNode(false));
                tool_bar.appendChild(moduleElement.div);
                vertical = true;
            }
            /** line break  */
            else if (/^\/$/.test(buttonGroup)) {
                const enterDiv = doc.createElement('DIV');
                enterDiv.className = 'tool_module_enter';
                tool_bar.appendChild(enterDiv);
                vertical = false;
            }
        }

        const tool_cover = doc.createElement('DIV');
        tool_cover.className = 'sun-editor-id-toolbar-cover';
        tool_bar.appendChild(tool_cover);

        return {
            'element': tool_bar,
            'plugins': plugins
        };
    }
};

export default _Constructor;