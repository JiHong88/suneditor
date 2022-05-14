/**
 * @description Add all inner classes to the editor;
 * @param {any} editor Editor object
 * @private
 */
function ModuleInterface(editor) {
	// class
	this.char = editor.char;
	this.component = editor.component;
	this.format = editor.format;
	this.html = editor.html;
	this.node = editor.node;
	this.notice = editor.notice;
	this.offset = editor.offset;
	this.selection = editor.selection;
	this.shortcuts = editor.shortcuts;
	this.toolbar = editor.toolbar;
	this.menu = editor.menu;
}

export default ModuleInterface;
