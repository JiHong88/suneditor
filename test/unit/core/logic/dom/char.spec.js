/**
 * @jest-environment jsdom
 */

import { createMockEditor } from '../../../../__mocks__/editorMock';
import Char from '../../../../../src/core/logic/dom/char';

describe('Core Logic - Char', () => {
	let kernel;
	let char;
	let wysiwyg;

	beforeEach(() => {
		kernel = createMockEditor({
			charCounter: true,
			charCounter_max: 100,
			charCounter_type: 'char'
		});
		char = new Char(kernel);
		wysiwyg = kernel.$.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('constructor', () => {
		it('should be initialized correctly', () => {
			expect(char).toBeDefined();
		});

		it('should have required methods', () => {
			expect(typeof char.check).toBe('function');
			expect(typeof char.getLength).toBe('function');
		});
	});

	describe('check', () => {
		it('should check character count', () => {
			const result = char.check('test');
			expect(typeof result).toBe('boolean');
		});
	});

	describe('getLength', () => {
		it('should get character length', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const length = char.getLength('test');
			expect(typeof length).toBe('number');
		});
	});
});
