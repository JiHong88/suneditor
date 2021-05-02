import CoreInterface from "./_core";

function Editor(editor) {
	CoreInterface.call(this, editor);
	this.selection = editor.selection;
}

export default Editor;
