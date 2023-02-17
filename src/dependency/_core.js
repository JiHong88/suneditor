/**
 * @description Add default properties to the editor core;
 * @param {any} editor Editor's core
 * @private
 */
function CoreDependency(editor) {
	this.editor = editor;
	this._w = editor._w;
	this._d = editor._d;
	// status, plugins..
	this.plugins = editor.plugins;
	this.status = editor.status;
	this.context = editor.context;
	this.options = editor.options;
	this.events = editor.events;
	this.icons = editor.icons;
	this.lang = editor.lang;
	this.helper = editor.helper;
	// base
	this.eventManager = editor.eventManager;
	this.history = editor.history;
	// shadow root
	this._shadowRoot = editor._shadowRoot;
}

export default CoreDependency;
