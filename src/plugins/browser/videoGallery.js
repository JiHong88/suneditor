import EditorInjector from '../../editorInjector';
import { Browser } from '../../modules';

/**
 * @typedef {import('../../modules/Browser').BrowserFile} BrowserFile
 */

/**
 * @class
 * @extends EditorInjector
 * @description Video gallery plugin
 */
class VideoGallery extends EditorInjector {
	static key = 'videoGallery';
	static type = 'browser';
	static className = '';

	/**
	 * @constructor
	 * @param {EditorCore} editor - The root editor instance
	 * @param {Object} pluginOptions
	 * @param {Array<*>=} pluginOptions.data - direct data without server calls
	 * @param {string=} pluginOptions.url - server request url
	 * @param {Object<string, string>=} pluginOptions.headers - server request headers
	 * @param {string|((item: BrowserFile) => string)} pluginOptions.thumbnail - default thumbnail
	 */
	constructor(editor, pluginOptions) {
		// plugin bisic properties
		super(editor);
		this.title = this.lang.videoGallery;
		this.icon = 'video_gallery';

		// modules
		const thumbnail = typeof pluginOptions.thumbnail === 'string' ? pluginOptions.thumbnail : this.icons.video_thumbnail;
		this.browser = new Browser(this, {
			title: this.lang.videoGallery,
			data: pluginOptions.data,
			url: pluginOptions.url,
			headers: pluginOptions.headers,
			selectorHandler: SetItem.bind(this),
			columnSize: 4,
			className: 'se-video-gallery',
			thumbnail: typeof pluginOptions.thumbnail === 'function' ? pluginOptions.thumbnail : () => thumbnail,
			props: ['frame']
		});

		// members
		this.width = this.plugins.video.pluginOptions.defaultWidth === 'auto' ? '' : this.plugins.video.pluginOptions.defaultWidth;
		this.height = this.plugins.video.pluginOptions.defaultHeight === 'auto' ? '' : this.plugins.video.pluginOptions.defaultHeight;
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
		let url = target.getAttribute('data-command');
		const processUrl = this.plugins.video.findProcessUrl(url);
		if (processUrl) {
			url = processUrl.url;
		}

		const file = { name: target.getAttribute('data-name'), size: 0 };
		this.plugins.video.init();
		this.plugins.video.create(
			this.plugins.video[target.getAttribute('data-frame') === 'iframe' ? 'createIframeTag' : 'createVideoTag']({ poster: target.getAttribute('data-thumbnail') }),
			url,
			null,
			this.width,
			this.height,
			false,
			file
		);
	}
}

export default VideoGallery;
