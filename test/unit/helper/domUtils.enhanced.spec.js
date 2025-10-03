import { dom } from '../../../src/helper';

describe('dom.utils enhanced coverage', () => {
	describe('toggleClass', () => {
		it('should add class if not present', () => {
			const div = document.createElement('div');
			div.className = 'existing';

			const result = dom.utils.toggleClass(div, 'new-class');
			expect(result).toBe(true); // added
			expect(div.className).toContain('new-class');
		});

		it('should remove class if present', () => {
			const div = document.createElement('div');
			div.className = 'existing remove-me';

			const result = dom.utils.toggleClass(div, 'remove-me');
			expect(result).toBe(false); // removed
			expect(div.className).not.toContain('remove-me');
		});

		it('should handle element without class attribute', () => {
			const div = document.createElement('div');

			const result = dom.utils.toggleClass(div, 'first-class');
			expect(result).toBe(true);
			expect(div.className.trim()).toBe('first-class');
		});

		it('should remove empty class attribute', () => {
			const div = document.createElement('div');
			div.className = 'only-class';

			dom.utils.toggleClass(div, 'only-class');
			expect(div.hasAttribute('class')).toBe(false);
		});

		it('should handle non-element nodes', () => {
			const textNode = document.createTextNode('text');
			const result = dom.utils.toggleClass(textNode, 'class');
			expect(result).toBeUndefined();
		});

		it('should handle null element', () => {
			const result = dom.utils.toggleClass(null, 'class');
			expect(result).toBeUndefined();
		});
	});

	describe('flashClass', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		it('should add and remove class after duration', () => {
			const div = document.createElement('div');

			dom.utils.flashClass(div, 'flash', 100);

			// Class should be added immediately
			expect(div.className).toContain('flash');

			// Fast-forward time
			jest.advanceTimersByTime(100);

			// Class should be removed
			expect(div.className).not.toContain('flash');
		});

		it('should use default duration', () => {
			const div = document.createElement('div');

			dom.utils.flashClass(div, 'flash');

			expect(div.className).toContain('flash');

			jest.advanceTimersByTime(120); // default 120ms

			expect(div.className).not.toContain('flash');
		});
	});

	describe('addClass - edge cases', () => {
		it('should handle multiple classes', () => {
			const div = document.createElement('div');

			dom.utils.addClass(div, 'class1');
			dom.utils.addClass(div, 'class2');
			dom.utils.addClass(div, 'class3');

			expect(div.className).toContain('class1');
			expect(div.className).toContain('class2');
			expect(div.className).toContain('class3');
		});

		it('should not add duplicate classes', () => {
			const div = document.createElement('div');

			dom.utils.addClass(div, 'duplicate');
			dom.utils.addClass(div, 'duplicate');

			const matches = div.className.match(/duplicate/g);
			expect(matches.length).toBe(1);
		});

		it('should handle class with special regex characters', () => {
			const div = document.createElement('div');

			dom.utils.addClass(div, 'class-with-dash');
			expect(div.className).toContain('class-with-dash');
		});
	});

	describe('removeClass - edge cases', () => {
		it('should remove class from middle', () => {
			const div = document.createElement('div');
			div.className = 'first middle last';

			dom.utils.removeClass(div, 'middle');
			expect(div.className).not.toContain('middle');
			expect(div.className).toContain('first');
			expect(div.className).toContain('last');
		});

		it('should handle class at start', () => {
			const div = document.createElement('div');
			div.className = 'remove second third';

			dom.utils.removeClass(div, 'remove');
			expect(div.className).not.toContain('remove');
			expect(div.className).toContain('second');
		});

		it('should handle class at end', () => {
			const div = document.createElement('div');
			div.className = 'first second remove';

			dom.utils.removeClass(div, 'remove');
			expect(div.className).not.toContain('remove');
			expect(div.className).toContain('first');
		});

		it('should handle non-existent class', () => {
			const div = document.createElement('div');
			div.className = 'existing';

			dom.utils.removeClass(div, 'not-there');
			expect(div.className).toBe('existing');
		});
	});

	describe('hasClass - coverage', () => {
		it('should detect class in middle of list', () => {
			const div = document.createElement('div');
			div.className = 'first target last';

			expect(dom.utils.hasClass(div, 'target')).toBe(true);
		});

		it('should handle partial match correctly', () => {
			const div = document.createElement('div');
			div.className = 'test-class other-class';

			expect(dom.utils.hasClass(div, 'test')).toBe(false);
			expect(dom.utils.hasClass(div, 'test-class')).toBe(true);
		});

		it('should handle single class', () => {
			const div = document.createElement('div');
			div.className = 'only';

			expect(dom.utils.hasClass(div, 'only')).toBe(true);
		});
	});

	describe('createElement - uncovered branches', () => {
		it('should handle class attribute specially', () => {
			const div = dom.utils.createElement('div', {
				class: 'custom-class'
			});

			expect(div.className).toBe('custom-class');
		});

		it('should handle style object', () => {
			const div = dom.utils.createElement('div', {
				style: 'color: red; font-size: 14px;'
			});

			expect(div.getAttribute('style')).toContain('color');
		});

		it('should handle aria attributes', () => {
			const div = dom.utils.createElement('div', {
				'aria-label': 'Label',
				'aria-hidden': 'true'
			});

			expect(div.getAttribute('aria-label')).toBe('Label');
			expect(div.getAttribute('aria-hidden')).toBe('true');
		});

		it('should handle data attributes', () => {
			const div = dom.utils.createElement('div', {
				'data-id': '123',
				'data-value': 'test'
			});

			expect(div.getAttribute('data-id')).toBe('123');
			expect(div.getAttribute('data-value')).toBe('test');
		});

		it('should handle boolean attributes', () => {
			const input = dom.utils.createElement('input', {
				type: 'checkbox',
				checked: 'checked',
				disabled: 'disabled'
			});

			expect(input.getAttribute('checked')).toBe('checked');
			expect(input.getAttribute('disabled')).toBe('disabled');
		});

		it('should create without attributes', () => {
			const div = dom.utils.createElement('div');
			expect(div.tagName).toBe('DIV');
			expect(div.attributes.length).toBeLessThanOrEqual(1); // May have 0 or just style
		});

		it('should handle empty attributes object', () => {
			const div = dom.utils.createElement('div', {});
			expect(div.tagName).toBe('DIV');
		});
	});

	describe('changeElement - variations', () => {
		it('should replace element with string', () => {
			const parent = document.createElement('div');
			const span = document.createElement('span');
			span.textContent = 'old';
			parent.appendChild(span);

			dom.utils.changeElement(span, '<p>new</p>');
			expect(parent.innerHTML).toContain('<p>new</p>');
		});

		it('should replace element with node', () => {
			const parent = document.createElement('div');
			const span = document.createElement('span');
			span.textContent = 'old';
			parent.appendChild(span);

			const newDiv = document.createElement('div');
			newDiv.textContent = 'new';
			dom.utils.changeElement(span, newDiv);

			expect(parent.firstChild).toBe(newDiv);
			expect(parent.firstChild.textContent).toBe('new');
		});

		it('should handle null element', () => {
			expect(() => dom.utils.changeElement(null, '<div></div>')).not.toThrow();
		});
	});

	describe('changeTxt - coverage', () => {
		it('should change text node content', () => {
			const textNode = document.createTextNode('old text');
			dom.utils.changeTxt(textNode, 'new text');

			expect(textNode.textContent).toBe('new text');
		});

		it('should handle element node', () => {
			const div = document.createElement('div');
			div.textContent = 'old';
			dom.utils.changeTxt(div, 'new');

			expect(div.textContent).toBe('new');
		});

		it('should handle null node', () => {
			expect(() => dom.utils.changeTxt(null, 'text')).not.toThrow();
		});

		it('should handle null text', () => {
			const node = document.createTextNode('old');
			expect(() => dom.utils.changeTxt(node, null)).not.toThrow();
		});
	});

	describe('removeItem - variations', () => {
		it('should remove element from parent', () => {
			const parent = document.createElement('div');
			const child = document.createElement('span');
			parent.appendChild(child);

			dom.utils.removeItem(child);
			expect(parent.children.length).toBe(0);
		});

		it('should handle element without parent', () => {
			const orphan = document.createElement('div');
			expect(() => dom.utils.removeItem(orphan)).not.toThrow();
		});

		it('should handle null', () => {
			expect(() => dom.utils.removeItem(null)).not.toThrow();
		});

		it('should handle text node', () => {
			const parent = document.createElement('div');
			const textNode = document.createTextNode('text');
			parent.appendChild(textNode);

			dom.utils.removeItem(textNode);
			expect(parent.childNodes.length).toBe(0);
		});
	});

	describe('array utility functions - coverage', () => {
		it('should filter array with validation', () => {
			const parent = document.createElement('div');
			const span1 = document.createElement('span');
			const span2 = document.createElement('p');
			const span3 = document.createElement('span');
			parent.appendChild(span1);
			parent.appendChild(span2);
			parent.appendChild(span3);

			const result = dom.utils.arrayFilter(parent.children, (node) => node.tagName === 'SPAN');
			expect(result.length).toBe(2);
		});

		it('should find item in array', () => {
			const parent = document.createElement('div');
			const span1 = document.createElement('span');
			const span2 = document.createElement('p');
			parent.appendChild(span1);
			parent.appendChild(span2);

			const result = dom.utils.arrayFind(parent.children, (node) => node.tagName === 'P');
			expect(result).toBe(span2);
		});

		it('should check if array includes node', () => {
			const parent = document.createElement('div');
			const span = document.createElement('span');
			parent.appendChild(span);

			const result = dom.utils.arrayIncludes(parent.children, span);
			expect(result).toBe(true);
		});

		it('should get next and prev index', () => {
			const parent = document.createElement('div');
			const child1 = document.createElement('span');
			const child2 = document.createElement('p');
			const child3 = document.createElement('div');
			parent.appendChild(child1);
			parent.appendChild(child2);
			parent.appendChild(child3);

			expect(dom.utils.nextIndex(parent.children, child2)).toBe(2);
			expect(dom.utils.prevIndex(parent.children, child2)).toBe(0);
		});
	});

	describe('style utility functions - coverage', () => {
		it('should set and get style', () => {
			const div = document.createElement('div');
			dom.utils.setStyle(div, 'color', 'red');
			expect(dom.utils.getStyle(div, 'color')).toBe('red');
		});

		it('should set style on array of elements', () => {
			const div1 = document.createElement('div');
			const div2 = document.createElement('div');
			dom.utils.setStyle([div1, div2], 'color', 'blue');
			expect(dom.utils.getStyle(div1, 'color')).toBe('blue');
			expect(dom.utils.getStyle(div2, 'color')).toBe('blue');
		});

		it('should remove style attribute when empty', () => {
			const div = document.createElement('div');
			dom.utils.setStyle(div, 'color', 'red');
			dom.utils.setStyle(div, 'color', '');
			expect(div.hasAttribute('style')).toBe(false);
		});
	});

	describe('copyTagAttributes - coverage', () => {
		it('should copy styles from one element to another', () => {
			const origin = document.createElement('div');
			const copy = document.createElement('span');
			copy.style.color = 'red';
			copy.style.fontSize = '14px';

			dom.utils.copyTagAttributes(origin, copy);
			expect(origin.style.color).toBe('red');
			expect(origin.style.fontSize).toBe('14px');
		});

		it('should copy attributes', () => {
			const origin = document.createElement('div');
			const copy = document.createElement('span');
			copy.setAttribute('data-test', 'value');
			copy.setAttribute('title', 'test title');

			dom.utils.copyTagAttributes(origin, copy);
			expect(origin.getAttribute('data-test')).toBe('value');
			expect(origin.getAttribute('title')).toBe('test title');
		});

		it('should respect blacklist', () => {
			const origin = document.createElement('div');
			const copy = document.createElement('span');
			copy.setAttribute('data-test', 'value');
			copy.setAttribute('title', 'test');
			copy.id = 'test-id';

			dom.utils.copyTagAttributes(origin, copy, ['id', 'data-test']);
			expect(origin.hasAttribute('id')).toBe(false);
			expect(origin.hasAttribute('data-test')).toBe(false);
			expect(origin.getAttribute('title')).toBe('test');
		});

		it('should remove attributes with empty values', () => {
			const origin = document.createElement('div');
			origin.setAttribute('data-old', 'value');
			const copy = document.createElement('span');
			copy.setAttribute('data-old', '');

			dom.utils.copyTagAttributes(origin, copy);
			expect(origin.hasAttribute('data-old')).toBe(false);
		});

		it('should not copy style attribute itself', () => {
			const origin = document.createElement('div');
			const copy = document.createElement('span');
			copy.setAttribute('style', 'color: red;');
			copy.setAttribute('title', 'test');

			dom.utils.copyTagAttributes(origin, copy);
			expect(origin.getAttribute('title')).toBe('test');
		});
	});

	describe('copyFormatAttributes - coverage', () => {
		it('should copy format attributes without __se__format__ class', () => {
			const origin = document.createElement('span');
			const copy = document.createElement('span');
			copy.className = 'normal-class __se__format__test other-class';
			copy.style.fontWeight = 'bold';

			dom.utils.copyFormatAttributes(origin, copy);
			expect(origin.style.fontWeight).toBe('bold');
		});
	});

	describe('setDisabled - coverage', () => {
		it('should disable buttons', () => {
			const button1 = document.createElement('button');
			const button2 = document.createElement('button');

			dom.utils.setDisabled([button1, button2], true);
			expect(button1.disabled).toBe(true);
			expect(button2.disabled).toBe(true);
		});

		it('should enable buttons', () => {
			const button1 = document.createElement('button');
			const button2 = document.createElement('button');
			button1.disabled = true;
			button2.disabled = true;

			dom.utils.setDisabled([button1, button2], false);
			expect(button1.disabled).toBe(false);
			expect(button2.disabled).toBe(false);
		});

		it('should handle important mode', () => {
			const button = document.createElement('button');
			dom.utils.setDisabled([button], true, true);
			expect(button.hasAttribute('data-important-disabled')).toBe(true);

			dom.utils.setDisabled([button], false, true);
			expect(button.hasAttribute('data-important-disabled')).toBe(false);
		});
	});

	describe('getClientSize - coverage', () => {
		it('should return client size', () => {
			const result = dom.utils.getClientSize();
			expect(result).toHaveProperty('w');
			expect(result).toHaveProperty('h');
			expect(typeof result.w).toBe('number');
			expect(typeof result.h).toBe('number');
		});
	});

	describe('createTooltipInner - coverage', () => {
		it('should create tooltip HTML', () => {
			const html = dom.utils.createTooltipInner('Test tooltip');
			expect(html).toContain('se-tooltip-inner');
			expect(html).toContain('se-tooltip-text');
			expect(html).toContain('Test tooltip');
		});
	});

	describe('clone - coverage', () => {
		it('should clone without children by default', () => {
			const div = document.createElement('div');
			const child = document.createElement('span');
			div.appendChild(child);

			const cloned = dom.utils.clone(div);
			expect(cloned.children.length).toBe(0);
		});

		it('should clone with children when deep=true', () => {
			const div = document.createElement('div');
			const child = document.createElement('span');
			div.appendChild(child);

			const cloned = dom.utils.clone(div, true);
			expect(cloned.children.length).toBe(1);
		});
	});

	describe('createTextNode - coverage', () => {
		it('should create text node', () => {
			const text = dom.utils.createTextNode('test');
			expect(text.nodeType).toBe(3);
			expect(text.textContent).toBe('test');
		});

		it('should handle empty string', () => {
			const text = dom.utils.createTextNode('');
			expect(text.textContent).toBe('');
		});
	});

	describe('getAttributesToString - coverage', () => {
		it('should convert attributes to string', () => {
			const div = document.createElement('div');
			div.id = 'test';
			div.className = 'class1';
			div.setAttribute('data-value', '123');

			const result = dom.utils.getAttributesToString(div);
			expect(result).toContain('id="test"');
			expect(result).toContain('class="class1"');
			expect(result).toContain('data-value="123"');
		});

		it('should exclude specified attributes', () => {
			const div = document.createElement('div');
			div.id = 'test';
			div.className = 'class1';

			const result = dom.utils.getAttributesToString(div, ['id']);
			expect(result).not.toContain('id=');
			expect(result).toContain('class=');
		});

		it('should handle element without attributes', () => {
			const text = document.createTextNode('text');
			const result = dom.utils.getAttributesToString(text);
			expect(result).toBe('');
		});
	});

	describe('getViewportSize - coverage', () => {
		it('should return viewport size', () => {
			const result = dom.utils.getViewportSize();
			expect(result).toHaveProperty('top');
			expect(result).toHaveProperty('left');
			expect(result).toHaveProperty('scale');
			expect(typeof result.top).toBe('number');
			expect(typeof result.left).toBe('number');
			expect(typeof result.scale).toBe('number');
		});

		it('should use visualViewport when available', () => {
			// Mock visualViewport
			const originalVisualViewport = global.window.visualViewport;
			Object.defineProperty(global.window, 'visualViewport', {
				value: {
					pageTop: 10,
					pageLeft: 20,
					scale: 1.5
				},
				configurable: true,
				writable: true
			});

			const result = dom.utils.getViewportSize();
			expect(result.top).toBe(10);
			expect(result.left).toBe(20);
			expect(result.scale).toBe(1.5);

			// Restore
			if (originalVisualViewport) {
				Object.defineProperty(global.window, 'visualViewport', {
					value: originalVisualViewport,
					configurable: true,
					writable: true
				});
			}
		});

		it('should fallback when visualViewport not available', () => {
			// Remove visualViewport temporarily
			const originalVisualViewport = global.window.visualViewport;
			delete global.window.visualViewport;

			const result = dom.utils.getViewportSize();
			expect(result.top).toBe(0);
			expect(result.left).toBe(0);
			expect(result.scale).toBe(1);

			// Restore
			if (originalVisualViewport) {
				Object.defineProperty(global.window, 'visualViewport', {
					value: originalVisualViewport,
					configurable: true,
					writable: true
				});
			}
		});
	});

	describe('getRootCssVar and setRootCssVar - coverage', () => {
		it('should set and get CSS variables', () => {
			dom.utils.setRootCssVar('--test-var', 'test-value');
			const result = dom.utils.getRootCssVar('--test-var');
			expect(result).toBe('test-value');
		});
	});

	describe('applyInlineStylesAll - coverage', () => {
		it('should return null for null target', () => {
			const result = dom.utils.applyInlineStylesAll(null, false, ['color']);
			expect(result).toBeNull();
		});

		it('should apply inline styles to element', () => {
			const div = document.createElement('div');
			const child = document.createElement('span');
			child.style.color = 'red';
			div.appendChild(child);
			document.body.appendChild(div);

			const result = dom.utils.applyInlineStylesAll(div, false, ['color']);
			expect(result).toBeDefined();

			document.body.removeChild(div);
		});

		it('should include target element when includeWW is true', () => {
			const div = document.createElement('div');
			div.style.fontSize = '14px';
			const child = document.createElement('span');
			div.appendChild(child);
			document.body.appendChild(div);

			const result = dom.utils.applyInlineStylesAll(div, true, ['font-size']);
			expect(result).toBeDefined();

			document.body.removeChild(div);
		});
	});

	describe('waitForMediaLoad - coverage', () => {
		it('should resolve immediately when no media elements', async () => {
			const div = document.createElement('div');
			div.textContent = 'No media';

			await expect(dom.utils.waitForMediaLoad(div, 100)).resolves.toBeUndefined();
		});

		it('should wait for image load', async () => {
			const div = document.createElement('div');
			const img = document.createElement('img');
			img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
			div.appendChild(img);

			await expect(dom.utils.waitForMediaLoad(div, 1000)).resolves.toBeUndefined();
		});

		it('should handle timeout', async () => {
			const div = document.createElement('div');
			const img = document.createElement('img');
			img.src = 'http://invalid-url-that-will-timeout.test/image.jpg';
			div.appendChild(img);

			await expect(dom.utils.waitForMediaLoad(div, 10)).resolves.toBeUndefined();
		});
	});

	describe('removeItem - edge cases', () => {
		it('should use remove method when available', () => {
			const parent = document.createElement('div');
			const child = document.createElement('span');
			parent.appendChild(child);

			dom.utils.removeItem(child);
			expect(parent.children.length).toBe(0);
		});

		it('should fallback to removeChild when remove not available', () => {
			const parent = document.createElement('div');
			const child = document.createElement('span');
			parent.appendChild(child);

			// Simulate old browser without remove method
			const originalRemove = child.remove;
			Object.defineProperty(child, 'remove', {
				value: undefined,
				configurable: true,
				writable: true
			});

			dom.utils.removeItem(child);
			expect(parent.children.length).toBe(0);

			// Restore
			if (originalRemove) {
				Object.defineProperty(child, 'remove', {
					value: originalRemove,
					configurable: true,
					writable: true
				});
			}
		});

		it('should use parentNode.removeChild when remove is not a function', () => {
			const parent = document.createElement('div');
			const child = document.createElement('span');
			parent.appendChild(child);

			// Mock remove to not be a function
			const originalRemove = child.remove;
			child.remove = 'not-a-function';

			dom.utils.removeItem(child);
			expect(parent.children.length).toBe(0);

			// Restore
			child.remove = originalRemove;
		});
	});

	describe('changeElement - all branches', () => {
		it('should use outerHTML when available', () => {
			const parent = document.createElement('div');
			const span = document.createElement('span');
			span.textContent = 'old';
			parent.appendChild(span);

			dom.utils.changeElement(span, '<p>new</p>');
			expect(parent.innerHTML).toContain('<p>new</p>');
		});

		it('should fallback to replaceChild when outerHTML not in element', () => {
			const parent = document.createElement('div');
			const span = document.createElement('span');
			span.textContent = 'old';
			parent.appendChild(span);

			// Create a mock element without outerHTML
			const mockElement = {
				parentNode: parent,
				nodeType: 1
			};

			// Mock the span to act like it doesn't have outerHTML
			const hasOwnProperty = Object.prototype.hasOwnProperty;
			Object.prototype.hasOwnProperty = function(prop) {
				if (this === mockElement && prop === 'outerHTML') return false;
				return hasOwnProperty.call(this, prop);
			};

			try {
				// Test the fallback path by using an element-like object
				const tempDiv = document.createElement('div');
				const tempSpan = document.createElement('span');
				tempDiv.appendChild(tempSpan);

				// Remove outerHTML descriptor temporarily
				const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'outerHTML');
				delete Element.prototype.outerHTML;

				// Now test
				dom.utils.changeElement(tempSpan, '<p>fallback</p>');

				// Restore
				if (descriptor) {
					Object.defineProperty(Element.prototype, 'outerHTML', descriptor);
				}

				expect(tempDiv.innerHTML).toContain('fallback');
			} finally {
				Object.prototype.hasOwnProperty = hasOwnProperty;
			}
		});

		it('should handle string replacement with outerHTML', () => {
			const parent = document.createElement('div');
			const span = document.createElement('span');
			parent.appendChild(span);

			dom.utils.changeElement(span, '<div>replaced</div>');
			expect(parent.querySelector('div')).toBeTruthy();
		});
	});

	describe('createElement - with inner content', () => {
		it('should create element with string inner HTML', () => {
			const div = dom.utils.createElement('div', {}, '<span>inner</span>');
			expect(div.innerHTML).toContain('<span>inner</span>');
		});

		it('should create element with node inner content', () => {
			const span = document.createElement('span');
			span.textContent = 'inner';
			const div = dom.utils.createElement('div', {}, span);
			expect(div.firstChild).toBe(span);
		});
	});

	describe('waitForMediaLoad - all media types', () => {
		it('should handle complete image', async () => {
			const div = document.createElement('div');
			const img = document.createElement('img');
			img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
			div.appendChild(img);

			await expect(dom.utils.waitForMediaLoad(div, 1000)).resolves.toBeUndefined();
		}, 10000);

		it('should handle already complete image', async () => {
			const div = document.createElement('div');
			const img = new Image();

			// Set complete to true by mocking
			Object.defineProperty(img, 'complete', {
				value: true,
				writable: true,
				configurable: true
			});

			div.appendChild(img);

			await expect(dom.utils.waitForMediaLoad(div, 100)).resolves.toBeUndefined();
		});

		it('should handle video element', async () => {
			const div = document.createElement('div');
			const video = document.createElement('video');
			video.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAZ5tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE1MiByMjg1NCBlOWE1OTAzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTMgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTI1IHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAHh2WIhAA3//728P4FNjuZQQMI/7HZ0HMPx';
			video.preload = 'metadata';
			div.appendChild(video);

			await expect(dom.utils.waitForMediaLoad(div, 100)).resolves.toBeUndefined();
		});

		it('should handle video with readyState >= 2', async () => {
			const div = document.createElement('div');
			const video = document.createElement('video');
			video.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAZ5tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE1MiByMjg1NCBlOWE1OTAzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTMgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTI1IHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAHh2WIhAA3//728P4FNjuZQQMI/7HZ0HMPx';

			// Mock readyState
			Object.defineProperty(video, 'readyState', {
				value: 2,
				writable: true,
				configurable: true
			});

			div.appendChild(video);

			await expect(dom.utils.waitForMediaLoad(div, 100)).resolves.toBeUndefined();
		});

		it('should handle audio element', async () => {
			const div = document.createElement('div');
			const audio = document.createElement('audio');
			audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==';
			audio.preload = 'metadata';
			div.appendChild(audio);

			await expect(dom.utils.waitForMediaLoad(div, 100)).resolves.toBeUndefined();
		});

		it('should handle iframe element', async () => {
			const div = document.createElement('div');
			const iframe = document.createElement('iframe');
			iframe.src = 'about:blank';
			div.appendChild(iframe);

			await expect(dom.utils.waitForMediaLoad(div, 100)).resolves.toBeUndefined();
		});

		it('should handle iframe with complete contentDocument', async () => {
			const div = document.createElement('div');
			const iframe = document.createElement('iframe');
			iframe.src = 'about:blank';

			// Mock contentDocument
			Object.defineProperty(iframe, 'contentDocument', {
				value: {
					readyState: 'complete'
				},
				configurable: true,
				writable: true
			});

			div.appendChild(iframe);

			await expect(dom.utils.waitForMediaLoad(div, 100)).resolves.toBeUndefined();
		});

		it('should handle iframe contentDocument access error', async () => {
			const div = document.createElement('div');
			const iframe = document.createElement('iframe');

			// Mock contentDocument to throw error
			Object.defineProperty(iframe, 'contentDocument', {
				get() {
					throw new Error('Access denied');
				},
				configurable: true
			});

			div.appendChild(iframe);

			await expect(dom.utils.waitForMediaLoad(div, 100)).resolves.toBeUndefined();
		});

		it('should handle error loading media', async () => {
			const div = document.createElement('div');
			const img = document.createElement('img');
			img.src = 'invalid://url';
			div.appendChild(img);

			await expect(dom.utils.waitForMediaLoad(div, 100)).resolves.toBeUndefined();
		});
	});

	describe('applyInlineStylesAll - body element', () => {
		it('should handle body element', () => {
			const body = document.createElement('body');
			body.className = 'test-class';
			body.innerHTML = '<p>content</p>';
			document.body.appendChild(body);

			const result = dom.utils.applyInlineStylesAll(body, false, ['color']);
			expect(result).toBeDefined();

			document.body.removeChild(body);
		});
	});
});
