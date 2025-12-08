/**
 * @jest-environment jsdom
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../__mocks__/editorIntegration';
import { dom } from '../../../../src/helper';

describe('Offset', () => {
	let editor;
	let offset;
	let wysiwyg;

	beforeEach(async () => {
		editor = createTestEditor();
		await waitForEditorReady(editor);
		offset = editor.offset;
		wysiwyg = editor.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('get', () => {
		it('should get offset position of node', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const p = wysiwyg.firstChild;

			const result = offset.get(p);

			expect(result).toBeDefined();
			expect(result.left).toBeDefined();
			expect(result.top).toBeDefined();
		});

		it('should handle iframe mode', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const p = wysiwyg.firstChild;

			const result = offset.get(p);

			expect(result).toBeDefined();
		});

		it('should handle text node', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;

			const result = offset.get(text);

			expect(result).toBeDefined();
		});
	});

	describe('getLocal', () => {
		it('should get local offset position', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const p = wysiwyg.firstChild;

			const result = offset.getLocal(p);

			expect(result).toBeDefined();
			expect(result.left).toBeDefined();
			expect(result.top).toBeDefined();
			expect(result.right).toBeDefined();
			expect(result.scrollX).toBeDefined();
			expect(result.scrollY).toBeDefined();
		});

		it('should handle text node in getLocal', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const text = wysiwyg.firstChild.firstChild;

			const result = offset.getLocal(text);

			expect(result).toBeDefined();
		});

		it('should handle nested elements', () => {
			wysiwyg.innerHTML = '<div><p><span>deep</span></p></div>';
			const span = wysiwyg.querySelector('span');

			const result = offset.getLocal(span);

			expect(result).toBeDefined();
			expect(typeof result.left).toBe('number');
			expect(typeof result.top).toBe('number');
		});

		it('should calculate scroll offsets', () => {
			wysiwyg.innerHTML = '<div style="height: 1000px;"><p>test</p></div>';
			const p = wysiwyg.querySelector('p');

			const result = offset.getLocal(p);

			expect(result.scrollX).toBeDefined();
			expect(result.scrollY).toBeDefined();
		});
	});

	describe('getGlobal', () => {
		it('should get global offset position', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const p = wysiwyg.firstChild;

			const result = offset.getGlobal(p);

			expect(result).toBeDefined();
			expect(result.top).toBeDefined();
			expect(result.left).toBeDefined();
			expect(result.fixedTop).toBeDefined();
			expect(result.fixedLeft).toBeDefined();
			expect(result.width).toBeDefined();
			expect(result.height).toBeDefined();
		});

		it('should handle element dimensions', () => {
			wysiwyg.innerHTML = '<div style="width: 100px; height: 50px;">test</div>';
			const div = wysiwyg.firstChild;

			const result = offset.getGlobal(div);

			expect(result.width).toBeDefined();
			expect(result.height).toBeDefined();
		});
	});

	describe('getWWScroll', () => {
		it('should get wysiwyg scroll info without rects (removed in commit 9f43ca04)', () => {
			wysiwyg.innerHTML = '<p>test</p>';

			const result = offset.getWWScroll();

			expect(result).toBeDefined();
			expect(result.top).toBeDefined();
			expect(result.left).toBeDefined();
			expect(result.width).toBeDefined();
			expect(result.height).toBeDefined();
			expect(result.bottom).toBeDefined();
			// IMPORTANT: rects property was removed in commit 9f43ca04
			expect(result.rects).toBeUndefined();
		});

		it('should calculate bottom position', () => {
			wysiwyg.innerHTML = '<p>test</p>';

			const result = offset.getWWScroll();

			expect(result.bottom).toBe(result.top + result.height);
		});
	});

	describe('getGlobalScroll', () => {
		it('should get global scroll info', () => {
			wysiwyg.innerHTML = '<p>test</p>';
			const result = offset.getGlobalScroll();
			expect(result).toBeDefined();
			expect(result.top).toBeDefined();
		});

		it('should handle scrolling elements', () => {
			wysiwyg.innerHTML = '<div style="height: 1000px; overflow: scroll;"><div style="height: 2000px;">content</div></div>';
			const scrollDiv = wysiwyg.firstChild;
			scrollDiv.scrollTop = 100;
			
			const result = offset.getGlobalScroll(scrollDiv.firstChild);
			expect(result.top).toBeGreaterThan(0);
		});

		it('should handle absolute positioned elements', () => {
			wysiwyg.innerHTML = '<div style="position: absolute; top: 100px;">absolute</div>';
			const absDiv = wysiwyg.firstChild;
			const result = offset.getGlobalScroll(absDiv);
			expect(result.ohOffsetEl).toBe(window);
		});
		
		it('should handle iframe context', () => {
			// Mock iframe environment
			const mockIframe = {
				nodeName: 'IFRAME',
				parentElement: document.createElement('div'),
				contentDocument: document,
				getBoundingClientRect: () => ({ top: 0, left: 0 })
			};
			editor.frameContext.get('wysiwygFrame'); // Ensure it exists
			editor.frameContext.set('wysiwygFrame', mockIframe);
			
			const result = offset.getGlobalScroll();
			expect(result).toBeDefined();
		});
	});

	describe('setAbsPosition', () => {
		it('should position element absolutely', () => {
			const element = document.createElement('div');
			const target = document.createElement('div');
			const arrow = document.createElement('div');
			arrow.className = 'se-arrow';
			element.appendChild(arrow);

			document.body.appendChild(element);
			document.body.appendChild(target);

			const params = {
				addOffset: { left: 10, top: 10 },
				position: 'bottom',
				inst: {},
				sibling: null
			};

			const result = offset.setAbsPosition(element, target, params);

			expect(element.style.top).toContain('px');
			expect(element.style.left).toContain('px');
			expect(result).toBeDefined();

			document.body.removeChild(element);
			document.body.removeChild(target);
		});
	});



	describe('setRangePosition', () => {
		it('should position element relative to range', () => {
			const element = document.createElement('div');
			const arrow = document.createElement('div');
			arrow.className = 'se-arrow';
			element.appendChild(arrow);
			document.body.appendChild(element);

			const range = document.createRange();
			const p = document.createElement('p');
			p.textContent = 'test';
			document.body.appendChild(p);

			range.selectNodeContents(p);
			
			// Mock Range.prototype.getClientRects
			const originalGetClientRects = Range.prototype.getClientRects;
			Range.prototype.getClientRects = jest.fn(() => [{
				top: 100,
				bottom: 120,
				left: 100,
				right: 200,
				width: 100,
				height: 20
			}]);

			const result = offset.setRangePosition(element, range, { position: 'bottom', addTop: 10 });

			expect(element.style.top).toContain('px');
			expect(element.style.left).toContain('px');
			
			// Restore
			Range.prototype.getClientRects = originalGetClientRects;

			// Clean up
			document.body.removeChild(element);
			document.body.removeChild(p);
		});
	});

	describe('setRelPosition', () => {
		let getComputedStyleSpy;

		afterEach(() => {
			getComputedStyleSpy?.mockRestore();
		});

		it('should position element relative to fixed container', () => {
			const element = document.createElement('div');
			const container = document.createElement('div');
			const target = document.createElement('button');
			const targetContainer = document.createElement('div');

			Object.defineProperty(target, 'offsetHeight', { value: 20 });
			Object.defineProperty(target, 'offsetWidth', { value: 30 });
			Object.defineProperty(element, 'offsetHeight', { value: 10 });
			Object.defineProperty(element, 'offsetWidth', { value: 10 });

			getComputedStyleSpy = jest.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
				if (el === targetContainer) return { position: 'fixed' };
				return { position: '' };
			});

			offset.setRelPosition(element, container, target, targetContainer);

			expect(element.style.position).toBe('fixed');
			expect(element.style.top).toContain('px');
			expect(element.style.left).toContain('px');
		});

		it('should position element with rtl option', () => {
			const originalGet = editor.options.get;
			editor.options.get = jest.fn((key) => (key === '_rtl' ? true : originalGet.call(editor.options, key)));

			const element = document.createElement('div');
			const container = document.createElement('div');
			const target = document.createElement('button');
			const targetContainer = document.createElement('div');

			Object.defineProperty(target, 'offsetHeight', { value: 20 });
			Object.defineProperty(target, 'offsetWidth', { value: 40 });
			Object.defineProperty(element, 'offsetHeight', { value: 10 });
			Object.defineProperty(element, 'offsetWidth', { value: 15 });

			offset.setRelPosition(element, container, target, targetContainer);

			expect(element.style.left).toContain('px');

			editor.options.get = originalGet;
		});
	});

	describe('edge cases', () => {
		it('should handle empty wysiwyg', () => {
			wysiwyg.innerHTML = '';

			const result = offset.getWWScroll();

			expect(result).toBeDefined();
		});

		it('should handle getGlobal with no argument', () => {
			const result = offset.getGlobal();

			expect(result).toBeDefined();
			expect(typeof result.top).toBe('number');
			expect(typeof result.left).toBe('number');
		});

		it('should handle deeply nested elements', () => {
			wysiwyg.innerHTML = '<div><div><div><p><span><strong>deep</strong></span></p></div></div></div>';
			const strong = wysiwyg.querySelector('strong');

			const result = offset.getLocal(strong);

			expect(result).toBeDefined();
			expect(typeof result.left).toBe('number');
			expect(typeof result.top).toBe('number');
		});
	});

});
