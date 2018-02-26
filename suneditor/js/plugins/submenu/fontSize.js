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
                        recursionFunc(child, child.cloneNode(false));
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
        // pNode.appendChild(newInnerNode);
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
                        recursionFunc(child, child.cloneNode(false));
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
        fontSize = fontSize + 'pt';

        var nativeRng = this.getRange();
        var startCon = nativeRng.startContainer;
        var startOff = nativeRng.startOffset;
        var endCon = nativeRng.endContainer;
        var endOff = nativeRng.endOffset;
        var commonCon = nativeRng.commonAncestorContainer;
        var start = {}, end = {};
        var newNode;

        /** Select within the same node */
        if (startCon === endCon) {
            var sNode;
            if (startOff === endOff) {
                sNode = document.createElement("SPAN");
                sNode.style.fontSize = fontSize;
                sNode.innerHTML = "&nbsp;";
                startCon.parentNode.insertBefore(sNode, startCon.nextSibling);
            } else {
                var lineNode = startCon;
                while (!/^P$/i.test(lineNode.nodeName)) {
                    lineNode = lineNode.parentNode;
                }
                // sNode = SUNEDITOR.plugin.fontSize.overlayLineNodesStart(lineNode, 'SPAN', fontSize, startCon, startOff);
            }

            start.container = sNode;
            start.offset = 0;
            end.container = sNode;
            end.offset = 1;
        }
        /** Select multiple nodes */
        else {
            // get Nodes
            var lineNodes = SUNEDITOR.dom.getListChildren(commonCon, function (current) { return /^P$/i.test(current.nodeName) && current.childNodes.length > 0; });

            function checkFontSizeCss(vNode) {
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
            }

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
        SUNEDITOR.plugin.fontSize.appendSpan.call(this, e.target.getAttribute('data-value'));
        this.submenuOff();
    }
};