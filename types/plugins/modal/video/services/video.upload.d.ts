import type {} from '../../../../typedef';
/**
 * @class VideoUploadService
 * @description Handles video upload operations including server upload and registration.
 */
export class VideoUploadService {
	/**
	 * @param {import('../index').default} main - The main Video plugin instance.
	 */
	constructor(main: import('../index').default);
	/**
	 * @description Uploads a video to the server using an external upload handler.
	 * @param {SunEditor.EventParams.VideoInfo} info - Video information object.
	 * @param {FileList} files - The video files to upload.
	 */
	serverUpload(info: SunEditor.EventParams.VideoInfo, files: FileList): void;
	#private;
}
export default VideoUploadService;
