import Helper, {
    global,
    env,
    converter,
    unicode,
    domUtils,
    numbers
} from "../helper";
import Constructor from "./constructor";
import Context from "./context";
import EventManager from "./eventManager";

// base
import history from "./base/history";
import Events from "./base/events";

// classes
import Char from "./classes/char";
import Component from "./classes/component";
import Format from "./classes/format";
import Node from "./classes/node";
import Offset from "./classes/offset";
import Selection from "./classes/selection";
import Shortcuts from "./classes/shortcuts";
import Toolbar from "./classes/toolbar";
import Menu from "./classes/menu";
import Notice from "./classes/notice";

// interface
import EditorInterface from "../interface/editor";

const _parser = new global._w.DOMParser();

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
 * @description Tag and tag attribute check RegExp function. (used by "cleanHTML" and "convertContentForEditor")
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
    const bAttr = this._attributeBlacklist[tagName];
    if (bAttr) m = m.replace(bAttr, '');
    else m = m.replace(this._attributeBlacklistRegExp, '');

    // whitelist
    const wAttr = this._attributeWhitelist[tagName];
    if (wAttr) v = m.match(wAttr);
    else v = m.match(this._attributeWhitelistRegExp);

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
const Core = function (context, pluginCallButtons, plugins, lang, options, _responsiveButtons) {
    const _d = context.element.originElement.ownerDocument || global._d;
    const _w = _d.defaultView || global._w;

    /**
     * @description Document object
     * @type {Document}
     */
    this._d = _d;

    /**
     * @description Window object
     * @type {Window}
     */
    this._w = _w;

    /**
     * @description Document object of the iframe if created as an iframe || _d
     * @type {Document}
     */
    this._wd = null;

    /**
     * @description Window object of the iframe if created as an iframe || _w
     * @type {Window}
     */
    this._ww = null;

    /**
     * @description Editor options
     * @type {Object.<string, any>}
     */
    this.options = options;

    /**
     * @description Loaded plugins
     * @type {Object.<string, any>}
     */
    this.plugins = plugins || {};

    /**
     * @description Elements and user options parameters of the suneditor
     */
    this.context = context;

    /**
     * @description Default icons object
     * @type {Object.<string, string>}
     */
    this.icons = options.icons;

    /**
     * @description loaded language
     * @type {Object.<string, any>}
     */
    this.lang = lang;

    /**
     * @description History object for undo, redo
     */
    this.history = null;

    /**
     * @description Helper util
     */
    this.helper = Helper;

    /**
     * @description Closest ShadowRoot to editor if found
     * @type {ShadowRoot}
     */
    this.shadowRoot = null;

    /**
     * @description Computed style of the wysiwyg area (window.getComputedStyle(context.element.wysiwyg))
     */
    this.wwComputedStyle = null;

    /**
     * @description Variables used internally in editor operation
     * @property {boolean} hasFocus Boolean value of whether the editor has focus
     * @property {boolean} isDisabled Boolean value of whether the editor is disabled
     * @property {boolean} isReadOnly Boolean value of whether the editor is readOnly
     * @property {boolean} isCodeView State of code view
     * @property {boolean} isFullScreen State of full screen
     * @property {number} tabSize Indent size of tab (4)
     * @property {number} indentSize Indent size (25)px
     * @property {number} codeIndentSize Indent size of Code view mode (2)
     * @property {Array} currentNodes  An element array of the current cursor's node structure
     * @property {Array} currentNodesMap  An element name array of the current cursor's node structure
     */
    this.status = {
        hasFocus: false,
        isDisabled: false,
        isReadOnly: false,
        isChanged: false,
        isCodeView: false,
        isFullScreen: false,
        indentSize: 25,
        tabSize: 4,
        codeIndentSize: 2,
        currentNodes: [],
        currentNodesMap: [],
        _range: null,
        _selectionNode: null,
        _minHeight: numbers.get((context.element.wysiwygFrame.style.minHeight || "65"), 0),
        _resizeClientY: 0,
        _lineBreakComp: null,
        _lineBreakDir: ""
    };

    // ----- Properties not shared with coreInterface -----
    /**
     * @description Whether the plugin is initialized
     */
    this.initPlugins = {};

    /**
     * @description Plugins array with "active" method.
     * "activePlugins" runs the "add" method when creating the editor.
     */
    this.activePlugins = null;

    /**
     * @description The selection node (selection.getNode()) to which the effect was last applied
     */
    this.effectNode = null;

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

    // ----- private properties -----
    /**
     * @description Plugin buttons
     * @private
     */
    this._pluginCallButtons = pluginCallButtons;

    /**
     * @description Block controller mousedown events in "shadowRoot" environment
     * @private
     */
    this._shadowRootControllerEventTarget = null;

    /**
     * @description Tag whitelist RegExp object used in "_consistencyCheckOfHTML" method
     * ^(options._editorElementWhitelist)$
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
     * helper.converter.createElementWhitelist(options._editorElementWhitelist)
     * @private
     */
    this._elementWhitelistRegExp = null;

    /**
     * @description Editor tags blacklist (RegExp object)
     * helper.converter.createElementBlacklist(options.elementBlacklist)
     * @private
     */
    this._elementBlacklistRegExp = null;

    /**
     * @description RegExp when using check disallowd tags. (b, i, ins, strike, s)
     * @private
     */
    this._disallowedStyleNodesRegExp = null;

    /**
     * @description Button List in Responsive Toolbar.
     * @private
     */
    this._responsiveButtons = _responsiveButtons;

    /**
     * @description Property related to rtl and ltr conversions.
     * @private
     */
    this._prevRtl = options.rtl;

    /**
     * @description Property related to editor resizing.
     * @private
     */
    this._editorHeight = 0;

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
    this._attributeWhitelistRegExp = null;

    /**
     * @description Attributes blacklist used by the cleanHTML method
     * @private
     */
    this._attributeBlacklistRegExp = null;

    /**
     * @description Attributes of tags whitelist used by the cleanHTML method
     * @private
     */
    this._attributeWhitelist = null;

    /**
     * @description Attributes of tags blacklist used by the cleanHTML method
     * @private
     */
    this._attributeBlacklist = null;

    /**
     * @description Variable that controls the "blur" event in the editor of inline or balloon mode when the focus is moved to dropdown
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
     * @description Information of tags that should maintain HTML structure, style, class name, etc. (In use by "math" plugin)
     * When inserting "html" such as paste, it is executed on the "html" to be inserted. (core.cleanHTML)
     * Basic Editor Actions:
     * 1. All classes not starting with "__se__" or "se-" in the editor are removed.
     * 2. The style of all tags except the "span" tag is removed from the editor.
     * "_managedElementInfo" structure ex:
     * _managedElementInfo: {
     *   query: ".__se__xxx, se-xxx"
     *   map: {
     *     "__se__xxx": method.bind(core),
     *     "se-xxx": method.bind(core),
     *   }
     * }
     * @example
     * Define in the following return format in the "_managedElementInfo" function of the plugin.
     * _managedElementInfo() => {
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
     * @private
     */
    this._managedElementInfo = null;

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
     * @private
     */
    this._commandMap = null;

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
     * @description FullScreen and codeView relative status
     */
    this._transformStatus = {
        editorOriginCssText: context.element.topArea.style.cssText,
        bodyOverflow: "",
        editorAreaOriginCssText: "",
        wysiwygOriginCssText: "",
        codeOriginCssText: "",
        fullScreenInnerHeight: 0,
        fullScreenSticky: false,
        fullScreenBalloon: false,
        fullScreenInline: false
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
     * @description If the plugin is not added, add the plugin and call the 'add' function.
     * If the plugin is added call callBack function.
     * @param {string} pluginName The name of the plugin to call
     * @param {Element|null} target Plugin target button (This is not necessary if you have a button list when creating the editor)
     */
    registerPlugin: function (pluginName, target) {
        target = target || this._pluginCallButtons[pluginName];

        if (!this.plugins[pluginName]) {
            throw Error('[SUNEDITOR.core.registerPlugin.fail] The called plugin does not exist or is in an invalid format. (pluginName:"' + pluginName + '")');
        } else if (!this.initPlugins[pluginName]) {
            this.plugins[pluginName] = new this.plugins[pluginName](this, target);
            this.initPlugins[pluginName] = true;
        }

        if (this.plugins[pluginName].active && !this._commandMap[pluginName] && !!target) {
            this._commandMap[pluginName] = target;
            this.activePlugins.push(pluginName);
        }
    },

    /**
     * @todo
     * @description If the module is not added, add the module and call the "add" function
     * @param {Array} moduleArray module object's Array
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
     * @description javascript execCommand
     * @param {string} command javascript execCommand function property
     * @param {Boolean|undefined} showDefaultUI javascript execCommand function property
     * @param {string|undefined} value javascript execCommand function property
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
     * @param {string} type Display type string ('command', 'dropdown', 'dialog', 'container')
     * @param {Element} target The element of command button
     */
    runPlugin: function (command, type, target) {
        if (type) {
            if (/more/i.test(type)) {
                if (target !== this.menu.currentMoreLayerActiveButton) {
                    const layer = this.context.element.toolbar.querySelector('.' + command);
                    if (layer) {
                        this.menu._moreLayerOn(target, layer);
                        this.toolbar._showBalloon();
                        this.toolbar._showInline();
                    }
                    domUtils.addClass(target, 'on');
                } else if (this.menu.currentMoreLayerActiveButton) {
                    this.menu._moreLayerOff();
                    this.toolbar._showBalloon();
                    this.toolbar._showInline();
                }
                return;
            }

            if (/container/.test(type) && (this.menu._menuTrayMap[command] === null || target !== this.menu.currentContainerActiveButton)) {
                this.menu.containerOn(target);
                return;
            }

            if (this.isReadOnly && domUtils.arrayIncludes(this.resizingDisabledButtons, target)) return;
            if (/dropdown/.test(type) && (this.menu._menuTrayMap[command] === null || target !== this.menu.currentDropdownActiveButton)) {
                this.menu.dropdownOn(target);
                return;
            } else if (/dialog/.test(type)) {
                this.plugins[command].open();
                return;
            } else if (/command/.test(type)) {
                this.plugins[command].action();
            } else if (/fileBrowser/.test(type)) {
                this.plugins[command].open(null);
            }
        } else if (command) {
            this.commandHandler(command, target);
        }

        if (/dropdown/.test(type)) {
            this.menu.dropdownOff();
        } else if (!/command/.test(type)) {
            this.menu.dropdownOff();
            this.menu.containerOff();
        }
    },

    /**
     * @description Execute command of command button(All Buttons except dropdown and dialog)
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
                // @todo
                break;
            case 'selectAll':
                this.menu.containerOff();
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
                this.format.removeTextStyle();
                this.focus();
                break;
            case 'print':
                this.print();
                break;
            case 'preview':
                this.preview();
                break;
            case 'showBlocks':
                this.showBlocks(!domUtils.hasClass(this.context.element.wysiwyg, 'se-show-block'));
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
                    this.options.callBackSave(this.getContent(false), this.status.isChanged);
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
                if (!this._commandMap[command]) this._commandMap[command] = target;

                const nodesMap = this.status.currentNodesMap;
                const cmd = nodesMap.indexOf(command) > -1 ? null : domUtils.createElement(command);
                let removeNode = command;

                if (/^SUB$/i.test(command) && nodesMap.indexOf('SUP') > -1) {
                    removeNode = 'SUP';
                } else if (/^SUP$/i.test(command) && nodesMap.indexOf('SUB') > -1) {
                    removeNode = 'SUB';
                }

                this.format.applyTextStyle(cmd, this._commandMapStyles[command] || null, [removeNode], false);
                this.focus();
        }
    },

    /**
     * @description Add or remove the class name of "body" so that the code block is visible
     * @param {boolean} value true/false
     */
    showBlocks: function (value) {
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
        this.menu.controllerOff();
        domUtils.setDisabled(value, this.codeViewDisabledButtons);
        const _var = this._transformStatus;

        if (!value) {
            if (!domUtils.isNonEditable(this.context.element.wysiwygFrame)) this._setCodeDataToEditor();
            this.context.element.wysiwygFrame.scrollTop = 0;
            this.context.element.code.style.display = 'none';
            this.context.element.wysiwygFrame.style.display = 'block';

            _var.codeOriginCssText = _var.codeOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: none');
            _var.wysiwygOriginCssText = _var.wysiwygOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: block');

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
            _var.codeOriginCssText = _var.codeOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: block');
            _var.wysiwygOriginCssText = _var.wysiwygOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: none');

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
            const parseDocument = _parser.parseFromString(code_html, 'text/html');
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
            this._wd.body.innerHTML = this.convertContentForEditor(parseDocument.body.innerHTML);

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
            this.context.element.wysiwyg.innerHTML = code_html.length > 0 ? this.convertContentForEditor(code_html) : '<' + this.options.defaultTag + '><br></' + this.options.defaultTag + '>';
        }
    },

    /**
     * @description Convert the data of the WYSIWYG area and put it in the code view area.
     * @private
     */
    _setEditorDataToCodeView: function () {
        const codeContent = this.convertHTMLForCodeView(this.context.element.wysiwyg, false);
        let codeValue = '';

        if (this.options.fullPage) {
            const attrs = domUtils.getAttributesToString(this._wd.body, null);
            codeValue = '<!DOCTYPE html>\n<html>\n' + this._wd.head.outerHTML.replace(/>(?!\n)/g, '>\n') + '<body ' + attrs + '>\n' + codeContent + '</body>\n</html>';
        } else {
            codeValue = codeContent;
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
        const _var = this._transformStatus;

        this.menu.controllerOff();
        const wasToolbarHidden = (toolbar.style.display === 'none' || (this._isInline && !this._inlineToolbarAttr.isShow));

        if (value) {
            this.status.isFullScreen = true;

            _var.fullScreenInline = this._isInline;
            _var.fullScreenBalloon = this._isBalloon;

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
                _var.fullScreenSticky = true;
                this.context.element._stickyDummy.style.display = 'none';
                domUtils.removeClass(toolbar, 'se-toolbar-sticky');
            }

            _var.bodyOverflow = this._d.body.style.overflow;
            this._d.body.style.overflow = 'hidden';

            _var.editorAreaOriginCssText = editorArea.style.cssText;
            _var.wysiwygOriginCssText = wysiwygFrame.style.cssText;
            _var.codeOriginCssText = code.style.cssText;

            editorArea.style.cssText = toolbar.style.cssText = '';
            wysiwygFrame.style.cssText = (wysiwygFrame.style.cssText.match(/\s?display(\s+)?:(\s+)?[a-zA-Z]+;/) || [''])[0];
            code.style.cssText = (code.style.cssText.match(/\s?display(\s+)?:(\s+)?[a-zA-Z]+;/) || [''])[0];
            toolbar.style.width = wysiwygFrame.style.height = code.style.height = '100%';
            toolbar.style.position = 'relative';
            toolbar.style.display = 'block';

            _var.fullScreenInnerHeight = (this._w.innerHeight - toolbar.offsetHeight);
            editorArea.style.height = (_var.fullScreenInnerHeight - this.options.fullScreenOffset) + 'px';

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
            this.status.isFullScreen = false;

            wysiwygFrame.style.cssText = _var.wysiwygOriginCssText;
            code.style.cssText = _var.codeOriginCssText;
            toolbar.style.cssText = '';
            editorArea.style.cssText = _var.editorAreaOriginCssText;
            topArea.style.cssText = _var.editorOriginCssText;
            this._d.body.style.overflow = _var.bodyOverflow;

            if (this.options.height === 'auto' && !this.options.codeMirrorEditor) this._codeViewAutoHeight();

            if (!!this.options.toolbarContainer) this.options.toolbarContainer.appendChild(toolbar);

            if (this.options.stickyToolbar > -1) {
                domUtils.removeClass(toolbar, 'se-toolbar-sticky');
            }

            if (_var.fullScreenSticky && !this.options.toolbarContainer) {
                _var.fullScreenSticky = false;
                this.context.element._stickyDummy.style.display = 'block';
                domUtils.addClass(toolbar, "se-toolbar-sticky");
            }

            this._isInline = _var.fullScreenInline;
            this._isBalloon = _var.fullScreenBalloon;
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
     * @description Prints the current content of the editor.
     */
    print: function () {
        const iframe = domUtils.createElement('IFRAME', {
            style: "display: none;"
        });
        this._d.body.appendChild(iframe);

        const contentHTML = this.options.printTemplate ? this.options.printTemplate.replace(/\{\{\s*content\s*\}\}/i, this.getContent(true)) : this.getContent(true);
        const printDocument = domUtils.getIframeDocument(iframe);
        const wDoc = this._wd;

        if (this.options.iframe) {
            const arrts = this.options._printClass !== null ? 'class="' + this.options._printClass + '"' : this.options.fullPage ? domUtils.getAttributesToString(wDoc.body, ['contenteditable']) : 'class="' + this.options._editableClass + '"';

            printDocument.write('' +
                '<!DOCTYPE html><html>' +
                '<head>' +
                wDoc.head.innerHTML +
                '</head>' +
                '<body ' + arrts + '>' + contentHTML + '</body>' +
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
                '<body class="' + (this.options._printClass !== null ? this.options._printClass : this.options._editableClass) + '">' + contentHTML + '</body>' +
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
        this.menu.dropdownOff();
        this.menu.containerOff();
        this.menu.controllerOff();

        const contentHTML = this.options.previewTemplate ? this.options.previewTemplate.replace(/\{\{\s*content\s*\}\}/i, this.getContent(true)) : this.getContent(true);
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
                '<body ' + arrts + '>' + contentHTML + '</body>' +
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
                '<body class="' + (this.options._printClass !== null ? this.options._printClass : this.options._editableClass) + '" style="margin:10px auto !important; height:auto !important; outline:1px dashed #ccc;">' + contentHTML + '</body>' +
                '</html>'
            );
        }
    },

    /**
     * @description Set direction to "rtl" or "ltr".
     * @param {string} dir "rtl" or "ltr"
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
     * @param {string|undefined} html HTML string
     */
    setContent: function (html) {
        this.removeRange();

        const convertValue = (html === null || html === undefined) ? '' : this.convertContentForEditor(html);
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
     * @description Sets the content of the iframe's head tag and body tag when using the "iframe" or "fullPage" option.
     * @param {Object} ctx { head: HTML string, body: HTML string}
     */
    setFullPageContent: function (ctx) {
        if (!this.options.iframe) return false;
        if (ctx.head) this._wd.head.innerHTML = ctx.head.replace(/<script[\s\S]*>[\s\S]*<\/script>/gi, '');
        if (ctx.body) this._wd.body.innerHTML = this.convertContentForEditor(ctx.body);
    },

    /**
     * @description Gets the current content
     * @param {boolean} withFrame Gets the current content with containing parent div.sun-editor-editable (<div class="sun-editor-editable">{content}</div>).
     * Ignored for options.fullPage is true.
     * @param {boolean} includeFullPage Return only the content of the body without headers when the "fullPage" option is true
     * @returns {Object}
     */
    getContent: function (withFrame, includeFullPage) {
        const renderHTML = domUtils.createElement('DIV', null, this.convertHTMLForCodeView(this.context.element.wysiwyg, true));
        const figcaptions = domUtils.getListChildren(renderHTML, function (current) {
            return /FIGCAPTION/i.test(current.nodeName);
        });

        for (let i = 0, len = figcaptions.length; i < len; i++) {
            figcaptions[i].removeAttribute('contenteditable');
        }

        if (this.options.fullPage) {
            if (includeFullPage) {
                const attrs = domUtils.getAttributesToString(this._wd.body, ['contenteditable']);
                return '<!DOCTYPE html><html>' + this._wd.head.outerHTML + '<body ' + attrs + '>' + renderHTML.innerHTML + '</body></html>';
            } else {
                return renderHTML.innerHTML;
            }
        } else {
            return withFrame ? ('<div class="sun-editor-editable' + (this.options.rtl ? ' se-rtl' : '') + '">' + renderHTML.innerHTML + '</div>') : renderHTML.innerHTML;
        }
    },

    /**
     * @description Gets the clean HTML code for editor
     * @param {string} html HTML string
     * @param {string|RegExp|null} whitelist Regular expression of allowed tags.
     * RegExp object is create by helper.converter.createElementWhitelist method.
     * @param {string|RegExp|null} blacklist Regular expression of disallowed tags.
     * RegExp object is create by helper.converter.createElementBlacklist method.
     * @returns {string}
     */
    cleanHTML: function (html, whitelist, blacklist) {
        html = this._deleteDisallowedTags(_parser.parseFromString(html, 'text/html').body.innerHTML).replace(/(<[a-zA-Z0-9\-]+)[^>]*(?=>)/g, CleanTags.bind(this, true));

        const dom = this._d.createRange().createContextualFragment(html, true);
        try {
            this._consistencyCheckOfHTML(dom, this._htmlCheckWhitelistRegExp, this._htmlCheckBlacklistRegExp, true);
        } catch (error) {
            console.warn('[SUNEDITOR.cleanHTML.consistencyCheck.fail] ' + error);
        }

        if (this._managedElementInfo && this._managedElementInfo.query) {
            const textCompList = dom.querySelectorAll(this._managedElementInfo.query);
            for (let i = 0, len = textCompList.length, initMethod, classList; i < len; i++) {
                classList = [].slice.call(textCompList[i].classList);
                for (let c = 0, cLen = classList.length; c < cLen; c++) {
                    initMethod = this._managedElementInfo.map[classList[c]];
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
            if (whitelist) cleanHTML = cleanHTML.replace(typeof whitelist === 'string' ? converter.createElementWhitelist(whitelist) : whitelist, '');
            if (blacklist) cleanHTML = cleanHTML.replace(typeof blacklist === 'string' ? converter.createElementBlacklist(blacklist) : blacklist, '');
        }

        return this._tagConvertor(cleanHTML);
    },

    /**
     * @description Converts content into a format that can be placed in an editor
     * @param {string} content content
     * @returns {string}
     */
    convertContentForEditor: function (content) {
        content = this._deleteDisallowedTags(_parser.parseFromString(content, 'text/html').body.innerHTML).replace(/(<[a-zA-Z0-9\-]+)[^>]*(?=>)/g, CleanTags.bind(this, false));
        const dom = this._d.createRange().createContextualFragment(content, false);

        try {
            this._consistencyCheckOfHTML(dom, this._htmlCheckWhitelistRegExp, this._htmlCheckBlacklistRegExp, false);
        } catch (error) {
            console.warn('[SUNEDITOR.convertContentForEditor.consistencyCheck.fail] ' + error);
        }

        if (this._managedElementInfo && this._managedElementInfo.query) {
            const textCompList = dom.querySelectorAll(this._managedElementInfo.query);
            for (let i = 0, len = textCompList.length, initMethod, classList; i < len; i++) {
                classList = [].slice.call(textCompList[i].classList);
                for (let c = 0, cLen = classList.length; c < cLen; c++) {
                    initMethod = this._managedElementInfo.map[classList[c]];
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

            if (!this.format.isLine(t) && !this.component.is(t) && !domUtils.isMedia(t)) {
                if (!p) p = domUtils.createElement(this.options.defaultTag);
                p.appendChild(t);
                i--;
                if (domTree[i + 1] && !this.format.isLine(domTree[i + 1])) {
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
     * @returns {string}
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
            this._pluginCallButtons = cons.callButtons;
            this.initPlugins = {};
        }

        if (cons.plugins) {
            this.plugins = cons.plugins;
        }

        // reset context
        if (el._menuTray.children.length === 0) this.menu._menuTrayMap = {};
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
     * @description Copying the content of the editor to the original textarea and execute onSave callback.
     */
    save: function () {
        this.context.element.originElement.value = this.getContent(false);
        // user event
        if (typeof this.events.onSave === 'function') {
            this.events.onSave(content, core);
            return;
        }
    },

    /**
     * @description Gets only the text of the suneditor content
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
     * @description Add content to the suneditor
     * @param {string} content Content to Input
     */
    appendContent: function (content) {
        const convertValue = this.convertContentForEditor(content);

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
            this.menu.controllerOff();
            if (this.menu.currentDropdownActiveButton && this.menu.currentDropdownActiveButton.disabled) this.menu.dropdownOff();
            if (this.menu.currentMoreLayerActiveButton && this.menu.currentMoreLayerActiveButton.disabled) this.menu.moreLayerOff();
            if (this.menu.currentContainerActiveButton && this.menu.currentContainerActiveButton.disabled) this.menu.containerOff();
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
        this.menu.controllerOff();
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
        this.menu.dropdownOff();
        this.menu.containerOff();
        this.menu.controllerOff();
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
        for (let k in this._pluginCallButtons) {
            if (this._pluginCallButtons.hasOwnProperty(k)) delete this._pluginCallButtons[k];
        }

        /** remove user object */
        for (let k in this) {
            if (this.hasOwnProperty(k)) delete this[k];
        }
    },

    // ----- private methods -----
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
        if (node.nodeType === 8 && this._allowHTMLComment) {
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
        if (!this._disallowedStyleNodesRegExp) return text;

        const ec = this.options._styleNodeMap;
        return text.replace(this._disallowedStyleNodesRegExp, function (m, t, n, p) {
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
            .replace(this._elementWhitelistRegExp, '')
            .replace(this._elementBlacklistRegExp, '');
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
                    this.shadowRoot = child.shadowRoot;
                    break;
                } else if (child instanceof _w.ShadowRoot) {
                    this.shadowRoot = child;
                    break;
                }
                child = child.parentNode;
            }
            if (this.shadowRoot) this._shadowRootControllerEventTarget = [];
        }

        // set disallow text nodes
        const disallowStyleNodes = _w.Object.keys(options._styleNodeMap);
        const allowStyleNodes = !options.elementWhitelist ? [] : options.elementWhitelist.split('|').filter(function (v) {
            return /b|i|ins|s|strike/i.test(v);
        });
        for (let i = 0; i < allowStyleNodes.length; i++) {
            disallowStyleNodes.splice(disallowStyleNodes.indexOf(allowStyleNodes[i].toLowerCase()), 1);
        }
        this._disallowedStyleNodesRegExp = disallowStyleNodes.length === 0 ? null : new wRegExp('(<\\/?)(' + disallowStyleNodes.join('|') + ')\\b\\s*([^>^<]+)?\\s*(?=>)', 'gi');

        // set whitelist
        const getRegList = function (str, str2) {
            return !str ? '^' : (str === '*' ? '[a-z-]+' : (!str2 ? str : (str + '|' + str2)));
        };
        // tags
        const defaultAttr = 'contenteditable|colspan|rowspan|target|href|download|rel|src|alt|class|type|controls|data-format|data-size|data-file-size|data-file-name|data-origin|data-align|data-image-link|data-rotate|data-proportion|data-percentage|origin-size|data-exp|data-font-size';
        this._allowHTMLComment = options._editorElementWhitelist.indexOf('//') > -1 || options._editorElementWhitelist === '*';
        // html check
        this._htmlCheckWhitelistRegExp = new wRegExp('^(' + getRegList(options._editorElementWhitelist.replace('|//', ''), '') + ')$', 'i');
        this._htmlCheckBlacklistRegExp = new wRegExp('^(' + (options.elementBlacklist || '^') + ')$', 'i');
        // tags
        this._elementWhitelistRegExp = converter.createElementWhitelist(getRegList(options._editorElementWhitelist.replace('|//', '|<!--|-->'), ''));
        this._elementBlacklistRegExp = converter.createElementBlacklist(options.elementBlacklist.replace('|//', '|<!--|-->'));
        // attributes
        const regEndStr = '\\s*=\\s*(\")[^\"]*\\1';
        const _wAttr = options.attributeWhitelist;
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

        this._attributeWhitelistRegExp = new wRegExp('\\s(?:' + (allAttr || defaultAttr) + ')' + regEndStr, 'ig');
        this._attributeWhitelist = tagsAttr;

        // blacklist
        const _bAttr = options.attributeBlacklist;
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

        this._attributeBlacklistRegExp = new wRegExp('\\s(?:' + (allAttr || '^') + ')' + regEndStr, 'ig');
        this._attributeBlacklist = tagsAttr;

        // set modes
        this._isInline = /inline/i.test(options.mode);
        this._isBalloon = /balloon|balloon-always/i.test(options.mode);
        this._isBalloonAlways = /balloon-always/i.test(options.mode);

        // caching buttons
        this._cachingButtons();

        // cache editor's element
        this._transformStatus.editorOriginCssText = context.element.topArea.style.cssText;
        this._placeholder = context.element.placeholder;
        this._lineBreaker = context.element.lineBreaker;
        this._lineBreakerButton = this._lineBreaker.querySelector('button');

        // Init, validate
        if (options.iframe) {
            this._wd = context.element.wysiwygFrame.contentDocument;
            context.element.wysiwyg = this._wd.body;
            if (options._editorStyles.editor) context.element.wysiwyg.style.cssText = options._editorStyles.editor;
            if (options.height === 'auto') this._iframeAuto = this._wd.body;
        }

        // base
        this.events = Events();
        this.history = history(this, this._onChange_historyStack.bind(this));
        this.eventManager = new EventManager(this);

        // classes
        this.offset = new Offset(this);
        this.notice = new Notice(this);
        this.shortcuts = new Shortcuts(this);
        // classes that refer to other classes
        this.component = new Component(this);
        this.format = new Format(this);
        this.node = new Node(this);
        this.toolbar = new Toolbar(this);
        this.selection = new Selection(this);
        this.char = new Char(this);
        this.menu = new Menu(this);
        
        // register interface
        EditorInterface.call(this.eventManager, this);
        EditorInterface.call(this.component, this);
        EditorInterface.call(this.format, this);
        EditorInterface.call(this.node, this);
        EditorInterface.call(this.toolbar, this);
        EditorInterface.call(this.selection, this);
        EditorInterface.call(this.char, this);
        EditorInterface.call(this.menu, this);

        // file components
        this._fileInfoPluginsCheck = [];
        this._fileInfoPluginsReset = [];

        // text components
        this._managedElementInfo = {
            query: '',
            map: {}
        };

        // plugins install
        // Command and file plugins registration
        this.activePlugins = [];
        this._fileManager.tags = [];
        this._fileManager.pluginMap = {};
        
        const managedClass = [];
        let filePluginRegExp = [];
        let plugin, button;
        for (let key in plugins) {
            if (!plugins.hasOwnProperty(key)) continue;
            plugin = plugins[key];
            button = this._pluginCallButtons[key];
            this.registerPlugin(key, button);

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
                this._managedElementInfo.map[info.className] = info.method.bind(this);
            }
        }

        this._managedElementInfo.query = managedClass.toString();
        this._fileManager.queryString = this._fileManager.tags.join(',');
        this._fileManager.regExp = new wRegExp('^(' + (this._fileManager.tags.join('|') || '^') + ')$', 'i');
        this._fileManager.pluginRegExp = new wRegExp('^(' + (filePluginRegExp.length === 0 ? '^' : filePluginRegExp.join('|')) + ')$', 'i');

        // init content
        this._initWysiwygArea(reload, _initHTML);
        this.setDir(options.rtl ? 'rtl' : 'ltr');
    },

    /**
     * @description Caching basic buttons to use
     * @private
     */
    _cachingButtons: function () {
        this.codeViewDisabledButtons = this.context.element._buttonTray.querySelectorAll('.se-menu-list button[data-type]:not([class~="se-code-view-enabled"]):not([data-type="MORE"])');
        this.resizingDisabledButtons = this.context.element._buttonTray.querySelectorAll('.se-menu-list button[data-type]:not([class~="se-resizing-enabled"]):not([data-type="MORE"])');

        this._saveButtonStates();

        const buttons = this.context.buttons;
        this._commandMap = {
            SUB: buttons.subscript,
            SUP: buttons.superscript,
            OUTDENT: buttons.outdent,
            INDENT: buttons.indent
        };
        this._commandMap[this.options.textTags.bold.toUpperCase()] = buttons.bold;
        this._commandMap[this.options.textTags.underline.toUpperCase()] = buttons.underline;
        this._commandMap[this.options.textTags.italic.toUpperCase()] = buttons.italic;
        this._commandMap[this.options.textTags.strike.toUpperCase()] = buttons.strike;

        this._styleCommandMap = {
            fullScreen: buttons.fullScreen,
            showBlocks: buttons.showBlocks,
            codeView: buttons.codeView
        };
    },

    /**
     * @description Save the current buttons states to "allCommandButtons" object
     * @private
     */
    _saveButtonStates: function () {
        if (!this.allCommandButtons) this.allCommandButtons = {};

        const currentButtons = this.context.element._buttonTray.querySelectorAll('.se-menu-list button[data-type]');
        for (let i = 0, element, command; i < currentButtons.length; i++) {
            element = currentButtons[i];
            command = element.getAttribute('data-command');

            this.allCommandButtons[command] = element;
        }
    },

    /**
     * @description Initializ wysiwyg area (Only called from core._init)
     * @param {boolean} reload Is relooad?
     * @param {string} _initHTML initial html string
     * @private
     */
    _initWysiwygArea: function (reload, _initHTML) {
        this.context.element.wysiwyg.innerHTML = reload ? _initHTML : this.convertContentForEditor(typeof _initHTML === 'string' ? _initHTML : this.context.element.originElement.value);
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
        if (this.events.onChange) this.events.onChange(this.getContent(true));
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

    __callResizeFunction: function (h, resizeObserverEntry) {
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

export default Core;