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
        code: 'zh_cn',
        toolbar: {
            default: '默认',
            save: '保存',
            font: '字体',
            formats: '格式',
            fontSize: '字号',
            bold: '粗体',
            underline: '下划线',
            italic: '斜体',
            strike: '删除线',
            subscript: '下标',
            superscript: '上标',
            removeFormat: '清除格式',
            fontColor: '字体颜色',
            hiliteColor: '背景颜色',
            indent: '增加缩进',
            outdent: '减少缩进',
            align: '对齐方式',
            alignLeft: '左对齐',
            alignRight: '右对齐',
            alignCenter: '居中',
            alignJustify: '两端对齐',
            list: '列表',
            orderList: '有序列表',
            unorderList: '无序列表',
            horizontalRule: '水平线',
            hr_solid: '实线',
            hr_dotted: '点线',
            hr_dashed: '虚线',
            table: '表格',
            link: '超链接',
            math: '数学',
            image: '图片',
            video: '视频',
            audio: '音讯',
            fullScreen: '全屏',
            showBlocks: '显示块区域',
            codeView: '代码视图',
            undo: '撤消',
            redo: '恢复',
            preview: '预览',
            print: '打印',
            tag_p: '段落',
            tag_div: '正文 (DIV)',
            tag_h: '标题',
            tag_blockquote: '引用',
            tag_pre: '代码',
            template: '模板',
            lineHeight: '行高',
            paragraphStyle: '段落样式',
            textStyle: '文字样式',
            imageGallery: '图片库',
            mention: '提到'
        },
        dialogBox: {
            linkBox: {
                title: '插入超链接',
                url: '网址',
                text: '字体',
                newWindowCheck: '在新标签页中打开',
                downloadLinkCheck: '下载链接',
                bookmark: '书签'
            },
            mathBox: {
                title: '数学',
                inputLabel: '数学符号',
                fontSizeLabel: '字号',
                previewLabel: '预览'
            },
            imageBox: {
                title: '插入图片',
                file: '上传图片',
                url: '图片网址',
                altText: '替换文字'
            },
            videoBox: {
                title: '插入视频',
                file: '上传图片',
                url: '嵌入网址, Youtube,Vimeo'
            },
            audioBox: {
                title: '插入音频',
                file: '上传图片',
                url: '音频网址'
            },
            browser: {
                tags: '标签',
                search: '搜索',
            },
            caption: '标题',
            close: '取消',
            submitButton: '确定',
            revertButton: '恢复',
            proportion: '比例',
            basic: '基本',
            left: '左',
            right: '右',
            center: '居中',
            width: '宽度',
            height: '高度',
            size: '尺寸',
            ratio: '比'
        },
        controller: {
            edit: '编辑',
            unlink: '去除链接',
            remove: '删除',
            insertRowAbove: '在上方插入',
            insertRowBelow: '在下方插入',
            deleteRow: '删除行',
            insertColumnBefore: '在左侧插入',
            insertColumnAfter: '在右侧插入',
            deleteColumn: '删除列',
            fixedColumnWidth: '固定列宽',
            resize100: '放大 100%',
            resize75: '放大 75%',
            resize50: '放大 50%',
            resize25: '放大 25%',
            mirrorHorizontal: '翻转左右',
            mirrorVertical: '翻转上下',
            rotateLeft: '向左旋转',
            rotateRight: '向右旋转',
            maxSize: '最大尺寸',
            minSize: '最小尺寸',
            tableHeader: '表格标题',
            mergeCells: '合并单元格',
            splitCells: '分割单元格',
            HorizontalSplit: '水平分割',
            VerticalSplit: '垂直分割'
        },
        menu: {
            spaced: '间隔开',
            bordered: '边界线',
            neon: '霓虹灯',
            translucent: '半透明',
            shadow: '阴影',
            code: '代码'
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

        Object.defineProperty(window.SUNEDITOR_LANG, 'zh_cn', {
            enumerable: true,
            writable: true,
            configurable: true,
            value: lang
        });
    }

    return lang;
}));
