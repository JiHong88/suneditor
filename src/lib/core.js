/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

import _Constructor from './constructor';
import _Context from './context';
import _history from './history';
import _util from './util';
import _notice from '../plugins/modules/_notice';

/**
 * @description SunEditor constuctor function.
 * create core object and event registration.
 * core, event, functions
 * @param {Object} context
 * @param {Object} pluginCallButtons
 * @param {Object} plugins 
 * @param {Object} lang
 * @param {Object} options
 * @param {Object} _icons
 * @returns {Object} functions Object
 */
export default function (context, pluginCallButtons, plugins, lang, options, _icons, _responsiveButtons) {
    const _d = context.element.originElement.ownerDocument || document;
    const _w = _d.defaultView || window;
    const util = _util;
    const icons = _icons;

    /**
     * @description editor core object
     * should always bind this object when registering an event in the plug-in.
     */
    const core = {
        _d: _d,
        _w: _w,
        _parser: new _w.DOMParser(),

        /**
         * @description Document object of the iframe if created as an iframe || _d
         * @private
         */
        _wd: null,

        /**
         * @description Window object of the iframe if created as an iframe || _w
         * @private
         */
        _ww: null,
        
        /**
         * @description Closest ShadowRoot to editor if found
         * @private
         */
        _shadowRoot: null,

        /**
         * @description Util object
         */
        util: util,

        /**
         * @description Functions object
         */
        functions: null,

        /**
         * @description Notice object
         */
        notice: _notice,

        /**
         * @description Default icons object
         */
        icons: icons,

        /**
         * @description History object for undo, redo
         */
        history: null,
        
        /**
         * @description Elements and user options parameters of the suneditor
         */
        context: context,

        /**
         * @description Plugin buttons
         */
        pluginCallButtons: pluginCallButtons,

        /**
         * @description Loaded plugins
         */
        plugins: plugins || {},

        /**
         * @description Whether the plugin is initialized
         */
        initPlugins: {},

        /**
         * @description Object for managing submenu elements
         * @private
         */
        _targetPlugins: {},

        /**
         * @description Save rendered submenus and containers
         * @private
         */
        _menuTray: {},

        /**
         * @description loaded language
         */
        lang: lang,

        /**
         * @description The selection node (core.getSelectionNode()) to which the effect was last applied
         */
        effectNode: null,

        /**
         * @description submenu element
         */
        submenu: null,

        /**
         * @description container element
         */
        container: null,

        /**
         * @description current subment name
         * @private
         */
        _submenuName: '',

        /**
         * @description binded submenuOff method
         * @private
         */
        _bindedSubmenuOff: null,

        /**
         * @description binded containerOff method
         * @private
         */
        _bindedContainerOff: null,

        /**
         * @description active button element in submenu
         */
        submenuActiveButton: null,

        /**
         * @description active button element in container
         */
        containerActiveButton: null,

        /**
         * @description The elements array to be processed unvisible when the controllersOff function is executed (resizing, link modified button, table controller)
         */
        controllerArray: [],

        /**
         * @description The name of the plugin that called the currently active controller
         */
        currentControllerName: '',

        /**
         * @description The target element of current controller
         */
        currentControllerTarget: null,

        /**
         * @description An array of buttons whose class name is not "se-code-view-enabled"
         */
        codeViewDisabledButtons: null,

        /**
         * @description An array of buttons whose class name is not "se-resizing-enabled"
         */
        resizingDisabledButtons: null,

        /**
         * @description active more layer element in submenu
         * @private
         */
        _moreLayerActiveButton: null,

        /**
         * @description Tag whitelist RegExp object used in "_consistencyCheckOfHTML" method
         * ^(options._editorTagsWhitelist)$
         * @private
         */
        _htmlCheckWhitelistRegExp: null,

        /**
         * @description Editor tags whitelist (RegExp object)
         * util.createTagsWhitelist(options._editorTagsWhitelist)
         */
        editorTagsWhitelistRegExp: null,

        /**
         * @description Tag whitelist when pasting (RegExp object)
         * util.createTagsWhitelist(options.pasteTagsWhitelist)
         */
        pasteTagsWhitelistRegExp: null,

        /**
         * @description Boolean value of whether the editor has focus
         */
        hasFocus: false,

        /**
         * @description Boolean value of whether the editor is disabled
         */
        isDisabled: false,

        /**
         * @description Attributes whitelist used by the cleanHTML method
         * @private
         */
        _attributesWhitelistRegExp: null,

        /**
         * @description Attributes of tags whitelist used by the cleanHTML method
         * @private
         */
        _attributesTagsWhitelist: null,

        /**
         * @description binded controllersOff method
         * @private
         */
        _bindControllersOff: null,

        /**
         * @description Is inline mode?
         * @private
         */
        _isInline: null,

        /**
         * @description Is balloon|balloon-always mode?
         * @private
         */
        _isBalloon: null,

        /**
         * @description Is balloon-always mode?
         * @private
         */
        _isBalloonAlways: null,

        /**
         * @description Required value when using inline mode to sticky toolbar
         * @private
         */
        _inlineToolbarAttr: {top: '', width: '', isShow: false},

        /**
         * @description Variable that controls the "blur" event in the editor of inline or balloon mode when the focus is moved to submenu
         * @private
         */
        _notHideToolbar: false,

        /**
         * @description Variable value that sticky toolbar mode
         * @private
         */
        _sticky: false,

        /**
         * @description Variables for controlling focus and blur events
         * @private
         */
        _antiBlur: false,

        /**
         * @description Component line breaker element
         * @private
         */
        _lineBreaker: null,
        _lineBreakerButton: null,

        /**
         * @description If true, (initialize, reset) all indexes of image, video information
         * @private
         */
        _componentsInfoInit: true,
        _componentsInfoReset: false,

        /**
         * @description Plugins array with "active" method.
         * "activePlugins" runs the "add" method when creating the editor.
         */
        activePlugins: null,

        /**
         * @description Array of "checkFileInfo" functions with the core bound
         * (Plugins with "checkFileInfo" and "resetFileInfo" methods)
         * "fileInfoPlugins" runs the "add" method when creating the editor.
         * "checkFileInfo" method is always call just before the "change" event.
         * @private
         */
        _fileInfoPluginsCheck: null,

        /**
         * @description Array of "resetFileInfo" functions with the core bound
         * (Plugins with "checkFileInfo" and "resetFileInfo" methods)
         * "checkFileInfo" method is always call just before the "functions.setOptions" method.
         * @private
         */
        _fileInfoPluginsReset: null,

        /**
         * @description Variables for file component management
         * @private
         */
        _fileManager: {
            tags: null,
            regExp: null,
            queryString: null,
            pluginRegExp: null,
            pluginMap: null
        },

        /**
         * @description Elements that need to change text or className for each selection change
         * After creating the editor, "activePlugins" are added.
         * @property {Element} STRONG bold button
         * @property {Element} U underline button
         * @property {Element} EM italic button
         * @property {Element} DEL strike button
         * @property {Element} SUB subscript button
         * @property {Element} SUP superscript button
         * @property {Element} OUTDENT outdent button
         * @property {Element} INDENT indent button
         */
        commandMap: null,

        /**
         * @description Map of default command
         * @private
         */
        _defaultCommand: {
            bold: 'STRONG',
            underline: 'U',
            italic: 'EM',
            strike: 'DEL',
            subscript: 'SUB',
            superscript: 'SUP'
        },

        /**
         * @description Variables used internally in editor operation
         * @property {Boolean} isCodeView State of code view
         * @property {Boolean} isFullScreen State of full screen
         * @property {Number} innerHeight_fullScreen InnerHeight in editor when in full screen
         * @property {Number} resizeClientY Remember the vertical size of the editor before resizing the editor (Used when calculating during resize operation)
         * @property {Number} tabSize Indent size of tab (4)
         * @property {Number} codeIndent Indent size of Code view mode (4)
         * @property {Number} minResizingSize Minimum size of editing area when resized {Number} (.se-wrapper-inner {min-height: 65px;} || 65)
         * @property {Array} currentNodes  An array of the current cursor's node structure
         * @private
         */
        _variable: {
            isCodeView: false,
            isFullScreen: false,
            innerHeight_fullScreen: 0,
            resizeClientY: 0,
            tabSize: 4,
            codeIndent: 4,
            minResizingSize: util.getNumber((context.element.wysiwygFrame.style.minHeight || '65'), 0),
            currentNodes: [],
            _range: null,
            _selectionNode: null,
            _originCssText: context.element.topArea.style.cssText,
            _bodyOverflow: '',
            _editorAreaOriginCssText: '',
            _wysiwygOriginCssText: '',
            _codeOriginCssText: '',
            _fullScreenAttrs: {sticky: false, balloon: false, inline: false},
            _lineBreakComp: null,
            _lineBreakDir: ''
        },

        /**
         * @description If the plugin is not added, add the plugin and call the 'add' function.
         * If the plugin is added call callBack function.
         * @param {String} pluginName The name of the plugin to call
         * @param {function} callBackFunction Function to be executed immediately after module call
         * @param {Element|null} _target Plugin target button (This is not necessary if you have a button list when creating the editor)
         */
        callPlugin: function (pluginName, callBackFunction, _target) {
            _target = _target || pluginCallButtons[pluginName];

            if (!this.plugins[pluginName]) {
                throw Error('[SUNEDITOR.core.callPlugin.fail] The called plugin does not exist or is in an invalid format. (pluginName:"' + pluginName + '")');
            } else if (!this.initPlugins[pluginName]){
                this.plugins[pluginName].add(this, _target);
                this.initPlugins[pluginName] = true;
            } else if (typeof this._targetPlugins[pluginName] === 'object' && !!_target) {
                this.initMenuTarget(pluginName, _target, this._targetPlugins[pluginName]);
            }

            if (this.plugins[pluginName].active && !this.commandMap[pluginName] && !!_target) {
                this.commandMap[pluginName] = _target;
                this.activePlugins.push(pluginName);
            }
                
            if (typeof callBackFunction === 'function') callBackFunction();
        },

        /**
         * @description If the module is not added, add the module and call the 'add' function
         * @param {Array} moduleArray module object's Array [dialog, resizing]
         */
        addModule: function (moduleArray) {
            for (let i = 0, len = moduleArray.length, moduleName; i < len; i++) {
                moduleName = moduleArray[i].name;
                if (!this.plugins[moduleName]) {
                    this.plugins[moduleName] = moduleArray[i];
                }
                if (!this.initPlugins[moduleName]) {
                    this.initPlugins[moduleName] = true;
                    if (typeof this.plugins[moduleName].add === 'function') this.plugins[moduleName].add(this);
                }
            }
        },

        /**
         * @description Method for managing submenu element.
         * You must add the "submenu" element using the this method at custom plugin.
         * @param {String} pluginName Plugin name
         * @param {Element|null} target Target button
         * @param {Element} menu Submenu element
         */
        initMenuTarget: function (pluginName, target, menu) {
            if (!target) {
                this._targetPlugins[pluginName] = menu;
            } else {
                context.element._menuTray.appendChild(menu);
                this._targetPlugins[pluginName] = true;
                this._menuTray[target.getAttribute('data-command')] = menu;
            }
        },

        /**
         * @description Enabled submenu
         * @param {Element} element Submenu's button element to call
         */
        submenuOn: function (element) {
            if (this._bindedSubmenuOff) this._bindedSubmenuOff();
            if (this._bindControllersOff) this.controllersOff();

            const submenuName = this._submenuName = element.getAttribute('data-command');
            const menu = this.submenu = this._menuTray[submenuName];
            this.submenuActiveButton = element;
            this._setMenuPosition(element, menu);
            
            this._bindedSubmenuOff = this.submenuOff.bind(this);
            this.addDocEvent('mousedown', this._bindedSubmenuOff, false);

            if (this.plugins[submenuName].on) this.plugins[submenuName].on.call(this);
            this._antiBlur = true;
        },

        /**
         * @description Disable submenu
         */
        submenuOff: function () {
            this.removeDocEvent('mousedown', this._bindedSubmenuOff);
            this._bindedSubmenuOff = null;

            if (this.submenu) {
                this._submenuName = '';
                this.submenu.style.display = 'none';
                this.submenu = null;
                util.removeClass(this.submenuActiveButton, 'on');
                this.submenuActiveButton = null;
                this._notHideToolbar = false;
            }

            this._antiBlur = false;
        },

        /**
         * @description Enabled container
         * @param {Element} element Container's button element to call
         */
        containerOn: function (element) {
            if (this._bindedContainerOff) this._bindedContainerOff();

            const containerName = this._containerName = element.getAttribute('data-command');
            const menu = this.container = this._menuTray[containerName];
            this.containerActiveButton = element;
            this._setMenuPosition(element, menu);
            
            this._bindedContainerOff = this.containerOff.bind(this);
            this.addDocEvent('mousedown', this._bindedContainerOff, false);

            if (this.plugins[containerName].on) this.plugins[containerName].on.call(this);
            this._antiBlur = true;
        },

        /**
         * @description Disable container
         */
        containerOff: function () {
            this.removeDocEvent('mousedown', this._bindedContainerOff);
            this._bindedContainerOff = null;

            if (this.container) {
                this._containerName = '';
                this.container.style.display = 'none';
                this.container = null;
                util.removeClass(this.containerActiveButton, 'on');
                this.containerActiveButton = null;
                this._notHideToolbar = false;
            }

            this._antiBlur = false;
        },

        /**
         * @description Set the menu position. (submenu, container)
         * @param {*} element Button element
         * @param {*} menu Menu element
         * @private
         */
        _setMenuPosition: function (element, menu) {
            menu.style.top = '-10000px';
            menu.style.visibility = 'hidden';
            menu.style.display = 'block';
            util.addClass(element, 'on');

            const toolbar = this.context.element.toolbar;
            const toolbarW = toolbar.offsetWidth;
            const menuW = menu.offsetWidth;
            const l = element.parentElement.offsetLeft + 3;
            const overLeft = toolbarW <= menuW ? 0 : toolbarW - (l + menuW);
            if (overLeft < 0) menu.style.left = (l + overLeft) + 'px';
            else menu.style.left = l + 'px';

            let t = 0, bt = 0;
            let offsetEl = element;
            while (offsetEl && offsetEl !== toolbar) {
                t += offsetEl.offsetTop;
                offsetEl = offsetEl.offsetParent;
            }
            bt = t;

            if (this._isBalloon) {
                t += toolbar.offsetTop + element.offsetHeight;
            } else {
                t -= element.offsetHeight;
            }

            const space = t + menu.offsetHeight - context.element.wysiwyg.offsetHeight + 3;
            if (space > 0 && event._getPageBottomSpace() < space) {
                menu.style.top = (-1 * (menu.offsetHeight + 3)) + 'px';
            } else {
                menu.style.top = (bt + element.parentElement.offsetHeight) + 'px';
            }

            menu.style.visibility = '';
        },

        /**
         * @description Show controller at editor area (controller elements, function, "controller target element(@Required)", "controller name(@Required)", etc..)
         * @param {*} arguments controller elements, functions..
         */
        controllersOn: function () {
            if (this._bindControllersOff) this._bindControllersOff();
            this.controllerArray = [];

            for (let i = 0, arg; i < arguments.length; i++) {
                arg = arguments[i];
                if (!arg) continue;
                
                if (typeof arg === 'string') {
                    this.currentControllerName = arg;
                    continue;
                }
                if (typeof arg === 'function') {
                    this.controllerArray.push(arg);
                    continue;
                }
                if (!util.hasClass(arg, 'se-controller')) {
                    this.currentControllerTarget = arg;
                    continue;
                }
                if (arg.style) arg.style.display = 'block';
                this.controllerArray.push(arg);
            }

            this._bindControllersOff = this.controllersOff.bind(this);
            this.addDocEvent('mousedown', this._bindControllersOff, false);
            this.addDocEvent('keydown', this._bindControllersOff, false);
            this._antiBlur = true;

            if (typeof functions.showController === 'function') functions.showController(this.currentControllerName, this.controllerArray, this);
        },

        /**
         * @description Hide controller at editor area (link button, image resize button..)
         * @param {KeyboardEvent|MouseEvent|null} e Event object when called from mousedown and keydown events registered in "core.controllersOn"
         */
        controllersOff: function (e) {
            if (this._fileManager.pluginRegExp.test(this.currentControllerName) && e && e.type === 'keydown' && e.keyCode !== 27) return;

            this.currentControllerName = '';
            this.currentControllerTarget = null;
            this.effectNode = null;
            if (!this._bindControllersOff) return;

            this.removeDocEvent('mousedown', this._bindControllersOff);
            this.removeDocEvent('keydown', this._bindControllersOff);
            this._bindControllersOff = null;

            const len = this.controllerArray.length;
            if (len > 0) {
                for (let i = 0; i < len; i++) {
                    if (typeof this.controllerArray[i] === 'function') this.controllerArray[i]();
                    else this.controllerArray[i].style.display = 'none';
                }

                this.controllerArray = [];
            }

            this._antiBlur = false;
        },

        /**
         * @description javascript execCommand
         * @param {String} command javascript execCommand function property
         * @param {Boolean} showDefaultUI javascript execCommand function property
         * @param {String} value javascript execCommand function property
         */
        execCommand: function (command, showDefaultUI, value) {
            this._wd.execCommand(command, showDefaultUI, (command === 'formatBlock' ? '<' + value + '>' : value));
            // history stack
            this.history.push(true);
        },

        /**
         * @description Focus to wysiwyg area using "native focus function"
         */
        nativeFocus: function () {
            const caption = util.getParentElement(this.getSelectionNode(), 'figcaption');
            if (caption) {
                caption.focus();
            } else {
                context.element.wysiwyg.focus();
            }

            this._editorRange();
        },

        /**
         * @description Focus to wysiwyg area
         */
        focus: function () {
            if (context.element.wysiwygFrame.style.display === 'none') return;

            if (options.iframe) {
                this.nativeFocus();
            } else {
                try {
                    const range = this.getRange();

                    if (range.startContainer === range.endContainer && util.isWysiwygDiv(range.startContainer)) {
                        const format = util.createElement('P');
                        const br = util.createElement('BR');
                        format.appendChild(br);
                        this.setRange(br, 0, br, 0);
                    } else {
                        this.setRange(range.startContainer, range.startOffset, range.endContainer, range.endOffset);
                    }
                } catch (e) {
                    this.nativeFocus();
                }
            }

            event._applyTagEffects();
            if (core._isBalloon) event._toggleToolbarBalloon();
        },

        /**
         * @description If "focusEl" is a component, then that component is selected; if it is a format element, the last text is selected
         * If "focusEdge" is null, then selected last element
         * @param {Element|null} focusEl Focus element
         */
        focusEdge: function (focusEl) {
            if (!focusEl) focusEl = context.element.wysiwyg.lastElementChild;

            const fileComponentInfo = this.getFileComponent(focusEl);
            if (fileComponentInfo) {
                this.selectComponent(fileComponentInfo.component, fileComponentInfo.pluginName);
            } else if (focusEl) {
                focusEl = util.getChildElement(focusEl, function (current) { return current.childNodes.length === 0 || current.nodeType === 3; }, true);
                if (!focusEl) this.nativeFocus();
                else this.setRange(focusEl, focusEl.textContent.length, focusEl, focusEl.textContent.length);
            } else {
                this.nativeFocus();
            }
        },

        /**
         * @description Set current editor's range object
         * @param {Node} startCon The startContainer property of the selection object.
         * @param {Number} startOff The startOffset property of the selection object.
         * @param {Node} endCon The endContainer property of the selection object.
         * @param {Number} endOff The endOffset property of the selection object.
         */
        setRange: function (startCon, startOff, endCon, endOff) {
            if (!startCon || !endCon) return;
            if (startOff > startCon.textContent.length) startOff = startCon.textContent.length;
            if (endOff > endCon.textContent.length) endOff = endCon.textContent.length;
            
            const range = this._wd.createRange();

            try {
                range.setStart(startCon, startOff);
                range.setEnd(endCon, endOff);
            } catch (error) {
                this.nativeFocus();
            }

            const selection = this.getSelection();

            if (selection.removeAllRanges) {
                selection.removeAllRanges();
            }

            selection.addRange(range);
            this._editorRange();
            if (options.iframe) this.nativeFocus();
        },

        /**
         * @description Remove range object and button effect
         */
        removeRange: function () {
            this._variable._range = null;
            this._variable._selectionNode = null;
            this.getSelection().removeAllRanges();

            const commandMap = this.commandMap;
            const activePlugins = this.activePlugins;
            for (let key in commandMap) {
                if (activePlugins.indexOf(key) > -1) {
                    plugins[key].active.call(core, null);
                }
                else if (commandMap.OUTDENT && /^OUTDENT$/i.test(key)) {
                    commandMap.OUTDENT.setAttribute('disabled', true);
                }
                else if (commandMap.INDENT && /^INDENT$/i.test(key)) {
                    commandMap.INDENT.removeAttribute('disabled');
                }
                else {
                    util.removeClass(commandMap[key], 'active');
                }
            }
        },

        /**
         * @description Get current editor's range object
         * @returns {Object}
         */
        getRange: function () {
            return this._variable._range || this._createDefaultRange();
        },

        /**
         * @description Get window selection obejct
         * @returns {Object}
         */
        getSelection: function () {
            return this._shadowRoot && this._shadowRoot.getSelection ? this._shadowRoot.getSelection() : this._ww.getSelection();
        },

        /**
         * @description Get current select node
         * @returns {Node}
         */
        getSelectionNode: function () {
            if (!this._variable._selectionNode || util.isWysiwygDiv(this._variable._selectionNode)) this._editorRange();
            return this._variable._selectionNode || context.element.wysiwyg.firstChild;
        },

        /**
         * @description Saving the range object and the currently selected node of editor
         * @private
         */
        _editorRange: function () {
            const selection = this.getSelection();
            let range = null;
            let selectionNode = null;

            if (selection.rangeCount > 0) {
                range = selection.getRangeAt(0);
            }
            else {
                range = this._createDefaultRange();
            }

            this._variable._range = range;

            if (range.collapsed) {
                selectionNode = range.commonAncestorContainer;
            } else {
                selectionNode = selection.extentNode || selection.anchorNode;
            }

            this._variable._selectionNode = selectionNode;
        },

        /**
         * @description Return the range object of editor's first child node
         * @returns {Object}
         * @private
         */
        _createDefaultRange: function () {
            context.element.wysiwyg.focus();
            const range = this._wd.createRange();
            if (!context.element.wysiwyg.firstChild) this.execCommand('formatBlock', false, 'P');

            range.setStart(context.element.wysiwyg.firstChild, 0);
            range.setEnd(context.element.wysiwyg.firstChild, 0);
            
            return range;
        },

        /**
         * @description Reset range object to text node selected status.
         * @private
         */
        _resetRangeToTextNode: function () {
            const range = this.getRange();
            let startCon = range.startContainer;
            let startOff = range.startOffset;
            let endCon = range.endContainer;
            let endOff = range.endOffset;
            let tempCon, tempOffset, tempChild;

            if (util.isFormatElement(startCon)) {
                startCon = startCon.childNodes[startOff];
                startOff = 0;
            }
            if (util.isFormatElement(endCon)) {
                endCon = endCon.childNodes[endOff];
                endOff = 0;
            }

            // startContainer
            tempCon = util.isWysiwygDiv(startCon) ? context.element.wysiwyg.firstChild : startCon;
            tempOffset = startOff;

            if (util.isBreak(tempCon) || (tempCon.nodeType === 1 && tempCon.childNodes.length > 0)) {
                const onlyBreak = util.isBreak(tempCon);
                if (!onlyBreak) {
                    while (tempCon && !util.isBreak(tempCon) && tempCon.nodeType === 1) {
                        tempCon = tempCon.childNodes[tempOffset] || tempCon.nextElementSibling || tempCon.nextSibling;
                        tempOffset = 0;
                    }
    
                    let format = util.getFormatElement(tempCon, null);
                    if (format === util.getRangeFormatElement(format, null)) {
                        format = util.createElement(util.getParentElement(tempCon, util.isCell) ? 'DIV' : 'P');
                        tempCon.parentNode.insertBefore(format, tempCon);
                        format.appendChild(tempCon);
                    }
                }

                if (util.isBreak(tempCon)) {
                    const emptyText = util.createTextNode(util.zeroWidthSpace);
                    tempCon.parentNode.insertBefore(emptyText, tempCon);
                    tempCon = emptyText;
                    if (onlyBreak) {
                        if (startCon === endCon) {
                            endCon = tempCon;
                            endOff = 1;
                        }
                    }
                }
            }

            // set startContainer
            startCon = tempCon;
            startOff = tempOffset;

            // endContainer
            tempCon = util.isWysiwygDiv(endCon) ? context.element.wysiwyg.lastChild : endCon;
            tempOffset = endOff;

            if (util.isBreak(tempCon) || (tempCon.nodeType === 1 && tempCon.childNodes.length > 0)) {
                const onlyBreak = util.isBreak(tempCon);
                if (!onlyBreak) {
                    while (tempCon && !util.isBreak(tempCon) && tempCon.nodeType === 1) {
                        tempChild = tempCon.childNodes;
                        if (tempChild.length === 0) break;
                        tempCon = tempChild[tempOffset > 0 ? tempOffset - 1 : tempOffset] || !/FIGURE/i.test(tempChild[0].nodeName) ? tempChild[0] : (tempCon.previousElementSibling || tempCon.previousSibling || startCon);
                        tempOffset = tempOffset > 0 ? tempCon.textContent.length : tempOffset;
                    }
    
                    let format = util.getFormatElement(tempCon, null);
                    if (format === util.getRangeFormatElement(format, null)) {
                        format = util.createElement(util.isCell(format) ? 'DIV' : 'P');
                        tempCon.parentNode.insertBefore(format, tempCon);
                        format.appendChild(tempCon);
                    }
                }

                if (util.isBreak(tempCon)) {
                    const emptyText = util.createTextNode(util.zeroWidthSpace);
                    tempCon.parentNode.insertBefore(emptyText, tempCon);
                    tempCon = emptyText;
                    tempOffset = 1;
                    if (onlyBreak && !tempCon.previousSibling) {
                        util.removeItem(endCon);
                    }
                }
            }

            // set endContainer
            endCon = tempCon;
            endOff = tempOffset;

            // set Range
            this.setRange(startCon, startOff, endCon, endOff);
        },

        /**
         * @description Returns a "formatElement"(util.isFormatElement) array from the currently selected range.
         * @param {Function|null} validation The validation function. (Replaces the default validation function-util.isFormatElement(current))
         * @returns {Array}
         */
        getSelectedElements: function (validation) {
            this._resetRangeToTextNode();
            let range = this.getRange();

            if (util.isWysiwygDiv(range.startContainer)) {
                const children = context.element.wysiwyg.children;

                if (children.length === 0) return null;
                this.setRange(children[0], 0, children[children.length - 1], children[children.length - 1].textContent.trim().length);
                range = this.getRange();
            }

            const startCon = range.startContainer;
            const endCon = range.endContainer;
            const commonCon = range.commonAncestorContainer;

            // get line nodes
            const lineNodes = util.getListChildren(commonCon, function (current) {
                return validation ? validation(current) : util.isFormatElement(current);
            });

            if (!util.isWysiwygDiv(commonCon) && !util.isRangeFormatElement(commonCon)) lineNodes.unshift(util.getFormatElement(commonCon, null));
            if (startCon === endCon || lineNodes.length === 1) return lineNodes;

            let startLine = util.getFormatElement(startCon, null);
            let endLine = util.getFormatElement(endCon, null);
            let startIdx = null;
            let endIdx = null;
            
            const onlyTable = function (current) {
                return util.isTable(current) ? /^TABLE$/i.test(current.nodeName) : true;
            };

            let startRangeEl = util.getRangeFormatElement(startLine, onlyTable);
            let endRangeEl = util.getRangeFormatElement(endLine, onlyTable);
            if (util.isTable(startRangeEl) && util.isListCell(startRangeEl.parentNode)) startRangeEl = startRangeEl.parentNode;
            if (util.isTable(endRangeEl) && util.isListCell(endRangeEl.parentNode)) endRangeEl = endRangeEl.parentNode;
            
            const sameRange = startRangeEl === endRangeEl;
            for (let i = 0, len = lineNodes.length, line; i < len; i++) {
                line = lineNodes[i];

                if (startLine === line || (!sameRange && line === startRangeEl)) {
                    startIdx = i;
                    continue;
                }

                if (endLine === line || (!sameRange && line === endRangeEl)) {
                    endIdx = i;
                    break;
                }
            }

            if (startIdx === null) startIdx = 0;
            if (endIdx === null) endIdx = lineNodes.length - 1;

            return lineNodes.slice(startIdx, endIdx + 1);
        },

        /**
         * @description Get format elements and components from the selected area. (P, DIV, H[1-6], OL, UL, TABLE..)
         * If some of the component are included in the selection, get the entire that component.
         * @param {Boolean} removeDuplicate If true, if there is a parent and child tag among the selected elements, the child tag is excluded.
         * @returns {Array}
         */
        getSelectedElementsAndComponents: function (removeDuplicate) {
            const commonCon = this.getRange().commonAncestorContainer;
            const myComponent = util.getParentElement(commonCon, util.isComponent);
            const selectedLines = util.isTable(commonCon) ? 
                this.getSelectedElements(null) :
                this.getSelectedElements(function (current) {
                    const component = this.getParentElement(current, this.isComponent);
                    return (this.isFormatElement(current) && (!component || component === myComponent)) || (this.isComponent(current) && !this.getFormatElement(current));
                }.bind(util));
            
            if (removeDuplicate) {
                for (let i = 0, len = selectedLines.length; i < len; i++) {
                    for (let j = i - 1; j >= 0; j--) {
                        if (selectedLines[j].contains(selectedLines[i])) {
                            selectedLines.splice(i, 1);
                            i--; len--;
                            break;
                        }
                    }
                }
            }

            return selectedLines;
        },

        /**
         * @description Determine if this offset is the edge offset of container
         * @param {Node} container The node of the selection object. (range.startContainer..)
         * @param {Number} offset The offset of the selection object. (core.getRange().startOffset...)
         * @returns {Boolean}
         */
        isEdgePoint: function (container, offset) {
            return (offset === 0) || (!container.nodeValue && offset === 1) || (offset === container.nodeValue.length);
        },

        /**
         * @description Show loading box
         */
        showLoading: function () {
            context.element.loading.style.display = 'block';
        },

        /**
         * @description Close loading box
         */
        closeLoading: function () {
            context.element.loading.style.display = 'none';
        },

        /**
         * @description Append format element to sibling node of argument element.
         * If the "formatNodeName" argument value is present, the tag of that argument value is inserted,
         * If not, the currently selected format tag is inserted.
         * @param {Element} element Insert as siblings of that element
         * @param {String|Element|null} formatNode Node name or node obejct to be inserted
         * @returns {Element}
         */
        appendFormatTag: function (element, formatNode) {
            const currentFormatEl = util.getFormatElement(this.getSelectionNode(), null);
            const oFormatName = formatNode ? (typeof formatNode === 'string' ? formatNode : formatNode.nodeName) : (util.isFormatElement(currentFormatEl) && !util.isFreeFormatElement(currentFormatEl)) ? currentFormatEl.nodeName : 'P';
            const oFormat = util.createElement(oFormatName);
            oFormat.innerHTML = '<br>';

            if ((formatNode && typeof formatNode !== 'string') || (!formatNode && util.isFormatElement(currentFormatEl))) {
                util.copyTagAttributes(oFormat, formatNode || currentFormatEl);
            }

            if (util.isCell(element)) element.insertBefore(oFormat, element.nextElementSibling);
            else element.parentNode.insertBefore(oFormat, element.nextElementSibling);

            return oFormat;
        },

        /**
         * @description The method to insert a element. (used elements : table, hr, image, video)
         * This method is add the element next line and insert the new line.
         * When used in a tag in "LI", it is inserted into the LI tag.
         * Returns the first node of next line added.
         * @param {Element} element Element to be inserted
         * @param {Boolean} notHistoryPush When true, it does not update the history stack and the selection object and return EdgeNodes (util.getEdgeChildNodes)
         * @returns {Element}
         */
        insertComponent: function (element, notHistoryPush) {
            const r = this.removeNode();
            let oNode = null;
            let selectionNode = this.getSelectionNode();
            let formatEl = util.getFormatElement(selectionNode, null);

            if (util.isListCell(formatEl)) {
                if (/^HR$/i.test(element.nodeName)) {
                    const newLi = util.createElement('LI');
                    const textNode = util.createTextNode(util.zeroWidthSpace);
                    newLi.appendChild(element);
                    newLi.appendChild(textNode);
                    formatEl.parentNode.insertBefore(newLi, formatEl.nextElementSibling);
                    this.setRange(textNode, 1, textNode, 1);
                } else {
                    this.insertNode(element, selectionNode === formatEl ? null : r.container.nextSibling);
                    if (!element.nextSibling) element.parentNode.appendChild(util.createElement('BR'));
                    oNode = util.createElement('LI');
                    formatEl.parentNode.insertBefore(oNode, formatEl.nextElementSibling);
                }
            } else {
                if (this.getRange().collapsed && (r.container.nodeType === 3 || util.isBreak(r.container))) {
                    const depthFormat = util.getParentElement(r.container, function (current) { return this.isRangeFormatElement(current); }.bind(util));
                    oNode = util.splitElement(r.container, r.offset, !depthFormat ? 0 : util.getElementDepth(depthFormat) + 1);
                    if (oNode) formatEl = oNode.previousSibling;
                }

                this.insertNode(element, formatEl);
                if (!oNode) oNode = this.appendFormatTag(element, util.isFormatElement(formatEl) ? formatEl : null);
            }

            const edgeNode = util.getEdgeChildNodes(oNode, null).sc;
            oNode = edgeNode || oNode;
            this.setRange(oNode, 0, oNode, 0);

            // history stack
            if (!notHistoryPush) this.history.push(1);

            return oNode;
        },

        /**
         * @description Gets the file component and that plugin name
         * return: {component, pluginName} | null
         * @param {Element} element Target element (figure tag, component div, file tag)
         * @returns {Object|null}
         */
        getFileComponent: function (element) {
            let fileComponent, pluginName;
            if (/^FIGURE$/i.test(element.nodeName) || /se-component/.test(element.className)) {
                fileComponent = element.querySelector(core._fileManager.queryString);
            }
            if (!fileComponent && element.nodeName && core._fileManager.regExp.test(element.nodeName)) {
                fileComponent = element;
            }

            if (fileComponent) {
                pluginName = core._fileManager.pluginMap[fileComponent.nodeName.toLowerCase()];
                if (pluginName) {
                    return {
                        component: fileComponent,
                        pluginName: pluginName
                    };
                }
            }

            return null;
        },

        /**
         * @description The component(image, video) is selected and the resizing module is called.
         * @param {Element} element Element tag (img, iframe, video)
         * @param {String} pluginName Plugin name (image, video)
         */
        selectComponent: function (element, pluginName) {
            const plugin = core.plugins[pluginName];
            if (!plugin || !plugin.select) return;
            this.callPlugin(pluginName, plugin.select.bind(this, element), null);
        },

        /**
         * @description Delete selected node and insert argument value node
         * If the "afterNode" exists, it is inserted after the "afterNode"
         * Inserting a text node merges with both text nodes on both sides and returns a new "{ startOffset, endOffset }".
         * @param {Node} oNode Element to be inserted
         * @param {Node|null} afterNode If the node exists, it is inserted after the node
         * @returns {undefined|Object}
         */
        insertNode: function (oNode, afterNode) {
            const isComp = util.isFormatElement(oNode) || util.isRangeFormatElement(oNode) || util.isComponent(oNode);

            if (!afterNode && isComp) {
                const r = this.removeNode();
                if (r.container.nodeType === 3 || util.isBreak(r.container)) {
                    const depthFormat = util.getParentElement(r.container, function (current) { return this.isRangeFormatElement(current); }.bind(util));
                    afterNode = util.splitElement(r.container, r.offset, !depthFormat ? 0 : util.getElementDepth(depthFormat) + 1);
                    if (afterNode) afterNode = afterNode.previousSibling;
                }
            }

            const range = this.getRange();
            const startCon = range.startContainer;
            const startOff = range.startOffset;
            const endCon = range.endContainer;
            const endOff = range.endOffset;
            const commonCon = range.commonAncestorContainer;
            let parentNode, originAfter = null;

            if (!afterNode) {
                parentNode = startCon;
                if (startCon.nodeType === 3) {
                    parentNode = startCon.parentNode;
                }

                /** No Select range node */
                if (range.collapsed) {
                    if (commonCon.nodeType === 3) {
                        if (commonCon.textContent.length > endOff) afterNode = commonCon.splitText(endOff);
                        else afterNode = commonCon.nextSibling;
                    } else {
                        if (!util.isBreak(parentNode)) {
                            let c = parentNode.childNodes[startOff];
                            const focusNode = (c && c.nodeType === 3 && util.onlyZeroWidthSpace(c) && util.isBreak(c.nextSibling)) ? c.nextSibling : c;
                            if (focusNode) {
                                if (!focusNode.nextSibling) {
                                    parentNode.removeChild(focusNode);
                                    afterNode = null;
                                } else {
                                    afterNode = (util.isBreak(focusNode) && !util.isBreak(oNode)) ? focusNode : focusNode.nextSibling;
                                }
                            } else {
                                afterNode = null;
                            }
                        } else {
                            afterNode = parentNode;
                            parentNode = parentNode.parentNode;
                        }
                    }
                } else { /** Select range nodes */
                    const isSameContainer = startCon === endCon;

                    if (isSameContainer) {
                        if (this.isEdgePoint(endCon, endOff)) afterNode = endCon.nextSibling;
                        else afterNode = endCon.splitText(endOff);

                        let removeNode = startCon;
                        if (!this.isEdgePoint(startCon, startOff)) removeNode = startCon.splitText(startOff);

                        parentNode.removeChild(removeNode);
                        if (parentNode.childNodes.length === 0 && isComp) {
                            parentNode.innerHTML = '<br>';
                        }
                    }
                    else {
                        const removedTag = this.removeNode();
                        const container = removedTag.container;
                        const prevContainer = removedTag.prevContainer;
                        if (container && container.childNodes.length === 0 && isComp) {
                            if (util.isFormatElement(container)) {
                                container.innerHTML = '<br>';
                            } else if (util.isRangeFormatElement(container)) {
                                container.innerHTML = '<p><br></p>';
                            }
                        }

                        if (!isComp && prevContainer) {
                            parentNode = prevContainer.nodeType === 3 ? prevContainer.parentNode : prevContainer;
                            if (parentNode.contains(container)) {
                                afterNode = container;
                                while (afterNode.parentNode === parentNode) {
                                    afterNode = afterNode.parentNode;
                                }
                            } else {
                                afterNode = null;
                            }
                        } else {
                            parentNode = isComp ? commonCon : container;
                            afterNode = isComp ? endCon : null;
                        }

                        while (afterNode && afterNode.parentNode !== commonCon) {
                            afterNode = afterNode.parentNode;
                        }
                    }
                }
            }
            // has afterNode
            else {
                parentNode = afterNode.parentNode;
                afterNode = afterNode.nextSibling;
                originAfter = true;
            }

            // --- insert node ---
            try {
                if (util.isFormatElement(oNode) || util.isRangeFormatElement(oNode) || (!util.isListCell(parentNode) && util.isComponent(oNode))) {
                    const oldParent = parentNode;
                    if (util.isList(afterNode)) {
                        parentNode = afterNode;
                        afterNode = null;
                    } else if (!originAfter && !afterNode) {
                        const r = this.removeNode();
                        const container = r.container.nodeType === 3 ? (util.isListCell(util.getFormatElement(r.container, null)) ? r.container : (util.getFormatElement(r.container, null) || r.container.parentNode)) : r.container;
                        const rangeCon = util.isWysiwygDiv(container) || util.isRangeFormatElement(container);
                        parentNode = rangeCon ? container : container.parentNode;
                        afterNode = rangeCon ? null : container.nextSibling;
                    }

                    if (oldParent.childNodes.length === 0 && parentNode !== oldParent) util.removeItem(oldParent);
                }

                if (isComp && !util.isRangeFormatElement(parentNode) && !util.isListCell(parentNode) && !util.isWysiwygDiv(parentNode)) {
                    afterNode = parentNode.nextElementSibling;
                    parentNode = parentNode.parentNode;
                }
                parentNode.insertBefore(oNode, afterNode);
            } catch (e) {
                parentNode.appendChild(oNode);
            } finally {
                let offset = 1;
                if (oNode.nodeType === 3) {
                    const previous = oNode.previousSibling;
                    const next = oNode.nextSibling;
                    const previousText = (!previous ||  previous.nodeType !== 3 || util.onlyZeroWidthSpace(previous)) ? '' : previous.textContent;
                    const nextText = (!next || next.nodeType !== 3 || util.onlyZeroWidthSpace(next)) ? '' : next.textContent;
    
                    if (previous && previousText.length > 0) {
                        oNode.textContent = previousText + oNode.textContent;
                        util.removeItem(previous);
                    }
    
                    if (next && next.length > 0) {
                        oNode.textContent += nextText;
                        util.removeItem(next);
                    }

                    return {
                        startOffset: previousText.length,
                        endOffset: oNode.textContent.length - nextText.length
                    };
                } else if (!util.isBreak(oNode) && util.isFormatElement(parentNode)) {
                    let zeroWidth = null;
                    if (!oNode.previousSibling) {
                        zeroWidth = util.createTextNode(util.zeroWidthSpace);
                        oNode.parentNode.insertBefore(zeroWidth, oNode);
                    }
                    if (!oNode.nextSibling) {
                        zeroWidth = util.createTextNode(util.zeroWidthSpace);
                        oNode.parentNode.appendChild(zeroWidth);
                    }

                    if (util._isIgnoreNodeChange(oNode)) {
                        oNode = oNode.nextSibling;
                        offset = 0;
                    }
                }

                this.setRange(oNode, offset, oNode, offset);

                // history stack
                this.history.push(true);
            }
        },

        /**
         * @description Delete the currently selected nodes and reset selection range
         * Returns {container: "the last element after deletion", offset: "offset", prevContainer: "previousElementSibling Of the deleted area"}
         * @returns {Object}
         */
        removeNode: function () {
            const range = this.getRange();
            let container, offset = 0;
            let startCon = range.startContainer;
            let endCon = range.endContainer;
            const startOff = range.startOffset;
            const endOff = range.endOffset;
            const commonCon = range.commonAncestorContainer;

            let beforeNode = null;
            let afterNode = null;

            const childNodes = util.getListChildNodes(commonCon, null);
            let startIndex = util.getArrayIndex(childNodes, startCon);
            let endIndex = util.getArrayIndex(childNodes, endCon);

            if (childNodes.length > 0 && startIndex > -1 && endIndex > -1) {
                for (let i = startIndex + 1, startNode = startCon; i >= 0; i--) {
                    if (childNodes[i] === startNode.parentNode && childNodes[i].firstChild === startNode && startOff === 0) {
                        startIndex = i;
                        startNode = startNode.parentNode;
                    }
                }
    
                for (let i = endIndex - 1, endNode = endCon; i > startIndex; i--) {
                    if (childNodes[i] === endNode.parentNode && childNodes[i].nodeType === 1) {
                        childNodes.splice(i, 1);
                        endNode = endNode.parentNode;
                        --endIndex;
                    }
                }
            } else {
                if (childNodes.length === 0) {
                    if (util.isFormatElement(commonCon) || util.isRangeFormatElement(commonCon) || util.isWysiwygDiv(commonCon) || util.isBreak(commonCon) || util.isMedia(commonCon)) {
                        return {
                            container: commonCon,
                            offset: 0
                        };
                    }
                    childNodes.push(commonCon);
                    startCon = endCon = commonCon;
                } else {
                    startCon = endCon = childNodes[0];
                    if (util.isBreak(startCon)) {
                        return {
                            container: startCon,
                            offset: 0
                        };
                    }
                }

                startIndex = endIndex = 0;
            }

            function remove (item) {
                const format = util.getFormatElement(item, null);
                util.removeItem(item);

                if(util.isListCell(format)) {
                    const list = util.getArrayItem(format.children, util.isList, false);
                    if (list) {
                        const child = list.firstElementChild;
                        const children = child.childNodes;
                        while (children[0]) {
                            format.insertBefore(children[0], list);
                        }
                        util.removeItemAllParents(child, null, null);
                    }
                }
            }

            for (let i = startIndex; i <= endIndex; i++) {
                const item = childNodes[i];

                if (item.length === 0 || (item.nodeType === 3 && item.data === undefined)) {
                    remove(item);
                    continue;
                }

                if (item === startCon) {
                    if (startCon.nodeType === 1) {
                        beforeNode = util.createTextNode(startCon.textContent);
                    } else {
                        if (item === endCon) {
                            beforeNode = util.createTextNode(startCon.substringData(0, startOff) + endCon.substringData(endOff, (endCon.length - endOff)));
                            offset = startOff;
                        } else {
                            beforeNode = util.createTextNode(startCon.substringData(0, startOff));
                        }
                    }

                    if (beforeNode.length > 0) {
                        startCon.data = beforeNode.data;
                    } else {
                        remove(startCon);
                    }

                    if (item === endCon) break;
                    continue;
                }

                if (item === endCon) {
                    if (endCon.nodeType === 1) {
                        afterNode = util.createTextNode(endCon.textContent);
                    } else {
                        afterNode = util.createTextNode(endCon.substringData(endOff, (endCon.length - endOff)));
                    }

                    if (afterNode.length > 0) {
                        endCon.data = afterNode.data;
                    } else {
                        remove(endCon);
                    }

                    continue;
                }

                remove(item);
            }

            container = endCon && endCon.parentNode ? endCon : startCon && startCon.parentNode ? startCon : (range.endContainer || range.startContainer);
            
            if (!util.isWysiwygDiv(container)) {
                const rc = util.removeItemAllParents(container, null, null);
                if (rc) container = rc.sc || rc.ec || context.element.wysiwyg;
            }

            // set range
            this.setRange(container, offset, container, offset);
            // history stack
            this.history.push(true);

            return {
                container: container,
                offset: offset,
                prevContainer: startCon && startCon.parentNode ? startCon : null
            };
        },

        /**
         * @description Appended all selected format Element to the argument element and insert
         * @param {Element} rangeElement Element of wrap the arguments (BLOCKQUOTE...)
         */
        applyRangeFormatElement: function (rangeElement) {
            const rangeLines = this.getSelectedElementsAndComponents(false);
            if (!rangeLines || rangeLines.length === 0) return;

            linesLoop:
            for (let i = 0, len = rangeLines.length, line, nested, fEl, lEl, f, l; i < len; i++) {
                line = rangeLines[i];
                if (!util.isListCell(line)) continue;

                nested = line.lastElementChild;
                if (nested && util.isListCell(line.nextElementSibling) && rangeLines.indexOf(line.nextElementSibling) > -1) {
                    lEl = nested.lastElementChild;
                    if (rangeLines.indexOf(lEl) > -1) {
                        let list = null;
                        while ((list = lEl.lastElementChild)) {
                            if (util.isList(list)) {
                                if (rangeLines.indexOf(list.lastElementChild) > -1) {
                                    lEl = list.lastElementChild;
                                } else {
                                    continue linesLoop;
                                }
                            }
                        }

                        fEl = nested.firstElementChild;
                        f = rangeLines.indexOf(fEl);
                        l = rangeLines.indexOf(lEl);
                        rangeLines.splice(f, (l - f) + 1);
                        len = rangeLines.length;
                        continue;
                    }
                }
            }

            let last  = rangeLines[rangeLines.length - 1];
            let standTag, beforeTag, pElement;

            if (util.isRangeFormatElement(last) || util.isFormatElement(last)) {
                standTag = last;
            } else {
                standTag = util.getRangeFormatElement(last, null) || util.getFormatElement(last, null);
            }

            if (util.isCell(standTag)) {
                beforeTag = null;
                pElement = standTag;
            } else {
                beforeTag = standTag.nextSibling;
                pElement = standTag.parentNode;
            }
            
            let parentDepth = util.getElementDepth(standTag);
            let listParent = null;
            const lineArr = [];
            const removeItems = function (parent, origin, before) {
                let cc = null;
                if (parent !== origin && !util.isTable(origin)) {
                    if (origin && util.getElementDepth(parent) === util.getElementDepth(origin)) return before;
                    cc = util.removeItemAllParents(origin, null, parent);
                }

                return cc ? cc.ec : before;
            };
            
            for (let i = 0, len = rangeLines.length, line, originParent, depth, before, nextLine, nextList, nested; i < len; i++) {
                line = rangeLines[i];
                originParent = line.parentNode;
                if (!originParent || rangeElement.contains(originParent)) continue;

                depth = util.getElementDepth(line);

                if (util.isList(originParent)) {
                    if (listParent === null) {
                        if (nextList) {
                            listParent = nextList;
                            nested = true;
                            nextList = null;
                        } else {
                            listParent = originParent.cloneNode(false);
                        }
                    }

                    lineArr.push(line);
                    nextLine = rangeLines[i + 1];

                    if (i === len - 1 || (nextLine && nextLine.parentNode !== originParent)) {
                        // nested list
                        if (nextLine && line.contains(nextLine.parentNode)) {
                            nextList = nextLine.parentNode.cloneNode(false);
                        }

                        let list = originParent.parentNode, p;
                        while (util.isList(list)) {
                            p = util.createElement(list.nodeName);
                            p.appendChild(listParent);
                            listParent = p;
                            list = list.parentNode;
                        }

                        const edge = this.detachRangeFormatElement(originParent, lineArr, null, true, true);

                        if (parentDepth >= depth) {
                            parentDepth = depth;
                            pElement = edge.cc;
                            beforeTag = removeItems(pElement, originParent, edge.ec);
                            if (beforeTag) pElement = beforeTag.parentNode;
                        } else if (pElement === edge.cc) {
                            beforeTag = edge.ec;
                        }

                        if (pElement !== edge.cc) {
                            before = removeItems(pElement, edge.cc, before);
                            if (before !== undefined) beforeTag = before;
                            else beforeTag = edge.cc;
                        }

                        for (let c = 0, cLen = edge.removeArray.length; c < cLen; c++) {
                            listParent.appendChild(edge.removeArray[c]);
                        }

                        if (!nested) rangeElement.appendChild(listParent);
                        if (nextList) edge.removeArray[edge.removeArray.length - 1].appendChild(nextList);
                        listParent = null;
                        nested = false;
                    }
                }
                else {
                    if (parentDepth >= depth) {
                        parentDepth = depth;
                        pElement = originParent;
                        beforeTag = line.nextSibling;
                    }
                    
                    rangeElement.appendChild(line);

                    if (pElement !== originParent) {
                        before = removeItems(pElement, originParent);
                        if (before !== undefined) beforeTag = before;
                    }
                }
            }

            this.effectNode = null;
            util.mergeSameTags(rangeElement, null, false);
            util.mergeNestedTags(rangeElement, function (current) { return this.isList(current); }.bind(util));

            // Nested list
            if (beforeTag && util.getElementDepth(beforeTag) > 0 && (util.isList(beforeTag.parentNode) || util.isList(beforeTag.parentNode.parentNode))) {
                const depthFormat = util.getParentElement(beforeTag, function (current) { return this.isRangeFormatElement(current) && !this.isList(current); }.bind(util));
                const splitRange = util.splitElement(beforeTag, null, !depthFormat ? 0 : util.getElementDepth(depthFormat) + 1);
                splitRange.parentNode.insertBefore(rangeElement, splitRange);
            }
            // basic
            else {
                pElement.insertBefore(rangeElement, beforeTag);
                removeItems(rangeElement, beforeTag);
            }

            const edge = util.getEdgeChildNodes(rangeElement.firstElementChild, rangeElement.lastElementChild);
            if (rangeLines.length > 1) {
                this.setRange(edge.sc, 0, edge.ec, edge.ec.textContent.length);
            } else {
                this.setRange(edge.ec, edge.ec.textContent.length, edge.ec, edge.ec.textContent.length);
            }

            // history stack
            this.history.push(false);
        },

        /**
         * @description The elements of the "selectedFormats" array are detached from the "rangeElement" element. ("LI" tags are converted to "P" tags)
         * When "selectedFormats" is null, all elements are detached and return {cc: parentNode, sc: nextSibling, ec: previousSibling, removeArray: [Array of removed elements]}.
         * @param {Element} rangeElement Range format element (PRE, BLOCKQUOTE, OL, UL...)
         * @param {Array|null} selectedFormats Array of format elements (P, DIV, LI...) to remove.
         * If null, Applies to all elements and return {cc: parentNode, sc: nextSibling, ec: previousSibling}
         * @param {Element|null} newRangeElement The node(rangeElement) to replace the currently wrapped node.
         * @param {Boolean} remove If true, deleted without detached.
         * @param {Boolean} notHistoryPush When true, it does not update the history stack and the selection object and return EdgeNodes (util.getEdgeChildNodes)
         * @returns {Object}
         */
        detachRangeFormatElement: function (rangeElement, selectedFormats, newRangeElement, remove, notHistoryPush) {
            const range = this.getRange();
            const so = range.startOffset;
            const eo = range.endOffset;

            let children = util.getListChildNodes(rangeElement, function (current) { return current.parentNode === rangeElement; });
            let parent = rangeElement.parentNode;
            let firstNode = null;
            let lastNode = null;
            let rangeEl = rangeElement.cloneNode(false);
            
            const removeArray = [];
            const newList = util.isList(newRangeElement);
            let insertedNew = false;
            let reset = false;
            let moveComplete = false;

            function appendNode (parent, insNode, sibling, originNode) {
                if (util.onlyZeroWidthSpace(insNode)) insNode.innerHTML = util.zeroWidthSpace;

                if (insNode.nodeType === 3) {
                    parent.insertBefore(insNode, sibling);
                    return insNode;
                }
                
                const insChildren = (moveComplete ? insNode : originNode).childNodes;
                let format = insNode.cloneNode(false);
                let first = null;
                let c = null;

                while (insChildren[0]) {
                    c = insChildren[0];
                    if (util._notTextNode(c) && !util.isBreak(c) && !util.isListCell(format)) {
                        if (format.childNodes.length > 0) {
                            if (!first) first = format;
                            parent.insertBefore(format, sibling);
                            format = insNode.cloneNode(false);
                        }
                        parent.insertBefore(c, sibling);
                        if (!first) first = c;
                    } else {
                        format.appendChild(c);
                    }
                }

                if (format.childNodes.length > 0) {
                    if (util.isListCell(parent) && util.isListCell(format) && util.isList(sibling)) {
                        if (newList) {
                            first = sibling;
                            while(sibling) {
                                format.appendChild(sibling);
                                sibling = sibling.nextSibling;
                            }
                            parent.parentNode.insertBefore(format, parent.nextElementSibling);
                        } else {
                            const originNext = originNode.nextElementSibling;
                            const detachRange = util.detachNestedList(originNode, false);
                            if ((rangeElement !== detachRange) || (originNext !== originNode.nextElementSibling)) {
                                rangeElement = detachRange;
                                reset = true;
                            }
                        }
                    } else {
                        parent.insertBefore(format, sibling);
                    }

                    if (!first) first = format;
                }

                return first;
            }

            // detach loop
            for (let i = 0, len = children.length, insNode, lineIndex, next; i < len; i++) {
                insNode = children[i];
                moveComplete = false;
                if (remove && i === 0) {
                    if (!selectedFormats || selectedFormats.length === len || selectedFormats[0] === insNode) {
                        firstNode = rangeElement.previousSibling;
                    } else {
                        firstNode = rangeEl;
                    }
                }

                if (selectedFormats) lineIndex = selectedFormats.indexOf(insNode);
                if (selectedFormats && lineIndex === -1) {
                    if (!rangeEl) rangeEl = rangeElement.cloneNode(false);
                    rangeEl.appendChild(insNode);
                }
                else {
                    if (selectedFormats) next = selectedFormats[lineIndex + 1];
                    if (rangeEl && rangeEl.children.length > 0) {
                        parent.insertBefore(rangeEl, rangeElement);
                        rangeEl = null;
                    }

                    if (!newList && util.isListCell(insNode)) {
                        if (next && util.getElementDepth(insNode) !== util.getElementDepth(next) && (util.isListCell(parent) || util.getArrayItem(insNode.children, util.isList, false))) {
                            const insNext = insNode.nextElementSibling;
                            const detachRange = util.detachNestedList(insNode, false);
                            if ((rangeElement !== detachRange) || insNext !== insNode.nextElementSibling) {
                                rangeElement = detachRange;
                                reset = true;
                            }
                        } else {
                            const inner = insNode;
                            insNode = util.createElement(remove ? inner.nodeName : (util.isList(rangeElement.parentNode) || util.isListCell(rangeElement.parentNode)) ? 'LI' : util.isCell(rangeElement.parentNode) ? 'DIV' : 'P');
                            const isCell = util.isListCell(insNode);
                            const innerChildren = inner.childNodes;
                            while (innerChildren[0]) {
                                if (util.isList(innerChildren[0]) && !isCell) break;
                                insNode.appendChild(innerChildren[0]);
                            }
                            util.copyFormatAttributes(insNode, inner);
                            moveComplete = true;
                        }
                    } else {
                        insNode = insNode.cloneNode(false);
                    }

                    if (!reset) {
                        if (!remove) {
                            if (newRangeElement) {
                                if (!insertedNew) {
                                    parent.insertBefore(newRangeElement, rangeElement);
                                    insertedNew = true;
                                }
                                insNode = appendNode(newRangeElement, insNode, null, children[i]);
                            } else {
                                insNode = appendNode(parent, insNode, rangeElement, children[i]);
                            }
    
                            if (selectedFormats) {
                                lastNode = insNode;
                                if (!firstNode) {
                                    firstNode = insNode;
                                }
                            } else if (!firstNode) {
                                firstNode = lastNode = insNode;
                            }
                        } else {
                            removeArray.push(insNode);
                            util.removeItem(children[i]);
                        }
                    } else {
                        reset = moveComplete = false;
                        children = util.getListChildNodes(rangeElement, function (current) { return current.parentNode === rangeElement; });
                        rangeEl = rangeElement.cloneNode(false);
                        parent = rangeElement.parentNode;
                        i = -1;
                        len = children.length;
                        continue;
                    }
                }
            }

            const rangeParent = rangeElement.parentNode;
            let rangeRight = rangeElement.nextSibling;
            if (rangeEl && rangeEl.children.length > 0) {
                rangeParent.insertBefore(rangeEl, rangeRight);
            }
            
            if (newRangeElement) firstNode = newRangeElement.previousSibling;
            else if (!firstNode) firstNode = rangeElement.previousSibling;
            rangeRight = rangeElement.nextSibling;

            if (rangeElement.children.length === 0 || rangeElement.textContent.length === 0) {
                util.removeItem(rangeElement);
            } else {
                util.removeEmptyNode(rangeElement, null);
            }

            let edge = null;
            if (remove) {
                edge = {
                    cc: rangeParent,
                    sc: firstNode,
                    ec: rangeRight,
                    removeArray: removeArray
                };
            } else {
                if (!firstNode) firstNode = lastNode;
                if (!lastNode) lastNode = firstNode;
                const childEdge = util.getEdgeChildNodes(firstNode, (lastNode.parentNode ? firstNode : lastNode));
                edge = {
                    cc: (childEdge.sc || childEdge.ec).parentNode,
                    sc: childEdge.sc,
                    ec: childEdge.ec
                };
            }

            this.effectNode = null;
            if (notHistoryPush) return edge;
            
            if (!remove && edge) {
                if (!selectedFormats) {
                    this.setRange(edge.sc, 0, edge.sc, 0);
                } else {
                    this.setRange(edge.sc, so, edge.ec, eo);
                }
            }

            // history stack
            this.history.push(false);
        },

        /**
         * @description "selectedFormats" array are detached from the list element.
         * The return value is applied when the first and last lines of "selectedFormats" are "LI" respectively.
         * @param {Array} selectedFormats Array of format elements (LI, P...) to remove.
         * @param {Boolean} remove If true, deleted without detached.
         * @returns {Object} {sc: <LI>, ec: <LI>}.
         */
        detachList: function (selectedFormats, remove) {
            let rangeArr = {};
            let listFirst = false;
            let listLast = false;
            let first = null;
            let last = null;
            const passComponent = function (current) { return !this.isComponent(current); }.bind(util);

            for (let i = 0, len = selectedFormats.length, r, o, lastIndex, isList; i < len; i++) {
                lastIndex = i === len - 1;
                o = util.getRangeFormatElement(selectedFormats[i], passComponent);
                isList = util.isList(o);
                if (!r && isList) {
                    r = o;
                    rangeArr = {r: r, f: [util.getParentElement(selectedFormats[i], 'LI')]};
                    if (i === 0) listFirst = true;
                } else if (r && isList) {
                    if (r !== o) {
                        const edge = this.detachRangeFormatElement(rangeArr.f[0].parentNode, rangeArr.f, null, remove, true);
                        o = selectedFormats[i].parentNode;
                        if (listFirst) {
                            first = edge.sc;
                            listFirst = false;
                        }
                        if (lastIndex) last = edge.ec;

                        if (isList) {
                            r = o;
                            rangeArr = {r: r, f: [util.getParentElement(selectedFormats[i], 'LI')]};
                            if (lastIndex) listLast = true;
                        } else {
                            r = null;
                        }
                    } else {
                        rangeArr.f.push(util.getParentElement(selectedFormats[i], 'LI'));
                        if (lastIndex) listLast = true;
                    }
                }

                if (lastIndex && util.isList(r)) {
                    const edge = this.detachRangeFormatElement(rangeArr.f[0].parentNode, rangeArr.f, null, remove, true);
                    if (listLast || len === 1) last = edge.ec;
                    if (listFirst) first = edge.sc || last;
                }
            }

            return {
                sc: first,
                ec: last
            };
        },

        /**
         * @description Add, update, and delete nodes from selected text.
         * 1. If there is a node in the "appendNode" argument, a node with the same tags and attributes as "appendNode" is added to the selection text.
         * 2. If it is in the same tag, only the tag's attributes are changed without adding a tag.
         * 3. If the "appendNode" argument is null, the node of the selection is update or remove without adding a new node.
         * 4. The same style as the style attribute of the "styleArray" argument is deleted.
         *    (Styles should be put with attribute names from css. ["background-color"])
         * 5. The same class name as the class attribute of the "styleArray" argument is deleted.
         *    (The class name is preceded by "." [".className"])
         * 6. Use a list of styles and classes of "appendNode" in "styleArray" to avoid duplicate property values.
         * 7. If a node with all styles and classes removed has the same tag name as "appendNode" or "removeNodeArray", or "appendNode" is null, that node is deleted.
         * 8. Regardless of the style and class of the node, the tag with the same name as the "removeNodeArray" argument value is deleted.
         * 9. If the "strictRemove" argument is true, only nodes with all styles and classes removed from the nodes of "removeNodeArray" are removed.
         *10. It won't work if the parent node has the same class and same value style.
         *    However, if there is a value in "removeNodeArray", it works and the text node is separated even if there is no node to replace.
         * @param {Element|null} appendNode The element to be added to the selection. If it is null, only delete the node.
         * @param {Array|null} styleArray The style or className attribute name Array to check (['font-size'], ['.className'], ['font-family', 'color', '.className']...])
         * @param {Array|null} removeNodeArray An array of node names to remove types from, remove all formats when "appendNode" is null and there is an empty array or null value. (['span'], ['strong', 'em'] ...])
         * @param {Boolean|null} strictRemove If true, only nodes with all styles and classes removed from the nodes of "removeNodeArray" are removed.
         */
        nodeChange: function (appendNode, styleArray, removeNodeArray, strictRemove) {
            let range = this.getRange();
            styleArray = styleArray && styleArray.length > 0 ? styleArray : false;
            removeNodeArray = removeNodeArray && removeNodeArray.length > 0 ? removeNodeArray : false;

            const isRemoveNode = !appendNode;
            const isRemoveFormat = isRemoveNode && !removeNodeArray && !styleArray;
            let startCon = range.startContainer;
            let startOff = range.startOffset;
            let endCon = range.endContainer;
            let endOff = range.endOffset;

            if ((isRemoveFormat && range.collapsed && util.isFormatElement(startCon.parentNode) && util.isFormatElement(endCon.parentNode)) || (startCon === endCon && startCon.nodeType === 1 && startCon.getAttribute('contenteditable') === 'false')) {
                return;
            }

            if (range.collapsed && !isRemoveFormat) {
                if (startCon.nodeType === 1 && !util.isBreak(startCon) && !util.isComponent(startCon)) {
                    let afterNode = null;
                    const focusNode = startCon.childNodes[startOff];

                    if (focusNode) {
                        if (!focusNode.nextSibling) {
                            afterNode = null;
                        } else {
                            afterNode = util.isBreak(focusNode) ? focusNode : focusNode.nextSibling;
                        }
                    }

                    const zeroWidth = util.createTextNode(util.zeroWidthSpace);
                    startCon.insertBefore(zeroWidth, afterNode);
                    this.setRange(zeroWidth, 1, zeroWidth, 1);

                    range = this.getRange();
                    startCon = range.startContainer;
                    startOff = range.startOffset;
                    endCon = range.endContainer;
                    endOff = range.endOffset;
                }
            }

            if (util.isFormatElement(startCon)) {
                startCon = startCon.childNodes[startOff];
                startOff = 0;
            }
            if (util.isFormatElement(endCon)) {
                endCon = endCon.childNodes[endOff];
                endOff = endCon.textContent.length;
            }

            if (isRemoveNode) {
                appendNode = util.createElement('DIV');
            }

            const newNodeName = appendNode.nodeName;

            /* checked same style property */
            if (!isRemoveFormat && startCon === endCon && !removeNodeArray && appendNode) {
                let sNode = startCon;
                let checkCnt = 0;
                const checkAttrs = [];
                
                const checkStyles = appendNode.style;
                for (let i = 0, len = checkStyles.length; i < len; i++) {
                    checkAttrs.push(checkStyles[i]);
                }

                const ckeckClasses = appendNode.classList;
                for (let i = 0, len = ckeckClasses.length; i < len; i++) {
                    checkAttrs.push('.' + ckeckClasses[i]);
                }

                if (checkAttrs.length > 0) {
                    while(!util.isFormatElement(sNode) && !util.isWysiwygDiv(sNode)) {
                        for (let i = 0; i < checkAttrs.length; i++) {
                            if (sNode.nodeType === 1) {
                                const s = checkAttrs[i];
                                const classReg = /^\./.test(s) ? new _w.RegExp('\\s*' + s.replace(/^\./, '') + '(\\s+|$)', 'ig') : false;
    
                                const styleCheck = isRemoveNode ? !!sNode.style[s] : (!!sNode.style[s] && !!appendNode.style[s] && sNode.style[s] === appendNode.style[s]);
                                const classCheck = classReg === false ? false : isRemoveNode ? !!sNode.className.match(classReg) : !!sNode.className.match(classReg) && !!appendNode.className.match(classReg);
                                if (styleCheck || classCheck) {
                                    checkCnt++;
                                }
                            }
                        }
                        sNode = sNode.parentNode;
                    }
    
                    if (checkCnt >= checkAttrs.length) return;
                }
            }

            let start = {}, end = {};
            let newNode, styleRegExp = '', classRegExp = '', removeNodeRegExp = '';

            if (styleArray) {
                for (let i = 0, len = styleArray.length, s; i < len; i++) {
                    s = styleArray[i];
                    if (/^\./.test(s)) {
                        classRegExp += (classRegExp ? '|' : '\\s*(?:') + s.replace(/^\./, '');
                    } else {
                        styleRegExp += (styleRegExp ? '|' : '(?:;|^|\\s)(?:') + s;
                    }
                }

                if (styleRegExp) {
                    styleRegExp += ')\\s*:[^;]*\\s*(?:;|$)';
                    styleRegExp = new _w.RegExp(styleRegExp, 'ig');
                }

                if (classRegExp) {
                    classRegExp += ')(?=\\s+|$)';
                    classRegExp = new _w.RegExp(classRegExp, 'ig');
                }
            }

            if (removeNodeArray) {
                removeNodeRegExp = '^(?:' + removeNodeArray[0];
                for (let i = 1; i < removeNodeArray.length; i++) {
                    removeNodeRegExp += '|' + removeNodeArray[i];
                }
                removeNodeRegExp += ')$';
                removeNodeRegExp = new _w.RegExp(removeNodeRegExp, 'i');
            }

            /** validation check function*/
            const _removeCheck = {v: false};
            const validation = function (checkNode) {
                const vNode = checkNode.cloneNode(false);

                // all path
                if (vNode.nodeType === 3 || util.isBreak(vNode)) return vNode;
                // all remove
                if (isRemoveFormat) return null;

                // remove node check
                const tagRemove = (!removeNodeRegExp && isRemoveNode) || (removeNodeRegExp && removeNodeRegExp.test(vNode.nodeName));

                // tag remove
                if (tagRemove && !strictRemove) {
                    _removeCheck.v = true;
                    return null;
                }

                // style regexp
                const originStyle = vNode.style.cssText;
                let style = '';
                if (styleRegExp && originStyle.length > 0) {
                    style = originStyle.replace(styleRegExp, '').trim();
                    if (style !== originStyle) _removeCheck.v = true;
                }

                // class check
                const originClasses = vNode.className;
                let classes = '';
                if (classRegExp && originClasses.length > 0) {
                    classes = originClasses.replace(classRegExp, '').trim();
                    if (classes !== originClasses) _removeCheck.v = true;
                }

                // remove only
                if (isRemoveNode) {
                    if ((classRegExp || !originClasses) && (styleRegExp || !originStyle) && !style && !classes && tagRemove) {
                        _removeCheck.v = true;
                        return null;
                    }
                }

                // change
                if (style || classes || vNode.nodeName !== newNodeName || (_w.Boolean(styleRegExp) !== _w.Boolean(originStyle)) || (_w.Boolean(classRegExp) !== _w.Boolean(originClasses))) {
                    if (styleRegExp && originStyle.length > 0) vNode.style.cssText = style;
                    if (!vNode.style.cssText) {
                        vNode.removeAttribute('style');
                    }

                    if (classRegExp && originClasses.length > 0) vNode.className = classes.trim();
                    if (!vNode.className.trim()) {
                        vNode.removeAttribute('class');
                    }

                    if (!vNode.style.cssText && !vNode.className && (vNode.nodeName === newNodeName || tagRemove)) {
                        _removeCheck.v = true;
                        return null;
                    }

                    return vNode;
                }

                _removeCheck.v = true;
                return null;
            };

            // get line nodes
            const lineNodes = this.getSelectedElements(null);
            range = this.getRange();
            startCon = range.startContainer;
            startOff = range.startOffset;
            endCon = range.endContainer;
            endOff = range.endOffset;

            if (!util.getFormatElement(startCon, null)) {
                startCon = util.getChildElement(lineNodes[0], function (current) { return current.nodeType === 3; }, false);
                startOff = 0;
            }

            if (!util.getFormatElement(endCon, null)) {
                endCon = util.getChildElement(lineNodes[lineNodes.length - 1], function (current) { return current.nodeType === 3; }, false);
                endOff = endCon.textContent.length;
            }

            
            const oneLine = util.getFormatElement(startCon, null) === util.getFormatElement(endCon, null);
            const endLength = lineNodes.length - (oneLine ? 0 : 1);

            // node Changes
            newNode = appendNode.cloneNode(false);

            const isRemoveAnchor = isRemoveFormat || (isRemoveNode && (function (arr, _isMaintainedNode) {
                for (let n = 0, len = arr.length; n < len; n++) {
                    if (_isMaintainedNode(arr[n])) return true;
                }
                return false;
            })(removeNodeArray, util._isMaintainedNode));

            const _getMaintainedNode = this._util_getMaintainedNode.bind(util, isRemoveAnchor);
            const _isMaintainedNode = this._util_isMaintainedNode.bind(util, isRemoveAnchor);

            // one line
            if (oneLine) {
                const newRange = this._nodeChange_oneLine(lineNodes[0], newNode, validation, startCon, startOff, endCon, endOff, isRemoveFormat, isRemoveNode, range.collapsed, _removeCheck, _getMaintainedNode, _isMaintainedNode);
                start.container = newRange.startContainer;
                start.offset = newRange.startOffset;
                end.container = newRange.endContainer;
                end.offset = newRange.endOffset;
                if (start.container === end.container && util.zeroWidthRegExp.test(start.container.textContent)) {
                    start.offset = end.offset = 1;
                }
            }
            // multi line 
            else {
                // end
                if (endLength > 0) {
                    newNode = appendNode.cloneNode(false);
                    end = this._nodeChange_endLine(lineNodes[endLength], newNode, validation, endCon, endOff, isRemoveFormat, isRemoveNode, _removeCheck, _getMaintainedNode, _isMaintainedNode);
                }

                // mid
                for (let i = endLength - 1, renewedEndContainer; i > 0; i--) {
                    newNode = appendNode.cloneNode(false);
                    renewedEndContainer = this._nodeChange_middleLine(lineNodes[i], newNode, validation, isRemoveFormat, isRemoveNode, _removeCheck, end.container);
                    if (renewedEndContainer) end.container = renewedEndContainer;
                }

                // start
                newNode = appendNode.cloneNode(false);
                start = this._nodeChange_startLine(lineNodes[0], newNode, validation, startCon, startOff, isRemoveFormat, isRemoveNode, _removeCheck, _getMaintainedNode, _isMaintainedNode, end.container);

                if (start.endContainer) end.container = start.endContainer;

                if (endLength <= 0) {
                    end = start;
                } else if (!end.container) {
                    end.container = start.container;
                    end.offset = start.container.textContent.length;
                }
            }

            // set range
            this.controllersOff();
            this.setRange(start.container, start.offset, end.container, end.offset);

            // history stack
            this.history.push(false);
        },

        /**
         * @description Strip remove node
         * @param {Node} removeNode The remove node
         * @private
         */
        _stripRemoveNode: function (removeNode) {
            const element = removeNode.parentNode;
            if (!removeNode || removeNode.nodeType === 3 || !element) return;
            
            const children = removeNode.childNodes;
            while (children[0]) {
                element.insertBefore(children[0], removeNode);
            }

            element.removeChild(removeNode);
        },

        /**
         * @description Return the parent maintained tag. (bind and use a util object)
         * @param {Boolean} isRemove Delete maintained tag
         * @param {Element} element Element
         * @returns {Element}
         * @private
         */
        _util_getMaintainedNode: function (isRemove, element) {
            return element && !isRemove ? this.getParentElement(element, function (current) {return this._isMaintainedNode(current);}.bind(this)) : null;
        },

        /**
         * @description Check if element is a tag that should be persisted. (bind and use a util object)
         * @param {Boolean} isRemove Delete maintained tag
         * @param {Element} element Element
         * @returns {Element}
         * @private
         */
        _util_isMaintainedNode: function (isRemove, element) {
            return element && !isRemove && element.nodeType !== 3 && this._isMaintainedNode(element);
        },

        /**
         * @description wraps text nodes of line selected text.
         * @param {Element} element The node of the line that contains the selected text node.
         * @param {Element} newInnerNode The dom that will wrap the selected text area
         * @param {Function} validation Check if the node should be stripped.
         * @param {Node} startCon The startContainer property of the selection object.
         * @param {Number} startOff The startOffset property of the selection object.
         * @param {Node} endCon The endContainer property of the selection object.
         * @param {Number} endOff The endOffset property of the selection object.
         * @param {Boolean} isRemoveFormat Is the remove all formats command?
         * @param {Boolean} isRemoveNode "newInnerNode" is remove node?
         * @param {Boolean} collapsed range.collapsed
         * @returns {{startContainer: *, startOffset: *, endContainer: *, endOffset: *}}
         * @private
         */
        _nodeChange_oneLine: function (element, newInnerNode, validation, startCon, startOff, endCon, endOff, isRemoveFormat, isRemoveNode, collapsed, _removeCheck, _getMaintainedNode, _isMaintainedNode) {
            // not add tag
            let parentCon = startCon.parentNode;
            while (!parentCon.nextSibling && !parentCon.previousSibling && !util.isFormatElement(parentCon.parentNode) && !util.isWysiwygDiv(parentCon.parentNode)) {
                if (parentCon.nodeName === newInnerNode.nodeName) break;
                parentCon = parentCon.parentNode;
            }

            if (!isRemoveNode && parentCon === endCon.parentNode && parentCon.nodeName === newInnerNode.nodeName) {
                if (util.onlyZeroWidthSpace(startCon.textContent.slice(0, startOff)) && util.onlyZeroWidthSpace(endCon.textContent.slice(endOff))) {
                    const children = parentCon.childNodes;
                    let sameTag = true;
    
                    for (let i = 0, len = children.length, c, s, e, z; i < len; i++) {
                        c = children[i];
                        z = !util.onlyZeroWidthSpace(c);
                        if (c === startCon) {
                            s = true;
                            continue;
                        }
                        if (c === endCon) {
                            e = true;
                            continue;
                        }
                        if ((!s && z) || (s && e && z)) {
                            sameTag = false;
                            break;
                        }
                    }
    
                    if (sameTag) {
                        util.copyTagAttributes(parentCon, newInnerNode);
        
                        return {
                            startContainer: startCon,
                            startOffset: startOff,
                            endContainer: endCon,
                            endOffset: endOff
                        };
                    }
                }
            }

            // add tag
            _removeCheck.v = false;
            const el = element;
            const nNodeArray = [newInnerNode];
            const pNode = element.cloneNode(false);
            const isSameNode = startCon === endCon;
            let startContainer = startCon;
            let startOffset = startOff;
            let endContainer = endCon;
            let endOffset = endOff;
            let startPass = false;
            let endPass = false;
            let pCurrent, newNode, appendNode, cssText, anchorNode;

            function checkCss (vNode) {
                const regExp = new _w.RegExp('(?:;|^|\\s)(?:' + cssText + 'null)\\s*:[^;]*\\s*(?:;|$)', 'ig');
                let style = '';

                if (regExp && vNode.style.cssText.length > 0) {
                    style = regExp.test(vNode.style.cssText);
                }
            
                return !style;
            }

            (function recursionFunc(current, ancestor) {
                const childNodes = current.childNodes;

                for (let i = 0, len = childNodes.length, vNode; i < len; i++) {
                    let child = childNodes[i];
                    if (!child) continue;
                    let coverNode = ancestor;
                    let cloneNode;

                    // startContainer
                    if (!startPass && child === startContainer) {
                        let line = pNode;
                        anchorNode = _getMaintainedNode(child);
                        const prevNode = util.createTextNode(startContainer.nodeType === 1 ? '' : startContainer.substringData(0, startOffset));
                        const textNode = util.createTextNode(startContainer.nodeType === 1 ? '' : startContainer.substringData(startOffset, 
                                isSameNode ? 
                                (endOffset >= startOffset ? endOffset - startOffset : startContainer.data.length - startOffset) : 
                                startContainer.data.length - startOffset)
                            );

                        if (anchorNode) {
                            const a = _getMaintainedNode(ancestor);
                            if (a && a.parentNode !== line) {
                                let m = a;
                                let p = null;
                                while (m.parentNode !== line) {
                                    ancestor = p = m.parentNode.cloneNode(false);
                                    while(m.childNodes[0]) {
                                        p.appendChild(m.childNodes[0]);
                                    }
                                    m.appendChild(p);
                                    m = m.parentNode;
                                }
                                m.parentNode.appendChild(a);
                            }
                            anchorNode = anchorNode.cloneNode(false);
                        }
                        
                        if (!util.onlyZeroWidthSpace(prevNode)) {
                            ancestor.appendChild(prevNode);
                        }

                        const prevAnchorNode = _getMaintainedNode(ancestor);
                        if (!!prevAnchorNode) anchorNode = prevAnchorNode;
                        if (anchorNode) line = anchorNode;

                        newNode = child;
                        pCurrent = [];
                        cssText = '';
                        while (newNode !== line && newNode !== el && newNode !== null) {
                            vNode = _isMaintainedNode(newNode) ? null : validation(newNode);
                            if (vNode && newNode.nodeType === 1 && checkCss(newNode)) {
                                pCurrent.push(vNode);
                                cssText += newNode.style.cssText.substr(0, newNode.style.cssText.indexOf(':')) + '|';
                            }
                            newNode = newNode.parentNode;
                        }

                        const childNode = pCurrent.pop() || textNode;
                        appendNode = newNode = childNode;
                        while (pCurrent.length > 0) {
                            newNode = pCurrent.pop();
                            appendNode.appendChild(newNode);
                            appendNode = newNode;
                        }

                        newInnerNode.appendChild(childNode);
                        line.appendChild(newInnerNode);

                        if (anchorNode && !_getMaintainedNode(endContainer)) {
                            newInnerNode = newInnerNode.cloneNode(false);
                            pNode.appendChild(newInnerNode);
                            nNodeArray.push(newInnerNode);
                        }

                        startContainer = textNode;
                        startOffset = 0;
                        startPass = true;

                        if (newNode !== textNode) newNode.appendChild(startContainer);
                        if (!isSameNode) continue;
                    }

                    // endContainer
                    if (!endPass && child === endContainer) {
                        anchorNode = _getMaintainedNode(child);
                        const afterNode = util.createTextNode(endContainer.nodeType === 1 ? '' : endContainer.substringData(endOffset, (endContainer.length - endOffset)));
                        const textNode = util.createTextNode(isSameNode || endContainer.nodeType === 1 ? '' : endContainer.substringData(0, endOffset));

                        if (anchorNode) {
                            anchorNode = anchorNode.cloneNode(false);
                        } else if (_isMaintainedNode(newInnerNode.parentNode) && !anchorNode) {
                            newInnerNode = newInnerNode.cloneNode(false);
                            pNode.appendChild(newInnerNode);
                            nNodeArray.push(newInnerNode);
                        }

                        if (!util.onlyZeroWidthSpace(afterNode)) {
                            newNode = child;
                            cssText = '';
                            pCurrent = [];
                            const anchors = [];
                            while (newNode !== pNode && newNode !== el && newNode !== null) {
                                if (newNode.nodeType === 1 && checkCss(newNode)) {
                                    if (_isMaintainedNode(newNode)) anchors.push(newNode.cloneNode(false));
                                    else pCurrent.push(newNode.cloneNode(false));
                                    cssText += newNode.style.cssText.substr(0, newNode.style.cssText.indexOf(':')) + '|';
                                }
                                newNode = newNode.parentNode;
                            }
                            pCurrent = pCurrent.concat(anchors);

                            cloneNode = appendNode = newNode = pCurrent.pop() || afterNode;
                            while (pCurrent.length > 0) {
                                newNode = pCurrent.pop();
                                appendNode.appendChild(newNode);
                                appendNode = newNode;
                            }

                            pNode.appendChild(cloneNode);
                            newNode.textContent = afterNode.data;
                        }

                        if (anchorNode && cloneNode) {
                            const afterAnchorNode = _getMaintainedNode(cloneNode);
                            if (afterAnchorNode) {
                                anchorNode = afterAnchorNode;
                            }
                        }

                        newNode = child;
                        pCurrent = [];
                        cssText = '';
                        while (newNode !== pNode && newNode !== el && newNode !== null) {
                            vNode = _isMaintainedNode(newNode) ? null : validation(newNode);
                            if (vNode && newNode.nodeType === 1 && checkCss(newNode)) {
                                pCurrent.push(vNode);
                                cssText += newNode.style.cssText.substr(0, newNode.style.cssText.indexOf(':')) + '|';
                            }
                            newNode = newNode.parentNode;
                        }

                        const childNode = pCurrent.pop() || textNode;
                        appendNode = newNode = childNode;
                        while (pCurrent.length > 0) {
                            newNode = pCurrent.pop();
                            appendNode.appendChild(newNode);
                            appendNode = newNode;
                        }

                        if (anchorNode) {
                            newInnerNode = newInnerNode.cloneNode(false);
                            newInnerNode.appendChild(childNode);
                            anchorNode.insertBefore(newInnerNode, anchorNode.firstChild);
                            pNode.appendChild(anchorNode);
                            nNodeArray.push(newInnerNode);
                            anchorNode = null;
                        } else {
                            newInnerNode.appendChild(childNode);
                        }

                        endContainer = textNode;
                        endOffset = textNode.data.length;
                        endPass = true;

                        if (!isRemoveFormat && collapsed) {
                            newInnerNode = textNode;
                            textNode.textContent = util.zeroWidthSpace;
                        }

                        if (newNode !== textNode) newNode.appendChild(endContainer);
                        continue;
                    }

                    // other
                    if (startPass) {
                        if (child.nodeType === 1 && !util.isBreak(child)) {
                            if (util._isIgnoreNodeChange(child)) {
                                pNode.appendChild(child.cloneNode(true));
                                if (!collapsed) {
                                    newInnerNode = newInnerNode.cloneNode(false);
                                    pNode.appendChild(newInnerNode);
                                    nNodeArray.push(newInnerNode);
                                }
                            } else {
                                recursionFunc(child, child);
                            }
                            continue;
                        }

                        newNode = child;
                        pCurrent = [];
                        cssText = '';
                        const anchors = [];
                        while (newNode.parentNode !== null && newNode !== el && newNode !== newInnerNode) {
                            vNode = endPass ? newNode.cloneNode(false) : validation(newNode);
                            if (newNode.nodeType === 1 && !util.isBreak(child) && vNode && checkCss(newNode)) {
                                if (vNode) {
                                    if (_isMaintainedNode(vNode)) {
                                        if (!anchorNode) anchors.push(vNode);
                                    } else {
                                        pCurrent.push(vNode);
                                    }
                                }
                                cssText += newNode.style.cssText.substr(0, newNode.style.cssText.indexOf(':')) + '|';
                            }
                            newNode = newNode.parentNode;
                        }
                        pCurrent = pCurrent.concat(anchors);

                        const childNode = pCurrent.pop() || child;
                        appendNode = newNode = childNode;
                        while (pCurrent.length > 0) {
                            newNode = pCurrent.pop();
                            appendNode.appendChild(newNode);
                            appendNode = newNode;
                        }
                        
                        if (_isMaintainedNode(newInnerNode.parentNode) && !_isMaintainedNode(childNode)) {
                            newInnerNode = newInnerNode.cloneNode(false);
                            pNode.appendChild(newInnerNode);
                            nNodeArray.push(newInnerNode);
                        }
                        
                        if (!endPass && !anchorNode && _isMaintainedNode(childNode)) {
                            newInnerNode = newInnerNode.cloneNode(false);
                            const aChildren = childNode.childNodes;
                            for (let a = 0, aLen = aChildren.length; a < aLen; a++) {
                                newInnerNode.appendChild(aChildren[a]);
                            }
                            childNode.appendChild(newInnerNode);
                            pNode.appendChild(childNode);
                            nNodeArray.push(newInnerNode);
                            if (newInnerNode.children.length > 0) ancestor = newNode;
                            else ancestor = newInnerNode;
                        } else if (childNode === child) {
                            if (!endPass) ancestor = newInnerNode;
                            else ancestor = pNode;
                        } else if (endPass) {
                            pNode.appendChild(childNode);
                            ancestor = newNode;
                        } else {
                            newInnerNode.appendChild(childNode);
                            ancestor = newNode;
                        }

                        if (anchorNode && child.nodeType === 3) {
                            if (_getMaintainedNode(child)) {
                                const ancestorAnchorNode = util.getParentElement(ancestor, function (current) {return this._isMaintainedNode(current.parentNode) || current.parentNode === pNode;}.bind(util));
                                anchorNode.appendChild(ancestorAnchorNode);
                                newInnerNode = ancestorAnchorNode.cloneNode(false);
                                nNodeArray.push(newInnerNode);
                                pNode.appendChild(newInnerNode);
                            } else {
                                anchorNode = null;
                            }
                        }
                    }

                    cloneNode = child.cloneNode(false);
                    ancestor.appendChild(cloneNode);
                    if (child.nodeType === 1 && !util.isBreak(child)) coverNode = cloneNode;

                    recursionFunc(child, coverNode);
                }
            })(element, pNode);

            // not remove tag
            if (isRemoveNode && !isRemoveFormat && !_removeCheck.v) {
                return {
                    startContainer: startCon,
                    startOffset: startOff,
                    endContainer: endCon,
                    endOffset: endOff
                };
            }

            isRemoveFormat = isRemoveFormat && isRemoveNode;

            if (isRemoveFormat) {
                for (let i = 0; i < nNodeArray.length; i++) {
                    let removeNode = nNodeArray[i];
                    let textNode, textNode_s, textNode_e;
                    
                    if (collapsed) {
                        textNode = util.createTextNode(util.zeroWidthSpace);
                        pNode.replaceChild(textNode, removeNode);
                    } else {
                        const rChildren = removeNode.childNodes;
                        textNode_s = rChildren[0];
                        while (rChildren[0]) {
                            textNode_e = rChildren[0];
                            pNode.insertBefore(textNode_e, removeNode);
                        }
                        util.removeItem(removeNode);
                    }

                    if (i === 0) {
                        if (collapsed) {
                            startContainer = endContainer = textNode;
                        } else {
                            startContainer = textNode_s;
                            endContainer = textNode_e;
                        }
                    }
                }
            } else {
                if (isRemoveNode) {
                    for (let i = 0; i < nNodeArray.length; i++) {
                        this._stripRemoveNode(nNodeArray[i]);
                    }
                }
                
                if (collapsed) {
                    startContainer = endContainer = newInnerNode;
                }
            }

            util.removeEmptyNode(pNode, newInnerNode);

            if (collapsed) {
                startOffset = startContainer.textContent.length;
                endOffset = endContainer.textContent.length;
            }

            // endContainer reset
            const endConReset = isRemoveFormat || endContainer.textContent.length === 0;

            if (!util.isBreak(endContainer) && endContainer.textContent.length === 0) {
                util.removeItem(endContainer);
                endContainer = startContainer;
            }
            endOffset = endConReset ? endContainer.textContent.length : endOffset;

            // node change
            const newStartOffset = {s: 0, e: 0};
            const startPath = util.getNodePath(startContainer, pNode, newStartOffset);

            const mergeEndCon = !endContainer.parentNode;
            if (mergeEndCon) endContainer = startContainer;
            const newEndOffset = {s: 0, e: 0};
            const endPath = util.getNodePath(endContainer , pNode, (!mergeEndCon && !endConReset) ? newEndOffset : null);

            startOffset += newStartOffset.s;
            endOffset = (collapsed ? startOffset : mergeEndCon ? startContainer.textContent.length : endConReset ? endOffset + newStartOffset.s : endOffset + newEndOffset.s);

            // tag merge
            const newOffsets = util.mergeSameTags(pNode, [startPath, endPath], true);

            element.parentNode.replaceChild(pNode, element);

            startContainer = util.getNodeFromPath(startPath, pNode);
            endContainer = util.getNodeFromPath(endPath, pNode);

            return {
                startContainer: startContainer,
                startOffset: startOffset + newOffsets[0],
                endContainer: endContainer,
                endOffset: endOffset + newOffsets[1]
            };
        },

        /**
         * @description wraps first line selected text.
         * @param {Element} element The node of the line that contains the selected text node.
         * @param {Element} newInnerNode The dom that will wrap the selected text area
         * @param {Function} validation Check if the node should be stripped.
         * @param {Node} startCon The startContainer property of the selection object.
         * @param {Number} startOff The startOffset property of the selection object.
         * @param {Boolean} isRemoveFormat Is the remove all formats command?
         * @param {Boolean} isRemoveNode "newInnerNode" is remove node?
         * @returns {null|Node} If end container is renewed, returned renewed node
         * @returns {Object} { container, offset, endContainer }
         * @private
         */
        _nodeChange_startLine: function (element, newInnerNode, validation, startCon, startOff, isRemoveFormat, isRemoveNode, _removeCheck, _getMaintainedNode, _isMaintainedNode, _endContainer) {
            // not add tag
            let parentCon = startCon.parentNode;
            while (!parentCon.nextSibling && !parentCon.previousSibling && !util.isFormatElement(parentCon.parentNode) && !util.isWysiwygDiv(parentCon.parentNode)) {
                if (parentCon.nodeName === newInnerNode.nodeName) break;
                parentCon = parentCon.parentNode;
            }

            if (!isRemoveNode && parentCon.nodeName === newInnerNode.nodeName && !util.isFormatElement(parentCon) && !parentCon.nextSibling && util.onlyZeroWidthSpace(startCon.textContent.slice(0, startOff))) {
                let sameTag = true;
                let s = startCon.previousSibling;
                while (s) {
                    if (!util.onlyZeroWidthSpace(s)) {
                        sameTag = false;
                        break;
                    }
                    s = s.previousSibling;
                }

                if (sameTag) {
                    util.copyTagAttributes(parentCon, newInnerNode);
    
                    return {
                        container: startCon,
                        offset: startOff
                    };
                }
            }

            // add tag
            _removeCheck.v = false;
            const el = element;
            const nNodeArray = [newInnerNode];
            const pNode = element.cloneNode(false);

            let container = startCon;
            let offset = startOff;
            let passNode = false;
            let pCurrent, newNode, appendNode, anchorNode;

            (function recursionFunc(current, ancestor) {
                const childNodes = current.childNodes;

                for (let i = 0, len = childNodes.length, vNode, cloneChild; i < len; i++) {
                    const child = childNodes[i];
                    if (!child) continue;
                    let coverNode = ancestor;

                    if (passNode && !util.isBreak(child)) {
                        if (child.nodeType === 1) {
                            if (util._isIgnoreNodeChange(child)) {
                                newInnerNode = newInnerNode.cloneNode(false);
                                cloneChild = child.cloneNode(true);
                                pNode.appendChild(cloneChild);
                                pNode.appendChild(newInnerNode);
                                nNodeArray.push(newInnerNode);

                                // end container
                                if (_endContainer && child.contains(_endContainer)) {
                                    const endPath = util.getNodePath(_endContainer, child);
                                    _endContainer = util.getNodeFromPath(endPath, cloneChild);
                                }
                            } else {
                                recursionFunc(child, child);
                            }
                            continue;
                        }

                        newNode = child;
                        pCurrent = [];
                        const anchors = [];
                        while (newNode.parentNode !== null && newNode !== el && newNode !== newInnerNode) {
                            vNode = validation(newNode);
                            if (newNode.nodeType === 1 && vNode) {
                                if (_isMaintainedNode(vNode)) {
                                    if (!anchorNode) anchors.push(vNode);
                                } else {
                                    pCurrent.push(vNode);
                                }
                            }
                            newNode = newNode.parentNode;
                        }
                        pCurrent = pCurrent.concat(anchors);

                        const isTopNode = pCurrent.length > 0;
                        const childNode = pCurrent.pop() || child;
                        appendNode = newNode = childNode;
                        while (pCurrent.length > 0) {
                            newNode = pCurrent.pop();
                            appendNode.appendChild(newNode);
                            appendNode = newNode;
                        }

                        if (_isMaintainedNode(newInnerNode.parentNode) && !_isMaintainedNode(childNode)) {
                            newInnerNode = newInnerNode.cloneNode(false);
                            pNode.appendChild(newInnerNode);
                            nNodeArray.push(newInnerNode);
                        }
                        
                        if (!anchorNode && _isMaintainedNode(childNode)) {
                            newInnerNode = newInnerNode.cloneNode(false);
                            const aChildren = childNode.childNodes;
                            for (let a = 0, aLen = aChildren.length; a < aLen; a++) {
                                newInnerNode.appendChild(aChildren[a]);
                            }
                            childNode.appendChild(newInnerNode);
                            pNode.appendChild(childNode);
                            ancestor = !_isMaintainedNode(newNode) ? newNode : newInnerNode;
                            nNodeArray.push(newInnerNode);
                        } else if (isTopNode) {
                            newInnerNode.appendChild(childNode);
                            ancestor = newNode;
                        } else {
                            ancestor = newInnerNode;
                        }

                        if (anchorNode && child.nodeType === 3) {
                            if (_getMaintainedNode(child)) {
                                const ancestorAnchorNode = util.getParentElement(ancestor, function (current) {return this._isMaintainedNode(current.parentNode) || current.parentNode === pNode;}.bind(util));
                                anchorNode.appendChild(ancestorAnchorNode);
                                newInnerNode = ancestorAnchorNode.cloneNode(false);
                                nNodeArray.push(newInnerNode);
                                pNode.appendChild(newInnerNode);
                            } else {
                                anchorNode = null;
                            }
                        }
                    }

                    // startContainer
                    if (!passNode && child === container) {
                        let line = pNode;
                        anchorNode = _getMaintainedNode(child);
                        const prevNode = util.createTextNode(container.nodeType === 1 ? '' : container.substringData(0, offset));
                        const textNode = util.createTextNode(container.nodeType === 1 ? '' : container.substringData(offset, (container.length - offset)));

                        if (anchorNode) {
                            const a = _getMaintainedNode(ancestor);
                            if (a && a.parentNode !== line) {
                                let m = a;
                                let p = null;
                                while (m.parentNode !== line) {
                                    ancestor = p = m.parentNode.cloneNode(false);
                                    while(m.childNodes[0]) {
                                        p.appendChild(m.childNodes[0]);
                                    }
                                    m.appendChild(p);
                                    m = m.parentNode;
                                }
                                m.parentNode.appendChild(a);
                            }
                            anchorNode = anchorNode.cloneNode(false);
                        }

                        if (!util.onlyZeroWidthSpace(prevNode)) {
                            ancestor.appendChild(prevNode);
                        }

                        const prevAnchorNode = _getMaintainedNode(ancestor);
                        if (!!prevAnchorNode) anchorNode = prevAnchorNode;
                        if (anchorNode) line = anchorNode;

                        newNode = ancestor;
                        pCurrent = [];
                        while (newNode !== line && newNode !== null) {
                            vNode = validation(newNode);
                            if (newNode.nodeType === 1 && vNode) {
                                pCurrent.push(vNode);
                            }
                            newNode = newNode.parentNode;
                        }

                        const childNode = pCurrent.pop() || ancestor;
                        appendNode = newNode = childNode;
                        while (pCurrent.length > 0) {
                            newNode = pCurrent.pop();
                            appendNode.appendChild(newNode);
                            appendNode = newNode;
                        }

                        if (childNode !== ancestor) {
                            newInnerNode.appendChild(childNode);
                            ancestor = newNode;
                        } else {
                            ancestor = newInnerNode;
                        }

                        if (util.isBreak(child)) newInnerNode.appendChild(child.cloneNode(false));
                        line.appendChild(newInnerNode);

                        container = textNode;
                        offset = 0;
                        passNode = true;

                        ancestor.appendChild(container);
                        continue;
                    }

                    vNode = !passNode ? child.cloneNode(false) : validation(child);
                    if (vNode) {
                        ancestor.appendChild(vNode);
                        if (child.nodeType === 1 && !util.isBreak(child)) coverNode = vNode;
                    }

                    recursionFunc(child, coverNode);
                }
            })(element, pNode);

            // not remove tag
            if (isRemoveNode && !isRemoveFormat && !_removeCheck.v) {
                return {
                    container: startCon,
                    offset: startOff,
                    endContainer: _endContainer
                };
            }

            isRemoveFormat = isRemoveFormat && isRemoveNode;

            if (isRemoveFormat) {
                for (let i = 0; i < nNodeArray.length; i++) {
                    let removeNode = nNodeArray[i];

                    const rChildren = removeNode.childNodes;
                    const textNode = rChildren[0];
                    while (rChildren[0]) {
                        pNode.insertBefore(rChildren[0], removeNode);
                    }
                    util.removeItem(removeNode);

                    if (i === 0) container = textNode;
                }
            } else if (isRemoveNode) {
                for (let i = 0; i < nNodeArray.length; i++) {
                    this._stripRemoveNode(nNodeArray[i]);
                }
            }

            if (!isRemoveFormat && pNode.childNodes.length === 0) {
                if (element.childNodes) {
                    container = element.childNodes[0];
                } else {
                    container = util.createTextNode(util.zeroWidthSpace);
                    element.appendChild(container);
                }
            } else {
                util.removeEmptyNode(pNode, newInnerNode);

                if (util.onlyZeroWidthSpace(pNode.textContent)) {
                    container = pNode.firstChild;
                    offset = 0;
                }

                // node change
                const offsets = {s: 0, e: 0};
                const path = util.getNodePath(container, pNode, offsets);
                offset += offsets.s;

                // tag merge
                const newOffsets = util.mergeSameTags(pNode, [path], true);

                element.parentNode.replaceChild(pNode, element);

                container = util.getNodeFromPath(path, pNode);
                offset += newOffsets[0];
            }

            return {
                container: container,
                offset: offset,
                endContainer: _endContainer
            };
        },

        /**
         * @description wraps mid lines selected text.
         * @param {Element} element The node of the line that contains the selected text node.
         * @param {Element} newInnerNode The dom that will wrap the selected text area
         * @param {Function} validation Check if the node should be stripped.
         * @param {Boolean} isRemoveFormat Is the remove all formats command?
         * @param {Boolean} isRemoveNode "newInnerNode" is remove node?
         * @param {Node} _endContainer Offset node of last line already modified (end.container)
         * @returns {null|Node} If end container is renewed, returned renewed node
         * @private
         */
        _nodeChange_middleLine: function (element, newInnerNode, validation, isRemoveFormat, isRemoveNode, _removeCheck, _endContainer) {
            // not add tag
            if (!isRemoveNode) {
                // end container path
                let endPath = null;
                if (_endContainer && element.contains(_endContainer)) endPath = util.getNodePath(_endContainer, element);

                const tempNode = element.cloneNode(true);
                const newNodeName = newInnerNode.nodeName;
                const newCssText = newInnerNode.style.cssText;
                const newClass = newInnerNode.className;

                let children = tempNode.childNodes;
                let i = 0, len = children.length;
                for (let child; i < len; i++) {
                    child = children[i];
                    if (child.nodeType === 3) break;
                    if (child.nodeName === newNodeName) {
                        child.style.cssText += newCssText;
                        util.addClass(child, newClass);
                    } else if (!util.isBreak(child) && util._isIgnoreNodeChange(child)) {
                        continue;
                    } else if (len === 1) {
                        children = child.childNodes;
                        len = children.length;
                        i = -1;
                        continue;
                    } else {
                        break;
                    }
                }

                if (len > 0 && i === len) {
                    element.innerHTML = tempNode.innerHTML;
                    return endPath ? util.getNodeFromPath(endPath, element) : null;
                }
            }

            // add tag
            _removeCheck.v = false;
            const pNode = element.cloneNode(false);
            const nNodeArray = [newInnerNode];
            let noneChange = true;

            (function recursionFunc(current, ancestor) {
                const childNodes = current.childNodes;

                for (let i = 0, len = childNodes.length, vNode, cloneChild; i < len; i++) {
                    let child = childNodes[i];
                    if (!child) continue;
                    let coverNode = ancestor;

                    if (!util.isBreak(child) && util._isIgnoreNodeChange(child)) {
                        if (newInnerNode.childNodes.length > 0) {
                            pNode.appendChild(newInnerNode);
                            newInnerNode = newInnerNode.cloneNode(false);
                        }
                        
                        cloneChild = child.cloneNode(true);
                        pNode.appendChild(cloneChild);
                        pNode.appendChild(newInnerNode);
                        nNodeArray.push(newInnerNode);
                        ancestor = newInnerNode;

                        // end container
                        if (_endContainer && child.contains(_endContainer)) {
                            const endPath = util.getNodePath(_endContainer, child);
                            _endContainer = util.getNodeFromPath(endPath, cloneChild);
                        }

                        continue;
                    } else {
                        vNode = validation(child);
                        if (vNode) {
                            noneChange = false;
                            ancestor.appendChild(vNode);
                            if (child.nodeType === 1) coverNode = vNode;
                        }
                    }

                    if (!util.isBreak(child)) recursionFunc(child, coverNode);
                }
            })(element, newInnerNode);

            // not remove tag
            if (noneChange || (isRemoveNode && !isRemoveFormat && !_removeCheck.v)) return _endContainer;

            pNode.appendChild(newInnerNode);

            if (isRemoveFormat && isRemoveNode) {
                for (let i = 0; i < nNodeArray.length; i++) {
                    let removeNode = nNodeArray[i];
                    
                    const rChildren = removeNode.childNodes;
                    while (rChildren[0]) {
                        pNode.insertBefore(rChildren[0], removeNode);
                    }
                    util.removeItem(removeNode);
                }
            } else if (isRemoveNode) {
                for (let i = 0; i < nNodeArray.length; i++) {
                    this._stripRemoveNode(nNodeArray[i]);
                }
            }

            util.removeEmptyNode(pNode, newInnerNode);
            util.mergeSameTags(pNode, null, true);

            // node change
            element.parentNode.replaceChild(pNode, element);
            return _endContainer;
        },

        /**
         * @description wraps last line selected text.
         * @param {Element} element The node of the line that contains the selected text node.
         * @param {Element} newInnerNode The dom that will wrap the selected text area
         * @param {Function} validation Check if the node should be stripped.
         * @param {Node} endCon The endContainer property of the selection object.
         * @param {Number} endOff The endOffset property of the selection object.
         * @param {Boolean} isRemoveFormat Is the remove all formats command?
         * @param {Boolean} isRemoveNode "newInnerNode" is remove node?
         * @returns {Object} { container, offset }
         * @private
         */
        _nodeChange_endLine: function (element, newInnerNode, validation, endCon, endOff, isRemoveFormat, isRemoveNode, _removeCheck, _getMaintainedNode, _isMaintainedNode) {
            // not add tag
            let parentCon = endCon.parentNode;
            while (!parentCon.nextSibling && !parentCon.previousSibling && !util.isFormatElement(parentCon.parentNode) && !util.isWysiwygDiv(parentCon.parentNode)) {
                if (parentCon.nodeName === newInnerNode.nodeName) break;
                parentCon = parentCon.parentNode;
            }
            
            if (!isRemoveNode && parentCon.nodeName === newInnerNode.nodeName && !util.isFormatElement(parentCon) && !parentCon.previousSibling && util.onlyZeroWidthSpace(endCon.textContent.slice(endOff))) {
                let sameTag = true;
                let e = endCon.nextSibling;
                while (e) {
                    if (!util.onlyZeroWidthSpace(e)) {
                        sameTag = false;
                        break;
                    }
                    e = e.nextSibling;
                }

                if (sameTag) {
                    util.copyTagAttributes(parentCon, newInnerNode);
    
                    return {
                        container: endCon,
                        offset: endOff
                    };
                }
            }

            // add tag
            _removeCheck.v = false;
            const el = element;
            const nNodeArray = [newInnerNode];
            const pNode = element.cloneNode(false);

            let container = endCon;
            let offset = endOff;
            let passNode = false;
            let pCurrent, newNode, appendNode, anchorNode;

            (function recursionFunc(current, ancestor) {
                const childNodes = current.childNodes;

                for (let i = childNodes.length - 1, vNode; 0 <= i; i--) {
                    const child = childNodes[i];
                    if (!child) continue;
                    let coverNode = ancestor;

                    if (passNode && !util.isBreak(child)) {
                        if (child.nodeType === 1) {
                            if (util._isIgnoreNodeChange(child)) {
                                newInnerNode = newInnerNode.cloneNode(false);
                                const cloneChild = child.cloneNode(true);
                                pNode.insertBefore(cloneChild, ancestor);
                                pNode.insertBefore(newInnerNode, cloneChild);
                                nNodeArray.push(newInnerNode);
                            } else {
                                recursionFunc(child, child);
                            }
                            continue;
                        }

                        newNode = child;
                        pCurrent = [];
                        const anchors = [];
                        while (newNode.parentNode !== null && newNode !== el && newNode !== newInnerNode) {
                            vNode = validation(newNode);
                            if (vNode && newNode.nodeType === 1) {
                                if (_isMaintainedNode(vNode)) {
                                    if (!anchorNode) anchors.push(vNode);
                                } else {
                                    pCurrent.push(vNode);
                                }
                            }
                            newNode = newNode.parentNode;
                        }
                        pCurrent = pCurrent.concat(anchors);

                        const isTopNode = pCurrent.length > 0;
                        const childNode = pCurrent.pop() || child;
                        appendNode = newNode = childNode;
                        while (pCurrent.length > 0) {
                            newNode = pCurrent.pop();
                            appendNode.appendChild(newNode);
                            appendNode = newNode;
                        }

                        if (_isMaintainedNode(newInnerNode.parentNode) && !_isMaintainedNode(childNode)) {
                            newInnerNode = newInnerNode.cloneNode(false);
                            pNode.insertBefore(newInnerNode, pNode.firstChild);
                            nNodeArray.push(newInnerNode);
                        }

                        if (!anchorNode && _isMaintainedNode(childNode)) {
                            newInnerNode = newInnerNode.cloneNode(false);
                            const aChildren = childNode.childNodes;
                            for (let a = 0, aLen = aChildren.length; a < aLen; a++) {
                                newInnerNode.appendChild(aChildren[a]);
                            }
                            childNode.appendChild(newInnerNode);
                            pNode.insertBefore(childNode, pNode.firstChild);
                            nNodeArray.push(newInnerNode);
                            if (newInnerNode.children.length > 0) ancestor = newNode;
                            else ancestor = newInnerNode;
                        } else if (isTopNode) {
                            newInnerNode.insertBefore(childNode, newInnerNode.firstChild);
                            ancestor = newNode;
                        } else {
                            ancestor = newInnerNode;
                        }

                        if (anchorNode && child.nodeType === 3) {
                            if (_getMaintainedNode(child)) {
                                const ancestorAnchorNode = util.getParentElement(ancestor, function (current) {return this._isMaintainedNode(current.parentNode) || current.parentNode === pNode;}.bind(util));
                                anchorNode.appendChild(ancestorAnchorNode);
                                newInnerNode = ancestorAnchorNode.cloneNode(false);
                                nNodeArray.push(newInnerNode);
                                pNode.insertBefore(newInnerNode, pNode.firstChild);
                            } else {
                                anchorNode = null;
                            }
                        }
                    }

                    // endContainer
                    if (!passNode && child === container) {
                        anchorNode = _getMaintainedNode(child);
                        const afterNode = util.createTextNode(container.nodeType === 1 ? '' : container.substringData(offset, (container.length - offset)));
                        const textNode = util.createTextNode(container.nodeType === 1 ? '' : container.substringData(0, offset));

                        if (anchorNode) {
                            anchorNode = anchorNode.cloneNode(false);
                            const a = _getMaintainedNode(ancestor);
                            if (a && a.parentNode !== pNode) {
                                let m = a;
                                let p = null;
                                while (m.parentNode !== pNode) {
                                    ancestor = p = m.parentNode.cloneNode(false);
                                    while(m.childNodes[0]) {
                                        p.appendChild(m.childNodes[0]);
                                    }
                                    m.appendChild(p);
                                    m = m.parentNode;
                                }
                                m.parentNode.insertBefore(a, m.parentNode.firstChild);
                            }
                            anchorNode = anchorNode.cloneNode(false);
                        } else if (_isMaintainedNode(newInnerNode.parentNode) && !anchorNode) {
                            newInnerNode = newInnerNode.cloneNode(false);
                            pNode.appendChild(newInnerNode);
                            nNodeArray.push(newInnerNode);
                        }

                        if (!util.onlyZeroWidthSpace(afterNode)) {
                            ancestor.insertBefore(afterNode, ancestor.firstChild);
                        }

                        newNode = ancestor;
                        pCurrent = [];
                        while (newNode !== pNode && newNode !== null) {
                            vNode = _isMaintainedNode(newNode) ? null : validation(newNode);
                            if (vNode && newNode.nodeType === 1) {
                                pCurrent.push(vNode);
                            }
                            newNode = newNode.parentNode;
                        }

                        const childNode = pCurrent.pop() || ancestor;
                        appendNode = newNode = childNode;
                        while (pCurrent.length > 0) {
                            newNode = pCurrent.pop();
                            appendNode.appendChild(newNode);
                            appendNode = newNode;
                        }

                        if (childNode !== ancestor) {
                            newInnerNode.insertBefore(childNode, newInnerNode.firstChild);
                            ancestor = newNode;
                        } else {
                            ancestor = newInnerNode;
                        }

                        if (util.isBreak(child)) newInnerNode.appendChild(child.cloneNode(false));
                        
                        if (anchorNode) {
                            anchorNode.insertBefore(newInnerNode, anchorNode.firstChild);
                            pNode.insertBefore(anchorNode, pNode.firstChild);
                            anchorNode = null;
                        } else {
                            pNode.insertBefore(newInnerNode, pNode.firstChild);
                        }

                        container = textNode;
                        offset = textNode.data.length;
                        passNode = true;

                        ancestor.insertBefore(container, ancestor.firstChild);
                        continue;
                    }

                    vNode = !passNode ? child.cloneNode(false) : validation(child);
                    if (vNode) {
                        ancestor.insertBefore(vNode, ancestor.firstChild);
                        if (child.nodeType === 1 && !util.isBreak(child)) coverNode = vNode;
                    }

                    recursionFunc(child, coverNode);
                }
            })(element, pNode);

            // not remove tag
            if (isRemoveNode && !isRemoveFormat && !_removeCheck.v) {
                return {
                    container: endCon,
                    offset: endOff
                };
            }

            isRemoveFormat = isRemoveFormat && isRemoveNode;

            if (isRemoveFormat) {
                for (let i = 0; i < nNodeArray.length; i++) {
                    let removeNode = nNodeArray[i];
                    
                    const rChildren = removeNode.childNodes;
                    let textNode = null;
                    while (rChildren[0]) {
                        textNode = rChildren[0];
                        pNode.insertBefore(textNode, removeNode);
                    }
                    util.removeItem(removeNode);

                    if (i === nNodeArray.length - 1) {
                        container = textNode;
                        offset = textNode.textContent.length;
                    }
                }
            } else if (isRemoveNode) {
                for (let i = 0; i < nNodeArray.length; i++) {
                    this._stripRemoveNode(nNodeArray[i]);
                }
            }

            if (!isRemoveFormat && pNode.childNodes.length === 0) {
                if (element.childNodes) {
                    container = element.childNodes[0];
                } else {
                    container = util.createTextNode(util.zeroWidthSpace);
                    element.appendChild(container);
                }
            } else {
                if (!isRemoveNode && newInnerNode.textContent.length === 0) {
                    util.removeEmptyNode(pNode, null);
                    return {
                        container: null,
                        offset: 0
                    };
                }

                util.removeEmptyNode(pNode, newInnerNode);

                if (util.onlyZeroWidthSpace(pNode.textContent)) {
                    container = pNode.firstChild;
                    offset = container.textContent.length;
                } else if (util.onlyZeroWidthSpace(container)) {
                    container = newInnerNode;
                    offset = 1;
                }
                
                // node change
                const offsets = {s: 0, e: 0};
                const path = util.getNodePath(container, pNode, offsets);
                offset += offsets.s;

                // tag merge
                const newOffsets = util.mergeSameTags(pNode, [path], true);

                element.parentNode.replaceChild(pNode, element);

                container = util.getNodeFromPath(path, pNode);
                offset += newOffsets[0];
            }

            return {
                container: container,
                offset: offset
            };
        },

        /**
         * @description Run plugin calls and basic commands.
         * @param {String} command Command string
         * @param {String} display Display type string ('command', 'submenu', 'dialog', 'container')
         * @param {Element} target The element of command button
         */
        actionCall: function (command, display, target) {
            // call plugins
            if (display) {
                if (/more/i.test(display) && target !== this._moreLayerActiveButton) {
                    const layer = context.element.toolbar.querySelector('.' + command);
                    if (layer) {
                        if (this._moreLayerActiveButton) {
                            (context.element.toolbar.querySelector('.' + this._moreLayerActiveButton.getAttribute('data-command'))).style.display = 'none';
                            util.removeClass(this._moreLayerActiveButton, 'on');
                        }
                        util.addClass(target, 'on');
                        this._moreLayerActiveButton = target;
                        layer.style.display = 'block';

                        event._showToolbarBalloon();
                        event._showToolbarInline();
                    }
                    return;
                } else if (/submenu/.test(display) && (this._menuTray[command] === null || target !== this.submenuActiveButton)) {
                    this.callPlugin(command, this.submenuOn.bind(this, target), target);
                    return;
                } else if (/dialog/.test(display)) {
                    this.callPlugin(command, this.plugins[command].open.bind(this), target);
                    return;
                } else if (/command/.test(display)) {
                    this.callPlugin(command, this.plugins[command].action.bind(this), target);
                } else if (/container/.test(display) && (this._menuTray[command] === null || target !== this.containerActiveButton)) {
                    this.callPlugin(command, this.containerOn.bind(this, target), target);
                    return;
                }                
            } // default command
            else if (command) {
                this.commandHandler(target, command);
            }

            if (/more/i.test(display)) {
                const layer = context.element.toolbar.querySelector('.' + this._moreLayerActiveButton.getAttribute('data-command'));
                if (layer) {
                    util.removeClass(this._moreLayerActiveButton, 'on');
                    this._moreLayerActiveButton = null;
                    layer.style.display = 'none';

                    event._showToolbarBalloon();
                    event._showToolbarInline();
                }
            } else if (/submenu/.test(display)) {
                this.submenuOff();
            } else {
                this.submenuOff();
                this.containerOff();
            }
        },

        /**
         * @description Execute command of command button(All Buttons except submenu and dialog)
         * (undo, redo, bold, underline, italic, strikethrough, subscript, superscript, removeFormat, indent, outdent, fullscreen, showBlocks, codeview, preview, print)
         * @param {Element} target The element of command button
         * @param {String} command Property of command button (data-value)
         */
        commandHandler: function (target, command) {
            switch (command) {
                case 'selectAll':
                    const wysiwyg = context.element.wysiwyg;
                    const first = util.getChildElement(wysiwyg.firstChild, function (current) { return current.childNodes.length === 0 || current.nodeType === 3; }, false) || wysiwyg.firstChild;
                    const last = util.getChildElement(wysiwyg.lastChild, function (current) { return current.childNodes.length === 0 || current.nodeType === 3; }, true) || wysiwyg.lastChild;
                    if (!first || !last) return;
                    this.setRange(first, 0, last, last.textContent.length);
                    this.focus();
                    break;
                case 'codeView':
                    util.toggleClass(target, 'active');
                    this.toggleCodeView();
                    break;
                case 'fullScreen':
                    util.toggleClass(target, 'active');
                    this.toggleFullScreen(target);
                    break;
                case 'indent':
                case 'outdent':
                    this.indent(command);
                    break;
                case 'undo':
                    this.history.undo();
                    break;
                case 'redo':
                    this.history.redo();
                    break;
                case 'removeFormat':
                    this.removeFormat();
                    this.focus();
                    break;
                case 'print':
                    this.print();
                    break;
                case 'preview':
                    this.preview();
                    break;
                case 'showBlocks':
                    util.toggleClass(target, 'active');
                    this.toggleDisplayBlocks();
                    break;
                case 'save':
                    if (typeof options.callBackSave === 'function') {
                        options.callBackSave(this.getContents(false));
                    } else if (typeof functions.save === 'function') {
                        functions.save();
                    } else {
                        throw Error('[SUNEDITOR.core.commandHandler.fail] Please register call back function in creation option. (callBackSave : Function)');
                    }

                    if (context.tool.save) context.tool.save.setAttribute('disabled', true);
                    break;
                default : // 'STRONG', 'U', 'EM', 'DEL', 'SUB', 'SUP'
                    command = this._defaultCommand[command.toLowerCase()] || command;
                    if (!this.commandMap[command]) this.commandMap[command] = target;

                    const btn = util.hasClass(this.commandMap[command], 'active') ? null : util.createElement(command);
                    let removeNode = command;

                    if (/^SUB$/i.test(command) && util.hasClass(this.commandMap.SUP, 'active')) {
                        removeNode = 'SUP';
                    } else if (/^SUP$/i.test(command) && util.hasClass(this.commandMap.SUB, 'active')) {
                        removeNode = 'SUB';
                    }

                    this.nodeChange(btn, null, [removeNode], false);
                    this.focus();
            }
        },

        /**
         * @description Remove format of the currently selected range
         */
        removeFormat: function () {
            this.nodeChange(null, null, null, null);
        },

        /**
         * @description This method implements indentation to selected range.
         * Setted "margin-left" to "25px" in the top "P" tag of the parameter node.
         * @param {String} command Separator ("indent" or "outdent")
         */
        indent: function (command) {
            const range = this.getRange();
            const rangeLines = this.getSelectedElements(null);
            const cells = [];
            const shift = 'indent' !== command;
            let sc = range.startContainer;
            let ec = range.endContainer;
            let so = range.startOffset;
            let eo = range.endOffset;

            for (let i = 0, len = rangeLines.length, f, margin; i < len; i++) {
                f = rangeLines[i];

                if (!util.isListCell(f) || !this.plugins.list) {
                    margin = /\d+/.test(f.style.marginLeft) ? util.getNumber(f.style.marginLeft, 0) : 0;
                    if (shift) {
                        margin -= 25;
                    } else {
                        margin += 25;
                    }
                    util.setStyle(f, 'marginLeft', (margin <= 0 ? '' : margin + 'px'));
                } else {
                    if (shift || f.previousElementSibling) {
                        cells.push(f);
                    }
                }
            }

            // list cells
            if (cells.length > 0) {
                this.plugins.list.editInsideList.call(this, shift, cells);
            }

            this.effectNode = null;
            this.setRange(sc, so, ec, eo);

            // history stack
            this.history.push(false);
        },

        /**
         * @description Add or remove the class name of "body" so that the code block is visible
         */
        toggleDisplayBlocks: function () {
            util.toggleClass(context.element.wysiwyg, 'se-show-block');
            this._resourcesStateChange();
        },

        /**
         * @description Changes to code view or wysiwyg view
         */
        toggleCodeView: function () {
            const isCodeView = this._variable.isCodeView;
            this.controllersOff();
            util.toggleDisabledButtons(!isCodeView, this.codeViewDisabledButtons);

            if (isCodeView) {
                this._setCodeDataToEditor();
                context.element.wysiwygFrame.scrollTop = 0;
                context.element.code.style.display = 'none';
                context.element.wysiwygFrame.style.display = 'block';

                this._variable._codeOriginCssText = this._variable._codeOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: none');
                this._variable._wysiwygOriginCssText = this._variable._wysiwygOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: block');

                if (options.height === 'auto' && !options.codeMirrorEditor) context.element.code.style.height = '0px';
                
                this._variable.isCodeView = false;
                
                if (!this._variable.isFullScreen) {
                    this._notHideToolbar = false;
                    if (/balloon|balloon-always/i.test(options.mode)) {
                        context.element._arrow.style.display = '';
                        this._isInline = false;
                        this._isBalloon = true;
                        event._hideToolbar();    
                    }
                }

                this.nativeFocus();

                // history stack
                this.history.push(false);
            } else {
                this._setEditorDataToCodeView();
                this._variable._codeOriginCssText = this._variable._codeOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: block');
                this._variable._wysiwygOriginCssText = this._variable._wysiwygOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: none');

                if (options.height === 'auto' && !options.codeMirrorEditor) context.element.code.style.height = context.element.code.scrollHeight > 0 ? (context.element.code.scrollHeight + 'px') : 'auto';
                if (options.codeMirrorEditor) options.codeMirrorEditor.refresh();
                
                this._variable.isCodeView = true;

                if (!this._variable.isFullScreen) {
                    this._notHideToolbar = true;
                    if (this._isBalloon) {
                        context.element._arrow.style.display = 'none';
                        context.element.toolbar.style.left = '';
                        this._isInline = true;
                        this._isBalloon = false;
                        event._showToolbarInline();
                    }
                }
                
                this._variable._range = null;
                context.element.code.focus();
            }

            this._checkPlaceholder();
        },

        /**
         * @description Convert the data of the code view and put it in the WYSIWYG area.
         * @private
         */
        _setCodeDataToEditor: function () {
            const code_html = this._getCodeView();

            if (options.fullPage) {
                const parseDocument = this._parser.parseFromString(code_html, 'text/html');
                const headChildren = parseDocument.head.children;

                for (let i = 0, len = headChildren.length; i < len; i++) {
                    if (/script/i.test(headChildren[i].tagName)) {
                        parseDocument.head.removeChild(headChildren[i]);
                        i--, len--;
                    }
                }

                this._wd.head.innerHTML = parseDocument.head.innerHTML;
                this._wd.body.innerHTML = this.convertContentsForEditor(parseDocument.body.innerHTML);

                const attrs = parseDocument.body.attributes;
                for (let i = 0, len = attrs.length; i < len; i++) {
                    if (attrs[i].name === 'contenteditable') continue;
                    this._wd.body.setAttribute(attrs[i].name, attrs[i].value);
                }
                if (!util.hasClass(this._wd.body, 'sun-editor-editable')) util.addClass(this._wd.body, 'sun-editor-editable');
            } else {
                context.element.wysiwyg.innerHTML = code_html.length > 0 ? this.convertContentsForEditor(code_html) : '<p><br></p>';
            }
        },

        /**
         * @description Convert the data of the WYSIWYG area and put it in the code view area.
         * @private
         */
        _setEditorDataToCodeView: function () {
            const codeContents = this.convertHTMLForCodeView(context.element.wysiwyg);
            let codeValue = '';

            if (options.fullPage) {
                const attrs = util.getAttributesToString(this._wd.body, null);
                codeValue = '<!DOCTYPE html>\n<html>\n' + this._wd.head.outerHTML.replace(/>(?!\n)/g, '>\n') + '<body ' + attrs + '>\n' + codeContents + '</body>\n</html>';
            } else {
                codeValue = codeContents;
            }

            context.element.code.style.display = 'block';
            context.element.wysiwygFrame.style.display = 'none';

            this._setCodeView(codeValue);
        },

        /**
         * @description Changes to full screen or default screen
         * @param {Element} element full screen button
         */
        toggleFullScreen: function (element) {
            const topArea = context.element.topArea;
            const toolbar = context.element.toolbar;
            const editorArea = context.element.editorArea;
            const wysiwygFrame = context.element.wysiwygFrame;
            const code = context.element.code;
            const _var = this._variable;
            this.controllersOff();

            if (!_var.isFullScreen) {
                _var.isFullScreen = true;
                
                _var._fullScreenAttrs.inline = this._isInline;
                _var._fullScreenAttrs.balloon = this._isBalloon;

                if (this._isInline || this._isBalloon) {
                    this._isInline = false;
                    this._isBalloon = false;
                }

                topArea.style.position = 'fixed';
                topArea.style.top = '0';
                topArea.style.left = '0';
                topArea.style.width = '100%';
                topArea.style.height = '100%';
                topArea.style.zIndex = '2147483647';

                if (context.element._stickyDummy.style.display !== ('none' && '')) {
                    _var._fullScreenAttrs.sticky = true;
                    context.element._stickyDummy.style.display = 'none';
                    util.removeClass(toolbar, 'se-toolbar-sticky');
                }

                _var._bodyOverflow = _d.body.style.overflow;
                _d.body.style.overflow = 'hidden';

                _var._editorAreaOriginCssText = editorArea.style.cssText;
                _var._wysiwygOriginCssText = wysiwygFrame.style.cssText;
                _var._codeOriginCssText = code.style.cssText;

                editorArea.style.cssText = toolbar.style.cssText = '';
                wysiwygFrame.style.cssText = (wysiwygFrame.style.cssText.match(/\s?display(\s+)?:(\s+)?[a-zA-Z]+;/) || [''])[0];
                code.style.cssText = (code.style.cssText.match(/\s?display(\s+)?:(\s+)?[a-zA-Z]+;/) || [''])[0];
                toolbar.style.width = wysiwygFrame.style.height = code.style.height = '100%';
                toolbar.style.position = 'relative';
                toolbar.style.display = 'block';

                _var.innerHeight_fullScreen = (_w.innerHeight - toolbar.offsetHeight);
                editorArea.style.height = _var.innerHeight_fullScreen + 'px';

                util.changeElement(element.firstElementChild, icons.reduction);

                if (options.iframe && options.height === 'auto') {
                    editorArea.style.overflow = 'auto';
                    this._iframeAutoHeight();
                }
            }
            else {
                _var.isFullScreen = false;

                wysiwygFrame.style.cssText = _var._wysiwygOriginCssText;
                code.style.cssText = _var._codeOriginCssText;
                toolbar.style.cssText = '';
                editorArea.style.cssText = _var._editorAreaOriginCssText;
                topArea.style.cssText = _var._originCssText;
                _d.body.style.overflow = _var._bodyOverflow;

                if (options.stickyToolbar > -1) {
                    util.removeClass(toolbar, 'se-toolbar-sticky');
                }

                if (_var._fullScreenAttrs.sticky && !options.toolbarContainer) {
                    _var._fullScreenAttrs.sticky = false;
                    context.element._stickyDummy.style.display = 'block';
                    util.addClass(toolbar, "se-toolbar-sticky");
                }

                this._isInline = _var._fullScreenAttrs.inline;
                this._isBalloon = _var._fullScreenAttrs.balloon;
                if (this._isInline) event._showToolbarInline();

                event.onScroll_window();
                util.changeElement(element.firstElementChild, icons.expansion);
            }
        },

        /**
         * @description Prints the current contents of the editor.
         */
        print: function () {
            const iframe = util.createElement('IFRAME');
            iframe.style.display = 'none';
            _d.body.appendChild(iframe);

            const printDocument = util.getIframeDocument(iframe);
            const contentsHTML = this.getContents(true);
            const wDoc = this._wd;

            if (options.iframe) {
                const arrts = options.fullPage ? util.getAttributesToString(wDoc.body, ['contenteditable']) : 'class="sun-editor-editable"';

                printDocument.write('' +
                    '<!DOCTYPE html><html>' +
                    '<head>' +
                    wDoc.head.innerHTML +
                    '<style>' + util.getPageStyle(wDoc) + '</style>' +
                    '</head>' +
                    '<body ' + arrts + '>' + contentsHTML + '</body>' +
                    '</html>'
                );
            } else {
                const contents = util.createElement('DIV');
                const style = util.createElement('STYLE');

                style.innerHTML = util.getPageStyle(wDoc);
                contents.className = 'sun-editor-editable';
                contents.innerHTML = contentsHTML;

                printDocument.head.appendChild(style);
                printDocument.body.appendChild(contents);
            }

            try {
                iframe.focus();
                // IE or Edge
                if (util.isIE_Edge || !!_d.documentMode || !!_w.StyleMedia) {
                    try {
                        iframe.contentWindow.document.execCommand('print', false, null);
                    } catch (e) {
                        iframe.contentWindow.print();
                    }
                } else {
                    // Other browsers
                    iframe.contentWindow.print();
                }
            } catch (error) {
                throw Error('[SUNEDITOR.core.print.fail] error: ' + error);
            } finally {
                util.removeItem(iframe);
            }
        },

        /**
         * @description Open the preview window.
         */
        preview: function () {
            const contentsHTML = this.getContents(true);
            const windowObject = _w.open('', '_blank');
            windowObject.mimeType = 'text/html';
            const wDoc = this._wd;

            if (options.iframe) {
                const arrts = options.fullPage ? util.getAttributesToString(wDoc.body, ['contenteditable']) : 'class="sun-editor-editable"';

                windowObject.document.write('' +
                    '<!DOCTYPE html><html>' +
                    '<head>' +
                    wDoc.head.innerHTML +
                    '<style>body {overflow: auto !important;}</style>' +
                    '</head>' +
                    '<body ' + arrts + '>' + contentsHTML + '</body>' +
                    '</html>'
                );
            } else {
                windowObject.document.write('' +
                    '<!DOCTYPE html><html>' +
                    '<head>' +
                    '<meta charset="utf-8" />' +
                    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
                    '<title>' + lang.toolbar.preview + '</title>' +
                    '<style>' + util.getPageStyle(wDoc) + '</style>' +
                    '</head>' +
                    '<body class="sun-editor-editable">' + contentsHTML + '</body>' +
                    '</html>'
                );
            }
        },

        /**
         * @description Sets the HTML string
         * @param {String} html HTML string
         */
        setContents: function (html) {
            const convertValue = this.convertContentsForEditor(html);
            this._resetComponents();

            if (!core._variable.isCodeView) {
                context.element.wysiwyg.innerHTML = convertValue;
                // history stack
                core.history.push(false);
            } else {
                const value = this.convertHTMLForCodeView(convertValue);
                core._setCodeView(value);
            }
        },

        /**
         * @description Gets the current contents
         * @param {Boolean} onlyContents Return only the contents of the body without headers when the "fullPage" option is true
         * @returns {Object}
         */
        getContents: function (onlyContents) {
            const contents = context.element.wysiwyg.innerHTML;
            const renderHTML = util.createElement('DIV');
            renderHTML.innerHTML = contents;

            const figcaptions = util.getListChildren(renderHTML, function (current) {
                return /FIGCAPTION/i.test(current.nodeName);
            });

            for (let i = 0, len = figcaptions.length; i < len; i++) {
                figcaptions[i].removeAttribute('contenteditable');
            }

            if (options.fullPage && !onlyContents) {
                const attrs = util.getAttributesToString(this._wd.body, ['contenteditable']);
                return '<!DOCTYPE html><html>' + this._wd.head.outerHTML + '<body ' + attrs + '>' + renderHTML.innerHTML + '</body></html>';
            } else {
                return renderHTML.innerHTML;
            }
        },

        /**
         * @description Returns HTML string according to tag type and configuration.
         * Use only "cleanHTML", "convertContentsForEditor"
         * @param {Node} node Node
         * @param {Boolean} requireFormat If true, text nodes that do not have a format node is wrapped with the format tag.
         * @private
         */
        _makeLine: function (node, requireFormat) {
            // element
            if (node.nodeType === 1) {
                if (util._notAllowedTags(node)) return '';
                if (!requireFormat || (util.isFormatElement(node) || util.isRangeFormatElement(node) || util.isComponent(node) || util.isMedia(node) || (util.isAnchor(node) && util.isMedia(node.firstElementChild)))) {
                    return node.outerHTML;
                } else {
                    return '<p>' + node.outerHTML + '</p>';
                }
            }
            // text
            if (node.nodeType === 3) {
                if (!requireFormat) return node.textContent;
                const textArray = node.textContent.split(/\n/g);
                let html = '';
                for (let i = 0, tLen = textArray.length, text; i < tLen; i++) {
                    text = textArray[i].trim();
                    if (text.length > 0) html += '<p>' + text + '</p>';
                }
                return html;
            }
            // comments
            if (node.nodeType === 8 && this._allowHTMLComments) {
                return '<__comment__>' + node.textContent.trim() + '</__comment__>';
            }

            return '';
        },

        /**
         * @description Gets the clean HTML code for editor
         * @param {String} html HTML string
         * @param {String|RegExp} whitelist Regular expression of allowed tags.
         * RegExp object is create by util.createTagsWhitelist method. (core.pasteTagsWhitelistRegExp)
         * @returns {String}
         */
        cleanHTML: function (html, whitelist) {
            const dom = _d.createRange().createContextualFragment(html);
            try {
                util._consistencyCheckOfHTML(dom, this._htmlCheckWhitelistRegExp);
            } catch (error) {
                console.warn('[SUNEDITOR.cleanHTML.consistencyCheck.fail] ' + error);
            }
            
            const domTree = dom.childNodes;
            let cleanHTML = '';
            let requireFormat = false;

            for (let i = 0, len = domTree.length, t; i < len; i++) {
                t = domTree[i];
                if (t.nodeType === 1 && !util.isTextStyleElement(t) && !util.isBreak(t) && !util._notAllowedTags(t)) {
                    requireFormat = true;
                    break;
                }
            }

            for (let i = 0, len = domTree.length; i < len; i++) {
                cleanHTML += this._makeLine(domTree[i], requireFormat);
            }

            cleanHTML = cleanHTML
                .replace(/\n/g, '')
                .replace(/<(script|style).*>(\n|.)*<\/(script|style)>/g, '')
                .replace(this.editorTagsWhitelistRegExp, '')
                .replace(/<__comment__>/g, '<!-- ')
                .replace(/<\/__comment__>/g, ' -->')
                .replace(/(<[a-zA-Z0-9]+)[^>]*(?=>)/g, function (m, t) {
                    let v = null;
                    const tAttr = this._attributesTagsWhitelist[t.match(/(?!<)[a-zA-Z]+/)[0].toLowerCase()];
                    if (tAttr) v = m.match(tAttr);
                    else v = m.match(this._attributesWhitelistRegExp);

                    if (v) {
                        for (let i = 0, len = v.length; i < len; i++) {
                            if (/^class="(?!(__se__|se-))/.test(v[i])) continue;
                            t += ' ' + v[i];
                        }
                    }

                    return t;
                }.bind(this));
            
            if (!this._attributesTagsWhitelist.span) cleanHTML = cleanHTML.replace(/<\/?(span[^>^<]*)>/g, '');
            cleanHTML = util.htmlRemoveWhiteSpace(cleanHTML);
            
            return util._tagConvertor(!cleanHTML ? html : !whitelist ? cleanHTML : cleanHTML.replace(typeof whitelist === 'string' ? util.createTagsWhitelist(whitelist) : whitelist, ''));
        },

        /**
         * @description Converts contents into a format that can be placed in an editor
         * @param {String} contents contents
         * @returns {String}
         */
        convertContentsForEditor: function (contents) {
            const dom = _d.createRange().createContextualFragment(contents);
            try {
                util._consistencyCheckOfHTML(dom, this._htmlCheckWhitelistRegExp);
            } catch (error) {
                console.warn('[SUNEDITOR.convertContentsForEditor.consistencyCheck.fail] ' + error);
            }
            
            let returnHTML = '';
            const domTree = dom.childNodes;
            for (let i = 0, len = domTree.length; i < len; i++) {
                returnHTML += this._makeLine(domTree[i], true);
            }

            if (returnHTML.length === 0) return '<p><br></p>';

            returnHTML = util.htmlRemoveWhiteSpace(returnHTML);
            returnHTML = returnHTML
                .replace(this.editorTagsWhitelistRegExp, '')
                .replace(/\n/g, '')
                .replace(/<__comment__>/g, '<!-- ')
                .replace(/<\/__comment__>/g, ' -->');

            return util._tagConvertor(returnHTML);
        },

        /**
         * @description Converts wysiwyg area element into a format that can be placed in an editor of code view mode
         * @param {Element|String} html WYSIWYG element (context.element.wysiwyg) or HTML string.
         * @returns {String}
         */
        convertHTMLForCodeView: function (html) {
            let returnHTML = '';
            const reg = _w.RegExp;
            const brReg = new reg('^(BLOCKQUOTE|PRE|TABLE|THEAD|TBODY|TR|TH|TD|OL|UL|IMG|IFRAME|VIDEO|AUDIO|FIGURE|FIGCAPTION|HR|BR|CANVAS|SELECT)$', 'i');
            const isFormatElement = util.isFormatElement.bind(util);
            const wDoc = typeof html === 'string' ? _d.createRange().createContextualFragment(html) : html;

            let indentSize = this._variable.codeIndent * 1;
            indentSize = indentSize > 0 ? new _w.Array(indentSize + 1).join(' ') : '';

            (function recursionFunc (element, indent, lineBR) {
                const children = element.childNodes;
                const elementRegTest = brReg.test(element.nodeName);
                const elementIndent = (elementRegTest ? indent : '');

                for (let i = 0, len = children.length, node, br, nodeRegTest; i < len; i++) {
                    node = children[i];
                    nodeRegTest = brReg.test(node.nodeName);
                    br = nodeRegTest ? '\n' : '';
                    lineBR = isFormatElement(node) && !elementRegTest && !/^(TH|TD)$/i.test(element.nodeName) ? '\n' : '';

                    if (node.nodeType === 8) {
                        returnHTML += '\n<!-- ' + node.textContent.trim() + ' -->' + br;
                        continue;
                    }
                    if (node.nodeType === 3) {
                        returnHTML += util._HTMLConvertor((/^\n+$/.test(node.data) ? '' : node.data));
                        continue;
                    }
                    if (node.childNodes.length === 0) {
                        returnHTML += (/^(HR)$/i.test(node.nodeName) ? '\n' : '') + elementIndent + node.outerHTML + br;
                        continue;
                    }
                    
                    node.innerHTML = node.innerHTML;
                    const tag = node.nodeName.toLowerCase();
                    returnHTML += (lineBR || (elementRegTest ? '' : br)) + (elementIndent || nodeRegTest ? indent : '') + node.outerHTML.match(reg('<' + tag + '[^>]*>', 'i'))[0] + br;
                    recursionFunc(node, indent + indentSize, '');
                    returnHTML += (nodeRegTest ? indent : '') + '</' + tag + '>' + (lineBR || br || elementRegTest ? '\n' : '' || /^(TH|TD)$/i.test(node.nodeName) ? '\n' : '');
                }
            }(wDoc, '', '\n'));

            return returnHTML.trim() + '\n';
        },

        /**
         * @description Add an event to document.
         * When created as an Iframe, the same event is added to the document in the Iframe.
         * @param {String} type Event type
         * @param {Function} listener Event listener
         * @param {Boolean} useCapture Use event capture
         */
        addDocEvent: function (type, listener, useCapture) {
            _d.addEventListener(type, listener, useCapture);
            if (options.iframe) {
                this._wd.addEventListener(type, listener);
            }
        },

        /**
         * @description Remove events from document.
         * When created as an Iframe, the event of the document inside the Iframe is also removed.
         * @param {String} type Event type
         * @param {Function} listener Event listener
         */
        removeDocEvent: function (type, listener) {
            _d.removeEventListener(type, listener);
            if (options.iframe) {
                this._wd.removeEventListener(type, listener);
            }
        },

        /**
         * @description The current number of characters is counted and displayed.
         * @param {String} inputText Text added.
         * @returns {Boolean}
         * @private
         */
        _charCount: function (inputText) {
            const charCounter = context.element.charCounter;
            const maxCharCount = options.maxCharCount;
            let nextCharCount = 0;
            if (!!inputText) nextCharCount = core._getCharLength(inputText, options.charCounterType);

            if (charCounter) {
                _w.setTimeout(function () { charCounter.textContent = functions.getCharCount(null); });
            }

            if (maxCharCount > 0) {
                let over = false;
                const count = functions.getCharCount(null);
                
                if (count > maxCharCount) {
                    over = true;
                    if (nextCharCount > 0) {
                        this._editorRange();
                        const range = this.getRange();
                        const endOff = range.endOffset - 1;
                        const text = this.getSelectionNode().textContent;
                        const slicePosition = range.endOffset - (count - maxCharCount);
    
                        this.getSelectionNode().textContent = text.slice(0, slicePosition < 0 ? 0 : slicePosition) + text.slice(range.endOffset, text.length);
                        this.setRange(range.endContainer, endOff, range.endContainer, endOff);
                    }
                } else if ((count + nextCharCount) > maxCharCount) {
                    over = true;
                }

                if (over) {
                    const charWrapper = context.element.charWrapper;
                    if (charWrapper && !util.hasClass(charWrapper, 'se-blink')) {
                        util.addClass(charWrapper, 'se-blink');
                        _w.setTimeout(function () {
                            util.removeClass(charWrapper, 'se-blink');
                        }, 600);
                    }

                    if (nextCharCount > 0) return false;
                }
            }

            return true;
        },

        /**
         * @description Method used only in "_charCount".
         * Depending on the option, the length of the character is taken.
         * @param {String} content Content to count
         * @param {String} charCounterType option - charCounterType
         * @returns {Number}
         */
        _getCharLength: function (content, charCounterType) {
            return /byte/.test(charCounterType) ? util.getByteLength(content) : content.length;
        },

        /**
         * @description Check the components such as image and video and modify them according to the format.
         * @private
         */
        _checkComponents: function () {
            for (let i in this._fileInfoPluginsCheck) {
                this._fileInfoPluginsCheck[i]();
            }
        },

        /**
         * @description Initialize the information of the components.
         * @private
         */
        _resetComponents: function () {
            for (let i in this._fileInfoPluginsReset) {
                this._fileInfoPluginsReset[i]();
            }
        },

        /**
         * @description Set method in the code view area
         * @param {String} value HTML string
         * @private
         */
        _setCodeView: function (value) {
            if (options.codeMirrorEditor) {
                options.codeMirrorEditor.getDoc().setValue(value);
            } else {
                context.element.code.value = value;
            }
        },

        /**
         * @description Get method in the code view area
         * @private
         */
        _getCodeView: function () {
            return options.codeMirrorEditor ? options.codeMirrorEditor.getDoc().getValue() : context.element.code.value;
        },

        /**
         * @description Initializ core variable
         * @param {Boolean} reload Is relooad?
         * @param {String} _initHTML initial html string when "reload" is true
         * @private
         */
        _init: function (reload, _initHTML) {
            this._ww = options.iframe ? context.element.wysiwygFrame.contentWindow : _w;
            this._wd = _d;
            if (options.iframe && options.height === 'auto') this._iframeAuto = this._wd.body;
            
            if (!options.iframe && typeof _w.ShadowRoot === 'function') {
                let child = context.element.wysiwygFrame;
                while (child) {
                    if (child.shadowRoot) {
                        this._shadowRoot = child.shadowRoot;
                        break;
                    } else if (child instanceof _w.ShadowRoot) {
                        this._shadowRoot = child;
                        break;
                    }
                    child = child.parentNode;
                }
            }
            
            this._allowHTMLComments = options._editorTagsWhitelist.indexOf('//') > -1;
            this._htmlCheckWhitelistRegExp = new _w.RegExp('^(' + options._editorTagsWhitelist.replace('|//', '') + ')$', 'i');
            this.editorTagsWhitelistRegExp = util.createTagsWhitelist(options._editorTagsWhitelist.replace('|//', '|__comment__'));
            this.pasteTagsWhitelistRegExp = util.createTagsWhitelist(options.pasteTagsWhitelist);

            const _attr = options.attributesWhitelist;
            const tagsAttr = {};
            let allAttr = '';
            if (!!_attr) {
                for (let k in _attr) {
                    if (k === 'all') {
                        allAttr = _attr[k] + '|';
                    } else {
                        tagsAttr[k] = new _w.RegExp('((?:' + _attr[k] + ')\s*=\s*"[^"]*")', 'ig');
                    }
                }
            }
            
            this._attributesWhitelistRegExp = new _w.RegExp('((?:' + allAttr + 'contenteditable|colspan|rowspan|target|href|src|class|type|controls|data-format|data-size|data-file-size|data-file-name|data-origin|data-align|data-image-link|data-rotate|data-proportion|data-percentage|origin-size)\s*=\s*"[^"]*")', 'ig');
            this._attributesTagsWhitelist = tagsAttr;

            this._isInline = /inline/i.test(options.mode);
            this._isBalloon = /balloon|balloon-always/i.test(options.mode);
            this._isBalloonAlways = /balloon-always/i.test(options.mode);

            this._cachingButtons();

            // file components
            this._fileInfoPluginsCheck = [];
            this._fileInfoPluginsReset = [];

            // Command and file plugins registration
            this.activePlugins = [];
            this._fileManager.tags = [];
            this._fileManager.pluginMap = {};

            let filePluginRegExp = [];
            let plugin, button;
            for (let key in plugins) {
                plugin = plugins[key];
                button = pluginCallButtons[key];
                if (plugin.active && button) {
                    this.callPlugin(key, null, button);
                }
                if (typeof plugin.checkFileInfo === 'function' && typeof plugin.resetFileInfo === 'function') {
                    this.callPlugin(key, null, button);
                    this._fileInfoPluginsCheck.push(plugin.checkFileInfo.bind(this));
                    this._fileInfoPluginsReset.push(plugin.resetFileInfo.bind(this));
                }
                if (plugin.fileTags) {
                    this.callPlugin(key, null, button);
                    this._fileManager.tags = this._fileManager.tags.concat(plugin.fileTags);
                    filePluginRegExp.push(key);
                    for (let tag in plugin.fileTags) {
                        this._fileManager.pluginMap[plugin.fileTags[tag].toLowerCase()] = key;
                    }
                }
            }

            this._fileManager.queryString = this._fileManager.tags.join(',');
            this._fileManager.regExp = new _w.RegExp('^(' +  this._fileManager.tags.join('|') + ')$', 'i');
            this._fileManager.pluginRegExp = new _w.RegExp('^(' +  filePluginRegExp.join('|') + ')$', 'i');
            
            // cache editor's element
            this._variable._originCssText = context.element.topArea.style.cssText;
            this._placeholder = context.element.placeholder;
            this._lineBreaker = context.element.lineBreaker;
            this._lineBreakerButton = this._lineBreaker.querySelector('button');

            // Excute history function
            this.history = _history(this, event._onChange_historyStack);

            // register notice module
            this.addModule([_notice]);

            // Init, validate
            if (!options.iframe) this._initWysiwygArea(reload, _initHTML);
            _w.setTimeout(function () {
                // after iframe loaded
                if (options.iframe) {
                    this._wd = context.element.wysiwygFrame.contentDocument;
                    context.element.wysiwyg = this._wd.body;
                    this._initWysiwygArea(reload, _initHTML);
                    if (options.height === 'auto') this._iframeAuto = this._wd.body;
                }

                this._checkComponents();
                this._componentsInfoInit = false;
                this._componentsInfoReset = false;
                
                this.history.reset(true);
                this._resourcesStateChange();

                if (typeof functions.onload === 'function') return functions.onload(this, reload);
            }.bind(this));
        },

        _cachingButtons: function () {
            this.codeViewDisabledButtons = context.element.toolbar.querySelectorAll('.se-toolbar button:not([class~="se-code-view-enabled"])');
            this.resizingDisabledButtons = context.element.toolbar.querySelectorAll('.se-toolbar button:not([class~="se-resizing-enabled"])');
            this.commandMap = {
                STRONG: context.tool.bold,
                U: context.tool.underline,
                EM: context.tool.italic,
                DEL: context.tool.strike,
                SUB: context.tool.subscript,
                SUP: context.tool.superscript,
                OUTDENT: context.tool.outdent,
                INDENT: context.tool.indent
            };
        },

        /**
         * @description Initializ wysiwyg area (Only called from core._init())
         * @param {Boolean} reload Is relooad?
         * @param {String} _initHTML initial html string when "reload" is true
         * @private
         */
        _initWysiwygArea: function (reload, _initHTML) {
            // Default style
            if (options.defaultStyle) context.element.wysiwyg.style.cssText = options.defaultStyle;

            // Set html
            if (!reload) {
                context.element.wysiwyg.innerHTML = this.convertContentsForEditor(context.element.originElement.value);
            } else if (_initHTML) {
                context.element.wysiwyg.innerHTML = _initHTML;
            }
        },

        /**
         * @description Called when there are changes to tags in the wysiwyg region.
         * @private
         */
        _resourcesStateChange: function () {
            core._iframeAutoHeight();
            core._checkPlaceholder();
        },

        /**
         * @description Modify the height value of the iframe when the height of the iframe is automatic.
         * @private
         */
        _iframeAutoHeight: function () {
            if (this._iframeAuto) {
                _w.setTimeout(function () { context.element.wysiwygFrame.style.height = core._iframeAuto.offsetHeight + 'px'; });
            }
        },

        /**
         * @description Set display property when there is placeholder.
         * @private
         */
        _checkPlaceholder: function () {
            if (this._placeholder) {
                if (this._variable.isCodeView) {
                    this._placeholder.style.display = 'none';
                    return;
                }

                const wysiwyg = context.element.wysiwyg;
                if (!util.onlyZeroWidthSpace(wysiwyg.textContent) || wysiwyg.querySelector('.se-component, pre, blockquote, hr, li, table, img, iframe, video') || (wysiwyg.innerText.match(/\n/g) || '').length > 1) {
                    this._placeholder.style.display = 'none';
                } else {
                    this._placeholder.style.display = 'block';
                }
            }
        },

        /**
         * @description If there is no default format, add a format and move "selection".
         * Alternative code for - execCommand('formatBlock');
         * @param {String|null} formatName Format tag name (default: 'P')
         * @private
         */
        _setDefaultFormat: function (formatName) {
            if (this._fileManager.pluginRegExp.test(this.currentControllerName)) return;

            const range = this.getRange();
            const commonCon = range.commonAncestorContainer;
            const startCon = range.startContainer;
            const rangeEl = util.getRangeFormatElement(commonCon, null);
            let focusNode, offset, format;

            const fileComponent = util.getParentElement(commonCon, util.isComponent);
            if (fileComponent && !util.isTable(fileComponent)) return;
            if((util.isRangeFormatElement(startCon) || util.isWysiwygDiv(startCon)) && util.isComponent(startCon.childNodes[range.startOffset])) return;

            if (rangeEl) {
                format = util.createElement(formatName || 'P');
                format.innerHTML = rangeEl.innerHTML;
                if (format.childNodes.length === 0) format.innerHTML = util.zeroWidthSpace;

                rangeEl.innerHTML = format.outerHTML;
                format = rangeEl.firstChild;
                focusNode = util.getEdgeChildNodes(format, null).sc;

                if (!focusNode) {
                    focusNode = util.createTextNode(util.zeroWidthSpace);
                    format.insertBefore(focusNode, format.firstChild);
                }
                
                offset = focusNode.textContent.length;
                this.setRange(focusNode, offset, focusNode, offset);
                return;
            }

            if(util.isRangeFormatElement(commonCon) && (commonCon.childNodes.length <= 1)) {
                let br = null;
                if (commonCon.childNodes.length === 1 && util.isBreak(commonCon.firstChild)) {
                    br = commonCon.firstChild;
                } else {
                    br = util.createTextNode(util.zeroWidthSpace);
                    commonCon.appendChild(br);
                }

                this.setRange(br, 1, br, 1);
                return;
            }

            this.execCommand('formatBlock', false, (formatName || 'P'));
            focusNode = util.getEdgeChildNodes(commonCon, commonCon);
            focusNode = focusNode ? focusNode.ec : commonCon;

            format = util.getFormatElement(focusNode, null);
            if (!format) {
                this.removeRange();
                this._editorRange();
                return;
            }
            
            if (util.isBreak(format.nextSibling)) util.removeItem(format.nextSibling);
            if (util.isBreak(format.previousSibling)) util.removeItem(format.previousSibling);
            if (util.isBreak(focusNode)) {
                const zeroWidth = util.createTextNode(util.zeroWidthSpace);
                focusNode.parentNode.insertBefore(zeroWidth, focusNode);
                focusNode = zeroWidth;
            }

            this.effectNode = null;
            this.nativeFocus();
        },

        /**
         * @description Create and return an object to cache the new context.
         * @param {Element} contextEl context.element
         * @returns {Object}
         * @private
         */
        _getConstructed: function (contextEl) {
            return {
                _top: contextEl.topArea,
                _relative: contextEl.relative,
                _toolBar: contextEl.toolbar,
                _menuTray: contextEl._menuTray,
                _editorArea: contextEl.editorArea,
                _wysiwygArea: contextEl.wysiwygFrame,
                _codeArea: contextEl.code,
                _placeholder: contextEl.placeholder,
                _resizingBar: contextEl.resizingBar,
                _navigation: contextEl.navigation,
                _charCounter: contextEl.charCounter,
                _charWrapper: contextEl.charWrapper,
                _loading: contextEl.loading,
                _lineBreaker: contextEl.lineBreaker,
                _resizeBack: contextEl.resizeBackground,
                _stickyDummy: contextEl._stickyDummy,
                _arrow: contextEl._arrow
            };
        }
    };

    /**
     * @description event function
     */
    const event = {
        _responsiveCurrentSize: 'default',
        _responsiveButtonSize: null,
        _responsiveButtons: null,
        _directionKeyCode: new _w.RegExp('^(8|13|3[2-9]|40|46)$'),
        _nonTextKeyCode: new _w.RegExp('^(8|13|1[6-9]|20|27|3[3-9]|40|45|46|11[2-9]|12[0-3]|144|145)$'),
        _historyIgnoreKeyCode: new _w.RegExp('^(1[6-9]|20|27|3[3-9]|40|45|11[2-9]|12[0-3]|144|145)$'),
        _onButtonsCheck: new _w.RegExp('^(STRONG|U|EM|DEL|SUB|SUP)$'),
        _frontZeroWidthReg: new _w.RegExp(util.zeroWidthSpace + '+', ''),
        _keyCodeShortcut: {
            65: 'A',
            66: 'B',
            83: 'S',
            85: 'U',
            73: 'I',
            89: 'Y',
            90: 'Z',
            219: '[',
            221: ']'
        },

        _shortcutCommand: function (keyCode, shift) {
            let command = null;
            const keyStr = event._keyCodeShortcut[keyCode];

            switch (keyStr) {
                case 'A':
                    command = 'selectAll';
                    break;
                case 'B':
                    command = 'STRONG';
                    break;
                case 'S':
                    if (shift) {
                        command = 'DEL';
                    }
                    break;
                case 'U':
                    command = 'U';
                    break;
                case 'I':
                    command = 'EM';
                    break;
                case 'Z':
                    if (shift) {
                        command = 'redo';
                    } else {
                        command = 'undo';
                    }
                    break;
                case 'Y':
                    command = 'redo';
                    break;
                case '[':
                    command = 'outdent';
                    break;
                case ']':
                    command = 'indent';
                    break;
            }

            if (!command) return false;

            core.commandHandler(core.commandMap[command], command);
            return true;
        },

        _applyTagEffects: function () {
            let selectionNode = core.getSelectionNode();
            if (selectionNode === core.effectNode) return;
            core.effectNode = selectionNode;

            const commandMap = core.commandMap;
            const classOnCheck = this._onButtonsCheck;
            const commandMapNodes = [];
            const currentNodes = [];

            const activePlugins = core.activePlugins;
            const cLen = activePlugins.length;
            let nodeName = '';

            while (selectionNode.firstChild) {
                selectionNode = selectionNode.firstChild;
            }

            for (let element = selectionNode; !util.isWysiwygDiv(element); element = element.parentNode) {
                if (!element) break;
                if (element.nodeType !== 1 || util.isBreak(element)) continue;
                nodeName = element.nodeName.toUpperCase();
                currentNodes.push(nodeName);

                /* Active plugins */
                for (let c = 0, name; c < cLen; c++) {
                    name = activePlugins[c];
                    if (commandMapNodes.indexOf(name) === -1 && plugins[name].active.call(core, element)) {
                        commandMapNodes.push(name);
                    }
                }

                if (util.isFormatElement(element)) {
                    /* Outdent */
                    if (commandMapNodes.indexOf('OUTDENT') === -1 && commandMap.OUTDENT) {
                        if (util.isListCell(element) || (element.style.marginLeft && util.getNumber(element.style.marginLeft, 0) > 0)) {
                            commandMapNodes.push('OUTDENT');
                            commandMap.OUTDENT.removeAttribute('disabled');
                        }
                    }

                    /* Indent */
                    if (commandMapNodes.indexOf('INDENT') === -1 && commandMap.INDENT && util.isListCell(element) && !element.previousElementSibling) {
                        commandMapNodes.push('INDENT');
                        commandMap.INDENT.setAttribute('disabled', true);
                    }

                    continue;
                }

                /** default active buttons [strong, ins, em, del, sub, sup] */
                if (classOnCheck.test(nodeName)) {
                    commandMapNodes.push(nodeName);
                    util.addClass(commandMap[nodeName], 'active');
                }
            }

            /** remove class, display text */
            for (let key in commandMap) {
                if (commandMapNodes.indexOf(key) > -1) continue;
                
                if (activePlugins.indexOf(key) > -1) {
                    plugins[key].active.call(core, null);
                }
                else if (commandMap.OUTDENT && /^OUTDENT$/i.test(key)) {
                    commandMap.OUTDENT.setAttribute('disabled', true);
                }
                else if (commandMap.INDENT && /^INDENT$/i.test(key)) {
                    commandMap.INDENT.removeAttribute('disabled');
                }
                else {
                    util.removeClass(commandMap[key], 'active');
                }
            }

            /** save current nodes */
            core._variable.currentNodes = currentNodes.reverse();

            /**  Displays the current node structure to resizingBar */
            if (options.showPathLabel) context.element.navigation.textContent = core._variable.currentNodes.join(' > ');
        },

        _cancelCaptionEdit: function () {
            this.setAttribute('contenteditable', false);
            this.removeEventListener('blur', event._cancelCaptionEdit);
        },

        _buttonsEventHandler: function (e) {
            let target = e.target;
            if (core._bindControllersOff) e.stopPropagation();

            if (/^(input|textarea|select|option)$/i.test(target.nodeName)) {
                core._antiBlur = false;
            } else {
                e.preventDefault();
            }

            if (util.getParentElement(target, '.se-submenu')) {
                e.stopPropagation();
                core._notHideToolbar = true;
            } else {
                let command = target.getAttribute('data-command');
                let className = target.className;
    
                while (!command && !/se-menu-list/.test(className) && !/sun-editor-common/.test(className)) {
                    target = target.parentNode;
                    command = target.getAttribute('data-command');
                    className = target.className;
                }
    
                if (command === core._submenuName || command === core._containerName) {
                    e.stopPropagation();
                }
            }
        },

        onClick_toolbar: function (e) {
            let target = e.target;
            let display = target.getAttribute('data-display');
            let command = target.getAttribute('data-command');
            let className = target.className;

            while (target.parentNode && !command && !/se-menu-list/.test(className) && !/se-toolbar/.test(className)) {
                target = target.parentNode;
                command = target.getAttribute('data-command');
                display = target.getAttribute('data-display');
                className = target.className;
            }

            if (!command && !display) return;
            if (target.disabled) return;
            if (!core.hasFocus) core.nativeFocus();
            if (!core._variable.isCodeView) core._editorRange();

            core.actionCall(command, display, target);
        },

        onMouseDown_wysiwyg: function (e) {
            if (context.element.wysiwyg.getAttribute('contenteditable') === 'false') return;
            
            const tableCell = util.getParentElement(e.target, util.isCell);
            if (tableCell) {
                const tablePlugin = core.plugins.table;
                if (tablePlugin && tableCell !== tablePlugin._fixedCell && !tablePlugin._shift) {
                    core.callPlugin('table', function () {
                        tablePlugin.onTableCellMultiSelect.call(core, tableCell, false);
                    }, null);
                }
            }

            if (core._isBalloon) {
                event._hideToolbar();
            }

            if (functions.onMouseDown) functions.onMouseDown(e, core);
        },

        onClick_wysiwyg: function (e) {
            const targetElement = e.target;
            if (context.element.wysiwyg.getAttribute('contenteditable') === 'false') return;

            const fileComponentInfo = core.getFileComponent(targetElement);
            if (fileComponentInfo) {
                e.preventDefault();
                core.selectComponent(fileComponentInfo.component, fileComponentInfo.pluginName);
                return;
            }

            const figcaption = util.getParentElement(targetElement, 'FIGCAPTION');
            if (figcaption && (!figcaption.getAttribute('contenteditable') || figcaption.getAttribute('contenteditable') === 'false')) {
                e.preventDefault();
                figcaption.setAttribute('contenteditable', true);
                figcaption.focus();

                if (core._isInline && !core._inlineToolbarAttr.isShow) {
                    event._showToolbarInline();

                    const hideToolbar = function () {
                        event._hideToolbar();
                        figcaption.removeEventListener('blur', hideToolbar);
                    };

                    figcaption.addEventListener('blur', hideToolbar);
                }
            }

            _w.setTimeout(core._editorRange.bind(core));
            core._editorRange();

            const selectionNode = core.getSelectionNode();
            const formatEl = util.getFormatElement(selectionNode, null);
            const rangeEl = util.getRangeFormatElement(selectionNode, null);
            if (((!formatEl || formatEl === rangeEl) && targetElement.getAttribute('contenteditable') !== 'false')) {
                const range = core.getRange();
                if (util.getFormatElement(range.startContainer) === util.getFormatElement(range.endContainer)) {
                    if (util.isList(rangeEl)) {
                        const oLi = util.createElement('LI');
                        const prevLi = selectionNode.nextElementSibling;
                        oLi.appendChild(selectionNode);
                        rangeEl.insertBefore(oLi, prevLi);
                    } else if (!util.isWysiwygDiv(selectionNode) && !util.isComponent(selectionNode) && (!util.isTable(selectionNode) || util.isCell(selectionNode))) {
                        core._setDefaultFormat(util.isRangeFormatElement(rangeEl) ? 'DIV' : 'P');
                    }
                    
                    e.preventDefault();
                    core.focus();
                }
            } else {
                event._applyTagEffects();
            }

            if (core._isBalloon) _w.setTimeout(event._toggleToolbarBalloon);
            if (functions.onClick) functions.onClick(e, core);
        },

        _balloonDelay: null,
        _showToolbarBalloonDelay: function () {
            if (event._balloonDelay) {
                _w.clearTimeout(event._balloonDelay);
            }

            event._balloonDelay = _w.setTimeout(function () {
                _w.clearTimeout(this._balloonDelay);
                this._balloonDelay = null;
                this._showToolbarBalloon();
            }.bind(event), 350);
        },

        _toggleToolbarBalloon: function () {
            core._editorRange();
            const range = core.getRange();
            if (core.currentControllerName === 'table' || (!core._isBalloonAlways && range.collapsed)) event._hideToolbar();
            else event._showToolbarBalloon(range);
        },

        _showToolbarBalloon: function (rangeObj) {
            if (!core._isBalloon) return;

            const range = rangeObj || core.getRange();
            const toolbar = context.element.toolbar;
            const selection = core.getSelection();

            let isDirTop;
            if (core._isBalloonAlways && range.collapsed) {
                isDirTop = true;
            } else if (selection.focusNode === selection.anchorNode) {
                isDirTop = selection.focusOffset < selection.anchorOffset;
            } else {
                const childNodes = util.getListChildNodes(range.commonAncestorContainer, null);
                isDirTop = util.getArrayIndex(childNodes, selection.focusNode) < util.getArrayIndex(childNodes, selection.anchorNode);
            }

            let rects = range.getClientRects();
            rects = rects[isDirTop ? 0 : rects.length - 1];

            let scrollLeft = 0;
            let scrollTop = 0;
            let el = context.element.topArea;
            while (!!el) {
                scrollLeft += el.scrollLeft;
                scrollTop += el.scrollTop;
                el = el.parentElement;
            }

            const editorWidth = context.element.topArea.offsetWidth;
            const offsets = event._getEditorOffsets(null);
            const stickyTop = offsets.top;
            const editorLeft = offsets.left;
            
            toolbar.style.top = '-10000px';
            toolbar.style.visibility = 'hidden';
            toolbar.style.display = 'block';

            if (!rects) {
                const node = core.getSelectionNode();
                if (util.isFormatElement(node)) {
                    const zeroWidth = util.createTextNode(util.zeroWidthSpace);
                    core.insertNode(zeroWidth, null);
                    core.setRange(zeroWidth, 1, zeroWidth, 1);
                    core._editorRange();
                    rects = core.getRange().getClientRects();
                    rects = rects[isDirTop ? 0 : rects.length - 1];
                }

                if (!rects) {
                    const nodeOffset = util.getOffset(node, context.element.wysiwygFrame);
                    rects = {
                        left: nodeOffset.left,
                        top: nodeOffset.top,
                        right: nodeOffset.left,
                        bottom: nodeOffset.top + node.offsetHeight,
                        noText: true
                    };
                    scrollLeft = 0;
                    scrollTop = 0;
                }

                isDirTop = true;
            }

            const arrowMargin = _w.Math.round(context.element._arrow.offsetWidth / 2);
            const toolbarWidth = toolbar.offsetWidth;
            const toolbarHeight = toolbar.offsetHeight;
            const iframeRects = /iframe/i.test(context.element.wysiwygFrame.nodeName) ? context.element.wysiwygFrame.getClientRects()[0] : null;
            if (iframeRects) {
                rects = {
                    left: rects.left + iframeRects.left,
                    top: rects.top + iframeRects.top,
                    right: rects.right + iframeRects.right - iframeRects.width,
                    bottom: rects.bottom + iframeRects.bottom - iframeRects.height
                };
            }
            
            event._setToolbarOffset(isDirTop, rects, toolbar, editorLeft, editorWidth, scrollLeft, scrollTop, stickyTop, arrowMargin);
            if (toolbarWidth !== toolbar.offsetWidth || toolbarHeight !== toolbar.offsetHeight) {
                event._setToolbarOffset(isDirTop, rects, toolbar, editorLeft, editorWidth, scrollLeft, scrollTop, stickyTop, arrowMargin);
            }

            toolbar.style.visibility = '';
        },

        _setToolbarOffset: function (isDirTop, rects, toolbar, editorLeft, editorWidth, scrollLeft, scrollTop, stickyTop, arrowMargin) {
            const padding = 1;
            const toolbarWidth = toolbar.offsetWidth;
            const toolbarHeight = rects.noText && !isDirTop ? 0 : toolbar.offsetHeight;

            const absoluteLeft = (isDirTop ? rects.left : rects.right) - editorLeft - (toolbarWidth / 2) + scrollLeft;
            const overRight = absoluteLeft + toolbarWidth - editorWidth;
            
            let t = (isDirTop ? rects.top - toolbarHeight - arrowMargin : rects.bottom + arrowMargin) - (rects.noText ? 0 : stickyTop) + scrollTop;
            let l = absoluteLeft < 0 ? padding : overRight < 0 ? absoluteLeft : absoluteLeft - overRight - padding - 1;

            let resetTop = false;
            const space = t + (isDirTop ? (event._getEditorOffsets(null).top) : (toolbar.offsetHeight - context.element.wysiwyg.offsetHeight));
            if (!isDirTop && space > 0 && event._getPageBottomSpace() < space) {
                isDirTop = true;
                resetTop = true;
            } else if (isDirTop && _d.documentElement.offsetTop > space) {
                isDirTop = false;
                resetTop = true;
            }

            if (resetTop) t = (isDirTop ? rects.top - toolbarHeight - arrowMargin : rects.bottom + arrowMargin) - (rects.noText ? 0 : stickyTop) + scrollTop;

            toolbar.style.left = _w.Math.floor(l) + 'px';
            toolbar.style.top = _w.Math.floor(t) + 'px';

            if (isDirTop) {
                util.removeClass(context.element._arrow, 'se-arrow-up');
                util.addClass(context.element._arrow, 'se-arrow-down');
                context.element._arrow.style.top = toolbarHeight + 'px';
            } else {
                util.removeClass(context.element._arrow, 'se-arrow-down');
                util.addClass(context.element._arrow, 'se-arrow-up');
                context.element._arrow.style.top = -arrowMargin + 'px';
            }

            const arrow_left = _w.Math.floor((toolbarWidth / 2) + (absoluteLeft - l));
            context.element._arrow.style.left = (arrow_left + arrowMargin > toolbar.offsetWidth ? toolbar.offsetWidth - arrowMargin : arrow_left < arrowMargin ? arrowMargin : arrow_left) + 'px';
        },

        _showToolbarInline: function () {
            if (!core._isInline) return;

            const toolbar = context.element.toolbar;
            if (options.toolbarContainer) toolbar.style.position = 'relative';
            else toolbar.style.position = 'absolute';
            
            toolbar.style.visibility = 'hidden';
            toolbar.style.display = 'block';
            core._inlineToolbarAttr.width = toolbar.style.width = options.toolbarWidth;
            core._inlineToolbarAttr.top = toolbar.style.top = (options.toolbarContainer ? 0 : (-1 - toolbar.offsetHeight)) + 'px';
            
            if (typeof functions.showInline === 'function') functions.showInline(toolbar, context, core);

            event.onScroll_window();
            core._inlineToolbarAttr.isShow = true;
            toolbar.style.visibility = '';
        },

        _hideToolbar: function () {
            if (!core._notHideToolbar && !core._variable.isFullScreen) {
                context.element.toolbar.style.display = 'none';
                core._inlineToolbarAttr.isShow = false;
            }
        },

        onInput_wysiwyg: function (e) {
            core._editorRange();

            const data = (e.data === null ? '' : e.data === undefined ? ' ' : e.data) || '';       
            if (!core._charCount(data)) {
                e.preventDefault();
                e.stopPropagation();
            }

            // history stack
            core.history.push(true);

            if (functions.onInput) functions.onInput(e, core);
        },

        _onShortcutKey: false,
        onKeyDown_wysiwyg: function (e) {
            const keyCode = e.keyCode;
            const shift = e.shiftKey;
            const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92;
            const alt = e.altKey;

            core.submenuOff();

            if (core._isBalloon) {
                event._hideToolbar();
            }

            /** Shortcuts */
            if (ctrl && event._shortcutCommand(keyCode, shift)) {
                event._onShortcutKey = true;
                e.preventDefault();
                e.stopPropagation();
                return false;
            } else if (event._onShortcutKey) {
                event._onShortcutKey = false;
            }

            /** default key action */
            let selectionNode = core.getSelectionNode();
            const range = core.getRange();
            const selectRange = !range.collapsed || range.startContainer !== range.endContainer;
            const fileComponentName = core._fileManager.pluginRegExp.test(core.currentControllerName) ? core.currentControllerName : '';
            let formatEl = util.getFormatElement(selectionNode, null) || selectionNode;
            let rangeEl = util.getRangeFormatElement(formatEl, null);

            switch (keyCode) {
                case 8: /** backspace key */
                    if (!selectRange) {
                        if (fileComponentName) {
                            e.preventDefault();
                            e.stopPropagation();
                            core.plugins[fileComponentName].destroy.call(core);
                            break;
                        }
                    }

                    if (event._tableDelete()) {
                        e.preventDefault();
                        e.stopPropagation();
                        break;
                    }

                    if (!util.isFormatElement(formatEl) && !context.element.wysiwyg.firstElementChild && !util.isComponent(selectionNode)) {
                        e.preventDefault();
                        e.stopPropagation();
                        core._setDefaultFormat('P');
                        return false;
                    }

                    if (!selectRange && !formatEl.previousElementSibling && (util.isWysiwygDiv(formatEl.parentNode) && (util.isFormatElement(formatEl) && !util.isFreeFormatElement(formatEl)) && !util.isListCell(formatEl) &&
                     (formatEl.childNodes.length <= 1 && (!formatEl.firstChild || util.onlyZeroWidthSpace(formatEl.textContent))))) {
                        e.preventDefault();
                        e.stopPropagation();
                        formatEl.innerHTML = '<br>';
                        const attrs = formatEl.attributes;
                        while (attrs[0]) {
                            formatEl.removeAttribute(attrs[0].name);
                        }
                        core.nativeFocus();
                        return false;
                    }

                    // clean remove tag
                    if (formatEl && range.startContainer === range.endContainer && selectionNode.nodeType === 3 && !util.isFormatElement(selectionNode.parentNode)) {
                        if (range.collapsed ? selectionNode.textContent.length === 1 : (range.endOffset - range.startOffset) === selectionNode.textContent.length) {
                            e.preventDefault();

                            let offset = null;
                            let prev = selectionNode.parentNode.previousSibling;
                            const next = selectionNode.parentNode.nextSibling;
                            if (!prev) {
                                if (!next) {
                                    prev = util.createElement('BR');
                                    formatEl.appendChild(prev);
                                } else {
                                    prev = next;
                                    offset = 0;
                                }
                            }

                            selectionNode.textContent = '';
                            util.removeItemAllParents(selectionNode, null, formatEl);
                            offset = typeof offset === 'number' ? offset : prev.nodeType === 3 ? prev.textContent.length : 1;
                            core.setRange(prev, offset, prev, offset);
                            break;
                        }
                    }

                    // nested list
                    const commonCon = range.commonAncestorContainer;
                    formatEl = util.getFormatElement(range.startContainer, null);
                    rangeEl = util.getRangeFormatElement(formatEl, null);
                    if (rangeEl && formatEl && !util.isCell(rangeEl) && !/^FIGCAPTION$/i.test(rangeEl.nodeName)) {
                        if (util.isListCell(formatEl) && util.isList(rangeEl) && (util.isListCell(rangeEl.parentNode) || formatEl.previousElementSibling) && (selectionNode === formatEl || (selectionNode.nodeType === 3 && (!selectionNode.previousSibling || util.isList(selectionNode.previousSibling)))) &&
                         (util.getFormatElement(range.startContainer, null) !== util.getFormatElement(range.endContainer, null) ? rangeEl.contains(range.startContainer) : (range.startOffset === 0  && range.collapsed))) {
                            if (range.startContainer !== range.endContainer) {
                                e.preventDefault();

                                core.removeNode();
                                if (range.startContainer.nodeType === 3) {
                                    core.setRange(range.startContainer, range.startContainer.textContent.length, range.startContainer, range.startContainer.textContent.length);
                                }
                                // history stack
                                core.history.push(true);
                            } else {
                                let prev = formatEl.previousElementSibling || rangeEl.parentNode;
                                if (util.isListCell(prev)) {
                                    e.preventDefault();

                                    let prevLast = prev;
                                    if (!prev.contains(formatEl) && util.isListCell(prevLast) && util.isList(prevLast.lastElementChild)) {
                                        prevLast = prevLast.lastElementChild.lastElementChild;
                                        while (util.isListCell(prevLast) && util.isList(prevLast.lastElementChild)) {
                                            prevLast = prevLast.lastElementChild && prevLast.lastElementChild.lastElementChild;
                                        }
                                        prev = prevLast;
                                    }

                                    let con = prev === rangeEl.parentNode ? rangeEl.previousSibling : prev.lastChild;
                                    if (!con) {
                                        con = util.createTextNode(util.zeroWidthSpace);
                                        rangeEl.parentNode.insertBefore(con, rangeEl.parentNode.firstChild);
                                    }
                                    const offset = con.nodeType === 3 ? con.textContent.length : 1;
                                    const children = formatEl.childNodes;
                                    let after = con;
                                    let child = children[0];
                                    while ((child = children[0])) {
                                        prev.insertBefore(child, after.nextSibling);
                                        after = child;
                                    }

                                    util.removeItem(formatEl);
                                    if (rangeEl.children.length === 0) util.removeItem(rangeEl);

                                    core.setRange(con, offset, con, offset);
                                    // history stack
                                    core.history.push(true);
                                }
                            }
                            
                            break;
                        }

                        // detach range
                        if (!selectRange && range.startOffset === 0) {
                            let detach = true;
                            let comm = commonCon;
                            while (comm && comm !== rangeEl && !util.isWysiwygDiv(comm)) {
                                if (comm.previousSibling) {
                                    if (comm.previousSibling.nodeType === 1 || !util.onlyZeroWidthSpace(comm.previousSibling.textContent.trim())) {
                                        detach = false;
                                        break;
                                    }
                                }
                                comm = comm.parentNode;
                            }
    
                            if (detach && rangeEl.parentNode) {
                                e.preventDefault();
                                core.detachRangeFormatElement(rangeEl, (util.isListCell(formatEl) ? [formatEl] : null), null, false, false);
                                // history stack
                                core.history.push(true);
                                break;
                            }
                        }
                    }

                    // component
                    if (!selectRange && range.startOffset === 0) {
                        if (util.isComponent(commonCon.previousSibling) || (commonCon.nodeType === 3 && !commonCon.previousSibling && range.startOffset === 0 && range.endOffset === 0 && util.isComponent(formatEl.previousSibling))) {
                            const fileComponentInfo = core.getFileComponent(formatEl.previousSibling);
                            if (fileComponentInfo) {
                                e.preventDefault();
                                e.stopPropagation();
                                core.selectComponent(fileComponentInfo.component, fileComponentInfo.pluginName);
                                if (formatEl.textContent.length === 0) util.removeItem(formatEl);
                            }
                            break;
                        }
                    }

                    break;
                case 46: /** delete key */
                    if (fileComponentName) {
                        e.preventDefault();
                        e.stopPropagation();
                        core.plugins[fileComponentName].destroy.call(core);
                        break;
                    }

                    if (event._tableDelete()) {
                        e.preventDefault();
                        e.stopPropagation();
                        break;
                    }

                    // component
                    if ((util.isFormatElement(selectionNode) || selectionNode.nextSibling === null || (util.onlyZeroWidthSpace(selectionNode.nextSibling) && selectionNode.nextSibling.nextSibling === null)) && range.startOffset === selectionNode.textContent.length) {
                        let nextEl = formatEl.nextElementSibling;
                        if (!nextEl) {
                            e.preventDefault();
                            break;
                        }

                        if (util.isComponent(nextEl)) {
                            e.preventDefault();

                            if (util.onlyZeroWidthSpace(formatEl)) {
                                util.removeItem(formatEl);
                                // table component
                                if (util.isTable(nextEl)) {
                                    let cell = util.getChildElement(nextEl, util.isCell, false);
                                    cell = cell.firstElementChild || cell;
                                    core.setRange(cell, 0, cell, 0);
                                    break;
                                }
                            }

                            // component
                            const fileComponentInfo = core.getFileComponent(nextEl);
                            if (fileComponentInfo) {
                                e.stopPropagation();
                                core.selectComponent(fileComponentInfo.component, fileComponentInfo.pluginName);
                            }

                            break;
                        }
                    }

                    // nested list
                    formatEl = util.getFormatElement(range.startContainer, null);
                    rangeEl = util.getRangeFormatElement(formatEl, null);
                    if (util.isListCell(formatEl) && util.isList(rangeEl) && (selectionNode === formatEl || (selectionNode.nodeType === 3 && (!selectionNode.nextSibling || util.isList(selectionNode.nextSibling)) &&
                     (util.getFormatElement(range.startContainer, null) !== util.getFormatElement(range.endContainer, null) ? rangeEl.contains(range.endContainer) : (range.endOffset === selectionNode.textContent.length && range.collapsed))))) {
                        if (range.startContainer !== range.endContainer) core.removeNode();
                        
                        let next = util.getArrayItem(formatEl.children, util.isList, false);
                        next = next || formatEl.nextElementSibling || rangeEl.parentNode.nextElementSibling;
                        if (next && (util.isList(next) || util.getArrayItem(next.children, util.isList, false))) {
                            e.preventDefault();

                            let con, children;
                            if (util.isList(next)) {
                                const child = next.firstElementChild;
                                children = child.childNodes;
                                con = children[0];
                                while (children[0]) {
                                    formatEl.insertBefore(children[0], next);
                                }
                                util.removeItem(child);
                            } else {
                                con = next.firstChild;
                                children = next.childNodes;
                                while (children[0]) {
                                    formatEl.appendChild(children[0]);
                                }
                                util.removeItem(next);
                            }
                            core.setRange(con, 0, con, 0);
                            // history stack
                            core.history.push(true);
                        }
                        break;
                    }

                    break;
                case 9: /** tab key */
                    if (fileComponentName || options.tabDisable) break;
                    e.preventDefault();
                    if (ctrl || alt || util.isWysiwygDiv(selectionNode)) break;

                    const isEdge = (!range.collapsed || core.isEdgePoint(range.startContainer, range.startOffset));            
                    const selectedFormats = core.getSelectedElements(null);
                    selectionNode = core.getSelectionNode();
                    const cells = [];
                    let lines = [];
                    let fc = util.isListCell(selectedFormats[0]), lc = util.isListCell(selectedFormats[selectedFormats.length - 1]);
                    let r = {sc: range.startContainer, so: range.startOffset, ec: range.endContainer, eo: range.endOffset};
                    for (let i = 0, len = selectedFormats.length, f; i < len; i++) {
                        f = selectedFormats[i];
                        if (util.isListCell(f)) {
                            if (!f.previousElementSibling && !shift) {
                                continue;
                            } else {
                                cells.push(f);
                            }
                        } else {
                            lines.push(f);
                        }
                    }
                    
                    // Nested list
                    if (cells.length > 0 && isEdge && core.plugins.list) {
                        r = core.plugins.list.editInsideList.call(core, shift, cells);
                    } else {
                        // table
                        const tableCell = util.getParentElement(selectionNode, util.isCell);
                        if (tableCell && isEdge) {
                            const table = util.getParentElement(tableCell, 'table');
                            const cells = util.getListChildren(table, util.isCell);
                            let idx = shift ? util.prevIdx(cells, tableCell) : util.nextIdx(cells, tableCell);

                            if (idx === cells.length && !shift) idx = 0;
                            if (idx === -1 && shift) idx = cells.length - 1;

                            let moveCell = cells[idx];
                            if (!moveCell) break;
                            moveCell = moveCell.firstElementChild || moveCell;
                            core.setRange(moveCell, 0, moveCell, 0);
                            break;
                        }

                        lines = lines.concat(cells);
                        fc = lc = null;
                    }

                    // Lines tab(4)
                    if (lines.length > 0) {
                        if (!shift) {
                            const tabText = util.createTextNode(new _w.Array(core._variable.tabSize + 1).join('\u00A0'));
                            if (lines.length === 1) {
                                const textRange = core.insertNode(tabText, null);
                                if (!fc) {
                                    r.sc = tabText;
                                    r.so = textRange.endOffset;
                                }
                                if (!lc) {
                                    r.ec = tabText;
                                    r.eo = textRange.endOffset;
                                }
                            } else {
                                const len = lines.length - 1;
                                for (let i = 0, child; i <= len; i++) {
                                    child = lines[i].firstChild;
                                    if (!child) continue;
    
                                    if (util.isBreak(child)) {
                                        lines[i].insertBefore(tabText.cloneNode(false), child);
                                    } else {
                                        child.textContent = tabText.textContent + child.textContent;
                                    }
                                }
    
                                const firstChild = util.getChildElement(lines[0], 'text', false);
                                const endChild = util.getChildElement(lines[len], 'text', true);
                                if (!fc && firstChild) {
                                    r.sc = firstChild;
                                    r.so = 0;
                                }
                                if (!lc && endChild) {
                                    r.ec = endChild;
                                    r.eo = endChild.textContent.length;
                                }
                            }
                        } else {
                            const len = lines.length - 1;
                            for (let i = 0, line; i <= len; i++) {
                                line = lines[i].childNodes;
                                for (let c = 0, cLen = line.length, child; c < cLen; c++) {
                                    child = line[c];
                                    if (!child) break;
                                    if (util.onlyZeroWidthSpace(child)) continue;
        
                                    if (/^\s{1,4}$/.test(child.textContent)) {
                                        util.removeItem(child);
                                    } else if (/^\s{1,4}/.test(child.textContent)) {
                                        child.textContent = child.textContent.replace(/^\s{1,4}/, '');
                                    }
                                    
                                    break;
                                }
                            }
    
                            const firstChild = util.getChildElement(lines[0], 'text', false);
                            const endChild = util.getChildElement(lines[len], 'text', true);
                            if (!fc && firstChild) {
                                r.sc = firstChild;
                                r.so = 0;
                            }
                            if (!lc && endChild) {
                                r.ec = endChild;
                                r.eo = endChild.textContent.length;
                            }
                        }
                    }

                    core.setRange(r.sc, r.so, r.ec, r.eo);
                    // history stack
                    core.history.push(false);
                    
                    break;
                case 13: /** enter key */
                    const freeFormatEl = util.getFreeFormatElement(selectionNode, null);
                    if (!shift && freeFormatEl) {
                        e.preventDefault();
                        const selectionFormat = selectionNode === freeFormatEl;
                        const wSelection = core.getSelection();
                        const children = selectionNode.childNodes, offset = wSelection.focusOffset, prev = selectionNode.previousElementSibling, next = selectionNode.nextSibling;

                        if (!!children && ((selectionFormat && range.collapsed && children.length - 1 <= offset + 1 && util.isBreak(children[offset]) && (!children[offset + 1] || ((!children[offset + 2] || util.onlyZeroWidthSpace(children[offset + 2].textContent)) && children[offset + 1].nodeType === 3 && util.onlyZeroWidthSpace(children[offset + 1].textContent))) &&  offset > 0 && util.isBreak(children[offset - 1])) ||
                          (!selectionFormat && util.onlyZeroWidthSpace(selectionNode.textContent) && util.isBreak(prev) && (util.isBreak(prev.previousSibling) || !util.onlyZeroWidthSpace(prev.previousSibling.textContent)) && (!next || (!util.isBreak(next) && util.onlyZeroWidthSpace(next.textContent)))))) {
                            if (selectionFormat) util.removeItem(children[offset - 1]);
                            else util.removeItem(selectionNode);
                            const newEl = core.appendFormatTag(freeFormatEl, util.isFormatElement(freeFormatEl.nextElementSibling) ? freeFormatEl.nextElementSibling : null);
                            util.copyFormatAttributes(newEl, freeFormatEl);
                            core.setRange(newEl, 1, newEl, 1);
                            break;
                        }
                        
                        if (selectionFormat) {
                            functions.insertHTML(((range.collapsed && util.isBreak(range.startContainer.childNodes[range.startOffset - 1])) ? '<br>' : '<br><br>'), true);

                            let focusNode = wSelection.focusNode;
                            const wOffset = wSelection.focusOffset;
                            if (freeFormatEl === focusNode) {
                                focusNode = focusNode.childNodes[wOffset - offset > 1 ? wOffset - 1 : wOffset];
                            }

                            core.setRange(focusNode, 1, focusNode, 1);
                        } else {
                            const focusNext = wSelection.focusNode.nextSibling;
                            const br = util.createElement('BR');
                            core.insertNode(br, null);

                            const brPrev = br.previousSibling, brNext = br.nextSibling;
                            if (!util.isBreak(focusNext) && !util.isBreak(brPrev) && (!brNext || util.onlyZeroWidthSpace(brNext))) {
                                br.parentNode.insertBefore(br.cloneNode(false), br);
                                core.setRange(br, 1, br, 1);
                            } else {
                                core.setRange(brNext, 0, brNext, 0);
                            }
                        }

                        event._onShortcutKey = true;
                        break;
                    }

                    if (selectRange) break;
                    
                    if (rangeEl && formatEl && !util.isCell(rangeEl) && !/^FIGCAPTION$/i.test(rangeEl.nodeName)) {
                        const range = core.getRange();
                        if ((range.commonAncestorContainer.nodeType === 3 ? !range.commonAncestorContainer.nextElementSibling : true) && util.onlyZeroWidthSpace(formatEl.innerText.trim())) {
                            e.preventDefault();
                            let newEl = null;

                            if (util.isListCell(rangeEl.parentNode)) {
                                rangeEl = formatEl.parentNode.parentNode.parentNode;
                                const splitRange = util.splitElement(formatEl, null, util.getElementDepth(formatEl) - 2);
                                newEl = util.createElement('LI');
                                rangeEl.insertBefore(newEl, splitRange);
                            } else {
                                const newFormat = util.isCell(rangeEl.parentNode) ? 'DIV' : util.isList(rangeEl.parentNode) ? 'LI' : util.isFormatElement(rangeEl.nextElementSibling) ? rangeEl.nextElementSibling.nodeName : util.isFormatElement(rangeEl.previousElementSibling) ? rangeEl.previousElementSibling.nodeName : 'P';
                                newEl = util.createElement(newFormat);
                                const edge = core.detachRangeFormatElement(rangeEl, [formatEl], null, true, true);
                                edge.cc.insertBefore(newEl, edge.ec);
                            }
                            
                            newEl.innerHTML = '<br>';
                            util.copyFormatAttributes(newEl, formatEl);
                            util.removeItemAllParents(formatEl, null, null);
                            core.setRange(newEl, 1, newEl, 1);
                            break;
                        }
                    }

                    if (rangeEl && util.getParentElement(rangeEl, 'FIGCAPTION') && util.getParentElement(rangeEl, util.isList)) {
                        e.preventDefault();
                        formatEl = core.appendFormatTag(formatEl, null);
                        core.setRange(formatEl, 0, formatEl, 0);
                    }

                    if (fileComponentName) {
                        e.preventDefault();
                        e.stopPropagation();
                        const compContext = context[fileComponentName];
                        const container = compContext._container;
                        const sibling = container.previousElementSibling || container.nextElementSibling;

                        let newEl = null;
                        if (util.isListCell(container.parentNode)) {
                            newEl = util.createElement('BR');
                        } else {
                            newEl = util.createElement(util.isFormatElement(sibling) ? sibling.nodeName : 'P');
                            newEl.innerHTML = '<br>';
                        }

                        container.parentNode.insertBefore(newEl, container);
                        
                        core.callPlugin(fileComponentName, function () {
                            const size = (core.plugins.resizing && core.context[fileComponentName]._resizing !== undefined) ? core.plugins.resizing.call_controller_resize.call(core, compContext._element, fileComponentName) : null;
                            core.plugins[fileComponentName].onModifyMode.call(core, compContext._element, size);
                        }, null);
                    }
                    
                    break;
                case 27:
                    if (fileComponentName) {
                        e.preventDefault();
                        e.stopPropagation();
                        core.controllersOff();
                        return false;
                    }
                    break;
            }

            if (shift && /16/.test(keyCode)) {
                e.preventDefault();
                e.stopPropagation();
                const tablePlugin = core.plugins.table;
                if (tablePlugin && !tablePlugin._shift && !tablePlugin._ref) {
                    const cell = util.getParentElement(formatEl, util.isCell);
                    if (cell) {
                        tablePlugin.onTableCellMultiSelect.call(core, cell, true);
                        return;
                    }
                }
            }

            const textKey = !ctrl && !alt && !selectRange && !event._nonTextKeyCode.test(keyCode);
            if (textKey && range.collapsed && range.startContainer === range.endContainer && util.isBreak(range.commonAncestorContainer)) {
                const zeroWidth = util.createTextNode(util.zeroWidthSpace);
                core.insertNode(zeroWidth, null);
                core.setRange(zeroWidth, 1, zeroWidth, 1);
            }

            if (functions.onKeyDown) functions.onKeyDown(e, core);
        },

        onKeyUp_wysiwyg: function (e) {
            if (event._onShortcutKey) return;
            core._editorRange();

            const range = core.getRange();
            const keyCode = e.keyCode;
            const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92;
            const alt = e.altKey;
            let selectionNode = core.getSelectionNode();

            if (core._isBalloon && ((core._isBalloonAlways && keyCode !== 27) || !range.collapsed)) {
                if (core._isBalloonAlways) {
                    if (keyCode !== 27) event._showToolbarBalloonDelay();
                } else {
                    event._showToolbarBalloon();
                    return;
                }
            }

            /** when format tag deleted */
            if (keyCode === 8 && util.isWysiwygDiv(selectionNode) && selectionNode.textContent === '' && selectionNode.children.length === 0) {
                e.preventDefault();
                e.stopPropagation();

                selectionNode.innerHTML = '';

                const oFormatTag = util.createElement(util.isFormatElement(core._variable.currentNodes[0]) ? core._variable.currentNodes[0] : 'P');
                oFormatTag.innerHTML = '<br>';

                selectionNode.appendChild(oFormatTag);
                core.setRange(oFormatTag, 0, oFormatTag, 0);
                event._applyTagEffects();

                core.history.push(false);
                return;
            }

            const formatEl = util.getFormatElement(selectionNode, null);
            const rangeEl = util.getRangeFormatElement(selectionNode, null);
            if (((!formatEl && range.collapsed) || formatEl === rangeEl) && !util.isComponent(selectionNode)) {
                core._setDefaultFormat(util.isRangeFormatElement(rangeEl) ? 'DIV' : 'P');
                selectionNode = core.getSelectionNode();
            }

            if (event._directionKeyCode.test(keyCode)) {
                event._applyTagEffects();
            }

            const textKey = !ctrl && !alt && !event._nonTextKeyCode.test(keyCode);
            if (textKey && selectionNode.nodeType === 3 && util.zeroWidthRegExp.test(selectionNode.textContent) && util.getByteLength(e.key) < 3) {
                let so = range.startOffset, eo = range.endOffset;
                const frontZeroWidthCnt = (selectionNode.textContent.substring(0, eo).match(event._frontZeroWidthReg) || '').length;
                so = range.startOffset - frontZeroWidthCnt;
                eo = range.endOffset - frontZeroWidthCnt;
                selectionNode.textContent = selectionNode.textContent.replace(util.zeroWidthRegExp, '');
                core.setRange(selectionNode, so < 0 ? 0 : so, selectionNode, eo < 0 ? 0 : eo);
            }

            core._charCount('');

            // history stack
            core.history.push(true);

            if (functions.onKeyUp) functions.onKeyUp(e, core);
        },

        onScroll_wysiwyg: function (e) {
            core.controllersOff();
            core._lineBreaker.style.display = 'none';
            if (core._isBalloon) event._hideToolbar();
            if (functions.onScroll) functions.onScroll(e, core);
        },

        onFocus_wysiwyg: function (e) {
            if (core._antiBlur) return;
            core.hasFocus = true;
            if (core._isInline) event._showToolbarInline();
            if (functions.onFocus) functions.onFocus(e, core);
        },

        onBlur_wysiwyg: function (e) {
            if (core._antiBlur) return;
            core.hasFocus = false;
            core.controllersOff();
            if (core._isInline || core._isBalloon) event._hideToolbar();
            if (functions.onBlur) functions.onBlur(e, core);
        },

        onMouseDown_resizingBar: function (e) {
            e.stopPropagation();

            core._variable.resizeClientY = e.clientY;
            context.element.resizeBackground.style.display = 'block';

            function closureFunc() {
                context.element.resizeBackground.style.display = 'none';
                _d.removeEventListener('mousemove', event._resize_editor);
                _d.removeEventListener('mouseup', closureFunc);
            }

            _d.addEventListener('mousemove', event._resize_editor);
            _d.addEventListener('mouseup', closureFunc);
        },

        _resize_editor: function (e) {
            const resizeInterval = context.element.editorArea.offsetHeight + (e.clientY - core._variable.resizeClientY);
            context.element.wysiwygFrame.style.height = context.element.code.style.height = (resizeInterval < core._variable.minResizingSize ? core._variable.minResizingSize : resizeInterval) + 'px';
            core._variable.resizeClientY = e.clientY;
        },

        onResize_window: function () {
            core.controllersOff();

            const responsiveSize = event._responsiveButtonSize;
            if (responsiveSize) {
                const windowWidth = _w.innerWidth;
                let responsiveWidth = 'default';
                for (let i = 1, len = responsiveSize.length; i < len; i++) {
                    if (windowWidth < responsiveSize[i]) {
                        responsiveWidth = responsiveSize[i] + '';
                    }
                }

                if (event._responsiveCurrentSize !== responsiveWidth) {
                    event._responsiveCurrentSize = responsiveWidth;
                    functions.setToolbarButtons(event._responsiveButtons[responsiveWidth]);
                }
            }

            if (context.element.toolbar.offsetWidth === 0) return;

            if (core._variable.isFullScreen) {
                core._variable.innerHeight_fullScreen += (_w.innerHeight - context.element.toolbar.offsetHeight) - core._variable.innerHeight_fullScreen;
                context.element.editorArea.style.height = core._variable.innerHeight_fullScreen + 'px';
                return;
            }

            if (core._variable.isCodeView && core._isInline) {
                event._showToolbarInline();
                return;
            }
            
            core._iframeAutoHeight();

            if (core._sticky) {
                context.element.toolbar.style.width = (context.element.topArea.offsetWidth - 2) + 'px';
                event.onScroll_window();
            }
        },

        onScroll_window: function () {
            if (core._variable.isFullScreen || context.element.toolbar.offsetWidth === 0 || options.stickyToolbar < 0) return;

            const element = context.element;
            const editorHeight = element.editorArea.offsetHeight;
            const y = (this.scrollY || _d.documentElement.scrollTop) + options.stickyToolbar;
            const editorTop = event._getEditorOffsets(options.toolbarContainer).top - (core._isInline ? element.toolbar.offsetHeight : 0);
            
            if (y < editorTop) {
                event._offStickyToolbar();
            }
            else if (y + core._variable.minResizingSize >= editorHeight + editorTop) {
                if (!core._sticky) event._onStickyToolbar();
                element.toolbar.style.top = (editorHeight + editorTop + options.stickyToolbar -y - core._variable.minResizingSize) + 'px';
            }
            else if (y >= editorTop) {
                event._onStickyToolbar();
            }
        },

        _getEditorOffsets: function (container) {
            let offsetEl = container || context.element.topArea;
            let t = 0, l = 0, s = 0;

            while (offsetEl) {
                t += offsetEl.offsetTop;
                l += offsetEl.offsetLeft;
                s += offsetEl.scrollTop;
                offsetEl = offsetEl.offsetParent;
            }

            return {
                top: t,
                left: l,
                scroll: s
            };
        },

        _getPageBottomSpace: function () {
            return _d.documentElement.scrollHeight - (event._getEditorOffsets(null).top + context.element.topArea.offsetHeight);
        },

        _onStickyToolbar: function () {
            const element = context.element;

            if (!core._isInline && !options.toolbarContainer) {
                element._stickyDummy.style.height = element.toolbar.offsetHeight + 'px';
                element._stickyDummy.style.display = 'block';
            }

            element.toolbar.style.top = options.stickyToolbar + 'px';
            element.toolbar.style.width = core._isInline ? core._inlineToolbarAttr.width : element.toolbar.offsetWidth + 'px';
            util.addClass(element.toolbar, 'se-toolbar-sticky');
            core._sticky = true;
        },

        _offStickyToolbar: function () {
            const element = context.element;

            element._stickyDummy.style.display = 'none';
            element.toolbar.style.top = core._isInline ? core._inlineToolbarAttr.top : '';
            element.toolbar.style.width = core._isInline ? core._inlineToolbarAttr.width : '';
            element.editorArea.style.marginTop = '';

            util.removeClass(element.toolbar, 'se-toolbar-sticky');
            core._sticky = false;
        },

        _codeViewAutoHeight: function () {
            context.element.code.style.height = context.element.code.scrollHeight + 'px';
        },

        // FireFox - table delete
        _tableDelete: function () {
            const range = core.getRange();
            const sCell = util.getRangeFormatElement(range.startContainer);
            const eCell = util.getRangeFormatElement(range.endContainer);

            if (util.isCell(sCell) && util.isCell(eCell) && !sCell.previousElementSibling && !eCell.nextElementSibling) {
                const table = util.getParentElement(sCell, util.isComponent);
                util.removeItem(table);
                core.nativeFocus();
                return true;
            }

            return false;
        },

        onPaste_wysiwyg: function (e) {
            const isIE = util.isIE;
            const clipboardData = isIE ? _w.clipboardData : e.clipboardData;
            if (!clipboardData) return true;

            let plainText, cleanData;
            if (isIE) {
                plainText = clipboardData.getData('Text');
                
                const range = core.getRange();
                const tempDiv = util.createElement('DIV');
                const tempRange = {
                    sc: range.startContainer,
                    so: range.startOffset,
                    ec: range.endContainer,
                    eo: range.endOffset
                };

                tempDiv.setAttribute('contenteditable', true);
                tempDiv.style.cssText = 'position:absolute; top:0; left:0; width:1px; height:1px; overflow:hidden;';
                
                context.element.relative.appendChild(tempDiv);
                tempDiv.focus();
                core._editorRange();

                _w.setTimeout(function () {
                    cleanData = tempDiv.innerHTML;
                    util.removeItem(tempDiv);
                    core.setRange(tempRange.sc, tempRange.so, tempRange.ec, tempRange.eo);
                    event._setClipboardData(e, plainText, cleanData);
                });

                return true;
            } else {
                plainText = clipboardData.getData('text/plain');
                cleanData = clipboardData.getData('text/html');
                return event._setClipboardData(e, plainText, cleanData);
            }
        },

        _setClipboardData: function (e, plainText, cleanData) {
            cleanData = core.cleanHTML(cleanData, core.pasteTagsWhitelistRegExp);
            plainText = plainText.replace(/\n/g, '');
            const maxCharCount = core._charCount(options.charCounterType === 'byte-html' ? cleanData : plainText);

            if (typeof functions.onPaste === 'function' && !functions.onPaste(e, cleanData, maxCharCount, core)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            if (!maxCharCount) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            if (cleanData) {
                e.stopPropagation();
                e.preventDefault();
                functions.insertHTML(cleanData, true);
                return false;
            }
        },

        onCut_wysiwyg: function () {
            _w.setTimeout(function () {
                // history stack
                core.history.push(false);
            });
        },

        onDragOver_wysiwyg: function (e) {
            e.preventDefault();
        },

        onDrop_wysiwyg: function (e) {
            const dataTransfer = e.dataTransfer;
            if (!dataTransfer) return true;

            if (typeof functions.onDrop === 'function' && !functions.onDrop(e, dataTransfer, core)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // files
            const files = dataTransfer.files;
            if (files.length > 0 && core.plugins.image) {
                event._setDropLocationSelection(e);
                core.callPlugin('image', core.plugins.image.submitAction.bind(core, files), null);
            // check char count
            } else if (!core._charCount(dataTransfer.getData('text/plain'))) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            // html paste
            } else {
                const cleanData = core.cleanHTML(dataTransfer.getData('text/html'), core.pasteTagsWhitelistRegExp);
                if (cleanData) {
                    event._setDropLocationSelection(e);
                    functions.insertHTML(cleanData, true);
                }
            }
        },

        onMouseMove_wysiwyg: function (e) {
            if (core.isDisabled) return;
            const component = util.getParentElement(e.target, util.isComponent);
            const lineBreakerStyle = core._lineBreaker.style;

            if (component) {
                let scrollTop = 0;
                let el = context.element.wysiwyg;
                do {
                    scrollTop += el.scrollTop;
                    el = el.parentElement;
                } while (el && !/^(BODY|HTML)$/i.test(el.nodeName));

                const wScroll = context.element.wysiwyg.scrollTop;
                const offsets = event._getEditorOffsets(null);
                const componentTop = util.getOffset(component, context.element.wysiwygFrame).top + wScroll;
                const y = e.pageY + scrollTop + (options.iframe && !options.toolbarContainer ? context.element.toolbar.offsetHeight : 0);
                const c = componentTop + (options.iframe ? scrollTop : offsets.top);

                let dir = '', top = '';
                if (!util.isFormatElement(component.previousElementSibling) && y < (c + 20)) {
                    top = componentTop;
                    dir = 't';
                } else if (!util.isFormatElement(component.nextElementSibling) && y > (c + component.offsetHeight - 20)) {
                    top = componentTop + component.offsetHeight;
                    dir = 'b';
                } else {
                    lineBreakerStyle.display = 'none';
                    return;
                }

                core._variable._lineBreakComp = component;
                core._variable._lineBreakDir = dir;
                lineBreakerStyle.top = (top - wScroll) + 'px';
                lineBreakerStyle.visibility = 'hidden';
                lineBreakerStyle.display = 'block';
                core._lineBreakerButton.style.left = (component.offsetLeft + (component.offsetWidth / 2) - (core._lineBreakerButton.offsetWidth / 2)) + 'px';
                lineBreakerStyle.visibility = '';
            } // off line breaker
            else if (lineBreakerStyle.display !== 'none') {
                lineBreakerStyle.display = 'none';
            }
        },

        _onMouseDown_lineBreak: function (e) {
            e.preventDefault();
        },

        _onLineBreak: function () {
            const component = core._variable._lineBreakComp;

            const format = util.createElement('P');
            format.innerHTML = '<br>';
            component.parentNode.insertBefore(format, core._variable._lineBreakDir === 't' ? component : component.nextSibling);

            core._lineBreaker.style.display = 'none';
            core._variable._lineBreakComp = null;

            core.setRange(format.firstChild, 1, format.firstChild, 1);
            // history stack
            core.history.push(false);
        },

        _setDropLocationSelection: function (e) {
            e.stopPropagation();
            e.preventDefault();
            
            const range = core.getRange();
            core.setRange(range.startContainer, range.startOffset, range.endContainer, range.endOffset);
        },

        _onChange_historyStack: function () {
            event._applyTagEffects();
            if (context.tool.save) context.tool.save.removeAttribute('disabled');
            if (functions.onChange) functions.onChange(core.getContents(true), core);
        },

        _addEvent: function () {
            const eventWysiwyg = options.iframe ? core._ww : context.element.wysiwyg;

            /** toolbar event */
            context.element.toolbar.addEventListener('mousedown', event._buttonsEventHandler, false);
            context.element._menuTray.addEventListener('mousedown', event._buttonsEventHandler, false);
            context.element.toolbar.addEventListener('click', event.onClick_toolbar, false);
            /** editor area */
            eventWysiwyg.addEventListener('mousedown', event.onMouseDown_wysiwyg, false);
            eventWysiwyg.addEventListener('click', event.onClick_wysiwyg, false);
            eventWysiwyg.addEventListener(util.isIE ? 'textinput' : 'input', event.onInput_wysiwyg, false);
            eventWysiwyg.addEventListener('keydown', event.onKeyDown_wysiwyg, false);
            eventWysiwyg.addEventListener('keyup', event.onKeyUp_wysiwyg, false);
            eventWysiwyg.addEventListener('paste', event.onPaste_wysiwyg, false);
            eventWysiwyg.addEventListener('cut', event.onCut_wysiwyg, false);
            eventWysiwyg.addEventListener('dragover', event.onDragOver_wysiwyg, false);
            eventWysiwyg.addEventListener('drop', event.onDrop_wysiwyg, false);
            eventWysiwyg.addEventListener('scroll', event.onScroll_wysiwyg, false);
            eventWysiwyg.addEventListener('focus', event.onFocus_wysiwyg, false);
            eventWysiwyg.addEventListener('blur', event.onBlur_wysiwyg, false);

            /** line breaker */
            eventWysiwyg.addEventListener('mousemove', event.onMouseMove_wysiwyg, false);
            core._lineBreakerButton.addEventListener('mousedown', event._onMouseDown_lineBreak, false);
            core._lineBreakerButton.addEventListener('click', event._onLineBreak, false);

            /** Events are registered only when there is a table plugin.  */
            if (core.plugins.table) {
                eventWysiwyg.addEventListener('touchstart', event.onMouseDown_wysiwyg, {passive: true, useCapture: false});
            }
            
            /** code view area auto line */
            if (options.height === 'auto' && !options.codeMirrorEditor) {
                context.element.code.addEventListener('keydown', event._codeViewAutoHeight, false);
                context.element.code.addEventListener('keyup', event._codeViewAutoHeight, false);
                context.element.code.addEventListener('paste', event._codeViewAutoHeight, false);
            }

            /** resizingBar */
            if (context.element.resizingBar) {
                if (/\d+/.test(options.height)) {
                    context.element.resizingBar.addEventListener('mousedown', event.onMouseDown_resizingBar, false);
                } else {
                    util.addClass(context.element.resizingBar, 'se-resizing-none');
                }
            }
            
            /** window event */
            event._setResponsiveToolbar();
            _w.removeEventListener('resize', event.onResize_window);
            _w.removeEventListener('scroll', event.onScroll_window);

            _w.addEventListener('resize', event.onResize_window, false);
            if (options.stickyToolbar > -1) {
                _w.addEventListener('scroll', event.onScroll_window, false);
            }
        },

        _removeEvent: function () {
            const eventWysiwyg = options.iframe ? core._ww : context.element.wysiwyg;

            context.element.toolbar.removeEventListener('mousedown', event._buttonsEventHandler);
            context.element._menuTray.removeEventListener('mousedown', event._buttonsEventHandler);
            context.element.toolbar.removeEventListener('click', event.onClick_toolbar);

            eventWysiwyg.removeEventListener('mousedown', event.onMouseDown_wysiwyg);
            eventWysiwyg.removeEventListener('click', event.onClick_wysiwyg);
            eventWysiwyg.removeEventListener(util.isIE ? 'textinput' : 'input', event.onInput_wysiwyg);
            eventWysiwyg.removeEventListener('keydown', event.onKeyDown_wysiwyg);
            eventWysiwyg.removeEventListener('keyup', event.onKeyUp_wysiwyg);
            eventWysiwyg.removeEventListener('paste', event.onPaste_wysiwyg);
            eventWysiwyg.removeEventListener('cut', event.onCut_wysiwyg);
            eventWysiwyg.removeEventListener('dragover', event.onDragOver_wysiwyg);
            eventWysiwyg.removeEventListener('drop', event.onDrop_wysiwyg);
            eventWysiwyg.removeEventListener('scroll', event.onScroll_wysiwyg);

            eventWysiwyg.removeEventListener('mousemove', event.onMouseMove_wysiwyg);
            core._lineBreakerButton.removeEventListener('mousedown', event._onMouseDown_lineBreak);
            core._lineBreakerButton.removeEventListener('click', event._onLineBreak);
            
            eventWysiwyg.removeEventListener('touchstart', event.onMouseDown_wysiwyg, {passive: true, useCapture: false});
            
            eventWysiwyg.removeEventListener('focus', event.onFocus_wysiwyg);
            eventWysiwyg.removeEventListener('blur', event.onBlur_wysiwyg);

            context.element.code.removeEventListener('keydown', event._codeViewAutoHeight);
            context.element.code.removeEventListener('keyup', event._codeViewAutoHeight);
            context.element.code.removeEventListener('paste', event._codeViewAutoHeight);
            
            if (context.element.resizingBar) {
                context.element.resizingBar.removeEventListener('mousedown', event.onMouseDown_resizingBar);
            }
            
            _w.removeEventListener('resize', event.onResize_window);
            _w.removeEventListener('scroll', event.onScroll_window);
        },

        _setResponsiveToolbar: function () {
            if (_responsiveButtons.length === 0) {
                _responsiveButtons = null;
                return;
            }

            const sizeArray = event._responsiveButtonSize = ['default'];
            const buttonsObj = event._responsiveButtons = {default: _responsiveButtons[0]};
            for (let i = 1, len = _responsiveButtons.length, size, buttonGroup; i < len; i++) {
                buttonGroup = _responsiveButtons[i];
                size = buttonGroup[0] * 1;
                sizeArray.push(size);
                buttonsObj[size] = buttonGroup[1];
            }
        }
    };

    /** functions */
    const functions = {
        /**
         * @description Core, Util object
         */
        core: core,
        util: util,

        /**
         * @description Event functions
         * @param {Object} e Event Object
         * @param {Object} core Core object
         */
        onload: null,
        onScroll: null,
        onMouseDown: null,
        onClick: null,
        onInput: null,
        onKeyDown: null,
        onKeyUp: null,
        onDrop: null,
        onChange: null,
        onPaste: null,
        onFocus: null,
        onBlur: null,

        /**
         * @description Called just before the inline toolbar is positioned and displayed on the screen.
         * @param {Element} toolbar Toolbar Element
         * @param {Object} context The editor's context object (editor.getContext())
         * @param {Object} core Core object
         */
        showInline: null,

        /**
         * @description Called just after the controller is positioned and displayed on the screen.
         * controller - editing elements displayed on the screen [image resizing, table editor, link editor..]]
         * @param {String} name The name of the plugin that called the controller
         * @param {Array} controllers Array of Controller elements
         * @param {Object} core Core object
         */
        showController: null,

        /**
         * @description It replaces the default callback function of the image upload
         * @param {Object} response Response object
         * @param {Object} info Input information
         * - linkValue: Link url value
         * - linkNewWindow: Open in new window Check Value
         * - inputWidth: Value of width input
         * - inputHeight: Value of height input
         * - align: Align Check Value
         * - isUpdate: Update image if true, create image if false
         * - element: If isUpdate is true, the currently selected image.
         * @param {Object} core Core object
         */
        imageUploadHandler: null,

        /**
         * @description Called before the image is uploaded
         * If false is returned, no image upload is performed.
         * If new fileList are returned,  replaced the previous fileList
         * @param {Array} files Files array
         * @param {Object} info info: {
         * - linkValue: Link url value
         * - linkNewWindow: Open in new window Check Value
         * - inputWidth: Value of width input
         * - inputHeight: Value of height input
         * - align: Align Check Value
         * - isUpdate: Update image if true, create image if false
         * - element: If isUpdate is true, the currently selected image.
         * }
         * @param {Object} core Core object
         * @returns {Boolean}
         */
        onImageUploadBefore: null,
        /**
         * @description Called before the video is uploaded
         * If false is returned, no video(iframe, video) upload is performed.
         * If new fileList are returned,  replaced the previous fileList
         * @param {Array} files Files array
         * @param {Object} info info: {
         * - inputWidth: Value of width input
         * - inputHeight: Value of height input
         * - align: Align Check Value
         * - isUpdate: Update video if true, create video if false
         * - element: If isUpdate is true, the currently selected video.
         * }
         * @param {Object} core Core object
         * @returns {Boolean}
         */
        onVideoUploadBefore: null,
        /**
         * @description Called before the audio is uploaded
         * If false is returned, no audio upload is performed.
         * If new fileList are returned,  replaced the previous fileList
         * @param {Array} files Files array
         * @param {Object} info info: {
         * - isUpdate: Update audio if true, create audio if false
         * - element: If isUpdate is true, the currently selected audio.
         * }
         * @param {Object} core Core object
         * @returns {Boolean}
         */
        onAudioUploadBefore: null,

        /**
         * @description Called when the image is uploaded, updated, deleted
         * @param {Element} targetElement Target element
         * @param {Number} index Uploaded index
         * @param {String} state Upload status ('create', 'update', 'delete')
         * @param {Object} info Image info object
         * - index: data index
         * - name: file name
         * - size: file size
         * - select: select function
         * - delete: delete function
         * - element: target element
         * - src: src attribute of tag
         * @param {Number} remainingFilesCount Count of remaining files to upload (0 when added as a url)
         * @param {Object} core Core object
         */
        onImageUpload: null,
         /**
         * @description Called when the video(iframe, video) is is uploaded, updated, deleted
         * -- arguments is same "onImageUpload" --
         */
        onVideoUpload: null,
         /**
         * @description Called when the audio is is uploaded, updated, deleted
         * -- arguments is same "onImageUpload" --
         */
        onAudioUpload: null,

        /**
         * @description Called when the image is upload failed
         * @param {String} errorMessage Error message
         * @param {Object} result Response Object
         * @param {Object} core Core object
         * @returns {Boolean}
         */
        onImageUploadError: null,
        /**
         * @description Called when the video(iframe, video) upload failed
         * -- arguments is same "onImageUploadError" --
         */
        onVideoUploadError: null,
        /**
         * @description Called when the audio upload failed
         * -- arguments is same "onImageUploadError" --
         */
        onAudioUploadError: null,

        /**
         * @description Reset the buttons on the toolbar. (Editor is not reloaded)
         * You cannot set a new plugin for the button.
         * @param {Array} buttonList Button list 
         */
        setToolbarButtons: function (buttonList) {
            core.submenuOff();
            core.containerOff();
            
            const newToolbar = _Constructor._createToolBar(_d, buttonList, core.plugins, options.lang);
            _responsiveButtons = newToolbar.responsiveButtons;
            core._moreLayerActiveButton = null;
            core._cachingButtons();
            event._setResponsiveToolbar();
            
            core.activePlugins = [];
            const oldCallButtons = pluginCallButtons;
            pluginCallButtons = newToolbar.pluginCallButtons;
            let plugin, button, oldButton;
            for (let key in pluginCallButtons) {
                plugin = plugins[key];
                button = pluginCallButtons[key];
                if (plugin.active && button) {
                    oldButton = oldCallButtons[key];
                    core.callPlugin(key, null, oldButton || button);
                    if (oldButton) {
                        button.parentElement.replaceChild(oldButton, button);
                        pluginCallButtons[key] = oldButton;
                    }
                }
            }

            context.element.toolbar.replaceChild(newToolbar._buttonTray, context.element._buttonTray);

            const newContext = _Context(context.element.originElement, core._getConstructed(context.element), options);
            context.element = newContext.element;
            context.tool = newContext.tool;

            core.history._resetCachingButton();
        },

        /**
         * @description Add or reset option property (Editor is reloaded)
         * @param {Object} _options Options
         */
        setOptions: function (_options) {
            event._removeEvent();
            core._resetComponents();

            core.plugins = _options.plugins || core.plugins;
            const mergeOptions = [options, _options].reduce(function (init, option) {
                for (let key in option) {
                    if (key === 'plugins' && option[key] && init[key]) {
                        let i = init[key], o = option[key];
                        i = i.length ? i : _w.Object.keys(i).map(function(name) { return i[name]; });
                        o = o.length ? o : _w.Object.keys(o).map(function(name) { return o[name]; });
                        init[key] = (o.filter(function(val) { return i.indexOf(val) === -1; })).concat(i);
                    } else {
                        init[key] = option[key];
                    }
                }
                return init;
            }, {});

            // set option
            const cons = _Constructor._setOptions(mergeOptions, context, core.plugins, options);
            cons.toolbar.element.style.visibility = '';

            if (cons.callButtons) {
                pluginCallButtons = cons.callButtons;
                core.initPlugins = {};
            }

            if (cons.plugins) {
                core.plugins = plugins = cons.plugins;
            }

            // reset context
            const _initHTML = context.element.wysiwyg.innerHTML;
            const el = context.element;

            if (el._menuTray.children.length === 0) this._menuTray = {};
            
            _responsiveButtons = cons.toolbar.responsiveButtons;
            options = mergeOptions;
            core.lang = lang = options.lang;
            core.context = context = _Context(context.element.originElement, core._getConstructed(el), options);
            core._componentsInfoReset = true;

            // initialize core and add event listeners
            core._init(true, _initHTML);
            event._addEvent();
            core._charCount('');
            event._offStickyToolbar();
            event.onResize_window();
        },

        /**
         * @description Set "options.defaultStyle" style.
         * Define the style of the edit area
         * It can also be defined with the "setOptions" method, but the "setDefaultStyle" method does not render the editor again.
         * @param {String} style Style string
         */
        setDefaultStyle: function (style) {
            const optionStyle = util._setDefaultOptionStyle(options);

            if (typeof style === 'string' && style.trim().length > 0) {
                context.element.wysiwyg.style.cssText = optionStyle + style;
            } else {
                context.element.wysiwyg.style.cssText = optionStyle;
            }
        },

        /**
         * @description Open a notice area
         * @param {String} message Notice message
         */
        noticeOpen: function (message) {
            core.notice.open.call(core, message);
        },

        /**
         * @description Close a notice area
         */
        noticeClose: function () {
            core.notice.close.call(core);
        },

        /**
         * @description Copying the contents of the editor to the original textarea
         */
        save: function () {
            context.element.originElement.value = core.getContents(false);
        },

        /**
         * @description Gets the suneditor's context object. Contains settings, plugins, and cached element objects
         * @returns {Object}
         */
        getContext: function () {
            return context;
        },

        /**
         * @description Gets the contents of the suneditor
         * @param {Boolean} onlyContents - Return only the contents of the body without headers when the "fullPage" option is true
         * @returns {String}
         */
        getContents: function (onlyContents) {
            return core.getContents(onlyContents);
        },

        /**
         * @description Get the editor's number of characters or binary data size.
         * You can use the "charCounterType" option format.
         * @param {String|null} charCounterType options - charCounterType ('char', 'byte', 'byte-html')
         * If argument is no value, the currently set "charCounterType" option is used.
         * @returns {Number}
         */
        getCharCount: function (charCounterType) {
            charCounterType = typeof charCounterType === 'string' ? charCounterType : options.charCounterType;
            return core._getCharLength((charCounterType === 'byte-html' ? context.element.wysiwyg.innerHTML : context.element.wysiwyg.textContent), charCounterType);
        },

        /**
         * @description Gets uploaded images informations
         * - index: data index
         * - name: file name
         * - size: file size
         * - select: select function
         * - delete: delete function
         * - element: target element
         * - src: src attribute of tag
         * @returns {Array}
         */
        getImagesInfo: function () {
            return context.image ? context.image._infoList : [];
        },
        
        /**
         * @description Gets uploaded files(plugin using fileManager) information list.
         * image: [img], video: [video, iframe], audio: [audio]
         * When the argument value is 'image', it is the same function as "getImagesInfo".
         * - index: data index
         * - name: file name
         * - size: file size
         * - select: select function
         * - delete: delete function
         * - element: target element
         * - src: src attribute of tag
         * @param {String} pluginName Plugin name (image, video, audio)
         * @returns {Array}
         */
        getFilesInfo: function (pluginName) {
            return context[pluginName] ? context[pluginName]._infoList : [];
        },

        /**
         * @description Upload images using image plugin
         * @param {FileList} files FileList
         */
        insertImage: function (files) {
            if (!core.plugins.image || !files) return;

            if (!core.initPlugins.image) core.callPlugin('image', core.plugins.image.submitAction.bind(core, files), null);
            else core.plugins.image.submitAction.call(core, files);
            core.focus();
        },

        /**
         * @description Inserts an HTML element or HTML string or plain string at the current cursor position
         * @param {Element|String} html HTML Element or HTML string or plain string
         * @param {Boolean} notCleaningData If true, inserts the HTML string without refining it with core.cleanHTML.
         */
        insertHTML: function (html, notCleaningData) {
            if (typeof html === 'string') {
                if (!notCleaningData) html = core.cleanHTML(html, null);
                try {
                    const dom = _d.createRange().createContextualFragment(html);
                    const domTree = dom.childNodes;
                    let c, a, t;
                    while ((c = domTree[0])) {
                        t = core.insertNode(c, a);
                        a = c;
                    }
                    const offset = a.nodeType === 3 ? (t.endOffset || a.textContent.length): a.childNodes.length;
                    core.setRange(a, offset, a, offset);
                } catch (error) {
                    core.execCommand('insertHTML', false, html);
                }
            } else {
                if (util.isComponent(html)) {
                    core.insertComponent(html, false);
                } else {
                    let afterNode = null;
                    if (util.isFormatElement(html) || util.isMedia(html)) {
                        afterNode = util.getFormatElement(core.getSelectionNode(), null);	
                    }
                    core.insertNode(html, afterNode);
                }
            }
            
            core.effectNode = null;
            core.focus();

            // history stack
            core.history.push(false);
        },

        /**
         * @description Change the contents of the suneditor
         * @param {String} contents Contents to Input
         */
        setContents: function (contents) {
            core.setContents(contents);
        },

        /**
         * @description Add contents to the suneditor
         * @param {String} contents Contents to Input
         */
        appendContents: function (contents) {
            const convertValue = core.convertContentsForEditor(contents);
            
            if (!core._variable.isCodeView) {
                const temp = util.createElement('DIV');
                temp.innerHTML = convertValue;

                const wysiwyg = context.element.wysiwyg;
                const children = temp.children;
                for (let i = 0, len = children.length; i < len; i++) {
                    wysiwyg.appendChild(children[i]);
                }
            } else {
                core._setCodeView(core._getCodeView() + '\n' + core.convertHTMLForCodeView(convertValue));
            }

            // history stack
            core.history.push(false);
        },

        /**
         * @description Disable the suneditor
         */
        disabled: function () {
            context.tool.cover.style.display = 'block';
            context.element.wysiwyg.setAttribute('contenteditable', false);
            core.isDisabled = true;

            if (options.codeMirrorEditor) {
                options.codeMirrorEditor.setOption('readOnly', true);
            } else {
                context.element.code.setAttribute('disabled', 'disabled');
            }
        },

        /**
         * @description Enable the suneditor
         */
        enabled: function () {
            context.tool.cover.style.display = 'none';
            context.element.wysiwyg.setAttribute('contenteditable', true);
            core.isDisabled = false;

            if (options.codeMirrorEditor) {
                options.codeMirrorEditor.setOption('readOnly', false);
            } else {
                context.element.code.removeAttribute('disabled');
            }
        },

        /**
         * @description Show the suneditor
         */
        show: function () {
            const topAreaStyle = context.element.topArea.style;
            if (topAreaStyle.display === 'none') topAreaStyle.display = options.display;
        },

        /**
         * @description Hide the suneditor
         */
        hide: function () {
            context.element.topArea.style.display = 'none';
        },

        /**
         * @description Destroy the suneditor
         */
        destroy: function () {
            /** off menus */
            core.submenuOff();
            core.containerOff();
            core.controllersOff();
            if (core.notice) core.notice.close.call(core);
            if (core.modalForm) core.plugins.dialog.close.call(core);

            /** remove history */
            core.history._destroy();

            /** remove event listeners */
            event._removeEvent();
            
            /** remove element */
            util.removeItem(context.element.toolbar);
            util.removeItem(context.element.topArea);

            /** remove object reference */
            for (var k in core) { delete core[k]; }
            for (var k in event) { delete event[k]; }
            for (var k in context) { delete context[k]; }
            for (var k in pluginCallButtons) { delete pluginCallButtons[k]; }
            
            /** remove user object */
            for (var k in this) { delete this[k]; }
        },

        /**
         * @description Toolbar methods
         */
        toolbar: {
            /**
             * @description Disable the toolbar
             */
            disabled: function () {
                context.tool.cover.style.display = 'block';
            },

            /**
             * @description Enable the toolbar
             */
            enabled: function () {
                context.tool.cover.style.display = 'none';
            },

            /**
             * @description Show the toolbar
             */
            show: function () {
                if (core._isInline) {
                    event._showToolbarInline();
                } else {
                    context.element.toolbar.style.display = '';
                    context.element._stickyDummy.style.display = '';
                }
            },

            /**
             * @description Hide the toolbar
             */
            hide: function () {
                if (core._isInline) {
                    event._hideToolbar();
                } else {
                    context.element.toolbar.style.display = 'none';
                    context.element._stickyDummy.style.display = 'none';
                }
            },
        }
    };

    // initialize core and add event listeners
    core._init(false, null);
    event._addEvent();
    core._charCount('');
    event._offStickyToolbar();
    event.onResize_window();

    // toolbar visibility
    context.element.toolbar.style.visibility = '';

    // functionss
    core.functions = functions;

    return functions;
}