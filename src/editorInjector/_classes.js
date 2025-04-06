/**
 * @private
 * @description Add all inner classes to the editor instance.
 * @param {__se__EditorCore} editor - The root editor instance
 */
function ClassInjector(editor) {
	/** @description Toolbar class instance @type {__se__EditorCore['toolbar']} */
	this.toolbar = editor.toolbar;
	/** @description Sub-Toolbar class instance @type {__se__EditorCore['subToolbar']|null} */
	this.subToolbar = null;
	if (editor.subToolbar) this.subToolbar = editor.subToolbar;
	/** @description Char class instance @type {__se__EditorCore['char']} */
	this.char = editor.char;
	/** @description Component class instance @type {__se__EditorCore['component']} */
	this.component = editor.component;
	/** @description Format class instance @type {__se__EditorCore['format']} */
	this.format = editor.format;
	/** @description HTML class instance @type {__se__EditorCore['html']} */
	this.html = editor.html;
	/** @description Menu class instance @type {__se__EditorCore['menu']} */
	this.menu = editor.menu;
	/** @description NodeTransform class instance @type {__se__EditorCore['nodeTransform']} */
	this.nodeTransform = editor.nodeTransform;
	/** @description Offset class instance @type {__se__EditorCore['offset']} */
	this.offset = editor.offset;
	/** @description Selection class instance @type {__se__EditorCore['selection']} */
	this.selection = editor.selection;
	/** @description Shortcuts class instance @type {__se__EditorCore['shortcuts']} */
	this.shortcuts = editor.shortcuts;
	/** @description UI class instance @type {__se__EditorCore['ui']} */
	this.ui = editor.ui;
	/** @description Viewer class instance @type {__se__EditorCore['viewer']} */
	this.viewer = editor.viewer;
}

export default ClassInjector;
