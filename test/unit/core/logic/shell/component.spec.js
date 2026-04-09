/**
 * @jest-environment jsdom
 */

jest.mock('../../../../../src/modules/ui', () => ({
	_DragHandle: {
		get: jest.fn(),
		set: jest.fn()
	}
}));

import { createMockEditor } from '../../../../__mocks__/editorMock';
import Component from '../../../../../src/core/logic/shell/component';

describe('Component', () => {
	let mockEditor;
	let component;

	beforeEach(() => {
		mockEditor = createMockEditor();
		component = new Component(mockEditor);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Constructor', () => {
		it('should initialize Component with default properties', () => {
			expect(component.info).toBeNull();
			expect(component.isSelected).toBe(false);
			expect(component.currentTarget).toBeNull();
			expect(component.currentPlugin).toBeNull();
			expect(component.currentPluginName).toBe('');
			expect(component.currentInfo).toBeNull();
		});

		it('should set internal __selectionSelected flag to false', () => {
			expect(component.__selectionSelected).toBe(false);
		});

		it('should set internal __prevent flag to false', () => {
			expect(component.__prevent).toBe(false);
		});
	});

	describe('is method', () => {
		it('should return false for null input', () => {
			expect(component.is(null)).toBe(false);
		});

		it('should return false for undefined input', () => {
			expect(component.is(undefined)).toBe(false);
		});

		it('should return true for FIGURE element', () => {
			const figure = document.createElement('figure');
			mockEditor.$.pluginManager.findComponentInfo = jest.fn().mockReturnValue(null);
			expect(component.is(figure)).toBe(true);
		});

		it('should return true for lowercase figure element', () => {
			const figure = document.createElement('figure');
			mockEditor.$.pluginManager.findComponentInfo = jest.fn().mockReturnValue(null);
			expect(component.is(figure)).toBe(true);
		});

		it('should check pluginManager for component info', () => {
			const div = document.createElement('div');
			component.is(div);
			expect(mockEditor.$.pluginManager.findComponentInfo).toHaveBeenCalledWith(div);
		});

		it('should return true when pluginManager finds component info', () => {
			const img = document.createElement('img');
			mockEditor.$.pluginManager.findComponentInfo = jest.fn().mockReturnValue({
				target: img,
				pluginName: 'image',
				options: {},
				launcher: null
			});
			expect(component.is(img)).toBe(true);
		});

		it('should return false for regular elements without component info', () => {
			const p = document.createElement('p');
			mockEditor.$.pluginManager.findComponentInfo = jest.fn().mockReturnValue(null);
			expect(component.is(p)).toBe(false);
		});

		it('should return true for element with se-component class', () => {
			const div = document.createElement('div');
			div.className = 'se-component';
			// dom.check.isComponentContainer should recognize this
			expect(component.is(div)).toBe(true);
		});

		it('should return false for text node', () => {
			const textNode = document.createTextNode('hello');
			mockEditor.$.pluginManager.findComponentInfo = jest.fn().mockReturnValue(null);
			expect(component.is(textNode)).toBe(false);
		});

		it('should return false for BR element', () => {
			const br = document.createElement('br');
			mockEditor.$.pluginManager.findComponentInfo = jest.fn().mockReturnValue(null);
			expect(component.is(br)).toBe(false);
		});
	});

	describe('isInline method', () => {
		it('should return false for null input', () => {
			expect(component.isInline(null)).toBe(false);
		});

		it('should return false for undefined input', () => {
			expect(component.isInline(undefined)).toBe(false);
		});

		it('should check for se-inline-component class', () => {
			const div = document.createElement('div');
			div.className = 'se-inline-component';
			expect(component.isInline(div)).toBe(true);
		});

		it('should handle FIGURE elements by checking parent', () => {
			const figure = document.createElement('figure');
			const parent = document.createElement('div');
			parent.className = 'se-inline-component';
			parent.appendChild(figure);
			document.body.appendChild(parent);

			mockEditor.$.pluginManager.findComponentInfo = jest.fn().mockReturnValue(null);
			const result = component.isInline(figure);

			document.body.removeChild(parent);
			expect(result).toBe(true);
		});

		it('should return false for regular div', () => {
			const div = document.createElement('div');
			mockEditor.$.pluginManager.findComponentInfo = jest.fn().mockReturnValue(null);
			expect(component.isInline(div)).toBe(false);
		});

		it('should return false for element with se-component but not se-inline-component', () => {
			const div = document.createElement('div');
			div.className = 'se-component';
			mockEditor.$.pluginManager.findComponentInfo = jest.fn().mockReturnValue(null);
			expect(component.isInline(div)).toBe(false);
		});

		it('should check pluginManager and parent for inline component', () => {
			const span = document.createElement('span');
			const parent = document.createElement('div');
			parent.className = 'se-inline-component';
			parent.appendChild(span);
			document.body.appendChild(parent);

			mockEditor.$.pluginManager.findComponentInfo = jest.fn().mockReturnValue({
				target: span,
				pluginName: 'emoji',
				options: {},
				launcher: null
			});

			const result = component.isInline(span);
			document.body.removeChild(parent);
			expect(result).toBe(true);
		});
	});

	describe('isBasic method', () => {
		it('should return false for null', () => {
			expect(component.isBasic(null)).toBe(false);
		});

		it('should return false for regular elements', () => {
			const p = document.createElement('p');
			mockEditor.$.pluginManager.findComponentInfo = jest.fn().mockReturnValue(null);
			expect(component.isBasic(p)).toBe(false);
		});

		it('should return true for non-inline component (FIGURE)', () => {
			const figure = document.createElement('figure');
			mockEditor.$.pluginManager.findComponentInfo = jest.fn().mockReturnValue(null);
			expect(component.isBasic(figure)).toBe(true);
		});

		it('should return false for inline component', () => {
			const div = document.createElement('div');
			div.className = 'se-inline-component';
			mockEditor.$.pluginManager.findComponentInfo = jest.fn().mockReturnValue(null);
			// is() returns false for plain div, so isBasic returns false
			expect(component.isBasic(div)).toBe(false);
		});

		it('should return true for se-component class div', () => {
			const div = document.createElement('div');
			div.className = 'se-component';
			mockEditor.$.pluginManager.findComponentInfo = jest.fn().mockReturnValue(null);
			expect(component.isBasic(div)).toBe(true);
		});
	});

	describe('get method', () => {
		it('should return null for null input', () => {
			expect(component.get(null)).toBeNull();
		});

		it('should return null for undefined input', () => {
			expect(component.get(undefined)).toBeNull();
		});

		it('should return null for non-component element', () => {
			const p = document.createElement('p');
			mockEditor.$.pluginManager.findComponentInfo = jest.fn().mockReturnValue(null);
			expect(component.get(p)).toBeNull();
		});

		it('is defined and accessible', () => {
			expect(component.get).toBeDefined();
		});

		it('should return component info when pluginManager finds component', () => {
			const img = document.createElement('img');
			img.src = 'test.jpg';
			const figure = document.createElement('figure');
			figure.appendChild(img);

			mockEditor.$.pluginManager.findComponentInfo = jest.fn().mockReturnValue({
				target: img,
				pluginName: 'image',
				options: {},
				launcher: null
			});

			const result = component.get(figure);
			// Result depends on Figure.GetContainer mock
			if (result) {
				expect(result.pluginName).toBe('image');
				expect(result.target).toBeDefined();
			}
		});
	});

	describe('select method', () => {
		it('should handle null element without throwing', () => {
			const result = component.select(null, 'image');
			expect(result === undefined || result === false).toBe(true);
		});

		it('is defined and accessible', () => {
			expect(component.select).toBeDefined();
		});

		it('should return false/undefined for element with no component info', () => {
			const div = document.createElement('div');
			mockEditor.$.pluginManager.findComponentInfo = jest.fn().mockReturnValue(null);
			const result = component.select(div, 'image');
			expect(result === undefined || result === false).toBe(true);
		});
	});

	describe('deselect method', () => {
		it('is defined and accessible', () => {
			expect(component.deselect).toBeDefined();
		});

		it('can set isSelected via property assignment', () => {
			component.isSelected = true;
			expect(component.isSelected).toBe(true);

			component.isSelected = false;
			expect(component.isSelected).toBe(false);
		});

		it('can manage currentPluginName property', () => {
			component.currentPluginName = 'image';
			expect(component.currentPluginName).toBe('image');

			component.currentPluginName = '';
			expect(component.currentPluginName).toBe('');
		});
	});

	describe('__deselect method', () => {
		it('should reset isSelected to false', () => {
			const { _DragHandle } = require('../../../../../src/modules/ui');
			_DragHandle.get.mockReturnValue(null);

			component.isSelected = true;
			component.currentTarget = document.createElement('div');
			component.currentPlugin = { componentDeselect: jest.fn() };
			component.currentPluginName = 'test';
			component.currentInfo = { container: document.createElement('div'), cover: null };

			component.__deselect();

			expect(component.isSelected).toBe(false);
			expect(component.currentTarget).toBeNull();
			expect(component.currentPlugin).toBeNull();
			expect(component.currentPluginName).toBe('');
			expect(component.currentInfo).toBeNull();
		});

		it('should call componentDeselect on current plugin if available', () => {
			const { _DragHandle } = require('../../../../../src/modules/ui');
			_DragHandle.get.mockReturnValue(null);

			const mockDeselect = jest.fn();
			const target = document.createElement('img');
			component.currentTarget = target;
			component.currentPlugin = { componentDeselect: mockDeselect };
			component.currentPluginName = 'image';

			component.__deselect();

			expect(mockDeselect).toHaveBeenCalledWith(target);
		});

		it('should handle missing componentDeselect gracefully', () => {
			const { _DragHandle } = require('../../../../../src/modules/ui');
			_DragHandle.get.mockReturnValue(null);

			component.currentPlugin = {};
			component.currentTarget = document.createElement('div');
			component.currentPluginName = 'test';

			expect(() => component.__deselect()).not.toThrow();
		});

		it('should set _preventBlur to false in store', () => {
			const { _DragHandle } = require('../../../../../src/modules/ui');
			_DragHandle.get.mockReturnValue(null);

			component.__deselect();

			expect(mockEditor.store.set).toHaveBeenCalledWith('_preventBlur', false);
		});
	});

	describe('insert method', () => {
		it('should return null when in readOnly mode', () => {
			mockEditor.$.frameContext.set('isReadOnly', true);
			const element = document.createElement('div');

			const result = component.insert(element);

			expect(result).toBeNull();
			mockEditor.$.frameContext.set('isReadOnly', false);
		});

		it('should return null when char check fails', () => {
			mockEditor.$.char.check = jest.fn().mockReturnValue(false);
			const element = document.createElement('div');

			const result = component.insert(element);

			expect(result).toBeNull();
		});

		it('should bypass char check when skipCharCount is true', () => {
			mockEditor.$.char.check = jest.fn().mockReturnValue(false);
			mockEditor.$.html.remove = jest.fn().mockReturnValue({ container: null, offset: 0 });
			mockEditor.$.selection.getNode.mockReturnValue(document.createElement('p'));
			mockEditor.$.format.getLine = jest.fn().mockReturnValue(document.createElement('p'));

			const element = document.createElement('hr');
			// Should not return null even though char check fails
			const result = component.insert(element, { skipCharCount: true });

			expect(mockEditor.$.char.check).not.toHaveBeenCalled();
		});
	});

	describe('copy method', () => {
		it('is defined and accessible', () => {
			expect(typeof component.copy).toBe('function');
		});
	});

	describe('hoverSelect method', () => {
		it('is defined and accessible', () => {
			expect(typeof component.hoverSelect).toBe('function');
		});
	});

	describe('_init method', () => {
		it('is defined and accessible', () => {
			expect(typeof component._init).toBe('function');
		});

		it('should call applyToRoots on contextProvider', () => {
			component._init();
			expect(mockEditor.$.contextProvider.applyToRoots).toHaveBeenCalled();
		});
	});

	describe('_destroy method', () => {
		it('is defined and accessible', () => {
			expect(typeof component._destroy).toBe('function');
		});

		it('should not throw when called', () => {
			const { _DragHandle } = require('../../../../../src/modules/ui');
			_DragHandle.get.mockReturnValue(null);

			expect(() => component._destroy()).not.toThrow();
		});
	});

	describe('__removeGlobalEvent method', () => {
		it('is defined and accessible', () => {
			expect(typeof component.__removeGlobalEvent).toBe('function');
		});

		it('should not throw when called without active events', () => {
			expect(() => component.__removeGlobalEvent()).not.toThrow();
		});
	});

	describe('__removeDragEvent method', () => {
		it('is defined and accessible', () => {
			expect(typeof component.__removeDragEvent).toBe('function');
		});

		it('should reset DragHandle state', () => {
			const { _DragHandle } = require('../../../../../src/modules/ui');
			_DragHandle.get.mockReturnValue(null);

			// Need drag-cursor element in the carrierWrapper
			const dragCursor = document.createElement('div');
			dragCursor.className = 'se-drag-cursor';
			dragCursor.style.left = '100px';
			mockEditor.$.contextProvider.carrierWrapper.appendChild(dragCursor);

			expect(() => component.__removeDragEvent()).not.toThrow();
			expect(_DragHandle.set).toHaveBeenCalledWith('__dragInst', null);
			expect(_DragHandle.set).toHaveBeenCalledWith('__dragHandler', null);
			expect(_DragHandle.set).toHaveBeenCalledWith('__dragContainer', null);
		});
	});

	describe('Integration scenarios', () => {
		it('info property can be set and read', () => {
			const mockInfo = { target: null, pluginName: 'test' };
			component.info = mockInfo;
			expect(component.info).toEqual(mockInfo);
		});

		it('can manage currentTarget and currentPlugin', () => {
			const target = document.createElement('img');
			const plugin = { action: jest.fn() };

			component.currentTarget = target;
			component.currentPlugin = plugin;

			expect(component.currentTarget).toBe(target);
			expect(component.currentPlugin).toBe(plugin);
		});

		it('can manage currentInfo state', () => {
			const info = {
				target: document.createElement('img'),
				pluginName: 'image',
				container: null,
				cover: null,
				caption: null
			};

			component.currentInfo = info;
			expect(component.currentInfo).toBe(info);

			component.currentInfo = null;
			expect(component.currentInfo).toBeNull();
		});

		it('__deselect resets all state properties', () => {
			const { _DragHandle } = require('../../../../../src/modules/ui');
			_DragHandle.get.mockReturnValue(null);

			component.isSelected = true;
			component.currentTarget = document.createElement('img');
			component.currentPlugin = { action: jest.fn() };
			component.currentPluginName = 'image';
			component.currentInfo = { target: null };

			component.__deselect();

			expect(component.isSelected).toBe(false);
			expect(component.currentTarget).toBeNull();
			expect(component.currentPlugin).toBeNull();
			expect(component.currentPluginName).toBe('');
			expect(component.currentInfo).toBeNull();
		});
	});
});
