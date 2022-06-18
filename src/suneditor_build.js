'use strict';

import './assets/suneditor.css';
import './assets/suneditor-content.css';

import suneditor from './suneditor';
import plugins from './plugins';
import EditorInterface from './interface/editor';
import EditorClass from './class';

// for CDN
if (!window.SUNEDITOR) {
	Object.defineProperty(window, 'SUNEDITOR', {
		enumerable: true,
		writable: false,
		configurable: false,
		value: {
			editor: suneditor,
			plugins: plugins,
			editorClass: EditorClass,
			editorInterface: EditorInterface
		}
	});
}
