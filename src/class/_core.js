/**
 * @description Add default properties to the editor core;
 * @param {any} core Editor's core
 * @private
 */
function CoreInterface(core) {
	this.editor = core;
	this._w = core._w;
	this._d = core._d;
	this._ww = core._ww;
	this._wd = core._wd;
	this.eventManager = core.eventManager;
	this.options = core.options;
	this.plugins = core.plugins;
	this.context = core.context;
	this.icons = core.icons;
	this.lang = core.lang;
	this.history = core.history;
	this.helper = core.helper;
	this.status = core.status;
	this.events = core.events;
	this.shadowRoot = core.shadowRoot;
	this.wwComputedStyle = core.wwComputedStyle;
}

export default CoreInterface;
