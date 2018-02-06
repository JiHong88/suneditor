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

    appendSpan: function (fontsize) {
        fontsize = fontsize + "pt";

        var ELEMENT_NODE = 1;
        var TEXT_NODE = 3;
        var nativeRng = this.getRange();

        var startCon = nativeRng.startContainer;
        var startOff = nativeRng.startOffset;
        var endCon = nativeRng.endContainer;
        var endOff = nativeRng.endOffset;
        var commonCon = nativeRng.commonAncestorContainer;

        var spanNode = null;
        var beforeNode = null;
        var afterNode = null;

        var item;
        var i;

        /** Select within the same node */
        if (startCon === endCon) {
            if (startCon.nodeType === ELEMENT_NODE && /^SPAN$/i.test(startCon.nodeName)) {
                startCon.style.fontSize = fontsize;
            }
            else if (startOff === endOff) {
                spanNode = document.createElement("SPAN");
                spanNode.style.fontSize = fontsize;
                spanNode.innerHTML = "&nbsp;";

                startCon.parentNode.insertBefore(spanNode, startCon.nextSibling);

                startCon = spanNode;
                startOff = 0;
                endCon = spanNode;
                endOff = 1;
            }
            else {
                var afterNodeStandardPosition;
                beforeNode = document.createTextNode(startCon.substringData(0, startOff));
                afterNode = document.createTextNode(startCon.substringData(endOff, (startCon.length - endOff)));

                spanNode = document.createElement("SPAN");
                spanNode.style.fontSize = fontsize;

                if (startOff === endOff) {
                    spanNode.innerHTML = "&nbsp;";
                    afterNodeStandardPosition = spanNode.nextSibling;
                } else {
                    spanNode.innerText = startCon.substringData(startOff, (endOff - startOff));

                    try {
                        afterNodeStandardPosition = startCon.nextSibling.nextSibling;
                    } catch (e) {
                        afterNodeStandardPosition = startCon.nextSibling;
                    }
                }

                startCon.parentNode.insertBefore(spanNode, startCon.nextSibling);

                if (beforeNode.data.length > 0) {
                    startCon.data = beforeNode.data;
                } else {
                    startCon.data = startCon.substringData(0, startOff);
                }

                if (afterNode.data.length > 0) {
                    startCon.parentNode.insertBefore(afterNode, afterNodeStandardPosition);
                }

                startCon = spanNode;
                startOff = 0;
                endCon = spanNode;
                endOff = 1;
            }
        }
        /** Select multiple nodes */
        else {
            // line varibles
            var lineNodesP = SUNEDITOR.dom.getListChildren(commonCon, function (current) { return /BODY/i.test(current.parentNode.nodeName); });
            var textNodes;
            var textNodesLen;
            var findNode;
            var n;
            var s;
            // textNodes varibles
            var textNodeParent;
            var text;

            /** each */
            for (i = 0; i < lineNodesP.length; i++) {
                textNodes = SUNEDITOR.dom.getListChildNodes(lineNodesP[i], function (current) { return current.nodeType === 3; });
                textNodesLen = textNodes.length;
                s = 0;

                // find start index
                if (i === 0) {
                    findNode = startCon;
                    for (s = SUNEDITOR.dom.getArrayIndex(textNodes, startCon) + 1; s >= 0; s--) {
                        if (textNodes[s] === findNode && /^SPAN$/i.test(textNodes[s].nodeName) && textNodes[s].firstChild === findNode && startOff === 0) {
                            n = s;
                            findNode = findNode.parentNode;
                        }
                    }
                }

                // find end index
                if (i === lineNodesP.length - 1) {
                    findNode = endCon;
                    for (s = SUNEDITOR.dom.getArrayIndex(textNodes, endCon) - 1; s > 0; s--) {
                        if (textNodes[s] === findNode && textNodes[s].nodeType === ELEMENT_NODE) {
                            textNodes.splice(s, 1);
                            findNode = findNode.parentNode;
                            --textNodesLen;
                        }
                    }
                }

                // create textNode
                text = document.createTextNode('');
                for (n = s; n < textNodesLen; n++) {
                    item = textNodes[n];
                    textNodeParent = item.parentNode;

                    // remove garbage node
                    if (item.length === 0 || (item.nodeType === TEXT_NODE && item.data === undefined)) {
                        SUNEDITOR.dom.removeItem(item);
                        continue;
                    }

                    // startCon
                    if (item === startCon) {
                        if (startCon.nodeType === ELEMENT_NODE) {
                            beforeNode = document.createTextNode(startCon.textContent);
                            text.data = startCon.textContent;
                        } else {
                            beforeNode = document.createTextNode(startCon.substringData(0, startOff));
                            text.data = startCon.substringData(startOff, (startCon.length - startOff));
                        }

                        startCon.parentNode.insertBefore(text, item.nextSibling);

                        if (beforeNode.length > 0) {
                            startCon.data = beforeNode.data;
                        } else {
                            SUNEDITOR.dom.removeItem(startCon);
                        }

                        startCon = text;
                        startOff = 0;

                        continue;
                    }

                    // endCon


                }
            }
        }

        this.setRange(startCon, startOff, endCon, endOff);
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