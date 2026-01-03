/**
 * @description iframe-safe instanceof check utility class
 */
class InstanceCheck {
	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 */
	constructor(editor) {
		this.editor = editor;
	}

	/**
	 * @param {*} obj
	 * @returns {obj is Node}
	 */
	isNode(obj) {
		// Check nodeType first for cross-context compatibility (e.g., elements created from main document in iframe mode)
		return (obj && typeof obj.nodeType === 'number') || obj instanceof this.#getFrameWindow().Node;
	}

	/**
	 * @param {*} obj
	 * @returns {obj is Element}
	 */
	isElement(obj) {
		// Check nodeType === 1 for cross-context compatibility
		return (obj && obj.nodeType === 1) || obj instanceof this.#getFrameWindow().Element;
	}

	/**
	 * @param {*} obj
	 * @returns {obj is Range}
	 */
	isRange(obj) {
		// Check constructor name for cross-context compatibility
		return (obj && obj.constructor?.name === 'Range') || obj instanceof this.#getFrameWindow().Range;
	}

	/**
	 * @param {*} obj
	 * @returns {obj is Selection}
	 */
	isSelection(obj) {
		// Check constructor name for cross-context compatibility
		return (obj && obj.constructor?.name === 'Selection') || obj instanceof this.#getFrameWindow().Selection;
	}

	/**
	 * @returns {SunEditor.GlobalWindow}
	 */
	#getFrameWindow() {
		return /** @type {SunEditor.GlobalWindow} */ (this.editor.frameContext.get('_ww'));
	}
}

export default InstanceCheck;
