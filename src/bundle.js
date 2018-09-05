import suneditor from './suneditor'
import {align, font, fontSize, fontColor, hiliteColor, horizontalRule, list, table, formatBlock, link, image, video, dialog} from './plugins/plugins_init'
import lang from '../lang/ko.js'

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
    lang: lang
})