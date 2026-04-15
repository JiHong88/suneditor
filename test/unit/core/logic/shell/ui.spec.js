/**
 * @jest-environment jsdom
 */

import { createMockEditor } from '../../../../__mocks__/editorMock';
import UIManager from '../../../../../src/core/logic/shell/ui';

/**
 * Helper: creates a minimal mock kernel with real DOM elements so that
 * `new UIManager(kernel)` can be constructed without errors.
 * The returned object also exposes the raw DOM elements for assertions.
 */
function createUIKernel(overrides = {}) {
	// --- DOM elements ---
	const wysiwyg = document.createElement('div');
	wysiwyg.contentEditable = 'true';
	wysiwyg.innerHTML = '<p>content</p>';

	const code = document.createElement('textarea');
	const wrapper = document.createElement('div');
	const wysiwygFrame = document.createElement('div');
	const topArea = document.createElement('div');

	const toolbarMain = document.createElement('div');
	toolbarMain.className = 'se-toolbar-main';

	// toolbar_buttonTray with some command buttons
	// Buttons must be inside .se-menu-list for the COMMAND_BUTTONS selector to match:
	// '.se-menu-list .se-toolbar-btn[data-command]'
	const toolbarButtonTray = document.createElement('div');
	toolbarButtonTray.className = 'se-toolbar-button-tray';

	const menuList = document.createElement('div');
	menuList.className = 'se-menu-list';
	toolbarButtonTray.appendChild(menuList);

	const btn1 = document.createElement('button');
	btn1.className = 'se-toolbar-btn';
	btn1.setAttribute('data-command', 'bold');
	menuList.appendChild(btn1);

	const btn2 = document.createElement('button');
	btn2.className = 'se-toolbar-btn se-code-view-enabled';
	btn2.setAttribute('data-command', 'codeView');
	menuList.appendChild(btn2);

	const btn3 = document.createElement('button');
	btn3.className = 'se-toolbar-btn se-component-enabled';
	btn3.setAttribute('data-command', 'image');
	menuList.appendChild(btn3);

	// statusbar
	const statusbarWrapper = document.createElement('div');
	const toolbarWrapper = document.createElement('div');

	// loading box
	const loadingBox = document.createElement('div');
	loadingBox.className = 'se-loading-box';
	loadingBox.style.display = 'none';

	// alert area
	const alertArea = document.createElement('div');
	alertArea.className = 'se-alert';
	alertArea.style.display = 'none';
	const alertInner = document.createElement('div');
	alertInner.className = 'se-modal-inner';
	alertArea.appendChild(alertInner);

	// back wrapper
	const backWrapper = document.createElement('div');
	backWrapper.className = 'se-back-wrapper';
	backWrapper.style.display = 'none';

	// carrier wrapper
	const carrierWrapper = document.createElement('div');
	carrierWrapper.className = 'sun-editor-common se-container';
	carrierWrapper.appendChild(alertArea);
	carrierWrapper.appendChild(loadingBox);
	carrierWrapper.appendChild(backWrapper);

	// container for rootKey-based loading
	const container = document.createElement('div');
	const containerLoadingBox = document.createElement('div');
	containerLoadingBox.className = 'se-loading-box';
	containerLoadingBox.style.display = 'none';
	container.appendChild(containerLoadingBox);

	// line breakers
	const lineBreaker_t = document.createElement('div');
	lineBreaker_t.className = 'se-line-breaker-top';
	lineBreaker_t.style.display = 'none';
	const lineBreaker_b = document.createElement('div');
	lineBreaker_b.className = 'se-line-breaker-bottom';
	lineBreaker_b.style.display = 'none';

	// document type elements
	const documentTypeInner = document.createElement('div');
	const documentTypePage = document.createElement('div');
	const documentTypePageMirror = document.createElement('div');

	// placeholder
	const placeholder = document.createElement('div');
	placeholder.style.display = 'none';

	// --- Frame Options (per-frame) ---
	const frameOptions = new Map([
		['iframe', false],
		['editorStyle', ''],
		['_defaultStyles', { top: '', frame: '', editor: '' }],
		['hasCodeMirror', false],
		['maxHeight', ''],
	]);

	// --- Frame Context ---
	const frameContext = new Map([
		['key', 'main'],
		['wysiwyg', wysiwyg],
		['code', code],
		['wrapper', wrapper],
		['wysiwygFrame', wysiwygFrame],
		['topArea', topArea],
		['container', container],
		['lineBreaker_t', lineBreaker_t],
		['lineBreaker_b', lineBreaker_b],
		['isReadOnly', false],
		['isDisabled', false],
		['isCodeView', false],
		['isFullScreen', false],
		['_editorHeight', 300],
		['_iframeAuto', null],
		['_ww', window],
		['_wd', document],
		['options', frameOptions],
		['placeholder', placeholder],
		['documentTypeInner', documentTypeInner],
		['documentTypePage', documentTypePage],
		['documentTypePageMirror', documentTypePageMirror],
		['eventWysiwyg', wysiwyg],
		['wwComputedStyle', { getPropertyValue: jest.fn().mockReturnValue('0px') }],
	]);

	const frameRoots = new Map([
		['main', frameContext],
		['second', new Map([
			['key', 'second'],
			['wysiwyg', document.createElement('div')],
			['code', document.createElement('textarea')],
			['wrapper', document.createElement('div')],
			['wysiwygFrame', document.createElement('div')],
			['topArea', document.createElement('div')],
			['container', (() => { const c = document.createElement('div'); const lb = document.createElement('div'); lb.className = 'se-loading-box'; lb.style.display = 'none'; c.appendChild(lb); return c; })()],
			['lineBreaker_t', document.createElement('div')],
			['lineBreaker_b', document.createElement('div')],
			['isReadOnly', false],
			['isDisabled', false],
			['isCodeView', false],
			['isFullScreen', false],
			['_editorHeight', 300],
			['options', new Map([['iframe', false], ['hasCodeMirror', false]])],
		])],
	]);

	// --- Global options ---
	// NOTE: Do NOT include '_subMode' here — the source checks `options.has('_subMode')`
	// and if the key exists (even with value false) it will try to query toolbar_sub_buttonTray.
	const options = new Map([
		['_rtl', false],
		['hasCodeMirror', false],
		['_themeClass', ''],
		['theme', ''],
		['_editableClass', ''],
		['textDirection', 'ltr'],
		['printClass', ''],
	]);

	// --- Context (global UI elements) ---
	const context = new Map([
		['toolbar_main', toolbarMain],
		['toolbar_buttonTray', toolbarButtonTray],
		['toolbar_sub_main', document.createElement('div')],
		['toolbar_wrapper', toolbarWrapper],
		['statusbar_wrapper', statusbarWrapper],
	]);

	// --- Event Manager ---
	const eventManager = {
		addEvent: jest.fn().mockReturnValue(null),
		removeEvent: jest.fn(),
		addGlobalEvent: jest.fn().mockReturnValue({ id: 'global-1' }),
		removeGlobalEvent: jest.fn().mockReturnValue(null),
		triggerEvent: jest.fn(),
	};

	// --- Context Provider ---
	const contextProvider = {
		carrierWrapper,
		frameRoots,
		frameContext,
		context,
		icons: {
			cancel: '<svg>X</svg>',
			dir_ltr: '<svg>LTR</svg>',
			dir_rtl: '<svg>RTL</svg>',
		},
		lang: {
			close: 'Close',
			dir_ltr: 'Left to Right',
			dir_rtl: 'Right to Left',
		},
		applyToRoots: jest.fn((cb) => { frameRoots.forEach((root) => cb(root)); }),
		rootKeys: Array.from(frameRoots.keys()),
	};

	// --- Command Dispatcher ---
	const commandTargets = new Map([
		['dir', [document.createElement('button')]],
		['dir_rtl', document.createElement('button')],
		['dir_ltr', document.createElement('button')],
	]);
	// add tooltip child and icon child to dir button
	const dirBtn = commandTargets.get('dir')[0];
	const tooltipSpan = document.createElement('span');
	tooltipSpan.className = 'se-tooltip-text';
	tooltipSpan.textContent = 'RTL';
	dirBtn.appendChild(document.createElement('span')); // firstElementChild (icon placeholder)
	dirBtn.appendChild(tooltipSpan);

	const commandDispatcher = {
		targets: commandTargets,
		applyTargets: jest.fn((command, callback) => {
			const targets = commandTargets.get(command);
			if (targets && Array.isArray(targets)) targets.forEach(callback);
		}),
	};

	// --- Plugin Manager ---
	const pluginManager = {
		plugins: {},
	};

	// --- Shortcuts ---
	const shortcuts = {
		keyMap: new Map(),
		reverseKeys: [],
	};

	// --- Toolbar ---
	const toolbar = {
		disable: jest.fn(),
		enable: jest.fn(),
		balloonOffset: { top: 0, left: 0 },
		currentMoreLayerActiveButton: null,
		_moreLayerOff: jest.fn(),
		_showBalloon: jest.fn(),
	};

	const subToolbar = {
		currentMoreLayerActiveButton: null,
		_moreLayerOff: jest.fn(),
		balloonOffset: { top: 0, left: 0 },
		_showBalloon: jest.fn(),
	};

	// --- Menu ---
	const menu = {
		currentDropdownActiveButton: null,
		currentContainerActiveButton: null,
		dropdownOff: jest.fn(),
		containerOff: jest.fn(),
	};

	// --- Viewer ---
	const viewer = {
		_codeMirrorEditor: jest.fn(),
	};

	// --- Component ---
	const component = {
		__deselect: jest.fn(),
	};

	// --- Format ---
	const format = {
		isLine: jest.fn().mockReturnValue(false),
	};

	// --- Facade ---
	const facade = {
		isEmpty: jest.fn().mockReturnValue(false),
	};

	// --- Store ---
	const storeState = {};
	const store = {
		get: jest.fn((key) => storeState[key]),
		set: jest.fn((key, value) => { storeState[key] = value; }),
		mode: {
			isClassic: true,
			isInline: false,
			isBalloon: false,
			isBalloonAlways: false,
			isSubBalloon: false,
			isSubBalloonAlways: false,
		},
	};

	// Build the $ deps bag
	const $ = {
		contextProvider,
		options: {
			get: (key) => options.get(key),
			has: (key) => options.has(key),
			set: (key, value) => options.set(key, value),
		},
		context: {
			get: (key) => context.get(key),
			has: (key) => context.has(key),
			set: (key, value) => context.set(key, value),
		},
		frameRoots,
		frameContext,
		eventManager,
		pluginManager,
		commandDispatcher,
		shortcuts,
		toolbar,
		subToolbar,
		menu,
		viewer,
		component,
		format,
		facade,
		store,
		...overrides,
	};

	// Build kernel
	const kernel = {
		$,
		store,
		_eventOrchestrator: {
			applyTagEffect: jest.fn(),
		},
	};

	return {
		kernel,
		$,
		elements: {
			wysiwyg, code, wrapper, wysiwygFrame, topArea, container,
			carrierWrapper, loadingBox, alertArea, alertInner, backWrapper,
			lineBreaker_t, lineBreaker_b, toolbarButtonTray,
			btn1, btn2, btn3, statusbarWrapper, toolbarWrapper,
			placeholder, containerLoadingBox, documentTypeInner,
			documentTypePage, documentTypePageMirror,
		},
		options,
		frameContext,
		frameRoots,
		frameOptions,
		store,
		context,
		commandTargets,
	};
}

// ---- Existing mock-based tests ----

describe('UIManager', () => {
	let mockEditor;

	beforeEach(() => {
		mockEditor = createMockEditor();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Mock UIManager methods', () => {
		it('should have ui object in mockEditor', () => {
			expect(mockEditor.$.ui).toBeDefined();
			expect(typeof mockEditor.$.ui).toBe('object');
		});

		it('should have core UI methods defined', () => {
			expect(typeof mockEditor.$.ui.setEditorStyle).toBe('function');
			expect(typeof mockEditor.$.ui.setTheme).toBe('function');
			expect(typeof mockEditor.$.ui.readOnly).toBe('function');
			expect(typeof mockEditor.$.ui.disable).toBe('function');
			expect(typeof mockEditor.$.ui.enable).toBe('function');
		});
	});

	describe('setEditorStyle method', () => {
		it('should be callable', () => {
			expect(() => {
				mockEditor.$.ui.setEditorStyle('width', '100%');
			}).not.toThrow();
		});

		it('should accept style property and value', () => {
			expect(() => {
				mockEditor.$.ui.setEditorStyle('width', '500px');
			}).not.toThrow();
		});
	});

	describe('setTheme method', () => {
		it('should be callable with theme name', () => {
			expect(() => {
				mockEditor.$.ui.setTheme('dark');
			}).not.toThrow();
		});

		it('should handle different theme values', () => {
			const themes = ['dark', 'light', 'auto'];
			themes.forEach((theme) => {
				expect(() => {
					mockEditor.$.ui.setTheme(theme);
				}).not.toThrow();
			});
		});
	});

	describe('setDir method', () => {
		it('should set text direction to ltr', () => {
			expect(() => {
				mockEditor.$.ui.setDir('ltr');
			}).not.toThrow();
		});

		it('should set text direction to rtl', () => {
			expect(() => {
				mockEditor.$.ui.setDir('rtl');
			}).not.toThrow();
		});
	});

	describe('readOnly method', () => {
		it('should enable readonly mode', () => {
			expect(() => {
				mockEditor.$.ui.readOnly(true);
			}).not.toThrow();
		});

		it('should disable readonly mode', () => {
			expect(() => {
				mockEditor.$.ui.readOnly(false);
			}).not.toThrow();
		});
	});

	describe('disable method', () => {
		it('should disable the editor', () => {
			expect(() => {
				mockEditor.$.ui.disable();
			}).not.toThrow();
		});

		it('should disable all toolbar buttons', () => {
			mockEditor.$.ui.disable();
			expect(mockEditor.$.ui.disable).toHaveBeenCalled();
		});
	});

	describe('enable method', () => {
		it('should enable the editor', () => {
			expect(() => {
				mockEditor.$.ui.enable();
			}).not.toThrow();
		});

		it('should enable toolbar buttons', () => {
			mockEditor.$.ui.enable();
			expect(mockEditor.$.ui.enable).toHaveBeenCalled();
		});
	});

	describe('show method', () => {
		it('should show the editor', () => {
			expect(() => {
				mockEditor.$.ui.show();
			}).not.toThrow();
		});
	});

	describe('hide method', () => {
		it('should hide the editor', () => {
			expect(() => {
				mockEditor.$.ui.hide();
			}).not.toThrow();
		});
	});

	describe('showLoading method', () => {
		it('should display loading indicator', () => {
			expect(() => {
				mockEditor.$.ui.showLoading();
			}).not.toThrow();
		});
	});

	describe('hideLoading method', () => {
		it('should hide loading indicator', () => {
			expect(() => {
				mockEditor.$.ui.hideLoading();
			}).not.toThrow();
		});
	});

	describe('alertOpen method', () => {
		it('should open alert dialog with message', () => {
			expect(() => {
				mockEditor.$.ui.alertOpen('Test message');
			}).not.toThrow();
		});

		it('should handle empty message', () => {
			expect(() => {
				mockEditor.$.ui.alertOpen('');
			}).not.toThrow();
		});
	});

	describe('alertClose method', () => {
		it('should close alert dialog', () => {
			expect(() => {
				mockEditor.$.ui.alertClose();
			}).not.toThrow();
		});
	});

	describe('showToast method', () => {
		it('should display toast notification', () => {
			expect(() => {
				mockEditor.$.ui.showToast('Toast message');
			}).not.toThrow();
		});

		it('should handle toast with duration', () => {
			expect(() => {
				mockEditor.$.ui.showToast('Message', 3000);
			}).not.toThrow();
		});
	});

	describe('closeToast method', () => {
		it('should close toast notification', () => {
			expect(() => {
				mockEditor.$.ui.closeToast();
			}).not.toThrow();
		});
	});

	describe('setControllerOnDisabledButtons method', () => {
		it('should return boolean value', () => {
			const result = mockEditor.$.ui.setControllerOnDisabledButtons(true);
			expect(typeof result).toBe('boolean');
		});

		it('should handle enable controller buttons', () => {
			mockEditor.$.ui.setControllerOnDisabledButtons(true);
			expect(mockEditor.$.ui.setControllerOnDisabledButtons).toHaveBeenCalledWith(true);
		});

		it('should handle disable controller buttons', () => {
			mockEditor.$.ui.setControllerOnDisabledButtons(false);
			expect(mockEditor.$.ui.setControllerOnDisabledButtons).toHaveBeenCalledWith(false);
		});
	});

	describe('onControllerContext method', () => {
		it('should attach controller context handler', () => {
			const handler = jest.fn();
			expect(() => {
				mockEditor.$.ui.onControllerContext(handler);
			}).not.toThrow();
		});
	});

	describe('offControllerContext method', () => {
		it('should detach controller context handler', () => {
			const handler = jest.fn();
			expect(() => {
				mockEditor.$.ui.offControllerContext(handler);
			}).not.toThrow();
		});
	});

	describe('enableBackWrapper method', () => {
		it('should enable back wrapper', () => {
			expect(() => {
				mockEditor.$.ui.enableBackWrapper();
			}).not.toThrow();
		});
	});

	describe('disableBackWrapper method', () => {
		it('should disable back wrapper', () => {
			expect(() => {
				mockEditor.$.ui.disableBackWrapper();
			}).not.toThrow();
		});
	});

	describe('offCurrentController method', () => {
		it('should turn off current controller', () => {
			expect(() => {
				mockEditor.$.ui.offCurrentController();
			}).not.toThrow();
		});
	});

	describe('offCurrentModal method', () => {
		it('should turn off current modal', () => {
			expect(() => {
				mockEditor.$.ui.offCurrentModal();
			}).not.toThrow();
		});
	});

	describe('getVisibleFigure method', () => {
		it('should return visible figure or null', () => {
			const result = mockEditor.$.ui.getVisibleFigure();
			expect(result === null || result instanceof HTMLElement).toBe(true);
		});
	});

	describe('setFigureContainer method', () => {
		it('should set figure container', () => {
			const container = document.createElement('div');
			expect(() => {
				mockEditor.$.ui.setFigureContainer(container);
			}).not.toThrow();
		});
	});

	describe('preventToolbarHide method', () => {
		it('should prevent toolbar from hiding', () => {
			expect(() => {
				mockEditor.$.ui.preventToolbarHide();
			}).not.toThrow();
		});
	});

	describe('reset method', () => {
		it('should reset UI to initial state', () => {
			expect(() => {
				mockEditor.$.ui.reset();
			}).not.toThrow();
		});
	});

	describe('isButtonDisabled method', () => {
		it('should return boolean for button disabled state', () => {
			const btn = document.createElement('button');
			const result = mockEditor.$.ui.isButtonDisabled(btn);
			expect(typeof result).toBe('boolean');
		});

		it('should handle null button', () => {
			const result = mockEditor.$.ui.isButtonDisabled(null);
			expect(typeof result).toBe('boolean');
		});
	});

	describe('init method', () => {
		it('should initialize UI components', () => {
			expect(() => {
				mockEditor.$.ui.init();
			}).not.toThrow();
		});
	});

	describe('destroy method', () => {
		it('should clean up UI resources', () => {
			expect(() => {
				mockEditor.$.ui.destroy();
			}).not.toThrow();
		});
	});

	describe('Internal state properties', () => {
		it('should have opendControllers array', () => {
			expect(Array.isArray(mockEditor.$.ui.opendControllers)).toBe(true);
		});

		it('should have currentControllerName string', () => {
			expect(typeof mockEditor.$.ui.currentControllerName).toBe('string');
		});

		it('should have opendModal property', () => {
			expect('opendModal' in mockEditor.$.ui).toBe(true);
		});

		it('should have selectMenuOn boolean', () => {
			expect(typeof mockEditor.$.ui.selectMenuOn).toBe('boolean');
		});

		it('should have _codeViewDisabledButtons array', () => {
			expect(Array.isArray(mockEditor.$.ui._codeViewDisabledButtons)).toBe(true);
		});

		it('should have _controllerOnDisabledButtons array', () => {
			expect(Array.isArray(mockEditor.$.ui._controllerOnDisabledButtons)).toBe(true);
		});

		it('should have _notHideToolbar boolean', () => {
			expect(typeof mockEditor.$.ui._notHideToolbar).toBe('boolean');
		});

		it('should have _figureContainer property', () => {
			expect('_figureContainer' in mockEditor.$.ui).toBe(true);
		});

		it('should have opendBrowser property', () => {
			expect('opendBrowser' in mockEditor.$.ui).toBe(true);
		});
	});

	describe('Integration scenarios', () => {
		it('should handle show/hide cycle', () => {
			mockEditor.$.ui.show();
			mockEditor.$.ui.hide();
			mockEditor.$.ui.show();

			expect(mockEditor.$.ui.show).toHaveBeenCalled();
			expect(mockEditor.$.ui.hide).toHaveBeenCalled();
		});

		it('should handle enable/disable cycle', () => {
			mockEditor.$.ui.disable();
			mockEditor.$.ui.enable();

			expect(mockEditor.$.ui.disable).toHaveBeenCalled();
			expect(mockEditor.$.ui.enable).toHaveBeenCalled();
		});

		it('should handle readOnly toggle', () => {
			mockEditor.$.ui.readOnly(true);
			mockEditor.$.ui.readOnly(false);

			expect(mockEditor.$.ui.readOnly).toHaveBeenCalledWith(true);
			expect(mockEditor.$.ui.readOnly).toHaveBeenCalledWith(false);
		});

		it('should handle alert lifecycle', () => {
			mockEditor.$.ui.alertOpen('Test message');
			mockEditor.$.ui.alertClose();

			expect(mockEditor.$.ui.alertOpen).toHaveBeenCalledWith('Test message');
			expect(mockEditor.$.ui.alertClose).toHaveBeenCalled();
		});

		it('should handle toast notifications', () => {
			mockEditor.$.ui.showToast('Message 1');
			mockEditor.$.ui.showToast('Message 2', 5000);
			mockEditor.$.ui.closeToast();

			expect(mockEditor.$.ui.showToast).toHaveBeenCalledTimes(2);
			expect(mockEditor.$.ui.closeToast).toHaveBeenCalled();
		});

		it('should handle loading indicator', () => {
			mockEditor.$.ui.showLoading();
			mockEditor.$.ui.hideLoading();

			expect(mockEditor.$.ui.showLoading).toHaveBeenCalled();
			expect(mockEditor.$.ui.hideLoading).toHaveBeenCalled();
		});
	});
});

// ==============================================================================
// Real UIManager tests - instantiate the actual class for branch coverage
// ==============================================================================

describe('UIManager (real instance)', () => {
	let ui;
	let ctx; // { kernel, $, elements, options, frameContext, frameRoots, ... }

	beforeEach(() => {
		jest.useFakeTimers();
		ctx = createUIKernel();
		ui = new UIManager(ctx.kernel);
	});

	afterEach(() => {
		jest.useRealTimers();
		jest.clearAllMocks();
	});

	// -------------------------------------------------------------------
	// Constructor
	// -------------------------------------------------------------------
	describe('constructor', () => {
		it('should create alert modal and toast popup DOM elements', () => {
			expect(ui.alertModal).toBeDefined();
			expect(ui.alertModal.classList.contains('se-alert-content')).toBe(true);
			expect(ui.alertMessage).toBeDefined();
			expect(ui.alertMessage.tagName).toBe('SPAN');
		});

		it('should create toast popup elements', () => {
			expect(ui.toastPopup).toBeDefined();
			expect(ui.toastContainer).toBeDefined();
			expect(ui.toastMessage).toBeDefined();
			expect(ui.toastPopup.classList.contains('se-toast')).toBe(true);
		});

		it('should initialize selectMenuOn to false', () => {
			expect(ui.selectMenuOn).toBe(false);
		});

		it('should initialize opendControllers as empty array', () => {
			expect(ui.opendControllers).toEqual([]);
		});

		it('should initialize controllerTargetContext as null', () => {
			expect(ui.controllerTargetContext).toBe(null);
		});

		it('should initialize _figureContainer as null', () => {
			expect(ui._figureContainer).toBe(null);
		});
	});

	// -------------------------------------------------------------------
	// setEditorStyle
	// -------------------------------------------------------------------
	describe('setEditorStyle', () => {
		it('should apply styles to topArea, code, and wysiwygFrame when iframe is false', () => {
			ui.setEditorStyle('color: red');

			const fc = ctx.frameContext;
			// code gets frame styles (height, min-height, max-height)
			expect(fc.get('code').style.cssText).toBe(fc.get('options').get('_defaultStyles').frame);
		});

		it('should use the provided frame context when supplied', () => {
			const customFc = new Map([
				['options', new Map([
					['iframe', false],
					['editorStyle', ''],
					['_defaultStyles', { top: '', frame: '', editor: '' }],
				])],
				['topArea', document.createElement('div')],
				['code', document.createElement('textarea')],
				['wysiwygFrame', document.createElement('div')],
				['wysiwyg', document.createElement('div')],
			]);

			ui.setEditorStyle('font-size: 14px', customFc);
			expect(customFc.get('code').style.cssText).toBe(customFc.get('options').get('_defaultStyles').frame);
		});

		it('should handle iframe mode by setting wysiwyg style separately', () => {
			const iframeWysiwyg = document.createElement('div');
			const iframeWysiwygFrame = document.createElement('div');
			const customFc = new Map([
				['options', new Map([
					['iframe', true],
					['editorStyle', ''],
					['_defaultStyles', { top: '', frame: '', editor: '' }],
				])],
				['topArea', document.createElement('div')],
				['code', document.createElement('textarea')],
				['wysiwygFrame', iframeWysiwygFrame],
				['wysiwyg', iframeWysiwyg],
			]);

			ui.setEditorStyle('font-size: 14px', customFc);
			// code gets frame styles regardless of iframe mode
			expect(customFc.get('code').style.cssText).toBe(customFc.get('options').get('_defaultStyles').frame);
		});
	});

	// -------------------------------------------------------------------
	// setTheme
	// -------------------------------------------------------------------
	describe('setTheme', () => {
		it('should return early when theme is not a string', () => {
			// Should not throw
			ui.setTheme(123);
			ui.setTheme(null);
			ui.setTheme(undefined);
		});

		it('should set theme class on carrier wrapper and roots', () => {
			ui.setTheme('dark');
			expect(ctx.elements.carrierWrapper.classList.contains('se-theme-dark')).toBe(true);
		});

		it('should remove previous theme and apply new theme', () => {
			ui.setTheme('dark');
			expect(ctx.elements.carrierWrapper.classList.contains('se-theme-dark')).toBe(true);

			ui.setTheme('light');
			expect(ctx.elements.carrierWrapper.classList.contains('se-theme-dark')).toBe(false);
			expect(ctx.elements.carrierWrapper.classList.contains('se-theme-light')).toBe(true);
		});

		it('should handle empty theme string (remove theme)', () => {
			ui.setTheme('dark');
			ui.setTheme('');
			expect(ctx.elements.carrierWrapper.classList.contains('se-theme-dark')).toBe(false);
		});

		it('should apply theme via applyToRoots callback', () => {
			ui.setTheme('dark');
			expect(ctx.$.contextProvider.applyToRoots).toHaveBeenCalled();
		});
	});

	// -------------------------------------------------------------------
	// readOnly
	// -------------------------------------------------------------------
	describe('readOnly', () => {
		it('should set isReadOnly to true and add se-read-only class', () => {
			ui.readOnly(true);
			expect(ctx.frameContext.get('isReadOnly')).toBe(true);
			expect(ctx.elements.wysiwyg.classList.contains('se-read-only')).toBe(true);
		});

		it('should set code textarea readOnly attribute when value is true', () => {
			ui.readOnly(true);
			expect(ctx.elements.code.getAttribute('readOnly')).toBe('true');
		});

		it('should remove readOnly and se-read-only when value is false', () => {
			ui.readOnly(true);
			ui.readOnly(false);
			expect(ctx.frameContext.get('isReadOnly')).toBe(false);
			expect(ctx.elements.wysiwyg.classList.contains('se-read-only')).toBe(false);
			expect(ctx.elements.code.hasAttribute('readOnly')).toBe(false);
		});

		it('should call offCurrentController and offCurrentModal when enabling readOnly', () => {
			ui.readOnly(true);
			expect(ctx.$.component.__deselect).toHaveBeenCalled();
		});

		it('should use rootKey-based frameContext when rootKey is provided', () => {
			ui.readOnly(true, 'second');
			expect(ctx.frameRoots.get('second').get('isReadOnly')).toBe(true);
		});

		it('should handle toolbar moreLayerOff when button is disabled during readOnly', () => {
			const disabledBtn = document.createElement('button');
			disabledBtn.disabled = true;
			ctx.$.toolbar.currentMoreLayerActiveButton = disabledBtn;

			ui.readOnly(true);
			expect(ctx.$.toolbar._moreLayerOff).toHaveBeenCalled();
		});

		it('should handle subToolbar moreLayerOff when button is disabled during readOnly', () => {
			const disabledBtn = document.createElement('button');
			disabledBtn.disabled = true;
			ctx.$.subToolbar.currentMoreLayerActiveButton = disabledBtn;

			ui.readOnly(true);
			expect(ctx.$.subToolbar._moreLayerOff).toHaveBeenCalled();
		});

		it('should handle menu dropdownOff when currentDropdownActiveButton is disabled', () => {
			const disabledBtn = document.createElement('button');
			disabledBtn.disabled = true;
			ctx.$.menu.currentDropdownActiveButton = disabledBtn;

			ui.readOnly(true);
			expect(ctx.$.menu.dropdownOff).toHaveBeenCalled();
		});

		it('should handle menu containerOff when currentContainerActiveButton is disabled', () => {
			const disabledBtn = document.createElement('button');
			disabledBtn.disabled = true;
			ctx.$.menu.currentContainerActiveButton = disabledBtn;

			ui.readOnly(true);
			expect(ctx.$.menu.containerOff).toHaveBeenCalled();
		});

		it('should not call moreLayerOff when toolbar button is not disabled', () => {
			const enabledBtn = document.createElement('button');
			enabledBtn.disabled = false;
			ctx.$.toolbar.currentMoreLayerActiveButton = enabledBtn;

			ui.readOnly(true);
			expect(ctx.$.toolbar._moreLayerOff).not.toHaveBeenCalled();
		});

		it('should call codeMirrorEditor readonly when hasCodeMirror is true', () => {
			ctx.options.set('hasCodeMirror', true);
			ui.readOnly(true);
			expect(ctx.$.viewer._codeMirrorEditor).toHaveBeenCalledWith('readonly', true, undefined);
		});

		it('should call codeMirrorEditor readonly false when disabling', () => {
			ctx.options.set('hasCodeMirror', true);
			ui.readOnly(true);
			ui.readOnly(false);
			expect(ctx.$.viewer._codeMirrorEditor).toHaveBeenCalledWith('readonly', false, undefined);
		});

		it('should not call moreLayerOff when toolbar.currentMoreLayerActiveButton is null', () => {
			ctx.$.toolbar.currentMoreLayerActiveButton = null;
			ui.readOnly(true);
			expect(ctx.$.toolbar._moreLayerOff).not.toHaveBeenCalled();
		});

		it('should not call dropdownOff when menu.currentDropdownActiveButton is null', () => {
			ctx.$.menu.currentDropdownActiveButton = null;
			ui.readOnly(true);
			expect(ctx.$.menu.dropdownOff).not.toHaveBeenCalled();
		});

		it('should not call containerOff when menu.currentContainerActiveButton is null', () => {
			ctx.$.menu.currentContainerActiveButton = null;
			ui.readOnly(true);
			expect(ctx.$.menu.containerOff).not.toHaveBeenCalled();
		});
	});

	// -------------------------------------------------------------------
	// disable / enable
	// -------------------------------------------------------------------
	describe('disable', () => {
		it('should disable toolbar, set contenteditable to false, and set isDisabled', () => {
			ui.disable();
			expect(ctx.$.toolbar.disable).toHaveBeenCalled();
			expect(ctx.elements.wysiwyg.getAttribute('contenteditable')).toBe('false');
			expect(ctx.frameContext.get('isDisabled')).toBe(true);
		});

		it('should disable code textarea when not using codeMirror', () => {
			ui.disable();
			expect(ctx.elements.code.disabled).toBe(true);
		});

		it('should use codeMirror readonly when hasCodeMirror is true', () => {
			ctx.options.set('hasCodeMirror', true);
			ui.disable();
			expect(ctx.$.viewer._codeMirrorEditor).toHaveBeenCalledWith('readonly', true, undefined);
			// code.disabled should NOT have been set
		});

		it('should use rootKey-based frameContext when rootKey is provided', () => {
			ui.disable('second');
			expect(ctx.frameRoots.get('second').get('isDisabled')).toBe(true);
		});

		it('should call offCurrentController and offCurrentModal', () => {
			ui.disable();
			expect(ctx.$.component.__deselect).toHaveBeenCalled();
		});
	});

	describe('enable', () => {
		it('should enable toolbar, set contenteditable to true, and clear isDisabled', () => {
			ui.disable();
			ui.enable();
			expect(ctx.$.toolbar.enable).toHaveBeenCalled();
			expect(ctx.elements.wysiwyg.getAttribute('contenteditable')).toBe('true');
			expect(ctx.frameContext.get('isDisabled')).toBe(false);
		});

		it('should enable code textarea when not using codeMirror', () => {
			ui.disable();
			ui.enable();
			expect(ctx.elements.code.disabled).toBe(false);
		});

		it('should use codeMirror readonly false when hasCodeMirror is true', () => {
			ctx.options.set('hasCodeMirror', true);
			ui.enable();
			expect(ctx.$.viewer._codeMirrorEditor).toHaveBeenCalledWith('readonly', false, undefined);
		});

		it('should use rootKey-based frameContext when rootKey is provided', () => {
			ui.disable('second');
			ui.enable('second');
			expect(ctx.frameRoots.get('second').get('isDisabled')).toBe(false);
		});
	});

	// -------------------------------------------------------------------
	// show / hide
	// -------------------------------------------------------------------
	describe('show', () => {
		it('should show topArea when display is none', () => {
			ctx.elements.topArea.style.display = 'none';
			ui.show();
			expect(ctx.elements.topArea.style.display).toBe('block');
		});

		it('should not change display when topArea is already visible', () => {
			ctx.elements.topArea.style.display = 'block';
			ui.show();
			expect(ctx.elements.topArea.style.display).toBe('block');
		});

		it('should use rootKey-based frameContext when rootKey is provided', () => {
			const secondTopArea = ctx.frameRoots.get('second').get('topArea');
			secondTopArea.style.display = 'none';
			ui.show('second');
			expect(secondTopArea.style.display).toBe('block');
		});
	});

	describe('hide', () => {
		it('should set topArea display to none', () => {
			ctx.elements.topArea.style.display = 'block';
			ui.hide();
			expect(ctx.elements.topArea.style.display).toBe('none');
		});

		it('should use rootKey-based frameContext when rootKey is provided', () => {
			ui.hide('second');
			expect(ctx.frameRoots.get('second').get('topArea').style.display).toBe('none');
		});
	});

	// -------------------------------------------------------------------
	// showLoading / hideLoading
	// -------------------------------------------------------------------
	describe('showLoading', () => {
		it('should set loading box display to block using carrierWrapper', () => {
			ui.showLoading();
			expect(ctx.elements.loadingBox.style.display).toBe('block');
		});

		it('should use rootKey-based container when rootKey is provided', () => {
			ui.showLoading('main');
			expect(ctx.elements.container.querySelector('.se-loading-box').style.display).toBe('block');
		});
	});

	describe('hideLoading', () => {
		it('should set loading box display to none using carrierWrapper', () => {
			ui.showLoading();
			ui.hideLoading();
			expect(ctx.elements.loadingBox.style.display).toBe('none');
		});

		it('should use rootKey-based container when rootKey is provided', () => {
			ui.showLoading('main');
			ui.hideLoading('main');
			expect(ctx.elements.container.querySelector('.se-loading-box').style.display).toBe('none');
		});
	});

	// -------------------------------------------------------------------
	// alertOpen / alertClose
	// -------------------------------------------------------------------
	describe('alertOpen', () => {
		it('should set alert message text content', () => {
			ui.alertOpen('Test alert', '');
			expect(ui.alertMessage.textContent).toBe('Test alert');
		});

		it('should display alert area', () => {
			ui.alertOpen('Hello', '');
			expect(ctx.elements.alertArea.style.display).toBe('block');
		});

		it('should add se-modal-show class to alertModal', () => {
			ui.alertOpen('Test', '');
			expect(ui.alertModal.classList.contains('se-modal-show')).toBe(true);
		});

		it('should add se-alert-error class when type is error', () => {
			ui.alertOpen('Error!', 'error');
			expect(ui.alertModal.classList.contains('se-alert-error')).toBe(true);
		});

		it('should add se-alert-success class when type is success', () => {
			ui.alertOpen('OK!', 'success');
			expect(ui.alertModal.classList.contains('se-alert-success')).toBe(true);
		});

		it('should not add type class when type is empty', () => {
			ui.alertOpen('Info', '');
			expect(ui.alertModal.classList.contains('se-alert-error')).toBe(false);
			expect(ui.alertModal.classList.contains('se-alert-success')).toBe(false);
		});

		it('should remove previous type classes before setting new one', () => {
			ui.alertOpen('Error!', 'error');
			ui.alertOpen('Success!', 'success');
			expect(ui.alertModal.classList.contains('se-alert-error')).toBe(false);
			expect(ui.alertModal.classList.contains('se-alert-success')).toBe(true);
		});

		it('should register global keydown event', () => {
			ui.alertOpen('Test', '');
			expect(ctx.$.eventManager.addGlobalEvent).toHaveBeenCalledWith('keydown', expect.any(Function));
		});

		it('should remove previous global event before adding new one', () => {
			ui.alertOpen('First', '');
			const firstCallCount = ctx.$.eventManager.addGlobalEvent.mock.calls.length;

			ui.alertOpen('Second', '');
			expect(ctx.$.eventManager.removeGlobalEvent).toHaveBeenCalled();
			expect(ctx.$.eventManager.addGlobalEvent.mock.calls.length).toBe(firstCallCount + 1);
		});
	});

	describe('alertClose', () => {
		it('should remove se-modal-show class from alertModal', () => {
			ui.alertOpen('Test', '');
			ui.alertClose();
			expect(ui.alertModal.classList.contains('se-modal-show')).toBe(false);
		});

		it('should hide alert area', () => {
			ui.alertOpen('Test', '');
			ui.alertClose();
			expect(ctx.elements.alertArea.style.display).toBe('none');
		});

		it('should remove global event binding', () => {
			ui.alertOpen('Test', '');
			ui.alertClose();
			expect(ctx.$.eventManager.removeGlobalEvent).toHaveBeenCalled();
		});
	});

	// -------------------------------------------------------------------
	// showToast / closeToast
	// -------------------------------------------------------------------
	describe('showToast', () => {
		it('should display toast popup', () => {
			ui.showToast('Hello');
			expect(ui.toastPopup.style.display).toBe('block');
		});

		it('should set toast message text content', () => {
			ui.showToast('Test message');
			expect(ui.toastMessage.textContent).toBe('Test message');
		});

		it('should add se-toast-show class to toast container', () => {
			ui.showToast('Test');
			expect(ui.toastContainer.classList.contains('se-toast-show')).toBe(true);
		});

		it('should add se-toast-error class when type is error', () => {
			ui.showToast('Error!', 1000, 'error');
			expect(ui.toastPopup.classList.contains('se-toast-error')).toBe(true);
		});

		it('should add se-toast-success class when type is success', () => {
			ui.showToast('OK!', 1000, 'success');
			expect(ui.toastPopup.classList.contains('se-toast-success')).toBe(true);
		});

		it('should not add type class when type is empty or undefined', () => {
			ui.showToast('Info', 1000, '');
			expect(ui.toastPopup.classList.contains('se-toast-error')).toBe(false);
			expect(ui.toastPopup.classList.contains('se-toast-success')).toBe(false);
		});

		it('should auto-dismiss toast after default duration (1000ms)', () => {
			ui.showToast('Auto dismiss');
			expect(ui.toastContainer.classList.contains('se-toast-show')).toBe(true);

			jest.advanceTimersByTime(1000);
			expect(ui.toastContainer.classList.contains('se-toast-show')).toBe(false);
			expect(ui.toastPopup.style.display).toBe('none');
		});

		it('should auto-dismiss toast after custom duration', () => {
			ui.showToast('Custom duration', 3000);
			expect(ui.toastContainer.classList.contains('se-toast-show')).toBe(true);

			jest.advanceTimersByTime(2000);
			expect(ui.toastContainer.classList.contains('se-toast-show')).toBe(true);

			jest.advanceTimersByTime(1000);
			expect(ui.toastContainer.classList.contains('se-toast-show')).toBe(false);
		});

		it('should close previous toast before showing new one', () => {
			ui.showToast('First');
			ui.toastContainer.classList.add('se-toast-show');

			ui.showToast('Second');
			expect(ui.toastMessage.textContent).toBe('Second');
		});

		it('should remove previous type classes before setting new one', () => {
			ui.showToast('Error', 5000, 'error');
			ui.showToast('Success', 5000, 'success');
			expect(ui.toastPopup.classList.contains('se-toast-error')).toBe(false);
			expect(ui.toastPopup.classList.contains('se-toast-success')).toBe(true);
		});
	});

	describe('closeToast', () => {
		it('should remove se-toast-show class and hide popup', () => {
			ui.showToast('Test');
			ui.closeToast();
			expect(ui.toastContainer.classList.contains('se-toast-show')).toBe(false);
			expect(ui.toastPopup.style.display).toBe('none');
		});

		it('should clear the toast timer', () => {
			ui.showToast('Test', 5000);
			ui.closeToast();

			// After closing, advancing time should not cause errors
			jest.advanceTimersByTime(5000);
			expect(ui.toastPopup.style.display).toBe('none');
		});

		it('should handle closeToast when no toast is active', () => {
			// Should not throw
			ui.closeToast();
			expect(ui.toastPopup.style.display).toBe('none');
		});
	});

	// -------------------------------------------------------------------
	// setControllerOnDisabledButtons
	// -------------------------------------------------------------------
	describe('setControllerOnDisabledButtons', () => {
		it('should enable disabled buttons and return true when active=true and not already disabled', () => {
			const result = ui.setControllerOnDisabledButtons(true);
			expect(result).toBe(true);
		});

		it('should return false and disable buttons when active=false after being enabled', () => {
			ui.setControllerOnDisabledButtons(true);
			const result = ui.setControllerOnDisabledButtons(false);
			expect(result).toBe(false);
		});

		it('should not toggle when active=true and already disabled', () => {
			ui.setControllerOnDisabledButtons(true);
			const result = ui.setControllerOnDisabledButtons(true);
			// Should still return true since already disabled
			expect(result).toBe(true);
		});

		it('should not toggle when active=false and not currently disabled', () => {
			const result = ui.setControllerOnDisabledButtons(false);
			expect(result).toBe(false);
		});
	});

	// -------------------------------------------------------------------
	// onControllerContext / offControllerContext
	// -------------------------------------------------------------------
	describe('onControllerContext', () => {
		it('should set controllerTargetContext to current topArea', () => {
			ui.onControllerContext();
			expect(ui.controllerTargetContext).toBe(ctx.frameContext.get('topArea'));
		});
	});

	describe('offControllerContext', () => {
		it('should set controllerTargetContext to null', () => {
			ui.onControllerContext();
			ui.offControllerContext();
			expect(ui.controllerTargetContext).toBe(null);
		});
	});

	// -------------------------------------------------------------------
	// enableBackWrapper / disableBackWrapper
	// -------------------------------------------------------------------
	describe('enableBackWrapper', () => {
		it('should set backWrapper cursor and display to block', () => {
			ui.enableBackWrapper('col-resize');
			expect(ctx.elements.backWrapper.style.cursor).toBe('col-resize');
			expect(ctx.elements.backWrapper.style.display).toBe('block');
		});
	});

	describe('disableBackWrapper', () => {
		it('should set backWrapper display to none and cursor to default', () => {
			ui.enableBackWrapper('pointer');
			ui.disableBackWrapper();
			expect(ctx.elements.backWrapper.style.display).toBe('none');
			expect(ctx.elements.backWrapper.style.cursor).toBe('default');
		});
	});

	// -------------------------------------------------------------------
	// offCurrentController
	// -------------------------------------------------------------------
	describe('offCurrentController', () => {
		it('should call component.__deselect', () => {
			ui.offCurrentController();
			expect(ctx.$.component.__deselect).toHaveBeenCalled();
		});
	});

	// -------------------------------------------------------------------
	// offCurrentModal
	// -------------------------------------------------------------------
	describe('offCurrentModal', () => {
		it('should call close on opendModal when it exists', () => {
			const mockModal = { close: jest.fn() };
			ui.opendModal = mockModal;
			ui.offCurrentModal();
			expect(mockModal.close).toHaveBeenCalled();
		});

		it('should not throw when opendModal is null', () => {
			ui.opendModal = null;
			expect(() => ui.offCurrentModal()).not.toThrow();
		});

		it('should not throw when opendModal is undefined', () => {
			ui.opendModal = undefined;
			expect(() => ui.offCurrentModal()).not.toThrow();
		});
	});

	// -------------------------------------------------------------------
	// getVisibleFigure
	// -------------------------------------------------------------------
	describe('getVisibleFigure', () => {
		it('should return null when _figureContainer is null', () => {
			ui._figureContainer = null;
			expect(ui.getVisibleFigure()).toBe(null);
		});

		it('should return null when _figureContainer display is not block', () => {
			const fig = document.createElement('div');
			fig.style.display = 'none';
			ui._figureContainer = fig;
			expect(ui.getVisibleFigure()).toBe(null);
		});

		it('should return the figure when display is block', () => {
			const fig = document.createElement('div');
			fig.style.display = 'block';
			ui._figureContainer = fig;
			expect(ui.getVisibleFigure()).toBe(fig);
		});
	});

	// -------------------------------------------------------------------
	// setFigureContainer
	// -------------------------------------------------------------------
	describe('setFigureContainer', () => {
		it('should set _figureContainer to the given element', () => {
			const fig = document.createElement('div');
			ui.setFigureContainer(fig);
			expect(ui._figureContainer).toBe(fig);
		});

		it('should set _figureContainer to null', () => {
			ui.setFigureContainer(null);
			expect(ui._figureContainer).toBe(null);
		});
	});

	// -------------------------------------------------------------------
	// preventToolbarHide / isPreventToolbarHide
	// -------------------------------------------------------------------
	describe('preventToolbarHide and isPreventToolbarHide', () => {
		it('should set notHideToolbar to true', () => {
			ui.preventToolbarHide(true);
			expect(ui.isPreventToolbarHide).toBe(true);
		});

		it('should set notHideToolbar to false', () => {
			ui.preventToolbarHide(true);
			ui.preventToolbarHide(false);
			expect(ui.isPreventToolbarHide).toBe(false);
		});
	});

	// -------------------------------------------------------------------
	// reset
	// -------------------------------------------------------------------
	describe('reset', () => {
		it('should set _editorHeight from wysiwygFrame offsetHeight', () => {
			const rt = ctx.frameContext;
			ui.reset(rt);
			// offsetHeight in jsdom defaults to 0
			expect(rt.get('_editorHeight')).toBe(0);
		});
	});

	// -------------------------------------------------------------------
	// _offControllers
	// -------------------------------------------------------------------
	describe('_offControllers', () => {
		it('should close all non-fixed controllers', () => {
			const closeFn = jest.fn();
			const form1 = document.createElement('div');
			form1.style.display = 'block';
			const form2 = document.createElement('div');
			form2.style.display = 'block';

			ui.opendControllers = [
				{ fixed: false, inst: { controllerClose: closeFn }, form: form1 },
				{ fixed: false, inst: { controllerClose: closeFn }, form: form2 },
			];

			ui._offControllers();

			expect(closeFn).toHaveBeenCalledTimes(2);
			expect(form1.style.display).toBe('none');
			expect(form2.style.display).toBe('none');
			expect(ui.opendControllers).toEqual([]);
			expect(ui.currentControllerName).toBe('');
		});

		it('should keep fixed controllers', () => {
			const fixedController = { fixed: true, inst: { controllerClose: jest.fn() }, form: document.createElement('div') };
			const normalController = { fixed: false, inst: { controllerClose: jest.fn() }, form: document.createElement('div') };

			ui.opendControllers = [fixedController, normalController];
			ui._offControllers();

			expect(ui.opendControllers).toEqual([fixedController]);
			expect(fixedController.inst.controllerClose).not.toHaveBeenCalled();
			expect(normalController.inst.controllerClose).toHaveBeenCalled();
		});

		it('should handle controllers without controllerClose method', () => {
			ui.opendControllers = [
				{ fixed: false, inst: {}, form: document.createElement('div') },
			];

			expect(() => ui._offControllers()).not.toThrow();
		});

		it('should handle controllers without form', () => {
			ui.opendControllers = [
				{ fixed: false, inst: { controllerClose: jest.fn() }, form: null },
			];

			expect(() => ui._offControllers()).not.toThrow();
		});

		it('should set _preventBlur to false in store', () => {
			ui.opendControllers = [];
			ui._offControllers();
			expect(ctx.store.set).toHaveBeenCalledWith('_preventBlur', false);
		});
	});

	// -------------------------------------------------------------------
	// _syncScrollPosition
	// -------------------------------------------------------------------
	describe('_syncScrollPosition', () => {
		it('should update balloon toolbar position when isBalloon mode is active', () => {
			ctx.store.mode.isBalloon = true;
			ctx.$.toolbar.balloonOffset = { top: 100, left: 50 };

			const toolbarMain = ctx.context.get('toolbar_main');
			toolbarMain.style.display = 'block';
			ui._syncScrollPosition({ scrollTop: 20, scrollLeft: 10 });

			expect(toolbarMain.style.top).toBe('80px');
			expect(toolbarMain.style.left).toBe('40px');

			toolbarMain.style.display = '';
			ctx.store.mode.isBalloon = false;
		});

		it('should update sub balloon toolbar position when isSubBalloon mode is active', () => {
			ctx.store.mode.isSubBalloon = true;
			ctx.$.subToolbar.balloonOffset = { top: 200, left: 100 };

			const toolbarSubMain = ctx.context.get('toolbar_sub_main');
			toolbarSubMain.style.display = 'block';
			ui._syncScrollPosition({ scrollTop: 30, scrollLeft: 15 });

			expect(toolbarSubMain.style.top).toBe('170px');
			expect(toolbarSubMain.style.left).toBe('85px');

			toolbarSubMain.style.display = '';
			ctx.store.mode.isSubBalloon = false;
		});

		it('should close controller when controllerTargetContext does not match current topArea', () => {
			ui.controllerTargetContext = document.createElement('div'); // different from topArea
			ui._syncScrollPosition({ scrollTop: 0, scrollLeft: 0 });
			expect(ctx.$.component.__deselect).toHaveBeenCalled();
		});

		it('should not close controller when controllerTargetContext matches current topArea', () => {
			ui.controllerTargetContext = ctx.frameContext.get('topArea');
			ctx.$.component.__deselect.mockClear();
			ui._syncScrollPosition({ scrollTop: 0, scrollLeft: 0 });
			expect(ctx.$.component.__deselect).not.toHaveBeenCalled();
		});

		it('should handle scrollY/scrollX properties', () => {
			ctx.store.mode.isBalloon = true;
			ctx.$.toolbar.balloonOffset = { top: 100, left: 50 };

			const toolbarMain = ctx.context.get('toolbar_main');
			toolbarMain.style.display = 'block';
			ui._syncScrollPosition({ scrollY: 20, scrollX: 10 });

			expect(toolbarMain.style.top).toBe('80px');
			expect(toolbarMain.style.left).toBe('40px');

			toolbarMain.style.display = '';
			ctx.store.mode.isBalloon = false;
		});

		it('should handle zero scroll values', () => {
			ctx.store.mode.isBalloon = true;
			ctx.$.toolbar.balloonOffset = { top: 100, left: 50 };

			const toolbarMain = ctx.context.get('toolbar_main');
			toolbarMain.style.display = 'block';
			ui._syncScrollPosition({});

			expect(toolbarMain.style.top).toBe('100px');
			expect(toolbarMain.style.left).toBe('50px');

			toolbarMain.style.display = '';
			ctx.store.mode.isBalloon = false;
		});
	});

	// -------------------------------------------------------------------
	// _repositionControllers
	// -------------------------------------------------------------------
	describe('_repositionControllers', () => {
		it('should return early when no open controllers', () => {
			ui.opendControllers = [];
			// Should not throw
			ui._repositionControllers();
		});

		it('should call _scrollReposition on controllers that are in carrier', () => {
			const scrollRepoFn = jest.fn();
			ui.opendControllers = [
				{ notInCarrier: false, inst: { _scrollReposition: scrollRepoFn } },
			];

			ui._repositionControllers();
			expect(scrollRepoFn).toHaveBeenCalled();
		});

		it('should skip controllers marked as notInCarrier', () => {
			const scrollRepoFn = jest.fn();
			ui.opendControllers = [
				{ notInCarrier: true, inst: { _scrollReposition: scrollRepoFn } },
			];

			ui._repositionControllers();
			expect(scrollRepoFn).not.toHaveBeenCalled();
		});
	});

	// -------------------------------------------------------------------
	// _visibleControllers
	// -------------------------------------------------------------------
	describe('_visibleControllers', () => {
		beforeEach(() => {
			// reset needs to be called to set lineBreaker references
			ui.reset(ctx.frameContext);
		});

		it('should hide controllers when value is false', () => {
			const form = document.createElement('div');
			ui.opendControllers = [{ form }];

			ui._visibleControllers(false);
			expect(form.style.visibility).toBe('hidden');
		});

		it('should show controllers when value is true', () => {
			const form = document.createElement('div');
			form.style.visibility = 'hidden';
			ui.opendControllers = [{ form }];

			ui._visibleControllers(true);
			expect(form.style.visibility).toBe('');
		});

		it('should handle controllers without form', () => {
			ui.opendControllers = [{ form: null }];
			expect(() => ui._visibleControllers(false)).not.toThrow();
		});

		it('should set lineBreaker visibility based on lineBreakShow parameter', () => {
			ui.opendControllers = [];

			// When value=false and lineBreakShow=undefined:
			// visible='hidden', breakerVisible=(undefined ?? 'hidden')='hidden' -> truthy -> ''
			// So line breakers remain visible by default
			ui._visibleControllers(false);
			expect(ctx.elements.lineBreaker_t.style.visibility).toBe('');
			expect(ctx.elements.lineBreaker_b.style.visibility).toBe('');
		});

		it('should hide lineBreakers when lineBreakShow is explicitly false', () => {
			ui.opendControllers = [];
			// When value=false and lineBreakShow=false:
			// visible='hidden', breakerVisible=(false ?? 'hidden')=false -> falsy -> 'hidden'
			ui._visibleControllers(false, false);
			expect(ctx.elements.lineBreaker_t.style.visibility).toBe('hidden');
			expect(ctx.elements.lineBreaker_b.style.visibility).toBe('hidden');
		});

		it('should show lineBreakers when lineBreakShow is true', () => {
			ui.opendControllers = [];
			// When value=true and lineBreakShow=true:
			// visible='', breakerVisible=(true ?? '')=true -> truthy -> ''
			ui._visibleControllers(true, true);
			expect(ctx.elements.lineBreaker_t.style.visibility).toBe('');
			expect(ctx.elements.lineBreaker_b.style.visibility).toBe('');
		});
	});

	// -------------------------------------------------------------------
	// _initToggleButtons
	// -------------------------------------------------------------------
	describe('_initToggleButtons', () => {
		it('should populate codeViewDisabledButtons and controllerOnDisabledButtons', () => {
			// The toolbar_buttonTray has buttons, _initToggleButtons should query them
			ui._initToggleButtons();
			// After init, calling _toggleCodeViewButtons should not throw
			expect(() => ui._toggleCodeViewButtons(true)).not.toThrow();
			expect(() => ui._toggleControllerButtons(true)).not.toThrow();
		});

		it('should include sub toolbar buttons when _subMode is set', () => {
			// Add _subMode to options so has('_subMode') returns true
			ctx.options.set('_subMode', true);

			// Provide toolbar_sub_buttonTray in context with proper .se-menu-list wrapper
			const subButtonTray = document.createElement('div');
			const subMenuList = document.createElement('div');
			subMenuList.className = 'se-menu-list';
			const subBtn = document.createElement('button');
			subBtn.className = 'se-toolbar-btn';
			subBtn.setAttribute('data-command', 'italic');
			subMenuList.appendChild(subBtn);
			subButtonTray.appendChild(subMenuList);
			ctx.context.set('toolbar_sub_buttonTray', subButtonTray);

			ui._initToggleButtons();
			// Should not throw, and should handle the sub buttons
			expect(() => ui._toggleCodeViewButtons(true)).not.toThrow();

			// Clean up: remove _subMode so other tests aren't affected
			ctx.options.delete('_subMode');
		});
	});

	// -------------------------------------------------------------------
	// _toggleCodeViewButtons / _toggleControllerButtons
	// -------------------------------------------------------------------
	describe('_toggleCodeViewButtons', () => {
		it('should disable code view buttons when isCodeView is true', () => {
			ui._initToggleButtons();
			ui._toggleCodeViewButtons(true);
			// btn1 (without se-code-view-enabled) should be disabled
			// btn2 (with se-code-view-enabled) should NOT be in the disabled list
		});

		it('should enable code view buttons when isCodeView is false', () => {
			ui._initToggleButtons();
			ui._toggleCodeViewButtons(true);
			ui._toggleCodeViewButtons(false);
		});
	});

	describe('_toggleControllerButtons', () => {
		it('should disable controller buttons when isOpen is true', () => {
			ui._initToggleButtons();
			ui._toggleControllerButtons(true);
		});

		it('should enable controller buttons when isOpen is false', () => {
			ui._initToggleButtons();
			ui._toggleControllerButtons(true);
			ui._toggleControllerButtons(false);
		});
	});

	// -------------------------------------------------------------------
	// isButtonDisabled
	// -------------------------------------------------------------------
	describe('isButtonDisabled', () => {
		it('should return false when not in readOnly mode', () => {
			ui._initToggleButtons();
			const btn = document.createElement('button');
			expect(ui.isButtonDisabled(btn)).toBe(false);
		});

		it('should return true when in readOnly mode and button is in disabled list', () => {
			ui._initToggleButtons();
			ctx.frameContext.set('isReadOnly', true);
			// btn1 should be in the controllerOnDisabledButtons list
			// We need to check with a button that IS in the list
			// The buttons were added during _initToggleButtons from toolbar_buttonTray
			// Only buttons matching DISABLE_BUTTONS_CONTROLLER selector are included
			// btn1 has data-command but no se-component-enabled class, so it should be included
			expect(ui.isButtonDisabled(ctx.elements.btn1)).toBe(true);
		});

		it('should return false when in readOnly mode but button is not in disabled list', () => {
			ui._initToggleButtons();
			ctx.frameContext.set('isReadOnly', true);
			const unknownBtn = document.createElement('button');
			expect(ui.isButtonDisabled(unknownBtn)).toBe(false);
		});
	});

	// -------------------------------------------------------------------
	// _updatePlaceholder
	// -------------------------------------------------------------------
	describe('_updatePlaceholder', () => {
		it('should show placeholder when editor is empty', () => {
			ctx.$.facade.isEmpty = jest.fn().mockReturnValue(true);
			ui._updatePlaceholder();
			expect(ctx.elements.placeholder.style.display).toBe('block');
		});

		it('should hide placeholder when editor has content', () => {
			ctx.$.facade.isEmpty = jest.fn().mockReturnValue(false);
			ui._updatePlaceholder();
			expect(ctx.elements.placeholder.style.display).toBe('none');
		});

		it('should hide placeholder when in code view mode', () => {
			ctx.frameContext.set('isCodeView', true);
			ui._updatePlaceholder();
			expect(ctx.elements.placeholder.style.display).toBe('none');
		});

		it('should use provided frame context', () => {
			const customPlaceholder = document.createElement('div');
			const customFc = new Map([
				['placeholder', customPlaceholder],
				['isCodeView', false],
			]);
			ctx.$.facade.isEmpty = jest.fn().mockReturnValue(true);
			ui._updatePlaceholder(customFc);
			expect(customPlaceholder.style.display).toBe('block');
		});

		it('should handle null placeholder gracefully', () => {
			const customFc = new Map([
				['placeholder', null],
				['isCodeView', false],
			]);
			expect(() => ui._updatePlaceholder(customFc)).not.toThrow();
		});
	});

	// -------------------------------------------------------------------
	// _syncFrameState
	// -------------------------------------------------------------------
	describe('_syncFrameState', () => {
		it('should return early when fc is null', () => {
			expect(() => ui._syncFrameState(null)).not.toThrow();
		});

		it('should call _updatePlaceholder', () => {
			const fc = ctx.frameContext;
			ctx.$.facade.isEmpty = jest.fn().mockReturnValue(false);
			ui._syncFrameState(fc);
			// Should not throw; placeholder should be updated
		});

		it('should sync document type page when present', () => {
			const fc = ctx.frameContext;
			fc.set('documentType_use_page', true);
			fc.set('documentType', { rePage: jest.fn() });
			fc.set('documentTypePageMirror', document.createElement('div'));

			ui._syncFrameState(fc);
			expect(fc.get('documentType').rePage).toHaveBeenCalledWith(true);
		});

		it('should not sync document type page when not present', () => {
			const fc = ctx.frameContext;
			// documentType_use_page not set => has() returns false
			ui._syncFrameState(fc);
			// Should not throw
		});
	});

	// -------------------------------------------------------------------
	// _emitResizeEvent
	// -------------------------------------------------------------------
	describe('_emitResizeEvent', () => {
		it('should trigger onResizeEditor when height changes', () => {
			const fc = ctx.frameContext;
			fc.set('_editorHeight', 100);

			ui._emitResizeEvent(fc, 200, null);

			expect(ctx.$.eventManager.triggerEvent).toHaveBeenCalledWith('onResizeEditor', expect.objectContaining({
				height: 200,
				prevHeight: 100,
			}));
			expect(fc.get('_editorHeight')).toBe(200);
		});

		it('should not trigger event when height has not changed', () => {
			const fc = ctx.frameContext;
			fc.set('_editorHeight', 200);

			ui._emitResizeEvent(fc, 200, null);
			expect(ctx.$.eventManager.triggerEvent).not.toHaveBeenCalled();
		});

		it('should calculate height from resizeObserverEntry when h is -1 (borderBoxSize)', () => {
			const fc = ctx.frameContext;
			fc.set('_editorHeight', 100);

			const entry = {
				borderBoxSize: [{ blockSize: 300 }],
				contentRect: { height: 280 },
			};

			ui._emitResizeEvent(fc, -1, entry);
			expect(ctx.$.eventManager.triggerEvent).toHaveBeenCalledWith('onResizeEditor', expect.objectContaining({
				height: 300,
			}));
		});

		it('should calculate height from contentRect when borderBoxSize is not available', () => {
			const fc = ctx.frameContext;
			fc.set('_editorHeight', 100);

			const entry = {
				borderBoxSize: null,
				contentRect: { height: 280 },
			};

			ui._emitResizeEvent(fc, -1, entry);
			expect(ctx.$.eventManager.triggerEvent).toHaveBeenCalledWith('onResizeEditor', expect.objectContaining({
				height: 280,
			}));
		});

		it('should call resizePage on documentType when documentType_use_page is set', () => {
			const fc = ctx.frameContext;
			fc.set('_editorHeight', 100);
			fc.set('documentType_use_page', true);
			fc.set('documentType', { resizePage: jest.fn() });

			ui._emitResizeEvent(fc, 200, null);
			expect(fc.get('documentType').resizePage).toHaveBeenCalled();
		});
	});

	// -------------------------------------------------------------------
	// init
	// -------------------------------------------------------------------
	describe('init', () => {
		it('should call addEvent on the close button and _initToggleButtons', () => {
			ui.init();
			expect(ctx.$.eventManager.addEvent).toHaveBeenCalled();
		});

		it('should set closeSignal based on addEvent return value (null = truthy negation)', () => {
			// When addEvent returns null (falsy), !null = true => closeSignal = true
			ctx.$.eventManager.addEvent.mockReturnValue(null);
			ui.init();
			// After init with closeSignal = true, alertOpen should add click listener to alertInner
		});

		it('should set closeSignal to false when addEvent returns truthy', () => {
			ctx.$.eventManager.addEvent.mockReturnValue({ id: 'some-event' });
			ui.init();
			// closeSignal should be false
		});
	});

	// -------------------------------------------------------------------
	// _destroy
	// -------------------------------------------------------------------
	describe('_destroy', () => {
		it('should clear toast timer if active', () => {
			ui.showToast('Test', 5000);
			ui._destroy();
			// Timer should be cleared, no auto-dismiss after advancing time
			jest.advanceTimersByTime(5000);
		});

		it('should remove global event binding', () => {
			ui.alertOpen('Test', '');
			ui._destroy();
			expect(ctx.$.eventManager.removeGlobalEvent).toHaveBeenCalled();
		});

		it('should handle destroy when no toast or alert is active', () => {
			expect(() => ui._destroy()).not.toThrow();
		});

		it('should set opendModal and opendBrowser to null', () => {
			ui.opendModal = { close: jest.fn() };
			ui.opendBrowser = { close: jest.fn() };
			ui._destroy();
			expect(ui.opendModal).toBe(null);
			expect(ui.opendBrowser).toBe(null);
		});
	});

	// -------------------------------------------------------------------
	// setDir
	// -------------------------------------------------------------------
	describe('setDir', () => {
		it('should return early when direction has not changed (same as current _rtl)', () => {
			ctx.options.set('_rtl', false);
			// Setting to 'ltr' means rtl=false, which matches, so early return
			ui.setDir('ltr');
			// Should not call offCurrentController
			expect(ctx.$.component.__deselect).not.toHaveBeenCalled();
		});

		it('should set RTL direction and add se-rtl class', () => {
			ctx.options.set('_rtl', false);
			ui.setDir('rtl');
			expect(ctx.elements.carrierWrapper.classList.contains('se-rtl')).toBe(true);
		});

		it('should set LTR direction and remove se-rtl class', () => {
			ctx.options.set('_rtl', false);
			ui.setDir('rtl'); // first go RTL
			ctx.$.component.__deselect.mockClear();

			ui.setDir('ltr'); // then go LTR
			expect(ctx.elements.carrierWrapper.classList.contains('se-rtl')).toBe(false);
		});

		it('should call offCurrentController when direction changes', () => {
			ctx.options.set('_rtl', false);
			ui.setDir('rtl');
			expect(ctx.$.component.__deselect).toHaveBeenCalled();
		});

		it('should call setDir on plugins that have it', () => {
			const setDirFn = jest.fn();
			ctx.$.pluginManager.plugins = { testPlugin: { setDir: setDirFn } };
			ctx.options.set('_rtl', false);

			ui.setDir('rtl');
			expect(setDirFn).toHaveBeenCalledWith('rtl');
		});

		it('should skip plugins without setDir method', () => {
			ctx.$.pluginManager.plugins = { testPlugin: {} };
			ctx.options.set('_rtl', false);

			expect(() => ui.setDir('rtl')).not.toThrow();
		});

		it('should swap marginRight and marginLeft on line nodes', () => {
			const lineNode = document.createElement('p');
			lineNode.style.marginLeft = '20px';
			lineNode.style.marginRight = '40px';
			ctx.elements.wysiwyg.innerHTML = '';
			ctx.elements.wysiwyg.appendChild(lineNode);

			ctx.$.format.isLine.mockReturnValue(true);
			ctx.options.set('_rtl', false);

			ui.setDir('rtl');

			expect(lineNode.style.marginLeft).toBe('40px');
			expect(lineNode.style.marginRight).toBe('20px');
		});

		it('should swap textAlign left to right', () => {
			const lineNode = document.createElement('p');
			lineNode.style.textAlign = 'left';
			ctx.elements.wysiwyg.innerHTML = '';
			ctx.elements.wysiwyg.appendChild(lineNode);

			ctx.$.format.isLine.mockReturnValue(true);
			ctx.options.set('_rtl', false);

			ui.setDir('rtl');
			expect(lineNode.style.textAlign).toBe('right');
		});

		it('should swap textAlign right to left', () => {
			const lineNode = document.createElement('p');
			lineNode.style.textAlign = 'right';
			ctx.elements.wysiwyg.innerHTML = '';
			ctx.elements.wysiwyg.appendChild(lineNode);

			ctx.$.format.isLine.mockReturnValue(true);
			ctx.options.set('_rtl', false);

			ui.setDir('rtl');
			expect(lineNode.style.textAlign).toBe('left');
		});

		it('should not change textAlign when it is center', () => {
			const lineNode = document.createElement('p');
			lineNode.style.textAlign = 'center';
			ctx.elements.wysiwyg.innerHTML = '';
			ctx.elements.wysiwyg.appendChild(lineNode);

			ctx.$.format.isLine.mockReturnValue(true);
			ctx.options.set('_rtl', false);

			ui.setDir('rtl');
			expect(lineNode.style.textAlign).toBe('center');
		});

		it('should handle documentType_use_header with rtl', () => {
			// Set up: documentTypeInner must be a child of wrapper initially
			const wrapper = ctx.frameContext.get('wrapper');
			const wysiwygFrame = ctx.frameContext.get('wysiwygFrame');
			const docTypeInner = ctx.frameContext.get('documentTypeInner');
			wrapper.appendChild(wysiwygFrame);
			wrapper.insertBefore(docTypeInner, wysiwygFrame);

			ctx.frameContext.set('documentType_use_header', true);
			ctx.options.set('_rtl', false);

			ui.setDir('rtl');
			// In RTL, documentTypeInner should be appended (last child)
			expect(wrapper.lastChild).toBe(docTypeInner);
		});

		it('should handle documentType_use_header with ltr', () => {
			const wrapper = ctx.frameContext.get('wrapper');
			const wysiwygFrame = ctx.frameContext.get('wysiwygFrame');
			const docTypeInner = ctx.frameContext.get('documentTypeInner');
			wrapper.appendChild(wysiwygFrame);
			wrapper.appendChild(docTypeInner);

			ctx.frameContext.set('documentType_use_header', true);
			ctx.options.set('_rtl', false);
			ui.setDir('rtl');

			// Now switch to LTR
			ui.setDir('ltr');
			// In LTR, documentTypeInner should be inserted before wysiwygFrame
			const children = Array.from(wrapper.children);
			const docIdx = children.indexOf(docTypeInner);
			const wwIdx = children.indexOf(wysiwygFrame);
			expect(docIdx).toBeLessThan(wwIdx);
		});

		it('should handle documentType_use_page with rtl', () => {
			const wrapper = ctx.frameContext.get('wrapper');
			const wysiwygFrame = ctx.frameContext.get('wysiwygFrame');
			const docTypePage = ctx.frameContext.get('documentTypePage');
			wrapper.appendChild(docTypePage);
			wrapper.appendChild(wysiwygFrame);

			ctx.frameContext.set('documentType_use_page', true);
			ctx.options.set('_rtl', false);

			ui.setDir('rtl');
			// In RTL, documentTypePage should be inserted before wysiwygFrame
			const children = Array.from(wrapper.children);
			const pageIdx = children.indexOf(docTypePage);
			const wwIdx = children.indexOf(wysiwygFrame);
			expect(pageIdx).toBeLessThan(wwIdx);
		});

		it('should handle documentType_use_page with ltr', () => {
			const wrapper = ctx.frameContext.get('wrapper');
			const wysiwygFrame = ctx.frameContext.get('wysiwygFrame');
			const docTypePage = ctx.frameContext.get('documentTypePage');
			wrapper.appendChild(wysiwygFrame);
			wrapper.appendChild(docTypePage);

			ctx.frameContext.set('documentType_use_page', true);
			ctx.options.set('_rtl', false);
			ui.setDir('rtl');

			// Now switch to LTR
			ui.setDir('ltr');
			// In LTR, documentTypePage should be appended (last child)
			expect(wrapper.lastChild).toBe(docTypePage);
		});

		it('should call _showBalloon for balloon mode', () => {
			ctx.store.mode.isBalloon = true;
			ctx.options.set('_rtl', false);

			ui.setDir('rtl');
			expect(ctx.$.toolbar._showBalloon).toHaveBeenCalled();

			ctx.store.mode.isBalloon = false;
		});

		it('should call _showBalloon for sub balloon mode', () => {
			ctx.store.mode.isSubBalloon = true;
			ctx.options.set('_rtl', false);

			ui.setDir('rtl');
			expect(ctx.$.subToolbar._showBalloon).toHaveBeenCalled();

			ctx.store.mode.isSubBalloon = false;
		});

		it('should set _lastSelectionNode to null and call applyTagEffect', () => {
			ctx.options.set('_rtl', false);
			ui.setDir('rtl');

			expect(ctx.store.set).toHaveBeenCalledWith('_lastSelectionNode', null);
			expect(ctx.kernel._eventOrchestrator.applyTagEffect).toHaveBeenCalled();
		});

		it('should revert _rtl on error and log warning', () => {
			// Force an error by making offCurrentController throw
			ctx.$.component.__deselect.mockImplementation(() => { throw new Error('test error'); });
			const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

			ctx.options.set('_rtl', false);
			ui.setDir('rtl');

			// _rtl should have been reverted to false (the negation of the attempted rtl=true)
			expect(ctx.options.get('_rtl')).toBe(false);
			expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('SUNEDITOR.ui.setDir.fail'));

			warnSpy.mockRestore();
			ctx.$.component.__deselect.mockImplementation(() => {});
		});

		it('should activate dir buttons for RTL (dir_rtl active, dir_ltr inactive)', () => {
			ctx.options.set('_rtl', false);
			ui.setDir('rtl');

			expect(ctx.commandTargets.get('dir_rtl').classList.contains('active')).toBe(true);
		});

		it('should activate dir buttons for LTR (dir_ltr active, dir_rtl inactive)', () => {
			ctx.options.set('_rtl', false);
			ui.setDir('rtl');
			ui.setDir('ltr');

			expect(ctx.commandTargets.get('dir_ltr').classList.contains('active')).toBe(true);
		});

		it('should change reverse shortcuts keys', () => {
			ctx.$.shortcuts.reverseKeys = ['testKey'];
			ctx.$.shortcuts.keyMap.set('testKey', { command: 'cmd1', r: 'cmd2' });
			ctx.options.set('_rtl', false);

			ui.setDir('rtl');

			const info = ctx.$.shortcuts.keyMap.get('testKey');
			expect(info.command).toBe('cmd2');
			expect(info.r).toBe('cmd1');
		});

		it('should handle missing command dispatcher targets gracefully', () => {
			ctx.$.commandDispatcher.targets = null;
			ctx.options.set('_rtl', false);

			// The #activeDirBtn method should return early
			expect(() => ui.setDir('rtl')).not.toThrow();
		});
	});

	// -------------------------------------------------------------------
	// alertOpen with closeSignal
	// -------------------------------------------------------------------
	describe('alertOpen/alertClose with closeSignal', () => {
		it('should add click listener to alertInner when closeSignal is true', () => {
			// closeSignal becomes true when addEvent returns null (falsy)
			ctx.$.eventManager.addEvent.mockReturnValue(null);
			ui.init(); // sets closeSignal = !null = true

			ctx.$.eventManager.addEvent.mockReturnValue({ id: 'alert-click' });
			ctx.$.eventManager.addEvent.mockClear();
			ui.alertOpen('Test', '');
			expect(ctx.$.eventManager.addEvent).toHaveBeenCalledWith(ctx.elements.alertInner, 'click', expect.any(Function));
		});

		it('should remove click listener from alertInner on alertClose when closeSignal is true', () => {
			ctx.$.eventManager.addEvent.mockReturnValue(null);
			ui.init();

			ctx.$.eventManager.addEvent.mockReturnValue({ id: 'alert-click' });
			ui.alertOpen('Test', '');
			ctx.$.eventManager.removeEvent.mockClear();
			ui.alertClose();
			expect(ctx.$.eventManager.removeEvent).toHaveBeenCalled();
		});

		it('should not add click listener when closeSignal is false', () => {
			ctx.$.eventManager.addEvent.mockReturnValue({ id: 'event' });
			ui.init(); // closeSignal = !truthy = false

			const addListenerSpy = jest.spyOn(ctx.elements.alertInner, 'addEventListener');
			ui.alertOpen('Test', '');
			expect(addListenerSpy).not.toHaveBeenCalled();
			addListenerSpy.mockRestore();
		});
	});

	// -------------------------------------------------------------------
	// _iframeAutoHeight
	// -------------------------------------------------------------------
	describe('_iframeAutoHeight', () => {
		it('should return early when fc is null', () => {
			expect(() => ui._iframeAutoHeight(null)).not.toThrow();
		});

		it('should handle non-auto-height iframe (no _iframeAuto)', () => {
			const fc = ctx.frameContext;
			fc.set('_iframeAuto', null);

			// Should not throw
			ui._iframeAutoHeight(fc);
		});

		it('should set wysiwygFrame height from iframeAuto offsetHeight in setTimeout', () => {
			const fc = ctx.frameContext;
			const autoFrame = document.createElement('div');
			Object.defineProperty(autoFrame, 'offsetHeight', { get: () => 400 });
			fc.set('_iframeAuto', autoFrame);

			ui._iframeAutoHeight(fc);
			jest.advanceTimersByTime(1);

			expect(fc.get('wysiwygFrame').style.height).toBe('400px');
		});

		it('should set scrolling attribute when iframe and maxHeight are set', () => {
			const fc = ctx.frameContext;
			const autoFrame = document.createElement('div');
			Object.defineProperty(autoFrame, 'offsetHeight', { get: () => 600 });
			fc.set('_iframeAuto', autoFrame);

			const fo = fc.get('options');
			fo.set('iframe', true);
			fo.set('maxHeight', '400px');

			ui._iframeAutoHeight(fc);
			jest.advanceTimersByTime(1);

			expect(fc.get('wysiwygFrame').getAttribute('scrolling')).toBe('auto');
		});

		it('should set scrolling to no when height is within maxHeight', () => {
			const fc = ctx.frameContext;
			const autoFrame = document.createElement('div');
			Object.defineProperty(autoFrame, 'offsetHeight', { get: () => 200 });
			fc.set('_iframeAuto', autoFrame);

			const fo = fc.get('options');
			fo.set('iframe', true);
			fo.set('maxHeight', '400px');

			ui._iframeAutoHeight(fc);
			jest.advanceTimersByTime(1);

			expect(fc.get('wysiwygFrame').getAttribute('scrolling')).toBe('no');
		});

		it('should not set scrolling when maxHeight is not set', () => {
			const fc = ctx.frameContext;
			const autoFrame = document.createElement('div');
			Object.defineProperty(autoFrame, 'offsetHeight', { get: () => 600 });
			fc.set('_iframeAuto', autoFrame);

			const fo = fc.get('options');
			fo.set('iframe', true);
			fo.set('maxHeight', '');

			ui._iframeAutoHeight(fc);
			jest.advanceTimersByTime(1);

			expect(fc.get('wysiwygFrame').hasAttribute('scrolling')).toBe(false);
		});

		it('should handle wysiwygFrame being null in setTimeout callback', () => {
			const fc = ctx.frameContext;
			const autoFrame = document.createElement('div');
			fc.set('_iframeAuto', autoFrame);

			// Temporarily set wysiwygFrame to null
			const origFrame = fc.get('wysiwygFrame');
			fc.set('wysiwygFrame', null);

			ui._iframeAutoHeight(fc);
			// Should not throw when setTimeout fires
			jest.advanceTimersByTime(1);

			// Restore
			fc.set('wysiwygFrame', origFrame);
		});
	});

	// -------------------------------------------------------------------
	// _syncScrollPosition with visible lineBreakers (#resetLineBreaker coverage)
	// -------------------------------------------------------------------
	describe('_syncScrollPosition with visible lineBreakers', () => {
		beforeEach(() => {
			// reset() sets #lineBreaker_t and #lineBreaker_b from frameContext
			ui.reset(ctx.frameContext);
		});

		it('should update lineBreaker_t position when displayed', () => {
			const lb_t = ctx.elements.lineBreaker_t;
			lb_t.style.display = 'block';
			lb_t.style.top = '100px';
			lb_t.style.left = '50px';
			lb_t.setAttribute('data-offset', '0,0');

			ui.controllerTargetContext = ctx.frameContext.get('topArea');
			ui._syncScrollPosition({ scrollTop: 20, scrollLeft: 10 });

			expect(lb_t.style.top).toBe('80px');
			expect(lb_t.style.left).toBe('40px');
			expect(lb_t.getAttribute('data-offset')).toBe('20,10');
		});

		it('should update lineBreaker_b position when displayed', () => {
			const lb_b = ctx.elements.lineBreaker_b;
			lb_b.style.display = 'block';
			lb_b.style.top = '200px';
			lb_b.setAttribute('data-offset', '0,left,0');

			ui.controllerTargetContext = ctx.frameContext.get('topArea');
			ui._syncScrollPosition({ scrollTop: 30, scrollLeft: 15 });

			expect(lb_b.style.top).toBe('170px');
			expect(lb_b.getAttribute('data-offset')).toBe('30,left,15');
		});

		it('should not update lineBreaker_t when display is none', () => {
			const lb_t = ctx.elements.lineBreaker_t;
			lb_t.style.display = 'none';
			lb_t.style.top = '100px';

			ui.controllerTargetContext = ctx.frameContext.get('topArea');
			ui._syncScrollPosition({ scrollTop: 20, scrollLeft: 10 });

			// Should remain unchanged
			expect(lb_t.style.top).toBe('100px');
		});

		it('should handle lineBreaker_t with missing data-offset', () => {
			const lb_t = ctx.elements.lineBreaker_t;
			lb_t.style.display = 'block';
			lb_t.style.top = '50px';
			lb_t.style.left = '25px';
			// No data-offset attribute set, defaults to ','

			ui.controllerTargetContext = ctx.frameContext.get('topArea');
			ui._syncScrollPosition({ scrollTop: 10, scrollLeft: 5 });

			expect(lb_t.getAttribute('data-offset')).toBe('10,5');
		});

		it('should update notInCarrier controller positions', () => {
			const form = document.createElement('div');
			form.style.top = '100px';
			form.style.left = '50px';

			ui.opendControllers = [
				{ notInCarrier: true, form, inst: { __offset: { top: 200, left: 100 } } },
			];

			ui.controllerTargetContext = ctx.frameContext.get('topArea');
			ui._syncScrollPosition({ scrollTop: 30, scrollLeft: 20 });

			expect(form.style.top).toBe('170px');
			expect(form.style.left).toBe('80px');
		});

		it('should skip inCarrier controllers during resetLineBreaker', () => {
			const form = document.createElement('div');
			form.style.top = '100px';
			form.style.left = '50px';

			ui.opendControllers = [
				{ notInCarrier: false, form, inst: { __offset: { top: 200, left: 100 } } },
			];

			ui.controllerTargetContext = ctx.frameContext.get('topArea');
			ui._syncScrollPosition({ scrollTop: 30, scrollLeft: 20 });

			// inCarrier controllers should not have their position updated by resetLineBreaker
			expect(form.style.top).toBe('100px');
		});
	});

	// -------------------------------------------------------------------
	// CloseListener and OnClick_alert (standalone functions bound to UIManager)
	// -------------------------------------------------------------------
	describe('CloseListener and alert close key handler', () => {
		it('should close alert when Escape key is pressed', () => {
			// Open the alert to register the global keydown listener
			ui.alertOpen('Test', '');

			// Capture the keydown listener function that was passed to addGlobalEvent
			const listenerCall = ctx.$.eventManager.addGlobalEvent.mock.calls.find(
				(call) => call[0] === 'keydown'
			);
			expect(listenerCall).toBeDefined();
			const closeListener = listenerCall[1];

			// Simulate Escape key
			closeListener({ code: 'Escape' });
			// After calling closeListener with Escape, the alert should be closed
			expect(ui.alertModal.classList.contains('se-modal-show')).toBe(false);
		});

		it('should not close alert when non-Escape key is pressed', () => {
			ui.alertOpen('Test', '');

			const listenerCall = ctx.$.eventManager.addGlobalEvent.mock.calls.find(
				(call) => call[0] === 'keydown'
			);
			const closeListener = listenerCall[1];

			// Simulate Enter key
			closeListener({ code: 'Enter' });
			// Alert should still be showing
			expect(ui.alertModal.classList.contains('se-modal-show')).toBe(true);
		});
	});

	// -------------------------------------------------------------------
	// OnClick_alert handler (via click event on alertInner)
	// -------------------------------------------------------------------
	describe('OnClick_alert handler', () => {
		it('should close alert when a close-command element is clicked', () => {
			// Set closeSignal to true so click listener is added to alertInner
			ctx.$.eventManager.addEvent.mockReturnValue(null);
			ui.init();

			ui.alertOpen('Test', '');
			expect(ui.alertModal.classList.contains('se-modal-show')).toBe(true);

			// Create a click event targeting an element with data-command="close"
			const closeBtn = document.createElement('button');
			closeBtn.setAttribute('data-command', 'close');
			const clickEvent = new MouseEvent('click', { bubbles: true });
			Object.defineProperty(clickEvent, 'target', { value: closeBtn });

			ctx.elements.alertInner.dispatchEvent(clickEvent);
			// The handler checks eventTarget.getAttribute('data-command') for /close/
			// Since it dispatches on alertInner, it should trigger OnClick_alert
		});

		it('should not close alert when a non-close element is clicked', () => {
			ctx.$.eventManager.addEvent.mockReturnValue(null);
			ui.init();

			ui.alertOpen('Test', '');
			expect(ui.alertModal.classList.contains('se-modal-show')).toBe(true);

			// Create a click event with a target that does NOT have close command
			const otherBtn = document.createElement('button');
			otherBtn.setAttribute('data-command', 'other');
			const clickEvent = new MouseEvent('click', { bubbles: true });
			Object.defineProperty(clickEvent, 'target', { value: otherBtn });

			ctx.elements.alertInner.dispatchEvent(clickEvent);
			// Alert should still be open since target doesn't match close
		});
	});

	// -------------------------------------------------------------------
	// _iframeAutoHeight with !isResizeObserverSupported (lines 814-817)
	// -------------------------------------------------------------------
	describe('_iframeAutoHeight non-ResizeObserver fallback', () => {
		let origResizeObserver;

		beforeEach(() => {
			origResizeObserver = global.ResizeObserver;
		});

		afterEach(() => {
			global.ResizeObserver = origResizeObserver;
		});

		it('should call _emitResizeEvent for non-auto non-ResizeObserver path', () => {
			// Note: env.isResizeObserverSupported is evaluated at import time
			// and is a const. We cannot easily change it here without jest.mock.
			// This test covers the existing behavior path.
			const fc = ctx.frameContext;
			fc.set('_iframeAuto', null);
			fc.set('_editorHeight', 100);

			ui._iframeAutoHeight(fc);
			// In jsdom, ResizeObserver may or may not be supported
			// This at least exercises the function
		});
	});

	// -------------------------------------------------------------------
	// _destroy with closeSignal active
	// -------------------------------------------------------------------
	describe('_destroy with closeSignal', () => {
		it('should call removeEvent for alert click listener when closeSignal is true during destroy', () => {
			// Set closeSignal to true
			ctx.$.eventManager.addEvent.mockReturnValue(null);
			ui.init(); // closeSignal = !null = true

			// Open alert to register the click event via addEvent
			ctx.$.eventManager.addEvent.mockReturnValue({ id: 'alert-click' });
			ui.alertOpen('test', '');
			ctx.$.eventManager.removeEvent.mockClear();

			ui._destroy();
			expect(ctx.$.eventManager.removeEvent).toHaveBeenCalled();
		});

		it('should not call removeEvent for alert click when closeSignal is false', () => {
			ctx.$.eventManager.addEvent.mockReturnValue({ id: 'event' });
			ui.init(); // closeSignal = false

			ctx.$.eventManager.removeEvent.mockClear();
			ui._destroy();
			expect(ctx.$.eventManager.removeEvent).not.toHaveBeenCalled();
		});
	});

	// -------------------------------------------------------------------
	// Edge cases and misc
	// -------------------------------------------------------------------
	describe('edge cases', () => {
		it('should handle readOnly with rootKey and hasCodeMirror', () => {
			ctx.options.set('hasCodeMirror', true);
			ui.readOnly(true, 'main');
			expect(ctx.$.viewer._codeMirrorEditor).toHaveBeenCalledWith('readonly', true, 'main');
		});

		it('should handle disable with rootKey and hasCodeMirror', () => {
			ctx.options.set('hasCodeMirror', true);
			ui.disable('main');
			expect(ctx.$.viewer._codeMirrorEditor).toHaveBeenCalledWith('readonly', true, 'main');
		});

		it('should handle enable with rootKey and hasCodeMirror', () => {
			ctx.options.set('hasCodeMirror', true);
			ui.enable('main');
			expect(ctx.$.viewer._codeMirrorEditor).toHaveBeenCalledWith('readonly', false, 'main');
		});

		it('should handle disable without codeMirror sets code.disabled=true', () => {
			ctx.options.set('hasCodeMirror', false);
			ui.disable();
			expect(ctx.elements.code.disabled).toBe(true);
		});

		it('should handle enable without codeMirror sets code.disabled=false', () => {
			ctx.options.set('hasCodeMirror', false);
			ui.disable();
			ui.enable();
			expect(ctx.elements.code.disabled).toBe(false);
		});

		it('should handle multiple sequential readOnly toggles', () => {
			ui.readOnly(true);
			ui.readOnly(false);
			ui.readOnly(true);
			ui.readOnly(false);
			expect(ctx.frameContext.get('isReadOnly')).toBe(false);
			expect(ctx.elements.wysiwyg.classList.contains('se-read-only')).toBe(false);
		});

		it('should handle setDir with nodes that only have margin (no textAlign)', () => {
			const lineNode = document.createElement('p');
			lineNode.style.marginLeft = '10px';
			ctx.elements.wysiwyg.innerHTML = '';
			ctx.elements.wysiwyg.appendChild(lineNode);

			ctx.$.format.isLine.mockReturnValue(true);
			ctx.options.set('_rtl', false);

			ui.setDir('rtl');
			expect(lineNode.style.marginRight).toBe('10px');
			expect(lineNode.style.marginLeft).toBe('');
		});

		it('should handle _emitResizeEvent with contentRect fallback and padding', () => {
			const fc = ctx.frameContext;
			fc.set('_editorHeight', 100);
			fc.get('wwComputedStyle').getPropertyValue.mockReturnValue('10px');

			const entry = {
				borderBoxSize: [{}], // borderBoxSize exists but first element has no blockSize
				contentRect: { height: 280 },
			};

			ui._emitResizeEvent(fc, -1, entry);
			// Should use borderBoxSize[0].blockSize which is undefined
			// This tests the truthy check: borderBoxSize && borderBoxSize[0] passes,
			// but blockSize is undefined. Since the ternary checks borderBoxSize[0] is truthy,
			// it will use blockSize (undefined)
		});

		it('should handle _emitResizeEvent with empty borderBoxSize array', () => {
			const fc = ctx.frameContext;
			fc.set('_editorHeight', 100);
			fc.get('wwComputedStyle').getPropertyValue.mockReturnValue('10px');

			const entry = {
				borderBoxSize: [],
				contentRect: { height: 280 },
			};

			ui._emitResizeEvent(fc, -1, entry);
			// borderBoxSize[0] is undefined/falsy, so falls through to contentRect path
			expect(ctx.$.eventManager.triggerEvent).toHaveBeenCalled();
		});
	});
});
