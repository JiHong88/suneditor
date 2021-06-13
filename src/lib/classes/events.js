/**
 * @fileoverview Event class
 * @author JiHong Lee.
 */
"use strict";

import CoreInterface from "../../interface/_core";

const Events = function (editor) {
	CoreInterface.call(this, editor);
};

Events.prototype = {
	/**
	 * @description Event functions
	 * @param {Object} e Event Object
	 * @param {Object} core Core object
	 */
	onload: null,
	onScroll: null,
	onMouseDown: null,
	onClick: null,
	onInput: null,
	onKeyDown: null,
	onKeyUp: null,
	onCopy: null,
	onCut: null,
	onFocus: null,
	onBlur: null,

	/**
	 * @description Event functions
	 * @param {String} contents Current contents
	 * @param {Object} core Core object
	 */
	onChange: null,

	/**
	 * @description Event functions (drop, paste)
	 * When false is returned, the default behavior is stopped.
	 * If the string is returned, the cleanData value is modified to the return value.
	 * @param {Object} e Event object.
	 * @param {String} cleanData HTML string modified for editor format.
	 * @param {Boolean} maxChartCount option (true if max character is exceeded)
	 * @param {Object} core Core object
	 * @returns {Boolean|String}
	 */
	onDrop: null,
	onPaste: null,

	/**
	 * @description Called just before the inline toolbar is positioned and displayed on the screen.
	 * @param {Element} toolbar Toolbar Element
	 * @param {Object} context The editor's context object
	 * @param {Object} core Core object
	 */
	showInline: null,

	/**
	 * @description Called just after the controller is positioned and displayed on the screen.
	 * controller - editing elements displayed on the screen [image resizing, table editor, link editor..]]
	 * @param {String} name The name of the plugin that called the controller
	 * @param {Array} controllers Array of Controller elements
	 * @param {Object} core Core object
	 */
	showController: null,

	/**
	 * @description An event when toggling between code view and wysiwyg view.
	 * @param {Boolean} isCodeView Whether the current code view mode
	 * @param {Object} core Core object
	 */
	toggleCodeView: null,

	/**
	 * @description An event when toggling full screen.
	 * @param {Boolean} isFullScreen Whether the current full screen mode
	 * @param {Object} core Core object
	 */
	toggleFullScreen: null,

	/**
	 * @description It replaces the default callback function of the image upload
	 * @param {Object} response Response object
	 * @param {Object} info Input information
	 * - linkValue: Link url value
	 * - linkNewWindow: Open in new window Check Value
	 * - inputWidth: Value of width input
	 * - inputHeight: Value of height input
	 * - align: Align Check Value
	 * - isUpdate: Update image if true, create image if false
	 * - element: If isUpdate is true, the currently selected image.
	 * @param {Object} core Core object
	 */
	imageUploadHandler: null,

	/**
	 * @description It replaces the default callback function of the video upload
	 * @param xmlHttp xmlHttpRequest object
	 * @param info Input information
	 * - inputWidth: Value of width input
	 * - inputHeight: Value of height input
	 * - align: Align Check Value
	 * - isUpdate: Update video if true, create video if false
	 * - element: If isUpdate is true, the currently selected video.
	 * @param core Core object
	 */
	videoUploadHandler: null,

	/**
	 * @description It replaces the default callback function of the audio upload
	 * @param xmlHttp xmlHttpRequest object
	 * @param info Input information
	 * - isUpdate: Update audio if true, create audio if false
	 * - element: If isUpdate is true, the currently selected audio.
	 * @param core Core object
	 */
	audioUploadHandler: null,

	/**
	 * @description Called before the image is uploaded
	 * If true is returned, the internal upload process runs normally.
	 * If false is returned, no image upload is performed.
	 * If new fileList are returned,  replaced the previous fileList
	 * If undefined is returned, it waits until "uploadHandler" is executed.
	 * @param {Array} files Files array
	 * @param {Object} info info: {
	 * - linkValue: Link url value
	 * - linkNewWindow: Open in new window Check Value
	 * - inputWidth: Value of width input
	 * - inputHeight: Value of height input
	 * - align: Align Check Value
	 * - isUpdate: Update image if true, create image if false
	 * - element: If isUpdate is true, the currently selected image.
	 * }
	 * @param {Object} core Core object
	 * @param {Function} uploadHandler If undefined is returned, it waits until "uploadHandler" is executed.
	 *                "uploadHandler" is an upload function with "core" and "info" bound.
	 *                [upload files] : uploadHandler(files or [new File(...),])
	 *                [error]        : uploadHandler("Error message")
	 *                [Just finish]  : uploadHandler()
	 *                [directly register] : uploadHandler(response) // Same format as "imageUploadUrl" response
	 *                                   ex) {
	 *                                      // "errorMessage": "insert error message",
	 *                                      "result": [ { "url": "...", "name": "...", "size": "999" }, ]
	 *                                   }
	 * @returns {Boolean|Array|undefined}
	 */
	onImageUploadBefore: null,
	/**
	 * @description Called before the video is uploaded
	 * If true is returned, the internal upload process runs normally.
	 * If false is returned, no video(iframe, video) upload is performed.
	 * If new fileList are returned,  replaced the previous fileList
	 * If undefined is returned, it waits until "uploadHandler" is executed.
	 * @param {Array} files Files array
	 * @param {Object} info info: {
	 * - inputWidth: Value of width input
	 * - inputHeight: Value of height input
	 * - align: Align Check Value
	 * - isUpdate: Update video if true, create video if false
	 * - element: If isUpdate is true, the currently selected video.
	 * }
	 * @param {Object} core Core object
	 * @param {Function} uploadHandler If undefined is returned, it waits until "uploadHandler" is executed.
	 *                "uploadHandler" is an upload function with "core" and "info" bound.
	 *                [upload files] : uploadHandler(files or [new File(...),])
	 *                [error]        : uploadHandler("Error message")
	 *                [Just finish]  : uploadHandler()
	 *                [directly register] : uploadHandler(response) // Same format as "videoUploadUrl" response
	 *                                   ex) {
	 *                                      // "errorMessage": "insert error message",
	 *                                      "result": [ { "url": "...", "name": "...", "size": "999" }, ]
	 *                                   }
	 * @returns {Boolean|Array|undefined}
	 */
	onVideoUploadBefore: null,
	/**
	 * @description Called before the audio is uploaded
	 * If true is returned, the internal upload process runs normally.
	 * If false is returned, no audio upload is performed.
	 * If new fileList are returned,  replaced the previous fileList
	 * If undefined is returned, it waits until "uploadHandler" is executed.
	 * @param {Array} files Files array
	 * @param {Object} info info: {
	 * - isUpdate: Update audio if true, create audio if false
	 * - element: If isUpdate is true, the currently selected audio.
	 * }
	 * @param {Object} core Core object
	 * @param {Function} uploadHandler If undefined is returned, it waits until "uploadHandler" is executed.
	 *                "uploadHandler" is an upload function with "core" and "info" bound.
	 *                [upload files] : uploadHandler(files or [new File(...),])
	 *                [error]        : uploadHandler("Error message")
	 *                [Just finish]  : uploadHandler()
	 *                [directly register] : uploadHandler(response) // Same format as "audioUploadUrl" response
	 *                                   ex) {
	 *                                      // "errorMessage": "insert error message",
	 *                                      "result": [ { "url": "...", "name": "...", "size": "999" }, ]
	 *                                   }
	 * @returns {Boolean|Array|undefined}
	 */
	onAudioUploadBefore: null,

	/**
	 * @description Called when the image is uploaded, updated, deleted
	 * @param {Element} targetElement Target element
	 * @param {Number} index Uploaded index
	 * @param {String} state Upload status ('create', 'update', 'delete')
	 * @param {Object} info Image info object
	 * - index: data index
	 * - name: file name
	 * - size: file size
	 * - select: select function
	 * - delete: delete function
	 * - element: target element
	 * - src: src attribute of tag
	 * @param {Number} remainingFilesCount Count of remaining files to upload (0 when added as a url)
	 * @param {Object} core Core object
	 */
	onImageUpload: null,
	/**
	 * @description Called when the video(iframe, video) is is uploaded, updated, deleted
	 * -- arguments is same "onImageUpload" --
	 */
	onVideoUpload: null,
	/**
	 * @description Called when the audio is is uploaded, updated, deleted
	 * -- arguments is same "onImageUpload" --
	 */
	onAudioUpload: null,

	/**
	 * @description Called when the image is upload failed
	 * @param {String} errorMessage Error message
	 * @param {Object} result Response Object
	 * @param {Object} core Core object
	 * @returns {Boolean}
	 */
	onImageUploadError: null,
	/**
	 * @description Called when the video(iframe, video) upload failed
	 * -- arguments is same "onImageUploadError" --
	 */
	onVideoUploadError: null,
	/**
	 * @description Called when the audio upload failed
	 * -- arguments is same "onImageUploadError" --
	 */
	onAudioUploadError: null,

	/**
	 * @description Called when the editor is resized using the bottom bar
	 */
	onResizeEditor: null,

	constructor: Events
};

export default Events;
