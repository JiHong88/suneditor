import '../src/assets/suneditor.css';
import '../src/assets/suneditor-contents.css';

import suneditor from '../src/suneditor';
import plugins from '../src/plugins';
import editorInjector from '../src/editorInjector';
import * as moduleContracts from '../src/modules/contracts';
import * as moduleUtils from '../src/modules/utils';
import helper from '../src/helper';
import interfaces from '../src/interfaces';

const modules = {
	contracts: moduleContracts,
	utils: moduleUtils,
};

Object.defineProperty(window, 'SUNEDITOR', {
	enumerable: true,
	writable: false,
	configurable: false,
	value: {
		...suneditor, // create(), init()
		plugins,
		editorInjector,
		modules,
		helper,
		interfaces,
	},
});
