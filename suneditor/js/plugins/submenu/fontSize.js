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
        var pNode = document.createElement('P');
        var container = startCon;
        var offset = startOff;

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
                    newNode = node;
                    while (newNode.parentNode !== newInnerNode && newNode.parentNode !== pNode && newNode.parentNode !== null) {
                        newNode = newNode.parentNode;
                    }
                    if (newNode.parentNode === pNode) {
                        newInnerNode.appendChild(newNode);
                    }
                    if (node === pNode) {
                        node = newInnerNode;
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
                    while (newNode.parentNode !== pNode && newNode !== null) {
                        if (validation(newNode, true) && newNode.nodeType === 1) {
                            pCurrent.push(newNode.cloneNode(false));
                        }
                        newNode = newNode.parentNode;
                    }

                    pNode.appendChild(newInnerNode);

                    child = textNode;
                    node = newNode;

                    container = textNode;
                    offset = 0;
                    passNode = true;

                    /////////////
                    container = textNode;
                    offset = 0;

                    if (!/^P$|^BODY$/i.test(child.parentNode.nodeName)) {
                        pCurrent = [];
                        newNode = child;
                        while (!/^P$|^BODY$/i.test(newNode.parentNode.nodeName)) {
                            if (validation(newNode, true) && newNode.nodeType === 1) {
                                pCurrent.push(newNode.cloneNode(false));
                            }
                            newNode = newNode.parentNode;
                        }

                        appendNode = newNode = pCurrent.pop() || newNode;
                        while (pCurrent.length > 0) {
                            newNode = pCurrent.pop();
                            appendNode.appendChild(newNode);
                        }

                        if (appendNode !== newInnerNode) newInnerNode.appendChild(appendNode);

                    } else {
                        newNode = newInnerNode;
                    }

                    pNode.appendChild(newInnerNode);
                    child = textNode;
                    node = newNode;
                    passNode = true;
                }

                if (validation(child, passNode)) {
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

    overlayFullLineNodesEnd: function (element, nodeName, fontSize, endCon, endOff) {
        var pNode = document.createElement('P');
        var sNode = document.createElement(nodeName);
        sNode.style.fontSize = fontSize;
        pNode.appendChild(sNode);
        var container = endCon;
        var offset = endOff;

        var passNode = false;
        var newNode;

        var oNode = document.createElement('P');

        (function recursionFunc(current, node, originNode) {
            var childNodes = current.childNodes;
            for (var i = 0; i < childNodes.length; i++) {
                var child = childNodes[i];

                if (passNode) {
                    newNode = node;
                    while (newNode !== sNode && newNode !== pNode) {
                        newNode = newNode.parentNode;
                    }
                    if (newNode === sNode) {
                        if (originNode !== oNode) {
                            node = originNode;
                            while (originNode.parentNode !== oNode) {
                                originNode = originNode.parentNode;
                            }
                            pNode.appendChild(originNode);
                        }
                        node = originNode;
                    } else {
                        node = sNode;
                    }
                }

                // endContainer
                if (!passNode && child === container) {
                    var afterNode = document.createTextNode(container.substringData(offset, (container.length - offset)));
                    var textNode = document.createTextNode(container.substringData(0, offset));

                    container = textNode;
                    offset = textNode.data.length;

                    node.appendChild(textNode);

                    if (originNode !== oNode) {
                        node = newNode = originNode;
                        while (newNode.parentNode !== oNode) {
                            newNode = newNode.parentNode;
                        }
                        pNode.appendChild(newNode);
                    }

                    child = afterNode;
                    passNode = true;
                }

                if (passNode || child.nodeName !== nodeName) {
                    var cloneNode = child.cloneNode(false);
                    node.appendChild(cloneNode);
                    if (child.nodeType === 1) node = cloneNode;
                }

                if (child.nodeType === 1) {
                    cloneNode = child.cloneNode(false);
                    originNode.appendChild(cloneNode);
                    originNode = cloneNode;
                }

                recursionFunc(child, node, originNode);
            }
        })(element, sNode, oNode);

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

            function checkFontSizeCss(vNode, passNode) {
                passNode = passNode === undefined ? true : passNode;
                if (!passNode || vNode.nodeType === 3) return true;

                var style = '';
                if (vNode.style.cssText.length > 0) {
                    style = vNode.style.cssText = vNode.style.cssText.replace(/font-size\s?:\s?.+?\s?(?:;|$|\s)/, '').trim();
                }

                return vNode.nodeName !== 'SPAN' || style.length > 0;
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
            end = SUNEDITOR.plugin.fontSize.overlayFullLineNodesEnd(lineNodes[lineNodes.length - 1], 'SPAN', fontSize, endCon, endOff);
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