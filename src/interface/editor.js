import CoreInterface from "./_core";

function Editor(editor) {
	CoreInterface.call(this, editor);
	this.char = editor.char;
	this.events = editor.events;
	this.format = editor.format;
	this.notice = editor.notice;
	this.selection = editor.selection;
}

export default Editor;
