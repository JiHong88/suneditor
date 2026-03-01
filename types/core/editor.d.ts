import type {} from '../typedef';
export default Editor;
/**
 * @description SunEditor class.
 */
declare class Editor {
	/**
	 * @constructor
	 * @description SunEditor constructor function.
	 * @param {Array<{target: Element, key: *, options: SunEditor.InitFrameOptions}>} multiTargets Target element
	 * @param {SunEditor.InitOptions} options options
	 */
	constructor(
		multiTargets: Array<{
			target: Element;
			key: any;
			options: SunEditor.InitFrameOptions;
		}>,
		options: SunEditor.InitOptions,
	);
	/** @type {SunEditor.Deps} */
	$: SunEditor.Deps;
	/**
	 * @description Checks if the content of the editor is empty.
	 * - Display criteria for "placeholder".
	 * @param {?SunEditor.FrameContext} [fc] Frame context, if not present, currently selected frame context.
	 * @returns {boolean}
	 */
	isEmpty(fc?: SunEditor.FrameContext | null): boolean;
	/**
	 * @description Add or reset option property (Editor is reloaded)
	 * @example
	 * // Change toolbar buttons and height
	 * editor.resetOptions({
	 *   buttonList: [['bold', 'italic'], ['image']],
	 *   height: '500px',
	 * });
	 * @param {SunEditor.InitOptions} newOptions Options
	 */
	resetOptions(newOptions: SunEditor.InitOptions): void;
	/**
	 * @description Change the current root index.
	 * @example
	 * // Switch to the 'body' frame in a multi-root editor
	 * editor.changeFrameContext('body');
	 *
	 * // Switch back to the 'header' frame
	 * editor.changeFrameContext('header');
	 * @param {*} rootKey Root frame key.
	 */
	changeFrameContext(rootKey: any): void;
	/**
	 * @description Destroy the suneditor
	 */
	destroy(): any;
	events: any;
	#private;
}
