import './assets/suneditor.css';
import './assets/suneditor-content.css';

import suneditor from './suneditor';
import helper from './helper';
import plugins from './plugins';
import modules from './modules';
import EditorInterface from './interface/editor';

// for CDN
if (!window.SUNEDITOR) {
	Object.defineProperty(window, 'SUNEDITOR', {
		enumerable: true,
		writable: false,
		configurable: false,
		value: {
			editor: suneditor,
			helper: helper,
			plugins: plugins,
			modules: modules,
			editorInterface: EditorInterface
		}
	});
}
