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
    _d: document,
    _w: window,

    /**
     * @description Removes attribute values such as style and converts tags that do not conform to the "html5" standard.
     * @param {String} text 
     * @returns {String}
     * @private
     */
    _tagConvertor: function (text) {
        const ec = {'b': 'strong', 'i': 'em', 'var': 'em', 'u': 'ins', 'strike': 'del', 's': 'del'};
        return text.replace(/(<\/?)(b|strong|var|i|em|u|ins|s|strike|del)\b\s*(?:[^>^<]+)?\s*(?=>)/ig, function (m, t, n) {
            return t + ((typeof ec[n] === 'string') ? ec[n] : n);
        });
    },

    /**
     * @description HTML Reserved Word Converter.
     * @param {String} contents 
     * @returns {String}
     * @private
     */
    _HTMLConvertor: function (contents) {
        const ec = {'&': '&amp;', '\u00A0': '&nbsp;', '\'': '&quot;', '<': '&lt;', '>': '&gt;'};
        return contents.replace(/&|\u00A0|'|<|>/g, function (m) {
            return (typeof ec[m] === 'string') ? ec[m] : m;
        });
    },

    /**
     * @description Unicode Character 'ZERO WIDTH SPACE' (\u200B)
     */
    zeroWidthSpace: '\u200B',

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
     * @returns {Object}
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
     * @description Returns the CSS text that has been applied to the current page.
     * @param {Element|null} iframe To get the CSS text of an iframe, send an iframe object. (context.element.wysiwygFrame)
     * @returns {String}
     */
    getPageStyle: function (iframe) {
        let cssText = '';
        const sheets = (iframe ? this.getIframeDocument(iframe) : this._d).styleSheets;
        
        for (let i = 0, len = sheets.length, rules; i < len; i++) {
            try {
                rules = sheets[i].cssRules;
            } catch (e) {
                continue;
            }
            
            for (let c = 0, cLen = rules.length; c < cLen; c++) {
                cssText += rules[c].cssText;
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
     * @description Converts contents into a format that can be placed in an editor
     * @param {String} contents contents
     * @param {String|RegExp} whitelist Regular expression of allowed tags.
     * RegExp object is create by util.createTagsWhitelist method. (core.editorTagsWhitelistRegExp, core.pasteTagsWhitelistRegExp)
     * @returns {String}
     */
    convertContentsForEditor: function (contents, whitelist) {
        let returnHTML = '';
        let tag = this._d.createRange().createContextualFragment(contents).childNodes;

        for (let i = 0, len = tag.length, baseHtml; i < len; i++) {
            baseHtml = tag[i].outerHTML || tag[i].textContent;

            if (tag[i].nodeType === 3) {
                const textArray = baseHtml.split(/\n/g);
                let text = '';
                for (let t = 0, tLen = textArray.length; t < tLen; t++) {
                    text = textArray[t].trim();
                    if (text.length > 0) returnHTML += '<p>' + text + '</p>';
                }
            } else {
                returnHTML += baseHtml.replace(/(?!>)\s+(?=<)/g, ' ');
            }
        }

        if (returnHTML.length === 0) {
            contents = this._HTMLConvertor(contents);
            returnHTML = '<p>' + (contents.length > 0 ? contents : '<br>') + '</p>';
        }

        return this._tagConvertor(!whitelist ? returnHTML : returnHTML.replace(typeof whitelist === 'string' ? this.createTagsWhitelist(whitelist) : whitelist, ''));
    },

    /**
     * @description Converts wysiwyg area element into a format that can be placed in an editor of code view mode
     * @param {Element|String} html WYSIWYG element (context.element.wysiwyg) or HTML string.
     * @param {Number|null} indentSize The indent size of the tag (default: 0)
     * @returns {String}
     */
    convertHTMLForCodeView: function (html, indentSize) {
        let returnHTML = '';
        const reg = this._w.RegExp;
        const brReg = new reg('^(BLOCKQUOTE|PRE|TABLE|THEAD|TBODY|TR|TH|TD|OL|UL|IMG|IFRAME|VIDEO|AUDIO|FIGURE|FIGCAPTION|HR|BR|CANVAS|SELECT)$', 'i');
        const isFormatElement = this.isFormatElement.bind(this);
        const wDoc = typeof html === 'string' ? this._d.createRange().createContextualFragment(html) : html;
        const util = this;

        indentSize *= 1;
        indentSize = indentSize > 0 ? new this._w.Array(indentSize + 1).join(' ') : '';

        (function recursionFunc (element, indent, lineBR) {
            const children = element.childNodes;
            const elementRegTest = brReg.test(element.nodeName);
            const elementIndent = (elementRegTest ? indent : '');

            for (let i = 0, len = children.length, node, br, nodeRegTest; i < len; i++) {
                node = children[i];
                nodeRegTest = brReg.test(node.nodeName);
                br = nodeRegTest ? '\n' : '';
                lineBR = isFormatElement(node) && !elementRegTest && !/^(TH|TD)$/i.test(element.nodeName) ? '\n' : '';

                if (node.nodeType === 3) {
                    returnHTML += util._HTMLConvertor((/^\n+$/.test(node.data) ? '' : node.data));
                    continue;
                }

                if (node.childNodes.length === 0) {
                    returnHTML += (/^(HR)$/i.test(node.nodeName) ? '\n' : '') + elementIndent + node.outerHTML + br;
                    continue;
                }
                
                node.innerHTML = node.innerHTML;
                const tag = node.nodeName.toLowerCase();
                returnHTML += (lineBR || (elementRegTest ? '' : br)) + (elementIndent || nodeRegTest ? indent : '') + node.outerHTML.match(reg('<' + tag + '[^>]*>', 'i'))[0] + br;
                recursionFunc(node, indent + indentSize, '');
                returnHTML += (nodeRegTest ? indent : '') + '</' + tag + '>' + (lineBR || br || elementRegTest ? '\n' : '' || /^(TH|TD)$/i.test(node.nodeName) ? '\n' : '');
            }
        }(wDoc, '', '\n'));

        return returnHTML.trim() + '\n';
    },

    /**
     * @description It is judged whether it is the edit region top div element or iframe's body tag.
     * @param {Element} element The element to check
     * @returns {Boolean}
     */
    isWysiwygDiv: function (element) {
        if (element && element.nodeType === 1 && (this.hasClass(element, 'se-wrapper-wysiwyg') || /^BODY$/i.test(element.nodeName))) return true;
        return false;
    },

    /**
     * @description It is judged whether it is the format element (P, DIV, H[1-6], PRE, LI)
     * Format element also contain "free format Element"
     * @param {Element} element The element to check
     * @returns {Boolean}
     */
    isFormatElement: function (element) {
        if (element && element.nodeType === 1 && (/^(P|DIV|H[1-6]|PRE|LI)$/i.test(element.nodeName) || this.hasClass(element, '(\\s|^)__se__format__replace_.+(\\s|$)|(\\s|^)__se__format__free_.+(\\s|$)')) && !this.isComponent(element) && !this.isWysiwygDiv(element)) return true;
        return false;
    },

    /**
     * @description It is judged whether it is the range format element. (BLOCKQUOTE, OL, UL, FIGCAPTION, TABLE, THEAD, TBODY, TR, TH, TD)
     * * Range format element is wrap the format element  (util.isFormatElement)
     * @param {Element} element The element to check
     * @returns {Boolean}
     */
    isRangeFormatElement: function (element) {
        if (element && element.nodeType === 1 && (/^(BLOCKQUOTE|OL|UL|FIGCAPTION|TABLE|THEAD|TBODY|TR|TH|TD)$/i.test(element.nodeName) || this.hasClass(element, '(\\s|^)__se__format__range_.+(\\s|$)'))) return true;
        return false;
    },

    /**
     * @description It is judged whether it is the free format element. (PRE)
     * Free format elements's line break is "BR" tag.
     * Free format elements is included in the format element.
     * @param {Element} element 
     * @returns {Boolean}
     */
    isFreeFormatElement: function (element) {
        if (element && element.nodeType === 1 && (/^PRE$/i.test(element.nodeName) || this.hasClass(element, '(\\s|^)__se__format__free_.+(\\s|$)')) && !this.isComponent(element) && !this.isWysiwygDiv(element)) return true;
        return false;
    },

    /**
     * @description It is judged whether it is the component [img, iframe] cover(element className - ".se-component") and table, hr
     * @param {Element} element The element to check
     * @returns {Boolean}
     */
    isComponent: function (element) {
        return element && (/se-component/.test(element.className) || /^(TABLE|HR)$/.test(element.nodeName));
    },

    /**
     * @description It is judged whether it is the component [img, iframe] cover(element className - ".se-component")
     * @param {Element} element The element to check
     * @returns {Boolean}
     */
    isMediaComponent: function (element) {
        return element && /se-component/.test(element.className);
    },

    /**
     * @description If a parent node that contains an argument node finds a format node (util.isFormatElement), it returns that node.
     * @param {Element} element Reference element if null or no value, it is relative to the current focus node.
     * @param {Function|null} validation Additional validation function.
     * @returns {Element}
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
     * @param {Element} element Reference element if null or no value, it is relative to the current focus node.
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
     * @param {Element} element Reference element if null or no value, it is relative to the current focus node.
     * @param {Function|null} validation Additional validation function.
     * @returns {Element}
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
     * @description Add style and className of copyEl to originEl
     * @param {Element} originEl Origin element
     * @param {Element} copyEl Element to copy
     * @private
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
     * @param {Array} array Array to get item
     * @param {Function|null} validation Conditional function
     * @param {Boolean} multi If true, returns all items that meet the criteria otherwise, returns an empty array.
     * If false, returns only one item that meet the criteria otherwise return null.
     * @returns {Array|Object}
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
     * @param {Array} array element array
     * @param {Element} element The element to find index
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
     * @param {Array} array element array
     * @param {Element} item The element to find index
     * @returns {Number}
     */
    nextIdx: function (array, item) {
        let idx = this.getArrayIndex(array, item);
        if (idx === -1) return -1;
        return idx + 1;
    },

    /**
     * @description Get the previous index of the argument value in the element array
     * @param {Array} array Element array
     * @param {Element} item The element to find index
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
     * ex) <p><span>aa</span><span>bb</span></p> - (node: "bb", parentNode: "<P>") -> [1, 0]
     * @param {Node} node The Node to find position path
     * @param {Element|null} parentNode Parent node. If null, wysiwyg div area
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
     * @param {Element} parentNode Base parent element
     * @returns {Element}
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
     * @param {Node} a Node object
     * @param {Node} b Node object
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

        return compStyle === style_b.length && compClass === class_b.length;
    },

    /**
     * @description Check the node is a list (ol, ul)
     * @param {Element|String} node The element or element name to check
     * @returns {Boolean}
     */
    isList: function (node) {
        return node && /^(OL|UL)$/i.test(typeof node === 'string' ? node : node.nodeName);
    },

    /**
     * @description Check the node is a list cell (li)
     * @param {Element|String} node The element or element name to check
     * @returns {Boolean}
     */
    isListCell: function (node) {
        return node && /^LI$/i.test(typeof node === 'string' ? node : node.nodeName);
    },

    /**
     * @description Check the node is a table (table, thead, tbody, tr, th, td)
     * @param {Element|String} node The element or element name to check
     * @returns {Boolean}
     */
    isTable: function (node) {
        return node && /^(TABLE|THEAD|TBODY|TR|TH|TD)$/i.test(typeof node === 'string' ? node : node.nodeName);
    },

    /**
     * @description Check the node is a table cell (td, th)
     * @param {Element|String} node The element or element name to check
     * @returns {Boolean}
     */
    isCell: function (node) {
        return node && /^(TD|TH)$/i.test(typeof node === 'string' ? node : node.nodeName);
    },

    /**
     * @description Check the node is a break node (BR)
     * @param {Element|String} node The element or element name to check
     * @returns {Boolean}
     */
    isBreak: function (node) {
        return node && /^BR$/i.test(typeof node === 'string' ? node : node.nodeName);
    },


    /**
     * @description Check the node is a anchor node (A)
     * @param {Element|String} node The element or element name to check
     * @returns {Boolean}
     */
    isAnchor: function (node) {
        return node && /^A$/i.test(typeof node === 'string' ? node : node.nodeName);
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
     * @returns {Number|null}
     */
    getNumber: function (text, maxDec) {
        if (!text) return null;
        
        let number = (text + '').match(/-?\d+(\.\d+)?/);
        if (!number || !number[0]) return null;

        number = number[0];
        return maxDec < 0 ? number * 1 : maxDec === 0 ? this._w.Math.round(number * 1) : (number * 1).toFixed(maxDec) * 1;
    },

    /**
     * @description Get all child nodes of the argument value element (Without text node)
     * @param {Element|String} element element to get child node
     * @param {(function|null)} validation Conditional function
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

            for (let i = 0, len = current.children.length; i < len; i++) {
                recursionFunc(current.children[i]);
            }
        })(element);

        return children;
    },

    /**
     * @description Get all child nodes of the argument value element (Include text nodes)
     * @param {Element} element element to get child node
     * @param {function|null} validation Conditional function
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
     * @param {Element} element The element to check
     * @returns {Number}
     */
    getElementDepth: function (element) {
        if (this.isWysiwygDiv(element)) return -1;

        let depth = 0;
        element = element.parentNode;

        while (element && !this.isWysiwygDiv(element)) {
            depth += 1;
            element = element.parentNode;
        }

        return depth;
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
     * @param {Element} first First element
     * @param {Element|null} last Last element
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
     * @param {Element} element Element node
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
            top: (offsetTop - wysiwyg.scrollTop) + (iframe ? wysiwygFrame.parentElement.offsetTop : 0)
        };
    },

    /**
     * @description It compares the start and end indexes of "a" and "b" and returns the number of overlapping indexes in the range.
     * ex) 1, 5, 4, 6 => 2 (4 ~ 5)
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
     * @param {Element} element Element to replace text content
     * @param {String} txt Text to be applied
     */
    changeTxt: function (element, txt) {
        if (!element || !txt) return;
        element.textContent = txt;
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
     */
    toggleClass: function (element, className) {
        if (!element) return;

        const check = new this._w.RegExp('(\\s|^)' + className + '(\\s|$)');
        if (check.test(element.className)) {
            element.className = element.className.replace(check, ' ').trim();
        }
        else {
            element.className += ' ' + className;
        }

        if (!element.className.trim()) element.removeAttribute('class');
    },

    /**
     * @description Delete argumenu value element
     * @param {Element} item Element to be remove
     */
    removeItem: function (item) {
        if (!item) return;
        try {
            item.remove();
        } catch (e) {
            item.parentNode.removeChild(item);
        }
    },

    /**
     * @description Delete all parent nodes that match the condition.
     * Returns an {sc: previousSibling, ec: nextSibling}(the deleted node reference) or null.
     * @param {Element} item Element to be remove
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
     * @description Detach Nested list all nested lists under the "baseNode".
     * Returns a list with nested removed.
     * @param {Element} baseNode Element on which to base.
     * @returns {Element}
     */
    detachNestedList: function (baseNode) {
        const rNode = this.__deleteNestedList(baseNode);
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
        
        const rChildren = this.getListChildren(rangeElement, function (current) { return this.isListCell(current) && !current.previousElementSibling; }.bind(this));
        for (let i = 0, len = rChildren.length, n; i < len; i++) {
            n = this.__deleteNestedList(rChildren[i]);
            if (n && n.childNodes.length === 0) {
                this.removeItem(n);
                i--; len--;
            }
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
    __deleteNestedList: function (baseNode) {
        let sibling = baseNode.parentNode;
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

            if (temp) newEl.appendChild(temp);
            while (children[index]) {
                newEl.appendChild(children[index]);
            }
        }

        const pElement = depthEl.parentNode;
        if (next) depthEl = depthEl.nextSibling;
        if (!newEl) return depthEl;

        this.mergeSameTags(newEl, null, null, false);
        this.mergeNestedTags(newEl, function (current) { return this.isList(current); }.bind(this));
        
        if (newEl.childNodes.length > 0) pElement.insertBefore(newEl, depthEl);
        else newEl = depthEl;

        if (bp.childNodes.length === 0) this.removeItem(bp);

        return newEl;
    },

    /**
     * @description Use with "npdePath (util.getNodePath)" to merge the same attributes and tags if they are present and modify the nodepath.
     * If "offset" has been changed, it will return as much "offset" as it has been modified.
     * "a", "b" You can send a maximum of two nodepaths.
     * @param {Element} element Element object.
     * @param {Object|null} nodePath_s Start NodePath object (util.getNodePath)
     * @param {Object|null} nodePath_e End NodePath object (util.getNodePath)
     * @param {Boolean} onlyText If true, non-text nodes(!util._isIgnoreNodeChange) like 'span', 'strong'.. are ignored.
     * @returns {Object} {a: 0, b: 0}
     */
    mergeSameTags: function (element, nodePath_s, nodePath_e, onlyText) {
        const inst = this;
        const offsets = {a: 0, b: 0};

        (function recursionFunc(current, depth, depthIndex, includedPath_s, includedPath_e) {
            const children = current.childNodes;
            
            for (let i = 0, len = children.length, child, next; i < len; i++) {
                child = children[i];
                next = children[i + 1];
                if (!child) break;
                if((onlyText && inst._isIgnoreNodeChange(child)) || (!onlyText && inst.isFormatElement(child) && !inst.isFreeFormatElement(child))) continue;
                if (len === 1 && current.nodeName === child.nodeName && current.parentNode) {
                    inst.copyTagAttributes(child, current);
                    current.parentNode.insertBefore(child, current);
                    inst.removeItem(current);

                    // update nodePath
                    if (nodePath_s && nodePath_s[depth] === i) {
                        nodePath_s.splice(depth, 1);
                        nodePath_s[depth] = i;
                    }

                    if (nodePath_e && nodePath_e[depth] === i) {
                        nodePath_e.splice(depth, 1);
                        nodePath_e[depth] = i;
                    }
                }
                if (!next) {
                    if (child.nodeType === 1) recursionFunc(child, depth + 1, i, includedPath_s, includedPath_e);
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
                    if (l && r) {
                        const textOffset = l.nodeType === 3 && r.nodeType === 3;
                        let addOffset = l.textContent.length;
                        let tempL = l.previousSibling;
                        while(tempL && tempL.nodeType === 3) {
                            addOffset += tempL.textContent.length;
                            tempL = tempL.previousSibling;
                        }

                        if (childLength > 0 && l.nodeType === 3 && r.nodeType === 3 && (l.textContent.length > 0 || r.textContent.length > 0)) childLength--;

                        // start
                        if (includedPath_s && nodePath_s && nodePath_s[depth] > i) {
                            if (depth > 0 && nodePath_s[depth - 1] !== depthIndex) {
                                includedPath_s = false;
                            } else {
                                nodePath_s[depth] -= 1;
                                if (nodePath_s[depth + 1] >= 0 && nodePath_s[depth] === i) {
                                    nodePath_s[depth + 1] += childLength;
                                    if (textOffset) {
                                        if (l && l.nodeType === 3 && r && r.nodeType === 3) {
                                            offsets.a += addOffset;
                                        }
                                    }
                                }
                            }
                        }
                        // end
                        if (includedPath_e && nodePath_e && nodePath_e[depth] > i) {
                            if (depth > 0 && nodePath_e[depth - 1] !== depthIndex) {
                                includedPath_e = false;
                            } else {
                                nodePath_e[depth] -= 1;
                                if (nodePath_e[depth + 1] >= 0 && nodePath_e[depth] === i) {
                                    nodePath_e[depth + 1] += childLength;
                                    if (textOffset) {
                                        if (l && l.nodeType === 3 && r && r.nodeType === 3) {
                                            offsets.b += addOffset;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (child.nodeType === 3) child.textContent += next.textContent;
                    else child.innerHTML += next.innerHTML;
                    
                    inst.removeItem(next);
                    i--;
                } else if (child.nodeType === 1) {
                    recursionFunc(child, depth + 1, i, includedPath_s, includedPath_e);
                }
            }
        })(element, 0, 0, true, true);

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
            if (inst._notTextNode(current) || current === notRemoveNode || current.getAttribute('contenteditable') === 'false') return 0;
            if (current !== element && inst.onlyZeroWidthSpace(current.textContent) && (!current.firstChild || !inst.isBreak(current.firstChild))) {
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
     * @description Gets the clean HTML code for editor
     * @param {String} html HTML string
     * @param {String|RegExp} whitelist Regular expression of allowed tags.
     * RegExp object is create by util.createTagsWhitelist method. (core.editorTagsWhitelistRegExp, core.pasteTagsWhitelistRegExp)
     * @returns {String}
     */
    cleanHTML: function (html, whitelist) {
        const tagsAllowed = new this._w.RegExp('^(meta|script|link|style|[a-z]+\:[a-z]+)$', 'i');
        const domTree = this._d.createRange().createContextualFragment(html).childNodes;
        let cleanHTML = '';

        for (let i = 0, len = domTree.length; i < len; i++) {
            if (!tagsAllowed.test(domTree[i].nodeName)) {
                cleanHTML += domTree[i].nodeType === 1 ? domTree[i].outerHTML : domTree[i].nodeType === 3 ? domTree[i].textContent : '';
            }
        }

        cleanHTML = cleanHTML
            .replace(/<(script|style).*>(\n|.)*<\/(script|style)>/g, '')
            .replace(/(<[a-zA-Z0-9]+)[^>]*(?=>)/g, function (m, t) {
                const v = m.match(/((?:contenteditable|colspan|rowspan|target|href|src|class|data-format|data-size|data-file-size|data-file-name|data-origin|data-align|data-image-link|data-rotate|data-proportion|data-percentage|origin-size)\s*=\s*"[^"]*")/ig);
                if (v) {
                    for (let i = 0, len = v.length; i < len; i++) {
                        if (/^class="(?!(__se__|se-))/.test(v[i])) continue;
                        t += ' ' + v[i];
                    }
                }
                return t;
            })
            .replace(/<\/?(span[^>^<]*)>/g, '');

        return this._tagConvertor(!cleanHTML ? html : !whitelist ? cleanHTML : cleanHTML.replace(typeof whitelist === 'string' ? this.createTagsWhitelist(whitelist) : whitelist, ''));
    },

    /**
     * @description Nodes that need to be added without modification when changing text nodes
     * @param {Element} element Element to check
     * @returns {Boolean}
     * @private
     */
    _isIgnoreNodeChange: function (element) {
        return element.nodeType !== 3 && (element.getAttribute('contenteditable') === 'false' || !/^(span|font|b|strong|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label)$/i.test(element.nodeName));
    },

    /**
     * @description Nodes that must remain undetached when changing text nodes
     * @param {Element} element Element to check
     * @returns {Boolean}
     * @private
     */
    _isMaintainedNode: function (element) {
        return element.nodeType !== 3 && /^(a|label)$/i.test(element.nodeName);
    },

    /**
     * @description Nodes without text
     * @param {Element} element Element to check
     * @returns {Boolean}
     * @private
     */
    _notTextNode: function (element) {
        return element.nodeType !== 3 && (this.isComponent(element) || /^(br|input|select|canvas|img|iframe|audio|video)$/i.test(element.nodeName));
    },

    /**
     * @description Create whitelist RegExp object.
     * Return RegExp format: new RegExp("<\\/?(" + (?!\\b list[i] \\b) + ")[^>^<])+>", "g")
     * @param {String} list Tags list ("br|p|div|pre...")
     * @returns {RegExp}
     * @private
     */
    createTagsWhitelist: function (list) {
        const exclusionTags = list.split('|');
        let regStr = '<\\/?(';

        for (let i = 0, len = exclusionTags.length; i < len; i++) {
            regStr += '(?!\\b' + exclusionTags[i] + '\\b)';
        }

        regStr += '[^>^<])+>';

        return new RegExp(regStr, 'g');
    }
};

export default util;