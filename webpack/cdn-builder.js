require('../src/assets/suneditor.css');
require('../src/assets/suneditor-contents.css');

import suneditor, { EditorInjector, Plugins, Modules, Helper } from '../src/suneditor';

Object.defineProperty(window, 'SUNEDITOR', {
	enumerable: true,
	writable: false,
	configurable: false,
	value: {
		...suneditor,
		EditorInjector,
		Plugins,
		Modules,
		Helper
	}
});
