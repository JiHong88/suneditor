import { dom } from '../../../src/helper';

describe('dom.utils helper', () => {
	describe('clone', () => {
		it('should clone element without children by default', () => {
			const div = document.createElement('div');
			div.innerHTML = '<p>Hello</p>';
			div.className = 'test';

			const cloned = dom.utils.clone(div);
			expect(cloned.tagName).toBe('DIV');
			expect(cloned.className).toBe('test');
			expect(cloned.children.length).toBe(0); // shallow clone
		});

		it('should clone element with children when deep=true', () => {
			const div = document.createElement('div');
			div.innerHTML = '<p>Hello</p>';
			div.className = 'test';

			const cloned = dom.utils.clone(div, true);
			expect(cloned.tagName).toBe('DIV');
			expect(cloned.className).toBe('test');
			expect(cloned.children.length).toBe(1); // deep clone
			expect(cloned.firstElementChild.tagName).toBe('P');
		});
	});

	describe('createElement', () => {
		it('should create element with tag name', () => {
			const div = dom.utils.createElement('div');
			expect(div.tagName).toBe('DIV');
		});

		it('should create element with attributes', () => {
			const div = dom.utils.createElement('div', {
				id: 'test-id',
				class: 'test-class',
				'data-value': '123'
			});

			expect(div.id).toBe('test-id');
			expect(div.className).toBe('test-class');
			expect(div.getAttribute('data-value')).toBe('123');
		});

		it('should create element with HTML inner content', () => {
			const div = dom.utils.createElement('div', null, '<p>Hello</p>');
			expect(div.innerHTML).toBe('<p>Hello</p>');
		});

		it('should create element with node inner content', () => {
			const inner = document.createElement('span');
			inner.textContent = 'Hello';
			const div = dom.utils.createElement('div', null, inner);

			expect(div.firstChild).toBe(inner);
		});

		it('should skip undefined and null attributes', () => {
			const div = dom.utils.createElement('div', {
				id: 'test',
				class: undefined,
				title: null,
				'data-value': ''
			});

			expect(div.id).toBe('test');
			expect(div.hasAttribute('class')).toBe(false);
			expect(div.hasAttribute('title')).toBe(false);
			expect(div.getAttribute('data-value')).toBe('');
		});
	});

	describe('createTextNode', () => {
		it('should create text node with content', () => {
			const textNode = dom.utils.createTextNode('Hello World');
			expect(textNode.nodeType).toBe(3); // TEXT_NODE
			expect(textNode.textContent).toBe('Hello World');
		});

		it('should handle empty string', () => {
			const textNode = dom.utils.createTextNode('');
			expect(textNode.textContent).toBe('');
		});

		it('should handle null input', () => {
			const textNode = dom.utils.createTextNode(null);
			expect(textNode.textContent).toBe('');
		});
	});

	describe('getAttributesToString', () => {
		it('should return attributes as string', () => {
			const div = document.createElement('div');
			div.id = 'test';
			div.className = 'example';

			const result = dom.utils.getAttributesToString(div);
			expect(result).toContain('id="test"');
			expect(result).toContain('class="example"');
		});

		it('should exclude specified attributes', () => {
			const div = document.createElement('div');
			div.id = 'test';
			div.className = 'example';
			div.setAttribute('data-value', '123');

			const result = dom.utils.getAttributesToString(div, ['class', 'data-value']);
			expect(result).toContain('id="test"');
			expect(result).not.toContain('class=');
			expect(result).not.toContain('data-value=');
		});

		it('should return empty string for elements without attributes', () => {
			const div = document.createElement('div');
			expect(dom.utils.getAttributesToString(div)).toBe('');
		});
	});

	describe('arrayFilter', () => {
		it('should filter array based on validation function', () => {
			const div1 = document.createElement('div');
			const div2 = document.createElement('div');
			const span = document.createElement('span');
			const array = [div1, span, div2];

			const result = dom.utils.arrayFilter(array, (node) => node.tagName === 'DIV');
			expect(result.length).toBe(2);
			expect(result).toContain(div1);
			expect(result).toContain(div2);
			expect(result).not.toContain(span);
		});

		it('should return all items when no validation provided', () => {
			const array = [document.createElement('div'), document.createElement('span')];
			const result = dom.utils.arrayFilter(array);
			expect(result.length).toBe(2);
		});

		it('should return null for empty or null array', () => {
			expect(dom.utils.arrayFilter([])).toBeNull();
			expect(dom.utils.arrayFilter(null)).toBeNull();
		});
	});

	describe('arrayFind', () => {
		it('should find first matching element', () => {
			const div = document.createElement('div');
			const span1 = document.createElement('span');
			const span2 = document.createElement('span');
			const array = [div, span1, span2];

			const result = dom.utils.arrayFind(array, (node) => node.tagName === 'SPAN');
			expect(result).toBe(span1);
		});

		it('should return null when no match found', () => {
			const array = [document.createElement('div')];
			const result = dom.utils.arrayFind(array, (node) => node.tagName === 'SPAN');
			expect(result).toBeNull();
		});
	});

	describe('arrayIncludes', () => {
		it('should return true if array contains element', () => {
			const div = document.createElement('div');
			const span = document.createElement('span');
			const array = [div, span];

			expect(dom.utils.arrayIncludes(array, div)).toBe(true);
			expect(dom.utils.arrayIncludes(array, span)).toBe(true);
		});

		it('should return false if array does not contain element', () => {
			const div = document.createElement('div');
			const span = document.createElement('span');
			const p = document.createElement('p');
			const array = [div, span];

			expect(dom.utils.arrayIncludes(array, p)).toBe(false);
		});
	});

	describe('getArrayIndex', () => {
		it('should return correct index', () => {
			const div = document.createElement('div');
			const span = document.createElement('span');
			const p = document.createElement('p');
			const array = [div, span, p];

			expect(dom.utils.getArrayIndex(array, div)).toBe(0);
			expect(dom.utils.getArrayIndex(array, span)).toBe(1);
			expect(dom.utils.getArrayIndex(array, p)).toBe(2);
		});

		it('should return -1 for non-existent element', () => {
			const array = [document.createElement('div')];
			const span = document.createElement('span');
			expect(dom.utils.getArrayIndex(array, span)).toBe(-1);
		});
	});

	describe('nextIndex', () => {
		it('should return next index', () => {
			const div = document.createElement('div');
			const span = document.createElement('span');
			const array = [div, span];

			expect(dom.utils.nextIndex(array, div)).toBe(1);
		});

		it('should return -1 for non-existent element', () => {
			const array = [document.createElement('div')];
			const span = document.createElement('span');
			expect(dom.utils.nextIndex(array, span)).toBe(-1);
		});
	});

	describe('prevIndex', () => {
		it('should return previous index', () => {
			const div = document.createElement('div');
			const span = document.createElement('span');
			const array = [div, span];

			expect(dom.utils.prevIndex(array, span)).toBe(0);
		});

		it('should return -1 for non-existent element', () => {
			const array = [document.createElement('div')];
			const span = document.createElement('span');
			expect(dom.utils.prevIndex(array, span)).toBe(-1);
		});
	});

	describe('removeItem', () => {
		it('should remove element using remove method', () => {
			const parent = document.createElement('div');
			const child = document.createElement('span');
			parent.appendChild(child);

			dom.utils.removeItem(child);
			expect(parent.children.length).toBe(0);
		});

		it('should handle null element gracefully', () => {
			expect(() => dom.utils.removeItem(null)).not.toThrow();
		});

        it('should fallback to parentNode.removeChild if remove is not available', () => {
            const parent = document.createElement('div');
            const child = document.createElement('span');
            parent.appendChild(child);
            
            // Mock removing 'remove' method
            child.remove = undefined;
            
            dom.utils.removeItem(child);
            expect(parent.children.length).toBe(0);
        });
	});

	describe('changeElement', () => {
		it('should replace element with HTML string', () => {
			const parent = document.createElement('div');
			const oldElement = document.createElement('span');
			parent.appendChild(oldElement);

			dom.utils.changeElement(oldElement, '<p>New content</p>');
			expect(parent.firstElementChild.tagName).toBe('P');
			expect(parent.firstElementChild.textContent).toBe('New content');
		});

		it('should replace element with node', () => {
			const parent = document.createElement('div');
			const oldElement = document.createElement('span');
			const newElement = document.createElement('p');
			parent.appendChild(oldElement);

			dom.utils.changeElement(oldElement, newElement);
			expect(parent.firstChild).toBe(newElement);
		});

		it('should handle null element gracefully', () => {
			expect(() => dom.utils.changeElement(null, '<p>test</p>')).not.toThrow();
		});
	});

	describe('changeTxt', () => {
		it('should change text content', () => {
			const div = document.createElement('div');
			div.textContent = 'old text';

			dom.utils.changeTxt(div, 'new text');
			expect(div.textContent).toBe('new text');
		});

		it('should handle null node or text gracefully', () => {
			const div = document.createElement('div');
			expect(() => dom.utils.changeTxt(null, 'text')).not.toThrow();
			expect(() => dom.utils.changeTxt(div, null)).not.toThrow();
		});
	});

	describe('setStyle', () => {
		it('should set style on single element', () => {
			const div = document.createElement('div');
			dom.utils.setStyle(div, 'color', 'red');
			expect(div.style.color).toBe('red');
		});

		it('should set style on array of elements', () => {
			const div1 = document.createElement('div');
			const div2 = document.createElement('div');

			dom.utils.setStyle([div1, div2], 'fontSize', '12px');
			expect(div1.style.fontSize).toBe('12px');
			expect(div2.style.fontSize).toBe('12px');
		});

		it('should remove style attribute when no styles remain', () => {
			const div = document.createElement('div');
			div.style.color = 'red';
			dom.utils.setStyle(div, 'color', '');
			expect(div.style.length).toBe(0);
		});
	});

	describe('getStyle', () => {
		it('should get style value from element', () => {
			const div = document.createElement('div');
			div.style.color = 'red';

			expect(dom.utils.getStyle(div, 'color')).toBe('red');
		});

		it('should return undefined for non-element nodes', () => {
			const textNode = document.createTextNode('text');
			expect(dom.utils.getStyle(textNode, 'color')).toBeUndefined();
		});

		it('should return undefined for null element', () => {
			expect(dom.utils.getStyle(null, 'color')).toBeUndefined();
		});
	});

	describe('setDisabled', () => {
		it('should set disabled state on buttons', () => {
			const button1 = document.createElement('button');
			const button2 = document.createElement('input');
			button2.type = 'button';

			dom.utils.setDisabled([button1, button2], true);
			expect(button1.disabled).toBe(true);
			expect(button2.disabled).toBe(true);

			dom.utils.setDisabled([button1, button2], false);
			expect(button1.disabled).toBe(false);
			expect(button2.disabled).toBe(false);
		});

		it('should handle important disabled elements', () => {
			const button = document.createElement('button');
			button.setAttribute('data-important-disabled', '');

			dom.utils.setDisabled([button], true);
			expect(button.disabled).toBe(false); // Should not disable important buttons

			dom.utils.setDisabled([button], true, true); // With important flag
			expect(button.disabled).toBe(true);
		});
	});

	describe('copyTagAttributes', () => {
		it('should copy attributes and styles to another element', () => {
			const source = document.createElement('div');
			source.id = 'src';
			source.className = 'my-class';
			source.style.color = 'red';
			source.setAttribute('data-test', '123');

			const target = document.createElement('p');

			dom.utils.copyTagAttributes(target, source);

			expect(target.id).toBe('src');
			expect(target.className).toBe('my-class');
			expect(target.style.color).toBe('red');
			expect(target.getAttribute('data-test')).toBe('123');
		});

		it('should respect blacklist and not copy those attributes', () => {
			const source = document.createElement('div');
			source.id = 'src';
			source.className = 'my-class';
			source.setAttribute('data-ignore', 'true');

			const target = document.createElement('p');

			dom.utils.copyTagAttributes(target, source, ['id', 'data-ignore']);

			expect(target.id).not.toBe('src'); // should not copy
			expect(target.className).toBe('my-class');
			expect(target.hasAttribute('data-ignore')).toBe(false);
		});
	});

	describe('copyFormatAttributes', () => {
		it('should copy format attributes but exclude __se__format__ classes', () => {
			const source = document.createElement('div');
			source.className = 'my-class __se__format__bold';
			source.style.fontWeight = 'bold';

			const target = document.createElement('p');

			dom.utils.copyFormatAttributes(target, source);

			expect(target.className.trim()).toBe('my-class'); // __se__format__ removed
			expect(target.style.fontWeight).toBe('bold');
		});
	});

	describe('Class Manipulation', () => {
		const div = document.createElement('div');

		beforeEach(() => {
			div.className = '';
		});

		it('addClass should add single and multiple classes', () => {
			dom.utils.addClass(div, 'class1');
			expect(div.classList.contains('class1')).toBe(true);

			dom.utils.addClass(div, 'class2|class3');
			expect(div.classList.contains('class2')).toBe(true);
			expect(div.classList.contains('class3')).toBe(true);
		});

		it('removeClass should remove single and multiple classes', () => {
			div.className = 'class1 class2 class3';
			dom.utils.removeClass(div, 'class1');
			expect(div.classList.contains('class1')).toBe(false);
			expect(div.classList.contains('class2')).toBe(true);

			dom.utils.removeClass(div, 'class2|class3');
			expect(div.classList.contains('class2')).toBe(false);
			expect(div.classList.contains('class3')).toBe(false);
		});

		it('toggleClass should toggle classes', () => {
			dom.utils.toggleClass(div, 'active');
			expect(div.classList.contains('active')).toBe(true);

			dom.utils.toggleClass(div, 'active');
			expect(div.classList.contains('active')).toBe(false);
		});

		it('hasClass should check class existence', () => {
			div.className = 'foo bar';
			expect(dom.utils.hasClass(div, 'foo')).toBe(true);
			expect(dom.utils.hasClass(div, 'baz')).toBe(false);
		});

		it('flashClass should add and remove class after duration', (done) => {
			dom.utils.flashClass(div, 'flash', 10);
			expect(div.classList.contains('flash')).toBe(true);

			setTimeout(() => {
				expect(div.classList.contains('flash')).toBe(false);
				done();
			}, 20);
		});
	});

	describe('applyInlineStylesAll', () => {
		it('should apply computed styles to element and children', () => {
			const container = document.createElement('div');
			container.style.color = 'red';
			const child = document.createElement('p');
			child.style.fontSize = '20px';
			container.appendChild(child);
			document.body.appendChild(container); // Needs to be in DOM for computed styles

			const processed = dom.utils.applyInlineStylesAll(container, true, ['color', 'font-size']);

			// It returns a cloned node.
			expect(processed).not.toBe(container);
			// Computed style converts 'red' to 'rgb(255, 0, 0)'
			expect(processed.style.color).toBe('rgb(255, 0, 0)');
			expect(processed.firstElementChild.style.fontSize).toBe('20px');

			document.body.removeChild(container);
		});

        it('should handle body element copying', () => {
             const body = document.createElement('body');
             body.style.backgroundColor = 'white';
             document.body.appendChild(body);
             
             const processed = dom.utils.applyInlineStylesAll(body, true, ['background-color']);
             // Should return a DIV wrapping content
             expect(processed.tagName).toBe('DIV');
             expect(processed.style.backgroundColor).toBe('rgb(255, 255, 255)');
             
             document.body.removeChild(body);
        });
	});

	describe('waitForMediaLoad', () => {
		it('should resolve immediately if no media elements', async () => {
			const div = document.createElement('div');
			await expect(dom.utils.waitForMediaLoad(div)).resolves.not.toThrow();
		});

		it('should resolve when images are loaded', async () => {
			const div = document.createElement('div');
			const img = document.createElement('img');
			// Mock complete
			Object.defineProperty(img, 'complete', { value: true });
			div.appendChild(img);

			await expect(dom.utils.waitForMediaLoad(div)).resolves.not.toThrow();
		});
        
        it('should resolve when iframes are loaded', async () => {
            const div = document.createElement('div');
            const iframe = document.createElement('iframe');
            // Mock contentDocument readyState
            const mockDoc = { readyState: 'complete' };
            Object.defineProperty(iframe, 'contentDocument', { value: mockDoc });
            div.appendChild(iframe);
            
            await expect(dom.utils.waitForMediaLoad(div)).resolves.not.toThrow();
        });

		// Complex Async Test: Real load event simulation
		it('should wait for load event if not complete', (done) => {
			const div = document.createElement('div');
			const img = document.createElement('img');
			// Mock complete = false
			Object.defineProperty(img, 'complete', { value: false });
			div.appendChild(img);

			let resolved = false;
			dom.utils.waitForMediaLoad(div).then(() => {
				resolved = true;
				expect(resolved).toBe(true);
				done();
			});

			// Simulate load
			setTimeout(() => {
				img.dispatchEvent(new Event('load'));
			}, 50);
		});
	});
    
    describe('CSS Variables', () => {
        it('should get and set root CSS variables', () => {
            const key = '--test-var';
            const value = '10px';
            
            dom.utils.setRootCssVar(key, value);
            // JSDOM might not fully support CSS variables inheritance but style property should be set
            expect(dom.utils.getRootCssVar(key)).toBe(value);
        });
    });
    
    describe('createTooltipInner', () => {
        it('should create tooltip html structure', () => {
             const html = dom.utils.createTooltipInner('Test');
             expect(html).toContain('se-tooltip-inner');
             expect(html).toContain('se-tooltip-text');
             expect(html).toContain('Test');
        });
    });
    
    describe('utils misc', () => {
        it('getClientSize should return width/height', () => {
            const size = dom.utils.getClientSize();
            expect(size.w).toBeDefined();
            expect(size.h).toBeDefined();
        });
        
    });
});
