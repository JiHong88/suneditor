import Toolbar from '../../../../src/core/class/toolbar';
import CoreInjector from '../../../../src/editorInjector/_core';
import { dom, env } from '../../../../src/helper';
import { CreateToolBar, UpdateButton } from '../../../../src/core/section/constructor';

// Mock dependencies
jest.mock('../../../../src/editorInjector/_core');
jest.mock('../../../../src/helper', () => ({
	dom: {
		utils: {
			setDisabled: jest.fn(),
			addClass: jest.fn(),
			removeClass: jest.fn(),
			getArrayIndex: jest.fn(),
		},
		query: {
			getListChildNodes: jest.fn(),
			getParentElement: jest.fn(),
		},
	},
	env: {
		_w: {
			visualViewport: {
				pageTop: 0,
				offsetTop: 0,
			},
			scrollY: 0,
		},
	},
}));

jest.mock('../../../../src/core/section/constructor', () => ({
	CreateToolBar: jest.fn(),
	UpdateButton: jest.fn(),
}));

describe('Toolbar', () => {
	let toolbar;
	let mockEditor;
	let mockContext;
	let mockFrameContext;
	let mockOffset;
	let mockMenu;
	let mockOptions;

	beforeEach(() => {
		jest.clearAllMocks();

		// Mock DOM elements
		const mockToolbar = document.createElement('div');
		const mockButtonTray = document.createElement('div');
		const mockStickyDummy = document.createElement('div');
		const mockWrapper = document.createElement('div');
		const mockTopArea = document.createElement('div');

		Object.defineProperty(mockToolbar, 'offsetWidth', { get: () => 800 });
		Object.defineProperty(mockToolbar, 'offsetHeight', { get: () => 40 });
		Object.defineProperty(mockWrapper, 'offsetHeight', { get: () => 400 });
		Object.defineProperty(mockTopArea, 'offsetWidth', { get: () => 800 });

		// Mock querySelectorAll for buttons
		mockButtonTray.querySelectorAll = jest.fn().mockReturnValue([]);
		mockToolbar.querySelector = jest.fn().mockReturnValue(document.createElement('div'));

		// Mock CreateToolBar return value in beforeEach
		CreateToolBar.mockReturnValue({
			buttonTray: document.createElement('div'),
			updateButtons: [],
		});

		mockContext = new Map([
			['toolbar_main', mockToolbar],
			['toolbar_buttonTray', mockButtonTray],
			['_stickyDummy', mockStickyDummy],
		]);
		mockContext.get = jest.fn().mockImplementation((key) => {
			const map = new Map([
				['toolbar_main', mockToolbar],
				['toolbar_buttonTray', mockButtonTray],
				['_stickyDummy', mockStickyDummy],
			]);
			return map.get(key);
		});
		mockContext.set = jest.fn();

		mockFrameContext = new Map([
			['_stickyDummy', mockStickyDummy],
			['wrapper', mockWrapper],
			['topArea', mockTopArea],
			['_minHeight', 200],
			['isFullScreen', false],
			['isReadOnly', false],
			['key', 'main'],
		]);
		mockFrameContext.get = jest.fn().mockImplementation((key) => {
			const map = new Map([
				['_stickyDummy', mockStickyDummy],
				['wrapper', mockWrapper],
				['topArea', mockTopArea],
				['_minHeight', 200],
				['isFullScreen', false],
				['isReadOnly', false],
				['key', 'main'],
			]);
			return map.get(key);
		});

		mockOffset = {
			getGlobal: jest.fn().mockReturnValue({ top: 0, left: 0 }),
			setRangePosition: jest.fn().mockReturnValue(true),
			getWWScroll: jest.fn().mockReturnValue({ top: 0, left: 0 }),
		};

		mockMenu = {
			dropdownOff: jest.fn(),
			containerOff: jest.fn(),
		};

		mockOptions = {
			get: jest.fn().mockImplementation((key) => {
				switch (key) {
					case 'toolbar_width':
						return 'auto';
					case 'toolbar_sub_width':
						return 'auto';
					case 'toolbar_sticky':
						return 0;
					case 'toolbar_container':
						return null;
					default:
						return null;
				}
			}),
		};

		mockEditor = {
			__options: {},
			allCommandButtons: new Map(),
			subAllCommandButtons: new Map(),
			commandDispatcher: {
				targets: new Map(),
				resetTargets: jest.fn(),
				applyTargets: jest.fn(),
				run: jest.fn(),
				runFromTarget: jest.fn(),
			},
			shortcuts: {
				command: jest.fn().mockReturnValue(false),
				enable: jest.fn(),
				disable: jest.fn(),
				_registerCustomShortcuts: jest.fn(),
				keyMap: new Map(),
				reverseKeys: []
			},
			shortcutsKeyMap: new Map(),
			effectNode: null,
			isSubBalloon: false,
			__cachingButtons: jest.fn(),
			// Include all properties that getters will access via this.editor.xxx
			context: mockContext,
			frameContext: mockFrameContext,
			offset: mockOffset,
			menu: mockMenu,
			options: mockOptions,
			plugins: {},
			icons: {},
			lang: {},
			selection: {
				getRange: jest.fn().mockReturnValue({ collapsed: false }),
				get: jest.fn().mockReturnValue({
					focusNode: document.createTextNode(''),
					anchorNode: document.createTextNode(''),
					focusOffset: 0,
					anchorOffset: 5,
				}),
			},
			history: {
				resetButtons: jest.fn(),
			},
			viewer: {
				_setButtonsActive: jest.fn(),
			},
			uiManager: {
				setControllerOnDisabledButtons: jest.fn(),
				_initToggleButtons: jest.fn(),
			},
			eventManager: {
				applyTagEffect: jest.fn(),
			},
			status: {
				hasFocus: false,
			},
			triggerEvent: jest.fn(),
		};

		// Mock CoreInjector.call - set editor reference and other properties that CoreInjector normally sets
		CoreInjector.mockImplementation(function (editor) {
			this.editor = editor;
			// CoreInjector sets these directly (not via getters)
			this.context = editor.context;
			this.frameContext = editor.frameContext;
			this.options = editor.options;
			this.plugins = editor.plugins;
			this.icons = editor.icons;
			this.lang = editor.lang;
			this.eventManager = editor.eventManager;
			this.history = editor.history;
			this.status = editor.status;
			this.triggerEvent = editor.triggerEvent;
			this.commandDispatcher = editor.commandDispatcher;
			this.uiManager = editor.uiManager;
		});

		const options = {
			keyName: 'toolbar',
			balloon: false,
			inline: false,
			balloonAlways: false,
			res: [['default'], [768, 'mobile']],
		};

		toolbar = new Toolbar(mockEditor, options);
	});

	describe('constructor', () => {
		it('should initialize main toolbar correctly', () => {
			expect(toolbar.isSub).toBe(false);
			expect(toolbar.keyName.main).toBe('toolbar_main');
			expect(toolbar.keyName.buttonTray).toBe('toolbar_buttonTray');
			expect(toolbar.keyName.width).toBe('toolbar_width');
			expect(toolbar.isSticky).toBe(false);
		});

		it('should initialize sub toolbar correctly', () => {
			const subOptions = {
				keyName: 'toolbar_sub',
				balloon: true,
				inline: true,
				balloonAlways: true,
				res: [],
			};

			const subToolbar = new Toolbar(mockEditor, subOptions);

			expect(subToolbar.isSub).toBe(true);
			expect(subToolbar.keyName.main).toBe('toolbar_sub_main');
			expect(subToolbar.keyName.buttonTray).toBe('toolbar_sub_buttonTray');
			expect(subToolbar.keyName.width).toBe('toolbar_sub_width');
		});

		it('should call CoreInjector constructor', () => {
			expect(CoreInjector).toHaveBeenCalledWith(mockEditor);
		});
	});

	describe('disable', () => {
		it('should disable toolbar buttons and close menus', () => {
			toolbar._moreLayerOff = jest.fn();

			toolbar.disable();

			expect(toolbar._moreLayerOff).toHaveBeenCalled();
			expect(mockMenu.dropdownOff).toHaveBeenCalled();
			expect(mockMenu.containerOff).toHaveBeenCalled();
			expect(dom.utils.setDisabled).toHaveBeenCalledWith([], true);
		});
	});

	describe('enable', () => {
		it('should enable toolbar buttons', () => {
			toolbar.enable();

			expect(dom.utils.setDisabled).toHaveBeenCalledWith([], false);
		});
	});

	describe('show', () => {
		it('should show inline toolbar', () => {
			const inlineToolbar = new Toolbar(mockEditor, {
				keyName: 'toolbar',
				balloon: false,
				inline: true,
				balloonAlways: false,
				res: [['default'], [768, 'mobile']],
			});
			inlineToolbar._showInline = jest.fn();

			inlineToolbar.show();

			expect(inlineToolbar._showInline).toHaveBeenCalled();
		});

		it('should show balloon toolbar', () => {
			const balloonToolbar = new Toolbar(mockEditor, {
				keyName: 'toolbar',
				balloon: true,
				inline: false,
				balloonAlways: false,
				res: [['default'], [768, 'mobile']],
			});
			balloonToolbar._showBalloon = jest.fn();

			balloonToolbar.show();

			expect(balloonToolbar._showBalloon).toHaveBeenCalled();
		});

		it('should show regular toolbar', () => {
			toolbar.resetResponsiveToolbar = jest.fn();

			toolbar.show();

			expect(mockContext.get('toolbar_main').style.display).toBe('');
			expect(mockFrameContext.get('_stickyDummy').style.display).toBe('');
			expect(toolbar.resetResponsiveToolbar).toHaveBeenCalled();
		});

		it('should not affect sticky dummy for sub toolbar', () => {
			toolbar.isSub = true;
			toolbar.resetResponsiveToolbar = jest.fn();

			toolbar.show();

			expect(toolbar.resetResponsiveToolbar).not.toHaveBeenCalled();
		});
	});

	describe('hide', () => {
		it('should hide inline toolbar', () => {
			const inlineToolbar = new Toolbar(mockEditor, {
				keyName: 'toolbar',
				balloon: false,
				inline: true,
				balloonAlways: false,
				res: [['default'], [768, 'mobile']],
			});

			inlineToolbar.hide();

			expect(inlineToolbar.context.get(inlineToolbar.keyName.main).style.display).toBe('none');
			expect(inlineToolbar.context.get(inlineToolbar.keyName.main).style.top).toBe('0px');
			expect(inlineToolbar.inlineToolbarAttr.isShow).toBe(false);
		});

		it('should hide balloon toolbar', () => {
			const balloonToolbar = new Toolbar(mockEditor, {
				keyName: 'toolbar',
				balloon: true,
				inline: false,
				balloonAlways: false,
				res: [['default'], [768, 'mobile']],
			});

			balloonToolbar.hide();

			expect(balloonToolbar.context.get(balloonToolbar.keyName.main).style.display).toBe('none');
			expect(balloonToolbar.frameContext.get('_stickyDummy').style.display).toBe('none');
			expect(balloonToolbar.balloonOffset).toEqual({ top: 0, left: 0 });
		});

		it('should hide regular toolbar', () => {
			toolbar.hide();

			expect(mockContext.get('toolbar_main').style.display).toBe('none');
			expect(mockFrameContext.get('_stickyDummy').style.display).toBe('none');
		});
	});

	describe('resetResponsiveToolbar', () => {
		it('should reset responsive toolbar with default size', () => {
			const resetSpy = jest.spyOn(toolbar, 'setButtons').mockImplementation(() => {});

			toolbar.resetResponsiveToolbar();

			expect(mockMenu.containerOff).toHaveBeenCalled();
			expect(resetSpy).not.toHaveBeenCalled();
			resetSpy.mockRestore();
		});

		it('should update responsive size when needed', () => {
			const setButtonsSpy = jest.spyOn(toolbar, 'setButtons').mockImplementation(() => {});

			// Create a new mock toolbar with narrow width
			const narrowToolbar = document.createElement('div');
			Object.defineProperty(narrowToolbar, 'offsetWidth', { get: () => 500 });
			const originalGet = mockContext.get;
			mockContext.get = jest.fn((key) => {
				if (key === 'toolbar_main') return narrowToolbar;
				return originalGet(key);
			});

			toolbar.resetResponsiveToolbar();

			expect(setButtonsSpy).toHaveBeenCalledWith('mobile');
			setButtonsSpy.mockRestore();
		});

		it('should handle balloon/inline auto width', () => {
			const balloonToolbar = new Toolbar(mockEditor, {
				keyName: 'toolbar',
				balloon: true,
				inline: false,
				balloonAlways: false,
				res: [['default'], [768, 'mobile']],
			});
			const setButtonsSpy = jest.spyOn(balloonToolbar, 'setButtons').mockImplementation(() => {});

			// Mock narrow topArea width to trigger responsive change
			const narrowTopArea = document.createElement('div');
			Object.defineProperty(narrowTopArea, 'offsetWidth', { get: () => 500 });
			const originalFrameGet = mockFrameContext.get;
			balloonToolbar.frameContext.get = jest.fn((key) => {
				if (key === 'topArea') return narrowTopArea;
				return originalFrameGet(key);
			});

			balloonToolbar.resetResponsiveToolbar();

			expect(setButtonsSpy).toHaveBeenCalledWith('mobile');
			setButtonsSpy.mockRestore();
		});
	});

	describe('setButtons', () => {
		it('should set new buttons and reset toolbar', () => {
			const buttonList = [{ name: 'bold' }];
			const mockButtonTray = document.createElement('div');
			const mockNewToolbar = {
				buttonTray: mockButtonTray,
				updateButtons: [{ button: document.createElement('button'), plugin: {} }],
			};

			CreateToolBar.mockReturnValue(mockNewToolbar);
			toolbar._moreLayerOff = jest.fn();

			// Mock replaceChild
			const mockMain = mockContext.get('toolbar_main');
			mockMain.replaceChild = jest.fn();

			toolbar.setButtons(buttonList);

			expect(toolbar._moreLayerOff).toHaveBeenCalled();
			expect(mockMenu.dropdownOff).toHaveBeenCalled();
			expect(mockMenu.containerOff).toHaveBeenCalled();
			expect(CreateToolBar).toHaveBeenCalledWith(buttonList, {}, mockOptions, {}, {}, true);
			expect(UpdateButton).toHaveBeenCalled();
			expect(mockMain.replaceChild).toHaveBeenCalledWith(mockButtonTray, mockContext.get('toolbar_buttonTray'));
			expect(mockContext.set).toHaveBeenCalledWith('toolbar_buttonTray', mockButtonTray);
			// Verify button info was reset (refactored from __cachingButtons)
			expect(mockEditor.commandDispatcher.resetTargets).toHaveBeenCalled();
			expect(toolbar.triggerEvent).toHaveBeenCalledWith('onSetToolbarButtons', {
				buttonTray: mockButtonTray,
				frameContext: mockFrameContext,
			});
		});
	});

	describe('setButtons - button info reset behavior', () => {
		it('should reset all button info and apply effects when setButtons is called', () => {
			const buttonList = [{ name: 'bold' }];
			const mockButtonTray = document.createElement('div');
			const mockNewToolbar = {
				buttonTray: mockButtonTray,
				updateButtons: [],
			};
			CreateToolBar.mockReturnValue(mockNewToolbar);
			toolbar._moreLayerOff = jest.fn();

			const mockMain = mockContext.get('toolbar_main');
			mockMain.replaceChild = jest.fn();

			toolbar.setButtons(buttonList);

			// Verify commandDispatcher.resetTargets was called (refactored from __cachingButtons)
			expect(mockEditor.commandDispatcher.resetTargets).toHaveBeenCalled();
			expect(toolbar.history.resetButtons).toHaveBeenCalled();
			expect(mockEditor.effectNode).toBeNull();
			expect(mockEditor.viewer._setButtonsActive).toHaveBeenCalled();
		});

		it('should apply tag effect when focused after setButtons', () => {
			toolbar.status.hasFocus = true;
			const buttonList = [{ name: 'bold' }];
			const mockButtonTray = document.createElement('div');
			CreateToolBar.mockReturnValue({
				buttonTray: mockButtonTray,
				updateButtons: [],
			});
			toolbar._moreLayerOff = jest.fn();
			mockContext.get('toolbar_main').replaceChild = jest.fn();

			toolbar.setButtons(buttonList);

			expect(toolbar.eventManager.applyTagEffect).toHaveBeenCalled();
		});

		it('should handle readonly state after setButtons', () => {
			const originalGet = mockFrameContext.get;
			mockFrameContext.get = jest.fn().mockImplementation((key) => {
				if (key === 'isReadOnly') return true;
				return originalGet.call(mockFrameContext, key);
			});
			const buttonList = [{ name: 'bold' }];
			const mockButtonTray = document.createElement('div');
			CreateToolBar.mockReturnValue({
				buttonTray: mockButtonTray,
				updateButtons: [],
			});
			toolbar._moreLayerOff = jest.fn();
			mockContext.get('toolbar_main').replaceChild = jest.fn();

			toolbar.setButtons(buttonList);

			expect(mockEditor.uiManager.setControllerOnDisabledButtons).toHaveBeenCalledWith(true);
		});
	});

	describe('sticky behavior via public API', () => {
		it('should not enable sticky when no wrapper exists', () => {
			const mockStickyDummy = mockFrameContext.get('_stickyDummy');
			const mockTopArea = mockFrameContext.get('topArea');
			const mockMinHeight = mockFrameContext.get('_minHeight');

			mockFrameContext.get = jest.fn().mockImplementation((key) => {
				if (key === 'wrapper') return null;
				if (key === '_stickyDummy') return mockStickyDummy;
				if (key === 'topArea') return mockTopArea;
				if (key === '_minHeight') return mockMinHeight;
				if (key === 'isFullScreen') return false;
				if (key === 'isReadOnly') return false;
				if (key === 'key') return 'main';
				return null;
			});

			// Trigger sticky check via show() - should not throw
			toolbar.show();

			expect(toolbar.isSticky).toBe(false);
		});

		it('should not enable sticky when in fullscreen mode', () => {
			const mockWrapper = mockFrameContext.get('wrapper');
			const mockStickyDummy = mockFrameContext.get('_stickyDummy');
			const mockTopArea = mockFrameContext.get('topArea');
			const mockMinHeight = mockFrameContext.get('_minHeight');

			mockFrameContext.get = jest.fn().mockImplementation((key) => {
				if (key === 'isFullScreen') return true;
				if (key === 'wrapper') return mockWrapper;
				if (key === '_stickyDummy') return mockStickyDummy;
				if (key === 'topArea') return mockTopArea;
				if (key === '_minHeight') return mockMinHeight;
				if (key === 'isReadOnly') return false;
				if (key === 'key') return 'main';
				return null;
			});

			toolbar.show();

			expect(toolbar.isSticky).toBe(false);
		});

		it('should enable sticky mode when scrolled past threshold', () => {
			env._w.scrollY = 300;
			mockOffset.getGlobal.mockReturnValue({ top: 0, left: 0 });

			toolbar._resetSticky();

			expect(toolbar.isSticky).toBe(true);
			expect(dom.utils.addClass).toHaveBeenCalledWith(mockContext.get('toolbar_main'), 'se-toolbar-sticky');
		});

		it('should disable sticky mode when above threshold', () => {
			env._w.scrollY = 0;
			mockOptions.get.mockImplementation((key) => {
				if (key === 'toolbar_sticky') return 0;
				return null;
			});
			mockOffset.getGlobal.mockReturnValue({ top: 100, left: 0 });

			toolbar._resetSticky();

			expect(toolbar.isSticky).toBe(false);
			expect(dom.utils.removeClass).toHaveBeenCalledWith(mockContext.get('toolbar_main'), 'se-toolbar-sticky');
		});

		it('should apply correct styles when sticky is enabled', () => {
			env._w.scrollY = 300;
			mockOffset.getGlobal.mockReturnValue({ top: 0, left: 0 });

			toolbar._resetSticky();

			const mockToolbar = mockContext.get('toolbar_main');
			const mockStickyDummy = mockFrameContext.get('_stickyDummy');
			expect(mockStickyDummy.style.height).toBe('40px');
			expect(mockStickyDummy.style.display).toBe('block');
			expect(mockToolbar.style.width).toBe('800px');
		});

		it('should handle inline toolbar width when sticky', () => {
			const inlineToolbar = new Toolbar(mockEditor, {
				keyName: 'toolbar',
				balloon: false,
				inline: true,
				balloonAlways: false,
				res: [['default'], [768, 'mobile']],
			});
			inlineToolbar.inlineToolbarAttr.width = '500px';
			env._w.scrollY = 300;
			mockOffset.getGlobal.mockReturnValue({ top: 0, left: 0 });

			inlineToolbar._resetSticky();

			expect(mockContext.get('toolbar_main').style.width).toBe('500px');
		});

		it('should restore inline toolbar attributes when sticky is disabled', () => {
			const inlineToolbar = new Toolbar(mockEditor, {
				keyName: 'toolbar',
				balloon: false,
				inline: true,
				balloonAlways: false,
				res: [['default'], [768, 'mobile']],
			});
			inlineToolbar.inlineToolbarAttr = { top: '10px', width: '500px' };
			env._w.scrollY = 0;
			mockOptions.get.mockImplementation((key) => {
				if (key === 'toolbar_sticky') return 0;
				return null;
			});
			mockOffset.getGlobal.mockReturnValue({ top: 100, left: 0 });

			inlineToolbar._resetSticky();

			const mockToolbar = mockContext.get('toolbar_main');
			expect(mockToolbar.style.top).toBe('10px');
			expect(mockToolbar.style.width).toBe('500px');
		});
	});

	describe('viewport top handling via sticky behavior', () => {
		it('should use viewport offset when available during sticky', () => {
			const originalViewport = env._w.visualViewport;
			env._w.visualViewport = { offsetTop: 50, pageTop: 0 };
			const viewToolbar = new Toolbar(mockEditor, {
				keyName: 'toolbar',
				balloon: false,
				inline: false,
				balloonAlways: false,
				res: [['default'], [768, 'mobile']],
			});
			env._w.visualViewport.offsetTop = 50;
			env._w.scrollY = 300;
			mockOffset.getGlobal.mockReturnValue({ top: 0, left: 0 });

			viewToolbar._resetSticky();

			// Verify sticky is enabled with viewport offset applied
			expect(viewToolbar.isSticky).toBe(true);
			// The top position should include the viewport offset (50)
			const mockToolbar = viewToolbar.context.get(viewToolbar.keyName.main);
			expect(mockToolbar.style.top).toContain('px');

			env._w.visualViewport = originalViewport;
		});

		it('should not use viewport offset when not available', () => {
			const originalViewport = env._w.visualViewport;
			delete env._w.visualViewport;
			const viewToolbar = new Toolbar(mockEditor, {
				keyName: 'toolbar',
				balloon: false,
				inline: false,
				balloonAlways: false,
				res: [['default'], [768, 'mobile']],
			});
			env._w.scrollY = 300;
			mockOffset.getGlobal.mockReturnValue({ top: 0, left: 0 });

			viewToolbar._resetSticky();

			expect(viewToolbar.isSticky).toBe(true);

			env._w.visualViewport = originalViewport;
		});
	});

	describe('_setResponsive', () => {
		it('should setup responsive configuration', () => {
			const options = {
				keyName: 'toolbar',
				balloon: false,
				inline: false,
				balloonAlways: false,
				res: [['default'], [768, 'mobile'], [480, 'small']],
			};

			const responsiveToolbar = new Toolbar(mockEditor, options);

			const setButtonsSpy = jest.spyOn(responsiveToolbar, 'setButtons').mockImplementation(() => {});

			// Trigger responsive change for small width
			const narrowToolbar = document.createElement('div');
			Object.defineProperty(narrowToolbar, 'offsetWidth', { get: () => 470, configurable: true });
			responsiveToolbar.context.get = jest.fn((key) => {
				if (key === 'toolbar_main') return narrowToolbar;
				return mockContext.get(key);
			});

			responsiveToolbar.resetResponsiveToolbar();

			expect(setButtonsSpy).toHaveBeenCalledWith('small');

			// Trigger change for medium width
			Object.defineProperty(narrowToolbar, 'offsetWidth', { get: () => 700, configurable: true });
			responsiveToolbar.resetResponsiveToolbar();

			expect(setButtonsSpy).toHaveBeenCalledWith('mobile');
			setButtonsSpy.mockRestore();
		});

		it('should handle empty responsive array', () => {
			const options = {
				keyName: 'toolbar',
				balloon: false,
				inline: false,
				balloonAlways: false,
				res: [],
			};

			const responsiveToolbar = new Toolbar(mockEditor, options);
			const setButtonsSpy = jest.spyOn(responsiveToolbar, 'setButtons').mockImplementation(() => {});

			expect(() => responsiveToolbar.resetResponsiveToolbar()).not.toThrow();
			expect(setButtonsSpy).not.toHaveBeenCalled();
			setButtonsSpy.mockRestore();
		});
	});

	describe('_showBalloon', () => {
		beforeEach(() => {
			toolbar._setBalloonOffset = jest.fn();
		});

		it('should return early if not balloon mode', () => {
			toolbar = new Toolbar(mockEditor, {
				keyName: 'toolbar',
				balloon: false,
				inline: false,
				balloonAlways: false,
				res: [['default'], [768, 'mobile']],
			});
			toolbar._setBalloonOffset = jest.fn();

			toolbar._showBalloon();

			expect(toolbar._setBalloonOffset).not.toHaveBeenCalled();
		});

		it('should show balloon with selection range', () => {
			toolbar = new Toolbar(mockEditor, {
				keyName: 'toolbar',
				balloon: true,
				inline: false,
				balloonAlways: false,
				res: [['default'], [768, 'mobile']],
			});
			toolbar._setBalloonOffset = jest.fn();
			const mockRange = { collapsed: false, commonAncestorContainer: document.createElement('div') };
			mockEditor.selection.getRange.mockReturnValue(mockRange);

			toolbar._showBalloon();

			expect(toolbar._setBalloonOffset).toHaveBeenCalledWith(false, mockRange);
			expect(toolbar.triggerEvent).toHaveBeenCalledWith('onShowToolbar', {
				toolbar: mockContext.get('toolbar_main'),
				mode: 'balloon',
				frameContext: mockFrameContext,
			});
		});

		it('should handle always balloon with collapsed range', () => {
			toolbar = new Toolbar(mockEditor, {
				keyName: 'toolbar',
				balloon: true,
				inline: false,
				balloonAlways: true,
				res: [['default'], [768, 'mobile']],
			});
			toolbar._setBalloonOffset = jest.fn();
			const mockRange = { collapsed: true };
			mockEditor.selection.getRange.mockReturnValue(mockRange);

			toolbar._showBalloon();

			expect(toolbar._setBalloonOffset).toHaveBeenCalledWith(true, mockRange);
		});

		it('should reset responsive toolbar for sub', () => {
			const subToolbar = new Toolbar(mockEditor, {
				keyName: 'toolbar_sub',
				balloon: true,
				inline: false,
				balloonAlways: false,
				res: [['default'], [768, 'mobile']],
			});
			subToolbar._setBalloonOffset = jest.fn();
			subToolbar.resetResponsiveToolbar = jest.fn();

			subToolbar._showBalloon();

			expect(subToolbar.resetResponsiveToolbar).toHaveBeenCalled();
		});
	});

	describe('_setBalloonOffset', () => {
		it('should set balloon position', () => {
			const mockRange = {};
			const mockToolbar = mockContext.get('toolbar_main');
			Object.defineProperty(mockToolbar, 'offsetTop', { get: () => 100 });
			Object.defineProperty(mockToolbar, 'offsetLeft', { get: () => 50 });

			toolbar._setBalloonOffset(true, mockRange);

			expect(mockOffset.setRangePosition).toHaveBeenCalledWith(mockToolbar, mockRange, {
				position: 'top',
				addTop: 0,
			});
			expect(toolbar.balloonOffset).toEqual({
				top: 100,
				left: 50,
				position: 'top',
			});
		});

		it('should hide when position setting fails', () => {
			mockOffset.setRangePosition.mockReturnValue(false);
			toolbar.hide = jest.fn();

			toolbar._setBalloonOffset(true, {});

			expect(toolbar.hide).toHaveBeenCalled();
		});

		it('should handle toolbar container', () => {
			const mockContainer = document.createElement('div');
			const mockParent = document.createElement('div');
			const mockTopArea = mockFrameContext.get('topArea');

			Object.defineProperty(mockContainer, 'offsetLeft', { get: () => 10 });
			Object.defineProperty(mockContainer, 'offsetTop', { get: () => 20 });
			Object.defineProperty(mockContainer, 'offsetParent', { get: () => mockParent });
			Object.defineProperty(mockTopArea, 'offsetLeft', { get: () => 5 });
			Object.defineProperty(mockTopArea, 'offsetTop', { get: () => 8 });

			// Mock parentElement using Object.defineProperty
			Object.defineProperty(mockContainer, 'parentElement', {
				get: () => mockParent,
				configurable: true,
			});
			Object.defineProperty(mockParent, 'nodeName', { get: () => 'BODY' });
			mockParent.contains = jest.fn().mockReturnValue(true);

			mockOptions.get.mockImplementation((key) => {
				if (key === 'toolbar_container') return mockContainer;
				return null;
			});

			const mockToolbar = mockContext.get('toolbar_main');
			Object.defineProperty(mockToolbar, 'offsetTop', { get: () => 100 });
			Object.defineProperty(mockToolbar, 'offsetLeft', { get: () => 50 });

			toolbar._setBalloonOffset(false, {});

			expect(mockToolbar.style.left).toBe('45px'); // 50 - 10 + 5
			expect(mockToolbar.style.top).toBe('88px'); // 100 - 20 + 8
		});
	});

	describe('_showInline', () => {
		it('should return early if not inline mode', () => {
			const inlineToolbar = new Toolbar(mockEditor, {
				keyName: 'toolbar',
				balloon: false,
				inline: false,
				balloonAlways: false,
				res: [['default'], [768, 'mobile']],
			});
			const mockToolbar = inlineToolbar.context.get(inlineToolbar.keyName.main);
			const initialDisplay = mockToolbar.style.display;

			inlineToolbar._showInline();

			// Should not change display since it returns early
			expect(mockToolbar.style.display).toBe(initialDisplay);
		});

		it('should show inline toolbar', () => {
			const inlineToolbar = new Toolbar(mockEditor, {
				keyName: 'toolbar',
				balloon: false,
				inline: true,
				balloonAlways: false,
				res: [['default'], [768, 'mobile']],
			});

			const mockToolbar = inlineToolbar.context.get(inlineToolbar.keyName.main);
			inlineToolbar.options.get = jest.fn((key) => {
				if (key === 'toolbar_width') return '100%';
				return null;
			});

			inlineToolbar._showInline();

			expect(mockToolbar.style.visibility).toBe('');
			expect(mockToolbar.style.display).toBe('block');
			expect(inlineToolbar.inlineToolbarAttr.width).toBe('100%');
			expect(inlineToolbar.inlineToolbarAttr.isShow).toBe(true);
			expect(inlineToolbar.triggerEvent).toHaveBeenCalledWith('onShowToolbar', {
				toolbar: mockToolbar,
				mode: 'inline',
				frameContext: inlineToolbar.frameContext,
			});
		});
	});

	describe('_moreLayerOn', () => {
		it('should show more layer', () => {
			const mockButton = document.createElement('button');
			const mockLayer = document.createElement('div');
			toolbar._moreLayerOff = jest.fn();

			toolbar._moreLayerOn(mockButton, mockLayer);

			expect(toolbar._moreLayerOff).toHaveBeenCalled();
			expect(toolbar.currentMoreLayerActiveButton).toBe(mockButton);
			expect(mockLayer.style.display).toBe('block');
		});
	});

	describe('_moreLayerOff', () => {
		it('should hide more layer when active', () => {
			const mockButton = document.createElement('button');
			mockButton.setAttribute('data-command', 'test-command');
			const mockLayer = document.createElement('div');
			mockLayer.style.display = 'block';

			toolbar.currentMoreLayerActiveButton = mockButton;
			mockContext.get('toolbar_main').querySelector.mockReturnValue(mockLayer);

			toolbar._moreLayerOff();

			expect(mockLayer.style.display).toBe('none');
			expect(dom.utils.removeClass).toHaveBeenCalledWith(mockButton, 'on');
			expect(toolbar.currentMoreLayerActiveButton).toBeNull();
		});

		it('should handle no active button', () => {
			toolbar.currentMoreLayerActiveButton = null;

			toolbar._moreLayerOff();

			expect(dom.utils.removeClass).not.toHaveBeenCalled();
		});
	});
});
