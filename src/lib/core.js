/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

import { window, document } from "../helper/global"
import _util from '../helper/util';
import Constructor from './constructor';
import Context from './context';
import history from './history';
import notice from './classes/notice';

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
        notice: new notice(this),

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

        _events: {},

        /**
         * @description loaded language
         */
        lang: lang,

        /**
         * @description The selection node (selection.getNode()) to which the effect was last applied
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
         * @description The file component object of current selected file tag (component.get)
         */
        currentFileComponentInfo: null,

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
         * "checkFileInfo" method is always call just before the "editorInstance.setOptions" method.
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
         * @property {Number} indentSize Indent size (25)px
         * @property {Number} codeIndentSize Indent size of Code view mode (2)
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
            indentSize: 25,
            tabSize: 4,
            codeIndentSize: 2,
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
         * @param {*} arguments controller elements, function..
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
                    this.currentFileComponentInfo = this.component.get(arg);
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

            if (typeof this.events.showController === 'function') this.events.showController(this.currentControllerName, this.controllerArray);
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
            const caption = util.getParentElement(this.selection.getNode(), "figcaption");
            if (caption) {
                caption.focus();
            } else {
                context.element.wysiwyg.focus();
            }

            this.selection._init();
        },

        /**
         * @description Focus to wysiwyg area
         */
        focus: function () {
            if (context.element.wysiwygFrame.style.display === "none") return;

            if (options.iframe) {
                this.nativeFocus();
            } else {
                try {
                    const range = this.selection.getRange();
                    if (range.startContainer === range.endContainer && util.isWysiwygDiv(range.startContainer)) {
                        const currentNode = range.commonAncestorContainer.children[range.startOffset];
                        if (!util.isFormatElement(currentNode) && !util.isComponent(currentNode)) {
                            const format = util.createElement(options.defaultTag);
                            const br = util.createElement("BR");
                            format.appendChild(br);
                            context.element.wysiwyg.insertBefore(format, currentNode);
                            this.selection.setRange(br, 0, br, 0);
                            return;
                        }
                    }
                    this.selection.setRange(range.startContainer, range.startOffset, range.endContainer, range.endOffset);
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

            const fileComponentInfo = this.component.get(focusEl);
            if (fileComponentInfo) {
                this.component.select(fileComponentInfo.target, fileComponentInfo.pluginName);
            } else if (focusEl) {
                focusEl = util.getChildElement(
                    focusEl,
                    function (current) {
                        return current.childNodes.length === 0 || current.nodeType === 3;
                    },
                    true
                );
                if (!focusEl) this.nativeFocus();
                else this.selection.setRange(focusEl, focusEl.textContent.length, focusEl, focusEl.textContent.length);
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
                        const info = this.component.get(first);
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
                    this.format.indent();
                    break;
                case 'outdent':
                    this.format.outdent();
                    break;
                case 'undo':
                    this.history.undo();
                    break;
                case 'redo':
                    this.history.redo();
                    break;
                case 'removeFormat':
                    this.removeStyleNode();
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
                    } else if (this._variable.isChanged && typeof this.events.save === 'function') {
                        this.events.save();
                    } else {
                        throw Error('[SUNEDITOR.core.commandHandler.fail] Please register call back function in creation option. (callBackSave : Function)');
                    }

                    this._variable.isChanged = false;
                    if (context.buttons.save) context.buttons.save.setAttribute('disabled', true);
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

                    this.applyStyleNode(cmd, null, [removeNode], false);
                    this.focus();
            }
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
            // user event
            if (typeof this.events.toggleCodeView === 'function') this.events.toggleCodeView(this._variable.isCodeView);
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
            if (typeof this.events.toggleFullScreen === 'function') this.events.toggleFullScreen(this._variable.isFullScreen);
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
                    if (util.isIE || util.isEdge || !!_d.documentMode || !!_w.StyleMedia) {
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
                if (!requireFormat) return util.HTMLToEntity(node.textContent);
                const textArray = node.textContent.split(/\n/g);
                let html = '';
                for (let i = 0, tLen = textArray.length, text; i < tLen; i++) {
                    text = textArray[i].trim();
                    if (text.length > 0) html += '<' + defaultTag + '>' + util.HTMLToEntity(text) + '</' + defaultTag + '>';
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
         * @param {Boolean} rowLevelCheck Row level check
         * @param {String} m RegExp value
         * @param {String} t RegExp value
         * @returns {String}
         * @private
         */
        _cleanTags: function (rowLevelCheck, m, t) {
            if (/^<[a-z0-9]+\:[a-z0-9]+/i.test(m)) return m;

            let v = null;
            const tAttr = this._attributesTagsWhitelist[t.match(/(?!<)[a-zA-Z0-9\-]+/)[0].toLowerCase()];
            if (tAttr) v = m.match(tAttr);
            else v = m.match(this._attributesWhitelistRegExp);

            if (rowLevelCheck || /<a\b/i.test(t)) {
                const sv = m.match(/id\s*=\s*(?:"|')[^"']*(?:"|')/);
                if (sv) {
                    if (!v) v = [];
                    v.push(sv[0]);
                }
            }

            if ((rowLevelCheck || /<span/i.test(t)) && (!v || !/style=/i.test(v.toString()))) {
                const sv = m.match(/style\s*=\s*(?:"|')[^"']*(?:"|')/);
                if (sv) {
                    if (!v) v = [];
                    v.push(sv[0]);
                }
            }

            if (v) {
                for (let i = 0, len = v.length; i < len; i++) {
                    if (!rowLevelCheck && /^class="(?!(__se__|se-|katex))/.test(v[i])) continue;
                    t += ' ' + (/^href\s*=\s*('|"|\s)*javascript\s*\:/i.test(v[i]) ? '' : v[i]);
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
            html = this._deleteDisallowedTags(this._parser.parseFromString(html, 'text/html').body.innerHTML).replace(/(<[a-zA-Z0-9\-]+)[^>]*(?=>)/g, this._cleanTags.bind(this, false));

            const dom = _d.createRange().createContextualFragment(html);
            try {
                this._consistencyCheckOfHTML(dom, this._htmlCheckWhitelistRegExp);
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
                if (t.nodeType === 1 && !util.isTextStyleNode(t) && !util.isBreak(t) && !util._disallowedTags(t)) {
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
            contents = this._deleteDisallowedTags(this._parser.parseFromString(contents, 'text/html').body.innerHTML).replace(/(<[a-zA-Z0-9\-]+)[^>]*(?=>)/g, this._cleanTags.bind(this, true));
            const dom = _d.createRange().createContextualFragment(contents);

            try {
                this._consistencyCheckOfHTML(dom, this._htmlCheckWhitelistRegExp);
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

            let indentSize = this._variable.codeIndentSize * 1;
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
                        if (!util.isList(node.parentElement)) returnHTML += util.HTMLToEntity((/^\n+$/.test(node.data) ? '' : node.data));
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
            const cons = Constructor._setOptions(mergeOptions, context, options);        

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
         * @description Copying the contents of the editor to the original textarea
         */
        save: function () {
            context.element.originElement.value = core.getContents(false);
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
         * @description Gets uploaded files(plugin using fileManager) information list.
         * image: [img], video: [video, iframe], audio: [audio]
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
                        const type = options.charCounterType === 'byte-html' ? 'outerHTML' : 'textContent';
                        let checkHTML = '';
                        for (let i = 0, len = domTree.length; i < len; i++) {
                            checkHTML += domTree[i][type];
                        }
                        if (!core.char.check(checkHTML)) return;
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
                    console.warn('[SUNEDITOR.insertHTML.fail] ' + error);
                    core.execCommand('insertHTML', false, html);
                }
            } else {
                if (util.isComponent(html)) {
                    core.component.insert(html, false, checkCharCount, false);
                } else {
                    let afterNode = null;
                    if (util.isFormatElement(html) || util.isMedia(html)) {
                        afterNode = this.format.getLine(core.selection.getNode(), null);	
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
            context.buttons.cover.style.display = 'block';
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
            context.buttons.cover.style.display = 'none';
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

        addEvent: function(target, type, handler) {
            target.addEventListener(type, handler, false);
            this._events.push({ target: target, type: type, handler: handler });
        },
    
        removeAllEvents: function() {
            for (let i = 0, len = this._events.length, e; i < len; i++) {
                e = this._events[i];
                e.target.removeEventListener(e.type, e.handler);
            }
            this._events = null;
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
         * @description Fix tags that do not fit the editor format.
         * @param {Element} documentFragment Document fragment "DOCUMENT_FRAGMENT_NODE" (nodeType === 11)
         * @param {RegExp} htmlCheckWhitelistRegExp Editor tags whitelist (core._htmlCheckWhitelistRegExp)
         * @private
         */
        _consistencyCheckOfHTML: function (documentFragment, htmlCheckWhitelistRegExp) {
            /**
             * It is can use ".children(util.getListChildren)" to exclude text nodes, but "documentFragment.children" is not supported in IE.
             * So check the node type and exclude the text no (current.nodeType !== 1)
             */
            const removeTags = [], emptyTags = [], wrongList = [], withoutFormatCells = [];

            // wrong position
            const wrongTags = util.getListChildNodes(documentFragment, function (current) {
                if (current.nodeType !== 1) return false;

                // white list
                if (!htmlCheckWhitelistRegExp.test(current.nodeName) && current.childNodes.length === 0 && util.isNotCheckingNode(current)) {
                    removeTags.push(current);
                    return false;
                }

                const nrtag = !util.getParentElement(current, util.isNotCheckingNode);
                // empty tags
                if ((!util.isTable(current) && !util.isListCell(current)) && (util.isFormatElement(current) || util.isRangeFormatElement(current) || util.isTextStyleNode(current)) && current.childNodes.length === 0 && nrtag) {
                    emptyTags.push(current);
                    return false;
                }

                // wrong list
                if (util.isList(current.parentNode) && !util.isList(current) && !util.isListCell(current)) {
                    wrongList.push(current);
                    return false;
                }

                // table cells
                if (util.isTableCell(current)) {
                    const fel = current.firstElementChild;
                    if (!util.isFormatElement(fel) && !util.isRangeFormatElement(fel) && !util.isComponent(fel)) {
                        withoutFormatCells.push(current);
                        return false;
                    }
                }

                const result = current.parentNode !== documentFragment &&
                (util.isFormatElement(current) || util.isComponent(current) || util.isList(current)) &&
                !util.isRangeFormatElement(current.parentNode) && !util.isListCell(current.parentNode) &&
                !util.getParentElement(current, util.isComponent) && nrtag;

                return result;
            }.bind(this));

            for (let i = 0, len = removeTags.length; i < len; i++) {
                util.removeItem(removeTags[i]);
            }
            
            const checkTags = [];
            for (let i = 0, len = wrongTags.length, t, p; i < len; i++) {
                t = wrongTags[i];
                p = t.parentNode;
                if (!p || !p.parentNode) continue;
                p.parentNode.insertBefore(t, p);
                checkTags.push(p);
            }

            for (let i = 0, len = checkTags.length, t; i < len; i++) {
                t = checkTags[i];
                if (util.onlyZeroWidthSpace(t.textContent.trim())) {
                    util.removeItem(t);
                }
            }

            for (let i = 0, len = emptyTags.length; i < len; i++) {
                util.removeItem(emptyTags[i]);
            }

            for (let i = 0, len = wrongList.length, t, tp, children, p; i < len; i++) {
                t = wrongList[i];

                tp = util.createElement('LI');
                children = t.childNodes;
                while (children[0]) {
                    tp.appendChild(children[0]);
                }
                
                p = t.parentNode;
                if (!p) continue;
                p.insertBefore(tp, t);
                util.removeItem(t);
            }

            for (let i = 0, len = withoutFormatCells.length, t, f; i < len; i++) {
                t = withoutFormatCells[i];
                f = util.createElement('DIV');
                f.innerHTML = (t.textContent.trim().length === 0 && t.children.length === 0) ? '<br>' : t.innerHTML;
                t.innerHTML = f.outerHTML;
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
         * @description Initializ core variable
         * @param {Boolean} reload Is relooad?
         * @param {String} _initHTML initial html string
         * @private
         */
        _init: function (reload, _initHTML) {
            const wRegExp = _w.RegExp;
            this._ww = options.iframe ? context.element.wysiwygFrame.contentWindow : _w;
            this._wd = _d;

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
            this.history = history(this, this._onChange_historyStack.bind(this));

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
            _w.setTimeout(function () {
                this.codeViewDisabledButtons = context.element._buttonTray.querySelectorAll('.se-menu-list button[data-display]:not([class~="se-code-view-enabled"])');
                this.resizingDisabledButtons = context.element._buttonTray.querySelectorAll('.se-menu-list button[data-display]:not([class~="se-resizing-enabled"]):not([data-display="MORE"])');
            }.bind(this));

            const buttons = context.buttons;
            this.commandMap = {
                SUB: buttons.subscript,
                SUP: buttons.superscript,
                OUTDENT: buttons.outdent,
                INDENT: buttons.indent
            };
            this.commandMap[options.textTags.bold.toUpperCase()] = buttons.bold;
            this.commandMap[options.textTags.underline.toUpperCase()] = buttons.underline;
            this.commandMap[options.textTags.italic.toUpperCase()] = buttons.italic;
            this.commandMap[options.textTags.strike.toUpperCase()] = buttons.strike;
            
            this._styleCommandMap = {
                fullScreen: buttons.fullScreen,
                showBlocks: buttons.showBlocks,
                codeView: buttons.codeView
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
            if (context.buttons.save) context.buttons.save.removeAttribute('disabled');
            // user event
            if (this.events.onChange) this.events.onChange(this.getContents(true));
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
         * @private
         */
        _setDefaultFormat: function (formatName) {
            if (this._fileManager.pluginRegExp.test(this.currentControllerName)) return;

            const range = this.getRange();
            const commonCon = range.commonAncestorContainer;
            const startCon = range.startContainer;
            const rangeEl = this.format.getRangeBlock(commonCon, null);
            let focusNode, offset, format;

            const fileComponent = util.getParentElement(commonCon, util.isComponent);
            if (fileComponent && !util.isTable(fileComponent)) return;
            if((util.isRangeFormatElement(startCon) || util.isWysiwygDiv(startCon)) && (util.isComponent(startCon.children[range.startOffset]) || util.isComponent(startCon.children[range.startOffset - 1]))) return;

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

            format = this.format.getLine(focusNode, null);
            if (!format) {
                this.removeRange();
                this.selection._init();
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
            this.context = context = Context(el.originElement, this._getConstructed(el));
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
            this.char.display();
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
                if (typeof this.events.onload === 'function') this.events.onload(core, reload);
            }.bind(this));
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
            let selectionNode = core.selection.getNode();
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
                for (let c = 0, name; c < cLen; c++) {
                    name = activePlugins[c];
                    if (commandMapNodes.indexOf(name) === -1 && plugins[name].active.call(core, element)) {
                        commandMapNodes.push(name);
                    }
                }

                if (util.isFormatElement(element)) {
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

            /** remove class, display text */
            for (let key in commandMap) {
                if (commandMapNodes.indexOf(key) > -1 || !util.hasOwn(commandMap, key)) continue;
                if (activePlugins.indexOf(key) > -1) {
                    plugins[key].active.call(core, null);
                } else if (commandMap.OUTDENT && /^OUTDENT$/i.test(key)) {
                    commandMap.OUTDENT.setAttribute('disabled', true);
                } else if (commandMap.INDENT && /^INDENT$/i.test(key)) {
                    commandMap.INDENT.removeAttribute('disabled');
                } else {
                    util.removeClass(commandMap[key], 'active');
                }
            }

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
            if (!core.hasFocus) core.nativeFocus();
            if (!core._variable.isCodeView) core.selection._init();

            core.actionCall(command, display, target);
        },

        onMouseDown_wysiwyg: function (e) {
            if (util.isNonEditable(context.element.wysiwyg)) return;

            // user event
            if (typeof this.events.onMouseDown === 'function' && this.events.onMouseDown(e) === false) return;
            
            const tableCell = util.getParentElement(e.target, util.isTableCell);
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
            if (util.isNonEditable(context.element.wysiwyg)) return;

            // user event
            if (typeof this.events.onClick === 'function' && this.events.onClick(e) === false) return;

            const fileComponentInfo = core.component.get(targetElement);
            if (fileComponentInfo) {
                e.preventDefault();
                core.component.select(fileComponentInfo.target, fileComponentInfo.pluginName);
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

            _w.setTimeout(core.selection._init.bind(core));
            core.selection._init();

            const selectionNode = core.selection.getNode();
            const formatEl = this.format.getLine(selectionNode, null);
            const rangeEl = this.format.getRangeBlock(selectionNode, null);
            if ((!formatEl || formatEl === rangeEl) && !util.isNonEditable(targetElement) && !util.isList(rangeEl)) {
                const range = core.getRange();
                if (this.format.getLine(range.startContainer) === this.format.getLine(range.endContainer)) {
                    if (util.isList(rangeEl)) {
                        e.preventDefault();
                        const oLi = util.createElement('LI');
                        const prevLi = selectionNode.nextElementSibling;
                        oLi.appendChild(selectionNode);
                        rangeEl.insertBefore(oLi, prevLi);
                        core.focus();
                    } else if (!util.isWysiwygDiv(selectionNode) && !util.isComponent(selectionNode) && (!util.isTable(selectionNode) || util.isTableCell(selectionNode))) {
                        e.preventDefault();
                        core._setDefaultFormat(util.isRangeFormatElement(rangeEl) ? 'DIV' : options.defaultTag);
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
            core.selection._init();
            const range = core.getRange();
            if (core._bindControllersOff || (!core._isBalloonAlways && range.collapsed)) event._hideToolbar();
            else event._showToolbarBalloon(range);
        },

        _showToolbarBalloon: function (rangeObj) {
            if (!core._isBalloon) return;

            const range = rangeObj || core.getRange();
            const toolbar = context.element.toolbar;
            const topArea = context.element.topArea;
            const selection = core.selection.get();

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
                const node = core.selection.getNode();
                if (util.isFormatElement(node)) {
                    const zeroWidth = util.createTextNode(util.zeroWidthSpace);
                    core.insertNode(zeroWidth, null, false);
                    core.setRange(zeroWidth, 1, zeroWidth, 1);
                    core.selection._init();
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
            
            if (typeof this.events.showInline === 'function') this.events.showInline(toolbar, context);

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
            core.selection._init();

            // user event
            if (typeof this.events.onInput === 'function' && this.events.onInput(e) === false) return;

            const data = (e.data === null ? '' : e.data === undefined ? ' ' : e.data) || '';       
            if (!core.char.test(data)) {
                e.preventDefault();
                e.stopPropagation();
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
                siblingNode = this.format.getLine(container);
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

            core.submenuOff();

            if (core._isBalloon) {
                event._hideToolbar();
            }

            // user event
            if (typeof this.events.onKeyDown === 'function' && this.events.onKeyDown(e) === false) return;

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
            let selectionNode = core.selection.getNode();
            const range = core.getRange();
            const selectRange = !range.collapsed || range.startContainer !== range.endContainer;
            const fileComponentName = core._fileManager.pluginRegExp.test(core.currentControllerName) ? core.currentControllerName : '';
            let formatEl = this.format.getLine(selectionNode, null) || selectionNode;
            let rangeEl = this.format.getRangeBlock(formatEl, null);

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

                    if (!util.isFormatElement(formatEl) && !context.element.wysiwyg.firstElementChild && !util.isComponent(selectionNode)) {
                        e.preventDefault();
                        e.stopPropagation();
                        core._setDefaultFormat(options.defaultTag);
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
                    formatEl = this.format.getLine(range.startContainer, null);
                    rangeEl = this.format.getRangeBlock(formatEl, null);
                    if (rangeEl && formatEl && !util.isTableCell(rangeEl) && !/^FIGCAPTION$/i.test(rangeEl.nodeName)) {
                        if (util.isListCell(formatEl) && util.isList(rangeEl) && (util.isListCell(rangeEl.parentNode) || formatEl.previousElementSibling) && (selectionNode === formatEl || (selectionNode.nodeType === 3 && (!selectionNode.previousSibling || util.isList(selectionNode.previousSibling)))) &&
                         (this.format.getLine(range.startContainer, null) !== this.format.getLine(range.endContainer, null) ? rangeEl.contains(range.startContainer) : (range.startOffset === 0  && range.collapsed))) {
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
                                core.format.removeRangeBlock(rangeEl, (util.isListCell(formatEl) ? [formatEl] : null), null, false, false);
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
                            const fileComponentInfo = core.component.get(prev);
                            if (fileComponentInfo) {
                                e.preventDefault();
                                e.stopPropagation();
                                if (formatEl.textContent.length === 0) util.removeItem(formatEl);
                                if (core.component.select(fileComponentInfo.target, fileComponentInfo.pluginName) === false) core.blur();
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
                                    let cell = util.getChildElement(nextEl, util.isTableCell, false);
                                    cell = cell.firstElementChild || cell;
                                    core.setRange(cell, 0, cell, 0);
                                    break;
                                }
                            }

                            // select file component
                            const fileComponentInfo = core.component.get(nextEl);
                            if (fileComponentInfo) {
                                e.stopPropagation();
                                if (core.component.select(fileComponentInfo.target, fileComponentInfo.pluginName) === false) core.blur();
                            } else if (util.isComponent(nextEl)) {
                                e.stopPropagation();
                                util.removeItem(nextEl);
                            }

                            break;
                        }
                    }

                    if (!selectRange && (core.isEdgePoint(range.endContainer, range.endOffset) || (selectionNode === formatEl ? !!formatEl.childNodes[range.startOffset] : false))) {
                        const sel = selectionNode === formatEl ? formatEl.childNodes[range.startOffset] : selectionNode;
                        // delete nonEditable
                        if (util.isNonEditable(sel.nextSibling)) {
                            e.preventDefault();
                            e.stopPropagation();
                            util.removeItem(sel.nextSibling);
                            break;
                        }
                    }

                    // nested list
                    formatEl = this.format.getLine(range.startContainer, null);
                    rangeEl = this.format.getRangeBlock(formatEl, null);
                    if (util.isListCell(formatEl) && util.isList(rangeEl) && (selectionNode === formatEl || (selectionNode.nodeType === 3 && (!selectionNode.nextSibling || util.isList(selectionNode.nextSibling)) &&
                     (this.format.getLine(range.startContainer, null) !== this.format.getLine(range.endContainer, null) ? rangeEl.contains(range.endContainer) : (range.endOffset === selectionNode.textContent.length && range.collapsed))))) {
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
                    const selectedFormats = core.selection.getLines(null);
                    selectionNode = core.selection.getNode();
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
                    if (cells.length > 0 && isEdge) {
                        r = core.format._applyNestedList(cells, shift);
                    } else {
                        // table
                        const tableCell = util.getParentElement(selectionNode, util.isTableCell);
                        if (tableCell && isEdge) {
                            const table = util.getParentElement(tableCell, 'table');
                            const cells = util.getListChildren(table, util.isTableCell);
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
                    const brLine = this.format.getBrLine(selectionNode, null);

                    if (options.charCounterType === "byte-html") {
                        let enterHTML = '';
                        if ((!shift && brLine) || shift) {
                            enterHTML = '<br>';
                        } else {
                            enterHTML = '<' + formatEl.nodeName + '><br></' + formatEl.nodeName + '>';
                        }

                        if (!core.this.char.check(enterHTML)) {
                            e.preventDefault();
                            return false;
                        }
                    }

                    if (!shift) {
                        const formatInners = core.format.isEdgeLine(range.endContainer, range.endOffset, 'end');
                        if ((formatInners && /^H[1-6]$/i.test(formatEl.nodeName)) || /^HR$/i.test(formatEl.nodeName)) {
                            e.preventDefault();
                            let temp = null;
                            const newFormat = core.format.appendLine(formatEl, options.defaultTag);

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

                        if (brLine) {
                            e.preventDefault();
                            const selectionFormat = selectionNode === brLine;
                            const wSelection = core.selection.get();
                            const children = selectionNode.childNodes, offset = wSelection.focusOffset, prev = selectionNode.previousElementSibling, next = selectionNode.nextSibling;
    
                            if (!util.isClosureFreeFormatElement(brLine) && !!children && ((selectionFormat && range.collapsed && children.length - 1 <= offset + 1 && util.isBreak(children[offset]) && (!children[offset + 1] || ((!children[offset + 2] || util.onlyZeroWidthSpace(children[offset + 2].textContent)) && children[offset + 1].nodeType === 3 && util.onlyZeroWidthSpace(children[offset + 1].textContent))) &&  offset > 0 && util.isBreak(children[offset - 1])) ||
                              (!selectionFormat && util.onlyZeroWidthSpace(selectionNode.textContent) && util.isBreak(prev) && (util.isBreak(prev.previousSibling) || !util.onlyZeroWidthSpace(prev.previousSibling.textContent)) && (!next || (!util.isBreak(next) && util.onlyZeroWidthSpace(next.textContent)))))) {
                                if (selectionFormat) util.removeItem(children[offset - 1]);
                                else util.removeItem(selectionNode);
                                const newEl = core.format.appendLine(brLine, util.isFormatElement(brLine.nextElementSibling) ? brLine.nextElementSibling : null);
                                util.copyFormatAttributes(newEl, brLine);
                                core.setRange(newEl, 1, newEl, 1);
                                break;
                            }
                            
                            if (selectionFormat) {
                                core.insertHTML(((range.collapsed && util.isBreak(range.startContainer.childNodes[range.startOffset - 1])) ? '<br>' : '<br><br>'), true, false);
    
                                let focusNode = wSelection.focusNode;
                                const wOffset = wSelection.focusOffset;
                                if (brLine === focusNode) {
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
                    
                    if (rangeEl && formatEl && !util.isTableCell(rangeEl) && !/^FIGCAPTION$/i.test(rangeEl.nodeName)) {
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
                                newEl = this.node.split(formatEl, null, util.getElementDepth(formatEl) - 2);
                                if (!newEl) {
                                    const newListCell = util.createElement('LI');
                                    newListCell.innerHTML = '<br>';
                                    rangeEl.insertBefore(newListCell, newEl);
                                    newEl = newListCell;
                                }
                            } else {
                                const newFormat = util.isTableCell(rangeEl.parentNode) ? 'DIV' : util.isList(rangeEl.parentNode) ? 'LI' : util.isFormatElement(rangeEl.nextElementSibling) ? rangeEl.nextElementSibling.nodeName : util.isFormatElement(rangeEl.previousElementSibling) ? rangeEl.previousElementSibling.nodeName : options.defaultTag;
                                newEl = util.createElement(newFormat);
                                const edge = core.format.removeRangeBlock(rangeEl, [formatEl], null, true, true);
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
                        formatEl = core.format.appendLine(formatEl, null);
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
                            newEl = util.createElement(util.isFormatElement(sibling) ? sibling.nodeName : options.defaultTag);
                            newEl.innerHTML = '<br>';
                        }

                        container.parentNode.insertBefore(newEl, container);
                        
                        core.callPlugin(fileComponentName, function () {
                            if (core.component.select(compContext._element, fileComponentName) === false) core.blur();
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
                    const cell = util.getParentElement(formatEl, util.isTableCell);
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
            core.selection._init();

            const range = core.getRange();
            const keyCode = e.keyCode;
            const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92 || keyCode === 224;
            const alt = e.altKey;
            let selectionNode = core.selection.getNode();

            if (core._isBalloon && ((core._isBalloonAlways && keyCode !== 27) || !range.collapsed)) {
                if (core._isBalloonAlways) {
                    if (keyCode !== 27) event._showToolbarBalloonDelay();
                } else {
                    event._showToolbarBalloon();
                    return;
                }
            }

            // user event
            if (typeof this.events.onKeyUp === 'function' && this.events.onKeyUp(e) === false) return;

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

            const formatEl = this.format.getLine(selectionNode, null);
            const rangeEl = this.format.getRangeBlock(selectionNode, null);
            if (((!formatEl && range.collapsed) || formatEl === rangeEl) && !util.isComponent(selectionNode) && !util.isList(selectionNode)) {
                core._setDefaultFormat(util.isRangeFormatElement(rangeEl) ? 'DIV' : options.defaultTag);
                selectionNode = core.selection.getNode();
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

            core.char.test('');

            // history stack
            core.history.push(true);
        },

        onScroll_wysiwyg: function (e) {
            core.controllersOff();
            if (core._isBalloon) event._hideToolbar();

            // user event
            if (typeof this.events.onScroll === 'function') this.events.onScroll(e);
        },

        onFocus_wysiwyg: function (e) {
            if (core._antiBlur) return;
            core.hasFocus = true;
            event._applyTagEffects();
            
            if (core._isInline) event._showToolbarInline();

            // user event
            if (typeof this.events.onFocus === 'function') this.events.onFocus(e);
        },

        onBlur_wysiwyg: function (e) {
            if (core._antiBlur || core._variable.isCodeView) return;
            core.hasFocus = false;
            core.controllersOff();
            if (core._isInline || core._isBalloon) event._hideToolbar();

            // user event
            if (typeof this.events.onBlur === 'function') this.events.onBlur(e);

            // active class reset of buttons
            const commandMap = core.commandMap;
            const activePlugins = core.activePlugins;
            for (let key in commandMap) {
                if (!util.hasOwn(commandMap, key)) continue;
                if (activePlugins.indexOf(key) > -1) {
                    plugins[key].active.call(core, null);
                } else if (commandMap.OUTDENT && /^OUTDENT$/i.test(key)) {
                    commandMap.OUTDENT.setAttribute('disabled', true);
                } else if (commandMap.INDENT && /^INDENT$/i.test(key)) {
                    commandMap.INDENT.removeAttribute('disabled');
                } else {
                    util.removeClass(commandMap[key], 'active');
                }
            }

            core._variable.currentNodes = [];
            core._variable.currentNodesMap = [];
            if (options.showPathLabel) context.element.navigation.textContent = '';
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
                if (typeof this.events.onResizeEditor === 'function') this.events.onResizeEditor(util.getNumber(context.element.wysiwygFrame.style.height, 0), prevHeight);
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
                    core.toolbar.setButtons(event._responsiveButtons[responsiveWidth]);
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
            const sCell = this.format.getRangeBlock(sc);
            const eCell = this.format.getRangeBlock(ec);
            const sIsCell = util.isTableCell(sCell);
            const eIsCell = util.isTableCell(eCell);
            if (((sIsCell && !sCell.previousElementSibling && !sCell.parentElement.previousElementSibling) || (eIsCell && !eCell.nextElementSibling && !eCell.parentElement.nextElementSibling)) && sCell !== eCell) {
                if (!sIsCell) {
                    util.removeItem(util.getParentElement(eCell, util.isComponent));
                } else if (!eIsCell) {
                    util.removeItem(util.getParentElement(sCell, util.isComponent));
                } else {
                    util.removeItem(util.getParentElement(sCell, util.isComponent));
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
            if (typeof this.events.onCopy === 'function' && !this.events.onCopy(e, clipboardData)) {
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
            if (typeof this.events.onCut === 'function' && !this.events.onCut(e, clipboardData)) {
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
            const dataTransfer = e.dataTransfer;
            if (!dataTransfer) return true;
            if (util.isIE) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

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
                cleanData = util.HTMLToEntity(plainText).replace(/\n/g, '<br>');
            }

            const maxCharCount = core.char.test(options.charCounterType === 'byte-html' ? cleanData : plainText);
            // user event - paste
            if (type === 'paste' && typeof this.events.onPaste === 'function') {
                const value = this.events.onPaste(e, cleanData, maxCharCount);
                if (!value) return false;
                if (typeof value === 'string') cleanData = value;
            }
            // user event - drop
            if (type === 'drop' && typeof this.events.onDrop === 'function') {
                const value = this.events.onDrop(e, cleanData, maxCharCount);
                if (!value) return false;
                if (typeof value === 'string') cleanData = value;
            }

            // files
            const files = data.files;
            if (files.length > 0 && !MSData) {
                if (/^image/.test(files[0].type) && core.plugins.image) {
                    if (!core.initPlugins.image) core.callPlugin('image', core.plugins.image.submitAction.bind(core, files), null);
                    else core.plugins.image.submitAction.call(core, files);
                    core.focus();
                }
                return false;
            }

            if (!maxCharCount) {
                return false;
            }

            if (cleanData) {
                core.insertHTML(cleanData, true, false);
                return false;
            }
        },

        onMouseMove_wysiwyg: function (e) {
            if (core.isDisabled) return;
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

            const format = util.createElement(isList ? 'BR' : util.isTableCell(component.parentNode) ? 'DIV' : options.defaultTag);
            if (!isList) format.innerHTML = '<br>';

            if (options.charCounterType === 'byte-html' && !this.char.check(format.outerHTML)) return;

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
