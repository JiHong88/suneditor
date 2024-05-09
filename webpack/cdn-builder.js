require('../src/assets/suneditor.css');
require('../src/assets/suneditor-contents.css');

import suneditor, { editorInjector, plugins, modules, helper } from '../src/suneditor';

Object.defineProperty(window, 'SUNEDITOR', {
	enumerable: true,
	writable: false,
	configurable: false,
	value: {
		...suneditor,
		editorInjector,
		plugins,
		modules,
		helper
	}
});
