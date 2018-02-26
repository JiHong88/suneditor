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

    overlayLineNodeOne: function (element, newInnerNode, validation, startCon, startOff, endCon, endOff) {
        var el = element;
        var startContainer = startCon;
        var startOffset = startOff;
        var endContainer = endCon;
        var endOffset = endOff;

        var pNode = document.createElement('P');
        var afterPNode = document.createElement('P');
        var startPass = false;
        var endPass = false;
        var pCurrent;
        var newNode;
        var appendNode;

        (function recursionFunc(current, node, after) {
            var childNodes = current.childNodes;
            for (var i = 0, len = childNodes.length; i < len; i++) {
                var child = childNodes[i];
                var coverNode = node;
                var afterCoverNode = after;

                if (startPass && child !== endContainer && child.nodeType === 3) {
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

                if (endPass && child.nodeType === 3) {
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
                        pNode.appendChild(appendNode);
                        node = newNode;
                    } else {
                        node = pNode
                    }
                }

                // startContainer
                if (child === startContainer) {
                    var prevNode = document.createTextNode(startContainer.substringData(0, startOffset));
                    var textNode = document.createTextNode(startContainer.substringData(startOffset, (startContainer.length - startOffset)));

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
                    child = startContainer = textNode;
                    startOffset = 0;
                    startPass = true;
                }

                // endContainer
                if (child === endContainer) {
                    var afterNode = document.createTextNode(endContainer.substringData(endOffset, (endContainer.length - endOffset)));
                    var textNode = document.createTextNode(endContainer.substringData(0, endOffset));

                    if (textNode.data.length > 0) {
                        node.appendChild(textNode);
                    }

                    newNode = node = after;
                    pCurrent = [];
                    while (newNode !== afterPNode && newNode !== null) {
                        if (newNode.nodeType === 1) {
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
                        pNode.appendChild(appendNode);
                        node = newNode;
                    } else {
                        node = pNode;
                    }

                    child = endContainer = afterNode;
                    endOffset = afterNode.length;
                    startPass = false;
                    endPass = true;
                }

                if (!startPass || validation(child)) {
                    var cloneNode = child.cloneNode(false);
                    node.appendChild(cloneNode);
                    if (child.nodeType === 1) coverNode = cloneNode;

                    var afterCloneNode = child.cloneNode(false);
                    after.appendChild(afterCloneNode);
                    if (child.nodeType === 1) afterCoverNode = afterCloneNode;
                }

                recursionFunc(child, coverNode, afterCoverNode);
            }
        })(element, pNode, afterPNode);

        element.innerHTML = pNode.innerHTML;

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
                    child = container = textNode;
                    offset = 0;
                    passNode = true;
                }

                if (!passNode || validation(child)) {
                    var cloneNode = child.cloneNode(false);
                    node.appendChild(cloneNode);
                    if (child.nodeType === 1) coverNode = cloneNode;
                }

                recursionFunc(child, coverNode);
            }
        })(element, pNode);

        element.innerHTML = pNode.innerHTML;

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
                    child = container = textNode;
                    offset = textNode.data.length;
                    passNode = true;
                }

                if (!passNode || validation(child)) {
                    var cloneNode = child.cloneNode(false);
                    node.insertBefore(cloneNode, node.firstChild);
                    if (child.nodeType === 1) coverNode = cloneNode;
                }

                recursionFunc(child, coverNode);
            }
        })(element, pNode);

        element.innerHTML = pNode.innerHTML;

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
                var range = SUNEDITOR.plugin.fontSize.overlayLineNodeOne(commonCon, newNode, checkFontSizeCss, startCon, startOff, endCon, endOff);

                start.container = range.startContainer;
                start.offset = range.startOffset;
                end.container = range.endContainer;
                end.offset = range.endOffset;
            }
            /** multi line */
            else {
                // get line nodes
                var lineNodes = SUNEDITOR.dom.getListChildren(commonCon, function (current) { return /^P$/i.test(current.nodeName) && current.childNodes.length > 0; });

                // startCon
                newNode = document.createElement('SPAN'); newNode.style.fontSize = fontSize;
                start = SUNEDITOR.plugin.fontSize.overlayLineNodesStart(lineNodes[0], newNode, checkFontSizeCss, startCon, startOff);
                // mid
                for (var i = 1; i < lineNodes.length - 1; i++) {
                    newNode = document.createElement('SPAN'); newNode.style.fontSize = fontSize;
                    SUNEDITOR.plugin.fontSize.overlayLineInnerNodes(lineNodes[i], newNode, checkFontSizeCss);
                }
                // endCon
                newNode = document.createElement('SPAN'); newNode.style.fontSize = fontSize;
                end = SUNEDITOR.plugin.fontSize.overlayFullLineNodesEnd(lineNodes[lineNodes.length - 1], newNode, checkFontSizeCss, endCon, endOff);
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