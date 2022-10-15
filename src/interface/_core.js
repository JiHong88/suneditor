/**
 * @description Add default properties to the editor core;
 * @param {any} editor Editor's core
 * @private
 */
function CoreInterface(editor) {
	this.editor = editor;
	this._w = editor._w;
	this._d = editor._d;
	this._ww = editor._ww;
	this._wd = editor._wd;
	this.options = editor.options;
	this.plugins = editor.plugins;
	this.context = editor.context;
	this.icons = editor.icons;
	this.lang = editor.lang;
	this.status = editor.status;
	this.eventManager = editor.eventManager;
	this.history = editor.history;
	this.events = editor.events;
	this.shadowRoot = editor.shadowRoot;
	this.wwComputedStyle = editor.wwComputedStyle;
}

export default CoreInterface;
