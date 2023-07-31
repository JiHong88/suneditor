/**
 * @description Add all inner classes to the editor;
 * @param {any} editor Editor object
 * @private
 */
function ClassInjector(editor) {
	this.char = editor.char;
	this.component = editor.component;
	this.format = editor.format;
	this.html = editor.html;
	this.menu = editor.menu;
	this.nodeTransform = editor.nodeTransform;
	this.notice = editor.notice;
	this.offset = editor.offset;
	this.selection = editor.selection;
	this.shortcuts = editor.shortcuts;
	this.toolbar = editor.toolbar;
	this.viewer = editor.viewer;
	if (editor.subToolbar) this.subToolbar = editor.subToolbar;
}

export default ClassInjector;
