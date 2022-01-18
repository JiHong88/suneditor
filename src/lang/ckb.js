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
        code: 'ckb',
        toolbar: {
            default: 'بنه‌ڕه‌ت',
            save: 'پاشه‌كه‌وتكردن',
            font: 'فۆنت',
            formats: 'Formats',
            fontSize: 'قه‌باره‌',
            bold: 'تۆخكردن',
            underline: 'هێڵ به‌ژێردا بێنه‌',
            italic: 'لار',
            strike: 'هێڵ به‌ناودا بێنه‌',
            subscript: 'ژێرسکریپت',
            superscript: 'سەرنووس',
            removeFormat: 'لابردنی فۆرمات',
            fontColor: 'ره‌نگی فۆنت',
            hiliteColor: 'ره‌نگی دیاركراو',
            indent: 'بۆشایی بەجێهێشتن',
            outdent: 'لابردنی بۆشایی',
            align: 'ئاراسته‌',
            alignLeft: 'لای چه‌پ',
            alignRight: 'لای راست',
            alignCenter: 'ناوه‌ند',
            alignJustify: 'به‌رێكی دابه‌ش بكه‌',
            list: 'لیست',
            orderList: 'لیستی ریزكراو',
            unorderList: 'لیستی ریزنه‌كراو',
            horizontalRule: 'هێڵی ئاسۆیی',
            hr_solid: 'پته‌و',
            hr_dotted: 'نوكته‌ نوكته‌',
            hr_dashed: 'داش داش',
            table: 'خشته‌',
            link: 'به‌سته‌ر',
            math: 'بیركاری',
            image: 'وێنه‌',
            video: 'ڤیدیۆ',
            audio: 'ده‌نگ',
            fullScreen: 'پڕ به‌ شاشه‌',
            showBlocks: 'بڵۆك نیشانبده',
            codeView: 'بینینی كۆده‌كان',
            undo: 'وەک خۆی لێ بکەوە',
            redo: 'هەڵگەڕاندنەوە',
            preview: 'پێشبینین',
            print: 'پرینت',
            tag_p: 'په‌ره‌گراف',
            tag_div: 'ی ئاسایی (DIV)',
            tag_h: 'سەرپەڕە',
            tag_blockquote: 'ده‌ق',
            tag_pre: 'كۆد',
            template: 'قاڵب',
            lineHeight: 'بڵندی دێر',
            paragraphStyle: 'ستایلی په‌ره‌گراف',
            textStyle: 'ستایلی نوسین',
            imageGallery: 'گاله‌ری وێنه‌كان',
            dir_ltr: 'من اليسار إلى اليمين',
            dir_rtl: 'من اليمين الى اليسار',
            mention: 'تنويه ب'
        },
        dialogBox: {
            linkBox: {
                title: 'به‌سته‌ر دابنێ',
                url: 'به‌سته‌ر',
                text: 'تێكستی به‌سته‌ر',
                newWindowCheck: 'له‌ په‌نجه‌ره‌یه‌كی نوێ بكه‌ره‌وه‌',
                downloadLinkCheck: 'رابط التحميل',
                bookmark: 'المرجعية'
            },
            mathBox: {
                title: 'بیركاری',
                inputLabel: 'نیشانه‌كانی بیركاری',
                fontSizeLabel: 'قه‌باره‌ی فۆنت',
                previewLabel: 'پێشبینین'
            },
            imageBox: {
                title: 'وێنه‌یه‌ك دابنێ',
                file: 'فایلێك هه‌ڵبژێره‌',
                url: 'به‌سته‌ری وێنه‌',
                altText: 'نوسینی جێگره‌وه‌'
            },
            videoBox: {
                title: 'ڤیدیۆیه‌ك دابنێ',
                file: 'فایلێك هه‌ڵبژێره‌',
                url: 'YouTube/Vimeo به‌سته‌ری له‌ناودانان وه‌ك '
            },
            audioBox: {
                title: 'ده‌نگێك دابنێ',
                file: 'فایلێك هه‌ڵبژێره‌',
                url: 'به‌سته‌ری ده‌نگ'
            },
            browser: {
                tags: 'تاگه‌كان',
                search: 'گه‌ران',
            },
            caption: 'پێناسه‌یه‌ك دابنێ',
            close: 'داخستن',
            submitButton: 'ناردن',
            revertButton: 'بیگەڕێنەوە سەر باری سەرەتایی',
            proportion: 'رێژه‌كان وه‌ك خۆی بهێڵه‌وه‌',
            basic: 'سه‌ره‌تایی',
            left: 'چه‌پ',
            right: 'راست',
            center: 'ناوەڕاست',
            width: 'پانی',
            height: 'به‌رزی',
            size: 'قه‌باره‌',
            ratio: 'رێژه‌'
        },
        controller: {
            edit: 'دەسکاریکردن',
            unlink: 'سڕینەوەی بەستەر',
            remove: 'سڕینه‌وه‌',
            insertRowAbove: 'ریزك له‌ سه‌ره‌وه‌ زیادبكه‌',
            insertRowBelow: 'ریزێك له‌ خواره‌وه‌ زیادبكه‌',
            deleteRow: 'ریز بسره‌وه‌',
            insertColumnBefore: 'ستونێك له‌ پێشه‌وه‌ زیادبكه‌',
            insertColumnAfter: 'ستونێك له‌ دواوه‌ زیادبكه‌',
            deleteColumn: 'ستونێك بسره‌وه‌',
            fixedColumnWidth: 'پانی ستون نه‌گۆربكه‌',
            resize100: 'قه‌باره‌ بگۆره‌ بۆ ١٠٠%',
            resize75: 'قه‌باره‌ بگۆره‌ بۆ ٧٥%',
            resize50: 'قه‌باره‌ بگۆره‌ بۆ ٥٠%',
            resize25: 'قه‌باره‌ بگۆره‌ بۆ ٢٥%',
            autoSize: 'قه‌باره‌ی خۆكارانه‌',
            mirrorHorizontal: 'هه‌ڵگه‌رێنه‌وه‌ به‌ده‌وری ته‌وه‌ره‌ی ئاسۆیی',
            mirrorVertical: 'هه‌ڵگه‌رێنه‌وه‌ به‌ده‌وری ته‌وه‌ره‌ی ستونی',
            rotateLeft: 'بسوڕێنه‌ به‌لای چه‌پدا',
            rotateRight: 'بسورێنه‌ به‌لای راستدا',
            maxSize: 'گه‌وره‌ترین قه‌باره‌',
            minSize: 'بچوكترین قه‌باره‌',
            tableHeader: 'سه‌ردێری خشته‌ك',
            mergeCells: 'خانه‌كان تێكه‌ڵبكه‌',
            splitCells: 'خانه‌كان لێك جیابكه‌وه‌',
            HorizontalSplit: 'جیاكردنه‌وه‌ی ئاسۆیی',
            VerticalSplit: 'جیاكردنه‌وه‌ی ستونی'
        },
        menu: {
            spaced: 'بۆشای هه‌بێت',
            bordered: 'لێواری هه‌بێت',
            neon: 'نیۆن',
            translucent: 'كه‌مێك وه‌ك شووشه‌',
            shadow: 'سێبه‌ر',
            code: 'كۆد'
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

        Object.defineProperty(window.SUNEDITOR_LANG, 'ckb', {
            enumerable: true,
            writable: true,
            configurable: true,
            value: lang
        });
    }

    return lang;
}));