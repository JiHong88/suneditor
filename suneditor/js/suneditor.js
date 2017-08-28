if(typeof window.SUNEDITOR === 'undefined') window.SUNEDITOR = {};

/** default language english */
SUNEDITOR.defaultLang = {
    toolbar : {
        fontFamily : 'Font',
        fontFamilyDelete : 'Remove Font Family',
        formats : 'Formats',
        fontSize : 'Size',
        bold : 'Bold',
        underline : 'Underline',
        italic : 'Italic',
        strike : 'Strike',
        fontColor : 'Font Color',
        hiliteColor : 'Background Color',
        indent : 'Indent',
        outdent : 'Outdent',
        align : 'Align',
        alignLeft : 'Align left',
        alignRight : 'Align right',
        alignCenter : 'Align center',
        justifyFull : 'Justify full',
        left : 'Left',
        right : 'Right',
        center : 'Center',
        bothSide : 'Justify full',
        list : 'list',
        orderList : 'Ordered list',
        unorderList : 'Unordered list',
        line : 'Line',
        table : 'Table',
        link : 'Link',
        image : 'Picture',
        video : 'Video',
        fullScreen : 'Full Screen',
        htmlEditor : 'Code View',
        undo : 'Undo',
        redo : 'Redo'
    },
    dialogBox : {
        linkBox : {
            title : 'Insert Link',
            url : 'URL to link',
            text : 'Text to display',
            newWindowCheck : 'Open in new window'
        },
        imageBox : {
            title : 'Insert Image',
            file : 'Select from files',
            url : 'Image URL',
            resize100 : 'resize 100%',
            resize75 : 'resize 75%',
            resize50 : 'resize 50%',
            resize25 : 'resize 25%',
            remove : 'remove image'
        },
        videoBox : {
            title : 'Insert Video',
            url : 'Media embed URL, YouTube',
            width : 'Width',
            height : 'Height'
        },
        submitButton : 'Submit'
    },
    editLink : {
        edit : 'Edit',
        remove : 'Remove'
    }
};

/**
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
(function(SUNEDITOR){
    /**
     * utile func
     */
    var func = {
        returnTrue : function() {
            return true;
        },

        getXMLHttpRequest : function() {
            /** 익스플로러 */
            if(window.ActiveXObject){
                try{
                    return new ActiveXObject("Msxml2.XMLHTTP");
                }catch(e){
                    try{
                        return new ActiveXObject("Microsoft.XMLHTTP");
                    }catch(e1){
                        return null;
                    }
                }
            }
            /** 네스케이프 */
            else if(window.XMLHttpRequest){
                return new XMLHttpRequest();
            }
            /** 브라우저 식별 실패 */
            else {
                return null;
            }
        }
    };

    /**
     * document func
     */
    var dom = {
        getArrayIndex : function(array, element) {
            var idx = -1;
            var len = array.length;

            for(var i=0; i<len; i++) {
                if(array[i] === element) {
                    idx = i;
                    break;
                }
            }

            return idx;
        },

        nextIdx : function(array, item) {
            var idx = this.getArrayIndex(array, item);
            if (idx === -1) return -1;

            return idx + 1;
        },

        prevIdx : function(array, item) {
            var idx = this.getArrayIndex(array, item);
            if (idx === -1) return -1;

            return idx - 1;
        },

        isCell : function(node) {
            return node && /^TD$|^TH$/i.test(node.nodeName);
        },

        getListChildren : function(element, validation) {
            var children = [];
            validation = validation || func.returnTrue;

            (function recursionFunc(current) {
                if (element !== current && validation(current)) {
                    children.push(current);
                }

                var childLen = current.children.length;
                for(var i=0, len=childLen; i<len; i++) {
                    recursionFunc(current.children[i]);
                }
            })(element);

            return children;
        },

        getListChildNodes : function(element, validation) {
            var children = [];
            validation = validation || func.returnTrue;

            (function recursionFunc(current) {
                if (validation(current)) {
                    children.push(current);
                }

                var childLen = current.childNodes.length;
                for(var i=0, len=childLen; i<len; i++) {
                    recursionFunc(current.childNodes[i]);
                }
            })(element);

            return children;
        },

        getParentNode : function(element, tagName) {
            var check = new RegExp("^"+tagName+"$", "i");

            while(!check.test(element.tagName)) {
                element = element.parentNode;
            }

            return element;
        },

        changeTxt : function(element, txt) {
            element.textContent = txt;
        },

        changeClass : function(element, className) {
            element.className = className;
        },

        addClass : function(element, className) {
            if(!element) return;

            var check = new RegExp("(\\s|^)" + className + "(\\s|$)");
            if(check.test(element.className)) return;

            element.className += " " + className;
        },

        removeClass : function(element, className) {
            if(!element) return;

            var check = new RegExp("(\\s|^)" + className + "(\\s|$)");
            element.className = element.className.replace(check, " ").trim();
        },

        toggleClass : function(element, className) {
            var check = new RegExp("(\\s|^)" + className + "(\\s|$)");

            if (check.test(element.className)) {
                element.className = element.className.replace(check, " ").trim();
            }
            else {
                element.className += " " + className;
            }
        },

        removeItem : function(item) {
            try {
                item.remove();
            } catch(e) {
                item.removeNode();
            }
        },

        copyObj : function(obj) {
            var copy = {};
            for (var attr in obj) {
                copy[attr] = obj[attr];
            }
            return copy;
        }
    };

    /**
     * SunEditor
     * @param context
     */
    var core = function(context){

        /** 배열 관련 */
        var list = (function(context){
            var commandMap = {
                'FONT': context.tool.fontFamily,
                'B' : context.tool.bold,
                'U' : context.tool.underline,
                'I' : context.tool.italic,
                'STRIKE' : context.tool.strike,
                'SIZE' : context.tool.fontSize
            };

            /** 글꼴 목록 가져오기 */
            var fontFamilyMap = {};
            var list_fontFamily = context.tool.list_fontFamily.children;
            var fontFamilyLen = list_fontFamily.length;

            for(var i=0; i<fontFamilyLen; i++) {
                fontFamilyMap[list_fontFamily[i].firstChild.getAttribute("data-value").replace(/\s*/g,"")] = list_fontFamily[i].firstChild.getAttribute("data-txt");
            }

            if(!!context.tool.list_fontFamily_add) {
                list_fontFamily = context.tool.list_fontFamily_add.children;
                fontFamilyLen = list_fontFamily.length;
                for(var i=0; i<fontFamilyLen; i++) {
                    fontFamilyMap[list_fontFamily[i].firstChild.getAttribute("data-value").replace(/\s*/g,"")] = list_fontFamily[i].firstChild.getAttribute("data-txt");
                }
            }

            return {
                commandMap : commandMap,
                fontFamilyMap : fontFamilyMap
            };
        })(context);

        /** selection 관련 */
        var wysiwygSelection = {
            focus : function(){
                context.element.wysiwygWindow.document.body.focus();
            },

            isEdgePoint : function(container, offset) {
                return (offset === 0) || (offset === container.nodeValue.length);
            },

            createRange : function() {
                return context.element.wysiwygWindow.document.createRange();
            },

            getSelection : function() {
                return context.element.wysiwygWindow.getSelection();
            },

            getSelectionNode : function() {
                return wysiwygSelection.getSelection().extentNode || wysiwygSelection.getSelection().anchorNode;
            },

            getRange : function() {
                var selection = this.getSelection();
                var nativeRng = null;

                if(selection.rangeCount > 0) {
                    nativeRng = selection.getRangeAt(0);
                } else {
                    selection = context.argument._copySelection;

                    nativeRng = this.createRange();
                    nativeRng.setStart(selection.anchorNode, selection.anchorOffset);
                    nativeRng.setEnd(selection.focusNode, selection.focusOffset);
                }

                return nativeRng;
            },

            setRange : function(startCon, startOff, endCon, endOff) {
                var range = this.createRange();
                range.setStart(startCon, startOff);
                range.setEnd(endCon, endOff);

                var selection = this.getSelection();
                if (selection.rangeCount > 0) {
                    selection.removeAllRanges();
                }
                selection.addRange(range);
            }
        };

        /** 에디터 */
        var editor = {
            subMenu : null,
            originSub : null,
            modalForm : null,
            editLink : null,
            tabSize : 4,
            fontSizeUnit : "pt",

            pure_execCommand : function(command, showDefaultUI, value) {
                context.element.wysiwygWindow.document.execCommand(command, showDefaultUI, value);
            },

            cancel_table_picker : function() {
                context.tool.tableHighlight.style.width = "1em";
                context.tool.tableHighlight.style.height = "1em";
                context.tool.tableUnHighlight.style.width = "5em";
                context.tool.tableUnHighlight.style.height = "5em";
                dom.changeTxt(context.tool.tableDisplay, "1 x 1");
            },

            subOff : function() {
                if(!!this.subMenu) {
                    this.subMenu.style.display = "none";
                    this.subMenu = null;
                    this.cancel_table_picker();
                }
                if(!!this.modalForm) {
                    this.modalForm.style.display = "none";
                    context.dialog.back.style.display = "none";
                    context.dialog.modalArea.style.display = "none";
                    this.modalForm = null;
                }
                if(!!context.argument._imageElement) {
                    this.cancel_resize_image();
                }
                if(!!this.editLink) {
                    context.element.linkBtn.style.display = "none";
                    context.dialog.linkText.value = "";
                    context.dialog.linkAnchorText.value = "";
                    context.dialog.linkNewWindowCheck.checked = false;
                    context.argument._linkAnchor = null;
                    this.editLink = null;
                }
            },

            toggleFrame : function(){
                if(!context.argument._wysiwygActive) {
                    var ec = {"&amp;":"&","&nbsp;":"\u00A0","&quot;":"\"","&lt;":"<","&gt;":">"};
                    var source_html = context.element.source.value.replace(/&[a-z]+;/g, function(m){ return (typeof ec[m] === "string")?ec[m]:m; });
                    context.element.wysiwygWindow.document.body.innerHTML = source_html.trim().length > 0? source_html: "<p>&#65279</p>";
                    context.element.wysiwygWindow.document.body.scrollTop = 0;
                    context.element.source.style.display = "none";
                    context.element.wysiwygElement.style.display = "block";
                    context.argument._wysiwygActive = true;
                }
                else {
                    context.element.source.value = context.element.wysiwygWindow.document.body.innerHTML.trim().replace(/<\/p>(?!^\r)(?!^\n)/gi, "<\/p>\r\n");
                    context.element.wysiwygElement.style.display = "none";
                    context.element.source.style.display = "block";
                    context.argument._wysiwygActive = false;
                }
            },

            toggleFullScreen : function(element){
                if(!context.argument._isFullScreen) {
                    context.element.topArea.style.position = "fixed";
                    context.element.topArea.style.top = "0";
                    context.element.topArea.style.left = "0";
                    context.element.topArea.style.width = "100%";
                    context.element.topArea.style.height = "100%";

                    context.argument._innerHeight_fullScreen = (window.innerHeight - context.tool.bar.offsetHeight);
                    context.element.editorArea.style.height = context.argument._innerHeight_fullScreen + "px";

                    dom.removeClass(element.firstElementChild, 'ico_full_screen_e');
                    dom.addClass(element.firstElementChild, 'ico_full_screen_i');
                }
                else {
                    context.element.topArea.style.cssText = context.argument._originCssText;
                    context.element.editorArea.style.height = context.argument._innerHeight + "px";

                    dom.removeClass(element.firstElementChild, 'ico_full_screen_i');
                    dom.addClass(element.firstElementChild, 'ico_full_screen_e');
                }

                context.argument._isFullScreen = !context.argument._isFullScreen;
            },

            appendHr : function(value) {
                var borderStyle = "";
                switch(value) {
                    case 'hr1':
                        borderStyle = "black 1px solid";
                        break;
                    case 'hr2':
                        borderStyle = "black 1px dotted";
                        break;
                    case 'hr3':
                        borderStyle = "black 1px dashed";
                        break;
                }

                var oHr = document.createElement("HR");
                oHr.style.border = "black 0px none";
                oHr.style.borderTop = borderStyle;
                oHr.style.height = "1px";
                context.argument._selectionNode.parentNode.appendChild(oHr);

                editor.appendP(oHr);
            },

            appendTable : function(x, y) {
                var oTable = document.createElement("TABLE");

                var tableHTML = '<tbody>';
                while(y>0) {
                    tableHTML += '<tr>';
                    var tdCnt = x;
                    while(tdCnt>0) {
                        tableHTML += '<td><p>&#65279</p></td>';
                        --tdCnt;
                    }
                    tableHTML += '</tr>';
                    --y;
                }
                tableHTML += '</tbody>';

                oTable.innerHTML = tableHTML;

                editor.insertNode(oTable);
                editor.appendP(oTable);
            },

            appendP : function(element) {
                var oP = document.createElement("P");
                oP.innerHTML = '&#65279';
                element.parentNode.insertBefore(oP, element.nextElementSibling);
            },

            openDialog : function(kind) {
                var focusText = null;

                switch(kind) {
                    case 'link':
                        this.modalForm = context.dialog.link;
                        focusText = context.dialog.linkText;
                        break;
                    case 'image':
                        this.modalForm = context.dialog.image;
                        focusText = context.dialog.imgInputUrl;
                        break;
                    case 'video':
                        this.modalForm = context.dialog.video;
                        focusText = context.dialog.videoInputUrl;
                        break;
                }

                context.dialog.modalArea.style.display = "block";
                context.dialog.back.style.display = "block";
                context.dialog.modal.style.display = "block";
                this.modalForm.style.display = "block";

                this.subMenu = context.dialog.modal;

                focusText.focus();
            },

            showLoding : function() {
                context.element.loding.style.display = "block";
            },

            closeLoding : function() {
                context.element.loding.style.display = "none";
            },

            insertNode : function(oNode) {
                var selection = wysiwygSelection.getSelection();
                var nativeRng = wysiwygSelection.getRange();

                var startCon = nativeRng.startContainer;
                var startOff = nativeRng.startOffset;
                var endCon = nativeRng.endContainer;
                var endOff = nativeRng.endOffset;

                var parentNode = startCon;
                if(/^#text$/i.test(startCon.nodeName)) {
                    parentNode = startCon.parentNode;
                }

                /** 범위선택 없을때 */
                if(startCon === endCon && startOff === endOff) {
                    if(!!selection.focusNode && /^#text$/i.test(selection.focusNode.nodeName)) {
                        var rightNode = selection.focusNode.splitText(endOff);
                        parentNode.insertBefore(oNode, rightNode);
                    }
                    else {
                        if(parentNode.lastChild !== null && /^BR$/i.test(parentNode.lastChild.nodeName)) {
                            parentNode.removeChild(parentNode.lastChild);
                        }
                        parentNode.appendChild(oNode);
                    }
                }
                /** 범위선택 했을때 */
                else {
                    var rightNode = null;
                    var removeNode = startCon;
                    var isSameContainer = startCon === endCon;
                    var endLen = endCon.data.length;

                    if(isSameContainer) {
                        if(!wysiwygSelection.isEdgePoint(endCon, endOff)) {
                            rightNode = endCon.splitText(endOff);
                        }

                        if(!wysiwygSelection.isEdgePoint(startCon, startOff)) {
                            removeNode = startCon.splitText(startOff);
                        }

                        parentNode.removeChild(removeNode);
                    }
                    else {
                        try {
                            selection.deleteFromDocument();
                        } catch(e) {

                        }

                        if(endLen === endCon.data.length) rightNode = endCon.nextSibling;
                        else rightNode = endCon;
                    }

                    try {
                        parentNode.insertBefore(oNode, rightNode);
                    } catch(e) {
                        parentNode.appendChild(oNode);
                    }
                }
            },

            appendSpan : function(fontsize) {
                fontsize = fontsize + editor.fontSizeUnit;
                var nativeRng = wysiwygSelection.getRange();

                var startCon = nativeRng.startContainer;
                var startOff = nativeRng.startOffset;
                var endCon = nativeRng.endContainer;
                var endOff = nativeRng.endOffset;
                var commonCon = nativeRng.commonAncestorContainer;

                var ELEMENT_NODE = 1;
                var TEXT_NODE = 3;

                /** 같은 노드안에서 선택 */
                if(startCon === endCon) {
                    if(startCon.nodeType === ELEMENT_NODE && /^SPAN$/i.test(startCon.nodeName)) {
                        startCon.style.fontSize = fontsize;
                    }
                    else {
                        var afterNodeStandardPosition;
                        var beforeNode = document.createTextNode(startCon.substringData(0, startOff));
                        var afterNode = document.createTextNode(startCon.substringData(endOff, (startCon.length - endOff)));

                        var spanNode = document.createElement("SPAN");
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
                /** 여러개의 노드 선택 */
                else {
                    var childNodes = dom.getListChildNodes(commonCon);
                    var startIndex = dom.getArrayIndex(childNodes, startCon);
                    var endIndex = dom.getArrayIndex(childNodes, endCon);
                    var spanNode = null;
                    var beforeNode = null;
                    var afterNode = null;

                    var startNode = startCon;
                    for(var i=startIndex+1; i>=0; i--) {
                        if(childNodes[i] === startNode.parentNode && /^SPAN$/i.test(childNodes[i].nodeName) && childNodes[i].firstChild === startNode && startOff === 0) {
                            startIndex = i;
                            startNode = startNode.parentNode;
                        }
                    }

                    var endNode = endCon;
                    for(var i=endIndex-1; i>startIndex; i--) {
                        if(childNodes[i] === endNode.parentNode && childNodes[i].nodeType === ELEMENT_NODE) {
                            childNodes.splice(i, 1);
                            endNode = endNode.parentNode;
                            --endIndex;
                        }
                    }

                    for(var i=startIndex; i<=endIndex; i++) {
                        var item = childNodes[i];
                        var parentNode = item.parentNode;

                        if(item.length === 0 || (item.nodeType === TEXT_NODE && item.data === undefined)) {
                            dom.removeItem(item);
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
                                dom.removeItem(startCon);
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
                                dom.removeItem(endCon);
                            }

                            endCon = spanNode.firstChild;
                            endOff = spanNode.textContent.length;

                            continue;
                        }

                        if(parentNode.nodeType === ELEMENT_NODE) {
                            if(parentNode.style.fontSize === fontsize && /^SPAN$/i.test(item.nodeName)) {
                                var textNode = document.createTextNode(item.textContent);
                                parentNode.insertBefore(textNode, item);
                                dom.removeItem(item);
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
                        dom.removeItem(item);
                    }
                }

                wysiwygSelection.setRange(startCon, startOff, endCon, endOff);
            },

            resize_editor : function(e) {
                var resizeInterval = (e.clientY - context.argument._resizeClientY);

                context.element.editorArea.style.height = (context.element.editorArea.offsetHeight + resizeInterval) + "px";

                context.argument._innerHeight = (context.element.editorArea.offsetHeight + resizeInterval);

                context.argument._resizeClientY = e.clientY;
            },

            resize_image : function(e) {
                var w = context.argument._imageElement_w + (e.clientX - context.argument._imageClientX);
                var h = ((context.argument._imageElement_h/context.argument._imageElement_w) * w);

                context.argument._imageElement.style.width = w + "px";
                context.argument._imageElement.style.height = h + "px";

                var parentElement = context.argument._imageElement.offsetParent;
                var parentT = 0;
                var parentL = 0;
                while(parentElement) {
                    parentT += (parentElement.offsetTop + parentElement.clientTop);
                    parentL += (parentElement.offsetLeft + + parentElement.clientLeft);
                    parentElement = parentElement.offsetParent;
                }

                var t = (context.argument._imageElement.offsetTop + context.argument._imageResize_parent_t - context.element.wysiwygWindow.document.body.scrollTop);
                var l = (context.argument._imageElement.offsetLeft + parentL);

                context.element.imageResizeDiv.style.top = t + "px";
                context.element.imageResizeDiv.style.left = l + "px";
                context.element.imageResizeDiv.style.width = w + "px";
                context.element.imageResizeDiv.style.height = h + "px";

                dom.changeTxt(context.element.imageResizeDisplay, Math.round(w) + " x " + Math.round(h));
            },

            cancel_resize_image : function() {
                context.element.resizeBackground.style.display = "none";
                context.element.imageResizeDiv.style.display = "none";
                context.element.imageResizeBtn.style.display = "none";
                context.argument._imageElement = null;
            }
        };

        /** 이벤트 */
        var event = {
            resize_window : function() {
                // if(context.tool.barHeight == context.tool.bar.offsetHeight) return;

                if(context.argument._isFullScreen) {
                    context.argument._innerHeight_fullScreen += ((context.tool.barHeight - context.tool.bar.offsetHeight) + (this.innerHeight - context.argument._windowHeight));
                    context.element.editorArea.style.height = context.argument._innerHeight_fullScreen + "px";
                }

                context.tool.barHeight = context.tool.bar.offsetHeight;
                context.argument._windowHeight = this.innerHeight;
            },

            touchstart_toolbar : function() {
                context.argument._isTouchMove = false;
            },

            touchmove_toolbar : function() {
                context.argument._isTouchMove = true;
            },

            onClick_toolbar : function(e) {
                if(context.argument._isTouchMove) return true;

                var targetElement = e.target;
                var display = targetElement.getAttribute("data-display");
                var command = targetElement.getAttribute("data-command");
                var className = targetElement.className;

                while(!command && !display && !/layer_color|layer_url|editor_tool/.test(className) && !/^BODY$/i.test(targetElement.tagName)){
                    targetElement = targetElement.parentNode;
                    command = targetElement.getAttribute("data-command");
                    display = targetElement.getAttribute("data-display");
                    className = targetElement.className;
                }

                if(!command && !display) return;

                e.preventDefault();
                e.stopPropagation();

                wysiwygSelection.focus();

                var value = targetElement.getAttribute("data-value");
                var txt = targetElement.getAttribute("data-txt");

                /** 서브메뉴 보이기 */
                if(!!display || /^BODY$/i.test(targetElement.tagName)) {
                    var nextSibling = editor.subMenu;
                    editor.subOff();

                    if(targetElement.nextElementSibling !== null && targetElement.nextElementSibling !== nextSibling){
                        editor.subMenu = targetElement.nextElementSibling;
                        editor.subMenu.style.display = "block";
                        editor.originSub = editor.subMenu.previousElementSibling;
                    }
                    else if(/modal/.test(display)) {
                        editor.openDialog(command);
                    }

                    nextSibling = null;

                    return;
                }

                if(/layer_color/.test(className) && /^BUTTON$/i.test(e.target.tagName)) {
                    value = e.target.textContent;
                }

                /** 커멘드 명령어 실행 */
                if(!!command) {
                    switch(command) {
                        case 'fontName':
                            dom.changeTxt(editor.originSub.firstElementChild, txt);
                            editor.pure_execCommand(command, false, value);
                            break;
                        case 'fontSize':
                            editor.appendSpan(value);
                            break;
                        case 'horizontalRules':
                            editor.appendHr(value);
                            break;
                        case 'sorceFrame':
                            editor.toggleFrame();
                            dom.toggleClass(targetElement, 'on');
                            break;
                        case 'fullScreen':
                            editor.toggleFullScreen(targetElement);
                            dom.toggleClass(targetElement, "on");
                            break;
                        case 'insertTable':
                            editor.appendTable(context.argument._tableXY[0], context.argument._tableXY[1]);
                            break;
                        case 'justifyleft':
                        case 'justifyright':
                        case 'justifycenter':
                        case 'justifyfull':
                        case 'indent':
                        case 'outdent':
                        case 'redo':
                        case 'undo':
                            editor.pure_execCommand(command, false);
                            break;
                        case 'formatBlock':
                        case 'foreColor':
                        case 'hiliteColor':
                            editor.pure_execCommand(command, false, value);
                            break;
                        default :
                            editor.pure_execCommand(command, false, value);
                            dom.toggleClass(targetElement, "on");
                    }

                    editor.subOff();
                }

            },

            onMouseDown_wysiwyg : function(e) {
                e.stopPropagation();

                var targetElement = e.target;
                editor.subOff();

                if(/^IMG$/i.test(targetElement.nodeName)) {
                    /** ie,firefox image resize handle : false*/
                    targetElement.setAttribute('unselectable', 'on');
                    targetElement.contentEditable = false;

                    var resizeDiv = context.element.imageResizeDiv;
                    var w = targetElement.offsetWidth;
                    var h = targetElement.offsetHeight;

                    var parentElement = targetElement.offsetParent;
                    var parentT = 0;
                    var parentL = 0;
                    while(parentElement) {
                        parentT += (parentElement.offsetTop + parentElement.clientTop);
                        parentL += (parentElement.offsetLeft + + parentElement.clientLeft);
                        parentElement = parentElement.offsetParent;
                    }
                    context.argument._imageResize_parent_t = (context.tool.bar.offsetHeight + parentT);
                    context._imageResize_parent_l = parentL;

                    var t = (targetElement.offsetTop + context.argument._imageResize_parent_t - context.element.wysiwygWindow.document.body.scrollTop);
                    var l = (targetElement.offsetLeft + parentL);

                    resizeDiv.style.top = t + "px";
                    resizeDiv.style.left = l + "px";
                    resizeDiv.style.width = w + "px";
                    resizeDiv.style.height = h + "px";

                    context.element.imageResizeBtn.style.top = (h + t) + "px";
                    context.element.imageResizeBtn.style.left = l + "px";

                    dom.changeTxt(context.element.imageResizeDisplay, w + " x " + h);

                    context.argument._imageElement = targetElement;
                    context.argument._imageElement_w = w;
                    context.argument._imageElement_h = h;
                    context.argument._imageElement_t = t;
                    context.argument._imageElement_l = l;

                    context.element.imageResizeDiv.style.display = "block";
                    context.element.imageResizeBtn.style.display = "block";
                }
                else if(/^HTML$/i.test(targetElement.nodeName)){
                    e.preventDefault();
                    wysiwygSelection.focus();
                }
            },

            onSelectionChange_wysiwyg : function() {
                context.argument._copySelection = dom.copyObj(wysiwygSelection.getSelection());
                context.argument._selectionNode = wysiwygSelection.getSelectionNode();

                var selectionParent = context.argument._selectionNode;
                var findFont = true;
                var findSize = true;
                var findA = true;
                var map = "B|U|I|STRIKE|FONT|SIZE|";
                var check = new RegExp(map, "i");
                while(!/^P$|^BODY$|^HTML$|^DIV$/i.test(selectionParent.nodeName)) {
                    var nodeName = (/^STRONG$/.test(selectionParent.nodeName)? 'B': (/^EM/.test(selectionParent.nodeName)? 'I': selectionParent.nodeName));

                    /** 폰트 */
                    if(findFont && (/^FONT$/i.test(nodeName) && selectionParent.face.length > 0)) {
                        var selectFont = list.fontFamilyMap[selectionParent.face.replace(/\s*/g,"")];
                        dom.changeTxt(list.commandMap[nodeName], selectFont);
                        findFont = false;
                        map = map.replace(nodeName+"|", "");
                        check = new RegExp(map, "i");
                    }

                    /** A */
                    if(findA && /^A$/i.test(selectionParent.nodeName) && editor.editLink !== context.element.linkBtn) {
                        editor.editLink = context.argument._linkAnchor = selectionParent;
                        var linkBtn = context.element.linkBtn;

                        linkBtn.getElementsByTagName("A")[0].href = selectionParent.href;
                        linkBtn.getElementsByTagName("A")[0].textContent = selectionParent.textContent;

                        linkBtn.style.left = selectionParent.offsetLeft + "px";
                        linkBtn.style.top = (selectionParent.offsetTop + selectionParent.offsetHeight + context.tool.bar.offsetHeight + 10) + "px";
                        linkBtn.style.display = "block";

                        linkBtn = null;
                        findA = false;
                    } else if(findA && editor.editLink) {
                        context.element.linkBtn.style.display = "none";
                        editor.subOff();
                    }

                    /** span (font size) */
                    if(findSize && /^SPAN$/i.test(nodeName) && selectionParent.style.fontSize.length > 0) {
                        dom.changeTxt(list.commandMap["SIZE"], selectionParent.style.fontSize.match(/\d+/)[0]);
                        findSize = false;
                        map = map.replace("SIZE|", "");
                        check = new RegExp(map, "i");
                    }

                    /** command */
                    if(check.test(nodeName)) {
                        dom.addClass(list.commandMap[nodeName], "on");
                        map = map.replace(nodeName+"|", "");
                        check = new RegExp(map, "i");
                    }

                    selectionParent = selectionParent.parentNode;
                }


                /** remove */
                map = map.split("|");
                var mapLen = map.length - 1;
                for(var i=0; i<mapLen; i++) {
                    if(/^FONT$/i.test(map[i])) {
                        dom.changeTxt(list.commandMap[map[i]], context.tool.default_fontFamily);
                    }
                    else if(/^SIZE$/i.test(map[i])) {
                        dom.changeTxt(list.commandMap[map[i]], context.tool.default_fontSize);
                    }
                    else {
                        dom.removeClass(list.commandMap[map[i]], "on");
                    }
                }
            },

            onKeyDown_wysiwyg : function(e) {
                e.stopPropagation();

                var target = e.target;
                var keyCode = e.keyCode;
                var shift = e.shiftKey;
                var ctrl = e.ctrlKey;
                var alt = e.altKey;

                if(ctrl && !shift) {
                    var nodeName = false;

                    switch(keyCode) {
                        case 66: /** B */
                            e.preventDefault();
                            editor.pure_execCommand('bold', false);
                            nodeName = 'B';
                            break;
                        case 85: /** U */
                            e.preventDefault();
                            editor.pure_execCommand('underline', false);
                            nodeName = 'U';
                            break;
                        case 73: /** I */
                            e.preventDefault();
                            editor.pure_execCommand('italic', false);
                            nodeName = 'I';
                            break;
                        case 89: /** Y */
                            e.preventDefault();
                            editor.pure_execCommand('redo', false);
                            break;
                        case 90: /** Z */
                            e.preventDefault();
                            editor.pure_execCommand('undo', false);
                    }

                    if(!!nodeName) {
                        dom.toggleClass(list.commandMap[nodeName], "on");
                    }

                    return;
                }

                /** ctrl + shift + S */
                if(ctrl && shift && keyCode === 83) {
                    e.preventDefault();
                    editor.pure_execCommand('strikethrough', false);
                    dom.toggleClass(list.commandMap['STRIKE'], "on");

                    return;
                }

                switch(keyCode) {
                    case 8: /**backspace key*/
                        if(target.childElementCount === 1 && target.children[0].innerHTML === "<br>") {
                            e.preventDefault();
                            return false;
                        }
                        break;
                    case 9: /**tab key*/
                        e.preventDefault();
                        if(ctrl || alt) break;

                        var currentNode = context.argument._selectionNode || wysiwygSelection.getSelection().anchorNode;
                        while(!/^TD$/i.test(currentNode.tagName) && !/^BODY$/i.test(currentNode.tagName)) {
                            currentNode = currentNode.parentNode;
                        }

                        if(!!currentNode && /^TD$/i.test(currentNode.tagName)) {
                            var table = dom.getParentNode(currentNode, "table");
                            var cells = dom.getListChildren(table, dom.isCell);
                            var idx = shift? dom.prevIdx(cells, currentNode): dom.nextIdx(cells, currentNode);

                            if(idx === cells.length && !shift) idx = 0;
                            if(idx === -1 && shift) idx = cells.length - 1;

                            var moveCell = cells[idx];
                            if(!moveCell) return false;

                            var range = wysiwygSelection.createRange();
                            range.setStart(moveCell, 0);
                            range.setEnd(moveCell, 0);

                            var selection = wysiwygSelection.getSelection();
                            if (selection.rangeCount > 0) {
                                selection.removeAllRanges();
                            }
                            selection.addRange(range);

                            break;
                        }

                        /** P 노드일때 */
                        if(shift) break;

                        var tabText = context.element.wysiwygWindow.document.createTextNode(new Array(editor.tabSize + 1).join("\u00A0"));
                        editor.insertNode(tabText);

                        var selection = wysiwygSelection.getSelection();
                        var rng = wysiwygSelection.createRange();

                        rng.setStart(tabText, editor.tabSize);
                        rng.setEnd(tabText, editor.tabSize);

                        if (selection.rangeCount > 0) {
                            selection.removeAllRanges();
                        }

                        selection.addRange(rng);

                        break;
                }
            },

            onScroll_wysiwyg : function() {
                if(!!context.argument._imageElement) {
                    // var t = (context.argument._imageElement.offsetTop + context.argument._imageResize_parent_t - (context.element.wysiwygWindow.scrollY || context.element.wysiwygWindow.pageXOffset));
                    // context.element.imageResizeDiv.style.top = t + "px";
                    // context.element.imageResizeBtn.style.top = (t + context.argument._imageElement_h) + "px";
                    context.element.imageResizeDiv.style.display = "none";
                    context.element.imageResizeBtn.style.display = "none";
                    context.argument._imageElement = null;
                }
            },

            onClick_dialog : function(e) {
                e.stopPropagation();

                if(/modal-dialog/.test(e.target.className) || /close/.test(e.target.getAttribute("data-command"))) {
                    editor.subOff();
                }
            },

            onChange_imgInput : function() {
                function inputAction(files) {
                    if (files) {
                        editor.showLoding();
                        editor.subOff();

                        var url = context.user.imageUploadUrl;
                        var filesLen = files.length;

                        if(url !== null && url.length > 0) {
                            var xmlHttp;
                            var formData = new FormData();

                            function imgUpload_collBack() {
                                if(xmlHttp.readyState == 4){
                                    if(xmlHttp.status == 200){
                                        var result = eval(xmlHttp.responseText);
                                        var resultLen = result.length;

                                        for(var i=0; i<resultLen; i++) {
                                            var oImg = document.createElement("IMG");
                                            oImg.src = result[i].SUNEDITOR_IMAGE_SRC;
                                            oImg.style.width = context.user.imageSize;
                                            editor.insertNode(oImg);
                                            editor.appendP(oImg);
                                        }
                                    } else{
                                        var WindowObject = window.open('', "_blank");
                                        WindowObject.document.writeln(xmlHttp.responseText);
                                        WindowObject.document.close();
                                        WindowObject.focus();
                                    }
                                }
                            }

                            for(var i=0; i<filesLen; i++) {
                                formData.append("file-" + i, files[i]);
                            }

                            xmlHttp = func.getXMLHttpRequest();
                            xmlHttp.onreadystatechange = imgUpload_collBack;
                            xmlHttp.open("post", url, true);
                            xmlHttp.send(formData);
                        } else {
                            function setup_reader(file) {
                                var reader = new FileReader();

                                reader.onload = function () {
                                    var oImg = document.createElement("IMG");
                                    oImg.src = reader.result;
                                    oImg.style.width = context.user.imageSize;
                                    editor.insertNode(oImg);
                                    editor.appendP(oImg);
                                };

                                reader.readAsDataURL(file);
                            }

                            for(var i=0; i<filesLen; i++) {
                                setup_reader(files[i])
                            }
                        }

                        context.dialog.imgInputFile.value = "";
                        context.dialog.imgInputUrl.value = "";
                    }
                }

                try {
                    inputAction(this.files);
                } catch(e) {
                    throw Error('[SUNEDITOR.imageUpload.fail] cause : "' + e.message +'"');
                } finally {
                    editor.closeLoding();
                }
            },

            onClick_imageResizeBtn : function(e) {
                e.stopPropagation();

                var command = e.target.getAttribute("data-command") || e.target.parentNode.getAttribute("data-command");
                if(!command) return;

                e.preventDefault();

                if(/^\d+$/.test(command)) {
                    context.argument._imageElement.style.height = "";
                    context.argument._imageElement.style.width = command + "%";
                }
                else if(/remove/.test(command)){
                    dom.removeItem(context.argument._imageElement);
                }

                editor.subOff();
                wysiwygSelection.focus();
            },

            onClick_linkBtn : function(e) {
                e.stopPropagation();

                var command = e.target.getAttribute("data-command") || e.target.parentNode.getAttribute("data-command");
                if(!command) return;

                e.preventDefault();

                if(/update/.test(command)) {
                    context.dialog.linkText.value = context.argument._linkAnchor.href;
                    context.dialog.linkAnchorText.value = context.argument._linkAnchor.textContent;
                    context.dialog.linkNewWindowCheck.checked = (/_blank/i.test(context.argument._linkAnchor.target)? true: false);
                    editor.openDialog('link');
                }
                else { /** delete */
                dom.removeItem(context.argument._linkAnchor);
                    context.argument._linkAnchor = null;
                    wysiwygSelection.focus();
                }

                context.element.linkBtn.style.display = "none";
            },

            onMouseDown_image_ctrl : function(e) {
                e.stopPropagation();
                e.preventDefault();

                context.argument._imageClientX = e.clientX;
                context.element.resizeBackground.style.display = "block";
                context.element.imageResizeBtn.style.display = "none";

                function closureFunc() {
                    editor.cancel_resize_image();
                    document.removeEventListener('mousemove', editor.resize_image);
                    document.removeEventListener('mouseup', closureFunc);
                };

                document.addEventListener('mousemove', editor.resize_image);
                document.addEventListener('mouseup', closureFunc);
            },

            onMouseMove_tablePicker : function(e) {
                e.stopPropagation();

                var x = Math.ceil(e.offsetX/18);
                var y = Math.ceil(e.offsetY/18);
                x = x<1? 1: x;
                y = y<1? 1: y;
                context.tool.tableHighlight.style.width = x + "em";
                context.tool.tableHighlight.style.height = y + "em";

                var x_u = x<5? 5: (x>9? 10: x+1);
                var y_u = y<5? 5: (y>9? 10: y+1);
                context.tool.tableUnHighlight.style.width = x_u + "em";
                context.tool.tableUnHighlight.style.height = y_u + "em";

                dom.changeTxt(context.tool.tableDisplay, x + " x " + y);
                context.argument._tableXY = [x, y];
            },

            onMouseDown_resizeBar : function(e) {
                e.stopPropagation();

                context.argument._resizeClientY = e.clientY;
                context.element.resizeBackground.style.display = "block";

                function closureFunc() {
                    context.element.resizeBackground.style.display = "none";
                    document.removeEventListener('mousemove', editor.resize_editor);
                    document.removeEventListener('mouseup', closureFunc);
                };

                document.addEventListener('mousemove', editor.resize_editor);
                document.addEventListener('mouseup', closureFunc);
            },

            submit_dialog : function(e) {
                var className = this.classList[this.classList.length - 1];

                editor.showLoding();

                e.preventDefault();
                e.stopPropagation();

                function submitAction(className) {
                    switch(className) {
                        case 'sun-editor-id-submit-link':
                            if(context.dialog.linkText.value.trim().length === 0) break;

                            var url = /^https?:\/\//.test(context.dialog.linkText.value)? context.dialog.linkText.value: "http://" +  context.dialog.linkText.value;
                            var anchor = context.dialog.linkAnchorText || context.dialog.document.getElementById("linkAnchorText");
                            var anchorText = anchor.value.length === 0? url: anchor.value;

                            if(context.argument._linkAnchor === null) {
                                var oA = document.createElement("A");
                                oA.href = url;
                                oA.textContent = anchorText;
                                oA.target = (context.dialog.linkNewWindowCheck.checked? "_blank": "");

                                editor.insertNode(oA);
                            } else {
                                context.argument._linkAnchor.href = url;
                                context.argument._linkAnchor.textContent = anchorText;
                                context.argument._linkAnchor.target = (context.dialog.linkNewWindowCheck.checked? "_blank": "");
                            }

                            context.dialog.linkText.value = "";
                            context.dialog.linkAnchorText.value = "";

                            break;
                        case 'sun-editor-id-submit-image':
                            if(context.dialog.imgInputUrl.value.trim().length === 0) break;

                            var oImg = document.createElement("IMG");
                            oImg.src = context.dialog.imgInputUrl.value;
                            oImg.style.width = "350px";

                            editor.insertNode(oImg);
                            editor.appendP(oImg);

                            context.dialog.imgInputFile.value = "";
                            context.dialog.imgInputUrl.value = "";

                            break;
                        case'sun-editor-id-submit-video':
                            if(context.dialog.videoInputUrl.value.trim().length === 0) break;

                            var url = context.dialog.videoInputUrl.value.replace(/^https?:/, '');
                            var oIframe = document.createElement("IFRAME");
                            var x_v = context.dialog.video_x.value;
                            var y_v = context.dialog.video_y.value;

                            /** youtube */
                            if(/youtu\.?be/.test(url)) {
                                url = url.replace('watch?v=', '');
                                if(!/^\/\/.+\/embed\//.test(url)) {
                                    var youtubeUrl = url.match(/^\/\/.+\//)[0]
                                    url = url.replace(youtubeUrl, '//www.youtube.com/embed/');
                                }
                            }

                            oIframe.src = url;
                            oIframe.width = (/^\d+$/.test(x_v)? x_v: context.user.videoX);
                            oIframe.height = (/^\d+$/.test(y_v)? y_v: context.user.videoY);
                            oIframe.frameBorder = "0";
                            oIframe.allowFullscreen = true;

                            editor.insertNode(oIframe);
                            editor.appendP(oIframe);

                            context.dialog.videoInputUrl.value = "";
                            context.dialog.video_x.value = context.user.videoX;
                            context.dialog.video_y.value = context.user.videoY;

                            break;
                    }
                }

                try {
                    submitAction(className);
                } finally {
                    editor.subOff();
                    editor.closeLoding();
                }

                return false;
            }

        };

        /** 유저 사용 함수 {{save, getContent, setContent, appendContent, disabled, enabled, show, hide}} */
        var user = {
            save : function() {
                if(context.argument._wysiwygActive) {
                    context.element.textElement.innerHTML = context.element.wysiwygWindow.document.body.innerHTML;
                } else {
                    context.element.textElement.innerHTML = context.element.source.value;
                }
            },

            getContent : function() {
                var content = "";
                if(context.argument._wysiwygActive) {
                    content = context.element.wysiwygWindow.document.body.innerHTML;
                } else {
                    content = context.element.source.value;
                }
                return content;
            },

            setContent : function(content) {
                if(context.argument._wysiwygActive) {
                    context.element.wysiwygWindow.document.body.innerHTML = content;
                } else {
                    context.element.source.value = content;
                }
            },

            appendContent : function(content) {
                if(context.argument._wysiwygActive) {
                    var oP = document.createElement("P");
                    oP.innerHTML = content;
                    context.element.wysiwygWindow.document.body.appendChild(oP);
                } else {
                    context.element.source.value += content;
                }
            },

            disabled : function() {
                context.tool.cover.style.display = "block";
                context.element.wysiwygWindow.document.body.setAttribute("contenteditable", false);
            },

            enabled : function() {
                context.tool.cover.style.display = "none";
                context.element.wysiwygWindow.document.body.setAttribute("contenteditable", true);
            },

            show : function() {
                context.element.topArea.style.cssText = context.argument._originCssText;
            },

            hide : function() {
                context.element.topArea.style.display = "none";
            }
        };

        /** 이벤트 등록 */
        window.onresize = function(){event.resize_window()};

        context.tool.bar.addEventListener('click', event.onClick_toolbar);
        context.tool.bar.addEventListener('touchstart', event.touchstart_toolbar);
        context.tool.bar.addEventListener('touchmove', event.touchmove_toolbar);
        context.tool.bar.addEventListener('touchend', event.onClick_toolbar);

        context.dialog.modal.addEventListener('click', event.onClick_dialog);
        context.element.imageResizeBtn.addEventListener('click', event.onClick_imageResizeBtn);
        context.element.wysiwygWindow.addEventListener('keydown', event.onKeyDown_wysiwyg);
        context.dialog.imgInputFile.addEventListener('change', event.onChange_imgInput);
        context.element.wysiwygWindow.addEventListener('scroll', event.onScroll_wysiwyg);
        context.tool.tablePicker.addEventListener('mousemove', event.onMouseMove_tablePicker);
        context.element.resizebar.addEventListener('mousedown', event.onMouseDown_resizeBar);
        context.element.imageResizeController.addEventListener('mousedown', event.onMouseDown_image_ctrl);
        context.element.wysiwygWindow.addEventListener('mousedown', event.onMouseDown_wysiwyg);
        context.element.wysiwygWindow.document.addEventListener('selectionchange', event.onSelectionChange_wysiwyg);
        context.element.linkBtn.addEventListener('click', event.onClick_linkBtn);

        var dialogLen = context.dialog.forms.length;
        for(var i=0; i<dialogLen; i++) {
            context.dialog.forms[i].getElementsByClassName("btn-primary")[0].addEventListener('click', event.submit_dialog);
        };

        return {
            save : user.save,
            getContent : user.getContent,
            setContent : user.setContent,
            appendContent : user.appendContent,
            disabled : user.disabled,
            enabled : user.enabled,
            show : user.show,
            hide : user.hide
        };
    };

    /**
     * create Dom
     * @param options
     * @returns {{toolBar: toolBar, dialogBox: dialogBox, imgDiv: imgDIv, imgBtn: imgBtn, linkBtn: linkBtn}}
     */
    var createEditor = function (options){
        var lang = SUNEDITOR.lang? SUNEDITOR.lang: SUNEDITOR.defaultLang;

        var toolBar = function() {
            var html = '<div class="sun-editor-id-toolbar-cover"></div>'+
                /** 글꼴, 포멧 */
                '<div class="tool_module">'+
                '    <ul class="editor_tool">';
            if(options.showFont) {
                html += ''+
                    '        <li>'+
                    '            <button type="button" class="btn_editor btn_font" title="'+lang.toolbar.fontFamily+'" data-display="sub">'+
                    '                <span class="txt sun-editor-font-family">'+lang.toolbar.fontFamily+'</span><span class="img_editor ico_more"></span>'+
                    '            </button>'+
                    '            <div class="layer_editor" style="display: none;">'+
                    '                <div class="inner_layer list_family">'+
                    '                    <ul class="list_editor sun-editor-list-font-family">'+
                    '                        <li><button type="button" class="btn_edit default" data-command="fontName" data-value="inherit" data-txt="'+lang.toolbar.fontFamily+'" style="font-family:inherit;">'+lang.toolbar.fontFamilyDelete+'</button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontName" data-value="Arial" data-txt="Arial" style="font-family:Arial;">Arial</button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontName" data-value="Comic Sans MS" data-txt="Comic Sans MS" style="font-family:Comic Sans MS;">Comic Sans MS</button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontName" data-value="Courier New,Courier" data-txt="Courier New" style="font-family:Courier New,Courier;">Courier New</button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontName" data-value="Georgia" data-txt="Georgia" style="font-family:Georgia;">Georgia</button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontName" data-value="tahoma" data-txt="tahoma" style="font-family:tahoma;">Tahoma</button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontName" data-value="Trebuchet MS,Helvetica" data-txt="Trebuchet MS" style="font-family:Trebuchet MS,Helvetica;">Trebuchet MS</button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontName" data-value="Verdana" data-txt="Verdana" style="font-family:Verdana;">Verdana</button></li>'+
                    '                    </ul>';
                /** 사용자 추가 글꼴 */
                if(options.addFont) {
                    html += '        <ul class="list_editor list_family_add sun-editor-list-font-family-add">';
                    var addFontLen = options.addFont.length;
                    for (var i = 0; i < addFontLen; i++) {
                        var font = options.addFont[i];
                        html += '        <li><button type="button" class="btn_edit" data-command="fontName" data-value="'+font.value+'" data-txt="'+font.text+'" style="font-family:'+font.value+'">'+font.text+'</button></li>';
                    }
                    html += '        </ul>';
                }

                html += '        </div>'+
                    '            </div>'+
                    '        </li>';
            }
            if(options.showFormats) {
                html += ''+
                    '        <li>'+
                    '            <button type="button" class="btn_editor btn_size" title="'+lang.toolbar.formats+'" data-display="sub">'+
                    '                <span class="txt">'+lang.toolbar.formats+'</span><span class="img_editor ico_more"></span>'+
                    '            </button>'+
                    '            <div class="layer_editor layer_size">'+
                    '                <div class="inner_layer">'+
                    '                    <ul class="list_editor format_list">'+
                    '                        <li><button type="button" class="btn_edit" style="height:30px;" data-command="formatBlock" data-value="P"><p style="font-size:13pt;">nomal</p></button></li>'+
                    '                        <li><button type="button" class="btn_edit" style="height:45px;" data-command="formatBlock" data-value="h1"><h1>Header 1</h1></button></li>'+
                    '                        <li><button type="button" class="btn_edit" style="height:34px;" data-command="formatBlock" data-value="h2"><h2>Header 2</h2></button></li>'+
                    '                        <li><button type="button" class="btn_edit" style="height:26px;" data-command="formatBlock" data-value="h3"><h3>Header 3</h3></button></li>'+
                    '                        <li><button type="button" class="btn_edit" style="height:23px;" data-command="formatBlock" data-value="h4"><h4>Header 4</h4></button></li>'+
                    '                        <li><button type="button" class="btn_edit" style="height:19px;" data-command="formatBlock" data-value="h5"><h5>Header 5</h5></button></li>'+
                    '                        <li><button type="button" class="btn_edit" style="height:15px;" data-command="formatBlock" data-value="h6"><h6>Header 6</h6></button></li>'+
                    '                    </ul>'+
                    '                </div>'+
                    '            </div>'+
                    '        </li>' ;
            }
            if(options.showFontSize) {
                html += ''+
                    '        <li>'+
                    '            <button type="button" class="btn_editor btn_size" title="'+lang.toolbar.fontSize+'" data-display="sub">'+
                    '                <span class="txt sun-editor-font-size">'+lang.toolbar.fontSize+'</span><span class="img_editor ico_more"></span>'+
                    '            </button>'+
                    '            <div class="layer_editor layer_size">'+
                    '                <div class="inner_layer">'+
                    '                    <ul class="list_editor font_size_list">'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontSize" data-value="8"><span style="font-size:8pt;">8</span></button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontSize" data-value="9"><span style="font-size:9pt;">9</span></button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontSize" data-value="10"><span style="font-size:10pt;">10</span></button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontSize" data-value="11"><span style="font-size:11pt;">11</span></button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontSize" data-value="12"><span style="font-size:12pt;">12</span></button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontSize" data-value="14"><span style="font-size:14pt;">14</span></button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontSize" data-value="16"><span style="font-size:16pt;">16</span></button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontSize" data-value="18"><span style="font-size:18pt;">18</span></button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontSize" data-value="20"><span style="font-size:20pt;">20</span></button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontSize" data-value="22"><span style="font-size:22pt;">22</span></button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontSize" data-value="24"><span style="font-size:24pt;">24</span></button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontSize" data-value="26"><span style="font-size:26pt;">26</span></button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontSize" data-value="28"><span style="font-size:28pt;">28</span></button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontSize" data-value="36"><span style="font-size:36pt;">36</span></button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontSize" data-value="48"><span style="font-size:48pt;">48</span></button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="fontSize" data-value="72"><span style="font-size:72pt;">72</span></button></li>'+
                    '                    </ul>'+
                    '                </div>'+
                    '            </div>'+
                    '        </li>' ;
            }
            html += '</ul>'+
                '</div>'+
                /** 굵게, 밑줄 등 */
                '<div class="tool_module">'+
                '   <ul class="editor_tool">';
            if(options.showBold) {
                html += ''+
                    '       <li>'+
                    '           <button type="button" class="btn_editor sun-editor-id-bold" title="'+lang.toolbar.bold+' (Ctrl+B)" data-command="bold"><div class="ico_bold"></div></button>'+
                    '       </li>';
            }
            if(options.showUnderline) {
                html += ''+
                    '       <li>'+
                    '           <button type="button" class="btn_editor sun-editor-id-underline" title="'+lang.toolbar.underline+' (Ctrl+U)" data-command="underline"><div class="ico_underline"></div></button>'+
                    '       </li>';
            }
            if(options.showItalic) {
                html += ''+
                    '       <li>'+
                    '           <button type="button" class="btn_editor sun-editor-id-italic" title="'+lang.toolbar.italic+' (Ctrl+I)" data-command="italic"><div class="ico_italic"></div></button>'+
                    '       </li>';
            }
            if(options.showStrike) {
                html += ''+
                    '       <li>'+
                    '           <button type="button" class="btn_editor sun-editor-id-strike" title="'+lang.toolbar.strike+' (Ctrl+SHIFT+S)" data-command="strikethrough"><div class="ico_strike"></div></button>'+
                    '       </li>';
            }
            html +='</ul>'+
                '</div>'+
                /** 색상 선택 */
                '<div class="tool_module">'+
                '    <ul class="editor_tool">';
            if(options.showFontColor) {
                html += ''+
                    '        <li>'+
                    '            <div class="box_color" data-display="sub">'+
                    '                <strong class="screen_out">'+lang.toolbar.fontColor+'</strong>'+
                    '                <button type="button" class="btn_editor" title="'+lang.toolbar.fontColor+'">'+
                    '                    <div class="ico_fcolor">'+
                    '                        <em class="color_font" style="background-color:#1f92fe"></em>'+
                    '                    </div>'+
                    '                </button>'+
                    '            </div>'+
                    '            <div class="layer_editor layer_color" data-command="foreColor">'+
                    '                <div class="inner_layer">'+
                    '                    <div class="pallet_bgcolor">'+
                    '                        <ul class="list_color list_bgcolor">'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#ff0000;">#ff0000<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#ff5e00;">#ff5e00<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#ffe400;">#ffe400<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#abf200;">#abf200<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#00d8ff;">#00d8ff<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#0055ff;">#0055ff<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#6600ff;">#6600ff<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#ff00dd;">#ff00dd<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#000000;">#000000<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#ffd8d8;">#ffd8d8<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#fae0d4;">#fae0d4<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#faf4c0;">#faf4c0<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#e4f7ba;">#e4f7ba<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#d4f4fa;">#d4f4fa<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#d9e5ff;">#d9e5ff<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#e8d9ff;">#e8d9ff<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#ffd9fa;">#ffd9fa<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#ffffff;">#ffffff<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#ffa7a7;">#ffa7a7<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#ffc19e;">#ffc19e<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#faed7d;">#faed7d<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#cef279;">#cef279<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#b2ebf4;">#b2ebf4<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#b2ccff;">#b2ccff<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#d1b2ff;">#d1b2ff<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#ffb2f5;">#ffb2f5<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#bdbdbd;">#bdbdbd<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#f15f5f;">#f15f5f<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#f29661;">#f29661<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#e5d85c;">#e5d85c<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#bce55c;">#bce55c<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#5cd1e5;">#5cd1e5<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#6699ff;">#6699ff<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#a366ff;">#a366ff<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#f261df;">#f261df<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#8c8c8c;">#8c8c8c<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#980000;">#980000<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#993800;">#993800<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#998a00;">#998a00<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#6b9900;">#6b9900<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#008299;">#008299<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#003399;">#003399<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#3d0099;">#3d0099<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#990085;">#990085<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#353535;">#353535<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#670000;">#670000<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#662500;">#662500<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#665c00;">#665c00<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#476600;">#476600<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#005766;">#005766<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#002266;">#002266<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#290066;">#290066<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="background-color:#660058;">#660058<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li class="compact_color"><button type="button" class="btn_color" style="background-color:#222222;">#222222<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                        </ul>'+
                    '                    </div>'+
                    '                </div>'+
                    '            </div>'+
                    '        </li>';
            }
            if(options.showHiliteColor) {
                html += ''+
                    '        <li>'+
                    '            <strong class="screen_out">'+lang.toolbar.hiliteColor+'</strong>'+
                    '            <button type="button" class="btn_editor btn_fbgcolor" title="'+lang.toolbar.hiliteColor+'" data-display="sub">'+
                    '                <div class="img_editor ico_fcolor_w">'+
                    '                    <em class="color_font" style="background-color:#1f92fe"></em>'+
                    '                </div>'+
                    '            </button>'+
                    '            <div class="layer_editor layer_color" data-command="hiliteColor">'+
                    '                <div class="inner_layer">'+
                    '                    <div class="pallet_bgcolor pallet_text">'+
                    '                        <ul class="list_color list_bgcolor">'+
                    '                            <li><button type="button" class="btn_color" style="color:#fff;background-color:#1e9af9;">#1e9af9<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="color:#fff;background-color:#00b8c6;">#00b8c6<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="color:#fff;background-color:#6cce02;">#6cce02<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="color:#fff;background-color:#ff9702;">#ff9702<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="color:#fff;background-color:#ff0000;">#ff0000<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="color:#fff;background-color:#ff00dd;">#ff00dd<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="color:#fff;background-color:#6600ff;">#6600ff<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="color:#000;background-color:#cce9ff;">#cce9ff<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="color:#000;background-color:#fcfd4c;">#fcfd4c<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color color_white" style="color:#000;background-color:#ffffff;">#ffffff<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="color:#000;background-color:#dfdede;">#dfdede<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="color:#fff;background-color:#8c8c8c;">#8c8c8c<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li><button type="button" class="btn_color" style="color:#fff;background-color:#000000;">#000000<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                            <li class="compact_color"><button type="button" class="btn_color" style="background-color:#222222;">#222222<span class="bg_check"></span><span class="bg_btnframe"></span></button></li>'+
                    '                        </ul>'+
                    '                    </div>'+
                    '                </div>'+
                    '            </div>'+
                    '        </li>';
            }
            html +='</ul>'+
                '</div>';
            /** 들여쓰기, 내어쓰기 */
            if(options.showInOutDent) {
                html += ''+
                    '<div class="tool_module">'+
                    '    <ul class="editor_tool">'+
                    '        <li>'+
                    '            <button type="button" class="btn_editor" title="'+lang.toolbar.indent+'" data-command="indent">'+
                    '                <div class="img_editor ico_indnet"></div>'+
                    '            </button>'+
                    '        </li>'+
                    '        <li>'+
                    '            <button type="button" class="btn_editor" title="'+lang.toolbar.outdent+'" data-command="outdent">'+
                    '                <div class="img_editor ico_outdent"></div>'+
                    '            </button>'+
                    '        </li>'+
                    '    </ul>'+
                    '</div>';
            }
            /** 정렬, 구분선 상자 */
            html += '<div class="tool_module">'+
                '    <ul class="editor_tool">';
            if(options.showAlign) {
                html += ''+
                    '        <li>'+
                    '            <strong class="screen_out">'+lang.toolbar.align+'</strong>'+
                    '            <button type="button" class="btn_editor btn_align" title="'+lang.toolbar.align+'" data-display="sub">'+
                    '                <span class="img_editor ico_align_l">'+lang.toolbar.alignLeft+'</span>'+
                    '            </button>'+
                    '            <div class="layer_editor layer_align">'+
                    '                <div class="inner_layer inner_layer_type2">'+
                    '                    <ul class="list_editor">'+
                    '                        <li><button type="button" class="btn_edit btn_align" data-command="justifyleft" title="'+lang.toolbar.alignLeft+'"><span class="img_editor ico_align_l"></span>'+lang.toolbar.left+'</button></li>'+
                    '                        <li><button type="button" class="btn_edit btn_align" data-command="justifycenter" title="'+lang.toolbar.alignCenter+'"><span class="img_editor ico_align_c"></span>'+lang.toolbar.center+'</button></li>'+
                    '                        <li><button type="button" class="btn_edit btn_align" data-command="justifyright" title="'+lang.toolbar.alignRight+'"><span class="img_editor ico_align_r"></span>'+lang.toolbar.right+'</button></li>'+
                    '                        <li><button type="button" class="btn_edit btn_align" data-command="justifyfull" title="'+lang.toolbar.justifyFull+'"><span class="img_editor ico_align_f"></span>'+lang.toolbar.bothSide+'</button></li>'+
                    '                    </ul>'+
                    '                </div>'+
                    '            </div>'+
                    '        </li>';
            }
            if(options.showList) {
                html += ''+
                    '        <li>'+
                    '            <button type="button" class="btn_editor" title="'+lang.toolbar.list+'" data-display="sub">'+
                    '                <div class="img_editor ico_list ico_list_num"></div>'+
                    '            </button>'+
                    '            <div class="layer_editor layer_list">'+
                    '                <div class="inner_layer inner_layer_type2">'+
                    '                    <ul class="list_editor">'+
                    '                        <li><button type="button" class="btn_edit" data-command="insertOrderedList" data-value="DECIMAL" title="'+lang.toolbar.orderList+'"><span class="img_editor ico_list ico_list_num"></span></button></li>'+
                    '                        <li><button type="button" class="btn_edit" data-command="insertUnorderedList" data-value="DISC" title="'+lang.toolbar.unorderList+'"><span class="img_editor ico_list ico_list_square"></span></button></li>'+
                    '                    </ul>'+
                    '                </div>'+
                    '            </div>'+
                    '        </li>';
            }
            if(options.showLine) {
                html += ''+
                    '        <li>'+
                    '            <strong class="screen_out">'+lang.toolbar.line+'</strong>'+
                    '            <button type="button" class="btn_editor btn_line" title="'+lang.toolbar.line+'" data-display="sub">'+
                    '                <hr style="border-width: 1px 0px 0px; border-style: solid none none; border-color: black; border-image: initial; height: 1px;">'+
                    '                <hr style="border-width: 1px 0px 0px; border-style: dotted none none; border-color: black; border-image: initial; height: 1px;">'+
                    '                <hr style="border-width: 1px 0px 0px; border-style: dashed none none; border-color: black; border-image: initial; height: 1px;">'+
                    '            </button>'+
                    '            <div class="layer_editor layer_line">'+
                    '                <div class="inner_layer inner_layer_type2">'+
                    '                    <ul class="list_editor">'+
                    '                        <li><button type="button" class="btn_edit btn_line" data-command="horizontalRules" data-value="hr1">'+
                    '                                <hr style="border-width: 1px 0px 0px; border-style: solid none none; border-color: black; border-image: initial; height: 1px;">'+
                    '                            </button>'+
                    '                        </li>'+
                    '                        <li>'+
                    '                            <button type="button" class="btn_edit btn_line" data-command="horizontalRules" data-value="hr2">'+
                    '                                <hr style="border-width: 1px 0px 0px; border-style: dotted none none; border-color: black; border-image: initial; height: 1px;">'+
                    '                            </button>'+
                    '                        </li>'+
                    '                        <li>'+
                    '                            <button type="button" class="btn_edit btn_line" data-command="horizontalRules" data-value="hr3">'+
                    '                                <hr style="border-width: 1px 0px 0px; border-style: dashed none none; border-color: black; border-image: initial; height: 1px;">'+
                    '                            </button>'+
                    '                        </li>'+
                    '                    </ul>'+
                    '                </div>'+
                    '            </div>'+
                    '        </li>';
            }
            html +='</ul>'+
                '</div>'+
                /** 테이블, 링크, 사진 */
                '<div class="tool_module">'+
                '    <ul class="editor_tool">';
            if(options.showTable) {
                html += ''+
                    '        <li>'+
                    '            <button class="btn_editor" title="'+lang.toolbar.table+'" data-display="sub" data-command="table">'+
                    '                <div class="img_editor ico_table"></div>'+
                    '            </button>'+
                    '            <div class="table-content" style="display: none;">'+
                    '                <div class="table-data-form">'+
                    '                    <div class="table-picker sun-editor-id-table-picker" data-command="insertTable" data-value="1x1"></div>'+
                    '                    <div class="table-highlighted sun-editor-id-table-highlighted"></div>'+
                    '                    <div class="table-unhighlighted sun-editor-id-table-unhighlighted"></div>'+
                    '                </div>'+
                    '                <div class="table-display sun-editor-table-display">1 x 1</div>'+
                    '            </div>'+
                    '        </li>';
            }
            if(options.showLink) {
                html += ''+
                    '        <li>'+
                    '            <button class="btn_editor" title="'+lang.toolbar.link+'" data-display="modal" data-command="link">'+
                    '                <div class="img_editor ico_url"></div>'+
                    '            </button>'+
                    '        </li>';
            }
            if(options.showImage) {
                html += ''+
                    '        <li>'+
                    '            <button class="btn_editor" title="'+lang.toolbar.image+'" data-display="modal" data-command="image">'+
                    '                <div class="img_editor ico_picture"></div>'+
                    '            </button>'+
                    '        </li>';
            }
            html += '</ul>'+
                '</div>'+
                /** 동영상, 전체화면, 소스편집 */
                '<div class="tool_module">'+
                '    <ul class="editor_tool">';
            if(options.showVideo) {
                html += ''+
                    '        <li>'+
                    '            <button class="btn_editor" title="'+lang.toolbar.video+'" data-display="modal" data-command="video">'+
                    '                <div class="img_editor ico_video"></div>'+
                    '            </button>'+
                    '        </li>';
            }
            if(options.showFullScreen) {
                html += ''+
                    '        <li>'+
                    '            <button class="btn_editor" title="'+lang.toolbar.fullScreen+'" data-command="fullScreen">'+
                    '                <div class="img_editor ico_full_screen_e"></div>'+
                    '            </button>'+
                    '        </li>';
            }
            if(options.showCodeView) {
                html += ''+
                    '        <li>'+
                    '            <button class="btn_editor" title="'+lang.toolbar.htmlEditor+'" data-command="sorceFrame">'+
                    '                <div class="img_editor ico_html"></div>'+
                    '            </button>'+
                    '        </li>';
            }
            html += '</ul>'+
                '</div>'+
                /** 실행취소 관련 */
                '<div class="tool_module">'+
                '    <ul class="editor_tool">';
            if(options.showUndo) {
                html += ''+
                    '        <li>'+
                    '            <button class="btn_editor" title="'+lang.toolbar.undo+' (Ctrl+Z)" data-command="undo">'+
                    '                <div class="img_editor ico_undo"></div>'+
                    '            </button>'+
                    '        </li>';
            }
            if(options.showRedo) {
                html += ''+
                    '        <li>'+
                    '            <button class="btn_editor" title="'+lang.toolbar.redo+' (Ctrl+Y)" data-command="redo">'+
                    '                <div class="img_editor ico_redo"></div>'+
                    '            </button>'+
                    '        </li>';
            }
            html += '</ul>'+
                '</div>';

            return html;
        };

        var dialogBox = function() {
            var html = ''+
                /** 다이얼로그 백그라운드 */
                '<div class="modal-dialog-background sun-editor-id-dialog-back" style="display: none;"></div>'+
                /** 다이얼로그 */
                '<div class="modal-dialog sun-editor-id-dialog-modal" style="display: none;">';
            /** 링크 삽입 다이얼로그 */
            html += ''+
                '    <div class="modal-content sun-editor-id-dialog-link" style="display: none;">'+
                '        <form class="editor_link">'+
                '            <div class="modal-header">'+
                '                <button type="button" data-command="close" class="close" aria-label="Close">'+
                '                    <span aria-hidden="true" data-command="close">×</span>'+
                '                </button>'+
                '                <h5 class="modal-title">'+lang.dialogBox.linkBox.title+'</h5>'+
                '            </div>'+
                '            <div class="modal-body">'+
                '                <div class="form-group">'+
                '                    <label>'+lang.dialogBox.linkBox.url+'</label>'+
                '                    <input class="form-control sun-editor-id-linkurl" type="text">'+
                '                </div>'+
                '                <div class="form-group">'+
                '                    <label>'+lang.dialogBox.linkBox.text+'</label><input class="form-control sun-editor-id-linktext" type="text">'+
                '                </div>'+
                '                <label class="label-check"><input type="checkbox" class="sun-editor-id-linkCheck">&nbsp;' + lang.dialogBox.linkBox.newWindowCheck + '</label>'+
                '            </div>'+
                '            <div class="modal-footer">'+
                '                <button type="submit" class="btn btn-primary sun-editor-id-submit-link"><span>'+lang.dialogBox.submitButton+'</span></button>'+
                '            </div>'+
                '        </form>'+
                '    </div>';
            /** 이미지 삽입 다이얼로그 */
            html += ''+
                '    <div class="modal-content sun-editor-id-dialog-image" style="display: none;">'+
                '        <form class="editor_image" method="post" enctype="multipart/form-data">'+
                '            <div class="modal-header">'+
                '                <button type="button" data-command="close" class="close" aria-label="Close">'+
                '                    <span aria-hidden="true" data-command="close">×</span>'+
                '                </button>'+
                '                <h5 class="modal-title">'+lang.dialogBox.imageBox.title+'</h5>'+
                '            </div>'+
                '            <div class="modal-body">'+
                '                <div class="form-group">'+
                '                    <label>'+lang.dialogBox.imageBox.file+'</label>'+
                '                    <input class="form-control sun-editor-id-image-file" type="file" accept="image/*" multiple="multiple">'+
                '                </div>'+
                '                <div class="form-group">'+
                '                    <label>'+lang.dialogBox.imageBox.url+'</label><input class="form-control sun-editor-id-image-url" type="text">'+
                '                </div>'+
                '            </div>'+
                '            <div class="modal-footer">'+
                '                <button type="submit" class="btn btn-primary sun-editor-id-submit-image"><span>'+lang.dialogBox.submitButton+'</span></button>'+
                '            </div>'+
                '        </form>'+
                '    </div>';
            /** 동영상 삽입 다이얼로그 */
            html += ''+
                '    <div class="modal-content sun-editor-id-dialog-video" style="display: none;">'+
                '        <form class="editor_video">'+
                '            <div class="modal-header">'+
                '                <button type="button" data-command="close" class="close" aria-label="Close">'+
                '                    <span aria-hidden="true" data-command="close">×</span>'+
                '                </button>'+
                '                <h5 class="modal-title">'+lang.dialogBox.videoBox.title+'</h5>'+
                '            </div>'+
                '            <div class="modal-body">'+
                '                <div class="form-group">'+
                '                    <label>'+lang.dialogBox.videoBox.url+'</label>'+
                '                    <input class="form-control sun-editor-id-video-url" type="text">'+
                '                </div>'+
                '                <div class="form-group form-size">'+
                '                    <div class="size-text"><label class="size-w">'+lang.dialogBox.videoBox.width+'</label><label class="size-x"> </label><label class="size-h">'+lang.dialogBox.videoBox.height+'</label></div>'+
                '                    <input type="text" class="form-size-control sun-editor-id-video-x"><label class="size-x">x</label><input type="text" class="form-size-control sun-editor-id-video-y">'+
                '                </div>'+
                '            </div>'+
                '            <div class="modal-footer">'+
                '                <button type="submit" class="btn btn-primary sun-editor-id-submit-video"><span>'+lang.dialogBox.submitButton+'</span></button>'+
                '            </div>'+
                '        </form>'+
                '    </div>';
            html +='</div>';

            return html;
        };

        var imgDIv = function() {
            return ''+
                '<div class="image-resize-dot tl"></div>'+
                '<div class="image-resize-dot tr"></div>'+
                '<div class="image-resize-dot bl"></div>'+
                '<div class="image-resize-dot br-controller sun-editor-img-controller"></div>'+
                '<div class="image-size-display sun-editor-id-img-display"></div>';
        };

        var imgBtn = function() {
            return ''+
                '<div class="btn-group">'+
                '   <button type="button" data-command="100" title="'+lang.dialogBox.imageBox.resize100+'"><span class="note-fontsize-10">100%</span></button>'+
                '   <button type="button" data-command="75" title="'+lang.dialogBox.imageBox.resize75+'"><span class="note-fontsize-10">75%</span></button>'+
                '   <button type="button" data-command="50" title="'+lang.dialogBox.imageBox.resize50+'"><span class="note-fontsize-10">50%</span></button>'+
                '   <button type="button" data-command="25" title="'+lang.dialogBox.imageBox.resize25+'"><span class="note-fontsize-10">25%</span></button>'+
                '</div>'+
                '<div class="btn-group remove">'+
                '   <button type="button" data-command="remove" title="'+lang.dialogBox.imageBox.remove+'"><span class="image_remove">X</span></button>'+
                '</div>';
        };

        var linkBtn = function() {
            return ''+
                '<div class="arrow"></div>'+
                '<div class="link-content"><span><a target="_blank" href=""></a>&nbsp;</span>'+
                '   <div class="btn-group">'+
                '     <button type="button" data-command="update" tabindex="-1" title="'+lang.editLink.edit+'"><div class="img_editor ico_url"></div></button>'+
                '     <button type="button" data-command="delete" tabindex="-1" title="'+lang.editLink.remove+'">X</button>'+
                '   </div>'+
                '</div>';
        };

        return {
            toolBar : toolBar,
            dialogBox : dialogBox,
            imgDiv : imgDIv,
            imgBtn : imgBtn,
            linkBtn : linkBtn
        };
    };

    /**
     * document create
     * @param element
     * @param options
     * @returns {{constructed: Element, options: *}}
     * @constructor
     */
    var Constructor = function(element, options) {
        if(!(typeof options === "object")) options = {};

        /** 사용자 옵션 초기화 */
        options.addFont = options.addFont || null;
        options.videoX = options.videoX || 560;
        options.videoY = options.videoY || 315;
        options.imageSize = options.imageSize || '350px';
        options.height = /^\d+/.test(options.height)?  (/^\d+$/.test(options.height)? options.height+"px": options.height): element.clientHeight+"px";
        options.width = /^\d+/.test(options.width)?  (/^\d+$/.test(options.width)? options.width+"px": options.width): (/%|auto/.test(element.style.width)? element.style.width: element.clientWidth+"px");
        options.display = options.display || 'block';
        options.imageUploadUrl = options.imageUploadUrl || null;
        /** 툴바 버튼 보이기 설정 */
        options.showFont = options.showFont !== undefined? options.showFont: true;
        options.showFormats = options.showFormats !== undefined? options.showFormats: true;
        options.showFontSize = options.showFontSize !== undefined? options.showFontSize: true;
        options.showBold = options.showBold !== undefined? options.showBold: true;
        options.showUnderline = options.showUnderline !== undefined? options.showUnderline: true;
        options.showItalic = options.showItalic !== undefined? options.showItalic: true;
        options.showStrike = options.showStrike !== undefined? options.showStrike: true;
        options.showFontColor = options.showFontColor !== undefined? options.showFontColor: true;
        options.showHiliteColor = options.showHiliteColor !== undefined? options.showHiliteColor: true;
        options.showInOutDent = options.showInOutDent !== undefined? options.showInOutDent: true;
        options.showAlign = options.showAlign !== undefined? options.showAlign: true;
        options.showList = options.showList !== undefined? options.showList: true;
        options.showLine = options.showLine !== undefined? options.showLine: true;
        options.showTable = options.showTable !== undefined? options.showTable: true;
        options.showLink = options.showLink !== undefined? options.showLink: true;
        options.showImage = options.showImage !== undefined? options.showImage: true;
        options.showVideo = options.showVideo !== undefined? options.showVideo: true;
        options.showFullScreen = options.showFullScreen !== undefined? options.showFullScreen: true;
        options.showCodeView = options.showCodeView !== undefined? options.showCodeView: true;
        options.showUndo = options.showUndo !== undefined? options.showUndo: true;
        options.showRedo = options.showRedo !== undefined? options.showRedo: true;

        var doc = document;
        /** 최상위 div */
        var top_div = doc.createElement("DIV");
        top_div.className = "sun-editor";
        top_div.id = "suneditor_" + element.id;
        top_div.style.width = options.width;
        /** relative div */
        var relative = doc.createElement("DIV");
        relative.className = "sun-editor-container";

        /** 툴바 */
        var tool_bar = doc.createElement("DIV");
        tool_bar.className = "sun-editor-id-toolbar";
        tool_bar.innerHTML = createEditor(options).toolBar();

        /** 에디터 */
        var editor_div = doc.createElement("DIV");
        editor_div.className = "sun-editor-id-editorArea";
        editor_div.style.height = options.height;
        /** iframe */
        var iframe = doc.createElement("IFRAME");
        iframe.allowFullscreen = true;
        iframe.frameBorder = 0;
        iframe.className = "input_editor sun-editor-id-wysiwyg";
        iframe.style.display = "block";
        /** textarea */
        var textarea = doc.createElement("TEXTAREA");
        textarea.className = "input_editor html sun-editor-id-source";
        textarea.style.display = "none";

        /** 리사이즈바 */
        var resize_bar = doc.createElement("DIV");
        resize_bar.className = "sun-editor-id-resizeBar";

        /** 다이얼로그 */
        var dialog_div = doc.createElement("DIV");
        dialog_div.className = "sun-editor-id-dialogBox";
        dialog_div.innerHTML = createEditor(options).dialogBox();

        /** 이미지 조절 div */
        var resize_img = doc.createElement("DIV");
        resize_img.className = "modal-image-resize";
        resize_img.innerHTML = createEditor(options).imgDiv();
        /** 이미지 조절 버튼 */
        var resize_img_button = doc.createElement("DIV");
        resize_img_button.className = "image-resize-btn";
        resize_img_button.innerHTML = createEditor(options).imgBtn();

        /** 로딩 박스 */
        var loding_box = doc.createElement("DIV");
        loding_box.className = "sun-editor-id-loding";
        loding_box.innerHTML = "<div class=\"ico-loding\"></div>";

        /** resize 동작시 background */
        var resize_back = doc.createElement("DIV");
        resize_back.className = "sun-editor-id-resize-background";

        /** 링크 수정 버튼 */
        var link_button = doc.createElement("DIV");
        link_button.className = "sun-editor-id-link-btn";
        link_button.innerHTML = createEditor(options).linkBtn();

        /** 사용자 옵션 값 넣기 */
        dialog_div.getElementsByClassName('sun-editor-id-video-x')[0].value = options.videoX;
        dialog_div.getElementsByClassName('sun-editor-id-video-y')[0].value = options.videoY;

        /** append */
        editor_div.appendChild(iframe);
        editor_div.appendChild(textarea);
        relative.appendChild(tool_bar);
        relative.appendChild(editor_div);
        relative.appendChild(resize_bar);
        relative.appendChild(dialog_div);
        relative.appendChild(resize_back);
        relative.appendChild(resize_img);
        relative.appendChild(resize_img_button);
        relative.appendChild(loding_box);
        relative.appendChild(link_button);
        top_div.appendChild(relative);

        return {
            constructed : {
                _top : top_div,
                _toolBar : tool_bar,
                _editorArea : editor_div,
                _resizeBar : resize_bar,
                _dialog : dialog_div,
                _loding : loding_box,
                _resizeImg : resize_img,
                _resizeImgBtn : resize_img_button,
                _resizeBack : resize_back,
                _linkBtn : link_button
            },
            options : options
        };
    };

    /**
     * option and module define
     * @param cons
     * @param options
     * @returns {...}
     * @constructor
     */
    var Context = function(element, cons, options) {
        /** 내부 옵션값 초기화 */
        var styleTmp = document.createElement("div");

        styleTmp.style.cssText = cons._top.style.cssText;
        if(/none/i.test(styleTmp.style.display)) {
            styleTmp.style.display = options.display;
        }

        options._originCssText = styleTmp.style.cssText;
        options._innerHeight = cons._editorArea.clientHeight;

        styleTmp = null;

        var sun_wysiwyg = cons._editorArea.getElementsByClassName('sun-editor-id-wysiwyg')[0];

        setTimeout(function(){
            sun_wysiwyg.setAttribute("scrolling", "auto");
            sun_wysiwyg.contentWindow.document.head.innerHTML = ''+
                '<meta charset=\"utf-8\">' +
                '<style type=\"text/css\">' +
                '   body {font-family:"Helvetica Neue", Helvetica, Arial, sans-serif; margin:15px; word-break:break-all;} p {margin:0; padding:0;} blockquote {margin-top:0; margin-bottom:0; margin-right:0;}' +
                '   table {table-layout:auto; border:1px solid rgb(204, 204, 204); width:100%; max-width:100%; margin-bottom:20px; background-color:transparent; border-spacing:0px; border-collapse:collapse;}'+
                '   table tr {border:1px solid #ccc;}'+
                '   table tr td {border:1px solid #ccc; padding:8px;}'+
                '</style>';
            sun_wysiwyg.contentWindow.document.body.setAttribute("contenteditable", true);
            if(element.value.length > 0) {
                sun_wysiwyg.contentWindow.document.body.innerHTML = '<p>'+element.value+'</p>';
            } else {
                sun_wysiwyg.contentWindow.document.body.innerHTML = '<p>&#65279</p>';
            }
        }, 0);

        return {
            argument : {
                _copySelection : null,
                _selectionNode : null,
                _imageElement : null,
                _imageElement_w : 0,
                _imageElement_h : 0,
                _imageElement_l : 0,
                _imageElement_t : 0,
                _imageClientX : 0,
                _imageResize_parent_t : 0,
                _imageResize_parent_l : 0,
                _wysiwygActive : true,
                _isFullScreen : false,
                _innerHeight_fullScreen : 0,
                _tableXY : [],
                _resizeClientY : 0,
                _originCssText : options._originCssText,
                _innerHeight : options._innerHeight,
                _windowHeight : window.innerHeight,
                _linkAnchor : null,
                _isTouchMove : false
            },
            element : {
                textElement: element,
                topArea: cons._top,
                resizebar: cons._resizeBar,
                editorArea: cons._editorArea,
                wysiwygWindow: sun_wysiwyg.contentWindow,
                wysiwygElement: sun_wysiwyg,
                source: cons._editorArea.getElementsByClassName('sun-editor-id-source')[0],
                loding : cons._loding,
                imageResizeDiv : cons._resizeImg,
                imageResizeController : cons._resizeImg.getElementsByClassName('sun-editor-img-controller')[0],
                imageResizeDisplay : cons._resizeImg.getElementsByClassName('sun-editor-id-img-display')[0],
                imageResizeBtn : cons._resizeImgBtn,
                resizeBackground : cons._resizeBack,
                linkBtn : cons._linkBtn
            },
            tool : {
                bar : cons._toolBar,
                barHeight : cons._toolBar.offsetHeight,
                cover : cons._toolBar.getElementsByClassName('sun-editor-id-toolbar-cover')[0],
                bold : cons._toolBar.getElementsByClassName('sun-editor-id-bold')[0],
                underline : cons._toolBar.getElementsByClassName('sun-editor-id-underline')[0],
                italic : cons._toolBar.getElementsByClassName('sun-editor-id-italic')[0],
                strike : cons._toolBar.getElementsByClassName('sun-editor-id-strike')[0],
                tablePicker : cons._toolBar.getElementsByClassName('sun-editor-id-table-picker')[0],
                tableHighlight : cons._toolBar.getElementsByClassName('sun-editor-id-table-highlighted')[0],
                tableUnHighlight : cons._toolBar.getElementsByClassName('sun-editor-id-table-unhighlighted')[0],
                tableDisplay : cons._toolBar.getElementsByClassName('sun-editor-table-display')[0],
                fontFamily : cons._toolBar.getElementsByClassName('sun-editor-font-family')[0],
                default_fontFamily : cons._toolBar.getElementsByClassName('sun-editor-font-family')[0].textContent,
                list_fontFamily : cons._toolBar.getElementsByClassName('sun-editor-list-font-family')[0],
                list_fontFamily_add : cons._toolBar.getElementsByClassName('sun-editor-list-font-family-add')[0],
                fontSize : cons._toolBar.getElementsByClassName('sun-editor-font-size')[0],
                default_fontSize : cons._toolBar.getElementsByClassName('sun-editor-font-size')[0].textContent
            },
            dialog : {
                modalArea : cons._dialog,
                back : cons._dialog.getElementsByClassName('sun-editor-id-dialog-back')[0],
                modal : cons._dialog.getElementsByClassName('sun-editor-id-dialog-modal')[0],
                forms : cons._dialog.getElementsByTagName('FORM'),
                link : cons._dialog.getElementsByClassName('sun-editor-id-dialog-link')[0],
                linkText : cons._dialog.getElementsByClassName('sun-editor-id-linkurl')[0],
                linkAnchorText : cons._dialog.getElementsByClassName('sun-editor-id-linktext')[0],
                linkNewWindowCheck : cons._dialog.getElementsByClassName('sun-editor-id-linkCheck')[0],
                image : cons._dialog.getElementsByClassName('sun-editor-id-dialog-image')[0],
                imgInputFile : cons._dialog.getElementsByClassName('sun-editor-id-image-file')[0],
                imgInputUrl : cons._dialog.getElementsByClassName('sun-editor-id-image-url')[0],
                video : cons._dialog.getElementsByClassName('sun-editor-id-dialog-video')[0],
                videoInputUrl : cons._dialog.getElementsByClassName('sun-editor-id-video-url')[0],
                video_x : cons._dialog.getElementsByClassName('sun-editor-id-video-x')[0],
                video_y : cons._dialog.getElementsByClassName('sun-editor-id-video-y')[0]
            },
            user : {
                videoX : options.videoX,
                videoY : options.videoY,
                imageSize : options.imageSize,
                imageUploadUrl : options.imageUploadUrl
            }
        }
    };

    /**
     * create Suneditor
     * @param elementId
     * @param options
     * @returns {core}
     */
    SUNEDITOR.create = function (elementId, options) {
        var element = document.getElementById(elementId);

        if(element === null) {
            throw Error('[SUNEDITOR.create.fail] The element for that id was not found (ID:"' + elementId +'")');
        }

        var cons = Constructor(element, options);

        if(/none/i.test(element.style.display)) {
            cons.constructed._top.style.display = "none";
        }

        /** 형제 노드로 생성 후 숨김 */
        if(typeof element.nextElementSibling === 'object') {
            element.parentNode.insertBefore(cons.constructed._top, element.nextElementSibling);
        } else {
            element.parentNode.appendChild(cons.constructed._top);
        }

        element.style.display = "none";

        return core(Context(element, cons.constructed, cons.options));
    };

})(SUNEDITOR);