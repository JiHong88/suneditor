/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * 
 * Swedish translation by olehrb at github or gmail
 *
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
        code: 'se',
        toolbar: {
            default: 'Default',
            save: 'Spara',
            font: 'Typsnitt',
            formats: 'Format',
            fontSize: 'Textstorlek',
            bold: 'Fet',
            underline: 'Understruket',
            italic: 'Kursiv',
            strike: 'Överstruket',
            subscript: 'Sänkt skrift',
            superscript: 'Höjd skrift',
            removeFormat: 'Ta bort formattering',
            fontColor: 'Textfärg',
            hiliteColor: 'Bakgrundsfärg',
            indent: 'Minska indrag',
            outdent: 'Öka indrag',
            align: 'Justering',
            alignLeft: 'Vänsterjustering',
            alignRight: 'Högerjustering',
            alignCenter: 'Mittenjusteirng',
            alignJustify: 'Justera indrag',
            list: 'Listor',
            orderList: 'Numrerad lista',
            unorderList: 'Oordnad lista',
            horizontalRule: 'Horisontell linje',
            hr_solid: 'Solid',
            hr_dotted: 'Punkter',
            hr_dashed: 'Prickad',
            table: 'Tabell',
            link: 'Länk',
            math: 'Math',
            image: 'Bild',
            video: 'Video',
            audio: 'Ljud',
            fullScreen: 'Helskärm',
            showBlocks: 'Visa block',
            codeView: 'Visa koder',
            undo: 'Ångra',
            redo: 'Gör om',
            preview: 'Preview',
            print: 'Print',
            tag_p: 'Paragraf',
            tag_div: 'Normal (DIV)',
            tag_h: 'Rubrik',
            tag_blockquote: 'Citer',
            tag_pre: 'Kod',
            template: 'Mall',
            lineHeight: 'Linjehöjd',
            paragraphStyle: 'Stil på stycke',
            textStyle: 'Textstil',
            imageGallery: 'Bildgalleri',
            mention: 'Namn'
        },
        dialogBox: {
            linkBox: {
                title: 'Lägg till länk',
                url: 'URL till länk',
                text: 'Länktext',
                newWindowCheck: 'Öppna i nytt fönster',
                downloadLinkCheck: 'Nedladdningslänk',
                bookmark: 'Bokmärke'
            },
            mathBox: {
                title: 'Math',
                inputLabel: 'Matematisk notation',
                fontSizeLabel: 'Textstorlek',
                previewLabel: 'Preview'
            },
            imageBox: {
                title: 'Lägg till bild',
                file: 'Lägg till från fil',
                url: 'Lägg till från URL',
                altText: 'Alternativ text'
            },
            videoBox: {
                title: 'Lägg till video',
                file: 'Lägg till från fil',
                url: 'Bädda in video / YouTube,Vimeo'
            },
            audioBox: {
                title: 'Lägg till ljud',
                file: 'Lägg till från fil',
                url: 'Lägg till från URL'
            },
            browser: {
                tags: 'Tags',
                search: 'Sök',
            },
            caption: 'Lägg till beskrivning',
            close: 'Stäng',
            submitButton: 'Skicka',
            revertButton: 'Återgå',
            proportion: 'Spara proportioner',
            basic: 'Basic',
            left: 'Vänster',
            right: 'Höger',
            center: 'Center',
            width: 'Bredd',
            height: 'Höjd',
            size: 'Storlek',
            ratio: 'Förhållande'
        },
        controller: {
            edit: 'Redigera',
            unlink: 'Ta bort länk',
            remove: 'Ta bort',
            insertRowAbove: 'Lägg till rad över',
            insertRowBelow: 'Lägg till rad under',
            deleteRow: 'Ta bort rad',
            insertColumnBefore: 'Lägg till kolumn före',
            insertColumnAfter: 'Lägg till kolumn efter',
            deleteColumn: 'Ta bort kolumner',
            fixedColumnWidth: 'Fast kolumnbredd',
            resize100: 'Förstora 100%',
            resize75: 'Förstora 75%',
            resize50: 'Förstora 50%',
            resize25: 'Förstora 25%',
            autoSize: 'Autostorlek',
            mirrorHorizontal: 'Spegling, horisontell',
            mirrorVertical: 'Spegling, vertikal',
            rotateLeft: 'Rotera till vänster',
            rotateRight: 'Rotera till höger',
            maxSize: 'Maxstorlek',
            minSize: 'Minsta storlek',
            tableHeader: 'Rubrik tabell',
            mergeCells: 'Sammanfoga celler (merge)',
            splitCells: 'Separera celler',
            HorizontalSplit: 'Separera horisontalt',
            VerticalSplit: 'Separera vertikalt'
        },
        menu: {
            spaced: 'Avstånd',
            bordered: 'Avgränsningslinje',
            neon: 'Neon',
            translucent: 'Genomskinlig',
            shadow: 'Skugga',
            code: 'Kod'
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

        Object.defineProperty(window.SUNEDITOR_LANG, 'se', {
            enumerable: true,
            writable: true,
            configurable: true,
            value: lang
        });
    }

    return lang;
}));
