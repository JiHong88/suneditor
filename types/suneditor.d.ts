declare namespace _default {
	/**
	 * Returns the create function with preset options.
	 * If the options overlap, the options of the 'create' function take precedence.
	 * @param {EditorInitOptions} init_options - Initialization options
	 * @returns {{create: (targets: Element|Object<string, {target: Element, options: EditorFrameOptions}>, options: EditorInitOptions) => Editor}}}
	 */
	function init(init_options: EditorInitOptions): {
		create: (
			targets:
				| Element
				| {
						[x: string]: {
							target: Element;
							options: EditorFrameOptions;
						};
				  },
			options: EditorInitOptions
		) => Editor;
	};
	/**
	 * Creates a new instance of the SunEditor
	 * @param {Element|Object<string, {target: Element, options: EditorFrameOptions}>} target - Target element or multi-root object
	 * @param {EditorInitOptions} options - Initialization options
	 * @param {EditorInitOptions} [_init_options] - Optional preset initialization options
	 * @returns {Editor} - Instance of the SunEditor
	 * @throws {Error} If the target element is not provided or is invalid
	 */
	function create(
		target:
			| Element
			| {
					[x: string]: {
						target: Element;
						options: EditorFrameOptions;
					};
			  },
		options: EditorInitOptions,
		_init_options?: EditorInitOptions
	): Editor;
}
export default _default;
export type EditorFrameOptions = import('./core/section/constructor').EditorFrameOptions;
export type EditorInitOptions = import('./core/section/constructor').EditorInitOptions;
import EditorInjector from './editorInjector';
import Plugins from './plugins';
import Modules from './modules';
import Langs from './langs';
import Helper from './helper';
import Editor from './core/editor';
export { EditorInjector, Plugins, Modules, Langs, Helper };
