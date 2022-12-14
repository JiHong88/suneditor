import Editor from './core/editor';

import EditorDependency from './dependency';
import Plugins from './plugins';
import Langs from './langs';
import Modules from './modules';
import Helper from './helper';

export const editorDependency = EditorDependency;
export const plugins = Plugins;
export const modules = Modules;
export const langs = Langs;
export const helper = Helper;

export default {
	/**
	 * @description Returns the create function with preset options.
	 * If the options overlap, the options of the 'create' function take precedence.
	 * @param {Json} options Initialization options
	 * @returns {Object}
	 */
	init: function (init_options) {
		return {
			create: function (targets, options) {
				return this.create(targets, options, init_options);
			}.bind(this)
		};
	},

	/**
	 * @description Create the suneditor
	 * @param {string|Element|Array.<string|Element>} target textarea Id or textarea element
	 * @param {JSON|Object} options user options
	 * @returns {Object}
	 */
	create: function (target, options, _init_options) {
		if (typeof options !== 'object') options = {};
		if (_init_options) {
			options = [_init_options, options].reduce(function (init, option) {
				for (let key in option) {
					if (!option.hasOwnProperty(key)) continue;
					if (key === 'plugins' && option[key] && init[key]) {
						let i = init[key],
							o = option[key];
						i = i.length
							? i
							: Object.keys(i).map(function (name) {
									return i[name];
							  });
						o = o.length
							? o
							: Object.keys(o).map(function (name) {
									return o[name];
							  });
						init[key] = o
							.filter(function (val) {
								return i.indexOf(val) === -1;
							})
							.concat(i);
					} else {
						init[key] = option[key];
					}
				}
				return init;
			}, {});
		}

		if (!target) throw Error("[SUNEDITOR.create.fail] suneditor requires textarea's element");

		const multiTargets = [];
		if (target.nodeType === 1) {
			multiTargets.push({ target: target });
			options.multiRoot = false;
		} else {
			let props;
			for (let key in target) {
				props = target[key];
				if (!props.target || props.target.nodeType !== 1) throw Error('[SUNEDITOR.create.fail] suneditor multi root requires textarea\'s element at the "target" property.');
				props.key = key;
				multiTargets.push(props);
			}
			options.multiRoot = true;
		}

		return new Editor(multiTargets, options);
	}
};
