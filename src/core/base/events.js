// Event function collection
// This is a collection of functions that can be used in the editor's event callback.
// ---------

// --- controller
/**
 * @typedef {Object} ControllerInfo
 * @property {"top"|"bottom"|"position"} position - controller position
 * @property {object} inst - controller instance
 * @property {Element} form - controller element
 * @property {Element} target - controller target element
 * @property {boolean} isRangeTarget - If the target is a Range, set it to true.
 * @property {boolean} notInCarrier - "form"" is not included in the carrier.
 */

// --- media
/**
 * @typedef {object} FileManagementInfo
 * @property {string} src - source URL of the image.
 * @property {number} index - index of the image.
 * @property {string} name - name of the file.
 * @property {number} size -  size of the file in bytes.
 * @property {Element} element -  target element.
 * @property {Function} delete -  delete function.
 * @property {Function} select -  select function.
 */

/**
 * @typedef {object} ProcessInfo
 * @property {string} origin - video origin url
 * @property {string} url - video url
 * @property {"video"|"iframe"} tag - video tag name
 */

// --- image
/**
 * @typedef {object} ImageInfo
 * @property {FileList} files - FileList object
 * @property {Element} element - target element
 * @property {string} inputWidth - width value
 * @property {string} inputHeight - height value
 * @property {string} align - align value
 * @property {boolean} isUpdate - new create or update
 * @property {?Element} anchor - Anchor element, if it exists
 * @property {string} alt - alt text value
 */

// --- video
/**
 * @typedef {object} VideoInfo
 * @property {FileList} files - FileList object
 * @property {Element} element - target element
 * @property {string} inputWidth - width value
 * @property {string} inputHeight - height value
 * @property {string} align - align value
 * @property {boolean} isUpdate - new create or update
 * @property {string} url - video url
 * @property {?ProcessInfo} process - video process info
 */

// --- audio
/**
 * @typedef {object} AudioInfo
 * @property {Element} element - target element
 * @property {FileList} files - FileList object
 * @property {boolean} isUpdate - new create or update
 */

// --- file
/**
 * @typedef {object} FileInfo
 * @property {string} url - file url
 * @property {FileList} files - FileList object
 * @property {object} uploadHeaders - upload headers
 */

// --- embed
/**
 * @typedef {object} EmbedInfo
 * @property {Element} element - target element
 * @property {string} inputWidth - width value
 * @property {string} inputHeight - height value
 * @property {string} align - align value
 * @property {boolean} isUpdate - new create or update
 * @property {string} url - embed url
 * @property {?Element} children - When the input source is stacked in an iframe, etc., the actual embedded DOM
 * @property {?ProcessInfo} process - embed process info
 */

// event functions
export default function () {
	return {
		/**
		 * @description Event call back function
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 */
		onload: null,

		/**
		 * @description Event call back function
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {object} params.frameContext - frame context
		 * @param {Event} params.event - event object
		 */
		onScroll: null,
		onMouseDown: null,
		onClick: null,
		onInput: null,
		onMouseLeave: null,
		onKeyDown: null,
		onKeyUp: null,
		onFocus: null,
		onBlur: null,

		/**
		 * @description Event function on [copy, cut]
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {object} params.frameContext - frame context
		 * @param {Event} params.event - event object
		 * @param {Event} params.clipboardData - clipboardData
		 */
		onCopy: null,
		onCut: null,

		/**
		 * @description Event call back function
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {object} params.frameContext - frame context
		 * @param {Event} params.event - event object
		 * @param {Event} params.data - editor data
		 */
		onChange: null,

		/**
		 * @description Called just before the inline toolbar is positioned and displayed on the screen.
		 * @param {Element} toolbar - Toolbar element
		 * @param {string} mode - Toolbar mode
		 */
		onShowToolbar: null,

		/**
		 * @description Called just after the controller is positioned and displayed on the screen.
		 * controller - editing elements displayed on the screen [image resizing, table editor, link editor..]]
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {object} params.frameContext - frame context
		 * @param {string} params.caller - caller plugin name
		 * @param {ControllerInfo} params.info - info object
		 */
		onShowController: null,
		onBeforeShowController: null,

		/**
		 * @description An event when toggling between code view and wysiwyg view.
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {object} params.frameContext - frame context
		 * @param {boolean} params.is - code view status
		 */
		onToggleCodeView: null,

		/**
		 * @description An event when toggling full screen.
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {object} params.frameContext - frame context
		 * @param {boolean} params.is - full screen status
		 */
		onToggleFullScreen: null,

		/**
		 * @description Called when the editor is resized using the bottom bar
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {object} params.frameContext - frame context
		 * @param {number} params.height - wysiwyg area frame height
		 * @param {boolean} params.prevHeight - wysiwyg area previous height
		 * @param {ResizeObserverEntry} params.observerEntry - ResizeObserverEntry
		 */
		onResizeEditor: null,

		/**
		 * @description Called after the "setToolbarButtons" invocation.
		 * Can be used to tweak buttons properties (useful for custom buttons)
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {object} params.frameContext - frame context
		 * @param {Element} params.buttonTray - button tray element
		 */
		onSetToolbarButtons: null,

		/**
		 * --------------------------------------------------- async function ---------------------------------------------------
		 */

		/**
		 * @description Event callback function on save
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {object} params.frameContext - frame context
		 * @param {Event} params.data - editor data
		 */
		onSave: null,

		/**
		 * @description Event function on [drop, paste] before
		 * When false is returned, the default behavior is stopped.
		 * If the string is returned, the cleanData value is modified to the return value.
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {object} params.frameContext - frame context
		 * @param {Event} params.event - event object
		 * @param {string} params.data - drop data
		 * @param {boolean} params.maxCharCount - is max char count
		 * @param {string} params.from - "SE"|"MS"|"" - source
		 * @returns {boolean|string}
		 */
		onDrop: null,
		onPaste: null,

		/**
		 * @description It replaces the default callback function of the image upload
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {XMLHttpRequest} params.xmlHttp - XMLHttpRequest
		 * @param {ImageInfo} params.info - info object
		 */
		imageUploadHandler: null,

		/**
		 * @description Called before the image is uploaded
		 * If true is returned, the internal upload process runs normally.
		 * If false is returned, no image upload is performed.
		 * If new fileList are returned,  replaced the previous fileList
		 * If undefined is returned, it waits until "uploadHandler" is executed.
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {ImageInfo} params.info - info object
		 * @param {Function} params.handler - handler function
		 * @returns {boolean|Array|undefined}
		 */
		onImageUploadBefore: null,

		/**
		 * @description Called when the editor loaded, file Current editor value
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {Array.<FileManagementInfo>} infoList - info list
		 */
		onImageLoad: null,

		/**
		 * @description Called when the image is uploaded, updated, deleted* @param {object} params
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {FileManagementInfo} params.info - info object
		 * @param {Element|null} params.element - target element
		 * @param {"create"|"update"|"delete"} params.state - state
		 * @param {number} params.index - data index
		 * @param {number} params.remainingFilesCount - remaining files count
		 */
		onImageAction: null,

		/**
		 * @description Called when the image is upload failed
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {object} params.error - error object
		 * @param {number=} params.limitSize - limit size
		 * @param {number=} params.uploadSize - upload size
		 * @param {number=} params.currentSize - current size
		 * @param {File=} params.file - File object
		 */
		onImageUploadError: null,

		/**
		 * @description Called before the image is deleted
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {Element} params.element - target element
		 * @param {Element} params.container - target's container element (div)
		 * @param {string} params.align - align value
		 * @param {string} params.alt - alt text value
		 * @param {?string} params.url - Anchor url, if it exists
		 */
		onImageDeleteBefore: null,

		/**
		 * @description It replaces the default callback function of the video upload
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {XMLHttpRequest} params.xmlHttp - XMLHttpRequest
		 * @param {VideoInfo} params.info - info object
		 */
		videoUploadHandler: null,

		/**
		 * @description Called before the video is uploaded
		 * If true is returned, the internal upload process runs normally.
		 * If false is returned, no video(iframe, video) upload is performed.
		 * If new fileList are returned,  replaced the previous fileList
		 * If undefined is returned, it waits until "uploadHandler" is executed.
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {VideoInfo} params.info - info object
		 * @param {Function} params.handler - handler function
		 */
		onVideoUploadBefore: null,

		/**
		 * @description Called when the editor loaded, file Current editor value
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {Array.<FileManagementInfo>} infoList - info list
		 */
		onVideoLoad: null,

		/**
		 * @description Called when the video(iframe, video) is is uploaded, updated, deleted
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {FileManagementInfo} params.info - info object
		 * @param {Element|null} params.element - target element
		 * @param {"create"|"update"|"delete"} params.state - state
		 * @param {number} params.index - data index
		 * @param {number} params.remainingFilesCount - remaining files count
		 */
		onVideoAction: null,

		/**
		 * @description Called when the video(iframe, video) upload failed
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {object} params.error - error object
		 * @param {number=} params.limitSize - limit size
		 * @param {number=} params.uploadSize - upload size
		 * @param {number=} params.currentSize - current size
		 * @param {File=} params.file - File object
		 */
		onVideoUploadError: null,

		/**
		 * @description Called before the video is deleted
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {Element} params.element - target element
		 * @param {Element} params.container - target's container element (div)
		 * @param {string} params.align - align value
		 * @param {string} params.url - video url
		 */
		onVideoDeleteBefore: null,

		/**
		 * @description It replaces the default callback function of the audio upload
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {XMLHttpRequest} params.xmlHttp - XMLHttpRequest
		 * @param {AudioInfo} params.info - info object
		 */
		audioUploadHandler: null,

		/**
		 * @description Called before the audio is uploaded
		 * If true is returned, the internal upload process runs normally.
		 * If false is returned, no audio upload is performed.
		 * If new fileList are returned,  replaced the previous fileList
		 * If undefined is returned, it waits until "uploadHandler" is executed.
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {AudioInfo} params.info - info object
		 * @param {Function} params.handler - handler function
		 * @returns {boolean|Array|undefined}
		 */
		onAudioUploadBefore: null,

		/**
		 * @description Called when the audio upload failed
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {object} params.error - error object
		 * @param {number=} params.limitSize - limit size
		 * @param {number=} params.uploadSize - upload size
		 * @param {number=} params.currentSize - current size
		 * @param {File=} params.file - File object
		 */
		onAudioUploadError: null,

		/**
		 * @description Called when the audio is is uploaded, updated, deleted
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {FileManagementInfo} params.info - info object
		 * @param {Element|null} params.element - target element
		 * @param {"create"|"update"|"delete"} params.state - state
		 * @param {number} params.index - data index
		 * @param {number} params.remainingFilesCount - remaining files count
		 */
		onAudioAction: null,

		/**
		 * @description Called before the audio is deleted
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {Element} params.element - target element
		 * @param {Element} params.container - target's container element (div)
		 * @param {string} params.url - audio url
		 */
		onAudioDeleteBefore: null,

		/**
		 * @description Called when the editor loaded, file Current editor value
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {Array.<FileManagementInfo>} infoList - info list
		 */
		onAudioLoad: null,

		/**
		 * @description Called when the file is is uploaded, updated, deleted
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {FileManagementInfo} params.info - info object
		 * @param {Element|null} params.element - target element
		 * @param {"create"|"update"|"delete"} params.state - state
		 * @param {number} params.index - data index
		 * @param {number} params.remainingFilesCount - remaining files count
		 */
		onFileAction: null,

		/**
		 * @description Called before the file is deleted
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {Element} params.element - target element
		 * @param {Element} params.container - target's container element (div)
		 * @param {string} params.url - file url
		 */
		onFileDeleteBefore: null,

		/**
		 * @description Called when the editor loaded, file Current editor value
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {Array.<FileManagementInfo>} infoList - info list
		 */
		onFileLoad: null,

		/**
		 * @description Called when the file is uploaded
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {FileInfo} params.info - info object
		 * @param {Function} params.handler - handler function
		 */
		onFileUploadBefore: null,

		/**
		 * @description Called when the file is upload failed
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {object} params.error - error object
		 * @param {number=} params.limitSize - limit size
		 * @param {number=} params.uploadSize - upload size
		 * @param {number=} params.currentSize - current size
		 * @param {File=} params.file - File object
		 */
		onFileUploadError: null,

		/**
		 * @description Called before the PDF export is started
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {Element} params.target - wysiwyg editable element
		 */
		onExportPDFBefore: null,

		/**
		 * @description Events that occur when actions such as uploading or deleting all files are performed in the file manager
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {FileManagementInfo} params.info - info object
		 * @param {Element|null} params.element - target element
		 * @param {"create"|"update"|"delete"} params.state - state
		 * @param {number} params.index - data index
		 * @param {number} params.remainingFilesCount - remaining files count
		 */
		onFileManagerAction: null,

		/**
		 * @description Called before the embed is inserted
		 * @param {object} params
		 * @param {object} params.editor - editor core object
		 * @param {EmbedInfo} params.info - info object
		 * @param {Function} params.handler - handler function
		 */
		onEmbedInputBefore: null
	};
}
