import type {} from './typedef';
export type BaseEvent = {
	/**
	 * - The root editor instance
	 */
	editor: SunEditor.Core;
	/**
	 * - frame context
	 */
	frameContext: SunEditor.FrameContext;
	/**
	 * - event object
	 */
	event: Event;
};
export type ClipboardEvent = {
	/**
	 * - The root editor instance
	 */
	editor: SunEditor.Core;
	/**
	 * - frame context
	 */
	frameContext: SunEditor.FrameContext;
	/**
	 * - event object
	 */
	event: Event;
	/**
	 * - drop data
	 */
	data: string;
	/**
	 * - is max char count
	 */
	maxCharCount: boolean;
	/**
	 * - "SE"|"MS"|"" - source
	 */
	from: string;
};
export type FileManagementInfo = {
	/**
	 * - source URL of the image.
	 */
	src: string;
	/**
	 * - index of the image.
	 */
	index: number;
	/**
	 * - name of the file.
	 */
	name: string;
	/**
	 * -  size of the file in bytes.
	 */
	size: number;
	/**
	 * -  target element.
	 */
	element: HTMLElement;
	/**
	 * -  delete function.
	 */
	delete: () => void;
	/**
	 * -  select function.
	 */
	select: () => void;
};
export type ProcessInfo = {
	/**
	 * - origin url
	 */
	origin: string;
	/**
	 * - url
	 */
	url: string;
	/**
	 * - tag name
	 */
	tag: 'video' | 'iframe';
	/**
	 * - embed children tags
	 */
	children: HTMLCollection | null;
};
export type ImageInfo = {
	/**
	 * - FileList object
	 */
	files: FileList;
	/**
	 * - target element
	 */
	element: HTMLImageElement;
	/**
	 * - width value
	 */
	inputWidth: string;
	/**
	 * - height value
	 */
	inputHeight: string;
	/**
	 * - align value
	 */
	align: string;
	/**
	 * - new create or update
	 */
	isUpdate: boolean;
	/**
	 * - Anchor element, if it exists
	 */
	anchor: HTMLElement | null;
	/**
	 * - alt text value
	 */
	alt: string;
};
export type VideoInfo = {
	/**
	 * - FileList object
	 */
	files: FileList;
	/**
	 * - target element
	 */
	element: HTMLIFrameElement | HTMLVideoElement;
	/**
	 * - width value
	 */
	inputWidth: string;
	/**
	 * - height value
	 */
	inputHeight: string;
	/**
	 * - align value
	 */
	align: string;
	/**
	 * - new create or update
	 */
	isUpdate: boolean;
	/**
	 * - video url
	 */
	url: string;
	/**
	 * - video process info
	 */
	process: ProcessInfo | null;
};
export type AudioInfo = {
	/**
	 * - target element
	 */
	element: HTMLAudioElement;
	/**
	 * - FileList object
	 */
	files: FileList;
	/**
	 * - new create or update
	 */
	isUpdate: boolean;
};
export type FileInfo = {
	/**
	 * - file url
	 */
	url: string;
	/**
	 * - FileList object
	 */
	files: FileList;
	/**
	 * - upload headers
	 */
	uploadHeaders: any;
};
export type EmbedInfo = {
	/**
	 * - target element
	 */
	element: HTMLElement;
	/**
	 * - width value
	 */
	inputWidth: string;
	/**
	 * - height value
	 */
	inputHeight: string;
	/**
	 * - align value
	 */
	align: string;
	/**
	 * - new create or update
	 */
	isUpdate: boolean;
	/**
	 * - embed url
	 */
	url: string;
	/**
	 * - When the input source is stacked in an iframe, etc., the actual embedded DOM
	 */
	children: HTMLElement | null;
	/**
	 * - embed process info
	 */
	process: ProcessInfo | null;
};
export type EventHandlers = {
	onload?: typeof onload | null;
	onScroll?: typeof onScroll | null;
	onMouseDown?: typeof onMouseDown | null;
	onClick?: typeof onClick | null;
	onBeforeInput?: typeof onBeforeInput | null;
	onInput?: typeof onInput | null;
	onMouseLeave?: typeof onMouseLeave | null;
	onMouseUp?: typeof onMouseUp | null;
	onKeyDown?: typeof onKeyDown | null;
	onKeyUp?: typeof onKeyUp | null;
	onFocus?: typeof onFocus | null;
	onNativeFocus?: typeof onNativeFocus | null;
	onBlur?: typeof onBlur | null;
	onNativeBlur?: typeof onNativeBlur | null;
	onCopy?: typeof onCopy | null;
	onCut?: typeof onCut | null;
	onChange?: typeof onChange | null;
	onShowToolbar?: typeof onShowToolbar | null;
	onShowController?: typeof onShowController | null;
	onBeforeShowController?: typeof onBeforeShowController | null;
	onToggleCodeView?: typeof onToggleCodeView | null;
	onToggleFullScreen?: typeof onToggleFullScreen | null;
	onResizeEditor?: typeof onResizeEditor | null;
	onSetToolbarButtons?: typeof onSetToolbarButtons | null;
	onSave?: typeof onSave | null;
	onResetButtons?: typeof onResetButtons | null;
	onFontActionBefore?: typeof onFontActionBefore | null;
	onDrop?: typeof onDrop | null;
	onPaste?: typeof onPaste | null;
	imageUploadHandler?: typeof imageUploadHandler | null;
	onImageUploadBefore?: typeof onImageUploadBefore | null;
	onImageLoad?: typeof onImageLoad | null;
	onImageAction?: typeof onImageAction | null;
	onImageUploadError?: typeof onImageUploadError | null;
	onImageDeleteBefore?: typeof onImageDeleteBefore | null;
	videoUploadHandler?: typeof videoUploadHandler | null;
	onVideoUploadBefore?: typeof onVideoUploadBefore | null;
	onVideoLoad?: typeof onVideoLoad | null;
	onVideoAction?: typeof onVideoAction | null;
	onVideoUploadError?: typeof onVideoUploadError | null;
	onVideoDeleteBefore?: typeof onVideoDeleteBefore | null;
	audioUploadHandler?: typeof audioUploadHandler | null;
	onAudioUploadBefore?: typeof onAudioUploadBefore | null;
	onAudioUploadError?: typeof onAudioUploadError | null;
	onAudioLoad?: typeof onAudioLoad | null;
	onAudioAction?: typeof onAudioAction | null;
	onAudioDeleteBefore?: typeof onAudioDeleteBefore | null;
	onFileUploadBefore?: typeof onFileUploadBefore | null;
	onFileLoad?: typeof onFileLoad | null;
	onFileAction?: typeof onFileAction | null;
	onFileUploadError?: typeof onFileUploadError | null;
	onFileDeleteBefore?: typeof onFileDeleteBefore | null;
	onExportPDFBefore?: typeof onExportPDFBefore | null;
	onFileManagerAction?: typeof onFileManagerAction | null;
	onEmbedInputBefore?: typeof onEmbedInputBefore | null;
	onEmbedDeleteBefore?: typeof onEmbedDeleteBefore | null;
};
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
/**
 * @typedef {Object} AudioInfo
 * @property {HTMLAudioElement} element - target element
 * @property {FileList} files - FileList object
 * @property {boolean} isUpdate - new create or update
 */
/**
 * @typedef {Object} FileInfo
 * @property {string} url - file url
 * @property {FileList} files - FileList object
 * @property {Object} uploadHeaders - upload headers
 */
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
/**
 * @callback
 * @description Fired when the editor has completed full initialization.
 * This event is deferred via setTimeout to ensure all DOM layout calculations are complete,
 * toolbar is visible, ResizeObserver is registered, and history stack is initialized.
 * Use this event to safely call editor methods immediately after creation.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 */
declare function onload(params: { editor: SunEditor.Core }): void;
/**
 * @callback
 * @description Fired when the editor content area is scrolled.
 * Use this to sync UI elements with scroll position or implement custom scroll behaviors.
 * @param {BaseEvent} params
 */
declare function onScroll(params: BaseEvent): void;
/**
 * @callback
 * @description Fired when the user presses a mouse button down in the editor.
 * Triggered before internal mousedown processing.
 * Return false to prevent the default editor behavior.
 * @param {BaseEvent} params
 */
declare function onMouseDown(params: BaseEvent): void;
/**
 * @callback
 * @description Fired when the user clicks in the editor.
 * Triggered before component selection and default line creation.
 * Return false to prevent the default editor behavior.
 * @param {BaseEvent} params
 */
declare function onClick(params: BaseEvent): void;
/**
 * @callback
 * @description Fired before text input is inserted into the editor.
 * Triggered after character count validation.
 * Return false to prevent the input from being processed.
 * @param {BaseEvent & {data: string}} params
 */
declare function onBeforeInput(
	params: BaseEvent & {
		data: string;
	},
): void;
/**
 * @callback
 * @description Fired when text content is input into the editor (typing, composition, paste).
 * Triggered after default line creation and selection initialization.
 * Return false to prevent history push.
 * @param {BaseEvent & {data: string}} params
 */
declare function onInput(
	params: BaseEvent & {
		data: string;
	},
): void;
/**
 * @callback
 * @description Fired when the mouse cursor leaves the editor area.
 * Return false to prevent the default editor behavior.
 * @param {BaseEvent} params
 */
declare function onMouseLeave(params: BaseEvent): void;
/**
 * @callback
 * @description Fired when the user releases a mouse button in the editor.
 * Triggered after internal selection updates.
 * Return false to prevent the default editor behavior.
 * @param {BaseEvent} params
 */
declare function onMouseUp(params: BaseEvent): void;
/**
 * @callback
 * @description Fired when a key is pressed down in the editor.
 * Triggered before shortcut command execution and keydown reducers.
 * Return false to prevent the default editor behavior including shortcuts, actions, and text input.
 * @param {BaseEvent} params
 */
declare function onKeyDown(params: BaseEvent): void;
/**
 * @callback
 * @description Fired when a key is released in the editor.
 * Triggered after format tag cleanup and zero-width character removal.
 * Return false to prevent history push for history-relevant keys.
 * @param {BaseEvent} params
 */
declare function onKeyUp(params: BaseEvent): void;
/**
 * @callback
 * @description Fired when the editor gains focus (managed focus via editor.focusManager.focus()).
 * Triggered after toolbar display updates and status flags are set.
 * This is different from onNativeFocus which fires on native DOM focus events.
 * @param {BaseEvent} params
 */
declare function onFocus(params: BaseEvent): void;
/**
 * @callback
 * @description Fired when the editor receives a native DOM focus event.
 * Triggered before managed focus processing.
 * This is the raw browser focus event, use onFocus for managed focus handling.
 * @param {BaseEvent} params
 */
declare function onNativeFocus(params: BaseEvent): void;
/**
 * @callback
 * @description Fired when the editor loses focus (managed blur via editor.blur()).
 * Triggered after balloon toolbar is hidden and status flags are updated.
 * This is different from onNativeBlur which fires on native DOM blur events.
 * @param {BaseEvent} params
 */
declare function onBlur(params: BaseEvent): void;
/**
 * @callback
 * @description Fired when the editor receives a native DOM blur event.
 * Triggered before managed blur processing.
 * This is the raw browser blur event, use onBlur for managed blur handling.
 * @param {BaseEvent} params
 */
declare function onNativeBlur(params: BaseEvent): void;
/**
 * @callback
 * @description Fired when the user attempts to copy content from the editor.
 * Triggered before copying to clipboard.
 * Return false to prevent the copy operation.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {Event} params.event - event object
 * @param {Event} params.clipboardData - clipboardData
 */
declare function onCopy(params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; event: Event; clipboardData: Event }): void;
/**
 * @callback
 * @description Fired when the user attempts to cut content from the editor.
 * Triggered before cutting to clipboard.
 * Return false to prevent the cut operation and history push.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {Event} params.event - event object
 * @param {Event} params.clipboardData - clipboardData
 */
declare function onCut(params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; event: Event; clipboardData: Event }): void;
/**
 * @callback
 * @description Fired when the editor content has changed.
 * Triggered after history stack updates, undo/redo operations, and user edits.
 * Use this to sync external state or validate content.
 * The data parameter contains the current HTML content.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {string} params.data - editor HTML content
 */
declare function onChange(params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; data: string }): void;
/**
 * @callback
 * @description Fired when a toolbar becomes visible.
 * Triggered for balloon mode and inline mode toolbars.
 * The mode parameter indicates the toolbar type ('balloon' or 'inline').
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {HTMLElement} params.toolbar - Toolbar element
 * @param {string} params.mode - Toolbar mode
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 */
declare function onShowToolbar(params: { editor: SunEditor.Core; toolbar: HTMLElement; mode: string; frameContext: SunEditor.FrameContext }): void;
/**
 * @callback
 * @description Fired after a component controller (floating toolbar) is displayed.
 * Triggered when components (images, videos, tables) are selected.
 * The caller parameter indicates which plugin triggered the controller.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {string} params.caller - caller plugin name
 * @param {SunEditor.Module.Controller.Info} params.info - info object
 */
declare function onShowController(params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; caller: string; info: SunEditor.Module.Controller.Info }): void;
/**
 * @callback
 * @description Fired before a component controller (floating toolbar) is displayed.
 * Triggered when components (images, videos, tables) are about to be selected.
 * Return false to prevent the controller from showing.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {string} params.caller - caller plugin name
 * @param {SunEditor.Module.Controller.Info} params.info - info object
 */
declare function onBeforeShowController(params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; caller: string; info: SunEditor.Module.Controller.Info }): void;
/**
 * @callback
 * @description Fired when the editor switches between WYSIWYG view and code view.
 * The is parameter indicates whether code view is now active (true) or WYSIWYG view is active (false).
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {boolean} params.is - code view status
 */
declare function onToggleCodeView(params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; is: boolean }): void;
/**
 * @callback
 * @description Fired when the editor enters or exits fullscreen mode.
 * The is parameter indicates whether fullscreen mode is now active (true) or normal mode is active (false).
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {boolean} params.is - full screen status
 */
declare function onToggleFullScreen(params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; is: boolean }): void;
/**
 * @callback
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
declare function onResizeEditor(params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; height: number; prevHeight: boolean; observerEntry: ResizeObserverEntry }): void;
/**
 * @callback
 * @description Fired after toolbar buttons are created and rendered.
 * Triggered during toolbar initialization and resetToolbarButtons().
 * Use this to customize toolbar DOM or add custom elements to the buttonTray.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {HTMLElement} params.buttonTray - button tray element
 */
declare function onSetToolbarButtons(params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; buttonTray: HTMLElement }): void;
/**
 * @callback
 * @description Fired when the save command is executed (Ctrl+S or save button).
 * Use this to send editor content to a server or perform custom save logic.
 * Return a Promise resolving to false to prevent the save operation from completing.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {SunEditor.FrameContext} params.frameContext - frame context
 * @param {Event} params.data - editor data
 * @returns {PromiseLike<boolean>}
 */
declare function onSave(params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; data: Event }): PromiseLike<boolean>;
/**
 * @callback
 * @description Fired when toolbar button states are reset.
 * Triggered during undo/redo operations and history navigation.
 * Use this to update custom toolbar buttons or external UI state.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {string} params.rootKey - frame key
 */
declare function onResetButtons(params: { editor: SunEditor.Core; rootKey: string }): void;
/**
 * @callback
 * @description Fired before a font family change is applied to the selection.
 * Triggered by font dropdown selection.
 * Return a Promise resolving to false to cancel the font change operation.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {string} params.value - font value
 * @returns {PromiseLike<boolean | void>}
 */
declare function onFontActionBefore(params: { editor: SunEditor.Core; value: string }): PromiseLike<boolean | void>;
/**
 * @callback
 * @description Fired when the user attempts to drop content into the editor.
 * Triggered after HTML cleaning and character count validation.
 * Return false to cancel drop, or return a string to replace the drop data.
 * @param {ClipboardEvent} params
 * @returns {PromiseLike<boolean | string>}
 */
declare function onDrop(params: ClipboardEvent): PromiseLike<boolean | string>;
/**
 * @callback
 * @description Fired when the user attempts to paste content into the editor.
 * Triggered after HTML cleaning and character count validation.
 * Return false to cancel paste, or return a string to replace the paste data.
 * @param {ClipboardEvent} params
 * @returns {PromiseLike<boolean | string | void>}
 */
declare function onPaste(params: ClipboardEvent): PromiseLike<boolean | string | void>;
/**
 * @callback
 * @description Custom handler for image upload requests.
 * Fired after the XMLHttpRequest is sent but before default response processing.
 * Return a Promise resolving to true if you handle the upload response yourself,
 * or false to use default processing. The xmlHttp parameter provides access to the XMLHttpRequest object.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {XMLHttpRequest} params.xmlHttp - XMLHttpRequest
 * @param {ImageInfo} params.info - info object
 * @returns {PromiseLike<boolean | void>}
 */
declare function imageUploadHandler(params: { editor: SunEditor.Core; xmlHttp: XMLHttpRequest; info: ImageInfo }): PromiseLike<boolean | void>;
/**
 * @callback
 * @description Fired before an image is uploaded to the server.
 * Use this to validate, resize, or modify image data before upload.
 * Return false to cancel upload, return an ImageInfo object to modify the upload data,
 * or call the handler parameter to proceed with modified data.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {ImageInfo} params.info - info object
 * @param {(newInfo?: ImageInfo | null) => void} params.handler - handler function
 * @returns {PromiseLike<boolean | ImageInfo | void>}
 */
declare function onImageUploadBefore(params: { editor: SunEditor.Core; info: ImageInfo; handler: (newInfo?: ImageInfo | null) => void }): PromiseLike<boolean | ImageInfo | void>;
/**
 * @callback
 * @description Fired after images are successfully loaded into the editor.
 * Triggered after upload completion or URL-based image insertion.
 * The infoList parameter contains an array of FileManagementInfo objects for all loaded images.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {Array<FileManagementInfo>} params.infoList - info list
 */
declare function onImageLoad(params: { editor: SunEditor.Core; infoList: Array<FileManagementInfo> }): void;
/**
 * @callback
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
declare function onImageAction(params: { editor: SunEditor.Core; info: FileManagementInfo; element: HTMLElement | null; state: 'create' | 'update' | 'delete'; index: number; remainingFilesCount: number; pluginName: string }): void;
/**
 * @callback
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
 * @returns {PromiseLike<string | void>}
 */
declare function onImageUploadError(params: { editor: SunEditor.Core; error: string; limitSize?: number; uploadSize?: number; currentSize?: number; file?: File }): PromiseLike<string | void>;
/**
 * @callback
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
 * @returns {PromiseLike<boolean>}
 */
declare function onImageDeleteBefore(params: { editor: SunEditor.Core; element: HTMLElement; container: HTMLElement; align: string; alt: string; url: string | null }): PromiseLike<boolean>;
/**
 * @callback
 * @description Custom handler for video upload requests.
 * Fired after the XMLHttpRequest is sent but before default response processing.
 * Return a Promise resolving to true if you handle the upload response yourself,
 * or false to use default processing.
 * The xmlHttp parameter provides access to the XMLHttpRequest object.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {XMLHttpRequest} params.xmlHttp - XMLHttpRequest
 * @param {VideoInfo} params.info - info object
 * @returns {PromiseLike<boolean>}
 */
declare function videoUploadHandler(params: { editor: SunEditor.Core; xmlHttp: XMLHttpRequest; info: VideoInfo }): PromiseLike<boolean>;
/**
 * @callback
 * @description Fired before a video is uploaded to the server.
 * Use this to validate, transcode, or modify video data before upload.
 * Return false to cancel upload, return a VideoInfo object to modify the upload data,
 * or call the handler parameter to proceed with modified data.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {VideoInfo} params.info - info object
 * @param {(newInfo?: VideoInfo | null) => void} params.handler - handler function
 * @returns {PromiseLike<boolean | VideoInfo | void>}
 */
declare function onVideoUploadBefore(params: { editor: SunEditor.Core; info: VideoInfo; handler: (newInfo?: VideoInfo | null) => void }): PromiseLike<boolean | VideoInfo | void>;
/**
 * @callback
 * @description Fired after videos are successfully loaded into the editor.
 * Triggered after upload completion or URL-based video insertion (iframe/video tag).
 * The infoList parameter contains an array of FileManagementInfo objects for all loaded videos.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {Array<FileManagementInfo>} params.infoList - info list
 */
declare function onVideoLoad(params: { editor: SunEditor.Core; infoList: Array<FileManagementInfo> }): void;
/**
 * @callback
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
declare function onVideoAction(params: { editor: SunEditor.Core; info: FileManagementInfo; element: HTMLElement | null; state: 'create' | 'update' | 'delete'; index: number; remainingFilesCount: number; pluginName: string }): void;
/**
 * @callback
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
 * @returns {PromiseLike<string | void>}
 */
declare function onVideoUploadError(params: { editor: SunEditor.Core; error: string; limitSize?: number; uploadSize?: number; currentSize?: number; file?: File }): PromiseLike<string | void>;
/**
 * @callback
 * @description Fired before a video is deleted from the editor.
 * Use this to confirm deletion, notify server, or perform cleanup.
 * Return a Promise resolving to false to prevent the video from being deleted.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {HTMLElement} params.element - target element
 * @param {HTMLElement} params.container - target's container element (div)
 * @param {string} params.align - align value
 * @param {string} params.url - video url
 * @returns {PromiseLike<boolean>}
 */
declare function onVideoDeleteBefore(params: { editor: SunEditor.Core; element: HTMLElement; container: HTMLElement; align: string; url: string }): PromiseLike<boolean>;
/**
 * @callback
 * @description Custom handler for audio upload requests.
 * Fired after the XMLHttpRequest is sent but before default response processing.
 * Return a Promise resolving to true if you handle the upload response yourself,
 * or false to use default processing.
 * The xmlHttp parameter provides access to the XMLHttpRequest object.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {XMLHttpRequest} params.xmlHttp - XMLHttpRequest
 * @param {AudioInfo} params.info - info object
 * @returns {PromiseLike<boolean>}
 */
declare function audioUploadHandler(params: { editor: SunEditor.Core; xmlHttp: XMLHttpRequest; info: AudioInfo }): PromiseLike<boolean>;
/**
 * @callback
 * @description Fired before an audio file is uploaded to the server.
 * Use this to validate, transcode, or modify audio data before upload.
 * Return false to cancel upload, return an AudioInfo object to modify the upload data,
 * or call the handler parameter to proceed with modified data.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {AudioInfo} params.info - info object
 * @param {(newInfo?: AudioInfo | null) => void} params.handler - handler function
 * @returns {PromiseLike<boolean | AudioInfo| void>}
 */
declare function onAudioUploadBefore(params: { editor: SunEditor.Core; info: AudioInfo; handler: (newInfo?: AudioInfo | null) => void }): PromiseLike<boolean | AudioInfo | void>;
/**
 * @callback
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
 * @returns {PromiseLike<string | void>}
 */
declare function onAudioUploadError(params: { editor: SunEditor.Core; error: string; limitSize?: number; uploadSize?: number; currentSize?: number; file?: File }): PromiseLike<string | void>;
/**
 * @callback
 * @description Fired after audio files are successfully loaded into the editor.
 * Triggered after upload completion or URL-based audio insertion.
 * The infoList parameter contains an array of FileManagementInfo objects for all loaded audio files.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {Array<FileManagementInfo>} params.infoList - info list
 */
declare function onAudioLoad(params: { editor: SunEditor.Core; infoList: Array<FileManagementInfo> }): void;
/**
 * @callback
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
declare function onAudioAction(params: { editor: SunEditor.Core; info: FileManagementInfo; element: HTMLElement | null; state: 'create' | 'update' | 'delete'; index: number; remainingFilesCount: number; pluginName: string }): void;
/**
 * @callback
 * @description Fired before an audio element is deleted from the editor.
 * Use this to confirm deletion, notify server, or perform cleanup.
 * Return a Promise resolving to false to prevent the audio from being deleted.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {HTMLElement} params.element - target element
 * @param {HTMLElement} params.container - target's container element (div)
 * @param {string} params.url - audio url
 * @returns {PromiseLike<boolean>}
 */
declare function onAudioDeleteBefore(params: { editor: SunEditor.Core; element: HTMLElement; container: HTMLElement; url: string }): PromiseLike<boolean>;
/**
 * @callback
 * @description Fired before a file is uploaded to the server (via fileUpload plugin).
 * Use this to validate or modify file data before upload.
 * Return false to cancel upload, return a FileInfo object to modify the upload data,
 * or call the handler parameter to proceed with modified data.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {FileInfo} params.info - info object
 * @param {(newInfo?: FileInfo | null) => void} params.handler - handler function
 * @returns {PromiseLike<boolean | FileInfo | void>}
 */
declare function onFileUploadBefore(params: { editor: SunEditor.Core; info: FileInfo; handler: (newInfo?: FileInfo | null) => void }): PromiseLike<boolean | FileInfo | void>;
/**
 * @callback
 * @description Fired after files are successfully uploaded and loaded into the editor.
 * Triggered by the fileUpload plugin after upload completion.
 * The infoList parameter contains an array of FileManagementInfo objects for all loaded files.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {Array<FileManagementInfo>} params.infoList - info list
 */
declare function onFileLoad(params: { editor: SunEditor.Core; infoList: Array<FileManagementInfo> }): void;
/**
 * @callback
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
declare function onFileAction(params: { editor: SunEditor.Core; info: FileManagementInfo; element: HTMLElement | null; state: 'create' | 'update' | 'delete'; index: number; remainingFilesCount: number; pluginName: string }): void;
/**
 * @callback
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
 * @returns {PromiseLike<string | void>}
 */
declare function onFileUploadError(params: { editor: SunEditor.Core; error: string; limitSize?: number; uploadSize?: number; currentSize?: number; file?: File }): PromiseLike<string | void>;
/**
 * @callback
 * @description Fired before a file link is deleted from the editor.
 * Use this to confirm deletion, notify server, or perform cleanup.
 * Return a Promise resolving to false to prevent the file link from being deleted.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {HTMLElement} params.element - target element
 * @param {HTMLElement} params.container - target's container element (div)
 * @param {string} params.url - file url
 * @returns {PromiseLike<boolean>}
 */
declare function onFileDeleteBefore(params: { editor: SunEditor.Core; element: HTMLElement; container: HTMLElement; url: string }): PromiseLike<boolean>;
/**
 * @callback
 * @description Fired before the editor content is exported to PDF.
 * Use this to modify content, add metadata, or cancel the export.
 * Return a Promise resolving to false to prevent the PDF export.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {HTMLElement} params.target - wysiwyg editable element
 * @returns {PromiseLike<boolean>}
 */
declare function onExportPDFBefore(params: { editor: SunEditor.Core; target: HTMLElement }): PromiseLike<boolean>;
/**
 * @callback
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
declare function onFileManagerAction(params: { editor: SunEditor.Core; info: FileManagementInfo; element: HTMLElement | null; state: 'create' | 'update' | 'delete'; index: number; remainingFilesCount: number; pluginName: string }): void;
/**
 * @callback
 * @description Fired before an embed URL is processed and inserted into the editor.
 * Use this to validate URLs, add custom embed processors, or modify embed parameters.
 * Return false to cancel insertion, return an EmbedInfo object to modify the embed data,
 * or call the handler parameter to proceed with modified data.
 * @param {EmbedInfo & {editor: SunEditor.Core, handler: (newInfo?: EmbedInfo | null) => void}} params
 * @returns {PromiseLike<boolean | EmbedInfo | void>}
 */
declare function onEmbedInputBefore(
	params: EmbedInfo & {
		editor: SunEditor.Core;
		handler: (newInfo?: EmbedInfo | null) => void;
	},
): PromiseLike<boolean | EmbedInfo | void>;
/**
 * @callback
 * @description Fired before an embedded element (iframe, custom embed) is deleted from the editor.
 * Use this to confirm deletion or perform cleanup.
 * Return a Promise resolving to false to prevent the embed from being deleted.
 * @param {Object} params
 * @param {SunEditor.Core} params.editor - The root editor instance
 * @param {HTMLElement} params.element - target element
 * @param {HTMLElement} params.container - target's container element (div)
 * @param {string} params.align - align value
 * @param {string} params.url - embed url
 * @returns {PromiseLike<boolean>}
 */
declare function onEmbedDeleteBefore(params: { editor: SunEditor.Core; element: HTMLElement; container: HTMLElement; align: string; url: string }): PromiseLike<boolean>;
export {};
