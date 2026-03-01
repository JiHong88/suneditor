// Event function collection
// This is a collection of functions that can be used in the editor's event callback.
// ---------

// --- native events
/**
 * @typedef {Object} BaseEvent
 * @property {SunEditor.Deps} $ - Kernel dependencies
 * @property {SunEditor.FrameContext} frameContext - frame context
 * @property {Event} event - event object
 */

/**
 * @typedef {Object} ClipboardEvent
 * @property {SunEditor.Deps} $ - Kernel dependencies
 * @property {SunEditor.FrameContext} frameContext - frame context
 * @property {Event} event - event object
 * @property {string} data - drop data
 * @property {boolean} maxCharCount - is max char count
 * @property {string} from - `"SE"`|`"MS"`|`""` - source
 */

// --- media
/**
 * @typedef {Object} FileManagementInfo
 * @property {string} src - source URL of the image.
 * @property {number} index - index of the image.
 * @property {string} name - name of the file.
 * @property {number} size -  size of the file in bytes.
 * @property {HTMLElement} element -  target element.
 * @property {() => void} delete -  delete function.
 * @property {() => void} select -  select function.
 */

/**
 * @typedef {Object} ProcessInfo
 * @property {string} origin - origin url
 * @property {string} url - url
 * @property {"video"|"iframe"} tag - tag name
 * @property {?HTMLCollection} children - embed children tags
 */

// --- image
/**
 * @typedef {Object} ImageInfo
 * @property {FileList} files - FileList object
 * @property {HTMLImageElement} element - target element
 * @property {string} inputWidth - width value
 * @property {string} inputHeight - height value
 * @property {string} align - align value
 * @property {boolean} isUpdate - new create or update
 * @property {?HTMLElement} anchor - Anchor element, if it exists
 * @property {string} alt - alt text value
 */

// --- video
/**
 * @typedef {Object} VideoInfo
 * @property {FileList} files - FileList object
 * @property {HTMLIFrameElement|HTMLVideoElement} element - target element
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
 * @property {HTMLAudioElement} element - target element
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
 * @property {HTMLElement} element - target element
 * @property {string} inputWidth - width value
 * @property {string} inputHeight - height value
 * @property {string} align - align value
 * @property {boolean} isUpdate - new create or update
 * @property {string} url - embed url
 * @property {?HTMLElement} children - When the input source is stacked in an `iframe`, etc., the actual embedded DOM
 * @property {?ProcessInfo} process - embed process info
 */

// ----------------- [handlers] ---------------------------------------------------------------------------------------

/**
 * @callback
 * @description Fired when the editor has completed full initialization.
 * This event is deferred via `setTimeout` to ensure all DOM layout calculations are complete,
 * toolbar is visible, `ResizeObserver` is registered, and history stack is initialized.
 * Use this event to safely call editor methods immediately after creation.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 */
function onload(params) {}

/**
 * @callback
 * @description Fired when the editor content area is scrolled.
 * Use this to sync UI elements with scroll position or implement custom scroll behaviors.
 * @param {BaseEvent} params
 */
function onScroll(params) {}

/**
 * @callback
 * @description Fired when the user presses a mouse button down in the editor.
 * Triggered before internal `mousedown` processing.
 * Return `false` to prevent the default editor behavior.
 * @param {BaseEvent} params
 */
function onMouseDown(params) {}

/**
 * @callback
 * @description Fired when the user clicks in the editor.
 * Triggered before component selection and default `line` creation.
 * Return `false` to prevent the default editor behavior.
 * @param {BaseEvent} params
 */
function onClick(params) {}

/**
 * @callback
 * @description Fired before text input is inserted into the editor.
 * Triggered after character count validation.
 * Return `false` to prevent the input from being processed.
 * @param {BaseEvent & {data: string}} params
 */
function onBeforeInput(params) {}

/**
 * @callback
 * @description Fired when text content is input into the editor (typing, composition, paste).
 * Triggered after default `line` creation and selection initialization.
 * Return `false` to prevent history push.
 * @param {BaseEvent & {data: string}} params
 */
function onInput(params) {}

/**
 * @callback
 * @description Fired when the mouse cursor leaves the editor area.
 * Return `false` to prevent the default editor behavior.
 * @param {BaseEvent} params
 */
function onMouseLeave(params) {}

/**
 * @callback
 * @description Fired when the user releases a mouse button in the editor.
 * Triggered after internal selection updates.
 * Return `false` to prevent the default editor behavior.
 * @param {BaseEvent} params
 */
function onMouseUp(params) {}

/**
 * @callback
 * @description Fired when a key is pressed down in the editor.
 * Triggered before shortcut command execution and `keydown` reducers.
 * Return `false` to prevent the default editor behavior including shortcuts, actions, and text input.
 * @param {BaseEvent} params
 */
function onKeyDown(params) {}

/**
 * @callback
 * @description Fired when a key is released in the editor.
 * Triggered after format tag cleanup and zero-width character removal.
 * Return `false` to prevent history push for history-relevant keys.
 * @param {BaseEvent} params
 */
function onKeyUp(params) {}

/**
 * @callback
 * @description Fired when the editor gains focus (managed focus via `editor.focusManager.focus()`).
 * Triggered after toolbar display updates and status flags are set.
 * This is different from `onNativeFocus` which fires on native DOM `focus` events.
 * @param {BaseEvent} params
 */
function onFocus(params) {}

/**
 * @callback
 * @description Fired when the editor receives a native DOM `focus` event.
 * Triggered before managed focus processing.
 * This is the raw browser `focus` event, use `onFocus` for managed focus handling.
 * @param {BaseEvent} params
 */
function onNativeFocus(params) {}

/**
 * @callback
 * @description Fired when the editor loses focus (managed blur via `editor.blur()`).
 * Triggered after balloon toolbar is hidden and status flags are updated.
 * This is different from `onNativeBlur` which fires on native DOM `blur` events.
 * @param {BaseEvent} params
 */
function onBlur(params) {}

/**
 * @callback
 * @description Fired when the editor receives a native DOM `blur` event.
 * Triggered before managed blur processing.
 * This is the raw browser `blur` event, use `onBlur` for managed blur handling.
 * @param {BaseEvent} params
 */
function onNativeBlur(params) {}

/**
 * @callback
 * @description Fired when the user attempts to copy content from the editor.
 * Triggered before copying to clipboard.
 * Return `false` to prevent the copy operation.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {Event} params.event - event object
 * @param {Event} params.clipboardData - `clipboardData`
 */
function onCopy(params) {}

/**
 * @callback
 * @description Fired when the user attempts to cut content from the editor.
 * Triggered before cutting to clipboard.
 * Return `false` to prevent the cut operation and history push.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {Event} params.event - event object
 * @param {Event} params.clipboardData - `clipboardData`
 */
function onCut(params) {}

/**
 * @callback
 * @description Fired when the editor content has changed.
 * Triggered after history stack updates, undo/redo operations, and user edits.
 * Use this to sync external state or validate content.
 * The `data` parameter contains the current HTML content.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {string} params.data - editor HTML content
 */
function onChange(params) {}

/**
 * @callback
 * @description Fired when a toolbar becomes visible.
 * Triggered for balloon mode and inline mode toolbars.
 * The `mode` parameter indicates the toolbar type (`balloon` or `inline`).
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {HTMLElement} params.toolbar - Toolbar element
 * @param {string} params.mode - Toolbar mode
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 */
function onShowToolbar(params) {}

/**
 * @callback
 * @description Fired after a component controller (floating toolbar) is displayed.
 * Triggered when components (images, videos, tables) are selected.
 * The `caller` parameter indicates which plugin triggered the controller.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {string} params.caller - caller plugin name
 * @param {SunEditor.Module.Controller.Info} params.info - info object
 */
function onShowController(params) {}

/**
 * @callback
 * @description Fired before a component controller (floating toolbar) is displayed.
 * Triggered when components (images, videos, tables) are about to be selected.
 * Return `false` to prevent the controller from showing.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {string} params.caller - caller plugin name
 * @param {SunEditor.Module.Controller.Info} params.info - info object
 */
function onBeforeShowController(params) {}

/**
 * @callback
 * @description Fired when the editor switches between WYSIWYG view and code view.
 * The `is` parameter indicates whether code view is now active (`true`) or WYSIWYG view is active (`false`).
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {boolean} params.is - code view status
 */
function onToggleCodeView(params) {}

/**
 * @callback
 * @description Fired when the editor enters or exits fullscreen mode.
 * The `is` parameter indicates whether fullscreen mode is now active (`true`) or normal mode is active (`false`).
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {boolean} params.is - full screen status
 */
function onToggleFullScreen(params) {}

/**
 * @callback
 * @description Fired when the editor's wysiwyg area height changes.
 * Triggered by `ResizeObserver`.
 * Use this to sync external UI elements or implement custom resize behaviors.
 * Parameters include current height, previous height, and the `ResizeObserverEntry`.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {number} params.height - wysiwyg area frame height
 * @param {boolean} params.prevHeight - wysiwyg area previous height
 * @param {ResizeObserverEntry} params.observerEntry - ResizeObserverEntry
 */
function onResizeEditor(params) {}

/**
 * @callback
 * @description Fired after toolbar buttons are created and rendered.
 * Triggered during toolbar initialization and `resetToolbarButtons()`.
 * Use this to customize toolbar DOM or add custom elements to the `buttonTray`.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {HTMLElement} params.buttonTray - button tray element
 */
function onSetToolbarButtons(params) {}

/**
 * @callback
 * @description Fired when the save command is executed (Ctrl+S or save button).
 * Use this to send editor content to a server or perform custom save logic.
 * Return a Promise resolving to `false` to prevent the save operation from completing.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {Event} params.data - editor data
 * @returns {PromiseLike<boolean>}
 */
function onSave(params) {
	return;
}

/**
 * @callback
 * @description Fired when toolbar button states are reset.
 * Triggered during undo/redo operations and history navigation.
 * Use this to update custom toolbar buttons or external UI state.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {string} params.rootKey - frame key
 */
function onResetButtons(params) {}

/**
 * @callback
 * @description Fired before a font family change is applied to the selection.
 * Triggered by font dropdown selection.
 * Return a Promise resolving to `false` to cancel the font change operation.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {string} params.value - font value
 * @returns {PromiseLike<boolean | void>}
 */
function onFontActionBefore(params) {
	return;
}

/**
 * @callback
 * @description Fired when the user attempts to drop content into the editor.
 * Triggered after HTML cleaning and character count validation.
 * Return `false` to cancel drop, or return a string to replace the drop data.
 * @param {ClipboardEvent} params
 * @returns {PromiseLike<boolean | string>}
 */
function onDrop(params) {
	return;
}

/**
 * @callback
 * @description Fired when the user attempts to paste content into the editor.
 * Triggered after HTML cleaning and character count validation.
 * Return `false` to cancel paste, or return a string to replace the paste data.
 * @param {ClipboardEvent} params
 * @returns {PromiseLike<boolean | string | void>}
 */
function onPaste(params) {
	return;
}

/**
 * @callback
 * @description Custom handler for image upload requests.
 * Fired after the `XMLHttpRequest` is sent but before default response processing.
 * Return a Promise resolving to `true` if you handle the upload response yourself,
 * or `false` to use default processing. The `xmlHttp` parameter provides access to the `XMLHttpRequest` object.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {XMLHttpRequest} params.xmlHttp - XMLHttpRequest
 * @param {ImageInfo} params.info - info object
 * @returns {PromiseLike<boolean | void>}
 */
function imageUploadHandler(params) {
	return;
}

/**
 * @callback
 * @description Fired before an image is uploaded to the server.
 * Use this to validate, resize, or modify image data before upload.
 * Return `false` to cancel upload, return an `ImageInfo` object to modify the upload data,
 * or call the `handler` parameter to proceed with modified data.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {ImageInfo} params.info - info object
 * @param {(newInfo?: ImageInfo | null) => void} params.handler - handler function
 * @returns {PromiseLike<boolean | ImageInfo | void>}
 */
function onImageUploadBefore(params) {
	return;
}

/**
 * @callback
 * @description Fired after images are successfully loaded into the editor.
 * Triggered after upload completion or URL-based image insertion.
 * The `infoList` parameter contains an array of `FileManagementInfo` objects for all loaded images.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {Array<FileManagementInfo>} params.infoList - info list
 */
function onImageLoad(params) {}

/**
 * @callback
 * @description Fired when an image is created, updated, or deleted in the editor.
 * The `state` parameter indicates the action type (`create`, `update`, or `delete`).
 * Use this to sync image state with external systems or track image modifications.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {FileManagementInfo} params.info - info object
 * @param {HTMLElement | null} params.element - target element
 * @param {"create" | "update" | "delete"} params.state - state
 * @param {number} params.index - data index
 * @param {number} params.remainingFilesCount - remaining files count
 * @param {string} params.pluginName - plugin name
 */
function onImageAction(params) {}

/**
 * @callback
 * @description Fired when an image upload fails due to size limits, server errors, or other issues.
 * Return a Promise resolving to a custom error message string to override the default error message,
 * or `undefined` to use the default message.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {string} params.error - error message
 * @param {number} [params.limitSize] - limit size
 * @param {number} [params.uploadSize] - upload size
 * @param {number} [params.currentSize] - current size
 * @param {File} [params.file] - File object
 * @returns {PromiseLike<string | void>}
 */
function onImageUploadError(params) {
	return;
}

/**
 * @callback
 * @description Fired before an image is deleted from the editor.
 * Use this to confirm deletion, notify server, or perform cleanup.
 * Return a Promise resolving to `false` to prevent the image from being deleted.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {HTMLElement} params.element - target element
 * @param {HTMLElement} params.container - target's container element (div)
 * @param {string} params.align - align value
 * @param {string} params.alt - alt text value
 * @param {?string} params.url - Anchor url, if it exists
 * @returns {PromiseLike<boolean>}
 */
function onImageDeleteBefore(params) {
	return;
}

/**
 * @callback
 * @description Custom handler for video upload requests.
 * Fired after the `XMLHttpRequest` is sent but before default response processing.
 * Return a Promise resolving to `true` if you handle the upload response yourself,
 * or `false` to use default processing.
 * The `xmlHttp` parameter provides access to the `XMLHttpRequest` object.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {XMLHttpRequest} params.xmlHttp - XMLHttpRequest
 * @param {VideoInfo} params.info - info object
 * @returns {PromiseLike<boolean>}
 */
function videoUploadHandler(params) {
	return;
}

/**
 * @callback
 * @description Fired before a video is uploaded to the server.
 * Use this to validate, transcode, or modify video data before upload.
 * Return `false` to cancel upload, return a `VideoInfo` object to modify the upload data,
 * or call the `handler` parameter to proceed with modified data.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {VideoInfo} params.info - info object
 * @param {(newInfo?: VideoInfo | null) => void} params.handler - handler function
 * @returns {PromiseLike<boolean | VideoInfo | void>}
 */
function onVideoUploadBefore(params) {
	return;
}

/**
 * @callback
 * @description Fired after videos are successfully loaded into the editor.
 * Triggered after upload completion or URL-based video insertion (iframe/video tag).
 * The `infoList` parameter contains an array of `FileManagementInfo` objects for all loaded videos.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {Array<FileManagementInfo>} params.infoList - info list
 */
function onVideoLoad(params) {}

/**
 * @callback
 * @description Fired when a video is created, updated, or deleted in the editor.
 * The `state` parameter indicates the action type (`create`, `update`, or `delete`).
 * Use this to sync video state with external systems or track video modifications.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {FileManagementInfo} params.info - info object
 * @param {HTMLElement | null} params.element - target element
 * @param {"create" | "update" | "delete"} params.state - state
 * @param {number} params.index - data index
 * @param {number} params.remainingFilesCount - remaining files count
 * @param {string} params.pluginName - plugin name
 */
function onVideoAction(params) {}

/**
 * @callback
 * @description Fired when a video upload fails due to size limits, server errors, or other issues.
 * Return a Promise resolving to a custom error message string to override the default error message,
 * or `undefined` to use the default message.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {string} params.error - error message
 * @param {number} [params.limitSize] - limit size
 * @param {number} [params.uploadSize] - upload size
 * @param {number} [params.currentSize] - current size
 * @param {File} [params.file] - File object
 * @returns {PromiseLike<string | void>}
 */
function onVideoUploadError(params) {
	return;
}

/**
 * @callback
 * @description Fired before a video is deleted from the editor.
 * Use this to confirm deletion, notify server, or perform cleanup.
 * Return a Promise resolving to `false` to prevent the video from being deleted.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {HTMLElement} params.element - target element
 * @param {HTMLElement} params.container - target's container element (div)
 * @param {string} params.align - align value
 * @param {string} params.url - video url
 * @returns {PromiseLike<boolean>}
 */
function onVideoDeleteBefore(params) {
	return;
}

/**
 * @callback
 * @description Custom handler for audio upload requests.
 * Fired after the `XMLHttpRequest` is sent but before default response processing.
 * Return a Promise resolving to `true` if you handle the upload response yourself,
 * or `false` to use default processing.
 * The `xmlHttp` parameter provides access to the `XMLHttpRequest` object.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {XMLHttpRequest} params.xmlHttp - XMLHttpRequest
 * @param {AudioInfo} params.info - info object
 * @returns {PromiseLike<boolean>}
 */
function audioUploadHandler(params) {
	return;
}

/**
 * @callback
 * @description Fired before an audio file is uploaded to the server.
 * Use this to validate, transcode, or modify audio data before upload.
 * Return `false` to cancel upload, return an `AudioInfo` object to modify the upload data,
 * or call the `handler` parameter to proceed with modified data.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {AudioInfo} params.info - info object
 * @param {(newInfo?: AudioInfo | null) => void} params.handler - handler function
 * @returns {PromiseLike<boolean | AudioInfo| void>}
 */
function onAudioUploadBefore(params) {
	return;
}

/**
 * @callback
 * @description Fired when an audio upload fails due to size limits, server errors, or other issues.
 * Return a Promise resolving to a custom error message string to override the default error message,
 * or `undefined` to use the default message.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {string} params.error - error message
 * @param {number} [params.limitSize] - limit size
 * @param {number} [params.uploadSize] - upload size
 * @param {number} [params.currentSize] - current size
 * @param {File} [params.file] - File object
 * @returns {PromiseLike<string | void>}
 */
function onAudioUploadError(params) {
	return;
}

/**
 * @callback
 * @description Fired after audio files are successfully loaded into the editor.
 * Triggered after upload completion or URL-based audio insertion.
 * The `infoList` parameter contains an array of `FileManagementInfo` objects for all loaded audio files.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {Array<FileManagementInfo>} params.infoList - info list
 */
function onAudioLoad(params) {}

/**
 * @callback
 * @description Fired when an audio element is created, updated, or deleted in the editor.
 * The `state` parameter indicates the action type (`create`, `update`, or `delete`).
 * Use this to sync audio state with external systems or track audio modifications.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {FileManagementInfo} params.info - info object
 * @param {HTMLElement | null} params.element - target element
 * @param {"create" | "update" | "delete"} params.state - state
 * @param {number} params.index - data index
 * @param {number} params.remainingFilesCount - remaining files count
 * @param {string} params.pluginName - plugin name
 */
function onAudioAction(params) {}

/**
 * @callback
 * @description Fired before an audio element is deleted from the editor.
 * Use this to confirm deletion, notify server, or perform cleanup.
 * Return a Promise resolving to `false` to prevent the audio from being deleted.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {HTMLElement} params.element - target element
 * @param {HTMLElement} params.container - target's container element (div)
 * @param {string} params.url - audio url
 * @returns {PromiseLike<boolean>}
 */
function onAudioDeleteBefore(params) {
	return;
}

/**
 * @callback
 * @description Fired before a file is uploaded to the server (via `fileUpload` plugin).
 * Use this to validate or modify file data before upload.
 * Return `false` to cancel upload, return a `FileInfo` object to modify the upload data,
 * or call the `handler` parameter to proceed with modified data.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {FileInfo} params.info - info object
 * @param {(newInfo?: FileInfo | null) => void} params.handler - handler function
 * @returns {PromiseLike<boolean | FileInfo | void>}
 */
function onFileUploadBefore(params) {
	return;
}

/**
 * @callback
 * @description Fired after files are successfully uploaded and loaded into the editor.
 * Triggered by the `fileUpload` plugin after upload completion.
 * The `infoList` parameter contains an array of `FileManagementInfo` objects for all loaded files.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {Array<FileManagementInfo>} params.infoList - info list
 */
function onFileLoad(params) {}

/**
 * @callback
 * @description Fired when a file link is created, updated, or deleted in the editor.
 * The `state` parameter indicates the action type (`create`, `update`, or `delete`).
 * Use this to sync file state with external systems or track file modifications.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {FileManagementInfo} params.info - info object
 * @param {HTMLElement | null} params.element - target element
 * @param {"create" | "update" | "delete"} params.state - state
 * @param {number} params.index - data index
 * @param {number} params.remainingFilesCount - remaining files count
 * @param {string} params.pluginName - plugin name
 */
function onFileAction(params) {}

/**
 * @callback
 * @description Fired when a file upload fails due to size limits, server errors, or other issues.
 * Return a Promise resolving to a custom error message string to override the default error message,
 * or `undefined` to use the default message.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {string} params.error - error message
 * @param {number} [params.limitSize] - limit size
 * @param {number} [params.uploadSize] - upload size
 * @param {number} [params.currentSize] - current size
 * @param {File} [params.file] - File object
 * @returns {PromiseLike<string | void>}
 */
function onFileUploadError(params) {
	return;
}

/**
 * @callback
 * @description Fired before a file link is deleted from the editor.
 * Use this to confirm deletion, notify server, or perform cleanup.
 * Return a Promise resolving to `false` to prevent the file link from being deleted.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {HTMLElement} params.element - target element
 * @param {HTMLElement} params.container - target's container element (div)
 * @param {string} params.url - file url
 * @returns {PromiseLike<boolean>}
 */
function onFileDeleteBefore(params) {
	return;
}

/**
 * @callback
 * @description Fired before the editor content is exported to PDF.
 * Use this to modify content, add metadata, or cancel the export.
 * Return a Promise resolving to `false` to prevent the PDF export.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {HTMLElement} params.target - wysiwyg editable element
 * @returns {PromiseLike<boolean>}
 */
function onExportPDFBefore(params) {
	return;
}

/**
 * @callback
 * @description Fired when any media element (image, video, audio, file) is created, updated, or deleted.
 * This is a unified event that triggers for all media types.
 * The `pluginName` parameter indicates which plugin triggered the action (`image`, `video`, `audio`, or `file`).
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {FileManagementInfo} params.info - info object
 * @param {HTMLElement | null} params.element - target element
 * @param {"create" | "update" | "delete"} params.state - state
 * @param {number} params.index - data index
 * @param {number} params.remainingFilesCount - remaining files count
 * @param {string} params.pluginName - plugin name
 */
function onFileManagerAction(params) {}

/**
 * @callback
 * @description Fired before an embed URL is processed and inserted into the editor.
 * Use this to validate URLs, add custom embed processors, or modify embed parameters.
 * Return `false` to cancel insertion, return an `EmbedInfo` object to modify the embed data,
 * or call the `handler` parameter to proceed with modified data.
 * @param {EmbedInfo & {$: SunEditor.Deps, handler: (newInfo?: EmbedInfo | null) => void}} params
 * @returns {PromiseLike<boolean | EmbedInfo | void>}
 */
function onEmbedInputBefore(params) {
	return;
}

/**
 * @callback
 * @description Fired before an embedded element (iframe, custom embed) is deleted from the editor.
 * Use this to confirm deletion or perform cleanup.
 * Return a Promise resolving to `false` to prevent the embed from being deleted.
 * @param {Object} params
 * @param {SunEditor.Deps} params.$ - Kernel dependencies
 * @param {HTMLElement} params.element - target element
 * @param {HTMLElement} params.container - target's container element (div)
 * @param {string} params.align - align value
 * @param {string} params.url - embed url
 * @returns {PromiseLike<boolean>}
 */
function onEmbedDeleteBefore(params) {
	return;
}

// ------------------------------------------------ Exports ------------------------------------------------
/**
 * @typedef {Object} EventHandlers
 * @property {?onload} [onload]
 * @property {?onScroll} [onScroll]
 * @property {?onMouseDown} [onMouseDown]
 * @property {?onClick} [onClick]
 * @property {?onBeforeInput} [onBeforeInput]
 * @property {?onInput} [onInput]
 * @property {?onMouseLeave} [onMouseLeave]
 * @property {?onMouseUp} [onMouseUp]
 * @property {?onKeyDown} [onKeyDown]
 * @property {?onKeyUp} [onKeyUp]
 * @property {?onFocus} [onFocus]
 * @property {?onNativeFocus} [onNativeFocus]
 * @property {?onBlur} [onBlur]
 * @property {?onNativeBlur} [onNativeBlur]
 * @property {?onCopy} [onCopy]
 * @property {?onCut} [onCut]
 * @property {?onChange} [onChange]
 * @property {?onShowToolbar} [onShowToolbar]
 * @property {?onShowController} [onShowController]
 * @property {?onBeforeShowController} [onBeforeShowController]
 * @property {?onToggleCodeView} [onToggleCodeView]
 * @property {?onToggleFullScreen} [onToggleFullScreen]
 * @property {?onResizeEditor} [onResizeEditor]
 * @property {?onSetToolbarButtons} [onSetToolbarButtons]
 * @property {?onSave} [onSave]
 * @property {?onResetButtons} [onResetButtons]
 * @property {?onFontActionBefore} [onFontActionBefore]
 * @property {?onDrop} [onDrop]
 * @property {?onPaste} [onPaste]
 * @property {?imageUploadHandler} [imageUploadHandler]
 * @property {?onImageUploadBefore} [onImageUploadBefore]
 * @property {?onImageLoad} [onImageLoad]
 * @property {?onImageAction} [onImageAction]
 * @property {?onImageUploadError} [onImageUploadError]
 * @property {?onImageDeleteBefore} [onImageDeleteBefore]
 * @property {?videoUploadHandler} [videoUploadHandler]
 * @property {?onVideoUploadBefore} [onVideoUploadBefore]
 * @property {?onVideoLoad} [onVideoLoad]
 * @property {?onVideoAction} [onVideoAction]
 * @property {?onVideoUploadError} [onVideoUploadError]
 * @property {?onVideoDeleteBefore} [onVideoDeleteBefore]
 * @property {?audioUploadHandler} [audioUploadHandler]
 * @property {?onAudioUploadBefore} [onAudioUploadBefore]
 * @property {?onAudioUploadError} [onAudioUploadError]
 * @property {?onAudioLoad} [onAudioLoad]
 * @property {?onAudioAction} [onAudioAction]
 * @property {?onAudioDeleteBefore} [onAudioDeleteBefore]
 * @property {?onFileUploadBefore} [onFileUploadBefore]
 * @property {?onFileLoad} [onFileLoad]
 * @property {?onFileAction} [onFileAction]
 * @property {?onFileUploadError} [onFileUploadError]
 * @property {?onFileDeleteBefore} [onFileDeleteBefore]
 * @property {?onExportPDFBefore} [onExportPDFBefore]
 * @property {?onFileManagerAction} [onFileManagerAction]
 * @property {?onEmbedInputBefore} [onEmbedInputBefore]
 * @property {?onEmbedDeleteBefore} [onEmbedDeleteBefore]
 */

export {};
