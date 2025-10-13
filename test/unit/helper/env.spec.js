import { env } from '../../../src/helper';

describe('env helper', () => {
	describe('platform-specific icons', () => {
		it('should provide appropriate command icons based on platform', () => {
			expect(typeof env.cmdIcon).toBe('string');
			expect(typeof env.shiftIcon).toBe('string');

			// Should be either Mac/iOS or Windows/Other style
			expect(['⌘', 'CTRL'].includes(env.cmdIcon)).toBe(true);
			expect(['⇧', '+SHIFT'].includes(env.shiftIcon)).toBe(true);
		});
	});

	describe('getPageStyle', () => {
		it('should return a string of CSS text', () => {
			const cssText = env.getPageStyle();
			expect(typeof cssText).toBe('string');
		});

		it('should handle custom document parameter', () => {
			const cssText = env.getPageStyle(document);
			expect(typeof cssText).toBe('string');
		});

		it('should handle null document parameter', () => {
			const cssText = env.getPageStyle(null);
			expect(typeof cssText).toBe('string');
		});
	});

	describe('getIncludePath', () => {
		it('should handle valid file extensions', () => {
			// This test may need to be adjusted based on actual script tags in test environment
			try {
				const path = env.getIncludePath(['suneditor'], 'js');
				expect(typeof path).toBe('string');
			} catch (e) {
				// Expected to throw if no matching files found
				expect(e.message).toContain('SUNEDITOR installation path could not be automatically detected');
			}
		});
	});
});
