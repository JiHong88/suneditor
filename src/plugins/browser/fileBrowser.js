import EditorInjector from '../../editorInjector';
import { Browser } from '../../modules';

/**
 * @constructor
 * @description File browser plugin. Can contain any media type.
 * @param {Object} editor - editor core object
 * @param {object} pluginOptions
 * @param {object} pluginOptions.data - direct data without server calls
 * @param {string} pluginOptions.url - server request url
 * @param {object=} pluginOptions.headers - server request headers
 * @param {string|Function} pluginOptions.thumbnail - default thumbnail
 * @param {Array.<string>} pluginOptions.props - additional tag names
 */
const FileBrowser = function (editor, pluginOptions) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
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
};

FileBrowser.key = 'fileBrowser';
FileBrowser.type = 'browser';
FileBrowser.className = '';
FileBrowser.prototype = {
	/**
	 * @description Open gallery
	 */
	open(inputTarget) {
		this.inputTarget = inputTarget;
		this.browser.open();
	},

	/**
	 * @description Close gallery
	 */
	close() {
		this.inputTarget = null;
		this.browser.close();
	},

	constructor: FileBrowser
};

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
