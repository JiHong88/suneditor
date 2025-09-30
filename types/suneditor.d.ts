declare namespace _default {
	/**
	 * Returns the create function with preset options.
	 * If the options overlap, the options of the 'create' function take precedence.
	 * @param {EditorInitOptions_suneditor} init_options - Initialization options
	 * @returns {{create: (targets: Element|Object<string, {target: Element, options: EditorFrameOptions_suneditor}>, options: EditorInitOptions_suneditor) => Editor}}}
	 */
	function init(init_options: EditorInitOptions_suneditor): {
		create: (
			targets:
				| Element
				| {
						[x: string]: {
							target: Element;
							options: EditorFrameOptions_suneditor;
						};
				  },
			options: EditorInitOptions_suneditor
		) => Editor;
	};
	/**
	 * Creates a new instance of the SunEditor
	 * @param {Element|string|Object<string, {target: Element, options: EditorFrameOptions_suneditor}>} target
	 * - Element: The direct DOM element to initialize the editor on.
	 * - string: A CSS selector string. The corresponding element is selected using `document.querySelector`.
	 * - Object: For multi-root setup. Each key maps to a config with `{target, options}`.
	 * @param {EditorInitOptions_suneditor} options - Initialization options
	 * @param {EditorInitOptions_suneditor} [_init_options] - Optional preset initialization options
	 * @returns {Editor} - Instance of the SunEditor
	 * @throws {Error} If the target element is not provided or is invalid
	 */
	function create(
		target:
			| Element
			| string
			| {
					[x: string]: {
						target: Element;
						options: EditorFrameOptions_suneditor;
					};
			  },
		options: EditorInitOptions_suneditor,
		_init_options?: EditorInitOptions_suneditor
	): Editor;
}
export default _default;
export type EditorFrameOptions_suneditor = import('./core/config/options').EditorFrameOptions;
export type EditorInitOptions_suneditor = import('./core/config/options').EditorInitOptions;
import Editor from './core/editor';
import editorInjector from './editorInjector';
import helper from './helper';
import langs from './langs';
import modules from './modules';
import plugins from './plugins';
export { editorInjector, helper, langs, modules, plugins };
