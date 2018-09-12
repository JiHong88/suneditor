'use strict';

/**
 * @description SunEditor core closure
 * @param context
 * @param dom
 * @param util
 * @returns {{save: save, getContent: getContent, setContent: setContent, appendContent: appendContent, disabled: disabled, enabled: enabled, show: show, hide: hide, destroy: destroy}}
 */
const core = function (context, util, modules, plugins, lang) {
    /**
     * @description Practical editor function
     * This function is 'this' used by other plugins
     */
    const editor = {
        /**
         * @description Elements and user options parameters of the suneditor
         */
        context: context,

        /**
         * @description loaded modules
         */
        modules: {},

        /**
         * @description loaded plugins
         */
        plugins: {},

        /**
         * @description language
         */
        lang: lang,

        /**
         * @description util function
         */
        util: util,

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
         * @description controllers array (image resize area, link modified button)
         */
        controllerArray: [],

        /**
         * @description Elements that need to change text or className for each selection change
         * @property {element} FONT - font family button
         * @property {element} B - bold button
         * @property {element} U - underline button
         * @property {element} I - italic button
         * @property {element} STRIKE - strike button
         * @property {element} SUB - subscript button
         * @property {element} SUP - superscript button
         * @property {element} SIZE - font size button
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
         * @property {(element|null)} selectionNode - Contains selection node
         * @property {(element|null)} selection - The current selection object
         * @property {boolean} wysiwygActive - The wysiwyg frame or code view state
         * @property {boolean} isFullScreen - State of full screen
         * @property {number} innerHeight_fullScreen - InnerHeight in editor when in full screen
         * @property {number} resizeClientY - Remember the vertical size of the editor before resizing the editor (Used when calculating during resize operation)
         * @property {number} tabSize - Indented size when tab button clicked (4)
         * @property {element} originCssText - Remembered the CSS of the editor before full screen (Used when returning to original size again)
         * @property {number} editorHeight - The height value entered by the user or the height value of the "textarea" when the suneditor is created
         * @property {array} currentNodes -  An array of the current cursor's node structure
         * @property {boolean} isTouchMove - Check if mobile has moved after touching (Allowing scrolling in the toolbar area)
         * @private
         */
        _variable: {
            selectionNode: null,
            selection: null,
            wysiwygActive: true,
            isFullScreen: false,
            innerHeight_fullScreen: 0,
            resizeClientY: 0,
            tabSize: 4,
            originCssText: context.element.topArea.style.cssText,
            editorHeight: context.user.height,
            currentNodes: [],
            isTouchMove: false
        },

        /**
         * @description Call the module
         * @param {string} pluginName - The name of the js file to call
         * @param {function} callBackFunction - Function to be executed immediately after module call
         */
        callModule: function (pluginName, callBackFunction) {
            if (!this.plugins[pluginName]) {
                const plugin = plugins[pluginName];
                if (!plugin) {
                    throw Error('[SUNEDITOR.core.callModule.fail] The called plugin does not exist or is in an invalid format. (pluginName:"' + pluginName + '")');
                }

                plugin.add(this, plugin.buttonElement)
                this.plugins[pluginName] = plugin;
            }
                
            callBackFunction();
        },

        /**
         * @description Enabled submenu
         * @param {element} element - Submenu element to call
         */
        submenuOn: function (element) {
            this.submenu = element.nextElementSibling;
            this.submenu.style.display = 'block';
            this.util.addClass(element, 'on');
            this.submenuActiveButton = element;
        },

        /**
         * @description Disable submenu
         */
        submenuOff: function () {
            if (this.submenu) {
                this.submenu.style.display = 'none';
                this.submenu = null;
                this.util.removeClass(this.submenuActiveButton, 'on');
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

            if (len > 0) {
                for (let i = 0; i < len; i++) {
                    this.controllerArray[i].style.display = 'none';
                }
                this.controllerArray = [];
            }
        },

        /**
         * @description javascript execCommand
         * @param {string} command - javascript execCommand function property
         * @param {boolean} showDefaultUI - javascript execCommand function property
         * @param {string} value - javascript execCommand function property
         */
        execCommand: function (command, showDefaultUI, value) {
            document.execCommand(command, showDefaultUI, value);
        },

        /**
         * @description Focus to wysiwyg area
         */
        focus: function () {
            const caption = this.util.getParentElement(this._variable.selectionNode, 'figcaption');
            if (caption) {
                caption.focus();
            } else {
                context.element.wysiwyg.focus();
            }
        },

        _setSelectionNode: function () {
            this._variable.selection = window.getSelection();
            const range = this.getRange();

            if (range.startContainer !== range.endContainer) {
                this._variable.selectionNode = range.startContainer;
            } else {
                this._variable.selectionNode = this.getSelectionNode();
            }
        },

        /**
         * @description Get current select node
         * @returns {Node}
         */
        getSelectionNode: function () {
            if (this._variable.selection) {
                return this._variable.selection.extentNode || this._variable.selection.anchorNode;
            }

            return context.element.wysiwyg.firstChild
        },

        /**
         * @description Get current selection object
         * @returns {Selection}
         */
        getSelection: function () {
            return this._variable.selection;
        },

        /**
         * @description Create range object
         * @returns {Range}
         */
        createRange: function () {
            return document.createRange();
        },
        
        /**
         * @description Get current range object
         * @returns {Range}
         */
        getRange: function () {
            let selection = this.getSelection();
            let nativeRng = null;

            if (selection.rangeCount > 0) {
                nativeRng = selection.getRangeAt(0);
            }
            else {
                nativeRng = this.createRange();
                selection = this._variable.selection;

                if (!selection) {
                    selection = context.element.wysiwyg.firstChild;
                    nativeRng.setStart(selection, 0);
                    nativeRng.setEnd(selection, 0);
                } else {
                    nativeRng.setStart(selection.anchorNode, selection.anchorOffset);
                    nativeRng.setEnd(selection.focusNode, selection.focusOffset);
                }
            }

            return nativeRng;
        },

        /**
         * @description Set range object
         * @param {element} startCon - The startContainer property of the selection object.
         * @param {number} startOff - The startOffset property of the selection object.
         * @param {element} endCon - The endContainer property of the selection object.
         * @param {number} endOff - The endOffset property of the selection object.
         */
        setRange: function (startCon, startOff, endCon, endOff) {
            const range = this.createRange();
            range.setStart(startCon, startOff);
            range.setEnd(endCon, endOff);

            const selection = this.getSelection();

            if (selection.rangeCount > 0) {
                selection.removeAllRanges();
            }

            selection.addRange(range);
        },

        /**
         * @description Determine if this offset is the edge offset of container
         * @param {object} container - The container property of the selection object.
         * @param {number} offset - The offset property of the selection object.
         * @returns {boolean}
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
         * @param {element} element - Insert as siblings of that element
         * @returns {element}
         */
        appendP: function (element) {
            const oP = document.createElement('P');
            oP.innerHTML = '&#65279';

            element = this.util.getFormatElement(element);
            element.parentNode.insertBefore(oP, element.nextElementSibling);

            return oP;
        },

        /**
         * @description Delete selected node and insert argument value node
         * @param {element} oNode - Node to be inserted
         * @param {(element|null)} rightNode - If the node exists, it is inserted after the node
         */
        insertNode: function (oNode, rightNode) {
            let parentNode = null;

            if (!rightNode) {
                const selection = this.getSelection();
                const nativeRng = this.getRange();

                const startCon = nativeRng.startContainer;
                const startOff = nativeRng.startOffset;
                const endCon = nativeRng.endContainer;
                const endOff = nativeRng.endOffset;

                parentNode = startCon;
                if (startCon.nodeType === 3) {
                    parentNode = startCon.parentNode;
                }

                /** Select within the same node */
                if (startCon === endCon && startOff === endOff) {
                    if (selection.focusNode && selection.focusNode.nodeType === 3) {
                        rightNode = selection.focusNode.splitText(endOff);
                    }
                    else {
                        if (parentNode.lastChild !== null && /^BR$/i.test(parentNode.lastChild.nodeName)) {
                            parentNode.removeChild(parentNode.lastChild);
                        }
                        rightNode = null;
                    }
                }
                /** Select multiple nodes */
                else {
                    const isSameContainer = startCon === endCon;

                    if (isSameContainer) {
                        let removeNode = startCon;
                        if (!this.isEdgePoint(endCon, endOff)) rightNode = endCon.splitText(endOff);
                        if (!this.isEdgePoint(startCon, startOff)) removeNode = startCon.splitText(startOff);

                        parentNode.removeChild(removeNode);
                    }
                    else {
                        if (selection.deleteFromDocument) selection.deleteFromDocument();
                        else this.removeNode();

                        rightNode = endCon;

                        while (rightNode.nodeType !== 1) {
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

            // this.setRange(oNode, 0, oNode, 0);
        },

        /**
         * @description Delete the currently selected node
         */
        removeNode: function () {
            const nativeRng = this.getRange();

            const startCon = nativeRng.startContainer;
            const startOff = nativeRng.startOffset;
            const endCon = nativeRng.endContainer;
            const endOff = nativeRng.endOffset;
            const commonCon = nativeRng.commonAncestorContainer;

            let beforeNode = null;
            let afterNode = null;

            const childNodes = this.util.getListChildNodes(commonCon);
            let startIndex = this.util.getArrayIndex(childNodes, startCon);
            let endIndex = this.util.getArrayIndex(childNodes, endCon);

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
                    this.util.removeItem(item);
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
                        this.util.removeItem(startCon);
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
                        this.util.removeItem(endCon);
                    }

                    continue;
                }

                this.util.removeItem(item);
            }
        },

        /**
         * @description Copies the node of the argument value and wraps all selected text.
         * 1. When there is the same node in the selection area, the tag is stripped.
         * 2. If there is another css value other thanCss attribute values received as arguments on the same node, removed only Css attribute values received as arguments
         * @param {element} appendNode - The dom that will wrap the selected text area
         * @param {array} checkCSSPropertyArray - The css attribute name Array to check (['font-size'], ['font-family']...])
         */
        wrapRangeToTag: function (appendNode, checkCSSPropertyArray) {
            const nativeRng = this.getRange();
            const startCon = nativeRng.startContainer;
            const startOff = nativeRng.startOffset;
            const endCon = nativeRng.endContainer;
            const endOff = nativeRng.endOffset;
            const commonCon = nativeRng.commonAncestorContainer;

            let start = {}, end = {};
            let newNode, regExp;

            if (checkCSSPropertyArray) {
                regExp = '(?:;|^|\\s)(?:' + checkCSSPropertyArray[0];
                for (let i = 1; i < checkCSSPropertyArray.length; i++) {
                    regExp += '|' + checkCSSPropertyArray[i];
                }
                regExp += ')\\s*:[^;]*\\s*(?:;|$)';
                regExp = new RegExp(regExp, 'gi');
            }

            /** one node */
            if (startCon === endCon) {
                newNode = appendNode.cloneNode(false);

                /** No node selected */
                if (startOff === endOff) {
                    newNode.innerHTML = '&nbsp;';
                    if (util.isFormatElement(startCon)) {
                        startCon.appendChild(newNode);
                    } else {
                        startCon.parentNode.insertBefore(newNode, startCon.nextSibling);
                    }
                }
                /** Select within the same node */
                else {
                    const isElement = startCon.nodeType === 1;
                    if (isElement) {
                        newNode.innerHTML = startCon.outerHTML;
                        startCon.parentNode.appendChild(newNode);
                        this.util.removeItem(startCon);
                    } else {
                        const beforeNode = document.createTextNode(startCon.substringData(0, startOff));
                        const afterNode = document.createTextNode(startCon.substringData(endOff, (startCon.length - endOff)));

                        newNode.innerText = startCon.substringData(startOff, (endOff - startOff));
                        startCon.parentNode.insertBefore(newNode, startCon.nextSibling);

                        if (beforeNode.data.length > 0) {
                            startCon.data = beforeNode.data;
                        } else {
                            startCon.data = startCon.substringData(0, startOff);
                        }

                        if (afterNode.data.length > 0) {
                            startCon.parentNode.insertBefore(afterNode, newNode.nextSibling);
                        }
                    }
                }

                start.container = newNode;
                start.offset = 0;
                end.container = newNode;
                end.offset = 1;
            }
            /** multiple nodes */
            else {
                /** tag check function*/
                const checkFontSizeCss = function (vNode) {
                    if (vNode.nodeType === 3) return true;

                    let style = '';
                    if (regExp && vNode.style.cssText.length > 0) {
                        style = vNode.style.cssText.replace(regExp, '').trim();
                    }

                    if (vNode.nodeName !== appendNode.nodeName || style.length > 0) {
                        if (vNode.style.cssText.length > 0) vNode.style.cssText = style;
                        return true;
                    }

                    return false;
                };

                /** one line */
                if (!util.isFormatElement(commonCon)) {
                    newNode = appendNode.cloneNode(false);
                    const range = this._wrapLineNodesPart(commonCon, newNode, checkFontSizeCss, startCon, startOff, endCon, endOff);

                    start.container = range.startContainer;
                    start.offset = range.startOffset;
                    end.container = range.endContainer;
                    end.offset = range.endOffset;
                }
                /** multi line */
                else {
                    // get line nodes
                    const lineNodes = this.util.getListChildren(commonCon, function (current) {
                        return util.isFormatElement(current);
                    });

                    let startLine = this.util.getParentElement(startCon, 'P');
                    let endLine = this.util.getParentElement(endCon, 'P');

                    for (let i = 0, len = lineNodes.length; i < len; i++) {
                        if (startLine === lineNodes[i]) {
                            startLine = i;
                            continue;
                        }
                        if (endLine === lineNodes[i]) {
                            endLine = i;
                            break;
                        }
                    }

                    // startCon
                    newNode = appendNode.cloneNode(false);
                    start = this._wrapLineNodesStart(lineNodes[startLine], newNode, checkFontSizeCss, startCon, startOff);
                    // mid
                    for (let i = startLine + 1; i < endLine; i++) {
                        newNode = appendNode.cloneNode(false);
                        this._wrapLineNodes(lineNodes[i], newNode, checkFontSizeCss);
                    }
                    // endCon
                    newNode = appendNode.cloneNode(false);
                    end = this._wrapLineNodesEnd(lineNodes[endLine], newNode, checkFontSizeCss, endCon, endOff);
                }
            }

            // set range
            this.setRange(start.container, start.offset, end.container, end.offset);
        },

        /**
         * @description wraps text nodes of line selected text.
         * @param {element} element - The node of the line that contains the selected text node.
         * @param {element} newInnerNode - The dom that will wrap the selected text area
         * @param {function} validation - Check if the node should be stripped.
         * @param {element} startCon - The startContainer property of the selection object.
         * @param {number} startOff - The startOffset property of the selection object.
         * @param {element} endCon - The endContainer property of the selection object.
         * @param {number} endOff - The endOffset property of the selection object.
         * @returns {{startContainer: *, startOffset: *, endContainer: *, endOffset: *}}
         * @private
         */
        _wrapLineNodesPart: function (element, newInnerNode, validation, startCon, startOff, endCon, endOff) {
            const el = element;
            const removeNodeList = [];

            let startContainer = startCon;
            let startOffset = startOff;
            let endContainer = endCon;
            let endOffset = endOff;

            let startPass = false;
            let endPass = false;
            let pCurrent, newNode, appendNode;

            (function recursionFunc(current, node) {
                const childNodes = current.childNodes;
                for (let i = 0, len = childNodes.length; i < len; i++) {
                    if (endPass) break;
                    let child = childNodes[i];

                    if (startPass && child !== endContainer && child.nodeType === 3) {
                        pCurrent = [];
                        while (newNode !== el && newNode !== null) {
                            if (validation(newNode) && newNode.nodeType === 1) {
                                pCurrent.push(newNode.cloneNode(false));
                            }
                            newNode = newNode.parentNode;
                        }

                        if (pCurrent.length > 0) {
                            appendNode = newNode = pCurrent.pop();
                            while (pCurrent.length > 0) {
                                newNode = pCurrent.pop();
                                appendNode.appendChild(newNode);
                            }
                            newInnerNode.appendChild(appendNode);
                            node = newNode;
                        } else {
                            node = newInnerNode;
                        }

                        node.appendChild(child.cloneNode(false));
                        removeNodeList.push(child);
                    }

                    // startContainer
                    if (child === startContainer) {
                        const prevNode = document.createTextNode(startContainer.substringData(0, startOffset));
                        const startNode = document.createTextNode(startContainer.substringData(startOffset, (startContainer.length - startOffset)));

                        if (prevNode.length > 0) {
                            startContainer.data = prevNode.data;
                        } else {
                            removeNodeList.push(startContainer);
                        }

                        newNode = child;
                        pCurrent = [];
                        while (newNode !== el && newNode !== null) {
                            if (validation(newNode) && newNode.nodeType === 1) {
                                pCurrent.push(newNode.cloneNode(false));
                            }
                            newNode = newNode.parentNode;
                        }

                        appendNode = newNode = pCurrent.pop() || child;
                        while (pCurrent.length > 0) {
                            newNode = pCurrent.pop();
                            appendNode.appendChild(newNode);
                        }

                        if (appendNode !== child) {
                            newInnerNode.appendChild(appendNode);
                            node = newNode;
                        } else {
                            node = newInnerNode;
                        }

                        startContainer = startNode;
                        startOffset = 0;
                        node.appendChild(startContainer);

                        startPass = true;
                        continue;
                    }

                    // endContainer
                    if (child === endContainer) {
                        const afterNode = document.createTextNode(endContainer.substringData(endOffset, (endContainer.length - endOffset)));
                        const endNode = document.createTextNode(endContainer.substringData(0, endOffset));
                        let before = null;

                        before = newNode = child;
                        pCurrent = [];
                        while (newNode !== el && newNode !== null) {
                            if (validation(newNode) && newNode.nodeType === 1) {
                                pCurrent.push(newNode.cloneNode(false));
                            }
                            before = newNode;
                            newNode = newNode.parentNode;
                        }

                        appendNode = newNode = pCurrent.pop() || child;
                        while (pCurrent.length > 0) {
                            newNode = pCurrent.pop();
                            appendNode.appendChild(newNode);
                        }

                        if (appendNode !== child) {
                            newInnerNode.appendChild(appendNode);
                            node = newNode;
                        } else {
                            node = newInnerNode;
                        }

                        if (afterNode.length > 0) {
                            endContainer.data = afterNode.data;
                        } else {
                            removeNodeList.push(endContainer);
                        }

                        endContainer = endNode;
                        endOffset = endNode.length;
                        node.appendChild(endContainer);
                        el.insertBefore(newInnerNode, before);

                        let pRemove;
                        while (removeNodeList.length > 0) {
                            pRemove = removeNodeList.pop();
                            pRemove.data = '';
                            while (pRemove.parentNode && pRemove.parentNode.innerText.length === 0) {
                                pRemove = pRemove.parentNode;
                            }
                            this.util.removeItem(pRemove);
                        }

                        endPass = true;
                        break;
                    }

                    recursionFunc(child);
                }
            })(element);

            return {
                startContainer: startContainer,
                startOffset: startOffset,
                endContainer: endContainer,
                endOffset: endOffset
            };
        },

        /**
         * @description wraps mid lines selected text.
         * @param {element} element - The node of the line that contains the selected text node.
         * @param {element} newInnerNode - The dom that will wrap the selected text area
         * @param {function} validation - Check if the node should be stripped.
         * @private
         */
        _wrapLineNodes: function (element, newInnerNode, validation) {
            (function recursionFunc(current, node) {
                const childNodes = current.childNodes;

                for (let i = 0, len = childNodes.length; i < len; i++) {
                    let child = childNodes[i];
                    let coverNode = node;
                    if (validation(child)) {
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
         * @param {element} element - The node of the line that contains the selected text node.
         * @param {element} newInnerNode - The dom that will wrap the selected text area
         * @param {function} validation - Check if the node should be stripped.
         * @param {element} startCon - The startContainer property of the selection object.
         * @param {number} startOff - The startOffset property of the selection object.
         * @returns {{container: *, offset: *}}
         * @private
         */
        _wrapLineNodesStart: function (element, newInnerNode, validation, startCon, startOff) {
            const el = element;
            const pNode = document.createElement('P');

            let container = startCon;
            let offset = startOff;
            let passNode = false;
            let pCurrent, newNode, appendNode;

            (function recursionFunc(current, node) {
                const childNodes = current.childNodes;
                for (let i = 0, len = childNodes.length; i < len; i++) {
                    const child = childNodes[i];
                    let coverNode = node;

                    if (passNode) {
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
                            appendNode = newNode = pCurrent.pop();
                            while (pCurrent.length > 0) {
                                newNode = pCurrent.pop();
                                appendNode.appendChild(newNode);
                            }
                            newInnerNode.appendChild(appendNode);
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
                            if (validation(newNode) && newNode.nodeType === 1) {
                                pCurrent.push(newNode.cloneNode(false));
                            }
                            newNode = newNode.parentNode;
                        }

                        appendNode = newNode = pCurrent.pop() || node;
                        while (pCurrent.length > 0) {
                            newNode = pCurrent.pop();
                            appendNode.appendChild(newNode);
                        }

                        if (appendNode !== node) {
                            newInnerNode.appendChild(appendNode);
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

                    if (!passNode || validation(child)) {
                        const cloneNode = child.cloneNode(false);
                        node.appendChild(cloneNode);
                        if (child.nodeType === 1) coverNode = cloneNode;
                    }

                    recursionFunc(child, coverNode);
                }
            })(element, pNode);

            element.parentNode.insertBefore(pNode, element);
            this.util.removeItem(element);

            return {
                container: container,
                offset: offset
            };
        },

        /**
         * @description wraps last line selected text.
         * @param {element} element - The node of the line that contains the selected text node.
         * @param {element} newInnerNode - The dom that will wrap the selected text area
         * @param {function} validation - Check if the node should be stripped.
         * @param {element} endCon - The endContainer property of the selection object.
         * @param {number} endOff - The endOffset property of the selection object.
         * @returns {{container: *, offset: *}}
         * @private
         */
        _wrapLineNodesEnd: function (element, newInnerNode, validation, endCon, endOff) {
            const el = element;
            const pNode = document.createElement('P');

            let container = endCon;
            let offset = endOff;
            let passNode = false;
            let pCurrent, newNode, appendNode;

            (function recursionFunc(current, node) {
                const childNodes = current.childNodes;
                for (let i = childNodes.length -1; 0 <= i; i--) {
                    const child = childNodes[i];
                    let coverNode = node;

                    if (passNode) {
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
                            appendNode = newNode = pCurrent.pop();
                            while (pCurrent.length > 0) {
                                newNode = pCurrent.pop();
                                appendNode.insertBefore(newNode, appendNode.firstChild);
                            }
                            newInnerNode.insertBefore(appendNode, newInnerNode.firstChild);
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

                        appendNode = newNode = pCurrent.pop() || node;
                        while (pCurrent.length > 0) {
                            newNode = pCurrent.pop();
                            appendNode.insertBefore(newNode, appendNode.firstChild);
                        }

                        if (appendNode !== node) {
                            newInnerNode.insertBefore(appendNode, newInnerNode.firstChild);
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

                    if (!passNode || validation(child)) {
                        const cloneNode = child.cloneNode(false);
                        node.insertBefore(cloneNode, node.firstChild);
                        if (child.nodeType === 1) coverNode = cloneNode;
                    }

                    recursionFunc(child, coverNode);
                }
            })(element, pNode);

            element.parentNode.insertBefore(pNode, element);
            this.util.removeItem(element);

            return {
                container: container,
                offset: offset
            };
        },

        /**
         * @description This function implements indentation.
         * Set "margin-left" to "25px" in the top "P" tag of the parameter node.
         * @param node {Node} - The node to indent (editor._variable.selectionNode)
         * @param command {String} - Separator ("indent" or "outdent")
         */
        indent: function (node, command) {
            const p = this.util.getParentElement(node, 'P');
            if (!p) return;

            let margin = /\d+/.test(p.style.marginLeft) ? p.style.marginLeft.match(/\d+/)[0] * 1 : 0;

            if ('indent' === command) {
                margin += 25;
            } else {
                margin -= 25;
            }

            p.style.marginLeft = (margin < 0 ? 0 : margin) + 'px';
        },

        /**
         * @description Add or remove the class name of "body" so that the code block is visible
         */
        toggleDisplayBlocks: function () {
            this.util.toggleClass(context.element.wysiwyg, 'sun-editor-show-block');
        },

        /**
         * @description Changes to code view or wysiwyg view
         */
        toggleCodeView: function () {
            if (!this._variable.wysiwygActive) {
                const ec = {'&amp;': '&', '&nbsp;': '\u00A0', "&quot;": "'", '&lt;': '<', '&gt;': '>'};
                const code_html = context.element.code.value.replace(/&[a-z]+;/g, function (m) {
                    return (typeof ec[m] === 'string') ? ec[m] : m;
                });
                context.element.wysiwyg.innerHTML = code_html.trim().length > 0 ? code_html : '<p>&#65279</p>';
                context.element.editorArea.scrollTop = 0;
                context.element.code.style.display = 'none';
                context.element.wysiwyg.style.display = 'block';
                this._variable.wysiwygActive = true;
            }
            else {
                context.element.code.value = context.element.wysiwyg.innerHTML.trim().replace(/<\/p>(?=[^\n])/gi, '<\/p>\n');
                context.element.wysiwyg.style.display = 'none';
                context.element.code.style.display = 'block';
                this._variable.wysiwygActive = false;
            }
        },

        /**
         * @description Changes to full screen or default screen
         * @param {element} element - full screen button
         */
        toggleFullScreen: function (element) {
            if (!this._variable.isFullScreen) {
                context.element.topArea.style.position = 'fixed';
                context.element.topArea.style.top = '0';
                context.element.topArea.style.left = '0';
                context.element.topArea.style.width = '100%';
                context.element.topArea.style.height = '100%';

                this._variable.innerHeight_fullScreen = (window.innerHeight - context.tool.bar.offsetHeight);
                context.element.editorArea.style.height = this._variable.innerHeight_fullScreen + 'px';

                this.util.removeClass(element.firstElementChild, 'icon-expansion');
                this.util.addClass(element.firstElementChild, 'icon-reduction');
            }
            else {
                context.element.topArea.style.cssText = this._variable.originCssText;
                context.element.editorArea.style.height = this._variable.editorHeight + 'px';

                this.util.removeClass(element.firstElementChild, 'icon-reduction');
                this.util.addClass(element.firstElementChild, 'icon-expansion');
            }

            this._variable.isFullScreen = !this._variable.isFullScreen;
        },

        /**
         * @description Opens the preview window
         */
        openPreview: function () {
            const WindowObject = window.open('', '_blank');
            WindowObject.mimeType = 'text/html';
            WindowObject.document.head.innerHTML = '' +
                '<meta charset="utf-8" />' +
                '<meta name="viewport" content="width=device-width, initial-scale=1">' +
                '<title>' + lang.toolbar.preview + '</title>' +
                '<link rel="stylesheet" type="text/css" href="' + this.util.getBasePath + 'css/suneditor.css">';
            WindowObject.document.body.className = 'sun-editor-editable';
            WindowObject.document.body.innerHTML = context.element.wysiwyg.innerHTML;
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

            for (let selectionParent = editor._variable.selectionNode; !util.isWysiwygDiv(selectionParent); selectionParent = selectionParent.parentNode) {
                if (selectionParent.nodeType !== 1) continue;
                nodeName = selectionParent.nodeName.toUpperCase();
                currentNodes.push(nodeName);

                /** Format */
                if (findFormat && util.isFormatElement(selectionParent)) {
                    commandMapNodes.push('FORMAT');
                    editor.util.changeTxt(commandMap['FORMAT'], nodeName);
                    findFormat = false;
                    continue;
                }

                /** Font */
                if (findFont && (selectionParent.style.fontFamily.length > 0 || (selectionParent.face && selectionParent.face.length > 0))) {
                    commandMapNodes.push('FONT');
                    const selectFont = (selectionParent.style.fontFamily || selectionParent.face || lang.toolbar.font).replace(/["']/g,'');
                    editor.util.changeTxt(commandMap['FONT'], selectFont);
                    findFont = false;
                }

                /** A */
                if (findA && /^A$/.test(nodeName) && selectionParent.getAttribute('data-image-link') === null) {
                    if (!context.link || editor.controllerArray[0] !== context.link.linkBtn) {
                        editor.callModule('link', function () {
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
                        editor.util.changeTxt(commandMap['SIZE'], selectionParent.style.fontSize.match(/\d+/)[0]);
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
                    editor.util.addClass(commandMap[nodeName], 'on');
                }
            }

            /** remove class, display text */
            for (let key in commandMap) {
                if (commandMapNodes.indexOf(key) > -1) continue;
                if (/^FONT/i.test(key)) {
                    editor.util.changeTxt(commandMap[key], lang.toolbar.font);
                }
                else if (/^SIZE$/i.test(key)) {
                    editor.util.changeTxt(commandMap[key], lang.toolbar.fontSize);
                }
                else {
                    editor.util.removeClass(commandMap[key], 'on');
                }
            }

            /** save current nodes */
            editor._variable.currentNodes = currentNodes.reverse();

            /**  Displays the current node structure to resizebar */
            if (context.user.showPathLabel) context.element.navigation.textContent = editor._variable.currentNodes.join(' > ');
        },

        resize_window: function () {
            if (editor._variable.isFullScreen) {
                editor._variable.innerHeight_fullScreen += (window.innerHeight - context.tool.bar.offsetHeight) - editor._variable.innerHeight_fullScreen;
                context.element.editorArea.style.height = editor._variable.innerHeight_fullScreen + 'px';
            }
        },

        touchstart_toolbar: function () {
            editor._variable.isTouchMove = false;
        },

        touchmove_toolbar: function () {
            editor._variable.isTouchMove = true;
        },

        onClick_toolbar: function (e) {
            if (editor._variable.isTouchMove) return true;

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

            if (!command && !display) return true;

            e.preventDefault();
            e.stopPropagation();

            editor.submenuOff();
            editor.focus();

            /** Dialog, Submenu */
            if (display) {
                if (/submenu/.test(display) && (target.nextElementSibling === null || target.nextElementSibling !== editor.submenu)) {
                    editor.callModule(command, function () {
                        editor.submenuOn(target);
                    });
                }
                else if (/dialog/.test(display)) {
                    editor.callModule(command, function () {
                        editor.plugins.dialog.openDialog.call(editor, command, target.getAttribute('data-option'), false);
                    });
                }

                return;
            }

            /** default command */
            if (command) {
                switch (command) {
                    case 'codeView':
                        editor.toggleCodeView();
                        editor.util.toggleClass(target, 'on');
                        break;
                    case 'fullScreen':
                        editor.toggleFullScreen(target);
                        editor.util.toggleClass(target, 'on');
                        break;
                    case 'indent':
                    case 'outdent':
                        editor.indent(editor._variable.selectionNode, command);
                        break;
                    case 'redo':
                    case 'undo':
                    case 'removeFormat':
                        editor.execCommand(command, false, null);
                        break;
                    case 'preview':
                        editor.openPreview();
                        break;
                    case 'print':
                        context.element.wysiwyg.print();
                        break;
                    case 'showBlocks':
                        editor.toggleDisplayBlocks();
                        editor.util.toggleClass(target, 'on');
                        break;
                    case 'subscript':
                        if (editor.util.hasClass(context.tool.superscript, 'on')) {
                            editor.execCommand('superscript', false, null);
                            editor.util.removeClass(context.tool.superscript, 'on');
                        }
                        editor.execCommand(command, false, null);
                        editor.util.toggleClass(target, 'on');
                        break;
                    case 'superscript':
                        if (editor.util.hasClass(context.tool.subscript, 'on')) {
                            editor.execCommand('subscript', false, null);
                            editor.util.removeClass(context.tool.subscript, 'on');
                        }
                        editor.execCommand(command, false, null);
                        editor.util.toggleClass(target, 'on');
                        break;
                    default :
                        editor.execCommand(command, false, target.getAttribute('data-value'));
                        editor.util.toggleClass(target, 'on');
                }
            }
        },

        onMouseUp_wysiwyg: function (e) {
            e.stopPropagation();

            const targetElement = e.target;
            editor.submenuOff();

            if (/^HTML$/i.test(targetElement.nodeName)) {
                e.preventDefault();
                editor.focus();
                return;
            }

            if (/^IMG$/i.test(targetElement.nodeName)) {
                e.preventDefault();
                editor.callModule('image', function () {
                    const size = editor.plugins.dialog.call_controller_resize.call(editor, targetElement, 'image');
                    editor.plugins.image.onModifyMode.call(editor, targetElement, size);
                });
                return;
            }

            editor._setSelectionNode();
            event._findButtonEffectTag();
        },

        onKeyDown_wysiwyg: function (e) {
            // editor._setSelectionNode();

            const keyCode = e.keyCode;
            const shift = e.shiftKey;
            const ctrl = e.ctrlKey || e.metaKey;
            const alt = e.altKey;
            e.stopPropagation();

            function shortcutCommand(keyCode) {
                const key = event._shortcutKeyCode[keyCode];
                if (!key) return false;

                editor.execCommand(key[0], false, null);
                editor.util.toggleClass(editor.commandMap[key[1]], 'on');

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
            switch (keyCode) {
                case 8: /**backspace key*/
                    if (util.isFormatElement(editor._variable.selectionNode) && editor._variable.selectionNode.previousSibling === null) {
                        e.preventDefault();
                        e.stopPropagation();
                        editor._variable.selectionNode.innerHTML = '&#65279';
                        return false;
                    }
                    break;
                case 9:
                    /**tab key*/
                    e.preventDefault();
                    if (ctrl || alt) break;

                    let currentNode = editor._variable.selectionNode || editor.getSelectionNode();
                    while (!/^TD$/i.test(currentNode.tagName) && !util.isWysiwygDiv(currentNode)) {
                        currentNode = currentNode.parentNode;
                    }

                    if (currentNode && /^TD$/i.test(currentNode.tagName)) {
                        const table = editor.util.getParentElement(currentNode, 'table');
                        const cells = editor.util.getListChildren(table, editor.util.isCell);
                        let idx = shift ? editor.util.prevIdx(cells, currentNode) : editor.util.nextIdx(cells, currentNode);

                        if (idx === cells.length && !shift) idx = 0;
                        if (idx === -1 && shift) idx = cells.length - 1;

                        const moveCell = cells[idx];
                        if (!moveCell) return false;

                        const range = editor.createRange();
                        range.setStart(moveCell, 0);
                        range.setEnd(moveCell, 0);

                        const selection = editor.getSelection();
                        if (selection.rangeCount > 0) {
                            selection.removeAllRanges();
                        }
                        selection.addRange(range);

                        break;
                    }

                    /** if P Tag */
                    if (shift) break;

                    const tabText = document.createTextNode(new Array(editor._variable.tabSize + 1).join('\u00A0'));
                    editor.insertNode(tabText, null);

                    const selection = editor.getSelection();
                    const rng = editor.createRange();

                    rng.setStart(tabText, editor._variable.tabSize);
                    rng.setEnd(tabText, editor._variable.tabSize);

                    if (selection.rangeCount > 0) {
                        selection.removeAllRanges();
                    }

                    selection.addRange(rng);

                    break;
            }
        },

        onKeyUp_wysiwyg: function (e) {
            editor._setSelectionNode();

            /** when format tag deleted */
            if (e.keyCode === 8 && util.isWysiwygDiv(editor._variable.selectionNode)) {
                e.preventDefault();
                e.stopPropagation();

                const oFormatTag = document.createElement(editor._variable.currentNodes[0]);
                oFormatTag.innerHTML = '&#65279';

                editor._variable.selectionNode.appendChild(oFormatTag);
                editor._variable.selectionNode = oFormatTag;
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

            editor.callModule('image', function () {
                context.image.imgInputFile.files = files;
                editor.plugins.image.onRender_imgInput.call(editor);
                context.image.imgInputFile.files = null;
            });
        },

        onMouseDown_resizeBar: function (e) {
            e.stopPropagation();

            editor._variable.resizeClientY = e.clientY;
            context.element.resizeBackground.style.display = 'block';

            function closureFunc() {
                context.element.resizeBackground.style.display = 'none';
                document.removeEventListener('mousemove', event.resize_editor);
                document.removeEventListener('mouseup', closureFunc);
            }

            document.addEventListener('mousemove', event.resize_editor);
            document.addEventListener('mouseup', closureFunc);
        },

        resize_editor: function (e) {
            const resizeInterval = (e.clientY - editor._variable.resizeClientY);

            context.element.editorArea.style.height = (context.element.editorArea.offsetHeight + resizeInterval) + 'px';
            editor._variable.editorHeight = (context.element.editorArea.offsetHeight + resizeInterval);

            editor._variable.resizeClientY = e.clientY;
        }
    };

    /** add event listeners */
    /** tool bar event */
    context.tool.bar.addEventListener('touchstart', event.touchstart_toolbar, false);
    context.tool.bar.addEventListener('touchmove', event.touchmove_toolbar, false);
    context.tool.bar.addEventListener('touchend', event.onClick_toolbar, false);
    context.tool.bar.addEventListener('click', event.onClick_toolbar, false);
    /** editor area */
    context.element.editorArea.addEventListener('scroll', event.onScroll_wysiwyg, false);
    context.element.wysiwyg.addEventListener('mouseup', event.onMouseUp_wysiwyg, false);
    context.element.wysiwyg.addEventListener('keydown', event.onKeyDown_wysiwyg, false);
    context.element.wysiwyg.addEventListener('keyup', event.onKeyUp_wysiwyg, false);
    context.element.wysiwyg.addEventListener('drop', event.onDrop_wysiwyg, false);
    /** resize bar */
    context.element.resizebar.addEventListener('mousedown', event.onMouseDown_resizeBar, false);
    /** window resize event */
    window.addEventListener('resize', event.resize_window, false);

    /** add plugin and module to plugins object */
    /** modules */
    for (let i = 0, len = modules.length, plugin; i < len; i++) {
        plugin = modules[i];
        plugin.add(editor);
        editor.plugins[plugin.name] = plugin;
    }

    /** User function */
    return {
        /**
         * @description Copying the contents of the editor to the original textarea
         */
        save: function () {
            if (editor._variable.wysiwygActive) {
                context.element.originElement.innerHTML = context.element.wysiwyg.innerHTML;
            } else {
                context.element.originElement.innerHTML = context.element.code.value;
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
        getContent: function () {
            let content = '';

            if (context.element.wysiwyg.innerText.trim().length === 0) return content;

            if (editor._variable.wysiwygActive) {
                content = context.element.wysiwyg.innerHTML;
            } else {
                content = context.element.code.value;
            }
            return content;
        },

        /**
         * @description Change the contents of the suneditor
         * @param {string} content - Content to Input
         */
        setContent: function (content) {
            const innerHTML = _convertContentForEditor(content);

            if (editor._variable.wysiwygActive) {
                context.element.wysiwyg.innerHTML = innerHTML;
            } else {
                context.element.code.value = innerHTML;
            }
        },

        /**
         * @description Add content to the suneditor
         * @param {string} content - to Input
         */
        appendContent: function (content) {
            if (editor._variable.wysiwygActive) {
                const oP = document.createElement('P');
                oP.innerHTML = content;
                context.element.wysiwyg.appendChild(oP);
            } else {
                context.element.code.value += content;
            }
        },

        /**
         * @description Disable the suneditor
         */
        disabled: function () {
            context.tool.cover.style.display = 'block';
            context.element.wysiwyg.setAttribute('contenteditable', false);
        },

        /**
         * @description Enabled the suneditor
         */
        enabled: function () {
            context.tool.cover.style.display = 'none';
            context.element.wysiwyg.setAttribute('contenteditable', true);
        },

        /**
         * @description Show the suneditor
         */
        show: function () {
            const topAreaStyle = context.element.topArea.style;
            topAreaStyle.cssText = editor._variable.originCssText;
            if (topAreaStyle.display === 'none') topAreaStyle.display = 'block';
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
            context.tool.bar.removeEventListener('touchstart', event.touchstart_toolbar);
            context.tool.bar.removeEventListener('touchmove', event.touchmove_toolbar);
            context.tool.bar.removeEventListener('touchend', event.onClick_toolbar);
            context.tool.bar.removeEventListener('click', event.onClick_toolbar);
            context.element.wysiwyg.removeEventListener('mouseup', event.onMouseUp_wysiwyg);
            context.element.wysiwyg.removeEventListener('keydown', event.onKeyDown_wysiwyg);
            context.element.wysiwyg.removeEventListener('keyup', event.onKeyUp_wysiwyg);
            context.element.wysiwyg.removeEventListener('scroll', event.onScroll_wysiwyg);
            context.element.wysiwyg.removeEventListener('drop', event.onDrop_wysiwyg);
            context.element.resizebar.removeEventListener('mousedown', event.onMouseDown_resizeBar);
            window.removeEventListener('resize', event.resize_window);
            
            /** remove element */
            context.element.topArea.parentNode.removeChild(context.element.topArea);
            context.element.originElement.style.display = 'block';

            context = null;
            dom = null;
            util = null;

            this.save = null;
            this.getContext = null;
            this.getContent = null;
            this.setContent = null;
            this.appendContent = null;
            this.disabled = null;
            this.enabled = null;
            this.show = null;
            this.hide = null;
            this.destroy = null;
        }
    };
};

export default core;