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
        code: 'ur',
        toolbar: {
            default: 'طے شدہ',
            save: 'محفوظ کریں',
            font: 'فونٹ',
            formats: 'فارمیٹس',
            fontSize: 'سائز',
            bold: 'بولڈ',
            underline: 'انڈر لائن',
            italic: 'ترچھا',
            strike: 'لکیرہ کردہ',
            subscript: 'ذیلی',
            superscript: 'انتہائی',
            removeFormat: 'فارمیٹ کو حذف دیں',
            fontColor: 'لکھائی کا رنگ',
            hiliteColor: 'نمایاں رنگ',
            indent: 'حاشیہ',
            outdent: 'ہاشیہ واپس',
            align: 'رخ',
            alignLeft: 'بائیں طرف',
            alignRight: 'دائیں طرف',
            alignCenter: 'مرکز میں طرف',
            alignJustify: 'ہر طرف برابر',
            list: 'فہرست',
            orderList: 'ترتیب شدہ فہرست',
            unorderList: 'غیر ترتیب شدہ فہرست',
            horizontalRule: 'لکیر',
            hr_solid: 'ٹھوس',
            hr_dotted: 'نقطے دار',
            hr_dashed: 'ڈیشڈ',
            table: 'میز',
            link: 'لنک',
            math: 'ریاضی',
            image: 'تصویر',
            video: 'ویڈیو',
            audio: 'آواز',
            fullScreen: 'پوری اسکرین',
            showBlocks: 'ڈبے دکھائیں',
            codeView: 'کوڈ کا نظارہ',
            undo: 'واپس کریں',
            redo: 'دوبارہ کریں',
            preview: 'پیشنظر',
            print: 'پرنٹ کریں',
            tag_p: 'پیراگراف',
            tag_div: 'عام (div)',
            tag_h: 'ہیڈر',
            tag_blockquote: 'اقتباس',
            tag_pre: 'کوڈ',
            template: 'سانچہ',
            lineHeight: 'لکیر کی اونچائی',
            paragraphStyle: 'عبارت کا انداز',
            textStyle: 'متن کا انداز',
            imageGallery: 'تصویری نگارخانہ',
            dir_ltr: 'بائیں سے دائیں',
            dir_rtl: 'دائیں سے بائیں',
            mention: 'تذکرہ'
        },
        dialogBox: {
            linkBox: {
                title: 'لنک داخل کریں',
                url: 'لنک کرنے کے لیے URL',
                text: 'ظاہر کرنے کے لیے متن',
                newWindowCheck: 'نئی ونڈو میں کھولیں',
                downloadLinkCheck: 'ڈاؤن لوڈ لنک',
                bookmark: 'بک مارک'
            },
            mathBox: {
                title: 'ریاضی',
                inputLabel: 'ریاضیاتی اشارے',
                fontSizeLabel: 'حرف کا سائز',
                previewLabel: 'پیش نظارہ'
            },
            imageBox: {
                title: 'تصویر داخل کریں',
                file: 'فائلوں سے منتخب کریں',
                url: 'تصویری URL',
                altText: 'متبادل متن'
            },
            videoBox: {
                title: 'ویڈیو داخل کریں',
                file: 'فائلوں سے منتخب کریں',
                url: 'ذرائع ابلاغ کا یو آر ایل، یوٹیوب/ویمیو'
            },
            audioBox: {
                title: 'آواز داخل کریں',
                file: 'فائلوں سے منتخب کریں',
                url: 'آواز URL'
            },
            browser: {
                tags: 'ٹیگز',
                search: 'تلاش کریں',
            },
            caption: 'عنوان',
            close: 'بند کریں',
            submitButton: 'بھیجیں',
            revertButton: 'واپس',
            proportion: 'تناسب کو محدود کریں',
            basic: 'بنیادی',
            left: 'بائیں',
            right: 'دائیں',
            center: 'مرکز',
            width: 'چوڑائی',
            height: 'اونچائی',
            size: 'حجم',
            ratio: 'تناسب'
        },
        controller: {
            edit: 'ترمیم',
            unlink: 'لنک ختم کریں',
            remove: 'حذف',
            insertRowAbove: 'اوپر قطار شامل کریں',
            insertRowBelow: 'نیچے قطار شامل کریں',
            deleteRow: 'قطار کو حذف کریں',
            insertColumnBefore: 'پہلے ستون شامل کریں',
            insertColumnAfter: 'اس کے بعد ستون شامل کریں',
            deleteColumn: 'ستون حذف کریں',
            fixedColumnWidth: 'مقررہ ستون کی چوڑائی',
            resize100: '100% کا حجم تبدیل کریں',
            resize75: '75% کا حجم تبدیل کریں',
            resize50: '50% کا حجم تبدیل کریں',
            resize25: '25% کا حجم تبدیل کریں',
            autoSize: 'ازخود حجم',
            mirrorHorizontal: 'آئینہ، افقی',
            mirrorVertical: 'آئینہ، عمودی',
            rotateLeft: 'بائیں گھومو',
            rotateRight: 'دائیں گھمائیں',
            maxSize: 'زیادہ سے زیادہ سائز',
            minSize: 'کم از کم سائز',
            tableHeader: 'میز کی سرخی',
            mergeCells: 'حجروں کو ضم کریں',
            splitCells: 'حجروں کو علیدہ کرو',
            HorizontalSplit: 'افقی تقسیم',
            VerticalSplit: 'عمودی تقسیم'
        },
        menu: {
            spaced: 'فاصلہ',
            bordered: 'سرحدی',
            neon: 'نیین',
            translucent: 'پارباسی',
            shadow: 'سایہ',
            code: 'کوڈ'
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

        Object.defineProperty(window.SUNEDITOR_LANG, 'ur', {
            enumerable: true,
            writable: true,
            configurable: true,
            value: lang
        });
    }

    return lang;
}));