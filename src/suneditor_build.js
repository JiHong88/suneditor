import './assets/css/suneditor.css'
import './assets/css/suneditor-contents.css'

import plugins from './plugins'
import suneditor from './suneditor'
// import lang_ko from './lang/ko'

window.SUNEDITOR = suneditor.init({
    plugins: plugins,
    // lang: lang_ko
});