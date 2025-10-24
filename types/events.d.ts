import type {} from './typedef';
declare namespace _default {
	let onload: ((params: { editor: SunEditor.Core }) => void) | null;
	let onScroll: ((params: BaseEvent) => void) | null;
	let onMouseDown: ((params: BaseEvent) => void) | null;
	let onClick: ((params: BaseEvent) => void) | null;
	let onBeforeInput: ((params: BaseEvent) => void) | null;
	let onInput: ((params: BaseEvent) => void) | null;
	let onMouseLeave: ((params: BaseEvent) => void) | null;
	let onKeyDown: ((params: BaseEvent) => void) | null;
	let onKeyUp: ((params: BaseEvent) => void) | null;
	let onFocus: ((params: BaseEvent) => void) | null;
	let onNativeFocus: ((params: BaseEvent) => void) | null;
	let onBlur: ((params: BaseEvent) => void) | null;
	let onNativeBlur: ((params: BaseEvent) => void) | null;
	let onCopy: ((params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; event: Event; clipboardData: Event }) => void) | null;
	let onCut: ((params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; event: Event; clipboardData: Event }) => void) | null;
	let onChange: ((params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; event: Event; data: Event }) => void) | null;
	let onShowToolbar: ((toolbar: HTMLElement, mode: string) => void) | null;
	let onShowController: ((params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; caller: string; info: ControllerInfo_events }) => void) | null;
	let onBeforeShowController: ((params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; caller: string; info: ControllerInfo_events }) => void) | null;
	let onToggleCodeView: ((params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; is: boolean }) => void) | null;
	let onToggleFullScreen: ((params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; is: boolean }) => void) | null;
	let onResizeEditor: ((params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; height: number; prevHeight: boolean; observerEntry: ResizeObserverEntry }) => void) | null;
	let onSetToolbarButtons: ((params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; buttonTray: HTMLElement }) => void) | null;
	let onSave: ((params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; data: Event }) => Promise<boolean>) | null;
	let onDrop: ((params: ClipboardEvent) => Promise<boolean | string>) | null;
	let onPaste: ((params: ClipboardEvent) => Promise<boolean | string>) | null;
	let imageUploadHandler: ((params: { editor: SunEditor.Core; xmlHttp: XMLHttpRequest; info: ImageInfo }) => Promise<boolean>) | null;
	let onImageUploadBefore: ((params: { editor: SunEditor.Core; info: ImageInfo; handler: (newInfo?: ImageInfo | null) => void }) => Promise<boolean | undefined | ImageInfo>) | null;
	let onImageLoad:
		| ((
				params: {
					editor: SunEditor.Core;
				},
				infoList: Array<FileManagementInfo>
		  ) => void)
		| null;
	let onImageAction: ((params: { editor: SunEditor.Core; info: FileManagementInfo; element: HTMLElement | null; state: 'create' | 'update' | 'delete'; index: number; remainingFilesCount: number; pluginName: string }) => void) | null;
	let onImageUploadError: ((params: { editor: SunEditor.Core; error: string; limitSize?: number; uploadSize?: number; currentSize?: number; file?: File }) => Promise<string | undefined>) | null;
	let onImageDeleteBefore: ((params: { editor: SunEditor.Core; element: HTMLElement; container: HTMLElement; align: string; alt: string; url: string | null }) => Promise<boolean>) | null;
	let videoUploadHandler: ((params: { editor: SunEditor.Core; xmlHttp: XMLHttpRequest; info: VideoInfo }) => Promise<boolean>) | null;
	let onVideoUploadBefore: ((params: { editor: SunEditor.Core; info: VideoInfo; handler: (newInfo?: VideoInfo | null) => void }) => Promise<boolean | undefined | VideoInfo>) | null;
	let onVideoLoad:
		| ((
				params: {
					editor: SunEditor.Core;
				},
				infoList: Array<FileManagementInfo>
		  ) => void)
		| null;
	let onVideoAction: ((params: { editor: SunEditor.Core; info: FileManagementInfo; element: HTMLElement | null; state: 'create' | 'update' | 'delete'; index: number; remainingFilesCount: number; pluginName: string }) => void) | null;
	let onVideoUploadError: ((params: { editor: SunEditor.Core; error: string; limitSize?: number; uploadSize?: number; currentSize?: number; file?: File }) => Promise<string | undefined>) | null;
	let onVideoDeleteBefore: ((params: { editor: SunEditor.Core; element: HTMLElement; container: HTMLElement; align: string; url: string }) => Promise<boolean>) | null;
	let audioUploadHandler: ((params: { editor: SunEditor.Core; xmlHttp: XMLHttpRequest; info: AudioInfo }) => Promise<boolean>) | null;
	let onAudioUploadBefore: ((params: { editor: SunEditor.Core; info: AudioInfo; handler: (newInfo?: AudioInfo | null) => void }) => Promise<boolean | undefined | AudioInfo>) | null;
	let onAudioUploadError: ((params: { editor: SunEditor.Core; error: string; limitSize?: number; uploadSize?: number; currentSize?: number; file?: File }) => Promise<string | undefined>) | null;
	let onAudioLoad:
		| ((
				params: {
					editor: SunEditor.Core;
				},
				infoList: Array<FileManagementInfo>
		  ) => void)
		| null;
	let onAudioAction: ((params: { editor: SunEditor.Core; info: FileManagementInfo; element: HTMLElement | null; state: 'create' | 'update' | 'delete'; index: number; remainingFilesCount: number; pluginName: string }) => void) | null;
	let onAudioDeleteBefore: ((params: { editor: SunEditor.Core; element: HTMLElement; container: HTMLElement; url: string }) => Promise<boolean>) | null;
	let onFileUploadBefore: ((params: { editor: SunEditor.Core; info: FileInfo; handler: (newInfo?: FileInfo | null) => void }) => Promise<boolean | undefined | FileInfo>) | null;
	let onFileLoad:
		| ((
				params: {
					editor: SunEditor.Core;
				},
				infoList: Array<FileManagementInfo>
		  ) => void)
		| null;
	let onFileAction: ((params: { editor: SunEditor.Core; info: FileManagementInfo; element: HTMLElement | null; state: 'create' | 'update' | 'delete'; index: number; remainingFilesCount: number; pluginName: string }) => void) | null;
	let onFileUploadError: ((params: { editor: SunEditor.Core; error: string; limitSize?: number; uploadSize?: number; currentSize?: number; file?: File }) => Promise<string | undefined>) | null;
	let onFileDeleteBefore: ((params: { editor: SunEditor.Core; element: HTMLElement; container: HTMLElement; url: string }) => Promise<boolean>) | null;
	let onExportPDFBefore: ((params: { editor: SunEditor.Core; target: HTMLElement }) => Promise<boolean>) | null;
	let onFileManagerAction:
		| ((params: { editor: SunEditor.Core; info: FileManagementInfo; element: HTMLElement | null; state: 'create' | 'update' | 'delete'; index: number; remainingFilesCount: number; pluginName: string }) => void)
		| null;
	let onEmbedInputBefore: ((params: { editor: SunEditor.Core; info: EmbedInfo; handler: (newInfo?: EmbedInfo | null) => void }) => void) | null;
	let onEmbedDeleteBefore: ((params: { editor: SunEditor.Core; element: HTMLElement; container: HTMLElement; align: string; url: string }) => Promise<boolean>) | null;
}
export default _default;
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
