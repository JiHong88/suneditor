import type {} from '../../typedef';
export default InstanceCheck;
/**
 * @description iframe-safe instanceof check utility class
 */
declare class InstanceCheck {
	/**
	 * @constructor
	 * @param {SunEditor.FrameContext} frameContext - Frame context
	 */
	constructor(frameContext: SunEditor.FrameContext);
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
	#private;
}
