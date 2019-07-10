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
        toolbar: {
            default: 'По умолчанию',
            save: 'хранить',
            font: 'шрифты',
            formats: 'Формат абзаца',
            fontSize: 'размер',
            bold: 'крупно',
            underline: 'линия подчёркивания',
            italic: 'косить',
            strike: 'Линия отмены',
            subscript: 'индекс',
            superscript: 'верхний индекс',
            removeFormat: 'Тип уничтожения',
            fontColor: 'Цвет текста',
            hiliteColor: 'Цвет фона',
            indent: 'занести',
            outdent: 'Отпускать',
            align: 'Постоение',
            alignLeft: 'Выровнять налево',
            alignRight: 'Выровнять право',
            alignCenter: 'Выровнять на середину',
            alignJustify: 'обосновывать',
            list: 'Списки',
            orderList: 'Числовая Списки',
            unorderList: 'Круглая Списки',
            horizontalRule: 'Вставить горизонтальную линию',
            hr_solid: 'Сплошная линия',
            hr_dotted: 'Пунктирная линия',
            hr_dashed: 'тире',
            table: 'таблица',
            link: 'ссылка',
            image: 'имидж',
            video: 'видео',
            fullScreen: 'Полный экран',
            showBlocks: 'Блочный вид',
            codeView: 'Редактировать HTML',
            undo: 'отменить осуществления',
            redo: 'переделывать',
            preview: 'предварительный просмотр',
            print: 'печать',
            tag_p: 'текст',
            tag_div: 'основной (DIV)',
            tag_h: 'тема',
            tag_blockquote: 'цитата',
            tag_pre: 'код'
        },
        dialogBox: {
            linkBox: {
                title: 'Вставить ссылку',
                url: 'Интернет-адрес',
                text: 'Текст на экране',
                newWindowCheck: 'Открыть в новом окне'
            },
            imageBox: {
                title: 'Вставить изображение',
                file: 'Выберите файл',
                url: 'Адрес изображения',
                altText: 'Замена строки'
            },
            videoBox: {
                title: 'Вставить видео',
                url: 'Адрес для вставки СМИ, YouTube'
            },
            caption: 'Вставить описание',
            close: 'близко',
            submitButton: 'подтверждение',
            revertButton: 'возвращаться',
            proportion: 'ставка на заказ',
            basic: 'основной',
            left: 'Левая сторона',
            right: 'правая сторона',
            center: 'из',
            width: 'горизонтально',
            height: 'вертикально'
        },
        controller: {
            edit: 'коррекция',
            remove: 'делеция',
            insertRowAbove: 'Вставить строку выше',
            insertRowBelow: 'Вставить строку ниже',
            deleteRow: 'Удалить строки',
            insertColumnBefore: 'Вставьте столбец слева',
            insertColumnAfter: 'Вставить столбец справа',
            deleteColumn: 'Удалить столбец',
            resize100: 'размер 100%',
            resize75: 'размер 75%',
            resize50: 'размер 50%',
            resize25: 'размер 25%',
            mirrorHorizontal: 'зеркало',
            mirrorVertical: 'Вверх ногами',
            rotateLeft: 'Повернуть налево',
            rotateRight: 'Повернуть вправо',
            maxSize: 'максимизировать',
            minSize: 'минимизировать',
            tableHeader: 'Название таблицы',
            mergeCells: 'Объединить ячейку',
            splitCells: 'Сплит ячейка',
            HorizontalSplit: 'Горизонтальное деление',
            VerticalSplit: 'Вертикальное разделение'
        }
    };

    if (typeof noGlobal === typeof undefined) {
        if (!window.SUNEDITOR_LANG) {
            window.SUNEDITOR_LANG = {};
        }

        window.SUNEDITOR_LANG.ru = lang;
    }

    return lang;
}));