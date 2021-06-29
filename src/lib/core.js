/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

import { _w, _d } from "../helpers/global"
import { domUtil } from '../helpers';
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
    const _d = context.element.originElement.ownerDocument || _d;
    const _w = _d.defaultView || _w;
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

        _onButtonsCheck: new _w.RegExp("^(" + _w.Object.keys(options._textTagsMap).join("|") + ")$", "i"),

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
            this.eventManager.addGlobalEvent('mousedown', this._bindedSubmenuOff, false);

            if (this.plugins[submenuName].on) this.plugins[submenuName].on.call(this);
            this._antiBlur = true;
        },

        /**
         * @description Disable submenu
         */
        submenuOff: function () {
            this.eventManager.removeGlobalEvent('mousedown', this._bindedSubmenuOff);
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
            this.eventManager.addGlobalEvent('mousedown', this._bindedContainerOff, false);

            if (this.plugins[containerName].on) this.plugins[containerName].on.call(this);
            this._antiBlur = true;
        },

        /**
         * @description Disable container
         */
        containerOff: function () {
            this.eventManager.removeGlobalEvent('mousedown', this._bindedContainerOff);
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
            const toolbarOffset = domUtil.getGlobalOffset(context.element.toolbar);
            const menuW = menu.offsetWidth;
            const l = element.parentElement.offsetLeft + 3;

            // rtl
            if (options.rtl) {
                const elementW = element.offsetWidth;
                const rtlW = menuW > elementW ? menuW - elementW : 0;
                const rtlL = rtlW > 0 ? 0 : elementW - menuW;
                menu.style.left = (l - rtlW + rtlL) + 'px';
                if (toolbarOffset.left > domUtil.getGlobalOffset(menu).left) {
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
            this.eventManager.addGlobalEvent('mousedown', this._bindControllersOff, false);
            this.eventManager.addGlobalEvent('keydown', this._bindControllersOff, false);
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

            this.eventManager.removeGlobalEvent('mousedown', this._bindControllersOff);
            this.eventManager.removeGlobalEvent('keydown', this._bindControllersOff);
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

            const offset = domUtil.getOffset(referEl, context.element.wysiwygFrame);
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
                        if (!util.isFormatElement(currentNode) && !this.node.isComponent(currentNode)) {
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

            this.eventManager.applyTagEffect();
            if (this._isBalloon) this.eventManager._toggleToolbarBalloon();
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
                focusEl = util.getEdgeChild(
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

                        this.toolbar._showBalloon();
                        this.toolbar._showInline();
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

                    this.toolbar._showBalloon();
                    this.toolbar._showInline();
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
            if (this.isReadOnly && !/copy|cut|selectAll|codeView|fullScreen|print|preview|showBlocks/.test(command)) return;

            switch (command) {
                case 'copy':
                case 'cut':
                    this.execCommand(command);
                    break;
                case 'paste':
                    break;
                case 'selectAll':
                    const wysiwyg = context.element.wysiwyg;
                    let first = util.getEdgeChild(wysiwyg.firstChild, function (current) { return current.childNodes.length === 0 || current.nodeType === 3; }, false) || wysiwyg.firstChild;
                    let last = util.getEdgeChild(wysiwyg.lastChild, function (current) { return current.childNodes.length === 0 || current.nodeType === 3; }, true) || wysiwyg.lastChild;
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
            util.setDisabled(!isCodeView, this.codeViewDisabledButtons);

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
                        this.eventManager._hideToolbar();    
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
                        this.toolbar._showInline();
                    }
                }
                
                this._variable._range = null;
                context.element.code.focus();
                util.addClass(this._styleCommandMap.codeView, 'active');
            }

            this._checkPlaceholder();
            if (this.isReadOnly) domUtil.setDisabled(true, this.resizingDisabledButtons);

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
                this.toolbar._showInline();
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
                if (!requireFormat || (util.isFormatElement(node) || util.isRangeFormatElement(node) || this.node.isComponent(node) || util.isMedia(node) || (util.isAnchor(node) && util.isMedia(node.firstElementChild)))) {
                    return node.outerHTML;
                } else {
                    return '<' + defaultTag + '>' + node.outerHTML + '</' + defaultTag + '>';
                }
            }
            // text
            if (node.nodeType === 3) {
                if (!requireFormat) return util.htmlToEntity(node.textContent);
                const textArray = node.textContent.split(/\n/g);
                let html = '';
                for (let i = 0, tLen = textArray.length, text; i < tLen; i++) {
                    text = textArray[i].trim();
                    if (text.length > 0) html += '<' + defaultTag + '>' + util.htmlToEntity(text) + '</' + defaultTag + '>';
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
         * @param {Boolean} lowLevelCheck Low level check
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

            const dom = _d.createRange().createContextualFragment(html, true);
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
            contents = this._deleteDisallowedTags(this._parser.parseFromString(contents, 'text/html').body.innerHTML).replace(/(<[a-zA-Z0-9\-]+)[^>]*(?=>)/g, this._cleanTags.bind(this, false));
            const dom = _d.createRange().createContextualFragment(contents, false);

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
            const isFormat = function (current) { return this.isFormatElement(current) || this.node.isComponent(current); }.bind(this);

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
                        if (!util.isList(node.parentElement)) returnHTML += util.htmlToEntity((/^\n+$/.test(node.data) ? '' : node.data));
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
            this.eventManager._removeAllEvents();
            core._resetComponents();
            
            util.removeClass(core._styleCommandMap.showBlocks, 'active');
            util.removeClass(core._styleCommandMap.codeView, 'active');
            core._variable.isCodeView = false;
            core._iframeAuto = null;

            core.plugins = _options.plugins || core.plugins;
            const mergeOptions = [options, _options].reduce(function (init, option) {
                for (let key in option) {
                    if (!option.hasOwnProperty(key)) continue;
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
                    if (core.isDisabled || core.isReadOnly) return;
                    console.warn('[SUNEDITOR.insertHTML.fail] ' + error);
                    core.execCommand('insertHTML', false, html);
                }
            } else {
                if (this.node.isComponent(html)) {
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

            domUtil.setDisabled(!!value, core.resizingDisabledButtons);
            if (options.codeMirrorEditor) options.codeMirrorEditor.setOption('readOnly', !!value);
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
            this.eventManager._removeAllEvents();
            
            /** remove element */
            util.removeItem(context.element.toolbar);
            util.removeItem(context.element.topArea);

            /** remove object reference */
            for (let k in context) { if (context.hasOwnProperty(k)) delete context[k]; }
            for (let k in pluginCallButtons) { if (pluginCallButtons.hasOwnProperty(k)) delete pluginCallButtons[k]; }
            
            /** remove user object */
            for (let k in this) { if (this.hasOwnProperty(k)) delete this[k]; }
        },

        /**
         * @description Fix tags that do not fit the editor format.
         * @param {Element} documentFragment Document fragment "DOCUMENT_FRAGMENT_NODE" (nodeType === 11)
         * @param {RegExp} htmlCheckWhitelistRegExp Editor tags whitelist (core._htmlCheckWhitelistRegExp)
         * @param {Boolean} lowLevelCheck Row level check
         * @private
         */
        _consistencyCheckOfHTML: function (documentFragment, htmlCheckWhitelistRegExp, lowLevelCheck) {
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
                    if (!util.isFormatElement(fel) && !util.isRangeFormatElement(fel) && !this.node.isComponent(fel)) {
                        withoutFormatCells.push(current);
                        return false;
                    }
                }

                const result = current.parentNode !== documentFragment && nrtag &&
                 ((util.isListCell(current) && !util.isList(current.parentNode)) ||
                  (lowLevelCheck && (util.isFormatElement(current) || this.node.isComponent(current)) && !util.isRangeFormatElement(current.parentNode) && !util.getParentElement(current, this.node.isComponent)));

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
                    if (!_attr.hasOwnProperty(k) || /^on[a-z]+$/i.test(_attr[k])) continue;
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
                if (!plugins.hasOwnProperty(key)) continue;
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
            this.codeViewDisabledButtons = context.element._buttonTray.querySelectorAll('.se-menu-list button[data-display]:not([class~="se-code-view-enabled"])');
            this.resizingDisabledButtons = context.element._buttonTray.querySelectorAll('.se-menu-list button[data-display]:not([class~="se-resizing-enabled"]):not([data-display="MORE"])');

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
            if (this.hasFocus) this.eventManager.applyTagEffect();
            this._variable.isChanged = true;
            if (context.buttons.save) context.buttons.save.removeAttribute('disabled');
            // user event
            if (this.events.onChange) this.events.onChange(this.getContents(true));
            if (context.element.toolbar.style.display === 'block') this.toolbar._showBalloon();
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
            this.toolbar._offSticky();
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

    /************ Core init ************/
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
}
