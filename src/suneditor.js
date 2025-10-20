import Editor from './core/editor';

import plugins from './plugins';
import modules from './modules';
import helper from './helper';
import langs from './langs';

/**
 * @module SunEditorExports
 */
export { plugins, modules, helper, langs };

// ================================================================================================================================
// === TYPE DEFINITIONS
// ================================================================================================================================

// [[ editor root ]]
/**
 * Editor initialization options.
 * Used when creating a new editor instance via `SunEditor.create()`.
 * @typedef {__se__EditorOptions} SunEditorOptions
 */

/**
 * Frame-specific options for multi-root editors.
 * Each frame can have its own width, height, placeholder, and other frame-level settings.
 * @typedef {__se__EditorFrameOptions} SunEditorFrameOptions
 */

/**
 * Type definition for the SunEditor instance.
 * This is the return type of `SunEditor.create()`.
 * @typedef {__se__EditorCore} SunEditorCore
 */

// [[ component ]]
/**
 * Information about a component (image, video, table, etc.) in the editor.
 * Contains properties like target element, plugin name, options, and container references.
 * @typedef {__se__ComponentInfo} SunEditorComponentInfo
 */

// [[ plugin event ]]
/**
 * Parameters passed to plugin mouse event handlers.
 * Includes the frame context and the mouse event object.
 * @typedef {__se__PluginMouseEventInfo} SunEditorPluginMouseEvent
 */

/**
 * Parameters passed to plugin keyboard event handlers.
 * Includes the frame context, keyboard event, current range, and line element.
 * @typedef {__se__PluginKeyEventInfo} SunEditorPluginKeyEvent
 */

/**
 * Parameters passed when a toolbar input value changes.
 * Includes the target input element, event object, and the new value.
 * @typedef {__se__PluginToolbarInputChangeEventInfo} SunEditorPluginToolbarInputChange
 */

/**
 * Information passed to shortcut handlers.
 * Includes range, line element, shortcut info, event object, and key code.
 * @typedef {__se__PluginShortcutInfo} SunEditorPluginShortcut
 */

/**
 * Parameters passed to plugin paste event handlers.
 * Includes frame context, clipboard event, cleaned HTML data, and parsed document.
 * @typedef {__se__PluginPasteParams} SunEditorPluginPaste
 */

/**
 * Parameters passed when copying a component.
 * Includes the clipboard event, cloned container, and component info.
 * @typedef {__se__PluginCopyComponentParams} SunEditorPluginCopyComponent
 */

/**
 * @typedef {Editor} SunEditorInstance
 */

// ================================================================================================================================
// === SUNEDITOR FACTORY
// ================================================================================================================================

/**
 * SunEditor Factory Object
 * @namespace SunEditor
 */
export default {
	/**
	 * Returns the create function with preset options.
	 * If the options overlap, the options of the 'create' function take precedence.
	 * @param {SunEditorOptions} init_options - Initialization options
	 * @returns {{create: (targets: Element|Object<string, {target: Element, options: SunEditorFrameOptions}>, options: SunEditorOptions) => Editor}}}
	 */
	init(init_options) {
		return {
			create: (targets, options) => this.create(targets, options, init_options)
		};
	},

	/**
	 * Creates a new instance of the SunEditor
	 * @param {Element|string|Object<string, {target: Element, options: SunEditorFrameOptions}>} target
	 * - Element: The direct DOM element to initialize the editor on.
	 * - string: A CSS selector string. The corresponding element is selected using `document.querySelector`.
	 * - Object: For multi-root setup. Each key maps to a config with `{target, options}`.
	 * @param {SunEditorOptions} options - Initialization options
	 * @param {SunEditorOptions} [_init_options] - Optional preset initialization options
	 * @returns {SunEditorInstance} - Instance of the SunEditor
	 * @throws {Error} If the target element is not provided or is invalid
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

		if (!target) throw Error('[SUNEDITOR.create.fail] The first parameter "target" is missing.');

		const multiTargets = [];
		if (typeof target === 'string') {
			const t = document.querySelector(target);
			if (!t) throw Error(`[SUNEDITOR.create.fail]-[document.querySelector(${target})] Cannot find target element. Make sure "${target}" is a valid selector and exists in the document.`);
			multiTargets.push({ key: null, target: t });
		} else if (target.nodeType === 1) {
			multiTargets.push({ key: null, target: target });
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
