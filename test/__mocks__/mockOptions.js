/**
 * @fileoverview Comprehensive mock options for SunEditor type testing
 * All options in a single object for type testing purposes.
 *
 * @type {import('../../src/core/config/options.js').EditorInitOptions}
 */
export const mockOptions = {
	// ============================================================================
	// === FRAME OPTIONS ===
	// ============================================================================
	value: '<p>Initial content</p>',
	placeholder: 'Enter your text here...',
	editableFrameAttributes: { spellcheck: 'true', autocorrect: 'off' },
	width: '100%',
	minWidth: '300px',
	maxWidth: '1200px',
	height: '400px',
	minHeight: '200px',
	maxHeight: '800px',
	editorStyle: 'font-family: Arial, sans-serif;',

	// Iframe Mode
	iframe: false,
	iframe_fullPage: false,
	iframe_attributes: {},
	iframe_cssFileName: 'suneditor',

	// Statusbar & Character Counter
	statusbar: true,
	statusbar_showPathLabel: true,
	statusbar_resizeEnable: true,
	charCounter: true,
	charCounter_max: 50000,
	charCounter_label: 'Characters',
	charCounter_type: 'char',
	__statusbarEvent: {},

	// ============================================================================
	// === BASE OPTIONS ===
	// ============================================================================
	// Plugins & Toolbar
	plugins: [],
	excludedPlugins: [],
	buttonList: [
		['undo', 'redo'],
		'|',
		['font', 'fontSize', 'blockStyle'],
		'|',
		['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
		'|',
		['fontColor', 'backgroundColor'],
		'|',
		['removeFormat'],
		'|',
		['outdent', 'indent'],
		'|',
		['align', 'lineHeight', 'list', 'paragraphStyle'],
		'|',
		['table', 'link', 'image', 'video', 'audio'],
		'|',
		['math', 'drawing', 'embed'],
		'|',
		['fullScreen', 'showBlocks', 'codeView'],
		'|',
		['preview', 'print', 'save'],
	],

	// Modes & Themes
	v2Migration: false,
	mode: 'classic',
	type: '',
	theme: '',
	lang: undefined,
	icons: undefined,
	textDirection: 'ltr',
	reverseButtons: ['indent-outdent'],

	// Strict Mode
	strictMode: true,
	scopeSelectionTags: ['td', 'table', 'li', 'ol', 'ul', 'pre', 'figcaption', 'blockquote', 'dl', 'dt', 'dd'],

	// Content Filtering & Formatting
	elementWhitelist: '',
	elementBlacklist: '',
	allowedEmptyTags: '.se-component, pre, blockquote, hr, li, table, img, iframe, video, audio, canvas, details',
	allowedClassName: '',
	attributeWhitelist: { a: 'href|target|rel', img: 'src|alt|title', '*': 'id|class|style' },
	attributeBlacklist: { '*': 'onclick|onerror' },
	textStyleTags: 'strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label|code|summary',
	convertTextTags: { bold: 'strong', underline: 'u', italic: 'em', strike: 'del', subscript: 'sub', superscript: 'sup' },
	allUsedStyles: '',
	tagStyles: {},
	spanStyles: 'font-family|font-size|color|background-color|width|height',
	lineStyles: 'text-align|margin|margin-left|margin-right|line-height',
	fontSizeUnits: ['px', 'pt', 'em', 'rem'],
	retainStyleMode: 'repeat',
	defaultLine: 'p',
	defaultLineBreakFormat: 'line',
	lineAttrReset: '',
	formatLine: '',
	formatBrLine: '',
	formatClosureBrLine: '',
	formatBlock: '',
	formatClosureBlock: '',

	// UI & Interaction
	closeModalOutsideClick: true,
	syncTabIndent: true,
	tabDisable: false,
	toolbar_width: 'auto',
	toolbar_container: null,
	toolbar_sticky: 0,
	_toolbar_sticky: 0,
	_toolbar_sticky_offset: 0,
	toolbar_hide: false,
	subToolbar: {
		buttonList: [['bold', 'italic', 'underline', 'strike']],
		mode: 'balloon',
		width: 'auto',
	},
	statusbar_container: null,
	shortcutsHint: true,
	shortcutsDisable: false,
	shortcuts: {},

	// Advanced Features
	copyFormatKeepOn: false,
	autoLinkify: true,
	autoStyleify: ['bold', 'underline', 'italic', 'strike'],
	historyStackDelayTime: 400,
	printClass: '',
	fullScreenOffset: 0,
	previewTemplate: null,
	printTemplate: null,
	componentInsertBehavior: 'auto',
	defaultUrlProtocol: 'https://',
	toastMessageTime: { copy: 1500 },
	freeCodeViewMode: false,
	externalLibs: {},
	allowedExtraTags: {},

	// ============================================================================
	// === PRIVATE OPTIONS (Advanced Internal) ===
	// ============================================================================
	__textStyleTags: 'strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label|code|summary',
	__tagStyles: {
		'table|th|td': 'width|height|border|border-top|border-right|border-bottom|border-left|background-color',
		'table|td': 'text-align',
		tr: 'background-color',
		col: 'width',
		caption: 'text-align',
		'ol|ul': 'list-style-type',
		figure: 'width|max-width|margin-left|margin-right',
		figcaption: 'text-align',
		'img|video|iframe': 'width|max-width|height',
		hr: 'border-style|height|border-color|background-color',
	},
	__defaultElementWhitelist: '',
	__defaultAttributeWhitelist: 'contenteditable|data-[a-z0-9-]+',
	__defaultFormatLine: 'p|div|h[1-6]|li|dt|dd',
	__defaultFormatBrLine: 'pre',
	__defaultFormatClosureBrLine: '',
	__defaultFormatBlock: 'blockquote|ol|ul|dl|figcaption|details',
	__defaultFormatClosureBlock: 'table|thead|tbody|tfoot|tr|th|td',
	__lineFormatFilter: true,
	__listCommonStyle: ['fontSize', 'color', 'fontFamily', 'fontWeight', 'fontStyle'],
	__pluginRetainFilter: true,

	// ============================================================================
	// === PLUGIN OPTIONS ===
	// ============================================================================

	// Align Plugin
	align: {
		items: ['left', 'center', 'right', 'justify'],
	},

	// Audio Plugin
	audio: {
		defaultWidth: '300px',
		defaultHeight: '150px',
		createFileInput: true,
		createUrlInput: true,
		uploadUrl: 'https://example.com/upload/audio',
		uploadHeaders: { Authorization: 'Bearer token' },
		uploadSizeLimit: 104857600,
		uploadSingleSizeLimit: 52428800,
		allowMultiple: true,
		acceptedFormats: 'audio/*',
		audioTagAttributes: { preload: 'metadata' },
		insertBehavior: 'auto',
	},

	// Audio Gallery Plugin
	audioGallery: {
		data: [
			{ src: 'audio1.mp3', name: 'Audio 1', tag: 'audio' },
			{ src: 'audio2.mp3', name: 'Audio 2', tag: 'audio' },
		],
		url: 'https://example.com/api/audio-gallery',
		headers: { Authorization: 'Bearer token' },
		thumbnail: '/default-audio.png',
	},

	// Background Color Plugin
	backgroundColor: {
		items: ['#ff0000', '#00ff00', '#0000ff', { value: '#ffff00', name: 'Yellow' }, { value: '#ff00ff', name: 'Magenta' }],
		splitNum: 5,
		disableHEXInput: false,
	},

	// Block Style Plugin
	blockStyle: {
		items: ['p', 'div', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
	},

	// Drawing Plugin
	drawing: {
		outputFormat: 'dataurl',
		useFormatType: true,
		defaultFormatType: 'block',
		keepFormatType: false,
		lineWidth: 5,
		lineReconnect: false,
		lineCap: 'round',
		lineColor: '#000000',
		canResize: true,
		maintainRatio: true,
		formSize: {
			width: '750px',
			height: '50vh',
			maxWidth: '90vw',
			maxHeight: '80vh',
			minWidth: '150px',
			minHeight: '100px',
		},
	},

	// Embed Plugin
	embed: {
		canResize: true,
		showHeightInput: true,
		defaultWidth: '560px',
		defaultHeight: '315px',
		percentageOnlySize: false,
		uploadUrl: 'https://example.com/upload/embed',
		uploadHeaders: { Authorization: 'Bearer token' },
		uploadSizeLimit: 52428800,
		uploadSingleSizeLimit: 10485760,
		iframeTagAttributes: { sandbox: 'allow-scripts allow-same-origin' },
		query_youtube: 'rel=0&modestbranding=1',
		query_vimeo: 'byline=0&portrait=0',
		urlPatterns: [],
		embedQuery: {},
		controls: [['resize_auto,75,50', 'align', 'edit', 'revert', 'copy', 'remove']],
		insertBehavior: 'auto',
	},

	// Export PDF Plugin
	exportPDF: {
		apiUrl: 'https://example.com/api/export-pdf',
		fileName: 'document',
	},

	// File Browser Plugin
	fileBrowser: {
		data: [
			{ src: '/file1.pdf', name: 'File 1', tag: 'file' },
			{ src: '/file2.docx', name: 'File 2', tag: 'file' },
		],
		url: 'https://example.com/api/file-browser',
		headers: { Authorization: 'Bearer token' },
		thumbnail: '/default-file.png',
		props: ['document', 'spreadsheet', 'presentation'],
	},

	// File Gallery Plugin
	fileGallery: {
		data: [
			{ src: '/doc1.pdf', name: 'Document 1' },
			{ src: '/doc2.pdf', name: 'Document 2' },
		],
		url: 'https://example.com/api/file-gallery',
		headers: { Authorization: 'Bearer token' },
		thumbnail: '/default-file-icon.png',
	},

	// File Upload Plugin
	fileUpload: {
		uploadUrl: 'https://example.com/upload/file',
		uploadHeaders: { Authorization: 'Bearer token' },
		uploadSizeLimit: 104857600,
		uploadSingleSizeLimit: 52428800,
		allowMultiple: true,
		acceptedFormats: '*/*',
		as: 'box',
		controls: ['edit', 'remove'],
		insertBehavior: 'auto',
	},

	// Font Plugin
	font: {
		items: ['Arial', 'Comic Sans MS', 'Courier New', 'Georgia', 'Tahoma', 'Times New Roman', 'Verdana'],
	},

	// Font Color Plugin
	fontColor: {
		items: ['#ff0000', '#00ff00', '#0000ff', { value: '#000000', name: 'Black' }, { value: '#ffffff', name: 'White' }],
		splitNum: 5,
		disableHEXInput: false,
	},

	// Font Size Plugin
	fontSize: {
		sizeUnit: 'px',
		showDefaultSizeLabel: true,
		showIncDecControls: true,
		disableInput: false,
		unitMap: {
			px: { default: 16, inc: 1, min: 8, max: 72, list: [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72] },
			pt: { default: 12, inc: 1, min: 6, max: 54, list: [6, 7, 8, 9, 10, 11, 12, 14, 18, 24, 30, 36, 48, 54] },
			em: { default: 1, inc: 0.1, min: 0.5, max: 5, list: [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3] },
			rem: { default: 1, inc: 0.1, min: 0.5, max: 5, list: [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3] },
		},
	},

	// HR Plugin
	hr: {
		items: [
			{ name: 'Solid', class: '__se__solid' },
			{ name: 'Dashed', class: '__se__dashed' },
			{ name: 'Dotted', class: '__se__dotted' },
		],
	},

	// Image Plugin
	image: {
		canResize: true,
		showHeightInput: true,
		defaultWidth: 'auto',
		defaultHeight: 'auto',
		percentageOnlySize: false,
		createFileInput: true,
		createUrlInput: true,
		uploadUrl: 'https://example.com/upload/image',
		uploadHeaders: { Authorization: 'Bearer token' },
		uploadSizeLimit: 52428800,
		uploadSingleSizeLimit: 10485760,
		allowMultiple: true,
		acceptedFormats: 'image/*',
		useFormatType: true,
		defaultFormatType: 'block',
		keepFormatType: false,
		linkEnableFileUpload: true,
		controls: [['resize_auto,100,75,50', 'align', 'caption', 'link', 'edit', 'revert', 'copy', 'remove']],
		insertBehavior: 'auto',
	},

	// Image Gallery Plugin
	imageGallery: {
		data: [
			{ src: '/image1.jpg', name: 'Image 1', tag: 'img' },
			{ src: '/image2.png', name: 'Image 2', tag: 'img' },
		],
		url: 'https://example.com/api/image-gallery',
		headers: { Authorization: 'Bearer token' },
	},

	// Layout Plugin
	layout: {
		items: [
			{ name: 'Two Columns', html: '<div class="layout-2col"><div class="col"></div><div class="col"></div></div>' },
			{ name: 'Three Columns', html: '<div class="layout-3col"><div class="col"></div><div class="col"></div><div class="col"></div></div>' },
		],
	},

	// Line Height Plugin
	lineHeight: {
		items: [
			{ text: '1', value: '1em' },
			{ text: '1.2', value: '1.2em' },
			{ text: '1.5', value: '1.5em' },
			{ text: '1.7', value: '1.7em' },
			{ text: '2', value: '2em' },
			{ text: '2.5', value: '2.5em' },
			{ text: '3', value: '3em' },
		],
	},

	// Link Plugin
	link: {
		uploadUrl: 'https://example.com/upload/link',
		uploadHeaders: { Authorization: 'Bearer token' },
		uploadSizeLimit: 10485760,
		uploadSingleSizeLimit: 5242880,
		acceptedFormats: '*/*',
		title: true,
		textToDisplay: true,
		openNewWindow: false,
		noAutoPrefix: false,
		relList: ['nofollow', 'noreferrer', 'noopener'],
		defaultRel: { default: '', check_new_window: 'noopener', check_bookmark: '' },
		enableFileUpload: true,
	},

	// Math Plugin
	math: {
		canResize: true,
		autoHeight: false,
		fontSizeList: [
			{ text: 'Small', value: '0.8em' },
			{ text: 'Normal', value: '1em' },
			{ text: 'Large', value: '1.5em' },
			{ text: 'Extra Large', value: '2em' },
		],
		onPaste: null,
		formSize: {
			width: '460px',
			height: '14em',
			maxWidth: '90vw',
			maxHeight: '80vh',
			minWidth: '400px',
			minHeight: '40px',
		},
	},

	// Mention Plugin
	mention: {
		triggerText: '@',
		limitSize: 10,
		searchStartLength: 1,
		delayTime: 200,
		data: [
			{ key: 'john', name: 'John Doe', url: '/users/john' },
			{ key: 'jane', name: 'Jane Smith', url: '/users/jane' },
		],
		apiUrl: 'https://example.com/api/users?q={key}&limit={limitSize}',
		apiHeaders: { Authorization: 'Bearer token' },
		useCachingData: true,
		useCachingFieldData: true,
	},

	// Paragraph Style Plugin
	paragraphStyle: {
		items: ['spaced', 'neon', { name: 'Custom Style', class: '__se__custom-para', _class: 'custom-para' }],
	},

	// Table Plugin
	table: {
		scrollType: 'xy',
		captionPosition: 'bottom',
		cellControllerPosition: 'cell',
		colorList: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
	},

	// Template Plugin
	template: {
		items: [
			{ name: 'Template 1', html: '<p>This is template 1 content.</p>' },
			{ name: 'Template 2', html: '<h2>Template 2</h2><p>This is template 2 content.</p>' },
		],
	},

	// Text Style Plugin
	textStyle: {
		items: ['code', 'shadow', { name: 'Custom Highlight', class: '__se__highlight', tag: 'mark' }],
	},

	// Video Plugin
	video: {
		canResize: true,
		showHeightInput: true,
		defaultWidth: '560px',
		defaultHeight: '315px',
		percentageOnlySize: false,
		createFileInput: true,
		createUrlInput: true,
		uploadUrl: 'https://example.com/upload/video',
		uploadHeaders: { Authorization: 'Bearer token' },
		uploadSizeLimit: 524288000,
		uploadSingleSizeLimit: 104857600,
		allowMultiple: false,
		acceptedFormats: 'video/*',
		defaultRatio: 0.5625,
		showRatioOption: true,
		ratioOptions: [
			{ name: '16:9', value: 0.5625 },
			{ name: '4:3', value: 0.75 },
			{ name: '21:9', value: 0.4285 },
			{ name: '9:16', value: 1.78 },
		],
		videoTagAttributes: { playsinline: 'true' },
		iframeTagAttributes: { allowfullscreen: 'true' },
		query_youtube: 'rel=0&modestbranding=1',
		query_vimeo: 'byline=0&portrait=0',
		embedQuery: {},
		urlPatterns: [],
		extensions: ['.mp4', '.webm', '.ogg'],
		controls: [['resize_auto,75,50', 'align', 'edit', 'revert', 'copy', 'remove']],
		insertBehavior: 'auto',
	},

	// Video Gallery Plugin
	videoGallery: {
		data: [
			{ src: '/video1.mp4', name: 'Video 1', tag: 'video' },
			{ src: 'https://youtube.com/watch?v=xxx', name: 'YouTube Video', tag: 'iframe' },
		],
		url: 'https://example.com/api/video-gallery',
		headers: { Authorization: 'Bearer token' },
		thumbnail: '/default-video.png',
	},

	// ============================================================================
	// === EVENTS ===
	// ============================================================================
	events: {
		// Basic Events
		onload: ({ editor }) => {
			console.log('Editor loaded');
		},
		onScroll: ({ editor, frameContext, event }) => {},
		onMouseDown: ({ editor, frameContext, event }) => {},
		onClick: ({ editor, frameContext, event }) => {},
		onBeforeInput: ({ editor, frameContext, event, data }) => {},
		onInput: ({ editor, frameContext, event, data }) => {},
		onMouseLeave: ({ editor, frameContext, event }) => {},
		onMouseUp: ({ editor, frameContext, event }) => {},
		onKeyDown: ({ editor, frameContext, event }) => {},
		onKeyUp: ({ editor, frameContext, event }) => {},
		onFocus: ({ editor, frameContext, event }) => {},
		onNativeFocus: ({ editor, frameContext, event }) => {},
		onBlur: ({ editor, frameContext, event }) => {},
		onNativeBlur: ({ editor, frameContext, event }) => {},
		onCopy: ({ editor, frameContext, event, clipboardData }) => {},
		onCut: ({ editor, frameContext, event, clipboardData }) => {},
		onChange: ({ editor, frameContext, data }) => {},
		onShowToolbar: ({ editor, toolbar, mode, frameContext }) => {},
		onShowController: ({ editor, frameContext, caller, info }) => {},
		onBeforeShowController: ({ editor, frameContext, caller, info }) => {},
		onToggleCodeView: ({ editor, frameContext, is }) => {},
		onToggleFullScreen: ({ editor, frameContext, is }) => {},
		onResizeEditor: ({ editor, frameContext, height, prevHeight, observerEntry }) => {},
		onSetToolbarButtons: ({ editor, frameContext, buttonTray }) => {},
		onSave: async ({ editor, frameContext, data }) => true,
		onResetButtons: ({ editor, rootKey }) => {},
		onFontActionBefore: async ({ editor, value }) => true,
		onDrop: async ({ editor, frameContext, event, data, maxCharCount, from }) => true,
		onPaste: async ({ editor, frameContext, event, data, maxCharCount, from }) => true,

		// Image Events
		imageUploadHandler: async ({ editor, xmlHttp, info }) => false,
		onImageUploadBefore: async ({ editor, info, handler }) => true,
		onImageLoad: ({ editor, infoList }) => {},
		onImageAction: ({ editor, info, element, state, index, remainingFilesCount, pluginName }) => {},
		onImageUploadError: async ({ editor, error, limitSize, uploadSize, currentSize, file }) => error,
		onImageDeleteBefore: async ({ editor, element, container, align, alt, url }) => true,

		// Video Events
		videoUploadHandler: async ({ editor, xmlHttp, info }) => false,
		onVideoUploadBefore: async ({ editor, info, handler }) => true,
		onVideoLoad: ({ editor, infoList }) => {},
		onVideoAction: ({ editor, info, element, state, index, remainingFilesCount, pluginName }) => {},
		onVideoUploadError: async ({ editor, error, limitSize, uploadSize, currentSize, file }) => error,
		onVideoDeleteBefore: async ({ editor, element, container, align, url }) => true,

		// Audio Events
		audioUploadHandler: async ({ editor, xmlHttp, info }) => false,
		onAudioUploadBefore: async ({ editor, info, handler }) => true,
		onAudioUploadError: async ({ editor, error, limitSize, uploadSize, currentSize, file }) => error,
		onAudioLoad: ({ editor, infoList }) => {},
		onAudioAction: ({ editor, info, element, state, index, remainingFilesCount, pluginName }) => {},
		onAudioDeleteBefore: async ({ editor, element, container, url }) => true,

		// File Events
		onFileUploadBefore: async ({ editor, info, handler }) => true,
		onFileLoad: ({ editor, infoList }) => {},
		onFileAction: ({ editor, info, element, state, index, remainingFilesCount, pluginName }) => {},
		onFileUploadError: async ({ editor, error, limitSize, uploadSize, currentSize, file }) => error,
		onFileDeleteBefore: async ({ editor, element, container, url }) => true,

		// Other Events
		onExportPDFBefore: async ({ editor, target }) => true,
		onFileManagerAction: ({ editor, info, element, state, index, remainingFilesCount, pluginName }) => {},
		onEmbedInputBefore: async (params) => true,
		onEmbedDeleteBefore: async ({ editor, element, container, align, url }) => true,
	},
};

export default mockOptions;
