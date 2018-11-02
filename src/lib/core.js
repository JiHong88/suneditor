/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

/**
 * @description SunEditor core closure
 * @param context
 * @param util
 * @param plugins
 * @param lang
 * @returns {{save: save, getContext: getContext, getContent: getContent, setContent: setContent, appendContent: appendContent, disabled: disabled, enabled: enabled, show: show, hide: hide, destroy: destroy}}
 */
const core = function (context, util, plugins, lang) {
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
         * @description util function
         */
        util: util,

        /**
         * @description loaded language
         */
        lang: lang,

        /**
         * @description dialog element
         */
        dialogForm: null,

        /**
         * @description submenu element
         */
        submenu: null,

        /**
         * @description active button element in submenu
         */
        submenuActiveButton: null,

        /**
         * @description The elements array to be processed unvisible when the controllersOff function is executed (resizing, link modified button, table controller)
         */
        controllerArray: [],

        /**
         * @description The functions array to be executed when the controllersOff function is executed ex) init function of table plugin
         */
        controllerFunction: [],

        /**
         * @description An array of buttons whose class name is not "code-view-enabled"
         */
        codeViewDisabledButtons: context.element.toolbar.querySelectorAll('.sun-editor-id-toolbar button:not([class~="code-view-enabled"])'),

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
         * @property {(Element|null)} selectionNode - Contains selection node
         * @property {(Object|null)} range - The current range object
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
            selectionNode: null,
            range: null,
            wysiwygActive: true,
            isFullScreen: false,
            innerHeight_fullScreen: 0,
            resizeClientY: 0,
            tabSize: 4,
            minResizingSize: 65,
            currentNodes: [],
            _originCssText: context.element.topArea.style.cssText,
            _bodyOverflow: '',
            _editorAreaOriginCssText: '',
            _wysiwygOriginCssText: '',
            _codeOriginCssText: '',
            _sticky: false
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
                    this.plugins[moduleName] = this.util.copyObj(moduleArray[i]);
                    this.plugins[moduleName].add(this);
                }
            }
        },

        /**
         * @description Enabled submenu
         * @param {Element} element - Submenu element to call
         */
        submenuOn: function (element) {
            const submenuName = element.getAttribute('data-command');
            if (this.plugins[submenuName].on) this.plugins[submenuName].on.call(this);

            this.submenu = element.nextElementSibling;
            this.submenu.style.display = 'block';
            util.addClass(element, 'on');
            this.submenuActiveButton = element;

            const overLeft = this.context.element.toolbar.offsetWidth - (element.parentElement.offsetLeft + this.submenu.offsetWidth);
            if (overLeft < 0) this.submenu.style.left = overLeft + 'px';
            else this.submenu.style.left = '1px';
        },

        /**
         * @description Disable submenu
         */
        submenuOff: function () {
            if (this.submenu) {
                this.submenu.style.display = 'none';
                this.submenu = null;
                util.removeClass(this.submenuActiveButton, 'on');
                this.submenuActiveButton = null;
            }

            if (context.image && context.image._onCaption === true) {
                this.plugins.image.toggle_caption_contenteditable.call(editor, false);
            }

            this.controllersOff();
        },

        /**
         * @description Disable controller in editor area (link button, image resize button)
         */
        controllersOff: function () {
            const len = this.controllerArray.length;
            const fLen = this.controllerFunction.length;

            if (len > 0) {
                for (let i = 0; i < len; i++) {
                    this.controllerArray[i].style.display = 'none';
                }
                this.controllerArray = [];
            }

            if (fLen > 0) {
                for (let i = 0; i < fLen; i++) {
                    this.controllerFunction[i]();
                }
                this.controllerArray = [];
            }
        },

        /**
         * @description javascript execCommand
         * @param {String} command - javascript execCommand function property
         * @param {Boolean} showDefaultUI - javascript execCommand function property
         * @param {String} value - javascript execCommand function property
         */
        execCommand: function (command, showDefaultUI, value) {
            document.execCommand(command, showDefaultUI, (command === 'formatBlock' ? '<' + value + '>' : value));
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

            this._setEditorRange();
            event._findButtonEffectTag();
        },

        /**
         * @description Saving the range object and the currently selected node of editor
         * @private
         */
        _setEditorRange: function () {
            const selection = window.getSelection();
            let range = null;

            if (selection.rangeCount > 0) {
                range = selection.getRangeAt(0);
            }
            else {
                range = this._createDefaultRange();
            }

            this._variable.range = range;

            if (range.collapsed) {
                this.setSelectionNode(range.commonAncestorContainer);
            } else {
                this.setSelectionNode(selection.extentNode || selection.anchorNode);
            }
        },

        /**
         * @description Return the range object of editor's first child node
         * @returns {Object}
         * @private
         */
        _createDefaultRange: function () {
            const range = document.createRange();
            range.setStart(context.element.wysiwyg.firstChild, 0);
            range.setEnd(context.element.wysiwyg.firstChild, 0);
            return range;
        },

        /**
         * @description Set current editor's range object
         * @param {Element} startCon - The startContainer property of the selection object.
         * @param {Number} startOff - The startOffset property of the selection object.
         * @param {Element} endCon - The endContainer property of the selection object.
         * @param {Element} endOff - The endOffset property of the selection object.
         */
        setRange: function (startCon, startOff, endCon, endOff) {
            const range = document.createRange();
            range.setStart(startCon, startOff);
            range.setEnd(endCon, endOff);

            const selection = window.getSelection();

            if (selection.rangeCount > 0) {
                selection.removeAllRanges();
            }

            this._variable.range = range;
            selection.addRange(range);
        },

        /**
         * @description Get current editor's range object
         * @returns {Object}
         */
        getRange: function () {
            return this._variable.range || this._createDefaultRange();
        },

        /**
         * @description Set the selected node. (Used by getSelectionNode function)
         * @param {Node} node - node object
         */
        setSelectionNode: function (node) {
            this._variable.selectionNode = node;
        },

        /**
         * @description Get current select node
         * @returns {Node}
         */
        getSelectionNode: function () {
            if (this._variable.selectionNode) {
                return this._variable.selectionNode;
            }

            return context.element.wysiwyg.firstChild;
        },

        /**
         * @description Returns a "formatElement"(P, DIV, H[1-6], LI) array from the currently selected range.
         * @returns {Array}
         */
        getSelectedFormatElements: function () {
            const range = this.getRange();
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
            const range = this.getRange();
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
         * @description Append P tag to current line next
         * @param {Element} element - Insert as siblings of that element
         * @returns {Element}
         */
        appendP: function (element) {
            const formatEl = util.getRangeFormatElement(element) || util.getFormatElement(element);
            const oP = document.createElement('P');
            oP.innerHTML = '&#65279';

            if (/^TD$/i.test(formatEl.nodeName)) formatEl.insertBefore(oP, element.nextElementSibling);
            else formatEl.parentNode.insertBefore(oP, formatEl.nextElementSibling);

            return oP;
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
                        if (parentNode.lastChild !== null && /^BR$/i.test(parentNode.lastChild.nodeName)) {
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

            // try {
            //     this.setRange(oNode, 0, oNode, oNode.textContent.length);
            // } catch (e) {}
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
                        beforeNode = document.createTextNode(startCon.textContent);
                    } else {
                        beforeNode = document.createTextNode(startCon.substringData(0, startOff));
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
                        afterNode = document.createTextNode(endCon.textContent);
                    } else {
                        afterNode = document.createTextNode(endCon.substringData(endOff, (endCon.length - endOff)));
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
            let last  = rangeLines[rangeLines.length - 1];
            let standTag, beforeTag, pElement;

            if (util.isRangeFormatElement(last) || util.isFormatElement(last)) {
                standTag = last;
            } else {
                standTag = util.getRangeFormatElement(last) || util.getFormatElement(last);
            }
            
            if (/^TD$/i.test(last.nodeName)) last = util.getFormatElement(last);
            
            beforeTag = standTag.nextSibling;
            pElement = standTag.parentNode;

            let listParent = null;
            let line = null;
            let prevNodeName = '';
            
            for (let i = 0, len = rangeLines.length; i < len; i++) {
                line = rangeLines[i];

                if (/^LI$/i.test(line.nodeName)) {
                    if (listParent === null || !/^LI$/i.test(prevNodeName)) {
                        listParent = document.createElement(line.parentNode.nodeName);
                    }

                    listParent.appendChild(line);
                    if (i === len - 1 || !/^LI$/i.test(rangeLines[i + 1].nodeName)) wrapTag.appendChild(listParent);
                } else {
                    wrapTag.appendChild(line);
                }

                prevNodeName = line.nodeName;
            }

            pElement.insertBefore(wrapTag, beforeTag);
            if (!range.collapsed && (util.isRangeFormatElement(range.startContainer) || util.isRangeFormatElement(range.endContainer))) util.removeEmptyNode(pElement);
        },

        /**
         * @description Copies the node of the argument value and append all selected nodes and insert
         * 1. When there is the same css value node in the selection area, the tag is stripped.
         * 2. If there is another css value other thanCss attribute values received as arguments on the node, removed only Css attribute values received as arguments
         * @param {Element} appendNode - The dom that will wrap the selected text area
         * @param {Array} checkCSSPropertyArray - The css attribute name Array to check (['font-size'], ['font-family']...])
         */
        wrapRangeToTag: function (appendNode, checkCSSPropertyArray) {
            const range = this.getRange();
            const startCon = range.startContainer;
            const startOff = range.startOffset;
            const endCon = range.endContainer;
            const endOff = range.endOffset;
            const commonCon = range.commonAncestorContainer;
            const newNodeName = appendNode.nodeName;

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
                if (vNode.nodeType === 3) return true;

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

            /** one node */
            if (startCon === endCon) {
                newNode = appendNode.cloneNode(false);
                if (!newNode) return;

                /** No range node selected */
                if (range.collapsed) {
                    newNode.innerHTML = '&#65279';
                    if (util.isFormatElement(startCon)) {
                        startCon.appendChild(newNode);
                    } else {
                        const parentNode = startCon.nodeType === 3 ? startCon.parentNode : startCon;
                        const rightNode = commonCon.nodeType === 3 ? commonCon.splitText(endOff) : null;
                        parentNode.insertBefore(newNode, rightNode);
                    }

                    start.container = newNode;
                    start.offset = 1;
                    end.container = newNode;
                    end.offset = 1;
                }
                /** Select range node */
                else {
                    if (startCon.nodeType === 1) {
                        newNode.innerHTML = checkCss(startCon) ? startCon.outerHTML : startCon.innerHTML;
                        startCon.parentNode.appendChild(newNode);
                        util.removeItem(startCon);
                    } else {
                        const beforeNode = document.createTextNode(startCon.substringData(0, startOff));
                        const afterNode = document.createTextNode(startCon.substringData(endOff, (startCon.length - endOff)));
                        const startConParent = startCon.parentNode;

                        newNode.innerText = startCon.substringData(startOff, (endOff - startOff));

                        if (beforeNode.data.length === 0 && afterNode.data.length === 0 && !checkCss(startConParent) && !util.isFormatElement(startConParent)) {
                            startConParent.parentNode.insertBefore(newNode, startConParent.nextSibling);
                            util.removeItem(startConParent);
                        } else {
                            startConParent.insertBefore(newNode, startCon.nextSibling);

                            if (beforeNode.data.length > 0) {
                                startCon.data = beforeNode.data;
                            } else {
                                startCon.data = startCon.substringData(0, startOff);
                            }
    
                            if (afterNode.data.length > 0) {
                                startConParent.insertBefore(afterNode, newNode.nextSibling);
                            }
                        }
                    }

                    start.container = newNode;
                    start.offset = 0;
                    end.container = newNode;
                    end.offset = 1;
                }
            }
            /** multiple nodes */
            else {
                /** one line */
                if (!util.isWysiwygDiv(commonCon) && !util.isRangeFormatElement(commonCon)) {
                    newNode = appendNode.cloneNode(false);
                    const newRange = this._wrapLineNodesOneLine(util.getFormatElement(commonCon), newNode, checkCss, startCon, startOff, endCon, endOff);

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
                    start = this._wrapLineNodesStart(lineNodes[0], newNode, checkCss, startCon, startOff);

                    // mid
                    for (let i = 1; i < endLength; i++) {
                        newNode = appendNode.cloneNode(false);
                        this._wrapLineNodes(lineNodes[i], newNode, checkCss);
                    }

                    // endCon
                    if (endLength > 0) {
                        newNode = appendNode.cloneNode(false);
                        end = this._wrapLineNodesEnd(lineNodes[endLength], newNode, checkCss, endCon, endOff);
                    } else {
                        end = start;
                    }
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
         * @returns {{startContainer: *, startOffset: *, endContainer: *, endOffset: *}}
         * @private
         */
        _wrapLineNodesOneLine: function (element, newInnerNode, validation, startCon, startOff, endCon, endOff) {
            const el = element;
            const pNode = element.cloneNode(false);
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

                    if ((child.textContent.length > 0 && child.textContent !== '&#65279') || /^BR$/i.test(child.nodeName)) {
                        let cloneNode;

                        // startContainer
                        if (child === startContainer) {
                            const prevNode = document.createTextNode(startContainer.substringData(0, startOffset));
                            const textNode = document.createTextNode(startContainer.substringData(startOffset, (startContainer.length - startOffset)));

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
                            continue;
                        }
                        // endContainer
                        else if (child === endContainer) {
                            const afterNode = document.createTextNode(endContainer.substringData(endOffset, (endContainer.length - endOffset)));
                            const textNode = document.createTextNode(endContainer.substringData(0, endOffset));

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

                            newNode = node;
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

                            if (newNode !== textNode) newNode.appendChild(endContainer);
                            continue;
                        }
                        // other
                        if (startPass) {
                            if (child.nodeType === 1) {
                                recursionFunc(child, child);
                                continue;
                            }
    
                            newNode = child;
                            pCurrent = [];
                            cssText = '';
                            while (newNode.parentNode !== null && newNode !== el && newNode !== newInnerNode) {
                                if (newNode.nodeType === 1 && (endPass || validation(newNode)) && checkCss(newNode)) {
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
                        if (child.nodeType === 1) coverNode = cloneNode;
                    }

                    recursionFunc(child, coverNode);
                }
            })(element, pNode);

            util.removeEmptyNode(pNode);
            element.parentNode.insertBefore(pNode, element);
            util.removeItem(element);

            return {
                startContainer: startContainer,
                startOffset: startOffset,
                endContainer: endContainer,
                endOffset: endOffset
            };
        },

        /**
         * @description wraps mid lines selected text.
         * @param {Element} element - The node of the line that contains the selected text node.
         * @param {Element} newInnerNode - The dom that will wrap the selected text area
         * @param {function} validation - Check if the node should be stripped.
         * @private
         */
        _wrapLineNodes: function (element, newInnerNode, validation) {
            (function recursionFunc(current, node) {
                const childNodes = current.childNodes;

                for (let i = 0, len = childNodes.length; i < len; i++) {
                    let child = childNodes[i];
                    let coverNode = node;
                    if (validation(child) && ((child.textContent.length > 0 && child.textContent !== '&#65279') || /^BR$/i.test(child.nodeName))) {
                        let cloneNode = child.cloneNode(false);
                        node.appendChild(cloneNode);
                        if (child.nodeType === 1) coverNode = cloneNode;
                    }
                    recursionFunc(child, coverNode);
                }
            })(element, newInnerNode);

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
         * @returns {{container: *, offset: *}}
         * @private
         */
        _wrapLineNodesStart: function (element, newInnerNode, validation, startCon, startOff) {
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

                    if (passNode && !/^BR$/i.test(child.nodeName)) {
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
                        const prevNode = document.createTextNode(container.substringData(0, offset));
                        const textNode = document.createTextNode(container.substringData(offset, (container.length - offset)));

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

                        pNode.appendChild(newInnerNode);
                        container = textNode;
                        offset = 0;
                        passNode = true;

                        node.appendChild(container);
                        continue;
                    }

                    if ((!passNode || validation(child)) && ((child.textContent.length > 0 && child.textContent !== '&#65279') || /^BR$/i.test(child.nodeName))) {
                        const cloneNode = child.cloneNode(false);
                        node.appendChild(cloneNode);
                        if (child.nodeType === 1) coverNode = cloneNode;
                    }

                    recursionFunc(child, coverNode);
                }
            })(element, pNode);

            element.parentNode.insertBefore(pNode, element);
            util.removeItem(element);

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
         * @returns {{container: *, offset: *}}
         * @private
         */
        _wrapLineNodesEnd: function (element, newInnerNode, validation, endCon, endOff) {
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

                    if (passNode && !/^BR$/i.test(child.nodeName)) {
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
                        const afterNode = document.createTextNode(container.substringData(offset, (container.length - offset)));
                        const textNode = document.createTextNode(container.substringData(0, offset));

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

                        pNode.insertBefore(newInnerNode, pNode.firstChild);
                        container = textNode;
                        offset = textNode.data.length;
                        passNode = true;

                        node.insertBefore(container, node.firstChild);
                        continue;
                    }

                    if ((!passNode || validation(child)) && ((child.textContent.length > 0 && child.textContent !== '&#65279') || /^BR$/i.test(child.nodeName))) {
                        const cloneNode = child.cloneNode(false);
                        node.insertBefore(cloneNode, node.firstChild);
                        if (child.nodeType === 1) coverNode = cloneNode;
                    }

                    recursionFunc(child, coverNode);
                }
            })(element, pNode);

            element.parentNode.insertBefore(pNode, element);
            util.removeItem(element);

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
                    this.toggleCodeView();
                    util.toggleClass(target, 'on');
                    break;
                case 'fullScreen':
                    this.toggleFullScreen(target);
                    util.toggleClass(target, 'on');
                    break;
                case 'indent':
                case 'outdent':
                    this.indent(command);
                    break;
                case 'redo':
                case 'undo':
                case 'removeFormat':
                    this.execCommand(command, false, null);
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
                default :
                    this.execCommand(command, false, target.getAttribute('data-value'));
                    util.toggleClass(target, 'on');
            }
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
                const code_html = context.element.code.textContent.trim();
                context.element.wysiwyg.innerHTML = code_html.length > 0 ? util.convertContentsForEditor(code_html) : '<p>&#65279</p>';
                context.element.wysiwyg.scrollTop = 0;
                context.element.code.style.display = 'none';
                context.element.wysiwyg.style.display = 'block';
                this._variable.wysiwygActive = true;
                this.focus();
            }
            else {
                context.element.code.textContent = context.element.wysiwyg.innerHTML.trim();//.replace(/<\/P>(?=[^\n])/gi, '<\/p>\n');
                context.element.wysiwyg.style.display = 'none';
                context.element.code.style.display = 'block';
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

                this._variable._bodyOverflow = document.body.style.overflow;
                document.body.style.overflow = 'hidden';

                this._variable._editorAreaOriginCssText = context.element.editorArea.style.cssText;
                this._variable._wysiwygOriginCssText = context.element.wysiwyg.style.cssText;
                this._variable._codeOriginCssText = context.element.code.style.cssText;

                context.element.editorArea.style.cssText = context.element.toolbar.style.cssText = context.element.wysiwyg.style.cssText = context.element.code.style.cssText = '';
                context.element.toolbar.style.width = context.element.wysiwyg.style.height = context.element.code.style.height = '100%';
                context.element.toolbar.style.position = 'relative';

                this._variable.innerHeight_fullScreen = (window.innerHeight - context.element.toolbar.offsetHeight);
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
                document.body.style.overflow = this._variable._bodyOverflow;

                if (context.user.stickyToolbar > -1) {
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
            const windowObject = window.open('', '_blank');
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
                context.element.wysiwyg.innerHTML + '</div>' +
                (isPrint ? '<script>window.print();</script>' : '') + '</body>' +
                '</html>');
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
                        util.changeTxt(commandMap.SIZE, selectionParent.style.fontSize.match(/\d+/)[0]);
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
            if (context.user.showPathLabel) context.element.navigation.textContent = editor._variable.currentNodes.join(' > ');
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
            
            /** Dialog, Submenu */
            if (display) {
                if (/submenu/.test(display) && (target.nextElementSibling === null || target !== editor.submenuActiveButton)) {
                    editor.submenuOff();
                    editor.callPlugin(command, function () {
                        editor.submenuOn(target);
                    });
                    return;
                }
                else if (/dialog/.test(display)) {
                    editor.callPlugin(command, function () {
                        editor.plugins.dialog.openDialog.call(editor, command, target.getAttribute('data-option'), false);
                    });
                }

                editor.submenuOff();
                return;
            }

            editor.submenuOff();

            /** default command */
            if (command) {
                editor.focus();
                editor.commandHandler(target, command);
            }
        },

        onClick_wysiwyg: function (e) {
            e.stopPropagation();

            const targetElement = e.target;
            editor.submenuOff();

            editor._setEditorRange();
            event._findButtonEffectTag();

            if (/^IMG$/i.test(targetElement.nodeName)) {
                e.preventDefault();
                editor.callPlugin('image', function () {
                    const size = editor.plugins.resizing.call_controller_resize.call(editor, targetElement, 'image');
                    editor.plugins.image.onModifyMode.call(editor, targetElement, size);
                });
                return;
            }

            if (/^TD$/i.test(targetElement.nodeName) || /^TD$/i.test(targetElement.parentNode.nodeName)) {
                editor.controllersOff();

                let td = targetElement;
                while (!/^TD$/i.test(td.nodeName)) {
                    td = td.parentNode;
                }

                editor.callPlugin('table', editor.plugins.table.call_controller_tableEdit.bind(editor, td));
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

            const figcaption = util.getParentElement(targetElement, 'FIGCAPTION');
            if (figcaption) {
                e.preventDefault();
                editor.callPlugin('image', function () {
                    editor.plugins.image.toggle_caption_contenteditable.call(editor, true, figcaption);
                });
                return;
            }
        },

        onKeyDown_wysiwyg: function (e) {
            const keyCode = e.keyCode;
            const shift = e.shiftKey;
            const ctrl = e.ctrlKey || e.metaKey;
            const alt = e.altKey;
            e.stopPropagation();

            function shortcutCommand(keyCode) {
                const key = event._shortcutKeyCode[keyCode];
                if (!key) return false;

                editor.commandHandler(util.getFormatElement(editor.getSelectionNode()), key[0]);
                util.toggleClass(editor.commandMap[key[1]], 'on');

                return true;
            }

            /** Shortcuts */
            if (ctrl && !/^(?:16|17|18)$/.test(keyCode)) {
                if (!(shift && keyCode !== 83) && shortcutCommand(keyCode)) {
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
                        selectionNode.innerHTML = '&#65279';
                        return false;
                    }
                    
                    break;
                case 9:
                    /**tab key*/
                    e.preventDefault();
                    if (ctrl || alt) break;

                    editor.controllersOff();

                    let currentNode = selectionNode || editor.getSelectionNode();
                    while (!/^TD$/i.test(currentNode.nodeName) && !util.isWysiwygDiv(currentNode)) {
                        currentNode = currentNode.parentNode;
                    }

                    if (currentNode && /^TD$/i.test(currentNode.nodeName)) {
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
                        const tabText = document.createTextNode(new Array(editor._variable.tabSize + 1).join('\u00A0'));
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
        },

        onKeyUp_wysiwyg: function (e) {
            editor._setEditorRange();
            editor.controllersOff();
            const selectionNode = editor.getSelectionNode();

            /** when format tag deleted */
            if (e.keyCode === 8 && util.isWysiwygDiv(selectionNode) && context.element.wysiwyg.textContent.length === 0) {
                e.preventDefault();
                e.stopPropagation();

                const oFormatTag = document.createElement(util.isFormatElement(editor._variable.currentNodes[0]) ? editor._variable.currentNodes[0] : 'P');
                oFormatTag.innerHTML = '&#65279';

                selectionNode.appendChild(oFormatTag);
                editor.setSelectionNode(oFormatTag);
                editor.setRange(oFormatTag, 0, oFormatTag, 0);
                return;
            }

            if ((util.isWysiwygDiv(selectionNode.parentElement) || util.isRangeFormatElement(selectionNode.parentElement)) && selectionNode.nodeType === 3) {
                editor.execCommand('formatBlock', false, util.isFormatElement(editor._variable.currentNodes[0]) ? editor._variable.currentNodes[0] : 'P');
                return;
            }

            if (event._directionKeyKeyCode.test(e.keyCode)) {
                event._findButtonEffectTag();
            }
        },

        onScroll_wysiwyg: function () {
            editor.controllersOff();
        },

        onDrop_wysiwyg: function (e) {
            const files = e.dataTransfer.files;

            if (files.length === 0) return true;

            e.stopPropagation();
            e.preventDefault();
            
            editor.focus();

            editor.callPlugin('image', function () {
                context.image.imgInputFile.files = files;
                editor.plugins.image.onRender_imgInput.call(editor);
                context.image.imgInputFile.files = null;
            });
        },

        onMouseDown_resizingBar: function (e) {
            e.stopPropagation();

            editor._variable.resizeClientY = e.clientY;
            context.element.resizeBackground.style.display = 'block';

            function closureFunc() {
                context.element.resizeBackground.style.display = 'none';
                document.removeEventListener('mousemove', event._resize_editor);
                document.removeEventListener('mouseup', closureFunc);
            }

            document.addEventListener('mousemove', event._resize_editor);
            document.addEventListener('mouseup', closureFunc);
        },

        _resize_editor: function (e) {
            const resizeInterval = context.element.editorArea.offsetHeight + (e.clientY - editor._variable.resizeClientY);
            context.element.wysiwyg.style.height = context.element.code.style.height = (resizeInterval < editor._variable.minResizingSize ? editor._variable.minResizingSize : resizeInterval) + 'px';
            editor._variable.resizeClientY = e.clientY;
        },

        onResize_window: function () {
            if (editor._variable.isFullScreen) {
                editor._variable.innerHeight_fullScreen += (window.innerHeight - context.element.toolbar.offsetHeight) - editor._variable.innerHeight_fullScreen;
                context.element.editorArea.style.height = editor._variable.innerHeight_fullScreen + 'px';
            }
            else if (editor._variable._sticky) {
                context.element.toolbar.style.width = (context.element.topArea.offsetWidth - 2) + 'px';
                event.onScroll_window();
            }

            editor.controllersOff();
            editor.submenuOff();
        },

        onScroll_window: function () {
            if (editor._variable.isFullScreen) return;

            const element = context.element;
            const editorHeight = element.editorArea.offsetHeight;
            const editorTop = element.topArea.offsetTop;
            const y = (this.scrollY || document.documentElement.scrollTop) + context.user.stickyToolbar;
            
            if (y < editorTop) {
                event._offStickyToolbar(element);
            }
            else if (y + editor._variable.minResizingSize >= editorHeight + editorTop) {
                if (!editor._variable._sticky) event._onStickyToolbar(element);
                element.toolbar.style.top = (editorHeight + editorTop + context.user.stickyToolbar -y - editor._variable.minResizingSize) + 'px';
            }
            else if (y >= editorTop) {
                event._onStickyToolbar(element);
            }
        },

        _onStickyToolbar: function (element) {
            element._stickyDummy.style.height = element.toolbar.offsetHeight + 'px';
            element._stickyDummy.style.display = 'block';
            element.toolbar.style.width = element.toolbar.offsetWidth + 'px';
            element.toolbar.style.top = context.user.stickyToolbar + 'px';
            util.addClass(element.toolbar, 'sun-editor-sticky');
            editor._variable._sticky = true;
        },

        _offStickyToolbar: function (element) {
            element._stickyDummy.style.display = 'none';
            element.toolbar.style.top = '';
            element.toolbar.style.width = '';
            element.editorArea.style.marginTop = '';
            util.removeClass(element.toolbar, 'sun-editor-sticky');
            editor._variable._sticky = false;
        }
    };

    /** add event listeners */
    /** toolbar event */
    context.element.toolbar.addEventListener('click', event.onClick_toolbar, false);
    /** editor area */
    context.element.wysiwyg.addEventListener('scroll', event.onScroll_wysiwyg, false);
    context.element.wysiwyg.addEventListener('click', event.onClick_wysiwyg, false);
    context.element.wysiwyg.addEventListener('keydown', event.onKeyDown_wysiwyg, false);
    context.element.wysiwyg.addEventListener('keyup', event.onKeyUp_wysiwyg, false);
    context.element.wysiwyg.addEventListener('drop', event.onDrop_wysiwyg, false);

    /** resizingBar */
    if (context.element.resizingBar) {
        if (/\d+/.test(context.user.height)) {
            context.element.resizingBar.addEventListener('mousedown', event.onMouseDown_resizingBar, false);
        } else {
            util.addClass(context.element.resizingBar, 'none-resize');
        }
    }
    
    /** window event */
    window.addEventListener('resize', event.onResize_window, false);
    if (context.user.stickyToolbar > -1) window.addEventListener('scroll', event.onScroll_window, false);

    /** add plugin to plugins object */
    if (plugins) {
        Object.keys(plugins).map(function(key) {
            let plugin = plugins[key];
            editor.plugins[plugin.name] = util.copyObj(plugin);
        });
    }

    /** User function */
    return {
        /**
         * @description Copying the contents of the editor to the original textarea
         */
        save: function () {
            if (editor._variable.wysiwygActive) {
                context.element.originElement.value = context.element.wysiwyg.innerHTML;
            } else {
                context.element.originElement.value = context.element.code.value;
            }
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
            let contents = '';

            if (context.element.wysiwyg.innerText.trim().length === 0) return contents;

            if (editor._variable.wysiwygActive) {
                contents = context.element.wysiwyg.innerHTML;
            } else {
                contents = context.element.code.value;
            }
            return contents;
        },

        /**
         * @description Inserts an HTML element or HTML string or plain string at the current cursor position
         * @param {Element|String} html - HTML Element or HTML string or plain string
         */
        insertHTML: function (html) {
            if (!html.nodeType || html.nodeType !== 1) {
                const template = document.createElement('template');
                template.innerHTML = html;
                html = template.content.firstChild;
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
            if (topAreaStyle.display === 'none') topAreaStyle.display = context.user.display;
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
            window.removeEventListener('resize', event.onResize_window);
            window.removeEventListener('scroll', event.onScroll_window);
            
            /** remove element */
            util.removeItem(context.element.topArea);

            this.save = null;
            this.getContext = null;
            this.getContents = null;
            this.setContents = null;
            this.appendContents = null;
            this.disabled = null;
            this.enabled = null;
            this.show = null;
            this.hide = null;
            this.destroy = null;
        }
    };
};

export default core;