/**
 * @fileoverview Unit tests for keydown effects registry (sample tests)
 */

import keydownEffects from '../../../../../src/core/event/effects/keydown.registry';

describe('Keydown Effects Registry', () => {
	let mockPorts;
	let mockCtx;
	let effContext;

	beforeEach(() => {
		// Polyfill innerText for JSDOM
		if (!('innerText' in Element.prototype)) {
			Object.defineProperty(Element.prototype, 'innerText', {
				get: function () {
					return this.textContent;
				},
				configurable: true
			});
		}

		mockPorts = {
			editor: {
				_nativeFocus: jest.fn()
			},
			selection: {
				getRange: jest.fn(() => document.createRange()),
				setRange: jest.fn()
			},
			format: {
				getLine: jest.fn(),
				getLines: jest.fn(() => []),
				getBlock: jest.fn(() => null),
				isLine: jest.fn(() => false),
				removeBlock: jest.fn(),
				addLine: jest.fn(() => {
					const el = document.createElement('p');
					el.innerHTML = '<br>';
					return el;
				})
			},
			listFormat: {
				applyNested: jest.fn((cells, shift) => {
					// Return a range object as expected
					const node = cells[0] || document.createTextNode('');
					return { sc: node, so: 0, ec: node, eo: 0 };
				})
			},
			component: {
				select: jest.fn(),
				deselect: jest.fn(),
				get: jest.fn(() => null),
				is: jest.fn(() => false)
			},
			html: {
				remove: jest.fn(() => ({
					commonCon: document.createTextNode(''),
					container: document.createTextNode('')
				})),
				insert: jest.fn(),
				insertNode: jest.fn()
			},
			history: {
				push: jest.fn()
			},
			nodeTransform: {
				removeAllParents: jest.fn(),
				split: jest.fn()
			},
			hideToolbar: jest.fn(),
			setOnShortcutKey: jest.fn(),
			enterScrollTo: jest.fn(),
			enterPrevent: jest.fn()
		};

		mockCtx = {
			e: {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			},
			fc: new Map([
				['wysiwyg', document.createElement('div')]
			]),
			options: new Map([
				['defaultLine', 'P']
			]),
			shift: false
		};

		effContext = {
			ports: mockPorts,
			ctx: mockCtx
		};
	});

	describe('Registry structure', () => {
		it('should export an object with effect functions', () => {
			expect(typeof keydownEffects).toBe('object');
			expect(Object.keys(keydownEffects).length).toBeGreaterThan(0);
		});

		it('should have keydown-specific effect keys', () => {
			const keys = Object.keys(keydownEffects);
			expect(keys.length).toBeGreaterThan(20);
		});

		it('should have all effects as functions', () => {
			Object.keys(keydownEffects).forEach(key => {
				expect(typeof keydownEffects[key]).toBe('function');
			});
		});
	});

	describe('Delete effects', () => {
		it('should execute del.format.removeAndMove', () => {
			const container = document.createTextNode('text');
			const formatEl = document.createElement('p');
			const parent = document.createElement('div');
			parent.appendChild(formatEl);

			keydownEffects['del.format.removeAndMove'](effContext, { container, formatEl });

			expect(mockPorts.html.remove).toHaveBeenCalled();
		});

		it('should execute delete.list.removeNested', () => {
			// Create a proper DOM structure for the range
			const div = document.createElement('div');
			const textNode1 = document.createTextNode('text1');
			const textNode2 = document.createTextNode('text2');
			div.appendChild(textNode1);
			div.appendChild(textNode2);

			const range = document.createRange();
			range.setStart(textNode1, 0);
			range.setEnd(textNode2, 0); // Different containers to trigger html.remove

			const formatEl = document.createElement('li');
			const nestedUl = document.createElement('ul');
			const nestedLi = document.createElement('li');
			nestedLi.appendChild(document.createTextNode('nested'));
			nestedUl.appendChild(nestedLi);
			formatEl.appendChild(nestedUl); // Add nested list to formatEl

			const rangeEl = document.createElement('ul');
			const parent = document.createElement('ul');
			parent.appendChild(rangeEl);

			keydownEffects['delete.list.removeNested'](effContext, { range, formatEl, rangeEl });

			// html.remove is called when startContainer !== endContainer
			expect(mockPorts.html.remove).toHaveBeenCalled();
		});

		it('should execute delete.component.select', () => {
			const formatEl = document.createElement('p');
			const fileComponentInfo = {
				target: document.createElement('img'),
				pluginName: 'image',
				container: document.createElement('div')
			};

			keydownEffects['delete.component.select'](effContext, { formatEl, fileComponentInfo });

			expect(mockPorts.component.select).toHaveBeenCalled();
		});

		it('should execute delete.component.selectNext', () => {
			const formatEl = document.createElement('p');
			const nextEl = document.createElement('img');

			mockPorts.component.get.mockReturnValue({
				target: nextEl,
				pluginName: 'image'
			});

			keydownEffects['delete.component.selectNext'](effContext, { formatEl, nextEl });

			expect(mockCtx.e.stopPropagation).toHaveBeenCalled();
			expect(mockPorts.component.get).toHaveBeenCalled();
		});
	});

	describe('Backspace effects', () => {
		it('should execute backspace.format.maintain', () => {
			const formatEl = document.createElement('p');
			formatEl.innerHTML = '<br>';
			mockCtx.fc.get('wysiwyg').appendChild(formatEl);

			keydownEffects['backspace.format.maintain'](effContext, { formatEl });

			expect(mockCtx.fc.get('wysiwyg').children.length).toBeGreaterThan(0);
		});

		it('should execute backspace.format.maintain with non-default line', () => {
			const formatEl = document.createElement('h1');
			formatEl.innerHTML = '<br>';
			const parent = document.createElement('div');
			parent.appendChild(formatEl);

			keydownEffects['backspace.format.maintain'](effContext, { formatEl });

			// Replaces with default line
			expect(formatEl.parentNode).toBe(null);
		});

		it('should execute backspace.component.select', () => {
			const selectionNode = document.createTextNode('text');
			const range = document.createRange();
			const fileComponentInfo = {
				target: document.createElement('img'),
				pluginName: 'image'
			};

			keydownEffects['backspace.component.select'](effContext, {
				selectionNode,
				range,
				fileComponentInfo
			});

			expect(mockPorts.component.select).toHaveBeenCalled();
		});

		it('should execute backspace.component.remove', () => {
			const sel = document.createTextNode('text');
			const formatEl = document.createElement('li');
			const fileComponentInfo = {
				target: document.createElement('img'),
				pluginName: 'image'
			};

			keydownEffects['backspace.component.remove'](effContext, {
				isList: true,
				sel,
				formatEl,
				fileComponentInfo
			});

			// This effect calls component.select, not html.remove
			expect(mockPorts.component.select).toHaveBeenCalled();
		});

		it('should execute backspace.list.mergePrev', () => {
			const ul = document.createElement('ul');
			const li1 = document.createElement('li');
			const li2 = document.createElement('li');
			const text = document.createTextNode('text');

			li1.appendChild(document.createTextNode('prev'));
			li2.appendChild(text);
			ul.appendChild(li1);
			ul.appendChild(li2);

			keydownEffects['backspace.list.mergePrev'](effContext, {
				prev: li1,
				formatEl: li2,
				rangeEl: ul
			});

			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});

		it('should execute backspace.list.removeNested', () => {
			const text = document.createTextNode('text');
			const range = document.createRange();
			range.setStart(text, 0);
			range.setEnd(text, 4);

			keydownEffects['backspace.list.removeNested'](effContext, { range });

			expect(mockPorts.html.remove).toHaveBeenCalled();
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});
	});

	describe('Tab effects', () => {
		it('should execute tab.format.indent with shift', () => {
			const ul = document.createElement('ul');
			const li = document.createElement('li');
			li.appendChild(document.createTextNode('Item'));
			ul.appendChild(li);

			const range = document.createRange();
			range.setStart(li.firstChild, 0);
			range.setEnd(li.firstChild, 0);

			mockCtx.shift = true;
			mockCtx.status = { tabSize: 4 };
			mockPorts.selection.getRange.mockReturnValue(range);
			mockPorts.format.getLines.mockReturnValue([li]); // Return the list item

			keydownEffects['tab.format.indent'](effContext, {
				range,
				formatEl: li,
				shift: true
			});

			expect(mockPorts.listFormat.applyNested).toHaveBeenCalledWith([li], true);
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});

		it('should execute tab.format.indent without shift', () => {
			const ul = document.createElement('ul');
			const li = document.createElement('li');
			const prevLi = document.createElement('li');
			li.appendChild(document.createTextNode('Item'));
			ul.appendChild(prevLi);
			ul.appendChild(li);

			const range = document.createRange();
			range.setStart(li.firstChild, 0);
			range.setEnd(li.firstChild, 0);

			mockCtx.shift = false;
			mockCtx.status = { tabSize: 4 };
			mockPorts.selection.getRange.mockReturnValue(range);
			mockPorts.format.getLines.mockReturnValue([li]); // Return the list item

			keydownEffects['tab.format.indent'](effContext, {
				range,
				formatEl: li,
				shift: false
			});

			expect(mockPorts.listFormat.applyNested).toHaveBeenCalledWith([li], false);
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});
	});

	describe('Enter effects', () => {
		it('should execute enter.scrollTo', () => {
			const range = document.createRange();

			keydownEffects['enter.scrollTo'](effContext, { range });

			expect(mockPorts.enterScrollTo).toHaveBeenCalledWith(range);
		});

		it('should execute enter.line.addDefault', () => {
			const formatEl = document.createElement('h1');
			formatEl.appendChild(document.createTextNode('Heading'));
			mockCtx.fc.get('wysiwyg').appendChild(formatEl);

			// Mock addLine to actually append the element to the DOM
			mockPorts.format.addLine.mockImplementation((el, tag) => {
				const newEl = document.createElement('p');
				newEl.innerHTML = '<br>';
				el.parentNode.insertBefore(newEl, el.nextSibling);
				return newEl;
			});

			keydownEffects['enter.line.addDefault'](effContext, { formatEl });

			expect(mockCtx.fc.get('wysiwyg').children.length).toBe(2);
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});

		it('should execute enter.format.insertBrNode', () => {
			const parent = document.createElement('p');
			const text = document.createTextNode('text');
			parent.appendChild(text);

			const wSelection = {
				focusNode: text,
				focusOffset: 0
			};

			// Mock insertNode to actually insert the BR into the parent
			mockPorts.html.insertNode.mockImplementation((node) => {
				parent.appendChild(node);
				return node;
			});

			keydownEffects['enter.format.insertBrNode'](effContext, { wSelection });

			expect(mockPorts.html.insertNode).toHaveBeenCalled();
			expect(mockPorts.setOnShortcutKey).toHaveBeenCalledWith(true);
		});

		it('should execute enter.list.addItem', () => {
			const ul = document.createElement('ul');
			const li = document.createElement('li');
			const text = document.createTextNode('Item');
			const nextText = document.createTextNode('Next');

			li.appendChild(text);
			li.appendChild(nextText);
			ul.appendChild(li);

			keydownEffects['enter.list.addItem'](effContext, {
				formatEl: li,
				selectionNode: text
			});

			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});

		it('should execute enter.format.exitEmpty', () => {
			const formatEl = document.createElement('li');
			const rangeEl = document.createElement('ul');
			const parent = document.createElement('div');

			formatEl.innerHTML = '<br>';
			rangeEl.appendChild(formatEl);
			parent.appendChild(rangeEl);

			mockPorts.format.removeBlock.mockReturnValue({
				cc: parent,
				ec: null
			});

			keydownEffects['enter.format.exitEmpty'](effContext, { formatEl, rangeEl });

			expect(mockPorts.format.removeBlock).toHaveBeenCalled();
			expect(mockPorts.nodeTransform.removeAllParents).toHaveBeenCalled();
		});

		it('should execute enter.format.breakAtCursor', () => {
			const formatEl = document.createElement('p');
			formatEl.appendChild(document.createTextNode('text'));

			const range = document.createRange();
			range.setStart(formatEl.firstChild, 2);
			range.setEnd(formatEl.firstChild, 2);

			mockPorts.nodeTransform.split.mockReturnValue(document.createElement('p'));

			keydownEffects['enter.format.breakAtCursor'](effContext, { formatEl, range });

			expect(mockPorts.enterPrevent).toHaveBeenCalled();
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});

		it('should execute enter.figcaption.exitInList', () => {
			const formatEl = document.createElement('figcaption');
			const parent = document.createElement('figure');
			parent.appendChild(formatEl);

			mockPorts.format.addLine.mockImplementation((el) => {
				const newEl = document.createElement('p');
				el.parentNode.insertBefore(newEl, el.nextSibling);
				return newEl;
			});

			keydownEffects['enter.figcaption.exitInList'](effContext, { formatEl });

			expect(mockPorts.format.addLine).toHaveBeenCalled();
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});

		it('should execute enter.format.breakAtEdge', () => {
			const formatEl = document.createElement('p');
			const parent = document.createElement('div');
			const selectionNode = document.createTextNode('text');

			formatEl.appendChild(selectionNode);
			parent.appendChild(formatEl);

			keydownEffects['enter.format.breakAtEdge'](effContext, {
				formatEl,
				selectionNode,
				formatStartEdge: false,
				formatEndEdge: true
			});

			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});

		it('should execute enter.format.breakWithSelection', () => {
			const formatEl = document.createElement('p');
			const parent = document.createElement('div');
			formatEl.appendChild(document.createTextNode('text'));
			parent.appendChild(formatEl);

			const range = document.createRange();
			range.setStart(formatEl.firstChild, 0);
			range.setEnd(formatEl.firstChild, 2);

			mockPorts.format.getLine.mockReturnValue(formatEl);
			mockPorts.format.getBlock.mockReturnValue(null);
			mockPorts.nodeTransform.split.mockReturnValue(document.createElement('p'));

			keydownEffects['enter.format.breakWithSelection'](effContext, {
				formatEl,
				range,
				formatStartEdge: false,
				formatEndEdge: false
			});

			expect(mockPorts.html.remove).toHaveBeenCalled();
			expect(mockPorts.enterPrevent).toHaveBeenCalled();
		});

		it('should execute enter.format.insertBrHtml', () => {
			const brBlock = document.createElement('p');
			const text = document.createTextNode('text');
			brBlock.appendChild(text);

			const range = document.createRange();
			range.setStart(text, 2);
			range.setEnd(text, 2);

			const wSelection = {
				focusNode: text,
				focusOffset: 2
			};

			keydownEffects['enter.format.insertBrHtml'](effContext, {
				brBlock,
				range,
				wSelection,
				offset: 0
			});

			expect(mockPorts.html.insert).toHaveBeenCalled();
			expect(mockPorts.setOnShortcutKey).toHaveBeenCalledWith(true);
		});

		it('should execute enter.format.cleanBrAndZWS', () => {
			const parent = document.createElement('div');
			const brBlock = document.createElement('p');
			const br = document.createElement('br');
			const selectionNode = document.createTextNode('text');

			brBlock.appendChild(br);
			brBlock.appendChild(selectionNode);
			parent.appendChild(brBlock);

			mockPorts.format.addLine.mockImplementation((el) => {
				const newEl = document.createElement('p');
				if (el.parentNode) {
					el.parentNode.insertBefore(newEl, el.nextSibling);
				}
				return newEl;
			});
			mockPorts.format.isLine.mockReturnValue(false);

			keydownEffects['enter.format.cleanBrAndZWS'](effContext, {
				selectionNode,
				selectionFormat: null,
				brBlock,
				children: brBlock.childNodes,
				offset: 1
			});

			expect(mockPorts.format.addLine).toHaveBeenCalled();
		});
	});

	describe('Input effects', () => {
		it('should execute keydown.input.insertNbsp', () => {
			const nbsp = document.createTextNode('\u00a0');
			mockPorts.html.insertNode.mockReturnValue(nbsp);

			keydownEffects['keydown.input.insertNbsp'](effContext);

			expect(mockPorts.html.insertNode).toHaveBeenCalled();
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});

		it('should execute keydown.input.insertZWS', () => {
			keydownEffects['keydown.input.insertZWS'](effContext);

			expect(mockPorts.html.insertNode).toHaveBeenCalled();
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});
	});

	describe('Integration tests', () => {
		it('should execute multiple effects in sequence', () => {
			const range = document.createRange();
			const formatEl = document.createElement('p');

			keydownEffects['enter.scrollTo'](effContext, { range });
			keydownEffects['keydown.input.insertNbsp'](effContext);

			expect(mockPorts.enterScrollTo).toHaveBeenCalled();
			expect(mockPorts.html.insertNode).toHaveBeenCalled();
		});

		it('should handle effects without payload', () => {
			expect(() => {
				keydownEffects['keydown.input.insertNbsp'](effContext);
				keydownEffects['keydown.input.insertZWS'](effContext);
			}).not.toThrow();
		});
	});

	describe('Edge cases', () => {
		it('should handle effects with minimal DOM structure', () => {
			const formatEl = document.createElement('p');
			formatEl.innerHTML = '<br>';
			const parent = document.createElement('div');
			parent.appendChild(formatEl);

			expect(() => {
				keydownEffects['backspace.format.maintain'](effContext, { formatEl });
			}).not.toThrow();
		});

		it('should handle missing payload properties gracefully', () => {
			const range = document.createRange();
			expect(() => {
				keydownEffects['enter.scrollTo'](effContext, { range });
			}).not.toThrow();
		});
	});
});
