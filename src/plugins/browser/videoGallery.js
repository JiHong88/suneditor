import { PluginBrowser } from '../../interfaces';
import { Browser } from '../../modules/contract';

/**
 * @typedef {Object} VideoGalleryPluginOptions
 * @property {Array<SunEditor.Module.Browser.File>} [data] - Direct data without server calls
 * @property {string} [url] - Server request URL
 * @property {Object<string, string>} [headers] - Server request headers
 * @property {string|((item: SunEditor.Module.Browser.File) => string)} [thumbnail] - Default thumbnail
 */

/**
 * @class
 * @description Video gallery plugin
 */
class VideoGallery extends PluginBrowser {
	static key = 'videoGallery';
	static className = '';

	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 * @param {VideoGalleryPluginOptions} pluginOptions
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
			props: ['frame'],
		});

		// members
		this.width = this.plugins.video.pluginOptions.defaultWidth === 'auto' ? '' : this.plugins.video.pluginOptions.defaultWidth;
		this.height = this.plugins.video.pluginOptions.defaultHeight === 'auto' ? '' : this.plugins.video.pluginOptions.defaultHeight;
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
			let url = target.getAttribute('data-command');
			const processUrl = this.plugins.video.findProcessUrl(url);
			if (processUrl) {
				url = processUrl.url;
			}

			const file = { name: target.getAttribute('data-name'), size: 0 };
			this.plugins.video.modalInit();
			this.plugins.video.create(
				this.plugins.video[target.getAttribute('data-frame') === 'iframe' ? 'createIframeTag' : 'createVideoTag']({ poster: target.getAttribute('data-thumbnail') }),
				url,
				null,
				this.width,
				this.height,
				false,
				file,
				true,
			);
		}
	}
}

export default VideoGallery;
