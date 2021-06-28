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
 * @param {Object} _responsiveButtons
 * @returns {Object} functions Object
 */
export default function (context, pluginCallButtons, plugins, lang, options, _responsiveButtons) {
    const _d = context.element.originElement.ownerDocument || document;
    const _w = _d.defaultView || window;
    const util = _util;
    const icons = options.icons;

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
         * @description Block controller mousedown events in "shadowRoot" environment
         * @private
         */
        _shadowRootControllerEventTarget: null,

        /**
         * @description Util object
         */
        util: util,

        /**
         * @description Functions object
         */
        functions: null,

        /**
         * @description Editor options
         */
        options: null,

        /**
         * @description Computed style of the wysiwyg area (window.getComputedStyle(context.element.wysiwyg))
         */
        wwComputedStyle: _w.getComputedStyle(context.element.wysiwyg),

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
         * @description The file component object of current selected file tag (getFileComponent)
         */
        currentFileComponentInfo: null,

        /**
         * @description An array of buttons whose class name is not "se-code-view-enabled"
         */
        codeViewDisabledButtons: [],

        /**
         * @description An array of buttons whose class name is not "se-resizing-enabled"
         */
        resizingDisabledButtons: [],

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
         * @description RegExp when using check disallowd tags. (b, i, ins, strike, s)
         * @private
         */
        _disallowedTextTagsRegExp: null,

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
         * @description Boolean value of whether the editor is readOnly
         */
        isReadOnly: false,

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
         * @description Information of tags that should maintain HTML structure, style, class name, etc. (In use by "math" plugin)
         * When inserting "html" such as paste, it is executed on the "html" to be inserted. (core.cleanHTML)
         * Basic Editor Actions:
         * 1. All classes not starting with "__se__" or "se-" in the editor are removed.
         * 2. The style of all tags except the "span" tag is removed from the editor.
         * "managedTagsInfo" structure ex:
         * managedTagsInfo: {
         *   query: '.__se__xxx, se-xxx'
         *   map: {
         *     '__se__xxx': method.bind(core),
         *     'se-xxx': method.bind(core),
         *   }
         * }
         * @example
         * Define in the following return format in the "managedTagInfo" function of the plugin.
         * managedTagInfo() => {
         *  return {
         *    className: 'string', // Class name to identify the tag. ("__se__xxx", "se-xxx")
         *    // Change the html of the "element". ("element" is the element found with "className".)
         *    // "method" is executed by binding "core".
         *    method: function (element) {
         *      // this === core
         *      element.innerHTML = // (rendered html);
         *    }
         *  }
         * }
         */
        managedTagsInfo: null,

        /**
         * @description cashing: options.charCounterType === 'byte-html'
         * @private
         */
        _charTypeHTML: false,

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
         * @description Style button related to edit area
         * @property {Element} fullScreen fullScreen button element
         * @property {Element} showBlocks showBlocks button element
         * @property {Element} codeView codeView button element
         * @private
         */
        _styleCommandMap: null,

        /**
         * @description Map of default command
         * @private
         */
        _defaultCommand: {
            bold: options.textTags.bold,
            underline: options.textTags.underline,
            italic: options.textTags.italic,
            strike: options.textTags.strike,
            subscript: options.textTags.sub,
            superscript: options.textTags.sup
        },

        /**
         * @description Variables used internally in editor operation
         * @property {Boolean} isCodeView State of code view
         * @property {Boolean} isFullScreen State of full screen
         * @property {Number} innerHeight_fullScreen InnerHeight in editor when in full screen
         * @property {Number} resizeClientY Remember the vertical size of the editor before resizing the editor (Used when calculating during resize operation)
         * @property {Number} tabSize Indent size of tab (4)
         * @property {Number} codeIndent Indent size of Code view mode (2)
         * @property {Number} minResizingSize Minimum size of editing area when resized {Number} (.se-wrapper-inner {min-height: 65px;} || 65)
         * @property {Array} currentNodes  An array of the current cursor's node structure
         * @private
         */
        _variable: {
            isChanged: false,
            isCodeView: false,
            isFullScreen: false,
            innerHeight_fullScreen: 0,
            resizeClientY: 0,
            tabSize: 4,
            codeIndent: 2,
            minResizingSize: util.getNumber((context.element.wysiwygFrame.style.minHeight || '65'), 0),
            currentNodes: [],
            currentNodesMap: [],
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
            } else if (!this.initPlugins[pluginName]) {
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
         * @description Gets the current editor-relative scroll offset.
         * @returns {Object} {top, left}
         */
        getGlobalScrollOffset: function () {
            let t = 0, l = 0;
            let el = context.element.topArea;
            while (el) {
                t += el.scrollTop;
                l += el.scrollLeft;
                el = el.parentElement;
            }
            
            el = this._shadowRoot ? this._shadowRoot.host : null;
            while (el) {
                t += el.scrollTop;
                l += el.scrollLeft;
                el = el.parentElement;
            }

            return {
                top: t,
                left: l
            };
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
            menu.style.visibility = 'hidden';
            menu.style.display = 'block';
            menu.style.height = '';
            util.addClass(element, 'on');

            const toolbar = this.context.element.toolbar;
            const toolbarW = toolbar.offsetWidth;
            const toolbarOffset = event._getEditorOffsets(context.element.toolbar);
            const menuW = menu.offsetWidth;
            const l = element.parentElement.offsetLeft + 3;

            // rtl
            if (options.rtl) {
                const elementW = element.offsetWidth;
                const rtlW = menuW > elementW ? menuW - elementW : 0;
                const rtlL = rtlW > 0 ? 0 : elementW - menuW;
                menu.style.left = (l - rtlW + rtlL) + 'px';
                if (toolbarOffset.left > event._getEditorOffsets(menu).left) {
                    menu.style.left = '0px';
                }
            } else {
                const overLeft = toolbarW <= menuW ? 0 : toolbarW - (l + menuW);
                if (overLeft < 0) menu.style.left = (l + overLeft) + 'px';
                else menu.style.left = l + 'px';
            }

            // get element top
            let t = 0;
            let offsetEl = element;
            while (offsetEl && offsetEl !== toolbar) {
                t += offsetEl.offsetTop;
                offsetEl = offsetEl.offsetParent;
            }

            const bt = t;
            if (this._isBalloon) {
                t += toolbar.offsetTop + element.offsetHeight;
            } else {
                t -= element.offsetHeight;
            }

            // set menu position
            const toolbarTop = toolbarOffset.top;
            const menuHeight = menu.offsetHeight;
            const scrollTop = this.getGlobalScrollOffset().top;

            const menuHeight_bottom = _w.innerHeight - (toolbarTop - scrollTop + bt + element.parentElement.offsetHeight);
            if (menuHeight_bottom < menuHeight) {
                let menuTop = -1 * (menuHeight - bt + 3);
                const insTop = toolbarTop - scrollTop + menuTop;
                const menuHeight_top = menuHeight + (insTop < 0 ? insTop : 0);
                
                if (menuHeight_top > menuHeight_bottom) {
                    menu.style.height = menuHeight_top + 'px';
                    menuTop = -1 * (menuHeight_top - bt + 3);
                } else {
                    menu.style.height = menuHeight_bottom + 'px';
                    menuTop = bt + element.parentElement.offsetHeight;
                }

                menu.style.top = menuTop + 'px';
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
                    this.currentFileComponentInfo = this.getFileComponent(arg);
                    continue;
                }
                if (arg.style) {
                    arg.style.display = 'block';
                    if (this._shadowRoot && this._shadowRootControllerEventTarget.indexOf(arg) === -1) {
                        arg.addEventListener('mousedown', function (e) { e.preventDefault(); e.stopPropagation(); });
                        this._shadowRootControllerEventTarget.push(arg);
                    }
                }
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
            this._lineBreaker.style.display = 'none';
            const len = this.controllerArray.length;

            if (e && e.target && len > 0) {
                for (let i = 0; i < len; i++) {
                    if (typeof this.controllerArray[i].contains === 'function' && this.controllerArray[i].contains(e.target)) return;
                }
            }
            
            if (this._fileManager.pluginRegExp.test(this.currentControllerName) && e && e.type === 'keydown' && e.keyCode !== 27) return;
            context.element.lineBreaker_t.style.display = context.element.lineBreaker_b.style.display = 'none';
            this._variable._lineBreakComp = null;

            this.currentControllerName = '';
            this.currentControllerTarget = null;
            this.currentFileComponentInfo = null;
            this.effectNode = null;
            if (!this._bindControllersOff) return;

            this.removeDocEvent('mousedown', this._bindControllersOff);
            this.removeDocEvent('keydown', this._bindControllersOff);
            this._bindControllersOff = null;

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
         * @description Specify the position of the controller.
         * @param {Element} controller Controller element.
         * @param {Element} referEl Element that is the basis of the controller's position.
         * @param {String} position Type of position ("top" | "bottom")
         * When using the "top" position, there should not be an arrow on the controller.
         * When using the "bottom" position there should be an arrow on the controller.
         * @param {Object} addOffset These are the left and top values that need to be added specially. 
         * This argument is required. - {left: 0, top: 0}
         * Please enter the value based on ltr mode.
         * Calculated automatically in rtl mode.
         */
        setControllerPosition: function (controller, referEl, position, addOffset) {
            if (options.rtl) addOffset.left *= -1;

            const offset = util.getOffset(referEl, context.element.wysiwygFrame);
            controller.style.visibility = 'hidden';
            controller.style.display = 'block';

            // Height value of the arrow element is 11px
            const topMargin = position === 'top' ? -(controller.offsetHeight + 2) : (referEl.offsetHeight + 12);
            controller.style.top = (offset.top + topMargin + addOffset.top) + 'px';

            const l = offset.left - context.element.wysiwygFrame.scrollLeft + addOffset.left;
            const controllerW = controller.offsetWidth;
            const referElW = referEl.offsetWidth;
            
            const allow = util.hasClass(controller.firstElementChild, 'se-arrow') ? controller.firstElementChild : null;

            // rtl (Width value of the arrow element is 22px)
            if (options.rtl) {
                const rtlW = (controllerW > referElW) ? controllerW - referElW : 0;
                const rtlL = rtlW > 0 ? 0 : referElW - controllerW;
                controller.style.left = (l - rtlW + rtlL) + 'px';
                
                if (rtlW > 0) {
                    if (allow) allow.style.left = ((controllerW - 14 < 10 + rtlW) ? (controllerW - 14) : (10 + rtlW)) + 'px';
                }
                
                const overSize = context.element.wysiwygFrame.offsetLeft - controller.offsetLeft;
                if (overSize > 0) {
                    controller.style.left = '0px';
                    if (allow) allow.style.left = overSize + 'px';
                }
            } else {
                controller.style.left = l + 'px';

                const overSize = context.element.wysiwygFrame.offsetWidth - (controller.offsetLeft + controllerW);
                if (overSize < 0) {
                    controller.style.left = (controller.offsetLeft + overSize) + 'px';
                    if (allow) allow.style.left = (20 - overSize) + 'px';
                } else {
                    if (allow) allow.style.left = '20px';
                }
            }

            controller.style.visibility = '';
        },

        /**
         * @description javascript execCommand
         * @param {String} command javascript execCommand function property
         * @param {Boolean|undefined} showDefaultUI javascript execCommand function property
         * @param {String|undefined} value javascript execCommand function property
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
                        const currentNode = range.commonAncestorContainer.children[range.startOffset];
                        if (!util.isFormatElement(currentNode) && !util.isComponent(currentNode)) {
                            const format = util.createElement(options.defaultTag);
                            const br = util.createElement('BR');
                            format.appendChild(br);
                            context.element.wysiwyg.insertBefore(format, currentNode);
                            this.setRange(br, 0, br, 0);
                            return;
                        }
                    }
                    this.setRange(range.startContainer, range.startOffset, range.endContainer, range.endOffset);
                } catch (e) {
                    this.nativeFocus();
                }
            }

            event._applyTagEffects();
            if (this._isBalloon) event._toggleToolbarBalloon();
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
                this.selectComponent(fileComponentInfo.target, fileComponentInfo.pluginName);
            } else if (focusEl) {
                focusEl = util.getChildElement(focusEl, function (current) { return current.childNodes.length === 0 || current.nodeType === 3; }, true);
                if (!focusEl) this.nativeFocus();
                else this.setRange(focusEl, focusEl.textContent.length, focusEl, focusEl.textContent.length);
            } else {
                this.focus();
            }
        },

        /**
         * @description Focusout to wysiwyg area (.blur())
         */
        blur: function () {
            if (options.iframe) {
                context.element.wysiwygFrame.blur();
            } else {
                context.element.wysiwyg.blur();
            }
        },

        /**
         * @description Set current editor's range object and return.
         * @param {Node} startCon The startContainer property of the selection object.
         * @param {Number} startOff The startOffset property of the selection object.
         * @param {Node} endCon The endContainer property of the selection object.
         * @param {Number} endOff The endOffset property of the selection object.
         * @returns {Object} Range object.
         */
        setRange: function (startCon, startOff, endCon, endOff) {
            if (!startCon || !endCon) return;
            if (startOff > startCon.textContent.length) startOff = startCon.textContent.length;
            if (endOff > endCon.textContent.length) endOff = endCon.textContent.length;
            if (util.isFormatElement(startCon)) {
                startCon = startCon.childNodes[startOff] || startCon;
                startOff = 0;
            }
            if (util.isFormatElement(endCon)) {
                endCon = endCon.childNodes[endOff] || endCon;
                endOff = startOff > 1 ? startOff : 0;
            }
            
            const range = this._wd.createRange();

            try {
                range.setStart(startCon, startOff);
                range.setEnd(endCon, endOff);
            } catch (error) {
                console.warn('[SUNEDITOR.core.focus.error] ' + error);
                this.nativeFocus();
                return;
            }

            const selection = this.getSelection();

            if (selection.removeAllRanges) {
                selection.removeAllRanges();
            }

            selection.addRange(range);
            this._editorRange();
            if (options.iframe) this.nativeFocus();

            return range;
        },

        /**
         * @description Remove range object and button effect
         */
        removeRange: function () {
            this._variable._range = null;
            this._variable._selectionNode = null;
            if (this.hasFocus) this.getSelection().removeAllRanges();
            this._setKeyEffect([]);
        },

        /**
         * @description Get current editor's range object
         * @returns {Object}
         */
        getRange: function () {
            const range = this._variable._range || this._createDefaultRange();
            const selection = this.getSelection();
            if (range.collapsed === selection.isCollapsed || !context.element.wysiwyg.contains(selection.focusNode)) return range;
            
            if (selection.rangeCount > 0) {
                this._variable._range = selection.getRangeAt(0);
                return this._variable._range;
            } else {
                const sc = selection.anchorNode, ec = selection.focusNode, so = selection.anchorOffset, eo = selection.focusOffset;
                const compareValue = util.compareElements(sc, ec);
                const rightDir = compareValue.ancestor && (compareValue.result === 0 ? so <= eo : compareValue.result > 1 ? true : false);
                return this.setRange(
                    rightDir ? sc : ec,
                    rightDir ? so : eo,
                    rightDir ? ec : sc,
                    rightDir ? eo : so
                );
            }
        },

        /**
         * @description If the "range" object is a non-editable area, add a line at the top of the editor and update the "range" object.
         * Returns a new "range" or argument "range".
         * @param {Object} range core.getRange()
         * @param {Element|null} container If there is "container" argument, it creates a line in front of the container.
         * @returns {Object} range
         */
        getRange_addLine: function (range, container) {
            if (this._selectionVoid(range)) {
                const wysiwyg = context.element.wysiwyg;
                const op = util.createElement(options.defaultTag);
                op.innerHTML = '<br>';
                wysiwyg.insertBefore(op, container && container !== wysiwyg ? container.nextElementSibling : wysiwyg.firstElementChild);
                this.setRange(op.firstElementChild, 0, op.firstElementChild, 1);
                range = this._variable._range;
            }
            return range;
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
            if (!context.element.wysiwyg.contains(this._variable._selectionNode)) this._editorRange();
            if (!this._variable._selectionNode) {
                const selectionNode = util.getChildElement(context.element.wysiwyg.firstChild, function (current) { return current.childNodes.length === 0 || current.nodeType === 3; }, false);
                if (!selectionNode) {
                    this._editorRange();
                } else {
                    this._variable._selectionNode = selectionNode;
                    return selectionNode;
                }
            }
            return this._variable._selectionNode;
        },

        /**
         * @description Saving the range object and the currently selected node of editor
         * @private
         */
        _editorRange: function () {
            const selection = this.getSelection();
            if (!selection) return null;
            let range = null;
            let selectionNode = null;

            if (selection.rangeCount > 0) {
                range = selection.getRangeAt(0);
            } else {
                range = this._createDefaultRange();
            }

            this._variable._range = range;

            if (range.collapsed) {
                if (util.isWysiwygDiv(range.commonAncestorContainer)) selectionNode = range.commonAncestorContainer.children[range.startOffset] || range.commonAncestorContainer;
                else selectionNode = range.commonAncestorContainer;
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
            const wysiwyg = context.element.wysiwyg;
            wysiwyg.focus();
            const range = this._wd.createRange();

            let focusEl = wysiwyg.firstElementChild;
            if (!focusEl) {
                focusEl = util.createElement(options.defaultTag);
                focusEl.innerHTML = '<br>';
                wysiwyg.appendChild(focusEl);
            }

            range.setStart(focusEl, 0);
            range.setEnd(focusEl, 0);
            
            return range;
        },

        /**
         * @description Returns true if there is no valid "selection".
         * @param {Object} range core.getRange()
         * @returns {Object} range
         * @private
         */
        _selectionVoid: function (range) {
            const comm = range.commonAncestorContainer;
            return (util.isWysiwygDiv(range.startContainer) && util.isWysiwygDiv(range.endContainer)) || /FIGURE/i.test(comm.nodeName) || this._fileManager.regExp.test(comm.nodeName) || util.isMediaComponent(comm);
        },

        /**
         * @description Reset range object to text node selected status.
         * @returns {Boolean} Returns false if there is no valid selection.
         * @private
         */
        _resetRangeToTextNode: function () {
            const range = this.getRange();
            if (this._selectionVoid(range)) return false;
            
            let startCon = range.startContainer;
            let startOff = range.startOffset;
            let endCon = range.endContainer;
            let endOff = range.endOffset;
            let tempCon, tempOffset, tempChild;

            if (util.isFormatElement(startCon)) {
                if (!startCon.childNodes[startOff]) {
                    startCon = startCon.lastChild;
                    startOff = startCon.textContent.length;
                } else {
                    startCon = startCon.childNodes[startOff];
                    startOff = 0;
                }
                while (startCon && startCon.nodeType === 1 && startCon.firstChild) {
                    startCon = startCon.firstChild;
                    startOff = 0;
                }
            }
            if (util.isFormatElement(endCon)) {
                endCon = endCon.childNodes[endOff] || endCon.lastChild;
                while (endCon && endCon.nodeType === 1 && endCon.lastChild) {
                    endCon = endCon.lastChild;
                }
                endOff = endCon.textContent.length;
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
                        format = util.createElement(util.getParentElement(tempCon, util.isCell) ? 'DIV' : options.defaultTag);
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
                        format = util.createElement(util.isCell(format) ? 'DIV' : options.defaultTag);
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
            return true;
        },

        /**
         * @description Returns a "formatElement"(util.isFormatElement) array from the currently selected range.
         * @param {Function|null} validation The validation function. (Replaces the default validation function-util.isFormatElement(current))
         * @returns {Array}
         */
        getSelectedElements: function (validation) {
            if (!this._resetRangeToTextNode()) return [];
            let range = this.getRange();

            if (util.isWysiwygDiv(range.startContainer)) {
                const children = context.element.wysiwyg.children;
                if (children.length === 0) return [];

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
         * @param {String|undefined} dir Select check point - Both edge, Front edge or End edge. ("front": Front edge, "end": End edge, undefined: Both edge)
         * @returns {Boolean}
         */
        isEdgePoint: function (container, offset, dir) {
            return (dir !== 'end' && offset === 0) || ((!dir || dir !== 'front') && !container.nodeValue && offset === 1) || ((!dir || dir === 'end') && !!container.nodeValue && offset === container.nodeValue.length);
        },

        /**
         * @description Check if the container and offset values are the edges of the format tag
         * @param {Node} container The node of the selection object. (range.startContainer..)
         * @param {Number} offset The offset of the selection object. (core.getRange().startOffset...)
         * @param {String} dir Select check point - "front": Front edge, "end": End edge, undefined: Both edge.
         * @returns {Array|null}
         * @private
         */
        _isEdgeFormat: function (node, offset, dir) {
            if (!this.isEdgePoint(node, offset, dir)) return false;

            const result = [];
            dir = dir === 'front' ? 'previousSibling' : 'nextSibling';
            while (node && !util.isFormatElement(node) && !util.isWysiwygDiv(node)) {
                if (!node[dir] || (util.isBreak(node[dir]) && !node[dir][dir])) {
                    if (node.nodeType === 1) result.push(node.cloneNode(false));
                    node = node.parentNode;
                } else {
                    return null;
                }
            }

            return result;
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
            if (!element.parentNode) return null;

            const currentFormatEl = util.getFormatElement(this.getSelectionNode(), null);
            let oFormat = null;
            if (util.isFreeFormatElement(currentFormatEl || element.parentNode)) {
                oFormat = util.createElement('BR');
            } else {
                const oFormatName = formatNode ? (typeof formatNode === 'string' ? formatNode : formatNode.nodeName) : (util.isFormatElement(currentFormatEl) && !util.isRangeFormatElement(currentFormatEl) && !util.isFreeFormatElement(currentFormatEl)) ? currentFormatEl.nodeName : options.defaultTag;
                oFormat = util.createElement(oFormatName);
                oFormat.innerHTML = '<br>';
                if ((formatNode && typeof formatNode !== 'string') || (!formatNode && util.isFormatElement(currentFormatEl))) {
                    util.copyTagAttributes(oFormat, formatNode || currentFormatEl);
                }
            }

            if (util.isCell(element)) element.insertBefore(oFormat, element.nextElementSibling);
            else element.parentNode.insertBefore(oFormat, element.nextElementSibling);

            return oFormat;
        },

        /**
         * @description The method to insert a element and return. (used elements : table, hr, image, video)
         * If "element" is "HR", insert and return the new line.
         * @param {Element} element Element to be inserted
         * @param {Boolean} notHistoryPush When true, it does not update the history stack and the selection object and return EdgeNodes (util.getEdgeChildNodes)
         * @param {Boolean} checkCharCount If true, if "options.maxCharCount" is exceeded when "element" is added, null is returned without addition.
         * @param {Boolean} notSelect If true, Do not automatically select the inserted component.
         * @returns {Element}
         */
        insertComponent: function (element, notHistoryPush, checkCharCount, notSelect) {
            if (this.isReadOnly || (checkCharCount && !this.checkCharCount(element, null))) {
                return null;
            }

            const r = this.removeNode();
            this.getRange_addLine(this.getRange(), r.container);
            let oNode = null;
            let selectionNode = this.getSelectionNode();
            let formatEl = util.getFormatElement(selectionNode, null);

            if (util.isListCell(formatEl)) {
                this.insertNode(element, selectionNode === formatEl ? null : r.container.nextSibling, false);
                if (!element.nextSibling) element.parentNode.appendChild(util.createElement('BR'));
            } else {
                if (this.getRange().collapsed && (r.container.nodeType === 3 || util.isBreak(r.container))) {
                    const depthFormat = util.getParentElement(r.container, function (current) { return this.isRangeFormatElement(current); }.bind(util));
                    oNode = util.splitElement(r.container, r.offset, !depthFormat ? 0 : util.getElementDepth(depthFormat) + 1);
                    if (oNode) formatEl = oNode.previousSibling;
                }
                this.insertNode(element, util.isRangeFormatElement(formatEl) ? null : formatEl, false);
                if (formatEl && util.onlyZeroWidthSpace(formatEl)) util.removeItem(formatEl);
            }

            this.setRange(element, 0, element, 0);

            if (!notSelect) {
                const fileComponentInfo = this.getFileComponent(element);
                if (fileComponentInfo) {
                    this.selectComponent(fileComponentInfo.target, fileComponentInfo.pluginName);
                } else if (oNode) {
                    oNode = util.getEdgeChildNodes(oNode, null).sc || oNode;
                    this.setRange(oNode, 0, oNode, 0);
                }
            }

            // history stack
            if (!notHistoryPush) this.history.push(1);

            return oNode || element;
        },

        /**
         * @description Gets the file component and that plugin name
         * return: {target, component, pluginName} | null
         * @param {Element} element Target element (figure tag, component div, file tag)
         * @returns {Object|null}
         */
        getFileComponent: function (element) {
            if (!this._fileManager.queryString || !element) return null;

            let target, pluginName;
            if (/^FIGURE$/i.test(element.nodeName) || /se-component/.test(element.className)) {
                target = element.querySelector(this._fileManager.queryString);
            }
            if (!target && element.nodeName && this._fileManager.regExp.test(element.nodeName)) {
                target = element;
            }

            if (target) {
                pluginName = this._fileManager.pluginMap[target.nodeName.toLowerCase()];
                if (pluginName) {
                    return {
                        target: target,
                        component: util.getParentElement(target, util.isComponent),
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
            if (util.isUneditableComponent(util.getParentElement(element, util.isComponent)) || util.isUneditableComponent(element)) return false;
            if (!this.hasFocus) this.focus();
            const plugin = this.plugins[pluginName];
            if (!plugin) return;
            _w.setTimeout(function () {
                if (typeof plugin.select === 'function') this.callPlugin(pluginName, plugin.select.bind(this, element), null);
                this._setComponentLineBreaker(element);
            }.bind(this));
        },

        /**
         * @description Set line breaker of component
         * @param {Element} element Element tag (img, iframe, video)
         * @private
         */
        _setComponentLineBreaker: function (element) {
            // line breaker
            this._lineBreaker.style.display = 'none';
            const container = util.getParentElement(element, util.isComponent);
            const t_style = context.element.lineBreaker_t.style;
            const b_style = context.element.lineBreaker_b.style;
            const target = this.context.resizing.resizeContainer.style.display === 'block' ? this.context.resizing.resizeContainer : element;

            const isList = util.isListCell(container.parentNode);
            let componentTop, wScroll, w;
            // top
            if (isList ? !container.previousSibling : !util.isFormatElement(container.previousElementSibling)) {
                this._variable._lineBreakComp = container;
                wScroll = context.element.wysiwyg.scrollTop;
                componentTop = util.getOffset(element, context.element.wysiwygFrame).top + wScroll;
                w = (target.offsetWidth / 2) / 2;

                t_style.top = (componentTop - wScroll - 12) + 'px';
                t_style.left = (util.getOffset(target).left + w) + 'px';
                t_style.display = 'block';
            } else {
                t_style.display = 'none';
            }
            // bottom
            if (isList ? !container.nextSibling : !util.isFormatElement(container.nextElementSibling)) {
                if (!componentTop) {
                    this._variable._lineBreakComp = container;
                    wScroll = context.element.wysiwyg.scrollTop;
                    componentTop = util.getOffset(element, context.element.wysiwygFrame).top + wScroll;
                    w = (target.offsetWidth / 2) / 2;
                }

                b_style.top = (componentTop + target.offsetHeight - wScroll - 12) + 'px';
                b_style.left = (util.getOffset(target).left + target.offsetWidth - w - 24) + 'px';
                b_style.display = 'block';
            } else {
                b_style.display = 'none';
            }
        },

        /**
         * @description Delete selected node and insert argument value node and return.
         * If the "afterNode" exists, it is inserted after the "afterNode"
         * Inserting a text node merges with both text nodes on both sides and returns a new "{ container, startOffset, endOffset }".
         * @param {Node} oNode Element to be inserted
         * @param {Node|null} afterNode If the node exists, it is inserted after the node
         * @param {Boolean} checkCharCount If true, if "options.maxCharCount" is exceeded when "element" is added, null is returned without addition.
         * @returns {Object|Node|null}
         */
        insertNode: function (oNode, afterNode, checkCharCount) {
            if (this.isReadOnly || (checkCharCount && !this.checkCharCount(oNode, null))) {
                return null;
            }

            const freeFormat = util.getFreeFormatElement(this.getSelectionNode(), null);
            const isFormats = (!freeFormat && (util.isFormatElement(oNode) || util.isRangeFormatElement(oNode))) || util.isComponent(oNode);

            if (!afterNode && (isFormats || util.isComponent(oNode) || util.isMedia(oNode))) {
                const r = this.removeNode();
                if (r.container.nodeType === 3 || util.isBreak(r.container)) {
                    const depthFormat = util.getParentElement(r.container, function (current) { return this.isRangeFormatElement(current) || this.isListCell(current); }.bind(util));
                    afterNode = util.splitElement(r.container, r.offset, !depthFormat ? 0 : util.getElementDepth(depthFormat) + 1);
                    if (afterNode) afterNode = afterNode.previousSibling;
                }
            }

            const range = (!afterNode && !isFormats) ? this.getRange_addLine(this.getRange(), null) : this.getRange();
            const commonCon = range.commonAncestorContainer;
            const startOff = range.startOffset;
            const endOff = range.endOffset;
            const formatRange = range.startContainer === commonCon && util.isFormatElement(commonCon);
            const startCon = formatRange ? (commonCon.childNodes[startOff] || commonCon.childNodes[0]) : range.startContainer;
            const endCon = formatRange ? (commonCon.childNodes[endOff] || commonCon.childNodes[commonCon.childNodes.length - 1]) : range.endContainer;
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
                        if (parentNode.childNodes.length === 0 && isFormats) {
                            parentNode.innerHTML = '<br>';
                        }
                    }
                    else {
                        const removedTag = this.removeNode();
                        const container = removedTag.container;
                        const prevContainer = removedTag.prevContainer;
                        if (container && container.childNodes.length === 0 && isFormats) {
                            if (util.isFormatElement(container)) {
                                container.innerHTML = '<br>';
                            } else if (util.isRangeFormatElement(container)) {
                                container.innerHTML = '<' + options.defaultTag + '><br></' + options.defaultTag + '>';
                            }
                        }

                        if (!isFormats && prevContainer) {
                            parentNode = prevContainer.nodeType === 3 ? prevContainer.parentNode : prevContainer;
                            if (parentNode.contains(container)) {
                                let sameParent = true;
                                afterNode = container;
                                while (afterNode.parentNode !== parentNode) {
                                    afterNode = afterNode.parentNode;
                                    sameParent = false;
                                }
                                if (sameParent && container === prevContainer) afterNode = afterNode.nextSibling;
                            } else {
                                afterNode = null;
                            }
                        } else {
                            afterNode = isFormats ? endCon : container === prevContainer ? container.nextSibling : container;
                            parentNode = (!afterNode || !afterNode.parentNode) ? commonCon : afterNode.parentNode;
                        }

                        while (afterNode && !util.isFormatElement(afterNode) && afterNode.parentNode !== commonCon) {
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
                if (util.isWysiwygDiv(afterNode) || parentNode === context.element.wysiwyg.parentNode) {
                    parentNode = context.element.wysiwyg;
                    afterNode = null;
                }

                if (util.isFormatElement(oNode) || util.isRangeFormatElement(oNode) || (!util.isListCell(parentNode) && util.isComponent(oNode))) {
                    const oldParent = parentNode;
                    if (util.isList(afterNode)) {
                        parentNode = afterNode;
                        afterNode = null;
                    } else if (util.isListCell(afterNode)) {
                        parentNode = afterNode.previousElementSibling || afterNode;
                    } else if (!originAfter && !afterNode) {
                        const r = this.removeNode();
                        const container = r.container.nodeType === 3 ? (util.isListCell(util.getFormatElement(r.container, null)) ? r.container : (util.getFormatElement(r.container, null) || r.container.parentNode)) : r.container;
                        const rangeCon = util.isWysiwygDiv(container) || util.isRangeFormatElement(container);
                        parentNode = rangeCon ? container : container.parentNode;
                        afterNode = rangeCon ? null : container.nextSibling;
                    }

                    if (oldParent.childNodes.length === 0 && parentNode !== oldParent) util.removeItem(oldParent);
                }

                if (isFormats && !freeFormat && !util.isRangeFormatElement(parentNode) && !util.isListCell(parentNode) && !util.isWysiwygDiv(parentNode)) {
                    afterNode = parentNode.nextElementSibling;
                    parentNode = parentNode.parentNode;
                }

                if (util.isWysiwygDiv(parentNode) && (oNode.nodeType === 3 || util.isBreak(oNode))) {
                    const fNode = util.createElement(options.defaultTag);
                    fNode.appendChild(oNode);
                    oNode = fNode;
                }

                parentNode.insertBefore(oNode, parentNode === afterNode ? parentNode.lastChild : afterNode);
            } catch (e) {
                parentNode.appendChild(oNode);
            } finally {
                if ((util.isFormatElement(oNode) || util.isComponent(oNode)) && startCon === endCon) {
                    const cItem = util.getFormatElement(commonCon, null);
                    if (cItem && cItem.nodeType === 1 && util.isEmptyLine(cItem)) {
                        util.removeItem(cItem);
                    }
                }

                if (freeFormat && (util.isFormatElement(oNode) || util.isRangeFormatElement(oNode))) {
                    oNode = this._setIntoFreeFormat(oNode);
                }

                if (!util.isComponent(oNode)) {
                    let offset = 1;
                    if (oNode.nodeType === 3) {
                        const previous = oNode.previousSibling;
                        const next = oNode.nextSibling;
                        const previousText = (!previous ||  previous.nodeType === 1 || util.onlyZeroWidthSpace(previous)) ? '' : previous.textContent;
                        const nextText = (!next || next.nodeType === 1 || util.onlyZeroWidthSpace(next)) ? '' : next.textContent;
        
                        if (previous && previousText.length > 0) {
                            oNode.textContent = previousText + oNode.textContent;
                            util.removeItem(previous);
                        }
        
                        if (next && next.length > 0) {
                            oNode.textContent += nextText;
                            util.removeItem(next);
                        }

                        const newRange = {
                            container: oNode,
                            startOffset: previousText.length,
                            endOffset: oNode.textContent.length - nextText.length
                        };

                        this.setRange(oNode, newRange.startOffset, oNode, newRange.endOffset);
    
                        return newRange;
                    } else if (!util.isBreak(oNode) && util.isFormatElement(parentNode)) {
                        let zeroWidth = null;
                        if (!oNode.previousSibling || util.isBreak(oNode.previousSibling)) {
                            zeroWidth = util.createTextNode(util.zeroWidthSpace);
                            oNode.parentNode.insertBefore(zeroWidth, oNode);
                        }
                        
                        if (!oNode.nextSibling || util.isBreak(oNode.nextSibling)) {
                            zeroWidth = util.createTextNode(util.zeroWidthSpace);
                            oNode.parentNode.insertBefore(zeroWidth, oNode.nextSibling);
                        }
    
                        if (util._isIgnoreNodeChange(oNode)) {
                            oNode = oNode.nextSibling;
                            offset = 0;
                        }
                    }
    
                    this.setRange(oNode, offset, oNode, offset);
                }

                // history stack
                this.history.push(true);

                return oNode;
            }
        },

        _setIntoFreeFormat: function (oNode) {
            const parentNode = oNode.parentNode;
            let oNodeChildren, lastONode;
            
            while (util.isFormatElement(oNode) || util.isRangeFormatElement(oNode)) {
                oNodeChildren = oNode.childNodes;
                lastONode = null;
                
                while (oNodeChildren[0]) {
                    lastONode = oNodeChildren[0];
                    if (util.isFormatElement(lastONode) || util.isRangeFormatElement(lastONode)) {
                        this._setIntoFreeFormat(lastONode);
                        if (!oNode.parentNode) break;
                        oNodeChildren = oNode.childNodes;
                        continue;
                    }
                    
                    parentNode.insertBefore(lastONode, oNode);
                }
                
                if (oNode.childNodes.length === 0) util.removeItem(oNode);
                oNode = util.createElement('BR');
                parentNode.insertBefore(oNode, lastONode.nextSibling);
            }

            return oNode;
        },

        /**
         * @description Delete the currently selected nodes and reset selection range
         * Returns {container: "the last element after deletion", offset: "offset", prevContainer: "previousElementSibling Of the deleted area"}
         * @returns {Object}
         */
        removeNode: function () {
            this._resetRangeToTextNode();

            const range = this.getRange();
            let container, offset = 0;
            let startCon = range.startContainer;
            let endCon = range.endContainer;
            let startOff = range.startOffset;
            let endOff = range.endOffset;
            const commonCon = (range.commonAncestorContainer.nodeType === 3 && range.commonAncestorContainer.parentNode === startCon.parentNode) ? startCon.parentNode : range.commonAncestorContainer;
            if (commonCon === startCon && commonCon === endCon) {
                startCon = commonCon.children[startOff];
                endCon = commonCon.children[endOff];
                startOff = endOff = 0;
            }

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
                    } else if (commonCon.nodeType === 3) {
                        return {
                            container: commonCon,
                            offset: endOff
                        };
                    }
                    childNodes.push(commonCon);
                    startCon = endCon = commonCon;
                } else {
                    startCon = endCon = childNodes[0];
                    if (util.isBreak(startCon) || util.onlyZeroWidthSpace(startCon)) {
                        return {
                            container: util.isMedia(commonCon) ? commonCon : startCon,
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
                        if (util.isComponent(startCon)) continue;
                        else beforeNode = util.createTextNode(startCon.textContent);
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
                        if (util.isComponent(endCon)) continue;
                        else afterNode = util.createTextNode(endCon.textContent);
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
            
            if (!util.isWysiwygDiv(container) && container.childNodes.length === 0) {
                const rc = util.removeItemAllParents(container, function (current) {
                    if (this.isComponent(current)) return false;
                    const text = current.textContent;
                    return text.length === 0 || /^(\n|\u200B)+$/.test(text);
                }.bind(util), null);
                
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
            this.getRange_addLine(this.getRange(), null);
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
                } else {
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
            } else { // basic
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
                                const fChildren = format.childNodes;
                                while (fChildren[0]) {
                                    originNode.appendChild(fChildren[0]);
                                }

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
                if (insNode.nodeType === 3 && util.isList(rangeEl)) continue;
                
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
                } else {
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
                            insNode = util.createElement(remove ? inner.nodeName : (util.isList(rangeElement.parentNode) || util.isListCell(rangeElement.parentNode)) ? 'LI' : util.isCell(rangeElement.parentNode) ? 'DIV' : options.defaultTag);
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
    
                            if (!reset) {
                                if (selectedFormats) {
                                    lastNode = insNode;
                                    if (!firstNode) {
                                        firstNode = insNode;
                                    }
                                } else if (!firstNode) {
                                    firstNode = lastNode = insNode;
                                }
                            }
                        } else {
                            removeArray.push(insNode);
                            util.removeItem(children[i]);
                        }

                        if (reset) {
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
            }

            const rangeParent = rangeElement.parentNode;
            let rangeRight = rangeElement.nextSibling;
            if (rangeEl && rangeEl.children.length > 0) {
                rangeParent.insertBefore(rangeEl, rangeRight);
            }
            
            if (newRangeElement) firstNode = newRangeElement.previousSibling;
            else if (!firstNode) firstNode = rangeElement.previousSibling;
            rangeRight = rangeElement.nextSibling !== rangeEl ? rangeElement.nextSibling : rangeEl ? rangeEl.nextSibling : null;

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
            this._resetRangeToTextNode();
            let range = this.getRange_addLine(this.getRange(), null);
            styleArray = styleArray && styleArray.length > 0 ? styleArray : false;
            removeNodeArray = removeNodeArray && removeNodeArray.length > 0 ? removeNodeArray : false;
            
            const isRemoveNode = !appendNode;
            const isRemoveFormat = isRemoveNode && !removeNodeArray && !styleArray;
            let startCon = range.startContainer;
            let startOff = range.startOffset;
            let endCon = range.endContainer;
            let endOff = range.endOffset;

            if ((isRemoveFormat && range.collapsed && util.isFormatElement(startCon.parentNode) && util.isFormatElement(endCon.parentNode)) || (startCon === endCon && startCon.nodeType === 1 && util.isNonEditable(startCon))) {
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
                startCon = startCon.childNodes[startOff] || startCon.firstChild;
                startOff = 0;
            }
            if (util.isFormatElement(endCon)) {
                endCon = endCon.childNodes[endOff] || endCon.lastChild;
                endOff = endCon.textContent.length;
            }

            if (isRemoveNode) {
                appendNode = util.createElement('DIV');
            }

            const wRegExp = _w.RegExp;
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
                                const classReg = /^\./.test(s) ? new wRegExp('\\s*' + s.replace(/^\./, '') + '(\\s+|$)', 'ig') : false;
    
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
                    styleRegExp = new wRegExp(styleRegExp, 'ig');
                }

                if (classRegExp) {
                    classRegExp += ')(?=\\s+|$)';
                    classRegExp = new wRegExp(classRegExp, 'ig');
                }
            }

            if (removeNodeArray) {
                removeNodeRegExp = '^(?:' + removeNodeArray[0];
                for (let i = 1; i < removeNodeArray.length; i++) {
                    removeNodeRegExp += '|' + removeNodeArray[i];
                }
                removeNodeRegExp += ')$';
                removeNodeRegExp = new wRegExp(removeNodeRegExp, 'i');
            }

            /** validation check function*/
            const wBoolean = _w.Boolean;
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
                if (style || classes || vNode.nodeName !== newNodeName || (wBoolean(styleRegExp) !== wBoolean(originStyle)) || (wBoolean(classRegExp) !== wBoolean(originClasses))) {
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

            const isRemoveAnchor = isRemoveFormat || (isRemoveNode && (function (arr) {
                for (let n = 0, len = arr.length; n < len; n++) {
                    if (util._isMaintainedNode(arr[n]) || util._isSizeNode(arr[n])) return true;
                }
                return false;
            })(removeNodeArray));

            const isSizeNode = isRemoveNode || util._isSizeNode(newNode);
            const _getMaintainedNode = this._util_getMaintainedNode.bind(util, isRemoveAnchor, isSizeNode);
            const _isMaintainedNode = this._util_isMaintainedNode.bind(util, isRemoveAnchor, isSizeNode);

            // one line
            if (oneLine) {
                const newRange = this._nodeChange_oneLine(lineNodes[0], newNode, validation, startCon, startOff, endCon, endOff, isRemoveFormat, isRemoveNode, range.collapsed, _removeCheck, _getMaintainedNode, _isMaintainedNode);
                start.container = newRange.startContainer;
                start.offset = newRange.startOffset;
                end.container = newRange.endContainer;
                end.offset = newRange.endOffset;
                if (start.container === end.container && util.onlyZeroWidthSpace(start.container)) {
                    start.offset = end.offset = 1;
                }
                this._setCommonListStyle(newRange.ancestor, null);
            } else { // multi line 
                // end
                if (endLength > 0) {
                    newNode = appendNode.cloneNode(false);
                    end = this._nodeChange_endLine(lineNodes[endLength], newNode, validation, endCon, endOff, isRemoveFormat, isRemoveNode, _removeCheck, _getMaintainedNode, _isMaintainedNode);
                }

                // mid
                for (let i = endLength - 1, newRange; i > 0; i--) {
                    newNode = appendNode.cloneNode(false);
                    newRange = this._nodeChange_middleLine(lineNodes[i], newNode, validation, isRemoveFormat, isRemoveNode, _removeCheck, end.container);
                    if (newRange.endContainer) {
                        end.ancestor = null;
                        end.container = newRange.endContainer;
                    }
                    this._setCommonListStyle(newRange.ancestor, null);
                }

                // start
                newNode = appendNode.cloneNode(false);
                start = this._nodeChange_startLine(lineNodes[0], newNode, validation, startCon, startOff, isRemoveFormat, isRemoveNode, _removeCheck, _getMaintainedNode, _isMaintainedNode, end.container);

                if (start.endContainer) {
                    end.ancestor = null;
                    end.container = start.endContainer;
                }

                if (endLength <= 0) {
                    end = start;
                } else if (!end.container) {
                    end.ancestor = null;
                    end.container = start.container;
                    end.offset = start.container.textContent.length;
                }

                this._setCommonListStyle(start.ancestor, null);
                this._setCommonListStyle(end.ancestor || util.getFormatElement(end.container), null);
            }

            // set range
            this.controllersOff();
            this.setRange(start.container, start.offset, end.container, end.offset);

            // history stack
            this.history.push(false);
        },

        /**
         * @description If certain styles are applied to all child nodes of the list cell, the style of the list cell is also changed. (bold, color, size)
         * @param {Element} el List cell element. <li>
         * @param {Element|null} child Variable for recursive call. ("null" on the first call)
         * @private
         */
        _setCommonListStyle: function (el, child) {
            if (!util.isListCell(el)) return;
            if (!child) el.removeAttribute('style');
            
            const children = util.getArrayItem((child || el).childNodes, function (current) { return !util.isBreak(current); }, true);
            if (children[0] && children.length === 1){
                child = children[0];
                if (!child || child.nodeType !== 1) return;

                const childStyle = child.style;
                const elStyle = el.style;

                // bold, italic
                if (options._textTagsMap[child.nodeName.toLowerCase()] === this._defaultCommand.bold.toLowerCase()) elStyle.fontWeight = 'bold'; // bold
                else if (childStyle.fontWeight) elStyle.fontWeight = childStyle.fontWeight;
                if (options._textTagsMap[child.nodeName.toLowerCase()] === this._defaultCommand.italic.toLowerCase()) elStyle.fontStyle = 'italic'; // italic
                else if (childStyle.fontStyle) elStyle.fontStyle = childStyle.fontStyle;

                // styles
                if (childStyle.color) elStyle.color = childStyle.color; // color
                if (childStyle.fontSize) elStyle.fontSize = childStyle.fontSize; // size

                this._setCommonListStyle(el, child);
            }
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
         * @param {Element} element Element
         * @returns {Element}
         * @private
         */
        _util_getMaintainedNode: function (_isRemove, _isSizeNode, element) {
            if (!element || _isRemove) return null;
            return this.getParentElement(element, this._isMaintainedNode.bind(this)) || (!_isSizeNode ? this.getParentElement(element, this._isSizeNode.bind(this)) : null);
        },

        /**
         * @description Check if element is a tag that should be persisted. (bind and use a util object)
         * @param {Element} element Element
         * @returns {Element}
         * @private
         */
        _util_isMaintainedNode: function (_isRemove, _isSizeNode, element) {
            if (!element || _isRemove || element.nodeType !== 1) return false;
            const anchor = this._isMaintainedNode(element);
            return this.getParentElement(element, this._isMaintainedNode.bind(this)) ? anchor : (anchor || (!_isSizeNode ? this._isSizeNode(element) : false));
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
         * @returns {{ancestor: *, startContainer: *, startOffset: *, endContainer: *, endOffset: *}}
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

            const wRegExp = _w.RegExp;
            function checkCss (vNode) {
                const regExp = new wRegExp('(?:;|^|\\s)(?:' + cssText + 'null)\\s*:[^;]*\\s*(?:;|$)', 'ig');
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
                                if (_isMaintainedNode(newNode)) {
                                    if (!anchorNode) anchors.push(vNode);
                                } else {
                                    pCurrent.push(vNode);
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
                        
                        if (_isMaintainedNode(newInnerNode.parentNode) && !_isMaintainedNode(childNode) && !util.onlyZeroWidthSpace(newInnerNode)) {
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
                    ancestor: element,
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
                ancestor: pNode,
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
         * @returns {Object} { ancestor, container, offset, endContainer }
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
                        ancestor: element,
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
                                if (_isMaintainedNode(newNode)) {
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
                    ancestor: element,
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
                newInnerNode = newInnerNode.firstChild;
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
                ancestor: pNode,
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
         * @returns {Object} { ancestor, endContainer: "If end container is renewed, returned renewed node" }
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
                    return {
                        ancestor: element,
                        endContainer: endPath ? util.getNodeFromPath(endPath, element) : null
                    };
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
            if (noneChange || (isRemoveNode && !isRemoveFormat && !_removeCheck.v)) return { ancestor: element, endContainer: _endContainer };

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
                newInnerNode = newInnerNode.firstChild;
                for (let i = 0; i < nNodeArray.length; i++) {
                    this._stripRemoveNode(nNodeArray[i]);
                }
            }

            util.removeEmptyNode(pNode, newInnerNode);
            util.mergeSameTags(pNode, null, true);

            // node change
            element.parentNode.replaceChild(pNode, element);
            return { ancestor: pNode, endContainer: _endContainer };
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
         * @returns {Object} { ancestor, container, offset }
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
                        ancestor: element,
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
                                if (_isMaintainedNode(newNode)) {
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
                    ancestor: element,
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
                newInnerNode = newInnerNode.firstChild;
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
                        ancestor: null,
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
                ancestor: pNode,
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
                }
                
                if (/container/.test(display) && (this._menuTray[command] === null || target !== this.containerActiveButton)) {
                    this.callPlugin(command, this.containerOn.bind(this, target), target);
                    return;
                } 
                
                if (this.isReadOnly) return;
                if (/submenu/.test(display) && (this._menuTray[command] === null || target !== this.submenuActiveButton)) {
                    this.callPlugin(command, this.submenuOn.bind(this, target), target);
                    return;
                } else if (/dialog/.test(display)) {
                    this.callPlugin(command, this.plugins[command].open.bind(this), target);
                    return;
                } else if (/command/.test(display)) {
                    this.callPlugin(command, this.plugins[command].action.bind(this), target);
                } else if (/fileBrowser/.test(display)) {
                    this.callPlugin(command, this.plugins[command].open.bind(this, null), target);
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
            } else if (!/command/.test(display)) {
                this.submenuOff();
                this.containerOff();
            }
        },

        /**
         * @description Execute command of command button(All Buttons except submenu and dialog)
         * (selectAll, codeView, fullScreen, indent, outdent, undo, redo, removeFormat, print, preview, showBlocks, save, bold, underline, italic, strike, subscript, superscript, copy, cut, paste)
         * @param {Element|null} target The element of command button
         * @param {String} command Property of command button (data-value)
         */
        commandHandler: function (target, command) {
            if (core.isReadOnly && !/copy|cut|selectAll|codeView|fullScreen|print|preview|showBlocks/.test(command)) return;
            switch (command) {
                case 'copy':
                case 'cut':
                    this.execCommand(command);
                    break;
                case 'paste':
                    break;
                case 'selectAll':
                    const wysiwyg = context.element.wysiwyg;
                    let first = util.getChildElement(wysiwyg.firstChild, function (current) { return current.childNodes.length === 0 || current.nodeType === 3; }, false) || wysiwyg.firstChild;
                    let last = util.getChildElement(wysiwyg.lastChild, function (current) { return current.childNodes.length === 0 || current.nodeType === 3; }, true) || wysiwyg.lastChild;
                    if (!first || !last) return;
                    if (util.isMedia(first)) {
                        const info = this.getFileComponent(first);
                        const br = util.createElement('BR');
                        const format = util.createElement(options.defaultTag);
                        format.appendChild(br);
                        first = info ? info.component : first;
                        first.parentNode.insertBefore(format, first);
                        first = br;
                    }
                    if (util.isMedia(last)) {
                        const br = util.createElement('BR');
                        const format = util.createElement(options.defaultTag);
                        format.appendChild(br);
                        wysiwyg.appendChild(format);
                        last = br;
                    }
                    this.setRange(first, 0, last, last.textContent.length);
                    break;
                case 'codeView':
                    this.toggleCodeView();
                    break;
                case 'fullScreen':
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
                    this.toggleDisplayBlocks();
                    break;
                case 'save':
                    if (typeof options.callBackSave === 'function') {
                        options.callBackSave(this.getContents(false), this._variable.isChanged);
                    } else if (this._variable.isChanged && typeof functions.save === 'function') {
                        functions.save();
                    } else {
                        throw Error('[SUNEDITOR.core.commandHandler.fail] Please register call back function in creation option. (callBackSave : Function)');
                    }

                    this._variable.isChanged = false;
                    if (context.tool.save) context.tool.save.setAttribute('disabled', true);
                    break;
                default : // 'STRONG', 'U', 'EM', 'DEL', 'SUB', 'SUP'..
                    command = this._defaultCommand[command.toLowerCase()] || command;
                    if (!this.commandMap[command]) this.commandMap[command] = target;

                    const nodesMap = this._variable.currentNodesMap;
                    const cmd = nodesMap.indexOf(command) > -1 ? null : util.createElement(command);
                    let removeNode = command;

                    if (/^SUB$/i.test(command) && nodesMap.indexOf('SUP') > -1) {
                        removeNode = 'SUP';
                    } else if (/^SUP$/i.test(command) && nodesMap.indexOf('SUB') > -1) {
                        removeNode = 'SUB';
                    }

                    this.nodeChange(cmd, null, [removeNode], false);
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
            const marginDir = options.rtl ? 'marginRight' : 'marginLeft';
            let sc = range.startContainer;
            let ec = range.endContainer;
            let so = range.startOffset;
            let eo = range.endOffset;

            for (let i = 0, len = rangeLines.length, f, margin; i < len; i++) {
                f = rangeLines[i];
                if (!util.isListCell(f) || !this.plugins.list) {
                    margin = /\d+/.test(f.style[marginDir]) ? util.getNumber(f.style[marginDir], 0) : 0;
                    if (shift) {
                        margin -= 25;
                    } else {
                        margin += 25;
                    }
                    util.setStyle(f, marginDir, (margin <= 0 ? '' : margin + 'px'));
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
            const wysiwyg = context.element.wysiwyg;
            util.toggleClass(wysiwyg, 'se-show-block');
            if (util.hasClass(wysiwyg, 'se-show-block')) {
                util.addClass(this._styleCommandMap.showBlocks, 'active');
            } else {
                util.removeClass(this._styleCommandMap.showBlocks, 'active');
            }
            this._resourcesStateChange();
        },

        /**
         * @description Changes to code view or wysiwyg view
         */
        toggleCodeView: function () {
            const isCodeView = this._variable.isCodeView;
            this.controllersOff();
            util.setDisabledButtons(!isCodeView, this.codeViewDisabledButtons);

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
                util.removeClass(this._styleCommandMap.codeView, 'active');

                // history stack
                this.history.push(false);
                this.history._resetCachingButton();
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
                util.addClass(this._styleCommandMap.codeView, 'active');
            }

            this._checkPlaceholder();
            if (this.isReadOnly) util.setDisabledButtons(true, this.resizingDisabledButtons);

            // user event
            if (typeof functions.toggleCodeView === 'function') functions.toggleCodeView(this._variable.isCodeView, this);
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
                    if (/^script$/i.test(headChildren[i].tagName)) {
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
                if (!util.hasClass(this._wd.body, 'sun-editor-editable')) {
                    const editableClasses = options._editableClass.split(' ');
                    for (let i = 0; i < editableClasses.length; i++) {
                        util.addClass(this._wd.body, options._editableClass[i]);
                    }
                }
            } else {
                context.element.wysiwyg.innerHTML = code_html.length > 0 ? this.convertContentsForEditor(code_html) : '<' + options.defaultTag + '><br></' + options.defaultTag + '>';
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
                
                if (!!options.toolbarContainer) context.element.relative.insertBefore(toolbar, editorArea);

                topArea.style.position = 'fixed';
                topArea.style.top = '0';
                topArea.style.left = '0';
                topArea.style.width = '100%';
                topArea.style.maxWidth = '100%';
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
                editorArea.style.height = (_var.innerHeight_fullScreen - options.fullScreenOffset) + 'px';

                util.changeElement(element.firstElementChild, icons.reduction);

                if (options.iframe && options.height === 'auto') {
                    editorArea.style.overflow = 'auto';
                    this._iframeAutoHeight();
                }

                context.element.topArea.style.marginTop = options.fullScreenOffset + 'px';
                util.addClass(this._styleCommandMap.fullScreen, 'active');
            } else {
                _var.isFullScreen = false;

                wysiwygFrame.style.cssText = _var._wysiwygOriginCssText;
                code.style.cssText = _var._codeOriginCssText;
                toolbar.style.cssText = '';
                editorArea.style.cssText = _var._editorAreaOriginCssText;
                topArea.style.cssText = _var._originCssText;
                _d.body.style.overflow = _var._bodyOverflow;

                if (!!options.toolbarContainer) options.toolbarContainer.appendChild(toolbar);

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
                if (!!options.toolbarContainer) util.removeClass(toolbar, 'se-toolbar-balloon');

                event.onScroll_window();
                util.changeElement(element.firstElementChild, icons.expansion);

                context.element.topArea.style.marginTop = '';
                util.removeClass(this._styleCommandMap.fullScreen, 'active');
            }

            // user event
            if (typeof functions.toggleFullScreen === 'function') functions.toggleFullScreen(this._variable.isFullScreen, this);
        },

        /**
         * @description Prints the current contents of the editor.
         */
        print: function () {
            const iframe = util.createElement('IFRAME');
            iframe.style.display = 'none';
            _d.body.appendChild(iframe);

            const contentsHTML = options.printTemplate ? options.printTemplate.replace(/\{\{\s*contents\s*\}\}/i, this.getContents(true)) : this.getContents(true);
            const printDocument = util.getIframeDocument(iframe);
            const wDoc = this._wd;

            if (options.iframe) {
                const arrts = options._printClass !== null ? 'class="' + options._printClass + '"' : options.fullPage ? util.getAttributesToString(wDoc.body, ['contenteditable']) : 'class="' + options._editableClass + '"';

                printDocument.write('' +
                    '<!DOCTYPE html><html>' +
                    '<head>' +
                    wDoc.head.innerHTML +
                    '</head>' +
                    '<body ' + arrts + '>' + contentsHTML + '</body>' +
                    '</html>'
                );
            } else {
                const links = _d.head.getElementsByTagName('link');
                const styles = _d.head.getElementsByTagName('style');
                let linkHTML = '';
                for (let i = 0, len = links.length; i < len; i++) {
                    linkHTML += links[i].outerHTML;
                }
                for (let i = 0, len = styles.length; i < len; i++) {
                    linkHTML += styles[i].outerHTML;
                }

                printDocument.write('' +
                    '<!DOCTYPE html><html>' +
                    '<head>' +
                    linkHTML +
                    '</head>' +
                    '<body class="' + (options._printClass !== null ? options._printClass : options._editableClass) + '">' + contentsHTML + '</body>' +
                    '</html>'
                );
            }

            this.showLoading();
            _w.setTimeout(function () {
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
                    core.closeLoading();
                    util.removeItem(iframe);
                }
            }, 1000);
        },

        /**
         * @description Open the preview window.
         */
        preview: function () {
            core.submenuOff();
            core.containerOff();
            core.controllersOff();
            
            const contentsHTML = options.previewTemplate ? options.previewTemplate.replace(/\{\{\s*contents\s*\}\}/i, this.getContents(true)) : this.getContents(true);
            const windowObject = _w.open('', '_blank');
            windowObject.mimeType = 'text/html';
            const wDoc = this._wd;

            if (options.iframe) {
                const arrts = options._printClass !== null ? 'class="' + options._printClass + '"' : options.fullPage ? util.getAttributesToString(wDoc.body, ['contenteditable']) : 'class="' + options._editableClass + '"';

                windowObject.document.write('' +
                    '<!DOCTYPE html><html>' +
                    '<head>' +
                    wDoc.head.innerHTML +
                    '<style>body {overflow:auto !important; margin: 10px auto !important; height:auto !important; outline:1px dashed #ccc;}</style>' +
                    '</head>' +
                    '<body ' + arrts + '>' + contentsHTML + '</body>' +
                    '</html>'
                );
            } else {
                const links = _d.head.getElementsByTagName('link');
                const styles = _d.head.getElementsByTagName('style');
                let linkHTML = '';
                for (let i = 0, len = links.length; i < len; i++) {
                    linkHTML += links[i].outerHTML;
                }
                for (let i = 0, len = styles.length; i < len; i++) {
                    linkHTML += styles[i].outerHTML;
                }
                
                windowObject.document.write('' +
                    '<!DOCTYPE html><html>' +
                    '<head>' +
                    '<meta charset="utf-8" />' +
                    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
                    '<title>' + lang.toolbar.preview + '</title>' +
                    linkHTML +
                    '</head>' +
                    '<body class="' + (options._printClass !== null ? options._printClass : options._editableClass) + '" style="margin:10px auto !important; height:auto !important; outline:1px dashed #ccc;">' + contentsHTML + '</body>' +
                    '</html>'
                );
            }
        },

        /**
         * @description Sets the HTML string
         * @param {String|undefined} html HTML string
         */
        setContents: function (html) {
            this.removeRange();
            
            const convertValue = (html === null || html === undefined) ? '' : this.convertContentsForEditor(html);
            this._resetComponents();

            if (!this._variable.isCodeView) {
                context.element.wysiwyg.innerHTML = convertValue;
                // history stack
                this.history.push(false);
            } else {
                const value = this.convertHTMLForCodeView(convertValue);
                this._setCodeView(value);
            }
        },

        /**
         * @description Sets the contents of the iframe's head tag and body tag when using the "iframe" or "fullPage" option.
         * @param {Object} ctx { head: HTML string, body: HTML string}
         */
        setIframeContents: function (ctx) {
            if (!options.iframe) return false;
            if (ctx.head) this._wd.head.innerHTML = ctx.head.replace(/<script[\s\S]*>[\s\S]*<\/script>/gi, '');
            if (ctx.body) this._wd.body.innerHTML = this.convertContentsForEditor(ctx.body);
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
         * Use only "cleanHTML"
         * @param {Node} node Node
         * @param {Boolean} requireFormat If true, text nodes that do not have a format node is wrapped with the format tag.
         * @private
         */
        _makeLine: function (node, requireFormat) {
            const defaultTag = options.defaultTag;
            // element
            if (node.nodeType === 1) {
                if (util._disallowedTags(node)) return '';
                if (!requireFormat || (util.isFormatElement(node) || util.isRangeFormatElement(node) || util.isComponent(node) || util.isMedia(node) || (util.isAnchor(node) && util.isMedia(node.firstElementChild)))) {
                    return node.outerHTML;
                } else {
                    return '<' + defaultTag + '>' + node.outerHTML + '</' + defaultTag + '>';
                }
            }
            // text
            if (node.nodeType === 3) {
                if (!requireFormat) return util._HTMLConvertor(node.textContent);
                const textArray = node.textContent.split(/\n/g);
                let html = '';
                for (let i = 0, tLen = textArray.length, text; i < tLen; i++) {
                    text = textArray[i].trim();
                    if (text.length > 0) html += '<' + defaultTag + '>' + util._HTMLConvertor(text) + '</' + defaultTag + '>';
                }
                return html;
            }
            // comments
            if (node.nodeType === 8 && this._allowHTMLComments) {
                return '<!--' + node.textContent.trim() + '-->';
            }

            return '';
        },

        /**
         * @description Removes attribute values such as style and converts tags that do not conform to the "html5" standard.
         * @param {String} text 
         * @returns {String} HTML string
         * @private
         */
        _tagConvertor: function (text) {
            if (!this._disallowedTextTagsRegExp) return text;

            const ec = options._textTagsMap;
            return text.replace(this._disallowedTextTagsRegExp, function (m, t, n, p) {
                return t + (typeof ec[n] === 'string' ? ec[n] : n) + (p ? ' ' + p : '');
            });
        },

        /**
         * @description Delete disallowed tags
         * @param {String} html HTML string
         * @returns {String}
         * @private
         */
        _deleteDisallowedTags: function (html) {
            return html
                .replace(/\n/g, '')
                .replace(/<(script|style)[\s\S]*>[\s\S]*<\/(script|style)>/gi, '')
                .replace(/<[a-z0-9]+\:[a-z0-9]+[^>^\/]*>[^>]*<\/[a-z0-9]+\:[a-z0-9]+>/gi, '')
                .replace(this.editorTagsWhitelistRegExp, '');
        },

        /**
         * @description Tag and tag attribute check RegExp function. (used by "cleanHTML" and "convertContentsForEditor")
         * @param {Boolean} lowLevelCheck Row level check
         * @param {String} m RegExp value
         * @param {String} t RegExp value
         * @returns {String}
         * @private
         */
        _cleanTags: function (lowLevelCheck, m, t) {
            if (/^<[a-z0-9]+\:[a-z0-9]+/i.test(m)) return m;

            let v = null;
            const tAttr = this._attributesTagsWhitelist[t.match(/(?!<)[a-zA-Z0-9\-]+/)[0].toLowerCase()];
            if (tAttr) v = m.match(tAttr);
            else v = m.match(this._attributesWhitelistRegExp);

            if (!lowLevelCheck || /<a\b/i.test(t)) {
                const sv = m.match(/id\s*=\s*(?:"|')[^"']*(?:"|')/);
                if (sv) {
                    if (!v) v = [];
                    v.push(sv[0]);
                }
            }

            if ((!lowLevelCheck || /<span/i.test(t)) && (!v || !/style=/i.test(v.toString()))) {
                const sv = m.match(/style\s*=\s*(?:"|')[^"']*(?:"|')/);
                if (sv) {
                    if (!v) v = [];
                    v.push(sv[0]);
                }
            }

            if (v) {
                for (let i = 0, len = v.length; i < len; i++) {
                    if (lowLevelCheck && /^class="(?!(__se__|se-|katex))/.test(v[i])) continue;
                    t += ' ' + (/^(?:href|src)\s*=\s*('|"|\s)*javascript\s*\:/i.test(v[i]) ? '' : v[i]);
                }
            }

            return t;
        },

        /**
         * @description Gets the clean HTML code for editor
         * @param {String} html HTML string
         * @param {String|RegExp|null} whitelist Regular expression of allowed tags.
         * RegExp object is create by util.createTagsWhitelist method. (core.pasteTagsWhitelistRegExp)
         * @returns {String}
         */
        cleanHTML: function (html, whitelist) {
            html = this._deleteDisallowedTags(this._parser.parseFromString(html, 'text/html').body.innerHTML).replace(/(<[a-zA-Z0-9\-]+)[^>]*(?=>)/g, this._cleanTags.bind(this, true));

            const dom = _d.createRange().createContextualFragment(html);
            try {
                util._consistencyCheckOfHTML(dom, this._htmlCheckWhitelistRegExp, true);
            } catch (error) {
                console.warn('[SUNEDITOR.cleanHTML.consistencyCheck.fail] ' + error);
            }
            
            if (this.managedTagsInfo && this.managedTagsInfo.query) {
                const textCompList = dom.querySelectorAll(this.managedTagsInfo.query);
                for (let i = 0, len = textCompList.length, initMethod, classList; i < len; i++) {
                    classList = [].slice.call(textCompList[i].classList);
                    for (let c = 0, cLen = classList.length; c < cLen; c++) {
                        initMethod = this.managedTagsInfo.map[classList[c]];
                        if (initMethod) {
                            initMethod(textCompList[i]);
                            break;
                        }
                    }
                }
            }

            const domTree = dom.childNodes;
            let cleanHTML = '';
            let requireFormat = false;

            for (let i = 0, len = domTree.length, t; i < len; i++) {
                t = domTree[i];
                if (t.nodeType === 1 && !util.isTextStyleElement(t) && !util.isBreak(t) && !util._disallowedTags(t)) {
                    requireFormat = true;
                    break;
                }
            }

            for (let i = 0, len = domTree.length; i < len; i++) {
                cleanHTML += this._makeLine(domTree[i], requireFormat);
            }

            cleanHTML = util.htmlRemoveWhiteSpace(cleanHTML);
            return this._tagConvertor(!cleanHTML ? html : !whitelist ? cleanHTML : cleanHTML.replace(typeof whitelist === 'string' ? util.createTagsWhitelist(whitelist) : whitelist, ''));
        },

        /**
         * @description Converts contents into a format that can be placed in an editor
         * @param {String} contents contents
         * @returns {String}
         */
        convertContentsForEditor: function (contents) {
            contents = this._deleteDisallowedTags(this._parser.parseFromString(contents, 'text/html').body.innerHTML).replace(/(<[a-zA-Z0-9\-]+)[^>]*(?=>)/g, this._cleanTags.bind(this, false));
            const dom = _d.createRange().createContextualFragment(contents);

            try {
                util._consistencyCheckOfHTML(dom, this._htmlCheckWhitelistRegExp, false);
            } catch (error) {
                console.warn('[SUNEDITOR.convertContentsForEditor.consistencyCheck.fail] ' + error);
            }

            if (this.managedTagsInfo && this.managedTagsInfo.query) {
                const textCompList = dom.querySelectorAll(this.managedTagsInfo.query);
                for (let i = 0, len = textCompList.length, initMethod, classList; i < len; i++) {
                    classList = [].slice.call(textCompList[i].classList);
                    for (let c = 0, cLen = classList.length; c < cLen; c++) {
                        initMethod = this.managedTagsInfo.map[classList[c]];
                        if (initMethod) {
                            initMethod(textCompList[i]);
                            break;
                        }
                    }
                }
            }
            
            const domTree = dom.childNodes;
            let cleanHTML = '';
            for (let i = 0, len = domTree.length; i < len; i++) {
                cleanHTML += this._makeLine(domTree[i], true);
            }

            if (cleanHTML.length === 0) return '<' + options.defaultTag + '><br></' + options.defaultTag + '>';

            cleanHTML = util.htmlRemoveWhiteSpace(cleanHTML);
            return this._tagConvertor(cleanHTML);
        },

        /**
         * @description Converts wysiwyg area element into a format that can be placed in an editor of code view mode
         * @param {Element|String} html WYSIWYG element (context.element.wysiwyg) or HTML string.
         * @returns {String}
         */
        convertHTMLForCodeView: function (html) {
            let returnHTML = '';
            const wRegExp = _w.RegExp;
            const brReg = new wRegExp('^(BLOCKQUOTE|PRE|TABLE|THEAD|TBODY|TR|TH|TD|OL|UL|IMG|IFRAME|VIDEO|AUDIO|FIGURE|FIGCAPTION|HR|BR|CANVAS|SELECT)$', 'i');
            const wDoc = typeof html === 'string' ? _d.createRange().createContextualFragment(html) : html;
            const isFormat = function (current) { return this.isFormatElement(current) || this.isComponent(current); }.bind(util);

            let indentSize = this._variable.codeIndent * 1;
            indentSize = indentSize > 0 ? new _w.Array(indentSize + 1).join(' ') : '';

            (function recursionFunc (element, indent, lineBR) {
                const children = element.childNodes;
                const elementRegTest = brReg.test(element.nodeName);
                const elementIndent = (elementRegTest ? indent : '');

                for (let i = 0, len = children.length, node, br, nodeRegTest, tag, tagIndent; i < len; i++) {
                    node = children[i];
                    nodeRegTest = brReg.test(node.nodeName);
                    br = nodeRegTest ? '\n' : '';
                    lineBR = isFormat(node) && !elementRegTest && !/^(TH|TD)$/i.test(element.nodeName) ? '\n' : '';

                    if (node.nodeType === 8) {
                        returnHTML += '\n<!-- ' + node.textContent.trim() + ' -->' + br;
                        continue;
                    }
                    if (node.nodeType === 3) {
                        if (!util.isList(node.parentElement)) returnHTML += util._HTMLConvertor(/^\n+$/.test(node.data) ? '' : node.data);
                        continue;
                    }
                    if (node.childNodes.length === 0) {
                        returnHTML += (/^HR$/i.test(node.nodeName) ? '\n' : '') + (/^PRE$/i.test(node.parentElement.nodeName) && /^BR$/i.test(node.nodeName) ? '' : elementIndent) + node.outerHTML + br;
                        continue;
                    }

                    if (!node.outerHTML) { // IE
                        returnHTML += new _w.XMLSerializer().serializeToString(node);
                    } else {
                        tag = node.nodeName.toLowerCase();
                        tagIndent = elementIndent || nodeRegTest ? indent : '';
                        returnHTML += (lineBR || (elementRegTest ? '' : br)) + tagIndent + node.outerHTML.match(wRegExp('<' + tag + '[^>]*>', 'i'))[0] + br;
                        recursionFunc(node, indent + indentSize, '');
                        returnHTML += (/\n$/.test(returnHTML) ? tagIndent : '') + '</' + tag + '>' + (lineBR || br || elementRegTest ? '\n' : '' || /^(TH|TD)$/i.test(node.nodeName) ? '\n' : '');
                    }
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
            const maxCharCount = options.maxCharCount;
            const countType = options.charCounterType;
            let nextCharCount = 0;
            if (!!inputText) nextCharCount = this.getCharLength(inputText, countType);

            this._setCharCount();

            if (maxCharCount > 0) {
                let over = false;
                const count = functions.getCharCount(countType);
                
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
                    this._callCounterBlink();
                    if (nextCharCount > 0) return false;
                }
            }

            return true;
        },

        /**
         * @description When "element" is added, if it is greater than "options.maxCharCount", false is returned.
         * @param {Node|String} element Element node or String.
         * @param {String|null} charCounterType charCounterType. If it is null, the options.charCounterType
         * @returns {Boolean}
         */
        checkCharCount: function (element, charCounterType) {
            if (options.maxCharCount) {
                const countType = charCounterType || options.charCounterType;
                const length = this.getCharLength((typeof element === 'string' ? element : (this._charTypeHTML && element.nodeType === 1) ? element.outerHTML : element.textContent), countType);
                if (length > 0 && length + functions.getCharCount(countType) > options.maxCharCount) {
                    this._callCounterBlink();
                    return false;
                }
            }
            return true;
        },

        /**
         * @description Get the length of the content.
         * Depending on the option, the length of the character is taken. (charCounterType)
         * @param {String} content Content to count
         * @param {String} charCounterType options.charCounterType
         * @returns {Number}
         */
        getCharLength: function (content, charCounterType) {
            return /byte/.test(charCounterType) ? util.getByteLength(content) : content.length;
        },

        /**
         * @description Set the char count to charCounter element textContent.
         * @private
         */
        _setCharCount: function () {
            if (context.element.charCounter) {
                _w.setTimeout(function () { context.element.charCounter.textContent = functions.getCharCount(options.charCounterType); });
            }
        },

        /**
         * @description The character counter blinks.
         * @private
         */
        _callCounterBlink: function () {
            const charWrapper = context.element.charWrapper;
            if (charWrapper && !util.hasClass(charWrapper, 'se-blink')) {
                util.addClass(charWrapper, 'se-blink');
                _w.setTimeout(function () {
                    util.removeClass(charWrapper, 'se-blink');
                }, 600);
            }
        },

        /**
         * @description Check the components such as image and video and modify them according to the format.
         * @private
         */
        _checkComponents: function () {
            for (let i = 0, len = this._fileInfoPluginsCheck.length; i < len; i++) {
                this._fileInfoPluginsCheck[i]();
            }
        },

        /**
         * @description Initialize the information of the components.
         * @private
         */
        _resetComponents: function () {
            for (let i = 0, len = this._fileInfoPluginsReset.length; i < len; i++) {
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
         * @description remove class, display text.
         * @param {Array|null} ignoredList Igonred button list
         */
        _setKeyEffect: function (ignoredList) {
            const commandMap = this.commandMap;
            const activePlugins = this.activePlugins;

            for (let key in commandMap) {
                if (ignoredList.indexOf(key) > -1 || !util.hasOwn(commandMap, key)) continue;
                if (activePlugins.indexOf(key) > -1) {
                    plugins[key].active.call(this, null);
                } else if (commandMap.OUTDENT && /^OUTDENT$/i.test(key)) {
                    if (!this.isReadOnly) commandMap.OUTDENT.setAttribute('disabled', true);
                } else if (commandMap.INDENT && /^INDENT$/i.test(key)) {
                    if (!this.isReadOnly) commandMap.INDENT.removeAttribute('disabled');
                } else {
                    util.removeClass(commandMap[key], 'active');
                }
            }
        },

        /**
         * @description Initializ core variable
         * @param {Boolean} reload Is relooad?
         * @param {String} _initHTML initial html string
         * @private
         */
        _init: function (reload, _initHTML) {
            const wRegExp = _w.RegExp;
            this._ww = options.iframe ? context.element.wysiwygFrame.contentWindow : _w;
            this._wd = _d;
            this._charTypeHTML = options.charCounterType === 'byte-html';

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
                if (this._shadowRoot) this._shadowRootControllerEventTarget = [];
            }

            // set disallow text nodes
            const disallowTextTags = _w.Object.keys(options._textTagsMap);
            const allowTextTags = !options.addTagsWhitelist ? [] : options.addTagsWhitelist.split('|').filter(function (v) { return /b|i|ins|s|strike/i.test(v); });
            for (let i = 0; i < allowTextTags.length; i++) {
                disallowTextTags.splice(disallowTextTags.indexOf(allowTextTags[i].toLowerCase()), 1);
            }
            this._disallowedTextTagsRegExp = disallowTextTags.length === 0 ? null : new wRegExp('(<\\/?)(' + disallowTextTags.join('|') + ')\\b\\s*([^>^<]+)?\\s*(?=>)', 'gi');

            // set whitelist
            const defaultAttr = 'contenteditable|colspan|rowspan|target|href|download|rel|src|alt|class|type|controls|data-format|data-size|data-file-size|data-file-name|data-origin|data-align|data-image-link|data-rotate|data-proportion|data-percentage|origin-size|data-exp|data-font-size';
            this._allowHTMLComments = options._editorTagsWhitelist.indexOf('//') > -1;
            this._htmlCheckWhitelistRegExp = new wRegExp('^(' + options._editorTagsWhitelist.replace('|//', '') + ')$', 'i');
            this.editorTagsWhitelistRegExp = util.createTagsWhitelist(options._editorTagsWhitelist.replace('|//', '|<!--|-->'));
            this.pasteTagsWhitelistRegExp = util.createTagsWhitelist(options.pasteTagsWhitelist);

            const regEndStr = '\\s*=\\s*(\")[^\"]*\\1';
            const _attr = options.attributesWhitelist;
            const tagsAttr = {};
            let allAttr = '';
            if (!!_attr) {
                for (let k in _attr) {
                    if (!util.hasOwn(_attr, k) || /^on[a-z]+$/i.test(_attr[k])) continue;
                    if (k === 'all') {
                        allAttr = _attr[k] + '|';
                    } else {
                        tagsAttr[k] = new wRegExp('(?:' + _attr[k] + '|' + defaultAttr + ')' + regEndStr, 'ig');
                    }
                }
            }

            this._attributesWhitelistRegExp = new wRegExp('(?:' + allAttr + defaultAttr + ')' + regEndStr, 'ig');
            this._attributesTagsWhitelist = tagsAttr;

            // set modes
            this._isInline = /inline/i.test(options.mode);
            this._isBalloon = /balloon|balloon-always/i.test(options.mode);
            this._isBalloonAlways = /balloon-always/i.test(options.mode);

            // caching buttons
            this._cachingButtons();

            // file components
            this._fileInfoPluginsCheck = [];
            this._fileInfoPluginsReset = [];

            // text components
            this.managedTagsInfo = { query: '', map: {} };
            const managedClass = [];

            // Command and file plugins registration
            this.activePlugins = [];
            this._fileManager.tags = [];
            this._fileManager.pluginMap = {};

            let filePluginRegExp = [];
            let plugin, button;
            for (let key in plugins) {
                if (!util.hasOwn(plugins, key)) continue;
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
                if (_w.Array.isArray(plugin.fileTags)) {
                    const fileTags = plugin.fileTags;
                    this.callPlugin(key, null, button);
                    this._fileManager.tags = this._fileManager.tags.concat(fileTags);
                    filePluginRegExp.push(key);
                    for (let tag = 0, tLen = fileTags.length; tag < tLen; tag++) {
                        this._fileManager.pluginMap[fileTags[tag].toLowerCase()] = key;
                    }
                }
                if (plugin.managedTags) {
                    const info = plugin.managedTags();
                    managedClass.push('.' + info.className);
                    this.managedTagsInfo.map[info.className] = info.method.bind(this);
                }
            }

            this.managedTagsInfo.query = managedClass.toString();
            this._fileManager.queryString = this._fileManager.tags.join(',');
            this._fileManager.regExp = new wRegExp('^(' +  this._fileManager.tags.join('|') + ')$', 'i');
            this._fileManager.pluginRegExp = new wRegExp('^(' +  (filePluginRegExp.length === 0 ? 'undefined' : filePluginRegExp.join('|')) + ')$', 'i');
            
            // cache editor's element
            this._variable._originCssText = context.element.topArea.style.cssText;
            this._placeholder = context.element.placeholder;
            this._lineBreaker = context.element.lineBreaker;
            this._lineBreakerButton = this._lineBreaker.querySelector('button');

            // Excute history function
            this.history = _history(this, this._onChange_historyStack.bind(this));

            // register notice module
            this.addModule([_notice]);

            // Init, validate
            if (options.iframe) {
                this._wd = context.element.wysiwygFrame.contentDocument;
                context.element.wysiwyg = this._wd.body;
                if (options._editorStyles.editor) context.element.wysiwyg.style.cssText = options._editorStyles.editor;
                if (options.height === 'auto') this._iframeAuto = this._wd.body;
            }
            
            this._initWysiwygArea(reload, _initHTML);
        },

        /**
         * @description Caching basic buttons to use
         * @private
         */
        _cachingButtons: function () {
            this.codeViewDisabledButtons = context.element._buttonTray.querySelectorAll('.se-menu-list button[data-display]:not([class~="se-code-view-enabled"])');
            this.resizingDisabledButtons = context.element._buttonTray.querySelectorAll('.se-menu-list button[data-display]:not([class~="se-resizing-enabled"]):not([data-display="MORE"])');

            const tool = context.tool;
            this.commandMap = {
                SUB: tool.subscript,
                SUP: tool.superscript,
                OUTDENT: tool.outdent,
                INDENT: tool.indent
            };
            this.commandMap[options.textTags.bold.toUpperCase()] = tool.bold;
            this.commandMap[options.textTags.underline.toUpperCase()] = tool.underline;
            this.commandMap[options.textTags.italic.toUpperCase()] = tool.italic;
            this.commandMap[options.textTags.strike.toUpperCase()] = tool.strike;
            
            this._styleCommandMap = {
                fullScreen: tool.fullScreen,
                showBlocks: tool.showBlocks,
                codeView: tool.codeView
            };
        },

        /**
         * @description Initializ wysiwyg area (Only called from core._init)
         * @param {Boolean} reload Is relooad?
         * @param {String} _initHTML initial html string
         * @private
         */
        _initWysiwygArea: function (reload, _initHTML) {
            context.element.wysiwyg.innerHTML = reload ? _initHTML : this.convertContentsForEditor(typeof _initHTML === 'string' ? _initHTML : context.element.originElement.value);
        },

        /**
         * @description Called when there are changes to tags in the wysiwyg region.
         * @private
         */
        _resourcesStateChange: function () {
            this._iframeAutoHeight();
            this._checkPlaceholder();
        },

        /**
         * @description Called when after execute "history.push"
         * @private
         */
        _onChange_historyStack: function () {
            if (this.hasFocus) event._applyTagEffects();
            this._variable.isChanged = true;
            if (context.tool.save) context.tool.save.removeAttribute('disabled');
            // user event
            if (functions.onChange) functions.onChange(this.getContents(true), this);
            if (context.element.toolbar.style.display === 'block') event._showToolbarBalloon();
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
                if (!util.onlyZeroWidthSpace(wysiwyg.textContent) || wysiwyg.querySelector(util._allowedEmptyNodeList) || (wysiwyg.innerText.match(/\n/g) || '').length > 1) {
                    this._placeholder.style.display = 'none';
                } else {
                    this._placeholder.style.display = 'block';
                }
            }
        },

        /**
         * @description If there is no default format, add a format and move "selection".
         * @param {String|null} formatName Format tag name (default: 'P')
         * @returns {undefined|null}
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
            if ((util.isRangeFormatElement(startCon) || util.isWysiwygDiv(startCon)) && (util.isComponent(startCon.children[range.startOffset]) || util.isComponent(startCon.children[range.startOffset - 1]))) return;
            if (util.getParentElement(commonCon, util.isNotCheckingNode)) return null;

            if (rangeEl) {
                format = util.createElement(formatName || options.defaultTag);
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

            this.execCommand('formatBlock', false, (formatName || options.defaultTag));
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
         * @description Initialization after "setOptions"
         * @param {Object} el context.element
         * @param {String} _initHTML Initial html string
         * @private
         */
        _setOptionsInit: function (el, _initHTML) {
            this.context = context = _Context(el.originElement, this._getConstructed(el), options);
            this._componentsInfoReset = true;
            this._editorInit(true, _initHTML);
        },

        /**
         * @description Initializ editor
         * @param {Boolean} reload Is relooad?
         * @param {String} _initHTML initial html string
         * @private
         */
        _editorInit: function (reload, _initHTML) {
            // initialize core and add event listeners
            this._init(reload, _initHTML);
            event._addEvent();
            this._setCharCount();
            event._offStickyToolbar();
            event.onResize_window();

            // toolbar visibility
            context.element.toolbar.style.visibility = '';

            this._checkComponents();
            this._componentsInfoInit = false;
            this._componentsInfoReset = false;

            this.history.reset(true);
            this._resourcesStateChange();

            _w.setTimeout(function () {
                // user event
                if (typeof functions.onload === 'function') functions.onload(core, reload);
            });
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
                _lineBreaker_t: contextEl.lineBreaker_t,
                _lineBreaker_b: contextEl.lineBreaker_b,
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
        _IEisComposing: false, // In IE, there is no "e.isComposing" in the key-up event.
        _lineBreakerBind: null,
        _responsiveCurrentSize: 'default',
        _responsiveButtonSize: null,
        _responsiveButtons: null,
        _directionKeyCode: new _w.RegExp('^(8|13|3[2-9]|40|46)$'),
        _nonTextKeyCode: new _w.RegExp('^(8|13|1[6-9]|20|27|3[3-9]|40|45|46|11[2-9]|12[0-3]|144|145)$'),
        _historyIgnoreKeyCode: new _w.RegExp('^(1[6-9]|20|27|3[3-9]|40|45|11[2-9]|12[0-3]|144|145)$'),
        _onButtonsCheck: new _w.RegExp('^(' + _w.Object.keys(options._textTagsMap).join('|') + ')$', 'i'),
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
                    if (options.shortcutsDisable.indexOf('bold') === -1) {
                        command = 'bold';
                    }
                    break;
                case 'S':
                    if (shift && options.shortcutsDisable.indexOf('strike') === -1) {
                        command = 'strike';
                    } else if (!shift && options.shortcutsDisable.indexOf('save') === -1) {
                        command = 'save';
                    }
                    break;
                case 'U':
                    if (options.shortcutsDisable.indexOf('underline') === -1) {
                        command = 'underline';
                    }
                    break;
                case 'I':
                    if (options.shortcutsDisable.indexOf('italic') === -1) {
                        command = 'italic';
                    }
                    break;
                case 'Z':
                    if (options.shortcutsDisable.indexOf('undo') === -1) {
                        if (shift) {
                            command = 'redo';
                        } else {
                            command = 'undo';
                        }
                    }
                    break;
                case 'Y':
                    if (options.shortcutsDisable.indexOf('undo') === -1) {
                        command = 'redo';
                    }
                    break;
                case '[':
                    if (options.shortcutsDisable.indexOf('indent') === -1) {
                        command = options.rtl ? 'indent' : 'outdent';
                    }
                    break;
                case ']':
                    if (options.shortcutsDisable.indexOf('indent') === -1) {
                        command = options.rtl ? 'outdent' : 'indent';
                    }
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

            const marginDir = options.rtl ? 'marginRight' : 'marginLeft';
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
                if (!core.isReadOnly) {
                    for (let c = 0, name; c < cLen; c++) {
                        name = activePlugins[c];
                        if (commandMapNodes.indexOf(name) === -1 && plugins[name].active.call(core, element)) {
                            commandMapNodes.push(name);
                        }
                    }
                }

                if (!core.isReadOnly && util.isFormatElement(element)) {
                    /* Outdent */
                    if (commandMapNodes.indexOf('OUTDENT') === -1 && commandMap.OUTDENT) {
                        if (util.isListCell(element) || (element.style[marginDir] && util.getNumber(element.style[marginDir], 0) > 0)) {
                            commandMapNodes.push('OUTDENT');
                            commandMap.OUTDENT.removeAttribute('disabled');
                        }
                    }

                    /* Indent */
                    if (commandMapNodes.indexOf('INDENT') === -1 && commandMap.INDENT) {
                        commandMapNodes.push('INDENT');
                        if (util.isListCell(element) && !element.previousElementSibling) {
                            commandMap.INDENT.setAttribute('disabled', true);
                        } else {
                            commandMap.INDENT.removeAttribute('disabled');
                        }
                    }

                    continue;
                }

                /** default active buttons [strong, ins, em, del, sub, sup] */
                if (classOnCheck.test(nodeName)) {
                    commandMapNodes.push(nodeName);
                    util.addClass(commandMap[nodeName], 'active');
                }
            }

            core._setKeyEffect(commandMapNodes);

            /** save current nodes */
            core._variable.currentNodes = currentNodes.reverse();
            core._variable.currentNodesMap = commandMapNodes;

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
            core.controllersOff();

            while (target.parentNode && !command && !/se-menu-list/.test(className) && !/se-toolbar/.test(className)) {
                target = target.parentNode;
                command = target.getAttribute('data-command');
                display = target.getAttribute('data-display');
                className = target.className;
            }

            if (!command && !display) return;
            if (target.disabled) return;
            if (!core.isReadOnly && !core.hasFocus) core.nativeFocus();
            if (!core.isReadOnly && !core._variable.isCodeView) core._editorRange();

            core.actionCall(command, display, target);
        },

        onMouseDown_wysiwyg: function (e) {
            if (core.isReadOnly || util.isNonEditable(context.element.wysiwyg)) return;

            // user event
            if (typeof functions.onMouseDown === 'function' && functions.onMouseDown(e, core) === false) return;
            
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

            if (/FIGURE/i.test(e.target.nodeName)) e.preventDefault();
        },

        onClick_wysiwyg: function (e) {
            const targetElement = e.target;

            if (core.isReadOnly) {
                e.preventDefault();
                if (util.isAnchor(targetElement)){
                    _w.open(targetElement.href, targetElement.target);
                }
                return false;
            }

            if (util.isNonEditable(context.element.wysiwyg)) return;

            // user event
            if (typeof functions.onClick === 'function' && functions.onClick(e, core) === false) return;

            const fileComponentInfo = core.getFileComponent(targetElement);
            if (fileComponentInfo) {
                e.preventDefault();
                core.selectComponent(fileComponentInfo.target, fileComponentInfo.pluginName);
                return;
            }

            const figcaption = util.getParentElement(targetElement, 'FIGCAPTION');
            if (util.isNonEditable(figcaption)) {
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
            if (!formatEl && !util.isNonEditable(targetElement) && !util.isList(rangeEl)) {
                const range = core.getRange();
                if (util.getFormatElement(range.startContainer) === util.getFormatElement(range.endContainer)) {
                    if (util.isList(rangeEl)) {
                        e.preventDefault();
                        const oLi = util.createElement('LI');
                        const prevLi = selectionNode.nextElementSibling;
                        oLi.appendChild(selectionNode);
                        rangeEl.insertBefore(oLi, prevLi);
                        core.focus();
                    } else if (!util.isWysiwygDiv(selectionNode) && !util.isComponent(selectionNode) && (!util.isTable(selectionNode) || util.isCell(selectionNode)) && core._setDefaultFormat(util.isRangeFormatElement(rangeEl) ? 'DIV' : options.defaultTag) !== null) {
                        e.preventDefault();
                        core.focus();
                    } else {
                        event._applyTagEffects();
                    }
                }
            } else {
                event._applyTagEffects();
            }

            if (core._isBalloon) _w.setTimeout(event._toggleToolbarBalloon);
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
            if (core._bindControllersOff || (!core._isBalloonAlways && range.collapsed)) event._hideToolbar();
            else event._showToolbarBalloon(range);
        },

        _showToolbarBalloon: function (rangeObj) {
            if (!core._isBalloon) return;

            const range = rangeObj || core.getRange();
            const toolbar = context.element.toolbar;
            const topArea = context.element.topArea;
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

            const globalScroll = core.getGlobalScrollOffset();
            let scrollLeft = globalScroll.left;
            let scrollTop = globalScroll.top;

            const editorWidth = topArea.offsetWidth;
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
                    core.insertNode(zeroWidth, null, false);
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

            if (options.toolbarContainer) {
                const editorParent = topArea.parentElement;

                let container = options.toolbarContainer;
                let left = container.offsetLeft;
                let top = container.offsetTop;

                while(!container.parentElement.contains(editorParent) || !/^(BODY|HTML)$/i.test(container.parentElement.nodeName)) {
                    container = container.offsetParent;
                    left += container.offsetLeft;
                    top += container.offsetTop;
                }

                toolbar.style.left = (toolbar.offsetLeft - left + topArea.offsetLeft) + 'px';
                toolbar.style.top = (toolbar.offsetTop - top + topArea.offsetTop) + 'px';
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
            if (core.isReadOnly || core.isDisabled) {
                e.preventDefault();
                e.stopPropagation();
                core.history.go(core.history.getCurrentIndex());
                return false;
            }

            core._editorRange();

            // user event
            if (typeof functions.onInput === 'function' && functions.onInput(e, core) === false) return;

            const data = (e.data === null ? '' : e.data === undefined ? ' ' : e.data) || '';       
            if (!core._charCount(data)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // history stack
            core.history.push(true);
        },

        _isUneditableNode: function (range, isFront) {
            const container = isFront ? range.startContainer : range.endContainer;
            const offset = isFront ? range.startOffset : range.endOffset;
            const siblingKey = isFront ? 'previousSibling' : 'nextSibling';
            const isElement = container.nodeType === 1;
            let siblingNode;

            if (isElement) {
                siblingNode = event._isUneditableNode_getSibling(container.childNodes[offset], siblingKey, container);
                return siblingNode && siblingNode.nodeType === 1 && siblingNode.getAttribute('contenteditable') === 'false';
            } else {
                siblingNode = event._isUneditableNode_getSibling(container, siblingKey, container);
                return core.isEdgePoint(container, offset, isFront ? 'front' : 'end') && (siblingNode && siblingNode.nodeType === 1 && siblingNode.getAttribute('contenteditable') === 'false');
            }
        },

        _isUneditableNode_getSibling: function (selectNode, siblingKey, container) {
            if (!selectNode) return null;
            let siblingNode = selectNode[siblingKey];

            if (!siblingNode) {
                siblingNode = util.getFormatElement(container);
                siblingNode = siblingNode ? siblingNode[siblingKey] : null;
                if (siblingNode && !util.isComponent(siblingNode)) siblingNode = siblingKey === 'previousSibling' ? siblingNode.firstElementChild : siblingNode.lastElementChild;
                else return null;
            }

            return siblingNode;
        },

        _onShortcutKey: false,
        onKeyDown_wysiwyg: function (e) {
            const keyCode = e.keyCode;
            const shift = e.shiftKey;
            const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92 || keyCode === 224;
            const alt = e.altKey;
            event._IEisComposing = keyCode === 229;

            if (!ctrl && core.isReadOnly && !event._directionKeyCode.test(keyCode)) {
                e.preventDefault();
                return false;
            }

            core.submenuOff();

            if (core._isBalloon) {
                event._hideToolbar();
            }

            // user event
            if (typeof functions.onKeyDown === 'function' && functions.onKeyDown(e, core) === false) return;

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

                    if (selectRange && event._hardDelete()) {
                        e.preventDefault();
                        e.stopPropagation();
                        break;
                    }

                    if (!util.isFormatElement(formatEl) && !context.element.wysiwyg.firstElementChild && !util.isComponent(selectionNode) && core._setDefaultFormat(options.defaultTag) !== null) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }

                    if (!selectRange && !formatEl.previousElementSibling && (range.startOffset === 0 && !selectionNode.previousSibling && !util.isListCell(formatEl) && 
                     (util.isFormatElement(formatEl) && (!util.isFreeFormatElement(formatEl) || util.isClosureFreeFormatElement(formatEl))))) {
                        // closure range
                        if (util.isClosureRangeFormatElement(formatEl.parentNode)) {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        }
                        // maintain default format
                        if (util.isWysiwygDiv(formatEl.parentNode) && formatEl.childNodes.length <= 1 && (!formatEl.firstChild || util.onlyZeroWidthSpace(formatEl.textContent))) {
                            e.preventDefault();
                            e.stopPropagation();

                            if (formatEl.nodeName.toUpperCase() === options.defaultTag.toUpperCase()) {
                                formatEl.innerHTML = '<br>';
                                const attrs = formatEl.attributes;
                                while (attrs[0]) {
                                    formatEl.removeAttribute(attrs[0].name);
                                }
                            } else {
                                const defaultFormat = util.createElement(options.defaultTag);
                                defaultFormat.innerHTML = '<br>';
                                formatEl.parentElement.replaceChild(defaultFormat, formatEl);
                            }

                            core.nativeFocus();
                            return false;
                        }
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

                    // tag[contenteditable="false"]
                    if (event._isUneditableNode(range, true)) {
                        e.preventDefault();
                        e.stopPropagation();
                        break;
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
                    if (!selectRange && formatEl && (range.startOffset === 0 || (selectionNode === formatEl ? !!formatEl.childNodes[range.startOffset] : false))) {
                        const sel = selectionNode === formatEl ? formatEl.childNodes[range.startOffset] : selectionNode;
                        const prev = formatEl.previousSibling;
                        // select file component
                        const ignoreZWS = (commonCon.nodeType === 3 || util.isBreak(commonCon)) && !commonCon.previousSibling && range.startOffset === 0;
                        if (!sel.previousSibling && (util.isComponent(commonCon.previousSibling) || (ignoreZWS && util.isComponent(prev)))) {
                            const fileComponentInfo = core.getFileComponent(prev);
                            if (fileComponentInfo) {
                                e.preventDefault();
                                e.stopPropagation();
                                if (formatEl.textContent.length === 0) util.removeItem(formatEl);
                                if (core.selectComponent(fileComponentInfo.target, fileComponentInfo.pluginName) === false) core.blur();
                            } else if (util.isComponent(prev)) {
                                e.preventDefault();
                                e.stopPropagation();
                                util.removeItem(prev);
                            }
                            break;
                        }
                        // delete nonEditable
                        if (util.isNonEditable(sel.previousSibling)) {
                            e.preventDefault();
                            e.stopPropagation();
                            util.removeItem(sel.previousSibling);
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

                    if (selectRange && event._hardDelete()) {
                        e.preventDefault();
                        e.stopPropagation();
                        break;
                    }

                    // tag[contenteditable="false"]
                    if (event._isUneditableNode(range, false)) {
                        e.preventDefault();
                        e.stopPropagation();
                        break;
                    }

                    // component
                    if ((util.isFormatElement(selectionNode) || selectionNode.nextSibling === null || (util.onlyZeroWidthSpace(selectionNode.nextSibling) && selectionNode.nextSibling.nextSibling === null)) && range.startOffset === selectionNode.textContent.length) {
                        const nextEl = formatEl.nextElementSibling;
                        if (!nextEl) break;
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

                            // select file component
                            const fileComponentInfo = core.getFileComponent(nextEl);
                            if (fileComponentInfo) {
                                e.stopPropagation();
                                if (core.selectComponent(fileComponentInfo.target, fileComponentInfo.pluginName) === false) core.blur();
                            } else if (util.isComponent(nextEl)) {
                                e.stopPropagation();
                                util.removeItem(nextEl);
                            }

                            break;
                        }
                    }

                    if (!selectRange && (core.isEdgePoint(range.endContainer, range.endOffset) || (selectionNode === formatEl ? !!formatEl.childNodes[range.startOffset] : false))) {
                        const sel = selectionNode === formatEl ? formatEl.childNodes[range.startOffset] || selectionNode : selectionNode;
                        // delete nonEditable
                        if (sel && util.isNonEditable(sel.nextSibling)) {
                            e.preventDefault();
                            e.stopPropagation();
                            util.removeItem(sel.nextSibling);
                            break;
                        } else if (util.isComponent(sel)) {
                            e.preventDefault();
                            e.stopPropagation();
                            util.removeItem(sel);
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
                                const textRange = core.insertNode(tabText, null, true);
                                if (!textRange) return false;
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

                    if (core._charTypeHTML) {
                        let enterHTML = '';
                        if ((!shift && freeFormatEl) || shift) {
                            enterHTML = '<br>';
                        } else {
                            enterHTML = '<' + formatEl.nodeName + '><br></' + formatEl.nodeName + '>';
                        }

                        if (!core.checkCharCount(enterHTML, 'byte-html')) {
                            e.preventDefault();
                            return false;
                        }
                    }

                    if (!shift) {
                        const formatInners = core._isEdgeFormat(range.endContainer, range.endOffset, 'end');
                        if ((formatInners && /^H[1-6]$/i.test(formatEl.nodeName)) || /^HR$/i.test(formatEl.nodeName)) {
                            e.preventDefault();
                            let temp = null;
                            const newFormat = core.appendFormatTag(formatEl, options.defaultTag);

                            if (formatInners && formatInners.length > 0) {
                                temp = formatInners.pop();
                                const innerNode = temp;
                                while(formatInners.length > 0) {
                                    temp = temp.appendChild(formatInners.pop());
                                }
                                newFormat.appendChild(innerNode);
                            }

                            temp = !temp ? newFormat.firstChild : temp.appendChild(newFormat.firstChild);
                            core.setRange(temp, 0, temp, 0);
                            break;
                        }

                        if (freeFormatEl) {
                            e.preventDefault();
                            const selectionFormat = selectionNode === freeFormatEl;
                            const wSelection = core.getSelection();
                            const children = selectionNode.childNodes, offset = wSelection.focusOffset, prev = selectionNode.previousElementSibling, next = selectionNode.nextSibling;
    
                            if (!util.isClosureFreeFormatElement(freeFormatEl) && !!children && ((selectionFormat && range.collapsed && children.length - 1 <= offset + 1 && util.isBreak(children[offset]) && (!children[offset + 1] || ((!children[offset + 2] || util.onlyZeroWidthSpace(children[offset + 2].textContent)) && children[offset + 1].nodeType === 3 && util.onlyZeroWidthSpace(children[offset + 1].textContent))) &&  offset > 0 && util.isBreak(children[offset - 1])) ||
                              (!selectionFormat && util.onlyZeroWidthSpace(selectionNode.textContent) && util.isBreak(prev) && (util.isBreak(prev.previousSibling) || !util.onlyZeroWidthSpace(prev.previousSibling.textContent)) && (!next || (!util.isBreak(next) && util.onlyZeroWidthSpace(next.textContent)))))) {
                                if (selectionFormat) util.removeItem(children[offset - 1]);
                                else util.removeItem(selectionNode);
                                const newEl = core.appendFormatTag(freeFormatEl, (util.isFormatElement(freeFormatEl.nextElementSibling) && !util.isRangeFormatElement(freeFormatEl.nextElementSibling)) ? freeFormatEl.nextElementSibling : null);
                                util.copyFormatAttributes(newEl, freeFormatEl);
                                core.setRange(newEl, 1, newEl, 1);
                                break;
                            }
                            
                            if (selectionFormat) {
                                functions.insertHTML(((range.collapsed && util.isBreak(range.startContainer.childNodes[range.startOffset - 1])) ? '<br>' : '<br><br>'), true, false);
    
                                let focusNode = wSelection.focusNode;
                                const wOffset = wSelection.focusOffset;
                                if (freeFormatEl === focusNode) {
                                    focusNode = focusNode.childNodes[wOffset - offset > 1 ? wOffset - 1 : wOffset];
                                }
    
                                core.setRange(focusNode, 1, focusNode, 1);
                            } else {
                                const focusNext = wSelection.focusNode.nextSibling;
                                const br = util.createElement('BR');
                                core.insertNode(br, null, false);
    
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
                    }

                    if (selectRange) break;
                    
                    if (rangeEl && formatEl && !util.isCell(rangeEl) && !/^FIGCAPTION$/i.test(rangeEl.nodeName)) {
                        const range = core.getRange();
                        if(core.isEdgePoint(range.endContainer, range.endOffset) && util.isList(selectionNode.nextSibling)) {
                            e.preventDefault();
                            const newEl = util.createElement('LI');
                            const br = util.createElement('BR');
                            newEl.appendChild(br);

                            formatEl.parentNode.insertBefore(newEl, formatEl.nextElementSibling);
                            newEl.appendChild(selectionNode.nextSibling);
                            
                            core.setRange(br, 1, br, 1);
                            break;
                        }

                        if ((range.commonAncestorContainer.nodeType === 3 ? !range.commonAncestorContainer.nextElementSibling : true) && util.onlyZeroWidthSpace(formatEl.innerText.trim())) {
                            e.preventDefault();
                            let newEl = null;

                            if (util.isListCell(rangeEl.parentNode)) {
                                rangeEl = formatEl.parentNode.parentNode.parentNode;
                                newEl = util.splitElement(formatEl, null, util.getElementDepth(formatEl) - 2);
                                if (!newEl) {
                                    const newListCell = util.createElement('LI');
                                    newListCell.innerHTML = '<br>';
                                    rangeEl.insertBefore(newListCell, newEl);
                                    newEl = newListCell;
                                }
                            } else {
                                const newFormat = util.isCell(rangeEl.parentNode) ? 'DIV' : util.isList(rangeEl.parentNode) ? 'LI' : (util.isFormatElement(rangeEl.nextElementSibling) && !util.isRangeFormatElement(rangeEl.nextElementSibling)) ? rangeEl.nextElementSibling.nodeName : (util.isFormatElement(rangeEl.previousElementSibling) && !util.isRangeFormatElement(rangeEl.previousElementSibling)) ? rangeEl.previousElementSibling.nodeName : options.defaultTag;
                                newEl = util.createElement(newFormat);
                                const edge = core.detachRangeFormatElement(rangeEl, [formatEl], null, true, true);
                                edge.cc.insertBefore(newEl, edge.ec);
                            }
                            
                            newEl.innerHTML = '<br>';
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
                            newEl = util.createElement((util.isFormatElement(sibling) && !util.isRangeFormatElement(sibling)) ? sibling.nodeName : options.defaultTag);
                            newEl.innerHTML = '<br>';
                        }

                        container.parentNode.insertBefore(newEl, container);
                        
                        core.callPlugin(fileComponentName, function () {
                            if (core.selectComponent(compContext._element, fileComponentName) === false) core.blur();
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

            if (shift && keyCode === 16) {
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
            } else if (shift && (util.isOSX_IOS ? alt : ctrl) && keyCode === 32) {
                e.preventDefault();
                e.stopPropagation();
                const nbsp = core.insertNode(util.createTextNode('\u00a0'));
                if (nbsp && nbsp.container) {
                    core.setRange(nbsp.container, nbsp.endOffset, nbsp.container, nbsp.endOffset);
                    return;
                }
            }

            const textKey = !ctrl && !alt && !selectRange && !event._nonTextKeyCode.test(keyCode);
            if (textKey && range.collapsed && range.startContainer === range.endContainer && util.isBreak(range.commonAncestorContainer)) {
                const zeroWidth = util.createTextNode(util.zeroWidthSpace);
                core.insertNode(zeroWidth, null, false);
                core.setRange(zeroWidth, 1, zeroWidth, 1);
            }
        },

        onKeyUp_wysiwyg: function (e) {
            if (event._onShortcutKey) return;

            core._editorRange();
            const keyCode = e.keyCode;
            const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92 || keyCode === 224;
            const alt = e.altKey;

            if (core.isReadOnly) {
                if (!ctrl && event._directionKeyCode.test(keyCode)) event._applyTagEffects();
                return;
            }

            const range = core.getRange();
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

                const oFormatTag = util.createElement(util.isFormatElement(core._variable.currentNodes[0]) ? core._variable.currentNodes[0] : options.defaultTag);
                oFormatTag.innerHTML = '<br>';

                selectionNode.appendChild(oFormatTag);
                core.setRange(oFormatTag, 0, oFormatTag, 0);
                event._applyTagEffects();

                core.history.push(false);
                return;
            }

            const formatEl = util.getFormatElement(selectionNode, null);
            const rangeEl = util.getRangeFormatElement(selectionNode, null);
            if (!formatEl && range.collapsed && !util.isComponent(selectionNode) && !util.isList(selectionNode) && core._setDefaultFormat(util.isRangeFormatElement(rangeEl) ? 'DIV' : options.defaultTag) !== null) {
                selectionNode = core.getSelectionNode();
            }

            if (event._directionKeyCode.test(keyCode)) {
                event._applyTagEffects();
            }

            const textKey = !ctrl && !alt && !event._nonTextKeyCode.test(keyCode);
            if (textKey && selectionNode.nodeType === 3 && util.zeroWidthRegExp.test(selectionNode.textContent) && !(e.isComposing !== undefined ? e.isComposing : event._IEisComposing)) {
                let so = range.startOffset, eo = range.endOffset;
                const frontZeroWidthCnt = (selectionNode.textContent.substring(0, eo).match(event._frontZeroWidthReg) || '').length;
                so = range.startOffset - frontZeroWidthCnt;
                eo = range.endOffset - frontZeroWidthCnt;
                selectionNode.textContent = selectionNode.textContent.replace(util.zeroWidthRegExp, '');
                core.setRange(selectionNode, so < 0 ? 0 : so, selectionNode, eo < 0 ? 0 : eo);
            }

            core._charCount('');

            // user event
            if (typeof functions.onKeyUp === 'function' && functions.onKeyUp(e, core) === false) return;

            // history stack
            if (!ctrl && !alt && !event._historyIgnoreKeyCode.test(keyCode)) {
                core.history.push(true);
            }
        },

        onScroll_wysiwyg: function (e) {
            core.controllersOff();
            if (core._isBalloon) event._hideToolbar();

            // user event
            if (typeof functions.onScroll === 'function') functions.onScroll(e, core);
        },

        onFocus_wysiwyg: function (e) {
            if (core._antiBlur) return;
            core.hasFocus = true;
            event._applyTagEffects();
            
            if (core._isInline) event._showToolbarInline();

            // user event
            if (typeof functions.onFocus === 'function') functions.onFocus(e, core);
        },

        onBlur_wysiwyg: function (e) {
            if (core._antiBlur || core._variable.isCodeView) return;
            core.hasFocus = false;
            core.controllersOff();
            if (core._isInline || core._isBalloon) event._hideToolbar();

            core._setKeyEffect([]);

            core._variable.currentNodes = [];
            core._variable.currentNodesMap = [];
            if (options.showPathLabel) context.element.navigation.textContent = '';

            // user event
            if (typeof functions.onBlur === 'function') functions.onBlur(e, core);
        },

        onMouseDown_resizingBar: function (e) {
            e.stopPropagation();

            core.submenuOff();
            core.controllersOff();

            const prevHeight = util.getNumber(context.element.wysiwygFrame.style.height, 0);
            core._variable.resizeClientY = e.clientY;
            context.element.resizeBackground.style.display = 'block';

            function closureFunc() {
                context.element.resizeBackground.style.display = 'none';
                _d.removeEventListener('mousemove', event._resize_editor);
                _d.removeEventListener('mouseup', closureFunc);
                if (typeof functions.onResizeEditor === 'function') functions.onResizeEditor(util.getNumber(context.element.wysiwygFrame.style.height, 0), prevHeight, core);
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
                let w = 0;
                if ((core._isBalloon || core._isInline) && options.toolbarWidth === 'auto') {
                    w = context.element.topArea.offsetWidth;
                } else {
                    w = context.element.toolbar.offsetWidth;
                }

                let responsiveWidth = 'default';
                for (let i = 1, len = responsiveSize.length; i < len; i++) {
                    if (w < responsiveSize[i]) {
                        responsiveWidth = responsiveSize[i] + '';
                        break;
                    }
                }

                if (event._responsiveCurrentSize !== responsiveWidth) {
                    event._responsiveCurrentSize = responsiveWidth;
                    functions.setToolbarButtons(event._responsiveButtons[responsiveWidth]);
                }
            }

            if (context.element.toolbar.offsetWidth === 0) return;

            if (context.fileBrowser && context.fileBrowser.area.style.display === 'block') {
                context.fileBrowser.body.style.maxHeight = (_w.innerHeight - context.fileBrowser.header.offsetHeight - 50) + 'px';
            }

            if (core.submenuActiveButton && core.submenu) {
                core._setMenuPosition(core.submenuActiveButton, core.submenu);
            }

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
            const inlineOffset = core._isInline && (y - editorTop) > 0 ? y - editorTop - context.element.toolbar.offsetHeight : 0;
            
            if (y < editorTop) {
                event._offStickyToolbar();
            }
            else if (y + core._variable.minResizingSize >= editorHeight + editorTop) {
                if (!core._sticky) event._onStickyToolbar(inlineOffset);
                element.toolbar.style.top = (inlineOffset + editorHeight + editorTop + options.stickyToolbar - y - core._variable.minResizingSize) + 'px';
            }
            else if (y >= editorTop) {
                event._onStickyToolbar(inlineOffset);
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

        _onStickyToolbar: function (inlineOffset) {
            const element = context.element;

            if (!core._isInline && !options.toolbarContainer) {
                element._stickyDummy.style.height = element.toolbar.offsetHeight + 'px';
                element._stickyDummy.style.display = 'block';
            }

            element.toolbar.style.top = (options.stickyToolbar + inlineOffset) + 'px';
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

        // FireFox - table delete, Chrome - image, video, audio
        _hardDelete: function () {
            const range = core.getRange();
            const sc = range.startContainer;
            const ec = range.endContainer;
            
            // table
            const sCell = util.getRangeFormatElement(sc);
            const eCell = util.getRangeFormatElement(ec);
            const sIsCell = util.isCell(sCell);
            const eIsCell = util.isCell(eCell);
            const ancestor = range.commonAncestorContainer;
            if (((sIsCell && !sCell.previousElementSibling && !sCell.parentElement.previousElementSibling) || (eIsCell && !eCell.nextElementSibling && !eCell.parentElement.nextElementSibling)) && sCell !== eCell) {
                if (!sIsCell) {
                    util.removeItem(util.getParentElement(eCell, function(current) {return ancestor === current.parentNode;}));
                } else if (!eIsCell) {
                    util.removeItem(util.getParentElement(sCell, function(current) {return ancestor === current.parentNode;}));
                } else {
                    util.removeItem(util.getParentElement(sCell, function(current) {return ancestor === current.parentNode;}));
                    core.nativeFocus();
                    return true;
                }
            }

            // component
            const sComp = sc.nodeType === 1 ? util.getParentElement(sc, '.se-component') : null;
            const eComp = ec.nodeType === 1 ? util.getParentElement(ec, '.se-component') : null;
            if (sComp) util.removeItem(sComp);
            if (eComp) util.removeItem(eComp);

            return false;
        },

        onPaste_wysiwyg: function (e) {
            const clipboardData = util.isIE ? _w.clipboardData : e.clipboardData;
            if (!clipboardData) return true;
            return event._dataTransferAction('paste', e, clipboardData);
        },

        _setClipboardComponent: function (e, info, clipboardData) {
            e.preventDefault();
            e.stopPropagation();
            clipboardData.setData('text/html', info.component.outerHTML);
        },

        onCopy_wysiwyg: function (e) {
            const clipboardData = util.isIE ? _w.clipboardData : e.clipboardData;
            
            // user event
            if (typeof functions.onCopy === 'function' && !functions.onCopy(e, clipboardData, core)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            const info = core.currentFileComponentInfo;
            if (info && !util.isIE) {
                event._setClipboardComponent(e, info, clipboardData);
                util.addClass(info.component, 'se-component-copy');
                // copy effect
                _w.setTimeout(function () {
                    util.removeClass(info.component, 'se-component-copy');
                }, 150);
            }
        },

        onCut_wysiwyg: function (e) {
            const clipboardData = util.isIE ? _w.clipboardData : e.clipboardData;

            // user event
            if (typeof functions.onCut === 'function' && !functions.onCut(e, clipboardData, core)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            const info = core.currentFileComponentInfo;
            if (info && !util.isIE) {
                event._setClipboardComponent(e, info, clipboardData);
                util.removeItem(info.component);
                core.controllersOff();
            }

            _w.setTimeout(function () {
                // history stack
                core.history.push(false);
            });
        },

        onDrop_wysiwyg: function (e) {
            if (core.isReadOnly || util.isIE) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            const dataTransfer = e.dataTransfer;
            if (!dataTransfer) return true;

            core.removeNode();
            event._setDropLocationSelection(e);
            return event._dataTransferAction('drop', e, dataTransfer);
        },

        _setDropLocationSelection: function (e) {
            if (e.rangeParent) {
                core.setRange(e.rangeParent, e.rangeOffset, e.rangeParent, e.rangeOffset);
            } else if (core._wd.caretRangeFromPoint) {
                const r = core._wd.caretRangeFromPoint(e.clientX, e.clientY);
                core.setRange(r.startContainer, r.startOffset, r.endContainer, r.endOffset);
            } else {
                const r = core.getRange();
                core.setRange(r.startContainer, r.startOffset, r.endContainer, r.endOffset);
            }
        },

        _dataTransferAction: function (type, e, data) {
            let plainText, cleanData;
            if (util.isIE) {
                plainText = data.getData('Text');
                
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

                _w.setTimeout(function () {
                    cleanData = tempDiv.innerHTML;
                    util.removeItem(tempDiv);
                    core.setRange(tempRange.sc, tempRange.so, tempRange.ec, tempRange.eo);
                    event._setClipboardData(type, e, plainText, cleanData, data);
                });

                return true;
            } else {
                plainText = data.getData('text/plain');
                cleanData = data.getData('text/html');
                if (event._setClipboardData(type, e, plainText, cleanData, data) === false) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }
        },

        _setClipboardData: function (type, e, plainText, cleanData, data) {
            // MS word, OneNode, Excel
            const MSData = /class=["']*Mso(Normal|List)/i.test(cleanData) || /content=["']*Word.Document/i.test(cleanData) || /content=["']*OneNote.File/i.test(cleanData) || /content=["']*Excel.Sheet/i.test(cleanData);
            const onlyText = !cleanData;

            if (!onlyText) {
                if (MSData) {
                    cleanData = cleanData.replace(/\n/g, ' ');
                    plainText = plainText.replace(/\n/g, ' ');
                } else {
                    cleanData = (plainText === cleanData ? plainText : cleanData).replace(/\n/g, '<br>');
                }
                cleanData = core.cleanHTML(cleanData, core.pasteTagsWhitelistRegExp);
            } else {
                cleanData = util._HTMLConvertor(plainText).replace(/\n/g, '<br>');
            }

            const maxCharCount = core._charCount(core._charTypeHTML ? cleanData : plainText);
            // user event - paste
            if (type === 'paste' && typeof functions.onPaste === 'function') {
                const value = functions.onPaste(e, cleanData, maxCharCount, core);
                if (!value) return false;
                if (typeof value === 'string') cleanData = value;
            }
            // user event - drop
            if (type === 'drop' && typeof functions.onDrop === 'function') {
                const value = functions.onDrop(e, cleanData, maxCharCount, core);
                if (!value) return false;
                if (typeof value === 'string') cleanData = value;
            }

            // files
            const files = data.files;
            if (files.length > 0 && !MSData) {
                if (/^image/.test(files[0].type) && core.plugins.image) {
                    functions.insertImage(files);
                }
                return false;
            }

            if (!maxCharCount) {
                return false;
            }

            if (cleanData) {
                functions.insertHTML(cleanData, true, false);
                return false;
            }
        },

        onMouseMove_wysiwyg: function (e) {
            if (core.isDisabled || core.isReadOnly) return false;
            const component = util.getParentElement(e.target, util.isComponent);
            const lineBreakerStyle = core._lineBreaker.style;
            
            if (component && !core.currentControllerName) {
                const ctxEl = context.element;
                let scrollTop = 0;
                let el = ctxEl.wysiwyg;
                do {
                    scrollTop += el.scrollTop;
                    el = el.parentElement;
                } while (el && !/^(BODY|HTML)$/i.test(el.nodeName));

                const wScroll = ctxEl.wysiwyg.scrollTop;
                const offsets = event._getEditorOffsets(null);
                const componentTop = util.getOffset(component, ctxEl.wysiwygFrame).top + wScroll;
                const y = e.pageY + scrollTop + (options.iframe && !options.toolbarContainer ? ctxEl.toolbar.offsetHeight : 0);
                const c = componentTop + (options.iframe ? scrollTop : offsets.top);

                const isList = util.isListCell(component.parentNode);
                let dir = '', top = '';
                if ((isList ? !component.previousSibling : !util.isFormatElement(component.previousElementSibling)) && y < (c + 20)) {
                    top = componentTop;
                    dir = 't';
                } else if ((isList ? !component.nextSibling : !util.isFormatElement(component.nextElementSibling)) && y > (c + component.offsetHeight - 20)) {
                    top = componentTop + component.offsetHeight;
                    dir = 'b';
                } else {
                    lineBreakerStyle.display = 'none';
                    return;
                }

                core._variable._lineBreakComp = component;
                core._variable._lineBreakDir = dir;
                lineBreakerStyle.top = (top - wScroll) + 'px';
                core._lineBreakerButton.style.left = (util.getOffset(component).left + (component.offsetWidth / 2) - 15) + 'px';
                lineBreakerStyle.display = 'block';
            } // off line breaker
            else if (lineBreakerStyle.display !== 'none') {
                lineBreakerStyle.display = 'none';
            }
        },

        _onMouseDown_lineBreak: function (e) {
            e.preventDefault();
        },

        _onLineBreak: function (e) {
            e.preventDefault();
            
            const component = core._variable._lineBreakComp;
            const dir = !this ? core._variable._lineBreakDir : this;
            const isList = util.isListCell(component.parentNode);

            const format = util.createElement(isList ? 'BR' : util.isCell(component.parentNode) ? 'DIV' : options.defaultTag);
            if (!isList) format.innerHTML = '<br>';

            if (core._charTypeHTML && !core.checkCharCount(format.outerHTML, 'byte-html')) return;

            component.parentNode.insertBefore(format, dir === 't' ? component : component.nextSibling);
            core._lineBreaker.style.display = 'none';
            core._variable._lineBreakComp = null;

            const focusEl = isList ? format : format.firstChild;
            core.setRange(focusEl, 1, focusEl, 1);
            // history stack
            core.history.push(false);
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
            eventWysiwyg.addEventListener('copy', event.onCopy_wysiwyg, false);
            eventWysiwyg.addEventListener('cut', event.onCut_wysiwyg, false);
            eventWysiwyg.addEventListener('drop', event.onDrop_wysiwyg, false);
            eventWysiwyg.addEventListener('scroll', event.onScroll_wysiwyg, false);
            eventWysiwyg.addEventListener('focus', event.onFocus_wysiwyg, false);
            eventWysiwyg.addEventListener('blur', event.onBlur_wysiwyg, false);

            /** line breaker */
            event._lineBreakerBind = { a: event._onLineBreak.bind(''), t: event._onLineBreak.bind('t'), b: event._onLineBreak.bind('b') };
            eventWysiwyg.addEventListener('mousemove', event.onMouseMove_wysiwyg, false);
            core._lineBreakerButton.addEventListener('mousedown', event._onMouseDown_lineBreak, false);
            core._lineBreakerButton.addEventListener('click', event._lineBreakerBind.a, false);
            context.element.lineBreaker_t.addEventListener('mousedown', event._lineBreakerBind.t, false);
            context.element.lineBreaker_b.addEventListener('mousedown', event._lineBreakerBind.b, false);

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
            eventWysiwyg.removeEventListener('copy', event.onCopy_wysiwyg);
            eventWysiwyg.removeEventListener('cut', event.onCut_wysiwyg);
            eventWysiwyg.removeEventListener('drop', event.onDrop_wysiwyg);
            eventWysiwyg.removeEventListener('scroll', event.onScroll_wysiwyg);

            eventWysiwyg.removeEventListener('mousemove', event.onMouseMove_wysiwyg);
            core._lineBreakerButton.removeEventListener('mousedown', event._onMouseDown_lineBreak);
            core._lineBreakerButton.removeEventListener('click', event._lineBreakerBind.a);
            context.element.lineBreaker_t.removeEventListener('mousedown', event._lineBreakerBind.t);
            context.element.lineBreaker_b.removeEventListener('mousedown', event._lineBreakerBind.b);
            event._lineBreakerBind = null;
            
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

            event._responsiveCurrentSize = 'default';
            const sizeArray = event._responsiveButtonSize = [];
            const buttonsObj = event._responsiveButtons = {default: _responsiveButtons[0]};
            for (let i = 1, len = _responsiveButtons.length, size, buttonGroup; i < len; i++) {
                buttonGroup = _responsiveButtons[i];
                size = buttonGroup[0] * 1;
                sizeArray.push(size);
                buttonsObj[size] = buttonGroup[1];
            }

            sizeArray.sort(function (a, b) { return a - b; }).unshift('default');
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
        onCopy: null,
        onCut: null,
        onFocus: null,
        onBlur: null,

        /**
         * @description Event functions
         * @param {String} contents Current contents
         * @param {Object} core Core object
         */
        onChange: null,

        /**
         * @description Event functions (drop, paste)
         * When false is returned, the default behavior is stopped.
         * If the string is returned, the cleanData value is modified to the return value.
         * @param {Object} e Event object.
         * @param {String} cleanData HTML string modified for editor format.
         * @param {Boolean} maxChartCount option (true if max character is exceeded)
         * @param {Object} core Core object
         * @returns {Boolean|String}
         */
        onDrop: null,
        onPaste: null,

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
         * @description An event when toggling between code view and wysiwyg view.
         * @param {Boolean} isCodeView Whether the current code view mode
         * @param {Object} core Core object
         */
        toggleCodeView: null,

        /**
         * @description An event when toggling full screen.
         * @param {Boolean} isFullScreen Whether the current full screen mode
         * @param {Object} core Core object
         */
        toggleFullScreen: null,

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
         * @description It replaces the default callback function of the video upload
         * @param xmlHttp xmlHttpRequest object
         * @param info Input information
         * - inputWidth: Value of width input
         * - inputHeight: Value of height input
         * - align: Align Check Value
         * - isUpdate: Update video if true, create video if false
         * - element: If isUpdate is true, the currently selected video.
         * @param core Core object
         */
        videoUploadHandler: null,

        /**
         * @description It replaces the default callback function of the audio upload
         * @param xmlHttp xmlHttpRequest object
         * @param info Input information
         * - isUpdate: Update audio if true, create audio if false
         * - element: If isUpdate is true, the currently selected audio.
         * @param core Core object
         */
        audioUploadHandler: null,

        /**
         * @description Called before the image is uploaded
         * If true is returned, the internal upload process runs normally.
         * If false is returned, no image upload is performed.
         * If new fileList are returned,  replaced the previous fileList
         * If undefined is returned, it waits until "uploadHandler" is executed.
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
         * @param {Function} uploadHandler If undefined is returned, it waits until "uploadHandler" is executed.
         *                "uploadHandler" is an upload function with "core" and "info" bound.
         *                [upload files] : uploadHandler(files or [new File(...),])
         *                [error]        : uploadHandler("Error message")
         *                [Just finish]  : uploadHandler()
         *                [directly register] : uploadHandler(response) // Same format as "imageUploadUrl" response
         *                                   ex) {
         *                                      // "errorMessage": "insert error message",
         *                                      "result": [ { "url": "...", "name": "...", "size": "999" }, ]
         *                                   }
         * @returns {Boolean|Array|undefined}
         */
        onImageUploadBefore: null,
        /**
         * @description Called before the video is uploaded
         * If true is returned, the internal upload process runs normally.
         * If false is returned, no video(iframe, video) upload is performed.
         * If new fileList are returned,  replaced the previous fileList
         * If undefined is returned, it waits until "uploadHandler" is executed.
         * @param {Array} files Files array
         * @param {Object} info info: {
         * - inputWidth: Value of width input
         * - inputHeight: Value of height input
         * - align: Align Check Value
         * - isUpdate: Update video if true, create video if false
         * - element: If isUpdate is true, the currently selected video.
         * }
         * @param {Object} core Core object
         * @param {Function} uploadHandler If undefined is returned, it waits until "uploadHandler" is executed.
         *                "uploadHandler" is an upload function with "core" and "info" bound.
         *                [upload files] : uploadHandler(files or [new File(...),])
         *                [error]        : uploadHandler("Error message")
         *                [Just finish]  : uploadHandler()
         *                [directly register] : uploadHandler(response) // Same format as "videoUploadUrl" response
         *                                   ex) {
         *                                      // "errorMessage": "insert error message",
         *                                      "result": [ { "url": "...", "name": "...", "size": "999" }, ]
         *                                   }
         * @returns {Boolean|Array|undefined}
         */
        onVideoUploadBefore: null,
        /**
         * @description Called before the audio is uploaded
         * If true is returned, the internal upload process runs normally.
         * If false is returned, no audio upload is performed.
         * If new fileList are returned,  replaced the previous fileList
         * If undefined is returned, it waits until "uploadHandler" is executed.
         * @param {Array} files Files array
         * @param {Object} info info: {
         * - isUpdate: Update audio if true, create audio if false
         * - element: If isUpdate is true, the currently selected audio.
         * }
         * @param {Object} core Core object
         * @param {Function} uploadHandler If undefined is returned, it waits until "uploadHandler" is executed.
         *                "uploadHandler" is an upload function with "core" and "info" bound.
         *                [upload files] : uploadHandler(files or [new File(...),])
         *                [error]        : uploadHandler("Error message")
         *                [Just finish]  : uploadHandler()
         *                [directly register] : uploadHandler(response) // Same format as "audioUploadUrl" response
         *                                   ex) {
         *                                      // "errorMessage": "insert error message",
         *                                      "result": [ { "url": "...", "name": "...", "size": "999" }, ]
         *                                   }
         * @returns {Boolean|Array|undefined}
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
         * @description Called when the editor is resized using the bottom bar
         */
        onResizeEditor: null,

        /**
         * @description Reset the buttons on the toolbar. (Editor is not reloaded)
         * You cannot set a new plugin for the button.
         * @param {Array} buttonList Button list 
         */
        setToolbarButtons: function (buttonList) {
            core.submenuOff();
            core.containerOff();
            
            const newToolbar = _Constructor._createToolBar(_d, buttonList, core.plugins, options);
            _responsiveButtons = newToolbar.responsiveButtons;
            core._moreLayerActiveButton = null;
            event._setResponsiveToolbar();

            context.element.toolbar.replaceChild(newToolbar._buttonTray, context.element._buttonTray);
            const newContext = _Context(context.element.originElement, core._getConstructed(context.element), options);

            context.element = newContext.element;
            context.tool = newContext.tool;
            if (options.iframe) context.element.wysiwyg = core._wd.body;
            core._cachingButtons();
            core.history._resetCachingButton();

            core.activePlugins = [];
            const oldCallButtons = pluginCallButtons;
            pluginCallButtons = newToolbar.pluginCallButtons;
            let plugin, button, oldButton;
            for (let key in pluginCallButtons) {
                if (!util.hasOwn(pluginCallButtons, key)) continue;
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

            if (core.hasFocus) event._applyTagEffects();

            if (core._variable.isCodeView) util.addClass(core._styleCommandMap.codeView, 'active');
            if (core._variable.isFullScreen) util.addClass(core._styleCommandMap.fullScreen, 'active');
            if (util.hasClass(context.element.wysiwyg, 'se-show-block')) util.addClass(core._styleCommandMap.showBlocks, 'active');
        },

        /**
         * @description Add or reset option property (Editor is reloaded)
         * @param {Object} _options Options
         */
        setOptions: function (_options) {
            event._removeEvent();
            core._resetComponents();
            
            util.removeClass(core._styleCommandMap.showBlocks, 'active');
            util.removeClass(core._styleCommandMap.codeView, 'active');
            core._variable.isCodeView = false;
            core._iframeAuto = null;

            core.plugins = _options.plugins || core.plugins;
            const mergeOptions = [options, _options].reduce(function (init, option) {
                for (let key in option) {
                    if (!util.hasOwn(option, key)) continue;
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

            const el = context.element;
            const _initHTML = el.wysiwyg.innerHTML;

            // set option
            const cons = _Constructor._setOptions(mergeOptions, context, options);        

            if (cons.callButtons) {
                pluginCallButtons = cons.callButtons;
                core.initPlugins = {};
            }

            if (cons.plugins) {
                core.plugins = plugins = cons.plugins;
            }

            // reset context
            if (el._menuTray.children.length === 0) this._menuTray = {};
            _responsiveButtons = cons.toolbar.responsiveButtons;
            core.options = options = mergeOptions;
            core.lang = lang = options.lang;

            if (options.iframe) {
                el.wysiwygFrame.addEventListener('load', function () {
                    util._setIframeDocument(this, options);
                    core._setOptionsInit(el, _initHTML);
                });
            }

            el.editorArea.appendChild(el.wysiwygFrame);

            if (!options.iframe) {
                core._setOptionsInit(el, _initHTML);
            }
        },

        /**
         * @description Set "options.defaultStyle" style.
         * Define the style of the edit area
         * It can also be defined with the "setOptions" method, but the "setDefaultStyle" method does not render the editor again.
         * @param {String} style Style string
         */
        setDefaultStyle: function (style) {
            const newStyles = options._editorStyles = util._setDefaultOptionStyle(options, style);
            const el = context.element;

            // top area
            el.topArea.style.cssText = newStyles.top;
            // code view
            el.code.style.cssText = options._editorStyles.frame;
            el.code.style.display = 'none';
            if (options.height === 'auto') {
                el.code.style.overflow = 'hidden';
            } else {
                el.code.style.overflow = '';
            }
            // wysiwyg frame
            if (!options.iframe) {
                el.wysiwygFrame.style.cssText = newStyles.frame + newStyles.editor;
            } else {
                el.wysiwygFrame.style.cssText = newStyles.frame;
                el.wysiwyg.style.cssText = newStyles.editor;
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
         * @description Gets only the text of the suneditor contents
         * @returns {String}
         */
        getText: function () {
            return context.element.wysiwyg.textContent;
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
            return core.getCharLength((core._charTypeHTML ? context.element.wysiwyg.innerHTML : context.element.wysiwyg.textContent), charCounterType);
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
         * @param {Boolean} checkCharCount If true, if "options.maxCharCount" is exceeded when "element" is added, null is returned without addition.
         * @param {Boolean} rangeSelection If true, range select the inserted node.
         */
        insertHTML: function (html, notCleaningData, checkCharCount, rangeSelection) {
            if (typeof html === 'string') {
                if (!notCleaningData) html = core.cleanHTML(html, null);
                try {
                    const dom = _d.createRange().createContextualFragment(html);
                    const domTree = dom.childNodes;

                    if (checkCharCount) {
                        const type = core._charTypeHTML ? 'outerHTML' : 'textContent';
                        let checkHTML = '';
                        for (let i = 0, len = domTree.length; i < len; i++) {
                            checkHTML += domTree[i][type];
                        }
                        if (!core.checkCharCount(checkHTML, null)) return;
                    }

                    let c, a, t, prev, firstCon;
                    while ((c = domTree[0])) {
                        if (prev && prev.nodeType === 3 && a && a.nodeType === 1 && util.isBreak(c)) {
                            prev = c;
                            util.removeItem(c);
                            continue;
                        }
                        t = core.insertNode(c, a, false);
                        a = t.container || t;
                        if (!firstCon) firstCon = t;
                        prev = c;
                    }

                    if (prev.nodeType === 3 && a.nodeType === 1) a = prev;
                    const offset = a.nodeType === 3 ? (t.endOffset || a.textContent.length): a.childNodes.length;
                    if (rangeSelection) core.setRange(firstCon.container || firstCon, firstCon.startOffset || 0, a, offset);
                    else core.setRange(a, offset, a, offset);
                } catch (error) {
                    if (core.isDisabled || core.isReadOnly) return;
                    console.warn('[SUNEDITOR.insertHTML.fail] ' + error);
                    core.execCommand('insertHTML', false, html);
                }
            } else {
                if (util.isComponent(html)) {
                    core.insertComponent(html, false, checkCharCount, false);
                } else {
                    let afterNode = null;
                    if (util.isFormatElement(html) || util.isMedia(html)) {
                        afterNode = util.getFormatElement(core.getSelectionNode(), null);	
                    }
                    core.insertNode(html, afterNode, checkCharCount);
                }
            }
            
            core.effectNode = null;
            core.focus();

            // history stack
            core.history.push(false);
        },

        /**
         * @description Change the contents of the suneditor
         * @param {String|undefined} contents Contents to Input
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
         * @description Switch to or off "ReadOnly" mode.
         * @param {Boolean} value "readOnly" boolean value.
         */
        readOnly: function (value) {
            core.isReadOnly = value;
            
            if (value) {
                context.element.code.setAttribute("readOnly", "true");
            } else {
                context.element.code.removeAttribute("readOnly");
            }

            util.setDisabledButtons(!!value, core.resizingDisabledButtons);
            if (options.codeMirrorEditor) options.codeMirrorEditor.setOption('readOnly', !!value);
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
            for (let k in core.functions) { if (util.hasOwn(core, k)) delete core.functions[k]; }
            for (let k in core) { if (util.hasOwn(core, k)) delete core[k]; }
            for (let k in event) { if (util.hasOwn(event, k)) delete event[k]; }
            for (let k in context) { if (util.hasOwn(context, k)) delete context[k]; }
            for (let k in pluginCallButtons) { if (util.hasOwn(pluginCallButtons, k)) delete pluginCallButtons[k]; }
            
            /** remove user object */
            for (let k in this) { if (util.hasOwn(this, k)) delete this[k]; }
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

    /************ Core init ************/
    // functions
    core.functions = functions;
    core.options = options;

    // Create to sibling node
    let contextEl = context.element;
    let originEl = contextEl.originElement;
    let topEl = contextEl.topArea;
    originEl.style.display = 'none';
    topEl.style.display = 'block';

    // init
    if (options.iframe) {
        contextEl.wysiwygFrame.addEventListener('load', function () {
            util._setIframeDocument(this, options);
            core._editorInit(false, options.value);
            options.value = null;
        });
    }

    // insert editor element
    if (typeof originEl.nextElementSibling === 'object') {
        originEl.parentNode.insertBefore(topEl, originEl.nextElementSibling);
    } else {
        originEl.parentNode.appendChild(topEl);
    }

    contextEl.editorArea.appendChild(contextEl.wysiwygFrame);
    contextEl = originEl = topEl = null;

    // init
    if (!options.iframe) {
        core._editorInit(false, options.value);
        options.value = null;
    }

    return functions;
}
