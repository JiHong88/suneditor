/**
 * @description Add default properties to the editor core;
 * @param {any} editor Editor's core
 * @private
 */
function CoreDependency(editor) {
	this.editor = editor;
	this._w = editor._w;
	this._d = editor._d;
	this.plugins = editor.plugins;
	this.status = editor.status;
	this.context = editor.context;
	this.options = editor.options;
	this.frameContext = editor.frameContext;
	this.frameOptions = editor.frameOptions;
	this.eventManager = editor.eventManager;
	this.events = editor.events;
	this.history = editor.history;
	this.icons = editor.icons;
	this.lang = editor.lang;
	this.helper = editor.helper;
	this._shadowRoot = editor._shadowRoot;
}

export default CoreDependency;
