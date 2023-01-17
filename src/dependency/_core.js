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
	this.rootTargets = editor.rootTargets;
	this.status = editor.status;
	this.eventManager = editor.eventManager;
	this.history = editor.history;
	this.shadowRoot = editor.shadowRoot;
	this.helper = editor.helper;
	this.events = editor.events;
	this.options = editor.options;
	this.icons = editor.icons;
	this.lang = editor.lang;
}

export default CoreDependency;
