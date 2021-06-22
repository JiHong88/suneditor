/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2019 JiHong Lee.
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
        code: 'fr',
        toolbar: {
            default: 'Défaut',
            save: 'Sauvegarder',
            font: 'Police',
            formats: 'Formats',
            fontSize: 'Taille',
            bold: 'Gras',
            underline: 'Souligné',
            italic: 'Italique',
            strike: 'Barré',
            subscript: 'Indice',
            superscript: 'Exposant',
            removeFormat: 'Éffacer  le Formatage',
            fontColor: 'Couleur du texte',
            hiliteColor: 'Couleur en arrière plan',
            indent: 'Indenter',
            outdent: 'Désindenter',
            align: 'Alignement',
            alignLeft: 'À gauche',
            alignRight: 'À droite',
            alignCenter: 'Centré',
            alignJustify: 'Justifié',
            list: 'Liste',
            orderList: 'Ordonnée',
            unorderList: 'Non-ordonnée',
            horizontalRule: 'Ligne horizontale',
            hr_solid: 'Solide',
            hr_dotted: 'Points',
            hr_dashed: 'Tirets',
            table: 'Table',
            link: 'Lien',
            math: 'Math',
            image: 'Image',
            video: 'Video',
            audio: 'l\'audio',
            fullScreen: 'Plein écran',
            showBlocks: 'Voir les blocs',
            codeView: 'Voir le code',
            undo: 'Annuler',
            redo: 'Rétablir',
            preview: 'Previsualiser',
            print: 'Imprimer',
            tag_p: 'Paragraphe',
            tag_div: 'Normal (DIV)',
            tag_h: 'Titre',
            tag_blockquote: 'Citation',
            tag_pre: 'Code',
            template: 'Template',
            lineHeight: 'Hauteur de la ligne',
            paragraphStyle: 'Style de paragraphe',
            textStyle: 'Style de texte',
            imageGallery: 'Galerie d\'images',
            mention: 'Mention'
        },
        dialogBox: {
            linkBox: {
                title: 'Insérer un lien',
                url: 'Adresse URL du lien',
                text: 'Texte à afficher',
                newWindowCheck: 'Ouvrir dans une nouvelle fenêtre',
                downloadLinkCheck: 'Lien de téléchargement',
                bookmark: 'Signet'
            },
            mathBox: {
                title: 'Math',
                inputLabel: 'Notation mathématique',
                fontSizeLabel: 'Taille',
                previewLabel: 'Previsualiser'
            },
            imageBox: {
                title: 'Insérer une image',
                file: 'Sélectionner le fichier',
                url: 'Adresse URL du fichier',
                altText: 'Texte Alternatif'
            },
            videoBox: {
                title: 'Insérer une Vidéo',
                file: 'Sélectionner le fichier',
                url: 'URL d’intégration du média, YouTube/Vimeo'
            },
            audioBox: {
                title: 'Insertar une l\'audio',
                file: 'Sélectionner le fichier',
                url: 'Adresse URL du fichier'
            },
            browser: {
                tags: 'Mots clés',
                search: 'Chercher',
            },
            caption: 'Insérer une description',
            close: 'Fermer',
            submitButton: 'Appliquer',
            revertButton: 'Revenir en arrière',
            proportion: 'Maintenir le rapport hauteur/largeur',
            basic: 'Basique',
            left: 'Gauche',
            right: 'Droite',
            center: 'Centré',
            width: 'Largeur',
            height: 'Hauteur',
            size: 'La taille',
            ratio: 'Rapport'
        },
        controller: {
            edit: 'Modifier',
            unlink: 'Supprimer un lien',
            remove: 'Effacer',
            insertRowAbove: 'Insérer une ligne en dessous',
            insertRowBelow: 'Insérer une ligne au dessus',
            deleteRow: 'Effacer la ligne',
            insertColumnBefore: 'Insérer une colonne avant',
            insertColumnAfter: 'Insérer une colonne après',
            deleteColumn: 'Effacer la colonne',
            fixedColumnWidth: 'Largeur de colonne fixe',
            resize100: 'Redimensionner à 100%',
            resize75: 'Redimensionner à 75%',
            resize50: 'Redimensionner à 50%',
            resize25: 'Redimensionner à 25%',
            autoSize: 'Taille automatique',
            mirrorHorizontal: 'Mirroir, Horizontal',
            mirrorVertical: 'Mirroir, Vertical',
            rotateLeft: 'Rotation à gauche',
            rotateRight: 'Rotation à droite',
            maxSize: 'Taille max',
            minSize: 'Taille min',
            tableHeader: 'En-tête de table',
            mergeCells: 'Fusionner les cellules',
            splitCells: 'Diviser les Cellules',
            HorizontalSplit: 'Scission horizontale',
            VerticalSplit: 'Scission verticale'
        },
        menu: {
            spaced: 'Espacement',
            bordered: 'Ligne de démarcation',
            neon: 'Néon',
            translucent: 'Translucide',
            shadow: 'L\'ombre',
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

        Object.defineProperty(window.SUNEDITOR_LANG, 'fr', {
            enumerable: true,
            writable: true,
            configurable: true,
            value: lang
        });
    }

    return lang;
}));
