/**
 * @typedef {InstanceCheck} InstanceCheckThis
 */

/**
 * @constructor
 * @this {InstanceCheck}
 * @description iframe-safe instanceof check utility class
 * @param {SunEditor.Core} editor - The root editor instance
 */
function InstanceCheck(editor) {
	this.editor = editor;
}

InstanceCheck.prototype = {
	/**
	 * @param {*} obj
	 * @returns {obj is Node}
	 */
	isNode(obj) {
		// Check nodeType first for cross-context compatibility (e.g., elements created from main document in iframe mode)
		return (obj && typeof obj.nodeType === 'number') || obj instanceof this._getFrameWindow().Node;
	},

	/**
	 * @param {*} obj
	 * @returns {obj is Element}
	 */
	isElement(obj) {
		// Check nodeType === 1 for cross-context compatibility
		return (obj && obj.nodeType === 1) || obj instanceof this._getFrameWindow().Element;
	},

	/**
	 * @param {*} obj
	 * @returns {obj is Range}
	 */
	isRange(obj) {
		// Check constructor name for cross-context compatibility
		return (obj && obj.constructor?.name === 'Range') || obj instanceof this._getFrameWindow().Range;
	},

	/**
	 * @param {*} obj
	 * @returns {obj is Selection}
	 */
	isSelection(obj) {
		// Check constructor name for cross-context compatibility
		return (obj && obj.constructor?.name === 'Selection') || obj instanceof this._getFrameWindow().Selection;
	},

	/**
	 * @private
	 * @returns {window}
	 */
	_getFrameWindow() {
		return this.editor.frameContext.get('_ww');
	},

	constructor: InstanceCheck,
};

export default InstanceCheck;
