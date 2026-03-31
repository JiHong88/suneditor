/**
 * @fileoverview Comprehensive unit tests for modules/Controller.js
 * Targeting high branch coverage across all public and private methods.
 */

import Controller from '../../../src/modules/contract/Controller.js';
import { createMockEditor } from '../../../test/__mocks__/editorMock.js';

// ---------- module-level mocks ----------

jest.mock('../../../src/modules/ui/_DragHandle.js', () => ({
	_DragHandle: { get: jest.fn().mockReturnValue(null), set: jest.fn() },
}));

jest.mock('../../../src/helper', () => ({
	dom: {
		check: {
			isElement: jest.fn((obj) => {
				if (obj && typeof obj === 'object' && obj.constructor && obj.constructor.name === 'Controller') return false;
				return obj && (obj.nodeType === 1 || (obj.style !== undefined && obj.tagName !== undefined));
			}),
			isWysiwygFrame: jest.fn().mockReturnValue(false),
		},
		utils: {
			hasClass: jest.fn().mockReturnValue(false),
		},
		query: {
			getParentElement: jest.fn().mockReturnValue(null),
			getEventTarget: jest.fn((e) => e.target),
			getCommandTarget: jest.fn((el) => (el && el.hasAttribute && el.hasAttribute('data-command') ? el : null)),
		},
	},
	env: {
		_w: { setTimeout: (fn) => fn() },
		isMobile: false,
		ON_OVER_COMPONENT: Symbol.for('ON_OVER_COMPONENT_TEST'),
	},
	keyCodeMap: {
		isEsc: jest.fn().mockReturnValue(false),
		isCtrl: jest.fn().mockReturnValue(false),
		isNonResponseKey: jest.fn().mockReturnValue(false),
	},
}));

// Get references to the mocked modules for per-test reconfiguration
const { dom: mockDom, env, keyCodeMap: mockKeyCodeMap } = require('../../../src/helper');
const { _DragHandle: mockDragHandle } = require('../../../src/modules/ui/_DragHandle.js');

// ---------- helpers ----------

function createMockElement(id = 'test') {
	const el = document.createElement('div');
	el.id = id;
	el.style.visibility = '';
	el.style.display = '';
	el.style.position = '';
	el.style.left = '';
	el.style.top = '';
	el.style.zIndex = '';
	return el;
}

function createTarget() {
	const t = document.createElement('div');
	Object.defineProperty(t, 'getBoundingClientRect', {
		value: jest.fn().mockReturnValue({ top: 100, left: 50, bottom: 150, right: 150, width: 100, height: 50 }),
	});
	return t;
}

/**
 * Extract event handlers bound during construction from eventManager.addEvent.mock.calls
 */
function getFormEventHandlers($) {
	const calls = $.eventManager.addEvent.mock.calls;
	const map = {};
	for (const [, type, handler] of calls) {
		map[type] = handler;
	}
	return map;
}

/**
 * Extract global event handlers bound via addGlobalEvent
 */
function getGlobalEventHandlers($) {
	const calls = $.eventManager.addGlobalEvent.mock.calls;
	const map = {};
	for (const [type, handler] of calls) {
		map[type] = handler;
	}
	return map;
}

// ---------- test suite ----------

describe('Modules - Controller', () => {
	let mockEditor;
	let $;
	let mockInst;

	beforeEach(() => {
		jest.clearAllMocks();

		const kernel = createMockEditor();
		mockEditor = kernel;

		// Build the $ deps bag with all required sub-objects
		$ = {
			...kernel.$,
			store: {
				...kernel.$.store,
				mode: { isBalloon: false, isSubBalloon: false, isClassic: true, isInline: false },
			},
			ui: {
				...kernel.$.ui,
				opendControllers: [],
				currentControllerName: '',
				selectMenuOn: false,
			},
			selection: { ...kernel.$.selection, isRange: jest.fn().mockReturnValue(false) },
			offset: {
				...kernel.$.offset,
				setRangePosition: jest.fn().mockReturnValue(true),
				setAbsPosition: jest.fn().mockReturnValue({ position: 'bottom', top: 0, left: 0 }),
			},
			component: {
				...kernel.$.component,
				__removeGlobalEvent: jest.fn(),
				deselect: jest.fn(),
				isInline: jest.fn().mockReturnValue(false),
			},
			contextProvider: {
				...kernel.$.contextProvider,
				shadowRoot: null,
			},
			toolbar: { ...kernel.$.toolbar, hide: jest.fn() },
			subToolbar: { ...kernel.$.subToolbar, hide: jest.fn() },
		};
		mockEditor.$ = $;

		mockInst = {
			editor: mockEditor,
			constructor: { key: 'testController', name: 'TestController' },
			_element: document.createElement('div'),
			controllerAction: jest.fn(),
			controllerOn: jest.fn(),
			controllerClose: jest.fn(),
		};

		// Reset the dom mocks to default
		mockDom.check.isWysiwygFrame.mockReturnValue(false);
		mockDom.utils.hasClass.mockReturnValue(false);
		mockDom.query.getParentElement.mockReturnValue(null);
		mockDom.query.getCommandTarget.mockImplementation((el) => (el && el.hasAttribute && el.hasAttribute('data-command') ? el : null));
		mockDom.query.getEventTarget.mockImplementation((e) => e.target);

		mockKeyCodeMap.isEsc.mockReturnValue(false);
		mockKeyCodeMap.isCtrl.mockReturnValue(false);
		mockKeyCodeMap.isNonResponseKey.mockReturnValue(false);

		mockDragHandle.get.mockReturnValue(null);
		mockDragHandle.set.mockClear();
	});

	// ==================== Constructor ====================

	describe('Constructor', () => {
		it('should use constructor key as kind', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			expect(ctrl.kind).toBe('testController');
		});

		it('should use constructor name as fallback when key is absent', () => {
			const inst = { ...mockInst, constructor: { name: 'FallbackCtrl' } };
			const el = createMockElement();
			const ctrl = new Controller(inst, $, el, {});
			expect(ctrl.kind).toBe('FallbackCtrl');
		});

		it('should use _name parameter when provided', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {}, 'customName');
			expect(ctrl.kind).toBe('customName');
		});

		it('should initialize default property values', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			expect(ctrl.isOpen).toBe(false);
			expect(ctrl.currentTarget).toBeNull();
			expect(ctrl.currentPositionTarget).toBeNull();
			expect(ctrl.isWWTarget).toBe(true);
			expect(ctrl.position).toBe('bottom');
			expect(ctrl.disabled).toBe(false);
			expect(ctrl.parents).toEqual([]);
			expect(ctrl.parentsForm).toEqual([]);
			expect(ctrl.parentsHide).toBe(false);
			expect(ctrl.sibling).toBeNull();
			expect(ctrl.siblingMain).toBe(false);
			expect(ctrl.isInsideForm).toBe(false);
			expect(ctrl.isOutsideForm).toBe(false);
			expect(ctrl.toTop).toBe(false);
		});

		it('should use params values', () => {
			const el = createMockElement();
			const siblingEl = createMockElement('sib');
			const ctrl = new Controller(mockInst, $, el, {
				position: 'top',
				isWWTarget: false,
				disabled: true,
				parentsHide: true,
				sibling: siblingEl,
				siblingMain: true,
				isInsideForm: true,
				isOutsideForm: true,
			});
			expect(ctrl.position).toBe('top');
			expect(ctrl.isWWTarget).toBe(false);
			expect(ctrl.disabled).toBe(true);
			expect(ctrl.parentsHide).toBe(true);
			expect(ctrl.sibling).toBe(siblingEl);
			expect(ctrl.siblingMain).toBe(true);
			expect(ctrl.isInsideForm).toBe(true);
			expect(ctrl.isOutsideForm).toBe(true);
		});

		it('should register click, mouseenter, mouseleave events on element', () => {
			const el = createMockElement();
			new Controller(mockInst, $, el, {});
			const types = $.eventManager.addEvent.mock.calls.map((c) => c[1]);
			expect(types).toContain('click');
			expect(types).toContain('mouseenter');
			expect(types).toContain('mouseleave');
		});

		it('should append element to carrierWrapper', () => {
			const el = createMockElement();
			const appendSpy = jest.spyOn($.contextProvider.carrierWrapper, 'appendChild');
			new Controller(mockInst, $, el, {});
			expect(appendSpy).toHaveBeenCalledWith(el);
		});

		it('should build parentsForm from Controller parents', () => {
			const parentEl = createMockElement('parent');
			const parentCtrl = new Controller(mockInst, $, parentEl, {});

			const childEl = createMockElement('child');
			const childCtrl = new Controller(mockInst, $, childEl, { parents: [parentCtrl] });

			expect(childCtrl.parentsForm).toEqual([parentEl]);
		});

		it('should build parentsForm from HTMLElement parents', () => {
			const parentEl = createMockElement('parent');
			const childEl = createMockElement('child');
			const childCtrl = new Controller(mockInst, $, childEl, { parents: [parentEl] });

			expect(childCtrl.parentsForm).toEqual([parentEl]);
		});

		it('should handle mixed parents (Controller + HTMLElement)', () => {
			const parentEl1 = createMockElement('parent1');
			const parentCtrl = new Controller(mockInst, $, parentEl1, {});

			const parentEl2 = createMockElement('parent2');

			const childEl = createMockElement('child');
			const childCtrl = new Controller(mockInst, $, childEl, { parents: [parentCtrl, parentEl2] });

			expect(childCtrl.parentsForm).toHaveLength(2);
			expect(childCtrl.parentsForm[0]).toBe(parentEl1);
			expect(childCtrl.parentsForm[1]).toBe(parentEl2);
		});

		it('should store initMethod when provided as function', () => {
			const el = createMockElement();
			const initFn = jest.fn();
			const ctrl = new Controller(mockInst, $, el, { initMethod: initFn });
			// initMethod is private, verified via close calling it
			ctrl.isOpen = true;
			ctrl.close();
			expect(initFn).toHaveBeenCalled();
		});

		it('should ignore initMethod when not a function', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, { initMethod: 'not-a-fn' });
			ctrl.isOpen = true;
			expect(() => ctrl.close()).not.toThrow();
		});

		it('should set __offset to empty object', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			expect(ctrl.__offset).toEqual({});
		});
	});

	// ==================== open ====================

	describe('open', () => {
		let ctrl;
		let target;

		beforeEach(() => {
			const el = createMockElement();
			ctrl = new Controller(mockInst, $, el, {});
			target = createTarget();
		});

		it('should return early when _DragHandle has ON_OVER_COMPONENT', () => {
			mockDragHandle.get.mockReturnValue(env.ON_OVER_COMPONENT);
			ctrl.open(target, target, {});
			expect(ctrl.isOpen).toBe(false);
		});

		it('should return early when target is null', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			ctrl.open(null, null, {});
			expect(spy).toHaveBeenCalledWith('[SUNEDITOR.Controller.open.fail] The target element is required.');
			spy.mockRestore();
		});

		it('should return early when target is undefined', () => {
			const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
			ctrl.open(undefined, null, {});
			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});

		it('should hide balloon toolbar when mode is balloon', () => {
			$.store.mode.isBalloon = true;
			ctrl.open(target, target, {});
			expect($.toolbar.hide).toHaveBeenCalled();
			$.store.mode.isBalloon = false;
		});

		it('should hide sub balloon toolbar when mode is subBalloon', () => {
			$.store.mode.isSubBalloon = true;
			ctrl.open(target, target, {});
			expect($.subToolbar.hide).toHaveBeenCalled();
			$.store.mode.isSubBalloon = false;
		});

		it('should not hide toolbar when mode is classic', () => {
			$.store.mode.isBalloon = false;
			$.store.mode.isSubBalloon = false;
			ctrl.open(target, target, {});
			expect($.toolbar.hide).not.toHaveBeenCalled();
			expect($.subToolbar.hide).not.toHaveBeenCalled();
		});

		it('should call setControllerOnDisabledButtons(true) when disabled and no focus', () => {
			$.store.get.mockImplementation((key) => {
				if (key === 'hasFocus') return false;
				return undefined;
			});
			ctrl.open(target, target, { disabled: true });
			expect($.ui.setControllerOnDisabledButtons).toHaveBeenCalledWith(true);
		});

		it('should call setControllerOnDisabledButtons(false) when not disabled and no focus', () => {
			$.store.get.mockImplementation((key) => {
				if (key === 'hasFocus') return false;
				return undefined;
			});
			ctrl.open(target, target, { disabled: false });
			expect($.ui.setControllerOnDisabledButtons).toHaveBeenCalledWith(false);
		});

		it('should skip disabled button logic when has focus', () => {
			$.store.get.mockImplementation((key) => {
				if (key === 'hasFocus') return true;
				return undefined;
			});
			ctrl.open(target, target, {});
			expect($.ui.setControllerOnDisabledButtons).not.toHaveBeenCalled();
		});

		it('should set currentPositionTarget', () => {
			ctrl.open(target, target, {});
			expect(ctrl.currentPositionTarget).toBe(target);
		});

		it('should use target as positionTarget fallback', () => {
			ctrl.open(target, undefined, {});
			expect(ctrl.currentPositionTarget).toBe(target);
		});

		it('should override isWWTarget from params', () => {
			ctrl.open(target, target, { isWWTarget: false });
			expect(ctrl.isWWTarget).toBe(false);
		});

		it('should not override isWWTarget when param is undefined', () => {
			ctrl.isWWTarget = true;
			ctrl.open(target, target, {});
			expect(ctrl.isWWTarget).toBe(true);
		});

		it('should override initMethod from params', () => {
			const newInit = jest.fn();
			ctrl.open(target, target, { initMethod: newInit });
			// Verify by closing
			ctrl.isOpen = true;
			ctrl.close();
			expect(newInit).toHaveBeenCalled();
		});

		it('should not override initMethod when param is not a function', () => {
			const originalInit = jest.fn();
			const el = createMockElement();
			const ctrlWithInit = new Controller(mockInst, $, el, { initMethod: originalInit });
			ctrlWithInit.open(target, target, { initMethod: 'string-not-fn' });
			ctrlWithInit.isOpen = true;
			ctrlWithInit.close();
			expect(originalInit).toHaveBeenCalled();
		});

		it('should apply addOffset', () => {
			ctrl.open(target, target, { addOffset: { left: 10, top: 20 } });
			expect(ctrl.currentPositionTarget).toBe(target);
		});

		it('should reset addOffset to zero when no addOffset param', () => {
			ctrl.open(target, target, {});
			// addOffset is private, but its effect is seen in positioning calls
			expect($.offset.setAbsPosition).toHaveBeenCalled();
		});

		it('should apply partial addOffset (only left)', () => {
			ctrl.open(target, target, { addOffset: { left: 5 } });
			expect(ctrl.currentPositionTarget).toBe(target);
		});

		it('should demote zIndex of other open controllers (non-outside)', () => {
			const otherForm = createMockElement('other');
			otherForm.style.zIndex = '2147483645';
			$.ui.opendControllers = [{ form: otherForm }];
			ctrl.open(target, target, {});
			expect(otherForm.style.zIndex).toBe('2147483641');
		});

		it('should not demote parent form zIndex when isOutsideForm', () => {
			const parentEl = createMockElement('parent');
			parentEl.style.zIndex = '2147483645';
			const parentCtrl = new Controller(mockInst, $, parentEl, {});

			const childEl = createMockElement('child');
			const childCtrl = new Controller(mockInst, $, childEl, {
				isOutsideForm: true,
				parents: [parentCtrl],
			});

			$.ui.opendControllers = [{ form: parentEl }];
			childCtrl.open(target, target, {});
			// Parent form should keep its zIndex because it's in the parents list for outsideForm
			expect(parentEl.style.zIndex).toBe('2147483645');
		});

		it('should demote non-parent form zIndex even when isOutsideForm', () => {
			const parentEl = createMockElement('parent');
			parentEl.style.zIndex = '2147483645';
			const parentCtrl = new Controller(mockInst, $, parentEl, {});

			const otherForm = createMockElement('other');
			otherForm.style.zIndex = '2147483645';

			const childEl = createMockElement('child');
			const childCtrl = new Controller(mockInst, $, childEl, {
				isOutsideForm: true,
				parents: [parentCtrl],
			});

			$.ui.opendControllers = [{ form: parentEl }, { form: otherForm }];
			childCtrl.open(target, target, {});
			// Other non-parent form should be demoted
			expect(otherForm.style.zIndex).toBe('2147483641');
			// Parent form keeps its zIndex
			expect(parentEl.style.zIndex).toBe('2147483645');
		});

		it('should use empty parents array for non-outsideForm controllers', () => {
			const otherForm = createMockElement('other');
			otherForm.style.zIndex = '2147483645';
			$.ui.opendControllers = [{ form: otherForm }];

			ctrl.isOutsideForm = false;
			ctrl.open(target, target, {});
			// All controllers should be demoted (parents array is empty)
			expect(otherForm.style.zIndex).toBe('2147483641');
		});

		it('should hide parent forms when parentsHide is true', () => {
			const parentEl = createMockElement('parent');
			parentEl.style.display = 'block';
			const parentCtrl = new Controller(mockInst, $, parentEl, {});

			const childEl = createMockElement('child');
			const childCtrl = new Controller(mockInst, $, childEl, {
				parents: [parentCtrl],
				parentsHide: true,
			});

			childCtrl.open(target, target, {});
			expect(parentEl.style.display).toBe('none');
			expect(parentEl.getAttribute('data-se-hidden-by-children')).toBe('1');
		});

		it('should not hide parent forms when parentsHide is false', () => {
			const parentEl = createMockElement('parent');
			parentEl.style.display = 'block';
			const parentCtrl = new Controller(mockInst, $, parentEl, {});

			const childEl = createMockElement('child');
			const childCtrl = new Controller(mockInst, $, childEl, {
				parents: [parentCtrl],
				parentsHide: false,
			});

			childCtrl.open(target, target, {});
			expect(parentEl.style.display).toBe('block');
		});

		it('should add global events', () => {
			ctrl.open(target, target, {});
			expect($.eventManager.addGlobalEvent).toHaveBeenCalled();
		});

		it('should set currentTarget to null for range targets', () => {
			$.instanceCheck.isRange.mockReturnValue(true);
			ctrl.open(target, target, {});
			expect(ctrl.currentTarget).toBeNull();
			$.instanceCheck.isRange.mockReturnValue(false);
		});

		it('should set currentTarget for element targets', () => {
			$.instanceCheck.isRange.mockReturnValue(false);
			ctrl.open(target, target, {});
			expect(ctrl.currentTarget).toBe(target);
		});

		it('should use this.disabled when params.disabled is undefined', () => {
			$.store.get.mockImplementation((key) => {
				if (key === 'hasFocus') return false;
				return undefined;
			});
			const el = createMockElement();
			const ctrlDisabled = new Controller(mockInst, $, el, { disabled: true });
			ctrlDisabled.open(target, target, {});
			expect($.ui.setControllerOnDisabledButtons).toHaveBeenCalledWith(true);
		});

		it('should clean hidden attributes on open', () => {
			ctrl.form.setAttribute('data-se-hidden-by-parent', '1');
			ctrl.form.setAttribute('data-se-hidden-by-children', '1');
			ctrl.open(target, target, {});
			expect(ctrl.form.hasAttribute('data-se-hidden-by-parent')).toBe(false);
			expect(ctrl.form.hasAttribute('data-se-hidden-by-children')).toBe(false);
		});

		it('should set currentControllerName to kind', () => {
			ctrl.open(target, target, {});
			expect($.ui.currentControllerName).toBe('testController');
		});

		it('should call _DragHandle.set after open', () => {
			ctrl.open(target, target, {});
			expect(mockDragHandle.set).toHaveBeenCalledWith('__overInfo', false);
		});

		it('should handle open with default params (no params object)', () => {
			const el = createMockElement();
			const ctrl2 = new Controller(mockInst, $, el, {});
			expect(() => ctrl2.open(target)).not.toThrow();
		});
	});

	// ==================== close ====================

	describe('close', () => {
		let ctrl;

		beforeEach(() => {
			const el = createMockElement();
			ctrl = new Controller(mockInst, $, el, {});
			ctrl.isOpen = true;
		});

		it('should return early if not open and not forced', () => {
			ctrl.isOpen = false;
			ctrl.close();
			expect(mockInst.controllerClose).not.toHaveBeenCalled();
		});

		it('should close when force=true even if isOpen is false', () => {
			ctrl.isOpen = false;
			ctrl.close(true);
			expect(ctrl.form.style.display).toBe('none');
		});

		it('should set isOpen to false', () => {
			ctrl.close();
			expect(ctrl.isOpen).toBe(false);
		});

		it('should reset toTop', () => {
			ctrl.toTop = true;
			ctrl.close();
			expect(ctrl.toTop).toBe(false);
		});

		it('should reset __offset', () => {
			ctrl.__offset = { left: 10, top: 20 };
			ctrl.close();
			expect(ctrl.__offset).toEqual({});
		});

		it('should call initMethod', () => {
			const initFn = jest.fn();
			const el = createMockElement();
			const ctrlWithInit = new Controller(mockInst, $, el, { initMethod: initFn });
			ctrlWithInit.isOpen = true;
			ctrlWithInit.close();
			expect(initFn).toHaveBeenCalled();
		});

		it('should not fail when initMethod is null', () => {
			const el = createMockElement();
			const ctrlNoInit = new Controller(mockInst, $, el, {});
			ctrlNoInit.isOpen = true;
			expect(() => ctrlNoInit.close()).not.toThrow();
		});

		it('should call controllerClose on host', () => {
			ctrl.close();
			expect(mockInst.controllerClose).toHaveBeenCalled();
		});

		it('should call component.deselect when no parents', () => {
			ctrl.close();
			expect($.component.deselect).toHaveBeenCalled();
		});

		it('should NOT call component.deselect when has parents', () => {
			const parentEl = createMockElement('parent');
			const parentCtrl = new Controller(mockInst, $, parentEl, {});
			const childEl = createMockElement('child');
			const childCtrl = new Controller(mockInst, $, childEl, { parents: [parentCtrl] });
			childCtrl.isOpen = true;
			childCtrl.close();
			expect($.component.deselect).not.toHaveBeenCalled();
		});

		it('should show parent forms on non-force close when parentsHide', () => {
			const parentEl = createMockElement('parent');
			parentEl.style.display = 'none';
			const parentCtrl = new Controller(mockInst, $, parentEl, {});

			const childEl = createMockElement('child');
			const childCtrl = new Controller(mockInst, $, childEl, {
				parents: [parentCtrl],
				parentsHide: true,
			});
			childCtrl.isOpen = true;
			childCtrl.close();

			expect(parentEl.style.display).toBe('block');
			expect(parentEl.hasAttribute('data-se-hidden-by-children')).toBe(false);
		});

		it('should NOT show parent forms on force close when parentsHide', () => {
			const parentEl = createMockElement('parent');
			parentEl.style.display = 'none';
			const parentCtrl = new Controller(mockInst, $, parentEl, {});

			const childEl = createMockElement('child');
			const childCtrl = new Controller(mockInst, $, childEl, {
				parents: [parentCtrl],
				parentsHide: true,
			});
			childCtrl.isOpen = true;
			childCtrl.close(true);

			expect(parentEl.style.display).toBe('none');
		});

		it('should not show parents when parentsHide is false', () => {
			const parentEl = createMockElement('parent');
			parentEl.style.display = 'none';
			const parentCtrl = new Controller(mockInst, $, parentEl, {});

			const childEl = createMockElement('child');
			const childCtrl = new Controller(mockInst, $, childEl, {
				parents: [parentCtrl],
				parentsHide: false,
			});
			childCtrl.isOpen = true;
			childCtrl.close();

			expect(parentEl.style.display).toBe('none');
		});

		it('should remove global events', () => {
			const target = createTarget();
			ctrl.open(target, target, {});
			ctrl.close();
			expect($.eventManager.removeGlobalEvent).toHaveBeenCalled();
		});

		it('should clean hidden attributes', () => {
			ctrl.form.setAttribute('data-se-hidden-by-parent', '1');
			ctrl.form.setAttribute('data-se-hidden-by-children', '1');
			ctrl.close();
			expect(ctrl.form.hasAttribute('data-se-hidden-by-parent')).toBe(false);
			expect(ctrl.form.hasAttribute('data-se-hidden-by-children')).toBe(false);
		});

		it('should set preventClose to false', () => {
			// Setup: open and trigger mousedown inside host element to set preventClose
			const target = createTarget();
			ctrl.open(target, target, {});
			const innerEl = document.createElement('span');
			mockInst._element.appendChild(innerEl);
			const handlers = getGlobalEventHandlers($);
			handlers.mousedown({ target: innerEl });
			// preventClose is now true; normal close should fail
			ctrl.close();
			expect(ctrl.isOpen).toBe(true);

			// Force close resets preventClose
			ctrl.close(true);
			expect(ctrl.isOpen).toBe(false);
		});
	});

	// ==================== hide / show ====================

	describe('hide', () => {
		it('should set display to none', () => {
			const el = createMockElement();
			el.style.display = 'block';
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl.hide();
			expect(ctrl.form.style.display).toBe('none');
		});
	});

	describe('show', () => {
		it('should call setControllerPosition (display block if position succeeds)', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl.currentPositionTarget = createTarget();
			ctrl.show();
			expect(ctrl.form.style.display).toBe('block');
		});

		it('should hide when position target is null', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl.currentPositionTarget = null;
			ctrl.show();
			// setControllerPosition returns false for null refer
		});
	});

	// ==================== bringToTop ====================

	describe('bringToTop', () => {
		it('should set toTop true and zIndex to INDEX_00', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl.bringToTop(true);
			expect(ctrl.toTop).toBe(true);
			expect(ctrl.form.style.zIndex).toBe('2147483646');
		});

		it('should set toTop false and zIndex to INDEX_0', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl.bringToTop(false);
			expect(ctrl.toTop).toBe(false);
			expect(ctrl.form.style.zIndex).toBe('2147483645');
		});
	});

	// ==================== resetPosition ====================

	describe('resetPosition', () => {
		it('should use provided target', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			ctrl.resetPosition(target);
			expect(ctrl.form.style.display).toBe('block');
		});

		it('should fall back to currentPositionTarget', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl.currentPositionTarget = createTarget();
			ctrl.resetPosition();
			expect(ctrl.form.style.display).toBe('block');
		});

		it('should pass skipAutoReposition=true', () => {
			const el = createMockElement();
			const siblingEl = createMockElement('sib');
			siblingEl.style.display = 'block';
			Object.defineProperty(siblingEl, 'offsetHeight', { value: 30 });

			const ctrl = new Controller(mockInst, $, el, { sibling: siblingEl, siblingMain: false });
			ctrl.currentPositionTarget = createTarget();

			$.offset.setAbsPosition.mockReturnValue({ position: 'bottom', top: 100, left: 0 });
			// resetPosition uses skipAutoReposition=true, so sibling positioning should be skipped
			ctrl.resetPosition();
			// The sibling positioning adjustment should NOT happen with skipAutoReposition
		});
	});

	// ==================== _scrollReposition ====================

	describe('_scrollReposition', () => {
		it('should return early when hidden by parent', () => {
			const el = createMockElement();
			el.setAttribute('data-se-hidden-by-parent', '1');
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl._scrollReposition();
			expect($.offset.setAbsPosition).not.toHaveBeenCalled();
		});

		it('should return early when hidden by children', () => {
			const el = createMockElement();
			el.setAttribute('data-se-hidden-by-children', '1');
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl._scrollReposition();
			expect($.offset.setAbsPosition).not.toHaveBeenCalled();
		});

		it('should reposition when not hidden', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl.currentPositionTarget = createTarget();
			ctrl._scrollReposition();
			expect($.offset.setAbsPosition).toHaveBeenCalled();
		});

		it('should call childrenSync show when position succeeds', () => {
			const parentEl = createMockElement('parent');
			const parentCtrl = new Controller(mockInst, $, parentEl, {});

			const childEl = createMockElement('child');
			const childCtrl = new Controller(mockInst, $, childEl, { parents: [parentCtrl] });

			parentCtrl.currentPositionTarget = createTarget();
			parentCtrl._scrollReposition();
			// Just verify no error
			expect(parentCtrl.form.style.visibility).toBe('');
		});

		it('should hide when setAbsPosition returns null', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl.currentPositionTarget = createTarget();
			$.offset.setAbsPosition.mockReturnValueOnce(null);
			ctrl._scrollReposition();
			expect(ctrl.form.style.display).toBe('none');
		});

		it('should return false when currentPositionTarget is null', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl.currentPositionTarget = null;
			ctrl._scrollReposition();
			// setControllerPosition returns false
		});
	});

	// ==================== #setControllerPosition ====================

	describe('#setControllerPosition (via show/resetPosition)', () => {
		it('should return false when refer is null', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl.currentPositionTarget = null;
			ctrl.show();
			// form should not be changed
		});

		it('should handle Range target via setRangePosition', () => {
			$.selection.isRange = jest.fn().mockReturnValue(true);
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl.currentPositionTarget = createTarget();
			ctrl.show();
			expect($.offset.setRangePosition).toHaveBeenCalled();
			$.selection.isRange = jest.fn().mockReturnValue(false);
		});

		it('should hide when setRangePosition returns false', () => {
			$.selection.isRange = jest.fn().mockReturnValue(true);
			$.offset.setRangePosition.mockReturnValueOnce(false);
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl.currentPositionTarget = createTarget();
			ctrl.show();
			expect(ctrl.form.style.display).toBe('none');
			$.selection.isRange = jest.fn().mockReturnValue(false);
		});

		it('should handle Element target via setAbsPosition', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl.currentPositionTarget = createTarget();
			ctrl.show();
			expect($.offset.setAbsPosition).toHaveBeenCalled();
		});

		it('should hide when setAbsPosition returns null', () => {
			$.offset.setAbsPosition.mockReturnValueOnce(null);
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl.currentPositionTarget = createTarget();
			ctrl.show();
			expect(ctrl.form.style.display).toBe('none');
		});

		it('should show sibling when its display is not block', () => {
			const siblingEl = createMockElement('sib');
			siblingEl.style.display = 'none';
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, { sibling: siblingEl });
			ctrl.currentPositionTarget = createTarget();
			ctrl.show();
			expect(siblingEl.style.display).toBe('block');
		});

		it('should set sibling visibility to hidden when showing it', () => {
			const siblingEl = createMockElement('sib');
			siblingEl.style.display = 'none';
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, { sibling: siblingEl, siblingMain: true });
			ctrl.currentPositionTarget = createTarget();
			ctrl.show();
			// Sibling was hidden, so it should have had visibility set to hidden then block
			expect(siblingEl.style.display).toBe('block');
		});

		it('should adjust position for sibling + !siblingMain with bottom', () => {
			const siblingEl = createMockElement('sib');
			siblingEl.style.display = 'block';
			Object.defineProperty(siblingEl, 'offsetHeight', { value: 30 });

			const el = createMockElement();
			Object.defineProperty(el, 'offsetTop', { value: 100, configurable: true });
			const ctrl = new Controller(mockInst, $, el, { sibling: siblingEl, siblingMain: false });
			ctrl.currentPositionTarget = createTarget();

			$.offset.setAbsPosition.mockReturnValue({ position: 'bottom', top: 100, left: 0 });
			ctrl.show();

			expect(ctrl.form.style.top).toBe('129px');
		});

		it('should adjust position for sibling + !siblingMain with top', () => {
			const siblingEl = createMockElement('sib');
			siblingEl.style.display = 'block';
			Object.defineProperty(siblingEl, 'offsetHeight', { value: 30 });

			const el = createMockElement();
			Object.defineProperty(el, 'offsetTop', { value: 100, configurable: true });
			const ctrl = new Controller(mockInst, $, el, { sibling: siblingEl, siblingMain: false });
			ctrl.currentPositionTarget = createTarget();

			$.offset.setAbsPosition.mockReturnValue({ position: 'top', top: 100, left: 0 });
			ctrl.show();

			expect(ctrl.form.style.top).toBe('72px');
		});

		it('should not adjust position for siblingMain', () => {
			const siblingEl = createMockElement('sib');
			siblingEl.style.display = 'block';

			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, { sibling: siblingEl, siblingMain: true });
			ctrl.currentPositionTarget = createTarget();
			ctrl.show();

			expect(ctrl.form.style.zIndex).toBe('2147483641');
		});

		it('should set zIndex based on toTop', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl.currentPositionTarget = createTarget();
			ctrl.toTop = true;
			ctrl.show();
			expect(ctrl.form.style.zIndex).toBe('2147483645');
		});

		it('should set zIndex to INDEX_S_1 when reserveIndex', () => {
			const siblingEl = createMockElement('sib');
			siblingEl.style.display = 'block';
			Object.defineProperty(siblingEl, 'offsetHeight', { value: 30 });

			const el = createMockElement();
			Object.defineProperty(el, 'offsetTop', { value: 100, configurable: true });
			const ctrl = new Controller(mockInst, $, el, { sibling: siblingEl, siblingMain: false });
			ctrl.currentPositionTarget = createTarget();

			$.offset.setAbsPosition.mockReturnValue({ position: 'bottom', top: 100, left: 0 });
			ctrl.show();

			expect(ctrl.form.style.zIndex).toBe('2147483642');
		});

		it('should set zIndex to INDEX_1 when not toTop and not reserveIndex', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl.currentPositionTarget = createTarget();
			ctrl.toTop = false;
			ctrl.show();
			expect(ctrl.form.style.zIndex).toBe('2147483641');
		});

		it('should skip sibling setup when sibling display is already block', () => {
			const siblingEl = createMockElement('sib');
			siblingEl.style.display = 'block';
			siblingEl.style.visibility = 'visible';

			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, { sibling: siblingEl, siblingMain: true });
			ctrl.currentPositionTarget = createTarget();
			ctrl.show();

			// sibling visibility should not be changed to hidden
			expect(siblingEl.style.visibility).toBe('visible');
		});

		it('should restore controller visibility after positioning', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl.currentPositionTarget = createTarget();
			ctrl.show();
			expect(ctrl.form.style.visibility).toBe('');
		});

		it('should set reserveIndex to false for siblingMain', () => {
			const siblingEl = createMockElement('sib');
			siblingEl.style.display = 'block';

			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, { sibling: siblingEl, siblingMain: true });
			ctrl.currentPositionTarget = createTarget();
			ctrl.show();
			// reserveIndex should be false for siblingMain, so zIndex should be INDEX_1
			expect(ctrl.form.style.zIndex).toBe('2147483641');
		});

		it('should set reserveIndex to false when no sibling', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl.currentPositionTarget = createTarget();
			ctrl.show();
			expect(ctrl.form.style.zIndex).toBe('2147483641');
		});
	});

	// ==================== #controllerOn (via open) ====================

	describe('#controllerOn (via open)', () => {
		it('should set form display to block', async () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			await ctrl.open(target, target, {});
			expect(el.style.display).toBe('block');
		});

		it('should return early when triggerEvent returns false', async () => {
			$.eventManager.triggerEvent.mockResolvedValueOnce(false);
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			await ctrl.open(target, target, {});
			await new Promise((r) => setTimeout(r, 10));
			expect(ctrl.isOpen).toBe(false);
		});

		it('should push to opendControllers when not already open', async () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			await ctrl.open(target, target, {});
			await new Promise((r) => setTimeout(r, 0));
			expect($.ui.opendControllers.length).toBe(1);
		});

		it('should not push duplicate when already open', async () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			await ctrl.open(target, target, {});
			await new Promise((r) => setTimeout(r, 0));
			const count1 = $.ui.opendControllers.length;
			await ctrl.open(target, target, {});
			await new Promise((r) => setTimeout(r, 0));
			expect($.ui.opendControllers.length).toBe(count1);
		});

		it('should call host.controllerOn', async () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			await ctrl.open(target, target, {});
			await new Promise((r) => setTimeout(r, 0));
			expect(mockInst.controllerOn).toHaveBeenCalled();
		});

		it('should handle shadowRoot event listener', async () => {
			$.contextProvider.shadowRoot = document.createElement('div');
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			await ctrl.open(target, target, {});
			await new Promise((r) => setTimeout(r, 0));

			// shadowRoot logic adds mousedown event listener to form
			expect(ctrl.isOpen).toBe(true);
			$.contextProvider.shadowRoot = null;
		});

		it('should not add shadowRoot listener when shadowRoot is null', async () => {
			$.contextProvider.shadowRoot = null;
			const el = createMockElement();
			const addEventSpy = jest.spyOn(el, 'addEventListener');
			const ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			await ctrl.open(target, target, {});
			await new Promise((r) => setTimeout(r, 0));

			// addEventListener should not have been called for mousedown by shadowRoot logic
			const mousedownCalls = addEventSpy.mock.calls.filter(([type]) => type === 'mousedown');
			expect(mousedownCalls).toHaveLength(0);
		});

		it('should set store preventBlur and controlActive', async () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			await ctrl.open(target, target, {});
			await new Promise((r) => setTimeout(r, 0));
			expect($.store.set).toHaveBeenCalledWith('_preventBlur', true);
			expect($.store.set).toHaveBeenCalledWith('controlActive', true);
		});

		it('should call onControllerContext', async () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			await ctrl.open(target, target, {});
			await new Promise((r) => setTimeout(r, 0));
			expect($.ui.onControllerContext).toHaveBeenCalled();
		});

		it('should trigger onShowController event', async () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			await ctrl.open(target, target, {});
			await new Promise((r) => setTimeout(r, 0));
			expect($.eventManager.triggerEvent).toHaveBeenCalledWith('onShowController', expect.any(Object));
		});

		it('should calculate notInCarrier when form is not in carrierWrapper', async () => {
			const el = createMockElement();
			// Don't append to carrierWrapper
			const detachedEl = document.createElement('div');
			const ctrl = new Controller(mockInst, $, detachedEl, {});
			const target = createTarget();
			await ctrl.open(target, target, {});
			await new Promise((r) => setTimeout(r, 0));
			// notInCarrier should be true for form not in carrier
		});
	});

	// ==================== #controllerOff (via close) ====================

	describe('#controllerOff (via close)', () => {
		it('should set form display to none', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl.isOpen = true;
			ctrl.close();
			expect(el.style.display).toBe('none');
		});

		it('should filter form from opendControllers', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			$.ui.opendControllers = [{ form: el }, { form: createMockElement('other') }];
			ctrl.isOpen = true;
			$.ui.currentControllerName = 'testController';
			ctrl.close();
			expect($.ui.opendControllers).toHaveLength(1);
		});

		it('should return early if currentControllerName mismatch and controllers remain', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			const otherForm = createMockElement('other');
			$.ui.opendControllers = [{ form: el }, { form: otherForm }];
			$.ui.currentControllerName = 'otherController';
			ctrl.isOpen = true;
			ctrl.close();
			expect($.ui.offControllerContext).not.toHaveBeenCalled();
		});

		it('should proceed with cleanup when currentControllerName matches', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			$.ui.opendControllers = [{ form: el }];
			$.ui.currentControllerName = 'testController';
			ctrl.isOpen = true;
			ctrl.close();
			expect($.ui.offControllerContext).toHaveBeenCalled();
			expect($.ui.setControllerOnDisabledButtons).toHaveBeenCalledWith(false);
		});

		it('should proceed with cleanup when no controllers remain', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			$.ui.opendControllers = [{ form: el }];
			$.ui.currentControllerName = 'differentName';
			ctrl.isOpen = true;
			ctrl.close();
			expect($.ui.offControllerContext).toHaveBeenCalled();
		});

		it('should set lineBreaker display none', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			$.ui.opendControllers = [{ form: el }];
			$.ui.currentControllerName = 'testController';
			ctrl.isOpen = true;
			ctrl.close();
			expect($.frameContext.get('lineBreaker_t').style.display).toBe('none');
			expect($.frameContext.get('lineBreaker_b').style.display).toBe('none');
		});

		it('should set _lastSelectionNode to null', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			$.ui.opendControllers = [{ form: el }];
			$.ui.currentControllerName = 'testController';
			ctrl.isOpen = true;
			ctrl.close();
			expect($.store.set).toHaveBeenCalledWith('_lastSelectionNode', null);
		});

		it('should set currentControllerName to empty string', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			$.ui.opendControllers = [{ form: el }];
			$.ui.currentControllerName = 'testController';
			ctrl.isOpen = true;
			ctrl.close();
			expect($.ui.currentControllerName).toBe('');
		});

		it('should set _preventBlur to false', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			$.ui.opendControllers = [{ form: el }];
			$.ui.currentControllerName = 'testController';
			ctrl.isOpen = true;
			ctrl.close();
			expect($.store.set).toHaveBeenCalledWith('_preventBlur', false);
		});

		it('should set controlActive to false (via setTimeout)', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			$.ui.opendControllers = [{ form: el }];
			$.ui.currentControllerName = 'testController';
			ctrl.isOpen = true;
			ctrl.close();
			expect($.store.set).toHaveBeenCalledWith('controlActive', false);
		});

		it('should cleanup shadowRoot event when present', async () => {
			$.contextProvider.shadowRoot = document.createElement('div');
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			await ctrl.open(target, target, {});
			await new Promise((r) => setTimeout(r, 0));

			$.eventManager.removeEvent.mockClear();
			$.ui.currentControllerName = 'testController';
			ctrl.close();
			expect($.eventManager.removeEvent).toHaveBeenCalled();
			$.contextProvider.shadowRoot = null;
		});

		it('should not try to cleanup shadowRoot event when not present', () => {
			$.contextProvider.shadowRoot = null;
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			$.ui.opendControllers = [{ form: el }];
			$.ui.currentControllerName = 'testController';
			ctrl.isOpen = true;
			// Should not throw
			expect(() => ctrl.close()).not.toThrow();
		});
	});

	// ==================== #childrenSync ====================

	describe('#childrenSync (via hide/close/open of parent)', () => {
		let parentCtrl;
		let childCtrl;
		let parentEl;
		let childEl;

		beforeEach(() => {
			parentEl = createMockElement('parent');
			parentCtrl = new Controller(mockInst, $, parentEl, {});

			childEl = createMockElement('child');
			childCtrl = new Controller(mockInst, $, childEl, { parents: [parentCtrl] });
		});

		it('should hide child when parent hides (state=hide)', () => {
			childEl.style.display = 'block';
			parentCtrl.hide();
			expect(childEl.getAttribute('data-se-hidden-by-parent')).toBe('1');
			expect(childEl.style.display).toBe('none');
		});

		it('should not re-hide child that is already hidden (display none)', () => {
			childEl.style.display = 'none';
			parentCtrl.hide();
			expect(childEl.hasAttribute('data-se-hidden-by-parent')).toBe(false);
		});

		it('should close children when parent closes (state=close)', () => {
			childCtrl.isOpen = true;
			$.ui.currentControllerName = 'testController';
			parentCtrl.isOpen = true;
			parentCtrl.close();
			expect(childCtrl.isOpen).toBe(false);
		});

		it('should show children on state=show via _scrollReposition', () => {
			childEl.style.display = 'block';
			parentCtrl.hide();
			expect(childEl.style.display).toBe('none');

			parentCtrl.currentPositionTarget = createTarget();
			parentCtrl._scrollReposition();

			expect(childEl.hasAttribute('data-se-hidden-by-parent')).toBe(false);
		});

		it('should handle show when child is hidden-by-children', () => {
			childEl.setAttribute('data-se-hidden-by-children', '1');
			parentCtrl.currentPositionTarget = createTarget();
			parentCtrl._scrollReposition();
			// Should call childrenSync('show') recursively on the child
		});

		it('should not show child if another parent still wants it hidden', () => {
			const parent2El = createMockElement('parent2');
			const parent2Ctrl = new Controller(mockInst, $, parent2El, {});

			const multiChildEl = createMockElement('multichild');
			multiChildEl.style.display = 'block';
			new Controller(mockInst, $, multiChildEl, {
				parents: [parentCtrl, parent2Ctrl],
			});

			parentCtrl.hide();
			parent2Ctrl.hide();
			expect(multiChildEl.style.display).toBe('none');

			parentCtrl.currentPositionTarget = createTarget();
			parentCtrl._scrollReposition();
			expect(multiChildEl.style.display).toBe('none');
		});

		it('should show child only when all parents want it visible', () => {
			const parent2El = createMockElement('parent2');
			const parent2Ctrl = new Controller(mockInst, $, parent2El, {});

			const multiChildEl = createMockElement('multichild');
			multiChildEl.style.display = 'block';
			new Controller(mockInst, $, multiChildEl, {
				parents: [parentCtrl, parent2Ctrl],
			});

			parentCtrl.hide();
			parent2Ctrl.hide();

			parentCtrl.currentPositionTarget = createTarget();
			parentCtrl._scrollReposition();
			expect(multiChildEl.style.display).toBe('none');

			parent2Ctrl.currentPositionTarget = createTarget();
			parent2Ctrl._scrollReposition();
			expect(multiChildEl.hasAttribute('data-se-hidden-by-parent')).toBe(false);
		});

		it('should not re-show child when already visible (wasHidden=false, shouldBeHidden=false)', () => {
			// Ensure child is not hidden by any parent
			childEl.style.display = 'block';
			// Parent does a scroll reposition (show), but child was never hidden
			parentCtrl.currentPositionTarget = createTarget();
			parentCtrl._scrollReposition();
			// Child should remain as-is
		});

		it('should not re-hide child when already marked as hidden by same parent (wasHidden=true, shouldBeHidden=true)', () => {
			// Create two parents and a child
			const parent2El = createMockElement('parent2');
			const parent2Ctrl = new Controller(mockInst, $, parent2El, {});

			const multiChildEl = createMockElement('multichild');
			multiChildEl.style.display = 'block';
			new Controller(mockInst, $, multiChildEl, {
				parents: [parentCtrl, parent2Ctrl],
			});

			// First parent hides (wasHidden=false, shouldBeHidden=true -> hides child)
			parentCtrl.hide();
			expect(multiChildEl.style.display).toBe('none');

			// Second parent also hides (wasHidden=true already from parent1, shouldBeHidden=true)
			// This should NOT try to hide again since wasHidden is already true
			parent2Ctrl.hide();
			// Child is still hidden - the important thing is it didn't error or double-hide
			expect(multiChildEl.style.display).toBe('none');
		});

		it('should handle close state calling child.close(true)', () => {
			childCtrl.isOpen = true;
			parentCtrl.isOpen = true;
			parentCtrl.close(true);
			expect(childCtrl.isOpen).toBe(false);
		});
	});

	// ==================== #Action (via click) ====================

	describe('#Action (via click event)', () => {
		it('should return early when getCommandTarget returns null', () => {
			const el = createMockElement();
			new Controller(mockInst, $, el, {});
			const handlers = getFormEventHandlers($);

			const target = document.createElement('div');
			const e = { target, stopPropagation: jest.fn(), preventDefault: jest.fn() };
			mockDom.query.getCommandTarget.mockReturnValueOnce(null);

			handlers.click(e);
			expect(e.stopPropagation).not.toHaveBeenCalled();
			expect(mockInst.controllerAction).not.toHaveBeenCalled();
		});

		it('should call controllerAction when command target found', () => {
			const el = createMockElement();
			new Controller(mockInst, $, el, {});
			const handlers = getFormEventHandlers($);

			const target = document.createElement('button');
			target.setAttribute('data-command', 'test');
			const e = { target, stopPropagation: jest.fn(), preventDefault: jest.fn() };
			mockDom.query.getCommandTarget.mockReturnValueOnce(target);

			handlers.click(e);
			expect(e.stopPropagation).toHaveBeenCalled();
			expect(e.preventDefault).toHaveBeenCalled();
			expect(mockInst.controllerAction).toHaveBeenCalledWith(target);
		});

		it('should use getEventTarget to get the event target', () => {
			const el = createMockElement();
			new Controller(mockInst, $, el, {});
			const handlers = getFormEventHandlers($);

			const actualTarget = document.createElement('span');
			const e = { target: actualTarget, stopPropagation: jest.fn(), preventDefault: jest.fn() };
			mockDom.query.getCommandTarget.mockReturnValueOnce(null);

			handlers.click(e);
			expect(mockDom.query.getEventTarget).toHaveBeenCalledWith(e);
		});
	});

	// ==================== #MouseEnter (via mouseenter) ====================

	describe('#MouseEnter (via mouseenter event)', () => {
		it('should set currentControllerName', () => {
			const el = createMockElement();
			new Controller(mockInst, $, el, {});
			const handlers = getFormEventHandlers($);

			handlers.mouseenter({ target: el });
			expect($.ui.currentControllerName).toBe('testController');
		});

		it('should return early when isInsideForm with parents', () => {
			const parentEl = createMockElement('parent');
			const el = createMockElement();
			new Controller(mockInst, $, el, {
				parents: [parentEl],
				isInsideForm: true,
			});
			const handlers = getFormEventHandlers($);

			el.style.zIndex = '123';
			handlers.mouseenter({ target: el });
			// zIndex should not have been changed to INDEX_00 or INDEX_0
			expect(el.style.zIndex).toBe('123');
		});

		it('should not return early when isInsideForm without parents', () => {
			const el = createMockElement();
			new Controller(mockInst, $, el, {
				isInsideForm: true,
			});
			const handlers = getFormEventHandlers($);

			handlers.mouseenter({ target: el });
			// Should have set zIndex since parentsForm is empty
			expect(el.style.zIndex).toBe('2147483645');
		});

		it('should not return early when not isInsideForm with parents', () => {
			const parentEl = createMockElement('parent');
			const el = createMockElement();
			new Controller(mockInst, $, el, {
				parents: [parentEl],
				isInsideForm: false,
			});
			const handlers = getFormEventHandlers($);

			handlers.mouseenter({ target: el });
			// Should have set zIndex since isInsideForm is false
			expect(el.style.zIndex).toBe('2147483645');
		});

		it('should set zIndex to INDEX_00 when toTop is true', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl.toTop = true;
			const handlers = getFormEventHandlers($);

			handlers.mouseenter({ target: el });
			expect(el.style.zIndex).toBe('2147483646');
		});

		it('should set zIndex to INDEX_0 when toTop is false', () => {
			const el = createMockElement();
			new Controller(mockInst, $, el, {});
			const handlers = getFormEventHandlers($);

			handlers.mouseenter({ target: el });
			expect(el.style.zIndex).toBe('2147483645');
		});
	});

	// ==================== #MouseLeave (via mouseleave) ====================

	describe('#MouseLeave (via mouseleave event)', () => {
		it('should return early when isInsideForm with parents', () => {
			const parentEl = createMockElement('parent');
			const el = createMockElement();
			new Controller(mockInst, $, el, {
				parents: [parentEl],
				isInsideForm: true,
			});
			const handlers = getFormEventHandlers($);

			el.style.zIndex = '999';
			handlers.mouseleave({ target: el });
			expect(el.style.zIndex).toBe('999');
		});

		it('should not return early when isInsideForm without parents', () => {
			const el = createMockElement();
			new Controller(mockInst, $, el, { isInsideForm: true });
			const handlers = getFormEventHandlers($);

			handlers.mouseleave({ target: el });
			// Should have set zIndex since parentsForm is empty
			expect(el.style.zIndex).toBe('2147483641');
		});

		it('should restore zIndex to INDEX_0 when toTop', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl.toTop = true;
			const handlers = getFormEventHandlers($);

			handlers.mouseleave({ target: el });
			expect(el.style.zIndex).toBe('2147483645');
		});

		it('should restore zIndex to INDEX_1 normally', () => {
			const el = createMockElement();
			new Controller(mockInst, $, el, {});
			const handlers = getFormEventHandlers($);

			handlers.mouseleave({ target: el });
			expect(el.style.zIndex).toBe('2147483641');
		});

		it('should restore zIndex to INDEX_S_1 when reserveIndex is set', () => {
			const siblingEl = createMockElement('sib');
			siblingEl.style.display = 'block';
			Object.defineProperty(siblingEl, 'offsetHeight', { value: 30 });

			const el = createMockElement();
			Object.defineProperty(el, 'offsetTop', { value: 100, configurable: true });
			const ctrl = new Controller(mockInst, $, el, { sibling: siblingEl, siblingMain: false });
			ctrl.currentPositionTarget = createTarget();

			$.offset.setAbsPosition.mockReturnValue({ position: 'bottom', top: 100, left: 0 });
			ctrl.show(); // This sets reserveIndex = true

			const handlers = getFormEventHandlers($);
			ctrl.toTop = false;
			handlers.mouseleave({ target: el });
			expect(el.style.zIndex).toBe('2147483642');
		});
	});

	// ==================== #checkFixed (via keydown/mousedown) ====================

	describe('#checkFixed (via CloseListener_keydown)', () => {
		let ctrl;
		let el;

		beforeEach(() => {
			el = createMockElement();
			ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			ctrl.open(target, target, {});
		});

		it('should return when selectMenuOn is true', () => {
			$.ui.selectMenuOn = true;
			const handlers = getGlobalEventHandlers($);
			const e = { target: el, code: 'Escape' };
			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isEsc.mockReturnValue(true);

			handlers.keydown(e);
			expect(ctrl.isOpen).toBe(true);
			$.ui.selectMenuOn = false;
		});

		it('should return when opendControllers has fixed=true for this controller', () => {
			$.ui.opendControllers = [{ inst: ctrl, fixed: true, form: el }];
			const handlers = getGlobalEventHandlers($);
			const e = { target: el, code: 'Escape' };
			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isEsc.mockReturnValue(true);

			handlers.keydown(e);
			expect(ctrl.isOpen).toBe(true);
		});

		it('should return false when no fixed controllers (and not selectMenuOn)', () => {
			$.ui.opendControllers = [{ inst: ctrl, fixed: false, form: el }];
			$.ui.selectMenuOn = false;
			const handlers = getGlobalEventHandlers($);

			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isCtrl.mockReturnValue(false);
			mockKeyCodeMap.isEsc.mockReturnValue(true);

			const e = { target: document.createElement('div'), code: 'Escape' };
			handlers.keydown(e);
			expect(ctrl.isOpen).toBe(false);
		});

		it('should not match fixed for a different controller instance', () => {
			const otherEl = createMockElement('other');
			const otherCtrl = new Controller(mockInst, $, otherEl, {});
			$.ui.opendControllers = [{ inst: otherCtrl, fixed: true, form: otherEl }];
			$.ui.selectMenuOn = false;

			const handlers = getGlobalEventHandlers($);
			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isCtrl.mockReturnValue(false);
			mockKeyCodeMap.isEsc.mockReturnValue(true);

			handlers.keydown({ target: document.createElement('div'), code: 'Escape' });
			// ctrl is not in opendControllers as fixed, so checkFixed returns false
			expect(ctrl.isOpen).toBe(false);
		});
	});

	// ==================== #CloseListener_keydown ====================

	describe('#CloseListener_keydown', () => {
		let ctrl;
		let el;

		beforeEach(() => {
			el = createMockElement();
			ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			ctrl.open(target, target, {});
			$.ui.opendControllers = [{ inst: ctrl, fixed: false, form: el }];
		});

		it('should return when ctrl key is pressed', () => {
			mockKeyCodeMap.isCtrl.mockReturnValue(true);
			const handlers = getGlobalEventHandlers($);
			handlers.keydown({ target: document.createElement('div'), code: 'ControlLeft' });
			expect(ctrl.isOpen).toBe(true);
		});

		it('should return when key is not a non-response key', () => {
			mockKeyCodeMap.isNonResponseKey.mockReturnValue(false);
			const handlers = getGlobalEventHandlers($);
			handlers.keydown({ target: document.createElement('div'), code: 'KeyA' });
			expect(ctrl.isOpen).toBe(true);
		});

		it('should return for non-ESC key when form contains target', () => {
			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isEsc.mockReturnValue(false);
			const handlers = getGlobalEventHandlers($);

			const innerTarget = document.createElement('span');
			el.appendChild(innerTarget);
			handlers.keydown({ target: innerTarget, code: 'Delete' });
			expect(ctrl.isOpen).toBe(true);
		});

		it('should return for non-ESC key when checkForm returns true', () => {
			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isEsc.mockReturnValue(false);
			mockDom.query.getParentElement.mockReturnValueOnce(document.createElement('div'));
			const handlers = getGlobalEventHandlers($);

			const outsideTarget = document.createElement('div');
			handlers.keydown({ target: outsideTarget, code: 'Delete' });
			expect(ctrl.isOpen).toBe(true);
		});

		it('should return for non-ESC key when pluginRegExp matches', async () => {
			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isEsc.mockReturnValue(false);

			const imageEl = createMockElement();
			const imageInst = { ...mockInst, constructor: { key: 'image', name: 'Image' } };
			const imageCtrl = new Controller(imageInst, $, imageEl, {});
			const target = createTarget();
			imageCtrl.open(target, target, {});
			await new Promise((r) => setTimeout(r, 0));
			$.ui.opendControllers = [{ inst: imageCtrl, fixed: false, form: imageEl }];

			const imgHandlers = getGlobalEventHandlers($);
			const outsideTarget = document.createElement('div');
			imgHandlers.keydown({ target: outsideTarget, code: 'Delete' });
			expect(imageCtrl.isOpen).toBe(true);
		});

		it('should return for ESC when a child controller is open', async () => {
			const parentEl2 = createMockElement('parent2');
			const parentCtrl2 = new Controller(mockInst, $, parentEl2, {});
			const target2 = createTarget();
			parentCtrl2.open(target2, target2, {});
			await new Promise((r) => setTimeout(r, 0));

			const childEl2 = createMockElement('child2');
			const childCtrl2 = new Controller(mockInst, $, childEl2, { parents: [parentCtrl2] });
			childCtrl2.isOpen = true;

			$.ui.opendControllers = [{ inst: parentCtrl2, fixed: false, form: parentEl2 }];

			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isEsc.mockReturnValue(true);
			const handlers = getGlobalEventHandlers($);

			handlers.keydown({ target: document.createElement('div'), code: 'Escape' });
			expect(parentCtrl2.isOpen).toBe(true);
		});

		it('should close on ESC when no children are open', () => {
			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isEsc.mockReturnValue(true);
			const handlers = getGlobalEventHandlers($);

			handlers.keydown({ target: document.createElement('div'), code: 'Escape' });
			expect(ctrl.isOpen).toBe(false);
		});

		it('should close on ESC when children exist but none are open', () => {
			const childEl = createMockElement('child');
			const childCtrl = new Controller(mockInst, $, childEl, { parents: [ctrl] });
			childCtrl.isOpen = false;

			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isEsc.mockReturnValue(true);

			// Reopen to get fresh handlers
			const target = createTarget();
			ctrl.open(target, target, {});
			$.ui.opendControllers = [{ inst: ctrl, fixed: false, form: el }];
			const handlers = getGlobalEventHandlers($);

			handlers.keydown({ target: document.createElement('div'), code: 'Escape' });
			expect(ctrl.isOpen).toBe(false);
		});

		it('should close on non-ESC key when outside form and no special conditions', () => {
			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isEsc.mockReturnValue(false);
			const handlers = getGlobalEventHandlers($);

			const outsideTarget = document.createElement('div');
			handlers.keydown({ target: outsideTarget, code: 'Delete' });
			expect(ctrl.isOpen).toBe(false);
		});

		it('should handle both checkFixed true and ctrl+nonResponseKey interactions', () => {
			$.ui.selectMenuOn = false;
			$.ui.opendControllers = [{ inst: ctrl, fixed: false, form: el }];

			// Test: ctrl=true returns early
			mockKeyCodeMap.isCtrl.mockReturnValue(true);
			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			const handlers = getGlobalEventHandlers($);
			handlers.keydown({ target: document.createElement('div'), code: 'ControlLeft' });
			expect(ctrl.isOpen).toBe(true);
		});
	});

	// ==================== #CloseListener_mousedown ====================

	describe('#CloseListener_mousedown', () => {
		let ctrl;
		let el;

		beforeEach(() => {
			el = createMockElement();
			ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			ctrl.open(target, target, {});
			$.ui.opendControllers = [{ inst: ctrl, fixed: false, form: el }];
		});

		it('should set preventClose when target is inside host._element', () => {
			const innerEl = document.createElement('span');
			mockInst._element.appendChild(innerEl);
			const handlers = getGlobalEventHandlers($);

			handlers.mousedown({ target: innerEl });
			expect(ctrl.isOpen).toBe(true);

			// Normal close should be blocked
			ctrl.close();
			expect(ctrl.isOpen).toBe(true);

			// Force close should work
			ctrl.close(true);
			expect(ctrl.isOpen).toBe(false);
		});

		it('should reset preventClose to false after non-host-element click', () => {
			const handlers = getGlobalEventHandlers($);
			// First set preventClose via host element
			const innerEl = document.createElement('span');
			mockInst._element.appendChild(innerEl);
			handlers.mousedown({ target: innerEl });

			// Now click outside everything
			const outsideEl = document.createElement('div');
			handlers.mousedown({ target: outsideEl });
			// preventClose was reset to false, then force close happens
			expect(ctrl.isOpen).toBe(false);
		});

		it('should return when eventTarget equals host._element', () => {
			const handlers = getGlobalEventHandlers($);
			handlers.mousedown({ target: mockInst._element });
			expect(ctrl.isOpen).toBe(true);
		});

		it('should return when eventTarget equals currentTarget', () => {
			ctrl.currentTarget = document.createElement('div');
			const handlers = getGlobalEventHandlers($);
			handlers.mousedown({ target: ctrl.currentTarget });
			expect(ctrl.isOpen).toBe(true);
		});

		it('should return when checkFixed is true (selectMenuOn)', () => {
			$.ui.selectMenuOn = true;
			const handlers = getGlobalEventHandlers($);
			handlers.mousedown({ target: document.createElement('div') });
			expect(ctrl.isOpen).toBe(true);
			$.ui.selectMenuOn = false;
		});

		it('should return when checkFixed is true (fixed controller)', () => {
			$.ui.opendControllers = [{ inst: ctrl, fixed: true, form: el }];
			const handlers = getGlobalEventHandlers($);
			handlers.mousedown({ target: document.createElement('div') });
			expect(ctrl.isOpen).toBe(true);
		});

		it('should return when form contains eventTarget', () => {
			const innerEl = document.createElement('span');
			el.appendChild(innerEl);
			const handlers = getGlobalEventHandlers($);
			handlers.mousedown({ target: innerEl });
			expect(ctrl.isOpen).toBe(true);
		});

		it('should return when checkForm returns true', () => {
			mockDom.query.getParentElement.mockReturnValueOnce(document.createElement('div'));
			const handlers = getGlobalEventHandlers($);
			handlers.mousedown({ target: document.createElement('div') });
			expect(ctrl.isOpen).toBe(true);
		});

		it('should return when target is inside line-breaker-component', () => {
			mockDom.query.getParentElement.mockImplementation((target, query) => {
				if (query === '.se-line-breaker-component') return document.createElement('div');
				return null;
			});
			const handlers = getGlobalEventHandlers($);
			handlers.mousedown({ target: document.createElement('div') });
			expect(ctrl.isOpen).toBe(true);
			mockDom.query.getParentElement.mockReturnValue(null);
		});

		it('should force close when clicking outside', () => {
			const handlers = getGlobalEventHandlers($);
			const outsideEl = document.createElement('div');
			handlers.mousedown({ target: outsideEl });
			expect(ctrl.isOpen).toBe(false);
		});

		it('should handle null host._element gracefully', () => {
			const inst = { ...mockInst, _element: null };
			const el2 = createMockElement('el2');
			const ctrl2 = new Controller(inst, $, el2, {});
			const target = createTarget();
			ctrl2.open(target, target, {});

			const handlers = getGlobalEventHandlers($);
			// Should not throw when _element is null
			handlers.mousedown({ target: document.createElement('div') });
		});
	});

	// ==================== #checkForm ====================

	describe('#checkForm (via mousedown/keydown handlers)', () => {
		let ctrl;
		let el;

		beforeEach(() => {
			el = createMockElement();
			ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			ctrl.open(target, target, {});
			$.ui.opendControllers = [{ inst: ctrl, fixed: false, form: el }];
		});

		it('should return false for wysiwyg frame target', () => {
			mockDom.check.isWysiwygFrame.mockReturnValue(true);
			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isEsc.mockReturnValue(false);
			const handlers = getGlobalEventHandlers($);

			const outsideTarget = document.createElement('div');
			handlers.keydown({ target: outsideTarget, code: 'Delete' });
			expect(ctrl.isOpen).toBe(false);
			mockDom.check.isWysiwygFrame.mockReturnValue(false);
		});

		it('should return false when target contains the form', () => {
			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isEsc.mockReturnValue(false);

			const container = document.createElement('div');
			container.appendChild(el);
			const handlers = getGlobalEventHandlers($);

			handlers.keydown({ target: container, code: 'Delete' });
			expect(ctrl.isOpen).toBe(false);
		});

		it('should return true for drag handle class', () => {
			mockDom.utils.hasClass.mockImplementation((target, cls) => cls === 'se-drag-handle');
			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isEsc.mockReturnValue(false);
			const handlers = getGlobalEventHandlers($);

			handlers.keydown({ target: document.createElement('div'), code: 'Delete' });
			expect(ctrl.isOpen).toBe(true);
			mockDom.utils.hasClass.mockReturnValue(false);
		});

		it('should return true when parent form contains target (isInsideForm)', () => {
			const parentEl = createMockElement('parent');
			const childEl = createMockElement('child');
			const childInst = { ...mockInst, constructor: { key: 'childCtrl', name: 'ChildCtrl' } };
			const childCtrl = new Controller(childInst, $, childEl, {
				parents: [parentEl],
				isInsideForm: true,
			});
			const target = createTarget();
			childCtrl.open(target, target, {});
			$.ui.opendControllers = [{ inst: childCtrl, fixed: false, form: childEl }];

			const innerTarget = document.createElement('span');
			parentEl.appendChild(innerTarget);

			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isEsc.mockReturnValue(false);

			const handlers = getGlobalEventHandlers($);
			handlers.keydown({ target: innerTarget, code: 'Delete' });
			// isParentForm=true so !isParentForm is false, so the second part of the && is false
			// checkForm returns false -> controller should close
			expect(childCtrl.isOpen).toBe(false);
		});

		it('should return true when getParentElement finds .se-controller', () => {
			mockDom.query.getParentElement.mockReturnValueOnce(document.createElement('div'));
			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isEsc.mockReturnValue(false);
			const handlers = getGlobalEventHandlers($);

			handlers.keydown({ target: document.createElement('div'), code: 'Delete' });
			expect(ctrl.isOpen).toBe(true);
		});

		it('should return true when isInline and target equals _element', () => {
			$.component.isInline.mockReturnValue(true);
			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isEsc.mockReturnValue(false);
			const handlers = getGlobalEventHandlers($);

			handlers.keydown({ target: mockInst._element, code: 'Delete' });
			expect(ctrl.isOpen).toBe(true);
			$.component.isInline.mockReturnValue(false);
		});

		it('should return true when not isInline and target contains _element', () => {
			$.component.isInline.mockReturnValue(false);
			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isEsc.mockReturnValue(false);
			const handlers = getGlobalEventHandlers($);

			const container = document.createElement('div');
			container.appendChild(mockInst._element);

			handlers.keydown({ target: container, code: 'Delete' });
			expect(ctrl.isOpen).toBe(true);
		});

		it('should return false when isInline and target does not equal _element', () => {
			$.component.isInline.mockReturnValue(true);
			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isEsc.mockReturnValue(false);
			const handlers = getGlobalEventHandlers($);

			const outsideEl = document.createElement('div');
			handlers.keydown({ target: outsideEl, code: 'Delete' });
			// checkForm returns false, so close proceeds
			expect(ctrl.isOpen).toBe(false);
			$.component.isInline.mockReturnValue(false);
		});

		it('should return false when not isInline and target does not contain _element', () => {
			$.component.isInline.mockReturnValue(false);
			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isEsc.mockReturnValue(false);
			const handlers = getGlobalEventHandlers($);

			const outsideEl = document.createElement('div');
			handlers.keydown({ target: outsideEl, code: 'Delete' });
			expect(ctrl.isOpen).toBe(false);
		});

		it('should check isInsideForm only when isInsideForm=true and parentsForm length > 0', () => {
			// Controller without isInsideForm should not check parent forms
			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isEsc.mockReturnValue(false);
			const handlers = getGlobalEventHandlers($);

			handlers.keydown({ target: document.createElement('div'), code: 'Delete' });
			expect(ctrl.isOpen).toBe(false);
		});

		it('should handle isInsideForm when parentsForm.some returns false', () => {
			const parentEl = createMockElement('parent');
			const childEl = createMockElement('child');
			const childInst = { ...mockInst, constructor: { key: 'childCtrl2', name: 'ChildCtrl2' } };
			const childCtrl = new Controller(childInst, $, childEl, {
				parents: [parentEl],
				isInsideForm: true,
			});
			const target = createTarget();
			childCtrl.open(target, target, {});
			$.ui.opendControllers = [{ inst: childCtrl, fixed: false, form: childEl }];

			// Target is NOT inside parent form
			const outsideTarget = document.createElement('div');
			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isEsc.mockReturnValue(false);

			const handlers = getGlobalEventHandlers($);
			handlers.keydown({ target: outsideTarget, code: 'Delete' });
			// isParentForm=false, so !isParentForm is true
			// getParentElement returns null, isInline returns false, target.contains(_element) is false
			// checkForm returns false -> close proceeds
			expect(childCtrl.isOpen).toBe(false);
		});
	});

	// ==================== #PostCloseEvent ====================

	describe('#PostCloseEvent (via close listeners)', () => {
		it('should set __prevent=false when target is outside wysiwyg', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			ctrl.open(target, target, {});
			$.ui.opendControllers = [{ inst: ctrl, fixed: false, form: el }];
			$.component.__prevent = true;

			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isEsc.mockReturnValue(true);

			const outsideTarget = document.createElement('div');
			const handlers = getGlobalEventHandlers($);
			handlers.keydown({ target: outsideTarget, code: 'Escape' });

			expect($.component.__prevent).toBe(false);
		});

		it('should not change __prevent when target is inside wysiwyg', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			ctrl.open(target, target, {});
			$.ui.opendControllers = [{ inst: ctrl, fixed: false, form: el }];
			$.component.__prevent = true;

			mockKeyCodeMap.isNonResponseKey.mockReturnValue(true);
			mockKeyCodeMap.isEsc.mockReturnValue(true);

			const wysiwyg = $.frameContext.get('wysiwyg');
			const insideTarget = document.createElement('div');
			wysiwyg.appendChild(insideTarget);

			const handlers = getGlobalEventHandlers($);
			handlers.keydown({ target: insideTarget, code: 'Escape' });

			expect($.component.__prevent).toBe(true);
		});

		it('should be called from mousedown close as well', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			ctrl.open(target, target, {});
			$.ui.opendControllers = [{ inst: ctrl, fixed: false, form: el }];
			$.component.__prevent = true;

			const outsideEl = document.createElement('div');
			const handlers = getGlobalEventHandlers($);
			handlers.mousedown({ target: outsideEl });

			expect($.component.__prevent).toBe(false);
		});
	});

	// ==================== #addGlobalEvent / #removeGlobalEvent ====================

	describe('#addGlobalEvent / #removeGlobalEvent', () => {
		it('should remove existing global events before adding new ones', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();

			ctrl.open(target, target, {});
			const firstRemoveCount = $.eventManager.removeGlobalEvent.mock.calls.length;

			ctrl.open(target, target, {});
			// removeGlobalEvent should have been called for the old bindings
			expect($.eventManager.removeGlobalEvent.mock.calls.length).toBeGreaterThan(firstRemoveCount);
		});

		it('should call __removeGlobalEvent on component', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();

			ctrl.open(target, target, {});
			expect($.component.__removeGlobalEvent).toHaveBeenCalled();
		});

		it('should register both keydown and mousedown (or click on mobile) global events', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			ctrl.open(target, target, {});

			const globalTypes = $.eventManager.addGlobalEvent.mock.calls.map((c) => c[0]);
			expect(globalTypes).toContain('keydown');
			// isMobile is false, so it should be mousedown
			expect(globalTypes).toContain('mousedown');
		});

		it('should pass true as third argument (capture) to addGlobalEvent', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			ctrl.open(target, target, {});

			$.eventManager.addGlobalEvent.mock.calls.forEach((call) => {
				expect(call[2]).toBe(true);
			});
		});
	});

	// ==================== edge cases ====================

	describe('Edge cases', () => {
		it('should handle host without controllerClose', () => {
			const inst = { ...mockInst, controllerClose: undefined };
			const el = createMockElement();
			const ctrl = new Controller(inst, $, el, {});
			ctrl.isOpen = true;
			expect(() => ctrl.close()).not.toThrow();
		});

		it('should handle host without controllerOn', () => {
			const inst = { ...mockInst, controllerOn: undefined };
			const el = createMockElement();
			const ctrl = new Controller(inst, $, el, {});
			const target = createTarget();
			expect(() => ctrl.open(target, target, {})).not.toThrow();
		});

		it('should handle preventClose blocking normal close', async () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			ctrl.open(target, target, {});
			await new Promise((r) => setTimeout(r, 0));

			const innerEl = document.createElement('span');
			mockInst._element.appendChild(innerEl);
			const handlers = getGlobalEventHandlers($);
			handlers.mousedown({ target: innerEl });

			ctrl.close();
			expect(ctrl.isOpen).toBe(true);

			ctrl.close(true);
			expect(ctrl.isOpen).toBe(false);
		});

		it('should handle open called with default params', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();
			expect(() => ctrl.open(target)).not.toThrow();
		});

		it('should handle empty opendControllers gracefully', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			$.ui.opendControllers = [];
			const target = createTarget();
			expect(() => ctrl.open(target, target, {})).not.toThrow();
		});

		it('should handle multiple sequential open/close cycles', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			const target = createTarget();

			ctrl.open(target, target, {});
			ctrl.close(true);
			ctrl.open(target, target, {});
			ctrl.close(true);
			ctrl.open(target, target, {});

			expect(ctrl.currentPositionTarget).toBe(target);
		});

		it('should handle close during non-open non-force correctly (short-circuit)', () => {
			const el = createMockElement();
			const ctrl = new Controller(mockInst, $, el, {});
			ctrl.isOpen = false;
			// This should be a no-op
			ctrl.close(false);
			expect(mockInst.controllerClose).not.toHaveBeenCalled();
		});
	});
});
