/**
 * @description Add all inner classes to the editor;
 * @param {any} editor Editor object
 * @private
 */
function ClassDependency(editor) {
	// class
	if (this !== editor.char) this.char = editor.char;
	if (this !== editor.component) this.component = editor.component;
	if (this !== editor.format) this.format = editor.format;
	if (this !== editor.html) this.html = editor.html;
	if (this !== editor.menu) this.menu = editor.menu;
	if (this !== editor.node) this.node = editor.node;
	if (this !== editor.notice) this.notice = editor.notice;
	if (this !== editor.offset) this.offset = editor.offset;
	if (this !== editor.selection) this.selection = editor.selection;
	if (this !== editor.shortcuts) this.shortcuts = editor.shortcuts;
	if (this !== editor.toolbar) this.toolbar = editor.toolbar;
	if (this !== editor.viewer) this.viewer = editor.viewer;
}

export default ClassDependency;
