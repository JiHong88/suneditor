import { unicode } from '../../../src/helper';

describe('unicode helper', () => {
	describe('zeroWidthSpace', () => {
		it('should be a zero width space character', () => {
			expect(unicode.zeroWidthSpace).toBe('\u200B');
			expect(unicode.zeroWidthSpace.charCodeAt(0)).toBe(8203);
		});
	});

	describe('zeroWidthRegExp', () => {
		it('should match zero width space characters globally', () => {
			const text = 'hello\u200Bworld\u200B';
			const matches = text.match(unicode.zeroWidthRegExp);
			expect(matches.length).toBe(2);
			expect(matches[0]).toBe('\u200B');
			expect(matches[1]).toBe('\u200B');
		});

		it('should return null when no zero width spaces found', () => {
			const text = 'hello world';
			const matches = text.match(unicode.zeroWidthRegExp);
			expect(matches).toBeNull();
		});
	});

	describe('onlyZeroWidthRegExp', () => {
		it('should match strings containing only zero width spaces', () => {
			expect(unicode.onlyZeroWidthRegExp.test('\u200B')).toBe(true);
			expect(unicode.onlyZeroWidthRegExp.test('\u200B\u200B\u200B')).toBe(true);
		});

		it('should not match strings with other characters', () => {
			expect(unicode.onlyZeroWidthRegExp.test('hello\u200B')).toBe(false);
			expect(unicode.onlyZeroWidthRegExp.test('\u200Bworld')).toBe(false);
			expect(unicode.onlyZeroWidthRegExp.test('hello world')).toBe(false);
			expect(unicode.onlyZeroWidthRegExp.test('')).toBe(false);
		});
	});

	describe('escapeStringRegexp', () => {
		it('should escape special regex characters', () => {
			const testCases = [
				{ input: 'hello.world', expected: 'hello\\.world' },
				{ input: 'test*string', expected: 'test\\*string' },
				{ input: 'query+plus', expected: 'query\\+plus' },
				{ input: 'question?mark', expected: 'question\\?mark' },
				{ input: 'pipe|separator', expected: 'pipe\\|separator' },
				{ input: 'brackets[test]', expected: 'brackets\\[test\\]' },
				{ input: 'parens(test)', expected: 'parens\\(test\\)' },
				{ input: 'braces{test}', expected: 'braces\\{test\\}' },
				{ input: '^start$end', expected: '\\^start\\$end' },
				{ input: 'back\\slash', expected: 'back\\\\slash' },
				{ input: 'hy-fen', expected: 'hy\\x2dfen' }
			];

			testCases.forEach(({ input, expected }) => {
				expect(unicode.escapeStringRegexp(input)).toBe(expected);
			});
		});

		it('should handle empty string', () => {
			expect(unicode.escapeStringRegexp('')).toBe('');
		});

		it('should handle strings without special characters', () => {
			const input = 'hello world 123';
			expect(unicode.escapeStringRegexp(input)).toBe(input);
		});

		it('should throw TypeError for non-string input', () => {
			expect(() => unicode.escapeStringRegexp(null)).toThrow(TypeError);
			expect(() => unicode.escapeStringRegexp(undefined)).toThrow(TypeError);
			expect(() => unicode.escapeStringRegexp(123)).toThrow(TypeError);
			expect(() => unicode.escapeStringRegexp({})).toThrow(TypeError);
			expect(() => unicode.escapeStringRegexp([])).toThrow(TypeError);
		});

		it('should make escaped string safe for regex use', () => {
			const specialString = '.+*?^${}()|[]\\-';
			const escaped = unicode.escapeStringRegexp(specialString);
			const regex = new RegExp(escaped);

			// The escaped string should match literally, not as regex special chars
			expect(regex.test(specialString)).toBe(true);
			expect(regex.test('different string')).toBe(false);
		});
	});
});
