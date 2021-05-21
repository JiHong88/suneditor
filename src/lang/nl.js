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
        code: 'nl',
        toolbar: {
            default: 'Standaard',
            save: 'Opslaan',
            font: 'Lettertype',
            formats: 'Formaten',
            fontSize: 'Lettergrootte',
            bold: 'Vetgedrukt',
            underline: 'Onderstrepen',
            italic: 'Cursief',
            strike: 'Doorstrepen',
            subscript: 'Subscript',
            superscript: 'Superscript',
            removeFormat: 'Opmaak verwijderen',
            fontColor: 'Tekstkleur',
            hiliteColor: 'Tekst markeren',
            indent: 'Inspringen',
            outdent: 'Inspringen ongedaan maken',
            align: 'Uitlijnen',
            alignLeft: 'Links uitlijnen',
            alignRight: 'Rechts uitlijnen',
            alignCenter: 'In het midden uitlijnen',
            alignJustify: 'Uitvullen',
            list: 'Lijst',
            orderList: 'Geordende lijst',
            unorderList: 'Ongeordende lijst',
            horizontalRule: 'Horizontale regel',
            hr_solid: 'Standaard',
            hr_dotted: 'Gestippeld',
            hr_dashed: 'Gestreept',
            table: 'Tabel',
            link: 'Link',
            math: 'Wiskunde',
            image: 'Afbeelding',
            video: 'Video',
            audio: 'Audio',
            fullScreen: 'Volledig scherm',
            showBlocks: 'Blokken tonen',
            codeView: 'Broncode weergeven',
            undo: 'Ongedaan maken',
            redo: 'Ongedaan maken herstellen',
            preview: 'Voorbeeldweergave',
            print: 'Printen',
            tag_p: 'Alinea',
            tag_div: 'Normaal (div)',
            tag_h: 'Kop',
            tag_blockquote: 'Citaat',
            tag_pre: 'Code',
            template: 'Sjabloon',
            lineHeight: 'Lijnhoogte',
            paragraphStyle: 'Alineastijl',
            textStyle: 'Tekststijl',
            imageGallery: 'Galerij',
            mention: 'Vermelding'
        },
        dialogBox: {
            linkBox: {
                title: 'Link invoegen',
                url: 'URL',
                text: 'Tekst van de link',
                newWindowCheck: 'In een nieuw tabblad openen',
                downloadLinkCheck: 'Downloadlink',
                bookmark: 'Bladwijzer'
            },
            mathBox: {
                title: 'Wiskunde',
                inputLabel: 'Wiskundige notatie',
                fontSizeLabel: 'Lettergrootte',
                previewLabel: 'Voorbeeld'
            },
            imageBox: {
                title: 'Afbeelding invoegen',
                file: 'Selecteer een bestand van uw apparaat',
                url: 'URL',
                altText: 'Alt-tekst'
            },
            videoBox: {
                title: 'Video invoegen',
                file: 'Selecteer een bestand van uw apparaat',
                url: 'Embedded URL (YouTube/Vimeo)'
            },
            audioBox: {
                title: 'Audio invoegen',
                file: 'Selecteer een bestand van uw apparaat',
                url: 'URL'
            },
            browser: {
                tags: 'Tags',
                search: 'Zoeken',
            },
            caption: 'Omschrijving toevoegen',
            close: 'Sluiten',
            submitButton: 'Toepassen',
            revertButton: 'Standaardwaarden herstellen',
            proportion: 'Verhouding behouden',
            basic: 'Standaard',
            left: 'Links',
            right: 'Rechts',
            center: 'Midden',
            width: 'Breedte',
            height: 'Hoogte',
            size: 'Grootte',
            ratio: 'Verhouding'
        },
        controller: {
            edit: 'Bewerken',
            unlink: 'Ontkoppelen',
            remove: 'Verwijderen',
            insertRowAbove: 'Rij hierboven invoegen',
            insertRowBelow: 'Rij hieronder invoegen',
            deleteRow: 'Rij verwijderen',
            insertColumnBefore: 'Kolom links invoegen',
            insertColumnAfter: 'Kolom rechts invoegen',
            deleteColumn: 'Kolom verwijderen',
            fixedColumnWidth: 'Vaste kolombreedte',
            resize100: 'Formaat wijzigen: 100%',
            resize75: 'Formaat wijzigen: 75%',
            resize50: 'Formaat wijzigen: 50%',
            resize25: 'Formaat wijzigen: 25%',
            autoSize: 'Automatische grootte',
            mirrorHorizontal: 'Horizontaal spiegelen',
            mirrorVertical: 'Verticaal spiegelen',
            rotateLeft: 'Naar links draaien',
            rotateRight: 'Naar rechts draaien',
            maxSize: 'Maximale grootte',
            minSize: 'Minimale grootte',
            tableHeader: 'Tabelkoppen',
            mergeCells: 'Cellen samenvoegen',
            splitCells: 'Cellen splitsen',
            HorizontalSplit: 'Horizontaal splitsen',
            VerticalSplit: 'Verticaal splitsen'
        },
        menu: {
            spaced: 'Uit elkaar',
            bordered: 'Omlijnd',
            neon: 'Neon',
            translucent: 'Doorschijnend',
            shadow: 'Schaduw',
            code: 'Code'
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

        Object.defineProperty(window.SUNEDITOR_LANG, 'nl', {
            enumerable: true,
            writable: true,
            configurable: true,
            value: lang
        });
    }

    return lang;
}));