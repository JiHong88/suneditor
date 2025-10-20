import type {} from './typedef';
declare namespace _default {
	let onload: any;
	let onScroll: any;
	let onMouseDown: any;
	let onClick: any;
	let onBeforeInput: any;
	let onInput: any;
	let onMouseLeave: any;
	let onKeyDown: any;
	let onKeyUp: any;
	let onFocus: any;
	let onNativeFocus: any;
	let onBlur: any;
	let onNativeBlur: any;
	let onCopy: any;
	let onCut: any;
	let onChange: any;
	let onShowToolbar: any;
	let onShowController: any;
	let onBeforeShowController: any;
	let onToggleCodeView: any;
	let onToggleFullScreen: any;
	let onResizeEditor: any;
	let onSetToolbarButtons: any;
	let onSave: any;
	let onDrop: any;
	let onPaste: any;
	let imageUploadHandler: any;
	let onImageUploadBefore: any;
	let onImageLoad: any;
	let onImageAction: any;
	let onImageUploadError: any;
	let onImageDeleteBefore: any;
	let videoUploadHandler: any;
	let onVideoUploadBefore: any;
	let onVideoLoad: any;
	let onVideoAction: any;
	let onVideoUploadError: any;
	let onVideoDeleteBefore: any;
	let audioUploadHandler: any;
	let onAudioUploadBefore: any;
	let onAudioUploadError: any;
	let onAudioLoad: any;
	let onAudioAction: any;
	let onAudioDeleteBefore: any;
	let onFileUploadBefore: any;
	let onFileLoad: any;
	let onFileAction: any;
	let onFileUploadError: any;
	let onFileDeleteBefore: any;
	let onExportPDFBefore: any;
	let onFileManagerAction: any;
	let onEmbedInputBefore: any;
	let onEmbedDeleteBefore: any;
}
export default _default;
export type ControllerInstance = import('./modules/Controller').default;
export type BaseEvent = {
	/**
	 * - The root editor instance
	 */
	editor: __se__EditorCore;
	/**
	 * - frame context
	 */
	frameContext: __se__FrameContext;
	/**
	 * - event object
	 */
	event: Event;
};
export type ClipboardEvent = {
	/**
	 * - The root editor instance
	 */
	editor: __se__EditorCore;
	/**
	 * - frame context
	 */
	frameContext: __se__FrameContext;
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
export type ControllerInfo_events = import('./modules/Controller').ControllerInfo;
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
