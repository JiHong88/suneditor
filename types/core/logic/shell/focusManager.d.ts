import type {} from '../../../typedef';
export default class FocusManager {
	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 */
	constructor(kernel: SunEditor.Kernel);
	/**
	 * @description Focus to wysiwyg area
	 * @param {*} [rootKey] Root frame key.
	 */
	focus(rootKey?: any): void;
	/**
	 * @description If "focusEl" is a component, then that component is selected; if it is a format element, the last text is selected
	 * - If "focusEdge" is null, then selected last element
	 * @param {?Node} [focusEl] Focus element
	 */
	focusEdge(focusEl?: Node | null): void;
	/**
	 * @description Focus to wysiwyg area using "native focus function"
	 */
	nativeFocus(): void;
	/**
	 * @description Focusout to wysiwyg area (.blur())
	 */
	blur(): void;
	#private;
}
