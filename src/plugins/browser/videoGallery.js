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

		// members
		this.onSelectfunction = null;

		// modules
		const thumbnail = typeof pluginOptions.thumbnail === 'string' ? pluginOptions.thumbnail : this.icons.video_thumbnail;
		this.browser = new Browser(this, {
			title: this.lang.videoGallery,
			data: pluginOptions.data,
			url: pluginOptions.url,
			headers: pluginOptions.headers,
			selectorHandler: this.#SetItem.bind(this),
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
	 * @param {?(targe: Node) => *=} onSelectfunction method to be executed after selecting an item in the gallery
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
	 * @param {Node} target - Target element
	 */
	#SetItem(target) {
		if (this.onSelectfunction) {
			this.onSelectfunction(target);
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
}

export default VideoGallery;
