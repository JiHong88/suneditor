/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
if (typeof window.SUNEDITOR === 'undefined') {
    window.SUNEDITOR = {};
    SUNEDITOR.plugin = {};
}

/**
 * @description default language (english)
 */
SUNEDITOR.defaultLang = {
    toolbar: {
        font: 'Font',
        formats: 'Formats',
        fontSize: 'Size',
        bold: 'Bold',
        underline: 'Underline',
        italic: 'Italic',
        strike: 'Strike',
        subscript: 'Subscript',
        superscript: 'Superscript',
        removeFormat: 'Remove Format',
        fontColor: 'Font Color',
        hiliteColor: 'Hilite Color',
        indent: 'Indent',
        outdent: 'Outdent',
        align: 'Align',
        alignLeft: 'Align left',
        alignRight: 'Align right',
        alignCenter: 'Align center',
        justifyFull: 'Justify full',
        list: 'list',
        orderList: 'Ordered list',
        unorderList: 'Unordered list',
        line: 'Line',
        table: 'Table',
        link: 'Link',
        image: 'Image',
        video: 'Video',
        fullScreen: 'Full screen',
        showBlocks: 'Show blocks',
        codeView: 'Code view',
        undo: 'Undo',
        redo: 'Redo',
        preview: 'Preview',
        print: 'print',
        tag_p: 'Paragraph',
        tag_div: 'Normal (DIV)',
        tag_h: 'Header'
    },
    dialogBox: {
        linkBox: {
            title: 'Insert Link',
            url: 'URL to link',
            text: 'Text to display',
            newWindowCheck: 'Open in new window'
        },
        imageBox: {
            title: 'Insert image',
            file: 'Select from files',
            url: 'Image URL',
            caption: 'Insert image description',
            altText: 'Alternative text'
        },
        videoBox: {
            title: 'Insert Video',
            url: 'Media embed URL, YouTube'
        },
        resize100: 'resize 100%',
        resize75: 'resize 75%',
        resize50: 'resize 50%',
        resize25: 'resize 25%',
        remove: 'remove',
        submitButton: 'Submit',
        revertButton: 'Revert',
        proportion: 'constrain proportions',
        width: 'Width',
        height: 'Height',
        basic: 'Basic',
        left: 'Left',
        right: 'Right',
        center: 'Center'
    },
    editLink: {
        edit: 'Edit',
        remove: 'Remove'
    }
};

(function () {
    'use strict';

    /**
     * @description utility function
     */
    SUNEDITOR.util = {
        /**
         * @description Gets XMLHttpRequest object
         * @returns {Object}
         */
        getXMLHttpRequest: function () {
            /** IE */
            if (window.ActiveXObject) {
                try {
                    return new ActiveXObject('Msxml2.XMLHTTP');
                } catch (e) {
                    try {
                        return new ActiveXObject('Microsoft.XMLHTTP');
                    } catch (e1) {
                        return null;
                    }
                }
            }
            /** netscape */
            else if (window.XMLHttpRequest) {
                return new XMLHttpRequest();
            }
            /** fail */
            else {
                return null;
            }
        },

        /**
         * @description Copies object
         * @param {Object} obj - Object to be copy
         * @returns {Object}
         */
        copyObj: function (obj) {
            const copy = {};

            for (let attr in obj) {
                copy[attr] = obj[attr];
            }

            return copy;
        },

        /**
         * @description Get suneditor's default path
         */
        getBasePath: (function () {
            let path = SUNEDITOR.SUNEDITOR_BASEPATH || '';
            if (!path) {
                for (let c = document.getElementsByTagName('script'), i = 0; i < c.length; i++) {
                    let editorTag = c[i].src.match(/(^|.*[\\\/])suneditor(\.min)?\.js(?:\?.*|;.*)?$/i);
                    if (editorTag) {
                        path = editorTag[1];
                        break;
                    }
                }
            }
            -1 === path.indexOf(':/') && '//' !== path.slice(0, 2) && (path = 0 === path.indexOf('/') ? location.href.match(/^.*?:\/\/[^\/]*/)[0] + path : location.href.match(/^[^\?]*\/(?:)/)[0] + path);

            if (!path) throw '[SUNEDITOR.util.getBasePath.fail] The SUNEDITOR installation path could not be automatically detected. Please set the global variable "SUNEDITOR.SUNEDITOR_BASEPATH" before creating editor instances.';

            return path;
        })(),

        /**
         * @description Add script File
         * @param {string} fileType - File type ("text/javascript")
         * @param {string} fullUrl - The full url of the js file to call
         * @param {function} callBack - Function to be executed immediately after module call
         */
        includeFile: function (fileType, fullUrl, callBack) {
            const scriptFile = document.createElement('script');
            scriptFile.type = fileType;
            scriptFile.src = fullUrl;
            scriptFile.onload = callBack;

            document.getElementsByTagName('head')[0].appendChild(scriptFile);
        }
    };

    /**
     * @description document function
     */
    SUNEDITOR.dom = {
        /**
         * @description Get the index of the argument value in the element array
         * @param {array} array - element array
         * @param {element} element - Element to find index
         * @returns {Number}
         */
        getArrayIndex: function (array, element) {
            let idx = -1;
            for (let i = 0, len = array.length; i < len; i++) {
                if (array[i] === element) {
                    idx = i;
                    break;
                }
            }

            return idx;
        },

        /**
         * @description Get the next index of the argument value in the element array
         * @param {array} array - element array
         * @param {element} item - Element to find index
         * @returns {Number}
         */
        nextIdx: function (array, item) {
            let idx = this.getArrayIndex(array, item);
            if (idx === -1) return -1;
            return idx + 1;
        },

        /**
         * @description Get the previous index of the argument value in the element array
         * @param {array} array - element array
         * @param {element} item - Element to find index
         * @returns {Number}
         */
        prevIdx: function (array, item) {
            let idx = this.getArrayIndex(array, item);
            if (idx === -1) return -1;
            return idx - 1;
        },

        /**
         * @description Gets whether the cell is a table
         * @param {element} node - Nodes to scan
         * @returns {Boolean}
         */
        isCell: function (node) {
            return node && /^(?:TD|TH)$/i.test(node.nodeName);
        },

        /**
         * @description Get all child nodes of the argument value element (Without text node)
         * @param {element} element - element to get child node
         * @param {(function|null)} validation - Conditional function
         * @returns {Array}
         */
        getListChildren: function (element, validation) {
            const children = [];
            validation = validation || function () { return true; };

            (function recursionFunc(current) {
                if (element !== current && validation(current)) {
                    children.push(current);
                }

                for (let i = 0, len = current.children.length; i < len; i++) {
                    recursionFunc(current.children[i]);
                }
            })(element);

            return children;
        },

        /**
         * @description Get all child nodes of the argument value element (Include text nodes)
         * @param {element} element - element to get child node
         * @param {(function|null)} validation - Conditional function
         * @returns {Array}
         */
        getListChildNodes: function (element, validation) {
            const children = [];
            validation = validation || function () { return true; };

            (function recursionFunc(current) {
                if (validation(current)) {
                    children.push(current);
                }

                for (let i = 0, len = current.childNodes.length; i < len; i++) {
                    recursionFunc(current.childNodes[i]);
                }
            })(element);

            return children;
        },

        /**
         * @description Argument value The argument value of the parent node of the element.
         * A tag that satisfies the query condition is imported.
         * @param {Node} element - Reference element
         * @param {string} query - Query String (tagName, .className, #ID, :name)
         * Not use it like jquery.
         * Only one condition can be entered at a time.
         * @returns {Element}
         */
        getParentNode: function (element, query) {
            let attr;

            if (/\./.test(query)) {
                attr = 'className';
                query = query.split('.')[1];
            } else if (/#/.test(query)) {
                attr = 'id';
                query = '^' + query.split('#')[1] + '$';
            } else if (/:/.test(query)) {
                attr = 'name';
                query = '^' + query.split(':')[1] + '$';
            } else {
                attr = 'tagName';
                query = '^' + query + '$';
            }

            const check = new RegExp(query, 'i');
            while (element && (element.nodeType === 3 || !check.test(element[attr]))) {
                if (/^BODY$/i.test(element.tagName)) {
                    return null;
                }
                element = element.parentNode;
            }

            return element;
        },

        /**
         * @description Set the text content value of the argument value element
         * @param {element} element - Element to replace text content
         * @param {String} txt - Text to be applied
         */
        changeTxt: function (element, txt) {
            if (!element || !txt) return;
            element.textContent = txt;
        },

        /**
         * @description Append the className value of the argument value element
         * @param {element} element - Elements to add class name
         * @param {string} className - Class name to be add
         */
        addClass: function (element, className) {
            if (!element) return;

            const check = new RegExp('(\\s|^)' + className + '(\\s|$)');
            if (check.test(element.className)) return;

            element.className += ' ' + className;
        },

        /**
         * @description Delete the className value of the argument value element
         * @param {element} element - Elements to remove class name
         * @param {string} className - Class name to be remove
         */
        removeClass: function (element, className) {
            if (!element) return;

            const check = new RegExp('(\\s|^)' + className + '(\\s|$)');
            element.className = element.className.replace(check, ' ').trim();
        },

        /**
         * @description Argument value If there is no class name, insert it and delete the class name if it exists
         * @param {element} element - Elements to replace class name
         * @param {string} className - Class name to be change
         */
        toggleClass: function (element, className) {
            if (!element) return;

            const check = new RegExp('(\\s|^)' + className + '(\\s|$)');
            if (check.test(element.className)) {
                element.className = element.className.replace(check, ' ').trim();
            }
            else {
                element.className += ' ' + className;
            }
        },

        /**
         * @description Delete argumenu value element
         * @param {element} item - Element to be remove
         */
        removeItem: function (item) {
            try {
                item.remove();
            } catch (e) {
                item.parentNode.removeChild(item);
            }
        }
    };

    /**
     * @description SunEditor core closure
     * @param context
     * @param dom
     * @param util
     * @returns {{save: save, getContent: getContent, setContent: setContent, appendContent: appendContent, disabled: disabled, enabled: enabled, show: show, hide: hide, destroy: destroy}}
     */
    const core = function (context, dom, util) {
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
             * @description loaded plugins
             */
            loadedPlugins: {},

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
                FONT: context.tool.font,
                B: context.tool.bold,
                U: context.tool.underline,
                I: context.tool.italic,
                STRIKE: context.tool.strike,
                SUB: context.tool.subscript,
                SUP: context.tool.superscript,
                SIZE: context.tool.fontSize
            },

            /**
             * @description Variables used internally in editor operation
             * @property {(element|null)} selectionNode - Contains selection node
             * @property {(element|null)} copySelection - The selection object is copied
             * @property {boolean} wysiwygActive - The wysiwyg frame or code view state
             * @property {boolean} isFullScreen - State of full screen
             * @property {number} innerHeight_fullScreen - InnerHeight in editor when in full screen
             * @property {number} resizeClientY - Remember the vertical size of the editor before resizing the editor (Used when calculating during resize operation)
             * @property {number} tabSize - Indented size when tab button clicked (4)
             * @property {element} originCssText - Remembered the CSS of the editor before full screen (Used when returning to original size again)
             * @property {number} editorHeight - The height value entered by the user or the height value of the "textarea" when the suneditor is created
             * @property {boolean} isTouchMove - Check if mobile has moved after touching (Allowing scrolling in the toolbar area)
             * @private
             */
            _variable: {
                selectionNode: null,
                copySelection: null,
                wysiwygActive: true,
                isFullScreen: false,
                innerHeight_fullScreen: 0,
                resizeClientY: 0,
                tabSize: 4,
                originCssText: context.element.topArea.style.cssText,
                editorHeight: context.user.height,
                isTouchMove: false
            },

            /**
             * @description Call the module
             * @param {string} directory - The directory(plugin/{directory}) of the js file to call
             * @param {string} moduleName - The name of the js file to call
             * @param {element} targetElement - If this is element, the element is inserted into the sibling node (submenu)
             * @param {function} callBackFunction - Function to be executed immediately after module call
             */
            callModule: function (directory, moduleName, targetElement, callBackFunction) {
                const fullDirectory = util.getBasePath + 'plugins/' + directory;
                const fileType = 'text/javascript';

                /** Dialog first call */
                if (directory === 'dialog') {
                    const dialogCallback = this._callBack_addModule.bind(this, 'dialog', 'dialog', targetElement, this.callModule.bind(this, directory, moduleName, targetElement, callBackFunction));

                    if (!SUNEDITOR.plugin.dialog) {
                        util.includeFile(fileType, (fullDirectory + '/dialog.js'), dialogCallback);
                        return;
                    }
                    else if (!this.loadedPlugins['dialog']) {
                        dialogCallback();
                        return;
                    }
                }

                /** etc */
                if (!SUNEDITOR.plugin[moduleName]) {
                    util.includeFile(fileType, (fullDirectory + '/' + moduleName + '.js'), this._callBack_addModule.bind(this, directory, moduleName, targetElement, callBackFunction));
                }
                else if (!this.loadedPlugins[moduleName]) {
                    this._callBack_addModule(directory, moduleName, targetElement, callBackFunction);
                }
                else {
                    if (typeof callBackFunction === 'function') callBackFunction();
                }
            },

            /**
             * @callback
             * @description After the module is added, call the main function and the callback function
             * @param {string} directory - The directory(plugin/{directory}) of the js file to call
             * @param {string} moduleName - The name of the js file to call
             * @param {element} targetElement - If this is element, the element is inserted into the sibling node (submenu)
             * @param {function} callBackFunction - Function to be executed immediately after module call
             * @private
             */
            _callBack_addModule: function (directory, moduleName, targetElement, callBackFunction) {
                if (!this.context[directory]) this.context[directory] = {};

                SUNEDITOR.plugin[moduleName].add(this, targetElement);
                this.loadedPlugins[moduleName] = true;

                if (typeof callBackFunction === 'function') callBackFunction();
            },

            /**
             * @description Enabled submenu
             * @param {element} element - Submenu element to call
             */
            submenuOn: function (element) {
                this.submenu = element.nextElementSibling;
                this.submenu.style.display = 'block';
                dom.addClass(element, 'on');
                this.submenuActiveButton = element;
            },

            /**
             * @description Disable submenu
             */
            submenuOff: function () {
                if (this.submenu) {
                    this.submenu.style.display = 'none';
                    this.submenu = null;
                    dom.removeClass(this.submenuActiveButton, 'on');
                    this.submenuActiveButton = null;
                }

                if (context.image && context.image._onCaption === true) {
                    SUNEDITOR.plugin.image.toggle_caption_contenteditable.call(editor, false);
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
                context.element.wysiwygWindow.document.execCommand(command, showDefaultUI, value);
            },

            /**
             * @description Focus to wysiwyg area
             */
            focus: function () {
                const caption = dom.getParentNode(this._variable.selectionNode, 'figcaption');
                if (caption) {
                    caption.focus();
                } else {
                    context.element.wysiwygWindow.document.body.focus();
                }
            },

            _setSelectionNode: function () {
                // IE
                this._variable.copySelection = util.copyObj(this.getSelection());

                const range = this.getRange();
                if (range.startContainer !== range.endContainer) {
                    this._variable.selectionNode = range.startContainer;
                } else {
                    this._variable.selectionNode = this.getSelectionNode();
                }
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
             * @description Create range object
             * @returns {Range}
             */
            createRange: function () {
                return context.element.wysiwygWindow.document.createRange();
            },

            /**
             * @description Get current selection object
             * @returns {Selection}
             */
            getSelection: function () {
                return context.element.wysiwygWindow.getSelection();
            },

            /**
             * @description Get current select node
             * @returns {Node}
             */
            getSelectionNode: function () {
                return this.getSelection().extentNode || this.getSelection().anchorNode;
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
                // IE
                else {
                    nativeRng = this.createRange();
                    selection = this._variable.copySelection;

                    if (!selection) {
                        selection = context.element.wysiwygWindow.document.body.firstChild;
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
             * @description Get line node of the paramater node value (P,Table, H1, H2, H3, H4, H5, H6)
             * @param {element|null} element - Reference element if null or no value, it is relative to the current focus node.
             * @returns {Element}
             */
            getLineElement: function (element) {
                element = element || this._variable.selectionNode;

                if (!element || /^(?:HTML|BODY)$/i.test(element.tagName)) {
                    element = context.element.wysiwygWindow.document.body.firstChild;
                } else {
                    while (!/^BODY$/i.test(element.parentNode.tagName)) {
                        element = element.parentNode;
                    }
                }

                return element;
            },

            /**
             * @description Append P tag to current line next
             * @param {element} element - Insert as siblings of that element
             * @returns {element}
             */
            appendP: function (element) {
                const oP = document.createElement('P');
                oP.innerHTML = '&#65279';

                element = this.getLineElement(element);
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

                const childNodes = dom.getListChildNodes(commonCon);
                let startIndex = dom.getArrayIndex(childNodes, startCon);
                let endIndex = dom.getArrayIndex(childNodes, endCon);

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
                        dom.removeItem(item);
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
                            dom.removeItem(startCon);
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
                            dom.removeItem(endCon);
                        }

                        continue;
                    }

                    dom.removeItem(item);
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
                        startCon.parentNode.insertBefore(newNode, startCon.nextSibling);
                    }
                    /** Select within the same node */
                    else {
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
                    if (!/BODY/i.test(commonCon.nodeName)) {
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
                        const lineNodes = dom.getListChildren(commonCon, function (current) {
                            return /^P$/i.test(current.nodeName);
                        });

                        let startLine = dom.getParentNode(startCon, 'P');
                        let endLine = dom.getParentNode(endCon, 'P');

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
                                dom.removeItem(pRemove);
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
                dom.removeItem(element);

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
                dom.removeItem(element);

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
                const p = dom.getParentNode(node, 'P');
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
            showBlocks: function () {
                SUNEDITOR.dom.toggleClass(context.element.wysiwygWindow.document.body, 'sun-editor-show-block');
            },

            /**
             * @description Changes to code view or wysiwyg view
             */
            showCodeView: function () {
                if (!this._variable.wysiwygActive) {
                    const ec = {'&amp;': '&', '&nbsp;': '\u00A0', /*"&quot;": "\"", */'&lt;': '<', '&gt;': '>'};
                    const code_html = context.element.code.value.replace(/&[a-z]+;/g, function (m) {
                        return (typeof ec[m] === 'string') ? ec[m] : m;
                    });
                    context.element.wysiwygWindow.document.body.innerHTML = code_html.trim().length > 0 ? code_html : '<p>&#65279</p>';
                    context.element.wysiwygWindow.document.body.scrollTop = 0;
                    context.element.code.style.display = 'none';
                    context.element.wysiwygElement.style.display = 'block';
                    this._variable.wysiwygActive = true;
                }
                else {
                    context.element.code.value = context.element.wysiwygWindow.document.body.innerHTML.trim().replace(/<\/p>(?=[^\n])/gi, '<\/p>\n');
                    context.element.wysiwygElement.style.display = 'none';
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

                    dom.removeClass(element.firstElementChild, 'ico_full_screen_e');
                    dom.addClass(element.firstElementChild, 'ico_full_screen_i');
                }
                else {
                    context.element.topArea.style.cssText = this._variable.originCssText;
                    context.element.editorArea.style.height = this._variable.editorHeight + 'px';

                    dom.removeClass(element.firstElementChild, 'ico_full_screen_i');
                    dom.addClass(element.firstElementChild, 'ico_full_screen_e');
                }

                this._variable.isFullScreen = !this._variable.isFullScreen;
            },

            /**
             * @description Opens the preview window
             */
            preview: function () {
                const WindowObject = window.open('', '_blank');
                WindowObject.mimeType = 'text/html';
                WindowObject.document.head.innerHTML = '' +
                    '<meta charset="utf-8" />' +
                    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
                    '<title>' + SUNEDITOR.lang.toolbar.preview + '</title>' +
                    '<link rel="stylesheet" type="text/css" href="' + util.getBasePath + 'css/suneditor-contents.css">';
                WindowObject.document.body.className = 'sun-editor-editable';
                WindowObject.document.body.innerHTML = context.element.wysiwygWindow.document.body.innerHTML;
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

            _findButtonEffectTag: function () {
                let selectionParent = editor._variable.selectionNode;
                let findFont = true;
                let findSize = true;
                let findA = true;
                let map = 'B|U|I|STRIKE|FONT|SIZE|SUB|SUP|';
                let check = new RegExp(map, 'i');
                let cssText;

                while (!/^(?:P|BODY|HTML|DIV)$/i.test(selectionParent.nodeName)) {
                    if (selectionParent.nodeType === 3) {
                        selectionParent = selectionParent.parentNode;
                        continue;
                    }

                    const nodeName = [(/^STRONG$/.test(selectionParent.nodeName) ? 'B' : (/^EM/.test(selectionParent.nodeName) ? 'I' : selectionParent.nodeName))];

                    /** Font */
                    if (findFont && selectionParent.nodeType === 1 && (selectionParent.style.fontFamily.length > 0 || (selectionParent.face && selectionParent.face.length > 0))) {
                        nodeName.push('FONT');
                        const selectFont = (selectionParent.style.fontFamily || selectionParent.face || SUNEDITOR.lang.toolbar.font).replace(/["']/g,'');
                        dom.changeTxt(editor.commandMap['FONT'], selectFont);
                        findFont = false;
                        map = map.replace('FONT' + '|', '');
                        check = new RegExp(map, 'i');
                    }

                    /** A */
                    if (findA && /^A$/i.test(selectionParent.nodeName) && selectionParent.getAttribute('data-image-link') === null) {
                        if (!context.link || editor.controllerArray[0] !== context.link.linkBtn) {
                            editor.callModule('dialog', 'link', null, function () {
                                SUNEDITOR.plugin.link.call_controller_linkButton.call(editor, selectionParent);
                            });
                        }
                        findA = false;
                    } else if (findA && context.link && editor.controllerArray[0] === context.link.linkBtn) {
                        editor.controllersOff();
                    }

                    /** span (font size) */
                    if (findSize && selectionParent.style.fontSize.length > 0) {
                        dom.changeTxt(editor.commandMap['SIZE'], selectionParent.style.fontSize.match(/\d+/)[0]);
                        findSize = false;
                        map = map.replace('SIZE|', '');
                        check = new RegExp(map, 'i');
                    }


                    /** command */
                    cssText = selectionParent.style.cssText;
                    if (/:\s*bold(?:;|\s)/.test(cssText)) nodeName.push('B');
                    if (/:\s*underline(?:;|\s)/.test(cssText)) nodeName.push('U');
                    if (/:\s*italic(?:;|\s)/.test(cssText)) nodeName.push('I');
                    if (/:\s*line-through(?:;|\s)/.test(cssText)) nodeName.push('STRIKE');

                    for (let i = 0; i < nodeName.length; i++) {
                        if (check.test(nodeName[i])) {
                            dom.addClass(editor.commandMap[nodeName[i]], 'on');
                            map = map.replace(nodeName[i] + '|', '');
                            check = new RegExp(map, 'i');
                        }
                    }

                    selectionParent = selectionParent.parentNode;
                }

                /** remove */
                if (findA) editor.controllersOff();

                map = map.split('|');
                for (let i = 0, len = map.length - 1; i < len; i++) {
                    if (/^FONT/i.test(map[i])) {
                        dom.changeTxt(editor.commandMap[map[i]], SUNEDITOR.lang.toolbar.font);
                    }
                    else if (/^SIZE$/i.test(map[i])) {
                        dom.changeTxt(editor.commandMap[map[i]], SUNEDITOR.lang.toolbar.fontSize);
                    }
                    else {
                        dom.removeClass(editor.commandMap[map[i]], 'on');
                    }
                }
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
                    const prevSubmenu = editor.submenu;
                    editor.submenuOff();

                    if (/submenu/.test(display) && (target.nextElementSibling === null || target.nextElementSibling !== prevSubmenu)) {
                        editor.callModule('submenu', command, target, function () {
                            editor.submenuOn(target);
                        });
                    }
                    else if (/dialog/.test(display)) {
                        editor.callModule('dialog', command, null, function () {
                            SUNEDITOR.plugin.dialog.openDialog.call(editor, command, target.getAttribute('data-option'), false);
                        });
                    }

                    return;
                }

                /** default command */
                if (command) {
                    switch (command) {
                        case 'codeView':
                            editor.showCodeView();
                            dom.toggleClass(target, 'on');
                            break;
                        case 'fullScreen':
                            editor.toggleFullScreen(target);
                            dom.toggleClass(target, 'on');
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
                            editor.preview();
                            break;
                        case 'print':
                            context.element.wysiwygWindow.print();
                            break;
                        case 'showBlocks':
                            editor.showBlocks();
                            dom.toggleClass(target, 'on');
                            break;
                        default :
                            editor.execCommand(command, false, target.getAttribute('data-value'));
                            dom.toggleClass(target, 'on');
                            if (/^subscript$/.test(command)) SUNEDITOR.dom.removeClass(context.tool.superscript, 'on');
                            else if (/^superscript$/.test(command)) SUNEDITOR.dom.removeClass(context.tool.subscript, 'on');
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
                    editor.callModule('dialog', 'image', null, function () {
                        const size = SUNEDITOR.plugin.dialog.call_controller_resize.call(editor, targetElement, 'image');
                        SUNEDITOR.plugin.image.onModifyMode.call(editor, targetElement, size);
                    });
                    return;
                }

                editor._setSelectionNode();
                event._findButtonEffectTag();
            },

            onKeyDown_wysiwyg: function (e) {
                editor._setSelectionNode();

                const keyCode = e.keyCode;
                const shift = e.shiftKey;
                const ctrl = e.ctrlKey || e.metaKey;
                const alt = e.altKey;
                e.stopPropagation();

                function shortcutCommand(keyCode) {
                    const key = event._shortcutKeyCode[keyCode];
                    if (!key) return false;

                    editor.execCommand(key[0], false, null);
                    dom.toggleClass(editor.commandMap[key[1]], 'on');

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
                        if (/^P$/i.test(editor._variable.selectionNode.tagName) && editor._variable.selectionNode.previousSibling === null) {
                            e.preventDefault();
                            return false;
                        }
                        break;
                    case 9:
                        /**tab key*/
                        e.preventDefault();
                        if (ctrl || alt) break;

                        let currentNode = editor._variable.selectionNode || editor.getSelection().anchorNode;
                        while (!/^TD$/i.test(currentNode.tagName) && !/^BODY$/i.test(currentNode.tagName)) {
                            currentNode = currentNode.parentNode;
                        }

                        if (currentNode && /^TD$/i.test(currentNode.tagName)) {
                            const table = dom.getParentNode(currentNode, 'table');
                            const cells = dom.getListChildren(table, dom.isCell);
                            let idx = shift ? dom.prevIdx(cells, currentNode) : dom.nextIdx(cells, currentNode);

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

                        const tabText = context.element.wysiwygWindow.document.createTextNode(new Array(editor._variable.tabSize + 1).join('\u00A0'));
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

                editor.callModule('dialog', 'image', null, function () {
                    editor.context.image.imgInputFile.files = files;
                    SUNEDITOR.plugin.image.onRender_imgInput.call(editor);
                    editor.context.image.imgInputFile.files = null;
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
        context.tool.bar.addEventListener('touchstart', event.touchstart_toolbar);
        context.tool.bar.addEventListener('touchmove', event.touchmove_toolbar);
        context.tool.bar.addEventListener('touchend', event.onClick_toolbar);
        context.tool.bar.addEventListener('click', event.onClick_toolbar);
        /** editor area */
        context.element.wysiwygWindow.addEventListener('mouseup', event.onMouseUp_wysiwyg);
        context.element.wysiwygWindow.addEventListener('keydown', event.onKeyDown_wysiwyg);
        context.element.wysiwygWindow.addEventListener('keyup', event.onKeyUp_wysiwyg);
        context.element.wysiwygWindow.addEventListener('scroll', event.onScroll_wysiwyg);
        context.element.wysiwygWindow.addEventListener('drop', event.onDrop_wysiwyg);
        /** resize bar */
        context.element.resizebar.addEventListener('mousedown', event.onMouseDown_resizeBar);
        /** window resize event */
        window.addEventListener('resize', event.resize_window);

        /** User function */
        return {
            /**
             * @description Copying the contents of the editor to the original textarea
             */
            save: function () {
                if (editor._variable.wysiwygActive) {
                    context.element.textElement.innerHTML = context.element.wysiwygWindow.document.body.innerHTML;
                } else {
                    context.element.textElement.innerHTML = context.element.code.value;
                }
            },

            /**
             * @description Gets the contents of the suneditor
             * @returns {String}
             */
            getContent: function () {
                let content = '';

                if (context.element.wysiwygWindow.document.body.innerText.trim().length === 0) return content;

                if (editor._variable.wysiwygActive) {
                    content = context.element.wysiwygWindow.document.body.innerHTML;
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
                    context.element.wysiwygWindow.document.body.innerHTML = innerHTML;
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
                    context.element.wysiwygWindow.document.body.appendChild(oP);
                } else {
                    context.element.code.value += content;
                }
            },

            /**
             * @description Disable the suneditor
             */
            disabled: function () {
                context.tool.cover.style.display = 'block';
                context.element.wysiwygWindow.document.body.setAttribute('contenteditable', false);
            },

            /**
             * @description Enabled the suneditor
             */
            enabled: function () {
                context.tool.cover.style.display = 'none';
                context.element.wysiwygWindow.document.body.setAttribute('contenteditable', true);
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
                context.element.topArea.parentNode.removeChild(context.element.topArea);
                context.element.textElement.style.display = '';

                this.save = null;
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

    /**
     * ↓↓↓↓↓↓ Create Suneditor ↓↓↓↓↓↓
     */
    SUNEDITOR.lang = SUNEDITOR.lang || SUNEDITOR.defaultLang;

    /**
     * @description Converts content into a format that can be placed in an editor
     * @param content - content
     * @returns {string}
     * @private
     */
    function _convertContentForEditor(content) {
        let tag, baseHtml, innerHTML = '';
        tag = document.createRange().createContextualFragment(content.trim()).childNodes;

        for (let i = 0, len = tag.length; i < len; i++) {
            baseHtml = tag[i].outerHTML || tag[i].textContent;
            if (!/^(?:P|TABLE|H[1-6]|DIV)$/i.test(tag[i].tagName)) {
                innerHTML += '<P>' + baseHtml + '</p>';
            } else {
                innerHTML += baseHtml;
            }
        }

        if (innerHTML.length === 0) innerHTML = '<p>&#65279</p>';

        return innerHTML;
    }

    /**
     * @description Suneditor's Default button list
     * @private
     */
    function _defaultButtonsList () {
        const lang = SUNEDITOR.lang;

        return {
            font: ['btn_font', lang.toolbar.font, 'font', 'submenu', '',
                '<span class="txt sun-editor-font-family">' + lang.toolbar.font + '</span><span class="ico_more"></span>'
            ],
            formats: ['btn_format', lang.toolbar.formats, 'formatBlock', 'submenu', '',
                '<span class="txt">' + lang.toolbar.formats + '</span><span class="ico_more"></span>'
            ],

            fontSize: ['btn_size', lang.toolbar.fontSize, 'fontSize', 'submenu', '',
                '<span class="txt sun-editor-font-size">' + lang.toolbar.fontSize + '</span><span class="ico_more"></span>'
            ],

            bold: ['sun-editor-id-bold', lang.toolbar.bold + '(Ctrl+B)', 'bold', '', '',
                '<div class="ico_bold"></div>'
            ],

            underline: ['sun-editor-id-underline', lang.toolbar.underline + '(Ctrl+U)', 'underline', '', '',
                '<div class="ico_underline"></div>'
            ],

            italic: ['sun-editor-id-italic', lang.toolbar.italic + '(Ctrl+I)', 'italic', '', '',
                '<div class="ico_italic"></div>'
            ],

            strike: ['sun-editor-id-strike', lang.toolbar.strike + '(Ctrl+SHIFT+S)', 'strikethrough', '', '',
                '<div class="ico_strike"></div>'
            ],

            subscript: ['sun-editor-id-subscript', lang.toolbar.subscript, 'subscript', '', '',
                '<div class="ico_subscript"></div>'
            ],

            superscript: ['sun-editor-id-superscript', lang.toolbar.superscript, 'superscript', '', '',
                '<div class="ico_superscript"></div>'
            ],

            removeFormat: ['', lang.toolbar.removeFormat, 'removeFormat', '', '',
                '<div class="ico_erase"></div>'
            ],

            fontColor: ['', lang.toolbar.fontColor, 'foreColor', 'submenu', '',
                '<div class="ico_foreColor"></div>'
            ],

            hiliteColor: ['', lang.toolbar.hiliteColor, 'hiliteColor', 'submenu', '',
                '<div class="ico_hiliteColor"></div>'
            ],

            indent: ['', lang.toolbar.indent + '(Ctrl + [)', 'indent', '', '',
                '<div class="ico_indnet"></div>'
            ],

            outdent: ['', lang.toolbar.outdent + '(Ctrl + ])', 'outdent', '', '',
                '<div class="ico_outdent"></div>'
            ],

            align: ['btn_align', lang.toolbar.align, 'align', 'submenu', '',
                '<div class="ico_align"></div>'
            ],

            list: ['', lang.toolbar.list, 'list', 'submenu', '',
                '<div class="ico_list_num"></div>'
            ],

            line: ['btn_line', lang.toolbar.line, 'horizontalRules', 'submenu', '',
                '<hr style="border-width: 1px 0 0; border-style: solid none none; border-color: black; border-image: initial; height: 1px;" />' +
                '<hr style="border-width: 1px 0 0; border-style: dotted none none; border-color: black; border-image: initial; height: 1px;" />' +
                '<hr style="border-width: 1px 0 0; border-style: dashed none none; border-color: black; border-image: initial; height: 1px;" />'
            ],

            table: ['', lang.toolbar.table, 'table', 'submenu', '',
                '<div class="ico_table"></div>'
            ],

            link: ['', lang.toolbar.link, 'link', 'dialog', '',
                '<div class="ico_url"></div>'
            ],

            image: ['', lang.toolbar.image, 'image', 'dialog', '',
                '<div class="ico_picture"></div>'
            ],

            video: ['', lang.toolbar.video, 'video', 'dialog', '',
                '<div class="ico_video"></div>'
            ],

            fullScreen: ['', lang.toolbar.fullScreen, 'fullScreen', '', '',
                '<div class="ico_full_screen_e"></div>'
            ],

            showBlocks: ['', lang.toolbar.showBlocks, 'showBlocks', '', '',
                '<div class="ico_showBlocks"></div>'
            ],

            codeView: ['', lang.toolbar.codeView, 'codeView', '', '',
                '<div class="ico_html"></div>'
            ],

            undo: ['', lang.toolbar.undo + ' (Ctrl+Z)', 'undo', '', '',
                '<div class="ico_undo"></div>'
            ],

            redo: ['', lang.toolbar.redo + ' (Ctrl+Y)', 'redo', '', '',
                '<div class="ico_redo"></div>'
            ],

            preview: ['', lang.toolbar.preview, 'preview', '', '',
                '<div class="ico_preview"></div>'
            ],

            print: ['', lang.toolbar.print, 'print', '', '',
                '<div class="ico_print"></div>'
            ]
        };
    }

    /**
     * @description Create a group div containing each module
     * @param {string} innerHTML - module button html
     * @returns {string}
     * @private
     */
    function _createModuleGroup(innerHTML) {
        if (!innerHTML) return '';
        return '<div class="tool_module"><ul class="editor_tool">' + innerHTML + '</ul></div>';
    }

    /**
     * @description Create a button element
     * @param {string} buttonClass - className in button
     * @param {string} title - Title in button
     * @param {string} dataCommand - The data-command property of the button
     * @param {string} dataDisplay - The data-display property of the button ('dialog', 'submenu')
     * @param {string} displayOption - Options for whether the range of the dialog is inside the editor or for the entire screen ('', 'full')
     * @param {string} innerHTML - Html in button
     * @returns {string}
     * @private
     */
    function _createButton(buttonClass, title, dataCommand, dataDisplay, displayOption, innerHTML) {
        return '' +
            '<li>' +
            '   <button type="button" class="btn_editor ' + buttonClass + '" title="' + title + '" data-command="' + dataCommand + '" data-display="' + dataDisplay + '" data-option="' + displayOption + '">' +
            innerHTML +
            '   </button>' +
            '</li>';
    }

    /**
     * @description Create editor HTML
     * @param {array} buttonList - option.buttonList
     * @private
     */
    function _createToolBar(buttonList) {
        let html = '<div class="sun-editor-id-toolbar-cover"></div>';
        let moduleHtml = null;

        /** create button list */
        let button = null;
        let module = null;
        const defaultButtonList = _defaultButtonsList();

        for (let i = 0; i < buttonList.length; i++) {

            const buttonGroup = buttonList[i];

            /** button object */
            if (typeof buttonGroup === 'object') {
                for (let j = 0; j < buttonGroup.length; j++) {

                    button = buttonGroup[j];
                    if (typeof button === 'object') {
                        module = [button.className, button.title, button.dataCommand, button.dataDisplay, button.displayOption, button.innerHTML];
                    } else {
                        module = defaultButtonList[button];
                    }

                    moduleHtml += _createButton(module[0], module[1], module[2], module[3], module[4], module[5]);
                }

                html += _createModuleGroup(moduleHtml);
                moduleHtml = null;
            }
            /** line break  */
            else if (/^\/$/.test(buttonGroup)) {
                html += '<div class="tool_module_enter"></div>';
            }
        }

        return html;
    }

    /**
     * @description document create - call _createToolBar()
     * @param {element} element - textarea
     * @param {json} options - user options
     * @returns {{constructed: {_top: HTMLElement, _relative: HTMLElement, _toolBar: HTMLElement, _editorArea: HTMLElement, _resizeBar: HTMLElement, _loading: HTMLElement, _resizeBack: HTMLElement}, options: *}}
     * @private
     */
    function _Constructor(element, options) {
        if (typeof options !== 'object') options = {};

        /** user options */
        options.addFont = options.addFont || null;
        options.videoX = options.videoX || 560;
        options.videoY = options.videoY || 315;
        options.imageFileInput = options.imageFileInput === undefined ? true : options.imageFileInput;
        options.imageUrlInput = (options.imageUrlInput === undefined || !options.imageFileInput) ? true : options.imageUrlInput;
        options.imageSize = options.imageSize || 350;
        options.imageUploadUrl = options.imageUploadUrl || null;
        options.fontList = options.fontList || null;
        options.fontSizeList = options.fontSizeList || null;
        options.height = /^\d+/.test(options.height) ? (/^\d+$/.test(options.height) ? options.height + 'px' : options.height) : element.clientHeight + 'px';
        options.buttonList = options.buttonList || [
            ['undo', 'redo'],
            ['font', 'fontSize', 'formats'],
            ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
            ['removeFormat'],
            '/',
            ['fontColor', 'hiliteColor'],
            ['indent', 'outdent'],
            ['align', 'line', 'list', 'table'],
            ['link', 'image', 'video'],
            ['fullScreen', 'showBlocks', 'codeView'],
            ['preview', 'print']
        ];

        /** editor seting options */
        options.width = /^\d+/.test(options.width) ? (/^\d+$/.test(options.width) ? options.width + 'px' : options.width) : (/%|auto/.test(element.style.width) ? element.style.width : element.clientWidth + 'px');
        options.display = options.display || (element.style.display === 'none' || !element.style.display ? 'block' : element.style.display);

        const doc = document;

        /** suneditor div */
        const top_div = doc.createElement('DIV');
        top_div.className = 'sun-editor';
        top_div.id = 'suneditor_' + element.id;
        top_div.style.width = options.width;
        top_div.style.display = options.display;

        /** relative div */
        const relative = doc.createElement('DIV');
        relative.className = 'sun-editor-container';

        /** tool bar */
        const tool_bar = doc.createElement('DIV');
        tool_bar.className = 'sun-editor-id-toolbar';
        tool_bar.innerHTML = _createToolBar(options.buttonList);

        /** inner editor div */
        const editor_div = doc.createElement('DIV');
        editor_div.className = 'sun-editor-id-editorArea';
        editor_div.style.height = options.height;

        /** iframe */
        const iframe = doc.createElement('IFRAME');
        iframe.allowFullscreen = true;
        iframe.frameBorder = 0;
        iframe.className = 'input_editor sun-editor-id-wysiwyg';
        iframe.style.display = 'block';

        /** textarea for code view */
        const textarea = doc.createElement('TEXTAREA');
        textarea.className = 'input_editor html sun-editor-id-code';
        textarea.style.display = 'none';

        iframe.addEventListener('load', function () {
            this.setAttribute('scrolling', 'auto');
            this.contentWindow.document.head.innerHTML = '' +
                '<meta charset="utf-8" />' +
                '<title>SunEditor</title>' +
                '<link rel="stylesheet" type="text/css" href="' + SUNEDITOR.util.getBasePath + 'css/suneditor-contents.css">';
            this.contentWindow.document.body.className = 'sun-editor-editable';
            this.contentWindow.document.body.setAttribute('contenteditable', true);

            this.contentWindow.document.body.innerHTML = _convertContentForEditor(element.value);
        });

        /** resize bar */
        const resize_bar = doc.createElement('DIV');
        resize_bar.className = 'sun-editor-id-resizeBar';

        /** loading box */
        const loading_box = doc.createElement('DIV');
        loading_box.className = 'sun-editor-id-loading';
        loading_box.innerHTML = '<div class="ico-loading"></div>';

        /** resize operation background */
        const resize_back = doc.createElement('DIV');
        resize_back.className = 'sun-editor-id-resize-background';

        /** append html */
        editor_div.appendChild(iframe);
        editor_div.appendChild(textarea);
        relative.appendChild(tool_bar);
        relative.appendChild(editor_div);
        relative.appendChild(resize_bar);
        relative.appendChild(resize_back);
        relative.appendChild(loading_box);
        top_div.appendChild(relative);

        return {
            constructed: {
                _top: top_div,
                _relative: relative,
                _toolBar: tool_bar,
                _editorArea: editor_div,
                _resizeBar: resize_bar,
                _loading: loading_box,
                _resizeBack: resize_back
            },
            options: options
        };
    }

    /**
     * @description Elements and variables you should have
     * @param {HTMLElement} element - textarea element
     * @param {object} cons - Toolbar element you created
     * @param {json} options - user options
     * @returns Elements, variables of the editor
     * @private
     */
    function _Context(element, cons, options) {
        return {
            element: {
                textElement: element,
                topArea: cons._top,
                relative: cons._relative,
                resizebar: cons._resizeBar,
                editorArea: cons._editorArea,
                wysiwygWindow: cons._editorArea.getElementsByClassName('sun-editor-id-wysiwyg')[0].contentWindow,
                wysiwygElement: cons._editorArea.getElementsByClassName('sun-editor-id-wysiwyg')[0],
                code: cons._editorArea.getElementsByClassName('sun-editor-id-code')[0],
                loading: cons._loading,
                resizeBackground: cons._resizeBack
            },
            tool: {
                bar: cons._toolBar,
                cover: cons._toolBar.getElementsByClassName('sun-editor-id-toolbar-cover')[0],
                bold: cons._toolBar.getElementsByClassName('sun-editor-id-bold')[0],
                underline: cons._toolBar.getElementsByClassName('sun-editor-id-underline')[0],
                italic: cons._toolBar.getElementsByClassName('sun-editor-id-italic')[0],
                strike: cons._toolBar.getElementsByClassName('sun-editor-id-strike')[0],
                subscript: cons._toolBar.getElementsByClassName('sun-editor-id-subscript')[0],
                superscript: cons._toolBar.getElementsByClassName('sun-editor-id-superscript')[0],
                font: cons._toolBar.getElementsByClassName('sun-editor-font-family')[0],
                fontSize: cons._toolBar.getElementsByClassName('sun-editor-font-size')[0]
            },
            user: {
                videoX: options.videoX,
                videoY: options.videoY,
                imageFileInput: options.imageFileInput,
                imageUrlInput: options.imageUrlInput,
                imageSize: options.imageSize,
                imageUploadUrl: options.imageUploadUrl,
                addFont: options.addFont,
                fontList: options.fontList,
                fontSizeList: options.fontSizeList,
                height: options.height.match(/\d+/)[0]
            }
        };
    }

    /**
     * @description Create the suneditor
     * @param {string} elementId - textarea Id
     * @param {json} options - user options
     * @returns {{save: save, getContent: getContent, setContent: setContent, appendContent: appendContent, disabled: disabled, enabled: enabled, show: show, hide: hide, destroy: destroy}}
     */
    SUNEDITOR.create = function (elementId, options) {
        const element = document.getElementById(elementId);

        if (element === null) {
            throw Error('[SUNEDITOR.create.fail] The element for that id was not found (ID:"' + elementId + '")');
        }

        const cons = _Constructor(element, options);

        if (document.getElementById(cons.constructed._top.id)) {
            throw Error('[SUNEDITOR.create.fail] The ID of the suneditor you are trying to create already exists (ID:"' + cons.constructed._top.id + '")');
        }

        element.style.display = 'none';

        /** Create to sibling node */
        if (typeof element.nextElementSibling === 'object') {
            element.parentNode.insertBefore(cons.constructed._top, element.nextElementSibling);
        } else {
            element.parentNode.appendChild(cons.constructed._top);
        }

        return core(_Context(element, cons.constructed, cons.options), SUNEDITOR.dom, SUNEDITOR.util);
    };

    /**
     * @description Destroy the suneditor
     * @param {string} elementId - textarea Id
     */
    SUNEDITOR.destroy = function (elementId) {
        const element = document.getElementById('suneditor_' + elementId);
        element.parentNode.removeChild(element);
        document.getElementById(elementId).style.display = '';
    };

})();
