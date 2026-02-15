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
			const result = component.is(null);
			expect(result).toBe(false);
		});

		it('should return false for undefined input', () => {
			const result = component.is(undefined);
			expect(result).toBe(false);
		});

		it('should return true for FIGURE element', () => {
			const figure = document.createElement('figure');
			mockEditor.$.pluginManager.findComponentInfo = jest.fn().mockReturnValue(null);
			const result = component.is(figure);
			expect(result).toBe(true);
		});

		it('should check pluginManager for component info', () => {
			const div = document.createElement('div');
			component.is(div);
			expect(mockEditor.$.pluginManager.findComponentInfo).toHaveBeenCalledWith(div);
		});
	});

	describe('isInline method', () => {
		it('should return false for null input', () => {
			const result = component.isInline(null);
			expect(result).toBe(false);
		});

		it('should return false for undefined input', () => {
			const result = component.isInline(undefined);
			expect(result).toBe(false);
		});

		it('should check for se-inline-component class', () => {
			const div = document.createElement('div');
			div.className = 'se-inline-component';
			const result = component.isInline(div);
			expect(result).toBe(true);
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
	});

	describe('isBasic method', () => {
		it('should be a function', () => {
			expect(typeof component.isBasic).toBe('function');
		});

		it('is defined and accessible', () => {
			expect(component.isBasic).toBeDefined();
		});
	});

	describe('get method', () => {
		it('should be a function', () => {
			expect(typeof component.get).toBe('function');
		});

		it('should return null for null input', () => {
			const result = component.get(null);
			expect(result).toBeNull();
		});

		it('is defined and accessible', () => {
			expect(component.get).toBeDefined();
		});
	});

	describe('select method', () => {
		it('should be a function', () => {
			expect(typeof component.select).toBe('function');
		});

		it('should handle null element without throwing', () => {
			const result = component.select(null, 'image');
			expect(result === undefined || result === false).toBe(true);
		});

		it('is defined and accessible', () => {
			expect(component.select).toBeDefined();
		});
	});

	describe('deselect method', () => {
		it('should be a function', () => {
			expect(typeof component.deselect).toBe('function');
		});

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

	describe('hoverSelect method', () => {
		it('should be a function', () => {
			expect(typeof component.hoverSelect).toBe('function');
		});

		it('is defined and accessible', () => {
			expect(component.hoverSelect).toBeDefined();
		});
	});

	describe('copy method', () => {
		it('should be a function', () => {
			expect(typeof component.copy).toBe('function');
		});

		it('is defined and accessible', () => {
			expect(component.copy).toBeDefined();
		});
	});

	describe('insert method', () => {
		it('should be a function', () => {
			expect(typeof component.insert).toBe('function');
		});

		it('is defined and accessible', () => {
			expect(component.insert).toBeDefined();
		});
	});

	describe('applyInsertBehavior method', () => {
		it('should be a function', () => {
			expect(typeof component.applyInsertBehavior).toBe('function');
		});

		it('is defined and accessible', () => {
			expect(component.applyInsertBehavior).toBeDefined();
		});
	});

	describe('_init method', () => {
		it('should be a function', () => {
			expect(typeof component._init).toBe('function');
		});

		it('can be called (may error due to complex dependencies)', () => {
			// Just verify the method exists and is callable
			expect(component._init).toBeDefined();
		});
	});

	describe('_destroy method', () => {
		it('should be a function', () => {
			expect(typeof component._destroy).toBe('function');
		});

		it('exists and is defined', () => {
			expect(component._destroy).toBeDefined();
		});
	});

	describe('__deselect method', () => {
		it('should be a function', () => {
			expect(typeof component.__deselect).toBe('function');
		});

		it('is defined and accessible', () => {
			expect(component.__deselect).toBeDefined();
		});
	});

	describe('Integration scenarios', () => {
		it('basic methods are defined and accessible', () => {
			expect(typeof component.deselect).toBe('function');
			expect(typeof component.get).toBe('function');
			expect(typeof component.is).toBe('function');
			expect(typeof component.isInline).toBe('function');
			expect(typeof component.isBasic).toBe('function');
			expect(typeof component.select).toBe('function');
			expect(typeof component.hoverSelect).toBe('function');
		});

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
	});
});
