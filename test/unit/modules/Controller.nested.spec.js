/**
 * @fileoverview Essential tests for Controller nested state management
 * Testing the critical changes in commit 9f43ca04:
 * - Parent-child controller relationship (Controller instance vs HTMLElement)
 * - parentsForm separation from parents array
 */

import Controller from '../../../src/modules/contract/Controller.js';

// Mock dependencies
jest.mock('../../../src/editorInjector/_core.js', () => {
	return jest.fn().mockImplementation(function (editor) {
		this.editor = editor;
		this.frameContext =
			editor.frameContext ||
			new Map([
				['lineBreaker_t', { style: { display: '' } }],
				['lineBreaker_b', { style: { display: '' } }],
				['topArea', { offsetHeight: 0 }],
			]);
		this.triggerEvent = editor.triggerEvent || jest.fn().mockResolvedValue(undefined);
		this.carrierWrapper = {
			appendChild: jest.fn(),
			contains: jest.fn().mockReturnValue(true),
		};
		this.eventManager = {
			addEvent: jest.fn(),
			removeGlobalEvent: jest.fn(),
			addGlobalEvent: jest.fn(),
		};
		this.component = {
			__removeGlobalEvent: jest.fn(),
			deselect: jest.fn(),
		};
		this.uiManager = editor.uiManager;
		this.selection = editor.selection;
		this.offset = editor.offset;
		this.status = editor.status;
		this.instanceCheck = {
			isRange: jest.fn().mockReturnValue(false),
		};
	});
});

jest.mock('../../../src/helper', () => ({
	dom: {
		check: {
			isElement: jest.fn().mockImplementation((obj) => {
				// Controller instances should not be treated as elements
				if (obj && obj.constructor && obj.constructor.name === 'Controller') {
					return false;
				}
				// Mock elements should be treated as elements
				return obj && (obj.nodeType === 1 || obj.id || obj.style);
			}),
		},
		utils: {
			addClass: jest.fn(),
			removeClass: jest.fn(),
			hasClass: jest.fn().mockReturnValue(false),
			createElement: jest.fn().mockImplementation((tagName, attrs) => ({
				querySelector: jest.fn(),
				appendChild: jest.fn(),
				children: [],
				className: attrs?.class || '',
			})),
		},
		query: {
			getParentElement: jest.fn(),
			getEventTarget: jest.fn((e) => e.target),
		},
	},
	env: { _w: { setTimeout: (fn) => fn() }, isMobile: false },
	keyCodeMap: {},
}));

describe('Controller - Nested State Management (Essential Tests)', () => {
	let mockEditor;
	let mockInst;

	const createMockElement = (id = 'test') => {
		const element = {
			id,
			style: {
				visibility: '',
				display: '',
				position: '',
				left: '',
				top: '',
				zIndex: '',
			},
			appendChild: jest.fn(),
			removeAttribute: jest.fn(),
			setAttribute: jest.fn(),
			hasAttribute: jest.fn(),
			_attributes: new Set(),
			classList: {
				add: jest.fn(),
				remove: jest.fn(),
				contains: jest.fn(),
			},
			getBoundingClientRect: jest.fn().mockReturnValue({
				width: 100,
				height: 50,
				top: 0,
				left: 0,
				right: 100,
				bottom: 50,
			}),
			contains: jest.fn().mockReturnValue(false),
		};

		element.setAttribute = jest.fn((attr, value) => {
			element._attributes.add(attr);
		});
		element.removeAttribute = jest.fn((attr) => {
			element._attributes.delete(attr);
		});
		element.hasAttribute = jest.fn((attr) => {
			return element._attributes.has(attr);
		});

		return element;
	};

	beforeEach(() => {
		jest.clearAllMocks();

		mockEditor = {
			uiManager: {
				showController: jest.fn(),
				hideController: jest.fn(),
				setControllerOnDisabledButtons: jest.fn(),
				onControllerContext: jest.fn(),
				offControllerContext: jest.fn(),
				opendControllers: [],
				currentControllerName: ''
			},
			selection: {
				getRangeElement: jest.fn(),
				isRange: jest.fn().mockReturnValue(false),
			},
			triggerEvent: jest.fn().mockResolvedValue(undefined),
			offset: {
				setRangePosition: jest.fn().mockReturnValue(true),
				setAbsPosition: jest.fn().mockReturnValue({ position: 'bottom' }),
			},
			status: {
				hasFocus: true,
			},
			component: {
				__removeGlobalEvent: jest.fn(),
				deselect: jest.fn(),
			},
			toolbar: {
				hide: jest.fn(),
			},
			subToolbar: {
				hide: jest.fn(),
			},
			isBalloon: false,
			isSubBalloon: false,
			opendControllers: [],
		};

		mockInst = {
			editor: mockEditor,
			constructor: {
				key: 'testController',
				name: 'TestController',
			},
		};
	});

	describe('Parent-Child Relationship', () => {
		it('should initialize parentsForm with Controller instance parent', () => {
			const parentElement = createMockElement('parent');
			const parentController = new Controller(mockInst, parentElement, {});

			const childElement = createMockElement('child');
			const childController = new Controller(mockInst, childElement, {
				parents: [parentController],
			});

			// parentsForm should contain the parent's form element
			expect(childController.parentsForm).toHaveLength(1);
			expect(childController.parentsForm[0]).toEqual(parentElement);
			// parents array should contain the Controller instance
			expect(childController.parents).toHaveLength(1);
			expect(childController.parents[0]).toBe(parentController);
		});

		it('should initialize parentsForm with HTMLElement parent (legacy)', () => {
			const parentElement = createMockElement('parent');

			const childElement = createMockElement('child');
			const childController = new Controller(mockInst, childElement, {
				parents: [parentElement],
			});

			expect(childController.parentsForm).toHaveLength(1);
			expect(childController.parentsForm[0]).toEqual(parentElement);
			// parents array should contain the HTMLElement
			expect(childController.parents).toHaveLength(1);
			expect(childController.parents[0]).toBe(parentElement);
		});

		it('should support mixed parent types (Controller + HTMLElement)', () => {
			const parentElement1 = createMockElement('parent1');
			const parentController = new Controller(mockInst, parentElement1, {});

			const parentElement2 = createMockElement('parent2');

			const childElement = createMockElement('child');
			const childController = new Controller(mockInst, childElement, {
				parents: [parentController, parentElement2],
			});

			expect(childController.parentsForm).toHaveLength(2);
			expect(childController.parentsForm[0]).toEqual(parentElement1);
			expect(childController.parentsForm[1]).toEqual(parentElement2);
			// parents should contain mixed types
			expect(childController.parents).toHaveLength(2);
			expect(childController.parents[0]).toBe(parentController);
			expect(childController.parents[1]).toBe(parentElement2);
		});
	});

	describe('Clean Up on Close', () => {
		it('should clean up hidden state attributes on close', () => {
			const element = createMockElement();
			const controller = new Controller(mockInst, element, {});
			controller.isOpen = true;
			element.setAttribute('data-se-hidden-by-parent', '1');
			element.setAttribute('data-se-hidden-by-children', '1');

			controller.close();

			expect(element.removeAttribute).toHaveBeenCalledWith('data-se-hidden-by-parent');
			expect(element.removeAttribute).toHaveBeenCalledWith('data-se-hidden-by-children');
		});
	});

	describe('Scroll Repositioning', () => {
		it('should skip repositioning if hidden by parent attribute', () => {
			const element = createMockElement();
			element._attributes.add('data-se-hidden-by-parent');
			const controller = new Controller(mockInst, element, {});

			const setPositionSpy = jest.spyOn(mockEditor.offset, 'setAbsPosition');

			controller._scrollReposition(false);

			// Should not call setAbsPosition if hidden by parent
			expect(setPositionSpy).not.toHaveBeenCalled();
		});

		it('should skip repositioning if hidden by children attribute', () => {
			const element = createMockElement();
			element._attributes.add('data-se-hidden-by-children');
			const controller = new Controller(mockInst, element, {});

			const setPositionSpy = jest.spyOn(mockEditor.offset, 'setAbsPosition');

			controller._scrollReposition(false);

			expect(setPositionSpy).not.toHaveBeenCalled();
		});
	});

	describe('parentsHide Behavior', () => {
		it('should hide parent forms when parentsHide controller opens', async () => {
			const parent1Element = createMockElement('parent1');
			parent1Element.style.display = 'block';
			const parent1Controller = new Controller(mockInst, parent1Element, {});

			const parent2Element = createMockElement('parent2');
			parent2Element.style.display = 'block';

			const childElement = createMockElement('child');
			const childController = new Controller(mockInst, childElement, {
				parents: [parent1Controller, parent2Element],
				parentsHide: true,
			});

			const target = { getBoundingClientRect: jest.fn().mockReturnValue({ top: 0, left: 0, right: 100, bottom: 50, width: 100, height: 50 }) };

			await childController.open(target, target, {});

			expect(parent1Element.style.display).toBe('none');
			expect(parent1Element.setAttribute).toHaveBeenCalledWith('data-se-hidden-by-children', '1');
			expect(parent2Element.style.display).toBe('none');
			expect(parent2Element.setAttribute).toHaveBeenCalledWith('data-se-hidden-by-children', '1');
		});

		it('should show parent forms when parentsHide child closes normally', async () => {
			const parent1Element = createMockElement('parent1');
			parent1Element.style.display = 'block';
			const parent1Controller = new Controller(mockInst, parent1Element, {});

			const childElement = createMockElement('child');
			const childController = new Controller(mockInst, childElement, {
				parents: [parent1Controller],
				parentsHide: true,
			});

			const target = { getBoundingClientRect: jest.fn().mockReturnValue({ top: 0, left: 0, right: 100, bottom: 50, width: 100, height: 50 }) };
			await childController.open(target, target, {});
			childController.isOpen = true;

			expect(parent1Element.style.display).toBe('none');

			childController.close(); // normal close

			expect(parent1Element.style.display).toBe('block');
			expect(parent1Element.removeAttribute).toHaveBeenCalledWith('data-se-hidden-by-children');
		});

		it('should not show parent if force closed', async () => {
			const parent1Element = createMockElement('parent1');
			parent1Element.style.display = 'block';
			const parent1Controller = new Controller(mockInst, parent1Element, {});

			const childElement = createMockElement('child');
			const childController = new Controller(mockInst, childElement, {
				parents: [parent1Controller],
				parentsHide: true,
			});

			const target = { getBoundingClientRect: jest.fn().mockReturnValue({ top: 0, left: 0, right: 100, bottom: 50, width: 100, height: 50 }) };
			await childController.open(target, target, {});
			childController.isOpen = true;

			expect(parent1Element.style.display).toBe('none');

			childController.close(true); // force close

			// Parent should NOT be shown when force closed
			expect(parent1Element.style.display).toBe('none');
		});
	});

	describe('Z-Index Management', () => {
		it('should manage z-index with isOutsideForm and parents', async () => {
			const parent1Element = createMockElement('parent1');
			parent1Element.style.zIndex = '2147483641';
			const parent1Controller = new Controller(mockInst, parent1Element, {});

			const childElement = createMockElement('child');
			const childController = new Controller(mockInst, childElement, {
				isOutsideForm: true,
				parents: [parent1Controller],
			});

			mockEditor.opendControllers = [{ form: parent1Element }];

			const target = { getBoundingClientRect: jest.fn().mockReturnValue({ top: 0, left: 0, right: 100, bottom: 50, width: 100, height: 50 }) };
			await childController.open(target, target, {});

			// isOutsideForm logic should work with parentsForm
			expect(parent1Element.style.zIndex).toBe('2147483641');
		});
	});
});
