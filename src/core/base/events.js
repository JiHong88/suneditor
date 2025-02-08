// Event function collection
// This is a collection of functions that can be used in the editor's event callback.
// ---------

/**
 * @typedef {import('../editor').default} EditorInstance
 */

/**
 * @typedef {import('../../modules/Controller').default} ControllerInstance
 */

/**
 * @typedef {import('../section/context').FrameContext} FrameContext
 */

// --- native events
/**
 * @typedef {Object} BaseEvent
 * @property {EditorInstance} editor - The root editor instance
 * @property {FrameContext} frameContext - frame context
 * @property {Event} event - event object
 */

/**
 * @typedef {Object} ClipboardEvent
 * @property {EditorInstance} editor - The root editor instance
 * @property {FrameContext} frameContext - frame context
 * @property {Event} event - event object
 * @property {string} data - drop data
 * @property {boolean} maxCharCount - is max char count
 * @property {string} from - "SE"|"MS"|"" - source
 */

// --- controller
/**
 * @typedef {Object} ControllerInfo
 * @property {"top"|"bottom"|"position"} position - controller position
 * @property {ControllerInstance} inst - controller instance
 * @property {Element} form - controller element
 * @property {Element} target - controller target element
 * @property {boolean} isRangeTarget - If the target is a Range, set it to true.
 * @property {boolean} notInCarrier - "form"" is not included in the carrier.
 */

// --- media
/**
 * @typedef {Object} FileManagementInfo
 * @property {string} src - source URL of the image.
 * @property {number} index - index of the image.
 * @property {string} name - name of the file.
 * @property {number} size -  size of the file in bytes.
 * @property {Element} element -  target element.
 * @property {() => void} delete -  delete function.
 * @property {() => void} select -  select function.
 */

/**
 * @typedef {Object} ProcessInfo
 * @property {string} origin - video origin url
 * @property {string} url - video url
 * @property {"video"|"iframe"} tag - video tag name
 */

// --- image
/**
 * @typedef {Object} ImageInfo
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
 * @typedef {Object} VideoInfo
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
 * @typedef {Object} AudioInfo
 * @property {Element} element - target element
 * @property {FileList} files - FileList object
 * @property {boolean} isUpdate - new create or update
 */

// --- file
/**
 * @typedef {Object} FileInfo
 * @property {string} url - file url
 * @property {FileList} files - FileList object
 * @property {Object} uploadHeaders - upload headers
 */

// --- embed
/**
 * @typedef {Object} EmbedInfo
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
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 */
		onload: null,

		/**
		 * @description Event call back function
		 * @param {BaseEvent} params
		 */
		onScroll: null,

		/**
		 * @description Event call back function
		 * @param {BaseEvent} params
		 */
		onMouseDown: null,

		/**
		 * @description Event call back function
		 * @param {BaseEvent} params
		 */
		onClick: null,

		/**
		 * @description Event call back function
		 * @param {BaseEvent} params
		 */
		onInput: null,

		/**
		 * @description Event call back function
		 * @param {BaseEvent} params
		 */
		onMouseLeave: null,

		/**
		 * @description Event call back function
		 * @param {BaseEvent} params
		 */
		onKeyDown: null,

		/**
		 * @description Event call back function
		 * @param {BaseEvent} params
		 */
		onKeyUp: null,

		/**
		 * @description Event call back function
		 * @param {BaseEvent} params
		 */
		onFocus: null,

		/**
		 * @description Event call back function
		 * @param {BaseEvent} params
		 */
		onBlur: null,

		/**
		 * @description Event function on copy
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {FrameContext} params.frameContext - frame context
		 * @param {Event} params.event - event object
		 * @param {Event} params.clipboardData - clipboardData
		 */
		onCopy: null,

		/**
		 * @description Event function on cut
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {FrameContext} params.frameContext - frame context
		 * @param {Event} params.event - event object
		 * @param {Event} params.clipboardData - clipboardData
		 */
		onCut: null,

		/**
		 * @description Event call back function
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {FrameContext} params.frameContext - frame context
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
		 * - controller : editing elements displayed on the screen [image resizing, table editor, link editor..]]
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {FrameContext} params.frameContext - frame context
		 * @param {string} params.caller - caller plugin name
		 * @param {ControllerInfo} params.info - info object
		 */
		onShowController: null,

		/**
		 * @description Called just after the controller is positioned and displayed on the screen.
		 * - controller : editing elements displayed on the screen [image resizing, table editor, link editor..]]
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {FrameContext} params.frameContext - frame context
		 * @param {string} params.caller - caller plugin name
		 * @param {ControllerInfo} params.info - info object
		 */
		onBeforeShowController: null,

		/**
		 * @description An event when toggling between code view and wysiwyg view.
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {FrameContext} params.frameContext - frame context
		 * @param {boolean} params.is - code view status
		 */
		onToggleCodeView: null,

		/**
		 * @description An event when toggling full screen.
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {FrameContext} params.frameContext - frame context
		 * @param {boolean} params.is - full screen status
		 */
		onToggleFullScreen: null,

		/**
		 * @description Called when the editor is resized using the bottom bar
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {FrameContext} params.frameContext - frame context
		 * @param {number} params.height - wysiwyg area frame height
		 * @param {boolean} params.prevHeight - wysiwyg area previous height
		 * @param {ResizeObserverEntry} params.observerEntry - ResizeObserverEntry
		 */
		onResizeEditor: null,

		/**
		 * @description Called after the "setToolbarButtons" invocation.
		 * - Can be used to tweak buttons properties (useful for custom buttons)
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {FrameContext} params.frameContext - frame context
		 * @param {Element} params.buttonTray - button tray element
		 */
		onSetToolbarButtons: null,

		/**
		 * --------------------------------------------------- async function ---------------------------------------------------
		 */

		/**
		 * @description Event callback function on save
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {FrameContext} params.frameContext - frame context
		 * @param {Event} params.data - editor data
		 * @returns {Promise<boolean>}
		 */
		onSave: null,

		/**
		 * @description Event function on [drop, paste] before
		 * - When false is returned, the default behavior is stopped.
		 * - If the string is returned, the cleanData value is modified to the return value.
		 * @param {ClipboardEvent} params
		 * @returns {Promise<boolean|string>}
		 */
		onDrop: null,

		/**
		 * @description Event function on [drop, paste] before
		 * - When false is returned, the default behavior is stopped.
		 * - If the string is returned, the cleanData value is modified to the return value.
		 * @param {ClipboardEvent} params
		 * @returns {Promise<boolean|string>}
		 */
		onPaste: null,

		// --- image
		/**
		 * @description It replaces the default callback function of the image upload
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {XMLHttpRequest} params.xmlHttp - XMLHttpRequest
		 * @param {ImageInfo} params.info - info object
		 * @returns {Promise<boolean>}
		 */
		imageUploadHandler: null,

		/**
		 * @description Called before the image is uploaded
		 * - If true is returned, the internal upload process runs normally.
		 * - If false is returned, no image upload is performed.
		 * - If new "info" are returned, replaced the previous "params.info"
		 * - If undefined is returned, it waits until "uploadHandler" is executed.
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {ImageInfo} params.info - info object
		 * @param {(newInfo?: ImageInfo|null) => void} params.handler - handler function
		 * @returns {Promise<boolean|undefined|ImageInfo>}
		 */
		onImageUploadBefore: null,

		/**
		 * @description Called when the editor loaded, file Current editor value
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {Array.<FileManagementInfo>} infoList - info list
		 */
		onImageLoad: null,

		/**
		 * @description Called when the image is uploaded, updated, deleted
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {FileManagementInfo} params.info - info object
		 * @param {Element|null} params.element - target element
		 * @param {"create"|"update"|"delete"} params.state - state
		 * @param {number} params.index - data index
		 * @param {number} params.remainingFilesCount - remaining files count
		 */
		onImageAction: null,

		/**
		 * @description Called when the image is upload failed
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {string} params.error - error message
		 * @param {number=} params.limitSize - limit size
		 * @param {number=} params.uploadSize - upload size
		 * @param {number=} params.currentSize - current size
		 * @param {File=} params.file - File object
		 * @returns {Promise<string|undefined>}
		 */
		onImageUploadError: null,

		/**
		 * @description Called before the image is deleted
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {Element} params.element - target element
		 * @param {Element} params.container - target's container element (div)
		 * @param {string} params.align - align value
		 * @param {string} params.alt - alt text value
		 * @param {?string} params.url - Anchor url, if it exists
		 * @returns {Promise<boolean>}
		 */
		onImageDeleteBefore: null,

		// --- video
		/**
		 * @description It replaces the default callback function of the video upload
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {XMLHttpRequest} params.xmlHttp - XMLHttpRequest
		 * @param {VideoInfo} params.info - info object
		 * @returns {Promise<boolean>}
		 */
		videoUploadHandler: null,

		/**
		 * @description Called before the video is uploaded
		 * - If true is returned, the internal upload process runs normally.
		 * - If false is returned, no video(iframe, video) upload is performed.
		 * - If new "info" are returned, replaced the previous "params.info"
		 * - If undefined is returned, it waits until "uploadHandler" is executed.
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {VideoInfo} params.info - info object
		 * @param {(newInfo?: VideoInfo|null) => void} params.handler - handler function
		 * @returns {Promise<boolean|undefined|VideoInfo>}
		 */
		onVideoUploadBefore: null,

		/**
		 * @description Called when the editor loaded, file Current editor value
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {Array.<FileManagementInfo>} infoList - info list
		 */
		onVideoLoad: null,

		/**
		 * @description Called when the video(iframe, video) is is uploaded, updated, deleted
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {FileManagementInfo} params.info - info object
		 * @param {Element|null} params.element - target element
		 * @param {"create"|"update"|"delete"} params.state - state
		 * @param {number} params.index - data index
		 * @param {number} params.remainingFilesCount - remaining files count
		 */
		onVideoAction: null,

		/**
		 * @description Called when the video(iframe, video) upload failed
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {string} params.error - error message
		 * @param {number=} params.limitSize - limit size
		 * @param {number=} params.uploadSize - upload size
		 * @param {number=} params.currentSize - current size
		 * @param {File=} params.file - File object
		 * @returns {Promise<string|undefined>}
		 */
		onVideoUploadError: null,

		/**
		 * @description Called before the video is deleted
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {Element} params.element - target element
		 * @param {Element} params.container - target's container element (div)
		 * @param {string} params.align - align value
		 * @param {string} params.url - video url
		 * @returns {Promise<boolean>}
		 */
		onVideoDeleteBefore: null,

		/**
		 * @description It replaces the default callback function of the audio upload
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {XMLHttpRequest} params.xmlHttp - XMLHttpRequest
		 * @param {AudioInfo} params.info - info object
		 * @returns {Promise<boolean>}
		 */
		audioUploadHandler: null,

		// --- audio
		/**
		 * @description Called before the audio is uploaded
		 * - If true is returned, the internal upload process runs normally.
		 * - If false is returned, no audio upload is performed.
		 * - If new "info" are returned, replaced the previous "params.info"
		 * - If undefined is returned, it waits until "uploadHandler" is executed.
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {AudioInfo} params.info - info object
		 * @param {(newInfo?: AudioInfo|null) => void} params.handler - handler function
		 * @returns {Promise<boolean|undefined|AudioInfo>}
		 */
		onAudioUploadBefore: null,

		/**
		 * @description Called when the audio upload failed
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {string} params.error - error message
		 * @param {number=} params.limitSize - limit size
		 * @param {number=} params.uploadSize - upload size
		 * @param {number=} params.currentSize - current size
		 * @param {File=} params.file - File object
		 * @returns {Promise<string|undefined>}
		 */
		onAudioUploadError: null,

		/**
		 * @description Called when the editor loaded, file Current editor value
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {Array.<FileManagementInfo>} infoList - info list
		 */
		onAudioLoad: null,

		/**
		 * @description Called when the audio is is uploaded, updated, deleted
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {FileManagementInfo} params.info - info object
		 * @param {Element|null} params.element - target element
		 * @param {"create"|"update"|"delete"} params.state - state
		 * @param {number} params.index - data index
		 * @param {number} params.remainingFilesCount - remaining files count
		 */
		onAudioAction: null,

		/**
		 * @description Called before the audio is deleted
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {Element} params.element - target element
		 * @param {Element} params.container - target's container element (div)
		 * @param {string} params.url - audio url
		 * @returns {Promise<boolean>}
		 */
		onAudioDeleteBefore: null,

		// --- fileUpload
		/**
		 * @description Called when the file is uploaded
		 * - If true is returned, the internal upload process runs normally.
		 * - If false is returned, no image upload is performed.
		 * - If new "info" are returned, replaced the previous "params.info"
		 * - If undefined is returned, it waits until "uploadHandler" is executed.
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {FileInfo} params.info - info object
		 * @param {(newInfo?: FileInfo|null) => void} params.handler - handler function
		 * @returns {Promise<boolean|undefined|AudioInfo>}
		 */
		onFileUploadBefore: null,

		/**
		 * @description Called when the editor loaded, file Current editor value
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {Array.<FileManagementInfo>} infoList - info list
		 */
		onFileLoad: null,

		/**
		 * @description Called when the file is is uploaded, updated, deleted
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {FileManagementInfo} params.info - info object
		 * @param {Element|null} params.element - target element
		 * @param {"create"|"update"|"delete"} params.state - state
		 * @param {number} params.index - data index
		 * @param {number} params.remainingFilesCount - remaining files count
		 */
		onFileAction: null,

		/**
		 * @description Called when the file is upload failed
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {string} params.error - error message
		 * @param {number=} params.limitSize - limit size
		 * @param {number=} params.uploadSize - upload size
		 * @param {number=} params.currentSize - current size
		 * @param {File=} params.file - File object
		 * @returns {Promise<string|undefined>}
		 */
		onFileUploadError: null,

		/**
		 * @description Called before the file is deleted
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {Element} params.element - target element
		 * @param {Element} params.container - target's container element (div)
		 * @param {string} params.url - file url
		 * @returns {Promise<boolean>}
		 */
		onFileDeleteBefore: null,

		// --- exportPDF
		/**
		 * @description Called before the PDF export is started
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {Element} params.target - wysiwyg editable element
		 * @returns {Promise<boolean>}
		 */
		onExportPDFBefore: null,

		// --- fileManager
		/**
		 * @description Events that occur when actions such as uploading or deleting all files are performed in the file manager
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {FileManagementInfo} params.info - info object
		 * @param {Element|null} params.element - target element
		 * @param {"create"|"update"|"delete"} params.state - state
		 * @param {number} params.index - data index
		 * @param {number} params.remainingFilesCount - remaining files count
		 */
		onFileManagerAction: null,

		// --- embed
		/**
		 * @description Called before the embed is inserted
		 * - If true is returned, the internal upload process runs normally.
		 * - If false is returned, no image upload is performed.
		 * - If new fileList are returned,  replaced the previous fileList
		 * - If undefined is returned, it waits until "uploadHandler" is executed.
		 * @param {Object} params
		 * @param {EditorInstance} params.editor - The root editor instance
		 * @param {EmbedInfo} params.info - info object
		 * @param {(newInfo?: EmbedInfo|null) => void} params.handler - handler function
		 */
		onEmbedInputBefore: null
	};
}
