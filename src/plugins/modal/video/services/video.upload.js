import { env } from '../../../../helper';
const { NO_EVENT } = env;

/**
 * @class VideoUploadService
 * @description Handles video upload operations including server upload and registration.
 */
export class VideoUploadService {
	#main;
	#pluginOptions;

	/**
	 * @param {import('../index').default} main - The main Video plugin instance.
	 */
	constructor(main) {
		this.#main = main;
		this.#pluginOptions = main.pluginOptions;
	}

	/**
	 * @description Uploads a video to the server using an external upload handler.
	 * @param {SunEditor.EventParams.VideoInfo} info - Video information object.
	 * @param {FileList} files - The video files to upload.
	 */
	serverUpload(info, files) {
		if (!files) return;

		const videoUploadUrl = this.#pluginOptions.uploadUrl;
		if (typeof videoUploadUrl === 'string' && videoUploadUrl.length > 0) {
			this.#main.fileManager.upload(videoUploadUrl, this.#pluginOptions.uploadHeaders, files, this.#UploadCallBack.bind(this, info), this.#error.bind(this));
		}
	}

	/**
	 * @description Registers the uploaded video in the editor.
	 * @param {SunEditor.EventParams.VideoInfo} info - Video information object.
	 * @param {Object<string, *>} response - Server response containing video data.
	 */
	#register(info, response) {
		const fileList = response.result;
		const videoTag = this.#main.createVideoTag();

		for (let i = 0, len = fileList.length; i < len; i++) {
			const ctag = info.isUpdate ? info.element : /** @type {HTMLIFrameElement|HTMLVideoElement} */ (videoTag.cloneNode(false));
			this.#main.create(
				ctag,
				fileList[i].url,
				info.inputWidth,
				info.inputHeight,
				info.align,
				info.isUpdate,
				{
					name: fileList[i].name,
					size: fileList[i].size,
				},
				i === len - 1,
			);
		}
	}

	/**
	 * @description Handles video upload errors.
	 * @param {Object<string, *>} response - The error response object.
	 * @returns {Promise<void>}
	 */
	async #error(response) {
		const message = await this.#main.triggerEvent('onVideoUploadError', { error: response });
		const err = message === NO_EVENT ? response.errorMessage : message || response.errorMessage;
		this.#main.ui.alertOpen(err, 'error');
		console.error('[SUNEDITOR.plugin.video.error]', message);
	}

	/**
	 * @description Handles the callback function for video upload completion.
	 * @param {SunEditor.EventParams.VideoInfo} info - Video information.
	 * @param {XMLHttpRequest} xmlHttp - The XMLHttpRequest object.
	 */
	async #UploadCallBack(info, xmlHttp) {
		if ((await this.#main.triggerEvent('videoUploadHandler', { xmlHttp, info })) === NO_EVENT) {
			const response = JSON.parse(xmlHttp.responseText);
			if (response.errorMessage) {
				this.#error(response);
			} else {
				this.#register(info, response);
			}
		}
	}
}

export default VideoUploadService;
