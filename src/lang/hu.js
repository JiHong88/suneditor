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
        code: 'hu',
        toolbar: {
            default: 'Alapértelmezett',
            save: 'Mentés',
            font: 'Betűtípus',
            formats: 'Formázás',
            fontSize: 'Betűméret',
            bold: 'Félkövér',
            underline: 'Aláhúzott',
            italic: 'Dőlt',
            strike: 'Áthúzott',
            subscript: 'Alsó index',
            superscript: 'Felső index',
            removeFormat: 'Formázás törlése',
            fontColor: 'Betűszín',
            hiliteColor: 'Háttérszín',
            indent: 'Behúzás növelése',
            outdent: 'Behúzás csökkentése',
            align: 'Igazítás',
            alignLeft: 'Balra igazítás',
            alignRight: 'Jobbra igazítás',
            alignCenter: 'Középre igazítás',
            alignJustify: 'Sorkizárt',
            list: 'Lista',
            orderList: 'Számozott lista',
            unorderList: 'Számozatlan lista',
            horizontalRule: 'Elválasztó',
            hr_solid: 'Folytonos',
            hr_dotted: 'Pontozott',
            hr_dashed: 'Szaggatott',
            table: 'Táblázat',
            link: 'Hivatkozás',
            math: 'Matematika',
            image: 'Kép',
            video: 'Videó',
            audio: 'Hang',
            fullScreen: 'Teljes képernyő',
            showBlocks: 'Blokkok megjelenítése',
            codeView: 'Forráskód nézet',
            undo: 'Visszavonás',
            redo: 'Visszavonás visszavonása',
            preview: 'Előnézet',
            print: 'Nyomtatás',
            tag_p: 'Bekezdés',
            tag_div: 'Normál (DIV)',
            tag_h: 'Fejléc',
            tag_blockquote: 'Idézet',
            tag_pre: 'Kód',
            template: 'Minta',
            lineHeight: 'Sormagasság',
            paragraphStyle: 'Bekezdésstílus',
            textStyle: 'Karakterstílus',
            imageGallery: 'Képgalléria',
            dir_ltr: 'Balról jobbra',
            dir_rtl: 'Jobbról balra',
            mention: 'Említés'
        },
        dialogBox: {
            linkBox: {
                title: 'Link beszúrása',
                url: 'URL',
                text: 'Megjelenített szöveg',
                newWindowCheck: 'Megnyitás új ablakban',
                downloadLinkCheck: 'Letöltési hivatkozás',
                bookmark: 'Könyvjelző'
            },
            mathBox: {
                title: 'Matematika',
                inputLabel: 'Matematikai jelölések',
                fontSizeLabel: 'Betűméret',
                previewLabel: 'Előnézet'
            },
            imageBox: {
                title: 'Kép beszúrása',
                file: 'Fájlfeltöltés',
                url: 'Képhivatkozás',
                altText: 'Alternatív szöveg'
            },
            videoBox: {
                title: 'Videó beszúrása',
                file: 'Fájlfeltöltés',
                url: 'Beágyazható URL, YouTube/Vimeo'
            },
            audioBox: {
                title: 'Hang beszúrása',
                file: 'Fájlfeltöltés',
                url: 'Hang URL'
            },
            browser: {
                tags: 'Címkék',
                search: 'Keresés',
            },
            caption: 'Képaláírás',
            close: 'Bezárás',
            submitButton: 'Küldés',
            revertButton: 'Mégse',
            proportion: 'Méretkorlátok',
            basic: 'Alapszintű',
            left: 'Balra',
            right: 'Jobbra',
            center: 'Középre',
            width: 'Szélesség',
            height: 'Magasság',
            size: 'Méret',
            ratio: 'Képarány'
        },
        controller: {
            edit: 'Szerkesztés',
            unlink: 'Link eltávolítása',
            remove: 'Törlés',
            insertRowAbove: 'Új sor fölötte',
            insertRowBelow: 'Új sor alatta',
            deleteRow: 'Sor törlése',
            insertColumnBefore: 'Új oszlop balra',
            insertColumnAfter: 'Új oszlop jobbra',
            deleteColumn: 'Oszlop törlése',
            fixedColumnWidth: 'Rögzített oszlopszélesség',
            resize100: 'Átméretezés: 100%',
            resize75: 'Átméretezés: 75%',
            resize50: 'Átméretezés: 50%',
            resize25: 'Átméretezés: 25%',
            autoSize: 'Automatikus méret',
            mirrorHorizontal: 'Vízszintes tükrözés',
            mirrorVertical: 'Függőleges tükrözés',
            rotateLeft: 'Forgatás balra',
            rotateRight: 'Forgatás jobbra',
            maxSize: 'Maximális méret',
            minSize: 'Minimális méret',
            tableHeader: 'Táblázatfejléc',
            mergeCells: 'Cellák egyesítése',
            splitCells: 'Cellák szétválasztása',
            HorizontalSplit: 'Szétválasztás vízszintesen',
            VerticalSplit: 'Szétválasztás függőlegesen'
        },
        menu: {
            spaced: 'Ritkított',
            bordered: 'Keretezett',
            neon: 'Neon',
            translucent: 'Áttetsző',
            shadow: 'Árnyék',
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

        Object.defineProperty(window.SUNEDITOR_LANG, 'hu', {
            enumerable: true,
            writable: true,
            configurable: true,
            value: lang
        });
    }

    return lang;
}));
