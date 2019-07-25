/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

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
 * @returns {Object} UserFunction Object
 */
export default function (context, pluginCallButtons, plugins, lang) {
    const _d = document;
    const _w = window;
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
         * @description loaded plugins
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
        codeViewDisabledButtons: context.element.toolbar.querySelectorAll('.se-toolbar button:not([class~="code-view-enabled"])'),

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
        _isInline: /inline/i.test(context.option.mode),

        /**
         * @description Is balloon mode?
         * @private
         */
        _isBalloon: /balloon/i.test(context.option.mode),

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
        commandMap: {
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
        },

        /**
         * @description Variables used internally in editor operation
         * @property {Boolean} wysiwygActive The wysiwyg frame or code view state
         * @property {Boolean} isFullScreen State of full screen
         * @property {Number} innerHeight_fullScreen InnerHeight in editor when in full screen
         * @property {Number} resizeClientY Remember the vertical size of the editor before resizing the editor (Used when calculating during resize operation)
         * @property {Number} tabSize Indented size when tab button clicked (4)
         * @property {Number} minResizingSize Minimum size of editing area when resized (65)
         * @property {Array} currentNodes  An array of the current cursor's node structure
         * @private
         */
        _variable: {
            wysiwygActive: true,
            isFullScreen: false,
            innerHeight_fullScreen: 0,
            resizeClientY: 0,
            tabSize: 4,
            minResizingSize: 65,
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
         * @param {Element} element Submenu element to call
         */
        submenuOn: function (element) {
            if (this._bindedSubmenuOff) this._bindedSubmenuOff();

            const submenuName = this._submenuName = element.getAttribute('data-command');
            if (this.plugins[submenuName].on) this.plugins[submenuName].on.call(this);

            this.submenu = element.nextElementSibling;
            this.submenu.style.display = 'block';
            util.addClass(element, 'on');
            this.submenuActiveButton = element;

            const overLeft = this.context.element.toolbar.offsetWidth - (element.parentElement.offsetLeft + this.submenu.offsetWidth);
            if (overLeft < 0) this.submenu.style.left = overLeft + 'px';
            else this.submenu.style.left = '1px';

            this._bindedSubmenuOff = this.submenuOff.bind(this);
            _d.addEventListener('mousedown', this._bindedSubmenuOff, false);
        },

        /**
         * @description Disable submenu
         */
        submenuOff: function () {
            _d.removeEventListener('mousedown', this._bindedSubmenuOff);
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
            if (this._bindControllersOff) this._bindControllersOff();

            for (let i = 0; i < arguments.length; i++) {
                if (arguments[i].style) arguments[i].style.display = 'block';
                this.controllerArray[i] = arguments[i];
            }

            this._bindControllersOff = this.controllersOff.bind(this);
            _d.addEventListener('mousedown', this._bindControllersOff, false);
            if (!this._resizingName) _d.addEventListener('keydown', this._bindControllersOff, false);
        },

        /**
         * @description Hide controller at editor area (link button, image resize button..)
         */
        controllersOff: function () {
            this._resizingName = '';
            if (!this._bindControllersOff) return;

            _d.removeEventListener('mousedown', this._bindControllersOff);
            _d.removeEventListener('keydown', this._bindControllersOff);
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
            _d.execCommand(command, showDefaultUI, (command === 'formatBlock' ? '<' + value + '>' : value));
            // history stack
            this.history.push();
        },

        /**
         * @description Focus to wysiwyg area
         */
        focus: function () {
            if (context.element.wysiwyg.style.display === 'none') return;

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
            
            const range = _d.createRange();
            range.setStart(startCon, startOff);
            range.setEnd(endCon, endOff);

            const selection = _w.getSelection();

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
         * @description Get current select node
         * @returns {Node}
         */
        getSelectionNode: function () {
            return this._variable._selectionNode || context.element.wysiwyg.firstChild;
        },

        /**
         * @description Saving the range object and the currently selected node of editor
         * @private
         */
        _editorRange: function () {
            const selection = _w.getSelection();
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
            const range = _d.createRange();
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
         * @param {Element} oNode Element to be inserted
         * @param {Element|null} afterNode If the node exists, it is inserted after the node
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
            }
        },

        /**
         * @description Delete the currently selected node
         */
        removeNode: function () {
            const range = this.getRange();

            if (range.deleteContents) {
                range.deleteContents();
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

            const children = rangeElement.children;
            const parent = rangeElement.parentNode;
            let firstNode = null;
            let lastNode = null;
            let rangeEl = rangeElement.cloneNode(false);
            
            const newList = util.isList(newRangeElement);
            let insertedNew = false;

            function appendNode (parent, insNode, sibling) {
                if (util.onlyZeroWidthSpace(insNode)) insNode.innerHTML = util.zeroWidthSpace;
                
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
                        const inner = insNode.innerHTML;
                        insNode = util.isCell(rangeElement.parentNode) ? util.createElement('DIV') : util.createElement('P');
                        insNode.innerHTML = inner;
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
            } : this.util.getEdgeChildNodes(firstNode, lastNode);

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
         * @description Adds a node to the selected region, or deletes the node.
         * 1. If there is a node in the "appendNode" argument, "appendNode" is added to the selection range.
         * 2. If the "appendNode" argument has a null value, the node is modified without adding a new node.
         * 3. Styles such as the style property of the "styleArray" argument will be deleted.
         * 4. If the node is "appendNode" or if "appendNode" is null, Nodes with all styles removed will be deleted.
         * 5. Tags with the same name as the value of the "removeNodeArray" argument will be deleted. Valid only when "appendNode" is null.
         * @param {Element|null} appendNode The element to be added to the selection. If it is null, delete the node.
         * @param {Array|null} styleArray The style attribute name Array to check (['font-size'], ['font-family', 'background-color', 'border']...])
         * @param {Array|null} removeNodeArray An array of node names from which to remove types, Removes all formats when there is an empty array or null value. (['span'], ['b', 'u']...])
         */
        nodeChange: function (appendNode, styleArray, removeNodeArray) {
            const range = this.getRange();
            styleArray = styleArray && styleArray.length > 0 ? styleArray : false;
            removeNodeArray = removeNodeArray && removeNodeArray.length > 0 ? removeNodeArray : false;
            this._editorRange();
            
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

            /* checked same style property */
            if (!isRemoveFormat && startCon === endCon) {
                let sNode = startCon;
                if (isRemoveFormat) {
                    if (util.getFormatElement(sNode) === sNode.parentNode) return;
                } else if (styleArray.length > 0) {
                    let checkCnt = 0;

                    for (let i = 0; i < styleArray.length; i++) {
                        while(!util.isFormatElement(sNode) && !util.isWysiwygDiv(sNode)) {
                            if (sNode.nodeType === 1 && (isRemoveNode ? sNode.style[styleArray[i]] : sNode.style[styleArray[i]] === appendNode.style[styleArray[i]])) {
                                checkCnt++;
                            }
                            sNode = sNode.parentNode;
                        }
                    }
    
                    if (!isRemoveNode && checkCnt >= styleArray.length) return;
                    if (isRemoveNode && checkCnt === 0) return;
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
                        tempCon = tempChild[tempOffset - 1] || !/FIGURE/i.test(tempChild[0].nodeName) ? tempChild[0] : (tempCon.previousElementSibling || tempCon.previousSibling || startCon);
                        tempOffset = tempCon.textContent.length;
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
                    tempOffset = 0;
                    if (onlyBreak) {
                        util.removeItem(endCon);
                    }
                }
            }

            // set endContainer
            endCon = tempCon;
            endOff = tempOffset;

            // set Range
            const newNodeName = appendNode.nodeName;
            this.setRange(startCon, startOff, endCon, endOff);

            let start = {}, end = {};
            let newNode, styleRegExp, removeRegExp;

            if (styleArray) {
                styleRegExp = '(?:;|^|\\s)(?:' + styleArray[0];
                for (let i = 1; i < styleArray.length; i++) {
                    styleRegExp += '|' + styleArray[i];
                }
                styleRegExp += ')\\s*:[^;]*\\s*(?:;|$)';
                styleRegExp = new _w.RegExp(styleRegExp, 'ig');
            }

            if (removeNodeArray) {
                removeRegExp = '^(?:' + removeNodeArray[0];
                for (let i = 1; i < removeNodeArray.length; i++) {
                    removeRegExp += '|' + removeNodeArray[i];
                }
                removeRegExp += ')$';
                removeRegExp = new _w.RegExp(removeRegExp, 'i');
            }

            /** validation check function*/
            const validation = function (vNode) {
                // all path
                if (vNode.nodeType === 3 || util.isBreak(vNode)) return true;
                // all remove
                if (isRemoveFormat) return false;

                // style regexp
                const originStyle = vNode.style.cssText;
                let style = '';
                if (styleRegExp && originStyle.length > 0) {
                    style = originStyle.replace(styleRegExp, '').trim();
                }

                // remove
                if (isRemoveNode) {
                    if (styleRegExp && removeRegExp) {
                        if (!style && removeRegExp.test(vNode.nodeName)) return false;
                    }

                    if (styleRegExp && !style && originStyle) {
                        return false;
                    }

                    if (removeRegExp && removeRegExp.test(vNode.nodeName)) {
                        return false;
                    }
                }

                // change
                if (style || vNode.nodeName !== newNodeName) {
                    if (styleRegExp && originStyle.length > 0) vNode.style.cssText = style;
                    return true;
                }

                return false;
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
                const newRange = this._nodeChange_oneLine(lineNodes[0], newNode, validation, startCon, startOff, endCon, endOff, isRemoveFormat, isRemoveNode, range.collapsed);
                start.container = newRange.startContainer;
                start.offset = newRange.startOffset;
                end.container = newRange.endContainer;
                end.offset = newRange.endOffset;
            } else {
                start = this._nodeChange_startLine(lineNodes[0], newNode, validation, startCon, startOff, isRemoveFormat, isRemoveNode);
            }

            // mid
            for (let i = 1; i < endLength; i++) {
                newNode = appendNode.cloneNode(false);
                this._nodeChange_middleLine(lineNodes[i], newNode, validation, isRemoveFormat, isRemoveNode);
            }

            // endCon
            if (endLength > 0 && !oneLine) {
                newNode = appendNode.cloneNode(false);
                end = this._nodeChange_endLine(lineNodes[endLength], newNode, validation, endCon, endOff, isRemoveFormat, isRemoveNode);
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
        _nodeChange_oneLine: function (element, newInnerNode, validation, startCon, startOff, endCon, endOff, isRemoveFormat, isRemoveNode, collapsed) {
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

                for (let i = 0, len = childNodes.length; i < len; i++) {
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
                            if (validation(newNode) && newNode.nodeType === 1 && checkCss(newNode)) {
                                pCurrent.push(newNode.cloneNode(false));
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

                        if (!isSameNode) {
                            continue;
                        } else if (endOff === startOffset || endOff === textNode.data.length) {
                            endContainer = textNode;
                            endOffset = textNode.data.length;
                            endPass = true;
                            continue;
                        }
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
                            if (validation(newNode) && newNode.nodeType === 1 && checkCss(newNode)) {
                                pCurrent.push(newNode.cloneNode(false));
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
                        cssText = '';
                        while (newNode.parentNode !== null && newNode !== el && newNode !== newInnerNode) {
                            if (newNode.nodeType === 1 && !util.isBreak(child) && (endPass || validation(newNode)) && checkCss(newNode)) {
                                pCurrent.push(newNode.cloneNode(false));
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

            const preventDelete = util.onlyZeroWidthSpace(newInnerNode.textContent);
            if (preventDelete) newInnerNode.textContent = ' ';
            util.removeEmptyNode(pNode);
            if (preventDelete) newInnerNode.textContent = util.zeroWidthSpace;

            // node change
            const endConReset = isRemoveFormat || !endContainer.textContent;
            element.parentNode.insertBefore(pNode, element);
            util.removeItem(element);

            if (collapsed) {
                startOffset = startContainer.textContent.length;
                endOffset = endContainer.textContent.length;
            }

            if (endContainer.textContent.length === 0) {
                util.removeItem(endContainer);
                endContainer = startContainer;
            }

            return {
                startContainer: startContainer,
                startOffset: startOffset,
                endContainer: endContainer,
                endOffset: endConReset ? endContainer.textContent.length : endOffset
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
        _nodeChange_middleLine: function (element, newInnerNode, validation, isRemoveFormat, isRemoveNode) {
            const pNode = element.cloneNode(false);
            const nNodeArray = [newInnerNode];
            let noneChange = true;

            (function recursionFunc(current, node) {
                const childNodes = current.childNodes;

                for (let i = 0, len = childNodes.length; i < len; i++) {
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
                    } else if (validation(child)) {
                        noneChange = false;
                        let cloneNode = child.cloneNode(false);
                        node.appendChild(cloneNode);
                        if (child.nodeType === 1 && !util.isBreak(child)) coverNode = cloneNode;
                    }

                    recursionFunc(child, coverNode);
                }
            })(element.cloneNode(true), newInnerNode);

            if (noneChange) return;

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

            util.removeEmptyNode(pNode);

            // node change
            element.parentNode.insertBefore(pNode, element);
            util.removeItem(element);
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
        _nodeChange_startLine: function (element, newInnerNode, validation, startCon, startOff, isRemoveFormat, isRemoveNode) {
            const el = element;
            const nNodeArray = [newInnerNode];
            const pNode = element.cloneNode(false);

            let container = startCon;
            let offset = startOff;
            let passNode = false;
            let pCurrent, newNode, appendNode;

            (function recursionFunc(current, node) {
                const childNodes = current.childNodes;
                for (let i = 0, len = childNodes.length; i < len; i++) {
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
                            if (newNode.nodeType === 1 && validation(newNode)) {
                                pCurrent.push(newNode.cloneNode(false));
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
                            if (newNode.nodeType === 1 && validation(newNode)) {
                                pCurrent.push(newNode.cloneNode(false));
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

                    if (!passNode || validation(child)) {
                        const cloneNode = child.cloneNode(false);
                        node.appendChild(cloneNode);
                        if (child.nodeType === 1 && !util.isBreak(child)) coverNode = cloneNode;
                    }

                    recursionFunc(child, coverNode);
                }
            })(element, pNode);

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

            if (!isRemoveFormat && pNode.children.length === 0) {
                if (element.childNodes) {
                    container = element.childNodes[0];
                } else {
                    container = util.createTextNode(util.zeroWidthSpace);
                    element.appendChild(container);
                }
            } else {
                util.removeEmptyNode(pNode);
                if (util.onlyZeroWidthSpace(pNode.textContent)) {
                    container = pNode.firstChild;
                    offset = 0;
                }

                // node change
                element.parentNode.insertBefore(pNode, element);
                util.removeItem(element);
            }

            return {
                container: container,
                offset: offset
            };
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
        _nodeChange_endLine: function (element, newInnerNode, validation, endCon, endOff, isRemoveFormat, isRemoveNode) {
            const el = element;
            const nNodeArray = [newInnerNode];
            const pNode = element.cloneNode(false);

            let container = endCon;
            let offset = endOff;
            let passNode = false;
            let pCurrent, newNode, appendNode;

            (function recursionFunc(current, node) {
                const childNodes = current.childNodes;
                for (let i = childNodes.length -1; 0 <= i; i--) {
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
                            if (validation(newNode) && newNode.nodeType === 1) {
                                pCurrent.push(newNode.cloneNode(false));
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
                            if (validation(newNode) && newNode.nodeType === 1) {
                                pCurrent.push(newNode.cloneNode(false));
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

                    if (!passNode || validation(child)) {
                        const cloneNode = child.cloneNode(false);
                        node.insertBefore(cloneNode, node.firstChild);
                        if (child.nodeType === 1 && !util.isBreak(child)) coverNode = cloneNode;
                    }

                    recursionFunc(child, coverNode);
                }
            })(element, pNode);

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
                util.removeEmptyNode(pNode);
                if (util.onlyZeroWidthSpace(pNode.textContent)) {
                    container = pNode.firstChild;
                    offset = container.textContent.length;
                }
                
                // node change
                element.parentNode.insertBefore(pNode, element);
                util.removeItem(element);
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
                    const first = util.getChildElement(wysiwyg.firstChild, function (current) { return current.childNodes.length === 0 || current.nodeType === 3; }) || wysiwyg.firstChild;
                    const last = util.getChildElement(wysiwyg.lastChild, function (current) { return current.childNodes.length === 0 || current.nodeType === 3; }, true) || wysiwyg.lastChild;
                    this.setRange(first, 0, last, last.textContent.length);
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
                        context.option.callBackSave(this.getContents());
                    } else if (typeof userFunction.save === 'function') {
                        userFunction.save();
                    } else {
                        throw Error('[SUNEDITOR.core.commandHandler.fail] Please register call back function in creation option. (callBackSave : Function)');
                    }

                    if (context.tool.save) context.tool.save.setAttribute('disabled', true);
                    break;
                default : // 'STRONG', 'INS', 'EM', 'DEL', 'SUB', 'SUP'
                    const on = util.hasClass(this.commandMap[command], 'active');

                    if (command === 'SUB' && util.hasClass(this.commandMap.SUP, 'active')) {
                        this.nodeChange(null, null, ['SUP']);
                    } else if (command === 'SUP' && util.hasClass(this.commandMap.SUB, 'active')) {
                        this.nodeChange(null, null, ['SUB']);
                    }
                    this.nodeChange(on ? null : this.util.createElement(command), null, [command]);
                    this.focus();
            }
        },

        /**
         * @description Remove format of the currently selected range
         */
        removeFormat: function () {
            this.nodeChange();
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
                const code_html = context.element.code.value.trim();
                context.element.wysiwyg.innerHTML = code_html.length > 0 ? util.convertContentsForEditor(code_html) : '<p><br></p>';
                context.element.wysiwyg.scrollTop = 0;
                context.element.code.style.display = 'none';
                context.element.wysiwyg.style.display = 'block';

                this._variable._codeOriginCssText = this._variable._codeOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: none');
                this._variable._wysiwygOriginCssText = this._variable._wysiwygOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: block');

                if (context.option.height === 'auto') context.element.code.style.height = '0px';
                this._variable.wysiwygActive = true;
                this.focus();
            }
            else {
                context.element.code.value = util.convertHTMLForCodeView(context.element.wysiwyg);
                context.element.code.style.display = 'block';
                context.element.wysiwyg.style.display = 'none';

                this._variable._codeOriginCssText = this._variable._codeOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: block');
                this._variable._wysiwygOriginCssText = this._variable._wysiwygOriginCssText.replace(/(\s?display(\s+)?:(\s+)?)[a-zA-Z]+(?=;)/, 'display: none');

                if (context.option.height === 'auto') context.element.code.style.height = context.element.code.scrollHeight > 0 ? (context.element.code.scrollHeight + 'px') : 'auto';
                this._variable.wysiwygActive = false;
                context.element.code.focus();
            }
        },

        /**
         * @description Changes to full screen or default screen
         * @param {Element} element full screen button
         */
        toggleFullScreen: function (element) {
            const topArea = context.element.topArea;
            const toolbar = context.element.toolbar;
            const editorArea = context.element.editorArea;
            const wysiwyg = context.element.wysiwyg;
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
                this._variable._wysiwygOriginCssText = wysiwyg.style.cssText;
                this._variable._codeOriginCssText = code.style.cssText;

                editorArea.style.cssText = toolbar.style.cssText = '';
                wysiwyg.style.cssText = wysiwyg.style.cssText.match(/\s?display(\s+)?:(\s+)?[a-zA-Z]+;/)[0];
                code.style.cssText = code.style.cssText.match(/\s?display(\s+)?:(\s+)?[a-zA-Z]+;/)[0];
                toolbar.style.width = wysiwyg.style.height = code.style.height = '100%';
                toolbar.style.position = 'relative';

                this._variable.innerHeight_fullScreen = (_w.innerHeight - toolbar.offsetHeight);
                editorArea.style.height = this._variable.innerHeight_fullScreen + 'px';

                util.removeClass(element.firstElementChild, 'se-icon-expansion');
                util.addClass(element.firstElementChild, 'se-icon-reduction');
            }
            else {
                this._variable.isFullScreen = false;

                wysiwyg.style.cssText = this._variable._wysiwygOriginCssText;
                code.style.cssText = this._variable._codeOriginCssText;
                toolbar.style.cssText = '';
                editorArea.style.cssText = this._variable._editorAreaOriginCssText;
                topArea.style.cssText = this._variable._originCssText;
                _d.body.style.overflow = this._variable._bodyOverflow;

                if (context.option.stickyToolbar > -1) {
                    util.removeClass(toolbar, 'se-toolbar-sticky');
                    event.onScroll_window();
                }

                if (this._variable._fullScreenSticky) {
                    this._variable._fullScreenSticky = false;
                    context.element._stickyDummy.style.display = 'block';
                    util.addClass(toolbar, "se-toolbar-sticky");
                }

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

            const contents = util.createElement('DIV');
            const style = util.createElement('STYLE');
            style.innerHTML = util.getPageStyle();
            contents.className = 'sun-editor-editable';
            contents.innerHTML = this.getContents();

            _d.body.appendChild(iframe);
            
            let printDocument = iframe.contentWindow || iframe.contentDocument;
            if (printDocument.document) printDocument = printDocument.document;

            printDocument.head.appendChild(style);
            printDocument.body.appendChild(contents);

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
            const cssText = util.getPageStyle();
            const contentsHTML = this.getContents();
            
            const windowObject = _w.open('', '_blank');
            windowObject.mimeType = 'text/html';
            windowObject.document.write('' +
                '<!doctype html><html>' +
                '<head>' +
                '<meta charset="utf-8" />' +
                '<meta name="viewport" content="width=device-width, initial-scale=1">' +
                '<title>' + lang.toolbar.preview + '</title>' +
                '<style>' + cssText + '</style>' +
                '</head>' +
                '<body>' +
                '<div class="sun-editor-editable">' + contentsHTML + '</div>' +
                '</body>' +
                '</html>'
            );
        },

        /**
         * @description Gets the current contents
         * @returns {Object}
         */
        getContents: function () {
            let contents = '';

            if (core._variable.wysiwygActive) {
                contents = context.element.wysiwyg.innerHTML;
            } else {
                contents = util.convertContentsForEditor(context.element.code.value);
            }

            const renderHTML = util.createElement('DIV');
            renderHTML.innerHTML = contents;

            const figcaptions = util.getListChildren(renderHTML, function (current) {
                return /FIGCAPTION/i.test(current.nodeName);
            });

            for (let i = 0, len = figcaptions.length; i < len; i++) {
                figcaptions[i].removeAttribute('contenteditable');
            }

            return renderHTML.innerHTML;
        },

        /**
         * @description The current number of characters is counted and displayed.
         * @param {Number} nextCharCount Length of character to be added.
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
                if (!this.initPlugins.video) this.callPlugin('video', this.plugins.video.checkVideos.bind(this));
                else this.plugins.video.checkVideos.call(this);
            }
        }
    };

    /**
     * @description event function
     */
    const event = {
        _directionKeyKeyCode: new _w.RegExp('^(8|13|32|46|33|34|35|36|37|38|39|40|46|98|100|102|104)$'),
        _historyIgnoreKeycode: new _w.RegExp('^(9|1[6-8]|20|3[3-9]|40|45|11[2-9]|12[0-3]|144|145)$'),
        _onButtonsCheck: new _w.RegExp('^(STRONG|INS|EM|DEL|SUB|SUP|LI)$'),
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
            const target = util.getParentElement(e.target, util.isCell);
            if (!target) return;

            const tablePlugin = core.plugins.table;
            if (target !== tablePlugin._fixedCell && !tablePlugin._shift) {
                core.callPlugin('table', function () {
                    tablePlugin.onTableCellMultiSelect.call(core, target, false);
                });
            }
        },

        onClick_wysiwyg: function (e) {
            const targetElement = e.target;
            if (context.element.wysiwyg.getAttribute('contenteditable') === 'false') return;
            e.stopPropagation();
            
            if (core._isBalloon) {
                const range = core.getRange();
                if (range.collapsed) event._hideToolbar();
                else event._showToolbarBalloon(range);
            }

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

            const formatEl = util.getFormatElement(core.getSelectionNode());
            const rangeEl = util.getRangeFormatElement(core.getSelectionNode());
            if (core.getRange().collapsed && (!formatEl || formatEl === rangeEl) && targetElement.getAttribute('contenteditable') !== 'false') {
                core.execCommand('formatBlock', false, util.isRangeFormatElement(rangeEl) ? 'DIV' : 'P');
                core.focus();
            }

            core._editorRange();
            event._findButtonEffectTag();

            if (userFunction.onClick) userFunction.onClick(e);
        },

        _showToolbarBalloon: function (rangeObj) {
            const range = rangeObj || core.getRange();
            const padding = 20;
            const toolbar = context.element.toolbar;
            const selection = _w.getSelection();

            let isDirTop;
            if (selection.focusNode === selection.anchorNode) {
                isDirTop = selection.focusOffset < selection.anchorOffset;
            } else {
                const childNodes = util.getListChildNodes(range.commonAncestorContainer);
                isDirTop = util.getArrayIndex(childNodes, selection.focusNode) < util.getArrayIndex(childNodes, selection.anchorNode);
            }

            let rects = range.getClientRects();
            rects = rects[isDirTop ? 0 : rects.length - 1];
            
            toolbar.style.display = 'block';

            const toolbarWidth = toolbar.offsetWidth;
            const toolbarHeight = toolbar.offsetHeight;

            let l = (isDirTop ? rects.left : rects.right) - context.element.topArea.offsetLeft + (_w.scrollX || _d.documentElement.scrollLeft) - toolbarWidth / 2;
            let t = (isDirTop ? rects.top - toolbarHeight - 11 : rects.bottom + 11) - event._getStickyOffsetTop() + (_w.scrollY || _d.documentElement.scrollTop);

            const overRight = l + toolbarWidth - context.element.topArea.offsetWidth;

            toolbar.style.left = (l < 0 ? padding : overRight < 0 ? l : l - overRight - padding) + 'px';
            toolbar.style.top = (t) + 'px';

            if (isDirTop) {
                util.removeClass(context.element._arrow, 'se-arrow-up');
                util.addClass(context.element._arrow, 'se-arrow-down');
                context.element._arrow.style.top = (toolbarHeight) + 'px';
            } else {
                util.removeClass(context.element._arrow, 'se-arrow-down');
                util.addClass(context.element._arrow, 'se-arrow-up');
                context.element._arrow.style.top = '-11px';
            }

            const arrow_width = context.element._arrow.offsetWidth;
            const arrow_left = toolbarWidth / 2 + (l < 0 ? l - arrow_width : overRight < 0 ? 0 : overRight + arrow_width);
            const arrow_point_width = arrow_width / 2;
            const left = _w.Math.abs(arrow_left < arrow_point_width ? arrow_point_width : arrow_left + arrow_point_width >= toolbarWidth ? arrow_left - arrow_point_width : arrow_left - (isDirTop ? 0 : padding));
            context.element._arrow.style.left = (left + 11 > toolbar.offsetWidth ? toolbar.offsetWidth - 11 : left) + 'px';
        },

        _showToolbarInline: function () {
            const toolbar = context.element.toolbar;
            toolbar.style.display = 'block';
            core._inlineToolbarAttr.width = toolbar.style.width = context.option.toolbarWidth;
            core._inlineToolbarAttr.top = toolbar.style.top = (-1 - toolbar.offsetHeight) + 'px';
            event.onScroll_window();
            core._inlineToolbarAttr.isShow = true;
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
            let rangeEl = util.getRangeFormatElement(formatEl);

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

                                // history stack
                                core.history.push();
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
                        const tabText = util.createTextNode(new Array(core._variable.tabSize + 1).join('\u00A0'));
                        if (lines.length === 1) {
                            core.insertNode(tabText);
                            core.setRange(tabText, core._variable.tabSize, tabText, core._variable.tabSize);
                        } else {
                            for (let i = 0, len = lines.length; i < len; i++) {
                                lines[i].insertBefore(tabText.cloneNode(false), lines[i].firstChild);
                            }
                        }
                    } else {
                        for (let i = 0, len = lines.length, child; i < len; i++) {
                            child = lines[i].firstChild;
                            if (/^\s{1,4}$/.test(child.textContent)) {
                                util.removeItem(child);
                            } else if (/^\s{1,4}/.test(child.textContent)) {
                                child.textContent = child.textContent.replace(/^\s{1,4}/, '');
                            }
                        }
                    }

                    // history stack
                    core.history.push();
                    break;
                case 13: /** enter key */
                    if (selectRange) break;

                    formatEl = util.getFormatElement(selectionNode);
                    rangeEl = util.getRangeFormatElement(formatEl);
                    const figcaption = util.getParentElement(rangeEl, 'FIGCAPTION');
                    if (rangeEl && formatEl && !util.isCell(rangeEl) && !/^FIGCAPTION$/i.test(rangeEl.nodeName)) {
                        const range = core.getRange();
                        if (!range.commonAncestorContainer.nextElementSibling && util.onlyZeroWidthSpace(formatEl.innerText.trim())) {
                            e.preventDefault();
                            const newEl = core.appendFormatTag(rangeEl, util.isCell(rangeEl.parentNode) ? 'DIV' : util.isListCell(formatEl) ? 'P' : null);
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
                            core.controllersOff();
                            const size = core.plugins.resizing.call_controller_resize.call(core, compContext._element, resizingName);
                            core.plugins[resizingName].onModifyMode.call(core, compContext._element, size);
                        });

                        // history stack
                        core.history.push();
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

            const textKey = !ctrl && !alt && e.key.length === 1;
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

            if (!core._charCount(1, e.key.length === 1)) {
                if (e.key.length === 1) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }

            // history stack
            if (!event._historyIgnoreKeycode.test(keyCode)) {
                core.history.push();
            }

            if (userFunction.onKeyUp) userFunction.onKeyUp(e);
        },

        onScroll_wysiwyg: function (e) {
            core.controllersOff();
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
            context.element.wysiwyg.style.height = context.element.code.style.height = (resizeInterval < core._variable.minResizingSize ? core._variable.minResizingSize : resizeInterval) + 'px';
            core._variable.resizeClientY = e.clientY;
        },

        onResize_window: function () {
            if (context.element.toolbar.offsetWidth === 0) return;

            if (core._variable.isFullScreen) {
                core._variable.innerHeight_fullScreen += (_w.innerHeight - context.element.toolbar.offsetHeight) - core._variable.innerHeight_fullScreen;
                context.element.editorArea.style.height = core._variable.innerHeight_fullScreen + 'px';
            } else if (core._sticky) {
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
                event._offStickyToolbar(element);
            }
            else if (y + core._variable.minResizingSize >= editorHeight + editorTop) {
                if (!core._sticky) event._onStickyToolbar(element);
                element.toolbar.style.top = (editorHeight + editorTop + context.option.stickyToolbar -y - core._variable.minResizingSize) + 'px';
            }
            else if (y >= editorTop) {
                event._onStickyToolbar(element);
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

        _onStickyToolbar: function (element) {
            if (!core._isInline) {
                element._stickyDummy.style.height = element.toolbar.offsetHeight + 'px';
                element._stickyDummy.style.display = 'block';
            }

            element.toolbar.style.top = context.option.stickyToolbar + 'px';
            element.toolbar.style.width = core._isInline ? core._inlineToolbarAttr.width : element.toolbar.offsetWidth + 'px';
            util.addClass(element.toolbar, 'se-toolbar-sticky');
            core._sticky = true;
        },

        _offStickyToolbar: function (element) {
            element._stickyDummy.style.display = 'none';
            element.toolbar.style.top = core._isInline ? core._inlineToolbarAttr.top : '';
            element.toolbar.style.width = core._isInline ? core._inlineToolbarAttr.width : '';
            element.editorArea.style.marginTop = '';
            util.removeClass(element.toolbar, 'se-toolbar-sticky');
            core._sticky = false;
        },

        _codeViewAutoScroll: function () {
            context.element.code.style.height = context.element.code.scrollHeight + 'px';
        },

        onPaste_wysiwyg: function (e) {
            const clipboardData = e.clipboardData;
            if (!clipboardData) return true;

            if (!core._charCount(clipboardData.getData('text/plain').length, true)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            const cleanData = util.cleanHTML(clipboardData.getData('text/html'));
            if (cleanData) {
                e.stopPropagation();
                e.preventDefault();
                core.execCommand('insertHTML', false, cleanData);
            }
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
            if (userFunction.onChange) userFunction.onChange(core.getContents());
        }
    };

    /** User function */
    const userFunction = {
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
            context.element.originElement.value = core.getContents();
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
         * @returns {String}
         */
        getContents: function () {
            return core.getContents();
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

            core.insertNode(html, afterNode);
            core.focus();
        },

        /**
         * @description Change the contents of the suneditor
         * @param {String} contents Contents to Input
         */
        setContents: function (contents) {
            if (core._variable.wysiwygActive) {
                const html = util.convertContentsForEditor(contents);
                if (html !== context.element.wysiwyg.innerHTML) {
                    context.element.wysiwyg.innerHTML = html;

                    // history stack
                    core.history.push();
                }
            } else {
                const value = util.convertHTMLForCodeView(contents);
                if (value !== context.element.code.value) {
                    context.element.code.value = value;
                }
            }
        },

        /**
         * @description Add contents to the suneditor
         * @param {String} contents Contents to Input
         */
        appendContents: function (contents) {
            if (core._variable.wysiwygActive) {
                context.element.wysiwyg.innerHTML += util.convertContentsForEditor(contents);
            } else {
                context.element.code.value += util.convertHTMLForCodeView(contents);
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
            context.element.code.setAttribute('disabled', 'disabled');
        },

        /**
         * @description Enabled the suneditor
         */
        enabled: function () {
            context.tool.cover.style.display = 'none';
            context.element.wysiwyg.setAttribute('contenteditable', true);
            context.element.code.removeAttribute('disabled');
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
            /** remove window event listeners */
            _w.removeEventListener('resize', event.onResize_window);
            _w.removeEventListener('scroll', event.onScroll_window);
            
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

    /** add event listeners */
    /** toolbar event */
    context.element.toolbar.addEventListener('mousedown', event.onMouseDown_toolbar, false);
    context.element.toolbar.addEventListener('click', event.onClick_toolbar, false);
    /** editor area */
    context.element.wysiwyg.addEventListener('click', event.onClick_wysiwyg, false);
    context.element.wysiwyg.addEventListener('scroll', event.onScroll_wysiwyg, false);
    context.element.wysiwyg.addEventListener('keydown', event.onKeyDown_wysiwyg, false);
    context.element.wysiwyg.addEventListener('keyup', event.onKeyUp_wysiwyg, false);
    context.element.wysiwyg.addEventListener('paste', event.onPaste_wysiwyg, false);
    context.element.wysiwyg.addEventListener('drop', event.onDrop_wysiwyg, false);
    context.element.wysiwyg.addEventListener('dragover', function (e) { e.preventDefault(); }, false);
    /** Events are registered only when there is a table plugin.  */
    if (core.plugins.table) {
        context.element.wysiwyg.addEventListener('touchstart', event.onMouseDown_wysiwyg, {passive: true, useCapture: false});
        context.element.wysiwyg.addEventListener('mousedown', event.onMouseDown_wysiwyg, false);
    }
    
    /** code view area auto line */
    if (context.option.height === 'auto') context.element.code.addEventListener('keyup', event._codeViewAutoScroll, false);

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
        context.element.wysiwyg.addEventListener('focus', event._showToolbarInline, false);
    }

    /** inline, balloon editor */
    if (core._isInline || core._isBalloon) {
        context.element.wysiwyg.addEventListener('blur', event._hideToolbar, false);
    }
    
    /** window event */
    _w.addEventListener('resize', event.onResize_window, false);
    if (context.option.stickyToolbar > -1) {
        _w.addEventListener('scroll', event.onScroll_window, false);
    }

    /** check image elements */
    if (core.plugins.image && context.element.wysiwyg.getElementsByTagName('IMG').length > 0) {
        _w.setTimeout(function () {
            core.callPlugin('image', function () {
                const setImagesInfo = this.plugins.image.setImagesInfo;
                const images = context.element.wysiwyg.getElementsByTagName('IMG');
                this.context.image._uploadFileLength = images.length;
    
                for (let i = 0, len = images.length, img; i < len; i++) {
                    img = images[i];
                    img.removeAttribute('data-index');
                    setImagesInfo.call(this, img, {
                        'name': img.getAttribute('data-file-name') || img.src.split('/').pop(),
                        'size': img.getAttribute('data-file-size') || 0
                    });
                }

                /** excute history function */
                this.history = _history(this, event._onChange_historyStack);
            }.bind(core));
        });
    } else {
        /** excute history function */
        core.history = _history(core, event._onChange_historyStack);
    }

    core._charCount(0, false);

    return userFunction;
}