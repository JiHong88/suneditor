/**
 * @fileoverview Shared editor mock for SunEditor tests
 * This mock provides a complete editor instance that can be reused across all tests
 */

import { dom, env } from '../../src/helper';

/**
 * Creates a mock DOM structure for testing
 */
function createMockDOM() {
	// Create wysiwyg content area - use jsdom to get real DOM elements
	const wysiwyg = document.createElement('div');
	wysiwyg.contentEditable = 'true';
	wysiwyg.innerHTML = '<p>Mock content</p>';
	wysiwyg.setAttribute('data-se-wysiwyg', 'true');

	// Create code area
	const codeArea = document.createElement('textarea');
	codeArea.className = 'se-code-area';

	// Create carrier wrapper
	const carrierWrapper = document.createElement('div');
	carrierWrapper.className = 'sun-editor-common se-container';
	carrierWrapper.innerHTML = `
		<input class="__se__focus__temp__" style="position: absolute; left: -9999px;" />
		<div class="se-modal">
			<div class="se-modal-inner"></div>
		</div>
		<div class="se-drag-cursor" style="display: none;"></div>
	`;

	// Create toolbar elements
	const toolbarMain = document.createElement('div');
	toolbarMain.className = 'se-toolbar-main';

	const toolbarSub = document.createElement('div');
	toolbarSub.className = 'se-toolbar-sub';

	const menuTray = document.createElement('div');
	menuTray.className = 'se-menu-tray';

	// Create wrapper
	const wrapper = document.createElement('div');
	wrapper.className = 'se-wrapper';
	wrapper.appendChild(wysiwyg);
	wrapper.appendChild(codeArea);

	// Create frame structure
	const wysiwygFrame = document.createElement('div');
	wysiwygFrame.className = 'se-wysiwyg-frame';
	wysiwygFrame.appendChild(wysiwyg);

	// Create top area
	const topArea = document.createElement('div');
	topArea.className = 'se-top-area';
	topArea.appendChild(toolbarMain);
	topArea.appendChild(wrapper);

	// Create statusbar
	const statusbar = document.createElement('div');
	statusbar.className = 'se-statusbar';

	// Create navigation
	const navigation = document.createElement('div');
	navigation.className = 'se-navigation';

	// Create drag handle
	const dragHandle = document.createElement('div');
	dragHandle.className = 'se-drag-handle';

	// Create line breakers
	const lineBreaker_t = document.createElement('div');
	lineBreaker_t.className = 'se-line-breaker-top';

	const lineBreaker_b = document.createElement('div');
	lineBreaker_b.className = 'se-line-breaker-bottom';

	// Create code numbers
	const codeNumbers = document.createElement('div');
	codeNumbers.className = 'se-code-numbers';

	wrapper.appendChild(dragHandle);
	wrapper.appendChild(lineBreaker_t);
	wrapper.appendChild(lineBreaker_b);

	carrierWrapper.appendChild(topArea);
	carrierWrapper.appendChild(statusbar);

	return {
		wysiwyg,
		codeArea,
		carrierWrapper,
		toolbarMain,
		toolbarSub,
		menuTray,
		wrapper,
		wysiwygFrame,
		topArea,
		statusbar,
		navigation,
		dragHandle,
		lineBreaker_t,
		lineBreaker_b,
		codeNumbers
	};
}

/**
 * Creates a mock frame context
 */
function createMockFrameContext(key = 'test-frame', elements) {
	return new Map([
		['key', key],
		['wysiwyg', elements.wysiwyg],
		['code', elements.codeArea],
		['wrapper', elements.wrapper],
		['wysiwygFrame', elements.wysiwygFrame],
		['topArea', elements.topArea],
		['statusbar', elements.statusbar],
		['navigation', elements.navigation],
		['lineBreaker_t', elements.lineBreaker_t],
		['lineBreaker_b', elements.lineBreaker_b],
		['codeNumbers', elements.codeNumbers],
		['originElement', document.body],
		['eventWysiwyg', elements.wysiwyg],
		['_ww', window],
		['_wd', document],
		['isReadOnly', false],
		['isDisabled', false],
		['isCodeView', false],
		['isFullScreen', false],
		['savedIndex', -1],
		['historyIndex', -1],
		['isChanged', false],
		['_minHeight', 100],
		[
			'options',
			new Map([
				['iframe', false],
				['statusbar_resizeEnable', true],
				['charCounter_type', 'char'],
				['hasCodeMirror', false]
			])
		]
	]);
}

/**
 * Creates a mock frame roots map
 */
function createMockFrameRoots(frameContext) {
	return new Map([['test-frame', frameContext]]);
}

/**
 * Creates mock options
 */
function createMockOptions() {
	return new Map([
		['historyStackDelayTime', 400],
		['defaultLine', 'P'],
		['defaultLineBreakFormat', 'line'],
		['elementBlacklist', ''],
		['__defaultAttributeWhitelist', 'id|class|style|data-.*'],
		['_editorElementWhitelist', 'p|div|br|span|strong|em|i|b|u|s|a|blockquote|pre|hr|table|thead|tbody|tr|th|td|ul|ol|li|dl|dt|dd|h1|h2|h3|h4|h5|h6|figcaption|figure|caption'],
		['_allowedExtraTag', ''],
		['_disallowedExtraTag', 'script|iframe|style'],
		['attributeWhitelist', null],
		['attributeBlacklist', null],
		['tagStyles', {}],
		['_lineStylesRegExp', /^(margin|padding|text-align|text-indent|line-height|letter-spacing|word-spacing|white-space):/i],
		['_textStylesRegExp', /^(color|background-color|font-size|font-family|font-weight|font-style|text-decoration|letter-spacing):/i],
		['autoStyleify', []],
		['v2Migration', false],
		['strictMode', {
			tagFilter: true,
			formatFilter: true,
			classFilter: true,
			textStyleTagFilter: true,
			attrFilter: true,
			styleFilter: true
		}],
		[
			'_defaultStyleTagMap',
			{
				strong: 'bold',
				em: 'italic',
				b: 'bold',
				i: 'italic',
				u: 'underline',
				s: 'strikethrough',
				sub: 'subscript',
				sup: 'superscript'
			}
		],
		['_rtl', false],
		[
			'_styleCommandMap',
			{
				strong: 'bold',
				em: 'italic',
				b: 'bold',
				i: 'italic',
				u: 'underline',
				s: 'strikethrough'
			}
		],
		['_textStyleTags', ['strong', 'em', 'b', 'i', 'u', 's', 'sub', 'sup', 'span', 'font', 'var', 'ins', 'strike', 'del', 'mark', 'a', 'label', 'code', 'summary']],
		['textStyleTags', 'strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label|code|summary'],
		['__listCommonStyle', ['color', 'backgroundColor', 'fontSize', 'fontName']],
		['fontSizeUnits', ['px', 'pt', '%', 'em']],
		['statusbar_showPathLabel', true],
		['iframe', false],
		['closeModalOutsideClick', true],
		['_subMode', false],
		['toolbar_sticky', 0],
		['toolbar_container', null],
		['autoLinkify', true],
		['__lineFormatFilter', true],
		['charCounter_type', 'char'],
		// Format-related options
		[
			'formatLine',
			{
				reg: /^(p|div|h[1-6]|li|dt|dd|pre)$/i,
				str: 'p|div|h1|h2|h3|h4|h5|h6|li|dt|dd|pre'
			}
		],
		[
			'formatBrLine',
			{
				reg: /^(pre)$/i,
				str: 'pre'
			}
		],
		[
			'formatBlock',
			{
				reg: /^(blockquote|ol|ul|dl|figcaption|details)$/i,
				str: 'blockquote|ol|ul|dl|figcaption|details'
			}
		],
		[
			'formatClosureBlock',
			{
				reg: /^(table|thead|tbody|tfoot|tr|th|td)$/i,
				str: 'table|thead|tbody|tfoot|tr|th|td'
			}
		],
		[
			'formatClosureBrLine',
			{
				reg: /^()$/i,
				str: ''
			}
		],
		// Browser/modal/plugin common options
		['useSearch', true],
		['defaultWidth', '100%'],
		['defaultHeight', 'auto'],
		['maxWidth', ''],
		['minWidth', ''],
		['maxHeight', ''],
		['minHeight', ''],
		['imageWidth', '100%'],
		['imageHeight', 'auto'],
		['videoWidth', 640],
		['videoHeight', 360],
		['audioWidth', 300],
		['audioHeight', 54],
		['_imageAccept', 'image/*'],
		['_videoAccept', 'video/*'],
		['_audioAccept', 'audio/*'],
		['imageFileInput', true],
		['imageUrlInput', true],
		['imageMultipleFile', true],
		['videoFileInput', true],
		['videoUrlInput', true],
		['audioFileInput', true],
		['audioUrlInput', true],
		['linkProtocol', 'https://'],
		['linkTargetNewWindow', false],
		['linkNoPrefix', false],
		['linkRel', []],
		['linkRelDefault', {}],
		['mathFontSize', []],
		['tableCellControllerPosition', 'cell'],
		['figureControls', null],
		['figureAlign', 'center'],
		['mode', 'classic'],
		['toolbar_sticky', 0],
		['toolbar_container', null],
		['popupDisplay', 'full'],
		['charCounter_type', 'char'],
		['charCounter_max', -1],
		['_defaultTagName', 'P'],
		['_defaultAttr', ''],
		['_lineAttr', null],
		['iframe', false],
		['closeModalOutsideClick', true],
		['_subMode', false]
	]);
}

/**
 * Creates mock plugins
 */
function createMockPlugins() {
	const mockPluginAction = jest.fn();
	const mockPluginActive = jest.fn();

	return {
		bold: {
			action: mockPluginAction,
			active: mockPluginActive
		},
		italic: {
			action: mockPluginAction,
			active: mockPluginActive
		},
		underline: {
			action: mockPluginAction,
			active: mockPluginActive
		},
		strikethrough: {
			action: mockPluginAction,
			active: mockPluginActive
		},
		subscript: {
			action: mockPluginAction,
			active: mockPluginActive
		},
		superscript: {
			action: mockPluginAction,
			active: mockPluginActive
		},
		fontSize: {
			action: mockPluginAction,
			active: mockPluginActive
		},
		fontColor: {
			action: mockPluginAction,
			active: mockPluginActive
		},
		hiliteColor: {
			action: mockPluginAction,
			active: mockPluginActive
		},
		indent: {
			action: mockPluginAction,
			active: mockPluginActive
		},
		outdent: {
			action: mockPluginAction,
			active: mockPluginActive
		},
		align: {
			action: mockPluginAction,
			active: mockPluginActive
		},
		list: {
			action: mockPluginAction,
			active: mockPluginActive
		},
		blockStyle: {
			action: mockPluginAction,
			active: mockPluginActive
		},
		lineHeight: {
			action: mockPluginAction,
			active: mockPluginActive
		},
		table: {
			action: mockPluginAction,
			active: mockPluginActive
		},
		link: {
			action: mockPluginAction,
			active: mockPluginActive
		},
		image: {
			action: mockPluginAction,
			active: mockPluginActive,
			pluginOptions: {
				defaultWidth: '100%',
				defaultHeight: 'auto'
			},
			modalInit: jest.fn(),
			create: jest.fn(),
			submitURL: jest.fn()
		},
		video: {
			action: mockPluginAction,
			active: mockPluginActive,
			pluginOptions: {
				defaultWidth: '560px',
				defaultHeight: '315px'
			},
			modalInit: jest.fn(),
			create: jest.fn(),
			submitURL: jest.fn(),
			findProcessUrl: jest.fn().mockReturnValue({ url: 'processed-url' }),
			createVideoTag: jest.fn().mockReturnValue('<video></video>'),
			createIframeTag: jest.fn().mockReturnValue('<iframe></iframe>')
		},
		audio: {
			action: mockPluginAction,
			active: mockPluginActive,
			pluginOptions: {
				defaultWidth: '300px',
				defaultHeight: '54px'
			},
			modalInit: jest.fn(),
			create: jest.fn(),
			submitURL: jest.fn()
		},
		fileUpload: {
			action: mockPluginAction,
			active: mockPluginActive,
			pluginOptions: {
				defaultWidth: '100%',
				defaultHeight: 'auto'
			},
			create: jest.fn(),
			submitURL: jest.fn(),
			modalInit: jest.fn()
		},
		imageGallery: {
			action: mockPluginAction,
			active: mockPluginActive,
			browser: {
				selectorHandler: jest.fn(),
				open: jest.fn(),
				close: jest.fn()
			}
		},
		videoGallery: {
			action: mockPluginAction,
			active: mockPluginActive,
			browser: {
				selectorHandler: jest.fn(),
				open: jest.fn(),
				close: jest.fn()
			}
		},
		audioGallery: {
			action: mockPluginAction,
			active: mockPluginActive,
			browser: {
				selectorHandler: jest.fn(),
				open: jest.fn(),
				close: jest.fn()
			}
		},
		fileGallery: {
			action: mockPluginAction,
			active: mockPluginActive,
			browser: {
				selectorHandler: jest.fn(),
				open: jest.fn(),
				close: jest.fn()
			}
		},
		codeView: {
			action: mockPluginAction,
			active: mockPluginActive
		},
		save: {
			action: mockPluginAction,
			active: mockPluginActive
		},
		print: {
			action: mockPluginAction,
			active: mockPluginActive
		},
		preview: {
			action: mockPluginAction,
			active: mockPluginActive
		},
		fullScreen: {
			action: mockPluginAction,
			active: mockPluginActive
		}
	};
}

/**
 * Creates mock command targets
 */
function createMockCommandTargets() {
	const createButton = (name) => {
		const btn = document.createElement('button');
		btn.setAttribute('data-command', name);
		btn.className = `se-btn se-btn-${name}`;
		btn.disabled = false;
		return btn;
	};

	return new Map([
		['bold', [createButton('bold')]],
		['italic', [createButton('italic')]],
		['underline', [createButton('underline')]],
		['strikethrough', [createButton('strikethrough')]],
		['subscript', [createButton('subscript')]],
		['superscript', [createButton('superscript')]],
		['fontSize', [createButton('fontSize')]],
		['fontColor', [createButton('fontColor')]],
		['hiliteColor', [createButton('hiliteColor')]],
		['indent', [createButton('indent')]],
		['outdent', [createButton('outdent')]],
		['align', [createButton('align')]],
		['list', [createButton('list')]],
		['blockStyle', [createButton('blockStyle')]],
		['lineHeight', [createButton('lineHeight')]],
		['table', [createButton('table')]],
		['link', [createButton('link')]],
		['image', [createButton('image')]],
		['video', [createButton('video')]],
		['audio', [createButton('audio')]],
		['codeView', [createButton('codeView')]],
		['undo', [createButton('undo')]],
		['redo', [createButton('redo')]],
		['save', [createButton('save')]],
		['print', [createButton('print')]],
		['preview', [createButton('preview')]],
		['fullScreen', [createButton('fullScreen')]]
	]);
}

/**
 * Creates a complete mock editor instance with layered DI pattern ($deps bag)
 */
export function createMockEditor(customOptions = {}) {
	const elements = createMockDOM();
	const frameContext = createMockFrameContext('test-frame', elements);
	const frameRoots = createMockFrameRoots(frameContext);
	const options = createMockOptions();
	const plugins = createMockPlugins();
	const commandTargets = createMockCommandTargets();

	// Apply custom options
	Object.entries(customOptions).forEach(([key, value]) => {
		options.set(key, value);
	});

	// Create icons and lang (L2 config layer)
	const icons = {
		bold: '<svg/>', italic: '<svg/>', underline: '<svg/>', strikethrough: '<svg/>',
		subscript: '<svg/>', superscript: '<svg/>', fontSize: '<svg/>', fontColor: '<svg/>',
		hiliteColor: '<svg/>', indent: '<svg/>', outdent: '<svg/>', align: '<svg/>',
		align_left: '<svg/>', align_center: '<svg/>', align_right: '<svg/>', align_justify: '<svg/>',
		list_bulleted: '<svg>bulleted</svg>', list_numbered: '<svg>numbered</svg>', list_bullets: '<svg/>', list_number: '<svg/>', blockStyle: '<svg/>', lineHeight: '<svg/>',
		table: '<svg/>', link: '<svg/>', image: '<svg/>', video: '<svg/>', audio: '<svg/>',
		codeView: '<svg/>', undo: '<svg/>', redo: '<svg/>', save: '<svg/>', print: '<svg/>',
		preview: '<svg/>', fullScreen: '<svg/>', arrow_down: '<svg/>', check: '<svg/>',
		cancel: '<svg/>', close: '<svg/>', expansion: '<svg/>', reduction: '<svg/>',
		format_float_none: '<svg/>', format_float_left: '<svg/>', format_float_right: '<svg/>',
		format_float_inline: '<svg/>', caption: '<svg/>',
		resize100: '<svg/>', resize75: '<svg/>', resize50: '<svg/>', resize25: '<svg/>',
		mirror_horizontal: '<svg/>', mirror_vertical: '<svg/>',
		rotate_left: '<svg/>', rotate_right: '<svg/>',
		copy: '<svg/>', cut: '<svg/>', delete: '<svg/>',
		math: '<svg/>', drawing: '<svg/>', embed: '<svg/>', mention: '<svg/>',
		paragraphStyle: '<svg/>', textStyle: '<svg/>', horizontalRule: '<svg/>',
		template: '<svg/>', layout: '<svg/>', fileUpload: '<svg/>', exportPDF: '<svg/>',
		// Add missing thumbnail icons
		video_thumbnail: '🎥', audio_thumbnail: '🎵', file_thumbnail: '📁',
		image_gallery: '<svg/>', video_gallery: '<svg/>', audio_gallery: '<svg/>',
		file_gallery: '<svg/>', file_browser: '<svg/>',
		selection: '<svg class="se-icon-selection"/>'
	};

	// Initialize contextProvider now that icons is defined
	const contextProvider = {
		frameRoots: frameRoots,
		context: {
			get: jest.fn((key) => {
				const contextMap = {
					menuTray: elements.menuTray,
					toolbar_main: elements.toolbarMain,
					toolbar_sub_main: elements.toolbarSub,
					topArea: elements.topArea,
					wrapper: elements.wrapper,
					wysiwyg: elements.wysiwyg,
					code: elements.codeArea,
					statusbar: elements.statusbar,
					codeWrapper: elements.wrapper || document.createElement('div'),
					wysiwygFrame: elements.wysiwygFrame || document.createElement('div'),
					toolbar_arrow: document.createElement('div')
				};
				return contextMap[key] || document.createElement('div');
			}),
			set: jest.fn(),
			has: jest.fn(),
			delete: jest.fn(),
			clear: jest.fn()
		},
		frameContext: frameContext,
		icons: icons,
		applyToRoots: jest.fn((callback) => {
			frameRoots.forEach((root) => callback(root));
		}),
		carrierWrapper: elements.carrierWrapper,
		reset: jest.fn(),
		init: jest.fn(),
		destroy: jest.fn()
	};

	const lang = { close: 'Close',
		toolbar: {
			bold: 'Bold', italic: 'Italic', underline: 'Underline', strikethrough: 'Strikethrough',
			subscript: 'Subscript', superscript: 'Superscript', indent: 'Indent', outdent: 'Outdent',
			undo: 'Undo', redo: 'Redo', save: 'Save', print: 'Print', preview: 'Preview',
			fullScreen: 'Full Screen', codeView: 'Code View', removeFormat: 'Remove Format',
			font: 'Font', fontSize: 'Font Size', fontColor: 'Font Color', backgroundColor: 'Background Color',
			align: 'Align', list: 'List', lineHeight: 'Line Height', table: 'Table', link: 'Link',
			image: 'Image', video: 'Video', audio: 'Audio', math: 'Math', blockquote: 'Blockquote',
			paragraphStyle: 'Paragraph Style', textStyle: 'Text Style', horizontalRule: 'Horizontal Rule',
			template: 'Template', layout: 'Layout', mention: 'Mention', embed: 'Embed',
			drawing: 'Drawing', pageNavigator: 'Page Navigator', exportPDF: 'Export PDF',
			fileUpload: 'File Upload', imageGallery: 'Image Gallery', videoGallery: 'Video Gallery',
			audioGallery: 'Audio Gallery', fileBrowser: 'File Browser', fileGallery: 'File Gallery'
		},
		dialogBox: {
			title: 'Title', url: 'URL', text: 'Text', close: 'Close', submitButton: 'Submit',
			caption: 'Caption', altText: 'Alt Text', width: 'Width', height: 'Height',
			basic: 'Basic', left: 'Left', center: 'Center', right: 'Right',
			ratio: 'Ratio', percentage: 'Percentage', pixels: 'Pixels',
			linkBox: { title: 'Link', url: 'URL', text: 'Text', newWindowCheck: 'Open in new window' }
		},
		controller: {
			edit: 'Edit', remove: 'Remove', tableHeader: 'Table Header',
			mergeCells: 'Merge Cells', splitCells: 'Split Cells', copy: 'Copy',
			cut: 'Cut', delete: 'Delete', fixedColumnWidth: 'Fixed Column Width',
			resize100: '100%', resize75: '75%', resize50: '50%', resize25: '25%',
			autoSize: 'Auto Size', mirrorHorizontal: 'Mirror Horizontal',
			mirrorVertical: 'Mirror Vertical', rotateLeft: 'Rotate Left',
			rotateRight: 'Rotate Right', maxSize: 'Max Size', minSize: 'Min Size',
			caption: 'Caption'
		},
		font: 'Font', fontSize: 'Size', image: 'Image', video: 'Video', audio: 'Audio',
		link: 'Link', math: 'Math', drawing: 'Drawing', embed: 'Embed',
		align: { left: 'Left', center: 'Center', right: 'Right', justify: 'Justify' },
		list: 'List', numberedList: 'Numbered List', bulletedList: 'Bulleted List',
		anchor: { bookmark: 'Bookmark', url: 'URL', newWindow: 'New Window' },
		imageGallery: 'Image Gallery',
		videoGallery: 'Video Gallery',
		audioGallery: 'Audio Gallery',
		fileBrowser: 'File Browser',
		fileGallery: 'File Gallery',
		plugins: {}
	};

	// Create Store for state management
	const storeState = {
		_editorInitFinished: true,
		_destroy: false,
		isScrollable: jest.fn().mockReturnValue(true)
	};

	const store = {
		get: jest.fn((key) => storeState[key]),
		set: jest.fn((key, value) => { storeState[key] = value; }),
		subscribe: jest.fn().mockReturnValue(jest.fn()),
		mode: {
			isClassic: true,
			isInline: false,
			isBalloon: false,
			isBalloonAlways: false,
			isSubBalloon: false,
			isSubBalloonAlways: false
		},
		_editorInitFinished: true,
		_destroy: jest.fn()
	};

	// L2 Config layer
	const instanceCheck = {
		isWysiwygMode: jest.fn().mockReturnValue(true),
		isCodeViewMode: jest.fn().mockReturnValue(false),
		isRange: jest.fn((r) => r instanceof Range || Object.prototype.toString.call(r) === '[object Range]'),
		isSelection: jest.fn((s) => s instanceof Selection || Object.prototype.toString.call(s) === '[object Selection]'),
		isNode: jest.fn((n) => n?.nodeType !== undefined),
		isText: jest.fn((n) => n?.nodeType === 3),
		isElement: jest.fn((n) => n?.nodeType === 1)
	};

	const optionsMap = {
		get: (key) => options.get(key),
		has: (key) => options.has(key),
		set: (key, value) => options.set(key, value)
	};

	const optionProvider = {
		options: optionsMap,
		frameOptions: {
			get: (key) => frameContext.get('options')?.get(key) ?? options.get(key),
			has: (key) => frameContext.get('options')?.has(key) || options.has(key),
			set: (key, value) => frameContext.get('options')?.set(key, value)
		},
		reset: jest.fn(),
		_destroy: jest.fn()
	};

	const eventManager = {
		applyTagEffect: jest.fn(),
		addEvent: jest.fn().mockReturnValue({ target: null, type: '', listener: null }),
		removeEvent: jest.fn(),
		addGlobalEvent: jest.fn().mockReturnValue({ target: null, type: '', listener: null }),
		removeGlobalEvent: jest.fn(),
		triggerEvent: jest.fn().mockResolvedValue(undefined),
		events: {},
		scrollparents: [],
		_init: jest.fn(),
		_destroy: jest.fn()
	};

	// L3 Logic layer (core modules)
	const offset = {
		getOffset: jest.fn().mockReturnValue({ top: 0, left: 0 }),
		getCoordinate: jest.fn().mockReturnValue({ x: 0, y: 0 }),
		getLocal: jest.fn().mockReturnValue({ top: 0, left: 0, scrollX: 0, scrollY: 0 }),
		getGlobal: jest.fn().mockReturnValue({ top: 0, left: 0 }),
		getGlobalScroll: jest.fn().mockReturnValue({
			top: 0,
			left: 0,
			width: 0,
			height: 0,
			x: 0,
			y: 0,
			ohOffsetEl: null,
			owOffsetEl: null,
			oh: 0,
			ow: 0,
			heightEditorRefer: false,
			widthEditorRefer: false,
			ts: 0,
			ls: 0
		})
	};

	const selection = {
		getNode: jest.fn().mockReturnValue(elements.wysiwyg.firstChild),
		setRange: jest.fn(),
		getRange: jest.fn().mockReturnValue(document.createRange()),
		getNearRange: jest.fn().mockReturnValue({ container: elements.wysiwyg.firstChild, offset: 0 }),
		getRangeAndLine: jest.fn().mockReturnValue({ range: document.createRange(), line: null }),
		getRangeAndAddLine: jest.fn().mockReturnValue({ range: document.createRange(), line: null }),
		getDragEventLocationRange: jest.fn().mockReturnValue({
			sc: elements.wysiwyg.firstChild,
			so: 0,
			ec: elements.wysiwyg.firstChild,
			eo: 0
		}),
		getRects: jest.fn().mockReturnValue({
			rects: [],
			position: 'start',
			left: 0,
			top: 0,
			right: 0,
			bottom: 0,
			width: 0,
			height: 0,
			noText: false
		}),
		get: jest.fn().mockReturnValue(null),
		save: jest.fn(),
		restore: jest.fn(),
		removeRange: jest.fn(),
		resetRangeToTextNode: jest.fn(),
		_init: jest.fn(),
		scrollTo: jest.fn(),
		isWWTarget: jest.fn().mockReturnValue(true),
		__iframeFocus: false,
		range: null,
		selectionNode: null
	};

	const format = {
		isLine: jest.fn().mockReturnValue(true),
		isBlock: jest.fn().mockReturnValue(false),
		isBrLine: jest.fn().mockReturnValue(false),
		isNormalLine: jest.fn().mockReturnValue(true),
		isClosureBlock: jest.fn().mockReturnValue(false),
		isClosureBrLine: jest.fn().mockReturnValue(false),
		isTextStyleNode: jest.fn().mockReturnValue(false),
		getBlock: jest.fn().mockReturnValue(null),
		getLine: jest.fn().mockReturnValue(null),
		getBrLine: jest.fn().mockReturnValue(null),
		getLines: jest.fn().mockReturnValue([]),
		getNormalLines: jest.fn().mockReturnValue([]),
		addLine: jest.fn(),
		setLine: jest.fn(),
		setBrLine: jest.fn(),
		applyBlock: jest.fn(),
		removeBlock: jest.fn(),
		isEdgeLine: jest.fn().mockReturnValue(false),
		startsWith: jest.fn().mockReturnValue(false),
		_isExcludeSelectionElement: jest.fn().mockReturnValue(false),
		_isNotTextNode: jest.fn().mockReturnValue(false)
	};

	const inline = {
		apply: jest.fn().mockReturnValue(document.createElement('span')),
		remove: jest.fn(),
		is: jest.fn().mockReturnValue(false),
		_isNonSplitNode: jest.fn().mockReturnValue(false)
	};

	const listFormat = {
		createList: jest.fn(),
		removeList: jest.fn(),
		getList: jest.fn().mockReturnValue(null),
		apply: jest.fn().mockReturnValue({ sc: elements.wysiwyg.firstChild, so: 0, ec: elements.wysiwyg.firstChild, eo: 1 })
	};

	const html = {
		clean: jest.fn().mockReturnValue('cleaned html'),
		insert: jest.fn(),
		set: jest.fn(),
		remove: jest.fn(),
		insertNode: jest.fn(),
		copy: jest.fn().mockReturnValue(''),
		_convertToCode: jest.fn().mockReturnValue('<p>converted</p>')
	};

	const nodeTransform = {
		createNestedNode: jest.fn().mockReturnValue({
			parent: document.createElement('div'),
			inner: document.createElement('span')
		}),
		removeAllParents: jest.fn(),
		split: jest.fn().mockReturnValue({ before: null, after: null })
	};

	const char = {
		test: jest.fn().mockReturnValue(true),
		check: jest.fn().mockReturnValue(true),
		display: jest.fn()
	};

	const component = {
		is: jest.fn().mockReturnValue(false),
		get: jest.fn().mockReturnValue(null),
		select: jest.fn(),
		deselect: jest.fn(),
		hoverSelect: jest.fn(),
		copy: jest.fn(),
		cut: jest.fn(),
		delete: jest.fn(),
		insert: jest.fn(),
		isInline: jest.fn().mockReturnValue(false),
		__deselect: jest.fn(),
		__removeGlobalEvent: jest.fn(),
		__selectionSelected: false
	};

	const focusManager = {
		focus: jest.fn(),
		blur: jest.fn(),
		nativeFocus: jest.fn(),
		focusEdge: jest.fn(),
		_preventBlur: false
	};

	const pluginManager = {
		fileInfo: {
			tags: [],
			regExp: /^(img|video|audio|object)$/i,
			pluginRegExp: /^(image|video|audio|fileUpload)$/,
			tagAttrs: {},
			pluginMap: {}
		},
		componentCheckers: [],
		retainFormatCheckers: new Map(),
		checkFileInfo: jest.fn(),
		resetFileInfo: jest.fn(),
		findComponentInfo: jest.fn().mockReturnValue(null),
		applyRetainFormat: jest.fn(),
		emitEvent: jest.fn(),
		emitEventAsync: jest.fn(),
		register: jest.fn(),
		destroy: jest.fn()
	};

	const ui = {
		setEditorStyle: jest.fn(),
		setTheme: jest.fn(),
		setDir: jest.fn(),
		readOnly: jest.fn(),
		disable: jest.fn(),
		enable: jest.fn(),
		show: jest.fn(),
		hide: jest.fn(),
		showLoading: jest.fn(),
		hideLoading: jest.fn(),
		alertOpen: jest.fn(),
		alertClose: jest.fn(),
		showToast: jest.fn(),
		closeToast: jest.fn(),
		setControllerOnDisabledButtons: jest.fn().mockReturnValue(true),
		onControllerContext: jest.fn(),
		offControllerContext: jest.fn(),
		enableBackWrapper: jest.fn(),
		disableBackWrapper: jest.fn(),
		offCurrentController: jest.fn(),
		offCurrentModal: jest.fn(),
		getVisibleFigure: jest.fn().mockReturnValue(null),
		setFigureContainer: jest.fn(),
		preventToolbarHide: jest.fn(),
		reset: jest.fn(),
		_offControllers: jest.fn(),
		_syncScrollPosition: jest.fn(),
		_repositionControllers: jest.fn(),
		_visibleControllers: jest.fn(),
		_initToggleButtons: jest.fn(),
		_toggleCodeViewButtons: jest.fn(),
		_toggleControllerButtons: jest.fn(),
		isButtonDisabled: jest.fn().mockReturnValue(false),
		_updatePlaceholder: jest.fn(),
		_syncFrameState: jest.fn(),
		_iframeAutoHeight: jest.fn(),
		_emitResizeEvent: jest.fn(),
		init: jest.fn(),
		destroy: jest.fn(),
		opendControllers: [],
		currentControllerName: '',
		opendModal: null,
		opendBrowser: null,
		selectMenuOn: false,
		_controllerOnDisabledButtons: [],
		_codeViewDisabledButtons: [],
		_notHideToolbar: false,
		_figureContainer: null
	};

	const commandDispatcher = {
		run: jest.fn(),
		runFromTarget: jest.fn(),
		targets: commandTargets,
		activeCommands: ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'indent', 'outdent'],
		applyTargets: jest.fn((command, callback) => {
			const targets = commandTargets.get(command);
			if (targets) {
				targets.forEach(callback);
			}
		}),
		registerTargets: jest.fn(),
		resetTargets: jest.fn(),
		_copyFormat: jest.fn(),
		_pasteFormat: jest.fn(),
		destroy: jest.fn()
	};

	const history = {
		push: jest.fn(),
		check: jest.fn(),
		undo: jest.fn(),
		redo: jest.fn(),
		pause: jest.fn(),
		resume: jest.fn(),
		reset: jest.fn(),
		resetButtons: jest.fn(),
		getRootStack: jest.fn().mockReturnValue({
			'test-frame': { value: [], index: -1 },
			'second-frame': { value: [], index: -1 }
		}),
		resetDelayTime: jest.fn(),
		overwrite: jest.fn(),
		destroy: jest.fn()
	};

	const shortcuts = {
		command: jest.fn().mockReturnValue(false),
		enable: jest.fn(),
		disable: jest.fn(),
		_registerCustomShortcuts: jest.fn(),
		keyMap: new Map(),
		reverseKeys: []
	};

	const toolbar = {
		_setResponsive: jest.fn(),
		resetResponsiveToolbar: jest.fn(),
		_showBalloon: jest.fn(),
		hide: jest.fn(),
		show: jest.fn(),
		_balloonOffset: { top: 0, left: 0, position: 'top' },
		_resetSticky: jest.fn(),
		_sticky: false,
		_showInline: jest.fn(),
		_inlineToolbarAttr: { isShow: false }
	};

	const subToolbar = {
		resetResponsiveToolbar: jest.fn(),
		_showBalloon: jest.fn(),
		hide: jest.fn(),
		show: jest.fn(),
		_balloonOffset: { top: 0, left: 0, position: 'top' },
		_setBalloonOffset: jest.fn()
	};

	const menu = {
		currentDropdownActiveButton: null,
		currentDropdown: null,
		currentDropdownName: null,
		dropdownOff: jest.fn(),
		containerOff: jest.fn(),
		initDropdownTarget: jest.fn(),
		querySelector: jest.fn().mockReturnValue(null),
		querySelectorAll: jest.fn().mockReturnValue([]),
		__resetMenuPosition: jest.fn(),
		__restoreMenuPosition: jest.fn(),
		_hideAllSubMenu: jest.fn(),
		_getMenuButtonElement: jest.fn().mockReturnValue(null)
	};

	const viewer = {
		_codeViewAutoHeight: jest.fn(),
		_scrollLineNumbers: jest.fn(),
		_resetFullScreenHeight: jest.fn().mockReturnValue(false)
	};

	// Build the $ deps bag (KernelInjector deps)
	const $ = {
		// L2 config
		contextProvider,
		optionProvider,
		instanceCheck,
		eventManager,
		// Convenience accessors
		frameRoots,
		context: contextProvider.context,
		options: optionsMap,
		frameOptions: optionProvider.frameOptions,
		frameContext,
		icons,
		lang,
		store,
		// L3 logic
		offset,
		selection,
		format,
		inline,
		listFormat,
		html,
		nodeTransform,
		char,
		component,
		focusManager,
		pluginManager,
		plugins,
		ui,
		commandDispatcher,
		history,
		shortcuts,
		toolbar,
		subToolbar,
		menu,
		viewer,
		// Window/Document references
		_w: window,
		_d: document,
		// Facade (public API)
		facade: {
			changeFrameContext: jest.fn()
		}
	};

	// Create the kernel object (the mock editor instance)
	const kernel = {
		$,
		store,
		facade: $.facade,
		_w: window,
		_d: document,

		// Backward-compatible flat accessors (for tests that use mockEditor.options instead of mockEditor.$.options)
		options: optionsMap,
		frameContext,
		frameRoots,
		context: contextProvider.context,
		frameOptions: optionProvider.frameOptions,
		icons,
		lang,
		selection,
		format,
		inline,
		html,
		char,
		nodeTransform,
		offset,
		listFormat,
		component,
		focusManager,
		pluginManager,
		plugins,
		ui,
		commandDispatcher,
		history,
		shortcuts,
		toolbar,
		subToolbar,
		menu,
		viewer,
		instanceCheck,
		eventManager,
		contextProvider,
		optionProvider,
		uiManager: ui, // Alias for backward compatibility
		_eventOrchestrator: {
			applyTagEffect: jest.fn(),
			_addCommonEvents: jest.fn(),
			addEvent: jest.fn(),
			removeEvent: jest.fn(),
			selectionState: {
				reset: jest.fn()
			}
		},

		// Status
		status: {
			hasFocus: false,
			rootKey: 'test-frame',
			_range: null,
			currentNodes: [],
			currentNodesMap: [],
			initViewportHeight: 800,
			currentViewportHeight: 800
		},

		// Editor state
		effectNode: null,
		activeCommands: ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'indent', 'outdent'],
		commandTargets,
		rootKeys: ['test-frame'],
		carrierWrapper: elements.carrierWrapper,

		// Editor object
		editor: {
			selectMenuOn: false,
			isBalloon: false,
			isSubBalloon: false
		},

		// Plugin event handlers
		_onPluginEvents: new Map([
			['onPaste', []],
			['onFocus', []],
			['onBlur', []],
			['onScroll', []],
			['onMouseUp', []],
			['onMouseDown', []],
			['onMouseMove', []],
			['onMouseLeave', []],
			['onClick', []],
			['onKeyDown', []],
			['onKeyUp', []],
			['onInput', []],
			['onBeforeInput', []],
			['onCopy', []],
			['onCut', []],
			['onFilePasteAndDrop', []]
		]),

		// Additional properties for event/command dispatching
		scrollparents: [],
		triggerEvent: jest.fn(),
		_callPluginEvent: jest.fn().mockReturnValue(undefined),
		_callPluginEventAsync: jest.fn().mockResolvedValue(undefined),
		_dataTransferAction: jest.fn().mockReturnValue(undefined),
		_handledInBefore: false,
		isComposing: false,
		_onShortcutKey: false,
		_setDefaultLine: jest.fn(),

		// Editor actions
		changeFrameContext: jest.fn(),
		_checkComponents: jest.fn(),
		_resourcesStateChange: jest.fn(),
		applyCommandTargets: jest.fn((command, callback) => {
			const targets = commandTargets.get(command);
			if (targets) {
				targets.forEach(callback);
			}
		}),
		execCommand: jest.fn(),
		runFromTarget: jest.fn(),
		_iframeAutoHeight: jest.fn(),
		__callResizeFunction: jest.fn(),

		// Editor modes
		isBalloon: false,
		isSubBalloon: false,
		isInline: false,
		isBalloonAlways: false,
		isSubBalloonAlways: false,

		// Editor flags
		_preventBlur: false,
		_preventFocus: false,
		_preventSelection: false
	};

	return kernel;
}

/**
 * Creates a mock 'this' context for event handlers and other methods
 * Returns a $-based context that works with EventOrchestrator and other DI consumers
 */
export function createMockThis(editor = null, customProps = {}) {
	const mockKernel = editor || createMockEditor();

	// Create the $ deps bag for this context
	const $ = {
		...mockKernel.$,
		// Override with this-specific event methods
		applyTagEffect: jest.fn(),
		addEvent: jest.fn(),
		removeEvent: jest.fn(),
		addGlobalEvent: jest.fn(),
		removeGlobalEvent: jest.fn()
	};

	// Return the context object with $ property
	const context = {
		$,

		// Reference to kernel
		kernel: mockKernel,

		// Convenience direct accessors (for backward compatibility)
		editor: mockKernel,
		frameContext: $.frameContext,
		frameRoots: $.frameRoots,
		frameOptions: $.frameOptions,
		options: $.options,
		context: $.context,
		carrierWrapper: mockKernel.carrierWrapper,
		_w: window,

		// L3 logic layer modules (for direct test access)
		selection: $.selection,
		format: $.format,
		inline: $.inline,
		html: $.html,
		char: $.char,
		nodeTransform: $.nodeTransform,
		offset: $.offset,
		listFormat: $.listFormat,
		component: $.component,
		focusManager: $.focusManager,
		pluginManager: $.pluginManager,
		plugins: $.plugins,
		ui: $.ui,
		uiManager: $.ui, // Alias for backward compatibility
		commandDispatcher: $.commandDispatcher,
		history: $.history,
		shortcuts: $.shortcuts,
		toolbar: $.toolbar,
		subToolbar: $.subToolbar,
		menu: $.menu,
		viewer: $.viewer,

		// Status
		status: mockKernel.status,
		isComposing: false,

		// Event manager specific properties
		scrollparents: [],
		_events: [],
		_onButtonsCheck: new RegExp(`^(${Object.keys($.options.get('_defaultStyleTagMap')).join('|')})$`, 'i'),
		_onShortcutKey: false,
		_handledInBefore: false,
		_balloonDelay: null,
		_wwFrameObserver: null,
		_toolbarObserver: null,
		_lineBreakComp: null,
		_formatAttrsTemp: null,
		_resizeClientY: 0,
		__close_move: null,
		__geckoActiveEvent: null,
		__cacheStyleNodes: [],
		__selectionSyncEvent: null,
		_inputFocus: false,
		__inputPlugin: null,
		__inputBlurEvent: null,
		__inputKeyEvent: null,
		__focusTemp: mockKernel.carrierWrapper.querySelector('.__se__focus__temp__'),
		__retainTimer: null,
		__eventDoc: null,
		__secopy: null,

		// Event manager methods
		addEvent: jest.fn(),
		removeEvent: jest.fn(),
		addGlobalEvent: jest.fn(),
		removeGlobalEvent: jest.fn(),
		applyTagEffect: jest.fn(),
		triggerEvent: mockKernel.triggerEvent,
		_dataTransferAction: jest.fn().mockResolvedValue(false),
		_setDefaultLine: jest.fn(),
		_toggleToolbarBalloon: jest.fn(),
		_showToolbarBalloonDelay: jest.fn(),
		_hideToolbar: jest.fn(),
		_hideToolbar_sub: jest.fn(),
		_setSelectionSync: jest.fn(),
		_retainStyleNodes: jest.fn(),
		_clearRetainStyleNodes: jest.fn(),
		_callPluginEvent: jest.fn(),
		_callPluginEventAsync: jest.fn().mockResolvedValue(undefined),
		__removeInput: jest.fn(),
		__postFocusEvent: jest.fn(),
		__postBlurEvent: jest.fn(),
		__setViewportSize: jest.fn(),
		_injectActiveEvent: jest.fn(),
		_setKeyEffect: jest.fn(),
		_removeAllEvents: jest.fn(),
		_addCommonEvents: jest.fn(),
		_addFrameEvents: jest.fn(),
		__addStatusbarEvent: jest.fn(),

		// Allow custom properties to override defaults
		...customProps
	};

	return context;
}

/**
 * Creates a mock event object
 */
export function createMockEvent(type = 'click', customProps = {}) {
	const mockTarget = document.createElement('button');
	mockTarget.setAttribute('data-command', 'bold');

	return {
		type,
		target: mockTarget,
		currentTarget: mockTarget,
		preventDefault: jest.fn(),
		stopPropagation: jest.fn(),
		stopImmediatePropagation: jest.fn(),
		bubbles: true,
		cancelable: true,
		composed: false,
		defaultPrevented: false,
		eventPhase: 2,
		isTrusted: false,
		timeStamp: Date.now(),
		...customProps
	};
}

/**
 * Creates a mock clipboard data object
 */
export function createMockClipboardData(customProps = {}) {
	return {
		getData: jest.fn().mockReturnValue(''),
		setData: jest.fn(),
		clearData: jest.fn(),
		files: [],
		types: ['text/plain'],
		items: [],
		effectAllowed: 'all',
		dropEffect: 'none',
		...customProps
	};
}

/**
 * Creates a mock keyboard event
 */
export function createMockKeyboardEvent(key = 'a', customProps = {}) {
	return createMockEvent('keydown', {
		key,
		code: `Key${key.toUpperCase()}`,
		keyCode: key.charCodeAt(0),
		which: key.charCodeAt(0),
		charCode: key.charCodeAt(0),
		shiftKey: false,
		ctrlKey: false,
		altKey: false,
		metaKey: false,
		repeat: false,
		isComposing: false,
		location: 0,
		...customProps
	});
}

/**
 * Creates a mock input event
 */
export function createMockInputEvent(inputType = 'insertText', customProps = {}) {
	return createMockEvent('input', {
		inputType,
		data: 'a',
		isComposing: false,
		...customProps
	});
}

/**
 * Creates a mock mouse event
 */
export function createMockMouseEvent(type = 'click', customProps = {}) {
	return createMockEvent(type, {
		button: 0,
		buttons: 1,
		clientX: 100,
		clientY: 100,
		pageX: 100,
		pageY: 100,
		screenX: 100,
		screenY: 100,
		offsetX: 50,
		offsetY: 50,
		movementX: 0,
		movementY: 0,
		shiftKey: false,
		ctrlKey: false,
		altKey: false,
		metaKey: false,
		detail: 1,
		...customProps
	});
}

/**
 * Creates a mock drag event
 */
export function createMockDragEvent(type = 'dragover', customProps = {}) {
	return createMockMouseEvent(type, {
		dataTransfer: createMockClipboardData(),
		...customProps
	});
}


/**
 * Helper to wait for editor operations to complete
 */
export function waitForEditor(editor, condition, timeout = 1000) {
	return new Promise((resolve, reject) => {
		const start = Date.now();

		function check() {
			try {
				if (condition(editor)) {
					resolve(editor);
				} else if (Date.now() - start > timeout) {
					reject(new Error('Editor condition timeout'));
				} else {
					setTimeout(check, 10);
				}
			} catch (error) {
				reject(error);
			}
		}

		check();
	});
}

export default {
	createMockEditor,
	createMockThis,
	createMockEvent,
	createMockClipboardData,
	createMockKeyboardEvent,
	createMockInputEvent,
	createMockMouseEvent,
	createMockDragEvent,
	waitForEditor
};
