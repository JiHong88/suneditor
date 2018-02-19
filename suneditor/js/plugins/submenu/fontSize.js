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

        var passNode = false;
        var pCurrent;
        var newNode;
        var appendNode;

        (function recursionFunc(current, node) {

            var childNodes = current.childNodes;
            for (var i = 0; i < childNodes.length; i++) {
                var child = childNodes[i];
                var coverNode = node;

                if (!passNode && child === startCon) {
                    var prevNode = document.createTextNode(startCon.substringData(0, startOff));
                    var textNode = document.createTextNode(startCon.substringData(startOff, (startCon.length - startOff)));

                    if (prevNode.data.length > 0) {
                        node.appendChild(prevNode);
                    }

                    startCon = textNode;
                    startOff = 0;

                    if (!/^P$/i.test(current.nodeName)) {
                        pCurrent = [];
                        while (!/^P$|^BODY$/i.test(current.parentNode.nodeName)) {
                            if (current.nodeName !== nodeName) {
                                pCurrent.push(current.cloneNode(false));
                            }
                            current = current.parentNode;
                        }

                        appendNode = newNode = pCurrent.pop();
                        while (pCurrent.length > 0) {
                            newNode = pCurrent.pop();
                            appendNode.appendChild(newNode);
                        }

                        sNode.appendChild(appendNode);
                    } else {
                        newNode = sNode;
                    }

                    child = textNode;
                    node = newNode;
                    pNode.appendChild(sNode);

                    passNode = true;
                }

                if (passNode) {
                    if (!/^P$/i.test(current.nodeName)) {
                        pCurrent = [];
                        while (!/^SPAN$|^P$|^BODY$/i.test(current.parentNode.nodeName)) {
                            if (current.nodeName !== nodeName) {
                                pCurrent.push(current.cloneNode(false));
                            }
                            current = current.parentNode;
                        }

                        appendNode = newNode = pCurrent.length > 0 ? pCurrent.pop() : node;
                        while (pCurrent.length > 0) {
                            newNode = pCurrent.pop();
                            appendNode.appendChild(newNode);
                        }

                        sNode.appendChild(appendNode);
                    } else {
                        newNode = sNode;
                    }

                    node = newNode;
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
            startCon: startCon,
            startOff: startOff
        };
    },

    overlayFullLineNodesEnd: function (element, nodeName, fontSize, endCon, endOff) {
        var pNode = document.createElement('P');
        var sNode = document.createElement(nodeName);
        sNode.style.fontSize = fontSize;

        var passNode = false;
        var cloneNode;
        pNode.appendChild(sNode);

        (function recursionFunc(current, node, newNode) {
            var childNodes = current.childNodes;
            var textNode = null;

            for (var i = 0; i < childNodes.length; i++) {
                var child = childNodes[i];

                // endCon
                if (!passNode && child === endCon) {
                    var afterNode;
                    if (endCon.nodeType === 1) {
                        afterNode = document.createTextNode(endCon.textContent);
                        textNode = document.createTextNode(endCon.innerHTML);
                    } else {
                        afterNode = document.createTextNode(endCon.substringData(endOff, (endCon.length - endOff)));
                        textNode = document.createTextNode(endCon.substringData(0, endOff));
                    }

                    endCon = textNode;
                    endOff = textNode.data.length;

                    child = textNode;
                    node.appendChild(textNode);

                    if (afterNode.data.length > 0) {
                        if (newNode) {
                            newNode.appendChild(afterNode);
                            pNode.appendChild(newNode);
                        } else {
                            pNode.appendChild(afterNode);
                        }
                    }

                    if (childNodes.length - 1 === i) node = pNode;
                    else if (newNode) node = newNode;

                    newNode = null;
                }

                if (child.nodeName !== nodeName) {
                    cloneNode = child.cloneNode(false);
                    node.appendChild(cloneNode);
                    if (child.nodeType === 1) node = cloneNode;
                }

                if (child.nodeType === 1) {
                    newNode = child.cloneNode(false);
                }

                recursionFunc(child, node, newNode);

                if (node !== sNode) {
                    node = node.parentNode;
                }

                if (newNode && newNode !== pNode) {
                    newNode = newNode.parentNode;
                }
            }
        })(element, sNode, pNode);

        element.innerHTML = pNode.innerHTML;

        return {
            endCon: endCon,
            endOff: endOff
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
        var lineNodes = SUNEDITOR.dom.getListChildren(commonCon, function (current) { return /^P$/i.test(current.nodeName) && current.childNodes.length > 0; });

        // startCon
        var start = SUNEDITOR.plugin.fontSize.overlayLineNodesStart(lineNodes[0], 'SPAN', fontSize, startCon, startOff);
        // mid
        for (var i = 1; i < lineNodes.length - 1; i++) {
            SUNEDITOR.plugin.fontSize.overlayLineNodes(lineNodes[i], 'SPAN', fontSize);
        }
        // endCon
        // var end = SUNEDITOR.plugin.fontSize.overlayFullLineNodesEnd(lineNodes[lineNodes.length - 1], 'SPAN', fontSize, endCon, endOff);

        // set range
        // this.setRange(start.startCon, start.startOff, end.endCon, end.endOff);
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