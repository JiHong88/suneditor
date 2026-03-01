import { env } from '../../../../helper';
import { FORMAT_TYPE } from '../shared/image.constants';
const { NO_EVENT } = env;

/**
 * @class ImageUploadService
 * @description Handles image upload operations including file upload, URL upload, and `Base64` conversion.
 */
export class ImageUploadService {
	#main;
	#$;
	#pluginOptions;

	#resizing;

	/**
	 * @param {import('../index').default} main - The main Image_ plugin instance.
	 */
	constructor(main) {
		this.#main = main;
		this.#$ = main.$;
		this.#pluginOptions = main.pluginOptions;

		this.#resizing = this.#pluginOptions.canResize;

		this._base64RenderIndex = 0;
	}

	get #sizeService() {
		return this.#main.sizeService;
	}

	/**
	 * @description Uploads the image to the server.
	 * @param {SunEditor.EventParams.ImageInfo} info - Image upload info.
	 */
	serverUpload(info) {
		if (!info.files) return;

		// server upload
		const imageUploadUrl = this.#pluginOptions.uploadUrl;
		if (typeof imageUploadUrl === 'string' && imageUploadUrl.length > 0) {
			this.#main.fileManager.upload(imageUploadUrl, this.#pluginOptions.uploadHeaders, info.files, this.#UploadCallBack.bind(this, info), this.#error.bind(this));
		} else {
			this.#setBase64(info);
		}
	}

	/**
	 * @description Handles image upload via URL.
	 * @param {*} info - Image information.
	 */
	urlUpload(info) {
		this.#main.setState('produceIndex', 0);
		const infoUrl = info.url;

		if (this.#main.modal.isUpdate) this.#updateSrc(infoUrl, info.element, info.files);
		else this.#produce(infoUrl, info.anchor, info.inputWidth, info.inputHeight, info.align, info.files, info.alt, true);
	}

	/**
	 * @description Creates a new image component based on provided parameters.
	 * @param {string} src - The image source URL.
	 * @param {?Node} anchor - Optional anchor wrapping the image.
	 * @param {string} width - Image width.
	 * @param {string} height - Image height.
	 * @param {string} align - Image alignment.
	 * @param {{name: string, size: number}} file - File metadata.
	 * @param {string} alt - Alternative text.
	 * @param {boolean} isLast - Indicates if this is the last image in a batch (for scroll and insert behavior).
	 */
	#produce(src, anchor, width, height, align, file, alt, isLast) {
		if (this.#main.as !== FORMAT_TYPE.INLINE) {
			this.#main.create(src, anchor, width, height, align, file, alt, isLast);
		} else {
			this.#main.createInline(src, anchor, width, height, file, alt, isLast);
		}
	}

	/**
	 * @description Updates the image source URL.
	 * @param {string} src - The new image source.
	 * @param {HTMLImageElement} element - The image element.
	 * @param {{ name: string, size: number }} file - File metadata.
	 */
	#updateSrc(src, element, file) {
		element.src = src;
		this.#main.fileManager.setFileData(element, file);
		this.#$.component.select(element, this.#main.constructor['key']);
	}

	/**
	 * @description Registers the uploaded image and inserts it into the editor.
	 * @param {SunEditor.EventParams.ImageInfo} info - Image info.
	 * @param {Object<string, *>} response - Server response data.
	 */
	#register(info, response) {
		this.#main.setState('produceIndex', 0);
		const fileList = response.result;

		for (let i = 0, len = fileList.length, file; i < len; i++) {
			file = {
				name: fileList[i].name,
				size: fileList[i].size,
			};
			if (info.isUpdate) {
				this.#updateSrc(fileList[i].url, info.element, file);
				break;
			} else {
				this.#produce(fileList[i].url, info.anchor, info.inputWidth, info.inputHeight, info.align, file, info.alt, i === len - 1);
			}
		}
	}

	/**
	 * @description Converts an image file to `Base64` and inserts it into the editor.
	 * @param {SunEditor.EventParams.ImageInfo} info - Image upload info.
	 * @throws {Error} Throws error if `Base64` conversion fails.
	 */
	#setBase64(info) {
		try {
			const { files, element, anchor, inputWidth, inputHeight, align, alt, isUpdate } = info;
			const filesLen = this.#main.modal.isUpdate ? 1 : files.length;

			if (filesLen === 0) {
				this.#$.ui.hideLoading();
				console.warn('[SUNEDITOR.image.base64.fail] cause : No applicable files');
				return;
			}

			this._base64RenderIndex = filesLen;
			const filesStack = new Array(filesLen);

			if (this.#resizing) {
				this.#sizeService.setInputSize(inputWidth, inputHeight);
			}

			for (let i = 0, renderFunc = this.#onRenderBase64.bind(this), reader, file; i < filesLen; i++) {
				reader = new FileReader();
				file = files[i];

				reader.onload = function (loadCallback, on_reader, update, updateElement, on_file, index) {
					filesStack[index] = {
						result: on_reader.result,
						file: on_file,
					};

					if (--this._base64RenderIndex === 0) {
						loadCallback(update, filesStack, updateElement, anchor, inputWidth, inputHeight, align, alt);
						this.#$.ui.hideLoading();
					}
				}.bind(this, renderFunc, reader, isUpdate, element, file, i);

				reader.readAsDataURL(file);
			}
		} catch (error) {
			this.#$.ui.hideLoading();
			throw Error(`[SUNEDITOR.plugins.image._setBase64.fail] ${error.message}`);
		}
	}

	/**
	 * @description Inserts an image using a `Base64`-encoded string.
	 * @param {boolean} update - Whether the image is being updated.
	 * @param {Array<{result: string, file: { name: string, size: number }}>} filesStack - Stack of `Base64`-encoded files.
	 * - result: Image url or `Base64`-encoded string
	 * - file: File metadata ({ name: string, size: number })
	 * @param {HTMLImageElement} updateElement - The image element being updated.
	 * @param {?HTMLAnchorElement} anchor - Optional anchor wrapping the image.
	 * @param {string} width - Image width.
	 * @param {string} height - Image height.
	 * @param {string} align - Image alignment.
	 * @param {string} alt - Alternative text.
	 */
	#onRenderBase64(update, filesStack, updateElement, anchor, width, height, align, alt) {
		this.#main.setState('produceIndex', 0);

		for (let i = 0, len = filesStack.length; i < len; i++) {
			if (update) {
				this.#updateSrc(filesStack[i].result, updateElement, filesStack[i].file);
			} else {
				this.#produce(filesStack[i].result, anchor, width, height, align, filesStack[i].file, alt, i === len - 1);
			}
		}
	}

	/**
	 * @description Handles errors during image upload and displays appropriate messages.
	 * @param {Object<string, *>} response - The error response from the server.
	 * @returns {Promise<void>}
	 */
	async #error(response) {
		const message = await this.#$.eventManager.triggerEvent('onImageUploadError', { error: response });
		const err = message === NO_EVENT ? response.errorMessage : message || response.errorMessage;
		this.#$.ui.alertOpen(err, 'error');
		console.error('[SUNEDITOR.plugin.image.error]', err);
	}

	/**
	 * @description Handles the callback function for image upload completion.
	 * @param {SunEditor.EventParams.ImageInfo} info - Image information.
	 * @param {XMLHttpRequest} xmlHttp - The XMLHttpRequest object.
	 */
	async #UploadCallBack(info, xmlHttp) {
		if ((await this.#$.eventManager.triggerEvent('imageUploadHandler', { xmlHttp, info })) === NO_EVENT) {
			const response = JSON.parse(xmlHttp.responseText);
			if (response.errorMessage) {
				this.#error(response);
			} else {
				this.#register(info, response);
			}
		}
	}
}

export default ImageUploadService;
