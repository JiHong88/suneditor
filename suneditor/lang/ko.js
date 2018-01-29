/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
if(typeof window.SUNEDITOR === 'undefined') {window.SUNEDITOR = {}; SUNEDITOR.plugin = {};}

SUNEDITOR.lang = {
    toolbar : {
        fontFamily : '글꼴',
        fontFamilyDelete : '글꼴 제거',
        formats : '포맷',
        fontSize : '크기',
        bold : '굵게',
        underline : '밑줄',
        italic : '기울임',
        strike : '취소선',
        fontColor : '글자색',
        hiliteColor : '글자 배경색',
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
        htmlEditor : 'HTML 편집',
        undo : '실행 취소',
        redo : '다시 실행'
    },
    dialogBox : {
        linkBox : {
            title : '링크 삽입',
            url : '이동할 인터넷 주소',
            text : '화면 텍스트',
            newWindowCheck : '새창으로 열기'
        },
        imageBox : {
            title : '이미지 삽입',
            file : '파일 선택',
            url : '이미지 주소',
            resize100 : '100% 크기',
            resize75 : '75% 크기',
            resize50 : '50% 크기',
            resize25 : '25% 크기',
            remove : '이미지 삭제'
        },
        videoBox : {
            title : '동영상 삽입',
            url : '미디어 임베드 주소, 유튜브',
            width : '가로',
            height : '세로'
        },
        submitButton : '확인'
    },
    editLink : {
        edit : '편집',
        remove : '삭제'
    }
};