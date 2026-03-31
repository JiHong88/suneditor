/**
 * @fileoverview Complex scenario tests for multiple rules
 */

import { reduceBackspaceDown } from '../../../../../src/core/event/rules/keydown.rule.backspace';
import { reduceDeleteDown } from '../../../../../src/core/event/rules/keydown.rule.delete';
import { reduceEnterDown } from '../../../../../src/core/event/rules/keydown.rule.enter';
import { A } from '../../../../../src/core/event/actions';

describe('Keydown Rules - Complex Scenarios', () => {
	let mockPorts;
	let mockCtx;
	let actions;
	let wysiwygDiv;

	beforeEach(() => {
		actions = [];

		// Polyfill innerText for JSDOM
		if (!('innerText' in Element.prototype)) {
			Object.defineProperty(Element.prototype, 'innerText', {
				get: function () {
					return this.textContent;
				},
				configurable: true
			});
		}

		wysiwygDiv = document.createElement('div');
		wysiwygDiv.setAttribute('data-se-wysiwyg', 'true');
		document.body.appendChild(wysiwygDiv);

		mockPorts = {
			format: {
				isNormalLine: jest.fn().mockReturnValue(true),
				isBrLine: jest.fn().mockReturnValue(false),
				isLine: jest.fn().mockReturnValue(true),
				getLine: jest.fn(),
				getBlock: jest.fn().mockReturnValue(null),
				isEdgeLine: jest.fn().mockReturnValue(false),
				isClosureBlock: jest.fn().mockReturnValue(false),
				isClosureBrLine: jest.fn().mockReturnValue(false),
				getBrLine: jest.fn().mockReturnValue(null),
				removeBlock: jest.fn()
			},
			component: {
				is: jest.fn().mockReturnValue(false),
				get: jest.fn().mockReturnValue(null)
			},
			selection: {
				getRange: jest.fn(),
				get: jest.fn(() => window.getSelection())
			},
			editor: {
				_nativeFocus: jest.fn()
			},
			char: {
				check: jest.fn().mockReturnValue(true)
			},
			enterPrevent: jest.fn(),
			setDefaultLine: jest.fn()
		};

		mockCtx = {
			fc: new Map([['wysiwyg', wysiwygDiv]]),
			options: new Map([['defaultLine', 'P']]),
			frameOptions: new Map([
				['charCounter_type', 'char'],
				['resizingBar', true]
			]),
			shift: false,
			e: {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			}
		};
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('should handle backspace in list followed by component', () => {
		const ul = document.createElement('ul');
		const li = document.createElement('li');
		const text = document.createTextNode('Item');
		const img = document.createElement('img');
		img.src = 'test.jpg';

		li.appendChild(text);
		li.appendChild(img);
		ul.appendChild(li);
		wysiwygDiv.appendChild(ul);

		const range = document.createRange();
		range.setStart(text, 4);
		range.setEnd(text, 4);

		mockCtx.range = range;
		mockCtx.formatEl = li;
		mockCtx.selectionNode = text;
		mockPorts.format.getLine.mockReturnValue(li);
		mockPorts.format.getBlock.mockReturnValue(ul);
		mockPorts.selection.getRange.mockReturnValue(range);

		const result = reduceBackspaceDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
		expect(actions.length).toBeGreaterThan(0);
	});

	it('should handle delete at end of nested list before sibling', () => {
		const ul = document.createElement('ul');
		const li1 = document.createElement('li');
		const nestedUl = document.createElement('ul');
		const nestedLi = document.createElement('li');
		const li2 = document.createElement('li');

		nestedLi.appendChild(document.createTextNode('Nested'));
		nestedUl.appendChild(nestedLi);
		li1.appendChild(document.createTextNode('Parent'));
		li1.appendChild(nestedUl);
		li2.appendChild(document.createTextNode('Sibling'));
		ul.appendChild(li1);
		ul.appendChild(li2);
		wysiwygDiv.appendChild(ul);

		const range = document.createRange();
		range.setStart(nestedLi.firstChild, 6);
		range.setEnd(nestedLi.firstChild, 6);

		mockCtx.range = range;
		mockCtx.formatEl = nestedLi;
		mockCtx.selectionNode = nestedLi.firstChild;
		mockPorts.format.getLine.mockReturnValue(nestedLi);
		mockPorts.format.getBlock.mockReturnValue(nestedUl);
		mockPorts.format.isEdgeLine.mockReturnValue(true);
		mockPorts.selection.getRange.mockReturnValue(range);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);

		expect(result).toBe(false);
		expect(actions.some(a => a.t === 'event.prevent.stop')).toBe(true);
	});

	it('should handle enter in list with component', () => {
		const ul = document.createElement('ul');
		const li = document.createElement('li');
		const text = document.createTextNode('Item');
		const img = document.createElement('img');
		img.src = 'test.jpg';

		li.appendChild(text);
		li.appendChild(img);
		ul.appendChild(li);
		wysiwygDiv.appendChild(ul);

		const range = document.createRange();
		range.setStart(text, 2);
		range.setEnd(text, 2);

		mockCtx.range = range;
		mockCtx.formatEl = li;
		mockCtx.selectionNode = text;
		mockPorts.format.getLine.mockReturnValue(li);
		mockPorts.format.getBlock.mockReturnValue(ul);
		mockPorts.selection.getRange.mockReturnValue(range);

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	it('should handle backspace in table with multiple cells', () => {
		const table = document.createElement('table');
		const tbody = document.createElement('tbody');
		const tr = document.createElement('tr');
		const td1 = document.createElement('td');
		const td2 = document.createElement('td');
		const p1 = document.createElement('p');
		const p2 = document.createElement('p');

		p1.appendChild(document.createTextNode('Cell 1'));
		p2.appendChild(document.createTextNode('Cell 2'));
		td1.appendChild(p1);
		td2.appendChild(p2);
		tr.appendChild(td1);
		tr.appendChild(td2);
		tbody.appendChild(tr);
		table.appendChild(tbody);
		wysiwygDiv.appendChild(table);

		const range = document.createRange();
		range.setStart(p1.firstChild, 2);
		range.setEnd(p1.firstChild, 2);

		mockCtx.range = range;
		mockCtx.formatEl = p1;
		mockCtx.selectionNode = p1.firstChild;
		mockPorts.format.getLine.mockReturnValue(p1);
		mockPorts.format.getBlock.mockReturnValue(td1);
		mockPorts.selection.getRange.mockReturnValue(range);

		const result = reduceBackspaceDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	it('should handle delete in blockquote with nested paragraphs', () => {
		const blockquote = document.createElement('blockquote');
		const p1 = document.createElement('p');
		const p2 = document.createElement('p');

		p1.appendChild(document.createTextNode('First'));
		p2.appendChild(document.createTextNode('Second'));
		blockquote.appendChild(p1);
		blockquote.appendChild(p2);
		wysiwygDiv.appendChild(blockquote);

		const range = document.createRange();
		range.setStart(p1.firstChild, 5);
		range.setEnd(p1.firstChild, 5);

		mockCtx.range = range;
		mockCtx.formatEl = p1;
		mockCtx.selectionNode = p1.firstChild;
		mockPorts.format.getLine.mockReturnValue(p1);
		mockPorts.format.getBlock.mockReturnValue(null);
		mockPorts.format.isEdgeLine.mockReturnValue(true);
		mockPorts.format.isLine.mockReturnValue(true);
		mockPorts.selection.getRange.mockReturnValue(range);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	it('should handle enter in figcaption with complex content', () => {
		const figure = document.createElement('figure');
		const img = document.createElement('img');
		const figcaption = document.createElement('figcaption');
		const span = document.createElement('span');
		const text = document.createTextNode('Caption');

		span.appendChild(text);
		figcaption.appendChild(span);
		figure.appendChild(img);
		figure.appendChild(figcaption);
		wysiwygDiv.appendChild(figure);

		const range = document.createRange();
		range.setStart(text, 3);
		range.setEnd(text, 3);

		mockCtx.range = range;
		mockCtx.formatEl = figcaption;
		mockCtx.selectionNode = text;
		mockPorts.format.getLine.mockReturnValue(figcaption);
		mockPorts.format.getBlock.mockReturnValue(figure);
		mockPorts.selection.getRange.mockReturnValue(range);

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	it('should handle backspace with multiple zero-width spaces', () => {
		const p = document.createElement('p');
		const zws1 = document.createTextNode('\u200B');
		const zws2 = document.createTextNode('\u200B');
		const text = document.createTextNode('Text');

		p.appendChild(zws1);
		p.appendChild(zws2);
		p.appendChild(text);
		wysiwygDiv.appendChild(p);

		const range = document.createRange();
		range.setStart(text, 0);
		range.setEnd(text, 0);

		mockCtx.range = range;
		mockCtx.formatEl = p;
		mockCtx.selectionNode = text;
		mockPorts.format.getLine.mockReturnValue(p);
		mockPorts.selection.getRange.mockReturnValue(range);

		const result = reduceBackspaceDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	it('should handle delete with styled text and components', () => {
		const p1 = document.createElement('p');
		const p2 = document.createElement('p');
		const strong = document.createElement('strong');
		const text = document.createTextNode('Bold');
		const img = document.createElement('img');
		img.src = 'test.jpg';

		strong.appendChild(text);
		p1.appendChild(strong);
		p1.appendChild(img);
		p2.appendChild(document.createTextNode('Next'));
		wysiwygDiv.appendChild(p1);
		wysiwygDiv.appendChild(p2);

		const range = document.createRange();
		range.setStart(text, 4);
		range.setEnd(text, 4);

		mockCtx.range = range;
		mockCtx.formatEl = p1;
		mockCtx.selectionNode = text;
		mockPorts.format.getLine.mockReturnValue(p1);
		mockPorts.format.isEdgeLine.mockReturnValue(false);
		mockPorts.selection.getRange.mockReturnValue(range);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});
});
