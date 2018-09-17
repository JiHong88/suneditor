import suneditor_css from './assets/css/suneditor.css'
import suneditor_contents_css from './assets/css/suneditor-contents.css'

import {dialog} from './plugins/modules_init'
import {align, font, fontSize, fontColor, hiliteColor, horizontalRule, list, table, formatBlock, link, image, video} from './plugins/plugins_init'
import editor from './suneditor'

import lang_en from './lang/en'
import lang_ko from './lang/ko'


export const en = lang_en
export const ko = lang_ko

export const modules = {
    dialog
}

export const plugins = {
    align,
    font,
    fontSize,
    fontColor,
    hiliteColor,
    horizontalRule,
    list,
    table,
    formatBlock,
    link,
    image,
    video
}

export const suneditor = editor;

export const css = {
    suneditor: suneditor_css,
    suneditor_contents: suneditor_contents_css
}

export default editor.init({
    modules: [
        dialog
    ],
    plugins: [
        font,
        fontSize,
        formatBlock,
        fontColor,
        hiliteColor,
        align,
        horizontalRule,
        list,
        table,
        link,
        image,
        video
    ]
});