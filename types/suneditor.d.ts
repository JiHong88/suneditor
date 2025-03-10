/**
 * @module SunEditorExports
 */
/**
 * @typedef {import('./core/section/constructor').EditorFrameOptions} EditorFrameOptions
 */
/**
 * Editor Injector module, Inject "editor" and basic frequently used objects by calling it with "call(this, editor)".
 * @type {(...args: *) => *}
 */
export const editorInjector: (...args: any) => any;
/**
 * Available editor plugins
 * @type {Object<string, *>}
 */
export const plugins: {
	[x: string]: any;
};
/**
 * Editor modules
 * @type {{[key: string]: ((...args: *) => *)|Map}}
 */
export const modules: {
	[key: string]: ((...args: any) => any) | Map<any, any>;
};
/**
 * Language packs for the editor
 * @type {Object<string, Object<string, string> | ((...args: *) => *)>}
 */
export const langs: {
	[x: string]:
		| {
				[x: string]: string;
		  }
		| ((...args: any) => any);
};
/**
 * Helper functions for the editor
 * @type {Object<string|symbol, Object<string, ((...args: *) => *)>>}
 */
export const helper: any;
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
import Editor from './core/editor';
