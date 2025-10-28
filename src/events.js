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
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 */

/**
 * @callback onScroll
 * @param {BaseEvent} params
 */

/**
 * @callback onMouseDown
 * @param {BaseEvent} params
 */

/**
 * @callback onClick
 * @param {BaseEvent} params
 */

/**
 * @callback onBeforeInput
 * @param {BaseEvent} params
 */

/**
 * @callback onInput
 * @param {BaseEvent} params
 */

/**
 * @callback onMouseLeave
 * @param {BaseEvent} params
 */

/**
 * @callback onKeyDown
 * @param {BaseEvent} params
 */

/**
 * @callback onKeyUp
 * @param {BaseEvent} params
 */

/**
 * @callback onFocus
 * @param {BaseEvent} params
 */

/**
 * @callback onNativeFocus
 * @param {BaseEvent} params
 */

/**
 * @callback onBlur
 * @param {BaseEvent} params
 */

/**
 * @callback onNativeBlur
 * @param {BaseEvent} params
 */

/**
 * @callback onCopy
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {Event} params.event - event object
 * @param {Event} params.clipboardData - clipboardData
 */

/**
 * @callback onCut
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {Event} params.event - event object
 * @param {Event} params.clipboardData - clipboardData
 */

/**
 * @callback onChange
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {Event} params.event - event object
 * @param {Event} params.data - editor data
 */

/**
 * @callback onShowToolbar
 * @param {HTMLElement} toolbar - Toolbar element
 * @param {string} mode - Toolbar mode
 */

/**
 * @callback onShowController
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {string} params.caller - caller plugin name
 * @param {SunEditor.Module.Controller.Info} params.info - info object
 */

/**
 * @callback onBeforeShowController
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {string} params.caller - caller plugin name
 * @param {SunEditor.Module.Controller.Info} params.info - info object
 */

/**
 * @callback onToggleCodeView
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {boolean} params.is - code view status
 */

/**
 * @callback onToggleFullScreen
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {boolean} params.is - full screen status
 */

/**
 * @callback onResizeEditor
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {number} params.height - wysiwyg area frame height
 * @param {boolean} params.prevHeight - wysiwyg area previous height
 * @param {ResizeObserverEntry} params.observerEntry - ResizeObserverEntry
 */

/**
 * @callback onSetToolbarButtons
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {HTMLElement} params.buttonTray - button tray element
 */

/**
 * @callback onSave
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {Event} params.data - editor data
 * @returns {Promise<boolean>}
 */

/**
 * @callback onDrop
 * @param {ClipboardEvent} params
 * @returns {Promise<boolean | string>}
 */

/**
 * @callback onPaste
 * @param {ClipboardEvent} params
 * @returns {Promise<boolean | string>}
 */

/**
 * @callback imageUploadHandler
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {XMLHttpRequest} params.xmlHttp - XMLHttpRequest
 * @param {ImageInfo} params.info - info object
 * @returns {Promise<boolean>}
 */

/**
 * @callback onImageUploadBefore
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {ImageInfo} params.info - info object
 * @param {(newInfo?: ImageInfo | null) => void} params.handler - handler function
 * @returns {Promise<boolean | undefined | ImageInfo>}
 */

/**
 * @callback onImageLoad
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {Array<FileManagementInfo>} infoList - info list
 */

/**
 * @callback onImageAction
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
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {XMLHttpRequest} params.xmlHttp - XMLHttpRequest
 * @param {VideoInfo} params.info - info object
 * @returns {Promise<boolean>}
 */

/**
 * @callback onVideoUploadBefore
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {VideoInfo} params.info - info object
 * @param {(newInfo?: VideoInfo | null) => void} params.handler - handler function
 * @returns {Promise<boolean | undefined | VideoInfo>}
 */

/**
 * @callback onVideoLoad
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {Array<FileManagementInfo>} infoList - info list
 */

/**
 * @callback onVideoAction
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
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {XMLHttpRequest} params.xmlHttp - XMLHttpRequest
 * @param {AudioInfo} params.info - info object
 * @returns {Promise<boolean>}
 */

/**
 * @callback onAudioUploadBefore
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {AudioInfo} params.info - info object
 * @param {(newInfo?: AudioInfo | null) => void} params.handler - handler function
 * @returns {Promise<boolean | undefined | AudioInfo>}
 */

/**
 * @callback onAudioUploadError
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
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {Array<FileManagementInfo>} infoList - info list
 */

/**
 * @callback onAudioAction
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
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {HTMLElement} params.element - target element
 * @param {HTMLElement} params.container - target's container element (div)
 * @param {string} params.url - audio url
 * @returns {Promise<boolean>}
 */

/**
 * @callback onFileUploadBefore
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {FileInfo} params.info - info object
 * @param {(newInfo?: FileInfo | null) => void} params.handler - handler function
 * @returns {Promise<boolean | undefined | FileInfo>}
 */

/**
 * @callback onFileLoad
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {Array<FileManagementInfo>} infoList - info list
 */

/**
 * @callback onFileAction
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
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {HTMLElement} params.element - target element
 * @param {HTMLElement} params.container - target's container element (div)
 * @param {string} params.url - file url
 * @returns {Promise<boolean>}
 */

/**
 * @callback onExportPDFBefore
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {HTMLElement} params.target - wysiwyg editable element
 * @returns {Promise<boolean>}
 */

/**
 * @callback onFileManagerAction
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
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {EmbedInfo} params.info - info object
 * @param {(newInfo?: EmbedInfo | null) => void} params.handler - handler function
 */

/**
 * @callback onEmbedDeleteBefore
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {HTMLElement} params.element - target element
 * @param {HTMLElement} params.container - target's container element (div)
 * @param {string} params.align - align value
 * @param {string} params.url - embed url
 * @returns {Promise<boolean>}
 */

/**
 * @typedef {Object} EventHandlers
 * @property {onload | null} [onload]
 * @property {onScroll | null} [onScroll]
 * @property {onMouseDown | null} [onMouseDown]
 * @property {onClick | null} [onClick]
 * @property {onBeforeInput | null} [onBeforeInput]
 * @property {onInput | null} [onInput]
 * @property {onMouseLeave | null} [onMouseLeave]
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
