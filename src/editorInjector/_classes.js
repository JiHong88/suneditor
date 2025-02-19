/**
 * @private
 * @description Add all inner classes to the editor instance.
 * @param {EditorCore} editor - The root editor instance
 */
function ClassInjector(editor) {
	/** @description Toolbar class instance @type {EditorCore['toolbar']} */
	this.toolbar = editor.toolbar;
	/** @description Sub-Toolbar class instance @type {EditorCore['subToolbar']|null} */
	this.subToolbar = null;
	if (editor.subToolbar) this.subToolbar = editor.subToolbar;
	/** @description Char class instance @type {EditorCore['char']} */
	this.char = editor.char;
	/** @description Component class instance @type {EditorCore['component']} */
	this.component = editor.component;
	/** @description Format class instance @type {EditorCore['format']} */
	this.format = editor.format;
	/** @description HTML class instance @type {EditorCore['html']} */
	this.html = editor.html;
	/** @description Menu class instance @type {EditorCore['menu']} */
	this.menu = editor.menu;
	/** @description NodeTransform class instance @type {EditorCore['nodeTransform']} */
	this.nodeTransform = editor.nodeTransform;
	/** @description Offset class instance @type {EditorCore['offset']} */
	this.offset = editor.offset;
	/** @description Selection class instance @type {EditorCore['selection']} */
	this.selection = editor.selection;
	/** @description Shortcuts class instance @type {EditorCore['shortcuts']} */
	this.shortcuts = editor.shortcuts;
	/** @description UI class instance @type {EditorCore['ui']} */
	this.ui = editor.ui;
	/** @description Viewer class instance @type {EditorCore['viewer']} */
	this.viewer = editor.viewer;
}

export default ClassInjector;
