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
        code: 'he',
        toolbar: {
            default: 'ברירת מחדל',
            save: 'שמור',
            font: 'גופן',
            formats: 'עיצוב',
            fontSize: 'גודל',
            bold: 'מודגש',
            underline: 'קו תחתון',
            italic: 'נטוי',
            strike: 'קו חוצה',
            subscript: 'עילי',
            superscript: 'תחתי',
            removeFormat: 'הסר עיצוב',
            fontColor: 'צבע גופן',
            hiliteColor: 'צבע קו תחתון',
            indent: 'הגדל כניסה',
            outdent: 'הקטן כניסה',
            align: 'יישור',
            alignLeft: 'יישר לשמאל',
            alignRight: 'יישר לימין',
            alignCenter: 'מרכז',
            alignJustify: 'יישר לשני הצדדים',
            list: 'רשימה',
            orderList: 'מספור',
            unorderList: 'תבליטים',
            horizontalRule: 'קו אופקי',
            hr_solid: 'קו',
            hr_dotted: 'נקודות',
            hr_dashed: 'מקפים',
            table: 'טבלה',
            link: 'קישור',
            math: 'מתמטיקה',
            image: 'תמונה',
            video: 'חוזי',
            audio: 'שמע',
            fullScreen: 'מסך מלא',
            showBlocks: 'הצג גושים',
            codeView: 'הצג קוד',
            undo: 'בטל',
            redo: 'חזור',
            preview: 'תצוגה מקדימה',
            print: 'הדפס',
            tag_p: 'פסקה',
            tag_div: 'רגילה (DIV)',
            tag_h: 'כותרת',
            tag_blockquote: 'ציטוט',
            tag_pre: 'קוד',
            template: 'תבנית',
            lineHeight: 'גובה השורה',
            paragraphStyle: 'סגנון פסקה',
            textStyle: 'סגנון גופן',
            imageGallery: 'גלרית תמונות',
            dir_ltr: 'משמאל לימין',
            dir_rtl: 'מימין לשמאל',
            mention: 'הזכר'
        },
        dialogBox: {
            linkBox: {
                title: 'הכנס קשור',
                url: 'כתובת קשור',
                text: 'תיאור',
                newWindowCheck: 'פתח בחלון חדש',
                downloadLinkCheck: 'קישור להורדה',
                bookmark: 'סמניה'
            },
            mathBox: {
                title: 'נוסחה',
                inputLabel: 'סימנים מתמטים',
                fontSizeLabel: 'גודל גופן',
                previewLabel: 'תצוגה מקדימה'
            },
            imageBox: {
                title: 'הכנס תמונה',
                file: 'בחר מקובץ',
                url: 'כתובת URL תמונה',
                altText: 'תיאור (תגית alt)'
            },
            videoBox: {
                title: 'הכנס סרטון',
                file: 'בחר מקובץ',
                url: 'כתובת הטמעה YouTube/Vimeo'
            },
            audioBox: {
                title: 'הכנס שמע',
                file: 'בחר מקובץ',
                url: 'כתובת URL שמע'
            },
            browser: {
                tags: 'תג',
                search: 'חפש',
            },
            caption: 'הכנס תיאור',
            close: 'סגור',
            submitButton: 'שלח',
            revertButton: 'בטל',
            proportion: 'שמר יחס',
            basic: 'בסיסי',
            left: 'שמאל',
            right: 'ימין',
            center: 'מרכז',
            width: 'רוחב',
            height: 'גובה',
            size: 'גודל',
            ratio: 'יחס'
        },
        controller: {
            edit: 'ערוך',
            unlink: 'הסר קישורים',
            remove: 'הסר',
            insertRowAbove: 'הכנס שורה מעל',
            insertRowBelow: 'הכנס שורה מתחת',
            deleteRow: 'מחק שורה',
            insertColumnBefore: 'הכנס עמודה לפני',
            insertColumnAfter: 'הכנס עמודה אחרי',
            deleteColumn: 'מחק עמודה',
            fixedColumnWidth: 'קבע רוחב עמודות',
            resize100: 'ללא הקטנה',
            resize75: 'הקטן 75%',
            resize50: 'הקטן 50%',
            resize25: 'הקטן 25%',
            autoSize: 'הקטן אוטומטית',
            mirrorHorizontal: 'הפוך לרוחב',
            mirrorVertical: 'הפוך לגובה',
            rotateLeft: 'סובב שמאלה',
            rotateRight: 'סובב ימינה',
            maxSize: 'גודל מרבי',
            minSize: 'גודל מזערי',
            tableHeader: 'כותרת טבלה',
            mergeCells: 'מזג תאים',
            splitCells: 'פצל תא',
            HorizontalSplit: 'פצל לגובה',
            VerticalSplit: 'פצל לרוחב'
        },
        menu: {
            spaced: 'מרווח',
            bordered: 'בעל מיתאר',
            neon: 'זוהר',
            translucent: 'שקוף למחצה',
            shadow: 'צל',
            code: 'קוד'
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

        Object.defineProperty(window.SUNEDITOR_LANG, 'he', {
            enumerable: true,
            writable: true,
            configurable: true,
            value: lang
        });
    }

    return lang;
}));
