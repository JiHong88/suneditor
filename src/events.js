// Event function collection
// This is a collection of functions that can be used in the editor's event callback.
// ---------

// --- native events
/**
 * @typedef {Object} BaseEvent
 * @property {SunEditor.Core} editor - The root editor instance
 * @property {SunEditor.FrameContext} frameContext - frame context
 * @property {Event} event - event object
 */

/**
 * @typedef {Object} ClipboardEvent
 * @property {SunEditor.Core} editor - The root editor instance
 * @property {SunEditor.FrameContext} frameContext - frame context
 * @property {Event} event - event object
 * @property {string} data - drop data
 * @property {boolean} maxCharCount - is max char count
 * @property {string} from - "SE"|"MS"|"" - source
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
 * @property {?HTMLElement} children - When the input source is stacked in an iframe, etc., the actual embedded DOM
 * @property {?ProcessInfo} process - embed process info
 */

// ----------------- [handlers] ---------------------------------------------------------------------------------------

/**
 * @callback onload
 * @description Fired when the editor has completed full initialization.
 * This event is deferred via setTimeout to ensure all DOM layout calculations are complete,
 * toolbar is visible, ResizeObserver is registered, and history stack is initialized.
 * Use this event to safely call editor methods immediately after creation.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 */

/**
 * @callback onScroll
 * @description Fired when the editor content area is scrolled.
 * Use this to sync UI elements with scroll position or implement custom scroll behaviors.
 * @param {BaseEvent} params
 */

/**
 * @callback onMouseDown
 * @description Fired when the user presses a mouse button down in the editor.
 * Triggered before internal mousedown processing.
 * Return false to prevent the default editor behavior.
 * @param {BaseEvent} params
 */

/**
 * @callback onClick
 * @description Fired when the user clicks in the editor.
 * Triggered before component selection and default line creation.
 * Return false to prevent the default editor behavior.
 * @param {BaseEvent} params
 */

/**
 * @callback onBeforeInput
 * @description Fired before text input is inserted into the editor.
 * Triggered after character count validation.
 * Return false to prevent the input from being processed.
 * @param {BaseEvent & {data: string}} params
 */

/**
 * @callback onInput
 * @description Fired when text content is input into the editor (typing, composition, paste).
 * Triggered after default line creation and selection initialization.
 * Return false to prevent history push.
 * @param {BaseEvent & {data: string}} params
 */

/**
 * @callback onMouseLeave
 * @description Fired when the mouse cursor leaves the editor area.
 * Return false to prevent the default editor behavior.
 * @param {BaseEvent} params
 */

/**
 * @callback onMouseUp
 * @description Fired when the user releases a mouse button in the editor.
 * Triggered after internal selection updates.
 * Return false to prevent the default editor behavior.
 * @param {BaseEvent} params
 */

/**
 * @callback onKeyDown
 * @description Fired when a key is pressed down in the editor.
 * Triggered before shortcut command execution and keydown reducers.
 * Return false to prevent the default editor behavior including shortcuts, actions, and text input.
 * @param {BaseEvent} params
 */

/**
 * @callback onKeyUp
 * @description Fired when a key is released in the editor.
 * Triggered after format tag cleanup and zero-width character removal.
 * Return false to prevent history push for history-relevant keys.
 * @param {BaseEvent} params
 */

/**
 * @callback onFocus
 * @description Fired when the editor gains focus (managed focus via editor.focus()).
 * Triggered after toolbar display updates and status flags are set.
 * This is different from onNativeFocus which fires on native DOM focus events.
 * @param {BaseEvent} params
 */

/**
 * @callback onNativeFocus
 * @description Fired when the editor receives a native DOM focus event.
 * Triggered before managed focus processing.
 * This is the raw browser focus event, use onFocus for managed focus handling.
 * @param {BaseEvent} params
 */

/**
 * @callback onBlur
 * @description Fired when the editor loses focus (managed blur via editor.blur()).
 * Triggered after balloon toolbar is hidden and status flags are updated.
 * This is different from onNativeBlur which fires on native DOM blur events.
 * @param {BaseEvent} params
 */

/**
 * @callback onNativeBlur
 * @description Fired when the editor receives a native DOM blur event.
 * Triggered before managed blur processing.
 * This is the raw browser blur event, use onBlur for managed blur handling.
 * @param {BaseEvent} params
 */

/**
 * @callback onCopy
 * @description Fired when the user attempts to copy content from the editor.
 * Triggered before copying to clipboard.
 * Return false to prevent the copy operation.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {Event} params.event - event object
 * @param {Event} params.clipboardData - clipboardData
 */

/**
 * @callback onCut
 * @description Fired when the user attempts to cut content from the editor.
 * Triggered before cutting to clipboard.
 * Return false to prevent the cut operation and history push.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {Event} params.event - event object
 * @param {Event} params.clipboardData - clipboardData
 */

/**
 * @callback onChange
 * @description Fired when the editor content has changed.
 * Triggered after history stack updates, undo/redo operations, and user edits.
 * Use this to sync external state or validate content.
 * The data parameter contains the current HTML content.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {string} params.data - editor HTML content
 */

/**
 * @callback onShowToolbar
 * @description Fired when a toolbar becomes visible.
 * Triggered for balloon mode and inline mode toolbars.
 * The mode parameter indicates the toolbar type ('balloon' or 'inline').
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {HTMLElement} params.toolbar - Toolbar element
 * @param {string} params.mode - Toolbar mode
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 */

/**
 * @callback onShowController
 * @description Fired after a component controller (floating toolbar) is displayed.
 * Triggered when components (images, videos, tables) are selected.
 * The caller parameter indicates which plugin triggered the controller.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {string} params.caller - caller plugin name
 * @param {SunEditor.Module.Controller.Info} params.info - info object
 */

/**
 * @callback onBeforeShowController
 * @description Fired before a component controller (floating toolbar) is displayed.
 * Triggered when components (images, videos, tables) are about to be selected.
 * Return false to prevent the controller from showing.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {string} params.caller - caller plugin name
 * @param {SunEditor.Module.Controller.Info} params.info - info object
 */

/**
 * @callback onToggleCodeView
 * @description Fired when the editor switches between WYSIWYG view and code view.
 * The is parameter indicates whether code view is now active (true) or WYSIWYG view is active (false).
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {boolean} params.is - code view status
 */

/**
 * @callback onToggleFullScreen
 * @description Fired when the editor enters or exits fullscreen mode.
 * The is parameter indicates whether fullscreen mode is now active (true) or normal mode is active (false).
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {boolean} params.is - full screen status
 */

/**
 * @callback onResizeEditor
 * @description Fired when the editor's wysiwyg area height changes.
 * Triggered by ResizeObserver.
 * Use this to sync external UI elements or implement custom resize behaviors.
 * Parameters include current height, previous height, and the ResizeObserverEntry.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {number} params.height - wysiwyg area frame height
 * @param {boolean} params.prevHeight - wysiwyg area previous height
 * @param {ResizeObserverEntry} params.observerEntry - ResizeObserverEntry
 */

/**
 * @callback onSetToolbarButtons
 * @description Fired after toolbar buttons are created and rendered.
 * Triggered during toolbar initialization and resetToolbarButtons().
 * Use this to customize toolbar DOM or add custom elements to the buttonTray.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {HTMLElement} params.buttonTray - button tray element
 */

/**
 * @callback onSave
 * @description Fired when the save command is executed (Ctrl+S or save button).
 * Use this to send editor content to a server or perform custom save logic.
 * Return a Promise resolving to false to prevent the save operation from completing.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {Event} params.data - editor data
 * @returns {Promise<boolean>}
 */

/**
 * @callback onResetButtons
 * @description Fired when toolbar button states are reset.
 * Triggered during undo/redo operations and history navigation.
 * Use this to update custom toolbar buttons or external UI state.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {string} params.rootKey - frame key
 */

/**
 * @callback onFontActionBefore
 * @description Fired before a font family change is applied to the selection.
 * Triggered by font dropdown selection.
 * Return a Promise resolving to false to cancel the font change operation.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {string} params.value - font value
 * @returns {Promise<boolean | undefined>}
 */

/**
 * @callback onDrop
 * @description Fired when the user attempts to drop content into the editor.
 * Triggered after HTML cleaning and character count validation.
 * Return false to cancel drop, or return a string to replace the drop data.
 * @param {ClipboardEvent} params
 * @returns {Promise<boolean | string>}
 */

/**
 * @callback onPaste
 * @description Fired when the user attempts to paste content into the editor.
 * Triggered after HTML cleaning and character count validation.
 * Return false to cancel paste, or return a string to replace the paste data.
 * @param {ClipboardEvent} params
 * @returns {Promise<boolean | string>}
 */

/**
 * @callback imageUploadHandler
 * @description Custom handler for image upload requests.
 * Fired after the XMLHttpRequest is sent but before default response processing.
 * Return a Promise resolving to true if you handle the upload response yourself,
 * or false to use default processing. The xmlHttp parameter provides access to the XMLHttpRequest object.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {XMLHttpRequest} params.xmlHttp - XMLHttpRequest
 * @param {ImageInfo} params.info - info object
 * @returns {Promise<boolean>}
 */

/**
 * @callback onImageUploadBefore
 * @description Fired before an image is uploaded to the server.
 * Use this to validate, resize, or modify image data before upload.
 * Return false to cancel upload, return an ImageInfo object to modify the upload data,
 * or call the handler parameter to proceed with modified data.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {ImageInfo} params.info - info object
 * @param {(newInfo?: ImageInfo | null) => void} params.handler - handler function
 * @returns {Promise<boolean | undefined | ImageInfo>}
 */

/**
 * @callback onImageLoad
 * @description Fired after images are successfully loaded into the editor.
 * Triggered after upload completion or URL-based image insertion.
 * The infoList parameter contains an array of FileManagementInfo objects for all loaded images.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {Array<FileManagementInfo>} params.infoList - info list
 */

/**
 * @callback onImageAction
 * @description Fired when an image is created, updated, or deleted in the editor.
 * The state parameter indicates the action type ('create', 'update', or 'delete').
 * Use this to sync image state with external systems or track image modifications.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {FileManagementInfo} params.info - info object
 * @param {HTMLElement | null} params.element - target element
 * @param {"create" | "update" | "delete"} params.state - state
 * @param {number} params.index - data index
 * @param {number} params.remainingFilesCount - remaining files count
 * @param {string} params.pluginName - plugin name
 */

/**
 * @callback onImageUploadError
 * @description Fired when an image upload fails due to size limits, server errors, or other issues.
 * Return a Promise resolving to a custom error message string to override the default error message,
 * or undefined to use the default message.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {string} params.error - error message
 * @param {number} [params.limitSize] - limit size
 * @param {number} [params.uploadSize] - upload size
 * @param {number} [params.currentSize] - current size
 * @param {File} [params.file] - File object
 * @returns {Promise<string | undefined>}
 */

/**
 * @callback onImageDeleteBefore
 * @description Fired before an image is deleted from the editor.
 * Use this to confirm deletion, notify server, or perform cleanup.
 * Return a Promise resolving to false to prevent the image from being deleted.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {HTMLElement} params.element - target element
 * @param {HTMLElement} params.container - target's container element (div)
 * @param {string} params.align - align value
 * @param {string} params.alt - alt text value
 * @param {?string} params.url - Anchor url, if it exists
 * @returns {Promise<boolean>}
 */

/**
 * @callback videoUploadHandler
 * @description Custom handler for video upload requests.
 * Fired after the XMLHttpRequest is sent but before default response processing.
 * Return a Promise resolving to true if you handle the upload response yourself,
 * or false to use default processing.
 * The xmlHttp parameter provides access to the XMLHttpRequest object.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {XMLHttpRequest} params.xmlHttp - XMLHttpRequest
 * @param {VideoInfo} params.info - info object
 * @returns {Promise<boolean>}
 */

/**
 * @callback onVideoUploadBefore
 * @description Fired before a video is uploaded to the server.
 * Use this to validate, transcode, or modify video data before upload.
 * Return false to cancel upload, return a VideoInfo object to modify the upload data,
 * or call the handler parameter to proceed with modified data.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {VideoInfo} params.info - info object
 * @param {(newInfo?: VideoInfo | null) => void} params.handler - handler function
 * @returns {Promise<boolean | undefined | VideoInfo>}
 */

/**
 * @callback onVideoLoad
 * @description Fired after videos are successfully loaded into the editor.
 * Triggered after upload completion or URL-based video insertion (iframe/video tag).
 * The infoList parameter contains an array of FileManagementInfo objects for all loaded videos.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {Array<FileManagementInfo>} params.infoList - info list
 */

/**
 * @callback onVideoAction
 * @description Fired when a video is created, updated, or deleted in the editor.
 * The state parameter indicates the action type ('create', 'update', or 'delete').
 * Use this to sync video state with external systems or track video modifications.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {FileManagementInfo} params.info - info object
 * @param {HTMLElement | null} params.element - target element
 * @param {"create" | "update" | "delete"} params.state - state
 * @param {number} params.index - data index
 * @param {number} params.remainingFilesCount - remaining files count
 * @param {string} params.pluginName - plugin name
 */

/**
 * @callback onVideoUploadError
 * @description Fired when a video upload fails due to size limits, server errors, or other issues.
 * Return a Promise resolving to a custom error message string to override the default error message,
 * or undefined to use the default message.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {string} params.error - error message
 * @param {number} [params.limitSize] - limit size
 * @param {number} [params.uploadSize] - upload size
 * @param {number} [params.currentSize] - current size
 * @param {File} [params.file] - File object
 * @returns {Promise<string | undefined>}
 */

/**
 * @callback onVideoDeleteBefore
 * @description Fired before a video is deleted from the editor.
 * Use this to confirm deletion, notify server, or perform cleanup.
 * Return a Promise resolving to false to prevent the video from being deleted.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {HTMLElement} params.element - target element
 * @param {HTMLElement} params.container - target's container element (div)
 * @param {string} params.align - align value
 * @param {string} params.url - video url
 * @returns {Promise<boolean>}
 */

/**
 * @callback audioUploadHandler
 * @description Custom handler for audio upload requests.
 * Fired after the XMLHttpRequest is sent but before default response processing.
 * Return a Promise resolving to true if you handle the upload response yourself,
 * or false to use default processing.
 * The xmlHttp parameter provides access to the XMLHttpRequest object.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {XMLHttpRequest} params.xmlHttp - XMLHttpRequest
 * @param {AudioInfo} params.info - info object
 * @returns {Promise<boolean>}
 */

/**
 * @callback onAudioUploadBefore
 * @description Fired before an audio file is uploaded to the server.
 * Use this to validate, transcode, or modify audio data before upload.
 * Return false to cancel upload, return an AudioInfo object to modify the upload data,
 * or call the handler parameter to proceed with modified data.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {AudioInfo} params.info - info object
 * @param {(newInfo?: AudioInfo | null) => void} params.handler - handler function
 * @returns {Promise<boolean | undefined | AudioInfo>}
 */

/**
 * @callback onAudioUploadError
 * @description Fired when an audio upload fails due to size limits, server errors, or other issues.
 * Return a Promise resolving to a custom error message string to override the default error message,
 * or undefined to use the default message.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {string} params.error - error message
 * @param {number} [params.limitSize] - limit size
 * @param {number} [params.uploadSize] - upload size
 * @param {number} [params.currentSize] - current size
 * @param {File} [params.file] - File object
 * @returns {Promise<string | undefined>}
 */

/**
 * @callback onAudioLoad
 * @description Fired after audio files are successfully loaded into the editor.
 * Triggered after upload completion or URL-based audio insertion.
 * The infoList parameter contains an array of FileManagementInfo objects for all loaded audio files.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {Array<FileManagementInfo>} params.infoList - info list
 */

/**
 * @callback onAudioAction
 * @description Fired when an audio element is created, updated, or deleted in the editor.
 * The state parameter indicates the action type ('create', 'update', or 'delete').
 * Use this to sync audio state with external systems or track audio modifications.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {FileManagementInfo} params.info - info object
 * @param {HTMLElement | null} params.element - target element
 * @param {"create" | "update" | "delete"} params.state - state
 * @param {number} params.index - data index
 * @param {number} params.remainingFilesCount - remaining files count
 * @param {string} params.pluginName - plugin name
 */

/**
 * @callback onAudioDeleteBefore
 * @description Fired before an audio element is deleted from the editor.
 * Use this to confirm deletion, notify server, or perform cleanup.
 * Return a Promise resolving to false to prevent the audio from being deleted.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {HTMLElement} params.element - target element
 * @param {HTMLElement} params.container - target's container element (div)
 * @param {string} params.url - audio url
 * @returns {Promise<boolean>}
 */

/**
 * @callback onFileUploadBefore
 * @description Fired before a file is uploaded to the server (via fileUpload plugin).
 * Use this to validate or modify file data before upload.
 * Return false to cancel upload, return a FileInfo object to modify the upload data,
 * or call the handler parameter to proceed with modified data.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {FileInfo} params.info - info object
 * @param {(newInfo?: FileInfo | null) => void} params.handler - handler function
 * @returns {Promise<boolean | undefined | FileInfo>}
 */

/**
 * @callback onFileLoad
 * @description Fired after files are successfully uploaded and loaded into the editor.
 * Triggered by the fileUpload plugin after upload completion.
 * The infoList parameter contains an array of FileManagementInfo objects for all loaded files.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {Array<FileManagementInfo>} params.infoList - info list
 */

/**
 * @callback onFileAction
 * @description Fired when a file link is created, updated, or deleted in the editor.
 * The state parameter indicates the action type ('create', 'update', or 'delete').
 * Use this to sync file state with external systems or track file modifications.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {FileManagementInfo} params.info - info object
 * @param {HTMLElement | null} params.element - target element
 * @param {"create" | "update" | "delete"} params.state - state
 * @param {number} params.index - data index
 * @param {number} params.remainingFilesCount - remaining files count
 * @param {string} params.pluginName - plugin name
 */

/**
 * @callback onFileUploadError
 * @description Fired when a file upload fails due to size limits, server errors, or other issues.
 * Return a Promise resolving to a custom error message string to override the default error message,
 * or undefined to use the default message.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {string} params.error - error message
 * @param {number} [params.limitSize] - limit size
 * @param {number} [params.uploadSize] - upload size
 * @param {number} [params.currentSize] - current size
 * @param {File} [params.file] - File object
 * @returns {Promise<string | undefined>}
 */

/**
 * @callback onFileDeleteBefore
 * @description Fired before a file link is deleted from the editor.
 * Use this to confirm deletion, notify server, or perform cleanup.
 * Return a Promise resolving to false to prevent the file link from being deleted.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {HTMLElement} params.element - target element
 * @param {HTMLElement} params.container - target's container element (div)
 * @param {string} params.url - file url
 * @returns {Promise<boolean>}
 */

/**
 * @callback onExportPDFBefore
 * @description Fired before the editor content is exported to PDF.
 * Use this to modify content, add metadata, or cancel the export.
 * Return a Promise resolving to false to prevent the PDF export.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {HTMLElement} params.target - wysiwyg editable element
 * @returns {Promise<boolean>}
 */

/**
 * @callback onFileManagerAction
 * @description Fired when any media element (image, video, audio, file) is created, updated, or deleted.
 * This is a unified event that triggers for all media types.
 * The pluginName parameter indicates which plugin triggered the action ('image', 'video', 'audio', or 'file').
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {FileManagementInfo} params.info - info object
 * @param {HTMLElement | null} params.element - target element
 * @param {"create" | "update" | "delete"} params.state - state
 * @param {number} params.index - data index
 * @param {number} params.remainingFilesCount - remaining files count
 * @param {string} params.pluginName - plugin name
 */

/**
 * @callback onEmbedInputBefore
 * @description Fired before an embed URL is processed and inserted into the editor.
 * Use this to validate URLs, add custom embed processors, or modify embed parameters.
 * Return false to cancel insertion, return an EmbedInfo object to modify the embed data,
 * or call the handler parameter to proceed with modified data.
 * @param {EmbedInfo & {editor: SunEditor.Core, handler: (newInfo?: EmbedInfo | null) => void}} params
 * @returns {Promise<boolean | undefined | EmbedInfo>}
 */

/**
 * @callback onEmbedDeleteBefore
 * @description Fired before an embedded element (iframe, custom embed) is deleted from the editor.
 * Use this to confirm deletion or perform cleanup.
 * Return a Promise resolving to false to prevent the embed from being deleted.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {HTMLElement} params.element - target element
 * @param {HTMLElement} params.container - target's container element (div)
 * @param {string} params.align - align value
 * @param {string} params.url - embed url
 * @returns {Promise<boolean>}
 */

// ------------------------------------------------ Exports ------------------------------------------------
/**
 * @typedef {Object} EventHandlers
 * @property {onload | null} [onload]
 * @property {onScroll | null} [onScroll]
 * @property {onMouseDown | null} [onMouseDown]
 * @property {onClick | null} [onClick]
 * @property {onBeforeInput | null} [onBeforeInput]
 * @property {onInput | null} [onInput]
 * @property {onMouseLeave | null} [onMouseLeave]
 * @property {onMouseUp | null} [onMouseUp]
 * @property {onKeyDown | null} [onKeyDown]
 * @property {onKeyUp | null} [onKeyUp]
 * @property {onFocus | null} [onFocus]
 * @property {onNativeFocus | null} [onNativeFocus]
 * @property {onBlur | null} [onBlur]
 * @property {onNativeBlur | null} [onNativeBlur]
 * @property {onCopy | null} [onCopy]
 * @property {onCut | null} [onCut]
 * @property {onChange | null} [onChange]
 * @property {onShowToolbar | null} [onShowToolbar]
 * @property {onShowController | null} [onShowController]
 * @property {onBeforeShowController | null} [onBeforeShowController]
 * @property {onToggleCodeView | null} [onToggleCodeView]
 * @property {onToggleFullScreen | null} [onToggleFullScreen]
 * @property {onResizeEditor | null} [onResizeEditor]
 * @property {onSetToolbarButtons | null} [onSetToolbarButtons]
 * @property {onSave | null} [onSave]
 * @property {onResetButtons | null} [onResetButtons]
 * @property {onFontActionBefore | null} [onFontActionBefore]
 * @property {onDrop | null} [onDrop]
 * @property {onPaste | null} [onPaste]
 * @property {imageUploadHandler | null} [imageUploadHandler]
 * @property {onImageUploadBefore | null} [onImageUploadBefore]
 * @property {onImageLoad | null} [onImageLoad]
 * @property {onImageAction | null} [onImageAction]
 * @property {onImageUploadError | null} [onImageUploadError]
 * @property {onImageDeleteBefore | null} [onImageDeleteBefore]
 * @property {videoUploadHandler | null} [videoUploadHandler]
 * @property {onVideoUploadBefore | null} [onVideoUploadBefore]
 * @property {onVideoLoad | null} [onVideoLoad]
 * @property {onVideoAction | null} [onVideoAction]
 * @property {onVideoUploadError | null} [onVideoUploadError]
 * @property {onVideoDeleteBefore | null} [onVideoDeleteBefore]
 * @property {audioUploadHandler | null} [audioUploadHandler]
 * @property {onAudioUploadBefore | null} [onAudioUploadBefore]
 * @property {onAudioUploadError | null} [onAudioUploadError]
 * @property {onAudioLoad | null} [onAudioLoad]
 * @property {onAudioAction | null} [onAudioAction]
 * @property {onAudioDeleteBefore | null} [onAudioDeleteBefore]
 * @property {onFileUploadBefore | null} [onFileUploadBefore]
 * @property {onFileLoad | null} [onFileLoad]
 * @property {onFileAction | null} [onFileAction]
 * @property {onFileUploadError | null} [onFileUploadError]
 * @property {onFileDeleteBefore | null} [onFileDeleteBefore]
 * @property {onExportPDFBefore | null} [onExportPDFBefore]
 * @property {onFileManagerAction | null} [onFileManagerAction]
 * @property {onEmbedInputBefore | null} [onEmbedInputBefore]
 * @property {onEmbedDeleteBefore | null} [onEmbedDeleteBefore]
 */

export {};
