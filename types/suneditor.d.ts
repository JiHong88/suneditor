import type {} from './typedef';
declare namespace _default {
	/**
	 * Returns the create function with preset options.
	 * If the options overlap, the options of the 'create' function take precedence.
	 * @param {SunEditor.InitOptions} init_options - Initialization options
	 * @returns {{create: (targets: Element|Object<string, {target: Element, options: SunEditor.InitFrameOptions}>, options: SunEditor.InitOptions) => SunEditor.Instance}}}
	 */
	function init(init_options: SunEditor.InitOptions): {
		create: (
			targets:
				| Element
				| {
						[x: string]: {
							target: Element;
							options: SunEditor.InitFrameOptions;
						};
				  },
			options: SunEditor.InitOptions
		) => SunEditor.Instance;
	};
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
	function create(
		target:
			| Element
			| string
			| {
					[x: string]: {
						target: Element;
						options: SunEditor.InitFrameOptions;
					};
			  },
		options: SunEditor.InitOptions,
		_init_options?: SunEditor.InitOptions
	): SunEditor.Instance;
}
export default _default;
import helper from './helper';
import langs from './langs';
import modules from './modules';
import plugins from './plugins';
export { helper, langs, modules, plugins };
