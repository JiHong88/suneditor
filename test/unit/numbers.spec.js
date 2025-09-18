import { numbers } from '../../src/helper';

describe('numbers helper', () => {
	describe('is', () => {
		it('should return true for valid integers', () => {
			expect(numbers.is(123)).toBe(true);
			expect(numbers.is('123')).toBe(true);
			expect(numbers.is(-123)).toBe(true);
			expect(numbers.is('-123')).toBe(true);
			expect(numbers.is(0)).toBe(true);
			expect(numbers.is('0')).toBe(true);
		});

		it('should return true for valid decimal numbers', () => {
			expect(numbers.is(123.45)).toBe(true);
			expect(numbers.is('123.45')).toBe(true);
			expect(numbers.is(-123.45)).toBe(true);
			expect(numbers.is('-123.45')).toBe(true);
			expect(numbers.is(0.5)).toBe(true);
			expect(numbers.is('0.5')).toBe(true);
		});

		it('should return false for non-numeric values', () => {
			expect(numbers.is('abc')).toBe(false);
			expect(numbers.is('12a')).toBe(false);
			expect(numbers.is('a12')).toBe(false);
			expect(numbers.is('')).toBe(false);
			expect(numbers.is(null)).toBe(false);
			expect(numbers.is(undefined)).toBe(false);
			expect(numbers.is({})).toBe(false);
			expect(numbers.is([])).toBe(false);
			expect(numbers.is('12.34.56')).toBe(false);
			expect(numbers.is('12..34')).toBe(false);
		});
	});

	describe('get', () => {
		it('should extract numbers from strings', () => {
			expect(numbers.get('123px')).toBe(123);
			expect(numbers.get('456.78em')).toBe(457);
			expect(numbers.get('-123px')).toBe(-123);
			expect(numbers.get('width: 100px')).toBe(100);
		});

		it('should handle maxDec parameter for decimal precision', () => {
			expect(numbers.get('123.456', 0)).toBe(123);
			expect(numbers.get('123.456', 1)).toBe(123.5);
			expect(numbers.get('123.456', 2)).toBe(123.46);
			expect(numbers.get('123.456', 3)).toBe(123.456);
			expect(numbers.get('123.456', -1)).toBe(123.456);
		});

		it('should return 0 for invalid inputs', () => {
			expect(numbers.get('')).toBe(0);
			expect(numbers.get(null)).toBe(0);
			expect(numbers.get(undefined)).toBe(0);
			expect(numbers.get('abc')).toBe(0);
			expect(numbers.get({})).toBe(0);
		});

		it('should handle edge cases', () => {
			expect(numbers.get('0')).toBe(0);
			expect(numbers.get('-0')).toBe(0);
			expect(numbers.get('0.0')).toBe(0);
		});
	});

	describe('getOverlapRangeAtIndex', () => {
		it('should calculate overlap correctly for overlapping ranges', () => {
			expect(numbers.getOverlapRangeAtIndex(1, 5, 4, 6)).toBe(2);
			expect(numbers.getOverlapRangeAtIndex(4, 6, 1, 5)).toBe(2);
			expect(numbers.getOverlapRangeAtIndex(2, 8, 3, 7)).toBe(5);
			expect(numbers.getOverlapRangeAtIndex(3, 7, 2, 8)).toBe(5);
		});

		it('should return 0 for non-overlapping ranges', () => {
			expect(numbers.getOverlapRangeAtIndex(1, 3, 5, 7)).toBe(0);
			expect(numbers.getOverlapRangeAtIndex(5, 7, 1, 3)).toBe(0);
			expect(numbers.getOverlapRangeAtIndex(1, 4, 5, 8)).toBe(0);
		});

		it('should handle adjacent ranges', () => {
			expect(numbers.getOverlapRangeAtIndex(1, 4, 4, 6)).toBe(1);
			expect(numbers.getOverlapRangeAtIndex(4, 6, 1, 4)).toBe(1);
		});

		it('should handle identical ranges', () => {
			expect(numbers.getOverlapRangeAtIndex(2, 5, 2, 5)).toBe(4);
			expect(numbers.getOverlapRangeAtIndex(0, 0, 0, 0)).toBe(1);
		});

		it('should handle contained ranges', () => {
			expect(numbers.getOverlapRangeAtIndex(2, 8, 3, 6)).toBe(4);
			expect(numbers.getOverlapRangeAtIndex(3, 6, 2, 8)).toBe(4);
		});
	});

	describe('isEven', () => {
		it('should return true for even numbers', () => {
			expect(numbers.isEven(0)).toBe(true);
			expect(numbers.isEven(2)).toBe(true);
			expect(numbers.isEven(4)).toBe(true);
			expect(numbers.isEven(100)).toBe(true);
			expect(numbers.isEven(-2)).toBe(true);
			expect(numbers.isEven(-4)).toBe(true);
		});

		it('should return false for odd numbers', () => {
			expect(numbers.isEven(1)).toBe(false);
			expect(numbers.isEven(3)).toBe(false);
			expect(numbers.isEven(5)).toBe(false);
			expect(numbers.isEven(99)).toBe(false);
			expect(numbers.isEven(-1)).toBe(false);
			expect(numbers.isEven(-3)).toBe(false);
		});
	});

	describe('isOdd', () => {
		it('should return true for odd numbers', () => {
			expect(numbers.isOdd(1)).toBe(true);
			expect(numbers.isOdd(3)).toBe(true);
			expect(numbers.isOdd(5)).toBe(true);
			expect(numbers.isOdd(99)).toBe(true);
			expect(numbers.isOdd(-1)).toBe(true);
			expect(numbers.isOdd(-3)).toBe(true);
		});

		it('should return false for even numbers', () => {
			expect(numbers.isOdd(0)).toBe(false);
			expect(numbers.isOdd(2)).toBe(false);
			expect(numbers.isOdd(4)).toBe(false);
			expect(numbers.isOdd(100)).toBe(false);
			expect(numbers.isOdd(-2)).toBe(false);
			expect(numbers.isOdd(-4)).toBe(false);
		});
	});
});