import Helpers, {
    global,
    env,
    converter,
    unicode,
    domUtils,
    numbers
} from "../helpers";
import Constructor from "./constructor";
import Context from "./context";
import history from "./history";
import Events from "./events";
import EventManager from "./eventManager";
import Notice from "./notice";

// classes
import Char from "./classes/char";
import Component from "./classes/component";
import Format from "./classes/format";
import Node from "./classes/node";
import Offset from "./classes/offset";
import Selection from "./classes/selection";
import Shortcuts from "./classes/shortcuts";
import Toolbar from "./classes/toolbar";

// classes interface
import ClassesInterface from "../interface/_classes";

/**
 * @description SunEditor constructor function.
 * @param {Object} context
 * @param {Object} pluginCallButtons
 * @param {Object} plugins 
 * @param {Object} lang
 * @param {Object} options
 * @param {Object} _responsiveButtons
 * @returns {Object} functions Object
 */
function Core(context, pluginCallButtons, plugins, lang, options, _responsiveButtons) {
    const _d = this._d = context.element.originElement.ownerDocument || global._d;
    const _w = this._w = _d.defaultView || global._w;

    this._responsiveButtons = _responsiveButtons;
    this._parser = new _w.DOMParser();
    this._prevRtl = options.rtl;
    this._editorHeight = 0;

    /**
     * @description Document object of the iframe if created as an iframe || _d
     * @private
     */
    this._wd = null;

    /**
     * @description Window object of the iframe if created as an iframe || _w
     * @private
     */
    this._ww = null;

    /**
     * @description Closest ShadowRoot to editor if found
     * @private
     */
    this._shadowRoot = null;

    /**
     * @description Block controller mousedown events in "shadowRoot" environment
     * @private
     */
    this._shadowRootControllerEventTarget = null;

    /**
     * @description Editor options
     */
    this.options = options;

    /**
     * @description Loaded plugins
     */
    this.plugins = plugins || {};

    /**
     * @description Default icons object
     */
    this.icons = options.icons;

    /**
     * @description loaded language
     */
    this.lang = lang;

    /**
     * @description History object for undo, redo
     */
    this.history = null;

    /**
     * @description Elements and user options parameters of the suneditor
     */
    this.context = context;

    /**
     * @description Helpers object
     */
    this.helpers = Helpers;

    /**
     * @description Computed style of the wysiwyg area (window.getComputedStyle(context.element.wysiwyg))
     */
    this.wwComputedStyle = null;

    /**
     * @description Plugin buttons
     */
    this.pluginCallButtons = pluginCallButtons;

    /**
     * @description Whether the plugin is initialized
     */
    this.initPlugins = {};

    /**
     * @description Save rendered submenus and containers
     * @private
     */
    this._menuTray = {};

    /**
     * @description The selection node (selection.getNode()) to which the effect was last applied
     */
    this.effectNode = null;

    /**
     * @description submenu element
     */
    this.submenu = null;

    /**
     * @description container element
     */
    this.container = null;

    /**
     * @description current submenu name
     * @private
     */
    this._submenuName = "";

    /**
     * @description binded submenuOff method
     * @private
     */
    this._bindedSubmenuOff = null;

    /**
     * @description binded containerOff method
     * @private
     */
    this._bindedContainerOff = null;

    /**
     * @description active button element in submenu
     */
    this.submenuActiveButton = null;

    /**
     * @description active button element in container
     */
    this.containerActiveButton = null;

    /**
     * @description The elements array to be processed unvisible when the controllersOff function is executed (resizing, link modified button, table controller)
     */
    this.controllerArray = [];

    /**
     * @description The name of the plugin that called the currently active controller
     */
    this.currentControllerName = "";

    /**
     * @description The target element of current controller
     */
    this.currentControllerTarget = null;

    /**
     * @description The file component object of current selected file tag (component.get)
     */
    this.currentFileComponentInfo = null;

    /**
     * @description An array of buttons whose class name is not "se-code-view-enabled"
     */
    this.codeViewDisabledButtons = [];

    /**
     * @description An array of buttons whose class name is not "se-resizing-enabled"
     */
    this.resizingDisabledButtons = [];

    /**
     * @description active more layer element in submenu
     * @private
     */
    this._moreLayerActiveButton = null;

    /**
     * @description Tag whitelist RegExp object used in "_consistencyCheckOfHTML" method
     * ^(options._editorTagsWhitelist)$
     * @private
     */
    this._htmlCheckWhitelistRegExp = null;

    /**
     * @description Tag blacklist RegExp object used in "_consistencyCheckOfHTML" method
     * @private
     */
    this._htmlCheckBlacklistRegExp = null;

    /**
     * @description Editor tags whitelist (RegExp object)
     * helpers.converter.createTagsWhitelist(options._editorTagsWhitelist)
     */
    this.editorTagsWhitelistRegExp = null;

    /**
     * @description Editor tags blacklist (RegExp object)
     * helpers.converter.createTagsBlacklist(options.tagsBlacklist)
     */
    this.editorTagsBlacklistRegExp = null;

    /**
     * @description Tag whitelist when pasting (RegExp object)
     * helpers.converter.createTagsWhitelist(options.pasteTagsWhitelist)
     */
    this.pasteTagsWhitelistRegExp = null;

    /**
     * @description Tag blacklist when pasting (RegExp object)
     * helpers.converter.createTagsBlacklist(options.pasteTagsBlacklist)
     */
    this.pasteTagsBlacklistRegExp = null;

    /**
     * @description RegExp when using check disallowd tags. (b, i, ins, strike, s)
     * @private
     */
    this._disallowedTextTagsRegExp = null;

    /**
     * @description Is inline mode?
     * @private
     */
    this._isInline = null;

    /**
     * @description Is balloon|balloon-always mode?
     * @private
     */
    this._isBalloon = null;

    /**
     * @description Is balloon-always mode?
     * @private
     */
    this._isBalloonAlways = null;

    /**
     * @description Attributes whitelist used by the cleanHTML method
     * @private
     */
    this._attributesWhitelistRegExp = null;

    /**
     * @description Attributes blacklist used by the cleanHTML method
     * @private
     */
    this._attributesBlacklistRegExp = null;

    /**
     * @description Attributes of tags whitelist used by the cleanHTML method
     * @private
     */
    this._attributesTagsWhitelist = null;

    /**
     * @description Attributes of tags blacklist used by the cleanHTML method
     * @private
     */
    this._attributesTagsBlacklist = null;

    /**
     * @description binded controllersOff method
     * @private
     */
    this._bindControllersOff = null;

    /**
     * @description Variable that controls the "blur" event in the editor of inline or balloon mode when the focus is moved to submenu
     * @private
     */
    this._notHideToolbar = false;

    /**
     * @description Variables for controlling focus and blur events
     * @private
     */
    this._antiBlur = false;

    /**
     * @description Component line breaker element
     * @private
     */
    this._lineBreaker = null;

    /**
     * @description If true, (initialize, reset) all indexes of image, video information
     * @private
     */
    this._componentsInfoInit = true;
    this._componentsInfoReset = false;

    /**
     * @description Plugins array with "active" method.
     * "activePlugins" runs the "add" method when creating the editor.
     */
    this.activePlugins = null;

    /**
     * @description Information of tags that should maintain HTML structure, style, class name, etc. (In use by "math" plugin)
     * When inserting "html" such as paste, it is executed on the "html" to be inserted. (core.cleanHTML)
     * Basic Editor Actions:
     * 1. All classes not starting with "__se__" or "se-" in the editor are removed.
     * 2. The style of all tags except the "span" tag is removed from the editor.
     * "managedTagsInfo" structure ex:
     * managedTagsInfo: {
     *   query: ".__se__xxx, se-xxx"
     *   map: {
     *     "__se__xxx": method.bind(core),
     *     "se-xxx": method.bind(core),
     *   }
     * }
     * @example
     * Define in the following return format in the "managedTagInfo" function of the plugin.
     * managedTagInfo() => {
     *  return {
     *    className: "string", // Class name to identify the tag. ("__se__xxx", "se-xxx")
     *    // Change the html of the "element". ("element" is the element found with "className".)
     *    // "method" is executed by binding "core".
     *    method: function (element) {
     *      // this === core
     *      element.innerHTML = // (rendered html);
     *    }
     *  }
     * }
     */
    this.managedTagsInfo = null;

    /**
     * @description Array of "checkFileInfo" functions with the core bound
     * (Plugins with "checkFileInfo" and "resetFileInfo" methods)
     * "fileInfoPlugins" runs the "add" method when creating the editor.
     * "checkFileInfo" method is always call just before the "change" event.
     * @private
     */
    this._fileInfoPluginsCheck = null;

    /**
     * @description Array of "resetFileInfo" functions with the core bound
     * (Plugins with "checkFileInfo" and "resetFileInfo" methods)
     * "checkFileInfo" method is always call just before the "editorInstance.setOptions" method.
     * @private
     */
    this._fileInfoPluginsReset = null;

    /**
     * @description Variables for file component management
     * @private
     */
    this._fileManager = {
        tags: null,
        regExp: null,
        queryString: null,
        pluginRegExp: null,
        pluginMap: null
    };

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
    this.commandMap = null;

    /**
     * @description Style button related to edit area
     * @property {Element} fullScreen fullScreen button element
     * @property {Element} showBlocks showBlocks button element
     * @property {Element} codeView codeView button element
     * @private
     */
    this._styleCommandMap = null;

    /**
     * @description CSS properties related to style tags 
     * @private
     */
    this._commandMapStyles = {
        STRONG: ["font-weight"],
        U: ["text-decoration"],
        EM: ["font-style"],
        DEL: ["text-decoration"]
    };

    /**
     * @description Contains pairs of all "data-commands" and "elements" setted in toolbar over time
     * Used primarily to save and recover button states after the toolbar re-creation
     * Updates each "_cachingButtons()" invocation  
     */
    this.allCommandButtons = null;

    /**
     * @description Map of default command
     * @private
     */
    this._defaultCommand = {
        bold: options.textTags.bold,
        underline: options.textTags.underline,
        italic: options.textTags.italic,
        strike: options.textTags.strike,
        subscript: options.textTags.sub,
        superscript: options.textTags.sup
    };

    /**
     * @description Variables used internally in editor operation
     * @property {boolean} hasFocus Boolean value of whether the editor has focus
     * @property {boolean} isDisabled Boolean value of whether the editor is disabled
     * @property {boolean} isReadOnly Boolean value of whether the editor is readOnly
     * @property {boolean} isCodeView State of code view
     * @property {boolean} isFullScreen State of full screen
     * @property {number} innerHeight_fullScreen InnerHeight in editor when in full screen
     * @property {number} resizeClientY Remember the vertical size of the editor before resizing the editor (Used when calculating during resize operation)
     * @property {number} tabSize Indent size of tab (4)
     * @property {number} indentSize Indent size (25)px
     * @property {number} codeIndentSize Indent size of Code view mode (2)
     * @property {number} minResizingSize Minimum size of editing area when resized {number} (.se-wrapper-inner {min-height: 65px;} || 65)
     * @property {Array} currentNodes  An array of the current cursor's node structure
     * @private
     */
    this.status = {
        hasFocus: false,
        isDisabled: false,
        isReadOnly: false,
        isChanged: false,
        isCodeView: false,
        isFullScreen: false,
        innerHeight_fullScreen: 0,
        resizeClientY: 0,
        indentSize: 25,
        tabSize: 4,
        codeIndentSize: 2,
        minResizingSize: numbers.get((context.element.wysiwygFrame.style.minHeight || "65"), 0),
        currentNodes: [],
        currentNodesMap: [],
        _range: null,
        _selectionNode: null,
        _originCssText: context.element.topArea.style.cssText,
        _bodyOverflow: "",
        _editorAreaOriginCssText: "",
        _wysiwygOriginCssText: "",
        _codeOriginCssText: "",
        _fullScreenAttrs: {
            sticky: false,
            balloon: false,
            inline: false
        },
        _lineBreakComp: null,
        _lineBreakDir: ""
    };

    /************ Core init ************/
    // Create to sibling node
    let contextEl = context.element;
    let originEl = contextEl.originElement;
    let topEl = contextEl.topArea;
    originEl.style.display = "none";
    topEl.style.display = "block";

    // init
    if (options.iframe) {
        const inst = this;
        contextEl.wysiwygFrame.addEventListener("load", function () {
            converter._setIframeDocument(this, options);
            inst._editorInit(false, options.value);
        });
    }

    // insert editor element
    if (typeof originEl.nextElementSibling === "object") {
        originEl.parentNode.insertBefore(topEl, originEl.nextElementSibling);
    } else {
        originEl.parentNode.appendChild(topEl);
    }

    contextEl.editorArea.appendChild(contextEl.wysiwygFrame);
    contextEl = originEl = topEl = null;

    // init
    if (!options.iframe) {
        this._editorInit(false, options.value);
    }
}

Core.prototype = {
    /**
     * @description Save the current buttons states to "allCommandButtons" object
     */
    saveButtonStates: function () {
        if (!this.allCommandButtons) this.allCommandButtons = {};

        const currentButtons = this.context.element._buttonTray.querySelectorAll('.se-menu-list button[data-display]');
        for (let i = 0, element, command; i < currentButtons.length; i++) {
            element = currentButtons[i];
            command = element.getAttribute('data-command');

            this.allCommandButtons[command] = element;
        }
    },

    /**
     * @description Recover the current buttons states from "allCommandButtons" object
     */
    recoverButtonStates: function () {
        if (this.allCommandButtons) {
            const currentButtons = this.context.element._buttonTray.querySelectorAll('.se-menu-list button[data-display]');
            for (let i = 0, button, command, oldButton; i < currentButtons.length; i++) {
                button = currentButtons[i];
                command = button.getAttribute('data-command');

                oldButton = this.allCommandButtons[command];
                if (oldButton) {
                    button.parentElement.replaceChild(oldButton, button);
                    if (this.context.tool[command]) this.context.tool[command] = oldButton;
                }
            }
        }
    },

    /**
     * @description If the plugin is not added, add the plugin and call the 'add' function.
     * If the plugin is added call callBack function.
     * @param {string} pluginName The name of the plugin to call
     * @param {function} callBackFunction Function to be executed immediately after module call
     * @param {Element|null} target Plugin target button (This is not necessary if you have a button list when creating the editor)
     */
    callPlugin: function (pluginName, callBackFunction, target) {
        target = target || this.pluginCallButtons[pluginName];

        if (!this.plugins[pluginName]) {
            throw Error('[SUNEDITOR.core.callPlugin.fail] The called plugin does not exist or is in an invalid format. (pluginName:"' + pluginName + '")');
        } else if (!this.initPlugins[pluginName]) {
            this.plugins[pluginName] = new this.plugins[pluginName](this, target);
            this.initPlugins[pluginName] = true;
        } else if (typeof TargetPlugins[pluginName] === "object" && !!target) {
            this.initMenuTarget(pluginName, target, TargetPlugins[pluginName]);
        }

        if (this.plugins[pluginName].active && !this.commandMap[pluginName] && !!target) {
            this.commandMap[pluginName] = target;
            this.activePlugins.push(pluginName);
        }

        if (typeof callBackFunction === "function") callBackFunction();
    },

    /**
     * @description If the module is not added, add the module and call the "add" function
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
                if (typeof this.plugins[moduleName].add === "function") this.plugins[moduleName].add(this);
            }
        }
    },

    /**
     * @description Method for managing submenu element.
     * You must add the "submenu" element using the this method at custom plugin.
     * @param {string} pluginName Plugin name
     * @param {Element|null} target Target button
     * @param {Element} menu Submenu element
     */
    initMenuTarget: function (pluginName, target, menu) {
        if (!target) {
            TargetPlugins[pluginName] = menu;
        } else {
            this.context.element._menuTray.appendChild(menu);
            TargetPlugins[pluginName] = true;
            this._menuTray[target.getAttribute("data-command")] = menu;
        }
    },

    /**
     * @description Enable submenu
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

        if (this.plugins[submenuName].on) this.plugins[submenuName].on();
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
            domUtils.removeClass(this.submenuActiveButton, 'on');
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

        if (this.plugins[containerName].on) this.plugins[containerName].on();
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
            domUtils.removeClass(this.containerActiveButton, 'on');
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
        domUtils.addClass(element, 'on');

        const toolbar = this.context.element.toolbar;
        const toolbarW = toolbar.offsetWidth;
        const toolbarOffset = this.offset.getGlobal(this.context.element.toolbar);
        const menuW = menu.offsetWidth;
        const l = element.parentElement.offsetLeft + 3;

        // rtl
        if (this.options.rtl) {
            const elementW = element.offsetWidth;
            const rtlW = menuW > elementW ? menuW - elementW : 0;
            const rtlL = rtlW > 0 ? 0 : elementW - menuW;
            menu.style.left = (l - rtlW + rtlL) + 'px';
            if (toolbarOffset.left > this.offset.getGlobal(menu).left) {
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
        const scrollTop = this.offset.getGlobalScroll().top;

        const menuHeight_bottom = this._w.innerHeight - (toolbarTop - scrollTop + bt + element.parentElement.offsetHeight);
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
     * @description Disable more layer
     */
    moreLayerOff: function () {
        if (this._moreLayerActiveButton) {
            const layer = this.context.element.toolbar.querySelector('.' + this._moreLayerActiveButton.getAttribute('data-command'));
            layer.style.display = 'none';
            domUtils.removeClass(this._moreLayerActiveButton, 'on');
            this._moreLayerActiveButton = null;
        }
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
            if (!domUtils.hasClass(arg, 'se-controller')) {
                this.currentControllerTarget = arg;
                this.currentFileComponentInfo = this.component.get(arg);
                continue;
            }
            if (arg.style) {
                arg.style.display = 'block';
                if (this._shadowRoot && this._shadowRootControllerEventTarget.indexOf(arg) === -1) {
                    arg.addEventListener('mousedown', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    });
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
        this.context.element.lineBreaker_t.style.display = this.context.element.lineBreaker_b.style.display = 'none';
        this.status._lineBreakComp = null;

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
     * @param {string} position Type of position ("top" | "bottom")
     * When using the "top" position, there should not be an arrow on the controller.
     * When using the "bottom" position there should be an arrow on the controller.
     * @param {Object} addOffset These are the left and top values that need to be added specially. 
     * This argument is required. - {left: 0, top: 0}
     * Please enter the value based on ltr mode.
     * Calculated automatically in rtl mode.
     */
    setControllerPosition: function (controller, referEl, position, addOffset) {
        if (this.options.rtl) addOffset.left *= -1;

        const offset = this.offset.get(referEl);
        controller.style.visibility = 'hidden';
        controller.style.display = 'block';

        // Height value of the arrow element is 11px
        const topMargin = position === 'top' ? -(controller.offsetHeight + 2) : (referEl.offsetHeight + 12);
        controller.style.top = (offset.top + topMargin + addOffset.top) + 'px';

        const l = offset.left - this.context.element.wysiwygFrame.scrollLeft + addOffset.left;
        const controllerW = controller.offsetWidth;
        const referElW = referEl.offsetWidth;

        const allow = domUtils.hasClass(controller.firstElementChild, 'se-arrow') ? controller.firstElementChild : null;

        // rtl (Width value of the arrow element is 22px)
        if (this.options.rtl) {
            const rtlW = (controllerW > referElW) ? controllerW - referElW : 0;
            const rtlL = rtlW > 0 ? 0 : referElW - controllerW;
            controller.style.left = (l - rtlW + rtlL) + 'px';

            if (rtlW > 0) {
                if (allow) allow.style.left = ((controllerW - 14 < 10 + rtlW) ? (controllerW - 14) : (10 + rtlW)) + 'px';
            }

            const overSize = this.context.element.wysiwygFrame.offsetLeft - controller.offsetLeft;
            if (overSize > 0) {
                controller.style.left = '0px';
                if (allow) allow.style.left = overSize + 'px';
            }
        } else {
            controller.style.left = l + 'px';

            const overSize = this.context.element.wysiwygFrame.offsetWidth - (controller.offsetLeft + controllerW);
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
     * @param {string} command javascript execCommand function property
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
        this.selection.__focus();
        this.selection._init();
    },

    /**
     * @description Focus to wysiwyg area
     */
    focus: function () {
        if (this.context.element.wysiwygFrame.style.display === "none") return;

        if (this.options.iframe) {
            this.nativeFocus();
        } else {
            try {
                const range = this.selection.getRange();
                if (range.startContainer === range.endContainer && domUtils.isWysiwygFrame(range.startContainer)) {
                    const currentNode = range.commonAncestorContainer.children[range.startOffset];
                    if (!this.format.isLine(currentNode) && !this.component.is(currentNode)) {
                        const br = domUtils.createElement("BR");
                        const format = domUtils.createElement(this.options.defaultTag, null, br);
                        this.context.element.wysiwyg.insertBefore(format, currentNode);
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
        if (!focusEl) focusEl = this.context.element.wysiwyg.lastElementChild;

        const fileComponentInfo = this.component.get(focusEl);
        if (fileComponentInfo) {
            this.component.select(fileComponentInfo.target, fileComponentInfo.pluginName);
        } else if (focusEl) {
            focusEl = domUtils.getEdgeChild(
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
        if (this.options.iframe) {
            this.context.element.wysiwygFrame.blur();
        } else {
            this.context.element.wysiwyg.blur();
        }
    },

    /**
     * @description Show loading box
     */
    openLoading: function () {
        this.context.element.loading.style.display = 'block';
    },

    /**
     * @description Close loading box
     */
    closeLoading: function () {
        this.context.element.loading.style.display = 'none';
    },

    /**
     * @description Run plugin calls and basic commands.
     * @param {string} command Command string
     * @param {string} display Display type string ('command', 'submenu', 'dialog', 'container')
     * @param {Element} target The element of command button
     */
    actionCall: function (command, display, target) {
        // call plugins
        if (display) {
            if (/more/i.test(display)) {
                if (target !== this._moreLayerActiveButton) {
                    const layer = this.context.element.toolbar.querySelector('.' + command);
                    if (layer) {
                        if (this._moreLayerActiveButton) this.moreLayerOff();

                        this._moreLayerActiveButton = target;
                        layer.style.display = 'block';

                        this.toolbar._showBalloon();
                        this.toolbar._showInline();
                    }
                    domUtils.addClass(target, 'on');
                } else {
                    const layer = this.context.element.toolbar.querySelector('.' + this._moreLayerActiveButton.getAttribute('data-command'));
                    if (layer) {
                        this.moreLayerOff();

                        this.toolbar._showBalloon();
                        this.toolbar._showInline();
                    }
                }
                return;
            }

            if (/container/.test(display) && (this._menuTray[command] === null || target !== this.containerActiveButton)) {
                this.containerOn(target);
                return;
            }

            if (this.isReadOnly && domUtils.arrayIncludes(this.resizingDisabledButtons, target)) return;
            if (/submenu/.test(display) && (this._menuTray[command] === null || target !== this.submenuActiveButton)) {
                this.submenuOn(target);
                return;
            } else if (/dialog/.test(display)) {
                this.plugins[command].open();
                return;
            } else if (/command/.test(display)) {
                this.plugins[command].action();
            } else if (/fileBrowser/.test(display)) {
                this.plugins[command].open(null);
            }
        } // default command
        else if (command) {
            this.commandHandler(command, target);
        }

        if (/submenu/.test(display)) {
            this.submenuOff();
        } else if (!/command/.test(display)) {
            this.submenuOff();
            this.containerOff();
        }
    },

    /**
     * @description Execute command of command button(All Buttons except submenu and dialog)
     * (selectAll, codeView, fullScreen, indent, outdent, undo, redo, removeFormat, print, preview, showBlocks, save, bold, underline, italic, strike, subscript, superscript, copy, cut, paste)
     * @param {string} command Property of command button (data-value)
     * @param {Element|null} target The element of command button
     */
    commandHandler: function (command, target) {
        if (this.status.isReadOnly && !/copy|cut|selectAll|codeView|fullScreen|print|preview|showBlocks/.test(command)) return;

        switch (command) {
            case 'copy':
            case 'cut':
                this.execCommand(command);
                break;
            case 'paste':
                break;
            case 'selectAll':
                this.containerOff();
                const wysiwyg = this.context.element.wysiwyg;
                let first = domUtils.getEdgeChild(wysiwyg.firstChild, function (current) {
                    return current.childNodes.length === 0 || current.nodeType === 3;
                }, false) || wysiwyg.firstChild;
                let last = domUtils.getEdgeChild(wysiwyg.lastChild, function (current) {
                    return current.childNodes.length === 0 || current.nodeType === 3;
                }, true) || wysiwyg.lastChild;
                if (!first || !last) return;
                if (domUtils.isMedia(first)) {
                    const info = this.component.get(first);
                    const br = domUtils.createElement('BR');
                    const format = domUtils.createElement(this.options.defaultTag, null, br);
                    first = info ? info.component : first;
                    first.parentNode.insertBefore(format, first);
                    first = br;
                }
                if (domUtils.isMedia(last)) {
                    last = domUtils.createElement('BR');
                    wysiwyg.appendChild(domUtils.createElement(this.options.defaultTag, null, last));
                }
                this.selection.setRange(first, 0, last, last.textContent.length);
                break;
            case 'codeView':
                this.setCodeView(!this.status.isCodeView);
                break;
            case 'fullScreen':
                this.setFullScreen(!this.status.isFullScreen);
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
                this.format.removeStyleNode();
                this.focus();
                break;
            case 'print':
                this.print();
                break;
            case 'preview':
                this.preview();
                break;
            case 'showBlocks':
                this.setDisplayBlocks(!domUtils.hasClass(this.context.element.wysiwyg, 'se-show-block'));
                break;
            case 'dir':
                this.setDir(options.rtl ? 'ltr' : 'rtl');
                break;
            case 'dir_ltr':
                this.setDir('ltr');
                break;
            case 'dir_rtl':
                this.setDir('rtl');
                break;
            case 'save':
                if (typeof this.options.callBackSave === 'function') {
                    this.options.callBackSave(this.getContents(false), this.status.isChanged);
                } else if (this.status.isChanged && typeof this.events.save === 'function') {
                    this.events.save();
                } else {
                    throw Error('[SUNEDITOR.core.commandHandler.fail] Please register call back function in creation option. (callBackSave : Function)');
                }

                this.status.isChanged = false;
                if (this.context.buttons.save) this.context.buttons.save.setAttribute('disabled', true);
                break;
            default: // 'STRONG', 'U', 'EM', 'DEL', 'SUB', 'SUP'..
                command = this._defaultCommand[command.toLowerCase()] || command;
                if (!this.commandMap[command]) this.commandMap[command] = target;

                const nodesMap = this.status.currentNodesMap;
                const cmd = nodesMap.indexOf(command) > -1 ? null : domUtils.createElement(command);
                let removeNode = command;

                if (/^SUB$/i.test(command) && nodesMap.indexOf('SUP') > -1) {
                    removeNode = 'SUP';
                } else if (/^SUP$/i.test(command) && nodesMap.indexOf('SUB') > -1) {
                    removeNode = 'SUB';
                }

                this.format.applyStyleNode(cmd, this._commandMapStyles[command] || null, [removeNode], false);
                this.focus();
        }
    },

    /**
     * @description Add or remove the class name of "body" so that the code block is visible
     * @param {boolean} value true/false
     */
    setDisplayBlocks: function (value) {
        if (value) {
            domUtils.addClass(this.context.element.wysiwyg, 'se-show-block');
            domUtils.addClass(this._styleCommandMap.showBlocks, 'active');
        } else {
            domUtils.removeClass(this.context.element.wysiwyg, 'se-show-block');
            domUtils.removeClass(this._styleCommandMap.showBlocks, 'active');
        }
        this._resourcesStateChange();
    },

    /**
     * @description Changes to code view or wysiwyg view
     */
    setCodeView: function (value) {
        this.controllersOff();
        domUtils.setDisabled(value, this.codeViewDisabledButtons);

        if (!value) {
            if (!domUtils.isNonEditable(this.context.element.wysiwygFrame)) this._setCodeDataToEditor();
            this.context.element.wysiwygFrame.scrollTop = 0;
            this.context.element.code.style.display = 'none';
            this.context.element.wysiwygFrame.style.display = 'block';

            this.status._codeOriginCssText = this.status._codeOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: none');
            this.status._wysiwygOriginCssText = this.status._wysiwygOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: block');

            if (this.options.height === 'auto' && !this.options.codeMirrorEditor) this.context.element.code.style.height = '0px';

            this.status.isCodeView = false;

            if (!this.status.isFullScreen) {
                this._notHideToolbar = false;
                if (/balloon|balloon-always/i.test(this.options.mode)) {
                    this.context.element._arrow.style.display = '';
                    this._isInline = false;
                    this._isBalloon = true;
                    this.eventManager._hideToolbar();
                }
            }

            this.nativeFocus();
            domUtils.removeClass(this._styleCommandMap.codeView, 'active');

            // history stack
            if (!domUtils.isNonEditable(this.context.element.wysiwygFrame)) {
                this.history.push(false);
                this.history._resetCachingButton();
            }
        } else {
            this._setEditorDataToCodeView();
            this.status._codeOriginCssText = this.status._codeOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: block');
            this.status._wysiwygOriginCssText = this.status._wysiwygOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: none');

            if (this.status.isFullScreen) this.context.element.code.style.height = '100%';
            else if (this.options.height === 'auto' && !this.options.codeMirrorEditor) this.context.element.code.style.height = this.context.element.code.scrollHeight > 0 ? (this.context.element.code.scrollHeight + 'px') : 'auto';

            if (this.options.codeMirrorEditor) this.options.codeMirrorEditor.refresh();

            this.status.isCodeView = true;

            if (!this.status.isFullScreen) {
                this._notHideToolbar = true;
                if (this._isBalloon) {
                    this.context.element._arrow.style.display = 'none';
                    this.context.element.toolbar.style.left = '';
                    this._isInline = true;
                    this._isBalloon = false;
                    this.toolbar._showInline();
                }
            }

            this.status._range = null;
            this.context.element.code.focus();
            domUtils.addClass(this._styleCommandMap.codeView, 'active');
        }

        this._checkPlaceholder();
        if (this.status.isReadOnly) domUtils.setDisabled(true, this.resizingDisabledButtons);

        // user event
        if (typeof this.events.setCodeView === 'function') this.events.setCodeView(this.status.isCodeView);
    },

    /**
     * @description Convert the data of the code view and put it in the WYSIWYG area.
     * @private
     */
    _setCodeDataToEditor: function () {
        const code_html = this._getCodeView();

        if (this.options.fullPage) {
            const parseDocument = this._parser.parseFromString(code_html, 'text/html');
            const headChildren = parseDocument.head.children;

            for (let i = 0, len = headChildren.length; i < len; i++) {
                if (/^script$/i.test(headChildren[i].tagName)) {
                    parseDocument.head.removeChild(headChildren[i]);
                    i--, len--;
                }
            }

            let headers = parseDocument.head.innerHTML;
            if (!parseDocument.head.querySelector('link[rel="stylesheet"]') || (this.options.height === 'auto' && !parseDocument.head.querySelector('style'))) {
                headers += converter._setIframeCssTags(this.options);
            }

            this._wd.head.innerHTML = headers;
            this._wd.body.innerHTML = this.convertContentsForEditor(parseDocument.body.innerHTML);

            const attrs = parseDocument.body.attributes;
            for (let i = 0, len = attrs.length; i < len; i++) {
                if (attrs[i].name === 'contenteditable') continue;
                this._wd.body.setAttribute(attrs[i].name, attrs[i].value);
            }
            if (!domUtils.hasClass(this._wd.body, 'sun-editor-editable')) {
                const editableClasses = this.options._editableClass.split(' ');
                for (let i = 0; i < editableClasses.length; i++) {
                    domUtils.addClass(this._wd.body, this.options._editableClass[i]);
                }
            }
        } else {
            this.context.element.wysiwyg.innerHTML = code_html.length > 0 ? this.convertContentsForEditor(code_html) : '<' + this.options.defaultTag + '><br></' + this.options.defaultTag + '>';
        }
    },

    /**
     * @description Convert the data of the WYSIWYG area and put it in the code view area.
     * @private
     */
    _setEditorDataToCodeView: function () {
        const codeContents = this.convertHTMLForCodeView(this.context.element.wysiwyg, false);
        let codeValue = '';

        if (this.options.fullPage) {
            const attrs = domUtils.getAttributesToString(this._wd.body, null);
            codeValue = '<!DOCTYPE html>\n<html>\n' + this._wd.head.outerHTML.replace(/>(?!\n)/g, '>\n') + '<body ' + attrs + '>\n' + codeContents + '</body>\n</html>';
        } else {
            codeValue = codeContents;
        }

        this.context.element.code.style.display = 'block';
        this.context.element.wysiwygFrame.style.display = 'none';

        this._setCodeView(codeValue);
    },

    /**
     * @description Changes to full screen or default screen
     * @param {Element} element full screen button
     * @param {boolean} value true/false
     */
    setFullScreen: function (value) {
        const topArea = this.context.element.topArea;
        const toolbar = this.context.element.toolbar;
        const editorArea = this.context.element.editorArea;
        const wysiwygFrame = this.context.element.wysiwygFrame;
        const code = this.context.element.code;
        const _var = this.status;

        this.controllersOff();
        const wasToolbarHidden = (toolbar.style.display === 'none' || (this._isInline && !this._inlineToolbarAttr.isShow));

        if (value) {
            _var.isFullScreen = true;

            _var._fullScreenAttrs.inline = this._isInline;
            _var._fullScreenAttrs.balloon = this._isBalloon;

            if (this._isInline || this._isBalloon) {
                this._isInline = false;
                this._isBalloon = false;
            }

            if (!!this.options.toolbarContainer) this.context.element.relative.insertBefore(toolbar, editorArea);

            topArea.style.position = 'fixed';
            topArea.style.top = '0';
            topArea.style.left = '0';
            topArea.style.width = '100%';
            topArea.style.maxWidth = '100%';
            topArea.style.height = '100%';
            topArea.style.zIndex = '2147483647';

            if (this.context.element._stickyDummy.style.display !== ('none' && '')) {
                _var._fullScreenAttrs.sticky = true;
                this.context.element._stickyDummy.style.display = 'none';
                domUtils.removeClass(toolbar, 'se-toolbar-sticky');
            }

            _var._bodyOverflow = this._d.body.style.overflow;
            this._d.body.style.overflow = 'hidden';

            _var._editorAreaOriginCssText = editorArea.style.cssText;
            _var._wysiwygOriginCssText = wysiwygFrame.style.cssText;
            _var._codeOriginCssText = code.style.cssText;

            editorArea.style.cssText = toolbar.style.cssText = '';
            wysiwygFrame.style.cssText = (wysiwygFrame.style.cssText.match(/\s?display(\s+)?:(\s+)?[a-zA-Z]+;/) || [''])[0];
            code.style.cssText = (code.style.cssText.match(/\s?display(\s+)?:(\s+)?[a-zA-Z]+;/) || [''])[0];
            toolbar.style.width = wysiwygFrame.style.height = code.style.height = '100%';
            toolbar.style.position = 'relative';
            toolbar.style.display = 'block';

            _var.innerHeight_fullScreen = (this._w.innerHeight - toolbar.offsetHeight);
            editorArea.style.height = (_var.innerHeight_fullScreen - this.options.fullScreenOffset) + 'px';

            if (this.options.iframe && this.options.height === 'auto') {
                editorArea.style.overflow = 'auto';
                this._iframeAutoHeight();
            }

            this.context.element.topArea.style.marginTop = this.options.fullScreenOffset + 'px';

            if (this._styleCommandMap.fullScreen) {
                domUtils.changeElement(this._styleCommandMap.fullScreen.firstElementChild, this.icons.reduction);
                domUtils.addClass(this._styleCommandMap.fullScreen, 'active');
            }
        } else {
            _var.isFullScreen = false;

            wysiwygFrame.style.cssText = _var._wysiwygOriginCssText;
            code.style.cssText = _var._codeOriginCssText;
            toolbar.style.cssText = '';
            editorArea.style.cssText = _var._editorAreaOriginCssText;
            topArea.style.cssText = _var._originCssText;
            this._d.body.style.overflow = _var._bodyOverflow;

            if (this.options.height === 'auto' && !this.options.codeMirrorEditor) this._codeViewAutoHeight();

            if (!!this.options.toolbarContainer) this.options.toolbarContainer.appendChild(toolbar);

            if (this.options.stickyToolbar > -1) {
                domUtils.removeClass(toolbar, 'se-toolbar-sticky');
            }

            if (_var._fullScreenAttrs.sticky && !this.options.toolbarContainer) {
                _var._fullScreenAttrs.sticky = false;
                this.context.element._stickyDummy.style.display = 'block';
                domUtils.addClass(toolbar, "se-toolbar-sticky");
            }

            this._isInline = _var._fullScreenAttrs.inline;
            this._isBalloon = _var._fullScreenAttrs.balloon;
            this.toolbar._showInline();
            if (!!this.options.toolbarContainer) domUtils.removeClass(toolbar, 'se-toolbar-balloon');

            this.toolbar._resetSticky();
            this.context.element.topArea.style.marginTop = '';

            if (this._styleCommandMap.fullScreen) {
                domUtils.changeElement(this._styleCommandMap.fullScreen.firstElementChild, this.icons.expansion);
                domUtils.removeClass(this._styleCommandMap.fullScreen, 'active');
            }
        }

        if (wasToolbarHidden) functions.toolbar.hide();

        // user event
        if (typeof this.events.setFullScreen === 'function') this.events.setFullScreen(this.status.isFullScreen);
    },

    /**
     * @description Prints the current contents of the editor.
     */
    print: function () {
        const iframe = domUtils.createElement('IFRAME', {
            style: "display: none;"
        });
        this._d.body.appendChild(iframe);

        const contentsHTML = this.options.printTemplate ? this.options.printTemplate.replace(/\{\{\s*contents\s*\}\}/i, this.getContents(true)) : this.getContents(true);
        const printDocument = domUtils.getIframeDocument(iframe);
        const wDoc = this._wd;

        if (this.options.iframe) {
            const arrts = this.options._printClass !== null ? 'class="' + this.options._printClass + '"' : this.options.fullPage ? domUtils.getAttributesToString(wDoc.body, ['contenteditable']) : 'class="' + this.options._editableClass + '"';

            printDocument.write('' +
                '<!DOCTYPE html><html>' +
                '<head>' +
                wDoc.head.innerHTML +
                '</head>' +
                '<body ' + arrts + '>' + contentsHTML + '</body>' +
                '</html>'
            );
        } else {
            const links = this._d.head.getElementsByTagName('link');
            const styles = this._d.head.getElementsByTagName('style');
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
                '<body class="' + (this.options._printClass !== null ? this.options._printClass : this.options._editableClass) + '">' + contentsHTML + '</body>' +
                '</html>'
            );
        }

        this.openLoading();
        this._w.setTimeout(function () {
            try {
                iframe.focus();
                // IE or Edge, Chromium
                if (env.isIE || env.isEdge || env.isChromium || !!this._d.documentMode || !!this._w.StyleMedia) {
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
                this.closeLoading();
                domUtils.remove(iframe);
            }
        }.bind(this), 1000);
    },

    /**
     * @description Open the preview window.
     */
    preview: function () {
        this.submenuOff();
        this.containerOff();
        this.controllersOff();

        const contentsHTML = this.options.previewTemplate ? this.options.previewTemplate.replace(/\{\{\s*contents\s*\}\}/i, this.getContents(true)) : this.getContents(true);
        const windowObject = this._w.open('', '_blank');
        windowObject.mimeType = 'text/html';
        const wDoc = this._wd;

        if (this.options.iframe) {
            const arrts = this.options._printClass !== null ? 'class="' + this.options._printClass + '"' : this.options.fullPage ? domUtils.getAttributesToString(wDoc.body, ['contenteditable']) : 'class="' + this.options._editableClass + '"';

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
            const links = this._d.head.getElementsByTagName('link');
            const styles = this._d.head.getElementsByTagName('style');
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
                '<title>' + this.lang.toolbar.preview + '</title>' +
                linkHTML +
                '</head>' +
                '<body class="' + (this.options._printClass !== null ? this.options._printClass : this.options._editableClass) + '" style="margin:10px auto !important; height:auto !important; outline:1px dashed #ccc;">' + contentsHTML + '</body>' +
                '</html>'
            );
        }
    },

    /**
     * @description Set direction to "rtl" or "ltr".
     * @param {String} dir "rtl" or "ltr"
     */
    setDir: function (dir) {
        const rtl = dir === 'rtl';
        const changeDir = this._prevRtl !== rtl;
        const el = this.context.element;
        const buttons = this.context.buttons;
        this._prevRtl = this.options.rtl = rtl;

        if (changeDir) {
            // align buttons
            if (this.plugins.align) {
                this.plugins.align.exchangeDir.call(this);
            }
            // indent buttons
            if (buttons.indent) domUtils.changeElement(buttons.indent.firstElementChild, icons.indent);
            if (buttons.outdent) domUtils.changeElement(buttons.outdent.firstElementChild, icons.outdent);
        }

        if (rtl) {
            domUtils.addClass(el.topArea, 'se-rtl');
            domUtils.addClass(el.wysiwygFrame, 'se-rtl');
        } else {
            domUtils.removeClass(el.topArea, 'se-rtl');
            domUtils.removeClass(el.wysiwygFrame, 'se-rtl');
        }

        const lineNodes = domUtils.getListChildren(el.wysiwyg, function (current) {
            return this.format.isLine(current) && (current.style.marginRight || current.style.marginLeft || current.style.textAlign);
        }.bind(this));

        for (let i = 0, len = lineNodes.length, n, l, r; i < len; i++) {
            n = lineNodes[i];
            // indent margin
            r = n.style.marginRight;
            l = n.style.marginLeft;
            if (r || l) {
                n.style.marginRight = l;
                n.style.marginLeft = r;
            }
            // text align
            r = n.style.textAlign;
            if (r === 'left') n.style.textAlign = 'right';
            else if (r === 'right') n.style.textAlign = 'left';
        }


        if (buttons.dir) {
            domUtils.changeTxt(buttons.dir.querySelector('.se-tooltip-text'), this.lang.toolbar[options.rtl ? 'dir_ltr' : 'dir_rtl']);
            domUtils.changeElement(buttons.dir.firstElementChild, icons[this.options.rtl ? 'dir_ltr' : 'dir_rtl']);
        }

        if (buttons.dir_ltr) {
            if (rtl) domUtils.removeClass(buttons.dir_ltr, 'active');
            else domUtils.addClass(buttons.dir_ltr, 'active');
        }

        if (buttons.dir_rtl) {
            if (rtl) domUtils.addClass(buttons.dir_rtl, 'active');
            else domUtils.removeClass(buttons.dir_rtl, 'active');
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

        if (!this.status.isCodeView) {
            this.context.element.wysiwyg.innerHTML = convertValue;
            // history stack
            this.history.push(false);
        } else {
            const value = this.convertHTMLForCodeView(convertValue, false);
            this._setCodeView(value);
        }
    },

    /**
     * @description Sets the contents of the iframe's head tag and body tag when using the "iframe" or "fullPage" option.
     * @param {Object} ctx { head: HTML string, body: HTML string}
     */
    setIframeContents: function (ctx) {
        if (!this.options.iframe) return false;
        if (ctx.head) this._wd.head.innerHTML = ctx.head.replace(/<script[\s\S]*>[\s\S]*<\/script>/gi, '');
        if (ctx.body) this._wd.body.innerHTML = this.convertContentsForEditor(ctx.body);
    },

    /**
     * @description Gets the current contents
     * @param {boolean} onlyContents Return only the contents of the body without headers when the "fullPage" option is true
     * @returns {Object}
     */
    getContents: function (onlyContents) {
        const renderHTML = domUtils.createElement('DIV', null, this.convertHTMLForCodeView(this.context.element.wysiwyg, true));
        const figcaptions = domUtils.getListChildren(renderHTML, function (current) {
            return /FIGCAPTION/i.test(current.nodeName);
        });

        for (let i = 0, len = figcaptions.length; i < len; i++) {
            figcaptions[i].removeAttribute('contenteditable');
        }

        if (this.options.fullPage && !onlyContents) {
            const attrs = domUtils.getAttributesToString(this._wd.body, ['contenteditable']);
            return '<!DOCTYPE html><html>' + this._wd.head.outerHTML + '<body ' + attrs + '>' + renderHTML.innerHTML + '</body></html>';
        } else {
            return renderHTML.innerHTML;
        }
    },

    /**
     * @todo getContents와 병합
     * @description Gets the current contents with containing parent div(div.sun-editor-editable).
     * <div class="sun-editor-editable">{contents}</div>
     * @param {Boolean} onlyContents Return only the contents of the body without headers when the "fullPage" option is true
     * @returns {Object}
     */
    getFullContents: function (onlyContents) {
        return '<div class="sun-editor-editable' + this.options.rtl ? ' se-rtl' : '' + '">' + this.getContents(onlyContents) + '</div>';
    },

    /**
     * @description Returns HTML string according to tag type and configuration.
     * Use only "cleanHTML"
     * @param {Node} node Node
     * @param {boolean} requireFormat If true, text nodes that do not have a format node is wrapped with the format tag.
     * @private
     */
    _makeLine: function (node, requireFormat) {
        const defaultTag = this.options.defaultTag;
        // element
        if (node.nodeType === 1) {
            if (DisallowedTags(node)) return '';
            if (!requireFormat || (this.format.isLine(node) || this.format.isBlock(node) || this.component.is(node) || domUtils.isMedia(node) || (domUtils.isAnchor(node) && domUtils.isMedia(node.firstElementChild)))) {
                return node.outerHTML;
            } else {
                return '<' + defaultTag + '>' + node.outerHTML + '</' + defaultTag + '>';
            }
        }
        // text
        if (node.nodeType === 3) {
            if (!requireFormat) return converter.htmlToEntity(node.textContent);
            const textArray = node.textContent.split(/\n/g);
            let html = '';
            for (let i = 0, tLen = textArray.length, text; i < tLen; i++) {
                text = textArray[i].trim();
                if (text.length > 0) html += '<' + defaultTag + '>' + converter.htmlToEntity(text) + '</' + defaultTag + '>';
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
     * @param {string} text 
     * @returns {string} HTML string
     * @private
     */
    _tagConvertor: function (text) {
        if (!this._disallowedTextTagsRegExp) return text;

        const ec = this.options._textTagsMap;
        return text.replace(this._disallowedTextTagsRegExp, function (m, t, n, p) {
            return t + (typeof ec[n] === 'string' ? ec[n] : n) + (p ? ' ' + p : '');
        });
    },

    /**
     * @description Delete disallowed tags
     * @param {string} html HTML string
     * @returns {string}
     * @private
     */
    _deleteDisallowedTags: function (html) {
        return html
            .replace(/\n/g, '')
            .replace(/<(script|style)[\s\S]*>[\s\S]*<\/(script|style)>/gi, '')
            .replace(/<[a-z0-9]+\:[a-z0-9]+[^>^\/]*>[^>]*<\/[a-z0-9]+\:[a-z0-9]+>/gi, '')
            .replace(this.editorTagsWhitelistRegExp, '')
            .replace(this.editorTagsBlacklistRegExp, '');
    },

    /**
     * @description Fix tags that do not fit the editor format.
     * @param {Element} documentFragment Document fragment "DOCUMENT_FRAGMENT_NODE" (nodeType === 11)
     * @param {RegExp} htmlCheckWhitelistRegExp Editor tags whitelist (core._htmlCheckWhitelistRegExp)
     * @param {RegExp} htmlCheckBlacklistRegExp Editor tags blacklist (core._htmlCheckBlacklistRegExp)
     * @param {Boolean} lowLevelCheck Row level check
     * @private
     */
    _consistencyCheckOfHTML: function (documentFragment, htmlCheckWhitelistRegExp, htmlCheckBlacklistRegExp, lowLevelCheck) {
        /**
         * It is can use ".children(domUtils.getListChildren)" to exclude text nodes, but "documentFragment.children" is not supported in IE.
         * So check the node type and exclude the text no (current.nodeType !== 1)
         */
        const removeTags = [],
            emptyTags = [],
            wrongList = [],
            withoutFormatCells = [];

        // wrong position
        const wrongTags = domUtils.getListChildNodes(documentFragment, function (current) {
            if (current.nodeType !== 1) {
                if (domUtils.isList(current.parentNode)) removeTags.push(current);
                return false;
            }

            // white list
            if (htmlCheckBlacklistRegExp.test(current.nodeName) || (!htmlCheckWhitelistRegExp.test(current.nodeName) && current.childNodes.length === 0 && this.format.isNotCheckingNode(current))) {
                removeTags.push(current);
                return false;
            }

            const nrtag = !domUtils.getParentElement(current, this.isNotCheckingNode);
            // empty tags
            if ((!domUtils.isTable(current) && !domUtils.isListCell(current) && !domUtils.isAnchor(current)) && (this.format.isLine(current) || this.format.isBlock(current) || this.format.isTextStyleNode(current)) && current.childNodes.length === 0 && nrtag) {
                emptyTags.push(current);
                return false;
            }

            // wrong list
            if (domUtils.isList(current.parentNode) && !domUtils.isList(current) && !domUtils.isListCell(current)) {
                wrongList.push(current);
                return false;
            }

            // table cells
            if (domUtils.isTableCell(current)) {
                const fel = current.firstElementChild;
                if (!this.format.isLine(fel) && !this.format.isBlock(fel) && !this.component.is(fel)) {
                    withoutFormatCells.push(current);
                    return false;
                }
            }

            const result = current.parentNode !== documentFragment && nrtag &&
                ((domUtils.isListCell(current) && !domUtils.isList(current.parentNode)) ||
                    (lowLevelCheck && (this.format.isLine(current) || this.component.is(current)) && !this.format.isBlock(current.parentNode) && !domUtils.getParentElement(current, this.component.is)));

            return result;
        }.bind(this));

        for (let i = 0, len = removeTags.length; i < len; i++) {
            this.removeItem(removeTags[i]);
        }

        const checkTags = [];
        for (let i = 0, len = wrongTags.length, t, p; i < len; i++) {
            t = wrongTags[i];
            p = t.parentNode;
            if (!p || !p.parentNode) continue;

            if (this.getParentElement(t, this.isListCell)) {
                const cellChildren = t.childNodes;
                for (let j = cellChildren.length - 1; len >= 0; j--) {
                    p.insertBefore(t, cellChildren[j]);
                }
                checkTags.push(t);
            } else {
                p.parentNode.insertBefore(t, p);
                checkTags.push(p);
            }
        }

        for (let i = 0, len = checkTags.length, t; i < len; i++) {
            t = checkTags[i];
            if (this.onlyZeroWidthSpace(t.textContent.trim())) {
                this.removeItem(t);
            }
        }

        for (let i = 0, len = emptyTags.length; i < len; i++) {
            this.removeItem(emptyTags[i]);
        }

        for (let i = 0, len = wrongList.length, t, tp, children, p; i < len; i++) {
            t = wrongList[i];
            p = t.parentNode;
            if (!p) continue;

            tp = this.createElement('LI');

            if (this.isFormatElement(t)) {
                children = t.childNodes;
                while (children[0]) {
                    tp.appendChild(children[0]);
                }
                p.insertBefore(tp, t);
                this.removeItem(t);
            } else {
                t = t.nextSibling;
                tp.appendChild(wrongList[i]);
                p.insertBefore(tp, t);
            }
        }

        for (let i = 0, len = withoutFormatCells.length, t, f; i < len; i++) {
            t = withoutFormatCells[i];
            f = this.createElement('DIV');
            f.innerHTML = (t.textContent.trim().length === 0 && t.children.length === 0) ? '<br>' : t.innerHTML;
            t.innerHTML = f.outerHTML;
        }
    },

    /**
     * @description Gets the clean HTML code for editor
     * @param {string} html HTML string
     * @param {String|RegExp|null} whitelist Regular expression of allowed tags.
     * RegExp object is create by helper.converter.createTagsWhitelist method. (core.pasteTagsWhitelistRegExp)
     * @param {String|RegExp|null} blacklist Regular expression of disallowed tags.
     * RegExp object is create by helper.converter.createTagsBlacklist method. (core.pasteTagsBlacklistRegExp)
     * @returns {string}
     */
    cleanHTML: function (html, whitelist, blacklist) {
        html = this._deleteDisallowedTags(this._parser.parseFromString(html, 'text/html').body.innerHTML).replace(/(<[a-zA-Z0-9\-]+)[^>]*(?=>)/g, CleanTags.bind(this, true));

        const dom = this._d.createRange().createContextualFragment(html, true);
        try {
            this._consistencyCheckOfHTML(dom, this._htmlCheckWhitelistRegExp, this._htmlCheckBlacklistRegExp, true);
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
            if (t.nodeType === 1 && !this.format.isTextStyleNode(t) && !domUtils.isBreak(t) && !DisallowedTags(t)) {
                requireFormat = true;
                break;
            }
        }

        for (let i = 0, len = domTree.length; i < len; i++) {
            cleanHTML += this._makeLine(domTree[i], requireFormat);
        }

        cleanHTML = this.node.removeWhiteSpace(cleanHTML);

        if (!cleanHTML) {
            cleanHTML = html;
        } else {
            if (whitelist) cleanHTML = cleanHTML.replace(typeof whitelist === 'string' ? converter.createTagsWhitelist(whitelist) : whitelist, '');
            if (blacklist) cleanHTML = cleanHTML.replace(typeof blacklist === 'string' ? converter.createTagsBlacklist(blacklist) : blacklist, '');
        }

        return this._tagConvertor(cleanHTML);
    },

    /**
     * @description Converts contents into a format that can be placed in an editor
     * @param {string} contents contents
     * @returns {string}
     */
    convertContentsForEditor: function (contents) {
        contents = this._deleteDisallowedTags(this._parser.parseFromString(contents, 'text/html').body.innerHTML).replace(/(<[a-zA-Z0-9\-]+)[^>]*(?=>)/g, CleanTags.bind(this, false));
        const dom = this._d.createRange().createContextualFragment(contents, false);

        try {
            this._consistencyCheckOfHTML(dom, this._htmlCheckWhitelistRegExp, this._htmlCheckBlacklistRegExp, false);
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
        let cleanHTML = '',
            p = null;
        for (let i = 0, t; i < domTree.length; i++) {
            t = domTree[i];

            if (!util.isFormatElement(t) && !util.isComponent(t) && !util.isMedia(t)) {
                if (!p) p = util.createElement(options.defaultTag);
                p.appendChild(t);
                i--;
                if (domTree[i + 1] && !util.isFormatElement(domTree[i + 1])) {
                    continue;
                } else {
                    t = p;
                    p = null;
                }
            }

            if (p) {
                cleanHTML += this._makeLine(p, true);
                p = null;
            }
            cleanHTML += this._makeLine(t, true);
        }
        if (p) cleanHTML += this._makeLine(p, true);

        if (cleanHTML.length === 0) return '<' + this.options.defaultTag + '><br></' + this.options.defaultTag + '>';

        cleanHTML = this.node.removeWhiteSpace(cleanHTML);
        return this._tagConvertor(cleanHTML);
    },

    /**
     * @description Converts wysiwyg area element into a format that can be placed in an editor of code view mode
     * @param {Element|String} html WYSIWYG element (context.element.wysiwyg) or HTML string.
     * @param {Boolean} comp If true, does not line break and indentation of tags.
     * @returns {String}
     */
    convertHTMLForCodeView: function (html, comp) {
        let returnHTML = "";
        const wRegExp = this._w.RegExp;
        const brReg = new wRegExp("^(BLOCKQUOTE|PRE|TABLE|THEAD|TBODY|TR|TH|TD|OL|UL|IMG|IFRAME|VIDEO|AUDIO|FIGURE|FIGCAPTION|HR|BR|CANVAS|SELECT)$", "i");
        const wDoc = typeof html === "string" ? this._d.createRange().createContextualFragment(html) : html;
        const isFormat = function (current) {
            return this.format.isLine(current) || this.component.is(current);
        }.bind(this);
        const brChar = comp ? "" : "\n";

        let indentSize = comp ? 0 : this.status.codeIndent * 1;
        indentSize = indentSize > 0 ? new this._w.Array(indentSize + 1).join(" ") : "";

        (function recursionFunc(element, indent) {
            const children = element.childNodes;
            const elementRegTest = brReg.test(element.nodeName);
            const elementIndent = (elementRegTest ? indent : "");

            for (let i = 0, len = children.length, node, br, lineBR, nodeRegTest, tag, tagIndent; i < len; i++) {
                node = children[i];
                nodeRegTest = brReg.test(node.nodeName);
                br = nodeRegTest ? brChar : '';
                lineBR = isFormat(node) && !elementRegTest && !/^(TH|TD)$/i.test(element.nodeName) ? brChar : "";

                if (node.nodeType === 8) {
                    returnHTML += "\n<!-- " + node.textContent.trim() + " -->" + br;
                    continue;
                }
                if (node.nodeType === 3) {
                    if (!domUtils.isList(node.parentElement)) returnHTML += converter.htmlToEntity(/^\n+$/.test(node.data) ? "" : node.data);
                    continue;
                }
                if (node.childNodes.length === 0) {
                    returnHTML += (/^HR$/i.test(node.nodeName) ? brChar : "") + (/^PRE$/i.test(node.parentElement.nodeName) && /^BR$/i.test(node.nodeName) ? "" : elementIndent) + node.outerHTML + br;
                    continue;
                }

                if (!node.outerHTML) { // IE
                    returnHTML += new _w.XMLSerializer().serializeToString(node);
                } else {
                    tag = node.nodeName.toLowerCase();
                    tagIndent = elementIndent || nodeRegTest ? indent : "";
                    returnHTML += (lineBR || (elementRegTest ? "" : br)) + tagIndent + node.outerHTML.match(wRegExp("<" + tag + "[^>]*>", "i"))[0] + br;
                    recursionFunc(node, indent + indentSize, "");
                    returnHTML += (/\n$/.test(returnHTML) ? tagIndent : "") + "</" + tag + ">" + (lineBR || br || elementRegTest ? brChar : "" || /^(TH|TD)$/i.test(node.nodeName) ? brChar : "");
                }
            }
        }(wDoc, ""));

        return returnHTML.trim() + brChar;
    },

    /**
     * @description Add or reset option property (Editor is reloaded)
     * @param {Object} _options Options
     */
    setOptions: function (_options) {
        this.eventManager._removeAllEvents();
        this._resetComponents();

        domUtils.removeClass(this._styleCommandMap.showBlocks, 'active');
        domUtils.removeClass(this._styleCommandMap.codeView, 'active');
        this.status.isCodeView = false;
        this._iframeAuto = null;

        this.plugins = _options.plugins || this.plugins; //@todo plugins don't reset
        const mergeOptions = [this.options, _options].reduce(function (init, option) {
            for (let key in option) {
                if (!option.hasOwnProperty(key)) continue;
                if (key === 'plugins' && option[key] && init[key]) {
                    let i = init[key],
                        o = option[key];
                    i = i.length ? i : this._w.Object.keys(i).map(function (name) {
                        return i[name];
                    });
                    o = o.length ? o : this._w.Object.keys(o).map(function (name) {
                        return o[name];
                    });
                    init[key] = (o.filter(function (val) {
                        return i.indexOf(val) === -1;
                    })).concat(i);
                } else {
                    init[key] = option[key];
                }
            }
            return init;
        }, {});

        const el = this.context.element;
        const _initHTML = el.wysiwyg.innerHTML;

        // set option
        const cons = Constructor._setOptions(mergeOptions, this.context, this.options);

        if (cons.callButtons) {
            this.pluginCallButtons = cons.callButtons;
            this.initPlugins = {};
        }

        if (cons.plugins) {
            this.plugins = cons.plugins;
        }

        // reset context
        if (el._menuTray.children.length === 0) this._menuTray = {};
        this.toolbar._responsiveButtons = cons.toolbar.responsiveButtons;
        this.options = mergeOptions; //@todo option, lang.. dont't reset
        this.lang = this.options.lang;

        if (this.options.iframe) {
            el.wysiwygFrame.addEventListener('load', function () {
                converter._setIframeDocument(this, this.options);
                this._setOptionsInit(el, _initHTML);
            });
        }

        el.editorArea.appendChild(el.wysiwygFrame);

        if (!this.options.iframe) {
            this._setOptionsInit(el, _initHTML);
        }
    },

    /**
     * @description Set "options.defaultStyle" style.
     * Define the style of the edit area
     * It can also be defined with the "setOptions" method, but the "setDefaultStyle" method does not render the editor again.
     * @param {string} style Style string
     */
    setDefaultStyle: function (style) {
        const newStyles = this.options._editorStyles = converter._setDefaultOptionStyle(this.options, style);
        const el = this.context.element;

        // top area
        el.topArea.style.cssText = newStyles.top;
        // code view
        el.code.style.cssText = this.options._editorStyles.frame;
        el.code.style.display = 'none';
        if (this.options.height === 'auto') {
            el.code.style.overflow = 'hidden';
        } else {
            el.code.style.overflow = '';
        }
        // wysiwyg frame
        if (!this.options.iframe) {
            el.wysiwygFrame.style.cssText = newStyles.frame + newStyles.editor;
        } else {
            el.wysiwygFrame.style.cssText = newStyles.frame;
            el.wysiwyg.style.cssText = newStyles.editor;
        }
    },

    /**
     * @description Copying the contents of the editor to the original textarea and execute onSave callback.
     */
    save: function () {
        this.context.element.originElement.value = this.getContents(false);
        // user event
        if (typeof this.events.onSave === 'function') {
            this.events.onSave(content, core);
            return;
        }
    },

    /**
     * @description Gets only the text of the suneditor contents
     * @returns {string}
     */
    getText: function () {
        return this.context.element.wysiwyg.textContent;
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
     * @param {string} pluginName Plugin name (image, video, audio)
     * @returns {Array}
     */
    getFilesInfo: function (pluginName) {
        return this.context[pluginName] ? this.context[pluginName]._infoList : [];
    },

    /**
     * @description Add contents to the suneditor
     * @param {string} contents Contents to Input
     */
    appendContents: function (contents) {
        const convertValue = this.convertContentsForEditor(contents);

        if (!this.status.isCodeView) {
            const temp = domUtils.createElement('DIV', null, convertValue);
            const wysiwyg = this.context.element.wysiwyg;
            const children = temp.children;
            for (let i = 0, len = children.length; i < len; i++) {
                if (children[i]) {
                    wysiwyg.appendChild(children[i]);         
                }
            }
        } else {
            this._setCodeView(this._getCodeView() + '\n' + this.convertHTMLForCodeView(convertValue, false));
        }

        // history stack
        this.history.push(false);
    },

    /**
     * @description Switch to or off "ReadOnly" mode.
     * @param {boolean} value "readOnly" boolean value.
     */
    readOnly: function (value) {
        this.status.isReadOnly = value;
        domUtils.setDisabled(!!value, this.resizingDisabledButtons);

        if (value) {
            /** off menus */
            this.controllersOff();
            if (this.submenuActiveButton && this.submenuActiveButton.disabled) this.submenuOff();
            if (this._moreLayerActiveButton && this._moreLayerActiveButton.disabled) this.moreLayerOff();
            if (this.containerActiveButton && this.containerActiveButton.disabled) this.containerOff();
            if (this.modalForm) this.plugins.dialog.close.call(this);

            this.context.element.code.setAttribute("readOnly", "true");
            domUtils.addClass(this.context.element.wysiwygFrame, 'se-read-only');
        } else {
            this.context.element.code.removeAttribute("readOnly");
            domUtils.removeClass(this.context.element.wysiwygFrame, 'se-read-only');
        }

        if (this.options.codeMirrorEditor) this.options.codeMirrorEditor.setOption('readOnly', !!value);
    },

    /**
     * @description Disable the suneditor
     */
    disable: function () {
        this.toolbar.disable();
        this.controllersOff();
        if (this.modalForm) this.plugins.dialog.close.call(this);

        this.context.element.wysiwyg.setAttribute('contenteditable', false);
        this.isDisabled = true;

        if (this.options.codeMirrorEditor) {
            this.options.codeMirrorEditor.setOption('readOnly', true);
        } else {
            this.context.element.code.setAttribute('disabled', 'disabled');
        }
    },

    /**
     * @description Enable the suneditor
     */
    enable: function () {
        this.toolbar.enable();
        this.context.element.wysiwyg.setAttribute('contenteditable', true);
        this.isDisabled = false;

        if (this.options.codeMirrorEditor) {
            this.options.codeMirrorEditor.setOption('readOnly', false);
        } else {
            this.context.element.code.removeAttribute('disabled');
        }
    },

    /**
     * @description Show the suneditor
     */
    show: function () {
        const topAreaStyle = this.context.element.topArea.style;
        if (topAreaStyle.display === 'none') topAreaStyle.display = this.options.display;
    },

    /**
     * @description Hide the suneditor
     */
    hide: function () {
        this.context.element.topArea.style.display = 'none';
    },

    /**
     * @description Destroy the suneditor
     */
    destroy: function () {
        /** off menus */
        this.submenuOff();
        this.containerOff();
        this.controllersOff();
        if (this.notice) this.notice.close();
        if (this.modalForm) this.plugins.dialog.close();

        /** remove history */
        this.history._destroy();

        /** remove event listeners */
        this.eventManager._removeAllEvents();

        /** remove element */
        domUtils.remove(this.context.element.toolbar);
        domUtils.remove(this.context.element.topArea);

        /** remove object reference */
        for (let k in this.context) {
            if (this.context.hasOwnProperty(k)) delete this.context[k];
        }
        for (let k in this.pluginCallButtons) {
            if (this.pluginCallButtons.hasOwnProperty(k)) delete this.pluginCallButtons[k];
        }

        /** remove user object */
        for (let k in this) {
            if (this.hasOwnProperty(k)) delete this[k];
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
     * @param {string} value HTML string
     * @private
     */
    _setCodeView: function (value) {
        if (this.options.codeMirrorEditor) {
            this.options.codeMirrorEditor.getDoc().setValue(value);
        } else {
            this.context.element.code.value = value;
        }
    },

    /**
     * @description Get method in the code view area
     * @private
     */
    _getCodeView: function () {
        return this.options.codeMirrorEditor ? this.options.codeMirrorEditor.getDoc().getValue() : this.context.element.code.value;
    },

    /**
     * @description Initializ core variable
     * @param {boolean} reload Is relooad?
     * @param {string} _initHTML initial html string
     * @private
     */
    _init: function (reload, _initHTML) {
        const _w = this._w;
        const wRegExp = _w.RegExp;
        const options = this.options;
        const context = this.context;
        const plugins = this.plugins;

        this._ww = options.iframe ? context.element.wysiwygFrame.contentWindow : _w;
        this._wd = this._d;
        this._charTypeHTML = options.charCounterType === 'byte-html';
        this.wwComputedStyle = _w.getComputedStyle(context.element.wysiwyg);
        this._editorHeight = context.element.wysiwygFrame.offsetHeight;

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
        const allowTextTags = !options.addTagsWhitelist ? [] : options.addTagsWhitelist.split('|').filter(function (v) {
            return /b|i|ins|s|strike/i.test(v);
        });
        for (let i = 0; i < allowTextTags.length; i++) {
            disallowTextTags.splice(disallowTextTags.indexOf(allowTextTags[i].toLowerCase()), 1);
        }
        this._disallowedTextTagsRegExp = disallowTextTags.length === 0 ? null : new wRegExp('(<\\/?)(' + disallowTextTags.join('|') + ')\\b\\s*([^>^<]+)?\\s*(?=>)', 'gi');

        // set whitelist
        const getRegList = function (str, str2) {
            return !str ? '^' : (str === '*' ? '[a-z-]+' : (!str2 ? str : (str + '|' + str2)));
        };
        // tags
        const defaultAttr = 'contenteditable|colspan|rowspan|target|href|download|rel|src|alt|class|type|controls|data-format|data-size|data-file-size|data-file-name|data-origin|data-align|data-image-link|data-rotate|data-proportion|data-percentage|origin-size|data-exp|data-font-size';
        this._allowHTMLComments = options._editorTagsWhitelist.indexOf('//') > -1 || options._editorTagsWhitelist === '*';
        // html check
        this._htmlCheckWhitelistRegExp = new wRegExp('^(' + getRegList(options._editorTagsWhitelist.replace('|//', ''), '') + ')$', 'i');
        this._htmlCheckBlacklistRegExp = new wRegExp('^(' + (options.tagsBlacklist || '^') + ')$', 'i');
        // tags
        this.editorTagsWhitelistRegExp = converter.createTagsWhitelist(getRegList(options._editorTagsWhitelist.replace('|//', '|<!--|-->'), ''));
        this.editorTagsBlacklistRegExp = converter.createTagsBlacklist(options.tagsBlacklist.replace('|//', '|<!--|-->'));
        // paste tags
        this.pasteTagsWhitelistRegExp = converter.createTagsWhitelist(getRegList(options.pasteTagsWhitelist, ''));
        this.pasteTagsBlacklistRegExp = converter.createTagsBlacklist(options.pasteTagsBlacklist);
        // attributes
        const regEndStr = '\\s*=\\s*(\")[^\"]*\\1';
        const _wAttr = options.attributesWhitelist;
        let tagsAttr = {};
        let allAttr = '';
        if (!!_wAttr) {
            for (let k in _wAttr) {
                if (!_wAttr.hasOwnProperty(k) || /^on[a-z]+$/i.test(_wAttr[k])) continue;
                if (k === 'all') {
                    allAttr = getRegList(_wAttr[k], defaultAttr);
                } else {
                    tagsAttr[k] = new wRegExp('\\s(?:' + getRegList(_wAttr[k], '') + ')' + regEndStr, 'ig');
                }
            }
        }

        this._attributesWhitelistRegExp = new wRegExp('\\s(?:' + (allAttr || defaultAttr) + ')' + regEndStr, 'ig');
        this._attributesTagsWhitelist = tagsAttr;

        // blacklist
        const _bAttr = options.attributesBlacklist;
        tagsAttr = {};
        allAttr = '';
        if (!!_bAttr) {
            for (let k in _bAttr) {
                if (!_bAttr.hasOwnProperty(k)) continue;
                if (k === 'all') {
                    allAttr = getRegList(_bAttr[k], '');
                } else {
                    tagsAttr[k] = new wRegExp('\\s(?:' + getRegList(_bAttr[k], '') + ')' + regEndStr, 'ig');
                }
            }
        }

        this._attributesBlacklistRegExp = new wRegExp('\\s(?:' + (allAttr || '^') + ')' + regEndStr, 'ig');
        this._attributesTagsBlacklist = tagsAttr;

        // set modes
        this._isInline = /inline/i.test(options.mode);
        this._isBalloon = /balloon|balloon-always/i.test(options.mode);
        this._isBalloonAlways = /balloon-always/i.test(options.mode);

        // Excute history function
        this.history = history(this, this._onChange_historyStack.bind(this));

        // classes install
        this.offset = new Offset(this);
        this.component = new Component(this);
        this.format = new Format(this);
        this.node = new Node(this);
        this.toolbar = new Toolbar(this);
        this.shortcuts = new Shortcuts(this);
        this.selection = new Selection(this);
        this.char = new Char(this);
        ClassesInterface.call(this.offset, this);
        ClassesInterface.call(this.component, this);
        ClassesInterface.call(this.format, this);
        ClassesInterface.call(this.node, this);
        ClassesInterface.call(this.toolbar, this);
        ClassesInterface.call(this.shortcuts, this);
        ClassesInterface.call(this.selection, this);
        ClassesInterface.call(this.char, this);

        // events callback
        this.events = new Events(this);

        // caching buttons
        this._cachingButtons();

        // file components
        this._fileInfoPluginsCheck = [];
        this._fileInfoPluginsReset = [];

        // text components
        this.managedTagsInfo = {
            query: '',
            map: {}
        };
        const managedClass = [];

        // Command and file plugins registration
        this.activePlugins = [];
        this._fileManager.tags = [];
        this._fileManager.pluginMap = {};

        // plugins install
        let filePluginRegExp = [];
        let plugin, button;
        for (let key in plugins) {
            if (!plugins.hasOwnProperty(key)) continue;
            plugin = plugins[key];
            button = this.pluginCallButtons[key];
            this.callPlugin(key, null, button);

            if (typeof plugin.checkFileInfo === 'function' && typeof plugin.resetFileInfo === 'function') {
                this._fileInfoPluginsCheck.push(plugin.checkFileInfo.bind(this));
                this._fileInfoPluginsReset.push(plugin.resetFileInfo.bind(this));
            }

            if (_w.Array.isArray(plugin.fileTags)) {
                const fileTags = plugin.fileTags;
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
        this._fileManager.regExp = new wRegExp('^(' + (this._fileManager.tags.join('|') || '^') + ')$', 'i');
        this._fileManager.pluginRegExp = new wRegExp('^(' + (filePluginRegExp.length === 0 ? '^' : filePluginRegExp.join('|')) + ')$', 'i');

        // cache editor's element
        this.status._originCssText = context.element.topArea.style.cssText;
        this._placeholder = context.element.placeholder;
        this._lineBreaker = context.element.lineBreaker;
        this._lineBreakerButton = this._lineBreaker.querySelector('button');

        // event manager, notice
        this.eventManager = new EventManager(this);
        this.notice = new Notice(this);

        // Init, validate
        if (options.iframe) {
            this._wd = context.element.wysiwygFrame.contentDocument;
            context.element.wysiwyg = this._wd.body;
            if (options._editorStyles.editor) context.element.wysiwyg.style.cssText = options._editorStyles.editor;
            if (options.height === 'auto') this._iframeAuto = this._wd.body;
        }

        this._initWysiwygArea(reload, _initHTML);
        this.setDir(options.rtl ? 'rtl' : 'ltr');
    },

    /**
     * @description Caching basic buttons to use
     * @private
     */
    _cachingButtons: function () {
        this.codeViewDisabledButtons = this.context.element._buttonTray.querySelectorAll('.se-menu-list button[data-display]:not([class~="se-code-view-enabled"]):not([data-display="MORE"])');
        this.resizingDisabledButtons = this.context.element._buttonTray.querySelectorAll('.se-menu-list button[data-display]:not([class~="se-resizing-enabled"]):not([data-display="MORE"])');

        this.saveButtonStates();

        const buttons = this.context.buttons;
        this.commandMap = {
            SUB: buttons.subscript,
            SUP: buttons.superscript,
            OUTDENT: buttons.outdent,
            INDENT: buttons.indent
        };
        this.commandMap[this.options.textTags.bold.toUpperCase()] = buttons.bold;
        this.commandMap[this.options.textTags.underline.toUpperCase()] = buttons.underline;
        this.commandMap[this.options.textTags.italic.toUpperCase()] = buttons.italic;
        this.commandMap[this.options.textTags.strike.toUpperCase()] = buttons.strike;

        this._styleCommandMap = {
            fullScreen: buttons.fullScreen,
            showBlocks: buttons.showBlocks,
            codeView: buttons.codeView
        };
    },

    /**
     * @description Initializ wysiwyg area (Only called from core._init)
     * @param {boolean} reload Is relooad?
     * @param {string} _initHTML initial html string
     * @private
     */
    _initWysiwygArea: function (reload, _initHTML) {
        this.context.element.wysiwyg.innerHTML = reload ? _initHTML : this.convertContentsForEditor(typeof _initHTML === 'string' ? _initHTML : this.context.element.originElement.value);
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
        if (this.status.hasFocus) this.eventManager.applyTagEffect();
        this.status.isChanged = true;
        if (this.context.buttons.save) this.context.buttons.save.removeAttribute('disabled');
        // user event
        if (this.events.onChange) this.events.onChange(this.getContents(true));
        if (this.context.element.toolbar.style.display === 'block') this.toolbar._showBalloon();
    },

    /**
     * @description Modify the height value of the iframe when the height of the iframe is automatic.
     * @private
     */
    _iframeAutoHeight: function () {
        if (this._iframeAuto) {
            this._w.setTimeout(function () {
                this.context.element.wysiwygFrame.style.height = this._iframeAuto.offsetHeight + 'px';
            }.bind(this));
        }

        if (this._iframeAuto) {
            this._w.setTimeout(function () {
                const h = this._iframeAuto.offsetHeight;
                this.context.element.wysiwygFrame.style.height = h + 'px';
                if (env.isIE) this.__callResizeFunction(h, null);
            }.bind(this));
        } else if (env.isIE) {
            this.__callResizeFunction(this.context.element.wysiwygFrame.offsetHeight, null);
        }
    },

    __callResizeFunction(h, resizeObserverEntry) {
        h = h === -1 ? resizeObserverEntry.borderBoxSize[0].blockSize : h;
        if (this._editorHeight !== h) {
            if (typeof this.events.onResizeEditor === 'function') this.events.onResizeEditor(h, this._editorHeight, core, resizeObserverEntry);
            this._editorHeight = h;
        }
    },

    _codeViewAutoHeight: function () {
        if (this.status.isFullScreen) return;
        this.context.element.code.style.height = this.context.element.code.scrollHeight + "px";
    },

    /**
     * @description Set display property when there is placeholder.
     * @private
     */
    _checkPlaceholder: function () {
        if (this._placeholder) {
            if (this.status.isCodeView) {
                this._placeholder.style.display = 'none';
                return;
            }

            const wysiwyg = this.context.element.wysiwyg;
            if (!unicode.onlyZeroWidthSpace(wysiwyg.textContent) || wysiwyg.querySelector(domUtils._allowedEmptyNodeList) || (wysiwyg.innerText.match(/\n/g) || '').length > 1) {
                this._placeholder.style.display = 'none';
            } else {
                this._placeholder.style.display = 'block';
            }
        }
    },

    /**
     * @description Initialization after "setOptions"
     * @param {Object} el context.element
     * @param {string} _initHTML Initial html string
     * @private
     */
    _setOptionsInit: function (el, _initHTML) {
        this.context = Context(el.originElement, this._getConstructed(el), this.options); //@todo context don't reset
        this._componentsInfoReset = true;
        this._editorInit(true, _initHTML);
    },

    /**
     * @description Initializ editor
     * @param {boolean} reload Is relooad?
     * @param {string} _initHTML initial html string
     * @private
     */
    _editorInit: function (reload, _initHTML) {
        // initialize core and add event listeners
        this._init(reload, _initHTML);
        this.eventManager._addEvent();
        this.char.display();
        this.toolbar._offSticky();
        this.toolbar._resetSticky();

        // toolbar visibility
        this.context.element.toolbar.style.visibility = '';

        this._checkComponents();
        this._componentsInfoInit = false;
        this._componentsInfoReset = false;

        this.history.reset(true);
        this._resourcesStateChange();

        this._w.setTimeout(function () {
            // observer
            if (this.eventManager._resizeObserver) this.eventManager._resizeObserver.observe(this.context.element.wysiwygFrame);
            if (this.eventManager._toolbarObserver) this.eventManager._toolbarObserver.observe(this.context.element._toolbarShadow);
            // user event
            if (typeof this.events.onload === 'function') this.events.onload(reload);
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
            _toolbarShadow: contextEl._toolbarShadow,
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
    },

    Constructor: Core
};

/**
 * @description Object for managing submenu elements
 * @private
 */
const TargetPlugins = {};

/**
 * @description Check disallowed tags
 * @param {Node} element Element to check
 * @returns {boolean}
 * @private
 */
function DisallowedTags(element) {
    return /^(meta|script|link|style|[a-z]+\:[a-z]+)$/i.test(element.nodeName);
}

/**
 * @description Tag and tag attribute check RegExp function. (used by "cleanHTML" and "convertContentsForEditor")
 * @param {boolean} lowLevelCheck Low level check
 * @param {string} m RegExp value
 * @param {string} t RegExp value
 * @returns {string}
 * @private
 */
function CleanTags(lowLevelCheck, m, t) {
    if (/^<[a-z0-9]+\:[a-z0-9]+/i.test(m)) return m;

    let v = null;
    const tagName = t.match(/(?!<)[a-zA-Z0-9\-]+/)[0].toLowerCase();

    // blacklist
    const bAttr = this._attributesTagsBlacklist[tagName];
    if (bAttr) m = m.replace(bAttr, '');
    else m = m.replace(this._attributesBlacklistRegExp, '');

    // whitelist
    const wAttr = this._attributesTagsWhitelist[tagName];
    if (wAttr) v = m.match(wAttr);
    else v = m.match(this._attributesWhitelistRegExp);

    // anchor
    if (!lowLevelCheck || /<a\b/i.test(t)) {
        const sv = m.match(/(?:(?:id|name)\s*=\s*(?:"|')[^"']*(?:"|'))/g);
        if (sv) {
            if (!v) v = [];
            v.push(sv[0]);
        }
    }

    // span
    if ((!lowLevelCheck || /<span/i.test(t)) && (!v || !/style=/i.test(v.toString()))) {
        const sv = m.match(/style\s*=\s*(?:"|')[^"']*(?:"|')/);
        if (sv) {
            if (!v) v = [];
            v.push(sv[0]);
        }
    }

    // img
    if (/<img/i.test(t)) {
        let w = '',
            h = '';
        const sv = m.match(/style\s*=\s*(?:"|')[^"']*(?:"|')/);
        if (!v) v = [];
        if (sv) {
            w = sv[0].match(/width:(.+);/);
            w = numbers.get(w ? w[1] : '', -1) || '';
            h = sv[0].match(/height:(.+);/);
            h = numbers.get(h ? h[1] : '', -1) || '';
        }

        if (!w || !h) {
            const avw = m.match(/width\s*=\s*((?:"|')[^"']*(?:"|'))/);
            const avh = m.match(/height\s*=\s*((?:"|')[^"']*(?:"|'))/);
            if (avw || avh) {
                w = !w ? numbers.get(avw ? avw[1] : '') || '' : w;
                h = !h ? numbers.get(avh ? avh[1] : '') || '' : h;
            }
        }
        v.push('data-origin="' + (w + ',' + h) + '"');
    }

    if (v) {
        for (let i = 0, len = v.length; i < len; i++) {
            if (lowLevelCheck && /^class="(?!(__se__|se-|katex))/.test(v[i])) continue;
            t += ' ' + (/^(?:href|src)\s*=\s*('|"|\s)*javascript\s*\:/i.test(v[i]) ? '' : v[i]);
        }
    }

    return t;
}

export default Core;