import { env } from '../../../src/helper';

describe('env helper', () => {
	describe('global references', () => {
		it('should reference window and document', () => {
			expect(env._w).toBe(window);
			expect(env._d).toBe(document);
		});

		it('should provide NO_EVENT symbol', () => {
			expect(typeof env.NO_EVENT).toBe('symbol');
		});

		it('should provide ON_OVER_COMPONENT symbol', () => {
			expect(typeof env.ON_OVER_COMPONENT).toBe('symbol');
		});
	});

	describe('getXMLHttpRequest', () => {
		it('should create a new XMLHttpRequest instance', () => {
			const xhr = env.getXMLHttpRequest();
			expect(xhr).toBeInstanceOf(XMLHttpRequest);
		});
	});

	describe('browser detection flags', () => {
		it('should have boolean values for browser detection', () => {
			expect(typeof env.isResizeObserverSupported).toBe('boolean');
			expect(typeof env.isClipboardSupported).toBe('boolean');
			expect(typeof env.isEdge).toBe('boolean');
			expect(typeof env.isBlink).toBe('boolean');
			expect(typeof env.isGecko).toBe('boolean');
			expect(typeof env.isChromium).toBe('boolean');
			expect(typeof env.isSafari).toBe('boolean');
			expect(typeof env.isOSX_IOS).toBe('boolean');
			expect(typeof env.isAndroid).toBe('boolean');
			expect(typeof env.isMobile).toBe('boolean');
			expect(typeof env.isTouchDevice).toBe('boolean');
		});
	});

	describe('platform-specific icons', () => {
		it('should provide appropriate command icons based on platform', () => {
			expect(typeof env.cmdIcon).toBe('string');
			expect(typeof env.shiftIcon).toBe('string');

			// Should be either Mac/iOS or Windows/Other style
			expect(['⌘', 'CTRL'].includes(env.cmdIcon)).toBe(true);
			expect(['⇧', '+SHIFT'].includes(env.shiftIcon)).toBe(true);
		});
	});

	describe('DPI', () => {
		it('should provide device pixel ratio', () => {
			expect(typeof env.DPI).toBe('number');
			expect(env.DPI).toBe(window.devicePixelRatio);
		});
	});

	describe('website constants', () => {
		it('should provide website URLs', () => {
			expect(env.KATEX_WEBSITE).toBe('https://katex.org/docs/supported.html');
			expect(env.MATHJAX_WEBSITE).toBe('https://www.mathjax.org/');
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
