import EditorInjector from '../../editorInjector';
import { Browser } from '../../modules';

const ImageGallery = function (editor, pluginOptions) {
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
};

ImageGallery.key = 'imageGallery';
ImageGallery.type = 'browser';
ImageGallery.className = '';
ImageGallery.prototype = {
	/**
	 * @description Open image gallery
	 */
	open(inputTarget) {
		this.inputTarget = inputTarget;
		this.browser.open();
	},

	/**
	 * @description Close image gallery
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
