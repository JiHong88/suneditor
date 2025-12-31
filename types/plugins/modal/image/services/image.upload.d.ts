import type {} from '../../../../typedef';
/**
 * @class ImageUploadService
 * @description Handles image upload operations including file upload, URL upload, and Base64 conversion.
 */
export class ImageUploadService {
	/**
	 * @param {import('../index').default} main - The main Image_ plugin instance.
	 */
	constructor(main: import('../index').default);
	_base64RenderIndex: number;
	/**
	 * @description Uploads the image to the server.
	 * @param {SunEditor.EventParams.ImageInfo} info - Image upload info.
	 */
	serverUpload(info: SunEditor.EventParams.ImageInfo): void;
	/**
	 * @description Handles image upload via URL.
	 * @param {*} info - Image information.
	 */
	urlUpload(info: any): void;
	#private;
}
export default ImageUploadService;
