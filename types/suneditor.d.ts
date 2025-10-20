import type {} from 'typedef';
declare namespace _default {
	/**
	 * Returns the create function with preset options.
	 * If the options overlap, the options of the 'create' function take precedence.
	 * @param {SunEditorOptions} init_options - Initialization options
	 * @returns {{create: (targets: Element|Object<string, {target: Element, options: SunEditorFrameOptions}>, options: SunEditorOptions) => Editor}}}
	 */
	function init(init_options: SunEditorOptions): {
		create: (
			targets:
				| Element
				| {
						[x: string]: {
							target: Element;
							options: SunEditorFrameOptions;
						};
				  },
			options: SunEditorOptions
		) => Editor;
	};
	/**
	 * Creates a new instance of the SunEditor
	 * @param {Element|string|Object<string, {target: Element, options: SunEditorFrameOptions}>} target
	 * - Element: The direct DOM element to initialize the editor on.
	 * - string: A CSS selector string. The corresponding element is selected using `document.querySelector`.
	 * - Object: For multi-root setup. Each key maps to a config with `{target, options}`.
	 * @param {SunEditorOptions} options - Initialization options
	 * @param {SunEditorOptions} [_init_options] - Optional preset initialization options
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
						options: SunEditorFrameOptions;
					};
			  },
		options: SunEditorOptions,
		_init_options?: SunEditorOptions
	): Editor;
}
export default _default;
/**
 * Editor initialization options.
 * Used when creating a new editor instance via `SunEditor.create()`.
 */
export type SunEditorOptions = __se__EditorOptions;
/**
 * Frame-specific options for multi-root editors.
 * Each frame can have its own width, height, placeholder, and other frame-level settings.
 */
export type SunEditorFrameOptions = __se__EditorFrameOptions;
/**
 * Type definition for the SunEditor instance.
 * This is the return type of `SunEditor.create()`.
 */
export type SunEditorCore = __se__EditorCore;
/**
 * Information about a component (image, video, table, etc.) in the editor.
 * Contains properties like target element, plugin name, options, and container references.
 */
export type SunEditorComponentInfo = __se__ComponentInfo;
/**
 * Parameters passed to plugin mouse event handlers.
 * Includes the frame context and the mouse event object.
 */
export type SunEditorPluginMouseEvent = __se__PluginMouseEventInfo;
/**
 * Parameters passed to plugin keyboard event handlers.
 * Includes the frame context, keyboard event, current range, and line element.
 */
export type SunEditorPluginKeyEvent = __se__PluginKeyEventInfo;
/**
 * Parameters passed when a toolbar input value changes.
 * Includes the target input element, event object, and the new value.
 */
export type SunEditorPluginToolbarInputChange = __se__PluginToolbarInputChangeEventInfo;
/**
 * Information passed to shortcut handlers.
 * Includes range, line element, shortcut info, event object, and key code.
 */
export type SunEditorPluginShortcut = __se__PluginShortcutInfo;
/**
 * Parameters passed to plugin paste event handlers.
 * Includes frame context, clipboard event, cleaned HTML data, and parsed document.
 */
export type SunEditorPluginPaste = __se__PluginPasteParams;
/**
 * Parameters passed when copying a component.
 * Includes the clipboard event, cloned container, and component info.
 */
export type SunEditorPluginCopyComponent = __se__PluginCopyComponentParams;
import Editor from './core/editor';
import helper from './helper';
import langs from './langs';
import modules from './modules';
import plugins from './plugins';
export { helper, langs, modules, plugins };
