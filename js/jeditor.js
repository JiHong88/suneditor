/**
 * @brif test editor
 */
(function(editorEl){
	/* 에디터 함수 */
	var editor = (function(){

		var subMenu = null;
		var originSub = null;
		var modalForm = null;
		var tabSize = 4;

		var pure_execCommand = function(command, showDefaultUI, value) {
			if(value) {
				editorEl.wysiwygWindow.document.execCommand(command, showDefaultUI, value);
			} else {
				editorEl.wysiwygWindow.document.execCommand(command, showDefaultUI);
			}
		};

		var cancel_table_picker = function() {
			editorEl.tableHighlight.style.width = "1em";
			editorEl.tableHighlight.style.height = "1em";
			editorEl.tableUnHighlight.style.width = "5em";
			editorEl.tableUnHighlight.style.height = "5em";
			dom.changeTxt(editorEl.tableDisplay, "1 x 1");
		};

		var subOff = function() {
			if(this.subMenu) {
				this.subMenu.style.display = "none";
				this.subMenu = null;
				this.cancel_table_picker();
			}
			if(this.modalForm) {
				this.modalForm.style.display = "none";
				editorEl.modalDialog_background.style.display = "none";
			}
			if(editorEl._imageElement) {
				event.cancel_image_resize();
			}

			return;
		};

		var toggleFrame = function(){
			if(!editorEl._wysiwygActive) {
				var ec = {"&amp;":"&","&nbsp;":"\u00A0","&quot;":"\"","&lt;":"<","&gt;":">"};
				var je_source_html = editorEl.iframeWindow.je_source.value.replace(/&[a-z]+;/g, function(m){ return (typeof ec[m] == "string")?ec[m]:m; });
				editorEl.iframeWindow.je_iframe.document.body.innerHTML = je_source_html.trim().length > 0? je_source_html: "<p>&#65279</p>";
				editorEl.wysiwygElement.style.display = "block";
				editorEl.sourceElement.style.display = "none";
				editorEl._wysiwygActive = true;
			}
			else {
				editorEl.iframeWindow.je_source.value = editorEl.iframeWindow.je_iframe.document.body.innerHTML;
				editorEl.sourceElement.style.display = "block";
				editorEl.wysiwygElement.style.display = "none";
				editorEl._wysiwygActive = false;
			}
		};

		var toggleFullScreen = function(element){
			if(!editorEl._isFullScreen) {
				editorEl.iframeArea.style.position = "fixed";
				editorEl.iframeArea.style.top = "0";
				editorEl.iframeArea.style.left = "0";
				editorEl.iframeArea.style.width = "100%";
				editorEl.iframeArea.style.height = "100%";

				editorEl._innerHeight_fullScreen = (window.innerHeight - editorEl.toolbar.offsetHeight);
				editorEl.inputArea.style.height = editorEl._innerHeight_fullScreen + "px"

				dom.removeClass(element.firstElementChild, 'ico_full_screen_e');
				dom.addClass(element.firstElementChild, 'ico_full_screen_i');
			}
			else {
				editorEl.iframeArea.style.cssText = editorEl.iframeCssText;
				editorEl.iframeArea.style.height = editorEl.iframeOuterHeight + "px";
				editorEl.inputArea.style.height = editorEl.iframeInnerHeight + "px";

				dom.removeClass(element.firstElementChild, 'ico_full_screen_i');
				dom.addClass(element.firstElementChild, 'ico_full_screen_e');
			}

			editorEl._isFullScreen = !editorEl._isFullScreen;
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
			editorEl._selectionNode.parentNode.appendChild(oHr);

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
				this.modalForm = editorEl.iframeWindow.form_link || editorEl.iframeWindow.document.getElementById("form_link");
				editorEl.linkText.focus();
				break;
			case 'image':
				this.modalForm = editorEl.iframeWindow.form_image || editorEl.iframeWindow.document.getElementById("form_image");
				break;
			case 'video':
				this.modalForm = editorEl.iframeWindow.form_video || editorEl.iframeWindow.document.getElementById("form_video");
				break;
			}

			editorEl.modalDialog_background.style.display = "block";
			editorEl.modalDialog.style.display = "block";
			this.modalForm.style.display = "block";

			this.subMenu = editorEl.modalDialog;
		};

		var showLoding = function() {
			editorEl.modalDialog_loding_background.style.display = "block";
		};

		var closeLoding = function() {
			editorEl.modalDialog_loding_background.style.display = "none";
		};

		var insertDataToSave = function() {
			if(editorEl._wysiwygActive) {
				editorEl._textElement.innerHTML = editorEl.wysiwygWindow.document.body.innerHTML;
			} else {
				editorEl._textElement.innerHTML = editorEl.sourceWindow.value;
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

	/* 공통 함수 생성 */
	var func = (function(){
		var returnTrue = function() {
			return true;
		};

		return {
			returnTrue : returnTrue
		};
	})();

	/* document 관련 함수 */
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

	/* 배열 관련 함수 */
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
			'FONT': editorEl.fontFamily,
			'B' : editorEl.bold,
			'U' : editorEl.underline,
			'I' : editorEl.italic,
			'STRIKE' : editorEl.strike
		};

		var fontFamilyMap = {};
		var list_fontFamily = editorEl.list_fontFamily.children;
		list_fontFamily[0].firstChild.getAttribute("data-value");

		for(var i=0; i<list_fontFamily.length; i++) {
			fontFamilyMap[list_fontFamily[i].firstChild.getAttribute("data-value").replace(/\s*/g,"")] = list_fontFamily[i].firstChild.getAttribute("data-txt");
		};
		list_fontFamily = editorEl.list_fontFamily_add.children;

		for(var i=0; i<list_fontFamily.length; i++) {
			fontFamilyMap[list_fontFamily[i].firstChild.getAttribute("data-value").replace(/\s*/g,"")] = list_fontFamily[i].firstChild.getAttribute("data-txt");
		};
		list_fontFamily = null;

		return {
			getArrayIndex : getArrayIndex,
			commandMap : commandMap,
			fontFamilyMap : fontFamilyMap
		}
	})();

	/* selection 관련 함수 */
	var wysiwygSelection = (function(){
		var focus = function(){
			editorEl.wysiwygWindow.document.body.focus();
		};

		var isEdgePoint = function(container, offset) {
			return (offset === 0) || (offset === container.nodeValue.length); // isLeftEdgePoint || isRightEdgePoint
		};

		var createRange = function() {
			return editorEl.wysiwygWindow.document.createRange();
		};

		var getFocusNode = function() {
			return editorEl.wysiwygWindow.window.getSelection().focusNode;
		};

		var getPElementInFocusNode = function() {
			var parentElement = editorEl._selectionNode;
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

	/* 이벤트 함수 */
	var event = (function(){
		var window_resize = function() {
			if(editorEl.toolbarHeight == editorEl.toolbar.offsetHeight) return;

			editorEl.iframeOuterHeight += (editorEl.toolbar.offsetHeight - editorEl.toolbarHeight);

			if(!editorEl._isFullScreen) {
				editorEl.iframeArea.style.height = editorEl.iframeOuterHeight + "px";
				editorEl.toolbarHeight = editorEl.toolbar.offsetHeight;
			}
			else {
				editorEl._innerHeight_fullScreen += (editorEl.toolbarHeight - editorEl.toolbar.offsetHeight);
				editorEl.inputArea.style.height = editorEl._innerHeight_fullScreen + "px";

				editorEl.toolbarHeight = editorEl.toolbar.offsetHeight;
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
					editor.appendTable(editorEl._tableXY[0], editorEl._tableXY[1]);
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
				var resizeDiv = editorEl.modalDialog_imageResize;
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
				editorEl._imageResize_parent_t = (editorEl.toolbar.offsetHeight + parentT);
				editorEl._imageResize_parent_l = parentL;

				t = (targetElement.offsetTop + editorEl._imageResize_parent_t - editorEl.wysiwygWindow.scrollY);
				l = (targetElement.offsetLeft + parentL);

				resizeDiv.style.top = t + "px";
				resizeDiv.style.left = l + "px";
				resizeDiv.style.width = w + "px";
				resizeDiv.style.height = h + "px";

				editorEl.imageResize_btn.style.top = (h + t) + "px";
				editorEl.imageResize_btn.style.left = l + "px";

				dom.changeTxt(editorEl.imageResize_display, w + " x " + h);

				editorEl._imageElement = targetElement;
				editorEl._imageElement_w = w;
				editorEl._imageElement_h = h;
				editorEl._imageElement_t = t;
				editorEl._imageElement_l = l;

				editorEl.modalDialog_imageResize.style.display = "block";
				editorEl.imageResize_btn.style.display = "block";
			}
			else {
				wysiwygSelection.focus();
			}
		};

		var onSelectionChange_wysiwyg = function(e) {
			editorEl._selectionNode = editorEl.wysiwygWindow.getSelection().anchorNode;

			var selectionParent = editorEl._selectionNode;
			var selectionNodeStr = "";
			var fontFamily = editorEl.default_fontFamily;
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

				 	var selection = editorEl.wysiwygWindow.getSelection();
				 	if (selection.rangeCount > 0) {
				 		selection.removeAllRanges();
				 	}
				 	selection.addRange(range);

				 	break;
				}

				// P 노드일때
				if(shift) break;

				var selection = editorEl.wysiwygWindow.getSelection();
				var tabText = editorEl.wysiwygWindow.document.createTextNode(new Array(editor.tabSize + 1).join("\u00A0"));

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
			if(editorEl._imageElement) {
				var t = (editorEl._imageElement.offsetTop + editorEl._imageResize_parent_t - editorEl.wysiwygWindow.scrollY);

				editorEl.modalDialog_imageResize.style.top = t + "px"
				editorEl.imageResize_btn.style.top = (t + editorEl._imageElement_h) + "px";
			}
		};

		var onBlur_wysiwyg = function(e) {
			editorEl._selectionNode = e.target.getSelection().anchorNode;
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
			    	editorEl._imageFileSrc =  e.target.result;

			    	var oImg = document.createElement("IMG");
					oImg.src = editorEl.imgInputUrl.value.trim().length>0? editorEl.imgInputUrl.value: editorEl._imageFileSrc;
					oImg.style.width = "350px";
					wysiwygSelection.getPElementInFocusNode().appendChild(oImg);
					editor.appendP(oImg);

					editorEl._imageFileSrc = null;
					editorEl.imgInputFile.value = "";
					editorEl.imgInputUrl.value = "";

					editor.closeLoding();
			    }

			    reader.readAsDataURL(this.files[0]);
		    }
		};

		var onKeyDown_image_controller = function() {
			editorEl.modalDialog_image_background.style.display = "block";
			editorEl.imageResize_btn.style = "none";
		};

		var onClick_imageResize_btn = function(e) {
			var command = e.target.getAttribute("data-command") || e.target.parentNode.getAttribute("data-command");

			if(!command) return;

			if(/^\d+$/.test(command)) {
				editorEl._imageElement.style.height = "";
				editorEl._imageElement.style.width = command + "%";
			}
			else if(/remove/.test(command)){
				editorEl._imageElement.remove();
			}

			editor.subOff();
			wysiwygSelection.focus();
		};

		var onMouseMove_image_Background = function(e) {
			var w = (e.offsetX - editorEl._imageElement_l);
			var h = ((editorEl._imageElement_h/editorEl._imageElement_w) * w);
			var l = 0;

			editorEl._imageElement.style.width = w + "px";
			editorEl._imageElement.style.height = h + "px";

			var parentElement = editorEl._imageElement.offsetParent;
			var parentL = 1;
			while(parentElement) {
				parentL += (parentElement.offsetLeft + + parentElement.clientLeft);
				parentElement = parentElement.offsetParent;
			}

			l = (editorEl._imageElement.offsetLeft + parentL);

			editorEl.modalDialog_imageResize.style.left = l + "px";
			editorEl.modalDialog_imageResize.style.width = w + "px";
			editorEl.modalDialog_imageResize.style.height = h + "px";

			dom.changeTxt(editorEl.imageResize_display, Math.round(w) + " x " + Math.round(h));
		};

		var cancel_image_resize = function() {
			editorEl.modalDialog_image_background.style.display = "none";
			editorEl.modalDialog_imageResize.style.display = "none";
			editorEl.imageResize_btn.style.display = "none";
			editorEl._imageElement = null;
		};

		var onMouseMove_tablePicker = function(e) {
			var x = Math.ceil(e.offsetX/18);
			var y = Math.ceil(e.offsetY/18);
			x = x<1? 1: x;
			y = y<1? 1: y;
			editorEl.tableHighlight.style.width = x + "em";
			editorEl.tableHighlight.style.height = y + "em";

			var x_u = x<5? 5: (x>9? 10: x+1);
			var y_u = y<5? 5: (y>9? 10: y+1);
			editorEl.tableUnHighlight.style.width = x_u + "em";
			editorEl.tableUnHighlight.style.height = y_u + "em";

			dom.changeTxt(editorEl.tableDisplay, x + " x " + y);
			editorEl._tableXY = [x, y];
		};

		var onSubmit = function(e) {
			var className = e.target.className;

			editor.subOff();

			try {
				switch(className) {
				case 'editor_link':
					if(editorEl.linkText.value.trim().length == 0) break;

					var url = /^https?:\/\//.test(editorEl.linkText.value)? editorEl.linkText.value: "http://" +  editorEl.linkText.value;
					var anchor = editorEl.iframeWindow.linkAnchorText || editorEl.iframeWindow.document.getElementById("linkAnchorText");
					var anchorText = anchor.value.length == 0? url: anchor.value;

					editor.pure_execCommand("createLink", false, url);
					wysiwygSelection.getFocusNode().parentNode.text = anchorText;

					editorEl.linkText.value = "";
					editorEl.iframeWindow.linkAnchorText.value = "";
					break;
				case 'editor_image':
					if(!editorEl._imageFileSrc && editorEl.imgInputUrl.value.trim().length == 0) break;

					var oImg = document.createElement("IMG");
					oImg.src = editorEl.imgInputUrl.value.trim().length>0? editorEl.imgInputUrl.value: editorEl._imageFileSrc;
					oImg.style.width = "350px";
					wysiwygSelection.getPElementInFocusNode().appendChild(oImg);
					editor.appendP(oImg);

					editorEl._imageFileSrc = null;
					editorEl.imgInputFile.value = "";
					editorEl.imgInputUrl.value = "";
					break;
				case'editor_video':
					if(editorEl.videoInputUrl.length == 0) break;

					editor.showLoding();

					var url = editorEl.videoInputUrl.value.replace(/^https?:/, '');
					var oIframe = document.createElement("IFRAME");
					var x_v = editorEl.size_x.value;
					var y_v = editorEl.size_y.value;

					// youtube
					if(/youtu\.?be/.test(url)) {
						url = url.replace('watch?v=', '');
						if(!/^\/\/.+\/embed\//.test(url)) {
							var youtubeUrl = url.match(/^\/\/.+\//)[0]
							url = url.replace(youtubeUrl, '//www.youtube.com/embed/');
						}
					}

					oIframe.src = url;
					oIframe.width = (/^\d+$/.test(x_v)? x_v: editorEl.videoX);
					oIframe.height = (/^\d+$/.test(y_v)? y_v: editorEl.videoY);
					oIframe.frameBorder = "0";
					oIframe.allowFullscreen = true;
					wysiwygSelection.getPElementInFocusNode().appendChild(oIframe);
					editor.appendP(oIframe);

					editorEl.videoInputUrl.value = "";
					editorEl.size_x.value = editorEl.videoX;
					editorEl.size_y.value = editorEl.videoY;

					editor.closeLoding();
					break;
				}
			}catch(e) {
				return false;
			}

			return false;
		};

		var onMouseDown_resizeBar = function(e) {
			editorEl._resizeEditor = true;
			editorEl._resizeClientY = e.clientY;
			editorEl.resizeBackground.style.display = "block";


	        editorEl._document.addEventListener('mousemove', event.resize_editor);
	        editorEl._document.addEventListener('mouseup', function () {
	        	editorEl._document.removeEventListener('mousemove', event.resize_editor);
	        	editorEl.resizeBackground.style.display = "none";
	        });
		};

		var resize_editor = function(e) {
			if(!editorEl._resizeEditor) return;

			var resizeInterval = (e.clientY - editorEl._resizeClientY);

			editorEl.iframeArea.style.height = (editorEl.iframeArea.offsetHeight + resizeInterval) + "px";
			editorEl.inputArea.style.height = (editorEl.inputArea.offsetHeight + resizeInterval) + "px";

			editorEl.iframeOuterHeight = (editorEl.iframeArea.offsetHeight + resizeInterval);
			editorEl.iframeInnerHeight = (editorEl.inputArea.offsetHeight + resizeInterval);

			editorEl._resizeClientY = e.clientY;
		};

		return {
			window_resize : window_resize,
			onClick_toolbar : onClick_toolbar,
			onMouseDown_wysiwyg : onMouseDown_wysiwyg,
			onSelectionChange_wysiwyg : onSelectionChange_wysiwyg,
			onKeyDown_wysiwyg : onKeyDown_wysiwyg,
			onScroll_wysiwyg : onScroll_wysiwyg,
			onBlur_wysiwyg : onBlur_wysiwyg,
			onClick_dialog : onClick_dialog,
			onChange_imgInput : onChange_imgInput,
			onKeyDown_image_controller : onKeyDown_image_controller,
			onClick_imageResize_btn : onClick_imageResize_btn,
			onMouseMove_image_Background : onMouseMove_image_Background,
			cancel_image_resize : cancel_image_resize,
			onMouseMove_tablePicker : onMouseMove_tablePicker,
			onSubmit : onSubmit,
			onMouseDown_resizeBar : onMouseDown_resizeBar,
			resize_editor : resize_editor,
		};
	})();

	/* 이벤트 등록 */
	window.onresize = function(){event.window_resize()};
	editorEl.toolbar.addEventListener("click", event.onClick_toolbar);

	editorEl.wysiwygWindow.addEventListener("mousedown", event.onMouseDown_wysiwyg);
	editorEl.wysiwygWindow.document.addEventListener("selectionchange", event.onSelectionChange_wysiwyg);
	editorEl.wysiwygWindow.document.onselectionchange = function(){event.onSelectionChange_wysiwyg()};
	editorEl.wysiwygWindow.addEventListener("keydown", event.onKeyDown_wysiwyg);
	editorEl.wysiwygWindow.addEventListener('scroll', event.onScroll_wysiwyg);
	editorEl.wysiwygWindow.addEventListener("blur", event.onBlur_wysiwyg);

	editorEl.modalDialog.addEventListener("click", event.onClick_dialog);
	editorEl.imgInputFile.addEventListener("change", event.onChange_imgInput);

	editorEl.imageResize_controller.addEventListener('mousedown', event.onKeyDown_image_controller);
	editorEl.imageResize_btn.addEventListener('click', event.onClick_imageResize_btn);
	editorEl.modalDialog_image_background.addEventListener('mousemove', event.onMouseMove_image_Background);
	editorEl.modalDialog_image_background.addEventListener('mouseup', event.cancel_image_resize);
	editorEl.modalDialog_image_background.addEventListener('mouseout', event.cancel_image_resize);

	editorEl.tablePicker.addEventListener('mousemove', event.onMouseMove_tablePicker);

	editorEl.resizeBar.addEventListener("mousedown", event.onMouseDown_resizeBar);

	for(var i=0; i<editorEl.forms.length; i++) {
		editorEl.forms[i].onsubmit = event.onSubmit;
	};
})({
    textElement : jihong.editor.textElement, // 에디터를 적용할 textarea 태그 (필수)
    videoY : jihong.editor.videoY,// 동영상 프레임 기본 세로 크기
    videoX : jihong.editor.videoX, // 동영상 프레임 기본 가로 크기
    iframeCssText : jihong.editor._iframeCssText, // 기본 css 저장
    iframeInnerHeight : jihong.editor._iframeInnerHeight, //내부 입력창 높이
    iframeOuterHeight : jihong.editor._iframeOuterHeight, //외부 입력창 높이
    resizeBar : jihong.editor._resizeBar,
    iframeArea : jihong.editor._iframeArea,
    resizeBackground : jihong.editor._resizeBackground,
    _document : jihong.editor._document,

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

	iframeWindow : this,
    sourceWindow : this.je_source,
    sourceElement : this.document.getElementById('je_source'),
    wysiwygWindow : this.je_iframe,
    wysiwygElement : this.document.getElementById('je_iframe'),
    inputArea : this.document.getElementById('je_input_area'),
	toolbar : this.je_toolbar,
	toolbarHeight : this.je_toolbar.offsetHeight,
    forms : this.document.forms,
	modalDialog_loding_background : this.modal_loding_background || this.document.getElementById("modal_loding_background"),
    modalDialog_image_background : this.modal_image_background || this.document.getElementById("modal_image_background"),
	modalDialog_imageResize : this.modal_image_resize || this.document.getElementById("modal_image_resize"),
	imageResize_controller : this.image_resize_controller || this.document.getElementById("image_resize_controller"),
	imageResize_display : this.image_size_display || this.document.getElementById("image_size_display"),
	imageResize_btn : this.image_resize_btn || this.document.getElementById("image_resize_btn"),
	modalDialog_background : this.modal_dialog_background || this.document.getElementById("modal_dialog_background"),
	modalDialog : this.modal_dialog || this.document.getElementById("modal_dialog"),
	tablePicker : this.table_picker || this.document.getElementById("table_picker"),
	tableHighlight : this.table_highlighted || this.document.getElementById("table_highlighted"),
	tableUnHighlight : this.table_unhighlighted || this.document.getElementById("table_unhighlighted"),
	tableDisplay : this.table_display || this.document.getElementById("table_display"),
	linkText : this.linkUrl || this.document.getElementById("linkUrl"),
	imgInputFile : this.imageFile || this.document.getElementById("imageFile"),
	imgInputUrl : this.imageUrl || this.document.getElementById("imageUrl"),
	videoInputUrl : this.videoUrl || this.document.getElementById("videoUrl"),
	list_fontFamily : this.fontFamily_list || this.document.getElementById("fontFamily_list"),
	list_fontFamily_add : this.fontFamily_list_add || this.document.getElementById("fontFamily_list_add"),
	fontFamily : this.font_family || this.document.getElementById("font_family"),
	bold : this.bold || this.document.getElementById("bold"),
	underline : this.underline || this.document.getElementById("underline"),
	italic : this.italic || this.document.getElementById("italic"),
	strike : this.strike || this.document.getElementById("strike"),
    size_x : this.size_x || this.document.getElementById("size_x"),
    size_y : this.size_y || this.document.getElementById("size_y"),
    default_fontFamily : this.font_family.textContent
});
