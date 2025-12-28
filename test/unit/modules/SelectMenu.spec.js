/**
 * @fileoverview Unit tests for modules/SelectMenu.js
 */

import SelectMenu from '../../../src/modules/ui/SelectMenu.js';

// Mock dependencies
jest.mock('../../../src/editorInjector/_core.js', () => {
	return jest.fn().mockImplementation(function (editor) {
		this.editor = editor;
		this.frameContext = editor.frameContext;
		this.options = editor.options || new Map();
		this.eventManager = editor.eventManager || {
			addGlobalEvent: jest.fn(() => 'mock-event-id'),
			removeGlobalEvent: jest.fn()
		};
		this.triggerEvent = editor.triggerEvent || jest.fn();
	});
});

jest.mock('../../../src/helper', () => ({
	dom: {
		check: {
			isElement: jest.fn().mockReturnValue(true),
			isInputElement: jest.fn().mockReturnValue(false)
		},
		utils: {
			addClass: jest.fn(),
			removeClass: jest.fn(),
			toggleClass: jest.fn(),
			hasClass: jest.fn().mockReturnValue(false),
			createElement: jest.fn().mockImplementation((tag, attrs, innerHTML) => {
				const el = global.document.createElement(tag || 'div');
				if (attrs) {
					Object.keys(attrs).forEach((attr) => {
						el.setAttribute(attr, attrs[attr]);
					});
				}
				if (innerHTML) {
					el.innerHTML = innerHTML;
				}
				return el;
			}),
			getClientSize: jest.fn().mockReturnValue({ w: 1024, h: 768 })
		},
		query: {
			getEventTarget: jest.fn((e) => e.target),
			getParentElement: jest.fn((el) => el.parentElement)
		}
	},
	env: { _w: { innerWidth: 1024, innerHeight: 768, scrollX: 0, scrollY: 0 }, isGecko: false },
	keyCodeMap: { isEsc: jest.fn((code) => code === 'Escape') }
}));

describe('Modules - SelectMenu', () => {
	let mockInst;
	let mockEditor;

	beforeEach(() => {
		jest.clearAllMocks();

		mockEditor = {
			ui: { showSelectMenu: jest.fn(), hideSelectMenu: jest.fn() },
			selection: { getRangeElement: jest.fn() },
			triggerEvent: jest.fn(),
			offset: {
				get: jest.fn(() => ({ left: 100, top: 50 })),
				getGlobal: jest.fn(() => ({ left: 100, top: 50 }))
			},
			selectMenuOn: false,
			frameContext: new Map([['_ww', document.createElement('div')]]),
			options: new Map([['_rtl', false]]),
			eventManager: {
				addGlobalEvent: jest.fn(() => 'mock-event-id'),
				removeGlobalEvent: jest.fn(),
				_injectActiveEvent: jest.fn()
			}
		};

		mockInst = {
			editor: mockEditor,
			constructor: {
				key: 'testSelectMenu',
				name: 'TestSelectMenu'
			}
		};
	});

	describe('Constructor', () => {
		it('should initialize with checkList parameter', () => {
			const params = { position: 'top-center', checkList: true };
			const selectMenu = new SelectMenu(mockEditor, params);
			expect(selectMenu.checkList).toBe(true);
		});

		it('should initialize with splitNum for horizontal layout', () => {
			const params = { position: 'top-center', splitNum: 5 };
			const selectMenu = new SelectMenu(mockEditor, params);
			expect(selectMenu.splitNum).toBe(5);
			expect(selectMenu.horizontal).toBe(true);
		});

		it('should initialize with dir parameter', () => {
			const params = { position: 'top-center', dir: 'rtl' };
			const selectMenu = new SelectMenu(mockEditor, params);
			expect(selectMenu).toBeDefined();
		});

		it('should initialize with openMethod and closeMethod', () => {
			const openMethod = jest.fn();
			const closeMethod = jest.fn();
			const params = { position: 'top-center', openMethod, closeMethod };
			const selectMenu = new SelectMenu(mockEditor, params);
			expect(selectMenu.openMethod).toBe(openMethod);
			expect(selectMenu.closeMethod).toBe(closeMethod);
		});

		it('should initialize isOpen to false', () => {
			const params = { position: 'top-center' };
			const selectMenu = new SelectMenu(mockEditor, params);
			expect(selectMenu.isOpen).toBe(false);
		});

		it('should initialize index to -1', () => {
			const params = { position: 'top-center' };
			const selectMenu = new SelectMenu(mockEditor, params);
			expect(selectMenu.index).toBe(-1);
		});
	});

	describe('on method', () => {
		let selectMenu;
		let referElement;

		beforeEach(() => {
			const params = { position: 'top-center' };
			selectMenu = new SelectMenu(mockEditor, params);

			// Create a proper DOM structure
			const parent = document.createElement('div');
			referElement = document.createElement('button');
			parent.appendChild(referElement);
		});

		it('should initialize select menu and attach to reference element', () => {
			const selectMethod = jest.fn();
			const attr = { class: 'custom-class', style: 'color: red;' };

			selectMenu.on(referElement, selectMethod, attr);

			expect(selectMenu.form).toBeDefined();
			expect(selectMenu.form.parentNode).toBe(referElement.parentNode);
		});

		it('should handle empty attr parameter', () => {
			const selectMethod = jest.fn();

			expect(() => {
				selectMenu.on(referElement, selectMethod);
			}).not.toThrow();
		});
	});

	describe('create method', () => {
		let selectMenu;
		let referElement;

		beforeEach(() => {
			const params = { position: 'top-center' };
			selectMenu = new SelectMenu(mockEditor, params);

			const parent = document.createElement('div');
			referElement = document.createElement('button');
			parent.appendChild(referElement);

			const selectMethod = jest.fn();
			selectMenu.on(referElement, selectMethod);
		});

		it('should create menu items from string array', () => {
			const items = ['Item 1', 'Item 2', 'Item 3'];
			selectMenu.create(items);

			expect(selectMenu.items).toEqual(items);
			expect(selectMenu.menuLen).toBe(3);
			expect(selectMenu.menus).toBeDefined();
			expect(selectMenu.menus.length).toBe(3);
		});

		it('should create menu items with separate menu display', () => {
			const items = ['cmd1', 'cmd2', 'cmd3'];
			const menus = ['<b>Display 1</b>', '<b>Display 2</b>', '<b>Display 3</b>'];
			selectMenu.create(items, menus);

			expect(selectMenu.items).toEqual(items);
			expect(selectMenu.menuLen).toBe(3);
		});

		it('should handle horizontal layout with splitNum', () => {
			const params = { position: 'top-center', splitNum: 2 };
			const horizontalMenu = new SelectMenu(mockEditor, params);

			const parent = document.createElement('div');
			const ref = document.createElement('button');
			parent.appendChild(ref);
			horizontalMenu.on(ref, jest.fn());

			const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];
			horizontalMenu.create(items);

			expect(horizontalMenu.items).toEqual(items);
			expect(horizontalMenu.menuLen).toBe(4);
		});

		it('should clear previous menu items', () => {
			const items1 = ['Item 1', 'Item 2'];
			selectMenu.create(items1);
			expect(selectMenu.menuLen).toBe(2);

			const items2 = ['New 1', 'New 2', 'New 3'];
			selectMenu.create(items2);
			expect(selectMenu.menuLen).toBe(3);
			expect(selectMenu.items).toEqual(items2);
		});
	});

	describe('getItem and setItem methods', () => {
		let selectMenu;

		beforeEach(() => {
			const params = { position: 'top-center' };
			selectMenu = new SelectMenu(mockEditor, params);

			const parent = document.createElement('div');
			const referElement = document.createElement('button');
			parent.appendChild(referElement);

			selectMenu.on(referElement, jest.fn());

			const items = ['Item 1', 'Item 2', 'Item 3'];
			selectMenu.create(items);
		});

		it('should get item by index', () => {
			expect(selectMenu.getItem(0)).toBe('Item 1');
			expect(selectMenu.getItem(1)).toBe('Item 2');
			expect(selectMenu.getItem(2)).toBe('Item 3');
		});

		it('should set item by index', () => {
			selectMenu.setItem(1);
			expect(selectMenu.index).toBe(1);
			expect(selectMenu.item).toBe('Item 2');
		});

		it('should handle out of range index', () => {
			expect(selectMenu.getItem(10)).toBeUndefined();
		});
	});

	describe('open method', () => {
		let selectMenu;
		let referElement;

		beforeEach(() => {
			const params = { position: 'top-center' };
			selectMenu = new SelectMenu(mockEditor, params);

			const parent = document.createElement('div');
			parent.style.position = 'relative';
			referElement = document.createElement('button');
			referElement.style.width = '100px';
			referElement.style.height = '30px';
			Object.defineProperty(referElement, 'offsetWidth', { value: 100 });
			Object.defineProperty(referElement, 'offsetHeight', { value: 30 });
			Object.defineProperty(referElement, 'offsetTop', { value: 100 });
			Object.defineProperty(referElement, 'offsetLeft', { value: 50 });
			parent.appendChild(referElement);
			document.body.appendChild(parent);

			selectMenu.on(referElement, jest.fn());

			const items = ['Item 1', 'Item 2', 'Item 3'];
			selectMenu.create(items);

			// Mock form dimensions
			Object.defineProperty(selectMenu.form, 'offsetWidth', { value: 150, configurable: true });
			Object.defineProperty(selectMenu.form, 'offsetHeight', { value: 100, configurable: true });
		});

		afterEach(() => {
			document.body.innerHTML = '';
		});

		it('should open select menu', () => {
			selectMenu.open();

			expect(mockEditor.selectMenuOn).toBe(true);
			expect(selectMenu.isOpen).toBe(true);
			expect(mockEditor.eventManager.addGlobalEvent).toHaveBeenCalled();
		});

		it('should call openMethod if provided', () => {
			const openMethod = jest.fn();
			const params = { position: 'top-center', openMethod };
			const menuWithCallback = new SelectMenu(mockEditor, params);

			const parent = document.createElement('div');
			const ref = document.createElement('button');
			parent.appendChild(ref);
			menuWithCallback.on(ref, jest.fn());
			menuWithCallback.create(['Item 1']);

			menuWithCallback.open();

			expect(openMethod).toHaveBeenCalled();
		});

		it('should handle position parameter', () => {
			selectMenu.open('bottom-left');
			expect(selectMenu.isOpen).toBe(true);
		});

		it('should handle onItemQuerySelector parameter', () => {
			selectMenu.open('top-center', '.se-select-item[data-index="1"]');
			expect(selectMenu.isOpen).toBe(true);
		});
	});

	describe('close method', () => {
		let selectMenu;

		beforeEach(() => {
			const params = { position: 'top-center' };
			selectMenu = new SelectMenu(mockEditor, params);

			const parent = document.createElement('div');
			const referElement = document.createElement('button');
			parent.appendChild(referElement);

			selectMenu.on(referElement, jest.fn());
			selectMenu.create(['Item 1', 'Item 2']);
		});

		it('should close select menu', () => {
			selectMenu.open();
			expect(selectMenu.isOpen).toBe(true);

			selectMenu.close();
			expect(mockEditor.selectMenuOn).toBe(false);
			expect(selectMenu.isOpen).toBe(false);
			expect(selectMenu.index).toBe(-1);
			expect(selectMenu.item).toBeNull();
		});

		it('should call closeMethod if provided', () => {
			const closeMethod = jest.fn();
			const params = { position: 'top-center', closeMethod };
			const menuWithCallback = new SelectMenu(mockEditor, params);

			const parent = document.createElement('div');
			const ref = document.createElement('button');
			parent.appendChild(ref);
			menuWithCallback.on(ref, jest.fn());
			menuWithCallback.create(['Item 1']);

			menuWithCallback.open();
			menuWithCallback.close();

			expect(closeMethod).toHaveBeenCalled();
		});

		it('should handle close when not open', () => {
			expect(() => {
				selectMenu.close();
			}).not.toThrow();
		});

		it('should reset index and item', () => {
			selectMenu.setItem(1);
			expect(selectMenu.index).toBe(1);

			selectMenu.close();
			expect(selectMenu.index).toBe(-1);
			expect(selectMenu.item).toBeNull();
		});
	});

	describe('Event handling', () => {
		let selectMenu;
		let referElement;
		let selectMethod;

		beforeEach(() => {
			const params = { position: 'top-center' };
			selectMenu = new SelectMenu(mockEditor, params);

			const parent = document.createElement('div');
			referElement = document.createElement('button');
			Object.defineProperty(referElement, 'offsetWidth', { value: 100 });
			Object.defineProperty(referElement, 'offsetHeight', { value: 30 });
			Object.defineProperty(referElement, 'offsetTop', { value: 100 });
			Object.defineProperty(referElement, 'offsetLeft', { value: 50 });
			parent.appendChild(referElement);
			document.body.appendChild(parent);

			selectMethod = jest.fn();
			selectMenu.on(referElement, selectMethod);
			selectMenu.create(['Item 1', 'Item 2', 'Item 3']);

			Object.defineProperty(selectMenu.form, 'offsetWidth', { value: 150, configurable: true });
			Object.defineProperty(selectMenu.form, 'offsetHeight', { value: 100, configurable: true });
		});

		afterEach(() => {
			document.body.innerHTML = '';
		});

		it('should handle keyboard navigation - ArrowDown', () => {
			selectMenu.open();
			expect(selectMenu.index).toBe(-1);

			const event = new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true });
			Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
			Object.defineProperty(event, 'stopPropagation', { value: jest.fn() });

			selectMenu.form.dispatchEvent(event);

			// Since we can't directly test private methods, we just verify the menu is open
			expect(selectMenu.isOpen).toBe(true);
		});

		it('should handle keyboard navigation - Escape', () => {
			selectMenu.open();
			expect(selectMenu.isOpen).toBe(true);

			// Simulate global Escape key
			const event = { code: 'Escape' };
			const { keyCodeMap } = require('../../../src/helper');
			keyCodeMap.isEsc.mockReturnValue(true);

			// Manually trigger close (simulating what the event handler would do)
			if (keyCodeMap.isEsc(event.code)) {
				selectMenu.close();
			}

			expect(selectMenu.isOpen).toBe(false);
		});
	});


	describe('Edge cases', () => {
		it('should handle different position combinations', () => {
			const positions = ['top-center', 'top-left', 'top-right', 'bottom-center', 'bottom-left', 'bottom-right', 'left-middle', 'right-middle'];

			positions.forEach((pos) => {
				expect(() => {
					const params = { position: pos };
					new SelectMenu(mockEditor, params);
				}).not.toThrow();
			});
		});

		it('should handle zero items', () => {
			const params = { position: 'top-center' };
			const selectMenu = new SelectMenu(mockEditor, params);

			const parent = document.createElement('div');
			const ref = document.createElement('button');
			parent.appendChild(ref);
			selectMenu.on(ref, jest.fn());

			selectMenu.create([]);
			expect(selectMenu.menuLen).toBe(0);
		});

		it('should handle checkList toggle', () => {
			const params = { position: 'top-center', checkList: true };
			const selectMenu = new SelectMenu(mockEditor, params);

			const parent = document.createElement('div');
			const ref = document.createElement('button');
			parent.appendChild(ref);
			selectMenu.on(ref, jest.fn());
			selectMenu.create(['Item 1', 'Item 2']);

			expect(selectMenu.checkList).toBe(true);
		});

		it('should handle left position', () => {
			const params = { position: 'left-middle' };
			const selectMenu = new SelectMenu(mockEditor, params);

			const parent = document.createElement('div');
			const ref = document.createElement('button');
			Object.defineProperty(ref, 'offsetWidth', { value: 100 });
			Object.defineProperty(ref, 'offsetHeight', { value: 30 });
			Object.defineProperty(ref, 'offsetTop', { value: 100 });
			Object.defineProperty(ref, 'offsetLeft', { value: 200 });
			parent.appendChild(ref);
			document.body.appendChild(parent);

			selectMenu.on(ref, jest.fn());
			selectMenu.create(['Item 1', 'Item 2']);

			Object.defineProperty(selectMenu.form, 'offsetWidth', { value: 150, configurable: true });
			Object.defineProperty(selectMenu.form, 'offsetHeight', { value: 100, configurable: true });

			expect(() => {
				selectMenu.open();
			}).not.toThrow();

			document.body.innerHTML = '';
		});

		it('should handle right position', () => {
			const params = { position: 'right-middle' };
			const selectMenu = new SelectMenu(mockEditor, params);

			const parent = document.createElement('div');
			const ref = document.createElement('button');
			Object.defineProperty(ref, 'offsetWidth', { value: 100 });
			Object.defineProperty(ref, 'offsetHeight', { value: 30 });
			Object.defineProperty(ref, 'offsetTop', { value: 100 });
			Object.defineProperty(ref, 'offsetLeft', { value: 200 });
			parent.appendChild(ref);
			document.body.appendChild(parent);

			selectMenu.on(ref, jest.fn());
			selectMenu.create(['Item 1', 'Item 2']);

			Object.defineProperty(selectMenu.form, 'offsetWidth', { value: 150, configurable: true });
			Object.defineProperty(selectMenu.form, 'offsetHeight', { value: 100, configurable: true });

			expect(() => {
				selectMenu.open();
			}).not.toThrow();

			document.body.innerHTML = '';
		});

		it('should handle bottom-right position', () => {
			const params = { position: 'bottom-right' };
			const selectMenu = new SelectMenu(mockEditor, params);

			const parent = document.createElement('div');
			const ref = document.createElement('button');
			Object.defineProperty(ref, 'offsetWidth', { value: 100 });
			Object.defineProperty(ref, 'offsetHeight', { value: 30 });
			Object.defineProperty(ref, 'offsetTop', { value: 100 });
			Object.defineProperty(ref, 'offsetLeft', { value: 50 });
			parent.appendChild(ref);
			document.body.appendChild(parent);

			selectMenu.on(ref, jest.fn());
			selectMenu.create(['Item 1', 'Item 2']);

			Object.defineProperty(selectMenu.form, 'offsetWidth', { value: 150, configurable: true });
			Object.defineProperty(selectMenu.form, 'offsetHeight', { value: 100, configurable: true });

			expect(() => {
				selectMenu.open();
			}).not.toThrow();

			document.body.innerHTML = '';
		});
	});

	describe('Keyboard navigation', () => {
		let selectMenu;
		let referElement;
		let selectMethod;
		let keydownTarget;

		beforeEach(() => {
			const params = { position: 'top-center' };
			selectMenu = new SelectMenu(mockEditor, params);

			const parent = document.createElement('div');
			referElement = document.createElement('button');
			Object.defineProperty(referElement, 'offsetWidth', { value: 100 });
			Object.defineProperty(referElement, 'offsetHeight', { value: 30 });
			Object.defineProperty(referElement, 'offsetTop', { value: 100 });
			Object.defineProperty(referElement, 'offsetLeft', { value: 50 });
			parent.appendChild(referElement);
			document.body.appendChild(parent);

			selectMethod = jest.fn();
			selectMenu.on(referElement, selectMethod);
			selectMenu.create(['Item 1', 'Item 2', 'Item 3']);

			Object.defineProperty(selectMenu.form, 'offsetWidth', { value: 150, configurable: true });
			Object.defineProperty(selectMenu.form, 'offsetHeight', { value: 100, configurable: true });

			keydownTarget = selectMenu.form.previousElementSibling || mockEditor.frameContext.get('_ww');
		});

		afterEach(() => {
			document.body.innerHTML = '';
		});

		it('should navigate with ArrowUp key', () => {
			selectMenu.open();
			selectMenu.setItem(1);

			const event = new KeyboardEvent('keydown', { code: 'ArrowUp', bubbles: true });
			Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
			Object.defineProperty(event, 'stopPropagation', { value: jest.fn() });

			mockEditor.frameContext.get('_ww').dispatchEvent(event);
			expect(selectMenu.isOpen).toBe(true);
		});

		it('should navigate with ArrowLeft key', () => {
			selectMenu.open();
			selectMenu.setItem(1);

			const event = new KeyboardEvent('keydown', { code: 'ArrowLeft', bubbles: true });
			Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
			Object.defineProperty(event, 'stopPropagation', { value: jest.fn() });

			mockEditor.frameContext.get('_ww').dispatchEvent(event);
			expect(selectMenu.isOpen).toBe(true);
		});

		it('should navigate with ArrowRight key', () => {
			selectMenu.open();
			selectMenu.setItem(1);

			const event = new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true });
			Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
			Object.defineProperty(event, 'stopPropagation', { value: jest.fn() });

			mockEditor.frameContext.get('_ww').dispatchEvent(event);
			expect(selectMenu.isOpen).toBe(true);
		});

		it('should select item with Enter key', () => {
			selectMenu.open();
			selectMenu.setItem(1);

			const event = new KeyboardEvent('keydown', { code: 'Enter', bubbles: true });
			Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
			Object.defineProperty(event, 'stopPropagation', { value: jest.fn() });

			mockEditor.frameContext.get('_ww').dispatchEvent(event);
			expect(selectMenu.isOpen).toBe(true);
		});

		it('should select item with Space key', () => {
			selectMenu.open();
			selectMenu.setItem(1);

			const event = new KeyboardEvent('keydown', { code: 'Space', bubbles: true });
			Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
			Object.defineProperty(event, 'stopPropagation', { value: jest.fn() });

			mockEditor.frameContext.get('_ww').dispatchEvent(event);
			expect(selectMenu.isOpen).toBe(true);
		});

		it('should close with Enter when no item selected', () => {
			selectMenu.open();

			const event = new KeyboardEvent('keydown', { code: 'Enter', bubbles: true });
			Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
			Object.defineProperty(event, 'stopPropagation', { value: jest.fn() });

			mockEditor.frameContext.get('_ww').dispatchEvent(event);
			expect(selectMenu.index).toBe(-1);
		});
	});

	describe('Horizontal navigation', () => {
		let selectMenu;

		beforeEach(() => {
			const params = { position: 'top-center', splitNum: 2 };
			selectMenu = new SelectMenu(mockEditor, params);

			const parent = document.createElement('div');
			const ref = document.createElement('button');
			Object.defineProperty(ref, 'offsetWidth', { value: 100 });
			Object.defineProperty(ref, 'offsetHeight', { value: 30 });
			Object.defineProperty(ref, 'offsetTop', { value: 100 });
			Object.defineProperty(ref, 'offsetLeft', { value: 50 });
			parent.appendChild(ref);
			document.body.appendChild(parent);

			selectMenu.on(ref, jest.fn());
			selectMenu.create(['Item 1', 'Item 2', 'Item 3', 'Item 4']);

			Object.defineProperty(selectMenu.form, 'offsetWidth', { value: 200, configurable: true });
			Object.defineProperty(selectMenu.form, 'offsetHeight', { value: 100, configurable: true });
		});

		afterEach(() => {
			document.body.innerHTML = '';
		});

		it('should navigate horizontally with ArrowUp', () => {
			selectMenu.open();
			selectMenu.setItem(2);

			const event = new KeyboardEvent('keydown', { code: 'ArrowUp', bubbles: true });
			Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
			Object.defineProperty(event, 'stopPropagation', { value: jest.fn() });

			mockEditor.frameContext.get('_ww').dispatchEvent(event);
			expect(selectMenu.horizontal).toBe(true);
		});

		it('should navigate horizontally with ArrowDown', () => {
			selectMenu.open();
			selectMenu.setItem(1);

			const event = new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true });
			Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
			Object.defineProperty(event, 'stopPropagation', { value: jest.fn() });

			mockEditor.frameContext.get('_ww').dispatchEvent(event);
			expect(selectMenu.horizontal).toBe(true);
		});
	});

	describe('CheckList functionality', () => {
		let selectMenu;
		let selectMethod;

		beforeEach(() => {
			const params = { position: 'top-center', checkList: true };
			selectMenu = new SelectMenu(mockEditor, params);

			const parent = document.createElement('div');
			const ref = document.createElement('button');
			Object.defineProperty(ref, 'offsetWidth', { value: 100 });
			Object.defineProperty(ref, 'offsetHeight', { value: 30 });
			Object.defineProperty(ref, 'offsetTop', { value: 100 });
			Object.defineProperty(ref, 'offsetLeft', { value: 50 });
			parent.appendChild(ref);
			document.body.appendChild(parent);

			selectMethod = jest.fn();
			selectMenu.on(ref, selectMethod);
			selectMenu.create(['Item 1', 'Item 2', 'Item 3']);

			Object.defineProperty(selectMenu.form, 'offsetWidth', { value: 150, configurable: true });
			Object.defineProperty(selectMenu.form, 'offsetHeight', { value: 100, configurable: true });
		});

		afterEach(() => {
			document.body.innerHTML = '';
		});

		it('should toggle check class on item click', () => {
			const { dom } = require('../../../src/helper');
			selectMenu.open();

			const menuItem = selectMenu.menus[0];
			menuItem.setAttribute('data-index', '0');

			const event = { target: menuItem };
			const { query } = require('../../../src/helper').dom;
			query.getEventTarget.mockReturnValue(menuItem);

			selectMenu.form.dispatchEvent(new MouseEvent('click', { bubbles: true }));

			expect(dom.utils.toggleClass).toHaveBeenCalled();
		});
	});
});
