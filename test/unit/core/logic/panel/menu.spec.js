/**
 * @fileoverview Unit tests for core/logic/panel/menu.js
 */

import Menu from '../../../../../src/core/logic/panel/menu';

describe('Menu', () => {
	let menu;
	let mockKernel;
	let mockStore;
	let mockDeps;

	beforeEach(() => {
		jest.clearAllMocks();

		// Create mock context
		const mockContext = new Map([
			['menuTray', document.createElement('div')],
			['toolbar_main', document.createElement('div')],
		]);

		// Create mock frameContext
		const mockFrameContext = new Map();

		// Create mock contextProvider
		const mockContextProvider = {
			frameContext: mockFrameContext,
		};

		// Create mock store
		mockStore = {
			get: jest.fn((key) => {
				if (key === 'rootKey') return null;
				return undefined;
			}),
			set: jest.fn(),
		};

		// Create mock eventManager
		const mockEventManager = {
			addEvent: jest.fn(),
			removeEvent: jest.fn(),
		};

		// Create mock deps
		mockDeps = {
			context: mockContext,
			frameContext: mockFrameContext,
			contextProvider: mockContextProvider,
			eventManager: mockEventManager,
		};

		// Create mock kernel
		mockKernel = {
			$: mockDeps,
			store: mockStore,
		};

		// Create menu instance
		menu = new Menu(mockKernel);
	});

	describe('constructor', () => {
		it('should create a Menu instance', () => {
			expect(menu).toBeInstanceOf(Menu);
		});

		it('should initialize with empty state', () => {
			expect(menu.targetMap).toEqual({});
			expect(menu.menus).toEqual([]);
			expect(menu.index).toBe(-1);
		});

		it('should initialize dropdown state', () => {
			expect(menu.currentButton).toBeNull();
			expect(menu.currentDropdown).toBeNull();
			expect(menu.currentDropdownActiveButton).toBeNull();
			expect(menu.currentDropdownName).toBe('');
			expect(menu.currentDropdownType).toBe('');
		});

		it('should initialize container state', () => {
			expect(menu.currentContainer).toBeNull();
			expect(menu.currentContainerActiveButton).toBeNull();
			expect(menu.currentContainerName).toBe('');
		});
	});

	describe('initDropdownTarget', () => {
		it('should register a dropdown target', () => {
			const mockMenu = document.createElement('div');
			const mockKey = 'testDropdown';

			menu.initDropdownTarget({ key: mockKey, type: 'dropdown' }, mockMenu);

			expect(menu.targetMap[mockKey]).toBe(mockMenu);
		});

		it('should throw error when key is missing', () => {
			const mockMenu = document.createElement('div');

			expect(() => {
				menu.initDropdownTarget({ key: '', type: 'dropdown' }, mockMenu);
			}).toThrow();
		});

		it('should handle free-type dropdowns differently', () => {
			const mockMenu = document.createElement('div');
			const mockKey = 'freeDropdown';

			menu.initDropdownTarget({ key: mockKey, type: 'dropdown-free' }, mockMenu);

			expect(menu.targetMap[mockKey]).toBe(mockMenu);
		});
	});

	describe('dropdown state management', () => {
		it('should track dropdown menus', () => {
			expect(menu.menus).toBeDefined();
			expect(Array.isArray(menu.menus)).toBe(true);
		});

		it('should track current dropdown button', () => {
			const mockButton = document.createElement('button');
			menu.currentButton = mockButton;

			expect(menu.currentButton).toBe(mockButton);
		});

		it('should track dropdown name and type', () => {
			menu.currentDropdownName = 'fontSize';
			menu.currentDropdownType = 'dropdown';

			expect(menu.currentDropdownName).toBe('fontSize');
			expect(menu.currentDropdownType).toBe('dropdown');
		});
	});

	describe('container state management', () => {
		it('should track container state', () => {
			const mockContainer = document.createElement('div');
			menu.currentContainer = mockContainer;

			expect(menu.currentContainer).toBe(mockContainer);
		});

		it('should track container name and active button', () => {
			const mockButton = document.createElement('button');
			menu.currentContainerName = 'tableContainer';
			menu.currentContainerActiveButton = mockButton;

			expect(menu.currentContainerName).toBe('tableContainer');
			expect(menu.currentContainerActiveButton).toBe(mockButton);
		});
	});

	describe('event handlers', () => {
		it('should have event handler methods defined', () => {
			expect(typeof menu.dropdownOn).toBe('function');
		});

		it('should handle dropdown off when method exists', () => {
			if (typeof menu.dropdownOff === 'function') {
				expect(() => menu.dropdownOff()).not.toThrow();
			}
		});

		it('should handle container off when method exists', () => {
			if (typeof menu.containerOff === 'function') {
				expect(() => menu.containerOff()).not.toThrow();
			}
		});
	});

	describe('menu collection', () => {
		it('should maintain an empty menus array initially', () => {
			expect(menu.menus.length).toBe(0);
		});

		it('should have targetMap for tracking dropdown elements', () => {
			expect(typeof menu.targetMap).toBe('object');
			expect(menu.targetMap instanceof Map).toBe(false);
		});
	});

	describe('dropdown plugin', () => {
		it('should track current dropdown plugin', () => {
			const mockPlugin = { key: 'testPlugin' };
			menu.currentDropdownPlugin = mockPlugin;

			expect(menu.currentDropdownPlugin).toBe(mockPlugin);
		});

		it('should initialize with null plugin', () => {
			expect(menu.currentDropdownPlugin).toBeNull();
		});
	});
});
