/**
 * @private
 * @description Add all inner classes to the editor instance.
 * @param {object} editor - The root editor instance
 */
function ClassInjector(editor) {
	this.char = editor.char;
	this.component = editor.component;
	this.format = editor.format;
	this.html = editor.html;
	this.menu = editor.menu;
	this.nodeTransform = editor.nodeTransform;
	this.offset = editor.offset;
	this.selection = editor.selection;
	this.shortcuts = editor.shortcuts;
	this.toolbar = editor.toolbar;
	this.ui = editor.ui;
	this.viewer = editor.viewer;
	if (editor.subToolbar) this.subToolbar = editor.subToolbar;
}

export default ClassInjector;
