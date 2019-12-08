/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2019 @Gundolf68
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
        toolbar: {
            default: 'Standard',
            save: 'Speichern',
            font: 'Schriftart',
            formats: 'Format',
            fontSize: 'Schriftgröße',
            bold: 'Fett',
            underline: 'Unterstrichen',
            italic: 'Kursiv',
            strike: 'Durchgestrichen',
            subscript: 'Tiefgestellt',
            superscript: 'Hochgestellt',
            removeFormat: 'Format entfernen',
            fontColor: 'Schriftfarbe',
            hiliteColor: 'Farbe für Hervorhebungen',
            indent: 'Einzug vergrößern',
            outdent: 'Einzug verkleinern',
            align: 'Ausrichtung',
            alignLeft: 'Links ausrichten',
            alignRight: 'Rechts ausrichten',
            alignCenter: 'Zentriert ausrichten',
            alignJustify: 'Blocksatz',
            list: 'Liste',
            orderList: 'Nummerierte Liste',
            unorderList: 'Aufzählung',
            horizontalRule: 'Horizontale Linie',
            hr_solid: 'Strich',
            hr_dotted: 'Gepunktet',
            hr_dashed: 'Gestrichelt',
            table: 'Tabelle',
            link: 'Link',
            image: 'Bild',
            video: 'Video',
            fullScreen: 'Vollbild',
            showBlocks: 'Blockformatierungen anzeigen',
            codeView: 'Quelltext anzeigen',
            undo: 'Rückgängig',
            redo: 'Wiederholen',
            preview: 'Vorschau',
            print: 'Drucken',
            tag_p: 'Absatz',
            tag_div: 'Normal (DIV)',
            tag_h: 'Header',
            tag_blockquote: 'Zitat',
            tag_pre: 'Quellcode',
            template: 'Skabelon',
            lineHeight: 'Linienhöhe',
            paragraphStyle: 'Absatzstil',
            textStyle: 'Textstil'
        },
        dialogBox: {
            linkBox: {
                title: 'Link einfügen',
                url: 'Link-URL',
                text: 'Link-Text',
                newWindowCheck: 'In neuem Fenster anzeigen'
            },
            imageBox: {
                title: 'Bild einfügen',
                file: 'Datei auswählen',
                url: 'Bild-URL',
                altText: 'Alternativer Text'
            },
            videoBox: {
                title: 'Video enfügen',
                url: 'Video-URL, YouTube'
            },
            caption: 'Beschreibung eingeben',
            close: 'Schließen',
            submitButton: 'Übernehmen',
            revertButton: 'Rückgängig',
            proportion: 'Seitenverhältnis beibehalten',
            basic: 'Standard',
            left: 'Links',
            right: 'Rechts',
            center: 'Zentriert',
            width: 'Breite',
            height: 'Höhe',
            size: 'Größe',
            ratio: 'Verhältnis'
        },
        controller: {
            edit: 'Bearbeiten',
            unlink: 'Link entfernen',
            remove: 'Löschen',
            insertRowAbove: 'Zeile oberhalb einfügen',
            insertRowBelow: 'Zeile unterhalb einfügen',
            deleteRow: 'Zeile löschen',
            insertColumnBefore: 'Spalte links einfügen',
            insertColumnAfter: 'Spalte rechts einfügen',
            deleteColumn: 'Spalte löschen',
            resize100: 'Zoom 100%',
            resize75: 'Zoom 75%',
            resize50: 'Zoom 50%',
            resize25: 'Zoom 25%',
            autoSize: 'Automatische Größenanpassung',
            mirrorHorizontal: 'Horizontal spiegeln',
            mirrorVertical: 'Vertikal spiegeln',
            rotateLeft: 'Nach links drehen',
            rotateRight: 'Nach rechts drehen',
            maxSize: 'Maximale größe',
            minSize: 'Mindest größe',
            tableHeader: 'Tabellenüberschrift',
            mergeCells: 'Zellen verbinden',
            splitCells: 'Zellen Teilung',
            HorizontalSplit: 'Horizontale Teilung',
            VerticalSplit: 'Vertikale Teilung'
        },
        menu: {
            spaced: 'Buchstaben Abstand',
            bordered: 'Grenzlinie',
            neon: 'Neon',
            translucent: 'Durchscheinend',
            shadow: 'Schatten'
        }
    };

    if (typeof noGlobal === typeof undefined) {
        if (!window.SUNEDITOR_LANG) {
            window.SUNEDITOR_LANG = {};
        }

        window.SUNEDITOR_LANG.de = lang;
    }

    return lang;
}));