import suneditor from './suneditor'
import dialog from './plugins/dialog/dialog'
import link from './plugins/dialog/link'

console.log('suneditor : ', suneditor);
console.log('dialog : ', dialog);
console.log('link : ', link);

suneditor.create('editor', {
    buttonList: [
        [dialog, link, 'bold', 'italic']
    ]
})