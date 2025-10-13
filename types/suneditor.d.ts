declare namespace _default {
	/**
	 * Returns the create function with preset options.
	 * If the options overlap, the options of the 'create' function take precedence.
	 * @param {SunEditorOptionsType} init_options - Initialization options
	 * @returns {{create: (targets: Element|Object<string, {target: Element, options: SunEditorFrameOptionsType}>, options: SunEditorOptionsType) => Editor}}}
	 */
	function init(init_options: SunEditorOptionsType): {
		create: (
			targets:
				| Element
				| {
						[x: string]: {
							target: Element;
							options: SunEditorFrameOptionsType;
						};
				  },
			options: SunEditorOptionsType
		) => Editor;
	};
	/**
	 * Creates a new instance of the SunEditor
	 * @param {Element|string|Object<string, {target: Element, options: SunEditorFrameOptionsType}>} target
	 * - Element: The direct DOM element to initialize the editor on.
	 * - string: A CSS selector string. The corresponding element is selected using `document.querySelector`.
	 * - Object: For multi-root setup. Each key maps to a config with `{target, options}`.
	 * @param {SunEditorOptionsType} options - Initialization options
	 * @param {SunEditorOptionsType} [_init_options] - Optional preset initialization options
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
						options: SunEditorFrameOptionsType;
					};
			  },
		options: SunEditorOptionsType,
		_init_options?: SunEditorOptionsType
	): Editor;
}
export default _default;
export type SunEditorFrameOptionsType = import('./core/config/options').EditorFrameOptions;
export type SunEditorOptionsType = import('./core/config/options').EditorInitOptions;
import Editor from './core/editor';
