import { PluginBrowser } from '../../interfaces';
import { Browser } from '../../modules/contract';

/**
 * @typedef {Object} FileBrowserPluginOptions
 * @property {Object<string, *>|Array<*>} [data] - Direct data without server calls (bypasses URL fetch).
 * @property {string} [url] - Server request URL
 * - The server must return a nested folder structure.
 * - Each folder can contain `_data` (its own files) and child folders:
 * ```js
 * {
 *   "result": {
 *     "root": {
 *       "name": "Root",
 *       "default": true,
 *       "_data": [
 *         { "src": "https://example.com/file1.pdf", "name": "file1.pdf" }
 *       ],
 *       "documents": {
 *         "name": "Documents",
 *         "_data": [
 *           { "src": "https://example.com/report.pdf", "name": "report.pdf" }
 *         ]
 *       }
 *     }
 *   }
 * }
 * ```
 * @property {Object<string, string>} [headers] - Server request headers
 * @property {string|((item: SunEditor.Module.Browser.File) => string)} [thumbnail] - Default thumbnail URL or a function that returns a thumbnail URL per item.
 * @property {Array<string>} [props] - Additional tag names
 * ```js
 * { url: '/api/files', headers: { Authorization: 'Bearer token' }, thumbnail: (item) => item.thumbUrl }
 * ```
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
	 * @param {SunEditor.Kernel} kernel - The Kernel instance
	 * @param {FileBrowserPluginOptions} pluginOptions
	 */
	constructor(kernel, pluginOptions) {
		// plugin bisic properties
		super(kernel);
		this.title = this.$.lang.fileBrowser;
		this.icon = 'file_browser';

		// members
		this.onSelectfunction = null;

		// modules
		const thumbnail = { video: this.$.icons.video_thumbnail, audio: this.$.icons.audio_thumbnail, file: this.$.icons.file_thumbnail };
		const defaultThumbnail = this.$.icons.file_thumbnail;
		this.browser = new Browser(this, this.$, {
			title: this.$.lang.fileBrowser,
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
					this.$.plugins.imageGallery.browser.selectorHandler(target);
					break;
				}
				case 'video': {
					this.$.plugins.videoGallery.browser.selectorHandler(target);
					break;
				}
				case 'audio': {
					this.$.plugins.audioGallery.browser.selectorHandler(target);
					break;
				}
				case 'file': {
					this.$.plugins.fileGallery.browser.selectorHandler(target);
					break;
				}
			}
		}
	}
}

export default FileBrowser;
