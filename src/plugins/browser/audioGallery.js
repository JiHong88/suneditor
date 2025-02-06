import EditorInjector from '../../editorInjector';
import { Browser } from '../../modules';

/**
 * @class
 * @description Audio gallery plugin
 * @param {object} editor - The root editor instance
 * @param {object} pluginOptions
 * @param {object} pluginOptions.data - direct data without server calls
 * @param {string} pluginOptions.url - server request url
 * @param {object=} pluginOptions.headers - server request headers
 * @param {string|Function} pluginOptions.thumbnail - default thumbnail
 */
function AudioGallery(editor, pluginOptions) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.audioGallery;
	this.icon = 'audio_gallery';

	// modules
	const thumbnail = pluginOptions.thumbnail || this.icons.audio_thumbnail;
	this.browser = new Browser(this, {
		title: this.lang.audioGallery,
		data: pluginOptions.data,
		url: pluginOptions.url,
		headers: pluginOptions.headers,
		selectorHandler: SetItem.bind(this),
		columnSize: 4,
		className: 'se-audio-gallery',
		thumbnail: typeof pluginOptions.thumbnail === 'function' ? pluginOptions.thumbnail : () => thumbnail
	});
}

AudioGallery.key = 'audioGallery';
AudioGallery.type = 'browser';
AudioGallery.className = '';
AudioGallery.prototype = {
	/**
	 * @editorMethod Modules.Browser
	 * @description Executes the method that is called when a "Browser" module's is opened.
	 * @param {Element} inputTarget First focus element when the file "Browser" is opened
	 */
	open(inputTarget) {
		this.inputTarget = inputTarget;
		this.browser.open();
	},

	/**
	 * @editorMethod Modules.Browser
	 * @description Executes the method that is called when a "Browser" module's is closed.
	 */
	close() {
		this.inputTarget = null;
		this.browser.close();
	},

	constructor: AudioGallery
};

function SetItem(target) {
	if (this.inputTarget) {
		this.inputTarget(target);
	} else {
		this.plugins.audio.init();
		this.plugins.audio.submitURL(target.getAttribute('data-command'));
	}
}

export default AudioGallery;
