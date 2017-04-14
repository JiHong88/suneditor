/**
 * frame 생성 js
 */
if(typeof window.jihong=='undefined') window.jihong = {};
if (!jihong.editor) jihong.editor = {};


jihong.editor = new (function(){

	this.textElement, // 에디터를 적용할 textarea 태그 (필수)

    /* 사용자 속성 */
	this.videoX, // 동영상 프레임 기본 가로 크기
	this.videoY,// 동영상 프레임 기본 세로 크기

	/* 내부 */
	this._document,
	this._resizeBar,
	this._iframeCssText, // 기본 css 저장
	this._iframeInnerHeight, //내부 입력창 높이
	this._iframeOuterHeight, //외부 입력창 높이
	this._iframeArea,
	this._resizeBackground,

	/* textarea를 숨기고 화면에 에디터 html을 iframe으로 불러옴 */
	this.creator = function(options){

		/* 옵션 체크 */
		if(!options) {
			return false;
		}

		/* 적용할 textarea 객체를 가져온다 */
		if(typeof(options.textElement) != "object") {
			return false;
		}

        /**
         * @brif 파일 읽어오기
         * @param file
         * @returns {string}
         */
        function readTextFile(file) {
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

		var textElement = options.textElement; //적용 textarea 아이디
		var skinURI = options.skinURI || "./html/JEditorSkin_Basic.html"; //스킨 html uri

		/* iframe 생성 */
		var iframe, editorWidth, editorHeight, editorClientHeight;

		editorClientHeight = textElement.clientHeight;

		iframe = document.createElement("IFRAME");
		iframe.setAttribute("frameborder", "0");
		iframe.setAttribute("scrolling", "no");
		iframe.allowFullscreen = true;
		iframe.style.width = "100%";
		iframe.style.height = "100%";

		/* iframe에 스킨html 적용 */
		iframe.src = skinURI;

		/* 최상위 div */
		var top_div = document.createElement("DIV");
		top_div.className = "test-note";

		/* 툴바 */
		var tool_bar = document.createElement("DIV");
		tool_bar.className = "test-note-toolbar";
        tool_bar.innerHTML = readTextFile("./html/toolBar.html");

        /* 에디터 */
        var editor_div = document.createElement("DIV");
        editor_div.className = "test-note-inputArea";
        editor_div.style.height = editorClientHeight + "px";
        editor_div.innerHTML = readTextFile("./html/editor.html");

		/* 리사이즈바 */
		var resize_bar = document.createElement("DIV");
		resize_bar.className = "test-note-resizeBar";

		/* 다이얼로그 */
		var dialog_div = document.createElement("DIV");
        dialog_div.className = "test-note-dialogBox";
        dialog_div.innerHTML = readTextFile("./html/dialog.html");

		/* 최상위 div에 append */
        top_div.appendChild(tool_bar);
		top_div.appendChild(editor_div);
		top_div.appendChild(resize_bar);
		top_div.appendChild(dialog_div);

        jihong.editor._document = document;
        jihong.editor.textElement = textElement;
        jihong.editor._resizeBar = resize_bar;
        // jihong.editor._resizeBackground = resizeBack;
        // jihong.editor._iframeArea = iframe_div;

		/* iframe 로드시 이벤트 핸들러
		 * inner 크기 조정
		 *  */
		var frameLoadStyle = function(){
			// 최소 사이즈
			if(editorClientHeight < 240) {
				editorClientHeight = 240;
			}
			if(top_div.offsetWidth < 230) {
				iframe_div.style.width = "230px";
			}

            jihong.editor._iframeOuterHeight = editorClientHeight + (iframe.contentWindow.document.getElementById('je_toolbar').offsetHeight);
            jihong.editor._iframeInnerHeight = editorClientHeight;
            jihong.editor._iframeCssText = iframe_div.style.cssText;
            jihong.editor.videoX = /^\d+$/.test(options.videoX)? options.videoX: 560;
            jihong.editor.videoY = /^\d+$/.test(options.videoY)? options.videoY: 315;

			iframe_div.style.height = jihong.editor._iframeOuterHeight + "px";
			iframe.contentWindow.document.getElementById('je_input_area').style.height = jihong.editor._iframeInnerHeight + "px";
			iframe.contentWindow.je_iframe.document.body.innerHTML = "<p>&#65279" + textElement.value; + "</p>";
			iframe.contentWindow.document.body.style.margin = "0";
		}

		/* iframe 로드 이벤트 등록 */
		if(iframe.addEventListener){
			iframe.addEventListener("load", frameLoadStyle, false);
		}else{
			iframe.attachEvent("onload", frameLoadStyle);
		}

		/* applyFrame 밑에 생성 후 applyFrame display 옵션 none으로 변경 */
		textElement.parentNode.insertBefore(top_div, textElement.nextSibling);
		textElement.style.display = "none";
	}

})();
