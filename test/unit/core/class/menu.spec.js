import Menu from '../../../../src/core/class/menu';
import CoreInjector from '../../../../src/editorInjector/_core';
import { dom, converter } from '../../../../src/helper';

// Mock dependencies
jest.mock('../../../../src/editorInjector/_core');
jest.mock('../../../../src/helper', () => ({
	dom: {
		query: {
			getParentElement: jest.fn(),
			getEventTarget: jest.fn(),
		},
		utils: {
			removeClass: jest.fn(),
			addClass: jest.fn(),
		},
	},
	converter: {
		nodeListToArray: jest.fn((nodeList) => Array.from(nodeList || [])),
	},
}));

describe('Menu', () => {
	let menu;
	let mockEditor;
	let mockContext;
	let mockEventManager;
	let mockOffset;

	beforeEach(() => {
		jest.clearAllMocks();

		const mockMenuTray = document.createElement('div');

		mockContext = new Map([['menuTray', mockMenuTray]]);
		mockContext.get = jest.fn().mockImplementation((key) => {
			const map = new Map([['menuTray', mockMenuTray]]);
			return map.get(key);
		});

		mockEventManager = {
			addGlobalEvent: jest.fn().mockReturnValue('mock-event-id'),
			removeGlobalEvent: jest.fn(),
		};

		mockOffset = {
			setRelPosition: jest.fn(),
		};

		mockEditor = {
			runFromTarget: jest.fn(),
			_preventBlur: false,
			_notHideToolbar: false,
		};

		// Mock CoreInjector.call
		CoreInjector.mockImplementation(function (editor) {
			this.editor = editor;
			this.context = mockContext;
			this.eventManager = mockEventManager;
			this.offset = mockOffset;
			this.carrierWrapper = document.createElement('div');
			this.plugins = {};
		});

		menu = new Menu(mockEditor);
	});

	describe('constructor', () => {
		it('should initialize Menu with default properties', () => {
			expect(menu.targetMap).toEqual({});
			expect(menu.index).toBe(-1);
			expect(menu.menus).toEqual([]);
			expect(menu.currentDropdown).toBeNull();
			expect(menu.currentDropdownActiveButton).toBeNull();
			expect(menu.currentDropdownName).toBe('');
			expect(menu.currentDropdownType).toBe('');
			expect(menu.currentContainer).toBeNull();
			expect(menu.currentContainerActiveButton).toBeNull();
			expect(menu.currentContainerName).toBe('');
			expect(menu._dropdownCommands).toEqual([]);
			expect(menu.currentDropdownPlugin).toBeNull();
		});

		it('should call CoreInjector constructor', () => {
			expect(CoreInjector).toHaveBeenCalledWith(mockEditor);
		});

		it('should setup global event handlers', () => {
			expect(menu.__globalEventHandler).toBeDefined();
			expect(typeof menu.__globalEventHandler.mousedown).toBe('function');
			expect(typeof menu.__globalEventHandler.containerDown).toBe('function');
			expect(typeof menu.__globalEventHandler.keydown).toBe('function');
			expect(typeof menu.__globalEventHandler.mousemove).toBe('function');
			expect(typeof menu.__globalEventHandler.mouseout).toBe('function');
		});
	});

	describe('initDropdownTarget', () => {
		it('should initialize dropdown target with key', () => {
			const mockMenu = document.createElement('div');
			const classObj = { key: 'testKey', type: 'dropdown' };

			menu.initDropdownTarget(classObj, mockMenu);

			expect(mockMenu.getAttribute('data-key')).toBe('testKey');
			expect(menu._dropdownCommands).toContain('testKey');
			expect(menu.targetMap.testKey).toBe(mockMenu);
		});

		it('should handle free type without adding to dropdown commands', () => {
			const mockMenu = document.createElement('div');
			const classObj = { key: 'testKey', type: 'dropdownfree' };

			menu.initDropdownTarget(classObj, mockMenu);

			expect(menu._dropdownCommands).not.toContain('testKey');
			expect(menu.targetMap.testKey).toBe(mockMenu);
		});

		it('should throw error when key is missing', () => {
			const mockMenu = document.createElement('div');
			const classObj = { type: 'dropdown' };

			expect(() => {
				menu.initDropdownTarget(classObj, mockMenu);
			}).toThrow("[SUNEDITOR.init.fail] The plugin's key is not added.");
		});
	});

	describe('dropdownOn', () => {
		beforeEach(() => {
			menu.__removeGlobalEvent = jest.fn();
			menu._checkMoreLayer = jest.fn().mockReturnValue(null);
			menu._setMenuPosition = jest.fn();
		});

		it('should set up dropdown with basic functionality', () => {
			const mockButton = document.createElement('button');
			mockButton.setAttribute('data-command', 'testCommand');
			mockButton.setAttribute('data-type', 'dropdown');

			const mockDropdown = document.createElement('div');
			menu.targetMap.testCommand = mockDropdown;

			menu.dropdownOn(mockButton);

			expect(menu.__removeGlobalEvent).toHaveBeenCalled();
			expect(menu.currentDropdownName).toBe('testCommand');
			expect(menu.currentDropdownType).toBe('dropdown');
			expect(menu.currentDropdown).toBe(mockDropdown);
			expect(menu.currentDropdownActiveButton).toBe(mockButton);
			expect(menu._setMenuPosition).toHaveBeenCalledWith(mockButton, mockDropdown);
			expect(mockEventManager.addGlobalEvent).toHaveBeenCalledWith('mousedown', menu.__globalEventHandler.mousedown, false);
		});

		it('should handle dropdown commands with menus', () => {
			const mockButton = document.createElement('button');
			mockButton.setAttribute('data-command', 'testCommand');
			mockButton.setAttribute('data-type', 'dropdown');

			const mockDropdown = document.createElement('div');
			const mockMenuItem = document.createElement('div');
			mockMenuItem.setAttribute('data-command', 'menuItem');
			mockDropdown.appendChild(mockMenuItem);
			mockDropdown.querySelectorAll = jest.fn().mockReturnValue([mockMenuItem]);
			mockDropdown.addEventListener = jest.fn();

			menu.targetMap.testCommand = mockDropdown;
			menu._dropdownCommands = ['testCommand'];

			menu.dropdownOn(mockButton);

			expect(converter.nodeListToArray).toHaveBeenCalled();
			expect(menu.menus).toEqual([mockMenuItem]);
			expect(mockEventManager.addGlobalEvent).toHaveBeenCalledWith('keydown', menu.__globalEventHandler.keydown, false);
			expect(mockDropdown.addEventListener).toHaveBeenCalledWith('mousemove', menu.__globalEventHandler.mousemove, false);
			expect(mockDropdown.addEventListener).toHaveBeenCalledWith('mouseout', menu.__globalEventHandler.mouseout, false);
		});

		it('should call plugin on method if exists', () => {
			const mockButton = document.createElement('button');
			mockButton.setAttribute('data-command', 'testCommand');
			mockButton.setAttribute('data-type', 'dropdown');

			const mockDropdown = document.createElement('div');
			menu.targetMap.testCommand = mockDropdown;

			const mockPlugin = { on: jest.fn() };
			menu.plugins.testCommand = mockPlugin;

			menu.dropdownOn(mockButton);

			expect(mockPlugin.on).toHaveBeenCalledWith(mockButton);
			expect(menu.currentDropdownPlugin).toBe(mockPlugin);
		});

		it('should handle more layer elements', () => {
			const mockButton = document.createElement('button');
			const mockMoreBtn = document.createElement('button');
			mockMoreBtn.setAttribute('data-ref', 'targetCommand');

			const mockParent = document.createElement('div');
			mockParent.classList.add('se-btn-tray');
			const mockTarget = document.createElement('button');
			mockTarget.setAttribute('data-command', 'targetCommand');
			mockParent.appendChild(mockTarget);

			// Mock _checkMoreLayer to return mockMoreBtn only on first call, then null
			let callCount = 0;
			menu._checkMoreLayer = jest.fn().mockImplementation(() => {
				callCount++;
				return callCount === 1 ? mockMoreBtn : null;
			});

			dom.query.getParentElement.mockReturnValue(mockParent);
			mockParent.querySelector = jest.fn().mockReturnValue(mockTarget);

			menu.dropdownOn(mockButton);

			expect(mockEditor.runFromTarget).toHaveBeenCalledWith(mockTarget);
		});
	});

	describe('dropdownOff', () => {
		beforeEach(() => {
			menu.__removeGlobalEvent = jest.fn();
		});

		it('should reset dropdown state', () => {
			const mockDropdown = document.createElement('div');
			const mockButton = document.createElement('button');
			const mockParent = document.createElement('div');
			mockParent.appendChild(mockButton);
			mockParent.appendChild(document.createElement('button'));

			menu.currentDropdown = mockDropdown;
			menu.currentDropdownActiveButton = mockButton;
			menu.currentDropdownName = 'testCommand';
			menu.currentDropdownType = 'dropdown';
			menu.index = 5;
			menu.menus = [document.createElement('div')];

			menu.dropdownOff();

			expect(menu.__removeGlobalEvent).toHaveBeenCalled();
			expect(menu.index).toBe(-1);
			expect(menu.menus).toEqual([]);
			expect(menu.currentDropdownName).toBe('');
			expect(menu.currentDropdownType).toBe('');
			expect(menu.currentDropdown).toBeNull();
			expect(menu.currentDropdownActiveButton).toBeNull();
			expect(mockDropdown.style.display).toBe('none');
			expect(dom.utils.removeClass).toHaveBeenCalledWith(mockParent.children, 'on');
			expect(mockEditor._notHideToolbar).toBe(false);
			expect(mockEditor._preventBlur).toBe(false);
			expect(menu.currentDropdownPlugin).toBeNull();
		});

		it('should handle empty dropdown state', () => {
			menu.dropdownOff();

			expect(menu.__removeGlobalEvent).toHaveBeenCalled();
			expect(menu.index).toBe(-1);
			expect(menu.menus).toEqual([]);
		});
	});

	describe('containerOn', () => {
		beforeEach(() => {
			menu.__removeGlobalEvent = jest.fn();
			menu._setMenuPosition = jest.fn();
		});

		it('should set up container', () => {
			const mockButton = document.createElement('button');
			mockButton.setAttribute('data-command', 'testContainer');

			const mockContainer = document.createElement('div');
			menu.targetMap.testContainer = mockContainer;

			const mockPlugin = { on: jest.fn() };
			menu.plugins.testContainer = mockPlugin;

			menu.containerOn(mockButton);

			expect(menu.__removeGlobalEvent).toHaveBeenCalled();
			expect(menu.currentContainerActiveButton).toBe(mockButton);
			expect(menu.currentContainerName).toBe('testContainer');
			expect(menu.currentContainer).toBe(mockContainer);
			expect(menu._setMenuPosition).toHaveBeenCalledWith(mockButton, mockContainer);
			expect(mockEventManager.addGlobalEvent).toHaveBeenCalledWith('mousedown', menu.__globalEventHandler.containerDown, false);
			expect(mockPlugin.on).toHaveBeenCalledWith(mockButton);
			expect(mockEditor._preventBlur).toBe(true);
		});
	});

	describe('containerOff', () => {
		beforeEach(() => {
			menu.__removeGlobalEvent = jest.fn();
		});

		it('should reset container state', () => {
			const mockContainer = document.createElement('div');
			const mockButton = document.createElement('button');

			menu.currentContainer = mockContainer;
			menu.currentContainerActiveButton = mockButton;
			menu.currentContainerName = 'testContainer';

			menu.containerOff();

			expect(menu.__removeGlobalEvent).toHaveBeenCalled();
			expect(menu.currentContainerName).toBe('');
			expect(menu.currentContainer).toBeNull();
			expect(menu.currentContainerActiveButton).toBeNull();
			expect(mockContainer.style.display).toBe('none');
			expect(dom.utils.removeClass).toHaveBeenCalledWith(mockButton, 'on');
			expect(mockEditor._notHideToolbar).toBe(false);
			expect(mockEditor._preventBlur).toBe(false);
		});

		it('should handle empty container state', () => {
			menu.containerOff();

			expect(menu.__removeGlobalEvent).toHaveBeenCalled();
		});
	});

	describe('_setMenuPosition', () => {
		it('should set menu position and styling', () => {
			const mockElement = document.createElement('button');
			const mockParent = document.createElement('div');
			const mockToolbar = document.createElement('div');
			mockToolbar.classList.add('se-toolbar');
			mockParent.appendChild(mockElement);
			mockParent.appendChild(document.createElement('button'));

			const mockMenu = document.createElement('div');

			dom.query.getParentElement.mockReturnValue(mockToolbar);

			menu._setMenuPosition(mockElement, mockMenu);

			expect(mockMenu.style.visibility).toBe('');
			expect(mockMenu.style.display).toBe('block');
			expect(mockMenu.style.height).toBe('');
			expect(dom.utils.addClass).toHaveBeenCalledWith(mockParent.children, 'on');
			expect(mockOffset.setRelPosition).toHaveBeenCalledWith(mockMenu, menu.carrierWrapper, mockParent, mockToolbar);
			expect(menu.__menuBtn).toBe(mockElement);
			expect(menu.__menuContainer).toBe(mockMenu);
		});
	});

	describe('_resetMenuPosition', () => {
		it('should reset menu position', () => {
			const mockElement = document.createElement('button');
			const mockMenu = document.createElement('div');
			const mockParent = document.createElement('div');
			const mockToolbar = document.createElement('div');

			mockParent.appendChild(mockElement);
			dom.query.getParentElement.mockReturnValue(mockToolbar);

			menu._resetMenuPosition(mockElement, mockMenu);

			expect(mockOffset.setRelPosition).toHaveBeenCalledWith(mockMenu, menu.carrierWrapper, mockParent, mockToolbar);
		});
	});

	describe('_restoreMenuPosition', () => {
		it('should restore menu position when elements exist', () => {
			const mockButton = document.createElement('button');
			const mockContainer = document.createElement('div');
			menu.__menuBtn = mockButton;
			menu.__menuContainer = mockContainer;
			menu._setMenuPosition = jest.fn();

			menu._restoreMenuPosition();

			expect(menu._setMenuPosition).toHaveBeenCalledWith(mockButton, mockContainer);
		});

		it('should return early when elements do not exist', () => {
			menu._setMenuPosition = jest.fn();

			menu._restoreMenuPosition();

			expect(menu._setMenuPosition).not.toHaveBeenCalled();
		});
	});

	describe('_checkMoreLayer', () => {
		it('should return more layer element when valid', () => {
			const mockElement = document.createElement('div');
			const mockMore = document.createElement('div');
			mockMore.classList.add('se-more-layer');
			mockMore.style.display = 'none';
			mockMore.setAttribute('data-ref', 'testRef');

			dom.query.getParentElement.mockReturnValue(mockMore);

			const result = menu._checkMoreLayer(mockElement);

			expect(result).toBe(mockMore);
		});

		it('should return null when more layer is displayed', () => {
			const mockElement = document.createElement('div');
			const mockMore = document.createElement('div');
			mockMore.classList.add('se-more-layer');
			mockMore.style.display = 'block';

			dom.query.getParentElement.mockReturnValue(mockMore);

			const result = menu._checkMoreLayer(mockElement);

			expect(result).toBeNull();
		});

		it('should return null when no more layer found', () => {
			const mockElement = document.createElement('div');

			dom.query.getParentElement.mockReturnValue(null);

			const result = menu._checkMoreLayer(mockElement);

			expect(result).toBeNull();
		});
	});

	describe('_moveItem', () => {
		beforeEach(() => {
			const mockDropdown = document.createElement('div');
			menu.currentDropdown = mockDropdown;
			menu.menus = [document.createElement('div'), document.createElement('div'), document.createElement('div')];
			menu.index = 1;
		});

		it('should move item down', () => {
			menu._moveItem(1);

			expect(dom.utils.removeClass).toHaveBeenCalledWith(menu.currentDropdown, 'se-select-menu-mouse-move');
			expect(dom.utils.addClass).toHaveBeenCalledWith(menu.currentDropdown, 'se-select-menu-key-action');
			expect(menu.index).toBe(2);
			expect(dom.utils.addClass).toHaveBeenCalledWith(menu.menus[2], 'on');
		});

		it('should move item up', () => {
			menu._moveItem(-1);

			expect(menu.index).toBe(0);
			expect(dom.utils.addClass).toHaveBeenCalledWith(menu.menus[0], 'on');
		});

		it('should wrap to beginning when moving down from last item', () => {
			menu.index = 2;
			menu._moveItem(1);

			expect(menu.index).toBe(0);
		});

		it('should wrap to end when moving up from first item', () => {
			menu.index = 0;
			menu._moveItem(-1);

			expect(menu.index).toBe(2);
		});
	});

	describe('__removeGlobalEvent', () => {
		it('should remove all global events', () => {
			const mockDropdown = document.createElement('div');
			mockDropdown.removeEventListener = jest.fn();

			menu.currentDropdown = mockDropdown;
			menu._bindClose_dropdown_mouse = 'mouse-event-id';
			menu._bindClose_cons_mouse = 'container-event-id';
			menu._bindClose_dropdown_key = 'key-event-id';
			menu.menus = [document.createElement('div')];

			mockEventManager.removeGlobalEvent.mockReturnValue(null);

			menu.__removeGlobalEvent();

			expect(mockEventManager.removeGlobalEvent).toHaveBeenCalledWith('mouse-event-id');
			expect(mockEventManager.removeGlobalEvent).toHaveBeenCalledWith('container-event-id');
			expect(mockEventManager.removeGlobalEvent).toHaveBeenCalledWith('key-event-id');
			expect(dom.utils.removeClass).toHaveBeenCalledWith(menu.menus, 'on');
			expect(dom.utils.removeClass).toHaveBeenCalledWith(mockDropdown, 'se-select-menu-key-action|se-select-menu-mouse-move');
			expect(mockDropdown.removeEventListener).toHaveBeenCalledWith('mousemove', menu.__globalEventHandler.mousemove, false);
			expect(mockDropdown.removeEventListener).toHaveBeenCalledWith('mouseout', menu.__globalEventHandler.mouseout, false);
		});

		it('should handle null event bindings', () => {
			menu._bindClose_dropdown_mouse = null;
			menu._bindClose_cons_mouse = null;
			menu._bindClose_dropdown_key = null;

			menu.__removeGlobalEvent();

			expect(mockEventManager.removeGlobalEvent).not.toHaveBeenCalled();
		});
	});

	describe('event handlers', () => {
		describe('OnMouseDown_dropdown', () => {
			it('should not close dropdown when clicking inside dropdown', () => {
				const mockEvent = { target: document.createElement('div') };
				const mockTarget = document.createElement('div');

				dom.query.getEventTarget.mockReturnValue(mockTarget);
				dom.query.getParentElement.mockReturnValue(document.createElement('div'));
				menu.dropdownOff = jest.fn();

				menu.__globalEventHandler.mousedown(mockEvent);

				expect(menu.dropdownOff).not.toHaveBeenCalled();
			});

			it('should close dropdown when clicking outside', () => {
				const mockEvent = { target: document.createElement('div') };
				const mockTarget = document.createElement('div');

				dom.query.getEventTarget.mockReturnValue(mockTarget);
				dom.query.getParentElement.mockReturnValue(null);
				menu.dropdownOff = jest.fn();

				menu.__globalEventHandler.mousedown(mockEvent);

				expect(menu.dropdownOff).toHaveBeenCalled();
			});
		});

		describe('OnMouseout_dropdown', () => {
			it('should reset index', () => {
				menu.index = 5;
				menu.__globalEventHandler.mouseout();
				expect(menu.index).toBe(-1);
			});
		});

		describe('OnKeyDown_dropdown', () => {
			beforeEach(() => {
				menu._moveItem = jest.fn();
				menu.dropdownOff = jest.fn();
			});

			it('should handle ArrowUp key', () => {
				const mockEvent = {
					code: 'ArrowUp',
					preventDefault: jest.fn(),
					stopPropagation: jest.fn(),
				};

				menu.__globalEventHandler.keydown(mockEvent);

				expect(mockEvent.preventDefault).toHaveBeenCalled();
				expect(mockEvent.stopPropagation).toHaveBeenCalled();
				expect(menu._moveItem).toHaveBeenCalledWith(-1);
			});

			it('should handle ArrowDown key', () => {
				const mockEvent = {
					code: 'ArrowDown',
					preventDefault: jest.fn(),
					stopPropagation: jest.fn(),
				};

				menu.__globalEventHandler.keydown(mockEvent);

				expect(mockEvent.preventDefault).toHaveBeenCalled();
				expect(mockEvent.stopPropagation).toHaveBeenCalled();
				expect(menu._moveItem).toHaveBeenCalledWith(1);
			});

			it('should handle Enter key with valid selection', () => {
				const mockEvent = {
					code: 'Enter',
					preventDefault: jest.fn(),
					stopPropagation: jest.fn(),
				};

				const mockTarget = document.createElement('div');
				menu.menus = [mockTarget];
				menu.index = 0;
				menu.currentDropdownName = 'testCommand';

				const mockPlugin = { action: jest.fn() };
				menu.plugins.testCommand = mockPlugin;

				menu.__globalEventHandler.keydown(mockEvent);

				expect(mockEvent.preventDefault).toHaveBeenCalled();
				expect(mockEvent.stopPropagation).toHaveBeenCalled();
				expect(mockPlugin.action).toHaveBeenCalledWith(mockTarget);
				expect(menu.dropdownOff).toHaveBeenCalled();
			});

			it('should not handle Enter key with invalid index', () => {
				const mockEvent = {
					code: 'Enter',
					preventDefault: jest.fn(),
					stopPropagation: jest.fn(),
				};

				menu.index = -1;

				menu.__globalEventHandler.keydown(mockEvent);

				expect(mockEvent.preventDefault).not.toHaveBeenCalled();
				expect(menu.dropdownOff).not.toHaveBeenCalled();
			});
		});

		describe('OnMousemove_dropdown', () => {
			it('should update index and classes on mousemove', () => {
				const mockTarget = document.createElement('div');
				const mockEvent = { target: mockTarget };
				const mockDropdown = document.createElement('div');

				menu.currentDropdown = mockDropdown;
				menu.menus = [document.createElement('div'), mockTarget, document.createElement('div')];

				menu.__globalEventHandler.mousemove(mockEvent);

				expect(dom.utils.addClass).toHaveBeenCalledWith(mockDropdown, 'se-select-menu-mouse-move');
				expect(dom.utils.removeClass).toHaveBeenCalledWith(mockDropdown, 'se-select-menu-key-action');
				expect(menu.index).toBe(1);
			});

			it('should not update index when target not in menus', () => {
				const mockTarget = document.createElement('div');
				const mockEvent = { target: mockTarget };

				menu.menus = [document.createElement('div')];
				menu.index = 0;

				menu.__globalEventHandler.mousemove(mockEvent);

				expect(menu.index).toBe(0);
			});
		});
	});
});
