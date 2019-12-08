/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2019 JiHong Lee.
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
        toolbar: {
            default: 'デフォルト',
            save: '保存',
            font: 'フォント',
            formats: '段落形式',
            fontSize: 'サイズ',
            bold: '太字',
            underline: '下線',
            italic: 'イタリック',
            strike: '取り消し線',
            subscript: '下付き',
            superscript: '上付き',
            removeFormat: '形式を削除',
            fontColor: '文字色',
            hiliteColor: '文字の背景色',
            indent: 'インデント',
            outdent: 'インデント',
            align: 'ソート',
            alignLeft: '左揃え',
            alignRight: '右揃え',
            alignCenter: '中央揃え',
            alignJustify: '両端揃え',
            list: 'リスト',
            orderList: '数値ブリット',
            unorderList: '円形ブリット',
            horizontalRule: '水平線を挿入',
            hr_solid: '実線',
            hr_dotted: '点線',
            hr_dashed: 'ダッシュ',
            table: 'テーブル',
            link: 'リンク',
            image: '画像',
            video: '動画',
            fullScreen: 'フルスクリーン',
            showBlocks: 'ブロック表示',
            codeView: 'HTMLの編集',
            undo: '元に戻す',
            redo: '再実行',
            preview: 'プレビュー',
            print: '印刷',
            tag_p: '本文',
            tag_div: '基本（DIV）',
            tag_h: 'タイトル',
            tag_blockquote: '引用',
            tag_pre: 'コード',
            template: 'テンプレート',
            lineHeight: '行の高さ',
            paragraphStyle: '段落スタイル',
            textStyle: 'テキストスタイル'
        },
        dialogBox: {
            linkBox: {
                title: 'リンクの挿入',
                url: 'インターネットアドレス',
                text: '画面のテキスト',
                newWindowCheck: '別ウィンドウで開く'
            },
            imageBox: {
                title: '画像の挿入',
                file: 'ファイルの選択',
                url: 'イメージアドレス',
                altText: '置換文字列'
            },
            videoBox: {
                title: '動画を挿入',
                url: 'メディア埋め込まアドレス,YouTube'
            },
            caption: '説明付け',
            close: '閉じる',
            submitButton: '確認',
            revertButton: '元に戻す',
            proportion: 'の割合カスタマイズ',
            basic: '基本',
            left: '左',
            right: '右',
            center: '中央',
            width: '横',
            height: '縦',
            size: 'サイズ',
            ratio: '比率'
        },
        controller: {
            edit: '編集',
            unlink: 'リンク解除',
            remove: '削除',
            insertRowAbove: '上に行を挿入',
            insertRowBelow: '下に行を挿入',
            deleteRow: '行の削除',
            insertColumnBefore: '左に列を挿入',
            insertColumnAfter: '右に列を挿入',
            deleteColumn: '列を削除する',
            resize100: '100％ サイズ',
            resize75: '75％ サイズ',
            resize50: '50％ サイズ',
            resize25: '25％ サイズ',
            autoSize: '自動サイズ',
            mirrorHorizontal: '左右反転',
            mirrorVertical: '上下反転',
            rotateLeft: '左に回転',
            rotateRight: '右に回転',
            maxSize: '最大サイズ',
            minSize: '最小サイズ',
            tableHeader: '表のヘッダー',
            mergeCells: 'セルの結合',
            splitCells: 'セルを分割',
            HorizontalSplit: '横分割',
            VerticalSplit: '垂直分割'
        },
        menu: {
            spaced: '文字間隔',
            bordered: '境界線',
            neon: 'ネオン',
            translucent: '半透明',
            shadow: '影'
        }
    };

    if (typeof noGlobal === typeof undefined) {
        if (!window.SUNEDITOR_LANG) {
            window.SUNEDITOR_LANG = {};
        }

        window.SUNEDITOR_LANG.ja = lang;
    }

    return lang;
}));