export default InstanceCheck;
export type InstanceCheckThis = InstanceCheck;
/**
 * @typedef {InstanceCheck} InstanceCheckThis
 */
/**
 * @constructor
 * @this {InstanceCheck}
 * @description iframe-safe instanceof check utility class
 * @param {__se__EditorCore} editor - The root editor instance
 */
declare function InstanceCheck(this: InstanceCheck, editor: __se__EditorCore): void;
declare class InstanceCheck {
	/**
	 * @typedef {InstanceCheck} InstanceCheckThis
	 */
	/**
	 * @constructor
	 * @this {InstanceCheck}
	 * @description iframe-safe instanceof check utility class
	 * @param {__se__EditorCore} editor - The root editor instance
	 */
	constructor(this: InstanceCheck, editor: __se__EditorCore);
	editor: import('../editor').default;
	/**
	 * @param {*} obj
	 * @returns {obj is Node}
	 */
	isNode(obj: any): obj is Node;
	/**
	 * @param {*} obj
	 * @returns {obj is Element}
	 */
	isElement(obj: any): obj is Element;
	/**
	 * @param {*} obj
	 * @returns {obj is Range}
	 */
	isRange(obj: any): obj is Range;
	/**
	 * @param {*} obj
	 * @returns {obj is Selection}
	 */
	isSelection(obj: any): obj is Selection;
	/**
	 * @private
	 * @returns {window}
	 */
	_getFrameWindow(): Window & typeof globalThis;
}
