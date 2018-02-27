/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
SUNEDITOR.plugin.fontSize = {
    add: function (_this, targetElement) {
        /** set submenu */
        var listDiv = eval(this.setSubmenu(_this.context.user));

        /** add event listeners */
        listDiv.getElementsByTagName('UL')[0].addEventListener('click', this.pickup.bind(_this));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);
    },

    setSubmenu: function (user) {
        var listDiv = document.createElement('DIV');
        listDiv.className = 'layer_editor layer_size';
        listDiv.style.display = 'none';

        var sizeList = !user.fontSizeList ? [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72] : user.fontSizeList;

        var list = '<div class="inner_layer">' +
            '   <ul class="list_editor font_size_list">';
        for (var i = 0; i < sizeList.length; i++) {
            var size = sizeList[i];
            list += '<li><button type="button" class="btn_edit" data-value="' + size + '" style="font-size:' + size + 'pt;">' + size + '</button></li>';
        }
        list += '   </ul>' +
            '</div>';

        listDiv.innerHTML = list;

        return listDiv;
    },

    insertToLineNode: function (element, newInnerNode, validation, startCon, startOff, endCon, endOff) {
        var el = element;
        var startContainer = startCon;
        var startOffset = startOff;
        var endContainer = endCon;
        var endOffset = endOff;

        var startPass = false;
        var endPass = false;
        var pCurrent;
        var newNode;
        var appendNode;
        var removeNode;
        var removeNodeList = [];

        (function recursionFunc(current, node) {
            var childNodes = current.childNodes;
            for (var i = 0, len = childNodes.length; i < len; i++) {
                if (endPass) break;
                var child = childNodes[i];

                if (startPass && child !== endContainer && child.nodeType === 3) {
                    removeNode = newNode = child;
                    pCurrent = [];
                    while (newNode !== el && newNode !== null) {
                        if (validation(newNode) && newNode.nodeType === 1) {
                            pCurrent.push(newNode.cloneNode(false));
                        }
                        removeNode = newNode;
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
                    var prevNode = document.createTextNode(startContainer.substringData(0, startOffset));
                    var startNode = document.createTextNode(startContainer.substringData(startOffset, (startContainer.length - startOffset)));

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

                    node.appendChild(startNode);

                    child = startContainer = startNode;
                    startOffset = 0;
                    startPass = true;

                    continue;
                }

                // endContainer
                if (child === endContainer) {
                    var afterNode = document.createTextNode(endContainer.substringData(endOffset, (endContainer.length - endOffset)));
                    var endNode = document.createTextNode(endContainer.substringData(0, endOffset));
                    var bofore = null;

                    bofore = newNode = child;
                    pCurrent = [];
                    while (newNode !== el && newNode !== null) {
                        if (validation(newNode) && newNode.nodeType === 1) {
                            pCurrent.push(newNode.cloneNode(false));
                        }
                        bofore = newNode;
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

                    while (removeNodeList.length > 0) {
                        SUNEDITOR.dom.removeItem(removeNodeList.pop());
                    }

                    if (afterNode.length > 0) {
                        endContainer.data = afterNode.data;
                    } else {
                        SUNEDITOR.dom.removeItem(endContainer);
                    }

                    node.appendChild(endNode);

                    child = endContainer = endNode;
                    endOffset = endNode.length;
                    endPass = true;

                    el.insertBefore(newInnerNode, bofore);

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

    overlayLineInnerNodes: function (element, newInnerNode, validation) {
        (function recursionFunc(current, node) {
            var childNodes = current.childNodes;
            for (var i = 0, len = childNodes.length; i < len; i++) {
                var child = childNodes[i];
                var coverNode = node;
                if (validation(child)) {
                    var cloneNode = child.cloneNode(false);
                    node.appendChild(cloneNode);
                    if (child.nodeType === 1) coverNode = cloneNode;
                }
                recursionFunc(child, coverNode);
            }
        })(element, newInnerNode);

        element.innerHTML = '';
        element.appendChild(newInnerNode);
    },

    overlayLineNodesStart: function (element, newInnerNode, validation, startCon, startOff) {
        var el = element;
        var container = startCon;
        var offset = startOff;

        var pNode = document.createElement('P');
        var passNode = false;
        var pCurrent;
        var newNode;
        var appendNode;

        (function recursionFunc(current, node) {
            var childNodes = current.childNodes;
            for (var i = 0, len = childNodes.length; i < len; i++) {
                var child = childNodes[i];
                var coverNode = node;

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
                        node = newInnerNode
                    }
                }

                // startContainer
                if (!passNode && child === container) {
                    var prevNode = document.createTextNode(container.substringData(0, offset));
                    var textNode = document.createTextNode(container.substringData(offset, (container.length - offset)));

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
                    var cloneNode = child.cloneNode(false);
                    node.appendChild(cloneNode);
                    if (child.nodeType === 1) coverNode = cloneNode;
                }

                recursionFunc(child, coverNode);
            }
        })(element, pNode);

        element.parentNode.insertBefore(pNode, element);
        SUNEDITOR.dom.removeItem(element);

        return {
            container: container,
            offset: offset
        };
    },

    overlayFullLineNodesEnd: function (element, newInnerNode, validation, endCon, endOff) {
        var el = element;
        var container = endCon;
        var offset = endOff;

        var pNode = document.createElement('P');
        var passNode = false;
        var pCurrent;
        var newNode;
        var appendNode;

        (function recursionFunc(current, node) {
            var childNodes = current.childNodes;
            for (var i = childNodes.length -1; 0 <= i; i--) {
                var child = childNodes[i];
                var coverNode = node;

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
                        node = newInnerNode
                    }
                }

                // endContainer
                if (!passNode && child === container) {
                    var afterNode = document.createTextNode(container.substringData(offset, (container.length - offset)));
                    var textNode = document.createTextNode(container.substringData(0, offset));

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
                    var cloneNode = child.cloneNode(false);
                    node.insertBefore(cloneNode, node.firstChild);
                    if (child.nodeType === 1) coverNode = cloneNode;
                }

                recursionFunc(child, coverNode);
            }
        })(element, pNode);

        element.parentNode.insertBefore(pNode, element);
        SUNEDITOR.dom.removeItem(element);

        return {
            container: container,
            offset: offset
        };
    },

    appendSpan: function (fontSize) {
        var nativeRng = this.getRange();
        var startCon = nativeRng.startContainer;
        var startOff = nativeRng.startOffset;
        var endCon = nativeRng.endContainer;
        var endOff = nativeRng.endOffset;
        var commonCon = nativeRng.commonAncestorContainer;
        var start = {}, end = {};
        var newNode;

        /** one node */
        if (startCon === endCon) {
            newNode = document.createElement('SPAN'); newNode.style.fontSize = fontSize;
            /** No node selected */
            if (startOff === endOff) {
                newNode.innerHTML = "&nbsp;";
                startCon.parentNode.insertBefore(newNode, startCon.nextSibling);
            }
            /** Select within the same node */
            else {
                var beforeNode = document.createTextNode(startCon.substringData(0, startOff));
                var afterNode = document.createTextNode(startCon.substringData(endOff, (startCon.length - endOff)));

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
            /** tag check */
            var checkFontSizeCss = function (vNode) {
                if (vNode.nodeType === 3) return true;

                var style = '';
                if (vNode.style.cssText.length > 0) {
                    style = vNode.style.cssText.replace(/font-size\s?:\s?.+?\s?(?:;|$|\s)/, '').trim();
                }

                if (vNode.nodeName !== 'SPAN' || style.length > 0) {
                    if (vNode.style.cssText.length > 0) vNode.style.cssText = style;
                    return true;
                }

                return false;
            };

            /** one line */
            if (!/BODY/i.test(commonCon.nodeName)) {
                newNode = document.createElement('SPAN'); newNode.style.fontSize = fontSize;
                var range = SUNEDITOR.plugin.fontSize.insertToLineNode(commonCon, newNode, checkFontSizeCss, startCon, startOff, endCon, endOff);

                start.container = range.startContainer;
                start.offset = range.startOffset;
                end.container = range.endContainer;
                end.offset = range.endOffset;
            }
            /** multi line */
            else {
                // get line nodes
                var lineNodes = SUNEDITOR.dom.getListChildren(commonCon, function (current) { return /^P$/i.test(current.nodeName);});
                var startLine = SUNEDITOR.dom.getParentNode(startCon, 'P');
                var endLine = SUNEDITOR.dom.getParentNode(endCon, 'P');

                for (var i = 0, len = lineNodes.length; i < len; i++) {
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
                newNode = document.createElement('SPAN'); newNode.style.fontSize = fontSize;
                start = SUNEDITOR.plugin.fontSize.overlayLineNodesStart(lineNodes[startLine], newNode, checkFontSizeCss, startCon, startOff);
                // mid
                for (i = startLine + 1; i < endLine; i++) {
                    newNode = document.createElement('SPAN'); newNode.style.fontSize = fontSize;
                    SUNEDITOR.plugin.fontSize.overlayLineInnerNodes(lineNodes[i], newNode, checkFontSizeCss);
                }
                // endCon
                newNode = document.createElement('SPAN'); newNode.style.fontSize = fontSize;
                end = SUNEDITOR.plugin.fontSize.overlayFullLineNodesEnd(lineNodes[endLine], newNode, checkFontSizeCss, endCon, endOff);
            }

        }

        // set range
        this.setRange(start.container, start.offset, end.container, end.offset);
    },

    pickup: function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (!/^BUTTON$/i.test(e.target.tagName)) {
            return false;
        }

        this.focus();
        SUNEDITOR.plugin.fontSize.appendSpan.call(this, e.target.getAttribute('data-value') + 'pt');
        this.submenuOff();
    }
};