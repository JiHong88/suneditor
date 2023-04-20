import EditorInjector from '../../injector';
import { FileBrowser } from '../../modules';

const ImageGallery = function (editor) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.imageGallery;
	this.icon = 'image_gallery';

	// modules
	this.fileBrowser = new FileBrowser(this, {
		title: this.lang.imageGallery, // @Required @override fileBrowser - File browser window title.
		url: this.options.get('imageGalleryUrl'), // @Required @override fileBrowser - File server url.
		urlHeader: this.options.get('imageGalleryHeader'), // @Required @override fileBrowser - File server http header.
		listClass: 'se-image-list', // @Required @override fileBrowser - Class name of list div.
		drawItemHandler: DrawItems, // @Required @override fileBrowser - Function that defines the HTML of an file item.
		selectorHandler: SetImage.bind(this), // @Required @override fileBrowser - Function that action when item click.
		columnSize: 4 // @Option @override fileBrowser - Number of "div.se-file-item-column" to be created (default: 4)
	});

	// members
	this.width = this.options.get('imageWidth') === 'auto' ? '' : this.options.get('imageWidth');
	this.height = this.options.get('imageHeight') === 'auto' ? '' : this.options.get('imageHeight');
};

ImageGallery.key = 'imageGallery';
ImageGallery.type = 'fileBrowser';
ImageGallery.className = '';
ImageGallery.prototype = {
	/**
	 * @description Open image gallery
	 */
	open: function (inputTarget) {
		this.inputTarget = inputTarget;
		this.fileBrowser.open();
	},

	/**
	 * @description Close image gallery
	 */
	close: function () {
		this.inputTarget = null;
		this.fileBrowser.close();
	},

	constructor: ImageGallery
};

/**
 * @Required @override fileBrowser
 * @description Define the HTML of the item to be put in "div.se-file-item-column".
 * Format: [
 *      { src: "image src", name: "name(@option)", alt: "image alt(@option)", tag: "tag name(@option)" }
 * ]
 * @param {Object} item Item of the response data's array
 */
function DrawItems(item) {
	const srcName = item.src.split('/').pop();
	return (
		'<div class="se-file-item-img"><img src="' +
		(item.thumbnail || item.src) +
		'" alt="' +
		(item.alt || srcName) +
		'" data-command="' + (item.src || item.thumbnail) + '" data-value="' +
		(item.name || srcName) +
		'">' +
		'<div class="se-file-name-image se-file-name-back"></div>' +
		'<div class="se-file-name-image">' +
		(item.name || srcName) +
		'</div>' +
		'</div>'
	);
}

function SetImage(target) {
	if (this.inputTarget) {
		this.inputTarget(target);
	} else {
		const file = { name: target.getAttribute('data-value'), size: 0 };
		this.plugins.image.create(target.getAttribute('data-command'), null, this.width, this.height, 'none', file, target.alt);
	}
}

export default ImageGallery;
