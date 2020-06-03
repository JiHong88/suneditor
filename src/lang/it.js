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
                    throw new Error('SUNEDITOR_LANG una finestra con un documento');
                }
                return factory(w);
            };
    } else {
        factory(global);
    }
}(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
    const lang = {
        code: 'it',
        toolbar: {
            default: 'Predefinita',
            save: 'Salva',
            font: 'Font',
            formats: 'Formato',
            fontSize: 'Grandezza',
            bold: 'Grassetto',
            underline: 'Sottolineato',
            italic: 'Italico',
            strike: 'Cancellato',
            subscript: 'Apice',
            superscript: 'Pedice',
            removeFormat: 'Rimuovi Formattazione',
            fontColor: 'Colore Testo',
            hiliteColor: 'Colore Sottolineatura',
            indent: 'Aumenta rientro',
            outdent: 'Riduci rientro',
            align: 'Allinea',
            alignLeft: 'Sinistra',
            alignRight: 'Destra',
            alignCenter: 'Centrato',
            alignJustify: 'Giustificato',
            list: 'Lista',
            orderList: 'Lista numerata',
            unorderList: 'Lista Puntata',
            horizontalRule: 'Linea Orizzontale',
            hr_solid: 'Linea',
            hr_dotted: 'Puntinato',
            hr_dashed: 'Tratteggiato',
            table: 'Tabella',
            link: 'Link',
            math: 'Matematica',
            image: 'Immagine',
            video: 'Video',
            audio: 'Audio',
            fullScreen: 'Tutto Schermo',
            showBlocks: 'Visualizza Blocchi',
            codeView: 'Visualizza Codice',
            undo: 'Annulla',
            redo: 'Ripristina',
            preview: 'Anteprima',
            print: 'Stampa',
            tag_p: 'Paragrafo',
            tag_div: 'DIV Normale',
            tag_h: 'Intestazione',
            tag_blockquote: 'Citazione',
            tag_pre: 'Codice',
            template: 'Template',
            lineHeight: 'Altezza linea',
            paragraphStyle: 'Stile Paragrafo',
            textStyle: 'Stile Testo',
            imageGallery: 'Galleria di immagini'
        },
        dialogBox: {
            linkBox: {
                title: 'Inserisci un Link',
                url: 'Indirizzo in link',
                text: 'Applica Testo da visualizzare',
                newWindowCheck: 'Apri in una nuova finestra'
            },
            mathBox: {
                title: 'Matematica',
                inputLabel: 'Notazione matematica',
                fontSizeLabel: 'Grandezza testo',
                previewLabel: 'Anteprima'
            },
            imageBox: {
                title: 'Inserisci Immagine',
                file: 'Seleziona da file',
                url: 'Indirizzo immagine',
                altText: 'Testo alternativo (ALT)'
            },
            videoBox: {
                title: 'Inserisci Video',
                file: 'Seleziona da file',
                url: 'Indirizzo video, YouTube'
            },
            audioBox: {
                title: 'Insertar Audio',
                file: 'Seleziona da file',
                url: 'Indirizzo audio'
            },
            browser: {
                tags: 'tag',
                search: 'Ricerca',
            },
            caption: 'Inserisci descrizione',
            close: 'ClChiudiose',
            submitButton: 'Invia',
            revertButton: 'Annulla',
            proportion: 'Proporzionale',
            basic: 'Da impostazione',
            left: 'Sinistra',
            right: 'Destra',
            center: 'Centrato',
            width: 'Larghezza',
            height: 'Altezza',
            size: 'Peso',
            ratio: 'Rapporto'
        },
        controller: {
            edit: 'Modifica',
            unlink: 'Elimina link',
            remove: 'Rimuovi',
            insertRowAbove: 'Inserisci linea sopra',
            insertRowBelow: 'Inserisci linea sotto',
            deleteRow: 'Cancella riga',
            insertColumnBefore: 'Inserisci una colonna prima',
            insertColumnAfter: 'Inserisci una colonna dopo',
            deleteColumn: 'Cancella colonna',
            fixedColumnWidth: 'Larghezza della colonna fissa',
            resize100: 'Ridimensiona 100%',
            resize75: 'Ridimensiona 75%',
            resize50: 'Ridimensiona 50%',
            resize25: 'Ridimensiona 25%',
            autoSize: 'Ridimensione automatica',
            mirrorHorizontal: 'Specchia, orizontale',
            mirrorVertical: 'Specchia, verticale',
            rotateLeft: 'Ruota a sinistra',
            rotateRight: 'Ruota a destra',
            maxSize: 'Dimensione massima',
            minSize: 'Dimensione minima',
            tableHeader: 'Intestazione Tabella',
            mergeCells: 'Unisci celle',
            splitCells: 'Dividi celle',
            HorizontalSplit: 'Separa orizontale',
            VerticalSplit: 'Separa verticale'
        },
        menu: {
            spaced: 'Spaziatura',
            bordered: 'Bordo',
            neon: 'Luminoso',
            translucent: 'Translucente',
            shadow: 'Ombra'
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

        Object.defineProperty(window.SUNEDITOR_LANG, 'it', {
            enumerable: true,
            writable: true,
            configurable: true,
            value: lang
        });
    }

    return lang;
}));
