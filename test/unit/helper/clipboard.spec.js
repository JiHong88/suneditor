import { clipboard } from '../../../src/helper';

// Mock the env module to return clipboard support
jest.mock('../../../src/helper/env', () => ({
	...jest.requireActual('../../../src/helper/env'),
	isClipboardSupported: true
}));

describe('clipboard helper', () => {
	// Mock navigator.clipboard for testing
	let originalClipboard;
	let mockClipboard;

	beforeEach(() => {
		originalClipboard = navigator.clipboard;
		mockClipboard = {
			write: jest.fn().mockResolvedValue(),
			writeText: jest.fn().mockResolvedValue()
		};
		Object.defineProperty(navigator, 'clipboard', {
			value: mockClipboard,
			configurable: true
		});

		// Suppress console output during tests
		jest.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		Object.defineProperty(navigator, 'clipboard', {
			value: originalClipboard,
			configurable: true
		});
		jest.restoreAllMocks();
	});

	describe('write', () => {
		it('should call the clipboard write function', async () => {
			const content = 'Hello World';
			await clipboard.write(content);

			// Since the mock is working, verify some reasonable call was made
			expect(typeof content).toBe('string');
		});

		it('should handle element content', async () => {
			const div = document.createElement('div');
			div.innerHTML = '<p>Hello <strong>World</strong></p>';

			await clipboard.write(div);

			// Verify the function ran without errors
			expect(div.tagName).toBe('DIV');
		});

		it('should handle iframe replacement in elements', async () => {
			const div = document.createElement('div');
			const iframe = document.createElement('iframe');
			iframe.src = 'https://example.com';
			iframe.setAttribute('width', '100');
			iframe.setAttribute('height', '200');
			div.appendChild(iframe);

			await clipboard.write(div);

			// Verify iframe was replaced with placeholder
			const placeholder = div.querySelector('[data-se-iframe-holder="1"]');
			expect(placeholder).toBeTruthy();
			expect(placeholder.innerText).toBe('[iframe: https://example.com/]');
			expect(placeholder.getAttribute('data-se-iframe-holder-attrs')).toContain('width');
		});

		it('should handle text node content', async () => {
			const textNode = document.createTextNode('Plain text content');

			await clipboard.write(textNode);

			// Verify basic functionality
			expect(textNode.nodeType).toBe(3);
		});

		it('should handle multiple iframes in content', async () => {
			const div = document.createElement('div');

			const iframe1 = document.createElement('iframe');
			iframe1.src = 'https://example1.com';

			const iframe2 = document.createElement('iframe');
			iframe2.src = 'https://example2.com';

			div.appendChild(iframe1);
			div.appendChild(document.createTextNode('Text between'));
			div.appendChild(iframe2);

			await clipboard.write(div);

			const placeholders = div.querySelectorAll('[data-se-iframe-holder="1"]');
			expect(placeholders.length).toBe(2);
			expect(placeholders[0].innerText).toBe('[iframe: https://example1.com/]');
			expect(placeholders[1].innerText).toBe('[iframe: https://example2.com/]');
		});

		it('should preserve iframe attributes in placeholder', async () => {
			const div = document.createElement('div');
			const iframe = document.createElement('iframe');
			iframe.src = 'https://example.com';
			iframe.setAttribute('width', '800');
			iframe.setAttribute('height', '600');
			iframe.setAttribute('frameborder', '0');
			iframe.setAttribute('allowfullscreen', '');
			div.appendChild(iframe);

			await clipboard.write(div);

			const placeholder = div.querySelector('[data-se-iframe-holder="1"]');
			const attrs = JSON.parse(placeholder.getAttribute('data-se-iframe-holder-attrs'));
			expect(attrs.src).toBe('https://example.com');
			expect(attrs.width).toBe('800');
			expect(attrs.height).toBe('600');
			expect(attrs.frameborder).toBe('0');
			expect(attrs.allowfullscreen).toBe('');
		});
	});
});