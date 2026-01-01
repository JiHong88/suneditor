import suneditor, { editorInjector, plugins, modules, langs, helper } from '../../src/suneditor';

// Mock Editor constructor
jest.mock('../../src/core/editor', () => {
	return jest.fn().mockImplementation(() => ({
		destroy: jest.fn(),
		getContents: jest.fn().mockReturnValue(''),
		setContents: jest.fn()
	}));
});

// Mock document.querySelector for string target tests
const mockQuerySelector = jest.fn();
Object.defineProperty(document, 'querySelector', {
	value: mockQuerySelector,
	configurable: true
});

describe('SunEditor Main Entry', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockQuerySelector.mockClear();
	});





	describe('init method', () => {
		it('should pass init options to create method', () => {
			const initOptions = { height: '300px' };
			const mockElement = { nodeType: 1 };
			const createOptions = { width: '100%' };

			const factory = suneditor.init(initOptions);
			factory.create(mockElement, createOptions);

			const Editor = require('../../src/core/editor');
			expect(Editor).toHaveBeenCalledWith([{ key: null, target: mockElement }], expect.objectContaining({ height: '300px', width: '100%' }));
		});
	});

	describe('create method', () => {
		describe('Target validation', () => {
			it('should throw error when target is null or undefined', () => {
				expect(() => suneditor.create(null)).toThrow('[SUNEDITOR.create.fail] The first parameter "target" is missing.');
				expect(() => suneditor.create(undefined)).toThrow('[SUNEDITOR.create.fail] The first parameter "target" is missing.');
			});

			it('should handle DOM element target', () => {
				const mockElement = { nodeType: 1 };
				const options = { height: '300px' };

				suneditor.create(mockElement, options);

				const Editor = require('../../src/core/editor');
				expect(Editor).toHaveBeenCalledWith([{ key: null, target: mockElement }], options);
			});

			it('should handle string selector target', () => {
				const mockElement = { nodeType: 1 };
				const selector = '#editor';
				mockQuerySelector.mockReturnValue(mockElement);

				suneditor.create(selector);

				expect(mockQuerySelector).toHaveBeenCalledWith(selector);
				const Editor = require('../../src/core/editor');
				expect(Editor).toHaveBeenCalledWith([{ key: null, target: mockElement }], {});
			});

			it('should throw error when string selector returns null', () => {
				const selector = '#nonexistent';
				mockQuerySelector.mockReturnValue(null);

				expect(() => suneditor.create(selector)).toThrow('[SUNEDITOR.create.fail]-[document.querySelector(#nonexistent)] Cannot find target element. Make sure "#nonexistent" is a valid selector and exists in the document.');
			});

			it('should handle multi-root object target', () => {
				const targets = {
					editor1: { target: { nodeType: 1 } },
					editor2: { target: { nodeType: 1 } }
				};

				suneditor.create(targets);

				const Editor = require('../../src/core/editor');
				expect(Editor).toHaveBeenCalledWith(
					[
						{ target: { nodeType: 1 }, key: 'editor1' },
						{ target: { nodeType: 1 }, key: 'editor2' }
					],
					{}
				);
			});

			it('should throw error for invalid multi-root target', () => {
				const invalidTargets = {
					editor1: { target: null }
				};

				expect(() => suneditor.create(invalidTargets)).toThrow('[SUNEDITOR.create.fail] suneditor multi root requires textarea\'s element at the "target" property.');
			});
		});

		describe('Options handling', () => {
			it('should handle undefined options', () => {
				const mockElement = { nodeType: 1 };

				suneditor.create(mockElement);

				const Editor = require('../../src/core/editor');
				expect(Editor).toHaveBeenCalledWith([{ key: null, target: mockElement }], {});
			});

			it('should handle non-object options', () => {
				const mockElement = { nodeType: 1 };

				suneditor.create(mockElement, 'invalid');

				const Editor = require('../../src/core/editor');
				expect(Editor).toHaveBeenCalledWith([{ key: null, target: mockElement }], {});
			});

			it('should merge init options with create options', () => {
				const initOptions = { height: '300px', width: '500px' };
				const createOptions = { width: '100%', plugins: ['bold'] };
				const mockElement = { nodeType: 1 };

				suneditor.create(mockElement, createOptions, initOptions);

				const Editor = require('../../src/core/editor');
				expect(Editor).toHaveBeenCalledWith([{ key: null, target: mockElement }], { height: '300px', width: '100%', plugins: ['bold'] });
			});

			it('should merge plugin arrays correctly', () => {
				const initOptions = { plugins: ['bold', 'italic'] };
				const createOptions = { plugins: ['underline', 'bold'] };
				const mockElement = { nodeType: 1 };

				suneditor.create(mockElement, createOptions, initOptions);

				const Editor = require('../../src/core/editor');
				const call = Editor.mock.calls[0];
				expect(call[1].plugins).toEqual(['underline', 'bold', 'italic']);
			});

			it('should handle object plugins correctly', () => {
				const initOptions = { plugins: { bold: true, italic: true } };
				const createOptions = { plugins: { underline: true, bold: true } };
				const mockElement = { nodeType: 1 };

				suneditor.create(mockElement, createOptions, initOptions);

				const Editor = require('../../src/core/editor');
				const call = Editor.mock.calls[0];
				expect(call[1].plugins).toContain(true); // Contains plugin values
			});
		});


	});
});
