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
        code: 'fa',
        toolbar: {
            default: 'پیش فرض',
            save: 'ذخیره',
            font: 'فونت',
            formats: 'قالب‌ها',
            fontSize: 'اندازه‌ی فونت',
            bold: 'پررنگ کردن',
            underline: 'زیرخطدار کردن',
            italic: 'کج کردن',
            strike: 'خط میان‌دار کردن',
            subscript: 'نوشتن به صورت زیر متن',
            superscript: 'نوشتن به صورت بالای متن',
            removeFormat: 'حذف قالب',
            fontColor: 'رنگ پیش زمینه',
            hiliteColor: 'رنگ پس‌زمینه',
            indent: 'جلو بردن',
            outdent: 'عقب بردن',
            align: 'چیدمان',
            alignLeft: 'چپ‌چین',
            alignRight: 'راست‌چین',
            alignCenter: 'وسط‌چین',
            alignJustify: 'همتراز از هر دو سمت',
            list: 'لیست',
            orderList: 'لیست شمارشی',
            unorderList: 'لیست گلوله‌ای',
            horizontalRule: 'درج خط افقی',
            hr_solid: 'تو پر',
            hr_dotted: 'نقطه‌چین',
            hr_dashed: 'خط تیره',
            table: 'درج جدول',
            link: 'درج لینک',
            math: 'درج فرمول ریاضی',
            image: 'درج تصویر',
            video: 'درج ویدئو',
            audio: 'درج صوت',
            fullScreen: 'تمام صفحه',
            showBlocks: 'نمایش بلاک‌بندی',
            codeView: 'مشاهده‌ی کُد HTML',
            undo: 'برگرداندن تغییر',
            redo: 'تکرار تغییر',
            preview: 'پیش نمایش',
            print: 'چاپ',
            tag_p: 'پاراگراف',
            tag_div: 'عادی (DIV)',
            tag_h: 'هدر',
            tag_blockquote: 'نقل قول',
            tag_pre: 'کُد',
            template: 'درج محتوا بر اساس الگو',
            lineHeight: 'ارتفاع خط',
            paragraphStyle: 'استایل پاراگراف',
            textStyle: 'استایل متن',
            imageGallery: 'گالری تصاویر',
            dir_ltr: 'چپ به راست',
            dir_rtl: 'راست به چپ',
            mention: 'ذکر کردن'
        },
        dialogBox: {
            linkBox: {
                title: 'درج  لینک',
                url: 'آدرس لینک',
                text: 'عنوان لینک',
                newWindowCheck: 'در پنجره‌ی جدیدی باز شود',
                downloadLinkCheck: 'لینک دانلود',
                bookmark: 'نشان'
            },
            mathBox: {
                title: 'فرمول ریاضی',
                inputLabel: 'تعریف فرمول',
                fontSizeLabel: 'اندازه‌ی فونت',
                previewLabel: 'پیش نمایش'
            },
            imageBox: {
                title: 'درج تصویر',
                file: 'انتخاب فایل',
                url: 'آدرس Url',
                altText: 'متن جایگزین'
            },
            videoBox: {
                title: 'درج ویدئو',
                file: 'انتخاب فایل',
                url: 'آدرس Url ویدئو, YouTube/Vimeo'
            },
            audioBox: {
                title: 'درج صوت',
                file: 'انتخاب فایل',
                url: 'آدرس Url'
            },
            browser: {
                tags: 'تگ‌ها',
                search: 'جستجو',
            },
            caption: 'توضیح',
            close: 'بستن',
            submitButton: 'درج',
            revertButton: 'برگرداندن تغییرات',
            proportion: 'محدودیت اندازه',
            basic: 'چیدمان پیش فرض',
            left: 'چپ',
            right: 'راست',
            center: 'وسط',
            width: 'پهنا',
            height: 'ارتفاع',
            size: 'اندازه',
            ratio: 'نسبت'
        },
        controller: {
            edit: 'ویرایش',
            unlink: 'حذف لینک',
            remove: 'حذف',
            insertRowAbove: 'درج سطر در بالا',
            insertRowBelow: 'درج سطر در پایین',
            deleteRow: 'حذف سطر',
            insertColumnBefore: 'درج یک ستون به عقب',
            insertColumnAfter: 'درج یک ستون در جلو',
            deleteColumn: 'حذف ستون',
            fixedColumnWidth: 'اندازه ستون ثابت',
            resize100: 'اندازه‌ی 100%',
            resize75: 'اندازه‌ی 75%',
            resize50: 'اندازه‌ی 50%',
            resize25: 'اندازه‌ی 25%',
            autoSize: 'اندازه‌ی خودکار',
            mirrorHorizontal: 'بر عکس کردن در جهت افقی',
            mirrorVertical: 'بر عکس کردن در جهت عمودی',
            rotateLeft: 'دوران به چپ',
            rotateRight: 'دوران به راست',
            maxSize: 'حداکثر اندازه',
            minSize: 'حداقل اندازه',
            tableHeader: 'هدر جدول',
            mergeCells: 'ادغام خانه‌ها',
            splitCells: 'تقسیم خانه به چند خانه',
            HorizontalSplit: 'تقسیم در جهت افقی',
            VerticalSplit: 'تقسیم در جهت عمودی'
        },
        menu: {
            spaced: 'فضادار',
            bordered: 'لبه‌دار',
            neon: 'نئونی',
            translucent: 'نیمه شفاف',
            shadow: 'سایه',
            code: 'کُد'
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

        Object.defineProperty(window.SUNEDITOR_LANG, 'fa', {
            enumerable: true,
            writable: true,
            configurable: true,
            value: lang
        });
    }

    return lang;
}));