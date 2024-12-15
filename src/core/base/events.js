export default function () {
	return {
		/**
		 * @description Event functions
		 */
		onload: null,
		onScroll: null,
		onMouseDown: null,
		onClick: null,
		onInput: null,
		onMouseLeave: null,
		onKeyDown: null,
		onKeyUp: null,
		onCopy: null,
		onCut: null,
		onFocus: null,
		onBlur: null,
		onChange: null,

		/**
		 * @description Called just before the inline toolbar is positioned and displayed on the screen.
		 */
		onShowToolbar: null,

		/**
		 * @description Called just after the controller is positioned and displayed on the screen.
		 * controller - editing elements displayed on the screen [image resizing, table editor, link editor..]]
		 */
		onShowController: null,
		onBeforeShowController: null,

		/**
		 * @description An event when toggling between code view and wysiwyg view.
		 */
		onToggleCodeView: null,

		/**
		 * @description An event when toggling full screen.
		 */
		onToggleFullScreen: null,

		/**
		 * @description Called when the editor is resized using the bottom bar
		 */
		onResizeEditor: null,

		/**
		 * @description Called after the "setToolbarButtons" invocation.
		 * Can be used to tweak buttons properties (useful for custom buttons)
		 */
		onSetToolbarButtons: null,

		/**
		 * --------------------------------------------------- async function ---------------------------------------------------
		 */

		/**
		 * @description Event functions
		 */
		onSave: null,

		/**
		 * @description Event functions (drop, paste)
		 * When false is returned, the default behavior is stopped.
		 * If the string is returned, the cleanData value is modified to the return value.
		 * @returns {Boolean|String}
		 */
		onDrop: null,
		onPaste: null,

		/**
		 * @description It replaces the default callback function of the image upload
		 */
		imageUploadHandler: null,

		/**
		 * @description Called before the image is uploaded
		 * If true is returned, the internal upload process runs normally.
		 * If false is returned, no image upload is performed.
		 * If new fileList are returned,  replaced the previous fileList
		 * If undefined is returned, it waits until "uploadHandler" is executed.
		 * @returns {Boolean|Array|undefined}
		 */
		onImageUploadBefore: null,

		/**
		 * @description Called before the image is deleted
		 */
		onImageDeleteBefore: null,

		/**
		 * @description Called when the editor loaded, file Current editor value
		 */
		onImageLoad: null,

		/**
		 * @description Called when the image is uploaded, updated, deleted
		 */
		onImageAction: null,

		/**
		 * @description Called when the image is upload failed
		 */
		onImageUploadError: null,

		/**
		 * @description It replaces the default callback function of the video upload
		 */
		videoUploadHandler: null,

		/**
		 * @description Called before the video is uploaded
		 * If true is returned, the internal upload process runs normally.
		 * If false is returned, no video(iframe, video) upload is performed.
		 * If new fileList are returned,  replaced the previous fileList
		 * If undefined is returned, it waits until "uploadHandler" is executed.
		 */
		onVideoUploadBefore: null,

		/**
		 * @description Called when the video(iframe, video) upload failed
		 */
		onVideoUploadError: null,

		/**
		 * @description Called when the editor loaded, file Current editor value
		 */
		onVideoLoad: null,

		/**
		 * @description Called when the video(iframe, video) is is uploaded, updated, deleted
		 */
		onVideoAction: null,

		/**
		 * @description Called before the video is deleted
		 */
		onVideoDeleteBefore: null,

		/**
		 * @description It replaces the default callback function of the audio upload
		 */
		audioUploadHandler: null,

		/**
		 * @description Called before the audio is uploaded
		 * If true is returned, the internal upload process runs normally.
		 * If false is returned, no audio upload is performed.
		 * If new fileList are returned,  replaced the previous fileList
		 * If undefined is returned, it waits until "uploadHandler" is executed.
		 * @returns {Boolean|Array|undefined}
		 */
		onAudioUploadBefore: null,

		/**
		 * @description Called when the audio upload failed
		 */
		onAudioUploadError: null,

		/**
		 * @description Called when the audio is is uploaded, updated, deleted
		 */
		onAudioAction: null,

		/**
		 * @description Called before the audio is deleted
		 */
		onAudioDeleteBefore: null,

		/**
		 * @description Called when the editor loaded, file Current editor value
		 */
		onAudioLoad: null,

		/**
		 * @description Called when the file is is uploaded, updated, deleted
		 */
		onFileAction: null,

		/**
		 * @description Called before the file is deleted
		 */
		onFileDeleteBefore: null,

		/**
		 * @description Called when the editor loaded, file Current editor value
		 */
		onFileLoad: null,

		/**
		 * @description Called when the file is uploaded
		 */
		onFileUploadBefore: null,

		/**
		 * @description Called when the file is upload failed
		 */
		onFileUploadError: null,

		/**
		 * @description Called before the link is added
		 */
		onExportPDFBefore: null,

		/**
		 * @description Called before the link is added
		 */
		onFileManagerAction: null
	};
}
