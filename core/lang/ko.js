SUNEDITOR.lang = {
    toolbar : {
        fontFamily : '글꼴',
        fontFamilyDelete : '글꼴 제거',
        fontFormat : '글자크기',
        bold : '굵게',
        underline : '밑줄',
        italic : '기울임',
        strike : '취소선',
        fontColor : '글자색',
        foreColor : '글자 배경색',
        indent : '들여쓰기',
        outdent : '내어쓰기',
        align : '정렬',
        alignLeft : '왼쪽 정렬',
        alignRight : '오른쪽 정렬',
        alignCenter : '가운데 정렬',
        justifyFull : '양쪽 정렬',
        list : '리스트',
        orderList : '숫자형 불릿',
        unorderList : '원형 불릿',
        line : '구분선',
        table : '테이블',
        link : '링크',
        image : '사진',
        video : '동영상',
        fullScreen : '전체화면',
        htmlEditor : 'HTML 편집'
    },
    dialogBox : {
        linkBox : {
            title : '링크 삽입',
            url : '이동할 인터넷 주소',
            text : '화면 텍스트'
        },
        imageBox : {
            title : '이미지 삽입',
            file : '파일 선택',
            url : '이미지 주소'
        },
        videoBox : {
            title : '동영상 삽입',
            url : '미디어 임베드 주소, 유튜브'
        },
        submitButton : '확인'
    }
};


/*
var jsParam = function() {
    var scripts = document.getElementsByTagName('script');
    var script = scripts.item(scripts.length-1);
    var match = script.src.match(/\?(.+)$/);
    var get = '&';
    var data = [];
    if(match){
        var get = match[1];
        var params = get.split('&');
        for (var i = 0; i < params.length; i++) {
            var param = params[i].split('=');
            var name  = param[0];
            var value = param[1];
            data[name] = value;
        }
    }else{
        data["ver"] = "10";
    }
    this.get = function(oName) { return data[oName]; };
};*/
