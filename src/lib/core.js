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
 * @param _options
 * @returns {Object} UserFunction Object
 */
export default function (context, pluginCallButtons, plugins, lang, _options) {
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
         * @description Util object
         */
        util: util,

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
         * @description An array of buttons whose class name is not "code-view-enabled"
         */
        codeViewDisabledButtons: null,

        /**
         * @description History object for undo, redo
         */
        history: null,

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
         * @description Is balloon mode?
         * @private
         */
        _isBalloon: null,

        /**
         * @description Required value when using inline mode to sticky toolbar
         * @private
         */
        _inlineToolbarAttr: {width: 0, height: 0, isShow: false},

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
         * @description An user event function when image uploaded success or remove image
         * @private
         */
        _imageUpload: function (targetImgElement, index, state, imageInfo, remainingFilesCount) {
            if (typeof userFunction.onImageUpload === 'function') userFunction.onImageUpload(targetImgElement, index * 1, state, imageInfo, remainingFilesCount);
        },

        /**
         * @description An user event function when image upload failed
         * @private
         */
        _imageUploadError: function (errorMessage, result) {
            if (typeof userFunction.onImageUploadError === 'function') return userFunction.onImageUploadError(errorMessage, result);
            return true;
        },

        /**
         * @description Elements that need to change text or className for each selection change
         * @property {Element} FORMAT format button > span.txt
         * @property {Element} FONT font family button > span.txt
         * @property {Element} FONT_TOOLTIP font family tooltip element
         * @property {Element} SIZE font size button > span.txt
         * @property {Element} ALIGN align button > div.icon
         * @property {Element} LI list button
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
         * @property {Boolean} wysiwygActive The wysiwyg frame or code view state
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
            wysiwygActive: true,
            isFullScreen: false,
            innerHeight_fullScreen: 0,
            resizeClientY: 0,
            tabSize: 4,
            codeIndent: 2,
            minResizingSize: (context.element.wysiwygFrame.style.minHeight || '65').match(/\d+/)[0] * 1,
            currentNodes: [],
            _range: null,
            _selectionNode: null,
            _originCssText: context.element.topArea.style.cssText,
            _bodyOverflow: '',
            _editorAreaOriginCssText: '',
            _wysiwygOriginCssText: '',
            _codeOriginCssText: '',
            _fullScreenSticky: false,
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

            for (let i = 0; i < arguments.length; i++) {
                if (arguments[i].style) arguments[i].style.display = 'block';
                this.controllerArray[i] = arguments[i];
            }

            this._bindControllersOff = this.controllersOff.bind(this);
            this.addDocEvent('mousedown', this._bindControllersOff, false);
            this.addDocEvent('keydown', this._bindControllersOff, false);
        },

        /**
         * @description Hide controller at editor area (link button, image resize button..)
         */
        controllersOff: function (e) {
            if (this._resizingName && e && e.type === 'keydown' && e.keyCode !== 27) return;

            this._resizingName = '';
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
            this.history.push();
        },

        /**
         * @description Focus to wysiwyg area
         */
        focus: function () {
            if (context.element.wysiwygFrame.style.display === 'none') return;

            const caption = util.getParentElement(this.getSelectionNode(), 'figcaption');
            if (caption) {
                caption.focus();
            } else {
                context.element.wysiwyg.focus();
            }

            this._editorRange();
            event._findButtonEffectTag();
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
            const range = this._wd.createRange();
            if (!context.element.wysiwyg.firstChild) this.execCommand('formatBlock', false, 'P');
            range.setStart(context.element.wysiwyg.firstChild, 0);
            range.setEnd(context.element.wysiwyg.firstChild, 0);
            return range;
        },

        /**
         * @description Returns a "formatElement"(P, DIV, H[1-6], LI) array from the currently selected range.
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
         * @returns {Array}
         */
        getSelectedElementsAndComponents: function () {
            const commonCon = this.getRange().commonAncestorContainer;
            const myComponent = util.getParentElement(commonCon, util.isComponent);
            const selectedLines = util.isTable(commonCon) ? 
                this.getSelectedElements() :
                this.getSelectedElements(function (current) {
                    const component = this.getParentElement(current, this.isComponent);
                    return (this.isFormatElement(current) && (!component || component === myComponent)) || (this.isComponent(current) && !this.getFormatElement(current));
                }.bind(util));

            return selectedLines;
        },

        /**
         * @description Determine if this offset is the edge offset of container
         * @param {Object} container The container property of the selection object.
         * @param {Number} offset The offset property of the selection object.
         * @returns {Boolean}
         */
        isEdgePoint: function (container, offset) {
            return (offset === 0) || (offset === container.nodeValue.length);
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
         * @param {String|null} formatNodeName Node name to be inserted
         * @returns {Element}
         */
        appendFormatTag: function (element, formatNodeName) {
            const formatEl = element;
            const currentFormatEl = util.getFormatElement(this.getSelectionNode());
            const oFormatName = formatNodeName ? formatNodeName : util.isFormatElement(currentFormatEl) ? currentFormatEl.nodeName : 'P';
            const oFormat = util.createElement(oFormatName);
            oFormat.innerHTML = '<br>';

            if (util.isCell(formatEl)) formatEl.insertBefore(oFormat, element.nextElementSibling);
            else formatEl.parentNode.insertBefore(oFormat, formatEl.nextElementSibling);

            return oFormat;
        },

        /**
         * @description The method to insert a element. (used elements : table, hr, image, video)
         * This method is add the element next line and insert the new line.
         * When used in a tag in "LI", it is inserted into the LI tag.
         * Returns the next line added.
         * @param {Element} element Element to be inserted
         * @returns {Element}
         */
        insertComponent: function (element) {
            let oNode = null;
            const selectionNode = this.getSelectionNode();
            const formatEl = util.getFormatElement(selectionNode);

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
                this.insertNode(element, formatEl);
                oNode = this.appendFormatTag(element);
            }

            // history stack
            this.history.push();

            return oNode;
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
                        afterNode = commonCon.splitText(endOff);
                    }
                    else {
                        if (parentNode.lastChild !== null && util.isBreak(parentNode.lastChild)) {
                            parentNode.removeChild(parentNode.lastChild);
                        }
                        afterNode = null;
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
                afterNode = afterNode.nextElementSibling;
            }

            try {
                parentNode.insertBefore(oNode, afterNode);
            } catch (e) {
                parentNode.appendChild(oNode);
            } finally {
                // history stack
                this.history.push();
                
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
            }
        },

        /**
         * @description Delete the currently selected node
         */
        removeNode: function () {
            const range = this.getRange();

            if (range.deleteContents) {
                range.deleteContents();

                // history stack
                this.history.push();
                return;
            }

            const startCon = range.startContainer;
            const startOff = range.startOffset;
            const endCon = range.endContainer;
            const endOff = range.endOffset;
            const commonCon = range.commonAncestorContainer;

            let beforeNode = null;
            let afterNode = null;

            const childNodes = util.getListChildNodes(commonCon);
            let startIndex = util.getArrayIndex(childNodes, startCon);
            let endIndex = util.getArrayIndex(childNodes, endCon);

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
                        beforeNode = util.createTextNode(startCon.substringData(0, startOff));
                    }

                    if (beforeNode.length > 0) {
                        startCon.data = beforeNode.data;
                    } else {
                        util.removeItem(startCon);
                    }

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

                // history stack
                this.history.push();
            }
        },

        /**
         * @description Appended all selected format Element to the argument element and insert
         * @param {Element} rangeElement Element of wrap the arguments (PRE, BLOCKQUOTE...)
         */
        applyRangeFormatElement: function (rangeElement) {
            const rangeLines = this.getSelectedElementsAndComponents();
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
                   cc = util.removeItemAllParents(origin);
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

                    if (i === len - 1 || !this.util.getParentElement(rangeLines[i + 1], function (current) { return current === originParent; })) {
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
                            before = removeItems(pElement, edge.cc);
                            if (before !== undefined) beforeTag = before;
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

            pElement.insertBefore(rangeElement, beforeTag);
            removeItems(rangeElement, beforeTag);

            // history stack
            this.history.push();

            const edge = this.util.getEdgeChildNodes(rangeElement.firstElementChild, rangeElement.lastElementChild);
            if (rangeLines.length > 1) {
                this.setRange(edge.sc, 0, edge.ec, edge.ec.textContent.length);
            } else {
                this.setRange(edge.ec, edge.ec.textContent.length, edge.ec, edge.ec.textContent.length);
            }
        },

        /**
         * @description The elements of the "selectedFormats" array are detached from the "rangeElement" element. ("LI" tags are converted to "P" tags)
         * When "selectedFormats" is null, all elements are detached and return {cc: parentNode, sc: nextSibling, ec: previousSibling}.
         * @param {Element} rangeElement Range format element (PRE, BLOCKQUOTE, OL, UL...)
         * @param {Array|null} selectedFormats Array of format elements (P, DIV, LI...) to remove.
         * If null, Applies to all elements and return {cc: parentNode, sc: nextSibling, ec: previousSibling}
         * @param {Element|null} newRangeElement The node(rangeElement) to replace the currently wrapped node.
         * @param {Boolean} remove Delete without detached.
         * @param {Boolean} notHistory When true, it does not update the history stack and the selection object and return EdgeNodes (util.getEdgeChildNodes)
         */
        detachRangeFormatElement: function (rangeElement, selectedFormats, newRangeElement, remove, notHistory) {
            const range = this.getRange();
            const so = range.startOffset;
            const eo = range.endOffset;

            const children = rangeElement.childNodes;
            const parent = rangeElement.parentNode;
            let firstNode = null;
            let lastNode = null;
            let rangeEl = rangeElement.cloneNode(false);
            
            const newList = util.isList(newRangeElement);
            let insertedNew = false;

            function appendNode (parent, insNode, sibling) {
                if (util.onlyZeroWidthSpace(insNode)) insNode.innerHTML = util.zeroWidthSpace;

                if (insNode.nodeType === 3) {
                    parent.insertBefore(insNode, sibling);
                    return insNode;
                }
                
                const children = insNode.childNodes;
                let format = insNode.cloneNode(false);
                let first = null;
                let c = null;

                while (children[0]) {
                    c = children[0];
                    if (util.isIgnoreNodeChange(c) && !util.isListCell(format)) {
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
                    parent.insertBefore(format, sibling);
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
                    insNode = insNode.cloneNode(true);
                    rangeEl.appendChild(insNode);
                }
                else {
                    if (rangeEl && rangeEl.children.length > 0) {
                        parent.insertBefore(rangeEl, rangeElement);
                        rangeEl = null;
                    }

                    if (!newList && util.isListCell(insNode)) {
                        const inner = insNode;
                        insNode = util.isCell(rangeElement.parentNode) ? util.createElement('DIV') : util.createElement('P');
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
                            insNode = appendNode(newRangeElement, insNode, null);
                        } else {
                            insNode = appendNode(parent, insNode, rangeElement);
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
            const rangeRight = rangeElement.nextSibling;
            if (rangeEl && rangeEl.children.length > 0) {
                rangeParent.insertBefore(rangeEl, rangeRight);
            }

            util.removeItem(rangeElement);

            const edge = remove ? {
                cc: rangeParent,
                sc: firstNode,
                ec: firstNode && firstNode.parentNode ? firstNode.nextSibling : rangeEl && rangeEl.children.length > 0 ? rangeEl : rangeRight ? rangeRight : null
            } : util.getEdgeChildNodes(firstNode, lastNode);

            if (notHistory) return edge;
            
            // history stack
            this.history.push();

            if (!remove && edge) {
                if (!selectedFormats) {
                    this.setRange(edge.sc, 0, edge.sc, 0);
                } else {
                    this.setRange(edge.sc, so, edge.ec, eo);
                }
            }
            
            event._findButtonEffectTag();
        },

        /**
         * @description Add, update, and delete nodes from selected text.
         * 1. If there is a node in the "appendNode" argument, a node with the same tags and attributes as "appendNode" is added to the selection.
         * 2. If the "appendNode" argument is null, the node of the selection is update or remove without adding a new node.
         * 3. The same style as the style attribute of the "styleArray" argument is deleted.
         *    (Styles should be put with attribute names from css. ["background-color"])
         * 4. The same class name as the class attribute of the "styleArray" argument is deleted.
         *    (The class name is preceded by "." [".className"])
         * 5. Use a list of styles and classes of "appendNode" in "styleArray" to avoid duplicate property values.
         * 6. If a node with all styles and classes removed has the same tag name as "appendNode" or "removeNodeArray", or "appendNode" is null, that node is deleted.
         * 7. Regardless of the style and class of the node, the tag with the same name as the "removeNodeArray" argument value is deleted.
         * 8. If the "strictRemove" argument is true, only nodes with all styles and classes removed from the nodes of "removeNodeArray" are removed.
         * 9. It won't work if the parent node has the same class and same value style.
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

            if (isRemoveFormat && range.collapsed && util.isFormatElement(startCon.parentNode) && util.isFormatElement(endCon.parentNode)) {
                return;
            }

            if (isRemoveNode) {
                appendNode = this.util.createElement('DIV');
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
            // startCon
            if (oneLine) {
                const newRange = this._nodeChange_oneLine(lineNodes[0], newNode, validation, startCon, startOff, endCon, endOff, isRemoveFormat, isRemoveNode, range.collapsed, _removeCheck);
                start.container = newRange.startContainer;
                start.offset = newRange.startOffset;
                end.container = newRange.endContainer;
                end.offset = newRange.endOffset;
            } else {
                start = this._nodeChange_startLine(lineNodes[0], newNode, validation, startCon, startOff, isRemoveFormat, isRemoveNode, _removeCheck);
            }

            // mid
            for (let i = 1; i < endLength; i++) {
                newNode = appendNode.cloneNode(false);
                this._nodeChange_middleLine(lineNodes[i], newNode, validation, isRemoveFormat, isRemoveNode, _removeCheck);
            }

            // endCon
            if (endLength > 0 && !oneLine) {
                newNode = appendNode.cloneNode(false);
                end = this._nodeChange_endLine(lineNodes[endLength], newNode, validation, endCon, endOff, isRemoveFormat, isRemoveNode, _removeCheck);
            } else if (!oneLine) {
                end = start;
            }

            // set range
            this.setRange(start.container, start.offset, end.container, end.offset);

            // history stack
            this.history.push();
        },

        /**
         * @description Strip remove node
         * @param {Element} element The format node
         * @param {Element} removeNode The remove node
         * @private
         */
        _stripRemoveNode: function (element, removeNode) {
            if (!removeNode || removeNode.nodeType === 3) return;
            const children = removeNode.childNodes;

            while (children[0]) {
                element.insertBefore(children[0], removeNode);
            }

            element.removeChild(removeNode);
        },

        /**
         * @description Delete a empty child node of argument element
         * @param {Element} formatNode The format node
         * @param {Element} notRemoveNode Do not remove node
         * @private
         */
        _removeEmptyNode: function (formatNode, notRemoveNode) {
            const preventDelete = util.onlyZeroWidthSpace(notRemoveNode.textContent);
            if (preventDelete) notRemoveNode.textContent = ' ';
            util.removeEmptyNode(formatNode);
            if (preventDelete) notRemoveNode.textContent = util.zeroWidthSpace;
        },

        /**
         * @description Add style and className of newElement to element
         * @param {Element} element Origin element
         * @param {Element} newElement New element
         * @private
         */
        _copyNodeAttrs: function (element, newElement) {
            if (newElement.style.cssText) {
                element.style.cssText += newElement.style.cssText;
            }
            if (newElement.className) {
                this.util.addClass(element, newElement.className);
            }
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
        _nodeChange_oneLine: function (element, newInnerNode, validation, startCon, startOff, endCon, endOff, isRemoveFormat, isRemoveNode, collapsed, _removeCheck) {
            // not add tag
            let parentCon = startCon.parentNode;
            while (!parentCon.nextSibling && !parentCon.previousSibling && !this.util.isFormatElement(parentCon.parentNode) && !this.util.isWysiwygDiv(parentCon.parentNode)) {
                if (parentCon.nodeName === newInnerNode.nodeName) break;
                parentCon = parentCon.parentNode;
            }

            if (!isRemoveNode && parentCon === endCon.parentNode && parentCon.nodeName === newInnerNode.nodeName) {
                if (this.util.onlyZeroWidthSpace(startCon.textContent.slice(0, startOff)) && this.util.onlyZeroWidthSpace(endCon.textContent.slice(endOff))) {
                    const children = parentCon.childNodes;
                    let sameTag = true;
    
                    for (let i = 0, len = children.length, c, s, e, z; i < len; i++) {
                        c = children[i];
                        z = !this.util.onlyZeroWidthSpace(c);
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
                        this._copyNodeAttrs(parentCon, newInnerNode);
        
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
            const nNode = newInnerNode;
            const nNodeArray = [newInnerNode];
            const pNode = element.cloneNode(false);
            const isSameNode = startCon === endCon;
            let startContainer = startCon;
            let startOffset = startOff;
            let endContainer = endCon;
            let endOffset = endOff;
            let startPass = false;
            let endPass = false;
            let pCurrent, newNode, appendNode, cssText;

            function checkCss (vNode) {
                const regExp = new _w.RegExp('(?:;|^|\\s)(?:' + cssText + 'null)\\s*:[^;]*\\s*(?:;|$)', 'ig');
                let style = '';

                if (regExp && vNode.style.cssText.length > 0) {
                    style = regExp.test(vNode.style.cssText);
                }
            
                return !style;
            }

            (function recursionFunc(current, node) {
                const childNodes = current.childNodes;

                for (let i = 0, len = childNodes.length, vNode; i < len; i++) {
                    let child = childNodes[i];
                    if (!child) continue;
                    let coverNode = node;
                    let cloneNode;

                    // startContainer
                    if (!startPass && child === startContainer) {
                        const prevNode = util.createTextNode(startContainer.nodeType === 1 ? '' : startContainer.substringData(0, startOffset));
                        const textNode = util.createTextNode(startContainer.nodeType === 1 ? '' : startContainer.substringData(startOffset, 
                                isSameNode ? 
                                (endOffset >= startOffset ? endOffset - startOffset : startContainer.data.length - startOffset) : 
                                startContainer.data.length - startOffset)
                            );

                        if (prevNode.data.length > 0) {
                            node.appendChild(prevNode);
                        }

                        newNode = child;
                        pCurrent = [];
                        cssText = '';
                        while (newNode !== pNode && newNode !== el && newNode !== null) {
                            vNode = validation(newNode);
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
                        pNode.appendChild(newInnerNode);

                        startContainer = textNode;
                        startOffset = 0;
                        startPass = true;

                        if (newNode !== textNode) newNode.appendChild(startContainer);
                        if (!isSameNode) continue;
                    }

                    // endContainer
                    if (!endPass && child === endContainer) {
                        const afterNode = util.createTextNode(endContainer.nodeType === 1 ? '' : endContainer.substringData(endOffset, (endContainer.length - endOffset)));
                        const textNode = util.createTextNode(isSameNode || endContainer.nodeType === 1 ? '' : endContainer.substringData(0, endOffset));

                        if (afterNode.data.length > 0) {
                            newNode = child;
                            cssText = '';
                            pCurrent = [];
                            while (newNode !== pNode && newNode !== el && newNode !== null) {
                                if (newNode.nodeType === 1 && checkCss(newNode)) {
                                    pCurrent.push(newNode.cloneNode(false));
                                    cssText += newNode.style.cssText.substr(0, newNode.style.cssText.indexOf(':')) + '|';
                                }
                                newNode = newNode.parentNode;
                            }

                            cloneNode = appendNode = newNode = pCurrent.pop() || afterNode;
                            while (pCurrent.length > 0) {
                                newNode = pCurrent.pop();
                                appendNode.appendChild(newNode);
                                appendNode = newNode;
                            }

                            pNode.appendChild(cloneNode);
                            newNode.textContent = afterNode.data;
                        }

                        newNode = child;
                        pCurrent = [];
                        cssText = '';
                        while (newNode !== pNode && newNode !== el && newNode !== null) {
                            vNode = validation(newNode);
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
                            if (!collapsed && util.isIgnoreNodeChange(child)) {
                                newInnerNode = newInnerNode.cloneNode(false);
                                pNode.appendChild(child);
                                pNode.appendChild(newInnerNode);
                                nNodeArray.push(newInnerNode);
                                i--;
                            } else {
                                recursionFunc(child, child);
                            }
                            continue;
                        }

                        newNode = child;
                        pCurrent = [];
                        cssText = '';
                        while (newNode.parentNode !== null && newNode !== el && newNode !== newInnerNode) {
                            vNode = endPass ? newNode.cloneNode(false) : validation(newNode);
                            if (newNode.nodeType === 1 && !util.isBreak(child) && vNode && checkCss(newNode)) {
                                if (vNode) pCurrent.push(vNode);
                                cssText += newNode.style.cssText.substr(0, newNode.style.cssText.indexOf(':')) + '|';
                            }
                            newNode = newNode.parentNode;
                        }

                        const childNode = pCurrent.pop() || child;
                        appendNode = newNode = childNode;
                        while (pCurrent.length > 0) {
                            newNode = pCurrent.pop();
                            appendNode.appendChild(newNode);
                            appendNode = newNode;
                        }
                        
                        if (childNode === child) {
                            if (!endPass) node = newInnerNode;
                            else node = pNode;
                        } else if (endPass) {
                            pNode.appendChild(childNode);
                            node = newNode;
                        } else {
                            newInnerNode.appendChild(childNode);
                            node = newNode;
                        }
                    }

                    cloneNode = child.cloneNode(false);
                    node.appendChild(cloneNode);
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
                    pNode.insertBefore(textNode, removeNode);
                    pNode.removeChild(removeNode);

                    if (i === 0) startContainer = endContainer = textNode;
                }
            } else {
                if (isRemoveNode) {
                    for (let i = 0; i < nNodeArray.length; i++) {
                        let removeNode = nNodeArray[i];
                        if (collapsed) {
                            while(removeNode !== nNode) {
                                removeNode = removeNode.parentNode;
                            }
                        }
                        this._stripRemoveNode(pNode, removeNode);
                    }
                }
                
                if (collapsed) {
                    startContainer = endContainer = newInnerNode;
                }
            }

            this._removeEmptyNode(pNode, newInnerNode);

            if (collapsed) {
                startOffset = startContainer.textContent.length;
                endOffset = endContainer.textContent.length;
            }

            // endContainer reset
            const endConReset = isRemoveFormat || endContainer.textContent.length === 0;
            const startConLength = startContainer.textContent.length;

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
            endOffset += (mergeEndCon ? startConLength : endConReset ? newStartOffset.s : newEndOffset.s);

            element.innerHTML = pNode.innerHTML;

            startContainer = util.getNodeFromPath(startPath, element);
            endContainer = util.getNodeFromPath(endPath, element);
            
            return {
                startContainer: startContainer,
                startOffset: startOffset,
                endContainer: endContainer,
                endOffset: endOffset
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
        _nodeChange_startLine: function (element, newInnerNode, validation, startCon, startOff, isRemoveFormat, isRemoveNode, _removeCheck) {
            // not add tag
            let parentCon = startCon.parentNode;
            while (!parentCon.nextSibling && !parentCon.previousSibling && !this.util.isFormatElement(parentCon.parentNode) && !this.util.isWysiwygDiv(parentCon.parentNode)) {
                if (parentCon.nodeName === newInnerNode.nodeName) break;
                parentCon = parentCon.parentNode;
            }

            if (!isRemoveNode && parentCon.nodeName === newInnerNode.nodeName && !util.isFormatElement(parentCon) && !parentCon.nextSibling && this.util.onlyZeroWidthSpace(startCon.textContent.slice(0, startOff))) {
                let sameTag = true;
                let s = startCon.previousSibling;
                while (s) {
                    if (!this.util.onlyZeroWidthSpace(s)) {
                        sameTag = false;
                        break;
                    }
                    s = s.previousSibling;
                }

                if (sameTag) {
                    this._copyNodeAttrs(parentCon, newInnerNode);
    
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
            let pCurrent, newNode, appendNode;

            (function recursionFunc(current, node) {
                const childNodes = current.childNodes;

                for (let i = 0, len = childNodes.length, vNode; i < len; i++) {
                    const child = childNodes[i];
                    if (!child) continue;
                    let coverNode = node;

                    if (passNode && !util.isBreak(child)) {
                        if (child.nodeType === 1) {
                            if (util.isIgnoreNodeChange(child)) {
                                newInnerNode = newInnerNode.cloneNode(false);
                                pNode.appendChild(child);
                                pNode.appendChild(newInnerNode);
                                nNodeArray.push(newInnerNode);
                                i--;
                            } else {
                                recursionFunc(child, child);
                            }
                            continue;
                        }

                        newNode = child;
                        pCurrent = [];
                        while (newNode.parentNode !== null && newNode !== el && newNode !== newInnerNode) {
                            vNode = validation(newNode);
                            if (newNode.nodeType === 1 && vNode) {
                                pCurrent.push(vNode);
                            }
                            newNode = newNode.parentNode;
                        }

                        if (pCurrent.length > 0) {
                            const childNode = pCurrent.pop();
                            appendNode = newNode = childNode;
                            while (pCurrent.length > 0) {
                                newNode = pCurrent.pop();
                                appendNode.appendChild(newNode);
                                appendNode = newNode;
                            }
                            newInnerNode.appendChild(childNode);
                            node = newNode;
                        } else {
                            node = newInnerNode;
                        }
                    }

                    // startContainer
                    if (!passNode && child === container) {
                        const prevNode = util.createTextNode(container.nodeType === 1 ? '' : container.substringData(0, offset));
                        const textNode = util.createTextNode(container.nodeType === 1 ? '' : container.substringData(offset, (container.length - offset)));

                        if (prevNode.data.length > 0) {
                            node.appendChild(prevNode);
                        }

                        newNode = node;
                        pCurrent = [];
                        while (newNode !== pNode && newNode !== null) {
                            vNode = validation(newNode);
                            if (newNode.nodeType === 1 && vNode) {
                                pCurrent.push(vNode);
                            }
                            newNode = newNode.parentNode;
                        }

                        const childNode = pCurrent.pop() || node;
                        appendNode = newNode = childNode;
                        while (pCurrent.length > 0) {
                            newNode = pCurrent.pop();
                            appendNode.appendChild(newNode);
                            appendNode = newNode;
                        }

                        if (childNode !== node) {
                            newInnerNode.appendChild(childNode);
                            node = newNode;
                        } else {
                            node = newInnerNode;
                        }

                        if (util.isBreak(child)) newInnerNode.appendChild(child.cloneNode(false));

                        pNode.appendChild(newInnerNode);
                        container = textNode;
                        offset = 0;
                        passNode = true;

                        node.appendChild(container);
                        continue;
                    }

                    vNode = !passNode ? child.cloneNode(false) : validation(child);
                    if (vNode) {
                        node.appendChild(vNode);
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
                    pNode.insertBefore(textNode, removeNode);
                    pNode.removeChild(removeNode);
                    if (i === 0) container = textNode;
                }
            } else if (isRemoveNode) {
                for (let i = 0; i < nNodeArray.length; i++) {
                    this._stripRemoveNode(pNode, nNodeArray[i]);
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
                this._removeEmptyNode(pNode, newInnerNode);

                if (util.onlyZeroWidthSpace(pNode.textContent)) {
                    container = pNode.firstChild;
                    offset = 0;
                }

                // node change
                const newOffsets = {s: 0, e: 0};
                const path = util.getNodePath(container, pNode, newOffsets);

                element.innerHTML = pNode.innerHTML;

                container = util.getNodeFromPath(path, element);
                offset += newOffsets.s;
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

                let children = tempNode.children;
                let i = 0, len = children.length;

                for (let child; i < len; i++) {
                    child = children[i];
                    
                    if (child.nodeName === newNodeName) {
                        child.style.cssText += newCssText;
                        this.util.addClass(child, newClass);
                    } else if (len === 1) {
                        children = child.children;
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

            (function recursionFunc(current, node) {
                const childNodes = current.childNodes;

                for (let i = 0, len = childNodes.length, vNode; i < len; i++) {
                    let child = childNodes[i];
                    if (!child) continue;
                    let coverNode = node;

                    if (util.isIgnoreNodeChange(child)) {
                        pNode.appendChild(newInnerNode);
                        newInnerNode = newInnerNode.cloneNode(false);
                        pNode.appendChild(child);
                        pNode.appendChild(newInnerNode);
                        nNodeArray.push(newInnerNode);
                        node = newInnerNode;
                        i--;
                        continue;
                    } else {
                        vNode = validation(child);
                        if (vNode) {
                            noneChange = false;
                            node.appendChild(vNode);
                            if (child.nodeType === 1 && !util.isBreak(child)) coverNode = vNode;
                        }
                    }

                    recursionFunc(child, coverNode);
                }
            })(element.cloneNode(true), newInnerNode);

            // not remove tag
            if (noneChange || (isRemoveNode && !isRemoveFormat && !_removeCheck.v)) return;

            pNode.appendChild(newInnerNode);

            if (isRemoveFormat && isRemoveNode) {
                for (let i = 0; i < nNodeArray.length; i++) {
                    let removeNode = nNodeArray[i];
                    let textNode = util.createTextNode(removeNode.textContent);
                    pNode.insertBefore(textNode, removeNode);
                    pNode.removeChild(removeNode);
                }
            } else if (isRemoveNode) {
                for (let i = 0; i < nNodeArray.length; i++) {
                    this._stripRemoveNode(pNode, nNodeArray[i]);
                }
            }

            this._removeEmptyNode(pNode, newInnerNode);

            // node change
            element.innerHTML = pNode.innerHTML;
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
        _nodeChange_endLine: function (element, newInnerNode, validation, endCon, endOff, isRemoveFormat, isRemoveNode, _removeCheck) {
            // not add tag
            let parentCon = endCon.parentNode;
            while (!parentCon.nextSibling && !parentCon.previousSibling && !this.util.isFormatElement(parentCon.parentNode) && !this.util.isWysiwygDiv(parentCon.parentNode)) {
                if (parentCon.nodeName === newInnerNode.nodeName) break;
                parentCon = parentCon.parentNode;
            }
            
            if (!isRemoveNode && parentCon.nodeName === newInnerNode.nodeName && !util.isFormatElement(parentCon) && !parentCon.previousSibling && this.util.onlyZeroWidthSpace(endCon.textContent.slice(endOff))) {
                let sameTag = true;
                let e = endCon.nextSibling;
                while (e) {
                    if (!this.util.onlyZeroWidthSpace(e)) {
                        sameTag = false;
                        break;
                    }
                    e = e.nextSibling;
                }

                if (sameTag) {
                    this._copyNodeAttrs(parentCon, newInnerNode);
    
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
            let pCurrent, newNode, appendNode;

            (function recursionFunc(current, node) {
                const childNodes = current.childNodes;

                for (let i = childNodes.length - 1, vNode; 0 <= i; i--) {
                    const child = childNodes[i];
                    if (!child) continue;
                    let coverNode = node;

                    if (passNode && !util.isBreak(child)) {
                        if (child.nodeType === 1) {
                            if (util.isIgnoreNodeChange(child)) {
                                newInnerNode = newInnerNode.cloneNode(false);
                                pNode.insertBefore(child, node);
                                pNode.insertBefore(newInnerNode, child);
                                nNodeArray.push(newInnerNode);
                                i--;
                            } else {
                                recursionFunc(child, child);
                            }
                            continue;
                        }

                        newNode = child;
                        pCurrent = [];
                        while (newNode.parentNode !== null && newNode !== el && newNode !== newInnerNode) {
                            vNode = validation(newNode);
                            if (vNode && newNode.nodeType === 1) {
                                pCurrent.push(vNode);
                            }
                            newNode = newNode.parentNode;
                        }

                        if (pCurrent.length > 0) {
                            const childNode = pCurrent.pop();
                            appendNode = newNode = childNode;
                            while (pCurrent.length > 0) {
                                newNode = pCurrent.pop();
                                appendNode.appendChild(newNode);
                                appendNode = newNode;
                            }
                            newInnerNode.insertBefore(childNode, newInnerNode.firstChild);
                            node = newNode;
                        } else {
                            node = newInnerNode;
                        }
                    }

                    // endContainer
                    if (!passNode && child === container) {
                        const afterNode = util.createTextNode(container.nodeType === 1 ? '' : container.substringData(offset, (container.length - offset)));
                        const textNode = util.createTextNode(container.nodeType === 1 ? '' : container.substringData(0, offset));

                        if (afterNode.data.length > 0) {
                            node.insertBefore(afterNode, node.firstChild);
                        }

                        newNode = node;
                        pCurrent = [];
                        while (newNode !== pNode && newNode !== null) {
                            vNode = validation(newNode);
                            if (vNode && newNode.nodeType === 1) {
                                pCurrent.push(vNode);
                            }
                            newNode = newNode.parentNode;
                        }

                        const childNode = pCurrent.pop() || node;
                        appendNode = newNode = childNode;
                        while (pCurrent.length > 0) {
                            newNode = pCurrent.pop();
                            appendNode.appendChild(newNode);
                            appendNode = newNode;
                        }

                        if (childNode !== node) {
                            newInnerNode.insertBefore(childNode, newInnerNode.firstChild);
                            node = newNode;
                        } else {
                            node = newInnerNode;
                        }

                        if (util.isBreak(child)) newInnerNode.appendChild(child.cloneNode(false));

                        pNode.insertBefore(newInnerNode, pNode.firstChild);
                        container = textNode;
                        offset = textNode.data.length;
                        passNode = true;

                        node.insertBefore(container, node.firstChild);
                        continue;
                    }

                    vNode = !passNode ? child.cloneNode(false) : validation(child);
                    if (vNode) {
                        node.insertBefore(vNode, node.firstChild);
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
                    pNode.insertBefore(textNode, removeNode);
                    pNode.removeChild(removeNode);

                    if (i === nNodeArray.length - 1) {
                        container = textNode;
                        offset = textNode.textContent.length;
                    }
                }
            } else if (isRemoveNode) {
                for (let i = 0; i < nNodeArray.length; i++) {
                    this._stripRemoveNode(pNode, nNodeArray[i]);
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
                this._removeEmptyNode(pNode, newInnerNode);

                if (util.onlyZeroWidthSpace(pNode.textContent)) {
                    container = pNode.firstChild;
                    offset = container.textContent.length;
                } else if (util.onlyZeroWidthSpace(container)) {
                    container = pNode;
                    offset = 0;
                }
                
                // node change
                const newOffsets = {s: 0, e: 0};
                const path = util.getNodePath(container, pNode, newOffsets);

                element.innerHTML = pNode.innerHTML;

                container = util.getNodeFromPath(path, element);
                offset += newOffsets.s;
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
                    if (typeof context.option.callBackSave === 'function') {
                        context.option.callBackSave(this.getContents(false));
                    } else if (typeof userFunction.save === 'function') {
                        userFunction.save();
                    } else {
                        throw Error('[SUNEDITOR.core.commandHandler.fail] Please register call back function in creation option. (callBackSave : Function)');
                    }

                    if (context.tool.save) context.tool.save.setAttribute('disabled', true);
                    break;
                default : // 'STRONG', 'INS', 'EM', 'DEL', 'SUB', 'SUP'
                    const btn = util.hasClass(this.commandMap[command], 'active') ? null : this.util.createElement(command);
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
                margin = /\d+/.test(p.style.marginLeft) ? p.style.marginLeft.match(/\d+/)[0] * 1 : 0;

                if ('indent' === command) {
                    margin += 25;
                } else {
                    margin -= 25;
                }
    
                p.style.marginLeft = (margin < 0 ? 0 : margin) + 'px';
            }

            event._findButtonEffectTag();
            // history stack
            this.history.push();
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
            const wysiwygActive = this._variable.wysiwygActive;
            const disButtons = this.codeViewDisabledButtons;
            for (let i = 0, len = disButtons.length; i < len; i++) {
                disButtons[i].disabled = wysiwygActive;
            }

            this.controllersOff();

            if (!wysiwygActive) {
                this._setCodeDataToEditor();
                context.element.wysiwygFrame.scrollTop = 0;
                context.element.code.style.display = 'none';
                context.element.wysiwygFrame.style.display = 'block';

                this._variable._codeOriginCssText = this._variable._codeOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: none');
                this._variable._wysiwygOriginCssText = this._variable._wysiwygOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: block');

                if (context.option.height === 'auto' && !context.option.codeMirrorEditor) context.element.code.style.height = '0px';
                this._variable.wysiwygActive = true;
                this._resourcesStateChange();
                this._checkComponents();

                // history stack
                this.history.push();

                this.focus();
            } else {
                this._setEditorDataToCodeView();
                this._variable._codeOriginCssText = this._variable._codeOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: block');
                this._variable._wysiwygOriginCssText = this._variable._wysiwygOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: none');

                if (context.option.height === 'auto' && !context.option.codeMirrorEditor) context.element.code.style.height = context.element.code.scrollHeight > 0 ? (context.element.code.scrollHeight + 'px') : 'auto';
                if (context.option.codeMirrorEditor) context.option.codeMirrorEditor.refresh();
                
                this._variable.wysiwygActive = false;
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

            if (context.option.fullPage) {
                const parseDocument = (new this._w.DOMParser()).parseFromString(code_html, 'text/html');
                const headChildren = parseDocument.head.children;

                for (let i = 0, len = headChildren.length; i < len; i++) {
                    if (/script/i.test(headChildren[i].tagName)) {
                        parseDocument.head.removeChild(headChildren[i]);
                    }
                }

                this._wd.head.innerHTML = parseDocument.head.innerHTML;
                this._wd.body.innerHTML = util.convertContentsForEditor(parseDocument.body.innerHTML);

                const attrs = parseDocument.body.attributes;
                for (let i = 0, len = attrs.length; i < len; i++) {
                    if (attrs[i].name === 'contenteditable') continue;
                    this._wd.body.setAttribute(attrs[i].name, attrs[i].value);
                }
            } else {
                context.element.wysiwyg.innerHTML = code_html.length > 0 ? util.convertContentsForEditor(code_html) : '<p><br></p>';
            }
        },

        /**
         * @description Convert the data of the WYSIWYG area and put it in the code view area.
         * @private
         */
        _setEditorDataToCodeView: function () {
            const codeContents = util.convertHTMLForCodeView(context.element.wysiwyg, this._variable.codeIndent);
            let codeValue = '';

            if (context.option.fullPage) {
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

            if (!this._variable.isFullScreen) {
                this._variable.isFullScreen = true;

                topArea.style.position = 'fixed';
                topArea.style.top = '0';
                topArea.style.left = '0';
                topArea.style.width = '100%';
                topArea.style.height = '100%';
                topArea.style.zIndex = '2147483647';

                if (context.element._stickyDummy.style.display !== 'none') {
                    this._variable._fullScreenSticky = true;
                    context.element._stickyDummy.style.display = 'none';
                    util.removeClass(toolbar, "se-toolbar-sticky");
                }

                this._variable._bodyOverflow = _d.body.style.overflow;
                _d.body.style.overflow = 'hidden';

                this._variable._editorAreaOriginCssText = editorArea.style.cssText;
                this._variable._wysiwygOriginCssText = wysiwygFrame.style.cssText;
                this._variable._codeOriginCssText = code.style.cssText;

                editorArea.style.cssText = toolbar.style.cssText = '';
                wysiwygFrame.style.cssText = (wysiwygFrame.style.cssText.match(/\s?display(\s+)?:(\s+)?[a-zA-Z]+;/) || [''])[0];
                code.style.cssText = (code.style.cssText.match(/\s?display(\s+)?:(\s+)?[a-zA-Z]+;/) || [''])[0];
                toolbar.style.width = wysiwygFrame.style.height = code.style.height = '100%';
                toolbar.style.position = 'relative';

                this._variable.innerHeight_fullScreen = (_w.innerHeight - toolbar.offsetHeight);
                editorArea.style.height = this._variable.innerHeight_fullScreen + 'px';

                util.removeClass(element.firstElementChild, 'se-icon-expansion');
                util.addClass(element.firstElementChild, 'se-icon-reduction');

                if (context.option.iframe && context.option.height === 'auto') {
                    editorArea.style.overflow = 'auto';
                    this._iframeAutoHeight();
                }
            }
            else {
                this._variable.isFullScreen = false;

                wysiwygFrame.style.cssText = this._variable._wysiwygOriginCssText;
                code.style.cssText = this._variable._codeOriginCssText;
                toolbar.style.cssText = '';
                editorArea.style.cssText = this._variable._editorAreaOriginCssText;
                topArea.style.cssText = this._variable._originCssText;
                _d.body.style.overflow = this._variable._bodyOverflow;

                if (context.option.stickyToolbar > -1) {
                    util.removeClass(toolbar, 'se-toolbar-sticky');
                }

                if (this._variable._fullScreenSticky) {
                    this._variable._fullScreenSticky = false;
                    context.element._stickyDummy.style.display = 'block';
                    util.addClass(toolbar, "se-toolbar-sticky");
                }

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

            if (context.option.iframe) {
                const wDocument = util.getIframeDocument(context.element.wysiwygFrame);
                const arrts = context.option.fullPage ? util.getAttributesToString(wDocument.body, ['contenteditable']) : 'class="sun-editor-editable"';

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

            if (context.option.iframe) {
                const wDocument = util.getIframeDocument(context.element.wysiwygFrame);
                const arrts = context.option.fullPage ? util.getAttributesToString(wDocument.body, ['contenteditable']) : 'class="sun-editor-editable"';

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
            const convertValue = util.convertContentsForEditor(html);
            if (core._variable.wysiwygActive) {
                context.element.wysiwyg.innerHTML = convertValue;
                // history stack
                core.history.push();
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

            if (context.option.fullPage && !onlyContents) {
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
            if (context.option.iframe) {
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
            if (context.option.iframe) {
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

            const maxCharCount = context.option.maxCharCount;

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
         * @description Set method in the code view area
         * @param {String} value HTML string
         * @private
         */
        _setCodeView: function (value) {
            if (context.option.codeMirrorEditor) {
                context.option.codeMirrorEditor.getDoc().setValue(value);
            } else {
                context.element.code.value = value;
            }
        },

        /**
         * @description Get method in the code view area
         * @private
         */
        _getCodeView: function () {
            return context.option.codeMirrorEditor ? context.option.codeMirrorEditor.getDoc().getValue() : context.element.code.value;
        },

        /**
         * @description Initializ core variable
         * @private
         */
        _init: function () {
            this._ww = context.option.iframe ? context.element.wysiwygFrame.contentWindow : _w;
            this._wd = _d;

            _w.setTimeout(function () {
                if (_options.iframe) {
                    this._wd = context.element.wysiwygFrame.contentDocument;
                    context.element.wysiwyg = this._wd.body;
                    if (_options.height === 'auto') {
                        this._iframeAuto = this._wd.body;
                    }
                }
                this._iframeAutoHeight();
            }.bind(this));

            this.codeViewDisabledButtons = context.element.toolbar.querySelectorAll('.se-toolbar button:not([class~="code-view-enabled"])');
            this._isInline = /inline/i.test(context.option.mode);
            this._isBalloon = /balloon/i.test(context.option.mode);

            this.commandMap = {
                FORMAT: context.tool.format,
                FONT: context.tool.font,
                FONT_TOOLTIP: context.tool.fontTooltip,
                SIZE: context.tool.fontSize,
                ALIGN: context.tool.align,
                LI: context.tool.list,
                LI_ICON: context.tool.list && context.tool.list.querySelector('i'),
                STRONG: context.tool.bold,
                INS: context.tool.underline,
                EM: context.tool.italic,
                DEL: context.tool.strike,
                SUB: context.tool.subscript,
                SUP: context.tool.superscript,
                OUTDENT: context.tool.outdent
            };

            this._variable._originCssText = context.element.topArea.style.cssText;
            this._placeholder = context.element.placeholder;

            /** Excute history function, check components */
            this._checkPlaceholder();
            this._checkComponents();
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
                if (!this._variable.wysiwygActive) {
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
        _directionKeyKeyCode: new _w.RegExp('^(8|13|32|46|33|34|35|36|37|38|39|40|46|98|100|102|104)$'),
        _historyIgnoreKeycode: new _w.RegExp('^(1[6-7]|20|27|3[3-9]|40|45|11[2-9]|12[0-3]|144|145)$'),
        _onButtonsCheck: new _w.RegExp('^(STRONG|INS|EM|DEL|SUB|SUP|LI)$'),
        _frontZeroWidthReg: new _w.RegExp('^' + util.zeroWidthSpace + '+', ''),
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

        _findButtonEffectTag: function () {
            const commandMap = core.commandMap;
            const classOnCheck = this._onButtonsCheck;
            const commandMapNodes = [];
            const currentNodes = [];

            let findFormat = true, findAlign = true, findList = true, findFont = true, findSize = true, findOutdent = true, findA = true;
            let nodeName = '';

            for (let selectionParent = core.getSelectionNode(); !util.isWysiwygDiv(selectionParent); selectionParent = selectionParent.parentNode) {
                if (!selectionParent) break;
                if (selectionParent.nodeType !== 1 || util.isBreak(selectionParent)) continue;
                nodeName = selectionParent.nodeName.toUpperCase();
                currentNodes.push(nodeName);

                /** Format */
                if (util.isFormatElement(selectionParent)) {
                    /* Format block */
                    if (findFormat && commandMap.FORMAT) {
                        commandMapNodes.push('FORMAT');
                        util.changeTxt(commandMap.FORMAT, nodeName);
                        commandMap.FORMAT.setAttribute('data-focus', nodeName);
                        findFormat = false;
                    }

                    /* Align */
                    const textAlign = selectionParent.style.textAlign;
                    if (findAlign && textAlign && commandMap.ALIGN) {
                        commandMapNodes.push('ALIGN');
                        commandMap.ALIGN.className = 'se-icon-align-' + textAlign;
                        commandMap.ALIGN.setAttribute('data-focus', textAlign);
                        findAlign = false;
                    }

                    /* Outdent */
                    if (findOutdent && selectionParent.style.marginLeft && (selectionParent.style.marginLeft.match(/\d+/) || [0])[0] * 1 > 0 && commandMap.OUTDENT) {
                        commandMapNodes.push('OUTDENT');
                        commandMap.OUTDENT.removeAttribute('disabled');
                        findOutdent = false;
                    }

                    continue;
                }

                /* List */
                if (findList && util.isList(nodeName) && commandMap.LI) {
                    commandMapNodes.push('LI');
                    commandMap.LI.setAttribute('data-focus', nodeName);
                    if (/UL/i.test(nodeName)) {
                        util.removeClass(commandMap.LI_ICON, 'se-icon-list-number');
                        util.addClass(commandMap.LI_ICON, 'se-icon-list-bullets');
                    } else {
                        util.removeClass(commandMap.LI_ICON, 'se-icon-list-bullets');
                        util.addClass(commandMap.LI_ICON, 'se-icon-list-number');
                    }
                    findList = false;
                }

                /** Font */
                if (findFont && selectionParent.style.fontFamily.length > 0 && commandMap.FONT) {
                    commandMapNodes.push('FONT');
                    const selectFont = (selectionParent.style.fontFamily || selectionParent.face || lang.toolbar.font).replace(/["']/g,'');
                    util.changeTxt(commandMap.FONT, selectFont);
                    util.changeTxt(commandMap.FONT_TOOLTIP, selectFont);
                    findFont = false;
                }

                /** Size */
                if (findSize && selectionParent.style.fontSize.length > 0 && commandMap.SIZE) {
                    commandMapNodes.push('SIZE');
                    util.changeTxt(commandMap.SIZE, selectionParent.style.fontSize);
                    findSize = false;
                }

                /** A */
                if (findA && /^A$/.test(nodeName) && selectionParent.getAttribute('data-image-link') === null && core.plugins.link) {
                    if (!context.link || core.controllerArray[0] !== context.link.linkBtn) {
                        core.callPlugin('link', function () {
                            core.plugins.link.call_controller_linkButton.call(core, selectionParent);
                        });
                    }
                    findA = false;
                } else if (findA && context.link && core.controllerArray[0] === context.link.linkBtn) {
                    core.controllersOff();
                }

                /** strong, ins, em, del, sub, sup */
                if (classOnCheck.test(nodeName)) {
                    commandMapNodes.push(nodeName);
                }
            }

            /** toggle class on */
            for (let i = 0; i < commandMapNodes.length; i++) {
                nodeName = commandMapNodes[i];
                if (classOnCheck.test(nodeName)) {
                    util.addClass(commandMap[nodeName], 'active');
                }
            }

            /** remove class, display text */
            for (let key in commandMap) {
                if (commandMapNodes.indexOf(key) > -1) continue;
                
                if (commandMap.FONT && /^FONT$/i.test(key)) {
                    util.changeTxt(commandMap.FONT, lang.toolbar.font);
                    util.changeTxt(commandMap.FONT_TOOLTIP, lang.toolbar.font);
                }
                else if (commandMap.SIZE && /^SIZE$/i.test(key)) {
                    util.changeTxt(commandMap.SIZE, lang.toolbar.fontSize);
                }
                else if (commandMap.ALIGN && /^ALIGN$/i.test(key)) {
                    commandMap.ALIGN.className = 'se-icon-align-left';
                    commandMap.ALIGN.removeAttribute('data-focus');
                }
                else if (commandMap.OUTDENT && /^OUTDENT$/i.test(key)) {
                    commandMap.OUTDENT.setAttribute('disabled', true);
                }
                else if (commandMap.LI && util.isListCell(key)) {
                    commandMap.LI.removeAttribute('data-focus');
                    util.removeClass(commandMap.LI_ICON, 'se-icon-list-bullets');
                    util.addClass(commandMap.LI_ICON, 'se-icon-list-number');
                    util.removeClass(commandMap.LI, 'active');
                }
                else {
                    util.removeClass(commandMap[key], 'active');
                }
            }

            /** save current nodes */
            core._variable.currentNodes = currentNodes.reverse();

            /**  Displays the current node structure to resizingBar */
            if (context.option.showPathLabel) context.element.navigation.textContent = core._variable.currentNodes.join(' > ');
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
            
            /** Dialog, Submenu */
            if (display) {
                if (/submenu/.test(display) && (target.nextElementSibling === null || target !== core.submenuActiveButton)) {
                    core.callPlugin(command, function () {
                        core.submenuOn(target);
                    });
                    return;
                }
                else if (/dialog/.test(display)) {
                    core.callPlugin(command, function () {
                        core.plugins.dialog.open.call(core, command, false);
                    });
                    return;
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
            if (core._isBalloon) {
                event._hideToolbar();
            }

            const tableCell = util.getParentElement(e.target, util.isCell);
            if (!tableCell) return;

            const tablePlugin = core.plugins.table;
            if (tableCell !== tablePlugin._fixedCell && !tablePlugin._shift) {
                core.callPlugin('table', function () {
                    tablePlugin.onTableCellMultiSelect.call(core, tableCell, false);
                });
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
                    if (!core.plugins.image) return;

                    core.callPlugin('image', function () {
                        const size = core.plugins.resizing.call_controller_resize.call(core, imageComponent, 'image');
                        core.plugins.image.onModifyMode.call(core, imageComponent, size);
                        
                        if (!util.getParentElement(imageComponent, '.se-image-container')) {
                            core.plugins.image.openModify.call(core, true);
                            core.plugins.image.update_image.call(core, true, true);
                        }
                    });

                    return;
                } else if (videoComponent) {
                    e.preventDefault();
                    if (!core.plugins.video) return;

                    core.callPlugin('video', function () {
                        const size = core.plugins.resizing.call_controller_resize.call(core, videoComponent, 'video');
                        core.plugins.video.onModifyMode.call(core, videoComponent, size);
                    });

                    return;
                }
            }

            const figcaption = util.getParentElement(targetElement, 'FIGCAPTION');
            if (figcaption && figcaption.getAttribute('contenteditable') !== 'ture') {
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

                core.focus();
            }

            event._findButtonEffectTag();

            if (core._isBalloon) {
                const range = core.getRange();
                if (range.collapsed) event._hideToolbar();
                else event._showToolbarBalloon(range);
            }

            if (userFunction.onClick) userFunction.onClick(e);
        },

        _showToolbarBalloon: function (rangeObj) {
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

            const scrollLeft = _w.scrollX || _d.documentElement.scrollLeft;
            const scrollTop = _w.scrollY || _d.documentElement.scrollTop;
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
            const toolbar = context.element.toolbar;
            toolbar.style.visibility = 'hidden';
            toolbar.style.display = 'block';
            core._inlineToolbarAttr.width = toolbar.style.width = context.option.toolbarWidth;
            core._inlineToolbarAttr.top = toolbar.style.top = (-1 - toolbar.offsetHeight) + 'px';
            
            if (typeof userFunction.showInline === 'function') userFunction.showInline(toolbar, context);

            event.onScroll_window();
            core._inlineToolbarAttr.isShow = true;
            toolbar.style.visibility = '';
        },

        _hideToolbar: function () {
            if (!core._notHideToolbar) {
                context.element.toolbar.style.display = 'none';
                core._inlineToolbarAttr.isShow = false;
            }

            core._notHideToolbar = false;
        },

        onKeyDown_wysiwyg: function (e) {
            const keyCode = e.keyCode;
            const shift = e.shiftKey;
            const ctrl = e.ctrlKey || e.metaKey;
            const alt = e.altKey;

            if (!event._directionKeyKeyCode.test(keyCode)) _w.setTimeout(core._resourcesStateChange);

            if (core._isBalloon) {
                event._hideToolbar();
            }

            /** Shortcuts */
            if (ctrl && event._shortcutCommand(keyCode, shift)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            /** default key action */
            const selectionNode = core.getSelectionNode();
            const range = core.getRange();
            const selectRange = range.startContainer !== range.endContainer;
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

                    if (util.isWysiwygDiv(selectionNode.parentNode) && !selectionNode.previousSibling && util.isFormatElement(selectionNode) && !util.isListCell(selectionNode)) {
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

                        if (util.isComponent(commonCon.previousSibling)) {
                            const previousEl = commonCon.previousSibling;
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
                                    core.callPlugin('image', function () {
                                        const size = core.plugins.resizing.call_controller_resize.call(core, nextEl, 'image');
                                        core.plugins.image.onModifyMode.call(core, nextEl, size);
                                        
                                        if (!util.getParentElement(nextEl, '.se-component')) {
                                            core.plugins.image.openModify.call(core, true);
                                            core.plugins.image.update_image.call(core, true, true);
                                        }
                                    });
                                } else if (util.hasClass(nextEl, 'se-video-container')) {
                                    e.stopPropagation();
                                    core.callPlugin('video', function () {
                                        const iframe = nextEl.querySelector('iframe');
                                        const size = core.plugins.resizing.call_controller_resize.call(core, iframe, 'video');
                                        core.plugins.video.onModifyMode.call(core, iframe, size);
                                    });
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

                    const lines = core.getSelectedElements();

                    if (!shift) {
                        const tabText = util.createTextNode(new _w.Array(core._variable.tabSize + 1).join('\u00A0'));
                        if (lines.length === 1) {
                            const r = core.insertNode(tabText);
                            core.setRange(tabText, r.endOffset, tabText, r.endOffset);
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
                            if (firstChild && endChild) core.setRange(firstChild, 0, endChild, endChild.textContent.length);
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
                        if (firstChild && endChild) core.setRange(firstChild, 0, endChild, endChild.textContent.length);
                    }
                    
                    break;
                case 13: /** enter key */
                    if (selectRange) break;

                    formatEl = util.getFormatElement(selectionNode);
                    rangeEl = util.getRangeFormatElement(selectionNode);
                    const figcaption = util.getParentElement(rangeEl, 'FIGCAPTION');
                    if (rangeEl && formatEl && !util.isCell(rangeEl) && !/^FIGCAPTION$/i.test(rangeEl.nodeName)) {
                        const range = core.getRange();
                        if (!range.commonAncestorContainer.nextElementSibling && util.onlyZeroWidthSpace(formatEl.innerText.trim())) {
                            e.preventDefault();
                            const newEl = core.appendFormatTag(rangeEl, util.isCell(rangeEl.parentNode) ? 'DIV' : util.isListCell(formatEl) ? 'P' : null);
                            util.copyFormatAttributes(newEl, formatEl);
                            util.removeItemAllParents(formatEl);
                            core.setRange(newEl, 1, newEl, 1);
                            break;
                        }
                    }

                    if (rangeEl && figcaption && util.getParentElement(rangeEl, util.isList)) {
                        e.preventDefault();
                        formatEl = core.appendFormatTag(formatEl);
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

            const textKey = !ctrl && !alt && !event._historyIgnoreKeycode.test(keyCode);
            if (!core._charCount(1, textKey)) {
                if (textKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }

            if (userFunction.onKeyDown) userFunction.onKeyDown(e);
        },

        onKeyUp_wysiwyg: function (e) {
            core._editorRange();
            const keyCode = e.keyCode;
            const ctrl = e.ctrlKey || e.metaKey;
            const alt = e.altKey;
            let selectionNode = core.getSelectionNode();

            if (core._isBalloon && !core.getRange().collapsed) {
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
                event._findButtonEffectTag();

                core._checkComponents();
                return;
            }

            const formatEl = util.getFormatElement(selectionNode);
            const rangeEl = util.getRangeFormatElement(selectionNode);
            if (!formatEl || formatEl === rangeEl) {
                core.execCommand('formatBlock', false, util.isRangeFormatElement(rangeEl) ? 'DIV' : 'P');
                core.focus();
                selectionNode = core.getSelectionNode();
            }

            if (event._directionKeyKeyCode.test(keyCode)) {
                event._findButtonEffectTag();
            }

            core._checkComponents();

            const textKey = !ctrl && !alt && !event._historyIgnoreKeycode.test(keyCode);

            if (textKey && util.zeroWidthRegExp.test(selectionNode.textContent)) {
                const range = core.getRange();
                const s = range.startOffset, e = range.endOffset;
                const frontZeroWidthCnt = (selectionNode.textContent.match(event._frontZeroWidthReg) || '').length;
                selectionNode.textContent = selectionNode.textContent.replace(util.zeroWidthRegExp, '');
                core.setRange(selectionNode, s - frontZeroWidthCnt, selectionNode, e - frontZeroWidthCnt);
            }

            if (!core._charCount(1, textKey)) {
                if (e.key.length === 1) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }

            // history stack
            if (textKey) {
                core.history.push();
            }

            if (userFunction.onKeyUp) userFunction.onKeyUp(e);
        },

        onScroll_wysiwyg: function (e) {
            core.controllersOff();
            if (core._isBalloon) event._hideToolbar();
            if (userFunction.onScroll) userFunction.onScroll(e);
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
            
            core._iframeAutoHeight();

            if (core._sticky) {
                context.element.toolbar.style.width = (context.element.topArea.offsetWidth - 2) + 'px';
                event.onScroll_window();
            }
        },

        onScroll_window: function () {
            if (core._variable.isFullScreen || context.element.toolbar.offsetWidth === 0) return;

            const element = context.element;
            const editorHeight = element.editorArea.offsetHeight;
            const y = (this.scrollY || _d.documentElement.scrollTop) + context.option.stickyToolbar;
            const editorTop = event._getStickyOffsetTop() - (core._isInline ? element.toolbar.offsetHeight : 0);
            
            if (y < editorTop) {
                event._offStickyToolbar();
            }
            else if (y + core._variable.minResizingSize >= editorHeight + editorTop) {
                if (!core._sticky) event._onStickyToolbar();
                element.toolbar.style.top = (editorHeight + editorTop + context.option.stickyToolbar -y - core._variable.minResizingSize) + 'px';
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

            element.toolbar.style.top = context.option.stickyToolbar + 'px';
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
            const cleanData = util.cleanHTML(clipboardData.getData('text/html'));

            if (typeof userFunction.onPaste === 'function' && !userFunction.onPaste(e, cleanData, maxCharCount)) {
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
                core.history.push();
            }
        },

        onCut_wysiwyg: function () {
            _w.setTimeout(function () {
                core._resourcesStateChange();
                core._charCount(0, false);
                // history stack
                core.history.push();
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
                const cleanData = util.cleanHTML(dataTransfer.getData('text/html'));
                if (cleanData) {
                    event._setDropLocationSelection(e);
                    core.execCommand('insertHTML', false, cleanData);
                }
            }

            if (userFunction.onDrop) userFunction.onDrop(e);
        },

        _setDropLocationSelection: function (e) {
            e.stopPropagation();
            e.preventDefault();
            
            const range = core.getRange();
            core.setRange(range.startContainer, range.startOffset, range.endContainer, range.endOffset);
        },

        _onChange_historyStack: function () {
            if (context.tool.save) context.tool.save.removeAttribute('disabled');
            if (userFunction.onChange) userFunction.onChange(core.getContents(true));
        },

        _addEvent: function () {
            const eventWysiwyg = _options.iframe ? core._ww : context.element.wysiwyg;

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

            /** Events are registered only a balloon mode or when there is a table plugin. */
            if (core._isBalloon || core.plugins.table) {
                eventWysiwyg.addEventListener('mousedown', event.onMouseDown_wysiwyg, false);
            }

            /** Events are registered only when there is a table plugin.  */
            if (core.plugins.table) {
                eventWysiwyg.addEventListener('touchstart', event.onMouseDown_wysiwyg, {passive: true, useCapture: false});
            }
            
            /** code view area auto line */
            if (context.option.height === 'auto' && !context.option.codeMirrorEditor) {
                context.element.code.addEventListener('keydown', event._codeViewAutoHeight, false);
                context.element.code.addEventListener('keyup', event._codeViewAutoHeight, false);
                context.element.code.addEventListener('paste', event._codeViewAutoHeight, false);
            }

            /** resizingBar */
            if (context.element.resizingBar) {
                if (/\d+/.test(context.option.height)) {
                    context.element.resizingBar.addEventListener('mousedown', event.onMouseDown_resizingBar, false);
                } else {
                    util.addClass(context.element.resizingBar, 'se-resizing-none');
                }
            }

            /** inline editor */
            if (core._isInline) {
                eventWysiwyg.addEventListener('focus', event._showToolbarInline, false);
            }

            /** inline, balloon editor */
            if (core._isInline || core._isBalloon) {
                eventWysiwyg.addEventListener('blur', event._hideToolbar, false);
            }
            
            /** window event */
            _w.removeEventListener('resize', event.onResize_window);
            _w.removeEventListener('scroll', event.onScroll_window);

            _w.addEventListener('resize', event.onResize_window, false);
            if (context.option.stickyToolbar > -1) {
                _w.addEventListener('scroll', event.onScroll_window, false);
            }
        },

        _removeEvent: function () {
            const eventWysiwyg = _options.iframe ? core._ww : context.element.wysiwyg;

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
            eventWysiwyg.removeEventListener('blur', event._hideToolbar);

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
         * @param {Object} event Event Object
         */
        onScroll: null,
        onClick: null,
        onKeyDown: null,
        onKeyUp: null,
        onDrop: null,
        onChange: null,
        onPaste: null,
        showInline: null,

        /**
         * @description Called when the image is uploaded or the uploaded image is deleted
         * @param {Element} targetImgElement Current img element
         * @param {Number} index Uploaded index
         * @param {Boolean} isDelete Whether or not it was called after the delete operation
         * @param {Object} imageInfo Image info object
         */
        onImageUpload: null,

        /**
         * @description Called when the image is upload failed
         * @param {String} errorMessage Error message
         * @param {Object} result Result info Object
         */
        onImageUploadError: null,

        /**
         * @description Add or reset option property
         * @param {Object} options Options
         */
        setOptions: function (options) {
            event._removeEvent();

            core.plugins = options.plugins || core.plugins;
            const mergeOptions = [context.option, options].reduce(function (init, option) {
                Object.keys(option).forEach(function (key) {
                    init[key] = option[key];
                });
                return init;
            }, {});

            const cons = _Constructor._setOptions(mergeOptions, context, core.plugins, context.option);

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
            
            _options = mergeOptions;
            core.lang = lang = _options.lang;
            core.context = context = _Context(context.element.originElement, constructed, _options);

            core._init();
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
                core.insertComponent(html);
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
            const convertValue = util.convertContentsForEditor(contents);
            
            if (core._variable.wysiwygActive) {
                context.element.wysiwyg.innerHTML += convertValue;
            } else {
                core._setCodeView(core._getCodeView() + '\n' + util.convertHTMLForCodeView(convertValue, core._variable.codeIndent));
            }

            // history stack
            core.history.push();
        },

        /**
         * @description Disable the suneditor
         */
        disabled: function () {
            context.tool.cover.style.display = 'block';
            context.element.wysiwyg.setAttribute('contenteditable', false);

            if (context.option.codeMirrorEditor) {
                context.option.codeMirrorEditor.setOption('readOnly', true);
            } else {
                context.element.code.setAttribute('disabled', 'disabled');
            }
        },

        /**
         * @description Enabled the suneditor
         */
        enabled: function () {
            context.tool.cover.style.display = 'none';
            context.element.wysiwyg.setAttribute('contenteditable', true);

            if (context.option.codeMirrorEditor) {
                context.option.codeMirrorEditor.setOption('readOnly', false);
            } else {
                context.element.code.removeAttribute('disabled');
            }
        },

        /**
         * @description Show the suneditor
         */
        show: function () {
            const topAreaStyle = context.element.topArea.style;
            if (topAreaStyle.display === 'none') topAreaStyle.display = context.option.display;
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
        }
    };

    /** initialize core and add event listeners */
    core._init();
    event._addEvent();
    core._charCount(0, false);

    return userFunction;
}