import EditorInjector from '../../editorInjector';
import { Browser } from '../../modules';

/**
 * @typedef {import('../../core/editor').default} EditorInstance
 */

/**
 * @class
 * @description Image gallery plugin
 * @param {EditorInstance} editor - The root editor instance
 * @param {Object} pluginOptions
 * @param {Array.<*>=} pluginOptions.data - direct data without server calls
 * @param {string=} pluginOptions.url - server request url
 * @param {Object.<string, string|number>=} pluginOptions.headers - server request headers
 * @returns {ImageGallery}
 */
function ImageGallery(editor, pluginOptions) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.imageGallery;
	this.icon = 'image_gallery';

	// modules
	this.browser = new Browser(this, {
		title: this.lang.imageGallery,
		data: pluginOptions.data,
		url: pluginOptions.url,
		headers: pluginOptions.headers,
		selectorHandler: SetItem.bind(this),
		columnSize: 4,
		className: 'se-image-gallery'
	});

	// members
	this.width = this.plugins.image.pluginOptions.defaultWidth === 'auto' ? '' : this.plugins.image.pluginOptions.defaultWidth;
	this.height = this.plugins.image.pluginOptions.defaultHeight === 'auto' ? '' : this.plugins.image.pluginOptions.defaultHeight;
}

ImageGallery.key = 'imageGallery';
ImageGallery.type = 'browser';
ImageGallery.className = '';
ImageGallery.prototype = {
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

	constructor: ImageGallery
};

function SetItem(target) {
	if (this.inputTarget) {
		this.inputTarget(target);
	} else {
		const file = { name: target.getAttribute('data-name'), size: 0 };
		this.plugins.image.init();
		this.plugins.image.create(target.getAttribute('data-command'), null, this.width, this.height, 'none', file, target.alt);
	}
}

export default ImageGallery;
