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
			commandTargets: new Map(),
			shortcutsKeyMap: new Map(),
			effectNode: null,
			isSubBalloon: false,
			__cachingButtons: jest.fn(),
			__cachingShortcuts: jest.fn(),
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
			ui: {
				setControllerOnDisabledButtons: jest.fn(),
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
			expect(toolbar._isBalloon).toBe(false);
			expect(toolbar._isInline).toBe(false);
			expect(toolbar._isBalloonAlways).toBe(false);
			expect(toolbar.isSticky).toBe(false);
			expect(toolbar._responsiveCurrentSize).toBe('default');
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
			expect(subToolbar._isBalloon).toBe(true);
			expect(subToolbar._isInline).toBe(true);
			expect(subToolbar._isBalloonAlways).toBe(true);
		});

		it('should call CoreInjector constructor', () => {
			expect(CoreInjector).toHaveBeenCalledWith(mockEditor);
		});

		it('should detect viewport size capability', () => {
			expect(typeof toolbar._isViewPortSize).toBe('boolean');
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
			toolbar._isInline = true;
			toolbar._showInline = jest.fn();

			toolbar.show();

			expect(toolbar._showInline).toHaveBeenCalled();
		});

		it('should show balloon toolbar', () => {
			toolbar._isBalloon = true;
			toolbar._showBalloon = jest.fn();

			toolbar.show();

			expect(toolbar._showBalloon).toHaveBeenCalled();
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
			toolbar._isInline = true;

			toolbar.hide();

			expect(mockContext.get('toolbar_main').style.display).toBe('none');
			expect(mockContext.get('toolbar_main').style.top).toBe('0px');
			expect(toolbar._inlineToolbarAttr.isShow).toBe(false);
		});

		it('should hide balloon toolbar', () => {
			toolbar._isBalloon = true;

			toolbar.hide();

			expect(mockContext.get('toolbar_main').style.display).toBe('none');
			expect(mockFrameContext.get('_stickyDummy').style.display).toBe('none');
			expect(toolbar._balloonOffset).toEqual({ top: 0, left: 0 });
		});

		it('should hide regular toolbar', () => {
			toolbar.hide();

			expect(mockContext.get('toolbar_main').style.display).toBe('none');
			expect(mockFrameContext.get('_stickyDummy').style.display).toBe('none');
		});
	});

	describe('resetResponsiveToolbar', () => {
		it('should reset responsive toolbar with default size', () => {
			toolbar._rButtonsize = [768, 'default'];
			toolbar._responsiveCurrentSize = 'default';
			toolbar.setButtons = jest.fn();

			toolbar.resetResponsiveToolbar();

			expect(mockMenu.containerOff).toHaveBeenCalled();
		});

		it('should update responsive size when needed', () => {
			toolbar._rButtonsize = ['default', 768];
			toolbar._rButtonsInfo = { default: [], 768: [] };
			toolbar._responsiveCurrentSize = 'default';
			toolbar.setButtons = jest.fn();

			// Create a new mock toolbar with narrow width
			const narrowToolbar = document.createElement('div');
			Object.defineProperty(narrowToolbar, 'offsetWidth', { get: () => 500 });
			mockContext.get.mockImplementation((key) => {
				if (key === 'toolbar_main') return narrowToolbar;
				return mockContext.get(key);
			});

			toolbar.resetResponsiveToolbar();

			expect(toolbar._responsiveCurrentSize).toBe('768');
			expect(toolbar.setButtons).toHaveBeenCalledWith([]);
		});

		it('should handle balloon/inline auto width', () => {
			toolbar._isBalloon = true;
			toolbar._rButtonsize = ['default', 768];
			toolbar._rButtonsInfo = { default: [], 768: [] };
			toolbar._responsiveCurrentSize = 'default';
			toolbar.setButtons = jest.fn();

			// Mock narrow topArea width to trigger responsive change
			const narrowTopArea = document.createElement('div');
			Object.defineProperty(narrowTopArea, 'offsetWidth', { get: () => 500 });
			mockFrameContext.get.mockImplementation((key) => {
				if (key === 'topArea') return narrowTopArea;
				return mockFrameContext.get(key);
			});

			toolbar.resetResponsiveToolbar();

			expect(toolbar.setButtons).toHaveBeenCalled();
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
			toolbar._resetButtonInfo = jest.fn();

			// Mock replaceChild
			const mockMain = mockContext.get('toolbar_main');
			mockMain.replaceChild = jest.fn();

			toolbar.setButtons(buttonList);

			expect(toolbar._moreLayerOff).toHaveBeenCalled();
			expect(mockMenu.dropdownOff).toHaveBeenCalled();
			expect(mockMenu.containerOff).toHaveBeenCalled();
			expect(CreateToolBar).toHaveBeenCalledWith(buttonList, {}, {}, {}, {}, true);
			expect(UpdateButton).toHaveBeenCalled();
			expect(mockMain.replaceChild).toHaveBeenCalledWith(mockButtonTray, mockContext.get('toolbar_buttonTray'));
			expect(mockContext.set).toHaveBeenCalledWith('toolbar_buttonTray', mockButtonTray);
			expect(toolbar._resetButtonInfo).toHaveBeenCalled();
			expect(toolbar.triggerEvent).toHaveBeenCalledWith('onSetToolbarButtons', {
				buttonTray: mockButtonTray,
				frameContext: mockFrameContext,
			});
		});
	});

	describe('_resetButtonInfo', () => {
		it('should reset all button info and apply effects', () => {
			toolbar._resetSticky = jest.fn();

			toolbar._resetButtonInfo();

			expect(mockEditor.allCommandButtons).toBeInstanceOf(Map);
			expect(mockEditor.subAllCommandButtons).toBeInstanceOf(Map);
			expect(mockEditor.commandTargets).toBeInstanceOf(Map);
			expect(mockEditor.shortcutsKeyMap).toBeInstanceOf(Map);
			expect(mockEditor.__cachingButtons).toHaveBeenCalled();
			expect(mockEditor.__cachingShortcuts).toHaveBeenCalled();
			expect(toolbar.history.resetButtons).toHaveBeenCalled();
			expect(toolbar._resetSticky).toHaveBeenCalled();
			expect(mockEditor.effectNode).toBeNull();
			expect(toolbar.viewer._setButtonsActive).toHaveBeenCalled();
		});

		it('should handle sub toolbar differently', () => {
			toolbar.isSub = true;
			toolbar._resetSticky = jest.fn();

			toolbar._resetButtonInfo();

			expect(mockEditor.__cachingButtons).toHaveBeenCalled();
		});

		it('should apply tag effect when focused', () => {
			toolbar.status.hasFocus = true;
			toolbar._resetSticky = jest.fn();

			toolbar._resetButtonInfo();

			expect(toolbar.eventManager.applyTagEffect).toHaveBeenCalled();
		});

		it('should handle readonly state', () => {
			const originalGet = mockFrameContext.get;
			mockFrameContext.get = jest.fn().mockImplementation((key) => {
				if (key === 'isReadOnly') return true;
				return originalGet.call(mockFrameContext, key);
			});
			toolbar._resetSticky = jest.fn();

			toolbar._resetButtonInfo();

			expect(toolbar.ui.setControllerOnDisabledButtons).toHaveBeenCalledWith(true);
		});
	});

	describe('_resetSticky', () => {
		it('should return early when no wrapper', () => {
			mockFrameContext.get.mockImplementation((key) => {
				if (key === 'wrapper') return null;
				return mockFrameContext.get(key);
			});
			toolbar._onSticky = jest.fn();
			toolbar._offSticky = jest.fn();

			toolbar._resetSticky();

			expect(toolbar._onSticky).not.toHaveBeenCalled();
			expect(toolbar._offSticky).not.toHaveBeenCalled();
		});

		it('should return early when fullscreen', () => {
			const originalGet = mockFrameContext.get;
			mockFrameContext.get = jest.fn().mockImplementation((key) => {
				if (key === 'isFullScreen') return true;
				return originalGet.call(mockFrameContext, key);
			});
			toolbar._onSticky = jest.fn();

			toolbar._resetSticky();

			expect(toolbar._onSticky).not.toHaveBeenCalled();
		});

		it('should call _offSticky when above threshold', () => {
			toolbar._offSticky = jest.fn();
			// The logic checks if y < t, where y = scrollY + sticky and t = editorOffset.top
			// So to trigger _offSticky, we need y < t
			env._w.scrollY = 0;
			mockOptions.get.mockImplementation((key) => {
				if (key === 'toolbar_sticky') return 0;
				return null;
			});
			// Mock offset to return a higher top value
			mockOffset.getGlobal.mockReturnValue({ top: 100, left: 0 });

			toolbar._resetSticky();

			expect(toolbar._offSticky).toHaveBeenCalled();
		});

		it('should call _onSticky when below threshold', () => {
			toolbar._onSticky = jest.fn();
			env._w.scrollY = 300; // Set scroll position below

			toolbar._resetSticky();

			expect(toolbar._onSticky).toHaveBeenCalled();
		});
	});

	describe('_onSticky', () => {
		it('should enable sticky mode', () => {
			const mockToolbar = mockContext.get('toolbar_main');
			const mockStickyDummy = mockFrameContext.get('_stickyDummy');
			toolbar.__getViewportTop = jest.fn().mockReturnValue(0);

			toolbar._onSticky(1);

			expect(mockStickyDummy.style.height).toBe('40px');
			expect(mockStickyDummy.style.display).toBe('block');
			expect(mockToolbar.style.top).toBe('1px');
			expect(mockToolbar.style.width).toBe('800px');
			expect(dom.utils.addClass).toHaveBeenCalledWith(mockToolbar, 'se-toolbar-sticky');
			expect(toolbar.isSticky).toBe(true);
		});

		it('should handle inline toolbar width', () => {
			toolbar._isInline = true;
			toolbar._inlineToolbarAttr.width = '500px';
			toolbar.__getViewportTop = jest.fn().mockReturnValue(0);

			const mockToolbar = mockContext.get('toolbar_main');

			toolbar._onSticky(1);

			expect(mockToolbar.style.width).toBe('500px');
		});

		it('should handle toolbar container', () => {
			mockOptions.get.mockImplementation((key) => {
				if (key === 'toolbar_container') return document.createElement('div');
				return null;
			});
			toolbar.__getViewportTop = jest.fn().mockReturnValue(0);

			toolbar._onSticky(1);

			expect(toolbar.isSticky).toBe(true);
		});
	});

	describe('__getViewportTop', () => {
		it('should return viewport offset when available', () => {
			toolbar._isViewPortSize = true;
			env._w.visualViewport.offsetTop = 50;

			const result = toolbar.__getViewportTop();

			expect(result).toBe(50);
		});

		it('should return 0 when viewport not available', () => {
			toolbar._isViewPortSize = false;

			const result = toolbar.__getViewportTop();

			expect(result).toBe(0);
		});
	});

	describe('_offSticky', () => {
		it('should disable sticky mode', () => {
			const mockToolbar = mockContext.get('toolbar_main');
			const mockStickyDummy = mockFrameContext.get('_stickyDummy');
			const mockWrapper = mockFrameContext.get('wrapper');

			toolbar._offSticky();

			expect(mockStickyDummy.style.display).toBe('none');
			expect(mockToolbar.style.top).toBe('');
			expect(mockToolbar.style.width).toBe('');
			expect(mockWrapper.style.marginTop).toBe('');
			expect(dom.utils.removeClass).toHaveBeenCalledWith(mockToolbar, 'se-toolbar-sticky');
			expect(toolbar.isSticky).toBe(false);
		});

		it('should handle inline toolbar attributes', () => {
			toolbar._isInline = true;
			toolbar._inlineToolbarAttr = { top: '10px', width: '500px' };

			const mockToolbar = mockContext.get('toolbar_main');

			toolbar._offSticky();

			expect(mockToolbar.style.top).toBe('10px');
			expect(mockToolbar.style.width).toBe('500px');
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

			expect(responsiveToolbar._rButtonsize).toEqual(['default', 480, 768]);
			expect(responsiveToolbar._rButtonsInfo).toEqual({
				default: ['default'],
				768: 'mobile',
				480: 'small',
			});
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

			expect(responsiveToolbar._rButtonArray).toBeNull();
		});
	});

	describe('_showBalloon', () => {
		beforeEach(() => {
			toolbar._isBalloon = true;
			toolbar._setBalloonOffset = jest.fn();
		});

		it('should return early if not balloon mode', () => {
			toolbar._isBalloon = false;

			toolbar._showBalloon();

			expect(toolbar._setBalloonOffset).not.toHaveBeenCalled();
		});

		it('should show balloon with selection range', () => {
			const mockRange = { collapsed: false, commonAncestorContainer: document.createElement('div') };
			toolbar.selection.getRange.mockReturnValue(mockRange);

			toolbar._showBalloon();

			expect(toolbar._setBalloonOffset).toHaveBeenCalledWith(false, mockRange);
			expect(toolbar.triggerEvent).toHaveBeenCalledWith('onShowToolbar', {
				toolbar: mockContext.get('toolbar_main'),
				mode: 'balloon',
				frameContext: mockFrameContext,
			});
		});

		it('should handle always balloon with collapsed range', () => {
			toolbar._isBalloonAlways = true;
			const mockRange = { collapsed: true };
			toolbar.selection.getRange.mockReturnValue(mockRange);

			toolbar._showBalloon();

			expect(toolbar._setBalloonOffset).toHaveBeenCalledWith(true, mockRange);
		});

		it('should reset responsive toolbar for sub', () => {
			toolbar.isSub = true;
			toolbar.resetResponsiveToolbar = jest.fn();

			toolbar._showBalloon();

			expect(toolbar.resetResponsiveToolbar).toHaveBeenCalled();
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
			expect(toolbar._balloonOffset).toEqual({
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
			toolbar._isInline = false;
			toolbar._offSticky = jest.fn();

			toolbar._showInline();

			expect(toolbar._offSticky).not.toHaveBeenCalled();
		});

		it('should show inline toolbar', () => {
			toolbar._isInline = true;
			toolbar._offSticky = jest.fn();
			toolbar._resetSticky = jest.fn();

			const mockToolbar = mockContext.get('toolbar_main');
			mockOptions.get.mockImplementation((key) => {
				if (key === 'toolbar_width') return '100%';
				return null;
			});

			toolbar._showInline();

			expect(mockToolbar.style.visibility).toBe('');
			expect(mockToolbar.style.display).toBe('block');
			expect(toolbar._inlineToolbarAttr.width).toBe('100%');
			expect(toolbar._inlineToolbarAttr.isShow).toBe(true);
			expect(toolbar._offSticky).toHaveBeenCalled();
			expect(toolbar._resetSticky).toHaveBeenCalled();
			expect(toolbar.triggerEvent).toHaveBeenCalledWith('onShowToolbar', {
				toolbar: mockToolbar,
				mode: 'inline',
				frameContext: mockFrameContext,
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
