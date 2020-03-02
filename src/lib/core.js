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
import notice from '../plugins/modules/notice';

/**
 * @description SunEditor constuctor function.
 * create core object and event registration.
 * core, event, userFunction
 * @param context
 * @param plugins
 * @param lang
 * @param options
 * @returns {Object} UserFunction Object
 */
export default function (context, pluginCallButtons, plugins, lang, options) {
    const _d = context.element.originElement.ownerDocument || document;
    const _w = _d.defaultView || window;
    const util = _util;

    /**
     * @description editor core object
     * should always bind this object when registering an event in the plug-in.
     */
    const core = {
        _d: _d,
        _w: _w,

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
         * @description Util object
         */
        util: util,

        /**
         * @description Notice object
         */
        notice: notice,

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
         * @description loaded language
         */
        lang: lang,

        /**
         * @description submenu element
         */
        submenu: null,

        /**
         * @description current resizing component name
         * @private
         */
        _resizingName: '',

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
         * @description active button element in submenu
         */
        submenuActiveButton: null,

        /**
         * @description The elements array to be processed unvisible when the controllersOff function is executed (resizing, link modified button, table controller)
         */
        controllerArray: [],

        /**
         * @description The name of the plugin that called the currently active controller
         */
        currentControllerName: '',

        /**
         * @description An array of buttons whose class name is not "code-view-enabled"
         */
        codeViewDisabledButtons: null,

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
         * @description binded controllersOff method
         * @private
         */
        _bindControllersOff: null,

        /**
         * @description The selection node (core.getSelectionNode()) to which the effect was last applied
         * @private
         */
        _lastEffectNode: null,

        /**
         * @description Is inline mode?
         * @private
         */
        _isInline: null,

        /**
         * @description Is balloon mode?
         * @private
         */
        _isBalloon: null,

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
         * @description If true, (initialize, reset) all indexes of image information
         * @private
         */
        _imagesInfoInit: true,
        _imagesInfoReset: false,

        /**
         * @description An user event function before image uploaded
         * @private
         */
        _imageUploadBefore: function (files, info) {
            if (typeof userFunction.onImageUploadBefore === 'function') return userFunction.onImageUploadBefore(files, info, core);
            return true;
        },

        /**
         * @description An user event function when image uploaded success or remove image
         * @private
         */
        _imageUpload: function (targetImgElement, index, state, imageInfo, remainingFilesCount) {
            if (typeof userFunction.onImageUpload === 'function') userFunction.onImageUpload(targetImgElement, index * 1, state, imageInfo, remainingFilesCount, core);
        },

        /**
         * @description An user event function when image upload failed
         * @private
         */
        _imageUploadError: function (errorMessage, result) {
            if (typeof userFunction.onImageUploadError === 'function') return userFunction.onImageUploadError(errorMessage, result, core);
            return true;
        },

        /**
         * @description An user callback function of the image upload
         * @private
         */
        _imageUploadHandler: function (response, info, core) {
            if (typeof userFunction.imageUploadHandler === 'function') {
                userFunction.imageUploadHandler(response, info, core);
                return true;
            } else {
                return false;
            }
        },

        /**
         * @description Plugins array with "active" method.
         * "activePlugins" runs the "add" method when creating the editor.
         */
        activePlugins: null,

        /**
         * @description Elements that need to change text or className for each selection change
         * After creating the editor, "activePlugins" are added.
         * @property {Element} STRONG bold button
         * @property {Element} INS underline button
         * @property {Element} EM italic button
         * @property {Element} DEL strike button
         * @property {Element} SUB subscript button
         * @property {Element} SUP superscript button
         * @property {Element} OUTDENT outdent button
         */
        commandMap: null,

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
            _imagesInfo: [],
            _imageIndex: 0,
            _videosCnt: 0
        },

        /**
         * @description If the plugin is not added, add the plugin and call the 'add' function.
         * If the plugin is added call callBack function.
         * @param {String} pluginName The name of the plugin to call
         * @param {function} callBackFunction Function to be executed immediately after module call
         */
        callPlugin: function (pluginName, callBackFunction) {
            if (!this.plugins[pluginName]) {
                throw Error('[SUNEDITOR.core.callPlugin.fail] The called plugin does not exist or is in an invalid format. (pluginName:"' + pluginName + '")');
            } else if (!this.initPlugins[pluginName]){
                this.plugins[pluginName].add(this, pluginCallButtons[pluginName]);
                this.initPlugins[pluginName] = true;
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
                    if (typeof this.plugins[moduleName].add === 'function') this.plugins[moduleName].add(this);
                }
            }
        },

        /**
         * @description Enabled submenu
         * @param {Element} element Submenu's button element to call
         */
        submenuOn: function (element) {
            if (this._bindedSubmenuOff) this._bindedSubmenuOff();

            const submenuName = this._submenuName = element.getAttribute('data-command');

            this.submenu = element.nextElementSibling;
            this.submenu.style.display = 'block';
            util.addClass(element, 'on');
            this.submenuActiveButton = element;

            const overLeft = this.context.element.toolbar.offsetWidth - (element.parentElement.offsetLeft + this.submenu.offsetWidth);
            if (overLeft < 0) this.submenu.style.left = overLeft + 'px';
            else this.submenu.style.left = '1px';

            this._bindedSubmenuOff = this.submenuOff.bind(this);
            this.addDocEvent('mousedown', this._bindedSubmenuOff, false);

            if (this.plugins[submenuName].on) this.plugins[submenuName].on.call(this);
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
            
            this.focus();
        },

        /**
         * @description Show controller at editor area (link button, image resize button, init function, etc..)
         * @param {*} arguments controller elements, functions..
         */
        controllersOn: function () {
            if (this._bindControllersOff) {
                const tempName = this._resizingName;
                this._bindControllersOff();
                this._resizingName = tempName;
            }

            for (let i = 0, arg; i < arguments.length; i++) {
                arg = arguments[i];

                if (typeof arg === 'string') {
                    this.currentControllerName = arg;
                    continue;
                }

                if (arg.style) arg.style.display = 'block';
                this.controllerArray[i] = arg;
            }

            this._notHideToolbar = true;
            this._bindControllersOff = this.controllersOff.bind(this);
            this.addDocEvent('mousedown', this._bindControllersOff, false);
            this.addDocEvent('keydown', this._bindControllersOff, false);
        },

        /**
         * @description Hide controller at editor area (link button, image resize button..)
         */
        controllersOff: function (e) {
            if (this._resizingName && e && e.type === 'keydown' && e.keyCode !== 27) return;

            this._notHideToolbar = false;
            this._resizingName = '';
            this.currentControllerName = '';
            this._lastEffectNode = null;
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
         * @description Use focus method of document
         * @private
         */
        _nativeFocus: function () {
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
                this._nativeFocus();
            } else {
                try {
                    const range = this.getRange();
                    this.setRange(range.startContainer, range.startOffset, range.endContainer, range.endOffset);
                } catch (e) {
                    this._nativeFocus();
                }
            }

            event._applyTagEffects();
            if (core._isBalloon) event._toggleToolbarBalloon();
        },

        /**
         * @description If "focusEl" is a component, then that component is selected; if it is a format element, the last text is selected
         * @param {Element} focusEl Focus element
         */
        focusEdge: function (focusEl) {
            if (util.isComponent(focusEl)) {
                const imageComponent = focusEl.querySelector('IMG');
                const videoComponent = focusEl.querySelector('IFRAME');
    
                if (imageComponent) {
                    this.selectComponent(imageComponent, 'image');
                } else if (videoComponent) {
                    this.selectComponent(videoComponent, 'video');
                }
            } else {
                focusEl = util.getChildElement(focusEl, function (current) { return current.childNodes.length === 0 || current.nodeType === 3; }, true);
                this.setRange(focusEl, focusEl.textContent.length, focusEl, focusEl.textContent.length);
            }
        },

        /**
         * @description Set current editor's range object
         * @param {Element} startCon The startContainer property of the selection object.
         * @param {Number} startOff The startOffset property of the selection object.
         * @param {Element} endCon The endContainer property of the selection object.
         * @param {Number} endOff The endOffset property of the selection object.
         */
        setRange: function (startCon, startOff, endCon, endOff) {
            if (!startCon || !endCon) return;
            if (startOff > startCon.textContent.length) startOff = startCon.textContent.length;
            if (endOff > endCon.textContent.length) endOff = endCon.textContent.length;
            
            const range = this._wd.createRange();
            range.setStart(startCon, startOff);
            range.setEnd(endCon, endOff);

            const selection = this.getSelection();

            if (selection.removeAllRanges) {
                selection.removeAllRanges();
            }

            selection.addRange(range);
            this._editorRange();
        },

        /**
         * @description Remove range object and button effect
         */
        removeRange: function () {
            this.getSelection().removeAllRanges();

            const commandMap = this.commandMap;
            util.removeClass(commandMap.STRONG, 'active');
            util.removeClass(commandMap.INS, 'active');
            util.removeClass(commandMap.EM, 'active');
            util.removeClass(commandMap.DEL, 'active');
            util.removeClass(commandMap.SUB, 'active');
            util.removeClass(commandMap.SUP, 'active');

            if (commandMap.OUTDENT) commandMap.OUTDENT.setAttribute('disabled', true);
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
            return this._ww.getSelection();
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
         * @description Returns a "formatElement"(util.isFormatElement) array from the currently selected range.
         * @param {Function|null} validation The validation function. (Replaces the default validation function-util.isFormatElement(current))
         * @returns {Array}
         */
        getSelectedElements: function (validation) {
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

            if (!util.isWysiwygDiv(commonCon) && !util.isRangeFormatElement(commonCon)) lineNodes.unshift(util.getFormatElement(commonCon));
            if (startCon === endCon || lineNodes.length === 1) return lineNodes;

            let startLine = util.getFormatElement(startCon);
            let endLine = util.getFormatElement(endCon);
            let startIdx = null;
            let endIdx = null;
            
            const onlyTable = function (current) {
                return util.isTable(current) ? /^TABLE$/i.test(current.nodeName) : true;
            };
            const startRangeEl = util.getRangeFormatElement(startLine, onlyTable);
            const endRangeEl = util.getRangeFormatElement(endLine, onlyTable);
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
                this.getSelectedElements() :
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
         * @param {Object} container The container property of the selection object.
         * @param {Number} offset The offset property of the selection object.
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
            const currentFormatEl = util.getFormatElement(this.getSelectionNode());
            const oFormatName = formatNode ? (typeof formatNode === 'string' ? formatNode : formatNode.nodeName) : util.isFormatElement(currentFormatEl) ? currentFormatEl.nodeName : 'P';
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
         * Returns the next line added.
         * @param {Element} element Element to be inserted
         * @param {Boolean} notHistoryPush When true, it does not update the history stack and the selection object and return EdgeNodes (util.getEdgeChildNodes)
         * @returns {Element}
         */
        insertComponent: function (element, notHistoryPush) {
            const r = this.removeNode();
            let oNode = null;
            let selectionNode = this.getSelectionNode();
            let formatEl = util.getFormatElement(selectionNode);

            if (util.isListCell(formatEl)) {
                if (/^HR$/i.test(element.nodeName)) {
                    const newLi = util.createElement('LI');
                    const textNode = util.createTextNode(util.zeroWidthSpace);
                    newLi.appendChild(element);
                    newLi.appendChild(textNode);
                    formatEl.parentNode.insertBefore(newLi, formatEl.nextElementSibling);
                    this.setRange(textNode, 1, textNode, 1);
                } else {
                    this.insertNode(element, selectionNode === formatEl ? null : selectionNode);
                    oNode = util.createElement('LI');
                    formatEl.parentNode.insertBefore(oNode, formatEl.nextElementSibling);
                }
            } else {
                if (this.getRange().collapsed && r.container.nodeType === 3) {
                    const depthFormat = util.getParentElement(r.container, function (current) { return this.isRangeFormatElement(current); }.bind(util));
                    oNode = util.splitElement(r.container, r.offset, !depthFormat ? 0 : util.getElementDepth(depthFormat) + 1);
                    formatEl = oNode.previousSibling;
                }
                this.insertNode(element, formatEl);
                if (!oNode) oNode = this.appendFormatTag(element, util.isFormatElement(formatEl) ? formatEl : null);
            }

            // history stack
            if (!notHistoryPush) this.history.push(false);

            return oNode;
        },

        /**
         * @description The component(image, video) is selected and the resizing module is called.
         * @param {Element} element Element tag (img or iframe)
         * @param {String} componentName Component name (image or video)
         */
        selectComponent: function (element, componentName) {
            if (componentName === 'image') {
                if (!core.plugins.image) return;

                core.removeRange();
                core.callPlugin('image', function () {
                    const size = core.plugins.resizing.call_controller_resize.call(core, element, 'image');
                    core.plugins.image.onModifyMode.call(core, element, size);
                    
                    if (!util.getParentElement(element, '.se-image-container')) {
                        core.plugins.image.openModify.call(core, true);
                        core.plugins.image.update_image.call(core, true, true, true);
                    }
                });
            } else if (componentName === 'video') {
                if (!core.plugins.video) return;

                core.removeRange();
                core.callPlugin('video', function () {
                    const size = core.plugins.resizing.call_controller_resize.call(core, element, 'video');
                    core.plugins.video.onModifyMode.call(core, element, size);
                });
            }
        },

        /**
         * @description Delete selected node and insert argument value node
         * If the "afterNode" exists, it is inserted after the "afterNode"
         * Inserting a text node merges with both text nodes on both sides and returns a new "{ startOffset, endOffset }".
         * @param {Element} oNode Element to be inserted
         * @param {Element|null} afterNode If the node exists, it is inserted after the node
         * @returns {undefined|Object}
         */
        insertNode: function (oNode, afterNode) {
            const range = this.getRange();
            let parentNode = null;

            if (!afterNode) {
                const startCon = range.startContainer;
                const startOff = range.startOffset;
                const endCon = range.endContainer;
                const endOff = range.endOffset;
                const commonCon = range.commonAncestorContainer;

                parentNode = startCon;
                if (startCon.nodeType === 3) {
                    parentNode = startCon.parentNode;
                }

                /** No Select range node */
                if (range.collapsed) {
                    if (commonCon.nodeType === 3) {
                        if (commonCon.textContent.length > endOff) afterNode = commonCon.splitText(endOff);
                        else afterNode = commonCon.nextSibling;
                    }
                    else {
                        if (!util.isBreak(parentNode)) {
                            if (parentNode.lastChild !== null && util.isBreak(parentNode.lastChild)) {
                                parentNode.removeChild(parentNode.lastChild);
                            }
                            afterNode = null;
                        } else {
                            afterNode = parentNode;
                            parentNode = parentNode.parentNode;
                        }
                    }
                }
                /** Select range nodes */
                else {
                    const isSameContainer = startCon === endCon;

                    if (isSameContainer) {
                        if (this.isEdgePoint(endCon, endOff)) afterNode = endCon.nextSibling;
                        else afterNode = endCon.splitText(endOff);

                        let removeNode = startCon;
                        if (!this.isEdgePoint(startCon, startOff)) removeNode = startCon.splitText(startOff);

                        parentNode.removeChild(removeNode);
                    }
                    else {
                        this.removeNode();
                        parentNode = commonCon;
                        afterNode = endCon;

                        while (afterNode.parentNode !== commonCon) {
                            afterNode = afterNode.parentNode;
                        }
                    }
                }
            }
            else {
                parentNode = afterNode.parentNode;
                afterNode = afterNode.nextSibling;
            }

            try {
                if (util.isFormatElement(oNode) || util.isRangeFormatElement(oNode) || (!util.isListCell(parentNode) && util.isComponent(oNode))) {
                    if (util.isList(afterNode)) {
                        parentNode = afterNode;
                        afterNode = null;
                    } else {
                        const depthFormat = util.getParentElement(afterNode, function (current) { return this.isRangeFormatElement(current); }.bind(util));
                        afterNode = util.splitElement(afterNode, 0, !depthFormat ? 0 : util.getElementDepth(depthFormat) + 1);
                        parentNode = afterNode.parentNode;
                    }
                }
                parentNode.insertBefore(oNode, afterNode);
            } catch (e) {
                parentNode.appendChild(oNode);
            } finally {
                if (oNode.nodeType === 3) {
                    const previous = oNode.previousSibling;
                    const next = oNode.nextSibling;
                    const previousText = (!previous || util.onlyZeroWidthSpace(previous)) ? '' : previous.textContent;
                    const nextText = (!next || util.onlyZeroWidthSpace(next)) ? '' : next.textContent;
    
                    if (previous) {
                        oNode.textContent = previousText + oNode.textContent;
                        util.removeItem(previous);
                    }
    
                    if (next) {
                        oNode.textContent += nextText;
                        util.removeItem(next);
                    }

                    return {
                        startOffset: previousText.length,
                        endOffset: oNode.textContent.length - nextText.length
                    };
                }

                this.setRange(oNode, 1, oNode, 1);

                // history stack
                this.history.push(true);
            }
        },

        /**
         * @description Delete the currently selected nodes and reset selection range
         * Returns {container: "the last element after deletion", offset: "offset"}
         * @returns {Object}
         */
        removeNode: function () {
            const range = this.getRange();
            let container, offset = 0;

            // native function
            // if (range.deleteContents) {
            //     range.deleteContents();
            //     container = range.endContainer || range.startContainer;

            //     if (container.nodeType === 3) {
            //         offset = range.startOffset;
            //     } else {
            //         container = util.getEdgeChildNodes((range.endContainer ? range.endContainer.childNodes[range.endOffset] : range.startContainer.childNodes[range.startOffset]), null).sc;
            //     }

            //     // set range
            //     this.setRange(container, offset, container, offset);
            //     // history stack
            //     this.history.push(true);

            //     return {
            //         container: container,
            //         offset: offset
            //     };
            // }

            let startCon = range.startContainer;
            let endCon = range.endContainer;
            const startOff = range.startOffset;
            const endOff = range.endOffset;
            const commonCon = range.commonAncestorContainer;

            let beforeNode = null;
            let afterNode = null;

            const childNodes = util.getListChildNodes(commonCon);
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
                    childNodes.push(commonCon);
                    startCon = endCon = commonCon;
                } else {
                    startCon = endCon = childNodes[0];
                }

                startIndex = endIndex = 0;
            }

            for (let i = startIndex; i <= endIndex; i++) {
                const item = childNodes[i];

                if (item.length === 0 || (item.nodeType === 3 && item.data === undefined)) {
                    util.removeItem(item);
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
                        util.removeItem(startCon);
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
                        util.removeItem(endCon);
                    }

                    continue;
                }

                util.removeItem(item);
            }

            container = endCon && endCon.parentNode ? endCon : startCon && startCon.parentNode ? startCon : (range.endContainer || range.startContainer);

            // set range
            this.setRange(container, offset, container, offset);
            // history stack
            this.history.push(true);

            return {
                container: container,
                offset: offset
            };
        },

        /**
         * @description Appended all selected format Element to the argument element and insert
         * @param {Element} rangeElement Element of wrap the arguments (BLOCKQUOTE...)
         */
        applyRangeFormatElement: function (rangeElement) {
            const rangeLines = this.getSelectedElementsAndComponents(true);
            if (!rangeLines || rangeLines.length === 0) return;

            let last  = rangeLines[rangeLines.length - 1];
            let standTag, beforeTag, pElement;

            if (util.isRangeFormatElement(last) || util.isFormatElement(last)) {
                standTag = last;
            } else {
                standTag = util.getRangeFormatElement(last) || util.getFormatElement(last);
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
            
            for (let i = 0, len = rangeLines.length, line, originParent, depth, before; i < len; i++) {
                line = rangeLines[i];
                originParent = line.parentNode;
                depth = util.getElementDepth(line);

                if (util.isList(originParent)) {
                    if (listParent === null) listParent = util.createElement(originParent.nodeName);

                    listParent.innerHTML += line.outerHTML;
                    lineArr.push(line);

                    if (i === len - 1 || rangeLines[i + 1].parentNode !== originParent) {
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

                        rangeElement.appendChild(listParent);
                        listParent = null;
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

            util.mergeSameTags(rangeElement, null, null, false);
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
         * When "selectedFormats" is null, all elements are detached and return {cc: parentNode, sc: nextSibling, ec: previousSibling}.
         * @param {Element} rangeElement Range format element (PRE, BLOCKQUOTE, OL, UL...)
         * @param {Array|null} selectedFormats Array of format elements (P, DIV, LI...) to remove.
         * If null, Applies to all elements and return {cc: parentNode, sc: nextSibling, ec: previousSibling}
         * @param {Element|null} newRangeElement The node(rangeElement) to replace the currently wrapped node.
         * @param {Boolean} remove Delete without detached.
         * @param {Boolean} notHistoryPush When true, it does not update the history stack and the selection object and return EdgeNodes (util.getEdgeChildNodes)
         */
        detachRangeFormatElement: function (rangeElement, selectedFormats, newRangeElement, remove, notHistoryPush, removeNestedList) {
            const range = this.getRange();
            const so = range.startOffset;
            const eo = range.endOffset;

            let children = util.getListChildNodes(rangeElement, function (current) { return current.parentNode === rangeElement; });
            let parent = rangeElement.parentNode;
            let firstNode = null;
            let lastNode = null;
            let rangeEl = rangeElement.cloneNode(false);
            
            const newList = util.isList(newRangeElement);
            let insertedNew = false;
            let reset = false;

            function _deleteNestedList (originNode) {
                let sibling = originNode.parentNode;
                let parent = sibling.parentNode;
                let liSibling, liParent, child, index, c;
                
                while (util.isListCell(parent)) {
                    index = util.getPositionIndex(originNode);
                    liSibling = parent.nextElementSibling;
                    liParent = parent.parentNode;
                    child = sibling;
                    while(child) {
                        sibling = sibling.nextSibling;
                        if (util.isList(child)) {
                            c = child.childNodes;
                            while (c[index]) {
                                liParent.insertBefore(c[index], liSibling);
                            }
                            if (c.length === 0) util.removeItem(child);
                        } else {
                            liParent.appendChild(child);
                        }
                        child = sibling;
                    }
                    sibling = liParent;
                    parent = liParent.parentNode;
                }

                return liParent;
            }

            function appendNode (parent, insNode, sibling, originNode) {
                if (util.onlyZeroWidthSpace(insNode)) insNode.innerHTML = util.zeroWidthSpace;

                if (insNode.nodeType === 3) {
                    parent.insertBefore(insNode, sibling);
                    return insNode;
                }
                
                const insChildren = insNode.childNodes;
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
                        if (!removeNestedList) {
                            first = sibling;
                            while(sibling) {
                                format.appendChild(sibling);
                                sibling = sibling.nextSibling;
                            }
                            parent.parentNode.insertBefore(format, parent.nextElementSibling);
                        } else {
                            reset = true;
                            
                            const rNode = _deleteNestedList(originNode);
                            rangeElement = rNode.cloneNode(false);
                            const c = rNode.childNodes;
                            const index = util.getPositionIndex(originNode);
                            while (c[index]) {
                                rangeElement.appendChild(c[index]);
                            }
                            
                            const rChildren = util.getListChildren(rangeElement, function (current) { return this.isListCell(current) && !current.previousElementSibling; }.bind(util));
                            for (let i = 0, len = rChildren.length, n; i < len; i++) {
                                n = _deleteNestedList(rChildren[i]);
                                if (n && n.childNodes.length === 0) {
                                    util.removeItem(n);
                                    i--; len--;
                                }
                            }
                            
                            rNode.parentNode.insertBefore(rangeElement, rNode.nextSibling);
                            if (c.length === 0) util.removeItem(rNode);
                        }
                    } else {
                        parent.insertBefore(format, sibling);
                    }

                    if (!first) first = format;
                }

                return first;
            }

            for (let i = 0, len = children.length, insNode; i < len; i++) {
                insNode = children[i];
                if (remove && i === 0) {
                    if (!selectedFormats || selectedFormats.length === len || selectedFormats[0] === insNode) {
                        firstNode = rangeElement.previousSibling;
                    } else {
                        firstNode = rangeEl;
                    }
                }

                if (selectedFormats && selectedFormats.indexOf(insNode) === -1) {
                    if (!rangeEl) rangeEl = rangeElement.cloneNode(false);
                    rangeEl.appendChild(insNode);
                }
                else {
                    if (rangeEl && rangeEl.children.length > 0) {
                        parent.insertBefore(rangeEl, rangeElement);
                        rangeEl = null;
                    }

                    if (!newList && util.isListCell(insNode)) {
                        const inner = insNode;
                        insNode = util.createElement((util.isList(rangeElement.parentNode) || util.isListCell(rangeElement.parentNode)) ? 'LI' : util.isCell(rangeElement.parentNode) ? 'DIV' : 'P');
                        insNode.innerHTML = inner.innerHTML;
                        util.copyFormatAttributes(insNode, inner);
                    } else {
                        insNode = insNode.cloneNode(true);
                    }

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

                        if (reset) {
                            reset = false;
                            children = util.getListChildNodes(rangeElement, function (current) { return current.parentNode === rangeElement; });
                            rangeEl = rangeElement.cloneNode(false);
                            parent = rangeElement.parentNode;
                            firstNode = lastNode = null;
                            i = -1;
                            len = children.length;
                            continue;
                        }

                        if (selectedFormats) {
                            lastNode = insNode;
                            if (!firstNode) {
                                firstNode = insNode;
                            }
                        } else if (!firstNode) {
                            firstNode = lastNode = insNode;
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
            else firstNode = rangeElement.previousSibling;
            rangeRight = rangeElement.nextSibling;

            util.removeItem(rangeElement);

            const edge = remove ? {
                cc: rangeParent,
                sc: firstNode,
                ec: rangeRight,
            } : util.getEdgeChildNodes(firstNode, (!lastNode.parentNode ? firstNode : lastNode));

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
            
            event._applyTagEffects();
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
            const range = this.getRange();
            styleArray = styleArray && styleArray.length > 0 ? styleArray : false;
            removeNodeArray = removeNodeArray && removeNodeArray.length > 0 ? removeNodeArray : false;

            const isRemoveNode = !appendNode;
            const isRemoveFormat = isRemoveNode && !removeNodeArray && !styleArray;
            let startCon = range.startContainer;
            let startOff = range.startOffset;
            let endCon = range.endContainer;
            let endOff = range.endOffset;
            let tempCon, tempOffset, tempChild;

            if ((isRemoveFormat && range.collapsed && util.isFormatElement(startCon.parentNode) && util.isFormatElement(endCon.parentNode)) || (startCon === endCon && startCon.nodeType === 1 && startCon.getAttribute('contenteditable') === 'false')) {
                return;
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

            /* find text node */
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
    
                    let format = util.getFormatElement(tempCon);
                    if (format === util.getRangeFormatElement(format)) {
                        format = util.createElement(util.isCell(tempCon) ? 'DIV' : 'P');
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
                        util.removeItem(startCon);
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
    
                    let format = util.getFormatElement(tempCon);
                    if (format === util.getRangeFormatElement(format)) {
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
                    if (onlyBreak) {
                        util.removeItem(endCon);
                    }
                }
            }

            // set endContainer
            endCon = tempCon;
            endOff = tempOffset;

            // set Range
            this.setRange(startCon, startOff, endCon, endOff);

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
            const lineNodes = this.getSelectedElements();

            if (!util.getFormatElement(startCon)) {
                startCon = util.getChildElement(lineNodes[0], function (current) { return current.nodeType === 3; });
                startOff = 0;
            }

            if (!util.getFormatElement(endCon)) {
                endCon = util.getChildElement(lineNodes[lineNodes.length - 1], function (current) { return current.nodeType === 3; });
                endOff = endCon.textContent.length;
            }

            
            const oneLine = util.getFormatElement(startCon) === util.getFormatElement(endCon);
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
            }
            // multi line 
            else {
                // start
                start = this._nodeChange_startLine(lineNodes[0], newNode, validation, startCon, startOff, isRemoveFormat, isRemoveNode, _removeCheck, _getMaintainedNode, _isMaintainedNode);
                // mid
                for (let i = 1; i < endLength; i++) {
                    newNode = appendNode.cloneNode(false);
                    this._nodeChange_middleLine(lineNodes[i], newNode, validation, isRemoveFormat, isRemoveNode, _removeCheck);
                }
                // end
                if (endLength > 0) {
                    newNode = appendNode.cloneNode(false);
                    end = this._nodeChange_endLine(lineNodes[endLength], newNode, validation, endCon, endOff, isRemoveFormat, isRemoveNode, _removeCheck, _getMaintainedNode, _isMaintainedNode);
                } else {
                    end = start;
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
         * @param {Element} removeNode The remove node
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
         * @param {function} validation Check if the node should be stripped.
         * @param {Element} startCon The startContainer property of the selection object.
         * @param {Number} startOff The startOffset property of the selection object.
         * @param {Element} endCon The endContainer property of the selection object.
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
                                pNode.appendChild(child);
                                i--; len--;
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
                    let textNode = util.createTextNode(collapsed ? util.zeroWidthSpace : removeNode.textContent);
                    pNode.replaceChild(textNode, removeNode);

                    if (i === 0) startContainer = endContainer = textNode;
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

            if (endContainer.textContent.length === 0) {
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
            const newOffsets = util.mergeSameTags(pNode, startPath, endPath, true);

            element.parentNode.replaceChild(pNode, element);

            startContainer = util.getNodeFromPath(startPath, pNode);
            endContainer = util.getNodeFromPath(endPath, pNode);

            return {
                startContainer: startContainer,
                startOffset: startOffset + newOffsets.a,
                endContainer: endContainer,
                endOffset: endOffset + newOffsets.b
            };
        },

        /**
         * @description wraps first line selected text.
         * @param {Element} element The node of the line that contains the selected text node.
         * @param {Element} newInnerNode The dom that will wrap the selected text area
         * @param {function} validation Check if the node should be stripped.
         * @param {Element} startCon The startContainer property of the selection object.
         * @param {Number} startOff The startOffset property of the selection object.
         * @param {Boolean} isRemoveFormat Is the remove all formats command?
         * @param {Boolean} isRemoveNode "newInnerNode" is remove node?
         * @returns {{container: *, offset: *}}
         * @private
         */
        _nodeChange_startLine: function (element, newInnerNode, validation, startCon, startOff, isRemoveFormat, isRemoveNode, _removeCheck, _getMaintainedNode, _isMaintainedNode) {
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

                for (let i = 0, len = childNodes.length, vNode; i < len; i++) {
                    const child = childNodes[i];
                    if (!child) continue;
                    let coverNode = ancestor;

                    if (passNode && !util.isBreak(child)) {
                        if (child.nodeType === 1) {
                            if (util._isIgnoreNodeChange(child)) {
                                newInnerNode = newInnerNode.cloneNode(false);
                                pNode.appendChild(child);
                                pNode.appendChild(newInnerNode);
                                nNodeArray.push(newInnerNode);
                                i--; len--;
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
                    offset: startOff
                };
            }

            isRemoveFormat = isRemoveFormat && isRemoveNode;

            if (isRemoveFormat) {
                for (let i = 0; i < nNodeArray.length; i++) {
                    let removeNode = nNodeArray[i];
                    let textNode = util.createTextNode(removeNode.textContent);
                    pNode.replaceChild(textNode, removeNode);
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
                const newOffsets = util.mergeSameTags(pNode, path, null, true);

                element.parentNode.replaceChild(pNode, element);

                container = util.getNodeFromPath(path, pNode);
                offset += newOffsets.a;
            }

            return {
                container: container,
                offset: offset
            };
        },

        /**
         * @description wraps mid lines selected text.
         * @param {Element} element The node of the line that contains the selected text node.
         * @param {Element} newInnerNode The dom that will wrap the selected text area
         * @param {function} validation Check if the node should be stripped.
         * @param {Boolean} isRemoveFormat Is the remove all formats command?
         * @param {Boolean} isRemoveNode "newInnerNode" is remove node?
         * @private
         */
        _nodeChange_middleLine: function (element, newInnerNode, validation, isRemoveFormat, isRemoveNode, _removeCheck) {
            // not add tag
            if (!isRemoveNode) {
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
                    return;
                }
            }

            // add tag
            _removeCheck.v = false;
            const pNode = element.cloneNode(false);
            const nNodeArray = [newInnerNode];
            let noneChange = true;

            (function recursionFunc(current, ancestor) {
                const childNodes = current.childNodes;

                for (let i = 0, len = childNodes.length, vNode; i < len; i++) {
                    let child = childNodes[i];
                    if (!child) continue;
                    let coverNode = ancestor;

                    if (!util.isBreak(child) && util._isIgnoreNodeChange(child)) {
                        if (newInnerNode.childNodes.length > 0) {
                            pNode.appendChild(newInnerNode);
                            newInnerNode = newInnerNode.cloneNode(false);
                        }
                        pNode.appendChild(child);
                        pNode.appendChild(newInnerNode);
                        nNodeArray.push(newInnerNode);
                        ancestor = newInnerNode;
                        i--; len--;
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
            if (noneChange || (isRemoveNode && !isRemoveFormat && !_removeCheck.v)) return;

            pNode.appendChild(newInnerNode);

            if (isRemoveFormat && isRemoveNode) {
                for (let i = 0; i < nNodeArray.length; i++) {
                    let removeNode = nNodeArray[i];
                    let textNode = util.createTextNode(removeNode.textContent);
                    pNode.replaceChild(textNode, removeNode);
                }
            } else if (isRemoveNode) {
                for (let i = 0; i < nNodeArray.length; i++) {
                    this._stripRemoveNode(nNodeArray[i]);
                }
            }

            util.removeEmptyNode(pNode, newInnerNode);
            util.mergeSameTags(pNode, null, null, true);

            // node change
            element.parentNode.replaceChild(pNode, element);
        },

        /**
         * @description wraps last line selected text.
         * @param {Element} element The node of the line that contains the selected text node.
         * @param {Element} newInnerNode The dom that will wrap the selected text area
         * @param {function} validation Check if the node should be stripped.
         * @param {Element} endCon The endContainer property of the selection object.
         * @param {Number} endOff The endOffset property of the selection object.
         * @param {Boolean} isRemoveFormat Is the remove all formats command?
         * @param {Boolean} isRemoveNode "newInnerNode" is remove node?
         * @returns {{container: *, offset: *}}
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
                                pNode.insertBefore(child, ancestor);
                                pNode.insertBefore(newInnerNode, child);
                                nNodeArray.push(newInnerNode);
                                i++;
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
                    let textNode = util.createTextNode(removeNode.textContent);
                    pNode.replaceChild(textNode, removeNode);

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
                util.removeEmptyNode(pNode, newInnerNode);

                if (util.onlyZeroWidthSpace(pNode.textContent)) {
                    container = pNode.firstChild;
                    offset = container.textContent.length;
                } else if (util.onlyZeroWidthSpace(container)) {
                    container = pNode;
                    offset = 0;
                }
                
                // node change
                const offsets = {s: 0, e: 0};
                const path = util.getNodePath(container, pNode, offsets);
                offset += offsets.s;

                // tag merge
                const newOffsets = util.mergeSameTags(pNode, path, null, true);

                element.parentNode.replaceChild(pNode, element);

                container = util.getNodeFromPath(path, pNode);
                offset += newOffsets.a;
            }

            return {
                container: container,
                offset: offset
            };
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
                    this.setRange(first, 0, last, last.textContent.length);
                    this.focus();
                    break;
                case 'codeView':
                    this.toggleCodeView();
                    util.toggleClass(target, 'active');
                    break;
                case 'fullScreen':
                    this.toggleFullScreen(target);
                    util.toggleClass(target, 'active');
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
                    util.toggleClass(target, 'active');
                    break;
                case 'save':
                    if (typeof options.callBackSave === 'function') {
                        options.callBackSave(this.getContents(false));
                    } else if (typeof userFunction.save === 'function') {
                        userFunction.save();
                    } else {
                        throw Error('[SUNEDITOR.core.commandHandler.fail] Please register call back function in creation option. (callBackSave : Function)');
                    }

                    if (context.tool.save) context.tool.save.setAttribute('disabled', true);
                    break;
                default : // 'STRONG', 'INS', 'EM', 'DEL', 'SUB', 'SUP'
                    const btn = util.hasClass(this.commandMap[command], 'active') ? null : util.createElement(command);
                    let removeNode = command;

                    if (command === 'SUB' && util.hasClass(this.commandMap.SUP, 'active')) {
                        removeNode = 'SUP';
                    } else if (command === 'SUP' && util.hasClass(this.commandMap.SUB, 'active')) {
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
            const rangeLines = this.getSelectedElements();
            let p, margin;

            for (let i = 0, len = rangeLines.length; i < len; i++) {
                p = rangeLines[i];
                margin = /\d+/.test(p.style.marginLeft) ? util.getNumber(p.style.marginLeft, 0) : 0;

                if ('indent' === command) {
                    margin += 25;
                } else {
                    margin -= 25;
                }
    
                util.setStyle(p, 'marginLeft', (margin <= 0 ? '' : margin + 'px'));
            }

            event._applyTagEffects();
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
            const disButtons = this.codeViewDisabledButtons;
            for (let i = 0, len = disButtons.length; i < len; i++) {
                disButtons[i].disabled = !isCodeView;
            }

            this.controllersOff();

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
                    if (/balloon/i.test(options.mode)) {
                        context.element._arrow.style.display = '';
                        this._isInline = false;
                        this._isBalloon = true;
                        event._hideToolbar();    
                    }
                }

                this._resourcesStateChange();
                this._checkComponents();
                this.focus();

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
                const parseDocument = (new this._w.DOMParser()).parseFromString(code_html, 'text/html');
                const headChildren = parseDocument.head.children;

                for (let i = 0, len = headChildren.length; i < len; i++) {
                    if (/script/i.test(headChildren[i].tagName)) {
                        parseDocument.head.removeChild(headChildren[i]);
                        i--, len--;
                    }
                }

                this._wd.head.innerHTML = parseDocument.head.innerHTML;
                this._wd.body.innerHTML = util.convertContentsForEditor(parseDocument.body.innerHTML, this.editorTagsWhitelistRegExp);

                const attrs = parseDocument.body.attributes;
                for (let i = 0, len = attrs.length; i < len; i++) {
                    if (attrs[i].name === 'contenteditable') continue;
                    this._wd.body.setAttribute(attrs[i].name, attrs[i].value);
                }
                if (!util.hasClass(this._wd.body, 'sun-editor-editable')) util.addClass(this._wd.body, 'sun-editor-editable');
            } else {
                context.element.wysiwyg.innerHTML = code_html.length > 0 ? util.convertContentsForEditor(code_html, this.editorTagsWhitelistRegExp) : '<p><br></p>';
            }
        },

        /**
         * @description Convert the data of the WYSIWYG area and put it in the code view area.
         * @private
         */
        _setEditorDataToCodeView: function () {
            const codeContents = util.convertHTMLForCodeView(context.element.wysiwyg, this._variable.codeIndent);
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

                util.removeClass(element.firstElementChild, 'se-icon-expansion');
                util.addClass(element.firstElementChild, 'se-icon-reduction');

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

                if (_var._fullScreenAttrs.sticky) {
                    _var._fullScreenAttrs.sticky = false;
                    context.element._stickyDummy.style.display = 'block';
                    util.addClass(toolbar, "se-toolbar-sticky");
                }

                this._isInline = _var._fullScreenAttrs.inline;
                this._isBalloon = _var._fullScreenAttrs.balloon;
                if (this._isInline) event._showToolbarInline();

                event.onScroll_window();

                util.removeClass(element.firstElementChild, 'se-icon-reduction');
                util.addClass(element.firstElementChild, 'se-icon-expansion');
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

            if (options.iframe) {
                const wDocument = util.getIframeDocument(context.element.wysiwygFrame);
                const arrts = options.fullPage ? util.getAttributesToString(wDocument.body, ['contenteditable']) : 'class="sun-editor-editable"';

                printDocument.write('' +
                    '<!DOCTYPE html><html>' +
                    '<head>' +
                    wDocument.head.innerHTML +
                    '<style>' + util.getPageStyle(context.element.wysiwygFrame) + '</style>' +
                    '</head>' +
                    '<body ' + arrts + '>' + contentsHTML + '</body>' +
                    '</html>'
                );
            } else {
                const contents = util.createElement('DIV');
                const style = util.createElement('STYLE');

                style.innerHTML = util.getPageStyle();
                contents.className = 'sun-editor-editable';
                contents.innerHTML = contentsHTML;

                printDocument.head.appendChild(style);
                printDocument.body.appendChild(contents);
            }

            try {
                iframe.focus();
                // IE or Edge
                if (_w.navigator.userAgent.indexOf('MSIE') !== -1 || !!_d.documentMode || !!_w.StyleMedia) {
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

            if (options.iframe) {
                const wDocument = util.getIframeDocument(context.element.wysiwygFrame);
                const arrts = options.fullPage ? util.getAttributesToString(wDocument.body, ['contenteditable']) : 'class="sun-editor-editable"';

                windowObject.document.write('' +
                    '<!DOCTYPE html><html>' +
                    '<head>' +
                    wDocument.head.innerHTML +
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
                    '<style>' + util.getPageStyle() + '</style>' +
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
            const convertValue = util.convertContentsForEditor(html, this.editorTagsWhitelistRegExp);
            this._resetComponents();

            if (!core._variable.isCodeView) {
                context.element.wysiwyg.innerHTML = convertValue;
                // history stack
                core.history.push(false);
            } else {
                const value = util.convertHTMLForCodeView(convertValue, core._variable.codeIndent);
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
         * @param {Number} nextCharCount Length of character to be added.
         * @returns {Boolean}
         * @private
         */
        _charCount: function (nextCharCount, blink) {
            const charCounter = context.element.charCounter;
            if (!charCounter) return true;
            if (!nextCharCount || nextCharCount < 0) nextCharCount = 0;

            const maxCharCount = options.maxCharCount;

            _w.setTimeout(function () {
                charCounter.textContent = context.element.wysiwyg.textContent.length;
            });

            if (maxCharCount > 0) {
                let over = false;
                const count = context.element.wysiwyg.textContent.length;
                
                if (count > maxCharCount) {
                    core._editorRange();
                    const range = core.getRange();
                    const endOff = range.endOffset - 1;
                    const text = core.getSelectionNode().textContent;

                    core.getSelectionNode().textContent = text.slice(0, range.endOffset - 1) + text.slice(range.endOffset, text.length);
                    core.setRange(range.endContainer, endOff, range.endContainer, endOff);
                    over = true;
                } else if ((count + nextCharCount) > maxCharCount) {
                    over = true;
                }

                if (over) {
                    if (blink && !util.hasClass(charCounter, 'se-blink')) {
                        util.addClass(charCounter, 'se-blink');
                        _w.setTimeout(function () {
                            util.removeClass(charCounter, 'se-blink');
                        }, 600);
                    }

                    return false;
                }
            }

            return true;
        },

        /**
         * @description Check the components such as image and video and modify them according to the format.
         * @private
         */
        _checkComponents: function () {
            if (this.plugins.image) {
                if (!this.initPlugins.image) this.callPlugin('image', this.plugins.image.checkImagesInfo.bind(this));
                else this.plugins.image.checkImagesInfo.call(this);
            }

            if (this.plugins.video) {
                if (!this.initPlugins.video) this.callPlugin('video', this.plugins.video.checkVideosInfo.bind(this));
                else this.plugins.video.checkVideosInfo.call(this);
            }
        },

        /**
         * @description Initialize the information of the components.
         * @private
         */
        _resetComponents: function () {
            this._variable._imagesInfo = [];
            this._variable._imageIndex = 0;
            this._variable._videosCnt = 0;
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
         * @private
         */
        _init: function (reload) {
            this._ww = options.iframe ? context.element.wysiwygFrame.contentWindow : _w;
            this._wd = _d;

            _w.setTimeout(function () {
                this._checkComponents();
                this._imagesInfoInit = false;
                this._imagesInfoReset = false;
                
                this.history.reset(true);

                if (options.iframe) {
                    this._wd = context.element.wysiwygFrame.contentDocument;
                    context.element.wysiwyg = this._wd.body;
                    if (options.height === 'auto') {
                        this._iframeAuto = this._wd.body;
                    }
                    this._iframeAutoHeight();
                }

                if (typeof userFunction.onload === 'function') return userFunction.onload(core, reload);
            }.bind(this));

            this.editorTagsWhitelistRegExp = util.createTagsWhitelist(options._editorTagsWhitelist);
            this.pasteTagsWhitelistRegExp = util.createTagsWhitelist(options.pasteTagsWhitelist);

            this.codeViewDisabledButtons = context.element.toolbar.querySelectorAll('.se-toolbar button:not([class~="code-view-enabled"])');
            this._isInline = /inline/i.test(options.mode);
            this._isBalloon = /balloon/i.test(options.mode);

            this.commandMap = {
                SIZE: context.tool.fontSize,

                STRONG: context.tool.bold,
                INS: context.tool.underline,
                EM: context.tool.italic,
                DEL: context.tool.strike,
                SUB: context.tool.subscript,
                SUP: context.tool.superscript,
                OUTDENT: context.tool.outdent
            };

            // Command plugins registration
            const activePlugins = this.activePlugins = [];
            let c, button;
            for (let key in plugins) {
                c = plugins[key];
                button = pluginCallButtons[key];
                if (c.active && button) {
                    core.callPlugin(key, button);
                    core.commandMap[c.name] = button;
                    activePlugins.push(c.name);
                }
            }

            this._variable._originCssText = context.element.topArea.style.cssText;
            this._placeholder = context.element.placeholder;

            /** Excute history function */
            this._checkPlaceholder();
            this.history = _history(this, event._onChange_historyStack);
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
                context.element.wysiwygFrame.style.height = this._iframeAuto.offsetHeight + 'px';
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
        }
    };

    /**
     * @description event function
     */
    const event = {
        _directionKeyCode: new _w.RegExp('^(8|13|32|46|3[3-9]|40|46)$'),
        _nonTextKeyCode: new _w.RegExp('^(8|13|1[6-9]|20|27|3[3-9]|40|45|46|11[2-9]|12[0-3]|144|145)$'),
        _historyIgnoreKeyCode: new _w.RegExp('^(1[6-9]|20|27|3[3-9]|40|45|11[2-9]|12[0-3]|144|145)$'),
        _onButtonsCheck: new _w.RegExp('^(STRONG|INS|EM|DEL|SUB|SUP)$'),
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
                    command = 'INS';
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
            if (selectionNode === core._lastEffectNode) return;
            core._lastEffectNode = selectionNode;

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
                    if (commandMapNodes.indexOf('OUTDENT') === -1 && element.style.marginLeft && util.getNumber(element.style.marginLeft, 0) > 0 && commandMap.OUTDENT) {
                        commandMapNodes.push('OUTDENT');
                        commandMap.OUTDENT.removeAttribute('disabled');
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

        onMouseDown_toolbar: function (e) {
            let target = e.target;

            if (util.getParentElement(target, '.se-submenu')) {
                e.stopPropagation();
                core._notHideToolbar = true;
            } else {
                e.preventDefault();
                let command = target.getAttribute('data-command');
                let className = target.className;
    
                while (!command && !/se-menu-list/.test(className) && !/se-toolbar/.test(className)) {
                    target = target.parentNode;
                    command = target.getAttribute('data-command');
                    className = target.className;
                }
    
                if (command === core._submenuName) {
                    e.stopPropagation();
                }
            }
        },

        onClick_toolbar: function (e) {
            e.preventDefault();
            e.stopPropagation();

            let target = e.target;
            let display = target.getAttribute('data-display');
            let command = target.getAttribute('data-command');
            let className = target.className;

            while (!command && !/se-menu-list/.test(className) && !/se-toolbar/.test(className)) {
                target = target.parentNode;
                command = target.getAttribute('data-command');
                display = target.getAttribute('data-display');
                className = target.className;
            }

            if (!command && !display) return;
            if (target.disabled) return;
            
            core.focus();
            
            /** call plugins */
            if (display) {
                if (/submenu/.test(display) && (target.nextElementSibling === null || target !== core.submenuActiveButton)) {
                    core.callPlugin(command, function () {
                        core.submenuOn(target);
                    });
                    return;
                }
                else if (/dialog/.test(display)) {
                    core.callPlugin(command, function () {
                        core.plugins.dialog.open.call(core, command, command === core.currentControllerName);
                    });
                    return;
                }
                else if (/command/.test(display)) {
                    core.callPlugin(command, function () {
                        core.plugins[command].action.call(core);
                    });
                }

                core.submenuOff();
                return;
            }

            /** default command */
            if (command) {
                core.commandHandler(target, command);
            }
        },

        /**
         * @warning Events are registered only when there is a table plugin.
         */
        onMouseDown_wysiwyg: function (e) {
            if (context.element.wysiwyg.getAttribute('contenteditable') === 'false') return;
            
            const tableCell = util.getParentElement(e.target, util.isCell);
            if (tableCell) {
                const tablePlugin = core.plugins.table;
                if (tableCell !== tablePlugin._fixedCell && !tablePlugin._shift) {
                    core.callPlugin('table', function () {
                        tablePlugin.onTableCellMultiSelect.call(core, tableCell, false);
                    });
                }
            }

            if (core._isBalloon) {
                event._hideToolbar();
            }
        },

        onClick_wysiwyg: function (e) {
            const targetElement = e.target;
            if (context.element.wysiwyg.getAttribute('contenteditable') === 'false') return;

            e.stopPropagation();

            if (/^FIGURE$/i.test(targetElement.nodeName)) {
                const imageComponent = targetElement.querySelector('IMG');
                const videoComponent = targetElement.querySelector('IFRAME');

                if (imageComponent) {
                    e.preventDefault();
                    core.selectComponent(imageComponent, 'image');
                    return;
                } else if (videoComponent) {
                    e.preventDefault();
                    core.selectComponent(videoComponent, 'video');
                    return;
                }
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

            core._editorRange();

            const selectionNode = core.getSelectionNode();
            const formatEl = util.getFormatElement(selectionNode);
            const rangeEl = util.getRangeFormatElement(selectionNode);
            if (core.getRange().collapsed && (!formatEl || formatEl === rangeEl) && targetElement.getAttribute('contenteditable') !== 'false') {
                if (util.isList(rangeEl)) {
                    const oLi = util.createElement('LI');
                    const prevLi = selectionNode.nextElementSibling;
                    oLi.appendChild(selectionNode);
                    rangeEl.insertBefore(oLi, prevLi);
                } else {
                    core.execCommand('formatBlock', false, util.isRangeFormatElement(rangeEl) ? 'DIV' : 'P');
                }
                e.preventDefault();
                core.focus();
            } else {                
                event._applyTagEffects();
            }

            if (core._isBalloon) _w.setTimeout(event._toggleToolbarBalloon); 
            if (userFunction.onClick) userFunction.onClick(e, core);
        },

        _toggleToolbarBalloon: function () {
            core._editorRange();
            const range = core.getRange();
            if (range.collapsed) event._hideToolbar();
            else event._showToolbarBalloon(range);
        },

        _showToolbarBalloon: function (rangeObj) {
            if (!core._isBalloon) return;

            const range = rangeObj || core.getRange();
            const toolbar = context.element.toolbar;
            const selection = core.getSelection();

            let isDirTop;
            if (selection.focusNode === selection.anchorNode) {
                isDirTop = selection.focusOffset < selection.anchorOffset;
            } else {
                const childNodes = util.getListChildNodes(range.commonAncestorContainer);
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
            const stickyTop = event._getStickyOffsetTop();
            let editorLeft = 0;
            let topArea = context.element.topArea;
            while (topArea && !/^(BODY|HTML)$/i.test(topArea.nodeName)) {
                editorLeft += topArea.offsetLeft;
                topArea = topArea.offsetParent;
            }
            
            toolbar.style.visibility = 'hidden';
            toolbar.style.display = 'block';
            
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
            const toolbarHeight = toolbar.offsetHeight;

            const absoluteLeft = (isDirTop ? rects.left : rects.right) - editorLeft - (toolbarWidth / 2) + scrollLeft;
            const overRight = absoluteLeft + toolbarWidth - editorWidth;
            
            const t = (isDirTop ? rects.top - toolbarHeight - arrowMargin : rects.bottom + arrowMargin) - stickyTop + scrollTop;
            let l = absoluteLeft < 0 ? padding : overRight < 0 ? absoluteLeft : absoluteLeft - overRight - padding - 1;

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
            toolbar.style.visibility = 'hidden';
            toolbar.style.display = 'block';
            core._inlineToolbarAttr.width = toolbar.style.width = options.toolbarWidth;
            core._inlineToolbarAttr.top = toolbar.style.top = (-1 - toolbar.offsetHeight) + 'px';
            
            if (typeof userFunction.showInline === 'function') userFunction.showInline(toolbar, context, core);

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

        _onShortcutKey: false,
        onKeyDown_wysiwyg: function (e) {
            const keyCode = e.keyCode;
            const shift = e.shiftKey;
            const ctrl = e.ctrlKey || e.metaKey;
            const alt = e.altKey;

            if (!event._directionKeyCode.test(keyCode)) _w.setTimeout(core._resourcesStateChange);
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
            const selectionNode = core.getSelectionNode();
            const range = core.getRange();
            const selectRange = !range.collapsed || range.startContainer !== range.endContainer;
            const resizingName = core._resizingName;
            let formatEl = util.getFormatElement(selectionNode) || selectionNode;
            let rangeEl = util.getRangeFormatElement(selectionNode);

            switch (keyCode) {
                case 8: /** backspace key */
                    if (selectRange) break;
                    if (resizingName) {
                        e.preventDefault();
                        e.stopPropagation();
                        core.plugins[resizingName].destroy.call(core);
                        break;
                    }

                    if (util.isWysiwygDiv(selectionNode.parentNode) && util.isFormatElement(selectionNode) && !util.isListCell(selectionNode) && selectionNode.childNodes.length === 0) {
                        e.preventDefault();
                        e.stopPropagation();
                        selectionNode.innerHTML = '<br>';
                        if (!selectionNode.nextElementSibling) {
                            const attrs = selectionNode.attributes;
                            while (attrs[0]) {
                                selectionNode.removeAttribute(attrs[0].name);
                            }
                            core.execCommand('formatBlock', false, 'P');
                        }
                        return false;
                    }

                    const commonCon = range.commonAncestorContainer;
                    if (range.startOffset === 0 && range.endOffset === 0) {
                        if (rangeEl && formatEl && !util.isCell(rangeEl) && !/^FIGCAPTION$/i.test(rangeEl.nodeName)) {
                            let detach = true;
                            let comm = commonCon;
                            while (comm && comm !== rangeEl && !util.isWysiwygDiv(comm)) {
                                if (comm.previousSibling) {
                                    detach = false;
                                    break;
                                }
                                comm = comm.parentNode;
                            }

                            if (detach && rangeEl.parentNode) {
                                e.preventDefault();
                                core.detachRangeFormatElement(rangeEl, (util.isListCell(formatEl) ? [formatEl] : null), null, false, false);
                                break;
                            }	
                        }	

                        if (util.isComponent(commonCon.previousSibling) || (commonCon.nodeType === 3 && !commonCon.previousSibling && range.startOffset === 0 && range.endOffset === 0 && util.isComponent(formatEl.previousSibling))) {
                            const previousEl = formatEl.previousSibling;
                            util.removeItem(previousEl);
                        }
                    }

                    break;
                case 46: /** delete key */
                    if (resizingName) {
                        e.preventDefault();
                        e.stopPropagation();
                        core.plugins[resizingName].destroy.call(core);
                        break;
                    }

                    if ((util.isFormatElement(selectionNode) || selectionNode.nextSibling === null) && range.startOffset === selectionNode.textContent.length) {
                        let nextEl = formatEl.nextElementSibling;
                        if (util.isComponent(nextEl)) {
                            e.preventDefault();

                            if (util.onlyZeroWidthSpace(formatEl)) {
                                util.removeItem(formatEl);
                            }

                            if (util.hasClass(nextEl, 'se-component') || /^IMG$/i.test(nextEl.nodeName)) {
                                e.stopPropagation();
                                if (util.hasClass(nextEl, 'se-image-container') || /^IMG$/i.test(nextEl.nodeName)) {
                                    nextEl = /^IMG$/i.test(nextEl.nodeName) ? nextEl : nextEl.querySelector('img');
                                    core.selectComponent(nextEl, 'image');
                                } else if (util.hasClass(nextEl, 'se-video-container')) {
                                    core.selectComponent(nextEl.querySelector('iframe'), 'video');
                                }
                            }

                            break;
                        }
                    }
                    
                    break;
                case 9: /** tab key */
                    e.preventDefault();
                    if (ctrl || alt || util.isWysiwygDiv(selectionNode)) break;

                    core.controllersOff();
                    
                    // table
                    let currentNode = selectionNode;
                    while (!util.isCell(currentNode) && !util.isWysiwygDiv(currentNode)) {
                        currentNode = currentNode.parentNode;
                    }

                    if (currentNode && util.isCell(currentNode)) {
                        const table = util.getParentElement(currentNode, 'table');
                        const cells = util.getListChildren(table, util.isCell);
                        let idx = shift ? util.prevIdx(cells, currentNode) : util.nextIdx(cells, currentNode);

                        if (idx === cells.length && !shift) idx = 0;
                        if (idx === -1 && shift) idx = cells.length - 1;

                        const moveCell = cells[idx];
                        if (!moveCell) return false;

                        core.setRange(moveCell, 0, moveCell, 0);
                        break;
                    }

                    const selectedFormats = core.getSelectedElements();
                    const cells = [];
                    let lines = [];
                    let fc = util.isListCell(selectedFormats[0]), lc = util.isListCell(selectedFormats[selectedFormats.length - 1]);
                    let r = {sc: null, so: null, ec: null, eo: null};
                    for (let i = 0, len = selectedFormats.length, f; i < len; i++) {
                        f = selectedFormats[i];
                        if (util.isListCell(f)) {
                            if (!f.previousElementSibling && !shift) {
                                lines.push(f);
                            } else {
                                cells.push(f);
                            }
                        } else {
                            lines.push(f);
                        }
                    }
                    
                    // Nested list
                    if (cells.length > 0 && (!range.collapsed || core.isEdgePoint(range.startContainer, range.startOffset)) && core.plugins.list) {
                        core.callPlugin('list', function () {
                            const listRange = core.plugins.list.editInsideList.call(core, shift, cells);
                            if (fc) {
                                r.sc = listRange.sc;
                                r.so = listRange.so;
                            }
                            if (lc) {
                                r.ec = listRange.ec;
                                r.eo = listRange.eo;
                            }
                        });
                    } else {
                        lines = lines.concat(cells);
                        fc = lc = null;
                    }

                    // Lines tab(4)
                    if (lines.length > 0) {
                        if (!shift) {
                            const tabText = util.createTextNode(new _w.Array(core._variable.tabSize + 1).join('\u00A0'));
                            if (lines.length === 1) {
                                const textRange = core.insertNode(tabText);
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
                            for (let i = 0, child; i <= len; i++) {
                                child = lines[i].firstChild;
                                if (!child) continue;
    
                                if (/^\s{1,4}$/.test(child.textContent)) {
                                    util.removeItem(child);
                                } else if (/^\s{1,4}/.test(child.textContent)) {
                                    child.textContent = child.textContent.replace(/^\s{1,4}/, '');
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
                    const freeFormatEl = util.getFreeFormatElement(selectionNode);
                    if (!shift && freeFormatEl) {
                        e.preventDefault();
                        const selectionFormat = selectionNode === freeFormatEl;
                        const wSelection = core.getSelection();
                        const children = selectionNode.childNodes, offset = wSelection.focusOffset, prev = selectionNode.previousElementSibling, next = selectionNode.nextSibling;

                        if ((selectionFormat && range.collapsed && children.length - 1 <= offset + 1 && util.isBreak(children[offset]) && (!children[offset + 1] || ((!children[offset + 2] || util.onlyZeroWidthSpace(children[offset + 2].textContent)) && children[offset + 1].nodeType === 3 && util.onlyZeroWidthSpace(children[offset + 1].textContent))) &&  offset > 0 && util.isBreak(children[offset - 1])) ||
                         (!selectionFormat && util.onlyZeroWidthSpace(selectionNode.textContent) && util.isBreak(prev) && (util.isBreak(prev.previousSibling) || !util.onlyZeroWidthSpace(prev.previousSibling.textContent)) && (!next || (!util.isBreak(next) && util.onlyZeroWidthSpace(next.textContent))))) {
                            if (selectionFormat) util.removeItem(children[offset - 1]);
                            else util.removeItem(selectionNode);
                            const newEl = core.appendFormatTag(freeFormatEl, util.isFormatElement(freeFormatEl.nextElementSibling) ? freeFormatEl.nextElementSibling : null);
                            util.copyFormatAttributes(newEl, freeFormatEl);
                            core.setRange(newEl, 1, newEl, 1);
                            break;
                        }
                        
                        if (selectionFormat) {
                            core.execCommand('insertHTML', false, '<BR><BR>');

                            let focusNode = wSelection.focusNode;
                            const wOffset = wSelection.focusOffset;
                            if (freeFormatEl === focusNode) {
                                focusNode = focusNode.childNodes[wOffset - offset > 1 ? wOffset - 1 : wOffset];
                            } else {
                                focusNode = focusNode.previousSibling;
                            }

                            core.setRange(focusNode, 1, focusNode, 1);
                        } else {
                            const focusNext = wSelection.focusNode.nextSibling;
                            const br = util.createElement('BR');
                            core.insertNode(br);
                            
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
                        if (!range.commonAncestorContainer.nextElementSibling && util.onlyZeroWidthSpace(formatEl.innerText.trim())) {
                            e.preventDefault();
                            let newEl = null;

                            if (util.isListCell(rangeEl.parentNode)) {
                                rangeEl = rangeEl.parentNode;
                                newEl = core.appendFormatTag(rangeEl, 'LI');
                            } else {
                                const newFormat = util.isCell(rangeEl.parentNode) ? 'DIV' : util.isList(rangeEl.parentNode) ? 'LI' : util.isFormatElement(rangeEl.nextElementSibling) ? rangeEl.nextElementSibling : util.isFormatElement(rangeEl.previousElementSibling) ? rangeEl.previousElementSibling : 'P';
                                newEl = core.appendFormatTag(rangeEl, newFormat);
                                util.copyFormatAttributes(newEl, formatEl);
                            }

                            util.removeItemAllParents(formatEl, null);
                            core.setRange(newEl, 1, newEl, 1);
                            break;
                        }
                    }

                    if (rangeEl && util.getParentElement(rangeEl, 'FIGCAPTION') && util.getParentElement(rangeEl, util.isList)) {
                        e.preventDefault();
                        formatEl = core.appendFormatTag(formatEl, null);
                        core.setRange(formatEl, 0, formatEl, 0);
                    }

                    if (resizingName) {
                        e.preventDefault();
                        e.stopPropagation();
                        const compContext = context[resizingName];
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
                        
                        core.callPlugin(resizingName, function () {
                            const size = core.plugins.resizing.call_controller_resize.call(core, compContext._element, resizingName);
                            core.plugins[resizingName].onModifyMode.call(core, compContext._element, size);
                        });
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
            if (!core._charCount(1, textKey)) {
                if (textKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }

            if (userFunction.onKeyDown) userFunction.onKeyDown(e, core);
        },

        onKeyUp_wysiwyg: function (e) {
            if (event._onShortcutKey) return;
            core._editorRange();
            const range = core.getRange();
            const keyCode = e.keyCode;
            const ctrl = e.ctrlKey || e.metaKey || keyCode === 91 || keyCode === 92;
            const alt = e.altKey;
            let selectionNode = core.getSelectionNode();

            if (core._isBalloon && !range.collapsed) {
                event._showToolbarBalloon();
                return;
            }

            /** when format tag deleted */
            if (keyCode === 8 && util.isWysiwygDiv(selectionNode) && selectionNode.textContent === '') {
                e.preventDefault();
                e.stopPropagation();

                selectionNode.innerHTML = '';

                const oFormatTag = util.createElement(util.isFormatElement(core._variable.currentNodes[0]) ? core._variable.currentNodes[0] : 'P');
                oFormatTag.innerHTML = '<br>';

                selectionNode.appendChild(oFormatTag);
                core.setRange(oFormatTag, 0, oFormatTag, 0);
                event._applyTagEffects();

                core._checkComponents();
                core.history.push(false);
                return;
            }

            const formatEl = util.getFormatElement(selectionNode);
            const rangeEl = util.getRangeFormatElement(selectionNode);
            if ((!formatEl && range.collapsed) || formatEl === rangeEl) {
                core.execCommand('formatBlock', false, util.isRangeFormatElement(rangeEl) ? 'DIV' : 'P');
                core.focus();
                selectionNode = core.getSelectionNode();
            }

            if (event._directionKeyCode.test(keyCode)) {
                event._applyTagEffects();
            }

            core._checkComponents();

            const historyKey = !ctrl && !alt && !event._historyIgnoreKeyCode.test(keyCode);
            if (historyKey && util.zeroWidthRegExp.test(selectionNode.textContent)) {
                let so = range.startOffset, eo = range.endOffset;
                const frontZeroWidthCnt = (selectionNode.textContent.substring(0, eo).match(event._frontZeroWidthReg) || '').length;
                so = range.startOffset - frontZeroWidthCnt;
                eo = range.endOffset - frontZeroWidthCnt;
                selectionNode.textContent = selectionNode.textContent.replace(util.zeroWidthRegExp, '');
                core.setRange(selectionNode, so < 0 ? 0 : so, selectionNode, eo < 0 ? 0 : eo);
            }

            const textKey = !ctrl && !alt && !event._nonTextKeyCode.test(keyCode);
            if (!core._charCount(1, textKey)) {
                if (e.key.length === 1) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }

            // history stack
            if (historyKey) {
                core.history.push(true);
            }

            if (userFunction.onKeyUp) userFunction.onKeyUp(e, core);
        },

        onScroll_wysiwyg: function (e) {
            core.controllersOff();
            if (core._isBalloon) event._hideToolbar();
            if (userFunction.onScroll) userFunction.onScroll(e, core);
        },

        onBlur_wysiwyg: function (e) {
            if (core._isInline || core._isBalloon) event._hideToolbar();
            if (userFunction.onBlur) userFunction.onBlur(e, core);
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
            const editorTop = event._getStickyOffsetTop() - (core._isInline ? element.toolbar.offsetHeight : 0);
            
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

        _getStickyOffsetTop: function () {
            let offsetEl = context.element.topArea;
            let offsetTop = 0;

            while (offsetEl) {
                offsetTop += offsetEl.offsetTop;
                offsetEl = offsetEl.offsetParent;
            }

            return offsetTop;
        },

        _onStickyToolbar: function () {
            const element = context.element;

            if (!core._isInline) {
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

        onPaste_wysiwyg: function (e) {
            const clipboardData = e.clipboardData;
            if (!clipboardData) return true;

            const maxCharCount = core._charCount(clipboardData.getData('text/plain').length, true);
            const cleanData = util.cleanHTML(clipboardData.getData('text/html'), core.pasteTagsWhitelistRegExp);

            if (typeof userFunction.onPaste === 'function' && !userFunction.onPaste(e, cleanData, maxCharCount, core)) {
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
                core.execCommand('insertHTML', false, cleanData);
            } else {
                // history stack
                core.history.push(true);
            }
        },

        onCut_wysiwyg: function () {
            _w.setTimeout(function () {
                core._resourcesStateChange();
                core._charCount(0, false);
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

            // files
            const files = dataTransfer.files;
            if (files.length > 0 && core.plugins.image) {
                event._setDropLocationSelection(e);
                core.callPlugin('image', function () {
                    context.image.imgInputFile.files = files;
                    core.plugins.image.onRender_imgInput.call(core);
                    context.image.imgInputFile.files = null;
                });
            // check char count
            } else if (!core._charCount(dataTransfer.getData('text/plain').length, true)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            // html paste
            } else {
                const cleanData = util.cleanHTML(dataTransfer.getData('text/html'), core.pasteTagsWhitelistRegExp);
                if (cleanData) {
                    event._setDropLocationSelection(e);
                    core.execCommand('insertHTML', false, cleanData);
                }
            }

            if (userFunction.onDrop) userFunction.onDrop(e, core);
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
            if (userFunction.onChange) userFunction.onChange(core.getContents(true), core);
        },

        _addEvent: function () {
            const eventWysiwyg = options.iframe ? core._ww : context.element.wysiwyg;

            /** toolbar event */
            context.element.toolbar.addEventListener('mousedown', event.onMouseDown_toolbar, false);
            context.element.toolbar.addEventListener('click', event.onClick_toolbar, false);
            /** editor area */
            eventWysiwyg.addEventListener('click', event.onClick_wysiwyg, false);
            eventWysiwyg.addEventListener('keydown', event.onKeyDown_wysiwyg, false);
            eventWysiwyg.addEventListener('keyup', event.onKeyUp_wysiwyg, false);
            eventWysiwyg.addEventListener('paste', event.onPaste_wysiwyg, false);
            eventWysiwyg.addEventListener('cut', event.onCut_wysiwyg, false);
            eventWysiwyg.addEventListener('dragover', event.onDragOver_wysiwyg, false);
            eventWysiwyg.addEventListener('drop', event.onDrop_wysiwyg, false);
            eventWysiwyg.addEventListener('scroll', event.onScroll_wysiwyg, false);
            eventWysiwyg.addEventListener('blur', event.onBlur_wysiwyg, false);

            /** Events are registered only a balloon mode or when there is a table plugin. */
            if (core._isBalloon || core.plugins.table) {
                eventWysiwyg.addEventListener('mousedown', event.onMouseDown_wysiwyg, false);
            }

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

            /** inline editor */
            if (core._isInline) {
                eventWysiwyg.addEventListener('focus', event._showToolbarInline, false);
            }
            
            /** window event */
            _w.removeEventListener('resize', event.onResize_window);
            _w.removeEventListener('scroll', event.onScroll_window);

            _w.addEventListener('resize', event.onResize_window, false);
            if (options.stickyToolbar > -1) {
                _w.addEventListener('scroll', event.onScroll_window, false);
            }
        },

        _removeEvent: function () {
            const eventWysiwyg = options.iframe ? core._ww : context.element.wysiwyg;

            context.element.toolbar.removeEventListener('mousedown', event.onMouseDown_toolbar);
            context.element.toolbar.removeEventListener('click', event.onClick_toolbar);

            eventWysiwyg.removeEventListener('click', event.onClick_wysiwyg);
            eventWysiwyg.removeEventListener('keydown', event.onKeyDown_wysiwyg);
            eventWysiwyg.removeEventListener('keyup', event.onKeyUp_wysiwyg);
            eventWysiwyg.removeEventListener('paste', event.onPaste_wysiwyg);
            eventWysiwyg.removeEventListener('cut', event.onCut_wysiwyg);
            eventWysiwyg.removeEventListener('dragover', event.onDragOver_wysiwyg);
            eventWysiwyg.removeEventListener('drop', event.onDrop_wysiwyg);
            eventWysiwyg.removeEventListener('scroll', event.onScroll_wysiwyg);
            
            eventWysiwyg.removeEventListener('mousedown', event.onMouseDown_wysiwyg);
            eventWysiwyg.removeEventListener('touchstart', event.onMouseDown_wysiwyg, {passive: true, useCapture: false});
            
            eventWysiwyg.removeEventListener('focus', event._showToolbarInline);
            eventWysiwyg.removeEventListener('blur', event.onBlur_wysiwyg);

            context.element.code.removeEventListener('keydown', event._codeViewAutoHeight);
            context.element.code.removeEventListener('keyup', event._codeViewAutoHeight);
            context.element.code.removeEventListener('paste', event._codeViewAutoHeight);
            
            if (context.element.resizingBar) {
                context.element.resizingBar.removeEventListener('mousedown', event.onMouseDown_resizingBar);
            }
            
            _w.removeEventListener('resize', event.onResize_window);
            _w.removeEventListener('scroll', event.onScroll_window);
        }
    };

    /** User function */
    const userFunction = {
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
        onClick: null,
        onKeyDown: null,
        onKeyUp: null,
        onDrop: null,
        onChange: null,
        onPaste: null,
        onBlur: null,
        showInline: null,

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
         * - currentImage: If isUpdate is true, the currently selected image.
         * @param {Object} core Core object
         */
        imageUploadHandler: null,

        /**
         * @description Called before the image is uploaded
         * If false is returned, no image upload is performed.
         * @param {Array} files Files array
         * @param {Object} info Input information
         * @param {Object} core Core object
         * @returns {Boolean}
         */
        onImageUploadBefore: null,

        /**
         * @description Called when the image is uploaded or the uploaded image is deleted
         * @param {Element} targetImgElement Current img element
         * @param {Number} index Uploaded index
         * @param {String} state Upload status ('create', 'update', 'delete')
         * @param {Object} imageInfo Image info object
         * - index: data index
         * - name: file name
         * - size: file size
         * - select: select function
         * - delete: delete function
         * @param {Object} core Core object
         */
        onImageUpload: null,

        /**
         * @description Called when the image is upload failed
         * @param {String} errorMessage Error message
         * @param {Object} result Result info Object
         * @param {Object} core Core object
         * @returns {Boolean}
         */
        onImageUploadError: null,

        /**
         * @description Add or reset option property
         * @param {Object} options Options
         */
        setOptions: function (options) {
            event._removeEvent();

            core.plugins = options.plugins || core.plugins;
            const mergeOptions = [options, options].reduce(function (init, option) {
                for (let key in option) {
                    if (key === 'plugins' && option[key] && init[key]) {
                        let i = init[key], o = option[key];
                        i = i.length ? i : Object.keys(i).map(function(name) { return i[name]; });
                        o = o.length ? o : Object.keys(o).map(function(name) { return o[name]; });
                        init[key] = (o.filter(function(val) { return i.indexOf(val) === -1; })).concat(i);
                    } else {
                        init[key] = option[key];
                    }
                }
                return init;
            }, {});

            const cons = _Constructor._setOptions(mergeOptions, context, core.plugins, options);

            if (cons.callButtons) {
                pluginCallButtons = cons.callButtons;
                core.initPlugins = {};
            }

            if (cons.plugins) {
                core.plugins = plugins = cons.plugins;
            }

            // reset context
            const el = context.element;
            const constructed = {
                _top: el.topArea,
                _relative: el.relative,
                _toolBar: el.toolbar,
                _editorArea: el.editorArea,
                _wysiwygArea: el.wysiwygFrame,
                _codeArea: el.code,
                _placeholder: el.placeholder,
                _resizingBar: el.resizingBar,
                _navigation: el.navigation,
                _charCounter: el.charCounter,
                _loading: el.loading,
                _resizeBack: el.resizeBackground,
                _stickyDummy: el._stickyDummy,
                _arrow: el._arrow
            };
            
            options = mergeOptions;
            core.lang = lang = options.lang;
            core.context = context = _Context(context.element.originElement, constructed, options);

            core._imagesInfoReset = true;
            core._init(true);
            event._addEvent();
            core._charCount(0, false);

            event._offStickyToolbar();
            event.onResize_window();
            
            core.focus();
        },

        /**
         * @description Open a notice area
         * @param {String} message Notice message
         */
        noticeOpen: function (message) {
            core.addModule([notice]);
            notice.open.call(core, message);
        },

        /**
         * @description Close a notice area
         */
        noticeClose: function () {
            core.addModule([notice]);
            notice.close.call(core);
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
         * @description Gets uploaded images informations
         * @returns {Array}
         */
        getImagesInfo: function () {
            return core._variable._imagesInfo;
        },

        /**
         * @description Upload images using image plugin
         * @param {FileList} files FileList
         */
        insertImage: function (files) {
            if (!core.plugins.image || !files) return;

            if (!core.initPlugins.image) core.callPlugin('image', core.plugins.image.submitAction.bind(core, files));
            else core.plugins.image.submitAction.call(core, files);
            core.focus();
        },

        /**
         * @description Inserts an HTML element or HTML string or plain string at the current cursor position
         * @param {Element|String} html HTML Element or HTML string or plain string
         */
        insertHTML: function (html) {
            if (!html.nodeType || html.nodeType !== 1) {
                const template = util.createElement('DIV');
                template.innerHTML = html;
                html = template.firstChild || template.content.firstChild;
            }

            let afterNode = null;
            if (util.isFormatElement(html) || /^(IMG|IFRAME)$/i.test(html.nodeName)) {
                afterNode = util.getFormatElement(core.getSelectionNode());
            }

            if (util.isComponent(html)) {
                core.insertComponent(html, false);
            } else {
                core.insertNode(html, afterNode);
            }
            
            core.focus();
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
            const convertValue = util.convertContentsForEditor(contents, this.editorTagsWhitelistRegExp);
            
            if (!core._variable.isCodeView) {
                const temp = util.createElement('DIV');
                temp.innerHTML = convertValue;

                const wysiwyg = context.element.wysiwyg;
                const children = temp.children;
                for (let i = 0, len = children.length; i < len; i++) {
                    wysiwyg.appendChild(children[i]);
                }
            } else {
                core._setCodeView(core._getCodeView() + '\n' + util.convertHTMLForCodeView(convertValue, core._variable.codeIndent));
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
            /** remove history */
            core.history._destroy();

            /** remove event listeners */
            event._removeEvent();
            
            /** remove element */
            util.removeItem(context.element.topArea);

            /** remove object reference */
            _w.Object.keys(core).forEach(function(key) {delete core[key];});
            _w.Object.keys(event).forEach(function(key) {delete event[key];});
            _w.Object.keys(context).forEach(function(key) {delete context[key];});
            _w.Object.keys(pluginCallButtons).forEach(function(key) {delete pluginCallButtons[key];});
            
            /** remove user object */
            _w.Object.keys(this).forEach(function(key) {delete this[key];}.bind(this));
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

    /** initialize core and add event listeners */
    core._init(false);
    event._addEvent();
    core._charCount(0, false);

    return userFunction;
}