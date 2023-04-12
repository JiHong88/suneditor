require('../src/assets/suneditor.css');
require('../src/assets/suneditor-content.css');

import suneditor, { EditorInjector, plugins, modules, langs, helper } from '../src/suneditor';

if (!window.SUNEDITOR) {
	Object.defineProperty(window, 'SUNEDITOR', {
		enumerable: true,
		writable: false,
		configurable: false,
		value: {
			inst: suneditor,
			EditorInjector: EditorInjector,
			plugins: plugins,
			modules: modules,
			langs: langs,
			helper: helper
		}
	});
}
