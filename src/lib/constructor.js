/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

import _icons from '../assets/defaultIcons';
import _defaultLang from '../lang/en';
import util from './util';

export default {
    /**
     * @description document create
     * @param {Element} element Textarea
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
        top_div.className = 'sun-editor' + (options.rtl ? ' se-rtl' : '');
        if (element.id) top_div.id = 'suneditor_' + element.id;
    
        // relative div
        const relative = doc.createElement('DIV');
        relative.className = 'se-container';
    
        // toolbar
        const tool_bar = this._createToolBar(doc, options.buttonList, options.plugins, options);
        tool_bar.element.style.visibility = 'hidden';
        if (tool_bar.pluginCallButtons.math) this._checkKatexMath(options.katex);
        const arrow = doc.createElement('DIV');
        arrow.className = 'se-arrow';

        // sticky toolbar dummy
        const sticky_dummy = doc.createElement('DIV');
        sticky_dummy.className = 'se-toolbar-sticky-dummy';
    
        // inner editor div
        const editor_div = doc.createElement('DIV');
        editor_div.className = 'se-wrapper';

        /** --- init elements and create bottom bar --- */
        const initElements = this._initElements(options, top_div, tool_bar.element, arrow);

        const bottomBar = initElements.bottomBar;
        const wysiwyg_div = initElements.wysiwygFrame;
        const placeholder_span = initElements.placeholder;
        let textarea = initElements.codeView;

        // resizing bar
        const resizing_bar = bottomBar.resizingBar;
        const navigation = bottomBar.navigation;
        const char_wrapper = bottomBar.charWrapper;
        const char_counter = bottomBar.charCounter;
    
        // loading box
        const loading_box = doc.createElement('DIV');
        loading_box.className = 'se-loading-box sun-editor-common';
        loading_box.innerHTML = '<div class="se-loading-effect"></div>';

        // enter line
        const line_breaker = doc.createElement('DIV');
        line_breaker.className = 'se-line-breaker';
        line_breaker.innerHTML = '<button class="se-btn">' + options.icons.line_break + '</button>';
        const line_breaker_t = doc.createElement('DIV');
        line_breaker_t.className += 'se-line-breaker-component';
        const line_breaker_b = line_breaker_t.cloneNode(true);
        line_breaker_t.innerHTML = line_breaker_b.innerHTML = options.icons.line_break;
    
        // resize operation background
        const resize_back = doc.createElement('DIV');
        resize_back.className = 'se-resizing-back';

        // toolbar container
        const toolbarContainer = options.toolbarContainer;
        if (toolbarContainer) {
            toolbarContainer.appendChild(tool_bar.element);
        }
    
        /** append html */
        editor_div.appendChild(textarea);
        if (placeholder_span) editor_div.appendChild(placeholder_span);
        if (!toolbarContainer) relative.appendChild(tool_bar.element);
        relative.appendChild(sticky_dummy);
        relative.appendChild(editor_div);
        relative.appendChild(resize_back);
        relative.appendChild(loading_box);
        relative.appendChild(line_breaker);
        relative.appendChild(line_breaker_t);
        relative.appendChild(line_breaker_b);
        if (resizing_bar) relative.appendChild(resizing_bar);
        top_div.appendChild(relative);

        textarea = this._checkCodeMirror(options, textarea);
    
        return {
            constructed: {
                _top: top_div,
                _relative: relative,
                _toolBar: tool_bar.element,
                _menuTray: tool_bar._menuTray,
                _editorArea: editor_div,
                _wysiwygArea: wysiwyg_div,
                _codeArea: textarea,
                _placeholder: placeholder_span,
                _resizingBar: resizing_bar,
                _navigation: navigation,
                _charWrapper: char_wrapper,
                _charCounter: char_counter,
                _loading: loading_box,
                _lineBreaker: line_breaker,
                _lineBreaker_t: line_breaker_t,
                _lineBreaker_b: line_breaker_b,
                _resizeBack: resize_back,
                _stickyDummy: sticky_dummy,
                _arrow: arrow
            },
            options: options,
            plugins: tool_bar.plugins,
            pluginCallButtons: tool_bar.pluginCallButtons,
            _responsiveButtons: tool_bar.responsiveButtons
        };
    },

    /**
     * @description Check the CodeMirror option to apply the CodeMirror and return the CodeMirror element.
     * @param {Object} options options
     * @param {Element} textarea textarea element
     * @private
     */
    _checkCodeMirror: function (options, textarea) {
        if (options.codeMirror) {
            const cmOptions = [{
                mode: 'htmlmixed',
                htmlMode: true,
                lineNumbers: true,
                lineWrapping: true
            }, (options.codeMirror.options || {})].reduce(function (init, option) {
                for (let key in option) {
                    if (util.hasOwn(option, key)) init[key] = option[key];
                }
                return init;
            }, {});

            if (options.height === 'auto') {
                cmOptions.viewportMargin = Infinity;
                cmOptions.height = 'auto';
            }
            
            const cm = options.codeMirror.src.fromTextArea(textarea, cmOptions);
            cm.display.wrapper.style.cssText = textarea.style.cssText;
            
            options.codeMirrorEditor = cm;
            textarea = cm.display.wrapper;
            textarea.className += ' se-wrapper-code-mirror';
        }

        return textarea;
    },

    /**
     * @description Check for a katex object.
     * @param {Object} katex katex object
     * @private
     */
    _checkKatexMath: function (katex) {
        if (!katex) throw Error('[SUNEDITOR.create.fail] To use the math button you need to add a "katex" object to the options.');

        const katexOptions = [{
            throwOnError: false,
        }, (katex.options || {})].reduce(function (init, option) {
            for (let key in option) {
                if (util.hasOwn(option, key)) init[key] = option[key];
            }
            return init;
        }, {});

        katex.options = katexOptions;
    },

    /**
     * @description Add or reset options
     * @param {Object} mergeOptions New options property
     * @param {Object} context Context object of core
     * @param {Object} originOptions Origin options
     * @returns {Object} pluginCallButtons
     * @private
     */
    _setOptions: function (mergeOptions, context, originOptions) {
        this._initOptions(context.element.originElement, mergeOptions);

        const el = context.element;
        const relative = el.relative;
        const editorArea = el.editorArea;
        const isNewToolbarContainer = mergeOptions.toolbarContainer && mergeOptions.toolbarContainer !== originOptions.toolbarContainer;
        const isNewToolbar = mergeOptions.lang !== originOptions.lang || mergeOptions.buttonList !== originOptions.buttonList || mergeOptions.mode !== originOptions.mode || isNewToolbarContainer;

        const tool_bar = this._createToolBar(document, (isNewToolbar ? mergeOptions.buttonList : originOptions.buttonList), mergeOptions.plugins, mergeOptions);
        if (tool_bar.pluginCallButtons.math) this._checkKatexMath(mergeOptions.katex);
        const arrow = document.createElement('DIV');
        arrow.className = 'se-arrow';

        if (isNewToolbar) {
            tool_bar.element.style.visibility = 'hidden';
            // toolbar container
            if (isNewToolbarContainer) {
                mergeOptions.toolbarContainer.appendChild(tool_bar.element);
                el.toolbar.parentElement.removeChild(el.toolbar);
            } else {
                el.toolbar.parentElement.replaceChild(tool_bar.element, el.toolbar);
            }

            el.toolbar = tool_bar.element;
            el._menuTray = tool_bar._menuTray;
            el._arrow = arrow;
        }
        
        const initElements = this._initElements(mergeOptions, el.topArea, (isNewToolbar ? tool_bar.element : el.toolbar), arrow);

        const bottomBar = initElements.bottomBar;
        const wysiwygFrame = initElements.wysiwygFrame;
        const placeholder_span = initElements.placeholder;
        let code = initElements.codeView;

        if (el.resizingBar) relative.removeChild(el.resizingBar);
        if (bottomBar.resizingBar) relative.appendChild(bottomBar.resizingBar);

        editorArea.innerHTML = '';
        editorArea.appendChild(code);
        if (placeholder_span) editorArea.appendChild(placeholder_span);

        code = this._checkCodeMirror(mergeOptions, code);
        
        el.resizingBar = bottomBar.resizingBar;
        el.navigation = bottomBar.navigation;
        el.charWrapper = bottomBar.charWrapper;
        el.charCounter = bottomBar.charCounter;
        el.wysiwygFrame = wysiwygFrame;
        el.code = code;
        el.placeholder = placeholder_span;

        if (mergeOptions.rtl) util.addClass(el.topArea, 'se-rtl');
        else util.removeClass(el.topArea, 'se-rtl');

        return {
            callButtons: tool_bar.pluginCallButtons,
            plugins: tool_bar.plugins,
            toolbar: tool_bar
        };
    },

    /**
     * @description Initialize property of suneditor elements
     * @param {Object} options Options
     * @param {Element} topDiv Suneditor top div
     * @param {Element} toolBar Tool bar
     * @param {Element} toolBarArrow Tool bar arrow (balloon editor)
     * @returns {Object} Bottom bar elements (resizingBar, navigation, charWrapper, charCounter)
     * @private
     */
    _initElements: function (options, topDiv, toolBar, toolBarArrow) {
        /** top div */
        topDiv.style.cssText = options._editorStyles.top;

        /** toolbar */
        if (/inline/i.test(options.mode)) {
            toolBar.className += ' se-toolbar-inline';
            toolBar.style.width = options.toolbarWidth;
        } else if (/balloon/i.test(options.mode)) {
            toolBar.className += ' se-toolbar-balloon';
            toolBar.style.width = options.toolbarWidth;
            toolBar.appendChild(toolBarArrow);
        }

        /** editor */
        // wysiwyg div or iframe
        const wysiwygDiv = document.createElement(!options.iframe ? 'DIV' : 'IFRAME');
        wysiwygDiv.className = 'se-wrapper-inner se-wrapper-wysiwyg';
        
        if (!options.iframe) {
            wysiwygDiv.setAttribute('contenteditable', true);
            wysiwygDiv.setAttribute('scrolling', 'auto');
            wysiwygDiv.className += ' ' + options._editableClass;
            wysiwygDiv.style.cssText = options._editorStyles.frame + options._editorStyles.editor;
        } else {
            wysiwygDiv.allowFullscreen = true;
            wysiwygDiv.frameBorder = 0;
            wysiwygDiv.style.cssText = options._editorStyles.frame;
        }

        // textarea for code view
        const textarea = document.createElement('TEXTAREA');
        textarea.className = 'se-wrapper-inner se-wrapper-code';
        textarea.style.cssText = options._editorStyles.frame;
        textarea.style.display = 'none';
        if (options.height === 'auto') textarea.style.overflow = 'hidden';

        /** resize bar */
        let resizingBar = null;
        let navigation = null;
        let charWrapper = null;
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
                charWrapper = document.createElement('DIV');
                charWrapper.className = 'se-char-counter-wrapper';

                if (options.charCounterLabel) {
                    const charLabel = document.createElement('SPAN');
                    charLabel.className = 'se-char-label';
                    charLabel.textContent = options.charCounterLabel;
                    charWrapper.appendChild(charLabel);
                }
    
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
        
        let placeholder = null;
        if (options.placeholder) {
            placeholder = document.createElement('SPAN');
            placeholder.className = 'se-placeholder';
            placeholder.innerText = options.placeholder;
        }

        return {
            bottomBar: {
                resizingBar: resizingBar,
                navigation: navigation,
                charWrapper: charWrapper,
                charCounter: charCounter
            },
            wysiwygFrame: wysiwygDiv,
            codeView: textarea,
            placeholder: placeholder
        };
    },

    /**
     * @description Initialize options
     * @param {Element} element Options object
     * @param {Object} options Options object
     * @private
     */
    _initOptions: function (element, options) {
        /** Values */
        options.lang = options.lang || _defaultLang;
        options.defaultTag = typeof options.defaultTag === 'string' ? options.defaultTag : 'p';
        const textTags = options.textTags = [{bold: 'STRONG', underline: 'U', italic: 'EM', strike: 'DEL', sub: 'SUB', sup: 'SUP'}, (options.textTags || {})].reduce(function (_default, _new) {
            for (let key in _new) {
                _default[key] = _new[key];
            }
            return _default;
        }, {});
        options._textTagsMap = {
            'strong': textTags.bold,
            'b': textTags.bold,
            'u': textTags.underline,
            'ins': textTags.underline,
            'em': textTags.italic,
            'i': textTags.italic,
            'del': textTags.strike,
            'strike': textTags.strike,
            's': textTags.strike,
            'sub': textTags.sub,
            'sup': textTags.sup
        };
        options.value = typeof options.value === 'string' ? options.value : null;
        options.historyStackDelayTime = typeof options.historyStackDelayTime === 'number' ? options.historyStackDelayTime : 400;
        /** Whitelist */
        const whitelist = 'br|p|div|pre|blockquote|h1|h2|h3|h4|h5|h6|ol|ul|li|hr|figure|figcaption|img|iframe|audio|video|source|table|thead|tbody|tr|th|td|a|b|strong|var|i|em|u|ins|s|span|strike|del|sub|sup|code|svg|path';
        options._defaultTagsWhitelist = typeof options._defaultTagsWhitelist === 'string' ? options._defaultTagsWhitelist : whitelist;
        options._editorTagsWhitelist = this._setWhitelist(options._defaultTagsWhitelist + (typeof options.addTagsWhitelist === 'string' && options.addTagsWhitelist.length > 0 ? '|' + options.addTagsWhitelist : ''), options.tagsBlacklist);
        options.pasteTagsWhitelist = this._setWhitelist(typeof options.pasteTagsWhitelist === 'string' ? options.pasteTagsWhitelist : options._editorTagsWhitelist, options.pasteTagsBlacklist);
        options.attributesWhitelist = (!options.attributesWhitelist || typeof options.attributesWhitelist !== 'object') ? null : options.attributesWhitelist;
        /** Layout */
        options.mode = options.mode || 'classic'; // classic, inline, balloon, balloon-always
        options.rtl = !!options.rtl;
        options._editableClass = 'sun-editor-editable' + (options.rtl ? ' se-rtl' : '');
        options._printClass = typeof options._printClass === 'string' ? options._printClass : null;
        options.toolbarWidth = options.toolbarWidth ? (util.isNumber(options.toolbarWidth) ? options.toolbarWidth + 'px' : options.toolbarWidth) : 'auto';
        options.toolbarContainer = typeof options.toolbarContainer === 'string' ? document.querySelector(options.toolbarContainer) : options.toolbarContainer;
        options.stickyToolbar = (/balloon/i.test(options.mode) || !!options.toolbarContainer) ? -1 : options.stickyToolbar === undefined ? 0 : (/^\d+/.test(options.stickyToolbar) ? util.getNumber(options.stickyToolbar, 0) : -1);
        options.fullScreenOffset = options.fullScreenOffset === undefined ? 0 : (/^\d+/.test(options.fullScreenOffset) ? util.getNumber(options.fullScreenOffset, 0) : 0);
        options.iframe = options.fullPage || options.iframe;
        options.fullPage = !!options.fullPage;
        options.iframeCSSFileName = options.iframe ? typeof options.iframeCSSFileName === 'string' ? [options.iframeCSSFileName] : (options.iframeCSSFileName || ['suneditor']) : null;
        options.previewTemplate = typeof options.previewTemplate === 'string' ? options.previewTemplate : null;
        options.printTemplate = typeof options.printTemplate === 'string' ? options.printTemplate : null;
        /** CodeMirror object */
        options.codeMirror = options.codeMirror ? options.codeMirror.src ? options.codeMirror : {src: options.codeMirror} : null;
        /** katex object (Math plugin) */
        options.katex = options.katex ? options.katex.src ? options.katex : {src: options.katex} : null;
        options.mathFontSize = !!options.mathFontSize ? options.mathFontSize : [
            {text: '1', value: '1em'},
            {text: '1.5', value: '1.5em'},
            {text: '2', value: '2em'},
            {text: '2.5', value: '2.5em'}
        ];
        /** Display */
        options.position = typeof options.position === 'string' ? options.position : null;
        options.display = options.display || (element.style.display === 'none' || !element.style.display ? 'block' : element.style.display);
        options.popupDisplay = options.popupDisplay || 'full';
        /** Bottom resizing bar */
        options.resizingBar = options.resizingBar === undefined ? (/inline|balloon/i.test(options.mode) ? false : true) : options.resizingBar;
        options.showPathLabel = !options.resizingBar ? false : typeof options.showPathLabel === 'boolean' ? options.showPathLabel : true;
        /** Character count */
        options.charCounter = options.maxCharCount > 0 ? true : typeof options.charCounter === 'boolean' ? options.charCounter : false;
        options.charCounterType = typeof options.charCounterType === 'string' ? options.charCounterType : 'char';
        options.charCounterLabel = typeof options.charCounterLabel === 'string' ? options.charCounterLabel.trim() : null;
        options.maxCharCount = util.isNumber(options.maxCharCount) && options.maxCharCount > -1 ? options.maxCharCount * 1 : null;
        /** Width size */
        options.width = options.width ? (util.isNumber(options.width) ? options.width + 'px' : options.width) : (element.clientWidth ? element.clientWidth + 'px' : '100%');
        options.minWidth = (util.isNumber(options.minWidth) ? options.minWidth + 'px' : options.minWidth) || '';
        options.maxWidth = (util.isNumber(options.maxWidth) ? options.maxWidth + 'px' : options.maxWidth) || '';
        /** Height size */
        options.height = options.height ? (util.isNumber(options.height) ? options.height + 'px' : options.height) : (element.clientHeight ? element.clientHeight + 'px' : 'auto');
        options.minHeight = (util.isNumber(options.minHeight) ? options.minHeight + 'px' : options.minHeight) || '';
        options.maxHeight = (util.isNumber(options.maxHeight) ? options.maxHeight + 'px' : options.maxHeight) || '';
        /** Editing area default style */
        options.defaultStyle = typeof options.defaultStyle === 'string' ? options.defaultStyle : '';
        /** Defining menu items */
        options.font = !options.font ? null : options.font;
        options.fontSize = !options.fontSize ? null : options.fontSize;
        options.formats = !options.formats ? null : options.formats;
        options.colorList = !options.colorList ? null : options.colorList;
        options.lineHeights = !options.lineHeights ? null : options.lineHeights;
        options.paragraphStyles = !options.paragraphStyles ? null : options.paragraphStyles;
        options.textStyles = !options.textStyles ? null : options.textStyles;
        options.fontSizeUnit = typeof options.fontSizeUnit === 'string' ? (options.fontSizeUnit.trim() || 'px') : 'px';
        /** Image */
        options.imageResizing = options.imageResizing === undefined ? true : options.imageResizing;
        options.imageHeightShow = options.imageHeightShow === undefined ? true : !!options.imageHeightShow;
        options.imageWidth = !options.imageWidth ? 'auto' : util.isNumber(options.imageWidth) ? options.imageWidth + 'px' : options.imageWidth;
        options.imageHeight = !options.imageHeight ? 'auto' : util.isNumber(options.imageHeight) ? options.imageHeight + 'px' : options.imageHeight;
        options.imageSizeOnlyPercentage = !!options.imageSizeOnlyPercentage;
        options._imageSizeUnit = options.imageSizeOnlyPercentage ? '%' : 'px';
        options.imageRotation = options.imageRotation !== undefined ? options.imageRotation : !(options.imageSizeOnlyPercentage || !options.imageHeightShow);
        options.imageFileInput = options.imageFileInput === undefined ? true : options.imageFileInput;
        options.imageUrlInput = (options.imageUrlInput === undefined || !options.imageFileInput) ? true : options.imageUrlInput;
        options.imageUploadHeader = options.imageUploadHeader || null;
        options.imageUploadUrl = typeof options.imageUploadUrl === 'string' ? options.imageUploadUrl : null;
        options.imageUploadSizeLimit = /\d+/.test(options.imageUploadSizeLimit) ? util.getNumber(options.imageUploadSizeLimit, 0) : null;
        options.imageMultipleFile = !!options.imageMultipleFile;
        options.imageAccept = (typeof options.imageAccept !== 'string' || options.imageAccept.trim() === "*") ? 'image/*' : options.imageAccept.trim() || 'image/*';
        /** Image - image gallery */
        options.imageGalleryUrl = typeof options.imageGalleryUrl === 'string' ? options.imageGalleryUrl : null;
        options.imageGalleryHeader = options.imageGalleryHeader || null;
        /** Video */
        options.videoResizing = options.videoResizing === undefined ? true : options.videoResizing;
        options.videoHeightShow = options.videoHeightShow === undefined ? true : !!options.videoHeightShow;
        options.videoRatioShow = options.videoRatioShow === undefined ? true : !!options.videoRatioShow;
        options.videoWidth = !options.videoWidth || !util.getNumber(options.videoWidth, 0) ? '' : util.isNumber(options.videoWidth) ? options.videoWidth + 'px' : options.videoWidth;
        options.videoHeight = !options.videoHeight || !util.getNumber(options.videoHeight, 0) ? '' : util.isNumber(options.videoHeight) ? options.videoHeight + 'px' : options.videoHeight;
        options.videoSizeOnlyPercentage = !!options.videoSizeOnlyPercentage;
        options._videoSizeUnit = options.videoSizeOnlyPercentage ? '%' : 'px';
        options.videoRotation = options.videoRotation !== undefined ? options.videoRotation : !(options.videoSizeOnlyPercentage || !options.videoHeightShow);
        options.videoRatio = (util.getNumber(options.videoRatio, 4) || 0.5625);
        options.videoRatioList = !options.videoRatioList ? null : options.videoRatioList;
        options.youtubeQuery = (options.youtubeQuery || '').replace('?', '');
        options.videoFileInput = !!options.videoFileInput;
        options.videoUrlInput = (options.videoUrlInput === undefined || !options.videoFileInput) ? true : options.videoUrlInput;
        options.videoUploadHeader = options.videoUploadHeader || null;
        options.videoUploadUrl = typeof options.videoUploadUrl === 'string' ? options.videoUploadUrl : null;
        options.videoUploadSizeLimit = /\d+/.test(options.videoUploadSizeLimit) ? util.getNumber(options.videoUploadSizeLimit, 0) : null;
        options.videoMultipleFile = !!options.videoMultipleFile;
        options.videoTagAttrs = options.videoTagAttrs || null;
        options.videoIframeAttrs = options.videoIframeAttrs || null;
        options.videoAccept = (typeof options.videoAccept !== 'string' || options.videoAccept.trim() === "*") ? 'video/*' : options.videoAccept.trim() || 'video/*';
        /** Audio */
        options.audioWidth = !options.audioWidth ? '' : util.isNumber(options.audioWidth) ? options.audioWidth + 'px' : options.audioWidth;
        options.audioHeight = !options.audioHeight ? '' : util.isNumber(options.audioHeight) ? options.audioHeight + 'px' : options.audioHeight;
        options.audioFileInput = !!options.audioFileInput;
        options.audioUrlInput = (options.audioUrlInput === undefined || !options.audioFileInput) ? true : options.audioUrlInput;
        options.audioUploadHeader = options.audioUploadHeader || null;
        options.audioUploadUrl = typeof options.audioUploadUrl === 'string' ? options.audioUploadUrl : null;
        options.audioUploadSizeLimit = /\d+/.test(options.audioUploadSizeLimit) ? util.getNumber(options.audioUploadSizeLimit, 0) : null;
        options.audioMultipleFile = !!options.audioMultipleFile;
        options.audioTagAttrs = options.audioTagAttrs || null;
        options.audioAccept = (typeof options.audioAccept !== 'string' || options.audioAccept.trim() === "*") ? 'audio/*' : options.audioAccept.trim() || 'audio/*';
        /** Table */
        options.tableCellControllerPosition = typeof options.tableCellControllerPosition === 'string' ? options.tableCellControllerPosition.toLowerCase() : 'cell';
        /** Link */
        options.linkProtocol = typeof options.linkProtocol === 'string' ? options.linkProtocol : null;
        options.linkRel = Array.isArray(options.linkRel) ? options.linkRel : [];
        options.linkRelDefault = options.linkRelDefault || {};
        /** Key actions */
        options.tabDisable = !!options.tabDisable;
        options.shortcutsDisable = Array.isArray(options.shortcutsDisable) ? options.shortcutsDisable : [];
        options.shortcutsHint = options.shortcutsHint === undefined ? true : !!options.shortcutsHint;
        /** Defining save button */
        options.callBackSave = !options.callBackSave ? null : options.callBackSave;
        /** Templates Array */
        options.templates = !options.templates ? null : options.templates;
        /** ETC */
        options.placeholder = typeof options.placeholder === 'string' ? options.placeholder : null;
        options.mediaAutoSelect = options.mediaAutoSelect === undefined ? true : !!options.mediaAutoSelect;
        /** Buttons */
        options.buttonList = !!options.buttonList ? options.buttonList : [
            ['undo', 'redo'],
            ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
            ['removeFormat'],
            ['outdent', 'indent'],
            ['fullScreen', 'showBlocks', 'codeView'],
            ['preview', 'print']
        ];

        /** RTL - buttons */
        if (options.rtl) {
            options.buttonList = options.buttonList.reverse();
        }

        /** --- Define icons --- */
        // custom icons
        options.icons = (!options.icons || typeof options.icons !== 'object') ? _icons : [_icons, options.icons].reduce(function (_default, _new) {
            for (let key in _new) {
                if (util.hasOwn(_new, key)) _default[key] = _new[key];
            }
            return _default;
        }, {});
        // rtl icons
        options.icons = !options.rtl ? options.icons : [options.icons, options.icons.rtl].reduce(function (_default, _new) {
            for (let key in _new) {
                if (util.hasOwn(_new, key)) _default[key] = _new[key];
            }
            return _default;
        }, {});

        /** _init options */
        options._editorStyles = util._setDefaultOptionStyle(options, options.defaultStyle);
    },

    _setWhitelist: function (whitelist, blacklist) {
        if (typeof blacklist !== 'string') return whitelist;
        blacklist = blacklist.split('|');
        whitelist = whitelist.split('|');
        for (let i = 0, len = blacklist.length, index; i < len; i++) {
            index = whitelist.indexOf(blacklist[i]);
            if (index > -1) whitelist.splice(index, 1);
        }
        return whitelist.join('|');
    },

    /**
     * @description Suneditor's Default button list
     * @param {Object} options options
     * @private
     */
    _defaultButtons: function (options) {
        const icons = options.icons;
        const lang = options.lang;
        const cmd = util.isOSX_IOS ? '⌘' : 'CTRL';
        const addShift = util.isOSX_IOS ? '⇧' : '+SHIFT';
        const shortcutsDisable = !options.shortcutsHint ? ['bold', 'strike', 'underline', 'italic', 'undo', 'indent', 'save'] : options.shortcutsDisable;
        const indentKey = options.rtl ? ['[',']'] : [']','['];

        return {
            /** default command */
            bold: ['_se_command_bold', lang.toolbar.bold + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('bold') > -1 ? '' : cmd + '+<span class="se-shortcut-key">B</span>') + '</span>', 'bold', '', icons.bold],
            underline: ['_se_command_underline', lang.toolbar.underline + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('underline') > -1 ? '' : cmd + '+<span class="se-shortcut-key">U</span>') + '</span>', 'underline', '', icons.underline],
            italic: ['_se_command_italic', lang.toolbar.italic + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('italic') > -1 ? '' : cmd + '+<span class="se-shortcut-key">I</span>') + '</span>', 'italic', '', icons.italic],
            strike: ['_se_command_strike', lang.toolbar.strike + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('strike') > -1 ? '' : cmd + addShift + '+<span class="se-shortcut-key">S</span>') + '</span>', 'strike', '', icons.strike],
            subscript: ['_se_command_subscript', lang.toolbar.subscript, 'SUB', '', icons.subscript],
            superscript: ['_se_command_superscript', lang.toolbar.superscript, 'SUP', '', icons.superscript],
            removeFormat: ['', lang.toolbar.removeFormat, 'removeFormat', '', icons.erase],
            indent: ['_se_command_indent', lang.toolbar.indent + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('indent') > -1 ? '' : cmd + '+<span class="se-shortcut-key">' + indentKey[0] + '</span>') + '</span>', 'indent', '', icons.outdent],
            outdent: ['_se_command_outdent', lang.toolbar.outdent + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('indent') > -1 ? '' : cmd + '+<span class="se-shortcut-key">' + indentKey[1] + '</span>') + '</span>', 'outdent', '', icons.indent],
            fullScreen: ['se-code-view-enabled se-resizing-enabled _se_command_fullScreen', lang.toolbar.fullScreen, 'fullScreen', '', icons.expansion],
            showBlocks: ['_se_command_showBlocks', lang.toolbar.showBlocks, 'showBlocks', '', icons.show_blocks],
            codeView: ['se-code-view-enabled se-resizing-enabled _se_command_codeView', lang.toolbar.codeView, 'codeView', '', icons.code_view],
            undo: ['_se_command_undo se-resizing-enabled', lang.toolbar.undo + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('undo') > -1 ? '' : cmd + '+<span class="se-shortcut-key">Z</span>') + '</span>', 'undo', '', icons.undo],
            redo: ['_se_command_redo se-resizing-enabled', lang.toolbar.redo + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('undo') > -1 ? '' : cmd + '+<span class="se-shortcut-key">Y</span> / ' + cmd + addShift + '+<span class="se-shortcut-key">Z</span>') + '</span>', 'redo', '', icons.redo],
            preview: ['se-resizing-enabled', lang.toolbar.preview, 'preview', '', icons.preview],
            print: ['se-resizing-enabled', lang.toolbar.print, 'print', '', icons.print],
            save: ['_se_command_save se-resizing-enabled', lang.toolbar.save + '<span class="se-shortcut">' + (shortcutsDisable.indexOf('save') > -1 ? '' : cmd + '+<span class="se-shortcut-key">S</span>') + '</span>', 'save', '', icons.save],
            /** plugins - command */
            blockquote: ['', lang.toolbar.tag_blockquote, 'blockquote', 'command', icons.blockquote],
            /** plugins - submenu */
            font: ['se-btn-select se-btn-tool-font', lang.toolbar.font, 'font', 'submenu', '<span class="txt">' + lang.toolbar.font + '</span>' + icons.arrow_down],
            formatBlock: ['se-btn-select se-btn-tool-format', lang.toolbar.formats, 'formatBlock', 'submenu', '<span class="txt">' + lang.toolbar.formats + '</span>' + icons.arrow_down],
            fontSize: ['se-btn-select se-btn-tool-size', lang.toolbar.fontSize, 'fontSize', 'submenu', '<span class="txt">' + lang.toolbar.fontSize + '</span>' + icons.arrow_down],
            fontColor: ['', lang.toolbar.fontColor, 'fontColor', 'submenu', icons.font_color],
            hiliteColor: ['', lang.toolbar.hiliteColor, 'hiliteColor', 'submenu', icons.highlight_color],
            align: ['se-btn-align', lang.toolbar.align, 'align', 'submenu', (options.rtl ? icons.align_right : icons.align_left)],
            list: ['', lang.toolbar.list, 'list', 'submenu', icons.list_number],
            horizontalRule: ['btn_line', lang.toolbar.horizontalRule, 'horizontalRule', 'submenu', icons.horizontal_rule],
            table: ['', lang.toolbar.table, 'table', 'submenu', icons.table],
            lineHeight: ['', lang.toolbar.lineHeight, 'lineHeight', 'submenu', icons.line_height],
            template: ['', lang.toolbar.template, 'template', 'submenu', icons.template],
            paragraphStyle: ['', lang.toolbar.paragraphStyle, 'paragraphStyle', 'submenu', icons.paragraph_style],
            textStyle: ['', lang.toolbar.textStyle, 'textStyle', 'submenu', icons.text_style],
            /** plugins - dialog */
            link: ['', lang.toolbar.link, 'link', 'dialog', icons.link],
            image: ['', lang.toolbar.image, 'image', 'dialog', icons.image],
            video: ['', lang.toolbar.video, 'video', 'dialog', icons.video],
            audio: ['', lang.toolbar.audio, 'audio', 'dialog', icons.audio],
            math: ['', lang.toolbar.math, 'math', 'dialog', icons.math],
            /** plugins - fileBrowser */
            imageGallery: ['', lang.toolbar.imageGallery, 'imageGallery', 'fileBrowser', icons.image_gallery]
        };
    },

    /**
     * @description Create a group div containing each module
     * @returns {Object}
     * @private
     */
    _createModuleGroup: function () {
        const oDiv = util.createElement('DIV');
        oDiv.className = 'se-btn-module se-btn-module-border';

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
     * @param {string} dataDisplay The data-display property of the button ('dialog', 'submenu', 'command')
     * @param {string} innerHTML Html in button
     * @param {string} _disabled Button disabled
     * @param {Object} _icons Icons
     * @returns {Object}
     * @private
     */
    _createButton: function (buttonClass, title, dataCommand, dataDisplay, innerHTML, _disabled, _icons) {
        const oLi = util.createElement('LI');
        const oButton = util.createElement('BUTTON');

        oButton.setAttribute('type', 'button');
        oButton.setAttribute('class', 'se-btn' + (buttonClass ? ' ' + buttonClass : '') + ' se-tooltip');
        oButton.setAttribute('data-command', dataCommand);
        oButton.setAttribute('data-display', dataDisplay);
        oButton.setAttribute('tabindex', '-1');
        
        if (!innerHTML) innerHTML = '<span class="se-icon-text">!</span>';
        if (/^default\./i.test(innerHTML)) {
            innerHTML = _icons[innerHTML.replace(/^default\./i, '')];
        }
        if (/^text\./i.test(innerHTML)) {
            innerHTML = innerHTML.replace(/^text\./i, '');
            oButton.className += ' se-btn-more-text';
        }

        innerHTML += '<span class="se-tooltip-inner"><span class="se-tooltip-text">' + (title || dataCommand) + '</span></span>';

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
     * @param {Array|Object|null} _plugins Plugins
     * @param {Array} options options
     * @returns {Object} { element: (Element) Toolbar element, plugins: (Array|null) Plugins Array, pluginCallButtons: (Object), responsiveButtons: (Array) }
     * @private
     */
    _createToolBar: function (doc, buttonList, _plugins, options) {
        const separator_vertical = doc.createElement('DIV');
        separator_vertical.className = 'se-toolbar-separator-vertical';

        const tool_bar = doc.createElement('DIV');
        tool_bar.className = 'se-toolbar sun-editor-common';

        const _buttonTray = doc.createElement('DIV');
        _buttonTray.className = 'se-btn-tray';
        tool_bar.appendChild(_buttonTray);

        /** create button list */
        buttonList = JSON.parse(JSON.stringify(buttonList));
        const icons = options.icons;
        const defaultButtonList = this._defaultButtons(options);
        const pluginCallButtons = {};
        const responsiveButtons = [];
        const plugins = {};
        if (_plugins) {
            const pluginsValues = _plugins.length ? _plugins : Object.keys(_plugins).map(function(name) { return _plugins[name]; });
            for (let i = 0, len = pluginsValues.length, p; i < len; i++) {
                p = pluginsValues[i].default || pluginsValues[i];
                plugins[p.name] = p;
            }
        }

        let module = null;
        let button = null;
        let moduleElement = null;
        let buttonElement = null;
        let pluginName = '';
        let vertical = false;
        const moreLayer = util.createElement('DIV');
        moreLayer.className = 'se-toolbar-more-layer';

        buttonGroupLoop:
        for (let i = 0, more, moreContainer, moreCommand, buttonGroup, align; i < buttonList.length; i++) {
            more = false;
            align = '';
            buttonGroup = buttonList[i];
            moduleElement = this._createModuleGroup();

            // button object
            if (typeof buttonGroup === 'object') {
                // buttons loop
                for (let j = 0, moreButton; j < buttonGroup.length; j++) {
                    button = buttonGroup[j];
                    moreButton = false;

                    if (/^\%\d+/.test(button) && j === 0) {
                        buttonGroup[0] = button.replace(/[^\d]/g, '');
                        responsiveButtons.push(buttonGroup);
                        buttonList.splice(i--, 1);
                        continue buttonGroupLoop;
                    }
                    
                    if (typeof button === 'object') {
                        if (typeof button.add === 'function') {
                            pluginName = button.name;
                            module = defaultButtonList[pluginName];
                            plugins[pluginName] = button;
                        } else {
                            pluginName = button.name;
                            module = [button.buttonClass, button.title, button.name, button.dataDisplay, button.innerHTML, button._disabled];
                        }
                    } else {
                        // align
                        if (/^\-/.test(button)) {
                            align = button.substr(1);
                            moduleElement.div.style.float = align;
                            continue;
                        }
                        
                        // more button
                        if (/^\:/.test(button)) {
                            moreButton = true;
                            const matched = button.match(/^\:([^\-]+)\-([^\-]+)\-([^\-]+)/);
                            moreCommand = '__se__' + matched[1].trim();
                            const title = matched[2].trim();
                            const innerHTML = matched[3].trim();
                            module = ['se-btn-more', title, moreCommand, 'MORE', innerHTML];
                        }
                        // buttons
                        else {
                            module = defaultButtonList[button];
                        }

                        pluginName = button;
                        if (!module) {
                            const custom = plugins[pluginName];
                            if (!custom) throw Error('[SUNEDITOR.create.toolbar.fail] The button name of a plugin that does not exist. [' + pluginName + ']');
                            module = [custom.buttonClass, custom.title, custom.name, custom.display, custom.innerHTML, custom._disabled];
                        }
                    }

                    buttonElement = this._createButton(module[0], module[1], module[2], module[3], module[4], module[5], icons);
                    (more ? moreContainer : moduleElement.ul).appendChild(buttonElement.li);

                    if (plugins[pluginName]) {
                        pluginCallButtons[pluginName] = buttonElement.button;
                    }

                    // more button
                    if (moreButton) {
                        more = true;
                        moreContainer = util.createElement('DIV');
                        moreContainer.className = 'se-more-layer ' + moreCommand;
                        moreContainer.innerHTML = '<div class="se-more-form"><ul class="se-menu-list"' + (align ? ' style="float: ' + align + ';"' : '') + '></ul></div>';
                        moreLayer.appendChild(moreContainer);
                        moreContainer = moreContainer.firstElementChild.firstElementChild;
                    }
                }

                if (vertical) {
                    const sv =  separator_vertical.cloneNode(false);
                    _buttonTray.appendChild(sv);
                }
                
                _buttonTray.appendChild(moduleElement.div);
                vertical = true;
            }
            /** line break  */
            else if (/^\/$/.test(buttonGroup)) {
                const enterDiv = doc.createElement('DIV');
                enterDiv.className = 'se-btn-module-enter';
                _buttonTray.appendChild(enterDiv);
                vertical = false;
            }
        }

        switch (_buttonTray.children.length) {
            case 0:
                _buttonTray.style.display = 'none';
                break;
            case 1:
                util.removeClass(_buttonTray.firstElementChild, 'se-btn-module-border');
                break;
            default:
                if (options.rtl) {
                    const sv =  separator_vertical.cloneNode(false);
                    sv.style.float = _buttonTray.lastElementChild.style.float;
                    _buttonTray.appendChild(sv);
                }
        }

        if (responsiveButtons.length > 0) responsiveButtons.unshift(buttonList);
        if (moreLayer.children.length > 0) _buttonTray.appendChild(moreLayer);

        // menu tray
        const _menuTray = doc.createElement('DIV');
        _menuTray.className = 'se-menu-tray';
        tool_bar.appendChild(_menuTray);

        // cover
        const tool_cover = doc.createElement('DIV');
        tool_cover.className = 'se-toolbar-cover';
        tool_bar.appendChild(tool_cover);

        return {
            'element': tool_bar,
            'plugins': plugins,
            'pluginCallButtons': pluginCallButtons,
            'responsiveButtons': responsiveButtons,
            '_menuTray': _menuTray,
            '_buttonTray': _buttonTray
        };
    }
};