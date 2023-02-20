/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * Brazilian Portuguese translation by lpeil github
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
        code: 'pt_br',
        toolbar: {
            default: 'Padrão',
            save: 'Salvar',
            font: 'Fonte',
            formats: 'Formatos',
            fontSize: 'Tamanho',
            bold: 'Negrito',
            underline: 'Sublinhado',
            italic: 'Itálico',
            strike: 'Riscado',
            subscript: 'Subescrito',
            superscript: 'Sobrescrito',
            removeFormat: 'Remover Formatação',
            fontColor: 'Cor da Fonte',
            hiliteColor: 'Cor de destaque',
            indent: 'Recuo',
            outdent: 'Avançar',
            align: 'Alinhar',
            alignLeft: 'Alinhar à esquerda',
            alignRight: 'Alinhar à direita',
            alignCenter: 'Centralizar',
            alignJustify: 'Justificar',
            list: 'Lista',
            orderList: 'Lista ordenada',
            unorderList: 'Lista desordenada',
            horizontalRule: 'Linha horizontal',
            hr_solid: 'sólida',
            hr_dotted: 'pontilhada',
            hr_dashed: 'tracejada',
            table: 'Tabela',
            link: 'Link',
            math: 'Matemática',
            image: 'Imagem',
            video: 'Vídeo',
            audio: 'Áudio',
            fullScreen: 'Tela cheia',
            showBlocks: 'Mostrar blocos',
            codeView: 'Mostrar códigos',
            undo: 'Voltar',
            redo: 'Refazer',
            preview: 'Prever',
            print: 'Imprimir',
            tag_p: 'Paragráfo',
            tag_div: '(DIV) Normal',
            tag_h: 'Cabeçalho',
            tag_blockquote: 'Citar',
            tag_pre: 'Código',
            template: 'Modelo',
            lineHeight: 'Altura da linha',
            paragraphStyle: 'Estilo do parágrafo',
            textStyle: 'Estilo do texto',
            imageGallery: 'Galeria de imagens',
            dir_ltr: 'Esquerda para direita',
            dir_rtl: 'Direita para esquerda',
            mention: 'Menção'
        },
        dialogBox: {
            linkBox: {
                title: 'Inserir link',
                url: 'URL para link',
                text: 'Texto a mostrar',
                newWindowCheck: 'Abrir em nova guia',
                downloadLinkCheck: 'Link para Download',
                bookmark: 'marcar páginas'
            },
            mathBox: {
                title: 'Matemática',
                inputLabel: 'Notação matemática',
                fontSizeLabel: 'Tamanho',
                previewLabel: 'Prever'
            },
            imageBox: {
                title: 'Inserir imagens',
                file: 'Selecionar arquivos',
                url: 'URL da imagem',
                altText: 'Texto alternativo'
            },
            videoBox: {
                title: 'Inserir vídeo',
                file: 'Selecionar arquivos',
                url: 'URL do YouTube/Vimeo'
            },
            audioBox: {
                title: 'Inserir áudio',
                file: 'Selecionar arquivos',
                url: 'URL da áudio'
            },
            browser: {
                tags: 'Tag',
                search: 'Procurar',
            },
            caption: 'Inserir descrição',
            close: 'Fechar',
            submitButton: 'Enviar',
            revertButton: 'Reverter',
            proportion: 'Restringir proporções',
            basic: 'Básico',
            left: 'Esquerda',
            right: 'Direita',
            center: 'Centro',
            width: 'Largura',
            height: 'Altura',
            size: 'Tamanho',
            ratio: 'Proporções'
        },
        controller: {
            edit: 'Editar',
            unlink: 'Remover link',
            remove: 'Remover',
            insertRowAbove: 'Inserir linha acima',
            insertRowBelow: 'Inserir linha abaixo',
            deleteRow: 'Deletar linha',
            insertColumnBefore: 'Inserir coluna antes',
            insertColumnAfter: 'Inserir coluna depois',
            deleteColumn: 'Deletar coluna',
            fixedColumnWidth: 'Largura fixa da coluna',
            resize100: 'Redimensionar para 100%',
            resize75: 'Redimensionar para 75%',
            resize50: 'Redimensionar para 50%',
            resize25: 'Redimensionar para 25%',
            autoSize: 'Tamanho automático',
            mirrorHorizontal: 'Espelho, Horizontal',
            mirrorVertical: 'Espelho, Vertical',
            rotateLeft: 'Girar para esquerda',
            rotateRight: 'Girar para direita',
            maxSize: 'Tam máx',
            minSize: 'Tam mín',
            tableHeader: 'Cabeçalho da tabela',
            mergeCells: 'Mesclar células',
            splitCells: 'Dividir células',
            HorizontalSplit: 'Divisão horizontal',
            VerticalSplit: 'Divisão vertical'
        },
        menu: {
            spaced: 'Espaçado',
            bordered: 'Com borda',
            neon: 'Neon',
            translucent: 'Translúcido',
            shadow: 'Sombreado',
            code: 'Código'
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

        Object.defineProperty(window.SUNEDITOR_LANG, 'pt_br', {
            enumerable: true,
            writable: true,
            configurable: true,
            value: lang
        });
    }

    return lang;
}));
