require('../src/assets/suneditor.css');
require('../src/assets/suneditor-content.css');

import suneditor, { editorInjector, plugins, modules, langs, helper } from '../src/suneditor';

if (!window.SUNEDITOR) {
	Object.defineProperty(window, 'SUNEDITOR', {
		enumerable: true,
		writable: false,
		configurable: false,
		value: {
			...suneditor,
			editorInjector,
			plugins,
			modules,
			langs,
			helper
		}
	});
}
