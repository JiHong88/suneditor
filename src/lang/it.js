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
            italic: 'Corsivo',
            strike: 'Barrato',
            subscript: 'Apice',
            superscript: 'Pedice',
            removeFormat: 'Rimuovi formattazione',
            fontColor: 'Colore testo',
            hiliteColor: 'Colore sottolineatura',
            indent: 'Aumenta rientro',
            outdent: 'Riduci rientro',
            align: 'Allinea',
            alignLeft: 'Allinea a sinistra',
            alignRight: 'Allinea a destra',
            alignCenter: 'Allinea al centro',
            alignJustify: 'Giustifica testo',
            list: 'Elenco',
            orderList: 'Elenco numerato',
            unorderList: 'Elenco puntato',
            horizontalRule: 'Linea orizzontale',
            hr_solid: 'Linea continua',
            hr_dotted: 'Puntini',
            hr_dashed: 'Trattini',
            table: 'Tabella',
            link: 'Collegamento ipertestuale',
            math: 'Formula matematica',
            image: 'Immagine',
            video: 'Video',
            audio: 'Audio',
            fullScreen: 'A tutto schermo',
            showBlocks: 'Visualizza blocchi',
            codeView: 'Visualizza codice',
            undo: 'Annulla',
            redo: 'Ripristina',
            preview: 'Anteprima',
            print: 'Stampa',
            tag_p: 'Paragrafo',
            tag_div: 'Normale (DIV)',
            tag_h: 'Titolo',
            tag_blockquote: 'Citazione',
            tag_pre: 'Codice',
            template: 'Modello',
            lineHeight: 'Interlinea',
            paragraphStyle: 'Stile paragrafo',
            textStyle: 'Stile testo',
            imageGallery: 'Galleria di immagini',
            mention: 'Menzione'
        },
        dialogBox: {
            linkBox: {
                title: 'Inserisci un link',
                url: 'Indirizzo',
                text: 'Testo da visualizzare',
                newWindowCheck: 'Apri in una nuova finestra',
                downloadLinkCheck: 'Link per scaricare',
                bookmark: 'Segnalibro'
            },
            mathBox: {
                title: 'Matematica',
                inputLabel: 'Notazione matematica',
                fontSizeLabel: 'Grandezza testo',
                previewLabel: 'Anteprima'
            },
            imageBox: {
                title: 'Inserisci immagine',
                file: 'Seleziona da file',
                url: 'Indirizzo immagine',
                altText: 'Testo alternativo (ALT)'
            },
            videoBox: {
                title: 'Inserisci video',
                file: 'Seleziona da file',
                url: 'Indirizzo video di embed, YouTube/Vimeo'
            },
            audioBox: {
                title: 'Inserisci audio',
                file: 'Seleziona da file',
                url: 'Indirizzo audio'
            },
            browser: {
                tags: 'tag',
                search: 'Ricerca',
            },
            caption: 'Inserisci didascalia',
            close: 'Chiudi',
            submitButton: 'Invia',
            revertButton: 'Annulla',
            proportion: 'Proporzionale',
            basic: 'Da impostazione',
            left: 'Sinistra',
            right: 'Destra',
            center: 'Centrato',
            width: 'Larghezza',
            height: 'Altezza',
            size: 'Dimensioni',
            ratio: 'Rapporto'
        },
        controller: {
            edit: 'Modifica',
            unlink: 'Elimina link',
            remove: 'Rimuovi',
            insertRowAbove: 'Inserisci riga sopra',
            insertRowBelow: 'Inserisci riga sotto',
            deleteRow: 'Cancella riga',
            insertColumnBefore: 'Inserisci colonna prima',
            insertColumnAfter: 'Inserisci colonna dopo',
            deleteColumn: 'Cancella colonna',
            fixedColumnWidth: 'Larghezza delle colonne fissa',
            resize100: 'Ridimensiona 100%',
            resize75: 'Ridimensiona 75%',
            resize50: 'Ridimensiona 50%',
            resize25: 'Ridimensiona 25%',
            autoSize: 'Ridimensione automatica',
            mirrorHorizontal: 'Capovolgi orizzontalmente',
            mirrorVertical: 'Capovolgi verticalmente',
            rotateLeft: 'Ruota a sinistra',
            rotateRight: 'Ruota a destra',
            maxSize: 'Dimensione massima',
            minSize: 'Dimensione minima',
            tableHeader: 'Intestazione tabella',
            mergeCells: 'Unisci celle',
            splitCells: 'Dividi celle',
            HorizontalSplit: 'Separa orizontalmente',
            VerticalSplit: 'Separa verticalmente'
        },
        menu: {
            spaced: 'Spaziato',
            bordered: 'Bordato',
            neon: 'Luminoso',
            translucent: 'Traslucido',
            shadow: 'Ombra',
            code: 'Codice'
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
