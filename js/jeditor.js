/**
 * test editor
 */
(function(){
    /**
	 * utile func
     * @type {{returnTrue}}
     */
    var func = (function(){
        var returnTrue = function() {
            return true;
        };

        return {
            returnTrue : returnTrue
        };
    })();

    /**
	 * document func
     * @type {{nextIdx, prevIdx, isCell, getlistChildren, getParentNode, changeTxt, changeClass, addClass, removeClass, toggleClass}}
     */
    var dom = (function(){
        var nextIdx = function(array, item) {
            var idx = list.getArrayIndex(array, item);
            if (idx === -1) return -1;

            return idx + 1;
        };

        var prevIdx = function(array, item) {
            var idx = list.getArrayIndex(array, item);
            if (idx === -1) return -1;

            return idx - 1;
        };

        var isCell = function(node) {
            return node && /^TD|^TH/i.test(node.nodeName);
        };

        var getlistChildren = function(element, validation) {
            var children = [];
            validation = validation || func.returnTrue;

            (function recursionFunc(current){
                if (element !== current && validation(current)) {
                    children.push(current);
                }
                for (var i = 0, len = current.children.length; i < len; i++) {
                    recursionFunc(current.children[i]);
                }
            })(element);

            return children;
        };

        var getParentNode = function(element, tagName) {
            var check = new RegExp('^' + tagName + '$', 'i');

            while(!check.test(element.tagName)) {
                element = element.parentNode;
            }

            return element;
        };

        var changeTxt = function(element, txt) {
            element.textContent = txt;
        };

        var changeClass = function(element, className) {
            element.className = className;
        };

        var addClass = function(element, className) {
            if(!element) return;

            var check = new RegExp("(\\s|^)" + className + "(\\s|$)");
            if(check.test(element.className)) return;

            element.className += " " + className;
        };

        var removeClass = function(element, className) {
            if(!element) return;

            var check = new RegExp("(\\s|^)" + className + "(\\s|$)");
            element.className = element.className.replace(check, " ").trim();
        };

        var toggleClass = function(element, className) {
            var check = new RegExp("(\\s|^)" + className + "(\\s|$)");

            if (check.test(element.className)) {
                element.className = element.className.replace(check, " ").trim();
            }
            else {
                element.className += " " + className;
            }
        };

        return {
            nextIdx : nextIdx,
            prevIdx : prevIdx,
            isCell : isCell,
            getlistChildren : getlistChildren,
            getParentNode : getParentNode,
            changeTxt : changeTxt,
            changeClass : changeClass,
            addClass : addClass,
            removeClass : removeClass,
            toggleClass : toggleClass
        };
    })();

    /**
	 * testnote
     * @param context
     */
	var Note = function(context){
		/* 배열 관련 */
        var list = (function(){
            var getArrayIndex = function(array, element) {
                var idx = -1;

                for(var i=0; i<array.length; i++) {
                    if(array[i] == element) {
                        idx = i;
                        break;
                    }
                }

                return idx;
            };

            var commandMap = {
                'FONT': context.tool.fontFamily,
                'B' : context.tool.bold,
                'U' : context.tool.underline,
                'I' : context.tool.italic,
                'STRIKE' : context.tool.strike
            };

            var fontFamilyMap = {};
			var list_fontFamily = context.tool.list_fontFamily.children;
			 list_fontFamily[0].firstChild.getAttribute("data-value");

			 for(var i=0; i<list_fontFamily.length; i++) {
			 fontFamilyMap[list_fontFamily[i].firstChild.getAttribute("data-value").replace(/\s*!/g,"")] = list_fontFamily[i].firstChild.getAttribute("data-txt");
			 };
			 list_fontFamily = context.tool.list_fontFamily_add.children;

			 for(var i=0; i<list_fontFamily.length; i++) {
			 fontFamilyMap[list_fontFamily[i].firstChild.getAttribute("data-value").replace(/\s*!/g,"")] = list_fontFamily[i].firstChild.getAttribute("data-txt");
			 };
			 list_fontFamily = null;

            return {
                getArrayIndex : getArrayIndex,
                commandMap : commandMap,
                fontFamilyMap : fontFamilyMap
            }
        })();

		/* selection 관련 */
        var wysiwygSelection = (function(){
            var focus = function(){
                context.element.wysiwygWindow.document.body.focus();
            };

            var isEdgePoint = function(container, offset) {
                return (offset === 0) || (offset === container.nodeValue.length); // isLeftEdgePoint || isRightEdgePoint
            };

            var createRange = function() {
                return context.element.wysiwygWindow.document.createRange();
            };

            var getFocusNode = function() {
                return context.element.wysiwygWindow.window.getSelection().focusNode;
            };

            var getPElementInFocusNode = function() {
                var parentElement = context._selectionNode;
                while(!/P/.test(parentElement.tagName) && !/BODY/.test(parentElement.tagName)) {
                    parentElement = parentElement.parentNode;
                }

                return parentElement;
            };

            return {
                focus : focus,
                isEdgePoint : isEdgePoint,
                createRange : createRange,
                getFocusNode : getFocusNode,
                getPElementInFocusNode : getPElementInFocusNode
            };
        })();

		/* 에디터 */
		var editor = (function(){
            var subMenu = null;
            var originSub = null;
            var modalForm = null;
            var tabSize = 4;

            var pure_execCommand = function(command, showDefaultUI, value) {
                if(value) {
                    context.element.wysiwygWindow.document.execCommand(command, showDefaultUI, value);
                } else {
                    context.element.wysiwygWindow.document.execCommand(command, showDefaultUI);
                }
            };

            var cancel_table_picker = function() {
                context.tool.tableHighlight.style.width = "1em";
                context.tool.tableHighlight.style.height = "1em";
                context.tool.tableUnHighlight.style.width = "5em";
                context.tool.tableUnHighlight.style.height = "5em";
                dom.changeTxt(context.tool.tableDisplay, "1 x 1");
            };

            var subOff = function() {
                if(this.subMenu) {
                    this.subMenu.style.display = "none";
                    this.subMenu = null;
                    this.cancel_table_picker();
                }
                if(this.modalForm) {
                    this.modalForm.style.display = "none";
                    context.dialog.back.style.display = "none";
                }
                if(context._imageElement) {
                    event.cancel_image_resize();
                }

                return;
            };

            var toggleFrame = function(){
                if(!context._wysiwygActive) {
                    var ec = {"&amp;":"&","&nbsp;":"\u00A0","&quot;":"\"","&lt;":"<","&gt;":">"};
                    var je_source_html = context.source.value.replace(/&[a-z]+;/g, function(m){ return (typeof ec[m] == "string")?ec[m]:m; });
                    context.element.wysiwygWindow.document.body.innerHTML = je_source_html.trim().length > 0? je_source_html: "<p>&#65279</p>";
                    context.element.wysiwygElement.style.display = "block";
                    context.element.source.style.display = "none";
                    context.element.tool.cover.style.display = "none";
                    context._wysiwygActive = true;
                }
                else {
                    context.element.source.value = context.element.wysiwygWindow.document.body.innerHTML;
                    context.element.source.style.display = "block";
                    context.element.wysiwygElement.style.display = "none";
                    context.element.tool.cover.style.display = "block";
                    context._wysiwygActive = false;
                }
            };

            var toggleFullScreen = function(element){
                if(!context._isFullScreen) {
                    context.element.topArea.style.position = "fixed";
                    context.element.topArea.style.top = "0";
                    context.element.topArea.style.left = "0";
                    context.element.topArea.style.width = "100%";
                    context.element.topArea.style.height = "100%";

                    context._innerHeight_fullScreen = (window.innerHeight - context.tool.bar.offsetHeight);
                    context.element.editorArea.style.height = context._innerHeight_fullScreen + "px"

                    dom.removeClass(element.firstElementChild, 'ico_full_screen_e');
                    dom.addClass(element.firstElementChild, 'ico_full_screen_i');
                }
                else {
                    context.element.topArea.style.cssText = context._originCssText;
                    context.element.editorArea.style.height = context._innerHeight + "px";

                    dom.removeClass(element.firstElementChild, 'ico_full_screen_i');
                    dom.addClass(element.firstElementChild, 'ico_full_screen_e');
                }

                context._isFullScreen = !context._isFullScreen;
            };

            var appendHr = function(value) {
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
                context._selectionNode.parentNode.appendChild(oHr);

                editor.appendP(oHr);
            };

            var appendTable = function(x, y) {
                var oTable = document.createElement("TABLE");
                oTable.style.cssText = "border:1px solid #ccc;width:100%; max-width:100%; margin-bottom:20px; background-color:transparent; border-spacing:0; border-collapse:collapse;";

                var tableHTML = '<tbody>';
                while(y>0) {
                    tableHTML += '<tr style="border: 1px solid #ccc;">';
                    var tdCnt = x;
                    while(tdCnt>0) {
                        tableHTML += '<td style="border: 1px solid #ccc; padding:8px;"><p>&#65279</p></td>';
                        --tdCnt;
                    }
                    tableHTML += '</tr>';
                    --y;
                }
                tableHTML += '</tbody>';

                oTable.innerHTML = tableHTML;

                wysiwygSelection.getPElementInFocusNode().appendChild(oTable);;
                editor.appendP(oTable);
            };

            var appendP = function(element) {
                var oP = document.createElement("P");
                oP.innerHTML = '&#65279';
                element.parentNode.insertBefore(oP, element.nextElementSibling);
            };

            var openDialog = function(kind) {
                switch(kind) {
                    case 'link':
                        this.modalForm = context.dialog.link;
                        context.dialog.linkText.focus();
                        break;
                    case 'image':
                        this.modalForm = context.dialog.image;
                        break;
                    case 'video':
                        this.modalForm = context.dialog.video;
                        break;
                }

                context.dialog.back.style.display = "block";
                context.dialog.modal.style.display = "block";
                this.modalForm.style.display = "block";

                this.subMenu = context.dialog.modal;
            };

            var showLoding = function() {
                context.dialog.loding.style.display = "block";
            };

            var closeLoding = function() {
                context.dialog.loding.style.display = "none";
            };

            var insertDataToSave = function() {
                if(context._wysiwygActive) {
                    context.element.textElement.innerHTML = context.element.wysiwygWindow.document.body.innerHTML;
                } else {
                    context.element.textElement.innerHTML = context.element.source.value;
                }
            };

            return {
                subMenu : subMenu,
                originSub : originSub,
                modalForm : modalForm,
                tabSize : tabSize,
                pure_execCommand : pure_execCommand,
                cancel_table_picker : cancel_table_picker,
                subOff : subOff,
                toggleFrame : toggleFrame,
                toggleFullScreen : toggleFullScreen,
                appendHr : appendHr,
                appendTable : appendTable,
                appendP : appendP,
                openDialog : openDialog,
                showLoding : showLoding,
                closeLoding : closeLoding,
                insertDataToSave : insertDataToSave
            };
		})();

		/* 이벤트 */
        var event = (function(){
            var window_resize = function() {
                if(context.tool.barHeight == context.tool.bar.offsetHeight) return;

                if(!context._isFullScreen) {
                    context.tool.barHeight = context.tool.bar.offsetHeight;
                }
                else {
                    context._innerHeight_fullScreen += (context.tool.barHeight - context.tool.bar.offsetHeight);
                    context.element.editorArea.style.height = context._innerHeight_fullScreen + "px";

                    context.tool.barHeight = context.tool.bar.offsetHeight;
                }
            };

            var onClick_toolbar = function(e) {
                var targetElement = e.target;
                var display = targetElement.getAttribute("data-display");
                var command = targetElement.getAttribute("data-command");
                var className = targetElement.className;

                wysiwygSelection.focus();

                while(!command && !display && !/layer_color|layer_url|editor_tool/.test(className) && !/BODY/.test(targetElement.tagName)){
                    targetElement = targetElement.parentNode;
                    command = targetElement.getAttribute("data-command");
                    display = targetElement.getAttribute("data-display");
                    className = targetElement.className;
                }

                var value = targetElement.getAttribute("data-value");
                var txt = targetElement.getAttribute("data-txt");

                // 서브메뉴 보이기
                if(display || /BODY/.test(targetElement.tagName)) {
                    var nextSibling = editor.subMenu;
                    editor.subOff();

                    if(targetElement.nextElementSibling != null && targetElement.nextElementSibling != nextSibling){
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

                if(/layer_color/.test(className) && /BUTTON/.test(e.target.tagName)) {
                    command = targetElement.id;
                    value = e.target.textContent;
                }

                // 커멘드 명령어 실행
                if(command) {

                    if(/fontName/.test(command)) {
                        dom.changeTxt(editor.originSub.firstElementChild, txt);
                        editor.pure_execCommand(command, false, value);
                    }
                    else if(/format/.test(command)) {
                        editor.pure_execCommand("formatBlock", false, value);
                    }
                    else if(/justifyleft|justifyright|justifycenter|justifyfull/.test(command)) {
                        dom.changeTxt(editor.originSub.firstElementChild, targetElement.title.split(" ")[0]);
//					dom.changeClass(editor.originSub.firstElementChild, targetElement.firstElementChild.className);
                        editor.pure_execCommand(command, false);
                    }
                    else if(/foreColor|hiliteColor/.test(command)) {
                        editor.pure_execCommand(command, false, value);
                    }
                    else if(/horizontalRules/.test(command)) {
                        editor.appendHr(value);
                    }
                    else if(/sorceFrame/.test(command)) {
                        editor.toggleFrame();
                        dom.toggleClass(targetElement, 'on');
                    }
                    else if(/fullScreen/.test(command)) {
                        editor.toggleFullScreen(targetElement);
                        dom.toggleClass(targetElement, "on");
                    }
                    else if(/indent|outdent/.test(command)) {
                        editor.pure_execCommand(command, false);
                    }
                    else if(/insertTable/.test(command)) {
                        editor.appendTable(context._tableXY[0], context._tableXY[1]);
                    }
                    else {
                        editor.pure_execCommand(command, false, value);
                        dom.toggleClass(targetElement, "on");
                    }

                    editor.subOff();
                }

            };

            var onMouseDown_wysiwyg = function(e) {
                var targetElement = e.target;

                editor.subOff();

                if(/IMG/.test(targetElement.tagName)) {
                    var resizeDiv = context.modalDialog_imageResize;
                    var w = targetElement.offsetWidth;
                    var h = targetElement.offsetHeight;
                    var t = 0;
                    var l = 0;

                    var parentElement = targetElement.offsetParent;
                    var parentT = 1;
                    var parentL = 1;
                    while(parentElement) {
                        parentT += (parentElement.offsetTop + parentElement.clientTop);
                        parentL += (parentElement.offsetLeft + + parentElement.clientLeft);
                        parentElement = parentElement.offsetParent;
                    }
                    context._imageResize_parent_t = (context.tool.bar.offsetHeight + parentT);
                    context._imageResize_parent_l = parentL;

                    t = (targetElement.offsetTop + context._imageResize_parent_t - context.element.wysiwygWindow.scrollY);
                    l = (targetElement.offsetLeft + parentL);

                    resizeDiv.style.top = t + "px";
                    resizeDiv.style.left = l + "px";
                    resizeDiv.style.width = w + "px";
                    resizeDiv.style.height = h + "px";

                    context.imageResize_btn.style.top = (h + t) + "px";
                    context.imageResize_btn.style.left = l + "px";

                    dom.changeTxt(context.imageResize_display, w + " x " + h);

                    context._imageElement = targetElement;
                    context._imageElement_w = w;
                    context._imageElement_h = h;
                    context._imageElement_t = t;
                    context._imageElement_l = l;

                    context.modalDialog_imageResize.style.display = "block";
                    context.imageResize_btn.style.display = "block";
                }
                else {
                    wysiwygSelection.focus();
                }
            };

            var onSelectionChange_wysiwyg = function(e) {
                context._selectionNode = context.element.wysiwygWindow.getSelection().anchorNode;

                var selectionParent = context._selectionNode;
                var selectionNodeStr = "";
                var fontFamily = context.tool.default_fontFamily;
                while(!/P|BODY|HTML/.test(selectionParent.tagName)) {
                    selectionNodeStr += selectionParent.tagName + "|";
                    if(/FONT/.test(selectionParent.tagName)) {
                        fontFamily = list.fontFamilyMap[selectionParent.face.replace(/\s*/g,"")];
                    }
                    selectionParent = selectionParent.parentNode;
                }

                if(/SPAN/.test(selectionParent.tagName)) {
                    for(var i=0; i<selectionParent.children.length; i++) {
                        selectionNodeStr += selectionParent.children[i].tagName;
                    }
                }


                // add
                var onNode = selectionNodeStr.split("|");
                var map = "B|U|I|STRIKE|FONT|";
                for(var i=0; i<onNode.length - 1; i++) {
                    if(/FONT/.test(onNode[i])) {
                        dom.changeTxt(list.commandMap[onNode[i]], fontFamily);
                    }
                    else {
                        dom.addClass(list.commandMap[onNode[i]], "on");
                    }
                    map = map.replace(onNode[i]+"|", "");
                }

                // remove
                map = map.split("|");
                for(var i=0; i<map.length - 1; i++) {
                    if(/FONT/.test(map[i])) {
                        dom.changeTxt(list.commandMap[map[i]], fontFamily);
                    }
                    else {
                        dom.removeClass(list.commandMap[map[i]], "on");
                    }
                }
            };

            var onKeyDown_wysiwyg = function(e) {
                var target = e.target;
                var keyCode = e.keyCode;
                var shift = e.shiftKey;
                var ctrl = e.ctrlKey;
                var alt = e.altKey;


                switch(keyCode) {
                    case 8: //backspace
                        if(target.childElementCount == 1 && target.children[0].innerHTML == "<br>") {
//					target.innerHTML = "<p>&#65279</p>";
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        }
                        break;
                    case 9: //tab
                        e.preventDefault();
                        e.stopPropagation();

                        if(ctrl || alt) break;

                        var currentNode = wysiwygSelection.getPElementInFocusNode().parentNode;

                        if(currentNode && /TD/.test(currentNode.tagName)) {
                            var table = dom.getParentNode(currentNode, "table");
                            var cells = dom.getlistChildren(table, dom.isCell);
                            var idx = shift? dom.prevIdx(cells, currentNode): dom.nextIdx(cells, currentNode);

                            if(idx == cells.length && !shift) idx = 0;
                            if(idx == -1 && shift) idx = cells.length - 1;

                            var moveCell = cells[idx];
                            if(!moveCell) return false;

                            var range = wysiwygSelection.createRange();
                            range.setStart(moveCell, 0);
                            range.setEnd(moveCell, 0);

                            var selection = context.element.wysiwygWindow.getSelection();
                            if (selection.rangeCount > 0) {
                                selection.removeAllRanges();
                            }
                            selection.addRange(range);

                            break;
                        }

                        // P 노드일때
                        if(shift) break;

                        var selection = context.element.wysiwygWindow.getSelection();
                        var tabText = context.element.wysiwygWindow.document.createTextNode(new Array(editor.tabSize + 1).join("\u00A0"));

//				if(selection.anchorNode.nodeName.toUpperCase() == "BODY") break;

                        var nativeRng = selection.getRangeAt(0);
                        var startCon = nativeRng.startContainer;
                        var startOff = nativeRng.startOffset;
                        var endCon = nativeRng.endContainer;
                        var endOff = nativeRng.endOffset;

                        var pNode = startCon;
                        if(/#text/i.test(startCon.nodeName)) {
                            pNode = startCon.parentNode;
                        }

                        // 범위선택 없을때
                        if(startCon === endCon && startOff === endOff) {
                            if(/text/i.test(selection.focusNode.nodeName)) {
                                var rightNode = selection.focusNode.splitText(endOff);
                                pNode.insertBefore(tabText, rightNode);
                            }
                            else {
                                if(/BR/.test(pNode.lastChild.nodeName)) {
                                    pNode.removeChild(pNode.lastChild);
                                }
                                pNode.appendChild(tabText);
                            }

                            var rng = wysiwygSelection.createRange();
                            rng.setStart(tabText, shift? 1: editor.tabSize);
                            rng.setEnd(tabText, shift? 1: editor.tabSize);

                            if (selection.rangeCount > 0) {
                                selection.removeAllRanges();
                            }

                            selection.addRange(rng);
                        }
                        // 범위선택 했을때
                        else {
                            var removeNode = startCon;
                            var rightNode = null;
                            var isSameContainer = startCon === endCon;

                            if(isSameContainer) {
                                if(!wysiwygSelection.isEdgePoint(endCon, endOff)) {
                                    rightNode = endCon.splitText(endOff);
                                }

                                if(!wysiwygSelection.isEdgePoint(startCon, startOff)) {
                                    removeNode = startCon.splitText(startOff);
                                    startOff = 0;
                                }

                                endOff = endOff - startOff;

                                pNode.removeChild(removeNode);
                            }
                            else {
                                var nodes = [];
                                var container = startCon;
                                while(container.nodeType == 3 && !(endCon == container)) {
                                    nodes.push(container);
                                    container = container.nextSibling;
                                }

                                nodes.push(container);

                                for(var i=0; i<nodes.length; i++) {
                                    pNode.removeChild(nodes[i]);
                                }
                            }

                            // 반복
                            pNode.insertBefore(tabText, rightNode);

                            var rng = wysiwygSelection.createRange();
                            rng.setStart(tabText, editor.tabSize);
                            rng.setEnd(tabText, editor.tabSize);

                            if (selection.rangeCount > 0) {
                                selection.removeAllRanges();
                            }

                            selection.addRange(rng);
                        }

                        break;
                }
            };

            var onScroll_wysiwyg = function(e) {
                if(context._imageElement) {
                    var t = (context._imageElement.offsetTop + context._imageResize_parent_t - context.element.wysiwygWindow.scrollY);

                    context.modalDialog_imageResize.style.top = t + "px"
                    context.imageResize_btn.style.top = (t + context._imageElement_h) + "px";
                }
            };

            var onBlur_wysiwyg = function(e) {
                context._selectionNode = e.target.getSelection().anchorNode;
            };

            var onClick_dialog = function(e) {
                if(/modal-dialog/.test(e.target.className) || /close/.test(e.target.getAttribute("data-command"))) {
                    editor.subOff();
                }
            };

            var onChange_imgInput = function(e) {
                if (this.files && this.files[0]) {
                    editor.showLoding();
                    editor.subOff();

                    var reader = new FileReader();

                    reader.onload = function (e) {
                        context._imageFileSrc =  e.target.result;

                        var oImg = document.createElement("IMG");
                        oImg.src = context.dialog.imgInputUrl.value.trim().length>0? context.dialog.imgInputUrl.value: context._imageFileSrc;
                        oImg.style.width = "350px";
                        wysiwygSelection.getPElementInFocusNode().appendChild(oImg);
                        editor.appendP(oImg);

                        context._imageFileSrc = null;
                        context.dialog.imgInputFile.value = "";
                        context.dialog.imgInputUrl.value = "";

                        editor.closeLoding();
                    }

                    reader.readAsDataURL(this.files[0]);
                }
            };

            var onKeyDown_image_controller = function() {
                context.modalDialog_image_background.style.display = "block";
                context.imageResize_btn.style = "none";
            };

            var onClick_imageResize_btn = function(e) {
                var command = e.target.getAttribute("data-command") || e.target.parentNode.getAttribute("data-command");

                if(!command) return;

                if(/^\d+$/.test(command)) {
                    context._imageElement.style.height = "";
                    context._imageElement.style.width = command + "%";
                }
                else if(/remove/.test(command)){
                    context._imageElement.remove();
                }

                editor.subOff();
                wysiwygSelection.focus();
            };

            var onMouseMove_image_Background = function(e) {
                var w = (e.offsetX - context._imageElement_l);
                var h = ((context._imageElement_h/context._imageElement_w) * w);
                var l = 0;

                context._imageElement.style.width = w + "px";
                context._imageElement.style.height = h + "px";

                var parentElement = context._imageElement.offsetParent;
                var parentL = 1;
                while(parentElement) {
                    parentL += (parentElement.offsetLeft + + parentElement.clientLeft);
                    parentElement = parentElement.offsetParent;
                }

                l = (context._imageElement.offsetLeft + parentL);

                context.modalDialog_imageResize.style.left = l + "px";
                context.modalDialog_imageResize.style.width = w + "px";
                context.modalDialog_imageResize.style.height = h + "px";

                dom.changeTxt(context.imageResize_display, Math.round(w) + " x " + Math.round(h));
            };

            var cancel_image_resize = function() {
                context.modalDialog_image_background.style.display = "none";
                context.modalDialog_imageResize.style.display = "none";
                context.imageResize_btn.style.display = "none";
                context._imageElement = null;
            };

            var onMouseMove_tablePicker = function(e) {
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
                context._tableXY = [x, y];
            };

            var onSubmit = function(e) {
                var className = e.target.className;

                editor.subOff();

                try {
                    switch(className) {
                        case 'editor_link':
                            if(context.dialog.linkText.value.trim().length == 0) break;

                            var url = /^https?:\/\//.test(context.dialog.linkText.value)? context.dialog.linkText.value: "http://" +  context.dialog.linkText.value;
                            var anchor = context.dialog.linkAnchorText || context.dialog.document.getElementById("linkAnchorText");
                            var anchorText = anchor.value.length == 0? url: anchor.value;

                            editor.pure_execCommand("createLink", false, url);
                            wysiwygSelection.getFocusNode().parentNode.text = anchorText;

                            context.dialog.linkText.value = "";
                            context.dialog.linkAnchorText.value = "";
                            break;
                        case 'editor_image':
                            if(!context._imageFileSrc && context.dialog.imgInputUrl.value.trim().length == 0) break;

                            var oImg = document.createElement("IMG");
                            oImg.src = context.dialog.imgInputUrl.value.trim().length>0? context.dialog.imgInputUrl.value: context._imageFileSrc;
                            oImg.style.width = "350px";
                            wysiwygSelection.getPElementInFocusNode().appendChild(oImg);
                            editor.appendP(oImg);

                            context._imageFileSrc = null;
                            context.dialog.imgInputFile.value = "";
                            context.dialog.imgInputUrl.value = "";
                            break;
                        case'editor_video':
                            if(context.dialog.videoInputUrl.length == 0) break;

                            editor.showLoding();

                            var url = context.dialog.videoInputUrl.value.replace(/^https?:/, '');
                            var oIframe = document.createElement("IFRAME");
                            var x_v = context.dialog.video_x.value;
                            var y_v = context.dialog.video_y.value;

                            // youtube
                            if(/youtu\.?be/.test(url)) {
                                url = url.replace('watch?v=', '');
                                if(!/^\/\/.+\/embed\//.test(url)) {
                                    var youtubeUrl = url.match(/^\/\/.+\//)[0]
                                    url = url.replace(youtubeUrl, '//www.youtube.com/embed/');
                                }
                            }

                            oIframe.src = url;
                            oIframe.width = (/^\d+$/.test(x_v)? x_v: context.videoX);
                            oIframe.height = (/^\d+$/.test(y_v)? y_v: context.videoY);
                            oIframe.frameBorder = "0";
                            oIframe.allowFullscreen = true;
                            wysiwygSelection.getPElementInFocusNode().appendChild(oIframe);
                            editor.appendP(oIframe);

                            context.dialog.videoInputUrl.value = "";
                            context.dialog.video_x.value = context.videoX;
                            context.dialog.video_y.value = context.videoY;

                            editor.closeLoding();
                            break;
                    }
                }catch(e) {
                    return false;
                }

                return false;
            };

            var onMouseDown_resizeBar = function(e) {
                context._resizeEditor = true;
                context._resizeClientY = e.clientY;
                context.dialog.resizeBackground.style.display = "block";


                document.addEventListener('mousemove', event.resize_editor);
                document.addEventListener('mouseup', function () {
                    document.removeEventListener('mousemove', event.resize_editor);
                    context.dialog.resizeBackground.style.display = "none";
                });
            };

			/* 이벤트 등록 */
            window.onresize = function(){window_resize()};
            context.tool.bar.addEventListener("click", onClick_toolbar);

            context.element.wysiwygWindow.addEventListener("mousedown", onMouseDown_wysiwyg);
            context.element.wysiwygWindow.document.addEventListener("selectionchange", onSelectionChange_wysiwyg);
            context.element.wysiwygWindow.document.onselectionchange = function(){onSelectionChange_wysiwyg()};
            context.element.wysiwygWindow.addEventListener("keydown", onKeyDown_wysiwyg);
            context.element.wysiwygWindow.addEventListener('scroll', onScroll_wysiwyg);
            context.element.wysiwygWindow.addEventListener("blur", onBlur_wysiwyg);

            context.dialog.modal.addEventListener("click", onClick_dialog);
            context.dialog.imgInputFile.addEventListener("change", onChange_imgInput);

            /*context.imageResize_controller.addEventListener('mousedown', onKeyDown_image_controller);
            context.imageResize_btn.addEventListener('click', onClick_imageResize_btn);
            context.modalDialog_image_background.addEventListener('mousemove', onMouseMove_image_Background);
            context.modalDialog_image_background.addEventListener('mouseup', cancel_image_resize);
            context.modalDialog_image_background.addEventListener('mouseout', cancel_image_resize);*/

            context.tool.tablePicker.addEventListener('mousemove', onMouseMove_tablePicker);

            context.element.resizebar.addEventListener("mousedown", onMouseDown_resizeBar);

            for(var i=0; i<context.dialog.forms.length; i++) {
                context.dialog.forms[i].onsubmit = onSubmit;
            };
        })();
	};

    /**
	 * testnote related html reading func
     * @param file
     * @returns {string}
     */
    var readTextFile = function(file) {
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, false);
        var text = "";
        rawFile.onreadystatechange = function () {
            if(rawFile.readyState === 4) {
                if(rawFile.status === 200 || rawFile.status == 0) {
                    text = rawFile.responseText;
                }
            }
        };
        rawFile.send(null);
        return text;
    }

    /**
	 * document create
     * @param element
     * @param options
     * @returns {{constructed: Element, options: *}}
     * @constructor
     */
    var Constructor = function(element, options) {
    	/* 옵션이 안들어 왔을 경우 */
        if(!(typeof options === "object")) options = {};

		/* 사용자 옵션 초기화 */
        options.videoX = options.videoX || 560;
        options.videoY = options.videoY || 315;

		/* 최상위 div */
        var top_div = document.createElement("DIV");
        top_div.className = "test-note";
        top_div.style.width = /%|auto/.test(element.style.width)? element.style.width: element.clientWidth + "px";
		/* 툴바 */
        var tool_bar = document.createElement("DIV");
        tool_bar.className = "test-note-id-toolbar";
        tool_bar.innerHTML = readTextFile("./html/toolBar.html");
		/* 에디터 */
        var editor_div = document.createElement("DIV");
        editor_div.className = "test-note-id-editorArea";
        editor_div.style.height = element.clientHeight + "px";
        editor_div.innerHTML = readTextFile("./html/editor.html");
		/* 리사이즈바 */
        var resize_bar = document.createElement("DIV");
        resize_bar.className = "test-note-id-resizeBar";
		/* 다이얼로그 */
        var dialog_div = document.createElement("DIV");
        dialog_div.className = "test-note-id-dialogBox";
        dialog_div.innerHTML = readTextFile("./html/dialog.html");

        /* 사용자 옵션 값 넣기*/
        dialog_div.getElementsByClassName('test-note-id-video-x')[0].value = options.videoX;
        dialog_div.getElementsByClassName('test-note-id-video-y')[0].value = options.videoY;

		/* 최상위 div에 append */
        top_div.appendChild(tool_bar);
        top_div.appendChild(editor_div);
        top_div.appendChild(resize_bar);
        top_div.appendChild(dialog_div);

        return {
        	constructed : {
                _top : top_div,
				_toolBar : tool_bar,
				_editorArea : editor_div,
				_resizeBar : resize_bar,
				_dialog : dialog_div
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
        return {
            argument : {
                _selectionNode : null,
                _imageFileSrc : null,
                _imageElement : null,
                _imageElement_w : 0,
                _imageElement_h : 0,
                _imageElement_l : 0,
                _imageElement_t : 0,
                _imageResize_parent_t : 0,
                _imageResize_parent_l : 0,
                _wysiwygActive : true,
                _isFullScreen : false,
                _innerHeight_fullScreen : 0,
                _tableXY : [],
                _resizeEditor : false,
                _resizeClientY : 0,
                _originCssText : options._iframeCssText, // 기본 css 저장
                _innerHeight : options._iframeInnerHeight
			},
			element : {
                textElement: element,
                topArea: cons,
                resizebar: cons._resizeBar,
                editorArea: cons._editorArea,
                wysiwygWindow: cons._editorArea.getElementsByClassName('test-note-id-wysiwyg')[0].contentWindow,
                wysiwygElement: cons._editorArea.getElementsByClassName('test-note-id-wysiwyg')[0],
                source: cons._editorArea.getElementsByClassName('test-note-id-source')[0]
            },
			tool : {
				bar : cons._toolBar,
				barHeight : cons._toolBar.offsetHeight,
				cover : cons._toolBar.getElementsByClassName('test-note-id-toolbar-cover')[0],
				bold : cons._toolBar.getElementsByClassName('test-note-id-bold')[0],
				underline : cons._toolBar.getElementsByClassName('test-note-id-underline')[0],
				italic : cons._toolBar.getElementsByClassName('test-note-id-italic')[0],
				strike : cons._toolBar.getElementsByClassName('test-note-id-strike')[0],
				tablePicker : cons._toolBar.getElementsByClassName('test-note-id-table-picker')[0],
				tableHighlight : cons._toolBar.getElementsByClassName('test-note-id-table-highlighted')[0],
				tableUnHighlight : cons._toolBar.getElementsByClassName('test-note-id-table-unhighlighted')[0],
				tableDisplay : cons._toolBar.getElementsByClassName('test-note-table-display')[0],
				fontFamily : cons._toolBar.getElementsByClassName('test-note-font-family')[0],
				default_fontFamily : cons._toolBar.getElementsByClassName('test-note-font-family')[0].textContent,
				list_fontFamily : cons._toolBar.getElementsByClassName('test-note-list-font-family')[0],
				list_fontFamily_add : cons._toolBar.getElementsByClassName('test-note-list-font-family-add')[0]
			},
			dialog : {
				forms : cons._dialog.getElementsByTagName('FORM'),
				loding : cons._dialog.getElementsByClassName('test-note-id-loding')[0],
				back : cons._dialog.getElementsByClassName('test-note-id-dialog-back')[0],
				modal : cons._dialog.getElementsByClassName('test-note-id-dialog-modal')[0],
				link : cons._dialog.getElementsByClassName('test-note-id-dialog-link')[0],
				linkText : cons._dialog.getElementsByClassName('test-note-id-linkurl')[0],
				linkAnchorText : cons._dialog.getElementsByClassName('test-note-id-linktext')[0],
				image : cons._dialog.getElementsByClassName('test-note-id-dialog-image')[0],
				imgInputFile : cons._dialog.getElementsByClassName('test-note-id-image-file')[0],
				imgInputUrl : cons._dialog.getElementsByClassName('test-note-id-image-url')[0],
				video : cons._dialog.getElementsByClassName('test-note-id-dialog-video')[0],
				videoInputUrl : cons._dialog.getElementsByClassName('test-note-id-video-url')[0],
				video_x : cons._dialog.getElementsByClassName('test-note-id-video-x')[0],
				video_y : cons._dialog.getElementsByClassName('test-note-id-video-y')[0],

                /*modalDialog_image_background : cons._dialog.getElementsByClassName('')[0].modal_image_background,
                modalDialog_imageResize : cons._dialog.getElementsByClassName('')[0].modal_image_resize,
                imageResize_controller : cons._dialog.getElementsByClassName('')[0].image_resize_controller,
                imageResize_display : cons._dialog.getElementsByClassName('')[0].image_size_display,
                imageResize_btn : cons._dialog.getElementsByClassName('')[0].image_resize_btn,*/

				resizeBackground : cons._dialog.getElementsByClassName('test-note-id-resize-background')[0]
			},
			user : {
                videoX : options.videoX, // 동영상 프레임 기본 가로 크기
                videoY : options.videoY// 동영상 프레임 기본 세로 크기
            }
		}
    };

    /**
	 * testnote creator
     * @param options
     * @returns {Note}
     */
    Object.prototype.testnote = function(options) {
        var cons = Constructor(this, options);

		/* 형제 노드로 생성 후 숨김 */
        if(typeof this.nextElementSibling === 'object') {
            this.parentNode.insertBefore(cons.constructed._top, this.nextElementSibling);
        } else {
            this.parentNode.appendChild(cons.constructed._top);
        }

        this.style.display = "none";

        var context = Context(this, cons.constructed, cons.options);
        var note = new Note(context);

        return note;
    };

})();
