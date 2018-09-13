import './assets/css/suneditor.css'
import './assets/css/suneditor-contents.css'

import suneditor from './suneditor'
import {align, font, fontSize, fontColor, hiliteColor, horizontalRule, list, table, formatBlock, link, image, video} from './plugins/plugins_init'
import {dialog} from './plugins/modules_init'
// import lang from './lang/ko'

suneditor.create(document.getElementById('editor'), {
    modules: [
        dialog
    ],
    buttonList: [
        ['undo', 'redo'],
        [font, fontSize, formatBlock],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['removeFormat'],
        '/',
        [fontColor, hiliteColor],
        ['indent', 'outdent'],
        [align, horizontalRule, list, table],
        [link, image, video],
        ['fullScreen', 'showBlocks', 'codeView'],
        ['preview', 'print']
    ],
    // lang: lang
})