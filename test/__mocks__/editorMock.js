/**
 * @fileoverview Shared editor mock for SunEditor tests
 * This mock provides a complete editor instance that can be reused across all tests
 */

import { dom, env } from '../../src/helper';

/**
 * Creates a mock DOM structure for testing
 */
function createMockDOM() {
	// Create wysiwyg content area
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
		['_textStyleTags', ['strong', 'em', 'b', 'i', 'u', 's', 'sub', 'sup']],
		['statusbar_showPathLabel', true],
		['iframe', false],
		['closeModalOutsideClick', true],
		['_subMode', false],
		['toolbar_sticky', 0],
		['toolbar_container', null],
		['autoLinkify', true],
		['__lineFormatFilter', true],
		['charCounter_type', 'char']
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
		formatBlock: {
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
			active: mockPluginActive
		},
		video: {
			action: mockPluginAction,
			active: mockPluginAction
		},
		audio: {
			action: mockPluginAction,
			active: mockPluginActive
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
		['formatBlock', [createButton('formatBlock')]],
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
 * Creates a complete mock editor instance
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

	const mockEditor = {
		// Core properties
		frameRoots,
		frameContext,
		frameOptions: {
			get: (key) => frameContext.get('options').get(key) || options.get(key),
			has: (key) => frameContext.get('options').has(key) || options.has(key),
			set: (key, value) => frameContext.get('options').set(key, value)
		},
		options: {
			get: (key) => options.get(key),
			has: (key) => options.has(key),
			set: (key, value) => options.set(key, value)
		},
		carrierWrapper: elements.carrierWrapper,
		rootKeys: ['test-frame'],

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
		plugins,

		// Context
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
					statusbar: elements.statusbar
				};
				return contextMap[key] || document.createElement('div');
			})
		},

		format: {
			isLine: jest.fn().mockReturnValue(true),
			isBlock: jest.fn().mockReturnValue(false),
			getBlock: jest.fn().mockReturnValue(null),
			getLine: jest.fn().mockReturnValue(null),
			addLine: jest.fn(),
			_isExcludeSelectionElement: jest.fn().mockReturnValue(false)
		},

		html: {
			clean: jest.fn().mockReturnValue('cleaned html'),
			insert: jest.fn(),
			remove: jest.fn(),
			insertNode: jest.fn()
		},

		char: {
			test: jest.fn().mockReturnValue(true),
			check: jest.fn().mockReturnValue(true),
			display: jest.fn()
		},

		history: {
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
		},

		toolbar: {
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
		},

		subToolbar: {
			resetResponsiveToolbar: jest.fn(),
			_showBalloon: jest.fn(),
			hide: jest.fn(),
			show: jest.fn(),
			_balloonOffset: { top: 0, left: 0, position: 'top' },
			_setBalloonOffset: jest.fn()
		},

		menu: {
			currentDropdownActiveButton: null,
			currentDropdown: null,
			currentDropdownName: null,
			dropdownOff: jest.fn(),
			_resetMenuPosition: jest.fn(),
			_restoreMenuPosition: jest.fn(),
			_hideAllSubMenu: jest.fn(),
			_getMenuButtonElement: jest.fn().mockReturnValue(null)
		},

		viewer: {
			_codeViewAutoHeight: jest.fn(),
			_scrollLineNumbers: jest.fn(),
			_resetFullScreenHeight: jest.fn().mockReturnValue(false)
		},

		nodeTransform: {
			createNestedNode: jest.fn().mockReturnValue({
				parent: document.createElement('div'),
				inner: document.createElement('span')
			})
		},

		// Event system
		eventManager: null, // Will be set after mockEditor is complete

		// Additional properties needed by EventManager
		scrollparents: [],
		triggerEvent: jest.fn(),
		_callPluginEvent: jest.fn().mockReturnValue(undefined),
		_dataTransferAction: jest.fn().mockReturnValue(undefined),
		applyTagEffect: jest.fn(),
		_handledInBefore: false,
		isComposing: false,
		_onShortcutKey: false,
		_setDefaultLine: jest.fn(),

		// Editor object
		editor: {
			selectMenuOn: false,
			isBalloon: false,
			isSubBalloon: false
		},
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

		// Make core modules available at editor level for CoreInjector
		component: {
			is: jest.fn().mockReturnValue(false),
			get: jest.fn().mockReturnValue(null),
			select: jest.fn(),
			deselect: jest.fn(),
			__deselect: jest.fn(),
			__prevent: false,
			__selectionSelected: false
		},

		selection: {
			getNode: jest.fn().mockReturnValue(elements.wysiwyg.firstChild),
			setRange: jest.fn(),
			getRange: jest.fn().mockReturnValue(document.createRange()),
			getDragEventLocationRange: jest.fn().mockReturnValue({
				sc: elements.wysiwyg.firstChild,
				so: 0,
				ec: elements.wysiwyg.firstChild,
				eo: 0
			}),
			_init: jest.fn(),
			scrollTo: jest.fn(),
			__iframeFocus: false
		},

		ui: {
			showLoading: jest.fn(),
			hideLoading: jest.fn(),
			_offCurrentController: jest.fn(),
			_closeAlignMenu: jest.fn(),
			enableBackWrapper: jest.fn(),
			disableBackWrapper: jest.fn(),
			_offCurrentModal: jest.fn()
		},

		// Editor actions
		focus: jest.fn(),
		blur: jest.fn(),
		_nativeFocus: jest.fn(),
		changeFrameContext: jest.fn(),
		focusEdge: jest.fn(),
		_checkComponents: jest.fn(),
		_resourcesStateChange: jest.fn(),
		applyCommandTargets: jest.fn((command, callback) => {
			const targets = commandTargets.get(command);
			if (targets) {
				targets.forEach(callback);
			}
		}),
		applyFrameRoots: jest.fn((callback) => {
			frameRoots.forEach((root) => callback(root));
		}),
		execCommand: jest.fn(),
		runFromTarget: jest.fn(),
		_checkComponents: jest.fn(),
		_resourcesStateChange: jest.fn(),
		_iframeAutoHeight: jest.fn(),
		__callResizeFunction: jest.fn(),

		// File manager
		_fileManager: {
			pluginRegExp: /^(image|video|audio|fileUpload)$/
		},

		// Controller state
		currentControllerName: 'test',
		opendControllers: [],
		opendBrowser: null,
		_controllerTargetContext: null,

		// Editor modes
		isBalloon: false,
		isSubBalloon: false,
		isInline: false,
		isBalloonAlways: false,
		isSubBalloonAlways: false,

		// Editor flags
		_notHideToolbar: false,
		_preventBlur: false,
		_preventFocus: false,
		_preventSelection: false,

		// Line breakers
		_lineBreaker_t: elements.lineBreaker_t,
		_lineBreaker_b: elements.lineBreaker_b,

		// Code view
		_codeViewDisabledButtons: []
	};

	// Create eventManager with both CoreInjector and ClassInjector properties
	mockEditor.eventManager = {
		// Basic eventManager methods
		applyTagEffect: jest.fn(),
		addEvent: jest.fn(),
		removeEvent: jest.fn(),

		// EventManager specific properties
		scrollparents: [],

		// Simulate CoreInjector properties
		editor: mockEditor,
		instanceCheck: mockEditor.instanceCheck,
		history: mockEditor.history,
		events: mockEditor.events,
		triggerEvent: mockEditor.triggerEvent,
		carrierWrapper: mockEditor.carrierWrapper,
		plugins: mockEditor.plugins,
		status: mockEditor.status,
		frameContext: mockEditor.frameContext,
		frameOptions: mockEditor.frameOptions,
		context: mockEditor.context,
		options: mockEditor.options,
		icons: mockEditor.icons,
		lang: mockEditor.lang,
		frameRoots: mockEditor.frameRoots,
		_w: mockEditor._w,
		_d: mockEditor._d,

		// Simulate ClassInjector properties - these are the critical missing ones!
		toolbar: mockEditor.toolbar,
		subToolbar: mockEditor.subToolbar,
		char: mockEditor.char,
		component: mockEditor.component,
		format: mockEditor.format,
		html: mockEditor.html,
		menu: mockEditor.menu,
		nodeTransform: mockEditor.nodeTransform,
		offset: mockEditor.offset,
		selection: mockEditor.selection,
		shortcuts: mockEditor.shortcuts,
		ui: mockEditor.ui,
		viewer: mockEditor.viewer,

		// EventManager specific properties
		scrollparents: []
	};

	return mockEditor;
}

/**
 * Creates a mock 'this' context for event handlers and other methods
 */
export function createMockThis(editor = null, customProps = {}) {
	const mockEditor = editor || createMockEditor();

	return {
		editor: mockEditor,
		frameContext: mockEditor.frameContext,
		frameRoots: mockEditor.frameRoots,
		frameOptions: mockEditor.frameOptions,
		options: mockEditor.options,
		carrierWrapper: mockEditor.carrierWrapper,
		_w: window,

		// Direct access to modules
		selection: mockEditor.selection,
		component: mockEditor.component,
		format: mockEditor.format,
		html: mockEditor.html,
		char: mockEditor.char,
		history: mockEditor.history,
		ui: mockEditor.ui,
		toolbar: mockEditor.toolbar,
		subToolbar: mockEditor.subToolbar,
		menu: mockEditor.menu,
		viewer: mockEditor.viewer,
		nodeTransform: mockEditor.nodeTransform,
		context: mockEditor.context,
		status: mockEditor.status,
		plugins: mockEditor.plugins,

		// Event manager specific properties
		isComposing: false,
		scrollparents: [],
		_events: [],
		_onButtonsCheck: new RegExp(`^(${Object.keys(mockEditor.options.get('_defaultStyleTagMap')).join('|')})$`, 'i'),
		_onShortcutKey: false,
		_handledInBefore: false,
		_balloonDelay: null,
		_wwFrameObserver: null,
		_toolbarObserver: null,
		_lineBreakComp: null,
		_formatAttrsTemp: null,
		_resizeClientY: 0,
		__resize_editor: null,
		__close_move: null,
		__geckoActiveEvent: null,
		__cacheStyleNodes: [],
		__selectionSyncEvent: null,
		_inputFocus: false,
		__inputPlugin: null,
		__inputBlurEvent: null,
		__inputKeyEvent: null,
		__focusTemp: mockEditor.carrierWrapper.querySelector('.__se__focus__temp__'),
		__retainTimer: null,
		__eventDoc: null,
		__secopy: null,

		// Event manager methods
		addEvent: jest.fn(),
		removeEvent: jest.fn(),
		addGlobalEvent: jest.fn(),
		removeGlobalEvent: jest.fn(),
		applyTagEffect: jest.fn(),
		triggerEvent: mockEditor.triggerEvent,
		_dataTransferAction: jest.fn().mockResolvedValue(false),
		_setClipboardData: jest.fn(),
		_setDefaultLine: jest.fn(),
		_toggleToolbarBalloon: jest.fn(),
		_showToolbarBalloonDelay: jest.fn(),
		_hideToolbar: jest.fn(),
		_hideToolbar_sub: jest.fn(),
		_isNonFocusNode: jest.fn().mockReturnValue(false),
		_moveContainer: jest.fn(),
		_scrollContainer: jest.fn(),
		__rePositionController: jest.fn(),
		_resetFrameStatus: jest.fn(),
		_setSelectionSync: jest.fn(),
		_retainStyleNodes: jest.fn(),
		_clearRetainStyleNodes: jest.fn(),
		_callPluginEvent: jest.fn(),
		_overComponentSelect: jest.fn(),
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
 * Creates a hybrid editor context that can work with both mocks and real instances
 */
export function createHybridEditor(realEditor = null, mockOverrides = {}) {
	if (realEditor) {
		// If we have a real editor, enhance it with mock capabilities for testing
		const mockThis = createMockThis(null, mockOverrides);

		// Merge real editor properties with mock enhancements
		return {
			...realEditor,
			// Add mock methods for testing while preserving real functionality
			_testMocks: mockThis,
			// Helper to get either real or mock version of properties
			getMock: (property) => mockThis[property],
			getRealOrMock: (property) => realEditor[property] || mockThis[property]
		};
	} else {
		// Fall back to pure mock
		return createMockEditor(mockOverrides);
	}
}

/**
 * Bridge function to create test context that works with real Editor instances
 */
export function createTestContext(editor) {
	const frameContext = editor.currentFrame || editor.frameContext;
	const elements = {
		wysiwyg: frameContext?.get('wysiwyg') || editor.context?.get('wysiwyg'),
		codeArea: frameContext?.get('code') || editor.context?.get('code'),
		wrapper: frameContext?.get('wrapper') || editor.context?.get('wrapper'),
		topArea: frameContext?.get('topArea') || editor.context?.get('topArea'),
		statusbar: frameContext?.get('statusbar') || editor.context?.get('statusbar')
	};

	return {
		editor,
		frameContext,
		elements,
		// Utility to trigger real events on real DOM elements
		dispatchRealEvent: (element, event) => {
			if (element && typeof element.dispatchEvent === 'function') {
				return element.dispatchEvent(event);
			}
			return false;
		},
		// Utility to create real DOM events
		createRealEvent: (type, options = {}) => {
			switch (type) {
				case 'keydown':
				case 'keyup':
					return new KeyboardEvent(type, options);
				case 'input':
				case 'beforeinput':
					return new InputEvent(type, options);
				case 'click':
				case 'mousedown':
				case 'mouseup':
				case 'mousemove':
				case 'mouseleave':
					return new MouseEvent(type, options);
				case 'dragover':
				case 'dragend':
				case 'drop':
					return new DragEvent(type, options);
				case 'paste':
				case 'copy':
				case 'cut':
					return new ClipboardEvent(type, options);
				default:
					return new Event(type, options);
			}
		}
	};
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
	createHybridEditor,
	createTestContext,
	waitForEditor
};
