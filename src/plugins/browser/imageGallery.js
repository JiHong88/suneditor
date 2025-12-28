import { PluginBrowser } from '../../interfaces';
import { Browser } from '../../modules/contract';

/**
 * @typedef ImageGalleryPluginOptions
 * @property {Array<*>} [data] - Direct data without server calls
 * @property {string} [url] - Server request URL
 * @property {Object<string, string>} [headers] - Server request headers
 */

/**
 * @class
 * @description Image gallery plugin
 */
class ImageGallery extends PluginBrowser {
	static key = 'imageGallery';
	static className = '';

	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {ImageGalleryPluginOptions} pluginOptions
	 */
	constructor(editor, pluginOptions) {
		// plugin bisic properties
		super(editor);
		this.title = this.lang.imageGallery;
		this.icon = 'image_gallery';

		// members
		this.onSelectfunction = null;

		// modules
		this.browser = new Browser(this, {
			title: this.lang.imageGallery,
			data: pluginOptions.data,
			url: pluginOptions.url,
			headers: pluginOptions.headers,
			selectorHandler: this.#SetItem.bind(this),
			columnSize: 4,
			className: 'se-image-gallery',
		});

		// members
		this.width = this.plugins.image.pluginOptions.defaultWidth === 'auto' ? '' : this.plugins.image.pluginOptions.defaultWidth;
		this.height = this.plugins.image.pluginOptions.defaultHeight === 'auto' ? '' : this.plugins.image.pluginOptions.defaultHeight;
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
	 * @param {HTMLImageElement} target - Target element
	 */
	#SetItem(target) {
		if (this.onSelectfunction) {
			this.onSelectfunction(target);
		} else {
			const file = { name: target.getAttribute('data-name'), size: 0 };
			this.plugins.image.modalInit();
			this.plugins.image.create(target.getAttribute('data-command'), null, this.width, this.height, 'none', file, target.alt, true);
		}
	}
}

export default ImageGallery;
