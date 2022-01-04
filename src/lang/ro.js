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
        code: 'ro',
        toolbar: {
            default: 'Default',
            save: 'Salvează',
            font: 'Font',
            formats: 'Format',
            fontSize: 'Dimensiune',
            bold: 'Îngroșat',
            underline: 'Subliniat',
            italic: 'Înclinat',
            strike: 'Tăiat',
            subscript: 'Subscript',
            superscript: 'Superscript',
            removeFormat: 'Șterge formatare',
            fontColor: 'Culoare font',
            hiliteColor: 'Culoare de evidențiere',
            indent: 'Indentează',
            outdent: 'Fără indentare',
            align: 'Aliniere',
            alignLeft: 'Aliniere la stânga',
            alignRight: 'Aliniere la dreapta',
            alignCenter: 'Aliniere la centru',
            alignJustify: 'Aliniere stânga - dreapta',
            list: 'Listă',
            orderList: 'Listă ordonată',
            unorderList: 'Listă neordonată',
            horizontalRule: 'Linie orizontală',
            hr_solid: 'Solid',
            hr_dotted: 'Punctat',
            hr_dashed: 'Punctate',
            table: 'Tabel',
            link: 'Link',
            math: 'Matematică',
            image: 'Imagine',
            video: 'Video',
            audio: 'Audio',
            fullScreen: 'Tot ecranul',
            showBlocks: 'Arată blocuri',
            codeView: 'Vizualizare cod',
            undo: 'Anulează',
            redo: 'Refă',
            preview: 'Previzualizare',
            print: 'printează',
            tag_p: 'Paragraf',
            tag_div: 'Normal (DIV)',
            tag_h: 'Antet',
            tag_blockquote: 'Quote',
            tag_pre: 'Citat',
            template: 'Template',
            lineHeight: 'Înălțime linie',
            paragraphStyle: 'Stil paragraf',
            textStyle: 'Stil text',
            imageGallery: 'Galerie de imagini',
            dir_ltr: 'De la stânga la dreapta',
            dir_rtl: 'De la dreapta la stanga',
            mention: 'Mentiune'
        },
        dialogBox: {
            linkBox: {
                title: 'Inserează Link',
                url: 'Adresă link',
                text: 'Text de afișat',
                newWindowCheck: 'Deschide în fereastră nouă',
                downloadLinkCheck: 'Link de descărcare',
                bookmark: 'Marcaj'
            },
            mathBox: {
                title: 'Matematică',
                inputLabel: 'Notație matematică',
                fontSizeLabel: 'Dimensiune font',
                previewLabel: 'Previzualizare'
            },
            imageBox: {
                title: 'Inserează imagine',
                file: 'Selectează',
                url: 'URL imagine',
                altText: 'text alternativ'
            },
            videoBox: {
                title: 'Inserează video',
                file: 'Selectează',
                url: 'Include URL, youtube/vimeo'
            },
            audioBox: {
                title: 'Inserează Audio',
                file: 'Selectează',
                url: 'URL Audio'
            },
            browser: {
                tags: 'Etichete',
                search: 'Căutareim',
            },
            caption: 'Inserează descriere',
            close: 'Închide',
            submitButton: 'Salvează',
            revertButton: 'Revenire',
            proportion: 'Constrânge proporțiile',
            basic: 'De bază',
            left: 'Stânga',
            right: 'Dreapta',
            center: 'Centru',
            width: 'Lățime',
            height: 'Înălțime',
            size: 'Dimensiune',
            ratio: 'Ratie'
        },
        controller: {
            edit: 'Editează',
            unlink: 'Scoate link',
            remove: 'Elimină',
            insertRowAbove: 'Inserează rând deasupra',
            insertRowBelow: 'Inserează rând dedesupt',
            deleteRow: 'Șterge linie',
            insertColumnBefore: 'Inserează coloană înainte',
            insertColumnAfter: 'Inserează coloană după',
            deleteColumn: 'Șterge coloană',
            fixedColumnWidth: 'Lățime fixă coloană',
            resize100: 'Redimensionare 100%',
            resize75: 'Redimensionare 75%',
            resize50: 'Redimensionare 50%',
            resize25: 'Redimensionare 25%',
            autoSize: 'Dimensiune automată',
            mirrorHorizontal: 'Oglindă, orizontal',
            mirrorVertical: 'Oglindă, vertical',
            rotateLeft: 'Rotește la stânga',
            rotateRight: 'Rotește la dreapta',
            maxSize: 'Dimensiune maximă',
            minSize: 'Dimensiune minimă',
            tableHeader: 'Antet tabel',
            mergeCells: 'Îmbină celule',
            splitCells: 'Divizează celule',
            HorizontalSplit: 'Despicare orizontală',
            VerticalSplit: 'Despicare verticală'
        },
        menu: {
            spaced: 'Spațiat',
            bordered: 'Mărginit',
            neon: 'Neon',
            translucent: 'Translucent',
            shadow: 'Umbră',
            code: 'Citat'
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

        Object.defineProperty(window.SUNEDITOR_LANG, 'ro', {
            enumerable: true,
            writable: true,
            configurable: true,
            value: lang
        });
    }

    return lang;
}));