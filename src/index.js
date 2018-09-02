import suneditor from './suneditor'
import font from './plugins/submenu/font'

suneditor.create('editor', {
    buttonList: [
        [font, 'bold', 'italic']
    ]
})