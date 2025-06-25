/**
 * @typedef {InstanceCheck} InstanceCheckThis
 */

/**
 * @constructor
 * @this {InstanceCheck}
 * @description iframe-safe instanceof check utility class
 * @param {__se__EditorCore} editor - The root editor instance
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
		return obj instanceof this._getFrameWindow().Node;
	},

	/**
	 * @param {*} obj
	 * @returns {obj is Element}
	 */
	isElement(obj) {
		return obj instanceof this._getFrameWindow().Element;
	},

	/**
	 * @param {*} obj
	 * @returns {obj is Range}
	 */
	isRange(obj) {
		return obj instanceof this._getFrameWindow().Range;
	},

	/**
	 * @param {*} obj
	 * @returns {obj is Selection}
	 */
	isSelection(obj) {
		return obj instanceof this._getFrameWindow().Selection;
	},

	/**
	 * @private
	 * @returns {window}
	 */
	_getFrameWindow() {
		return this.editor.frameContext.get('_ww');
	},

	constructor: InstanceCheck
};

export default InstanceCheck;
