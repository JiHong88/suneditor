/**
 * @fileoverview Unit tests for plugins/command/codeBlock.js
 */

import CodeBlock from '../../../../src/plugins/command/codeBlock.js';
import { createMockEditor } from '../../../../test/__mocks__/editorMock.js';

// Mock helper — simple stubs only (no document access in factory)
jest.mock('../../../../src/helper', () => ({
	dom: {
		utils: {
			createElement: jest.fn((tag, attrs, html) => ({
				tagName: tag,
				nodeName: tag,
				cloneNode: jest.fn().mockReturnValue({ tagName: tag }),
				setAttribute: jest.fn(),
				getAttribute: jest.fn((k) => (attrs && attrs[k]) || null),
				querySelectorAll: jest.fn().mockReturnValue([]),
				appendChild: jest.fn(),
				innerHTML: html || '',
				style: {},
				classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
				className: '',
			})),
			addClass: jest.fn(),
			removeClass: jest.fn(),
			toggleClass: jest.fn(),
		},
		query: {
			getParentElement: jest.fn().mockReturnValue(null),
			getEventTarget: jest.fn((e) => e?.target),
		},
	},
	converter: {
		debounce: jest.fn((fn) => fn),
	},
}));

jest.mock('../../../../src/modules/contract', () => ({
	Controller: jest.fn().mockImplementation(function () {
		this.isOpen = false;
		this.form = { parentNode: null, style: {}, contains: jest.fn().mockReturnValue(false) };
		this.open = jest.fn(() => { this.isOpen = true; });
		this.close = jest.fn(() => { this.isOpen = false; });
	}),
}));

jest.mock('../../../../src/modules/ui', () => ({
	SelectMenu: jest.fn().mockImplementation(function () {
		this.isOpen = false;
		this.items = [];
		this.on = jest.fn();
		this.create = jest.fn((items) => { this.items = items; });
		this.open = jest.fn();
		this.close = jest.fn();
	}),
}));

describe('Plugins - Command - CodeBlock', () => {
	let kernel;
	let codeBlock;

	beforeEach(() => {
		jest.clearAllMocks();

		kernel = createMockEditor();
		kernel.$.lang.codeBlock = 'Code Block';
		kernel.$.lang.codeLanguage = 'Language';
		kernel.$.lang.codeLanguage_none = 'None';
		kernel.$.icons.code_block = '<svg></svg>';
		kernel.$.icons.arrow_down = '<svg></svg>';
		kernel.$.menu.initDropdownTarget = jest.fn();

		codeBlock = new CodeBlock(kernel, { langs: ['javascript', 'python', 'html'] });
	});

	describe('Constructor', () => {
		it('should create instance with correct properties', () => {
			expect(codeBlock).toBeInstanceOf(CodeBlock);
			expect(codeBlock.title).toBe('Code Block');
			expect(codeBlock.icon).toBe('code_block');
		});

		it('should have static key "codeBlock"', () => {
			expect(CodeBlock.key).toBe('codeBlock');
		});

		it('should have static className as empty string', () => {
			expect(CodeBlock.className).toBe('');
		});

		it('should create afterItem when langs provided', () => {
			expect(codeBlock.afterItem).toBeDefined();
		});

		it('should register dropdown target when langs provided', () => {
			expect(kernel.$.menu.initDropdownTarget).toHaveBeenCalledWith(
				{ key: 'codeBlock', type: 'dropdown' },
				expect.anything(),
			);
		});

		it('should not create afterItem when langs is empty', () => {
			const cb = new CodeBlock(kernel, { langs: [] });
			expect(cb.afterItem).toBeNull();
		});

		it('should use default langs when pluginOptions.langs is undefined', () => {
			const cb = new CodeBlock(kernel, {});
			expect(cb.afterItem).toBeDefined();
		});

		it('should use default langs when pluginOptions is undefined', () => {
			const cb = new CodeBlock(kernel, undefined);
			expect(cb.afterItem).toBeDefined();
		});

		it('should use default langs when pluginOptions is null', () => {
			const cb = new CodeBlock(kernel, null);
			expect(cb.afterItem).toBeDefined();
		});

		it('should fallback title when lang.codeBlock is empty', () => {
			kernel.$.lang.codeBlock = '';
			const cb = new CodeBlock(kernel, { langs: [] });
			expect(cb.title).toBe('Code Block');
		});
	});

	describe('active method', () => {
		const mockTarget = { classList: { add: jest.fn(), remove: jest.fn() } };

		it('should return true for PRE element', () => {
			const { dom } = require('../../../../src/helper');
			const result = codeBlock.active({ nodeName: 'PRE' }, mockTarget);
			expect(result).toBe(true);
			expect(dom.utils.addClass).toHaveBeenCalledWith(mockTarget, 'active');
		});

		it('should return false for non-PRE element', () => {
			const { dom } = require('../../../../src/helper');
			const result = codeBlock.active({ nodeName: 'P' }, mockTarget);
			expect(result).toBe(false);
			expect(dom.utils.removeClass).toHaveBeenCalledWith(mockTarget, 'active');
		});

		it('should return false for null element', () => {
			const result = codeBlock.active(null, mockTarget);
			expect(result).toBe(false);
		});

		it('should return false for undefined element', () => {
			const result = codeBlock.active(undefined, mockTarget);
			expect(result).toBe(false);
		});

		it('should be case insensitive', () => {
			const result = codeBlock.active({ nodeName: 'pre' }, mockTarget);
			expect(result).toBe(true);
		});

		it('should return false for DIV element', () => {
			const result = codeBlock.active({ nodeName: 'DIV' }, mockTarget);
			expect(result).toBe(false);
		});

		it('should return false for CODE element (not PRE)', () => {
			const result = codeBlock.active({ nodeName: 'CODE' }, mockTarget);
			expect(result).toBe(false);
		});
	});

	describe('action method', () => {
		it('should call setBrLine when not inside PRE and no lang', () => {
			kernel.$.selection.getNode.mockReturnValue({ nodeName: 'P' });
			kernel.$.format.setBrLine = jest.fn();
			kernel.$.format.setLine = jest.fn();

			codeBlock.action(null);

			expect(kernel.$.format.setBrLine).toHaveBeenCalled();
			expect(kernel.$.format.setLine).not.toHaveBeenCalled();
		});

		it('should call setLine when inside PRE with no lang (toggle off)', () => {
			const { dom } = require('../../../../src/helper');
			const pre = { nodeName: 'PRE' };
			kernel.$.selection.getNode.mockReturnValue(pre);
			dom.query.getParentElement.mockReturnValue(pre);
			kernel.$.format.setLine = jest.fn();
			kernel.$.format.setBrLine = jest.fn();

			codeBlock.action(null);

			expect(kernel.$.format.setLine).toHaveBeenCalled();
			expect(kernel.$.format.setBrLine).not.toHaveBeenCalled();
		});

		it('should close dropdown and push history after action', () => {
			kernel.$.selection.getNode.mockReturnValue({ nodeName: 'P' });
			kernel.$.format.setBrLine = jest.fn();

			codeBlock.action(null);

			expect(kernel.$.menu.dropdownOff).toHaveBeenCalled();
			expect(kernel.$.focusManager.focus).toHaveBeenCalled();
			expect(kernel.$.history.push).toHaveBeenCalledWith(false);
		});

		it('should apply language when target has data-value', () => {
			const { dom } = require('../../../../src/helper');
			const target = { getAttribute: jest.fn().mockReturnValue('javascript') };
			const pre = { nodeName: 'PRE', className: '', setAttribute: jest.fn(), removeAttribute: jest.fn() };

			kernel.$.selection.getNode.mockReturnValue({ nodeName: 'P' });
			dom.query.getParentElement
				.mockReturnValueOnce(null) // first call: currentPre check
				.mockReturnValueOnce(pre); // second call: get pre after setBrLine
			kernel.$.format.setBrLine = jest.fn();

			codeBlock.action(target);

			expect(kernel.$.format.setBrLine).toHaveBeenCalled();
			expect(kernel.$.history.push).toHaveBeenCalledWith(false);
		});

		it('should toggle off when inside PRE with empty data-value', () => {
			const { dom } = require('../../../../src/helper');
			const target = { getAttribute: jest.fn().mockReturnValue('') };
			const pre = { nodeName: 'PRE' };
			kernel.$.selection.getNode.mockReturnValue(pre);
			dom.query.getParentElement.mockReturnValue(pre);
			kernel.$.format.setLine = jest.fn();

			codeBlock.action(target);

			expect(kernel.$.format.setLine).toHaveBeenCalled();
		});

		it('should change language when inside PRE with new lang', () => {
			const { dom } = require('../../../../src/helper');
			const target = { getAttribute: jest.fn().mockReturnValue('python') };
			const pre = { nodeName: 'PRE', className: 'language-javascript', setAttribute: jest.fn(), removeAttribute: jest.fn() };

			kernel.$.selection.getNode.mockReturnValue(pre);
			dom.query.getParentElement.mockReturnValue(pre);
			kernel.$.format.setBrLine = jest.fn();

			codeBlock.action(target);

			// Should not toggle off (lang is provided), and should set new lang
			expect(dom.utils.addClass).toHaveBeenCalled();
		});

		it('should handle action with target that has no data-value', () => {
			const { dom } = require('../../../../src/helper');
			dom.query.getParentElement.mockReturnValue(null);
			kernel.$.selection.getNode.mockReturnValue({ nodeName: 'P' });
			kernel.$.format.setBrLine = jest.fn();

			const target = { getAttribute: jest.fn().mockReturnValue(null) };
			expect(() => codeBlock.action(target)).not.toThrow();
			expect(kernel.$.format.setBrLine).toHaveBeenCalled();
		});
	});

	describe('on method (dropdown open)', () => {
		it('should not throw when called', () => {
			const { dom } = require('../../../../src/helper');
			dom.query.getParentElement.mockReturnValue(null);
			kernel.$.selection.getNode.mockReturnValue({ nodeName: 'P', className: '' });
			expect(() => codeBlock.on()).not.toThrow();
		});

		it('should not throw when no langItems (empty langs)', () => {
			const cb = new CodeBlock(kernel, { langs: [] });
			expect(() => cb.on()).not.toThrow();
		});
	});

	describe('onMouseMove hook', () => {
		it('should not throw with empty langs (no hover controller)', () => {
			const cb = new CodeBlock(kernel, { langs: [] });
			expect(() => cb.onMouseMove({ event: { target: {} } })).not.toThrow();
		});

		it('should not throw when event target is not inside PRE', () => {
			const { dom } = require('../../../../src/helper');
			const target = { closest: jest.fn().mockReturnValue(null) };
			dom.query.getEventTarget.mockReturnValue(target);

			expect(() => codeBlock.onMouseMove({ event: { target } })).not.toThrow();
		});

		it('should not throw when event target is inside PRE', () => {
			const { dom } = require('../../../../src/helper');
			const pre = { nodeName: 'PRE', className: '', offsetWidth: 200 };
			const target = { closest: jest.fn().mockReturnValue(pre) };
			dom.query.getEventTarget.mockReturnValue(target);
			kernel.$.ui.opendControllers = [];

			expect(() => codeBlock.onMouseMove({ event: { target } })).not.toThrow();
		});
	});

	describe('destroy method', () => {
		it('should not throw when called', () => {
			expect(() => codeBlock.destroy()).not.toThrow();
		});

		it('should not throw when called on instance with empty langs', () => {
			const cb = new CodeBlock(kernel, { langs: [] });
			expect(() => cb.destroy()).not.toThrow();
		});
	});

	describe('controllerClose hook', () => {
		it('should not throw when called', () => {
			expect(() => codeBlock.controllerClose()).not.toThrow();
		});
	});
});
