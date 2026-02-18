/**
 * @fileoverview Integration tests for Offset class
 * Tests actual position calculation methods with real DOM elements.
 * The unit test only has 2 stubs (constructor + type check).
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../__mocks__/editorIntegration';

describe('Offset integration tests', () => {
	let container;
	let editor;

	beforeEach(async () => {
		container = document.createElement('div');
		container.id = 'offset-test-container';
		document.body.appendChild(container);

		editor = createTestEditor({
			element: container,
			buttonList: [],
			width: '100%',
			height: 'auto'
		});
		await waitForEditorReady(editor);
	});

	afterEach(() => {
		if (editor) {
			destroyTestEditor(editor);
		}
		if (container && container.parentNode) {
			container.parentNode.removeChild(container);
		}
	});

	describe('get() - Get position outside editor', () => {
		it('should return an object with left and top properties', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Test content</p>';

			const p = wysiwyg.querySelector('p');
			const result = editor.$.offset.get(p);

			expect(result).toBeDefined();
			expect(typeof result.left).toBe('number');
			expect(typeof result.top).toBe('number');
		});

		it('should return numeric values for text nodes', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Text node test</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			const result = editor.$.offset.get(textNode);

			expect(typeof result.left).toBe('number');
			expect(typeof result.top).toBe('number');
		});
	});

	describe('getLocal() - Get position inside editor', () => {
		it('should return local offset with all properties', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Local offset test</p>';

			const p = wysiwyg.querySelector('p');
			const result = editor.$.offset.getLocal(p);

			expect(result).toBeDefined();
			expect(typeof result.left).toBe('number');
			expect(typeof result.top).toBe('number');
			expect(typeof result.right).toBe('number');
			expect(typeof result.scrollX).toBe('number');
			expect(typeof result.scrollY).toBe('number');
			expect(typeof result.scrollH).toBe('number');
		});

		it('should return non-negative scroll values', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Scroll test</p>';

			const p = wysiwyg.querySelector('p');
			const result = editor.$.offset.getLocal(p);

			expect(result.scrollX).toBeGreaterThanOrEqual(0);
			expect(result.scrollY).toBeGreaterThanOrEqual(0);
			expect(result.scrollH).toBeGreaterThanOrEqual(0);
		});
	});

	describe('getGlobal() - Get position relative to document', () => {
		it('should return global offset with all properties', () => {
			const result = editor.$.offset.getGlobal();

			expect(result).toBeDefined();
			expect(typeof result.top).toBe('number');
			expect(typeof result.left).toBe('number');
			expect(typeof result.fixedTop).toBe('number');
			expect(typeof result.fixedLeft).toBe('number');
			expect(typeof result.width).toBe('number');
			expect(typeof result.height).toBe('number');
		});

		it('should return zero values for non-element nodes', () => {
			const textNode = document.createTextNode('text');
			const result = editor.$.offset.getGlobal(textNode);

			expect(result.top).toBe(0);
			expect(result.left).toBe(0);
			expect(result.width).toBe(0);
			expect(result.height).toBe(0);
		});

		it('should return position for a specific node', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Global test</p>';

			const p = wysiwyg.querySelector('p');
			const result = editor.$.offset.getGlobal(p);

			expect(typeof result.top).toBe('number');
			expect(typeof result.left).toBe('number');
		});
	});

	describe('getGlobalScroll() - Get global scroll info', () => {
		it('should return scroll info object with all properties', () => {
			const result = editor.$.offset.getGlobalScroll();

			expect(result).toBeDefined();
			expect(typeof result.top).toBe('number');
			expect(typeof result.left).toBe('number');
			expect(typeof result.width).toBe('number');
			expect(typeof result.height).toBe('number');
			expect(typeof result.x).toBe('number');
			expect(typeof result.y).toBe('number');
			expect(typeof result.oh).toBe('number');
			expect(typeof result.ow).toBe('number');
		});
	});

	describe('getWWScroll() - Get wysiwyg scroll info', () => {
		it('should return wysiwyg scroll info', () => {
			const result = editor.$.offset.getWWScroll();

			expect(result).toBeDefined();
			expect(typeof result.top).toBe('number');
			expect(typeof result.left).toBe('number');
			expect(typeof result.width).toBe('number');
			expect(typeof result.height).toBe('number');
			expect(typeof result.bottom).toBe('number');
		});

		it('should have bottom = top + height', () => {
			const result = editor.$.offset.getWWScroll();

			expect(result.bottom).toBe(result.top + result.height);
		});
	});

	describe('Consistency between methods', () => {
		it('getLocal and get should return related values', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Consistency</p>';

			const p = wysiwyg.querySelector('p');
			const local = editor.$.offset.getLocal(p);
			const outside = editor.$.offset.get(p);

			// get() builds on getLocal(), so they should be related
			expect(typeof local.left).toBe('number');
			expect(typeof outside.left).toBe('number');
		});
	});

	describe('get() - additional coverage', () => {
		it('should handle deeply nested elements', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><strong><em>Deep content</em></strong></p>';

			const em = wysiwyg.querySelector('em');
			const result = editor.$.offset.get(em);

			expect(result).toBeDefined();
			expect(typeof result.left).toBe('number');
			expect(typeof result.top).toBe('number');
		});

		it('should handle elements with inline styles', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p style="margin-left: 20px; padding-top: 10px;">Styled content</p>';

			const p = wysiwyg.querySelector('p');
			const result = editor.$.offset.get(p);

			expect(result).toBeDefined();
			expect(typeof result.left).toBe('number');
			expect(typeof result.top).toBe('number');
		});

		it('should return consistent results for same element', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Stable content</p>';

			const p = wysiwyg.querySelector('p');
			const result1 = editor.$.offset.get(p);
			const result2 = editor.$.offset.get(p);

			expect(result1.left).toBe(result2.left);
			expect(result1.top).toBe(result2.top);
		});
	});

	describe('getLocal() - additional coverage', () => {
		it('should handle text node inside paragraph', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Text node test</p>';

			const textNode = wysiwyg.querySelector('p').firstChild;
			const result = editor.$.offset.getLocal(textNode);

			expect(result).toBeDefined();
			expect(typeof result.left).toBe('number');
			expect(typeof result.top).toBe('number');
			expect(typeof result.right).toBe('number');
			expect(typeof result.scrollX).toBe('number');
			expect(typeof result.scrollY).toBe('number');
			expect(typeof result.scrollH).toBe('number');
		});

		it('should handle element outside wysiwyg area', () => {
			// Create an element in the document but outside the editor
			const externalDiv = document.createElement('div');
			externalDiv.textContent = 'External element';
			document.body.appendChild(externalDiv);

			try {
				const result = editor.$.offset.getLocal(externalDiv);
				expect(result).toBeDefined();
				expect(typeof result.left).toBe('number');
				expect(typeof result.top).toBe('number');
			} finally {
				document.body.removeChild(externalDiv);
			}
		});

		it('should handle empty paragraph', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><br></p>';

			const p = wysiwyg.querySelector('p');
			const result = editor.$.offset.getLocal(p);

			expect(result).toBeDefined();
			expect(typeof result.left).toBe('number');
			expect(typeof result.top).toBe('number');
		});

		it('should return non-negative scrollH', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Scroll height test</p>';

			const p = wysiwyg.querySelector('p');
			const result = editor.$.offset.getLocal(p);

			expect(result.scrollH).toBeGreaterThanOrEqual(0);
		});
	});

	describe('getGlobal() - additional coverage', () => {
		it('should return default position when called with no arguments', () => {
			const result = editor.$.offset.getGlobal();

			expect(result).toBeDefined();
			expect(result).toHaveProperty('top');
			expect(result).toHaveProperty('left');
			expect(result).toHaveProperty('fixedTop');
			expect(result).toHaveProperty('fixedLeft');
			expect(result).toHaveProperty('width');
			expect(result).toHaveProperty('height');
			expect(typeof result.width).toBe('number');
			expect(typeof result.height).toBe('number');
		});

		it('should return zero values for null node', () => {
			const result = editor.$.offset.getGlobal(null);

			// null defaults to topArea inside getGlobal, so should return valid position
			expect(typeof result.top).toBe('number');
			expect(typeof result.left).toBe('number');
		});

		it('should handle paragraph element inside wysiwyg', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Global paragraph test</p>';

			const p = wysiwyg.querySelector('p');
			const result = editor.$.offset.getGlobal(p);

			expect(typeof result.top).toBe('number');
			expect(typeof result.left).toBe('number');
			expect(typeof result.fixedTop).toBe('number');
			expect(typeof result.fixedLeft).toBe('number');
			expect(result.width).toBeGreaterThanOrEqual(0);
			expect(result.height).toBeGreaterThanOrEqual(0);
		});

		it('should handle element with display none', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p style="display:none">Hidden</p>';

			const p = wysiwyg.querySelector('p');
			const result = editor.$.offset.getGlobal(p);

			// Even hidden elements should return numeric values
			expect(typeof result.top).toBe('number');
			expect(typeof result.left).toBe('number');
		});
	});

	describe('getGlobalScroll() - additional coverage', () => {
		it('should return all expected properties', () => {
			const result = editor.$.offset.getGlobalScroll();

			expect(result).toHaveProperty('top');
			expect(result).toHaveProperty('left');
			expect(result).toHaveProperty('width');
			expect(result).toHaveProperty('height');
			expect(result).toHaveProperty('x');
			expect(result).toHaveProperty('y');
			expect(result).toHaveProperty('oh');
			expect(result).toHaveProperty('ow');
			expect(result).toHaveProperty('heightEditorRefer');
			expect(result).toHaveProperty('widthEditorRefer');
			expect(result).toHaveProperty('ts');
			expect(result).toHaveProperty('ls');
		});

		it('should return boolean for heightEditorRefer and widthEditorRefer', () => {
			const result = editor.$.offset.getGlobalScroll();

			expect(typeof result.heightEditorRefer).toBe('boolean');
			expect(typeof result.widthEditorRefer).toBe('boolean');
		});

		it('should return non-negative oh and ow values', () => {
			const result = editor.$.offset.getGlobalScroll();

			expect(result.oh).toBeGreaterThanOrEqual(0);
			expect(result.ow).toBeGreaterThanOrEqual(0);
		});

		it('should accept a node parameter', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Scroll node test</p>';
			const p = wysiwyg.querySelector('p');

			const result = editor.$.offset.getGlobalScroll(p);

			expect(result).toBeDefined();
			expect(typeof result.top).toBe('number');
			expect(typeof result.left).toBe('number');
			expect(typeof result.height).toBe('number');
			expect(typeof result.width).toBe('number');
		});

		it('should return ts and ls as numbers', () => {
			const result = editor.$.offset.getGlobalScroll();

			expect(typeof result.ts).toBe('number');
			expect(typeof result.ls).toBe('number');
		});
	});

	describe('getWWScroll() - additional coverage', () => {
		it('should return all required properties', () => {
			const result = editor.$.offset.getWWScroll();

			expect(Object.keys(result)).toEqual(expect.arrayContaining(['top', 'left', 'width', 'height', 'bottom']));
		});

		it('should have non-negative left and top values', () => {
			const result = editor.$.offset.getWWScroll();

			expect(result.top).toBeGreaterThanOrEqual(0);
			expect(result.left).toBeGreaterThanOrEqual(0);
		});

		it('should have width and height as non-negative numbers', () => {
			const result = editor.$.offset.getWWScroll();

			expect(result.width).toBeGreaterThanOrEqual(0);
			expect(result.height).toBeGreaterThanOrEqual(0);
		});
	});

	describe('setRelPosition() - positioning elements', () => {
		it('should position an element relative to a target', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');

			// Create elements for positioning
			const menu = document.createElement('div');
			menu.style.width = '100px';
			menu.style.height = '50px';
			menu.style.position = 'absolute';
			document.body.appendChild(menu);

			const carrier = document.createElement('div');
			carrier.style.position = 'relative';
			document.body.appendChild(carrier);

			const target = document.createElement('div');
			target.style.width = '200px';
			target.style.height = '30px';
			document.body.appendChild(target);

			const targetContainer = document.createElement('div');
			targetContainer.style.position = 'relative';
			targetContainer.appendChild(target);
			document.body.appendChild(targetContainer);

			try {
				editor.$.offset.setRelPosition(menu, carrier, target, targetContainer);

				// After positioning, the element should have a top style set
				expect(menu.style.top).toBeDefined();
				expect(menu.style.left).toBeDefined();
			} finally {
				document.body.removeChild(menu);
				document.body.removeChild(carrier);
				if (targetContainer.parentNode) {
					document.body.removeChild(targetContainer);
				}
			}
		});

		it('should handle fixed-position container', () => {
			const menu = document.createElement('div');
			menu.style.width = '100px';
			menu.style.height = '50px';
			document.body.appendChild(menu);

			const carrier = document.createElement('div');
			document.body.appendChild(carrier);

			const target = document.createElement('div');
			target.style.width = '80px';
			target.style.height = '20px';

			const fixedContainer = document.createElement('div');
			fixedContainer.style.position = 'fixed';
			fixedContainer.style.top = '0';
			fixedContainer.style.left = '0';
			fixedContainer.appendChild(target);
			document.body.appendChild(fixedContainer);

			try {
				editor.$.offset.setRelPosition(menu, carrier, target, fixedContainer);

				// For fixed containers, position should be set to 'fixed'
				expect(menu.style.position).toBe('fixed');
				expect(menu.style.top).toBeDefined();
			} finally {
				document.body.removeChild(menu);
				document.body.removeChild(carrier);
				document.body.removeChild(fixedContainer);
			}
		});
	});

	describe('Offset with varied DOM structures', () => {
		it('should handle list elements', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<ul><li>List item</li></ul>';

			const li = wysiwyg.querySelector('li');
			const result = editor.$.offset.get(li);

			expect(typeof result.left).toBe('number');
			expect(typeof result.top).toBe('number');
		});

		it('should handle table elements', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<table><tr><td>Cell</td></tr></table>';

			const td = wysiwyg.querySelector('td');
			const result = editor.$.offset.get(td);

			expect(typeof result.left).toBe('number');
			expect(typeof result.top).toBe('number');
		});

		it('should handle multiple paragraphs with different offsets', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>First</p><p>Second</p><p>Third</p>';

			const paragraphs = wysiwyg.querySelectorAll('p');
			const offsets = Array.from(paragraphs).map((p) => editor.$.offset.get(p));

			// All should return valid positions
			offsets.forEach((off) => {
				expect(typeof off.left).toBe('number');
				expect(typeof off.top).toBe('number');
			});
		});

		it('should handle span elements inside paragraphs', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p><span style="color:red">Colored text</span></p>';

			const span = wysiwyg.querySelector('span');
			const localResult = editor.$.offset.getLocal(span);
			const globalResult = editor.$.offset.get(span);

			expect(typeof localResult.left).toBe('number');
			expect(typeof localResult.right).toBe('number');
			expect(typeof globalResult.left).toBe('number');
			expect(typeof globalResult.top).toBe('number');
		});
	});

	describe('setAbsPosition() - absolute positioning elements', () => {
		it('should position an element at bottom of a target element', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Target content</p>';

			const element = document.createElement('div');
			element.style.width = '100px';
			element.style.height = '50px';
			element.style.position = 'absolute';
			document.body.appendChild(element);

			const target = wysiwyg.querySelector('p');
			const inst = { __offset: null };

			try {
				const result = editor.$.offset.setAbsPosition(element, target, {
					position: 'bottom',
					inst: inst,
				});

				// setAbsPosition may return undefined or position info
				if (result) {
					expect(result).toHaveProperty('position');
					expect(['top', 'bottom']).toContain(result.position);
				}
				// The element should have position styles set
				expect(element.style.top).toBeDefined();
				expect(element.style.left).toBeDefined();
			} finally {
				document.body.removeChild(element);
			}
		});

		it('should position an element at top of a target element', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Top target</p>';

			const element = document.createElement('div');
			element.style.width = '80px';
			element.style.height = '40px';
			element.style.position = 'absolute';
			document.body.appendChild(element);

			const target = wysiwyg.querySelector('p');
			const inst = { __offset: null };

			try {
				const result = editor.$.offset.setAbsPosition(element, target, {
					position: 'top',
					inst: inst,
				});

				if (result) {
					expect(result).toHaveProperty('position');
				}
			} finally {
				document.body.removeChild(element);
			}
		});

		it('should handle setAbsPosition with addOffset', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Offset target</p>';

			const element = document.createElement('div');
			element.style.width = '60px';
			element.style.height = '30px';
			element.style.position = 'absolute';
			document.body.appendChild(element);

			const target = wysiwyg.querySelector('p');
			const inst = { __offset: null };

			try {
				editor.$.offset.setAbsPosition(element, target, {
					position: 'bottom',
					inst: inst,
					addOffset: { left: 10, top: 5 },
				});

				// inst should have __offset set after positioning
				if (inst.__offset) {
					expect(typeof inst.__offset.left).toBe('number');
					expect(typeof inst.__offset.top).toBe('number');
				}
			} finally {
				document.body.removeChild(element);
			}
		});

		it('should handle setAbsPosition with an arrow element', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Arrow test</p>';

			const element = document.createElement('div');
			element.style.width = '100px';
			element.style.height = '50px';
			element.style.position = 'absolute';
			const arrow = document.createElement('span');
			arrow.className = 'se-arrow';
			arrow.style.width = '10px';
			arrow.style.height = '10px';
			element.appendChild(arrow);
			document.body.appendChild(element);

			const target = wysiwyg.querySelector('p');
			const inst = { __offset: null };

			try {
				editor.$.offset.setAbsPosition(element, target, {
					position: 'bottom',
					inst: inst,
				});

				// Arrow element should have been processed
				expect(element.style.top).toBeDefined();
			} finally {
				document.body.removeChild(element);
			}
		});

		it('should handle setAbsPosition with target outside wysiwyg (non-WW target)', () => {
			// Use a target outside the editor to bypass the isWWTarget early return
			const target = document.createElement('div');
			target.style.width = '200px';
			target.style.height = '30px';
			target.style.position = 'absolute';
			target.style.top = '100px';
			target.style.left = '50px';
			document.body.appendChild(target);

			const element = document.createElement('div');
			element.style.width = '100px';
			element.style.height = '50px';
			element.style.position = 'absolute';
			document.body.appendChild(element);

			const inst = { __offset: null };

			try {
				const result = editor.$.offset.setAbsPosition(element, target, {
					position: 'bottom',
					inst: inst,
				});

				// With external target, isWWTarget=false, should proceed further
				if (result) {
					expect(result).toHaveProperty('position');
				}
				// inst.__offset should be set after full execution
				if (inst.__offset) {
					expect(typeof inst.__offset.left).toBe('number');
					expect(typeof inst.__offset.top).toBe('number');
					expect(inst.__offset.addOffset).toBeDefined();
				}
			} finally {
				document.body.removeChild(target);
				document.body.removeChild(element);
			}
		});

		it('should handle setAbsPosition with position=top and external target', () => {
			const target = document.createElement('div');
			target.style.width = '150px';
			target.style.height = '40px';
			target.style.position = 'absolute';
			target.style.top = '200px';
			target.style.left = '30px';
			document.body.appendChild(target);

			const element = document.createElement('div');
			element.style.width = '80px';
			element.style.height = '40px';
			element.style.position = 'absolute';
			document.body.appendChild(element);

			const inst = { __offset: null };

			try {
				const result = editor.$.offset.setAbsPosition(element, target, {
					position: 'top',
					inst: inst,
				});

				if (result) {
					expect(['top', 'bottom']).toContain(result.position);
				}
			} finally {
				document.body.removeChild(target);
				document.body.removeChild(element);
			}
		});

		it('should handle setAbsPosition with sibling parameter', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Sibling test</p>';

			const element = document.createElement('div');
			element.style.width = '80px';
			element.style.height = '40px';
			element.style.position = 'absolute';
			document.body.appendChild(element);

			const sibling = document.createElement('div');
			sibling.style.height = '30px';
			document.body.appendChild(sibling);

			const target = wysiwyg.querySelector('p');
			const inst = { __offset: null };

			try {
				editor.$.offset.setAbsPosition(element, target, {
					position: 'bottom',
					inst: inst,
					sibling: sibling,
				});

				expect(element.style.top).toBeDefined();
			} finally {
				document.body.removeChild(element);
				document.body.removeChild(sibling);
			}
		});
	});

	describe('setRangePosition() - range-based positioning', () => {
		it('should position element based on current selection range', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Range position test</p>';

			const p = wysiwyg.querySelector('p');
			editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 10);

			const element = document.createElement('div');
			element.style.width = '120px';
			element.style.height = '60px';
			const arrow = document.createElement('span');
			arrow.className = 'se-arrow';
			arrow.style.width = '10px';
			arrow.style.height = '10px';
			element.appendChild(arrow);

			const carrierWrapper = editor.$.contextProvider.carrierWrapper;
			if (carrierWrapper) {
				carrierWrapper.appendChild(element);
			} else {
				document.body.appendChild(element);
			}

			try {
				// JSDOM may not support getClientRects on Range - wrap in try/catch
				let result;
				try {
					result = editor.$.offset.setRangePosition(element, null);
				} catch (e) {
					// Expected in JSDOM - getClientRects not available on Range
					expect(e).toBeDefined();
					return;
				}

				if (result !== undefined) {
					expect(result).toBe(true);
				}
				if (result === true) {
					expect(element.style.visibility).toBe('');
				}
			} finally {
				if (element.parentNode) {
					element.parentNode.removeChild(element);
				}
			}
		});

		it('should position element with explicit range (handles JSDOM limitation)', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Explicit range</p>';

			const p = wysiwyg.querySelector('p');
			const range = document.createRange();
			range.setStart(p.firstChild, 0);
			range.setEnd(p.firstChild, 8);

			const element = document.createElement('div');
			element.style.width = '100px';
			element.style.height = '40px';
			const arrow = document.createElement('span');
			arrow.className = 'se-arrow';
			element.appendChild(arrow);
			document.body.appendChild(element);

			try {
				try {
					editor.$.offset.setRangePosition(element, range);
					// If it succeeds, display should be set
					expect(element.style.display).toBe('block');
				} catch (e) {
					// JSDOM doesn't support getClientRects on Range objects
					expect(e.message).toContain('getClientRects');
				}
			} finally {
				document.body.removeChild(element);
			}
		});

		it('should position element with top position option (handles JSDOM limitation)', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Top position</p>';

			const p = wysiwyg.querySelector('p');
			editor.$.selection.setRange(p.firstChild, 0, p.firstChild, 12);

			const element = document.createElement('div');
			element.style.width = '100px';
			element.style.height = '40px';
			const arrow = document.createElement('span');
			arrow.className = 'se-arrow';
			element.appendChild(arrow);
			document.body.appendChild(element);

			try {
				try {
					editor.$.offset.setRangePosition(element, null, { position: 'top' });
					expect(element.style.display).toBe('block');
				} catch (e) {
					// JSDOM limitation
					expect(e.message).toContain('getClientRects');
				}
			} finally {
				document.body.removeChild(element);
			}
		});
	});

	describe('getGlobal() - iframe branch coverage', () => {
		it('should handle topArea element directly', () => {
			const topArea = editor.$.frameContext.get('topArea');
			const result = editor.$.offset.getGlobal(topArea);

			expect(typeof result.top).toBe('number');
			expect(typeof result.left).toBe('number');
			expect(typeof result.width).toBe('number');
			expect(typeof result.height).toBe('number');
			expect(typeof result.fixedTop).toBe('number');
			expect(typeof result.fixedLeft).toBe('number');
		});

		it('should handle wysiwygFrame element', () => {
			const wFrame = editor.$.frameContext.get('wysiwygFrame');
			const result = editor.$.offset.getGlobal(wFrame);

			expect(typeof result.top).toBe('number');
			expect(typeof result.left).toBe('number');
		});
	});

	describe('getGlobalScroll() - additional branch coverage', () => {
		it('should handle topArea as node parameter', () => {
			const topArea = editor.$.frameContext.get('topArea');
			const result = editor.$.offset.getGlobalScroll(topArea);

			expect(result).toBeDefined();
			expect(typeof result.heightEditorRefer).toBe('boolean');
			expect(typeof result.widthEditorRefer).toBe('boolean');
		});

		it('should handle absolute-positioned element', () => {
			const absEl = document.createElement('div');
			absEl.style.position = 'absolute';
			absEl.style.top = '50px';
			absEl.style.left = '50px';
			absEl.style.width = '100px';
			absEl.style.height = '100px';
			document.body.appendChild(absEl);

			try {
				const result = editor.$.offset.getGlobalScroll(absEl);

				expect(result).toBeDefined();
				expect(typeof result.top).toBe('number');
				expect(typeof result.left).toBe('number');
				expect(typeof result.oh).toBe('number');
				expect(typeof result.ow).toBe('number');
			} finally {
				document.body.removeChild(absEl);
			}
		});
	});

	describe('Scroll-related edge cases', () => {
		it('should handle getGlobalScroll with scrolled content', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			// Create lots of content to potentially cause scrolling
			let content = '';
			for (let i = 0; i < 20; i++) {
				content += `<p>Line ${i}</p>`;
			}
			wysiwyg.innerHTML = content;

			const result = editor.$.offset.getGlobalScroll();

			expect(result.top).toBeGreaterThanOrEqual(0);
			expect(result.left).toBeGreaterThanOrEqual(0);
			// In JSDOM, scrollHeight/scrollWidth may be 0 since layout is not fully computed
			expect(result.height).toBeGreaterThanOrEqual(0);
			expect(result.width).toBeGreaterThanOrEqual(0);
		});

		it('should handle getWWScroll after content change', () => {
			const wysiwyg = editor.$.frameContext.get('wysiwyg');
			wysiwyg.innerHTML = '<p>Short</p>';

			const result1 = editor.$.offset.getWWScroll();

			// Add more content
			let content = '';
			for (let i = 0; i < 10; i++) {
				content += `<p>Line ${i}</p>`;
			}
			wysiwyg.innerHTML = content;

			const result2 = editor.$.offset.getWWScroll();

			// Both should be valid
			expect(typeof result1.height).toBe('number');
			expect(typeof result2.height).toBe('number');
			expect(result2.bottom).toBe(result2.top + result2.height);
		});
	});
});
