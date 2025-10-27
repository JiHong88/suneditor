import '../src/assets/suneditor.css';
import '../src/assets/suneditor-contents.css';

import suneditor from '../src/suneditor';
import plugins from '../src/plugins';
import editorInjector from '../src/editorInjector';
import modules from '../src/modules';
import helper from '../src/helper';

Object.defineProperty(window, 'SUNEDITOR', {
	enumerable: true,
	writable: false,
	configurable: false,
	value: {
		...suneditor, // create(), init()
		plugins,
		editorInjector,
		modules,
		helper
	}
});
