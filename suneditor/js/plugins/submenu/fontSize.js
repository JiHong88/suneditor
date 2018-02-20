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

    overlayLineNodes: function (element, nodeName, fontSize) {
        var sNode = document.createElement(nodeName);
        sNode.style.fontSize = fontSize;

        (function recursionFunc(current, node) {
            var childNodes = current.childNodes;
            for (var i = 0; i < childNodes.length; i++) {
                var child = childNodes[i];
                var coverNode = node;
                if (child.nodeName !== nodeName) {
                    var cloneNode = child.cloneNode(false);
                    node.appendChild(cloneNode);
                    if (child.nodeType === 1) coverNode = cloneNode;
                }
                recursionFunc(child, coverNode);
            }
        })(element, sNode);

        element.innerHTML = '';
        element.appendChild(sNode);
    },

    overlayLineNodesStart: function (element, nodeName, fontSize, startCon, startOff) {
        var pNode = document.createElement('P');
        var sNode = document.createElement(nodeName);
        sNode.style.fontSize = fontSize;
        var container = startCon;
        var offset = startOff;

        var passNode = false;
        var pCurrent;
        var newNode;
        var appendNode;

        (function recursionFunc(current, node) {
            var childNodes = current.childNodes;
            for (var i = 0; i < childNodes.length; i++) {
                var child = childNodes[i];
                var coverNode = node;

                if (passNode) {
                    newNode = node;
                    while (newNode !== sNode && newNode !== pNode) {
                        newNode = newNode.parentNode;
                    }
                    if (newNode === pNode) node = sNode;
                }

                // startContainer
                if (!passNode && child === container) {
                    var prevNode = document.createTextNode(container.substringData(0, offset));
                    var textNode = document.createTextNode(container.substringData(offset, (container.length - offset)));

                    if (prevNode.data.length > 0) {
                        node.appendChild(prevNode);
                    }

                    container = textNode;
                    offset = 0;

                    if (!/^P$|^BODY$/i.test(child.parentNode.nodeName)) {
                        pCurrent = [];
                        newNode = child;
                        while (!/^P$|^BODY$/i.test(newNode.parentNode.nodeName)) {
                            if (newNode.nodeName !== nodeName && newNode.nodeType === 1) {
                                pCurrent.push(newNode.cloneNode(false));
                            }
                            newNode = newNode.parentNode;
                        }

                        appendNode = newNode = pCurrent.pop() || sNode;
                        while (pCurrent.length > 0) {
                            newNode = pCurrent.pop();
                            appendNode.appendChild(newNode);
                        }

                        if (appendNode !== sNode) sNode.appendChild(appendNode);

                    } else {
                        newNode = sNode;
                    }

                    pNode.appendChild(sNode);
                    child = textNode;
                    node = newNode;
                    passNode = true;
                }

                if (!passNode || child.nodeName !== nodeName) {
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
        var pCurrent;
        var newNode;

        (function recursionFunc(current, node, originNode) {
            var childNodes = current.childNodes;
            for (var i = 0; i < childNodes.length; i++) {
                var child = childNodes[i];

                // if (passNode) {
                //     newNode = node;
                //     while (newNode !== sNode && newNode !== pNode) {
                //         newNode = newNode.parentNode;
                //     }
                //     if (newNode === sNode) node = originNode;
                // }

                // endContainer
                if (!passNode && child === container) {
                    var afterNode = document.createTextNode(container.substringData(offset, (container.length - offset)));
                    var textNode = document.createTextNode(container.substringData(0, offset));

                    container = textNode;
                    offset = textNode.data.length;

                    node.appendChild(textNode);

                    pCurrent = [];
                    // newNode = child;
                    // while (newNode.parentNode !== lineNode) {
                    //     if (newNode.nodeType === 1) {
                    //         pCurrent.push(newNode.cloneNode(false));
                    //     }
                    //     newNode = newNode.parentNode;
                    // }
                    //
                    // appendNode = newNode = pCurrent.pop() || pNode;
                    // while (pCurrent.length > 0) {
                    //     newNode = pCurrent.pop();
                    //     appendNode.appendChild(newNode);
                    // }

                    if (originNode !== pNode) pNode.appendChild(originNode);

                    child = afterNode;
                    node = originNode;
                    passNode = true;
                }

                if (passNode || child.nodeName !== nodeName) {
                    var cloneNode = child.cloneNode(false);
                    node.appendChild(cloneNode);
                    if (child.nodeType === 1) node = cloneNode;
                }

                if (!passNode && child.nodeType === 1) {
                    cloneNode = child.cloneNode(false);
                    originNode.appendChild(cloneNode);
                    if (child.nodeType === 1) originNode = cloneNode;
                }

                recursionFunc(child, node, originNode);
            }
        })(element, sNode, pNode);

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
            // startCon
            start = SUNEDITOR.plugin.fontSize.overlayLineNodesStart(lineNodes[0], 'SPAN', fontSize, startCon, startOff);
            // mid
            for (var i = 1; i < lineNodes.length - 1; i++) {
                SUNEDITOR.plugin.fontSize.overlayLineNodes(lineNodes[i], 'SPAN', fontSize);
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