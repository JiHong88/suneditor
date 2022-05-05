/**
 * @description Add default properties to the editor core;
 * @param {any} core Editor's core
 * @private
 */
function CoreInterface(core) {
	this.core = core;
	this._w = core._w;
	this._d = core._d;
	this._ww = core._ww;
	this._wd = core._wd;
	this.plugins = core.plugins;
	this.status = core.status;
	this.context = core.context;
	this.options = core.options;
	this.history = core.history;
	this.lang = core.lang;
	this.icons = core.icons;
	this.helper = core.helper;
	this.shadowRoot = core.shadowRoot;
}

export default CoreInterface;
