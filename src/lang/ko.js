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
            function (w) {
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
        code: 'ko',
        toolbar: {
            default: '기본값',
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
            hiliteColor: '배경색',
            indent: '들여쓰기',
            outdent: '내어쓰기',
            align: '정렬',
            alignLeft: '왼쪽 정렬',
            alignRight: '오른쪽 정렬',
            alignCenter: '가운데 정렬',
            alignJustify: '양쪽 정렬',
            list: '리스트',
            orderList: '숫자형 리스트',
            unorderList: '원형 리스트',
            horizontalRule: '가로 줄 삽입',
            hr_solid: '실선',
            hr_dotted: '점선',
            hr_dashed: '대시',
            table: '테이블',
            link: '링크',
            math: '수식',
            image: '이미지',
            video: '동영상',
            audio: '오디오',
            fullScreen: '전체 화면',
            showBlocks: '블록 보기',
            codeView: 'HTML 편집',
            undo: '실행 취소',
            redo: '다시 실행',
            preview: '미리보기',
            print: '인쇄',
            tag_p: '본문',
            tag_div: '기본 (DIV)',
            tag_h: '제목',
            tag_blockquote: '인용문',
            tag_pre: '코드',
            template: '템플릿',
            lineHeight: '줄 높이',
            paragraphStyle: '문단 스타일',
            textStyle: '글자 스타일',
            imageGallery: '이미지 갤러리',
            dir_ltr: '왼쪽에서 오른쪽',
            dir_rtl: '오른쪽에서 왼쪽',
            mention: '멘션'
        },
        dialogBox: {
            linkBox: {
                title: '링크 삽입',
                url: '인터넷 주소',
                text: '화면 텍스트',
                newWindowCheck: '새창으로 열기',
                downloadLinkCheck: '다운로드 링크',
                bookmark: '북마크'
            },
            mathBox: {
                title: '수식',
                inputLabel: '수학적 표기법',
                fontSizeLabel: '글자 크기',
                previewLabel: '미리보기'
            },
            imageBox: {
                title: '이미지 삽입',
                file: '파일 선택',
                url: '이미지 주소',
                altText: '대체 문자열'
            },
            videoBox: {
                title: '동영상 삽입',
                file: '파일 선택',
                url: '미디어 임베드 주소, 유튜브/비메오'
            },
            audioBox: {
                title: '오디오 삽입',
                file: '파일 선택',
                url: '오디오 파일 주소'
            },
            browser: {
                tags: '태그',
                search: '검색',
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
            height: '세로',
            size: '크기',
            ratio: '비율'
        },
        controller: {
            edit: '편집',
            unlink: '링크 해제',
            remove: '삭제',
            insertRowAbove: '위에 행 삽입',
            insertRowBelow: '아래에 행 삽입',
            deleteRow: '행 삭제',
            insertColumnBefore: '왼쪽에 열 삽입',
            insertColumnAfter: '오른쪽에 열 삽입',
            deleteColumn: '열 삭제',
            fixedColumnWidth: '고정 된 열 너비',
            resize100: '100% 크기',
            resize75: '75% 크기',
            resize50: '50% 크기',
            resize25: '25% 크기',
            autoSize: '자동 크기',
            mirrorHorizontal: '좌우 반전',
            mirrorVertical: '상하 반전',
            rotateLeft: '왼쪽으로 회전',
            rotateRight: '오른쪽으로 회전',
            maxSize: '최대화',
            minSize: '최소화',
            tableHeader: '테이블 제목',
            mergeCells: '셀 병합',
            splitCells: '셀 분할',
            HorizontalSplit: '가로 분할',
            VerticalSplit: '세로 분할'
        },
        menu: {
            spaced: '글자 간격',
            bordered: '경계선',
            neon: '네온',
            translucent: '반투명',
            shadow: '그림자',
            code: '코드'
        }
    };

    if (typeof noGlobal === typeof undefined) {
        if (!window.SUNEDITOR_LANG) {
            Object.defineProperty(window, 'SUNEDITOR_LANG', {
                enumerable: true,
                writable: false,
                configurable: false,
                value: {}
            });
        }

        Object.defineProperty(window.SUNEDITOR_LANG, 'ko', {
            enumerable: true,
            writable: true,
            configurable: true,
            value: lang
        });
    }

    return lang;
}));