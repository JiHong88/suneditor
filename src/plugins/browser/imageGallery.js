import EditorInjector from '../../editorInjector';
import { Browser } from '../../modules';

/**
 * @class
 * @extends EditorInjector
 * @description Image gallery plugin
 */
class ImageGallery extends EditorInjector {
	static key = 'imageGallery';
	static type = 'browser';
	static className = '';

	/**
	 * @constructor
	 * @param {EditorCore} editor - The root editor instance
	 * @param {Object} pluginOptions
	 * @param {Array<*>=} pluginOptions.data - direct data without server calls
	 * @param {string=} pluginOptions.url - server request url
	 * @param {Object<string, string>=} pluginOptions.headers - server request headers
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
			className: 'se-image-gallery'
		});

		// members
		this.width = this.plugins.image.pluginOptions.defaultWidth === 'auto' ? '' : this.plugins.image.pluginOptions.defaultWidth;
		this.height = this.plugins.image.pluginOptions.defaultHeight === 'auto' ? '' : this.plugins.image.pluginOptions.defaultHeight;
	}

	/**
	 * @editorMethod Modules.Browser
	 * @description Executes the method that is called when a "Browser" module's is opened.
	 * @param {?(targe: Node) => *=} onSelectfunction method to be executed after selecting an item in the gallery
	 */
	open(onSelectfunction) {
		this.onSelectfunction = onSelectfunction;
		this.browser.open();
	}

	/**
	 * @editorMethod Modules.Browser
	 * @description Executes the method that is called when a "Browser" module's is closed.
	 */
	close() {
		this.onSelectfunction = null;
		this.browser.close();
	}

	/**
	 * @description Set browser item
	 * @param {Node} target - Target element
	 */
	#SetItem(target) {
		if (this.onSelectfunction) {
			this.onSelectfunction(target);
		} else {
			const file = { name: target.getAttribute('data-name'), size: 0 };
			this.plugins.image.init();
			this.plugins.image.create(target.getAttribute('data-command'), null, this.width, this.height, 'none', file, target.alt);
		}
	}
}

export default ImageGallery;
