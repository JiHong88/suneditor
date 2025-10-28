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
export type onload = (params: { editor: SunEditor.Core }) => any;
export type onScroll = (params: BaseEvent) => any;
export type onMouseDown = (params: BaseEvent) => any;
export type onClick = (params: BaseEvent) => any;
export type onBeforeInput = (params: BaseEvent) => any;
export type onInput = (params: BaseEvent) => any;
export type onMouseLeave = (params: BaseEvent) => any;
export type onKeyDown = (params: BaseEvent) => any;
export type onKeyUp = (params: BaseEvent) => any;
export type onFocus = (params: BaseEvent) => any;
export type onNativeFocus = (params: BaseEvent) => any;
export type onBlur = (params: BaseEvent) => any;
export type onNativeBlur = (params: BaseEvent) => any;
export type onCopy = (params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; event: Event; clipboardData: Event }) => any;
export type onCut = (params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; event: Event; clipboardData: Event }) => any;
export type onChange = (params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; event: Event; data: Event }) => any;
export type onShowToolbar = (toolbar: HTMLElement, mode: string) => any;
export type onShowController = (params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; caller: string; info: SunEditor.Module.Controller.Info }) => any;
export type onBeforeShowController = (params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; caller: string; info: SunEditor.Module.Controller.Info }) => any;
export type onToggleCodeView = (params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; is: boolean }) => any;
export type onToggleFullScreen = (params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; is: boolean }) => any;
export type onResizeEditor = (params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; height: number; prevHeight: boolean; observerEntry: ResizeObserverEntry }) => any;
export type onSetToolbarButtons = (params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; buttonTray: HTMLElement }) => any;
export type onSave = (params: { editor: SunEditor.Core; frameContext: SunEditor.FrameContext; data: Event }) => Promise<boolean>;
export type onDrop = (params: ClipboardEvent) => Promise<boolean | string>;
export type onPaste = (params: ClipboardEvent) => Promise<boolean | string>;
export type imageUploadHandler = (params: { editor: SunEditor.Core; xmlHttp: XMLHttpRequest; info: ImageInfo }) => Promise<boolean>;
export type onImageUploadBefore = (params: { editor: SunEditor.Core; info: ImageInfo; handler: (newInfo?: ImageInfo | null) => void }) => Promise<boolean | undefined | ImageInfo>;
export type onImageLoad = (
	params: {
		editor: SunEditor.Core;
	},
	infoList: Array<FileManagementInfo>,
) => any;
export type onImageAction = (params: { editor: SunEditor.Core; info: FileManagementInfo; element: HTMLElement | null; state: 'create' | 'update' | 'delete'; index: number; remainingFilesCount: number; pluginName: string }) => any;
export type onImageUploadError = (params: { editor: SunEditor.Core; error: string; limitSize?: number; uploadSize?: number; currentSize?: number; file?: File }) => Promise<string | undefined>;
export type onImageDeleteBefore = (params: { editor: SunEditor.Core; element: HTMLElement; container: HTMLElement; align: string; alt: string; url: string | null }) => Promise<boolean>;
export type videoUploadHandler = (params: { editor: SunEditor.Core; xmlHttp: XMLHttpRequest; info: VideoInfo }) => Promise<boolean>;
export type onVideoUploadBefore = (params: { editor: SunEditor.Core; info: VideoInfo; handler: (newInfo?: VideoInfo | null) => void }) => Promise<boolean | undefined | VideoInfo>;
export type onVideoLoad = (
	params: {
		editor: SunEditor.Core;
	},
	infoList: Array<FileManagementInfo>,
) => any;
export type onVideoAction = (params: { editor: SunEditor.Core; info: FileManagementInfo; element: HTMLElement | null; state: 'create' | 'update' | 'delete'; index: number; remainingFilesCount: number; pluginName: string }) => any;
export type onVideoUploadError = (params: { editor: SunEditor.Core; error: string; limitSize?: number; uploadSize?: number; currentSize?: number; file?: File }) => Promise<string | undefined>;
export type onVideoDeleteBefore = (params: { editor: SunEditor.Core; element: HTMLElement; container: HTMLElement; align: string; url: string }) => Promise<boolean>;
export type audioUploadHandler = (params: { editor: SunEditor.Core; xmlHttp: XMLHttpRequest; info: AudioInfo }) => Promise<boolean>;
export type onAudioUploadBefore = (params: { editor: SunEditor.Core; info: AudioInfo; handler: (newInfo?: AudioInfo | null) => void }) => Promise<boolean | undefined | AudioInfo>;
export type onAudioUploadError = (params: { editor: SunEditor.Core; error: string; limitSize?: number; uploadSize?: number; currentSize?: number; file?: File }) => Promise<string | undefined>;
export type onAudioLoad = (
	params: {
		editor: SunEditor.Core;
	},
	infoList: Array<FileManagementInfo>,
) => any;
export type onAudioAction = (params: { editor: SunEditor.Core; info: FileManagementInfo; element: HTMLElement | null; state: 'create' | 'update' | 'delete'; index: number; remainingFilesCount: number; pluginName: string }) => any;
export type onAudioDeleteBefore = (params: { editor: SunEditor.Core; element: HTMLElement; container: HTMLElement; url: string }) => Promise<boolean>;
export type onFileUploadBefore = (params: { editor: SunEditor.Core; info: FileInfo; handler: (newInfo?: FileInfo | null) => void }) => Promise<boolean | undefined | FileInfo>;
export type onFileLoad = (
	params: {
		editor: SunEditor.Core;
	},
	infoList: Array<FileManagementInfo>,
) => any;
export type onFileAction = (params: { editor: SunEditor.Core; info: FileManagementInfo; element: HTMLElement | null; state: 'create' | 'update' | 'delete'; index: number; remainingFilesCount: number; pluginName: string }) => any;
export type onFileUploadError = (params: { editor: SunEditor.Core; error: string; limitSize?: number; uploadSize?: number; currentSize?: number; file?: File }) => Promise<string | undefined>;
export type onFileDeleteBefore = (params: { editor: SunEditor.Core; element: HTMLElement; container: HTMLElement; url: string }) => Promise<boolean>;
export type onExportPDFBefore = (params: { editor: SunEditor.Core; target: HTMLElement }) => Promise<boolean>;
export type onFileManagerAction = (params: { editor: SunEditor.Core; info: FileManagementInfo; element: HTMLElement | null; state: 'create' | 'update' | 'delete'; index: number; remainingFilesCount: number; pluginName: string }) => any;
export type onEmbedInputBefore = (params: { editor: SunEditor.Core; info: EmbedInfo; handler: (newInfo?: EmbedInfo | null) => void }) => any;
export type onEmbedDeleteBefore = (params: { editor: SunEditor.Core; element: HTMLElement; container: HTMLElement; align: string; url: string }) => Promise<boolean>;
export type EventHandlers = {
	onload?: onload | null;
	onScroll?: onScroll | null;
	onMouseDown?: onMouseDown | null;
	onClick?: onClick | null;
	onBeforeInput?: onBeforeInput | null;
	onInput?: onInput | null;
	onMouseLeave?: onMouseLeave | null;
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
