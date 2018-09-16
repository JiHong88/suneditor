// import './assets/css/suneditor.css'
// import './assets/css/suneditor-contents.css'

import {dialog} from './plugins/modules_init'
import {align, font, fontSize, fontColor, hiliteColor, horizontalRule, list, table, formatBlock, link, image, video} from './plugins/plugins_init'
import editor from './suneditor'

import lang_en from './lang/en'
import lang_ko from './lang/ko'


const SUNEDITOR = editor.init({
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

export default SUNEDITOR