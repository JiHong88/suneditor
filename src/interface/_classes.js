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
    this.menu = editor.menu;
    // common functions
    this.events = editor.events;
    this.notice = editor.notice;
}

export default ClassesInterface;
