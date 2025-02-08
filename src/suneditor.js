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
 * Editor Injector module, Inject "editor" and basic frequently used objects by calling it with "call(this, editor)".
 * @type {(editor: object) => void}
 */
export const editorInjector = EditorInjector;

/**
 * Available editor plugins
 * @type {object}
 */
export const plugins = Plugins;

/**
 * Editor modules
 * @type {object.<string, (element: Element) => void>}
 */
export const modules = Modules;

/**
 * Language packs for the editor
 * @type {object}
 */
export const langs = Langs;

/**
 * Helper functions for the editor
 * @type {object.<string, function(...*): *>}
 */
export const helper = Helper;

/**
 * @typedef {import('./core/section/constructor').EditorFrameOptions} EditorFrameOptions
 */

/**
 * @typedef {import('./core/section/constructor').EditorInitOptions} EditorInitOptions
 */

/**
 * SunEditor Factory Object
 * @namespace SunEditor
 */
export default {
	/**
	 * Returns the create function with preset options.
	 * If the options overlap, the options of the 'create' function take precedence.
	 * @param {EditorInitOptions} init_options - Initialization options
	 * @returns {{create: function(Element|object<string, {target: Element, options: EditorFrameOptions}>, EditorInitOptions): object}}
	 */
	init(init_options) {
		return {
			create: (targets, options) => this.create(targets, options, init_options)
		};
	},

	/**
	 * Creates a new instance of the SunEditor
	 * @param {Element|object<string, {target: Element, options: EditorFrameOptions}>} target - Target element or multi-root object
	 * @param {EditorInitOptions} options - Initialization options
	 * @param {EditorInitOptions} [_init_options] - Optional preset initialization options
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
			multiTargets.push({ target: target });
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
