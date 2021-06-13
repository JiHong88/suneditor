import CoreInterface from "./_core";

function Editor(editor) {
	CoreInterface.call(this, editor);
	// classes
	this.char = editor.char;
	this.component = editor.component;
	this.events = editor.events;
	this.format = editor.format;
	this.node = editor.node;
	this.notice = editor.notice;
	this.selection = editor.selection;
	this.shortcuts = editor.shortcuts;
	this.toolbar = editor.toolbar;
}

export default Editor;
