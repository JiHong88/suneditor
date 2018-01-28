/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
SUNEDITOR.plugin.fontSize = {
    add : function (_this, targetElement) {
        /** set submenu */
        var listDiv = eval(this.setSubmenu(_this.context.user));

        /** add event listeners */
        listDiv.getElementsByTagName('UL')[0].addEventListener('click', this.pickup.bind(_this));

        /** append html */
        targetElement.parentNode.appendChild(listDiv);
    },

    setSubmenu : function (user) {
        var listDiv = document.createElement('DIV');
        listDiv.className = 'layer_editor layer_size';
        listDiv.style.display = 'none';

        var sizeList = !user.fontSizeList? [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72]: user.fontSizeList;

        var list = '<div class="inner_layer">'+
            '   <ul class="list_editor font_size_list">';
        for(var i=0; i<sizeList.length; i++) {
            var size = sizeList[i];
            list += '<li><button type="button" class="btn_edit" data-value="'+size+'" style="font-size:'+size+'pt;">'+size+'</button></li>';
        }
        list += '   </ul>'+
            '</div>';

        listDiv.innerHTML = list;

        return listDiv;
    },

    appendSpan : function(fontsize) {
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

        /** Select within the same node */
        if(startCon === endCon) {
            if(startCon.nodeType === ELEMENT_NODE && /^SPAN$/i.test(startCon.nodeName)) {
                startCon.style.fontSize = fontsize;
            }
            else {
                var afterNodeStandardPosition;
                beforeNode = document.createTextNode(startCon.substringData(0, startOff));
                afterNode = document.createTextNode(startCon.substringData(endOff, (startCon.length - endOff)));

                spanNode = document.createElement("SPAN");
                spanNode.style.fontSize = fontsize;

                if(startOff === endOff) {
                    spanNode.innerHTML = "&nbsp;";
                    afterNodeStandardPosition = spanNode.nextSibling;
                } else {
                    spanNode.innerText = startCon.substringData(startOff, (endOff - startOff));

                    try {
                        afterNodeStandardPosition = startCon.nextSibling.nextSibling;
                    } catch(e) {
                        afterNodeStandardPosition = startCon.nextSibling;
                    }
                }

                startCon.parentNode.insertBefore(spanNode, startCon.nextSibling);

                if(beforeNode.data.length > 0) {
                    startCon.data = beforeNode.data;
                } else {
                    startCon.data = startCon.substringData(0, startOff);
                }

                if(afterNode.data.length > 0) {
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
            var childNodes = SUNEDITOR.dom.getListChildNodes(commonCon, function(current){return current.nodeType === 3;});
            var startIndex = SUNEDITOR.dom.getArrayIndex(childNodes, startCon);
            var endIndex = SUNEDITOR.dom.getArrayIndex(childNodes, endCon);

            var startNode = startCon;
            for(var i=startIndex+1; i>=0; i--) {
                if(childNodes[i] === startNode && /^SPAN$/i.test(childNodes[i].nodeName) && childNodes[i].firstChild === startNode && startOff === 0) {
                    startIndex = i;
                    startNode = startNode.parentNode;
                }
            }

            var endNode = endCon;
            for(var i=endIndex-1; i>startIndex; i--) {
                if(childNodes[i] === endNode && childNodes[i].nodeType === ELEMENT_NODE) {
                    childNodes.splice(i, 1);
                    endNode = endNode.parentNode;
                    --endIndex;
                }
            }

            for(var i=startIndex; i<=endIndex; i++) {
                var item = childNodes[i];
                var parentNode = item.parentNode;

                if(item.length === 0 || (item.nodeType === TEXT_NODE && item.data === undefined)) {
                    SUNEDITOR.dom.removeItem(item);
                    continue;
                }

                if(item === startCon) {
                    if(parentNode.nodeType === ELEMENT_NODE && parentNode.style.fontSize === fontsize) {
                        if(/^SPAN$/i.test(item.nodeName)) {
                            item.style.fontSize = fontsize;
                        }
                        continue;
                    }

                    spanNode = document.createElement("SPAN");
                    spanNode.style.fontSize = fontsize;

                    if(startCon.nodeType === ELEMENT_NODE) {
                        beforeNode = document.createTextNode(startCon.textContent);
                        spanNode.innerHTML = startCon.innerHTML;
                    } else {
                        beforeNode = document.createTextNode(startCon.substringData(0, startOff));
                        spanNode.innerText = startCon.substringData(startOff, (startCon.length - startOff));
                    }

                    startCon.parentNode.insertBefore(spanNode, item.nextSibling);

                    if(beforeNode.length > 0) {
                        startCon.data = beforeNode.data;
                    } else {
                        SUNEDITOR.dom.removeItem(startCon);
                    }

                    startCon = spanNode.firstChild;
                    startOff = 0;

                    continue;
                }

                if(item === endCon) {
                    if(parentNode.nodeType === ELEMENT_NODE && parentNode.style.fontSize === fontsize) {
                        if(/^SPAN$/i.test(item.nodeName) && endCon.data.length === item.textContent.length) {
                            item.style.fontSize = fontsize;
                        }
                        continue;
                    }

                    spanNode = document.createElement("SPAN");
                    spanNode.style.fontSize = fontsize;

                    if(endCon.nodeType === ELEMENT_NODE) {
                        afterNode = document.createTextNode(endCon.textContent);
                        spanNode.innerHTML = endCon.innerHTML;
                    } else {
                        afterNode = document.createTextNode(endCon.substringData(endOff, (endCon.length - endOff)));
                        spanNode.innerText = endCon.substringData(0, endOff);
                    }

                    endCon.parentNode.insertBefore(spanNode, endCon);

                    if(afterNode.length > 0) {
                        endCon.data = afterNode.data;
                    } else {
                        SUNEDITOR.dom.removeItem(endCon);
                    }

                    endCon = spanNode.firstChild;
                    endOff = spanNode.textContent.length;

                    continue;
                }

                if(parentNode.nodeType === ELEMENT_NODE) {
                    if(parentNode.style.fontSize === fontsize && /^SPAN$/i.test(item.nodeName)) {
                        var textNode = document.createTextNode(item.textContent);
                        parentNode.insertBefore(textNode, item);
                        SUNEDITOR.dom.removeItem(item);
                        continue;
                    }
                    else if(/^SPAN$/i.test(item.nodeName) && item.style.fontSize !== fontsize) {
                        item.style.fontSize = fontsize;
                        continue;
                    }
                }

                if(/^SPAN$/i.test(item.nodeName)) {
                    item.style.fontSize = fontsize;
                    continue;
                }

                spanNode = document.createElement("SPAN");
                spanNode.style.fontSize = fontsize;

                if(item.nodeType === ELEMENT_NODE) {
                    spanNode.innerHTML = item.innerHTML;
                } else {
                    spanNode.innerText = item.data;
                }

                item.parentNode.insertBefore(spanNode, item);
                SUNEDITOR.dom.removeItem(item);
            }
        }

        this.setRange(startCon, startOff, endCon, endOff);
    },

    pickup : function (e) {
        e.preventDefault();
        e.stopPropagation();

        if(!/^BUTTON$/i.test(e.target.tagName)) {
            return false;
        }

        this.focus();
        SUNEDITOR.plugin.fontSize.appendSpan.call(this, e.target.getAttribute('data-value'));
        this.submenuOff();
    }
};