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
        code: 'km',
        toolbar: {
            default: 'លំនាំដើម',
            save: 'រក្សាទុក',
            font: 'ពុម្ពអក្សរ',
            formats: 'ទ្រង់ទ្រាយ',
            fontSize: 'ទំហំអក្សរ',
            bold: 'អក្សរដិត',
            underline: 'គូសបន្ទាត់ក្រោម',
            italic: 'អក្សរទ្រេត',
            strike: 'ឆូតអក្សរ',
            subscript: 'អក្សរតូចក្រោម',
            superscript: 'អក្សរតូចលើ',
            removeFormat: 'លុបទ្រង់ទ្រាយ',
            fontColor: 'ពណ៌អក្សរ',
            hiliteColor: 'ពណ៌បន្លិច',
            indent: 'ចូលបន្ទាត់',
            outdent: 'ចេញបន្ទាត់',
            align: 'តម្រឹម',
            alignLeft: 'តម្រឹមឆ្វេង',
            alignRight: 'តម្រឹមស្ដាំ',
            alignCenter: 'តម្រឹមកណ្តាល',
            alignJustify: 'តម្រឹមសម្រួល',
            list: 'បញ្ជី',
            orderList: 'បញ្ជីលេខលំដាប់',
            unorderList: 'បញ្ជីសញ្ញាលំដាប់',
            horizontalRule: 'បន្ទាត់ផ្តេក',
            hr_solid: 'បន្ទាត់ខ្សែស្មើ',
            hr_dotted: 'បន្ទាត់ចុចស្មើ',
            hr_dashed: 'បន្ទាត់ត្រេស្មើ',
            table: 'តារាង',
            link: 'តំណ',
            math: 'គណិត',
            image: 'រូបភាព',
            video: 'វីដេអូ',
            audio: 'អូឌីយូ',
            fullScreen: 'អេក្រង់ពេញ',
            showBlocks: 'បង្ហាញប្លក់',
            codeView: 'មើលកូដ',
            undo: 'មិនធ្វើវិញ',
            redo: 'ធ្វើវិញ',
            preview: 'មើលជាមុន',
            print: 'បោះពុម្ព',
            tag_p: 'កថាខណ្ឌ',
            tag_div: 'ធម្មតា (DIV)',
            tag_h: 'ចំណងជើង',
            tag_blockquote: 'អត្ថបទដកស្រង់',
            tag_pre: 'កូដ',
            template: 'ពុម្ព',
            lineHeight: 'កម្ពស់បន្ទាត់',
            paragraphStyle: 'រចនាប័ទ្មកថាខណ្ឌ',
            textStyle: 'រចនាប័ទ្មអក្សរ',
            imageGallery: 'វិចិត្រសាលរូបភាព',
            dir_ltr: 'ពីឆ្វេងទៅស្តាំ',
            dir_rtl: 'ពីស្តាំទៅឆ្វេង',
            mention: 'លើកឡើង'
        },
        dialogBox: {
            linkBox: {
                title: 'បញ្ចូលតំណ',
                url: 'URL ទៅតំណ',
                text: 'អត្ថបទបង្ហាញ',
                newWindowCheck: 'បើកផ្ទាំងក្នុងថ្មី',
                downloadLinkCheck: 'តំណទាញយក',
                bookmark: 'ចំណាំ'
            },
            mathBox: {
                title: 'គណិត',
                inputLabel: 'សរសេរកូដគណិត',
                fontSizeLabel: 'ទំហំអក្សរ',
                previewLabel: 'មើលជាមុន'
            },
            imageBox: {
                title: 'បញ្ចូលរូបភាព',
                file: 'ជ្រើសរូបភាព',
                url: 'URL រូបភាព',
                altText: 'អត្ថបទជំនួស'
            },
            videoBox: {
                title: 'បញ្ចូលវីដេអូ',
                file: 'ជ្រើសវីដេអូ',
                url: 'URL វីដេអូ (YouTube/Vimeo)'
            },
            audioBox: {
                title: 'បញ្ចូលអូឌីយ៉ូ',
                file: 'ជ្រើសអូឌីយ៉ូ',
                url: 'URL អូឌីយ៉ូ'
            },
            browser: {
                tags: 'ស្លាក',
                search: 'ស្វែងរក',
            },
            caption: 'បញ្ចូលការពិពណ៌នា',
            close: 'បិទ',
            submitButton: 'ដាក់ស្នើ',
            revertButton: 'រក្សាភាពដើម',
            proportion: 'កំណត់សមាមាត្រ',
            basic: 'មូលដ្ឋាន',
            left: 'ឆ្វេង',
            right: 'ស្តាំ',
            center: 'កណ្តាល',
            width: 'ទទឹង',
            height: 'កម្ពស់',
            size: 'ទំហំ',
            ratio: 'សមាមាត្រ'
        },
        controller: {
            edit: 'កែសម្រួល',
            unlink: 'ផ្តាច់តំណ',
            remove: 'លុប',
            insertRowAbove: 'បញ្ចូលជួរដេកខាងលើ',
            insertRowBelow: 'បញ្ចូលជួរដេកខាងក្រោម',
            deleteRow: 'លុបជួរដេក',
            insertColumnBefore: 'បញ្ចូលជួរឈរមុន',
            insertColumnAfter: 'បញ្ចូលជួរឈរបន្ទាប់',
            deleteColumn: 'លុបជួរឈរ',
            fixedColumnWidth: 'ទំហំជួរឈរត្រឹមត្រូវ',
            resize100: 'ប្ដូរទំហំ 100%',
            resize75: 'ប្ដូរទំហំ 75%',
            resize50: 'ប្ដូរទំហំ 50%',
            resize25: 'ប្ដូរទំហំ 25%',
            autoSize: 'ទំហំស្វ័យប្រវត្តិ',
            mirrorHorizontal: 'បញ្ច្រាសផ្ដេក',
            mirrorVertical: 'បញ្ច្រាសបញ្ឈរ',
            rotateLeft: 'បង្វិលឆ្វេង',
            rotateRight: 'បង្វិលស្តាំ',
            maxSize: 'ទំហំធំ',
            minSize: 'ទំហំតូច',
            tableHeader: 'ក្បាលតារាង',
            mergeCells: 'បង្រួមក្រឡា',
            splitCells: 'បំបែកក្រឡា',
            HorizontalSplit: 'បំបែកផ្ដេក',
            VerticalSplit: 'បំបែកបញ្ឈរ'
        },
        menu: {
            spaced: 'មានចន្លោះ',
            bordered: 'មានស៊ុម',
            neon: 'Neon',
            translucent: 'ថ្លា',
            shadow: 'ស្រមោល',
            code: 'កូដ'
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

        Object.defineProperty(window.SUNEDITOR_LANG, 'km', {
            enumerable: true,
            writable: true,
            configurable: true,
            value: lang
        });
    }

    return lang;
}));