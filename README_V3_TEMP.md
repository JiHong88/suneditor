SunEditor Version 3 - Temporary README

This is not a finished version and the option information below may be incorrect.

https://www.npmjs.com/package/suneditor?activeTab=versions

### create
```javascript
import suneditor from 'suneditor';
import langs, { ko } from 'suneditor/src/langs';
import plugins from 'suneditor/src/plugins';

// editor style
import 'suneditor/src/assets/suneditor.css';
// editable area style
import 'suneditor/src/assets/suneditor-contents.css';
// suneditor.css + suneditor-contents.css
import 'suneditor/dist/suneditor.min.css';

// single
suneditor.create(document.querySelector('#editor_1'), mainOptions)
// multi root
suneditor.create({
  editor1: {
    target: document.querySelector('#multi_editor_1'),
    options: {} // Undefined options default to the "Min option".
  },
  editor2: {
    target: document.querySelector('#multi_editor_2'),
    options: {}
  }
}, mainOptions)
```
[Main options](#user-content-main-options)

[Multi Root frame apecific options](#user-content-multi-root-frame-apecific-options)

[Plugin options](#user-content-plugin-options)

#### Buttons
```javascript
[
  "bold",
  "underline",
  "italic",
  "strike",
  "subscript",
  "superscript",
  "removeFormat",
  "copyFormat",
  "indent",
  "outdent",
  "fullScreen",
  "showBlocks",
  "codeView",
  "undo",
  "redo",
  "preview",
  "print",
  "dir",
  "dir_ltr",
  "dir_rtl",
  "save",
  "newDocument",
  "selectAll",
  "pageBreak",
  "pageUp",
  "pageDown",
  "pageNavigator",
//  [pluginName],
]
```

#### Main options
```javascript
const DEFAULT_BUTTON_LIST = [
	['undo', 'redo'],
	'|',
	['bold', 'underline', 'italic', 'strike', '|', 'subscript', 'superscript'],
	'|',
	['removeFormat'],
	'|',
	['outdent', 'indent'],
	'|',
	['fullScreen', 'showBlocks', 'codeView'],
	'|',
	['preview', 'print']
];

const DEFAULT_ELEMENT_WHITELIST =
	'p|pre|blockquote|h1|h2|h3|h4|h5|h6|ol|ul|li|hr|figure|figcaption|img|iframe|audio|video|source|table|thead|tbody|tr|th|td|caption|a|b|strong|var|i|em|u|ins|s|span|strike|del|sub|sup|code|svg|path|details|summary';
const DEFAULT_TEXT_STYLE_TAGS = 'strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label|code|summary';
const DEFAULT_ATTRIBUTE_WHITELIST = 'contenteditable|target|href|title|download|rel|src|alt|class|type|controls|colspan|rowspan';

const DEFAULT_FORMAT_LINE = 'P|H[1-6]|LI|TH|TD|DETAILS';
const DEFAULT_FORMAT_BR_LINE = 'PRE';
const DEFAULT_FORMAT_CLOSURE_BR_LINE = '';
const DEFAULT_FORMAT_BLOCK = 'BLOCKQUOTE|OL|UL|FIGCAPTION|TABLE|THEAD|TBODY|TR|CAPTION|DETAILS';
const DEFAULT_FORMAT_CLOSURE_BLOCK = 'TH|TD';


const DEFAULT_CLASS_NAME = '^__se__|^se-|^katex|^MathJax';
const DEFAULT_EXTRA_TAG_MAP = { script: false, style: false, meta: false, link: false, '[a-z]+:[a-z]+': false };

const DEFAULT_TAG_STYLES = {
	'table|th|td': 'border|border-[a-z]+|background-color|text-align|float|font-weight|text-decoration|font-style',
	'ol|ul': 'list-style-type'
};
const DEFAULT_CONTENT_STYLES =
	'background|background-clip|background-color|' +
	'border|border-bottom|border-collapse|border-color|border-image|border-left-width|border-radius|border-right-width|border-spacing|border-style|border-top|border-width|' +
	'box-shadow|box-sizing|' +
	'caption-side|color|content|' +
	'direction|display|' +
	'float|font|font-family|font-size|font-style|font-weight|' +
	'height|' +
	'left|letter-spacing|line-height|list-style-position|list-style-type|' +
	'margin|margin-block-end|margin-block-start|margin-bottom|margin-inline-end|margin-inline-start|margin-left|margin-right|margin-top|max-width|min-width|' +
	'outline|overflow|' +
	'position|padding|padding-bottom|padding-inline-start|padding-left|padding-right|padding-top|' +
	'page-break-before|page-break-after|page-break-inside|' +
	'rotate|rotateX|rotateY|' +
	'table-layout|text-align|text-decoration|text-shadow|text-transform|top|' +
	'text-indent|text-rendering|' +
	'vertical-align|visibility|' +
	'white-space|width|word-break|word-wrap';

// Whitelist and blacklist are a combination of options and defaults.
// You can override the defaults by defining them with "__" in front of the list.
{
	// [pluginName]: {} // plugin options
	buttonList: DEFAULT_BUTTON_LIST, // List of buttons to display in the toolbar
	toolbar_container: null, // Container for the toolbar (if any)
	mode: 'classic', // Editor mode: classic, inline, balloon, or balloon-always
	v2Migration: false, // Flag for version 2 migration
	strictMode: {
		// Strict mode settings
		tagFilter: true,
		formatFilter: true,
		classFilter: true,
		styleNodeFilter: true,
		attrFilter: true,
		styleFilter: true
	},
	__lineFormatFilter: true, // Line format filter
	__pluginRetainFilter: true, // Plugin retain filter
	type: '', // Document type: header, page (ex) 'document:header,page'
	theme: '', // Theme for the editor
	externalLibs: {}, // External libraries
	/** (ex)
	// math - katex
	katex: {
		src: Katex
	},
	// math - mathjax (Not supported if using the iframe option.)
	mathjax: {
		src: mathjax,
		TeX,
		CHTML,
		browserAdaptor,
		RegisterHTMLHandler
	},
	// exportPdf (Rather than using the library below, I recommend processing it on the server.)
	html2canvas: html2canvas,
	jsPDF: jsPDF
	// codeMirror6
	codeMirror: {
		EditorView: EditorView,
		extensions: [
			basicSetup,
			html({
				matchClosingTags: true,
				autoCloseTags: true
			}),
			javascript()
		],
		minimalSetup: minimalSetup
	},
	// codeMirror5
	codeMirror: {
		src: Codemirror5
	},
	*/
	keepStyleOnDelete: false, // Keep style on delete
	fontSizeUnits: ['px', 'pt', 'em', 'rem'], // Font size units
	allowedClassName: DEFAULT_CLASS_NAME, // Allowed class names
	closeModalOutsideClick: false, // Close modal on outside click
	copyFormatKeepOn: false, // Keep format on copy
	syncTab: true, // Synchronize tab
	autoLinkify: false, // Auto convert URLs to links on paste
	autoStyleify: ['bold', 'underline', 'italic', 'strike'], // Auto apply styles on paste
	scrollToOptions: { behavior: 'auto', block: 'nearest' }, // Scroll to options
	componentScrollToOptions: { behavior: 'smooth', block: 'center' }, // Component scroll to options
	retainStyleMode: 'repeat', // Retain style mode
	allowedExtraTags: DEFAULT_EXTRA_TAG_MAP, // Allowed extra tags
	events: {}, // Editor events
	__textStyleTags: DEFAULT_TEXT_STYLE_TAGS, // Text style tags
	textStyleTags: '', // Additional text style tags
	convertTextTags: { bold: 'strong', underline: 'u', italic: 'em', strike: 'del', subscript: 'sub', superscript: 'sup' }, // Convert text tags
	tagStyles: DEFAULT_TAG_STYLES, // Tag styles
	spanStyles: '', // Span styles
	lineStyles: '', // Line styles
	textDirection: 'ltr', // Text direction
	reverseButtons: ['indent-outdent'], // Reverse buttons
	historyStackDelayTime: 400, // History stack delay time
	lineAttrReset: ['id'], // Line attribute reset
	printClass: null, // Print class
	defaultLine: 'p', // Default line element
	elementWhitelist: '*', // Element whitelist
	elementBlacklist: '', // Element blacklist
	attributeWhitelist: null, // Attribute whitelist
	attributeBlacklist: null, // Attribute blacklist
	formatClosureBrLine: DEFAULT_FORMAT_CLOSURE_BR_LINE, // Format closure BR line
	formatBrLine: DEFAULT_FORMAT_BR_LINE, // Format BR line
	formatLine: DEFAULT_FORMAT_LINE, // Format line
	formatClosureBlock: DEFAULT_FORMAT_CLOSURE_BLOCK, // Format closure block
	formatBlock: DEFAULT_FORMAT_BLOCK, // Format block
	__defaultElementWhitelist: DEFAULT_ELEMENT_WHITELIST, // Default element whitelist
	__defaultAttributeWhitelist: DEFAULT_ATTRIBUTE_WHITELIST, // Default attribute whitelist
	toolbar_width: 'auto', // Toolbar width
	toolbar_sticky: 0, // Toolbar sticky position
	toolbar_hide: false, // Hide toolbar
	subToolbar: null, // Sub toolbar
	tabDisable: false, // Disable tab
	shortcutsHint: true, // Show shortcuts hint
	shortcutsDisable: false, // Disable shortcuts
	shortcuts: {
		// Shortcuts configuration
		selectAll: ['65', 'A'],
		bold: ['66', 'B'],
		strike: ['s83', 'S'],
		underline: ['85', 'U'],
		italic: ['73', 'I'],
		redo: ['89', 'Y', 's90', 'Z'],
		undo: ['90', 'Z'],
		indent: ['221', ']'],
		outdent: ['219', '['],
		sup: ['187', '='],
		sub: ['s187', '='],
		save: ['83', 'S'],
		link: ['75', 'K']
	},
	fullScreenOffset: 0, // Fullscreen offset
	previewTemplate: null, // Preview template
	printTemplate: null, // Print template
	componentAutoSelect: false, // Component auto select
	defaultUrlProtocol: null, // Default URL protocol
	codeMirror: null, // CodeMirror settings
	__listCommonStyle: ['fontSize', 'color', 'fontFamily', 'fontWeight', 'fontStyle'], // List of common styles
	icons: '_icons', // Icons configuration
	allUsedStyles: DEFAULT_CONTENT_STYLES, // All used styles
	lang: '_defaultLang', // Language settings
	value: null, // Initial value
	statusbar_container: null // Statusbar container
}
```

#### Multi Root frame apecific options
```javascript
{
	value: 'origin.value', // Initial content value for the editor
	placeholder: 'origin.placeholder', // Placeholder text for the editor
	editableFrameAttributes: 'origin.editableFrameAttributes', // Attributes for the editable frame
	width: 'origin.width', // Width of the editor
	minWidth: 'origin.minWidth', // Minimum width of the editor
	maxWidth: 'origin.maxWidth', // Maximum width of the editor
	height: 'origin.height', // Height of the editor
	minHeight: 'origin.minHeight', // Minimum height of the editor
	maxHeight: 'origin.maxHeight', // Maximum height of the editor
	editorStyle: 'origin.editorStyle', // Style for the editor
	iframe: 'origin.iframe', // Use iframe for the editor
	iframe_fullPage: 'origin.iframe_fullPage', // Full page iframe for the editor
	iframe_attributes: 'origin.iframe_attributes', // Attributes for the iframe
	iframe_cssFileName: 'origin.iframe_cssFileName', // CSS file name for the iframe
	statusbar: 'origin.statusbar', // Status bar for the editor
	statusbar_showPathLabel: 'origin.statusbar_showPathLabel', // Show path label in the status bar
	statusbar_resizeEnable: 'origin.statusbar_resizeEnable', // Enable resize in the status bar
	charCounter: 'origin.charCounter', // Character counter for the editor
	charCounter_max: 'origin.charCounter_max', // Maximum character count
	charCounter_label: 'origin.charCounter_label', // Label for the character counter
	charCounter_type: 'origin.charCounter_type' // Type of character counter
}
```

#### Plugin options
```javascript
{
	// --------- command
	blockquote: null, // no options.
	exportPdf: {
		apiUrl: null, // API URL for exporting PDF
		fileName: 'suneditor-pdf', // Default file name for the exported PDF
		jsPDFOptions: {}, // Default options for jsPDF
		html2canvasOptions: {} // Default options for html2canvas
	},
	fileUpload: {
		uploadUrl: null, // URL for file upload (required)
		uploadHeaders: null, // Headers for file upload
		uploadSizeLimit: null, // Upload size limit
		uploadSingleSizeLimit: null, // Single file size limit
		allowMultiple: false, // Allow multiple file uploads
		acceptedFormats: '*', // Accepted file formats
		as: 'box', // Upload mode (box or link)
		controls: [['custom-as', 'edit', 'align', 'remove', 'custom-download']] // Figure controls
	},
	list_bulleted: null, // no options.
	list_numbered: null, // no options.

	// --------- dropdown
	align: {
		items: ['left', 'center', 'right', 'justify'] // Alignment options (defaults based on text direction)
	},
	backgroundColor: {
		colorList: [], // List of background colors
		splitNum: null, // Number of color splits
		disableHEXInput: null, // Disable HEX color input
		hueSliderOptions: {
			controllerOptions: {
				parents: ['menu'],
				isOutsideForm: true
			}
		} // Options for hue slider
	},
	font: {
		items: ['Arial', 'Comic Sans MS', 'Courier New', 'Impact', 'Georgia', 'tahoma', 'Trebuchet MS', 'Verdana'] // Default list of fonts
	},
	fontColor: {
		colorList: [], // List of font colors
		splitNum: null, // Number of color splits
		disableHEXInput: null // Disable HEX color input
	},
	formatBlock: {
		items: ['p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'] // Default format block items
	},
	hr: {
		items: [
			{
				name: 'Solid',
				class: '__se__solid'
			},
			{
				name: 'Dashed',
				class: '__se__dashed'
			},
			{
				name: 'Dotted',
				class: '__se__dotted'
			}
		] // Default items for horizontal rules
	},
	layout: {
		items: null // Layout items (user must define this option)
	},
	lineHeight: {
		items: [
			{ text: '1', value: 1 },
			{ text: '1.15', value: 1.15 },
			{ text: '1.5', value: 1.5 },
			{ text: '2', value: 2 }
		] // Default line height options
	},
	list: null, // no options
	paragraphStyle: {
		items: ['spaced', 'bordered', 'neon'] // Default paragraph styles
	},
	table: {
		figureScrollList: ['se-scroll-figure-xy', 'se-scroll-figure-x', 'se-scroll-figure-y'], // Default figure scroll options
		scrollType: 'x', // Default scroll type
		captionPosition: 'top', // Default caption position
		cellControllerPosition: 'table', // Default cell controller position
		colorList: ['#b0dbb0', '#efef7e', '#f2acac', '#dcb0f6', '#99bdff', '#5dbd5d', '#e7c301', '#f64444', '#e57ff4', '#4387f1', '#27836a', '#f69915', '#ba0808', '#a90bed', '#134299', '#e4e4e4', '#B3B3B3', '#808080', '#4D4D4D', '#000000'] // Default color list for table plugin
	},
	template: {
		items: null // template items (user must define this option)
	},
	textStyle: {
		items: {
			code: {
				name: lang.menu_code,
				class: '__se__t-code',
				tag: 'code'
			},
			shadow: {
				name: lang.menu_shadow,
				class: '__se__t-shadow',
				tag: 'span'
			}
		} // test style items
	},

	// --------- field
	mention: {
		triggerText: '@', // Trigger text for mentions
		limitSize: 5, // Limit size for mentions
		searchStartLength: 0, // Search start length for mentions
		delayTime: 200, // Delay time for mention search
		apiUrl: '', // API URL for mentions
		apiHeaders: null, // API headers for mentions
		useCachingData: true, // Use caching for mention data
		useCachingFieldData: true // Use caching for mention field data
	},

	// --------- file browser
	imageGallery: {
		url: null, // URL for the image gallery file browser
		headers: null, // Headers for the image gallery file browser
		defaultWidth: '', // Default width for images in the gallery
		defaultHeight: '' // Default height for images in the gallery
	},

	// --------- input
	fontSize: {
		unitMap: {
			text: {
				default: '13px',
				list: [
					{ title: 'XX-Small', size: '8px' },
					{ title: 'X-Small', size: '10px' },
					{ title: 'Small', size: '13px' },
					{ title: 'Medium', size: '16px' },
					{ title: 'Large', size: '18px' },
					{ title: 'X-Large', size: '24px' },
					{ title: 'XX-Large', size: '32px' }
				]
			},
			px: {
				default: 13,
				inc: 1,
				min: 8,
				max: 72,
				list: [8, 10, 13, 15, 18, 20, 22, 26, 28, 36, 48, 72]
			},
			pt: {
				default: 10,
				inc: 1,
				min: 6,
				max: 72,
				list: [6, 8, 10, 12, 14, 18, 22, 26, 32]
			},
			em: {
				default: 1,
				inc: 0.1,
				min: 0.5,
				max: 5,
				list: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3]
			},
			rem: {
				default: 1,
				inc: 0.1,
				min: 0.5,
				max: 5,
				list: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3]
			},
			vw: {
				inc: 0.1,
				min: 0.5,
				max: 10,
				list: [2, 3.5, 4, 4.5, 6, 8]
			},
			vh: {
				default: 1.5,
				inc: 0.1,
				min: 0.5,
				max: 10,
				list: [1, 1.5, 2, 2.5, 3, 3.5, 4]
			},
			'%': {
				default: 100,
				inc: 1,
				min: 50,
				max: 200,
				list: [50, 70, 90, 100, 120, 140, 160, 180, 200]
			}
		}, // Unit map for font sizes
		sizeUnit: 'text', // Size unit for font size (default 'text')
		showDefaultSizeLabel: false, // Show default size label
		showIncDecControls: false, // Show increment/decrement controls
		disableInput: true // Disable input for font size
	},
	pageNavigator: null, // no options

	// --------- modal
	audio: {
		defaultWidth: '', // Default width for audio player
		defaultHeight: '', // Default height for audio player
		createFileInput: false, // Create file input for audio
		createUrlInput: true, // Create URL input for audio
		uploadUrl: null, // URL for audio upload
		uploadHeaders: null, // Headers for audio upload
		uploadSizeLimit: null, // Upload size limit for audio
		uploadSingleSizeLimit: null, // Single file upload size limit
		allowMultiple: false, // Allow multiple audio uploads
		acceptedFormats: 'audio/*', // Accepted audio formats
		audioTagAttributes: null // Attributes for the audio tag
	},
	drawing: {
		outputFormat: 'dataurl', // Output format for drawing (dataurl, svg)
		useFormatType: false, // Use format type
		defaultFormatType: 'block', // Default format type (block, inline)
		keepFormatType: false, // Keep format type
		lineWidth: 5, // Default line width
		lineReconnect: false, // Line reconnect option
		lineCap: 'round', // Line cap style (butt, round, square)
		lineColor: '', // Default line color
		formSize: {
			width: '750px', // Form width
			height: '50vh', // Form height
			maxWidth: '', // Max form width
			maxHeight: '', // Max form height
			minWidth: '150px', // Min form width
			minHeight: '100px' // Min form height
		},
		canResize: true, // Can resize the drawing area
		maintainRatio: true // Maintain aspect ratio
	},
	image: {
		canResize: true, // Can resize the image
		showHeightInput: true, // Show height input
		defaultWidth: 'auto', // Default width for the image
		defaultHeight: 'auto', // Default height for the image
		percentageOnlySize: false, // Use percentage only for size
		createFileInput: true, // Create file input for image
		createUrlInput: true, // Create URL input for image
		uploadUrl: null, // URL for image upload
		uploadHeaders: null, // Headers for image upload
		uploadSizeLimit: null, // Upload size limit for image
		uploadSingleSizeLimit: null, // Single file upload size limit
		allowMultiple: false, // Allow multiple image uploads
		acceptedFormats: 'image/*', // Accepted image formats
		useFormatType: true, // Use format type for image
		defaultFormatType: 'block', // Default format type (block, inline)
		keepFormatType: false // Keep format type
	},
	link: {
		textToDisplay: true, // Display text input field
		title: true, // Display title input field
		uploadUrl: null, // URL for file upload
		uploadHeaders: null, // Headers for file upload
		uploadSizeLimit: null, // Upload size limit
		uploadSingleSizeLimit: null, // Single file upload size limit
		acceptedFormats: null, // Accepted file formats
		enableFileUpload: false, // Enable file upload
		openNewWindow: false, // Open link in a new window
		relList: [], // List of rel attribute values
		defaultRel: {}, // Default rel attributes
		noAutoPrefix: false // Disable automatic prefix for URLs
	},
	math: {
		formSize: {
			width: '460px', // Default form width
			height: '14em', // Default form height
			maxWidth: '', // Maximum form width
			maxHeight: '', // Maximum form height
			minWidth: '400px', // Minimum form width
			minHeight: '40px' // Minimum form height
		},
		canResize: true, // Can resize the math input area
		autoHeight: false, // Automatically adjust height
		fontSizeList: [
			// List of font sizes
			{ text: '1', value: '1em' },
			{ text: '1.5', value: '1.5em' },
			{ text: '2', value: '2em' },
			{ text: '2.5', value: '2.5em' }
		]
	},
	video: {
		canResize: true, // Can resize the video
		showHeightInput: true, // Show height input field
		defaultWidth: '', // Default width for video
		defaultHeight: '', // Default height for video
		percentageOnlySize: false, // Use percentage only for size
		createFileInput: false, // Create file input for video
		createUrlInput: true, // Create URL input for video
		uploadUrl: null, // URL for video upload
		uploadHeaders: null, // Headers for video upload
		uploadSizeLimit: null, // Upload size limit for video
		uploadSingleSizeLimit: null, // Single file upload size limit
		allowMultiple: false, // Allow multiple video uploads
		acceptedFormats: 'video/*', // Accepted video formats
		defaultRatio: 0.5625, // Default aspect ratio for video
		showRatioOption: true, // Show aspect ratio option
		ratioOptions: null, // Custom aspect ratio options
		videoTagAttributes: null, // Attributes for the video tag
		iframeTagAttributes: null, // Attributes for the iframe tag
		query_youtube: '', // Query parameters for YouTube videos
		query_vimeo: '', // Query parameters for Vimeo videos
		embedQuery: {
			youtube: {
				pattern: /youtu\.?be/i,
				action: (url) => {
					url = this.convertUrlYoutube(url);
					return converter.addUrlQuery(url, 'query_youtube');
				},
				tag: 'iframe'
			},
			vimeo: {
				pattern: /vimeo\.com/i,
				action: (url) => {
					url = this.convertUrlVimeo(url);
					return converter.addUrlQuery(url, 'query_vimeo');
				},
				tag: 'iframe'
			}
		} // Query parameters for video
	},

	// --------- popup
	anchor: null // no options
}
```



















