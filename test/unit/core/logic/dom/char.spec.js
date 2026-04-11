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
			expect(typeof char.getByteLength).toBe('function');
			expect(typeof char.getWordCount).toBe('function');
			expect(typeof char.test).toBe('function');
			expect(typeof char.display).toBe('function');
		});
	});

	describe('getLength', () => {
		it('should get character length of provided string', () => {
			const length = char.getLength('test');
			expect(length).toBe(4);
		});

		it('should get character length of editor content when no argument', () => {
			wysiwyg.innerHTML = '<p>Hello</p>';
			const length = char.getLength();
			expect(length).toBeGreaterThan(0);
		});

		it('should return 0 for empty content', () => {
			wysiwyg.textContent = '';
			const length = char.getLength();
			expect(length).toBe(0);
		});

		it('should count unicode characters', () => {
			const length = char.getLength('안녕하세요');
			expect(length).toBe(5);
		});

		it('should count spaces', () => {
			const length = char.getLength('a b c');
			expect(length).toBe(5);
		});

		it('should count empty string as 0', () => {
			const length = char.getLength('');
			expect(length).toBe(0);
		});
	});

	describe('getLength with byte counter type', () => {
		let byteChar;

		beforeEach(() => {
			const byteKernel = createMockEditor({
				charCounter: true,
				charCounter_max: 100,
				charCounter_type: 'byte'
			});
			// Also set the frame-level option
			byteKernel.$.frameContext.get('options').set('charCounter_type', 'byte');
			byteChar = new Char(byteKernel);
		});

		it('should count bytes for ASCII text', () => {
			const length = byteChar.getLength('Hello');
			expect(length).toBe(5);
		});

		it('should count bytes for multibyte text', () => {
			const length = byteChar.getLength('한글');
			// Korean characters are 3 bytes each in UTF-8
			expect(length).toBe(6);
		});
	});

	describe('getByteLength', () => {
		it('should return byte length for ASCII', () => {
			expect(char.getByteLength('Hello')).toBe(5);
		});

		it('should return byte length for Korean characters', () => {
			// Each Korean character is 3 bytes in UTF-8
			expect(char.getByteLength('한글')).toBe(6);
		});

		it('should return byte length for Japanese characters', () => {
			expect(char.getByteLength('日本語')).toBe(9);
		});

		it('should return byte length for emoji', () => {
			const bytes = char.getByteLength('😀');
			expect(bytes).toBeGreaterThanOrEqual(4);
		});

		it('should return 0 for empty string', () => {
			expect(char.getByteLength('')).toBe(0);
		});

		it('should return 0 for null', () => {
			expect(char.getByteLength(null)).toBe(0);
		});

		it('should return 0 for undefined', () => {
			expect(char.getByteLength(undefined)).toBe(0);
		});

		it('should handle numbers by converting to string', () => {
			expect(char.getByteLength(12345)).toBe(5);
		});

		it('should handle mixed ASCII and multibyte', () => {
			// "Hello 한글" = 5 + 1 + 6 = 12
			expect(char.getByteLength('Hello 한글')).toBe(12);
		});

		it('should count newline characters', () => {
			const bytes = char.getByteLength('a\nb');
			expect(bytes).toBeGreaterThanOrEqual(3);
		});
	});

	describe('getWordCount', () => {
		it('should count words in simple text', () => {
			expect(char.getWordCount('Hello World')).toBe(2);
		});

		it('should return 0 for empty string', () => {
			expect(char.getWordCount('')).toBe(0);
		});

		it('should return 0 for whitespace-only string', () => {
			expect(char.getWordCount('   ')).toBe(0);
		});

		it('should count single word', () => {
			expect(char.getWordCount('Hello')).toBe(1);
		});

		it('should handle multiple spaces between words', () => {
			expect(char.getWordCount('Hello    World')).toBe(2);
		});

		it('should handle leading and trailing spaces', () => {
			expect(char.getWordCount('  Hello World  ')).toBe(2);
		});

		it('should handle tabs and newlines', () => {
			expect(char.getWordCount('Hello\tWorld\nFoo')).toBe(3);
		});

		it('should count editor content when no argument', () => {
			wysiwyg.innerText = 'Hello World Foo';
			const count = char.getWordCount();
			expect(count).toBe(3);
		});

		it('should return 0 for empty editor content', () => {
			wysiwyg.innerText = '';
			const count = char.getWordCount();
			expect(count).toBe(0);
		});
	});

	describe('check', () => {
		it('should return true when within character limit', () => {
			wysiwyg.textContent = 'Short';
			const result = char.check('test');
			expect(result).toBe(true);
		});

		it('should return false when exceeding character limit', () => {
			wysiwyg.textContent = 'A'.repeat(95);
			const result = char.check('A'.repeat(10));
			expect(result).toBe(false);
		});

		it('should return true when no max limit is set', () => {
			const noLimitKernel = createMockEditor({
				charCounter: true,
				charCounter_max: 0,
				charCounter_type: 'char'
			});
			const noLimitChar = new Char(noLimitKernel);
			expect(noLimitChar.check('any text')).toBe(true);
		});

		it('should check string content', () => {
			wysiwyg.textContent = 'A'.repeat(50);
			expect(char.check('short')).toBe(true);
		});

		it('should check node textContent', () => {
			wysiwyg.textContent = 'A'.repeat(50);
			const node = document.createElement('span');
			node.textContent = 'test node';
			expect(char.check(node)).toBe(true);
		});

		it('should return true when adding 0-length content', () => {
			wysiwyg.textContent = 'A'.repeat(99);
			expect(char.check('')).toBe(true);
		});
	});

	describe('test', () => {
		it('should return true when within limit', () => {
			wysiwyg.textContent = 'Short';
			const result = char.test('a', false);
			expect(result).toBe(true);
		});

		it('should return true when no max limit', () => {
			const noLimitKernel = createMockEditor({
				charCounter: true,
				charCounter_max: 0,
				charCounter_type: 'char'
			});
			const noLimitChar = new Char(noLimitKernel);
			noLimitKernel.$.frameContext.get('wysiwyg').textContent = 'test';
			expect(noLimitChar.test('a', false)).toBe(true);
		});

		it('should return false when adding content exceeds limit', () => {
			wysiwyg.textContent = 'A'.repeat(95);
			const result = char.test('B'.repeat(10), false);
			expect(result).toBe(false);
		});

		it('should handle null inputText', () => {
			wysiwyg.textContent = 'Short';
			expect(() => char.test(null, false)).not.toThrow();
		});

		it('should handle empty inputText', () => {
			wysiwyg.textContent = 'Short';
			const result = char.test('', false);
			expect(result).toBe(true);
		});
	});

	describe('display', () => {
		it('should not throw when charCounter element is missing', () => {
			expect(() => char.display()).not.toThrow();
		});

		it('should update counter elements when present', () => {
			jest.useFakeTimers();
			const charCounter = document.createElement('span');
			const wordCounter = document.createElement('span');
			kernel.$.frameContext.set('charCounter', charCounter);
			kernel.$.frameContext.set('wordCounter', wordCounter);

			wysiwyg.innerHTML = '<p>Hello World</p>';
			wysiwyg.innerText = 'Hello World';
			char.display();
			jest.advanceTimersByTime(10);

			expect(charCounter.textContent).not.toBe('');
			expect(wordCounter.textContent).not.toBe('');
			jest.useRealTimers();
		});

		it('should accept custom frame context', () => {
			jest.useFakeTimers();
			const customFc = new Map([
				['charCounter', null],
				['wordCounter', null],
				['wysiwyg', wysiwyg]
			]);
			expect(() => char.display(customFc)).not.toThrow();
			jest.advanceTimersByTime(10);
			jest.useRealTimers();
		});

		it('should update charCounter textContent via setTimeout', () => {
			jest.useFakeTimers();
			const charCounter = document.createElement('span');
			kernel.$.frameContext.set('charCounter', charCounter);
			wysiwyg.textContent = 'Hello';

			char.display();
			jest.advanceTimersByTime(10);

			expect(charCounter.textContent).toBe('5');
			jest.useRealTimers();
		});

		it('should update wordCounter textContent via setTimeout', () => {
			jest.useFakeTimers();
			const wordCounter = document.createElement('span');
			kernel.$.frameContext.set('wordCounter', wordCounter);
			wysiwyg.innerText = 'Hello World';

			char.display();
			jest.advanceTimersByTime(10);

			expect(wordCounter.textContent).toBe('2');
			jest.useRealTimers();
		});
	});
});
