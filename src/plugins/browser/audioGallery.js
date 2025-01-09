import EditorInjector from '../../editorInjector';
import { Browser } from '../../modules';

const AudioGallery = function (editor, pluginOptions) {
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
};

AudioGallery.key = 'audioGallery';
AudioGallery.type = 'browser';
AudioGallery.className = '';
AudioGallery.prototype = {
	/**
	 * @description Open audio gallery
	 */
	open(inputTarget) {
		this.inputTarget = inputTarget;
		this.browser.open();
	},

	/**
	 * @description Close audio gallery
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
