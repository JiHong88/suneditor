import Editor from './core/editor';

import EditorInjector from './editorInjector';
import Plugins from './plugins';
import Langs from './langs';
import Modules from './modules';
import Helper from './helper';

/**
 * @module SunEditorExports
 */

/**
 * @typedef {import('./core/section/constructor').EditorFrameOptions} EditorFrameOptions_suneditor
 */

/**
 * @typedef {import('./core/section/constructor').EditorInitOptions} EditorInitOptions_suneditor
 */

/**
 * Editor Injector module, Inject "editor" and basic frequently used objects by calling it with "call(this, editor)".
 */
export { EditorInjector };

/**
 * Available editor plugins
 */
export { Plugins };

/**
 * Editor modules
 */
export { Modules };

/**
 * Language packs for the editor
 */
export { Langs };

/**
 * Helper functions for the editor
 */
export { Helper };

/**
 * SunEditor Factory Object
 * @namespace SunEditor
 */
export default {
	/**
	 * Returns the create function with preset options.
	 * If the options overlap, the options of the 'create' function take precedence.
	 * @param {EditorInitOptions_suneditor} init_options - Initialization options
	 * @returns {{create: (targets: Element|Object<string, {target: Element, options: EditorFrameOptions_suneditor}>, options: EditorInitOptions_suneditor) => Editor}}}
	 */
	init(init_options) {
		return {
			create: (targets, options) => this.create(targets, options, init_options)
		};
	},

	/**
	 * Creates a new instance of the SunEditor
	 * @param {Element|Object<string, {target: Element, options: EditorFrameOptions_suneditor}>} target - Target element or multi-root object
	 * @param {EditorInitOptions_suneditor} options - Initialization options
	 * @param {EditorInitOptions_suneditor} [_init_options] - Optional preset initialization options
	 * @returns {Editor} - Instance of the SunEditor
	 * @throws {Error} If the target element is not provided or is invalid
	 */
	create(target, options, _init_options) {
		if (typeof options !== 'object') options = {};
		if (_init_options) {
			options = (() => {
				return [_init_options, options].reduce((init, option) => {
					Object.entries(option).forEach(([key, value]) => {
						if (key === 'plugins' && value && init[key]) {
							const i = Array.isArray(init[key]) ? init[key] : Object.values(init[key]);
							const o = Array.isArray(value) ? value : Object.values(value);
							init[key] = [...o.filter((val) => !i.includes(val)), ...i];
						} else {
							init[key] = value;
						}
					});
					return init;
				}, {});
			})();
		}

		if (!target) throw Error("[SUNEDITOR.create.fail] suneditor requires textarea's element");

		const multiTargets = [];
		if (target.nodeType === 1) {
			multiTargets.push({ key: null, target: target });
		} else {
			let props;
			for (const key in target) {
				props = target[key];
				if (!props.target || props.target.nodeType !== 1) throw Error('[SUNEDITOR.create.fail] suneditor multi root requires textarea\'s element at the "target" property.');
				props.key = key;
				multiTargets.push(props);
			}
		}

		return new Editor(multiTargets, options);
	}
};
