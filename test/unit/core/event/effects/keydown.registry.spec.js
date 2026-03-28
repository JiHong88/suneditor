/**
 * @fileoverview Unit tests for keydown.registry.js effects
 * Tests each effect function with mocked ports
 */

import effects, { LineDelete_next, LineDelete_prev } from '../../../../../src/core/event/effects/keydown.registry';

describe('keydown.registry effects', () => {
	let mockPorts;
	let mockCtx;

	beforeEach(() => {
		mockPorts = {
			html: {
				remove: jest.fn().mockReturnValue({
					commonCon: null,
					container: null,
					prevContainer: null,
				}),
				insert: jest.fn(),
				insertNode: jest.fn().mockImplementation((node) => node),
			},
			selection: {
				setRange: jest.fn(),
			},
			format: {
				addLine: jest.fn().mockImplementation(() => {
					const p = document.createElement('p');
					p.innerHTML = '<br>';
					return p;
				}),
				getLine: jest.fn(),
				getLines: jest.fn().mockReturnValue([]),
				isLine: jest.fn().mockReturnValue(false),
				removeBlock: jest.fn().mockReturnValue({ cc: document.createElement('div'), ec: null }),
			},
			component: {
				select: jest.fn(),
				is: jest.fn().mockReturnValue(false),
				get: jest.fn().mockReturnValue(null),
			},
			history: {
				push: jest.fn(),
			},
			listFormat: {
				applyNested: jest.fn().mockReturnValue({
					sc: null, so: 0, ec: null, eo: 0,
				}),
			},
			focusManager: {
				blur: jest.fn(),
			},
			nodeTransform: {
				split: jest.fn().mockImplementation(() => {
					const el = document.createElement('p');
					el.innerHTML = '<br>';
					return el;
				}),
				removeAllParents: jest.fn(),
			},
			enterScrollTo: jest.fn(),
			enterPrevent: jest.fn(),
			setOnShortcutKey: jest.fn(),
		};

		mockCtx = {
			e: {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn(),
			},
			fc: new Map([['wysiwyg', document.createElement('div')]]),
			store: {
				get: jest.fn((key) => {
					if (key === 'tabSize') return 4;
					if (key === 'indentSize') return 25;
					return null;
				}),
			},
			options: {
				get: jest.fn((key) => {
					if (key === 'defaultLine') return 'P';
					if (key === 'lineAttrReset') return '';
					if (key === 'syncTabIndent') return false;
					return null;
				}),
			},
		};
	});

	describe('backspace.format.maintain', () => {
		it('should replace same-tag format with <br>', () => {
			const formatEl = document.createElement('p');
			formatEl.textContent = 'old content';
			formatEl.setAttribute('class', 'some-class');

			effects['backspace.format.maintain']({ ctx: mockCtx }, { formatEl });

			expect(formatEl.innerHTML).toBe('<br>');
			expect(formatEl.getAttribute('class')).toBeNull();
		});

		it('should replace different-tag format with default line', () => {
			const container = document.createElement('div');
			const formatEl = document.createElement('h1');
			formatEl.textContent = 'heading';
			container.appendChild(formatEl);

			effects['backspace.format.maintain']({ ctx: mockCtx }, { formatEl });

			// H1 should be replaced with P (defaultLine)
			expect(container.querySelector('h1')).toBeNull();
			expect(container.querySelector('p')).toBeTruthy();
		});
	});

	describe('backspace.component.select', () => {
		it('should call component.select with file component info', () => {
			const selectionNode = document.createTextNode('text');
			const range = { startContainer: document.createElement('div'), startOffset: 0 };
			const fileComponentInfo = { target: document.createElement('img'), pluginName: 'image' };

			effects['backspace.component.select']({ ports: mockPorts }, { selectionNode, range, fileComponentInfo });

			expect(mockPorts.component.select).toHaveBeenCalledWith(fileComponentInfo.target, 'image');
		});

		it('should call blur if component.select returns false', () => {
			mockPorts.component.select.mockReturnValue(false);
			const selectionNode = document.createTextNode('text');
			const range = { startContainer: document.createElement('div'), startOffset: 0 };
			const fileComponentInfo = { target: document.createElement('img'), pluginName: 'image' };

			effects['backspace.component.select']({ ports: mockPorts }, { selectionNode, range, fileComponentInfo });

			expect(mockPorts.focusManager.blur).toHaveBeenCalled();
		});

		it('should remove BR selection node', () => {
			const br = document.createElement('br');
			const parent = document.createElement('p');
			parent.appendChild(br);
			const range = { startContainer: parent, startOffset: 0 };
			const fileComponentInfo = { target: document.createElement('img'), pluginName: 'image' };

			effects['backspace.component.select']({ ports: mockPorts }, { selectionNode: br, range, fileComponentInfo });

			expect(parent.contains(br)).toBe(false);
		});
	});

	describe('backspace.component.remove', () => {
		it('should remove format element when empty', () => {
			const formatEl = document.createElement('p');
			const container = document.createElement('div');
			container.appendChild(formatEl);
			const sel = document.createElement('span');
			const fileComponentInfo = { target: document.createElement('img'), pluginName: 'image' };

			effects['backspace.component.remove']({ ports: mockPorts }, { isList: false, sel, formatEl, fileComponentInfo });

			expect(mockPorts.component.select).toHaveBeenCalledWith(fileComponentInfo.target, 'image');
		});

		it('should remove sel element when in list', () => {
			const sel = document.createElement('li');
			const parent = document.createElement('ul');
			parent.appendChild(sel);
			const formatEl = document.createElement('p');
			formatEl.textContent = 'text';
			const fileComponentInfo = { target: document.createElement('img'), pluginName: 'image' };

			effects['backspace.component.remove']({ ports: mockPorts }, { isList: true, sel, formatEl, fileComponentInfo });

			expect(parent.contains(sel)).toBe(false);
		});
	});

	describe('backspace.list.removeNested', () => {
		it('should call html.remove and set range on text node', () => {
			const textNode = document.createTextNode('hello');
			const range = { startContainer: textNode };
			textNode.nodeType; // 3

			effects['backspace.list.removeNested']({ ports: mockPorts }, { range });

			expect(mockPorts.html.remove).toHaveBeenCalled();
			expect(mockPorts.selection.setRange).toHaveBeenCalledWith(
				textNode, 5, textNode, 5
			);
		});

		it('should call html.remove but not set range for non-text nodes', () => {
			const elementNode = document.createElement('div');
			const range = { startContainer: elementNode };

			effects['backspace.list.removeNested']({ ports: mockPorts }, { range });

			expect(mockPorts.html.remove).toHaveBeenCalled();
			expect(mockPorts.selection.setRange).not.toHaveBeenCalled();
		});
	});

	describe('del.format.removeAndMove', () => {
		it('should call html.remove', () => {
			const formatEl = document.createElement('p');
			const container = document.createElement('div');
			mockPorts.html.remove.mockReturnValue({
				commonCon: container,
				container: container,
			});

			effects['del.format.removeAndMove']({ ports: mockPorts }, { container, formatEl });

			expect(mockPorts.html.remove).toHaveBeenCalled();
		});

		it('should set range when commonCon differs and formatEl contains container', () => {
			const formatEl = document.createElement('p');
			const child = document.createTextNode('text');
			formatEl.appendChild(child);
			const parentDiv = document.createElement('div');
			parentDiv.appendChild(formatEl);
			const container = child;
			mockPorts.html.remove.mockReturnValue({
				commonCon: parentDiv,
				container: container,
			});

			effects['del.format.removeAndMove']({ ports: mockPorts }, { container, formatEl });

			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});
	});

	describe('delete.component.select', () => {
		it('should call component.select', () => {
			const formatEl = document.createElement('p');
			const target = document.createElement('img');
			const container = document.createElement('span');
			const fileComponentInfo = { target, pluginName: 'image', container };

			effects['delete.component.select']({ ports: mockPorts }, { formatEl, fileComponentInfo });

			expect(mockPorts.component.select).toHaveBeenCalledWith(target, 'image');
		});

		it('should call blur if component.select returns false', () => {
			mockPorts.component.select.mockReturnValue(false);
			const formatEl = document.createElement('p');
			const target = document.createElement('img');
			const fileComponentInfo = { target, pluginName: 'image', container: document.createElement('span') };

			effects['delete.component.select']({ ports: mockPorts }, { formatEl, fileComponentInfo });

			expect(mockPorts.focusManager.blur).toHaveBeenCalled();
		});
	});

	describe('enter.scrollTo', () => {
		it('should call enterScrollTo with range', () => {
			const range = { startContainer: document.createElement('p'), startOffset: 0 };

			effects['enter.scrollTo']({ ports: mockPorts }, { range });

			expect(mockPorts.enterScrollTo).toHaveBeenCalledWith(range);
		});
	});

	describe('enter.line.addDefault', () => {
		it('should call format.addLine with defaultLine', () => {
			const formatEl = document.createElement('h1');

			effects['enter.line.addDefault']({ ports: mockPorts, ctx: mockCtx }, { formatEl });

			expect(mockPorts.format.addLine).toHaveBeenCalledWith(formatEl, 'P');
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});
	});

	describe('enter.list.addItem', () => {
		it('should create new LI after current', () => {
			const ul = document.createElement('ul');
			const li = document.createElement('li');
			const span1 = document.createElement('span');
			span1.textContent = 'before';
			const span2 = document.createElement('span');
			span2.textContent = 'after';
			li.appendChild(span1);
			li.appendChild(span2);
			ul.appendChild(li);

			effects['enter.list.addItem']({ ports: mockPorts }, { formatEl: li, selectionNode: span1 });

			expect(ul.querySelectorAll('li').length).toBe(2);
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});
	});

	describe('enter.format.breakAtCursor', () => {
		it('should split at cursor with nodeTransform.split', () => {
			const formatEl = document.createElement('p');
			formatEl.textContent = 'hello world';
			const range = { endContainer: formatEl.firstChild, endOffset: 5 };

			effects['enter.format.breakAtCursor']({ ports: mockPorts, ctx: mockCtx }, { formatEl, range });

			expect(mockPorts.nodeTransform.split).toHaveBeenCalled();
			expect(mockPorts.enterPrevent).toHaveBeenCalled();
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});

		it('should use addLine for zero-width format', () => {
			const formatEl = document.createElement('p');
			formatEl.textContent = '\u200B';
			const range = { endContainer: formatEl.firstChild, endOffset: 1 };

			effects['enter.format.breakAtCursor']({ ports: mockPorts, ctx: mockCtx }, { formatEl, range });

			expect(mockPorts.format.addLine).toHaveBeenCalled();
		});
	});

	describe('enter.figcaption.exitInList', () => {
		it('should call format.addLine', () => {
			const formatEl = document.createElement('figcaption');

			effects['enter.figcaption.exitInList']({ ports: mockPorts }, { formatEl });

			expect(mockPorts.format.addLine).toHaveBeenCalledWith(formatEl, null);
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});
	});

	describe('keydown.input.insertNbsp', () => {
		it('should insert NBSP and set range', () => {
			effects['keydown.input.insertNbsp']({ ports: mockPorts });

			expect(mockPorts.html.insertNode).toHaveBeenCalled();
			const insertedNode = mockPorts.html.insertNode.mock.calls[0][0];
			expect(insertedNode.textContent).toBe('\u00a0');
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});

		it('should not set range when insertNode returns falsy', () => {
			mockPorts.html.insertNode.mockReturnValue(null);

			effects['keydown.input.insertNbsp']({ ports: mockPorts });

			expect(mockPorts.selection.setRange).not.toHaveBeenCalled();
		});
	});

	describe('keydown.input.insertZWS', () => {
		it('should insert zero-width space and set range', () => {
			effects['keydown.input.insertZWS']({ ports: mockPorts });

			expect(mockPorts.html.insertNode).toHaveBeenCalled();
			const insertedNode = mockPorts.html.insertNode.mock.calls[0][0];
			expect(insertedNode.textContent).toBe('\u200B');
			expect(mockPorts.selection.setRange).toHaveBeenCalledWith(
				expect.anything(), 1, expect.anything(), 1
			);
		});
	});

	describe('enter.format.insertBrNode', () => {
		it('should insert BR node into parent', () => {
			// Create a DOM structure so BR has a parentNode after insertNode
			const parent = document.createElement('p');
			const textNode = document.createTextNode('text');
			parent.appendChild(textNode);
			const wSelection = { focusNode: textNode };

			// Mock insertNode to actually insert the BR into parent
			mockPorts.html.insertNode.mockImplementation((br) => {
				parent.insertBefore(br, textNode.nextSibling);
				return br;
			});

			effects['enter.format.insertBrNode']({ ports: mockPorts }, { wSelection });

			expect(mockPorts.html.insertNode).toHaveBeenCalled();
			const insertedNode = mockPorts.html.insertNode.mock.calls[0][0];
			expect(insertedNode.tagName).toBe('BR');
			expect(mockPorts.setOnShortcutKey).toHaveBeenCalledWith(true);
		});
	});

	describe('enter.format.cleanBrAndZWS', () => {
		it('should clean BR and add new line', () => {
			const brBlock = document.createElement('p');
			brBlock.innerHTML = '<br>';
			const container = document.createElement('div');
			container.appendChild(brBlock);
			const children = brBlock.childNodes;

			effects['enter.format.cleanBrAndZWS']({ ports: mockPorts }, {
				selectionNode: null,
				selectionFormat: true,
				brBlock,
				children: Array.from(children),
				offset: 1,
			});

			expect(mockPorts.format.addLine).toHaveBeenCalled();
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});
	});

	describe('tab.format.indent', () => {
		it('should call getLines for selected formats', () => {
			const formatEl = document.createElement('p');
			formatEl.textContent = 'text';
			const range = {
				startContainer: formatEl.firstChild,
				startOffset: 0,
				endContainer: formatEl.firstChild,
				endOffset: 4,
			};
			mockPorts.format.getLines.mockReturnValue([formatEl]);

			effects['tab.format.indent']({ ports: mockPorts, ctx: mockCtx }, { range, formatEl, shift: false });

			expect(mockPorts.format.getLines).toHaveBeenCalledWith(null);
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});

		it('should handle shift+tab (outdent)', () => {
			const formatEl = document.createElement('p');
			formatEl.textContent = '    text';
			const range = {
				startContainer: formatEl.firstChild,
				startOffset: 0,
				endContainer: formatEl.firstChild,
				endOffset: 8,
			};
			mockPorts.format.getLines.mockReturnValue([formatEl]);

			effects['tab.format.indent']({ ports: mockPorts, ctx: mockCtx }, { range, formatEl, shift: true });

			expect(mockPorts.format.getLines).toHaveBeenCalled();
		});

		it('should call listFormat.applyNested for list cells', () => {
			const li1 = document.createElement('li');
			li1.textContent = 'item 1';
			const li2 = document.createElement('li');
			li2.textContent = 'item 2';
			const ul = document.createElement('ul');
			ul.appendChild(li1);
			ul.appendChild(li2);

			const range = {
				startContainer: li1.firstChild,
				startOffset: 0,
				endContainer: li2.firstChild,
				endOffset: 6,
			};
			// Both are LI elements (list cells), so they go into cells array
			// li1 has no previousElementSibling and shift=false, so it is skipped
			// li2 has a previousElementSibling (li1), so it is included
			mockPorts.format.getLines.mockReturnValue([li1, li2]);

			effects['tab.format.indent']({ ports: mockPorts, ctx: mockCtx }, { range, formatEl: li1, shift: false });

			expect(mockPorts.listFormat.applyNested).toHaveBeenCalledWith([li2], false);
		});

		it('should handle shift+tab on single line (outdent removes leading spaces)', () => {
			const formatEl = document.createElement('p');
			formatEl.textContent = '  text';
			const range = {
				startContainer: formatEl.firstChild,
				startOffset: 0,
				endContainer: formatEl.firstChild,
				endOffset: 6,
			};
			mockPorts.format.getLines.mockReturnValue([formatEl]);

			effects['tab.format.indent']({ ports: mockPorts, ctx: mockCtx }, { range, formatEl, shift: true });

			// Leading spaces should be removed by the shift+tab outdent logic
			expect(formatEl.firstChild.textContent).toBe('text');
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});

		it('should indent multiple lines with tab (no shift)', () => {
			const p1 = document.createElement('p');
			p1.textContent = 'line1';
			const p2 = document.createElement('p');
			p2.textContent = 'line2';
			const range = {
				startContainer: p1.firstChild,
				startOffset: 0,
				endContainer: p2.firstChild,
				endOffset: 5,
			};
			mockPorts.format.getLines.mockReturnValue([p1, p2]);

			effects['tab.format.indent']({ ports: mockPorts, ctx: mockCtx }, { range, formatEl: p1, shift: false });

			// Each line should have tab spaces prepended (tabSize=4, so 4 nbsp chars)
			const expectedTab = new Array(5).join('\u00A0');
			expect(p1.firstChild.textContent.startsWith(expectedTab)).toBe(true);
			expect(p2.firstChild.textContent.startsWith(expectedTab)).toBe(true);
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});
	});

	describe('delete.component.selectNext', () => {
		it('should remove zero-width formatEl, and if nextEl is TABLE, find edge cell and set range', () => {
			// Create a zero-width formatEl (textContent is only zero-width space)
			const container = document.createElement('div');
			const formatEl = document.createElement('p');
			formatEl.textContent = '\u200B';
			container.appendChild(formatEl);

			// Create a real TABLE structure as nextEl
			const table = document.createElement('table');
			const tbody = document.createElement('tbody');
			const tr = document.createElement('tr');
			const td = document.createElement('td');
			const cellContent = document.createElement('p');
			cellContent.textContent = 'cell text';
			td.appendChild(cellContent);
			tr.appendChild(td);
			tbody.appendChild(tr);
			table.appendChild(tbody);
			container.appendChild(table);

			effects['delete.component.selectNext']({ ports: mockPorts, ctx: mockCtx }, { formatEl, nextEl: table });

			// formatEl should be removed from DOM
			expect(container.contains(formatEl)).toBe(false);
			// Should set range on the found table cell child
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
			const callArgs = mockPorts.selection.setRange.mock.calls[0];
			// The cell arg should be the TD's firstElementChild (cellContent) or TD itself
			expect(table.contains(callArgs[0])).toBe(true);
		});

		it('should call component.select when nextEl has fileComponentInfo', () => {
			const formatEl = document.createElement('p');
			formatEl.textContent = 'some text';
			const nextEl = document.createElement('div');
			const target = document.createElement('img');
			const fileComponentInfo = { target, pluginName: 'image' };

			mockPorts.component.get.mockReturnValue(fileComponentInfo);

			effects['delete.component.selectNext']({ ports: mockPorts, ctx: mockCtx }, { formatEl, nextEl });

			expect(mockPorts.component.get).toHaveBeenCalledWith(nextEl);
			expect(mockPorts.component.select).toHaveBeenCalledWith(target, 'image');
			expect(mockCtx.e.stopPropagation).toHaveBeenCalled();
		});

		it('should remove nextEl when it is a component but has no fileComponentInfo', () => {
			const container = document.createElement('div');
			const formatEl = document.createElement('p');
			formatEl.textContent = 'some text';
			const nextEl = document.createElement('div');
			container.appendChild(formatEl);
			container.appendChild(nextEl);

			mockPorts.component.get.mockReturnValue(null);
			mockPorts.component.is.mockReturnValue(true);

			effects['delete.component.selectNext']({ ports: mockPorts, ctx: mockCtx }, { formatEl, nextEl });

			expect(container.contains(nextEl)).toBe(false);
			expect(mockCtx.e.stopPropagation).toHaveBeenCalled();
		});
	});

	describe('delete.list.removeNested', () => {
		it('should call html.remove when range spans different containers', () => {
			const wrapper = document.createElement('div');
			const ul = document.createElement('ul');
			const li = document.createElement('li');
			li.textContent = 'item';
			ul.appendChild(li);
			wrapper.appendChild(ul);

			const startNode = document.createTextNode('start');
			const endNode = document.createTextNode('end');
			const range = { startContainer: startNode, endContainer: endNode };

			effects['delete.list.removeNested']({ ports: mockPorts, ctx: mockCtx }, { range, formatEl: li, rangeEl: ul });

			expect(mockPorts.html.remove).toHaveBeenCalled();
		});

		it('should move list children into formatEl when next element is a list', () => {
			const parentUl = document.createElement('ul');
			const li = document.createElement('li');
			li.textContent = 'item';
			parentUl.appendChild(li);

			// Create a nested UL as a child of the LI
			const nestedUl = document.createElement('ul');
			const nestedLi = document.createElement('li');
			const nestedText = document.createTextNode('nested');
			const nestedSpan = document.createElement('span');
			nestedSpan.textContent = 'child';
			nestedLi.appendChild(nestedText);
			nestedLi.appendChild(nestedSpan);
			nestedUl.appendChild(nestedLi);
			li.appendChild(nestedUl);

			const textNode = li.firstChild; // 'item' text
			const range = { startContainer: textNode, endContainer: textNode };

			effects['delete.list.removeNested']({ ports: mockPorts, ctx: mockCtx }, { range, formatEl: li, rangeEl: parentUl });

			expect(mockCtx.e.preventDefault).toHaveBeenCalled();
			// The nested UL's first child's children should be moved into li
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
			expect(mockPorts.history.push).toHaveBeenCalledWith(true);
		});

		it('should move children and remove next when next element contains a list', () => {
			const parentUl = document.createElement('ul');
			const li1 = document.createElement('li');
			li1.textContent = 'item 1';
			parentUl.appendChild(li1);

			const li2 = document.createElement('li');
			const li2Text = document.createTextNode('next ');
			const innerUl = document.createElement('ul');
			const innerLi = document.createElement('li');
			innerLi.textContent = 'inner';
			innerUl.appendChild(innerLi);
			li2.appendChild(li2Text);
			li2.appendChild(innerUl);
			parentUl.appendChild(li2);

			const textNode = li1.firstChild;
			const range = { startContainer: textNode, endContainer: textNode };

			effects['delete.list.removeNested']({ ports: mockPorts, ctx: mockCtx }, { range, formatEl: li1, rangeEl: parentUl });

			expect(mockCtx.e.preventDefault).toHaveBeenCalled();
			// li2's children should be moved into li1 and li2 removed
			expect(parentUl.contains(li2)).toBe(false);
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
			expect(mockPorts.history.push).toHaveBeenCalledWith(true);
		});
	});

	describe('enter.format.exitEmpty', () => {
		it('should create new LI when formatEl is inside a list cell (LI > UL > LI structure)', () => {
			// Structure: outerUl > outerLi > innerUl > innerLi(formatEl)
			const outerUl = document.createElement('ul');
			const outerLi = document.createElement('li');
			const innerUl = document.createElement('ul');
			const innerLi = document.createElement('li');
			innerLi.innerHTML = '<br>';

			innerUl.appendChild(innerLi);
			outerLi.appendChild(innerUl);
			outerUl.appendChild(outerLi);

			// rangeEl starts as innerUl, parentElement of innerUl is outerLi (which is a listCell)
			const rangeEl = innerUl;

			effects['enter.format.exitEmpty']({ ports: mockPorts, ctx: mockCtx }, { formatEl: innerLi, rangeEl });

			// A new LI should be inserted into outerUl as a direct child
			const directChildren = Array.from(outerUl.children).filter(c => c.nodeName === 'LI');
			expect(directChildren.length).toBe(2);
			expect(directChildren[1].innerHTML).toBe('<br>');
			expect(mockPorts.nodeTransform.removeAllParents).toHaveBeenCalledWith(innerLi, null, null);
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});

		it('should create DIV when formatEl is in a table cell', () => {
			const table = document.createElement('table');
			const tr = document.createElement('tr');
			const td = document.createElement('td');
			const formatEl = document.createElement('p');
			formatEl.innerHTML = '<br>';

			td.appendChild(formatEl);
			tr.appendChild(td);
			table.appendChild(tr);

			// rangeEl is td, parentElement is tr (not listCell), so goes to else branch
			// td parentElement is tr which is not a listCell
			// td.parentElement (tr) is not a tableCell, but td IS a tableCell
			// Actually: rangeEl=td, rangeEl.parentElement=tr, isTableCell(tr)=false
			// We need rangeEl.parentElement to be a tableCell — let's set rangeEl = formatEl and its parent = td
			// Actually, looking at the code: isTableCell(rangeEl.parentElement) — rangeEl is the second arg
			// Let me re-read: the else branch checks isTableCell(rangeEl.parentElement)
			// rangeEl is passed in. If rangeEl=formatEl's parent container.
			// For table cell case: rangeEl should be something whose parentElement is a TD.
			const wrapper = document.createElement('div');
			td.innerHTML = '';
			td.appendChild(wrapper);
			wrapper.appendChild(formatEl);

			const edge = { cc: wrapper, ec: null };
			mockPorts.format.removeBlock.mockReturnValue(edge);

			effects['enter.format.exitEmpty']({ ports: mockPorts, ctx: mockCtx }, { formatEl, rangeEl: wrapper });

			// Should create a DIV since rangeEl.parentElement (td) is a table cell
			expect(mockPorts.format.removeBlock).toHaveBeenCalled();
			const newEl = wrapper.querySelector('div');
			expect(newEl).toBeTruthy();
			expect(newEl.innerHTML).toBe('<br>');
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});

		it('should use next sibling nodeName when next sibling is a line', () => {
			// Structure: container > [rangeEl, nextH2]
			// rangeEl contains formatEl
			// rangeEl.parentElement (container) is not listCell, not tableCell, not list
			// rangeEl.nextElementSibling is nextH2
			const container = document.createElement('div');
			const rangeEl = document.createElement('div');
			const formatEl = document.createElement('p');
			formatEl.innerHTML = '<br>';
			rangeEl.appendChild(formatEl);
			const nextH2 = document.createElement('h2');
			nextH2.textContent = 'heading';
			container.appendChild(rangeEl);
			container.appendChild(nextH2);

			mockPorts.format.isLine = jest.fn().mockImplementation((el) => el === nextH2);
			const edge = { cc: container, ec: null };
			mockPorts.format.removeBlock.mockReturnValue(edge);

			effects['enter.format.exitEmpty']({ ports: mockPorts, ctx: mockCtx }, { formatEl, rangeEl });

			expect(mockPorts.format.removeBlock).toHaveBeenCalled();
			// Should create element with nextH2's nodeName (H2)
			const allH2s = container.querySelectorAll('h2');
			expect(allH2s.length).toBe(2);
			// The new one should have <br> inside
			const newH2 = allH2s[allH2s.length - 1];
			expect(newH2.innerHTML).toBe('<br>');
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});
	});

	describe('enter.format.insertBrHtml', () => {
		it('should insert BR HTML and set range', () => {
			const brBlock = document.createElement('p');
			brBlock.innerHTML = 'text content';
			const focusNode = document.createTextNode('focus');
			const wSelection = { focusNode, focusOffset: 2 };
			const range = {
				collapsed: true,
				startContainer: brBlock,
				startOffset: 0,
			};
			const offset = 0;

			effects['enter.format.insertBrHtml']({ ports: mockPorts }, { brBlock, range, wSelection, offset });

			expect(mockPorts.html.insert).toHaveBeenCalled();
			// The insert call should include '<br>' or '<br><br>'
			const insertArg = mockPorts.html.insert.mock.calls[0][0];
			expect(insertArg).toContain('<br>');
			expect(mockPorts.selection.setRange).toHaveBeenCalledWith(focusNode, 1, focusNode, 1);
			expect(mockPorts.setOnShortcutKey).toHaveBeenCalledWith(true);
		});

		it('should insert double BR when collapsed and prev sibling is BR', () => {
			const brBlock = document.createElement('p');
			const br = document.createElement('br');
			const text = document.createTextNode('text');
			brBlock.appendChild(br);
			brBlock.appendChild(text);
			const focusNode = document.createTextNode('focus');
			const wSelection = { focusNode, focusOffset: 1 };
			// startOffset=1, so childNodes[0] is the BR
			const range = {
				collapsed: true,
				startContainer: brBlock,
				startOffset: 1,
			};
			const offset = 0;

			effects['enter.format.insertBrHtml']({ ports: mockPorts }, { brBlock, range, wSelection, offset });

			const insertArg = mockPorts.html.insert.mock.calls[0][0];
			expect(insertArg).toBe('<br>');
			expect(mockPorts.setOnShortcutKey).toHaveBeenCalledWith(true);
		});

		it('should adjust focusNode from brBlock children when brBlock === focusNode', () => {
			const brBlock = document.createElement('p');
			const child0 = document.createTextNode('a');
			const child1 = document.createTextNode('b');
			const child2 = document.createTextNode('c');
			brBlock.appendChild(child0);
			brBlock.appendChild(child1);
			brBlock.appendChild(child2);

			const wSelection = { focusNode: brBlock, focusOffset: 2 };
			const range = { collapsed: false, startContainer: brBlock, startOffset: 0 };
			const offset = 0;

			effects['enter.format.insertBrHtml']({ ports: mockPorts }, { brBlock, range, wSelection, offset });

			// When brBlock === focusNode, focusNode = brBlock.childNodes[wOffset - 1] = childNodes[1] = child1
			// Because wOffset - offset (2 - 0 = 2) > 1, so uses wOffset - 1 = 1
			expect(mockPorts.selection.setRange).toHaveBeenCalledWith(child1, 1, child1, 1);
		});
	});

	describe('enter.format.breakAtEdge', () => {
		it('should set range on new BR when formatEndEdge is true', () => {
			const container = document.createElement('div');
			const formatEl = document.createElement('p');
			formatEl.textContent = 'text';
			container.appendChild(formatEl);
			const selectionNode = formatEl.firstChild; // text node

			effects['enter.format.breakAtEdge']({ ports: mockPorts, ctx: mockCtx }, {
				formatEl,
				selectionNode,
				formatStartEdge: false,
				formatEndEdge: true,
			});

			// A new element should be inserted after formatEl
			expect(container.children.length).toBe(2);
			const newFormat = container.children[1];
			expect(newFormat.nodeName).toBe('P');
			// The new format should contain a BR
			expect(newFormat.querySelector('br')).toBeTruthy();
			// setRange should be called with the BR (focusBR)
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
			const rangeArgs = mockPorts.selection.setRange.mock.calls[0];
			expect(rangeArgs[1]).toBe(1); // offset 1 for BR
		});

		it('should insert before formatEl and set range on firstChild when formatStartEdge=true, formatEndEdge=false', () => {
			const container = document.createElement('div');
			const formatEl = document.createElement('p');
			formatEl.textContent = 'text';
			container.appendChild(formatEl);
			const selectionNode = formatEl.firstChild; // text node

			effects['enter.format.breakAtEdge']({ ports: mockPorts, ctx: mockCtx }, {
				formatEl,
				selectionNode,
				formatStartEdge: true,
				formatEndEdge: false,
			});

			// New element should be inserted before formatEl
			expect(container.children.length).toBe(2);
			const newFormat = container.children[0]; // inserted before formatEl
			expect(newFormat.nodeName).toBe('P');
			// setRange should target formatEl's firstChild
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
			const rangeArgs = mockPorts.selection.setRange.mock.calls[0];
			expect(rangeArgs[0]).toBe(formatEl.firstChild);
			expect(rangeArgs[1]).toBe(0);
		});
	});

	describe('enter.format.breakWithSelection', () => {
		beforeEach(() => {
			mockPorts.format.getBlock = jest.fn().mockReturnValue(null);
		});

		it('should handle basic case where range is within same line', () => {
			const container = document.createElement('div');
			const formatEl = document.createElement('p');
			const textNode = document.createTextNode('hello world');
			formatEl.appendChild(textNode);
			container.appendChild(formatEl);

			const range = {
				startContainer: textNode,
				startOffset: 5,
				endContainer: textNode,
				endOffset: 8,
				commonAncestorContainer: textNode,
			};

			// getLine returns the same line for both start and end (same line)
			mockPorts.format.getLine.mockReturnValue(formatEl);
			mockPorts.format.getBlock.mockReturnValue(null);

			// html.remove returns rcon
			const rcon = {
				container: textNode,
				offset: 5,
				prevContainer: null,
				commonCon: formatEl,
			};
			mockPorts.html.remove.mockReturnValue(rcon);

			// nodeTransform.split returns new element
			const newEl = document.createElement('p');
			newEl.innerHTML = '<br>';
			mockPorts.nodeTransform.split.mockReturnValue(newEl);

			effects['enter.format.breakWithSelection']({ ports: mockPorts, ctx: mockCtx }, {
				formatEl,
				range,
				formatStartEdge: false,
				formatEndEdge: false,
			});

			expect(mockPorts.html.remove).toHaveBeenCalled();
			expect(mockPorts.format.getLine).toHaveBeenCalled();
			expect(mockPorts.nodeTransform.split).toHaveBeenCalled();
			expect(mockPorts.enterPrevent).toHaveBeenCalledWith(mockCtx.e);
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});

		it('should append newFormat to wysiwyg when getLine returns null (wysiwygFrame container)', () => {
			const wysiwygDiv = mockCtx.fc.get('wysiwyg');
			wysiwygDiv.classList.add('se-wrapper-wysiwyg');
			const formatEl = document.createElement('p');
			formatEl.textContent = 'text';
			wysiwygDiv.appendChild(formatEl);

			const textNode = formatEl.firstChild;
			const range = {
				startContainer: textNode,
				startOffset: 0,
				endContainer: textNode,
				endOffset: 4,
				commonAncestorContainer: textNode,
			};

			mockPorts.format.getLine.mockReturnValue(null);
			const rcon = {
				container: wysiwygDiv,
				offset: 0,
				prevContainer: null,
				commonCon: wysiwygDiv,
			};
			mockPorts.html.remove.mockReturnValue(rcon);

			effects['enter.format.breakWithSelection']({ ports: mockPorts, ctx: mockCtx }, {
				formatEl,
				range,
				formatStartEdge: false,
				formatEndEdge: false,
			});

			expect(mockPorts.enterPrevent).toHaveBeenCalledWith(mockCtx.e);
			// newFormat should be appended to wysiwyg div
			expect(wysiwygDiv.lastChild.nodeName).toBe('P');
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});

		it('should handle multi-line with formatEndEdge=true and formatStartEdge=false', () => {
			const container = document.createElement('div');
			const formatEl = document.createElement('p');
			formatEl.textContent = 'hello';
			container.appendChild(formatEl);

			const startContainer = document.createTextNode('start');
			const endContainer = document.createTextNode('end');
			const range = {
				startContainer,
				startOffset: 0,
				endContainer,
				endOffset: 3,
				commonAncestorContainer: container,
			};

			// Different lines for start and end (multi-line)
			const line1 = document.createElement('p');
			const line2 = document.createElement('p');
			mockPorts.format.getLine.mockImplementation((node) => {
				if (node === startContainer) return line1;
				if (node === endContainer) return line2;
				return formatEl;
			});
			mockPorts.format.getBlock.mockReturnValue(null);

			const rcon = {
				container: formatEl,
				offset: 0,
				prevContainer: null,
				commonCon: container,
			};
			mockPorts.html.remove.mockReturnValue(rcon);

			effects['enter.format.breakWithSelection']({ ports: mockPorts, ctx: mockCtx }, {
				formatEl,
				range,
				formatStartEdge: false,
				formatEndEdge: true,
			});

			expect(mockPorts.enterPrevent).toHaveBeenCalledWith(mockCtx.e);
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
		});
	});

	describe('backspace.list.mergePrev', () => {
		it('should merge current formatEl children into prev element', () => {
			const ul = document.createElement('ul');
			const li1 = document.createElement('li');
			li1.textContent = 'first';
			const li2 = document.createElement('li');
			const child1 = document.createTextNode('second');
			const child2 = document.createElement('span');
			child2.textContent = ' part';
			li2.appendChild(child1);
			li2.appendChild(child2);
			ul.appendChild(li1);
			ul.appendChild(li2);

			effects['backspace.list.mergePrev']({ ports: mockPorts }, {
				prev: li1,
				formatEl: li2,
				rangeEl: ul,
			});

			// li2 should be removed
			expect(ul.contains(li2)).toBe(false);
			// li1 should now contain the merged children
			expect(li1.textContent).toContain('second');
			expect(li1.textContent).toContain(' part');
			// setRange should be called with the last child of prev (con) and its offset
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
			const callArgs = mockPorts.selection.setRange.mock.calls[0];
			// con = li1.lastChild (before merge, which was the 'first' text node)
			expect(callArgs[1]).toBe(5); // 'first'.length
		});

		it('should use rangeEl.previousSibling as con when prev is rangeEl.parentNode', () => {
			const outerUl = document.createElement('ul');
			const li = document.createElement('li');
			const prevSibling = document.createTextNode('prev');
			const innerUl = document.createElement('ul');
			const innerLi = document.createElement('li');
			innerLi.textContent = 'inner';
			innerUl.appendChild(innerLi);
			li.appendChild(prevSibling);
			li.appendChild(innerUl);
			outerUl.appendChild(li);

			// prev = li = innerUl.parentNode (rangeEl.parentNode)
			// rangeEl = innerUl, rangeEl.previousSibling = prevSibling
			effects['backspace.list.mergePrev']({ ports: mockPorts }, {
				prev: li,
				formatEl: innerLi,
				rangeEl: innerUl,
			});

			// con should be prevSibling (rangeEl.previousSibling)
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
			const callArgs = mockPorts.selection.setRange.mock.calls[0];
			expect(callArgs[0]).toBe(prevSibling);
			expect(callArgs[1]).toBe(4); // 'prev'.length
		});

		it('should create zero-width text node when con is null', () => {
			// To get con=null, we need prev === rangeEl.parentNode and rangeEl.previousSibling === null
			// Structure: li (prev) > [innerUl (rangeEl, first child so no previousSibling) > innerLi (formatEl)]
			const outerUl = document.createElement('ul');
			const li = document.createElement('li');
			const innerUl = document.createElement('ul');
			const innerLi = document.createElement('li');
			innerLi.textContent = 'nested';
			innerUl.appendChild(innerLi);
			li.appendChild(innerUl); // innerUl is first child, so previousSibling is null
			outerUl.appendChild(li);

			// prev = li, rangeEl = innerUl, rangeEl.parentNode = li
			// prev === rangeEl.parentNode → true, con = rangeEl.previousSibling = null
			effects['backspace.list.mergePrev']({ ports: mockPorts }, {
				prev: li,
				formatEl: innerLi,
				rangeEl: innerUl,
			});

			// A zero-width text node should have been created and inserted
			expect(mockPorts.selection.setRange).toHaveBeenCalled();
			const callArgs = mockPorts.selection.setRange.mock.calls[0];
			const con = callArgs[0];
			expect(con.nodeType).toBe(3); // text node
			expect(con.textContent).toBe('\u200B');
			// offset should be 1 (textContent.length of zero-width space)
			expect(callArgs[1]).toBe(1);
		});
	});

	describe('backspace.brline.strip', () => {
		it('should extract first line from PRE into a default line', () => {
			const parent = document.createElement('div');
			const pre = document.createElement('pre');
			pre.innerHTML = 'line1<br>line2<br>line3';
			parent.appendChild(pre);

			effects['backspace.brline.strip']({ ctx: mockCtx, ports: mockPorts }, { formatEl: pre });

			const newLine = parent.firstChild;
			expect(newLine.nodeName).toBe('P');
			expect(newLine.textContent).toBe('line1');
			expect(parent.children.length).toBe(2);
			expect(parent.lastChild.nodeName).toBe('PRE');
		});

		it('should set cursor to start of extracted line', () => {
			const parent = document.createElement('div');
			const pre = document.createElement('pre');
			pre.innerHTML = 'hello<br>world';
			parent.appendChild(pre);

			effects['backspace.brline.strip']({ ctx: mockCtx, ports: mockPorts }, { formatEl: pre });

			expect(mockPorts.selection.setRange).toHaveBeenCalledWith(
				expect.anything(), 0, expect.anything(), 0,
			);
		});

		it('should remove PRE when only one line remains', () => {
			const parent = document.createElement('div');
			const pre = document.createElement('pre');
			pre.textContent = 'only line';
			parent.appendChild(pre);

			effects['backspace.brline.strip']({ ctx: mockCtx, ports: mockPorts }, { formatEl: pre });

			expect(parent.children.length).toBe(1);
			expect(parent.firstChild.nodeName).toBe('P');
			expect(parent.firstChild.textContent).toBe('only line');
		});

		it('should handle empty PRE', () => {
			const parent = document.createElement('div');
			const pre = document.createElement('pre');
			parent.appendChild(pre);

			effects['backspace.brline.strip']({ ctx: mockCtx, ports: mockPorts }, { formatEl: pre });

			expect(parent.firstChild.nodeName).toBe('P');
			expect(parent.firstChild.innerHTML).toBe('<br>');
		});

		it('should handle PRE starting with BR (empty first line)', () => {
			const parent = document.createElement('div');
			const pre = document.createElement('pre');
			pre.innerHTML = '<br>second line';
			parent.appendChild(pre);

			effects['backspace.brline.strip']({ ctx: mockCtx, ports: mockPorts }, { formatEl: pre });

			expect(parent.firstChild.nodeName).toBe('P');
			expect(parent.firstChild.innerHTML).toBe('<br>');
			expect(parent.lastChild.nodeName).toBe('PRE');
			expect(parent.lastChild.textContent).toBe('second line');
		});
	});
});

describe('LineDelete_next', () => {
	it('should return lastChild of formatEl when no next sibling', () => {
		const p = document.createElement('p');
		const text = document.createTextNode('hello');
		p.appendChild(text);

		const result = LineDelete_next(p);
		expect(result).toBe(text);
	});

	it('should merge next sibling children into formatEl', () => {
		const container = document.createElement('div');
		const p1 = document.createElement('p');
		p1.textContent = 'first';
		const p2 = document.createElement('p');
		p2.textContent = 'second';
		container.appendChild(p1);
		container.appendChild(p2);

		const result = LineDelete_next(p1);

		expect(result).toBe(p1.firstChild);
		expect(container.children.length).toBe(1);
		expect(p1.textContent).toContain('second');
	});

	it('should remove zero-width next sibling', () => {
		const container = document.createElement('div');
		const p = document.createElement('p');
		p.textContent = 'text';
		const zws = document.createElement('span');
		zws.textContent = '\u200B';
		container.appendChild(p);
		container.appendChild(zws);

		const result = LineDelete_next(p);

		expect(result).toBeTruthy();
		expect(container.contains(zws)).toBe(false);
	});
});

describe('LineDelete_prev', () => {
	it('should return focusNode when no prev sibling', () => {
		const p = document.createElement('p');
		p.textContent = 'hello';

		const result = LineDelete_prev(p);
		expect(result.focusNode).toBe(p.firstChild);
		expect(result.focusOffset).toBe(0);
	});

	it('should merge formatEl children into prev sibling', () => {
		const container = document.createElement('div');
		const p1 = document.createElement('p');
		p1.textContent = 'first';
		const p2 = document.createElement('p');
		p2.textContent = 'second';
		container.appendChild(p1);
		container.appendChild(p2);

		const result = LineDelete_prev(p2);

		expect(container.children.length).toBe(1);
		expect(p1.textContent).toContain('second');
	});

	it('should remove zero-width prev sibling', () => {
		const container = document.createElement('div');
		const zws = document.createElement('span');
		zws.textContent = '\u200B';
		const p = document.createElement('p');
		p.textContent = 'text';
		container.appendChild(zws);
		container.appendChild(p);

		const result = LineDelete_prev(p);

		expect(result.focusNode).toBeTruthy();
		expect(container.contains(zws)).toBe(false);
	});
});
