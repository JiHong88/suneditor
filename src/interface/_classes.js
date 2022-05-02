/**
 * @description Add all inner classes to the editor;
 * @param {any} editor Editor object
 * @private
 */
function ClassesInterface(editor) {
    // class
	this.char = editor.char;
    this.component = editor.component;
    this.format = editor.format;
    this.node = editor.node;
    this.offset = editor.offset;
    this.selection = editor.selection;
    this.shortcuts = editor.shortcuts;
    this.toolbar = editor.toolbar;
    // common functions
    this.notice = editor.notice;
    this.events = editor.events;
}

export default ClassesInterface;
