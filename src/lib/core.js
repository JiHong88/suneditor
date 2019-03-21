/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

import util from './util';
import notice from '../plugins/modules/notice';

/**
 * @description SunEditor core function
 * @param context
 * @param plugins
 * @param lang
 * @returns {Object} UserFunction Object
 */
const core = function (context, plugins, lang) {
    const _d = document;
    const _w = window;
    /**
     * @description editor core object
     * should always bind this object when registering an event in the plug-in.
     */
    const editor = {
        /**
         * @description Elements and user options parameters of the suneditor
         */
        context: context,

        /**
         * @description loaded plugins
         */
        plugins: {},

        /**
         * @description Whether the plugin is initialized
         */
        initPlugins: {},

        /**
         * @description loaded language
         */
        lang: lang,

        /**
         * @description dialog element
         */
        dialogForm: null,

        /**
         * @description current subment name
         * @private
         */
        _submenuName: '',

        /**
         * @description submenu element
         */
        submenu: null,

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
         * @description binded controllersOff method
         * @private
         */
        _bindControllersOff: null,

        /**
         * @description An array of buttons whose class name is not "code-view-enabled"
         */
        codeViewDisabledButtons: context.element.toolbar.querySelectorAll('.sun-editor-id-toolbar button:not([class~="code-view-enabled"])'),

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
         * @description An user event function when image uploaded success or remove image
         * @private
         */
        _imageUpload: function (targetImgElement, index, isDelete, imageInfo) {
            if (typeof userFunction.onImageUpload === 'function') userFunction.onImageUpload(targetImgElement, index * 1, isDelete, imageInfo);
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
         * @property {Element} FORMAT - format button
         * @property {Element} FONT - font family button
         * @property {Element} SIZE - font size button
         * @property {Element} B - bold button
         * @property {Element} U - underline button
         * @property {Element} I - italic button
         * @property {Element} STRIKE - strike button
         * @property {Element} SUB - subscript button
         * @property {Element} SUP - superscript button
         */
        commandMap: {
            FORMAT: context.tool.format,
            FONT: context.tool.font,
            SIZE: context.tool.fontSize,
            B: context.tool.bold,
            U: context.tool.underline,
            I: context.tool.italic,
            STRIKE: context.tool.strike,
            SUB: context.tool.subscript,
            SUP: context.tool.superscript
        },

        /**
         * @description Variables used internally in editor operation
         * @property {Boolean} wysiwygActive - The wysiwyg frame or code view state
         * @property {Boolean} isFullScreen - State of full screen
         * @property {Number} innerHeight_fullScreen - InnerHeight in editor when in full screen
         * @property {Number} resizeClientY - Remember the vertical size of the editor before resizing the editor (Used when calculating during resize operation)
         * @property {Number} tabSize - Indented size when tab button clicked (4)
         * @property {Number} minResizingSize - Minimum size of editing area when resized (65)
         * @property {Array} currentNodes -  An array of the current cursor's node structure
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
            _sticky: false,
            _imagesInfo: [],
            _imageIndex: 0
        },

        /**
         * @description If the plugin is not added, add the plugin and call the 'add' function.
         * If the plugin is added call callBack function.
         * @param {String} pluginName - The name of the plugin to call
         * @param {function} callBackFunction - Function to be executed immediately after module call
         */
        callPlugin: function (pluginName, callBackFunction) {
            if (!this.plugins[pluginName]) {
                throw Error('[SUNEDITOR.core.callPlugin.fail] The called plugin does not exist or is in an invalid format. (pluginName:"' + pluginName + '")');
            } else if (!this.initPlugins[pluginName]){
                this.plugins[pluginName].add(this, this.plugins[pluginName].buttonElement);
                this.initPlugins[pluginName] = true;
            }
                
            callBackFunction();
        },

        /**
         * @description If the module is not added, add the module and call the 'add' function
         * @param {Array} moduleArray - module object's Array [dialog, resizing]
         */
        addModule: function (moduleArray) {
            let moduleName = '';
            for (let i = 0, len = moduleArray.length; i < len; i++) {
                moduleName = moduleArray[i].name;
                if (!this.plugins[moduleName]) {
                    this.plugins[moduleName] = util.copyObj(moduleArray[i]);
                    this.plugins[moduleName].add(this);
                }
            }
        },

        /**
         * @description Enabled submenu
         * @param {Element} element - Submenu element to call
         */
        submenuOn: function (element) {
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
            if (this.submenu) {
                this._submenuName = '';
                this.submenu.style.display = 'none';
                this.submenu = null;
                util.removeClass(this.submenuActiveButton, 'on');
                this.submenuActiveButton = null;
                _d.removeEventListener('mousedown', this._bindedSubmenuOff);
            }

            this.controllersOff();
        },

        /**
         * @description Disable controller in editor area (link button, image resize button)
         */
        controllersOn: function () {
            for (let i = 0; i < arguments.length; i++) {
                arguments[i].style.display = 'block';
                this.controllerArray[i] = arguments[i];
            }

            this._bindControllersOff = this.controllersOff.bind(this);
            _d.addEventListener('mousedown', this._bindControllersOff, false);
        },

        /**
         * @description Disable controller in editor area (link button, image resize button)
         */
        controllersOff: function () {
            const len = this.controllerArray.length;

            if (len > 0) {
                for (let i = 0; i < len; i++) {
                    this.controllerArray[i].style.display = 'none';
                }

                this.controllerArray = [];
                _d.removeEventListener('mousedown', this._bindControllersOff);
            }
        },

        /**
         * @description javascript execCommand
         * @param {String} command - javascript execCommand function property
         * @param {Boolean} showDefaultUI - javascript execCommand function property
         * @param {String} value - javascript execCommand function property
         */
        execCommand: function (command, showDefaultUI, value) {
            _d.execCommand(command, showDefaultUI, (command === 'formatBlock' ? '<' + value + '>' : value));
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

            event._findButtonEffectTag();
        },

        /**
         * @description Set current editor's range object
         * @param {Element} startCon - The startContainer property of the selection object.
         * @param {Number} startOff - The startOffset property of the selection object.
         * @param {Element} endCon - The endContainer property of the selection object.
         * @param {Element} endOff - The endOffset property of the selection object.
         */
        setRange: function (startCon, startOff, endCon, endOff) {
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
            if (!util.getParentElement(selection.focusNode, '.sun-editor-id-wysiwyg')) return;
            
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
            range.setStart(context.element.wysiwyg.firstChild, 0);
            range.setEnd(context.element.wysiwyg.firstChild, 0);
            return range;
        },

        /**
         * @description Returns a "formatElement"(P, DIV, H[1-6], LI) array from the currently selected range.
         * @returns {Array}
         */
        getSelectedFormatElements: function () {
            let range = this.getRange();

            if (util.isWysiwygDiv(range.startContainer)) {
                const children = context.element.wysiwyg.children;
                this.setRange(children[0], 0, children[children.length - 1], children[children.length - 1].textContent.length);
                range = this.getRange();
            }

            const startCon = range.startContainer;
            const endCon = range.endContainer;
            const commonCon = range.commonAncestorContainer;
            const rangeFormatElements = [];

            if (!util.isWysiwygDiv(commonCon) && !util.isRangeFormatElement(commonCon)) return [util.getFormatElement(commonCon)];

            // get line nodes
            const lineNodes = util.getListChildren(commonCon, function (current) {
                return util.isFormatElement(current);
            });

            if (startCon === endCon) return lineNodes[0];

            let startLine = util.getFormatElement(startCon);
            let endLine = util.getFormatElement(endCon);
            let startIdx = 0;
            let endIdx = 0;

            for (let i = 0, len = lineNodes.length; i < len; i++) {
                if (startLine === lineNodes[i]) {
                    startIdx = i;
                    continue;
                }
                if (endLine === lineNodes[i]) {
                    endIdx = i;
                    break;
                }
            }

            for (let i = startIdx; i <= endIdx; i++) {
                rangeFormatElements.push(lineNodes[i]);
            }

            return rangeFormatElements;
        },

        /**
         * @description Returns a "rangeFormatElement"(blockquote, TABLE, TR, TD, OL, UL, PRE) array from the currently selected range.
         * @returns {Array}
         */
        getSelectedRangeFormatElements: function () {
            let range = this.getRange();

            if (util.isWysiwygDiv(range.startContainer)) {
                const children = context.element.wysiwyg.children;
                this.setRange(children[0], 0, children[children.length - 1], children[children.length - 1].textContent.length);
                range = this.getRange();
            }

            const startCon = range.startContainer;
            const endCon = range.endContainer;
            const commonCon = range.commonAncestorContainer;
            const rangeFormatElements = [];

            if (util.isRangeFormatElement(commonCon)) return [commonCon];
            if (!util.isWysiwygDiv(commonCon)) {
                const el = util.getRangeFormatElement(commonCon);
                return el ? [el] : [];
            }

            // get range Elements
            const rangeElements = util.getListChildren(commonCon, function (current) {
                return util.isRangeFormatElement(current);
            });

            if (startCon === endCon) return rangeElements[0];

            let startLine = util.getRangeFormatElement(startCon);
            let endLine = util.getRangeFormatElement(endCon);
            let startIdx = 0;
            let endIdx = 0;

            for (let i = 0, len = rangeElements.length; i < len; i++) {
                if (startLine === rangeElements[i]) {
                    startIdx = i;
                    continue;
                }
                if (endLine === rangeElements[i]) {
                    endIdx = i;
                    break;
                }
            }

            for (let i = startIdx; i <= endIdx; i++) {
                if (rangeElements[i]) rangeFormatElements.push(rangeElements[i]);
            }

            return rangeFormatElements;
        },

        /**
         * @description Determine if this offset is the edge offset of container
         * @param {Object} container - The container property of the selection object.
         * @param {Number} offset - The offset property of the selection object.
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
         * @param {Element} element - Insert as siblings of that element
         * @param {String|null} formatNodeName - Node name to be inserted
         * @returns {Element}
         */
        appendFormatTag: function (element, formatNodeName) {
            const formatEl = util.getRangeFormatElement(element) || util.getFormatElement(element);
            const currentFormatEl = util.getFormatElement(this.getSelectionNode());
            const oFormatName = formatNodeName ? formatNodeName : util.isFormatElement(currentFormatEl) ? currentFormatEl.nodeName : 'P';
            const oFormat = util.createElement(oFormatName);
            oFormat.innerHTML = util.zeroWidthSpace;

            if (util.isCell(formatEl)) formatEl.insertBefore(oFormat, element.nextElementSibling);
            else formatEl.parentNode.insertBefore(oFormat, formatEl.nextElementSibling);

            return oFormat;
        },

        /**
         * @description Delete selected node and insert argument value node
         * @param {Element} oNode - Node to be inserted
         * @param {(Element|null)} rightNode - If the node exists, it is inserted after the node
         */
        insertNode: function (oNode, rightNode) {
            const range = this.getRange();
            let parentNode = null;

            if (!rightNode) {
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
                        rightNode = commonCon.splitText(endOff);
                    }
                    else {
                        if (parentNode.lastChild !== null && util.isBreak(parentNode.lastChild)) {
                            parentNode.removeChild(parentNode.lastChild);
                        }
                        rightNode = null;
                    }
                }
                /** Select range nodes */
                else {
                    const isSameContainer = startCon === endCon;

                    if (isSameContainer) {
                        if (this.isEdgePoint(endCon, endOff)) rightNode = endCon.nextSibling;
                        else rightNode = endCon.splitText(endOff);

                        let removeNode = startCon;
                        if (!this.isEdgePoint(startCon, startOff)) removeNode = startCon.splitText(startOff);

                        parentNode.removeChild(removeNode);
                    }
                    else {
                        this.removeNode();
                        parentNode = commonCon;
                        rightNode = endCon;

                        while (rightNode.parentNode !== commonCon) {
                            rightNode = rightNode.parentNode;
                        }
                    }
                }
            }
            else {
                parentNode = rightNode.parentNode;
                rightNode = rightNode.nextSibling;
            }

            try {
                parentNode.insertBefore(oNode, rightNode);
            } catch (e) {
                parentNode.appendChild(oNode);
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
            }
        },

        /**
         * @description appended all selected format Element to the argument element and insert
         * @param {Element} wrapTag - Element of wrap the arguments
         */
        wrapToTags: function (wrapTag) {
            const range = this.getRange();
            const rangeLines = this.getSelectedFormatElements();

            if (!rangeLines) {
                const inner = util.createElement(util.isCell(this.getSelectionNode()) ? 'DIV' : 'P');
                inner.innerHTML = util.zeroWidthSpace;
                wrapTag.appendChild(inner);
                this.getSelectionNode().appendChild(wrapTag);
                return;
            }

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

            let listParent = null;
            let line = null;
            let prevNodeName = '';
            
            for (let i = 0, len = rangeLines.length; i < len; i++) {
                line = rangeLines[i];

                if (/^LI$/i.test(line.nodeName)) {
                    if (listParent === null || !/^LI$/i.test(prevNodeName)) {
                        listParent = util.createElement(line.parentNode.nodeName);
                    }

                    listParent.appendChild(line);
                    if (i === len - 1 || !/^LI$/i.test(rangeLines[i + 1].nodeName)) wrapTag.appendChild(listParent);
                }
                else {
                    wrapTag.appendChild(line);
                }

                prevNodeName = line.nodeName;
            }

            pElement.insertBefore(wrapTag, beforeTag);
            if (!range.collapsed && (util.isRangeFormatElement(range.startContainer) || util.isRangeFormatElement(range.endContainer))) util.removeEmptyNode(pElement);
        },

        /**
         * @description Add the node received as an argument value to the selected area.
         * 1. When there is the same css value node in the selection area, the tag is stripped.
         * 2. If there is another css value other thanCss attribute values received as arguments on the node, removed only Css attribute values received as arguments
         * 3. If you pass an element whose node name is "removenode" as an argument value, it performs a type removal operation. ex) nodeChange(document.createElement('removenode'))
         * @param {Element} appendNode - The dom that will wrap the selected text area
         * @param {Array} checkCSSPropertyArray - The css attribute name Array to check (['font-size'], ['font-family', 'background-color', 'border']...])
         */
        nodeChange: function (appendNode, checkCSSPropertyArray) {
            const range = this.getRange();
            const isRemoveFormat = /removenode/i.test(appendNode.nodeName);
            let tempCon, tempOffset, tempChild, tempArray;

            /* checked same style property */
            if (range.startContainer === range.endContainer) {
                let sNode = range.startContainer;
                if (isRemoveFormat) {
                    if (util.getFormatElement(sNode) === sNode.parentNode) return;
                } else {
                    let checkCnt = 0;

                    for (let i = 0; i < checkCSSPropertyArray.length; i++) {
                        while(!util.isFormatElement(sNode) && !util.isWysiwygDiv(sNode)) {
                            if (sNode.nodeType === 1 && sNode.style[checkCSSPropertyArray[i]] === appendNode.style[checkCSSPropertyArray[i]]) {
                                checkCnt++;
                            }
                            sNode = sNode.parentNode;
                        }
                    }
    
                    if (checkCnt >= checkCSSPropertyArray.length) return;
                }
            }

            /* find text node */
            // startContainer
            tempCon = util.isWysiwygDiv(range.startContainer) ? context.element.wysiwyg.firstChild : range.startContainer;
            tempOffset = range.startOffset;

            if (tempCon.nodeType === 1 && tempCon.childNodes.length > 0) {
                while (tempCon && !util.isBreak(tempCon) && tempCon.nodeType === 1) {
                    tempArray = [];
                    tempChild = tempCon.childNodes;
                    for (let i = 0, len = tempChild.length; i < len; i++) {
                        tempArray.push(tempChild[i]);
                    }
                    tempCon = tempArray[tempOffset] || tempCon.nextElementSibling || tempCon.nextSibling;
                    tempOffset = 0;
                }

                if (util.isBreak(tempCon)) {
                    const emptyText = util.createTextNode(util.zeroWidthSpace);
                    tempCon.parentNode.insertBefore(emptyText, tempCon);
                    tempCon = emptyText;
                }
            }

            const startCon = tempCon;
            const startOff = tempOffset;

            // endContainer
            tempCon = util.isWysiwygDiv(range.endContainer) ? context.element.wysiwyg.lastChild : range.endContainer;
            tempOffset = range.endOffset;

            if (tempCon.nodeType === 1 && tempCon.childNodes.length > 0) {
                while (tempCon && !util.isBreak(tempCon) && tempCon.nodeType === 1) {
                    tempArray = [];
                    tempChild = tempCon.childNodes;
                    for (let i = 0, len = tempChild.length; i < len; i++) {
                        tempArray.push(tempChild[i]);
                    }
                    tempCon = tempArray[tempOffset - 1] || !/FIGURE/i.test(tempArray[0].nodeName) ? tempArray[0] : (tempCon.previousElementSibling || tempCon.previousSibling || startCon);
                }
                tempOffset = tempCon.textContent.length;

                if (util.isBreak(tempCon)) {
                    const emptyText = util.createTextNode(util.zeroWidthSpace);
                    tempCon.parentNode.insertBefore(emptyText, tempCon);
                    tempCon = emptyText;
                    tempOffset = 0;
                }
            }

            const endCon = tempCon;
            const endOff = tempOffset;
            const commonCon = range.commonAncestorContainer;
            const newNodeName = appendNode.nodeName;
            this.setRange(startCon, startOff, endCon, endOff);

            let start = {}, end = {};
            let newNode, regExp;

            if (checkCSSPropertyArray) {
                regExp = '(?:;|^|\\s)(?:' + checkCSSPropertyArray[0];
                for (let i = 1; i < checkCSSPropertyArray.length; i++) {
                    regExp += '|' + checkCSSPropertyArray[i];
                }
                regExp += ')\\s*:[^;]*\\s*(?:;|$)';
                regExp = new RegExp(regExp, 'ig');
            }

            /** tag check function*/
            const checkCss = function (vNode) {
                if (isRemoveFormat || vNode.nodeType === 3 || util.isBreak(vNode)) return true;

                let style = '';
                if (regExp && vNode.style.cssText.length > 0) {
                    style = vNode.style.cssText.replace(regExp, '').trim();
                }

                if (style.length > 0 || vNode.nodeName !== newNodeName) {
                    if (vNode.style.cssText.length > 0) vNode.style.cssText = style;
                    return true;
                }

                return false;
            };

            /** one line */
            if (!util.isWysiwygDiv(commonCon) && !util.isRangeFormatElement(commonCon)) {
                newNode = appendNode.cloneNode(false);
                const newRange = this._nodeChange_oneLine(util.getFormatElement(commonCon), newNode, checkCss, startCon, startOff, endCon, endOff, isRemoveFormat, range.collapsed);

                start.container = newRange.startContainer;
                start.offset = newRange.startOffset;
                end.container = newRange.endContainer;
                end.offset = newRange.endOffset;
            }
            /** multi line */
            else {
                // get line nodes
                const lineNodes = this.getSelectedFormatElements();
                const endLength = lineNodes.length - 1;

                // startCon
                newNode = appendNode.cloneNode(false);
                start = this._nodeChange_startLine(lineNodes[0], newNode, checkCss, startCon, startOff, isRemoveFormat);

                // mid
                for (let i = 1; i < endLength; i++) {
                    newNode = appendNode.cloneNode(false);
                    this._nodeChange_middleLine(lineNodes[i], newNode, checkCss, isRemoveFormat);
                }

                // endCon
                if (endLength > 0) {
                    newNode = appendNode.cloneNode(false);
                    end = this._nodeChange_endLine(lineNodes[endLength], newNode, checkCss, endCon, endOff, isRemoveFormat);
                } else {
                    end = start;
                }
            }

            // set range
            this.setRange(start.container, start.offset, end.container, end.offset);
        },

        /**
         * @description wraps text nodes of line selected text.
         * @param {Element} element - The node of the line that contains the selected text node.
         * @param {Element} newInnerNode - The dom that will wrap the selected text area
         * @param {function} validation - Check if the node should be stripped.
         * @param {Element} startCon - The startContainer property of the selection object.
         * @param {Number} startOff - The startOffset property of the selection object.
         * @param {Element} endCon - The endContainer property of the selection object.
         * @param {Number} endOff - The endOffset property of the selection object.
         * @param {Boolean} isRemoveFormat - Is the remove format command ?
         * @param {Boolean} collapsed - range.collapsed
         * @returns {{startContainer: *, startOffset: *, endContainer: *, endOffset: *}}
         * @private
         */
        _nodeChange_oneLine: function (element, newInnerNode, validation, startCon, startOff, endCon, endOff, isRemoveFormat, collapsed) {
            const el = element;
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
                const regExp = new RegExp('(?:;|^|\\s)(?:' + cssText + 'null)\\s*:[^;]*\\s*(?:;|$)', 'ig');
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
                    let coverNode = node;
                    let cloneNode;

                    // startContainer
                    if (!startPass && child === startContainer) {
                        const prevNode = util.createTextNode(startContainer.nodeType === 1 ? '' : startContainer.substringData(0, startOffset));
                        const textNode = util.createTextNode(startContainer.nodeType === 1 ? '' : startContainer.substringData(startOffset, (endOffset > startOffset ? endOffset - startOffset : endOffset === startOffset ? 0 : startContainer.data.length - startOffset)));

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
                            recursionFunc(child, child);
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

            if (isRemoveFormat) {
                startContainer = util.createTextNode(collapsed ? util.zeroWidthSpace : newInnerNode.textContent);
                pNode.insertBefore(startContainer, newInnerNode);
                pNode.removeChild(newInnerNode);
                if (collapsed) startOffset = 1;
            } else if (collapsed) {
                startContainer = endContainer = newInnerNode;
                startOffset = 1;
                endOffset = 1;
            }

            util.removeEmptyNode(pNode);
            element.parentNode.insertBefore(pNode, element);
            util.removeItem(element);

            return {
                startContainer: startContainer,
                startOffset: startOffset,
                endContainer: isRemoveFormat || !endContainer.textContent ? startContainer : endContainer,
                endOffset: isRemoveFormat || !endContainer.textContent ? startContainer.textContent.length : endOffset
            };
        },

        /**
         * @description wraps mid lines selected text.
         * @param {Element} element - The node of the line that contains the selected text node.
         * @param {Element} newInnerNode - The dom that will wrap the selected text area
         * @param {function} validation - Check if the node should be stripped.
         * @param {Boolean} isRemoveFormat - Is the remove format command ?
         * @private
         */
        _nodeChange_middleLine: function (element, newInnerNode, validation, isRemoveFormat) {
            if (isRemoveFormat) {
                newInnerNode = util.createTextNode(element.textContent ? element.textContent : util.zeroWidthSpace);
            } else {
                (function recursionFunc(current, node) {
                    const childNodes = current.childNodes;
    
                    for (let i = 0, len = childNodes.length; i < len; i++) {
                        let child = childNodes[i];
                        let coverNode = node;
                        if (validation(child)) {
                            let cloneNode = child.cloneNode(false);
                            node.appendChild(cloneNode);
                            if (child.nodeType === 1 && !util.isBreak(child)) coverNode = cloneNode;
                        }
                        recursionFunc(child, coverNode);
                    }
                })(element, newInnerNode);
            }

            element.innerHTML = '';
            element.appendChild(newInnerNode);
        },

        /**
         * @description wraps first line selected text.
         * @param {Element} element - The node of the line that contains the selected text node.
         * @param {Element} newInnerNode - The dom that will wrap the selected text area
         * @param {function} validation - Check if the node should be stripped.
         * @param {Element} startCon - The startContainer property of the selection object.
         * @param {Number} startOff - The startOffset property of the selection object.
         * @param {Boolean} isRemoveFormat - Is the remove format command ?
         * @returns {{container: *, offset: *}}
         * @private
         */
        _nodeChange_startLine: function (element, newInnerNode, validation, startCon, startOff, isRemoveFormat) {
            const el = element;
            const pNode = element.cloneNode(false);

            let container = startCon;
            let offset = startOff;
            let passNode = false;
            let pCurrent, newNode, appendNode;

            (function recursionFunc(current, node) {
                const childNodes = current.childNodes;
                for (let i = 0, len = childNodes.length; i < len; i++) {
                    const child = childNodes[i];
                    let coverNode = node;

                    if (passNode && !util.isBreak(child)) {
                        if (child.nodeType === 1) {
                            recursionFunc(child, child);
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

            if (isRemoveFormat) {
                container = util.createTextNode(newInnerNode.textContent);
                pNode.insertBefore(container, newInnerNode);
                pNode.removeChild(newInnerNode);
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
         * @param {Element} element - The node of the line that contains the selected text node.
         * @param {Element} newInnerNode - The dom that will wrap the selected text area
         * @param {function} validation - Check if the node should be stripped.
         * @param {Element} endCon - The endContainer property of the selection object.
         * @param {Number} endOff - The endOffset property of the selection object.
         * @param {Boolean} isRemoveFormat - Is the remove format command ?
         * @returns {{container: *, offset: *}}
         * @private
         */
        _nodeChange_endLine: function (element, newInnerNode, validation, endCon, endOff, isRemoveFormat) {
            const el = element;
            const pNode = element.cloneNode(false);

            let container = endCon;
            let offset = endOff;
            let passNode = false;
            let pCurrent, newNode, appendNode;

            (function recursionFunc(current, node) {
                const childNodes = current.childNodes;
                for (let i = childNodes.length -1; 0 <= i; i--) {
                    const child = childNodes[i];
                    let coverNode = node;

                    if (passNode && !util.isBreak(child)) {
                        if (child.nodeType === 1) {
                            recursionFunc(child, child);
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

            if (isRemoveFormat) {
                container = util.createTextNode(newInnerNode.textContent);
                offset = container.textContent.length;
                pNode.insertBefore(container, newInnerNode);
                pNode.removeChild(newInnerNode);
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
         * (redo, undo, bold, underline, italic, strikethrough, subscript, superscript, removeFormat, indent, outdent, fullscreen, showBlocks, codeview, preview, print)
         * @param {Element} target - The element of command button
         * @param {String} command - Property of command button (data-value)
         */
        commandHandler: function (target, command) {
            switch (command) {
                case 'codeView':
                    this.controllersOff();
                    this.toggleCodeView();
                    util.toggleClass(target, 'on');
                    break;
                case 'fullScreen':
                    this.controllersOff();
                    this.toggleFullScreen(target);
                    util.toggleClass(target, 'on');
                    break;
                case 'indent':
                case 'outdent':
                    this.indent(command);
                    break;
                case 'redo':
                case 'undo':
                    this.execCommand(command, false, null);
                    break;
                case 'removeFormat':
                    this.removeFormat();
                    break;
                case 'preview':
                case 'print':
                    this.openWindowContents(command);
                    break;
                case 'showBlocks':
                    this.toggleDisplayBlocks();
                    util.toggleClass(target, 'on');
                    break;
                case 'subscript':
                    if (util.hasClass(context.tool.superscript, 'on')) {
                        this.execCommand('superscript', false, null);
                        util.removeClass(context.tool.superscript, 'on');
                    }
                    this.execCommand(command, false, null);
                    util.toggleClass(target, 'on');
                    break;
                case 'superscript':
                    if (util.hasClass(context.tool.subscript, 'on')) {
                        this.execCommand('subscript', false, null);
                        util.removeClass(context.tool.subscript, 'on');
                    }
                    this.execCommand(command, false, null);
                    util.toggleClass(target, 'on');
                    break;
                case 'save':
                    if (typeof context.option.callBackSave === 'function') {
                        context.option.callBackSave(this.getContents());
                    } else {
                        throw Error('[SUNEDITOR.core.commandHandler.fail] Please register call back function in creation option. (callBackSave : Function)');
                    }
                    break;
                default : // 'bold', 'underline', 'italic', 'strike'
                    this.execCommand(command, false, target.getAttribute('data-value'));
                    util.toggleClass(target, 'on');
            }

            this.focus();
        },

        /**
         * @description Remove format of the currently selected range (IE, Edge not working)
         */
        removeFormat: function () {
            this.nodeChange(util.createElement('REMOVENODE'));
        },

        /**
         * @description This method implements indentation to selected range.
         * Setted "margin-left" to "25px" in the top "P" tag of the parameter node.
         * @param command {String} - Separator ("indent" or "outdent")
         */
        indent: function (command) {
            const rangeLines = this.getSelectedFormatElements();
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
        },

        /**
         * @description Add or remove the class name of "body" so that the code block is visible
         */
        toggleDisplayBlocks: function () {
            util.toggleClass(context.element.wysiwyg, 'sun-editor-show-block');
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

            if (!wysiwygActive) {
                const code_html = context.element.code.value.trim();
                context.element.wysiwyg.innerHTML = code_html.length > 0 ? util.convertContentsForEditor(code_html) : '<p>' + util.zeroWidthSpace + '</p>';
                context.element.wysiwyg.scrollTop = 0;
                context.element.code.style.display = 'none';
                context.element.wysiwyg.style.display = 'block';
                if (context.option.height === 'auto') context.element.code.style.height = '0px';
                this._variable.wysiwygActive = true;
                this.focus();
            }
            else {
                context.element.code.value = util.convertHTMLForCodeView(context.element.wysiwyg.innerHTML.trim());
                context.element.wysiwyg.style.display = 'none';
                context.element.code.style.display = 'block';
                if (context.option.height === 'auto') context.element.code.style.height = context.element.code.scrollHeight > 0 ? (context.element.code.scrollHeight + 'px') : 'auto';
                this._variable.wysiwygActive = false;
                context.element.code.focus();
            }
        },

        /**
         * @description Changes to full screen or default screen
         * @param {Element} element - full screen button
         */
        toggleFullScreen: function (element) {
            if (!this._variable.isFullScreen) {
                this._variable.isFullScreen = true;

                context.element.topArea.style.position = 'fixed';
                context.element.topArea.style.top = '0';
                context.element.topArea.style.left = '0';
                context.element.topArea.style.width = '100%';
                context.element.topArea.style.height = '100%';
                context.element.topArea.style.zIndex = '2147483647';

                this._variable._bodyOverflow = _d.body.style.overflow;
                _d.body.style.overflow = 'hidden';

                this._variable._editorAreaOriginCssText = context.element.editorArea.style.cssText;
                this._variable._wysiwygOriginCssText = context.element.wysiwyg.style.cssText;
                this._variable._codeOriginCssText = context.element.code.style.cssText;

                context.element.editorArea.style.cssText = context.element.toolbar.style.cssText = context.element.wysiwyg.style.cssText = context.element.code.style.cssText = '';
                context.element.toolbar.style.width = context.element.wysiwyg.style.height = context.element.code.style.height = '100%';
                context.element.toolbar.style.position = 'relative';

                this._variable.innerHeight_fullScreen = (_w.innerHeight - context.element.toolbar.offsetHeight);
                context.element.editorArea.style.height = this._variable.innerHeight_fullScreen + 'px';

                util.removeClass(element.firstElementChild, 'icon-expansion');
                util.addClass(element.firstElementChild, 'icon-reduction');
            }
            else {
                this._variable.isFullScreen = false;

                context.element.code.style.cssText = this._variable._codeOriginCssText;
                context.element.wysiwyg.style.cssText = this._variable._wysiwygOriginCssText;
                context.element.toolbar.style.cssText = '';
                context.element.editorArea.style.cssText = this._variable._editorAreaOriginCssText;
                context.element.topArea.style.cssText = this._variable._originCssText;
                _d.body.style.overflow = this._variable._bodyOverflow;

                if (context.option.stickyToolbar > -1) {
                    util.removeClass(context.element.toolbar, 'sun-editor-sticky');
                    event.onScroll_window();
                }

                util.removeClass(element.firstElementChild, 'icon-reduction');
                util.addClass(element.firstElementChild, 'icon-expansion');
            }
        },

        /**
         * @description Open the preview window or open the print window
         * @param {String} mode - 'preview' or 'print'
         */
        openWindowContents: function (mode) {
            const isPrint = mode === 'print';
            const windowObject = _w.open('', '_blank');
            windowObject.mimeType = 'text/html';
            windowObject.document.write('' +
                '<!doctype html><html>' +
                '<head>' +
                '<meta charset="utf-8" />' +
                '<meta name="viewport" content="width=device-width, initial-scale=1">' +
                '<title>' + (isPrint ? lang.toolbar.print : lang.toolbar.preview) + '</title>' +
                '<link rel="stylesheet" type="text/css" href="' + util.getIncludePath(['suneditor-contents', 'suneditor'], 'css') + '">' +
                '</head>' +
                '<body>' +
                '<div class="sun-editor-editable" style="width:' + context.element.wysiwyg.offsetWidth + 'px; margin:auto;">' +
                this.getContents() + '</div>' +
                (isPrint ? '<script>_w.print();</script>' : '') + '</body>' +
                '</html>');
        },

        /**
         * @description Gets the current contents
         * @returns {Object}
         */
        getContents: function () {
            let contents = '';

            if (context.element.wysiwyg.innerText.trim().length === 0) return contents;

            if (editor._variable.wysiwygActive) {
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
                figcaptions[i].outerHTML = figcaptions[i].outerHTML.replace(/(?!^<figcaption\s+)(contenteditable="([a-z]+|\s*)")\s*(?=[^>]*>)/i, '');
            }

            return renderHTML.innerHTML;
        }
    };

    /**
     * @description event function
     */
    const event = {
        _shortcutKeyCode: {
            66: ['bold', 'B'],
            83: ['strikethrough', 'STRIKE'],
            85: ['underline', 'U'],
            73: ['italic', 'I'],
            89: ['redo'],
            90: ['undo'],
            219: ['outdent'],
            221: ['indent']
        },

        _directionKeyKeyCode: new RegExp('^(?:8|13|32|46|33|34|35|36|37|38|39|40|98|100|102|104)$'),

        _changeButtonClassTagCheck: new RegExp('^(?:B|U|I|STRIKE|SUB|SUP)$'),

        _findButtonEffectTag: function () {
            const commandMap = editor.commandMap;
            const classOnCheck = this._changeButtonClassTagCheck;
            const commandMapNodes = [];
            const currentNodes = [];

            let findFormat = true, findFont = true, findSize = true, findA = true;
            let findB = true, findI = true, findU = true, findS = true;
            let cssText = '', nodeName = '';

            for (let selectionParent = editor.getSelectionNode(); !util.isWysiwygDiv(selectionParent); selectionParent = selectionParent.parentNode) {
                if (!selectionParent) break;
                if (selectionParent.nodeType !== 1) continue;
                nodeName = selectionParent.nodeName.toUpperCase();
                currentNodes.push(nodeName);

                /** Format */
                if (findFormat && util.isFormatElement(selectionParent)) {
                    commandMapNodes.push('FORMAT');
                    util.changeTxt(commandMap.FORMAT, nodeName);
                    findFormat = false;
                    continue;
                }

                /** Font */
                if (findFont && (selectionParent.style.fontFamily.length > 0 || (selectionParent.face && selectionParent.face.length > 0))) {
                    commandMapNodes.push('FONT');
                    const selectFont = (selectionParent.style.fontFamily || selectionParent.face || lang.toolbar.font).replace(/["']/g,'');
                    util.changeTxt(commandMap.FONT, selectFont);
                    findFont = false;
                }

                /** A */
                if (findA && /^A$/.test(nodeName) && selectionParent.getAttribute('data-image-link') === null) {
                    if (!context.link || editor.controllerArray[0] !== context.link.linkBtn) {
                        editor.callPlugin('link', function () {
                            editor.plugins.link.call_controller_linkButton.call(editor, selectionParent);
                        });
                    }
                    findA = false;
                } else if (findA && context.link && editor.controllerArray[0] === context.link.linkBtn) {
                    editor.controllersOff();
                }

                /** SPAN */
                if (findSize && /^SPAN$/.test(nodeName)) {
                    /** font size */
                    if (selectionParent.style.fontSize.length > 0) {
                        commandMapNodes.push('SIZE');
                        util.changeTxt(commandMap.SIZE, selectionParent.style.fontSize);
                        findSize = false;
                    }
                }

                /** command map */
                cssText = selectionParent.style.cssText;
                if (findB && /font\-weight\s*:\s*(?:\d+|bold|bolder)(?:;|\s|)/.test(cssText)) {
                    commandMapNodes.push('B');
                    findB = false;
                }
                if (findI && /font\-style\s*:\s*(?:italic|oblique)(?:;|\s)/.test(cssText)) {
                    commandMapNodes.push('I');
                    findI = false;
                }
                if (findU && /text\-decoration(?:\-line)?\s*:\s*underline(?:;|\s|)/.test(cssText)) {
                    commandMapNodes.push('U');
                    findU = false;
                }
                if (findS && /text\-decoration(?:\-line)?\s*:\s*line-through(?:;|\s|)/.test(cssText)) {
                    commandMapNodes.push('STRIKE');
                    findS = false;
                }

                commandMapNodes.push((/^STRONG$/.test(nodeName) ? 'B' : /^EM$/.test(nodeName) ? 'I' : nodeName));
            }

            /** A Tag edit controller off */
            if (findA) editor.controllersOff();

            /** toggle class on */
            for (let i = 0; i < commandMapNodes.length; i++) {
                nodeName = commandMapNodes[i];
                if (classOnCheck.test(nodeName)) {
                    util.addClass(commandMap[nodeName], 'on');
                }
            }

            /** remove class, display text */
            for (let key in commandMap) {
                if (commandMapNodes.indexOf(key) > -1) continue;
                if (/^FONT/i.test(key)) {
                    util.changeTxt(commandMap[key], lang.toolbar.font);
                }
                else if (/^SIZE$/i.test(key)) {
                    util.changeTxt(commandMap[key], lang.toolbar.fontSize);
                }
                else {
                    util.removeClass(commandMap[key], 'on');
                }
            }

            /** save current nodes */
            editor._variable.currentNodes = currentNodes.reverse();

            /**  Displays the current node structure to resizingBar */
            if (context.option.showPathLabel) context.element.navigation.textContent = editor._variable.currentNodes.join(' > ');
        },

        _cancelCaptionEdit: function () {
            this.setAttribute('contenteditable', false);
            this.removeEventListener('blur', event._cancelCaptionEdit);
        },

        onMouseDown_toolbar: function (e) {
            let target = e.target;

            if (util.getParentElement(target, '.sun-editor-submenu')) {
                e.stopPropagation();
            } else {
                e.preventDefault();
                let command = target.getAttribute('data-command');
                let className = target.className;
    
                while (!command && !/editor_tool/.test(className) && !/sun-editor-id-toolbar/.test(className)) {
                    target = target.parentNode;
                    command = target.getAttribute('data-command');
                    className = target.className;
                }
    
                if (command === editor._submenuName) {
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

            while (!command && !/editor_tool/.test(className) && !/sun-editor-id-toolbar/.test(className)) {
                target = target.parentNode;
                command = target.getAttribute('data-command');
                display = target.getAttribute('data-display');
                className = target.className;
            }

            if (!command && !display) return;
            if (target.disabled) return;
            
            editor.focus();
            
            /** Dialog, Submenu */
            if (display) {
                if (/submenu/.test(display) && (target.nextElementSibling === null || target !== editor.submenuActiveButton)) {
                    editor.callPlugin(command, function () {
                        editor.submenuOn(target);
                    });
                    return;
                }
                else if (/dialog/.test(display)) {
                    editor.callPlugin(command, function () {
                        editor.plugins.dialog.open.call(editor, command, false);
                    });
                    return;
                }

                editor.submenuOff();
                return;
            }

            /** default command */
            if (command) {
                editor.commandHandler(target, command);
            }
        },

        onMouseUp_wysiwyg: function () {
            editor._editorRange();
            
            if (editor._isBalloon) {
                const range = editor.getRange();
                if (range.collapsed) event._hideToolbar();
                else event._showToolbarBalloon(range);
            }
        },

        onClick_wysiwyg: function (e) {
            e.stopPropagation();
            const targetElement = e.target;

            if (/^IMG$/i.test(targetElement.nodeName)) {
                e.preventDefault();
                editor.callPlugin('image', function () {
                    const size = editor.plugins.resizing.call_controller_resize.call(editor, targetElement, 'image');
                    editor.plugins.image.onModifyMode.call(editor, targetElement, size);
                    
                    if (!util.getParentElement(targetElement, '.sun-editor-id-image-container')) {
                        editor.plugins.image.openModify.call(editor, true);
                        editor.plugins.image.update_image.call(editor);
                        editor.controllersOff();
                    }
                });

                return;
            }

            if (/sun-editor-id-iframe-inner-resizing-cover/i.test(targetElement.className)) {
                e.preventDefault();
                editor.callPlugin('video', function () {
                    const iframe = util.getChildElement(targetElement.parentNode, 'iframe');
                    const size = editor.plugins.resizing.call_controller_resize.call(editor, iframe, 'video');
                    editor.plugins.video.onModifyMode.call(editor, iframe, size);
                });

                return;
            }

            event._findButtonEffectTag();

            const figcaption = util.getParentElement(targetElement, 'FIGCAPTION');
            if (figcaption && figcaption.getAttribute('contenteditable') !== 'ture') {
                e.preventDefault();
                figcaption.setAttribute('contenteditable', true);
                figcaption.focus();

                if (editor._isInline && !editor._inlineToolbarAttr.isShow) {
                    event._showToolbarInline();

                    const hideToolbar = function () {
                        event._hideToolbar();
                        _d.removeEventListener('click', hideToolbar);
                    };

                    _d.addEventListener('click', hideToolbar);
                }
            } else {
                const td = util.getParentElement(targetElement, util.isCell);
                if (td) {
                    if (editor.controllerArray.length === 0) {
                        editor.callPlugin('table', editor.plugins.table.call_controller_tableEdit.bind(editor, td));
                    }
                }
            }

            if (userFunction.onClick) userFunction.onClick(e);
        },

        _showToolbarBalloon: function (rangeObj) {
            const range = rangeObj || editor.getRange();
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
            let t = (isDirTop ? rects.top - toolbarHeight - 11 : rects.bottom + 11) - context.element.topArea.offsetTop + (_w.scrollY || _d.documentElement.scrollTop);

            const overRight = l + toolbarWidth - context.element.topArea.offsetWidth;
            
            toolbar.style.left = (l < 0 ? padding : overRight < 0 ? l : l - overRight - padding) + 'px';
            toolbar.style.top = (t) + 'px';

            if (isDirTop) {
                util.removeClass(context.element._arrow, 'arrow-up');
                util.addClass(context.element._arrow, 'arrow-down');
                context.element._arrow.style.top = (toolbarHeight) + 'px';
            } else {
                util.removeClass(context.element._arrow, 'arrow-down');
                util.addClass(context.element._arrow, 'arrow-up');
                context.element._arrow.style.top = '-11px';
            }

            const arrow_width = context.element._arrow.offsetWidth;
            const arrow_left = (toolbarWidth / 2 + (l < 0 ? l - arrow_width : overRight < 0 ? 0 : overRight + arrow_width));
            const arrow_point_width = arrow_width / 2;
            context.element._arrow.style.left = (arrow_left < arrow_point_width ? arrow_point_width : arrow_left + arrow_point_width >= toolbarWidth ? arrow_left - arrow_point_width : arrow_left) + 'px';
        },

        _showToolbarInline: function () {
            const toolbar = context.element.toolbar;
            toolbar.style.display = 'block';
            editor._inlineToolbarAttr.width = toolbar.style.width = context.option.toolbarWidth;
            editor._inlineToolbarAttr.top = toolbar.style.top = (-1 - toolbar.offsetHeight) + 'px';
            event.onScroll_window();
            editor._inlineToolbarAttr.isShow = true;
        },

        _hideToolbar: function () {
            context.element.toolbar.style.display = 'none';
            editor._inlineToolbarAttr.isShow = false;
        },

        onKeyDown_wysiwyg: function (e) {
            const keyCode = e.keyCode;
            const shift = e.shiftKey;
            const ctrl = e.ctrlKey || e.metaKey;
            const alt = e.altKey;

            if (editor._isBalloon) {
                event._hideToolbar();
            }

            function shortcutCommand(keyCode) {
                const key = event._shortcutKeyCode[keyCode];
                if (!key) return false;

                editor.commandHandler(util.getFormatElement(editor.getSelectionNode()), key[0]);
                util.toggleClass(editor.commandMap[key[1]], 'on');

                return true;
            }

            /** Shortcuts */
            if (ctrl && !/^(?:16|17|18)$/.test(keyCode)) {
                if (!(!shift && keyCode === 83) && shortcutCommand(keyCode)) {
                    e.preventDefault();
                    return;
                }
            }

            /** default key action */
            const selectionNode = editor.getSelectionNode();
            switch (keyCode) {
                case 8: /**backspace key*/
                    if (util.isFormatElement(selectionNode) && util.isWysiwygDiv(selectionNode.parentNode) && selectionNode.previousSibling === null) {
                        e.preventDefault();
                        e.stopPropagation();
                        selectionNode.innerHTML = util.zeroWidthSpace;
                        return false;
                    }
                    
                    break;
                case 9:
                    /**tab key*/
                    e.preventDefault();
                    if (ctrl || alt) break;

                    editor.controllersOff();

                    let currentNode = selectionNode || editor.getSelectionNode();
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

                        editor.setRange(moveCell, 0, moveCell, 0);

                        break;
                    }

                    /** format Tag */
                    const lines = editor.getSelectedFormatElements();

                    if (!shift) {
                        const tabText = util.createTextNode(new Array(editor._variable.tabSize + 1).join('\u00A0'));
                        if (lines.length === 1) {
                            editor.insertNode(tabText);
                            editor.setRange(tabText, editor._variable.tabSize, tabText, editor._variable.tabSize);
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

                    break;
            }

            if (userFunction.onKeyDown) userFunction.onKeyDown(e);
        },

        onKeyUp_wysiwyg: function (e) {
            editor._editorRange();
            editor.controllersOff();
            const selectionNode = editor.getSelectionNode();

            if (editor._isBalloon && !editor.getRange().collapsed) {
                event._showToolbarBalloon();
                return;
            }

            /** when format tag deleted */
            if (e.keyCode === 8 && util.isWysiwygDiv(selectionNode) && context.element.wysiwyg.textContent.length === 0) {
                e.preventDefault();
                e.stopPropagation();

                const oFormatTag = util.createElement(util.isFormatElement(editor._variable.currentNodes[0]) ? editor._variable.currentNodes[0] : 'P');
                oFormatTag.innerHTML = util.zeroWidthSpace;

                selectionNode.appendChild(oFormatTag);
                editor.setRange(oFormatTag, 0, oFormatTag, 0);
                return;
            }

            if ((util.isWysiwygDiv(selectionNode.parentElement) || util.isRangeFormatElement(selectionNode.parentElement)) && selectionNode.nodeType === 3) {
                editor.execCommand('formatBlock', false, util.isWysiwygDiv(selectionNode.parentElement) ? 'P' : 'DIV');
                event._findButtonEffectTag();
                return;
            }

            if (event._directionKeyKeyCode.test(e.keyCode)) {
                event._findButtonEffectTag();
            }

            if (userFunction.onKeyUp) userFunction.onKeyUp(e);
        },

        onScroll_wysiwyg: function (e) {
            editor.controllersOff();
            if (userFunction.onScroll) userFunction.onScroll(e);
        },

        onDrop_wysiwyg: function (e) {
            const files = e.dataTransfer.files;

            if (files.length > 0) {
                e.stopPropagation();
                e.preventDefault();
                
                editor.focus();
    
                editor.callPlugin('image', function () {
                    context.image.imgInputFile.files = files;
                    editor.plugins.image.onRender_imgInput.call(editor);
                    context.image.imgInputFile.files = null;
                });
            }

            if (userFunction.onDrop) userFunction.onDrop(e);
        },

        onMouseDown_resizingBar: function (e) {
            e.stopPropagation();

            editor._variable.resizeClientY = e.clientY;
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
            const resizeInterval = context.element.editorArea.offsetHeight + (e.clientY - editor._variable.resizeClientY);
            context.element.wysiwyg.style.height = context.element.code.style.height = (resizeInterval < editor._variable.minResizingSize ? editor._variable.minResizingSize : resizeInterval) + 'px';
            editor._variable.resizeClientY = e.clientY;
        },

        onResize_window: function () {
            if (context.element.toolbar.offsetWidth === 0) return;

            if (editor._variable.isFullScreen) {
                editor._variable.innerHeight_fullScreen += (_w.innerHeight - context.element.toolbar.offsetHeight) - editor._variable.innerHeight_fullScreen;
                context.element.editorArea.style.height = editor._variable.innerHeight_fullScreen + 'px';
            }
            else if (editor._variable._sticky) {
                context.element.toolbar.style.width = (context.element.topArea.offsetWidth - 2) + 'px';
                event.onScroll_window();
            }

            editor.controllersOff();
        },

        onScroll_window: function () {
            if (editor._variable.isFullScreen || context.element.toolbar.offsetWidth === 0) return;

            const element = context.element;
            const editorHeight = element.editorArea.offsetHeight;
            const editorTop = element.topArea.offsetTop - (editor._isInline ? element.toolbar.offsetHeight : 0);
            const y = (this.scrollY || _d.documentElement.scrollTop) + context.option.stickyToolbar;
            
            if (y < editorTop) {
                event._offStickyToolbar(element);
            }
            else if (y + editor._variable.minResizingSize >= editorHeight + editorTop) {
                if (!editor._variable._sticky) event._onStickyToolbar(element);
                element.toolbar.style.top = (editorHeight + editorTop + context.option.stickyToolbar -y - editor._variable.minResizingSize) + 'px';
            }
            else if (y >= editorTop) {
                event._onStickyToolbar(element);
            }
        },

        _onStickyToolbar: function (element) {
            if (!editor._isInline) {
                element._stickyDummy.style.height = element.toolbar.offsetHeight + 'px';
                element._stickyDummy.style.display = 'block';
            }

            element.toolbar.style.top = context.option.stickyToolbar + 'px';
            element.toolbar.style.width = editor._isInline ? editor._inlineToolbarAttr.width : element.toolbar.offsetWidth + 'px';
            util.addClass(element.toolbar, 'sun-editor-sticky');
            editor._variable._sticky = true;
        },

        _offStickyToolbar: function (element) {
            element._stickyDummy.style.display = 'none';
            element.toolbar.style.top = editor._isInline ? editor._inlineToolbarAttr.top : '';
            element.toolbar.style.width = editor._isInline ? editor._inlineToolbarAttr.width : '';
            element.editorArea.style.marginTop = '';
            util.removeClass(element.toolbar, 'sun-editor-sticky');
            editor._variable._sticky = false;
        },

        _codeViewAutoScroll: function () {
            context.element.code.style.height = context.element.code.scrollHeight + 'px';
        },

        onPaste_wysiwyg: function (e) {
            if (!e.clipboardData.getData) return true;

            const cleanData = util.cleanHTML(e.clipboardData.getData('text/html'));
            
            if (cleanData) {
                editor.execCommand('insertHTML', false, cleanData);
                e.stopPropagation();
                e.preventDefault();
            }
        }
    };

    /** add event listeners */
    /** toolbar event */
    context.element.toolbar.addEventListener('mousedown', event.onMouseDown_toolbar, false);
    context.element.toolbar.addEventListener('click', event.onClick_toolbar, false);
    /** editor area */
    context.element.relative.addEventListener('click', editor.focus.bind(editor), false);
    context.element.wysiwyg.addEventListener('mouseup', event.onMouseUp_wysiwyg, false);
    context.element.wysiwyg.addEventListener('click', event.onClick_wysiwyg, false);
    context.element.wysiwyg.addEventListener('scroll', event.onScroll_wysiwyg, false);
    context.element.wysiwyg.addEventListener('keydown', event.onKeyDown_wysiwyg, false);
    context.element.wysiwyg.addEventListener('keyup', event.onKeyUp_wysiwyg, false);
    context.element.wysiwyg.addEventListener('drop', event.onDrop_wysiwyg, false);
    context.element.wysiwyg.addEventListener('paste', event.onPaste_wysiwyg, false);
    
    /** code view area auto line */
    if (context.option.height === 'auto') context.element.code.addEventListener('keyup', event._codeViewAutoScroll, false);

    /** resizingBar */
    if (context.element.resizingBar) {
        if (/\d+/.test(context.option.height)) {
            context.element.resizingBar.addEventListener('mousedown', event.onMouseDown_resizingBar, false);
        } else {
            util.addClass(context.element.resizingBar, 'none-resize');
        }
    }

    /** inline editor */
    if (editor._isInline) {
        context.element.wysiwyg.addEventListener('focus', event._showToolbarInline, false);
    }

    if (editor._isInline || editor._isBalloon) {
        context.element.wysiwyg.addEventListener('blur', event._hideToolbar, false);
    }
    
    /** window event */
    _w.addEventListener('resize', event.onResize_window, false);
    if (context.option.stickyToolbar > -1) _w.addEventListener('scroll', event.onScroll_window, false);

    /** add plugin to plugins object */
    if (plugins) {
        Object.keys(plugins).map(function(key) {
            let plugin = plugins[key];
            editor.plugins[plugin.name] = util.copyObj(plugin);
        });
    }

    /** User function */
    const userFunction = {
        /**
         * @description Event functions
         * @param {Object} event - Event Object
         */
        onScroll: null,
        onClick: null,
        onKeyDown: null,
        onKeyUp: null,
        onDrop: null,

        /**
         * @description Called when the image is uploaded or the uploaded image is deleted
         * @param {Element} targetImgElement - Current img element
         * @param {Number} index - Uploaded index
         * @param {Boolean} isDelete - Whether or not it was called after the delete operation
         * @param {Object} imageInfo - Image info object
         */
        onImageUpload: null,

        /**
         * @description Called when the image is upload failed
         * @param {String} errorMessage - Error message
         * @param {Object} result - Result info Object
         */
        onImageUploadError: null,

        /**
         * @description Open a notice area
         * @param {String} message - Notice message
         */
        noticeOpen: function (message) {
            editor.addModule([notice]);
            notice.open.call(editor, message);
        },

        /**
         * @description Close a notice area
         */
        noticeClose: function () {
            editor.addModule([notice]);
            notice.close.call(editor);
        },

        /**
         * @description Copying the contents of the editor to the original textarea
         */
        save: function () {
            context.element.originElement.value = editor.getContents();
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
            return editor.getContents();
        },

        /**
         * @description Gets uploaded images informations
         * @returns {Array}
         */
        getImagesInfo: function () {
            return editor._variable._imagesInfo;
        },

        /**
         * @description Inserts an HTML element or HTML string or plain string at the current cursor position
         * @param {Element|String} html - HTML Element or HTML string or plain string
         */
        insertHTML: function (html) {
            if (!html.nodeType || html.nodeType !== 1) {
                const template = util.createElement('template');
                template.innerHTML = html;
                html = template.firstChild || template.content.firstChild;
            }

            editor.insertNode(html);
            editor.focus();
        },

        /**
         * @description Change the contents of the suneditor
         * @param {String} contents - Contents to Input
         */
        setContents: function (contents) {
            if (editor._variable.wysiwygActive) {
                context.element.wysiwyg.innerHTML = util.convertContentsForEditor(contents);
            } else {
                context.element.code.value = contents;
            }
        },

        /**
         * @description Add contents to the suneditor
         * @param {String} contents - Contents to Input
         */
        appendContents: function (contents) {
            if (editor._variable.wysiwygActive) {
                context.element.wysiwyg.innerHTML += util.convertContentsForEditor(contents);
            } else {
                context.element.code.value += contents;
            }
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

            this.onScroll = null;
            this.onClick = null;
            this.onKeyDown = null;
            this.onKeyUp = null;
            this.onDrop = null;
            this.save = null;
            this.onImageUpload = null;
            this.onImageUploadError = null;
            this.noticeOpen = null;
            this.noticeClose = null;
            this.getContext = null;
            this.getContents = null;
            this.getImagesInfo = null;
            this.insertHTML = null;
            this.setContents = null;
            this.appendContents = null;
            this.disabled = null;
            this.enabled = null;
            this.show = null;
            this.hide = null;
            this.destroy = null;

            context = null;
            plugins = null;
            lang = null;
        }
    };

    return userFunction;
};

export default core;