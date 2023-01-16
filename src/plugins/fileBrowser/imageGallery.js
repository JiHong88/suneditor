import EditorDependency from '../../dependency';
import { FileBrowser } from '../../modules';

const ImageGallery = function (editor, target) {
	// plugin bisic properties
	EditorDependency.call(this, editor);
	this.target = target;
	this.title = this.lang.toolbar.imageGallery;
	this.icon = this.icons.image_gallery;

	// modules
	this.fileBrowser = new FileBrowser(this, {
		title: this.lang.toolbar.imageGallery, // @Required @override fileBrowser - File browser window title.
		url: this.options.get('imageGalleryUrl'), // @Required @override fileBrowser - File server url.
		urlHeader: this.options.get('imageGalleryHeader'), // @Required @override fileBrowser - File server http header.
		listClass: 'se-image-list', // @Required @override fileBrowser - Class name of list div.
		drawItemHandler: DrawItems, // @Required @override fileBrowser - Function that defines the HTML of an file item.
		selectorHandler: SetImage.bind(this), // @Required @override fileBrowser - Function that action when item click.
		columnSize: 4 // @Option @override fileBrowser - Number of "div.se-file-item-column" to be created (default: 4)
	});

	// members
	this._origin_w = this.options.get('imageWidth') === 'auto' ? '' : this.options.get('imageWidth');
	this._origin_h = this.options.get('imageHeight') === 'auto' ? '' : this.options.get('imageHeight');
};

ImageGallery.key = 'imageGallery';
ImageGallery.type = 'fileBrowser';
ImageGallery.className = '';
ImageGallery.prototype = {
	/**
	 * @description Open image gallery
	 */
	open: function () {
		this.fileBrowser.open();
	},

	/**
	 * @description Close image gallery
	 */
	close: function () {
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
		'" data-command="pick" data-value="' +
		(item.src || item.thumbnail) +
		'">' +
		'<div class="se-file-img-name se-file-name-back"></div>' +
		'<div class="se-file-img-name __se__img_name">' +
		(item.name || srcName) +
		'</div>' +
		'</div>'
	);
}

function SetImage(target) {
	const file = { name: target.parentNode.querySelector('.__se__img_name').textContent, size: 0 };
	this.plugins.image.create(target.getAttribute('data-value'), null, this._origin_w, this._origin_h, 'none', file, target.alt);
}

export default ImageGallery;
