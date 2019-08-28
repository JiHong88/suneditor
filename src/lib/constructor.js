/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

import _defaultLang from '../lang/en';
import util from './util';


export default {
    /**
     * @description document create - call _createToolBar()
     * @param {element} element Textarea
     * @param {Object} options Options
     * @returns {Object}
     */
    init: function (element, options) {
        if (typeof options !== 'object') options = {};

        const doc = document;

        /** --- init options --- */
        this._initOptions(element, options);
    
        // suneditor div
        const top_div = doc.createElement('DIV');
        top_div.className = 'sun-editor';
        if (element.id) top_div.id = 'suneditor_' + element.id;
    
        // relative div
        const relative = doc.createElement('DIV');
        relative.className = 'se-container';
    
        // toolbar
        const tool_bar = this._createToolBar(doc, options.buttonList, options.plugins, options.lang);
        const arrow = doc.createElement('DIV');
        arrow.className = 'se-arrow';

        // sticky toolbar dummy
        const sticky_dummy = doc.createElement('DIV');
        sticky_dummy.className = 'se-toolbar-sticky-dummy';
    
        // inner editor div
        const editor_div = doc.createElement('DIV');
        editor_div.className = 'se-wrapper';
    
        // wysiwyg div
        const wysiwyg_div = doc.createElement('DIV');
        wysiwyg_div.setAttribute('contenteditable', true);
        wysiwyg_div.setAttribute('scrolling', 'auto');
        wysiwyg_div.className = 'se-wrapper-inner se-wrapper-wysiwyg sun-editor-editable';
        wysiwyg_div.style.display = 'block';
        wysiwyg_div.innerHTML = util.convertContentsForEditor(element.value);
    
        // textarea for code view
        const textarea = doc.createElement('TEXTAREA');
        textarea.className = 'se-wrapper-inner se-wrapper-code';
        textarea.style.display = 'none';

        /** --- init elements and create bottom bar --- */
        const bottomBar = this._initElements(options, top_div, tool_bar.element, arrow, wysiwyg_div, textarea);

        // resizing bar
        const resizing_bar = bottomBar.resizingBar;
        const navigation = bottomBar.navigation;
        const char_counter = bottomBar.charCounter;
    
        // loading box
        const loading_box = doc.createElement('DIV');
        loading_box.className = 'se-loading-box sun-editor-common';
        loading_box.innerHTML = '<div class="se-loading-effect"></div>';
    
        // resize operation background
        const resize_back = doc.createElement('DIV');
        resize_back.className = 'se-resizing-back';
    
        /** append html */
        editor_div.appendChild(wysiwyg_div);
        editor_div.appendChild(textarea);
        relative.appendChild(tool_bar.element);
        relative.appendChild(sticky_dummy);
        relative.appendChild(editor_div);
        relative.appendChild(resize_back);
        relative.appendChild(loading_box);
        if (resizing_bar) {
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
                _charCounter: char_counter,
                _loading: loading_box,
                _resizeBack: resize_back,
                _stickyDummy: sticky_dummy,
                _arrow: arrow
            },
            options: options,
            plugins: tool_bar.plugins,
            pluginCallButtons: tool_bar.pluginCallButtons
        };
    },

    /**
     * @description Add or reset options
     * @param {Object} mergeOptions New options property
     * @param {Object} context Context object of core
     * @param {Object} plugins Origin plugins
     * @param {Object} originOptions Origin options
     * @returns {Object} pluginCallButtons
     * @private
     */
    _setOptions: function (mergeOptions, context, plugins, originOptions) {
        this._initOptions(context.element.originElement, mergeOptions);

        const el = context.element;
        const relative = el.relative;
        const isNewToolbar = !!mergeOptions.buttonList || mergeOptions.mode !== originOptions.mode;
        const isNewPlugins = !!mergeOptions.plugins;

        const tool_bar = this._createToolBar(document, (isNewToolbar ? mergeOptions.buttonList : originOptions.buttonList), (isNewPlugins ? mergeOptions.plugins : plugins), mergeOptions.lang);
        const arrow = document.createElement('DIV');
        arrow.className = 'se-arrow';

        if (isNewToolbar) {
            relative.insertBefore(tool_bar.element, el.toolbar);
            relative.removeChild(el.toolbar);
            el.toolbar = tool_bar.element;
            el._arrow = arrow;
        }
        
        const bottomBar = this._initElements(mergeOptions, el.topArea, (isNewToolbar ? tool_bar.element : el.toolbar), arrow, el.wysiwyg, el.code);
        if (el.resizingBar) relative.removeChild(el.resizingBar);
        if (bottomBar.resizingBar) relative.appendChild(bottomBar.resizingBar);
        
        el.resizingBar = bottomBar.resizingBar;
        el.navigation = bottomBar.navigation;
        el.charCounter = bottomBar.charCounter;

        return {
            callButtons: isNewToolbar ? tool_bar.pluginCallButtons : null,
            plugins: isNewToolbar || isNewPlugins ? tool_bar.plugins : null
        };
    },

    /**
     * @description Initialize property of suneditor elements
     * @param {Object} options Options
     * @param {Element} topDiv Suneditor top div
     * @param {Element} toolBar Tool bar
     * @param {Element} toolBarArrow Tool bar arrow (balloon editor)
     * @param {Element} wysiwygDiv WYSIWYG view div
     * @param {Element} textarea Code view textarea
     * @returns {Object} Bottom bar elements (resizingBar, navigation, charCounter)
     * @private
     */
    _initElements: function (options, topDiv, toolBar, toolBarArrow, wysiwygDiv, textarea) {
        /** top div */
        topDiv.style.width = options.width;
        topDiv.style.minWidth = options.minWidth;
        topDiv.style.maxWidth = options.maxWidth;
        topDiv.style.display = options.display;

        /** toolbar */
        if (/inline/i.test(options.mode)) {
            toolBar.className += ' se-toolbar-inline';
            toolBar.style.width = options.toolbarWidth;
        } else if (/balloon/i.test(options.mode)) {
            toolBar.className += ' se-toolbar-balloon';
            toolBar.appendChild(toolBarArrow);
        }

        /** editor */
        wysiwygDiv.style.height = options.height;
        wysiwygDiv.style.minHeight = options.minHeight;
        wysiwygDiv.style.maxHeight = options.maxHeight;

        textarea.style.height = options.height;
        textarea.style.minHeight = options.minHeight;
        textarea.style.maxHeight = options.maxHeight;

        /** resize bar */
        let resizingBar = null;
        let navigation = null;
        let charCounter = null;
        if (options.resizingBar) {
            resizingBar = document.createElement('DIV');
            resizingBar.className = 'se-resizing-bar sun-editor-common';

            /** navigation */
            navigation = document.createElement('DIV');
            navigation.className = 'se-navigation sun-editor-common';
            resizingBar.appendChild(navigation);

            /** char counter */
            if (options.charCounter) {
                const charWrapper = document.createElement('DIV');
                charWrapper.className = 'se-char-counter-wrapper';
    
                charCounter = document.createElement('SPAN');
                charCounter.className = 'se-char-counter';
                charCounter.textContent = '0';
                charWrapper.appendChild(charCounter);
    
                if (options.maxCharCount > 0) {
                    const char_max = document.createElement('SPAN');
                    char_max.textContent = ' / ' + options.maxCharCount;
                    charWrapper.appendChild(char_max);
                }

                resizingBar.appendChild(charWrapper);
            }
        }

        return {
            resizingBar: resizingBar,
            navigation: navigation,
            charCounter: charCounter
        };
    },

    /**
     * @description Initialize options
     * @param {Element} element Options object
     * @param {Object} options Options object
     * @private
     */
    _initOptions: function (element, options) {
        /** user options */
        options.lang = options.lang || _defaultLang;
        // toolbar
        options.mode = options.mode || 'classic'; // classic, inline, balloon
        options.toolbarWidth = options.toolbarWidth ? (/^\d+$/.test(options.toolbarWidth) ? options.toolbarWidth + 'px' : options.toolbarWidth) : 'auto';
        options.stickyToolbar = /balloon/i.test(options.mode) ? -1 : options.stickyToolbar === undefined ? 0 : (/^\d+/.test(options.stickyToolbar) ? options.stickyToolbar.toString().match(/\d+/)[0] * 1 : -1);
        // bottom resizing bar
        options.resizingBar = options.resizingBar === undefined ? (/inline|balloon/i.test(options.mode) ? false : true) : options.resizingBar;
        options.showPathLabel = !options.resizingBar ? false : typeof options.showPathLabel === 'boolean' ? options.showPathLabel : true;
        options.maxCharCount = /^\d+$/.test(options.maxCharCount) && options.maxCharCount > -1 ? options.maxCharCount * 1 : null;
        options.charCounter = options.maxCharCount > 0 ? true : typeof options.charCounter === 'boolean' ? options.charCounter : false;
        // popup, editor display
        options.popupDisplay = options.popupDisplay || 'full';
        options.display = options.display || (element.style.display === 'none' || !element.style.display ? 'block' : element.style.display);
        // size
        options.width = options.width ? (/^\d+$/.test(options.width) ? options.width + 'px' : options.width) : (element.clientWidth ? element.clientWidth + 'px' : '100%');
        options.minWidth = (/^\d+$/.test(options.minWidth) ? options.minWidth + 'px' : options.minWidth) || '';
        options.maxWidth = (/^\d+$/.test(options.maxWidth) ? options.maxWidth + 'px' : options.maxWidth) || '';
        options.height = options.height ? (/^\d+$/.test(options.height) ? options.height + 'px' : options.height) : (element.clientHeight ? element.clientHeight + 'px' : 'auto');
        options.minHeight = (/^\d+$/.test(options.minHeight) ? options.minHeight + 'px' : options.minHeight) || '';
        options.maxHeight = (/^\d+$/.test(options.maxHeight) ? options.maxHeight + 'px' : options.maxHeight) || '';
        // font, size, formats, color list
        options.font = options.font || null;
        options.fontSize = options.fontSize || null;
        options.formats = options.formats || null;
        options.colorList = options.colorList || null;
        // images
        options.imageResizing = options.imageResizing === undefined ? true : options.imageResizing;
        options.imageWidth = options.imageWidth && /\d+/.test(options.imageWidth) ? options.imageWidth.toString().match(/\d+/)[0] : 'auto';
        options.imageFileInput = options.imageFileInput === undefined ? true : options.imageFileInput;
        options.imageUrlInput = (options.imageUrlInput === undefined || !options.imageFileInput) ? true : options.imageUrlInput;
        options.imageUploadHeader = options.imageUploadHeader || null;
        options.imageUploadUrl = options.imageUploadUrl || null;
        options.imageUploadSizeLimit = /\d+/.test(options.imageUploadSizeLimit) ? options.imageUploadSizeLimit.toString().match(/\d+/)[0] * 1 : null;
        // video
        options.videoResizing = options.videoResizing === undefined ? true : options.videoResizing;
        options.videoWidth = options.videoWidth && /\d+/.test(options.videoWidth) ? options.videoWidth.toString().match(/\d+/)[0] : 560;
        options.videoHeight = options.videoHeight && /\d+/.test(options.videoHeight) ? options.videoHeight.toString().match(/\d+/)[0] : 315;
        options.youtubeQuery = (options.youtubeQuery || '').replace('?', '');
        // template
        // options.templates = options.templates;
        // callBack function
        // options.callBackSave = options.callBackSave;
        // buttons
        options.buttonList = options.buttonList || [
            ['undo', 'redo'],
            ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
            ['removeFormat'],
            ['outdent', 'indent'],
            ['fullScreen', 'showBlocks', 'codeView'],
            ['preview', 'print']
        ];
    },

    /**
     * @description Suneditor's Default button list
     * @private
     */
    _defaultButtons: function (lang) {
        return {
            /** command */
            bold: ['_se_command_bold', lang.toolbar.bold + ' (CTRL+B)', 'STRONG', '',
                '<i class="se-icon-bold"></i>'
            ],

            underline: ['_se_command_underline', lang.toolbar.underline + ' (CTRL+U)', 'INS', '',
                '<i class="se-icon-underline"></i>'
            ],

            italic: ['_se_command_italic', lang.toolbar.italic + ' (CTRL+I)', 'EM', '',
                '<i class="se-icon-italic"></i>'
            ],

            strike: ['_se_command_strike', lang.toolbar.strike + ' (CTRL+SHIFT+S)', 'DEL', '',
                '<i class="se-icon-strokethrough"></i>'
            ],

            subscript: ['_se_command_subscript', lang.toolbar.subscript, 'SUB', '',
                '<i class="se-icon-subscript"></i>'
            ],

            superscript: ['_se_command_superscript', lang.toolbar.superscript, 'SUP', '',
                '<i class="se-icon-superscript"></i>'
            ],

            removeFormat: ['', lang.toolbar.removeFormat, 'removeFormat', '',
                '<i class="se-icon-erase"></i>'
            ],

            indent: ['', lang.toolbar.indent + ' (CTRL+])', 'indent', '',
                '<i class="se-icon-indent-right"></i>'
            ],

            outdent: ['_se_command_outdent', lang.toolbar.outdent + ' (CTRL+[)', 'outdent', '',
                '<i class="se-icon-indent-left"></i>'
            ],

            fullScreen: ['code-view-enabled', lang.toolbar.fullScreen, 'fullScreen', '',
                '<i class="se-icon-expansion"></i>'
            ],

            showBlocks: ['', lang.toolbar.showBlocks, 'showBlocks', '',
                '<i class="se-icon-showBlocks"></i>'
            ],

            codeView: ['code-view-enabled', lang.toolbar.codeView, 'codeView', '',
                '<i class="se-icon-code-view"></i>'
            ],

            undo: ['_se_command_undo', lang.toolbar.undo + ' (CTRL+Z)', 'undo', '',
                '<i class="se-icon-undo"></i>', true
            ],

            redo: ['_se_command_redo', lang.toolbar.redo + ' (CTRL+Y / CTRL+SHIFT+Z)', 'redo', '',
                '<i class="se-icon-redo"></i>', true
            ],

            preview: ['', lang.toolbar.preview, 'preview', '',
                '<i class="se-icon-preview"></i>'
            ],

            print: ['', lang.toolbar.print, 'print', '',
                '<i class="se-icon-print"></i>'
            ],

            save: ['_se_command_save', lang.toolbar.save, 'save', '',
                '<i class="se-icon-save"></i>', true
            ],

            /** plugins - submenu */
            font: ['se-btn-select se-btn-tool-font _se_command_font_family', lang.toolbar.font, 'font', 'submenu',
                '<span class="txt">' + lang.toolbar.font + '</span><i class="se-icon-arrow-down"></i>'
            ],
            
            formatBlock: ['se-btn-select se-btn-tool-format', lang.toolbar.formats, 'formatBlock', 'submenu',
                '<span class="txt _se_command_format">' + lang.toolbar.formats + '</span><i class="se-icon-arrow-down"></i>'
            ],

            fontSize: ['se-btn-select se-btn-tool-size', lang.toolbar.fontSize, 'fontSize', 'submenu',
                '<span class="txt _se_command_font_size">' + lang.toolbar.fontSize + '</span><i class="se-icon-arrow-down"></i>'
            ],

            fontColor: ['', lang.toolbar.fontColor, 'fontColor', 'submenu',
                '<i class="se-icon-fontColor"></i>'
            ],

            hiliteColor: ['', lang.toolbar.hiliteColor, 'hiliteColor', 'submenu',
                '<i class="se-icon-hiliteColor"></i>'
            ],

            align: ['se-btn-align', lang.toolbar.align, 'align', 'submenu',
                '<i class="se-icon-align-left _se_command_align"></i>'
            ],

            list: ['_se_command_list', lang.toolbar.list, 'list', 'submenu',
                '<i class="se-icon-list-number"></i>'
            ],

            horizontalRule: ['btn_line', lang.toolbar.horizontalRule, 'horizontalRule', 'submenu',
                '<i class="se-icon-hr"></i>'
            ],

            table: ['', lang.toolbar.table, 'table', 'submenu',
                '<i class="se-icon-grid"></i>'
            ],

            template: ['', lang.toolbar.template, 'template', 'submenu',
                '<i class="se-icon-template"></i>'
            ],

            /** plugins - dialog */
            link: ['', lang.toolbar.link, 'link', 'dialog',
                '<i class="se-icon-link"></i>'
            ],

            image: ['', lang.toolbar.image, 'image', 'dialog',
                '<i class="se-icon-image"></i>'
            ],

            video: ['', lang.toolbar.video, 'video', 'dialog',
                '<i class="se-icon-video"></i>'
            ]
        };
    },

    /**
     * @description Create a group div containing each module
     * @returns {Element}
     * @private
     */
    _createModuleGroup: function (oneModule) {
        const oDiv = util.createElement('DIV');
        oDiv.className = 'se-btn-module' + (oneModule ? '' : ' se-btn-module-border');

        const oUl = util.createElement('UL');
        oUl.className = 'se-menu-list';
        oDiv.appendChild(oUl);

        return {
            'div': oDiv,
            'ul': oUl
        };
    },

    /**
     * @description Create a button element
     * @param {string} buttonClass className in button
     * @param {string} title Title in button
     * @param {string} dataCommand The data-command property of the button
     * @param {string} dataDisplay The data-display property of the button ('dialog', 'submenu')
     * @param {string} innerHTML Html in button
     * @param {string} _disabled Button disabled
     * @returns {Element}
     * @private
     */
    _createButton: function (buttonClass, title, dataCommand, dataDisplay, innerHTML, _disabled) {
        const oLi = util.createElement('LI');
        const oButton = util.createElement('BUTTON');

        oButton.setAttribute('type', 'button');
        oButton.setAttribute('class', 'se-btn' + (buttonClass ? ' ' + buttonClass : '') + ' se-tooltip');
        oButton.setAttribute('data-command', dataCommand);
        oButton.setAttribute('data-display', dataDisplay);
        innerHTML += '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + title + '</span></span>';

        if (_disabled) oButton.setAttribute('disabled', true);
        
        oButton.innerHTML = innerHTML;
        oLi.appendChild(oButton);

        return {
            'li': oLi,
            'button': oButton
        };
    },

    /**
     * @description Create editor HTML
     * @param {Array} doc document object
     * @param {Array} buttonList option.buttonList
     * @param {Array} lang option.lang
     * @private
     */
    _createToolBar: function (doc, buttonList, _plugins, lang) {
        const separator_vertical = doc.createElement('DIV');
        separator_vertical.className = 'se-toolbar-separator-vertical';

        const tool_bar = doc.createElement('DIV');
        tool_bar.className = 'se-toolbar sun-editor-common';

        /** create button list */
        const defaultButtonList = this._defaultButtons(lang);
        const pluginCallButtons = {};
        const plugins = {};
        if (_plugins) {
            const pluginsValues = _plugins.length ? _plugins : Object.keys(_plugins).map(function(name) { return _plugins[name]; });
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
                            module = [button.buttonClass, button.title, button.dataCommand, button.dataDisplay, button.innerHTML];
                        }
                    } else {
                        module = defaultButtonList[button];
                        pluginName = button;
                    }

                    buttonElement = this._createButton(module[0], module[1], module[2], module[3], module[4], module[5]);
                    moduleElement.ul.appendChild(buttonElement.li);

                    if (plugins[pluginName]) {
                        pluginCallButtons[pluginName] = buttonElement.button;
                    }
                }

                if (vertical) tool_bar.appendChild(separator_vertical.cloneNode(false));
                tool_bar.appendChild(moduleElement.div);
                vertical = true;
            }
            /** line break  */
            else if (/^\/$/.test(buttonGroup)) {
                const enterDiv = doc.createElement('DIV');
                enterDiv.className = 'se-btn-module-enter';
                tool_bar.appendChild(enterDiv);
                vertical = false;
            }
        }

        const tool_cover = doc.createElement('DIV');
        tool_cover.className = 'se-toolbar-cover';
        tool_bar.appendChild(tool_cover);

        return {
            'element': tool_bar,
            'plugins': plugins,
            'pluginCallButtons': pluginCallButtons
        };
    }
};