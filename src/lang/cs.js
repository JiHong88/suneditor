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
        code: 'cs',
        toolbar: {
            default: 'Výchozí',
            save: 'Uložit',
            font: 'Písmo',
            formats: 'Formáty',
            fontSize: 'Velikost',
            bold: 'Tučné',
            underline: 'Podtržení',
            italic: 'Kurzíva',
            strike: 'Přeškrtnutí',
            subscript: 'Dolní index',
            superscript: 'Horní index',
            removeFormat: 'Odebrat formát',
            fontColor: 'Barva písma',
            hiliteColor: 'Barva zvýraznění',
            indent: 'Odsadit',
            outdent: 'Předsadit',
            align: 'Zarovnat',
            alignLeft: 'Zarovnat vlevo',
            alignRight: 'Zarovnat vpravo',
            alignCenter: 'Zarovnat na střed',
            alignJustify: 'Zarovnat do bloku',
            list: 'Seznam',
            orderList: 'Seřazený seznam',
            unorderList: 'Neřazený seznam',
            horizontalRule: 'Vodorovná čára',
            hr_solid: 'Nepřerušovaná',
            hr_dotted: 'Tečkovaná',
            hr_dashed: 'Čárkovaná',
            table: 'Tabulka',
            link: 'Odkaz',
            math: 'Matematika',
            image: 'Obrázek',
            video: 'Video',
            audio: 'Zvuk',
            fullScreen: 'Celá obrazovka',
            showBlocks: 'Zobrazit bloky',
            codeView: 'Zobrazení kódu',
            undo: 'Zpět',
            redo: 'Opakovat',
            preview: 'Náhled',
            print: 'tisk',
            tag_p: 'Odstavec',
            tag_div: 'Normální (DIV)',
            tag_h: 'Záhlaví',
            tag_blockquote: 'Citovat',
            tag_pre: 'Kód',
            template: 'Šablona',
            lineHeight: 'Výška řádku',
            paragraphStyle: 'Styl odstavce',
            textStyle: 'Styl textu',
            imageGallery: 'Obrázková galerie',
            dir_ltr: 'Zleva doprava',
            dir_rtl: 'Zprava doleva',
            mention: 'Zmínka'
        },
        dialogBox: {
            linkBox: {
                title: 'Vložit odkaz',
                url: 'URL pro odkaz',
                text: 'Text k zobrazení',
                newWindowCheck: 'Otevřít v novém okně',
                downloadLinkCheck: 'Odkaz ke stažení',
                bookmark: 'Záložka'
            },
            mathBox: {
                title: 'Matematika',
                inputLabel: 'Matematická notace',
                fontSizeLabel: 'Velikost písma',
                previewLabel: 'Náhled'
            },
            imageBox: {
                title: 'Vložit obrázek',
                file: 'Vybrat ze souborů',
                url: 'URL obrázku',
                altText: 'Alternativní text'
            },
            videoBox: {
                title: 'Vložit video',
                file: 'Vybrat ze souborů',
                url: 'URL pro vložení médií, YouTube/Vimeo'
            },
            audioBox: {
                title: 'Vložit zvuk',
                file: 'Vybrat ze souborů',
                url: 'Adresa URL zvuku'
            },
            browser: {
                tags: 'Štítky',
                search: 'Hledat',
            },
            caption: 'Vložit popis',
            close: 'Zavřít',
            submitButton: 'Odeslat',
            revertButton: 'Vrátit zpět',
            proportion: 'Omezení proporcí',
            basic: 'Základní',
            left: 'Vlevo',
            right: 'Vpravo',
            center: 'Střed',
            width: 'Šířka',
            height: 'Výška',
            size: 'Velikost',
            ratio: 'Poměr'
        },
        controller: {
            edit: 'Upravit',
            unlink: 'Odpojit',
            remove: 'Odebrat',
            insertRowAbove: 'Vložit řádek výše',
            insertRowBelow: 'Vložit řádek níže',
            deleteRow: 'Smazat řádek',
            insertColumnBefore: 'Vložit sloupec před',
            insertColumnAfter: 'Vložit sloupec za',
            deleteColumn: 'Smazat sloupec',
            fixedColumnWidth: 'Pevná šířka sloupce',
            resize100: 'Změnit velikost 100%',
            resize75: 'Změnit velikost 75%',
            resize50: 'Změnit velikost 50%',
            resize25: 'Změnit velikost 25%',
            autoSize: 'Automatická velikost',
            mirrorHorizontal: 'Zrcadlo, horizontální',
            mirrorVertical: 'Zrcadlo, vertikální',
            rotateLeft: 'Otočit doleva',
            rotateRight: 'Otočit doprava',
            maxSize: 'Max. velikost',
            minSize: 'Min. velikost',
            tableHeader: 'Záhlaví tabulky',
            mergeCells: 'Spojit buňky',
            splitCells: 'Rozdělit buňky',
            HorizontalSplit: 'Vodorovné rozdělení',
            VerticalSplit: 'Svislé rozdělení'
        },
        menu: {
            spaced: 'Rozložené',
            bordered: 'Ohraničené',
            neon: 'Neon',
            translucent: 'Průsvitné',
            shadow: 'Stín',
            code: 'Kód'
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

        Object.defineProperty(window.SUNEDITOR_LANG, 'cs', {
            enumerable: true,
            writable: true,
            configurable: true,
            value: lang
        });
    }

    return lang;
}));