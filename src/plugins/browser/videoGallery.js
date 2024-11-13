import EditorInjector from '../../editorInjector';
import { Browser } from '../../modules';

const VideoGallery = function (editor, pluginOptions) {
	// plugin bisic properties
	EditorInjector.call(this, editor);
	this.title = this.lang.videoGallery;
	this.icon = 'video_gallery';

	// modules
	const thumbnail = pluginOptions.thumbnail || this.icons.video_thumbnail;
	this.browser = new Browser(this, {
		title: this.lang.videoGallery,
		url: pluginOptions.url,
		headers: pluginOptions.headers,
		selectorHandler: SetItem.bind(this),
		columnSize: 4,
		className: 'se-video-gallery',
		thumbnail: typeof pluginOptions.thumbnail === 'function' ? pluginOptions.thumbnail : () => thumbnail
	});

	// members
	this.width = this.plugins.video.pluginOptions.defaultWidth === 'auto' ? '' : this.plugins.video.pluginOptions.defaultWidth;
	this.height = this.plugins.video.pluginOptions.defaultHeight === 'auto' ? '' : this.plugins.video.pluginOptions.defaultHeight;
};

VideoGallery.key = 'videoGallery';
VideoGallery.type = 'browser';
VideoGallery.className = '';
VideoGallery.prototype = {
	/**
	 * @description Open video gallery
	 */
	open(inputTarget) {
		this.inputTarget = inputTarget;
		this.browser.open();
	},

	/**
	 * @description Close video gallery
	 */
	close() {
		this.inputTarget = null;
		this.browser.close();
	},

	constructor: VideoGallery
};

function SetItem(target) {
	if (this.inputTarget) {
		this.inputTarget(target);
	} else {
		const file = { name: target.getAttribute('data-value'), size: 0 };
		this.plugins.video.init();
		this.plugins.video.create(this.plugins.video.createVideoTag({ poster: target.getAttribute('data-thumbnail') }), target.getAttribute('data-command'), null, this.width, this.height, false, file);
	}
}

export default VideoGallery;
