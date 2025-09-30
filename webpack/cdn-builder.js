require('../src/assets/suneditor.css');
require('../src/assets/suneditor-contents.css');

import suneditor from '../src/suneditor';
import editorInjector from '../src/editorInjector';
import plugins from '../src/plugins';
import modules from '../src/modules';
import helper from '../src/helper';

Object.defineProperty(window, 'SUNEDITOR', {
	enumerable: true,
	writable: false,
	configurable: false,
	value: {
		...suneditor, // create(), init()
		editorInjector,
		plugins,
		modules,
		helper
	}
});
