import Core from './lib/core';

import EditorInterface from './interface';
import Plugins from './plugins';
import Langs from './langs';
import Modules from './modules';

export const editorInterface = EditorInterface;
export const plugins = Plugins;
export const langs = Langs;
export const modules = Modules;

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

		const editorTargets = [];
		target = typeof target !== 'string' && target.length > -1 ? target : [target];
		for (let i = 0, len = target.length, t, e; i < len; i++) {
			t = target[i];
			e = typeof t === 'string' ? document.getElementById(t) : t;
			if (!e) {
				if (typeof t === 'string') throw Error('[SUNEDITOR.create.fail] The element for that id was not found (ID:"' + t + '")');
				throw Error("[SUNEDITOR.create.fail] suneditor requires textarea's element or id value");
			}
			editorTargets.push(e);
		}

		return new Core(editorTargets, options);
	}
};
