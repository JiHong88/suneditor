import './assets/css/suneditor.css'
import './assets/css/suneditor-contents.css'

import {dialog} from '../src/plugins/modules_init'
import {align, font, fontSize, fontColor, hiliteColor, horizontalRule, list, table, formatBlock, link, image, video} from '../src/plugins/plugins_init'
import suneditor from '../src/suneditor'
// import lang_ko from './lang/ko'

window.SUNEDITOR = suneditor.init({
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
    ],
    // lang: lang_ko
});