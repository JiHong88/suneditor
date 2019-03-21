'use strict';

import './assets/css/suneditor.css';
import './assets/css/suneditor-contents.css';

import plugins from './plugins';
import suneditor from './suneditor';

window.SUNEDITOR = suneditor.init({
    plugins: plugins
});