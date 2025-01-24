import Editor from './core/editor';

import EditorInjector from './editorInjector';
import Plugins from './plugins';
import Langs from './langs';
import Modules from './modules';
import Helper from './helper';

export const editorInjector = EditorInjector;
export const plugins = Plugins;
export const modules = Modules;
export const langs = Langs;
export const helper = Helper;

export default {
	/**
	 * @description Returns the create function with preset options.
	 * If the options overlap, the options of the 'create' function take precedence.
	 * @param {Json} options Initialization options
	 * @returns {object}
	 */
	init(init_options) {
		return {
			create: (targets, options) => this.create(targets, options, init_options)
		};
	},

	/**
	 * @description Create the suneditor
	 * @param {string|Element|Array.<string|Element>} target textarea Id or textarea element
	 * @param {JSON|object} options user options
	 * @returns {object}
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
