import EditorInjector from '../../editorInjector';
import { Browser } from '../../modules';

/**
 * @class
 * @description File gallery plugin
 * @param {object} editor - editor core object
 * @param {object} pluginOptions
 * @param {object} pluginOptions.data - direct data without server calls
 * @param {string} pluginOptions.url - server request url
 * @param {object=} pluginOptions.headers - server request headers
 * @param {string|Function} pluginOptions.thumbnail - default thumbnail
 */
const FileGallery = function (editor, pluginOptions) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.fileGallery;
	this.icon = 'file_gallery';

	// modules
	const thumbnail = pluginOptions.thumbnail || this.icons.file_thumbnail;
	this.browser = new Browser(this, {
		title: this.lang.fileGallery,
		data: pluginOptions.data,
		url: pluginOptions.url,
		headers: pluginOptions.headers,
		selectorHandler: SetItem.bind(this),
		columnSize: 4,
		className: 'se-file-gallery',
		thumbnail: typeof pluginOptions.thumbnail === 'function' ? pluginOptions.thumbnail : () => thumbnail
	});
};

FileGallery.key = 'fileGallery';
FileGallery.type = 'browser';
FileGallery.className = '';
FileGallery.prototype = {
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

	constructor: FileGallery
};

function SetItem(target) {
	if (this.inputTarget) {
		this.inputTarget(target);
	} else {
		const file = { name: target.getAttribute('data-name'), size: 0 };
		this.plugins.fileUpload.create(target.getAttribute('data-command'), file, true);
	}
}

export default FileGallery;
