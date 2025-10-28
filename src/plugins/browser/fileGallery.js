import EditorInjector from '../../editorInjector';
import { Browser } from '../../modules';

/**
 * @typedef {Object} FileGalleryPluginOptions
 * @property {Array<SunEditor.Module.Browser.File>} [data] - Direct data without server calls
 * @property {string} [url] - Server request URL
 * @property {Object<string, string>} [headers] - Server request headers
 * @property {string|((item: SunEditor.Module.Browser.File) => string)} [thumbnail] - Default thumbnail
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
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {FileGalleryPluginOptions} pluginOptions
	 */
	constructor(editor, pluginOptions) {
		// plugin bisic properties
		super(editor);
		this.title = this.lang.fileGallery;
		this.icon = 'file_gallery';

		// members
		this.onSelectfunction = null;

		// modules
		const thumbnail = typeof pluginOptions.thumbnail === 'string' ? pluginOptions.thumbnail : this.icons.file_thumbnail;
		this.browser = new Browser(this, {
			title: this.lang.fileGallery,
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
	 * @editorMethod Modules.Browser
	 * @description Executes the method that is called when a "Browser" module's is opened.
	 * @param {?(targe: Node) => *} [onSelectfunction] method to be executed after selecting an item in the gallery
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
	 * @param {HTMLElement} target - Target element
	 */
	#SetItem(target) {
		if (this.onSelectfunction) {
			this.onSelectfunction(target);
		} else {
			const file = { name: target.getAttribute('data-name'), size: 0 };
			this.plugins.fileUpload.create(target.getAttribute('data-command'), file, true);
		}
	}
}

export default FileGallery;
