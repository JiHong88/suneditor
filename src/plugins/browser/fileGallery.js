import EditorInjector from '../../editorInjector';
import { Browser } from '../../modules';

/**
 * @typedef {import('../../modules/Browser').BrowserFile} BrowserFile
 */

/**
 * @class
 * @extends EditorInjector
 * @description File gallery plugin
 */
class FileGallery extends EditorInjector {
	static key = 'fileGallery';
	static type = 'browser';
	static className = '';

	/**
	 * @constructor
	 * @param {EditorCore} editor - The root editor instance
	 * @param {Object} pluginOptions
	 * @param {Array<*>=} pluginOptions.data - direct data without server calls
	 * @param {string} pluginOptions.url - server request url
	 * @param {Object<string, string>=} pluginOptions.headers - server request headers
	 * @param {string|((item: BrowserFile) => string)} pluginOptions.thumbnail - default thumbnail
	 */
	constructor(editor, pluginOptions) {
		// plugin bisic properties
		super(editor);
		this.title = this.lang.fileGallery;
		this.icon = 'file_gallery';

		// modules
		const thumbnail = typeof pluginOptions.thumbnail === 'string' ? pluginOptions.thumbnail : this.icons.file_thumbnail;
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
	}

	/**
	 * @editorMethod Modules.Browser
	 * @description Executes the method that is called when a "Browser" module's is opened.
	 * @param {HTMLElement} inputTarget First focus element when the file "Browser" is opened
	 */
	open(inputTarget) {
		this.inputTarget = inputTarget;
		this.browser.open();
	}

	/**
	 * @editorMethod Modules.Browser
	 * @description Executes the method that is called when a "Browser" module's is closed.
	 */
	close() {
		this.inputTarget = null;
		this.browser.close();
	}
}

function SetItem(target) {
	if (this.inputTarget) {
		this.inputTarget(target);
	} else {
		const file = { name: target.getAttribute('data-name'), size: 0 };
		this.plugins.fileUpload.create(target.getAttribute('data-command'), file, true);
	}
}

export default FileGallery;
