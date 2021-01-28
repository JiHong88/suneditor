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
        code: 'lv',
        toolbar: {
            default: 'Noklusējuma',
            save: 'Saglabāt',
            font: 'Fonts',
            formats: 'Formāti',
            fontSize: 'Fonta lielums',
            bold: 'Treknraksts',
            underline: 'Pasvītrot',
            italic: 'Slīpraksts',
            strike: 'Pārsvītrojums',
            subscript: 'Apakšraksts',
            superscript: 'Augšraksts',
            removeFormat: 'Noņemt formātu',
            fontColor: 'Fonta krāsa',
            hiliteColor: 'Teksta iezīmēšanas krāsa',
            indent: 'Palielināt atkāpi',
            outdent: 'Samazināt atkāpi',
            align: 'Izlīdzināt',
            alignLeft: 'Līdzināt pa kreisi',
            alignRight: 'Līdzināt pa labi',
            alignCenter: 'Centrēt',
            alignJustify: 'Taisnot',
            list: 'Saraksts',
            orderList: 'Numerācija',
            unorderList: 'Aizzimes',
            horizontalRule: 'Horizontāla līnija',
            hr_solid: 'Ciets',
            hr_dotted: 'Punktiņš',
            hr_dashed: 'Braša',
            table: 'Tabula',
            link: 'Saite',
            math: 'Matemātika',
            image: 'Attēls',
            video: 'Video',
            audio: 'Audio',
            fullScreen: 'Pilnekrāna režīms',
            showBlocks: 'Parādit blokus',
            codeView: 'Koda skats',
            undo: 'Atsaukt',
            redo: 'Atkārtot',
            preview: 'Priekšskatījums',
            print: 'Drukāt',
            tag_p: 'Paragrāfs',
            tag_div: 'Normāli (DIV)',
            tag_h: 'Galvene',
            tag_blockquote: 'Citāts',
            tag_pre: 'Kods',
            template: 'Veidne',
            lineHeight: 'Līnijas augstums',
            paragraphStyle: 'Paragrāfa stils',
            textStyle: 'Teksta stils',
            imageGallery: 'Attēlu galerija',
            mention: 'Pieminēt'
        },
        dialogBox: {
            linkBox: {
                title: 'Ievietot saiti',
                url: 'Saites URL',
                text: 'Parādāmais teksts',
                newWindowCheck: 'Atvērt jaunā logā',
                downloadLinkCheck: 'Lejupielādes saite',
                bookmark: 'Grāmatzīme'
            },
            mathBox: {
                title: 'Matemātika',
                inputLabel: 'Matemātiskā notācija',
                fontSizeLabel: 'Fonta lielums',
                previewLabel: 'Priekšskatījums'
            },
            imageBox: {
                title: 'Ievietot attēlu',
                file: 'Izvēlieties no failiem',
                url: 'Attēla URL',
                altText: 'Alternatīvs teksts'
            },
            videoBox: {
                title: 'Ievietot video',
                file: 'Izvēlieties no failiem',
                url: 'Multivides iegulšanas URL, YouTube/Vimeo'
            },
            audioBox: {
                title: 'Ievietot audio',
                file: 'Izvēlieties no failiem',
                url: 'Audio URL'
            },
            browser: {
                tags: 'Tagi',
                search: 'Meklēt'
            },
            caption: 'Ievietot aprakstu',
            close: 'Aizvērt',
            submitButton: 'Iesniegt',
            revertButton: 'Atjaunot',
            proportion: 'Ierobežo proporcijas',
            basic: 'Nav iesaiņojuma',
            left: 'Pa kreisi',
            right: 'Labajā pusē',
            center: 'Centrs',
            width: 'Platums',
            height: 'Augstums',
            size: 'Izmērs',
            ratio: 'Attiecība'
        },
        controller: {
            edit: 'Rediģēt',
            unlink: 'Atsaistīt',
            remove: 'Noņemt',
            insertRowAbove: 'Ievietot rindu virs',
            insertRowBelow: 'Ievietot rindu zemāk',
            deleteRow: 'Dzēst rindu',
            insertColumnBefore: 'Ievietot kolonnu pirms',
            insertColumnAfter: 'Ievietot kolonnu aiz',
            deleteColumn: 'Dzēst kolonnu',
            fixColumnWidth: 'Fiksēts kolonnas platums',
            resize100: 'Mainīt izmēru 100%',
            resize75: 'Mainīt izmēru 75%',
            resize50: 'Mainīt izmēru 50%',
            resize25: 'Mainīt izmēru 25%',
            autoSize: 'Automātiskais izmērs',
            mirrorHorizontal: 'Spogulis, horizontāls',
            mirrorVertical: 'Spogulis, vertikāls',
            rotateLeft: 'Pagriezt pa kreisi',
            rotateRight: 'Pagriezt pa labi',
            maxSize: 'Maksimālais izmērs',
            minSize: 'Minimālais izmērs',
            tableHeader: 'Tabulas galvene',
            mergeCells: 'Apvienot šūnas',
            splitCells: 'Sadalīt šūnas',
            HorizontalSplit: 'Horizontāls sadalījums',
            VerticalSplit: 'Vertikāls sadalījums'
        },
        menu: {
            spaced: 'Ar atstarpi',
            bordered: 'Robežojās',
            neon: 'Neona',
            translucent: 'Caurspīdīgs',
            shadow: 'Ēna',
            code: 'Kods'
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

        Object.defineProperty(window.SUNEDITOR_LANG, 'lv', {
            enumerable: true,
            writable: true,
            configurable: true,
            value: lang
        });
    }

    return lang;
}));