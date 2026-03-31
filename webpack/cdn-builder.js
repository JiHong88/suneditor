/**
 * @warning "suneditor.js", "cdn-builder.js", "format-index.cjs" must be modified together.
 */

import '../src/assets/suneditor.css';
import '../src/assets/suneditor-contents.css';

import suneditor from '../src/suneditor';
import plugins from '../src/plugins';
import * as moduleContract from '../src/modules/contract';
import * as moduleManager from '../src/modules/manager';
import * as moduleUI from '../src/modules/ui';
import helper from '../src/helper';
import * as interfaces from '../src/interfaces';

const modules = {
	contract: moduleContract,
	manager: moduleManager,
	ui: moduleUI,
};

Object.defineProperty(window, 'SUNEDITOR', {
	enumerable: true,
	writable: false,
	configurable: false,
	value: {
		...suneditor, // create(), init()
		plugins,
		modules,
		helper,
		interfaces,
	},
});
