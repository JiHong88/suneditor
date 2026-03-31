import { PluginBrowser } from '../../interfaces';
import { Browser } from '../../modules/contract';

/**
 * @typedef {Object} FileGalleryPluginOptions
 * @property {Array<SunEditor.Module.Browser.File>} [data] - Direct data without server calls
 * @property {string} [url] - Server request URL
 * @property {Object<string, string>} [headers] - Server request headers
 * @property {string|((item: SunEditor.Module.Browser.File) => string)} [thumbnail] - Default thumbnail
 */

/**
 * @class
 * @description File gallery plugin
 */
class FileGallery extends PluginBrowser {
	static key = 'fileGallery';
	static className = '';

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {FileGalleryPluginOptions} pluginOptions
	 */
	constructor(kernel, pluginOptions) {
		// plugin bisic properties
		super(kernel);
		this.title = this.$.lang.fileGallery;
		this.icon = 'file_gallery';

		// members
		this.onSelectfunction = null;

		// modules
		const thumbnail = typeof pluginOptions.thumbnail === 'string' ? pluginOptions.thumbnail : this.$.icons.file_thumbnail;
		this.browser = new Browser(this, this.$, {
			title: this.$.lang.fileGallery,
			data: pluginOptions.data,
			url: pluginOptions.url,
			headers: pluginOptions.headers,
			selectorHandler: this.#SetItem.bind(this),
			columnSize: 4,
			className: 'se-file-gallery',
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
			const file = { name: target.getAttribute('data-name'), size: 0 };
			this.$.plugins.fileUpload.create(target.getAttribute('data-command'), file, true);
		}
	}
}

export default FileGallery;
