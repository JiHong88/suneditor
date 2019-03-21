/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

(function (global, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = global.document ?
            factory(global, true) :
            function(w) {
                if (!w.document) {
                    throw new Error('SUNEDITOR_LANG a window with a document');
                }
                return factory(w);
            };
    } else {
        factory(global);
    }
}(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
    const lang = {
        toolbar: {
            save: '저장',
            font: '글꼴',
            formats: '문단 형식',
            fontSize: '크기',
            bold: '굵게',
            underline: '밑줄',
            italic: '기울임',
            strike: '취소선',
            subscript: '아래 첨자',
            superscript: '위 첨자',
            removeFormat: '형식 제거',
            fontColor: '글자색',
            hiliteColor: '글자 배경색',
            indent: '들여쓰기',
            outdent: '내어쓰기',
            align: '정렬',
            alignLeft: '왼쪽 정렬',
            alignRight: '오른쪽 정렬',
            alignCenter: '가운데 정렬',
            justifyFull: '양쪽 정렬',
            list: '리스트',
            orderList: '숫자형 불릿',
            unorderList: '원형 불릿',
            horizontalRule: '가로 줄 삽입',
            hr_solid: '실선',
            hr_dotted: '점선',
            hr_dashed: '대시',
            table: '테이블',
            link: '링크',
            image: '이미지',
            video: '동영상',
            fullScreen: '전체화면',
            showBlocks: '블록 보기',
            codeView: 'HTML 편집',
            undo: '실행 취소',
            redo: '다시 실행',
            preview: '미리보기',
            print: '인쇄',
            tag_p: '본문',
            tag_div: '기본 (DIV)',
            tag_h: '제목',
            tag_quote: '인용문',
            pre: '코드'
        },
        dialogBox: {
            linkBox: {
                title: '링크 삽입',
                url: '인터넷 주소',
                text: '화면 텍스트',
                newWindowCheck: '새창으로 열기'
            },
            imageBox: {
                title: '이미지 삽입',
                file: '파일 선택',
                url: '이미지 주소',
                altText: '대체 문자열'
            },
            videoBox: {
                title: '동영상 삽입',
                url: '미디어 임베드 주소, 유튜브'
            },
            caption: '설명 넣기',
            close: '닫기',
            submitButton: '확인',
            revertButton: '되돌리기',
            proportion: '비율 맞춤',
            basic: '기본',
            left: '왼쪽',
            right: '오른쪽',
            center: '가운데',
            width: '가로',
            height: '세로'
        },
        controller: {
            edit: '편집',
            remove: '삭제',
            insertRowAbove: '위에 행 삽입',
            insertRowBelow: '아래에 행 삽입',
            deleteRow: '행 삭제',
            insertColumnBefore: '왼쪽에 열 삽입',
            insertColumnAfter: '오른쪽에 열 삽입',
            deleteColumn: '열 삭제',
            resize100: '100% 크기',
            resize75: '75% 크기',
            resize50: '50% 크기',
            resize25: '25% 크기',
            mirrorHorizontal: '좌우 반전',
            mirrorVertical: '상하 반전',
            rotateLeft: '왼쪽으로 회전',
            rotateRight: '오른쪽으로 회전'
        }
    };

    if (typeof noGlobal === typeof undefined) {
        if (!window.SUNEDITOR_LANG) {
            window.SUNEDITOR_LANG = {};
        }

        window.SUNEDITOR_LANG.ko = lang;
    }

    return lang;
}));