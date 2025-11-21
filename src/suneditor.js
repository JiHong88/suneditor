import Editor from './core/editor';

import plugins from './plugins';
import * as moduleContracts from './modules/contracts';
import * as moduleUtils from './modules/utils';
import helper from './helper';
import langs from './langs';
import interfaces from './interfaces';

const modules = {
	contracts: moduleContracts,
	utils: moduleUtils,
};

/**
 * @module SunEditorExports
 */
export { plugins, modules, helper, langs, interfaces };

/**
 * SunEditor Factory Object
 * @namespace SunEditor
 */
export default {
	/**
	 * Returns the create function with preset options.
	 * If the options overlap, the options of the 'create' function take precedence.
	 * @param {SunEditor.InitOptions} init_options - Initialization options
	 * @returns {{create: (targets: Element|Object<string, {target: Element, options: SunEditor.InitFrameOptions}>, options: SunEditor.InitOptions) => SunEditor.Instance}}}
	 */
	init(init_options) {
		return {
			create: (targets, options) => this.create(targets, options, init_options),
		};
	},

	/**
	 * Creates a new instance of the SunEditor
	 * @param {Element|string|Object<string, {target: Element, options: SunEditor.InitFrameOptions}>} target
	 * - Element: The direct DOM element to initialize the editor on.
	 * - string: A CSS selector string. The corresponding element is selected using `document.querySelector`.
	 * - Object: For multi-root setup. Each key maps to a config with `{target, options}`.
	 * @param {SunEditor.InitOptions} options - Initialization options
	 * @param {SunEditor.InitOptions} [_init_options] - Optional preset initialization options
	 * @returns {SunEditor.Instance} - Instance of the SunEditor
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

		if (!target) throw Error('[SUNEDITOR.create.fail] The first parameter "target" is missing.');

		const multiTargets = [];
		if (typeof target === 'string') {
			const t = document.querySelector(target);
			if (!t) throw Error(`[SUNEDITOR.create.fail]-[document.querySelector(${target})] Cannot find target element. Make sure "${target}" is a valid selector and exists in the document.`);
			multiTargets.push({ key: null, target: t });
		} else if (target.nodeType === 1) {
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
	},
};
