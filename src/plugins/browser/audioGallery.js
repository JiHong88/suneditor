import { PluginBrowser } from '../../interfaces';
import { Browser } from '../../modules/contract';

/**
 * @typedef {Object} AudioGalleryPluginOptions
 * @property {Array<SunEditor.Module.Browser.File>} [data] - Direct data without server calls
 * @property {string} [url] - Server request URL
 * @property {Object<string, string>} [headers] - Server request headers
 * @property {string|((item: SunEditor.Module.Browser.File) => string)} [thumbnail] - Default thumbnail
 */

/**
 * @class
 * @description Audio gallery plugin
 */
class AudioGallery extends PluginBrowser {
	static key = 'audioGallery';
	static className = '';

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The core kernel
	 * @param {AudioGalleryPluginOptions} pluginOptions
	 */
	constructor(kernel, pluginOptions) {
		// plugin bisic properties
		super(kernel);
		this.title = this.$.lang.audioGallery;
		this.icon = 'audio_gallery';

		// members
		this.onSelectfunction = null;

		// modules
		const thumbnail = typeof pluginOptions.thumbnail === 'string' ? pluginOptions.thumbnail : this.$.icons.audio_thumbnail;
		this.browser = new Browser(this, this.$, {
			title: this.$.lang.audioGallery,
			data: pluginOptions.data,
			url: pluginOptions.url,
			headers: pluginOptions.headers,
			selectorHandler: this.#SetItem.bind(this),
			columnSize: 4,
			className: 'se-audio-gallery',
			thumbnail: typeof pluginOptions.thumbnail === 'function' ? pluginOptions.thumbnail : () => thumbnail,
		});
	}

	/**
	 * @override
	 * @type {PluginBrowser['open']}
	 */
	open(onSelectfunction) {
		this.onSelectfunction = onSelectfunction;
		this.browser.open();
	}

	/**
	 * @override
	 * @type {PluginBrowser['close']}
	 */
	close() {
		this.onSelectfunction = null;
		this.browser.close();
	}

	/**
	 * @description Set browser item
	 * @param {HTMLElement} target - Target element
	 */
	#SetItem(target) {
		if (this.onSelectfunction) {
			this.onSelectfunction(target);
		} else {
			this.$.plugins.audio.modalInit();
			this.$.plugins.audio.submitURL(target.getAttribute('data-command'));
		}
	}
}

export default AudioGallery;
