/**
 * @private
 * @description Add all inner classes to the editor instance.
 * @param {EditorInstance} editor - The root editor instance
 */
function ClassInjector(editor) {
	/** @description Toolbar class instance @type {EditorInstance['toolbar']} */
	this.toolbar = editor.toolbar;
	/** @description Sub-Toolbar class instance @type {EditorInstance['subToolbar']|null} */
	this.subToolbar = null;
	if (editor.subToolbar) this.subToolbar = editor.subToolbar;
	/** @description Char class instance @type {EditorInstance['char']} */
	this.char = editor.char;
	/** @description Component class instance @type {EditorInstance['component']} */
	this.component = editor.component;
	/** @description Format class instance @type {EditorInstance['format']} */
	this.format = editor.format;
	/** @description HTML class instance @type {EditorInstance['html']} */
	this.html = editor.html;
	/** @description Menu class instance @type {EditorInstance['menu']} */
	this.menu = editor.menu;
	/** @description NodeTransform class instance @type {EditorInstance['nodeTransform']} */
	this.nodeTransform = editor.nodeTransform;
	/** @description Offset class instance @type {EditorInstance['offset']} */
	this.offset = editor.offset;
	/** @description Selection class instance @type {EditorInstance['selection']} */
	this.selection = editor.selection;
	/** @description Shortcuts class instance @type {EditorInstance['shortcuts']} */
	this.shortcuts = editor.shortcuts;
	/** @description UI class instance @type {EditorInstance['ui']} */
	this.ui = editor.ui;
	/** @description Viewer class instance @type {EditorInstance['viewer']} */
	this.viewer = editor.viewer;
}

export default ClassInjector;
