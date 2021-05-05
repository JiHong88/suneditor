/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

/**
 * @description utility function
 */
const util = {
    _d: null,
    _w: null,
    isIE: null,
    isIE_Edge: null,
    isOSX_IOS: null,
    _propertiesInit: function () {
        if (this._d) return;
        this._d =  document;
        this._w = window;
        this.isIE = navigator.userAgent.indexOf('Trident') > -1;
        this.isIE_Edge = (navigator.userAgent.indexOf('Trident') > -1) || (navigator.appVersion.indexOf('Edge') > -1);
        this.isOSX_IOS = /(Mac|iPhone|iPod|iPad)/.test(navigator.platform);
    },

    _allowedEmptyNodeList: '.se-component, pre, blockquote, hr, li, table, img, iframe, video, audio, canvas',

    /**
     * @description HTML Reserved Word Converter.
     * @param {String} contents 
     * @returns {String} HTML string
     * @private
     */
    _HTMLConvertor: function (contents) {
        const ec = {'&': '&amp;', '\u00A0': '&nbsp;', '\'': '&apos;', '"': '&quot;', '<': '&lt;', '>': '&gt;'};
        return contents.replace(/&|\u00A0|'|"|<|>/g, function (m) {
            return (typeof ec[m] === 'string') ? ec[m] : m;
        });
    },

    /**
     * @description Unicode Character 'ZERO WIDTH SPACE' (\u200B)
     */
    zeroWidthSpace: String.fromCharCode(8203),

    /**
     * @description Regular expression to find 'zero width space' (/\u200B/g)
     */
    zeroWidthRegExp: new RegExp(String.fromCharCode(8203), 'g'),

    /**
     * @description Regular expression to find only 'zero width space' (/^\u200B+$/)
     */
    onlyZeroWidthRegExp: new RegExp('^' + String.fromCharCode(8203) + '+$'),

    /**
     * @description A method that checks If the text is blank or to see if it contains 'ZERO WIDTH SPACE' or empty (util.zeroWidthSpace)
     * @param {String|Node} text String value or Node
     * @returns {Boolean}
     */
    onlyZeroWidthSpace: function (text) {
        if (typeof text !== 'string') text = text.textContent;
        return text === '' || this.onlyZeroWidthRegExp.test(text);
    },

    /**
     * @description Gets XMLHttpRequest object
     * @returns {XMLHttpRequest|ActiveXObject}
     */
    getXMLHttpRequest: function () {
        /** IE */
        if (this._w.ActiveXObject) {
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
        else if (this._w.XMLHttpRequest) {
            return new XMLHttpRequest();
        }
        /** fail */
        else {
            return null;
        }
    },

    /**
     * @description Create Element node
     * @param {String} elementName Element name
     * @returns {Element}
     */
    createElement: function (elementName) {
        return this._d.createElement(elementName);
    },

    /**
     * @description Create text node
     * @param {String} text text contents
     * @returns {Node}
     */
    createTextNode: function (text) {
        return this._d.createTextNode(text || '');
    },

    /**
     * @description The editor checks tags by string.
     * If there is "<" or ">" in the attribute of tag, HTML is broken when checking the tag.
     * When using an attribute with "<" or ">", use "HTMLEncoder" to save. (ex: math(katex))
     * @param {String} contents HTML or Text string
     * @returns {String}
     */
    HTMLEncoder: function (contents) {
        const ec = {'<': '$lt;', '>': '$gt;'};
        return contents.replace(/<|>/g, function (m) {
            return (typeof ec[m] === 'string') ? ec[m] : m;
        });
    },

    /**
     * @description The editor checks tags by string.
     * If there is "<" or ">" in the attribute of tag, HTML is broken when checking the tag.
     * Decoder of data stored as "HTMLEncoder" (ex: math(katex))
     * @param {String} contents HTML or Text string
     * @returns {String}
     */
    HTMLDecoder: function (contents) {
        const ec = {'$lt;': '<', '$gt;': '>'};
        return contents.replace(/\$lt;|\$gt;/g, function (m) {
            return (typeof ec[m] === 'string') ? ec[m] : m;
        });
    },

    /**
     * @description This method run Object.prototype.hasOwnProperty.call(obj, key)
     * @param {Object} obj Object
     * @param {String} key obj.key
     * @returns {Boolean}
     */
    hasOwn: function (obj, key) {
        return this._hasOwn.call(obj, key);
    },
    _hasOwn: Object.prototype.hasOwnProperty,

    /**
     * @deprecated
     * @description Get the the tag path of the arguments value
     * If not found, return the first found value
     * @param {Array} nameArray File name array
     * @param {String} extension js, css
     * @returns {String}
     */
    getIncludePath: function (nameArray, extension) {
        let path = '';
        const pathList = [];
        const tagName = extension === 'js' ? 'script' : 'link';
        const src = extension === 'js' ? 'src' : 'href';
        
        let fileName = '(?:';
        for (let i = 0, len = nameArray.length; i < len; i++) {
            fileName += nameArray[i] + (i < len - 1 ? '|' : ')');
        }

        const regExp = new this._w.RegExp('(^|.*[\\/])' + fileName + '(\\.[^\\/]+)?\.' + extension + '(?:\\?.*|;.*)?$', 'i');
        const extRegExp = new this._w.RegExp('.+\\.' + extension + '(?:\\?.*|;.*)?$', 'i');
            
        for (let c = this._d.getElementsByTagName(tagName), i = 0; i < c.length; i++) {
            if (extRegExp.test(c[i][src])) {
                pathList.push(c[i]);
            }
        }

        for (let i = 0; i < pathList.length; i++) {
            let editorTag = pathList[i][src].match(regExp);
            if (editorTag) {
                path = editorTag[0];
                break;
            }
        }

        if (path === '') path = pathList.length > 0 ? pathList[0][src] : '';

        -1 === path.indexOf(':/') && '//' !== path.slice(0, 2) && (path = 0 === path.indexOf('/') ? location.href.match(/^.*?:\/\/[^\/]*/)[0] + path : location.href.match(/^[^\?]*\/(?:)/)[0] + path);

        if (!path) throw '[SUNEDITOR.util.getIncludePath.fail] The SUNEDITOR installation path could not be automatically detected. (name: +' + name + ', extension: ' + extension + ')';

        return path;
    },

    /**
     * @deprecated
     * @description Returns the CSS text that has been applied to the current page.
     * @param {Document|null} doc To get the CSS text of an document(core._wd). If null get the current document.
     * @returns {String} Styles string
     */
    getPageStyle: function (doc) {
        let cssText = '';
        const sheets = (doc || this._d).styleSheets;
        
        for (let i = 0, len = sheets.length, rules; i < len; i++) {
            try {
                rules = sheets[i].cssRules;
            } catch (e) {
                continue;
            }
            
            if (rules) {
                for (let c = 0, cLen = rules.length; c < cLen; c++) {
                    cssText += rules[c].cssText;
                }
            }
        }

        return cssText;
    },

    /**
     * @description Get the argument iframe's document object
     * @param {Element} iframe Iframe element (context.element.wysiwygFrame)
     * @returns {Document}
     */
    getIframeDocument: function (iframe) {
        let wDocument = iframe.contentWindow || iframe.contentDocument;
        if (wDocument.document) wDocument = wDocument.document;
        return wDocument;
    },

    /**
     * @description Get attributes of argument element to string ('class="---" name="---" ')
     * @param {Element} element Element object
     * @param {Array|null} exceptAttrs Array of attribute names to exclude from the result
     * @returns {String}
     */
    getAttributesToString: function (element, exceptAttrs) {
        if (!element.attributes) return '';

        const attrs = element.attributes;
        let attrString = '';

        for (let i = 0, len = attrs.length; i < len; i++) {
            if (exceptAttrs && exceptAttrs.indexOf(attrs[i].name) > -1) continue;
            attrString += attrs[i].name + '="' + attrs[i].value + '" ';
        }

        return attrString;
    },

    /**
     * @descriptionGets Get the length in bytes of a string.
     * referencing code: "https://github.com/shaan1974/myrdin/blob/master/expressions/string.js#L11"
     * @param {String} text String text
     * @returns {Number}
     */
    getByteLength: function(text) {
        if (!text || !text.toString) return 0;
        text = text.toString();

        const encoder = this._w.encodeURIComponent;
        let cr, cl;
        if (this.isIE_Edge) {
            cl = this._w.unescape(encoder(text)).length;
            cr = 0;

            if (encoder(text).match(/(%0A|%0D)/gi) !== null) {
                cr = encoder(text).match(/(%0A|%0D)/gi).length;
            }

            return cl + cr;
        } else {
            cl = (new this._w.TextEncoder('utf-8').encode(text)).length;
            cr = 0;

            if (encoder(text).match(/(%0A|%0D)/gi) !== null) {
                cr = encoder(text).match(/(%0A|%0D)/gi).length;
            }

            return cl + cr;
        }
    },

    /**
     * @description It is judged whether it is the edit region top div element or iframe's body tag.
     * @param {Node} element The node to check
     * @returns {Boolean}
     */
    isWysiwygDiv: function (element) {
        return element && element.nodeType === 1 && (this.hasClass(element, 'se-wrapper-wysiwyg') || /^BODY$/i.test(element.nodeName));
    },

    /**
     * @description It is judged whether it is the contenteditable property is false.
     * @param {Node} element The node to check
     * @returns {Boolean}
     */
    isNonEditable: function (element) {
        return element && element.nodeType === 1 && element.getAttribute('contenteditable') === 'false';
    },

    /**
     * @description It is judged whether it is a node related to the text style.
     * (strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label|code)
     * @param {Node} element The node to check
     * @returns {Boolean}
     */
    isTextStyleElement: function (element) {
        return element && element.nodeType !== 3 && /^(strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label|code)$/i.test(element.nodeName);
    },

    /**
     * @description It is judged whether it is the format element (P, DIV, H[1-6], PRE, LI | class="__se__format__replace_xxx")
     * Format element also contain "free format Element"
     * @param {Node} element The node to check
     * @returns {Boolean}
     */
    isFormatElement: function (element) {
        return element && element.nodeType === 1 && (/^(P|DIV|H[1-6]|PRE|LI|TH|TD)$/i.test(element.nodeName) || this.hasClass(element, '(\\s|^)__se__format__replace_.+(\\s|$)|(\\s|^)__se__format__free_.+(\\s|$)')) && !this.isComponent(element) && !this.isWysiwygDiv(element);
    },

    /**
     * @description It is judged whether it is the range format element. (BLOCKQUOTE, OL, UL, FIGCAPTION, TABLE, THEAD, TBODY, TR, TH, TD | class="__se__format__range_xxx")
     * Range format element is wrap the "format element" and "component"
     * @param {Node} element The node to check
     * @returns {Boolean}
     */
    isRangeFormatElement: function (element) {
        return element && element.nodeType === 1 && (/^(BLOCKQUOTE|OL|UL|FIGCAPTION|TABLE|THEAD|TBODY|TR|TH|TD)$/i.test(element.nodeName) || this.hasClass(element, '(\\s|^)__se__format__range_.+(\\s|$)'));
    },

    /**
     * @description It is judged whether it is the closure range format element. (TH, TD | class="__se__format__range__closure_xxx")
     * Closure range format elements is included in the range format element.
     *  - Closure range format element is wrap the "format element" and "component"
     * ※ You cannot exit this format with the Enter key or Backspace key.
     * ※ Use it only in special cases. ([ex] format of table cells)
     * @param {Node} element The node to check
     * @returns {Boolean}
     */
    isClosureRangeFormatElement: function (element) {
        return element && element.nodeType === 1 && (/^(TH|TD)$/i.test(element.nodeName) || this.hasClass(element, '(\\s|^)__se__format__range__closure_.+(\\s|$)'));
    },

    /**
     * @description It is judged whether it is the free format element. (PRE | class="__se__format__free_xxx")
     * Free format elements is included in the format element.
     * Free format elements's line break is "BR" tag.
     * ※ Entering the Enter key in the space on the last line ends "Free Format" and appends "Format".
     * @param {Node} element The node to check
     * @returns {Boolean}
     */
    isFreeFormatElement: function (element) {
        return element && element.nodeType === 1 && (/^PRE$/i.test(element.nodeName) || this.hasClass(element, '(\\s|^)__se__format__free_.+(\\s|$)')) && !this.isComponent(element) && !this.isWysiwygDiv(element);
    },

    /**
     * @description It is judged whether it is the closure free format element. (class="__se__format__free__closure_xxx")
     * Closure free format elements is included in the free format element.
     *  - Closure free format elements's line break is "BR" tag.
     * ※ You cannot exit this format with the Enter key or Backspace key.
     * ※ Use it only in special cases. ([ex] format of table cells)
     * @param {Node} element The node to check
     * @returns {Boolean}
     */
    isClosureFreeFormatElement: function (element) {
        return element && element.nodeType === 1 && this.hasClass(element, '(\\s|^)__se__format__free__closure_.+(\\s|$)');
    },

    /**
     * @description It is judged whether it is the component[img, iframe, video, audio, table] cover(class="se-component") and table, hr
     * @param {Node} element The node to check
     * @returns {Boolean}
     */
    isComponent: function (element) {
        return element && (/se-component/.test(element.className) || /^(TABLE|HR)$/.test(element.nodeName));
    },

    /**
     * @description Checks for "__se__uneditable" in the class list.
     * Components with class "__se__uneditable" cannot be modified.
     * @param {Element} element The element to check
     * @returns {Boolean}
     */
    isUneditableComponent: function (element) {
        return element && this.hasClass(element, '__se__uneditable');
    },

    /**
     * @description It is judged whether it is the component [img, iframe] cover(class="se-component")
     * @param {Node} element The node to check
     * @returns {Boolean}
     */
    isMediaComponent: function (element) {
        return element && /se-component/.test(element.className);
    },

    /**
     * @description It is judged whether it is the not checking node. (class="katex", "__se__tag")
     * @param {Node} element The node to check
     * @returns {Boolean}
     */
    isNotCheckingNode: function (element) {
        return element && /katex|__se__tag/.test(element.className);
    },

    /**
     * @description If a parent node that contains an argument node finds a format node (util.isFormatElement), it returns that node.
     * @param {Node} element Reference node.
     * @param {Function|null} validation Additional validation function.
     * @returns {Element|null}
     */
    getFormatElement: function (element, validation) {
        if (!element) return null;
        if (!validation) {
            validation = function () { return true; };
        }

        while (element) {
            if (this.isWysiwygDiv(element)) return null;
            if (this.isRangeFormatElement(element)) element.firstElementChild;
            if (this.isFormatElement(element) && validation(element)) return element;

            element = element.parentNode;
        }
        
        return null;
    },

    /**
     * @description If a parent node that contains an argument node finds a format node (util.isRangeFormatElement), it returns that node.
     * @param {Node} element Reference node.
     * @param {Function|null} validation Additional validation function.
     * @returns {Element|null}
     */
    getRangeFormatElement: function (element, validation) {
        if (!element) return null;
        if (!validation) {
            validation = function () { return true; };
        }

        while (element) {
            if (this.isWysiwygDiv(element)) return null;
            if (this.isRangeFormatElement(element) && !/^(THEAD|TBODY|TR)$/i.test(element.nodeName) && validation(element)) return element;
            element = element.parentNode;
        }

        return null;
    },

    /**
     * @description If a parent node that contains an argument node finds a free format node (util.isFreeFormatElement), it returns that node.
     * @param {Node} element Reference node.
     * @param {Function|null} validation Additional validation function.
     * @returns {Element|null}
     */
    getFreeFormatElement: function (element, validation) {
        if (!element) return null;
        if (!validation) {
            validation = function () { return true; };
        }

        while (element) {
            if (this.isWysiwygDiv(element)) return null;
            if (this.isFreeFormatElement(element) && validation(element)) return element;

            element = element.parentNode;
        }
        
        return null;
    },

    /**
     * @description If a parent node that contains an argument node finds a closure free format node (util.isClosureFreeFormatElement), it returns that node.
     * @param {Node} element Reference node.
     * @param {Function|null} validation Additional validation function.
     * @returns {Element|null}
     */
    getClosureFreeFormatElement: function (element, validation) {
        if (!element) return null;
        if (!validation) {
            validation = function () { return true; };
        }

        while (element) {
            if (this.isWysiwygDiv(element)) return null;
            if (this.isClosureFreeFormatElement(element) && validation(element)) return element;

            element = element.parentNode;
        }
        
        return null;
    },

    /**
     * @description Add style and className of copyEl to originEl
     * @param {Element} originEl Origin element
     * @param {Element} copyEl Element to copy
     */
    copyTagAttributes: function (originEl, copyEl) {
        if (copyEl.style.cssText) {
            originEl.style.cssText += copyEl.style.cssText;
        }

        const classes = copyEl.classList;
        for (let i = 0, len = classes.length; i < len; i++) {
            this.addClass(originEl, classes[i]);
        }

        if (!originEl.style.cssText) originEl.removeAttribute('style');
        if (!originEl.className.trim()) originEl.removeAttribute('class');
    },

    /**
     * @description Copy and apply attributes of format tag that should be maintained. (style, class) Ignore "__se__format__" class
     * @param {Element} originEl Origin element
     * @param {Element} copyEl Element to copy
     */
    copyFormatAttributes: function (originEl, copyEl) {
        copyEl = copyEl.cloneNode(false);
        copyEl.className = copyEl.className.replace(/(\s|^)__se__format__[^\s]+/g, '');
        this.copyTagAttributes(originEl, copyEl);
    },

    /**
     * @description Get the item from the array that matches the condition.
     * @param {Array|HTMLCollection|NodeList} array Array to get item
     * @param {Function|null} validation Conditional function
     * @param {Boolean} multi If true, returns all items that meet the criteria otherwise, returns an empty array.
     * If false, returns only one item that meet the criteria otherwise return null.
     * @returns {Array|Node|null}
     */
    getArrayItem: function (array, validation, multi) {
        if (!array || array.length === 0) return null;

        validation = validation || function () { return true; };
        const arr = [];
        
        for (let i = 0, len = array.length, a; i < len; i++) {
            a = array[i];
            if (validation(a)) {
                if (!multi) return a;
                else arr.push(a);
            }
        }

        return !multi ? null : arr;
    },

    /**
     * @description Get the index of the argument value in the element array
     * @param {Array|HTMLCollection|NodeList} array element array
     * @param {Node} element The element to find index
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
     * @param {Array|HTMLCollection|NodeList} array element array
     * @param {Node} item The element to find index
     * @returns {Number}
     */
    nextIdx: function (array, item) {
        let idx = this.getArrayIndex(array, item);
        if (idx === -1) return -1;
        return idx + 1;
    },

    /**
     * @description Get the previous index of the argument value in the element array
     * @param {Array|HTMLCollection|NodeList} array Element array
     * @param {Node} item The element to find index
     * @returns {Number}
     */
    prevIdx: function (array, item) {
        let idx = this.getArrayIndex(array, item);
        if (idx === -1) return -1;
        return idx - 1;
    },

    /**
     * @description Returns the index compared to other sibling nodes.
     * @param {Node} node The Node to find index
     * @returns {Number}
     */
    getPositionIndex: function (node) {
        let idx = 0;
        while ((node = node.previousSibling)) {
            idx += 1;
        }
        return idx;
    },

    /**
     * @description Returns the position of the "node" in the "parentNode" in a numerical array.
     * ex) <p><span>aa</span><span>bb</span></p> : getNodePath(node: "bb", parentNode: "<P>") -> [1, 0]
     * @param {Node} node The Node to find position path
     * @param {Node|null} parentNode Parent node. If null, wysiwyg div area
     * @param {Object|null} _newOffsets If you send an object of the form "{s: 0, e: 0}", the text nodes that are attached together are merged into one, centered on the "node" argument.
     * "_newOffsets.s" stores the length of the combined characters after "node" and "_newOffsets.e" stores the length of the combined characters before "node".
     * Do not use unless absolutely necessary.
     * @returns {Array}
     */
    getNodePath: function (node, parentNode, _newOffsets) {
        const path = [];
        let finds = true;

        this.getParentElement(node, function (el) {
            if (el === parentNode) finds = false;
            if (finds && !this.isWysiwygDiv(el)) {
                // merge text nodes
                if (_newOffsets && el.nodeType === 3) {
                    let temp = null, tempText = null;
                    _newOffsets.s = _newOffsets.e = 0;

                    let previous = el.previousSibling;
                    while (previous && previous.nodeType === 3) {
                        tempText = previous.textContent.replace(this.zeroWidthRegExp, '');
                        _newOffsets.s += tempText.length;
                        el.textContent = tempText + el.textContent;
                        temp = previous;
                        previous = previous.previousSibling;
                        this.removeItem(temp);
                    }

                    let next = el.nextSibling;
                    while (next && next.nodeType === 3) {
                        tempText = next.textContent.replace(this.zeroWidthRegExp, '');
                        _newOffsets.e += tempText.length;
                        el.textContent += tempText;
                        temp = next;
                        next = next.nextSibling;
                        this.removeItem(temp);
                    }
                }

                // index push
                path.push(el);
            }
            return false;
        }.bind(this));
        
        return path.map(this.getPositionIndex).reverse();
    },

    /**
     * @description Returns the node in the location of the path array obtained from "util.getNodePath".
     * @param {Array} offsets Position array, array obtained from "util.getNodePath"
     * @param {Node} parentNode Base parent element
     * @returns {Node}
     */
    getNodeFromPath: function (offsets, parentNode) {
        let current = parentNode;
        let nodes;

        for (let i = 0, len = offsets.length; i < len; i++) {
            nodes = current.childNodes;
            if (nodes.length === 0) break;
            if (nodes.length <= offsets[i]) {
                current = nodes[nodes.length - 1];
            } else {
                current = nodes[offsets[i]];
            }
        }

        return current;
    },

    /**
     * @description Compares the style and class for equal values.
     * Returns true if both are text nodes.
     * @param {Node} a Node to compare
     * @param {Node} b Node to compare
     * @returns {Boolean}
     */
    isSameAttributes: function (a, b) {
        if (a.nodeType === 3 && b.nodeType === 3) return true;
        if (a.nodeType === 3 || b.nodeType === 3) return false;

        const style_a = a.style;
        const style_b = b.style;
        let compStyle = 0;

        for (let i = 0, len = style_a.length; i < len; i++) {
            if (style_a[style_a[i]] === style_b[style_a[i]]) compStyle++;
        }

        const class_a = a.classList;
        const class_b = b.classList;
        const reg = this._w.RegExp;
        let compClass = 0;

        for (let i = 0, len = class_a.length; i < len; i++) {
            if (reg('(\s|^)' + class_a[i] + '(\s|$)').test(class_b.value)) compClass++;
        }

        return (compStyle === style_b.length && compStyle === style_a.length) && (compClass === class_b.length && compClass === class_a.length);
    },

    /**
     * @description Check the line element(util.isFormatElement) is empty.
     * @param {Element} element Format element node
     * @returns {Boolean}
     */
    isEmptyLine: function (element) {
        return !element || !element.parentNode || (!element.querySelector('IMG, IFRAME, AUDIO, VIDEO, CANVAS, TABLE') && this.onlyZeroWidthSpace(element.textContent));
    },

    /**
     * @description Check the node is a list (ol, ul)
     * @param {Node|String} node The element or element name to check
     * @returns {Boolean}
     */
    isList: function (node) {
        return node && /^(OL|UL)$/i.test(typeof node === 'string' ? node : node.nodeName);
    },

    /**
     * @description Check the node is a list cell (li)
     * @param {Node|String} node The element or element name to check
     * @returns {Boolean}
     */
    isListCell: function (node) {
        return node && /^LI$/i.test(typeof node === 'string' ? node : node.nodeName);
    },

    /**
     * @description Check the node is a table (table, thead, tbody, tr, th, td)
     * @param {Node|String} node The element or element name to check
     * @returns {Boolean}
     */
    isTable: function (node) {
        return node && /^(TABLE|THEAD|TBODY|TR|TH|TD)$/i.test(typeof node === 'string' ? node : node.nodeName);
    },

    /**
     * @description Check the node is a table cell (td, th)
     * @param {Node|String} node The element or element name to check
     * @returns {Boolean}
     */
    isCell: function (node) {
        return node && /^(TD|TH)$/i.test(typeof node === 'string' ? node : node.nodeName);
    },

    /**
     * @description Check the node is a break node (BR)
     * @param {Node|String} node The element or element name to check
     * @returns {Boolean}
     */
    isBreak: function (node) {
        return node && /^BR$/i.test(typeof node === 'string' ? node : node.nodeName);
    },


    /**
     * @description Check the node is a anchor node (A)
     * @param {Node|String} node The element or element name to check
     * @returns {Boolean}
     */
    isAnchor: function (node) {
        return node && /^A$/i.test(typeof node === 'string' ? node : node.nodeName);
    },

    /**
     * @description Check the node is a media node (img, iframe, audio, video, canvas)
     * @param {Node|String} node The element or element name to check
     * @returns {Boolean}
     */
    isMedia: function (node) {
        return node && /^(IMG|IFRAME|AUDIO|VIDEO|CANVAS)$/i.test(typeof node === 'string' ? node : node.nodeName);
    },

    /**
     * @description Checks for numeric (with decimal point).
     * @param {String|Number} text Text string or number
     * @returns {Boolean}
     */
    isNumber: function (text) {
        return !!text && /^-?\d+(\.\d+)?$/.test(text + '');
    },

    /**
     * @description Get a number.
     * @param {String|Number} text Text string or number
     * @param {Number} maxDec Maximum number of decimal places (-1 : Infinity)
     * @returns {Number}
     */
    getNumber: function (text, maxDec) {
        if (!text) return 0;
        
        let number = (text + '').match(/-?\d+(\.\d+)?/);
        if (!number || !number[0]) return 0;

        number = number[0];
        return maxDec < 0 ? number * 1 : maxDec === 0 ? this._w.Math.round(number * 1) : (number * 1).toFixed(maxDec) * 1;
    },

    /**
     * @description Get all "children" of the argument value element (Without text nodes)
     * @param {Element} element element to get child node
     * @param {Function|null} validation Conditional function
     * @returns {Array}
     */
    getListChildren: function (element, validation) {
        const children = [];
        if (!element || !element.children || element.children.length === 0) return children;

        validation = validation || function () { return true; };

        (function recursionFunc(current) {
            if (element !== current && validation(current)) {
                children.push(current);
            }

            if (!!current.children) {
                for (let i = 0, len = current.children.length; i < len; i++) {
                    recursionFunc(current.children[i]);
                }
            }
        })(element);

        return children;
    },

    /**
     * @description Get all "childNodes" of the argument value element (Include text nodes)
     * @param {Node} element element to get child node
     * @param {Function|null} validation Conditional function
     * @returns {Array}
     */
    getListChildNodes: function (element, validation) {
        const children = [];
        if (!element || element.childNodes.length === 0) return children;

        validation = validation || function () { return true; };

        (function recursionFunc(current) {
            if (element !== current && validation(current)) {
                children.push(current);
            }

            for (let i = 0, len = current.childNodes.length; i < len; i++) {
                recursionFunc(current.childNodes[i]);
            }
        })(element);

        return children;
    },

    /**
     * @description Returns the number of parents nodes.
     * "0" when the parent node is the WYSIWYG area.
     * "-1" when the element argument is the WYSIWYG area.
     * @param {Node} element The element to check
     * @returns {Number}
     */
    getElementDepth: function (element) {
        if (!element || this.isWysiwygDiv(element)) return -1;

        let depth = 0;
        element = element.parentNode;

        while (element && !this.isWysiwygDiv(element)) {
            depth += 1;
            element = element.parentNode;
        }

        return depth;
    },

    /**
     * @description Compares two elements to find a common ancestor, and returns the order of the two elements.
     * @param {Node} a Node to compare.
     * @param {Node} b Node to compare.
     * @returns {Object} { ancesstor, a, b, result: (a > b ? 1 : a < b ? -1 : 0) };
     */
    compareElements: function (a, b) {
        let aNode = a, bNode = b;
        while (aNode && bNode && aNode.parentNode !== bNode.parentNode) {
            aNode = aNode.parentNode;
            bNode = bNode.parentNode;
        }

        if (!aNode || !bNode) return { ancestor: null, a: a, b: b, result: 0 };

        const children = aNode.parentNode.childNodes;
        const aIndex = this.getArrayIndex(children, aNode);
        const bIndex = this.getArrayIndex(children, bNode);

        return {
            ancestor: aNode.parentNode,
            a: aNode,
            b: bNode,
            result: aIndex > bIndex ? 1 : aIndex < bIndex ? -1 : 0
        };
    },

    /**
     * @description Get the parent element of the argument value.
     * A tag that satisfies the query condition is imported.
     * Returns null if not found.
     * @param {Node} element Reference element
     * @param {String|Function} query Query String (nodeName, .className, #ID, :name) or validation function.
     * Not use it like jquery.
     * Only one condition can be entered at a time.
     * @returns {Element|null}
     */
    getParentElement: function (element, query) {
        let check;

        if (typeof query === 'function') {
            check = query;
        } else {
            let attr;
            if (/^\./.test(query)) {
                attr = 'className';
                query = query.split('.')[1];
            } else if (/^#/.test(query)) {
                attr = 'id';
                query = '^' + query.split('#')[1] + '$';
            } else if (/^:/.test(query)) {
                attr = 'name';
                query = '^' + query.split(':')[1] + '$';
            } else {
                attr = 'nodeName';
                query = '^' + query + '$';
            }

            const regExp = new this._w.RegExp(query, 'i');
            check = function (el) {
                return regExp.test(el[attr]);
            };
        }

        while (element && !check(element)) {
            if (this.isWysiwygDiv(element)) {
                return null;
            }
            element = element.parentNode;
        }

        return element;
    },

    /**
     * @description Get the child element of the argument value.
     * A tag that satisfies the query condition is imported.
     * Returns null if not found.
     * @param {Node} element Reference element
     * @param {String|Function} query Query String (nodeName, .className, #ID, :name) or validation function.
     * @param {Boolean} last If true returns the last node among the found child nodes. (default: first node)
     * Not use it like jquery.
     * Only one condition can be entered at a time.
     * @returns {Element|null}
     */
    getChildElement: function (element, query, last) {
        let check;

        if (typeof query === 'function') {
            check = query;
        } else {
            let attr;
            if (/^\./.test(query)) {
                attr = 'className';
                query = query.split('.')[1];
            } else if (/^#/.test(query)) {
                attr = 'id';
                query = '^' + query.split('#')[1] + '$';
            } else if (/^:/.test(query)) {
                attr = 'name';
                query = '^' + query.split(':')[1] + '$';
            } else {
                attr = 'nodeName';
                query = '^' + (query === 'text' ? '#' + query : query) + '$';
            }

            const regExp = new this._w.RegExp(query, 'i');
            check = function (el) {
                return regExp.test(el[attr]);
            };
        }

        const childList = this.getListChildNodes(element, function (current) {
            return check(current);
        });

        return childList[last ? childList.length - 1 : 0];
    },

    /**
     * @description 1. The first node of all the child nodes of the "first" element is returned.
     * 2. The last node of all the child nodes of the "last" element is returned.
     * 3. When there is no "last" element, the first and last nodes of all the children of the "first" element are returned.
     * { sc: "first", ec: "last" }
     * @param {Node} first First element
     * @param {Node|null} last Last element
     * @returns {Object}
     */
    getEdgeChildNodes: function (first, last) {
        if (!first) return;
        if (!last) last = first;

        while (first && first.nodeType === 1 && first.childNodes.length > 0 && !this.isBreak(first)) first = first.firstChild;
        while (last && last.nodeType === 1 && last.childNodes.length > 0 &&  !this.isBreak(last)) last = last.lastChild;

        return {
            sc: first,
            ec: last || first
        };
    },

    /**
     * @description Returns the position of the left and top of argument. {left:0, top:0}
     * @param {Node} element Target node
     * @param {Element|null} wysiwygFrame When use iframe option, iframe object should be sent (context.element.wysiwygFrame)
     * @returns {Object}
     */
    getOffset: function (element, wysiwygFrame) {
        let offsetLeft = 0;
        let offsetTop = 0;
        let offsetElement = element.nodeType === 3 ? element.parentElement : element;
        const wysiwyg = this.getParentElement(element, this.isWysiwygDiv.bind(this));

        while (offsetElement && !this.hasClass(offsetElement, 'se-container') && offsetElement !== wysiwyg) {
            offsetLeft += offsetElement.offsetLeft;
            offsetTop += offsetElement.offsetTop;
            offsetElement = offsetElement.offsetParent;
        }

        const iframe = wysiwygFrame && /iframe/i.test(wysiwygFrame.nodeName);

        return {
            left: offsetLeft + (iframe ? wysiwygFrame.parentElement.offsetLeft : 0),
            top: (offsetTop - (wysiwyg ? wysiwyg.scrollTop : 0)) + (iframe ? wysiwygFrame.parentElement.offsetTop : 0)
        };
    },

    /**
     * @description It compares the start and end indexes of "a" and "b" and returns the number of overlapping indexes in the range.
     * ex) 1, 5, 4, 6 => "2" (4 ~ 5)
     * @param {Number} aStart Start index of "a"
     * @param {Number} aEnd End index of "a"
     * @param {Number} bStart Start index of "b"
     * @param {Number} bEnd Start index of "b"
     * @returns {Number}
     */
    getOverlapRangeAtIndex: function (aStart, aEnd, bStart, bEnd) {
        if (aStart <= bEnd ? aEnd < bStart : aEnd > bStart) return 0;

        const overlap = (aStart > bStart ? aStart : bStart) - (aEnd < bEnd ? aEnd : bEnd);
        return (overlap < 0 ? overlap * -1 : overlap) + 1;
    },

    /**
     * @description Set the text content value of the argument value element
     * @param {Node} element Element to replace text content
     * @param {String} txt Text to be applied
     */
    changeTxt: function (element, txt) {
        if (!element || !txt) return;
        element.textContent = txt;
    },

    /**
     * @description Replace element
     * @param {Element} element Target element
     * @param {String|Element} newElement String or element of the new element to apply
     */
    changeElement: function (element, newElement) {
        if (typeof newElement === 'string') {
            if (element.outerHTML) {
                element.outerHTML = newElement;
            } else {
                const doc = this.createElement('DIV');
                doc.innerHTML = newElement;
                newElement = doc.firstChild;
                element.parentNode.replaceChild(newElement, element);
            }
        } else if (newElement.nodeType === 1) {
            element.parentNode.replaceChild(newElement, element);
        }
    },

    /**
     * @description Set style, if all styles are deleted, the style properties are deleted.
     * @param {Element} element Element to set style
     * @param {String} styleName Style attribute name (marginLeft, textAlign...)
     * @param {String|Number} value Style value
     */
    setStyle: function (element, styleName, value) {
        element.style[styleName] = value;

        if (!value && !element.style.cssText) {
            element.removeAttribute('style');
        }
    },

    /**
     * @description Determine whether any of the matched elements are assigned the given class
     * @param {Element} element Elements to search class name
     * @param {String} className Class name to search for
     * @returns {Boolean}
     */
    hasClass: function (element, className) {
        if (!element) return;

        return (new this._w.RegExp(className)).test(element.className);
    },

    /**
     * @description Append the className value of the argument value element
     * @param {Element} element Elements to add class name
     * @param {String} className Class name to be add
     */
    addClass: function (element, className) {
        if (!element) return;

        const check = new this._w.RegExp('(\\s|^)' + className + '(\\s|$)');
        if (check.test(element.className)) return;

        element.className += (element.className.length > 0 ? ' ' : '') + className;
    },

    /**
     * @description Delete the className value of the argument value element
     * @param {Element} element Elements to remove class name
     * @param {String} className Class name to be remove
     */
    removeClass: function (element, className) {
        if (!element) return;

        const check = new this._w.RegExp('(\\s|^)' + className + '(\\s|$)');
        element.className = element.className.replace(check, ' ').trim();

        if (!element.className.trim()) element.removeAttribute('class');
    },

    /**
     * @description Argument value If there is no class name, insert it and delete the class name if it exists
     * @param {Element} element Elements to replace class name
     * @param {String} className Class name to be change
     * @returns {Boolean|undefined}
     */
    toggleClass: function (element, className) {
        if (!element) return;
        let result = false;

        const check = new this._w.RegExp('(\\s|^)' + className + '(\\s|$)');
        if (check.test(element.className)) {
            element.className = element.className.replace(check, ' ').trim();
        } else {
            element.className += ' ' + className;
            result = true;
        }

        if (!element.className.trim()) element.removeAttribute('class');

        return result;
    },

    /**
     * @description In the predefined code view mode, the buttons except the executable button are changed to the 'disabled' state.
     * core.codeViewDisabledButtons (An array of buttons whose class name is not "se-code-view-enabled")
     * core.resizingDisabledButtons (An array of buttons whose class name is not "se-resizing-enabled")
     * @param {Boolean} disabled Disabled value
     * @param {Array|HTMLCollection|NodeList} buttonList Button array
     */
    setDisabledButtons: function (disabled, buttonList) {
        for (let i = 0, len = buttonList.length; i < len; i++) {
            buttonList[i].disabled = disabled;
        }
    },

    /**
     * @description Delete argumenu value element
     * @param {Node} item Node to be remove
     */
    removeItem: function (item) {
        if (!item) return;

        if(typeof item.remove === 'function') item.remove();
        else if (item.parentNode) item.parentNode.removeChild(item);
    },

    /**
     * @description Delete all parent nodes that match the condition.
     * Returns an {sc: previousSibling, ec: nextSibling}(the deleted node reference) or null.
     * @param {Node} item Node to be remove
     * @param {Function|null} validation Validation function. default(Deleted if it only have breakLine and blanks)
     * @param {Element|null} stopParent Stop when the parent node reaches stopParent
     * @returns {Object|null} {sc: previousSibling, ec: nextSibling}
     */
    removeItemAllParents: function (item, validation, stopParent) {
        if (!item) return null;
        let cc = null;
        if (!validation) {
            validation = function (current) {
                if (current === stopParent || this.isComponent(current)) return false;
                const text = current.textContent.trim();
                return text.length === 0 || /^(\n|\u200B)+$/.test(text);
            }.bind(this);
        }

        (function recursionFunc (element) {
            if (!util.isWysiwygDiv(element)) {
                const parent = element.parentNode;
                if (parent && validation(element)) {
                    cc = {
                        sc: element.previousElementSibling,
                        ec: element.nextElementSibling
                    };
                    util.removeItem(element);
                    recursionFunc(parent);
                }
            }
        }(item));

        return cc;
    },

    /**
     * @description Detach Nested all nested lists under the "baseNode".
     * Returns a list with nested removed.
     * @param {Node} baseNode Element on which to base.
     * @param {Boolean} all If true, it also detach all nested lists of a returned list.
     * @returns {Element}
     */
    detachNestedList: function (baseNode, all) {
        const rNode = this._deleteNestedList(baseNode);
        let rangeElement, cNodes;

        if (rNode) {
            rangeElement = rNode.cloneNode(false);
            cNodes = rNode.childNodes;
            const index = this.getPositionIndex(baseNode);
            while (cNodes[index]) {
                rangeElement.appendChild(cNodes[index]);
            }
        } else {
            rangeElement = baseNode;
        }
        
        let rChildren;
        if (!all) {
            const depth = this.getElementDepth(baseNode) + 2;
            rChildren = this.getListChildren(baseNode, function (current) { return this.isListCell(current) && !current.previousElementSibling && this.getElementDepth(current) === depth; }.bind(this));
        } else {
            rChildren = this.getListChildren(rangeElement, function (current) { return this.isListCell(current) && !current.previousElementSibling; }.bind(this));
        }

        for (let i = 0, len = rChildren.length; i < len; i++) {
            this._deleteNestedList(rChildren[i]);
        }
        
        if (rNode) {
            rNode.parentNode.insertBefore(rangeElement, rNode.nextSibling);
            if (cNodes && cNodes.length === 0) this.removeItem(rNode);
        }

        return rangeElement === baseNode ? rangeElement.parentNode : rangeElement;
    },

    /**
     * @description Sub function of util.detachNestedList method.
     * @private
     */
    _deleteNestedList: function (baseNode) {
        const baseParent = baseNode.parentNode;
        let sibling = baseParent;
        let parent = sibling.parentNode;
        let liSibling, liParent, child, index, c;
        
        while (this.isListCell(parent)) {
            index = this.getPositionIndex(baseNode);
            liSibling = parent.nextElementSibling;
            liParent = parent.parentNode;
            child = sibling;
            while(child) {
                sibling = sibling.nextSibling;
                if (this.isList(child)) {
                    c = child.childNodes;
                    while (c[index]) {
                        liParent.insertBefore(c[index], liSibling);
                    }
                    if (c.length === 0) this.removeItem(child);
                } else {
                    liParent.appendChild(child);
                }
                child = sibling;
            }
            sibling = liParent;
            parent = liParent.parentNode;
        }

        if (baseParent.children.length === 0) this.removeItem(baseParent);

        return liParent;
    },

    /**
     * @description Split all tags based on "baseNode"
     * Returns the last element of the splited tag.
     * @param {Node} baseNode Element or text node on which to base
     * @param {Number|null} offset Text offset of "baseNode" (Only valid when "baseNode" is a text node)
     * @param {Number} depth The nesting depth of the element being split. (default: 0)
     * @returns {Element}
     */
    splitElement: function (baseNode, offset, depth) {
        const bp = baseNode.parentNode;
        let index = 0, newEl, children, temp;
        let next = true;
        if (!depth || depth < 0) depth = 0;

        if (baseNode.nodeType === 3) {
            index = this.getPositionIndex(baseNode);
            if (offset >= 0) {
                baseNode.splitText(offset);
                const after = this.getNodeFromPath([index + 1], bp);
                if (this.onlyZeroWidthSpace(after)) after.data = this.zeroWidthSpace;
            }
        } else if (baseNode.nodeType === 1) {
            if (!baseNode.previousSibling) {
                if (this.getElementDepth(baseNode) === depth) next = false;
            } else {
                baseNode = baseNode.previousSibling;
            }
        }

        let depthEl = baseNode;
        while (this.getElementDepth(depthEl) > depth) {
            index = this.getPositionIndex(depthEl) + 1;
            depthEl = depthEl.parentNode;

            temp = newEl;
            newEl = depthEl.cloneNode(false);
            children = depthEl.childNodes;

            if (temp) {
                if (this.isListCell(newEl) && this.isList(temp) && temp.firstElementChild) {
                    newEl.innerHTML = temp.firstElementChild.innerHTML;
                    util.removeItem(temp.firstElementChild);
                    if (temp.children.length > 0) newEl.appendChild(temp);
                } else {
                    newEl.appendChild(temp);
                }
            }

            while (children[index]) {
                newEl.appendChild(children[index]);
            }
        }

        if (depthEl.childNodes.length <= 1 && (!depthEl.firstChild || depthEl.firstChild.textContent.length === 0)) depthEl.innerHTML = '<br>';

        const pElement = depthEl.parentNode;
        if (next) depthEl = depthEl.nextSibling;
        if (!newEl) return depthEl;

        this.mergeSameTags(newEl, null, false);
        this.mergeNestedTags(newEl, function (current) { return this.isList(current); }.bind(this));
        
        if (newEl.childNodes.length > 0) pElement.insertBefore(newEl, depthEl);
        else newEl = depthEl;

        if (bp.childNodes.length === 0) this.removeItem(bp);

        return newEl;
    },

    /**
     * @description Use with "npdePath (util.getNodePath)" to merge the same attributes and tags if they are present and modify the nodepath.
     * If "offset" has been changed, it will return as much "offset" as it has been modified.
     * An array containing change offsets is returned in the order of the "nodePathArray" array.
     * @param {Element} element Element
     * @param {Array|null} nodePathArray Array of NodePath object ([util.getNodePath(), ..])
     * @param {Boolean} onlyText If true, non-text nodes(!util._isIgnoreNodeChange) like 'span', 'strong'.. are ignored.
     * @returns {Array} [offset, ..]
     */
    mergeSameTags: function (element, nodePathArray, onlyText) {
        const inst = this;
        const nodePathLen = nodePathArray ? nodePathArray.length : 0;
        let offsets = null;
        
        if (nodePathLen) {
            offsets = this._w.Array.apply(null, new this._w.Array(nodePathLen)).map(this._w.Number.prototype.valueOf, 0);
        }

        (function recursionFunc(current, depth, depthIndex) {
            const children = current.childNodes;
            
            for (let i = 0, len = children.length, child, next; i < len; i++) {
                child = children[i];
                next = children[i + 1];
                if (!child) break;
                if((onlyText && inst._isIgnoreNodeChange(child)) || (!onlyText && (inst.isTable(child) || inst.isListCell(child) || (inst.isFormatElement(child) && !inst.isFreeFormatElement(child))))) {
                    if (inst.isTable(child) || inst.isListCell(child)) {
                        recursionFunc(child, depth + 1, i);
                    }
                    continue;
                }
                if (len === 1 && current.nodeName === child.nodeName && current.parentNode) {
                    // update nodePath
                    if (nodePathLen) {
                        let path, c, p, cDepth, spliceDepth;
                        for (let n = 0; n < nodePathLen; n++) {
                            path = nodePathArray[n];
                            if (path && path[depth] === i) {
                                c = child, p = current, cDepth = depth, spliceDepth = true;
                                while (cDepth >= 0) {
                                    if (inst.getArrayIndex(p.childNodes, c) !== path[cDepth]) {
                                        spliceDepth = false;
                                        break;
                                    }
                                    c = child.parentNode;
                                    p = c.parentNode;
                                    cDepth--;
                                }
                                if (spliceDepth) {
                                    path.splice(depth, 1);
                                    path[depth] = i;
                                }
                            }
                        }
                    }

                    // merge tag
                    inst.copyTagAttributes(child, current);
                    current.parentNode.insertBefore(child, current);
                    inst.removeItem(current);
                }
                if (!next) {
                    if (child.nodeType === 1) recursionFunc(child, depth + 1, i);
                    break;
                }

                if (child.nodeName === next.nodeName && inst.isSameAttributes(child, next) && child.href === next.href) {
                    const childs = child.childNodes;
                    let childLength = 0;
                    for (let n = 0, nLen = childs.length; n < nLen; n++) {
                        if (childs[n].textContent.length > 0) childLength++;
                    }

                    const l = child.lastChild;
                    const r = next.firstChild;
                    let addOffset = 0;
                    if (l && r) {
                        const textOffset = l.nodeType === 3 && r.nodeType === 3;
                        addOffset = l.textContent.length;
                        let tempL = l.previousSibling;
                        while(tempL && tempL.nodeType === 3) {
                            addOffset += tempL.textContent.length;
                            tempL = tempL.previousSibling;
                        }

                        if (childLength > 0 && l.nodeType === 3 && r.nodeType === 3 && (l.textContent.length > 0 || r.textContent.length > 0)) childLength--;

                        if (nodePathLen) {
                            let path = null;
                            for (let n = 0; n < nodePathLen; n++) {
                                path = nodePathArray[n];
                                if (path && path[depth] > i) {
                                    if (depth > 0 && path[depth - 1] !== depthIndex) continue;
    
                                    path[depth] -= 1;
                                    if (path[depth + 1] >= 0 && path[depth] === i) {
                                        path[depth + 1] += childLength;
                                        if (textOffset) {
                                            if (l && l.nodeType === 3 && r && r.nodeType === 3) {
                                                offsets[n] += addOffset;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (child.nodeType === 3) {
                        addOffset = child.textContent.length;
                        child.textContent += next.textContent;
                        if (nodePathLen) {
                            let path = null;
                            for (let n = 0; n < nodePathLen; n++) {
                                path = nodePathArray[n];
                                if (path && path[depth] > i) {
                                    if (depth > 0 && path[depth - 1] !== depthIndex) continue;
    
                                    path[depth] -= 1;
                                    if (path[depth + 1] >= 0 && path[depth] === i) {
                                        path[depth + 1] += childLength;
                                        offsets[n] += addOffset;
                                    }
                                }
                            }
                        }
                    } else {
                        child.innerHTML += next.innerHTML;
                    }
                    
                    inst.removeItem(next);
                    i--;
                } else if (child.nodeType === 1) {
                    recursionFunc(child, depth + 1, i);
                }
            }
        })(element, 0, 0);

        return offsets;
    },

    /**
     * @description Remove nested tags without other child nodes.
     * @param {Element} element Element object
     * @param {Function|String|null} validation Validation function / String("tag1|tag2..") / If null, all tags are applicable.
     */
    mergeNestedTags: function (element, validation) {
        if (typeof validation === 'string') {
            validation = function (current) { return this.test(current.tagName); }.bind(new this._w.RegExp('^(' + (validation ? validation : '.+') + ')$', 'i'));
        } else if (typeof validation !== 'function') {
            validation = function () { return true; };
        }
        
        (function recursionFunc(current) {
            let children = current.children;
            if (children.length === 1 && children[0].nodeName === current.nodeName && validation(current)) {
                const temp = children[0];
                children = temp.children;
                while (children[0]) {
                    current.appendChild(children[0]);
                }
                current.removeChild(temp);
            }

            for (let i = 0, len = current.children.length; i < len; i++) {
                recursionFunc(current.children[i]);
            }
        })(element);
    },

    /**
     * @description Delete a empty child node of argument element
     * @param {Element} element Element node
     * @param {Node|null} notRemoveNode Do not remove node
     */
    removeEmptyNode: function (element, notRemoveNode) {
        const inst = this;

        if (notRemoveNode) {
            notRemoveNode = inst.getParentElement(notRemoveNode, function (current) {
                return element === current.parentElement;
            });
        }
        
        (function recursionFunc(current) {
            if (inst._notTextNode(current) || current === notRemoveNode || inst.isNonEditable(current)) return 0;
            if (current !== element && inst.onlyZeroWidthSpace(current.textContent) && (!current.firstChild || !inst.isBreak(current.firstChild)) && !current.querySelector(inst._allowedEmptyNodeList)) {
                if (current.parentNode) {
                    current.parentNode.removeChild(current);
                    return -1;
                }
            } else {
                const children = current.children;
                for (let i = 0, len = children.length, r = 0; i < len; i++) {
                    if (!children[i + r] || inst.isComponent(children[i + r])) continue;
                    r += recursionFunc(children[i + r]);
                }
            }

            return 0;
        })(element);

        if (element.childNodes.length === 0) element.innerHTML = '<br>';
    },

    /**
     * @description Remove whitespace between tags in HTML string.
     * @param {String} html HTML string
     * @returns {String}
     */
    htmlRemoveWhiteSpace: function (html) {
        if (!html) return '';
        return html.trim().replace(/<\/?(?!strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label|code)[^>^<]+>\s+(?=<)/ig, function (m) { return m.trim(); });
    },

    /**
     * @description Sort a element array by depth of element.
     * @param {Array} array Array object
     * @param {Boolean} des true: descending order / false: ascending order
     */
    sortByDepth: function (array, des) {
        const t = !des ? -1 : 1;
        const f = t * -1;

        array.sort(function (a, b) {
            if (!this.isListCell(a) || !this.isListCell(b)) return 0;
            a = this.getElementDepth(a);
            b = this.getElementDepth(b);
            return a > b ? t : a < b ? f : 0;
        }.bind(this));
    },

    /**
     * @description Nodes that need to be added without modification when changing text nodes
     * @param {Node} element Element to check
     * @returns {Boolean}
     * @private
     */
    _isIgnoreNodeChange: function (element) {
        return element && element.nodeType !== 3 && (this.isNonEditable(element) || !this.isTextStyleElement(element));
    },

    /**
     * @description Nodes that must remain undetached when changing text nodes (A, Label, Code, Span:font-size)
     * @param {Node|String} element Element to check
     * @returns {Boolean}
     * @private
     */
    _isMaintainedNode: function (element) {
        return element && element.nodeType !== 3 && /^(a|label|code)$/i.test(typeof element === 'string' ? element : element.nodeName);
    },

    /**
     * @description Node with font-size style
     * @param {Node} element Element to check
     * @returns {Boolean}
     * @private
     */
    _isSizeNode: function (element) {
        return element && element.nodeType !== 3 && this.isTextStyleElement(element) && !!element.style.fontSize;
    },

    /**
     * @description Nodes without text
     * @param {Node} element Element to check
     * @returns {Boolean}
     * @private
     */
    _notTextNode: function (element) {
        return element && element.nodeType !== 3 && (this.isComponent(element) || /^(br|input|select|canvas|img|iframe|audio|video)$/i.test(typeof element === 'string' ? element : element.nodeName));
    },

    /**
     * @description Check disallowed tags
     * @param {Node} element Element to check
     * @returns {Boolean}
     * @private
     */
    _disallowedTags: function (element) {
        return /^(meta|script|link|style|[a-z]+\:[a-z]+)$/i.test(element.nodeName);
    },

    /**
     * @description Create whitelist RegExp object.
     * Return RegExp format: new RegExp("<\\/?\\b(?!" + list + ")\\b[^>^<]*+>", "gi")
     * @param {String} list Tags list ("br|p|div|pre...")
     * @returns {RegExp}
     */
    createTagsWhitelist: function (list) {
        return new RegExp('<\\/?\\b(?!\\b' + list.replace(/\|/g, '\\b|\\b') + '\\b)[^>]*>', 'gi');
    },

    /**
     * @description Fix tags that do not fit the editor format.
     * @param {Element} documentFragment Document fragment "DOCUMENT_FRAGMENT_NODE" (nodeType === 11)
     * @param {RegExp} htmlCheckWhitelistRegExp Editor tags whitelist (core._htmlCheckWhitelistRegExp)
     * @private
     */
    _consistencyCheckOfHTML: function (documentFragment, htmlCheckWhitelistRegExp) {
        /**
         * It is can use ".children(util.getListChildren)" to exclude text nodes, but "documentFragment.children" is not supported in IE.
         * So check the node type and exclude the text no (current.nodeType !== 1)
         */
        const removeTags = [], emptyTags = [], wrongList = [], withoutFormatCells = [];

        // wrong position
        const wrongTags = this.getListChildNodes(documentFragment, function (current) {
            if (current.nodeType !== 1) return false;

            // white list
            if (!htmlCheckWhitelistRegExp.test(current.nodeName) && current.childNodes.length === 0 && this.isNotCheckingNode(current)) {
                removeTags.push(current);
                return false;
            }

            const nrtag = !this.getParentElement(current, this.isNotCheckingNode);
            // empty tags
            if ((!this.isTable(current) && !this.isListCell(current)) && (this.isFormatElement(current) || this.isRangeFormatElement(current) || this.isTextStyleElement(current)) && current.childNodes.length === 0 && nrtag) {
                emptyTags.push(current);
                return false;
            }

            // wrong list
            if (this.isList(current.parentNode) && !this.isList(current) && !this.isListCell(current)) {
                wrongList.push(current);
                return false;
            }

            // table cells
            if (this.isCell(current)) {
                const fel = current.firstElementChild;
                if (!this.isFormatElement(fel) && !this.isRangeFormatElement(fel) && !this.isComponent(fel)) {
                    withoutFormatCells.push(current);
                    return false;
                }
            }

            const result = current.parentNode !== documentFragment &&
             (this.isFormatElement(current) || this.isComponent(current) || this.isList(current)) &&
             !this.isRangeFormatElement(current.parentNode) && !this.isListCell(current.parentNode) &&
             !this.getParentElement(current, this.isComponent) && nrtag;

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
            p.parentNode.insertBefore(t, p);
            checkTags.push(p);
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

            tp = this.createElement('LI');
            children = t.childNodes;
            while (children[0]) {
                tp.appendChild(children[0]);
            }
            
            p = t.parentNode;
            if (!p) continue;
            p.insertBefore(tp, t);
            this.removeItem(t);
        }

        for (let i = 0, len = withoutFormatCells.length, t, f; i < len; i++) {
            t = withoutFormatCells[i];
            f = this.createElement('DIV');
            f.innerHTML = (t.textContent.trim().length === 0 && t.children.length === 0) ? '<br>' : t.innerHTML;
            t.innerHTML = f.outerHTML;
        }
    },

    _setDefaultOptionStyle: function (options, defaultStyle) {
        let optionStyle = '';
        if (options.height) optionStyle += 'height:' + options.height + ';';
        if (options.minHeight) optionStyle += 'min-height:' + options.minHeight + ';';
        if (options.maxHeight) optionStyle += 'max-height:' + options.maxHeight + ';';
        if (options.position) optionStyle += 'position:' + options.position + ';';
        if (options.width) optionStyle += 'width:' + options.width + ';';
        if (options.minWidth) optionStyle += 'min-width:' + options.minWidth + ';';
        if (options.maxWidth) optionStyle += 'max-width:' + options.maxWidth + ';';

        let top = '', frame = '', editor = '';
        defaultStyle = optionStyle + defaultStyle;
        const styleArr = defaultStyle.split(';');
        for (let i = 0, len = styleArr.length, s; i < len; i++) {
            s = styleArr[i].trim();
            if (!s) continue;
            if (/^(min-|max-)?width\s*:/.test(s) || /^(z-index|position)\s*:/.test(s)) {
                top += s + ';';
                continue;
            }
            if (/^(min-|max-)?height\s*:/.test(s)) {
                if (/^height/.test(s) && s.split(':')[1].trim() === 'auto') {
                    options.height = 'auto';
                }
                frame += s + ';';
                continue;
            }
            editor += s + ';';
        }

        return {
            top: top,
            frame: frame,
            editor: editor
        };
    },

    _setIframeDocument: function (frame, options) {
        frame.setAttribute('scrolling', 'auto');
        frame.contentDocument.head.innerHTML = '' +
            '<meta charset="utf-8" />' +
            '<meta name="viewport" content="width=device-width, initial-scale=1">' +
            this._setIframeCssTags(options);
        frame.contentDocument.body.className = options._editableClass;
        frame.contentDocument.body.setAttribute('contenteditable', true);
    },

    _setIframeCssTags: function (options) {
        const linkNames = options.iframeCSSFileName;
        const wRegExp = this._w.RegExp;
        let tagString = '';

        for (let f = 0, len = linkNames.length, path; f < len; f++) {
            path = [];

            if (/(^https?:\/\/)|(^data:text\/css,)/.test(linkNames[f])) {
                path.push(linkNames[f]);
            } else {
                const CSSFileName = new wRegExp('(^|.*[\\/])' + linkNames[f] + '(\\..+)?\\.css(?:\\?.*|;.*)?$', 'i');
                for (let c = document.getElementsByTagName('link'), i = 0, len = c.length, styleTag; i < len; i++) {
                    styleTag = c[i].href.match(CSSFileName);
                    if (styleTag) path.push(styleTag[0]);
                }
            }

            if (!path || path.length === 0) throw '[SUNEDITOR.constructor.iframe.fail] The suneditor CSS files installation path could not be automatically detected. Please set the option property "iframeCSSFileName" before creating editor instances.';

            for (let i = 0, len = path.length; i < len; i++) {
                tagString += '<link href="' + path[i] + '" rel="stylesheet">';
            }
        }

        return tagString + (options.height === 'auto' ? '<style>\n/** Iframe height auto */\nbody{height: min-content; overflow: hidden;}\n</style>' : '');
    }
};

export default util;