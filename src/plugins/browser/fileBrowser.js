import { PluginBrowser } from '../../interfaces';
import { Browser } from '../../modules/contract';

/**
 * @typedef {Object} FileBrowserPluginOptions
 * @property {Object<string, *>|Array<*>} [data] - Direct data without server calls
 * @property {string} [url] - Server request URL
 * @property {Object<string, string>} [headers] - Server request headers
 * @property {string|((item: SunEditor.Module.Browser.File) => string)} [thumbnail] - Default thumbnail
 * @property {Array<string>} [props] - Additional tag names
 */

/**
 * @class
 * @description File browser plugin. Can contain any media type.
 */
class FileBrowser extends PluginBrowser {
	static key = 'fileBrowser';
	static className = '';

	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {FileBrowserPluginOptions} pluginOptions
	 */
	constructor(editor, pluginOptions) {
		// plugin bisic properties
		super(editor);
		this.title = this.lang.fileBrowser;
		this.icon = 'file_browser';

		// members
		this.onSelectfunction = null;

		// modules
		const thumbnail = { video: this.icons.video_thumbnail, audio: this.icons.audio_thumbnail, file: this.icons.file_thumbnail };
		const defaultThumbnail = this.icons.file_thumbnail;
		this.browser = new Browser(this, {
			title: this.lang.fileBrowser,
			data: pluginOptions.data,
			url: pluginOptions.url,
			headers: pluginOptions.headers,
			selectorHandler: this.#SetItem.bind(this),
			columnSize: 4,
			className: 'se-file-browser',
			thumbnail: typeof pluginOptions.thumbnail === 'function' ? pluginOptions.thumbnail : (item) => thumbnail[item.type] || defaultThumbnail,
			props: [...new Set((pluginOptions.props ?? []).concat(['frame']))],
		});
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
	 * @param {HTMLElement} target - Target element
	 */
	#SetItem(target) {
		if (this.onSelectfunction) {
			this.onSelectfunction(target);
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
}

export default FileBrowser;
