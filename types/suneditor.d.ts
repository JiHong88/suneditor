import type {} from './typedef';
declare namespace _default {
	/**
	 * Returns the create function with preset options.
	 * If the options overlap, the options of the `create` function take precedence.
	 * @example
	 * // Preset common options, then create multiple editors
	 * const preset = SUNEDITOR.init({
	 *   plugins: [image, link],
	 *   buttonList: [['bold', 'italic'], ['image', 'link']],
	 * });
	 * const editor1 = preset.create('#editor1', { height: '300px' });
	 * const editor2 = preset.create('#editor2', { height: '500px' });
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
			options: SunEditor.InitOptions,
		) => SunEditor.Instance;
	};
	/**
	 * Creates a new instance of the SunEditor
	 * @example
	 * // Create with a DOM element
	 * const editor = SUNEDITOR.create(document.getElementById('editor'), {
	 *   buttonList: [['bold', 'italic', 'underline']],
	 * });
	 *
	 * // Create with a CSS selector
	 * const editor = SUNEDITOR.create('#editor', { height: '400px' });
	 *
	 * // Create multi-root editor
	 * const editor = SUNEDITOR.create({
	 *   header: { target: document.getElementById('header') },
	 *   body: { target: document.getElementById('body'), options: { height: '500px' } },
	 * });
	 * @param {Element|string|Object<string, {target: Element, options: SunEditor.InitFrameOptions}>} target
	 * - `Element`: The direct DOM element to initialize the editor on.
	 * - `string`: A CSS selector string. The corresponding element is selected using `document.querySelector`.
	 * - `Object`: For multi-root setup. Each key maps to a config with `{target, options}`.
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
		_init_options?: SunEditor.InitOptions,
	): SunEditor.Instance;
}
export default _default;
import plugins from './plugins';
export namespace modules {
	export { moduleContract as contract };
	export { moduleManager as manager };
	export { moduleUI as ui };
}
import helper from './helper';
import * as interfaces from './interfaces';
import langs from './langs';
import * as moduleContract from './modules/contract';
import * as moduleManager from './modules/manager';
import * as moduleUI from './modules/ui';
export { helper, interfaces, langs, plugins };
