require('../src/assets/suneditor.css');
require('../src/assets/suneditor-content.css');

import suneditor from '../src/suneditor';
import helper from '../src/helper';
import plugins from '../src/plugins';
import modules from '../src/modules';
import EditorInterface from '../src/interface/editor';

if (!window.SUNEDITOR) {
	Object.defineProperty(window, 'SUNEDITOR', {
		enumerable: true,
		writable: false,
		configurable: false,
		value: {
			inst: suneditor,
			helper: helper,
			plugins: plugins,
			modules: modules,
			editorInterface: EditorInterface
		}
	});
}
