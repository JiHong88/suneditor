import { clipboard } from '../../src/helper';

describe('clipboard helper', () => {
	// Mock navigator.clipboard for testing
	let originalClipboard;
	let mockClipboard;

	beforeEach(() => {
		originalClipboard = navigator.clipboard;
		mockClipboard = {
			write: jasmine.createSpy('write').and.returnValue(Promise.resolve()),
			writeText: jasmine.createSpy('writeText').and.returnValue(Promise.resolve())
		};
		Object.defineProperty(navigator, 'clipboard', {
			value: mockClipboard,
			configurable: true
		});
	});

	afterEach(() => {
		Object.defineProperty(navigator, 'clipboard', {
			value: originalClipboard,
			configurable: true
		});
	});

	describe('write', () => {
		it('should handle string content', async () => {
			const content = 'Hello World';
			await clipboard.write(content);

			expect(mockClipboard.write).toHaveBeenCalled();
			const callArgs = mockClipboard.write.calls.first().args[0];
			expect(callArgs).toBeInstanceOf(Array);
			expect(callArgs.length).toBe(1);
		});

		it('should handle element content', async () => {
			const div = document.createElement('div');
			div.innerHTML = '<p>Hello <strong>World</strong></p>';

			await clipboard.write(div);

			expect(mockClipboard.write).toHaveBeenCalled();
			const callArgs = mockClipboard.write.calls.first().args[0];
			expect(callArgs).toBeInstanceOf(Array);
			expect(callArgs.length).toBe(1);
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

			expect(mockClipboard.write).toHaveBeenCalled();
		});

		it('should fallback to writeText on write failure', async () => {
			mockClipboard.write.and.returnValue(Promise.reject(new Error('Write failed')));

			const content = 'Test content';
			await clipboard.write(content);

			expect(mockClipboard.write).toHaveBeenCalled();
			expect(mockClipboard.writeText).toHaveBeenCalledWith('Test content');
		});

		it('should handle writeText failure gracefully', async () => {
			mockClipboard.write.and.returnValue(Promise.reject(new Error('Write failed')));
			mockClipboard.writeText.and.returnValue(Promise.reject(new Error('WriteText failed')));

			spyOn(console, 'error');

			const content = 'Test content';
			await clipboard.write(content);

			expect(console.error).toHaveBeenCalled();
		});

		it('should strip HTML when falling back to plain text', async () => {
			mockClipboard.write.and.returnValue(Promise.reject(new Error('Write failed')));

			const htmlContent = 'Hello World';
			await clipboard.write(htmlContent);

			expect(mockClipboard.writeText).toHaveBeenCalledWith('Hello World');
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
