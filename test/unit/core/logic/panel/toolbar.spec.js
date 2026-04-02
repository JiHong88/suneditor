/**
 * @fileoverview Unit tests for core/logic/panel/toolbar.js
 */

import Toolbar from '../../../../../src/core/logic/panel/toolbar';

describe('Toolbar', () => {
	let toolbar;
	let mockKernel;
	let mockStore;
	let mockDeps;

	beforeEach(() => {
		jest.clearAllMocks();

		// Create mock DOM elements
		const mockToolbarMain = document.createElement('div');
		mockToolbarMain.className = 'se-toolbar-main';

		const mockButtonTray = document.createElement('div');
		mockButtonTray.className = 'se-btn-tray';

		const mockSubToolbar = document.createElement('div');
		mockSubToolbar.className = 'se-toolbar-sub';

		const mockWrapper = document.createElement('div');
		mockWrapper.className = 'se-wrapper';

		// Create mock context
		const mockContext = new Map([
			['toolbar_main', mockToolbarMain],
			['toolbar_sub_main', mockSubToolbar],
			['toolbar_buttonTray', mockButtonTray],
			['menuTray', document.createElement('div')],
		]);

		// Create mock frameContext
		const mockFrameContext = new Map([
			['wrapper', mockWrapper],
			['topArea', document.createElement('div')],
		]);

		// Create mock options
		const mockOptions = new Map([
			['toolbar_width', 'auto'],
			['toolbar_sticky', 0],
			['_toolbar_sticky', 0],
			['_toolbar_sticky_offset', 0],
			['toolbar_container', null],
		]);

		// Create mock store
		mockStore = {
			get: jest.fn((key) => {
				if (key === 'rootKey') return null;
				return undefined;
			}),
			set: jest.fn(),
			subscribe: jest.fn(),
			mode: {
				isClassic: true,
				isBalloon: false,
				isInline: false,
				isBalloonAlways: false,
				isBottom: false,
			},
		};

		// Create mock eventManager
		const mockEventManager = {
			addEvent: jest.fn(),
			removeEvent: jest.fn(),
		};

		// Create mock menu
		const mockMenu = {
			dropdownOff: jest.fn(),
			containerOff: jest.fn(),
		};

		// Create mock deps
		mockDeps = {
			context: mockContext,
			frameContext: mockFrameContext,
			options: mockOptions,
			eventManager: mockEventManager,
			menu: mockMenu,
			icons: {},
			lang: {},
		};

		// Create mock kernel
		mockKernel = {
			$: mockDeps,
			store: mockStore,
		};

		// Create toolbar with mock kernel
		toolbar = new Toolbar(mockKernel, {
			keyName: 'toolbar',
			balloon: false,
			inline: false,
			balloonAlways: false,
			res: [],
		});
	});

	describe('constructor', () => {
		it('should create a Toolbar instance', () => {
			expect(toolbar).toBeInstanceOf(Toolbar);
		});

		it('should set toolbar mode flags correctly', () => {
			expect(toolbar.isBalloonMode).toBe(false);
			expect(toolbar.isInlineMode).toBe(false);
			expect(toolbar.isBalloonAlwaysMode).toBe(false);
		});

		it('should identify non-sub toolbar', () => {
			expect(toolbar.isSub).toBe(false);
		});

		it('should set correct key names for main toolbar', () => {
			expect(toolbar.keyName.main).toBe('toolbar_main');
			expect(toolbar.keyName.buttonTray).toBe('toolbar_buttonTray');
			expect(toolbar.keyName.width).toBe('toolbar_width');
		});
	});

	describe('sub toolbar', () => {
		it('should identify sub toolbar', () => {
			const subToolbar = new Toolbar(mockKernel, {
				keyName: 'toolbar_sub',
				balloon: false,
				inline: false,
				balloonAlways: false,
				res: [],
			});
			expect(subToolbar.isSub).toBe(true);
		});

		it('should set correct key names for sub toolbar', () => {
			const subToolbar = new Toolbar(mockKernel, {
				keyName: 'toolbar_sub',
				balloon: false,
				inline: false,
				balloonAlways: false,
				res: [],
			});
			expect(subToolbar.keyName.main).toBe('toolbar_sub_main');
			expect(subToolbar.keyName.buttonTray).toBe('toolbar_sub_buttonTray');
			expect(subToolbar.keyName.width).toBe('toolbar_sub_width');
		});
	});

	describe('toolbar state', () => {
		it('should initialize with default state', () => {
			expect(toolbar.currentMoreLayerActiveButton).toBeNull();
			expect(toolbar.isSticky).toBe(false);
		});

		it('should have inline toolbar attributes', () => {
			expect(toolbar.inlineToolbarAttr).toBeDefined();
			expect(toolbar.inlineToolbarAttr.top).toBe('');
			expect(toolbar.inlineToolbarAttr.width).toBe('');
			expect(toolbar.inlineToolbarAttr.isShow).toBe(false);
		});

		it('should have balloon offset attributes', () => {
			expect(toolbar.balloonOffset).toBeDefined();
			expect(toolbar.balloonOffset.top).toBe(0);
			expect(toolbar.balloonOffset.left).toBe(0);
		});
	});

	describe('disable method', () => {
		it('should call menu methods when disabled', () => {
			toolbar.disable();
			expect(mockDeps.menu.dropdownOff).toHaveBeenCalled();
		});
	});

	describe('balloon mode', () => {
		it('should set balloon mode flags correctly', () => {
			const balloonToolbar = new Toolbar(mockKernel, {
				keyName: 'toolbar',
				balloon: true,
				inline: false,
				balloonAlways: false,
				res: [],
			});
			expect(balloonToolbar.isBalloonMode).toBe(true);
			expect(balloonToolbar.isInlineMode).toBe(false);
		});
	});

	describe('inline mode', () => {
		it('should set inline mode flags correctly', () => {
			const inlineToolbar = new Toolbar(mockKernel, {
				keyName: 'toolbar',
				balloon: false,
				inline: true,
				balloonAlways: false,
				res: [],
			});
			expect(inlineToolbar.isInlineMode).toBe(true);
			expect(inlineToolbar.isBalloonMode).toBe(false);
		});
	});

	describe('bottom mode', () => {
		it('should set isBottomMode to false when store.mode.isBottom is false', () => {
			expect(toolbar.isBottomMode).toBe(false);
		});

		it('should set isBottomMode to true when store.mode.isBottom is true', () => {
			mockStore.mode.isBottom = true;
			const bottomToolbar = new Toolbar(mockKernel, {
				keyName: 'toolbar',
				balloon: false,
				inline: false,
				balloonAlways: false,
				res: [],
			});
			expect(bottomToolbar.isBottomMode).toBe(true);
			mockStore.mode.isBottom = false;
		});

		it('isSticky should return false for sub toolbar regardless of bottom mode', () => {
			mockStore.mode.isBottom = true;
			const subToolbar = new Toolbar(mockKernel, {
				keyName: 'toolbar_sub',
				balloon: false,
				inline: false,
				balloonAlways: false,
				res: [],
			});
			expect(subToolbar.isSticky).toBe(false);
			mockStore.mode.isBottom = false;
		});
	});
});
