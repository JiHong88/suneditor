import suneditor from './suneditor'
import align from './plugins/submenu/align'
import font from './plugins/submenu/font'
import fontSize from './plugins/submenu/fontSize'
import fontColor from './plugins/submenu/fontColor'
import hiliteColor from './plugins/submenu/hiliteColor'
import hr from './plugins/submenu/horizontalRule'
import list from './plugins/submenu/list'
import table from './plugins/submenu/table'
import formatBlock from './plugins/submenu/formatBlock'

suneditor.create('editor', {
    buttonList: [
        [align, font, 'bold', 'italic', fontSize, fontColor, hiliteColor],
        '/',
        [hr, list, table, formatBlock]
    ]
})