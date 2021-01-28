/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
"use strict";

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
})(typeof window !== "undefined" ? window : this, function(window, noGlobal) {
    const lang = {
        code: "ua",
        toolbar: {
            default: "По замовчуванням",
            save: "Зберегти",
            font: "Шрифт",
            formats: "Стиль абзацу",
            fontSize: "Розмір шрифту",
            bold: "Жирний",
            underline: "Підкреслений",
            italic: "Курсив",
            strike: "Перекреслити",
            subscript: "Нижній індекс",
            superscript: "Верхній індекс",
            removeFormat: "Очистити форматування",
            fontColor: "Колір тексту",
            hiliteColor: "Колір виділення",
            indent: "Збільшити відступ",
            outdent: "Зменшити відступ",
            align: "Вирівнювання",
            alignLeft: "За лівим краєм",
            alignRight: "За правим краєм",
            alignCenter: "По центру",
            alignJustify: "За шириною",
            list: "Список",
            orderList: "Нумерований",
            unorderList: "Маркований",
            horizontalRule: "Горизонтальна лінія",
            hr_solid: "Суцільна",
            hr_dotted: "Пунктирна",
            hr_dashed: "Штрихова",
            table: "Таблиця",
            link: "Посилання",
            math: "Формула",
            image: "Зображення",
            video: "Відео",
            audio: "Аудіо",
            fullScreen: "Повний екран",
            showBlocks: "Показати блоки",
            codeView: "Редагувати як HTML",
            undo: "Скасувати",
            redo: "Виконати знову",
            preview: "Попередній перегляд",
            print: "Друк",
            tag_p: "Абзац",
            tag_div: "Базовий",
            tag_h: "Заголовок",
            tag_blockquote: "Цитата",
            tag_pre: "Код",
            template: "Шаблон",
            lineHeight: "Висота лінії",
            paragraphStyle: "Стиль абзацу",
            textStyle: "Стиль тексту",
            imageGallery: "Галерея",
            mention: "Згадати"
        },
        dialogBox: {
            linkBox: {
                title: "Вставити посилання",
                url: "Посилання",
                text: "Текст",
                newWindowCheck: "Відкривати в новому вікні",
                downloadLinkCheck: 'Посилання для завантаження',
                bookmark: 'Закладка'
            },
            mathBox: {
                title: "Формула",
                inputLabel: "Математична запис",
                fontSizeLabel: "Розмір шрифту",
                previewLabel: "Попередній перегляд"
            },
            imageBox: {
                title: "Вставити зображення",
                file: "Виберіть файл",
                url: "Посилання на зображення",
                altText: "Текстовий опис зображення"
            },
            videoBox: {
                title: "Вставити відео",
                file: "Виберіть файл",
                url: "Посилання на відео, Youtube, Vimeo"
            },
            audioBox: {
                title: "Вставити аудіо",
                file: "Виберіть файл",
                url: "Посилання на аудіо"
            },
            browser: {
                tags: "Теги",
                search: "Пошук"
            },
            caption: "Додати підпис",
            close: "Закрити",
            submitButton: "Підтвердити",
            revertButton: "Скинути",
            proportion: "Зберегти пропорції",
            basic: "Без обтікання",
            left: "Зліва",
            right: "Справа",
            center: "По центру",
            width: "Ширина",
            height: "Висота",
            size: "Розмір",
            ratio: "Співвідношення"
        },
        controller: {
            edit: "Змінити",
            unlink: "Прибрати посилання",
            remove: "Видалити",
            insertRowAbove: "Вставити рядок вище",
            insertRowBelow: "Вставити рядок нижче",
            deleteRow: "Видалити рядок",
            insertColumnBefore: "Вставити стовпець зліва",
            insertColumnAfter: "Вставити стовпець справа",
            deleteColumn: "Видалити стовпець",
            fixedColumnWidth: "Фіксована ширина стовпця",
            resize100: "Розмір 100%",
            resize75: "Розмір 75%",
            resize50: "Розмір 50%",
            resize25: "Розмір 25%",
            autoSize: "Авто розмір",
            mirrorHorizontal: "Відобразити по горизонталі",
            mirrorVertical: "Відобразити по вертикалі",
            rotateLeft: "Повернути проти годинникової стрілки",
            rotateRight: "Повернути за годинниковою стрілкою",
            maxSize: "Ширина за розміром сторінки",
            minSize: "Ширина за вмістом",
            tableHeader: "Заголовок таблиці",
            mergeCells: "Об'єднати клітинки",
            splitCells: "Розділити клітинку",
            HorizontalSplit: "Розділити горизонтально",
            VerticalSplit: "Розділити вертикально"
        },
        menu: {
            spaced: "Інтервал",
            bordered: "З лініями",
            neon: "Неон",
            translucent: "Напівпрозорий",
            shadow: "Тінь",
            code: "Код"
        }
    };

    if (typeof noGlobal === typeof undefined) {
        if (!window.SUNEDITOR_LANG) {
            Object.defineProperty(window, "SUNEDITOR_LANG", {
                enumerable: true,
                writable: false,
                configurable: false,
                value: {},
            });
        }

        Object.defineProperty(window.SUNEDITOR_LANG, "ua", {
            enumerable: true,
            writable: true,
            configurable: true,
            value: lang,
        });
    }

    return lang;
});
