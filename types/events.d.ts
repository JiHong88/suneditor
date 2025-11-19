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
export type onload = () => any;
export type onScroll = () => any;
export type onMouseDown = () => any;
export type onClick = () => any;
export type onBeforeInput = () => any;
export type onInput = () => any;
export type onMouseLeave = () => any;
export type onMouseUp = () => any;
export type onKeyDown = () => any;
export type onKeyUp = () => any;
export type onFocus = () => any;
export type onNativeFocus = () => any;
export type onBlur = () => any;
export type onNativeBlur = () => any;
export type onCopy = () => any;
export type onCut = () => any;
export type onChange = () => any;
export type onShowToolbar = () => any;
export type onShowController = () => any;
export type onBeforeShowController = () => any;
export type onToggleCodeView = () => any;
export type onToggleFullScreen = () => any;
export type onResizeEditor = () => any;
export type onSetToolbarButtons = () => any;
export type onSave = () => any;
export type onResetButtons = () => any;
export type onFontActionBefore = () => any;
export type onDrop = () => any;
export type onPaste = () => any;
export type imageUploadHandler = () => any;
export type onImageUploadBefore = () => any;
export type onImageLoad = () => any;
export type onImageAction = () => any;
export type onImageUploadError = () => any;
export type onImageDeleteBefore = () => any;
export type videoUploadHandler = () => any;
export type onVideoUploadBefore = () => any;
export type onVideoLoad = () => any;
export type onVideoAction = () => any;
export type onVideoUploadError = () => any;
export type onVideoDeleteBefore = () => any;
export type audioUploadHandler = () => any;
export type onAudioUploadBefore = () => any;
export type onAudioUploadError = () => any;
export type onAudioLoad = () => any;
export type onAudioAction = () => any;
export type onAudioDeleteBefore = () => any;
export type onFileUploadBefore = () => any;
export type onFileLoad = () => any;
export type onFileAction = () => any;
export type onFileUploadError = () => any;
export type onFileDeleteBefore = () => any;
export type onExportPDFBefore = () => any;
export type onFileManagerAction = () => any;
export type onEmbedInputBefore = () => any;
export type onEmbedDeleteBefore = () => any;
export type EventHandlers = {
	onload?: onload | null;
	onScroll?: onScroll | null;
	onMouseDown?: onMouseDown | null;
	onClick?: onClick | null;
	onBeforeInput?: onBeforeInput | null;
	onInput?: onInput | null;
	onMouseLeave?: onMouseLeave | null;
	onMouseUp?: onMouseUp | null;
	onKeyDown?: onKeyDown | null;
	onKeyUp?: onKeyUp | null;
	onFocus?: onFocus | null;
	onNativeFocus?: onNativeFocus | null;
	onBlur?: onBlur | null;
	onNativeBlur?: onNativeBlur | null;
	onCopy?: onCopy | null;
	onCut?: onCut | null;
	onChange?: onChange | null;
	onShowToolbar?: onShowToolbar | null;
	onShowController?: onShowController | null;
	onBeforeShowController?: onBeforeShowController | null;
	onToggleCodeView?: onToggleCodeView | null;
	onToggleFullScreen?: onToggleFullScreen | null;
	onResizeEditor?: onResizeEditor | null;
	onSetToolbarButtons?: onSetToolbarButtons | null;
	onSave?: onSave | null;
	onResetButtons?: onResetButtons | null;
	onFontActionBefore?: onFontActionBefore | null;
	onDrop?: onDrop | null;
	onPaste?: onPaste | null;
	imageUploadHandler?: imageUploadHandler | null;
	onImageUploadBefore?: onImageUploadBefore | null;
	onImageLoad?: onImageLoad | null;
	onImageAction?: onImageAction | null;
	onImageUploadError?: onImageUploadError | null;
	onImageDeleteBefore?: onImageDeleteBefore | null;
	videoUploadHandler?: videoUploadHandler | null;
	onVideoUploadBefore?: onVideoUploadBefore | null;
	onVideoLoad?: onVideoLoad | null;
	onVideoAction?: onVideoAction | null;
	onVideoUploadError?: onVideoUploadError | null;
	onVideoDeleteBefore?: onVideoDeleteBefore | null;
	audioUploadHandler?: audioUploadHandler | null;
	onAudioUploadBefore?: onAudioUploadBefore | null;
	onAudioUploadError?: onAudioUploadError | null;
	onAudioLoad?: onAudioLoad | null;
	onAudioAction?: onAudioAction | null;
	onAudioDeleteBefore?: onAudioDeleteBefore | null;
	onFileUploadBefore?: onFileUploadBefore | null;
	onFileLoad?: onFileLoad | null;
	onFileAction?: onFileAction | null;
	onFileUploadError?: onFileUploadError | null;
	onFileDeleteBefore?: onFileDeleteBefore | null;
	onExportPDFBefore?: onExportPDFBefore | null;
	onFileManagerAction?: onFileManagerAction | null;
	onEmbedInputBefore?: onEmbedInputBefore | null;
	onEmbedDeleteBefore?: onEmbedDeleteBefore | null;
};
