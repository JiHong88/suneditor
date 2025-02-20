import EditorInjector from '../../editorInjector';
import { Browser } from '../../modules';

/**
 * @typedef {import('../../modules/Browser').BrowserFile} BrowserFile
 */

/**
 * @class
 * @extends EditorInjector
 * @description File browser plugin. Can contain any media type.
 */
class FileBrowser extends EditorInjector {
	static key = 'fileBrowser';
	static type = 'browser';
	static className = '';

	/**
	 * @constructor
	 * @param {EditorCore} editor - The root editor instance
	 * @param {Object} pluginOptions
	 * @param {Object<string, *>|Array<*>=} pluginOptions.data - direct data without server calls
	 * @param {string} pluginOptions.url - server request url
	 * @param {Object<string, string>=} pluginOptions.headers - server request headers
	 * @param {string|((item: BrowserFile) => string)} pluginOptions.thumbnail - default thumbnail
	 * @param {Array<string>} pluginOptions.props - additional tag names
	 */
	constructor(editor, pluginOptions) {
		// plugin bisic properties
		super(editor);
		this.title = this.lang.fileBrowser;
		this.icon = 'file_browser';

		// modules
		const thumbnail = { video: this.icons.video_thumbnail, audio: this.icons.audio_thumbnail, file: this.icons.file_thumbnail };
		const defaultThumbnail = this.icons.file_thumbnail;
		this.browser = new Browser(this, {
			title: this.lang.fileBrowser,
			data: pluginOptions.data,
			url: pluginOptions.url,
			headers: pluginOptions.headers,
			selectorHandler: SetItem.bind(this),
			columnSize: 4,
			className: 'se-file-browser',
			thumbnail: typeof pluginOptions.thumbnail === 'function' ? pluginOptions.thumbnail : (item) => thumbnail[item.type] || defaultThumbnail,
			props: [...new Set((pluginOptions.props ?? []).concat(['frame']))]
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
		const type = target.getAttribute('data-type');
		switch (type) {
			case 'image': {
				this.plugins.imageGallery.browser.selectorHandler(target);
				break;
			}
			case 'video': {
				this.plugins.videoGallery.browser.selectorHandler(target);
				break;
			}
			case 'audio': {
				this.plugins.audioGallery.browser.selectorHandler(target);
				break;
			}
			case 'file': {
				this.plugins.fileGallery.browser.selectorHandler(target);
				break;
			}
		}
	}
}

export default FileBrowser;
