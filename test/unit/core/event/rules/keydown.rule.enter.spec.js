/**
 * @fileoverview Unit tests for enter rule
 */

import { reduceEnterDown } from '../../../../../src/core/event/rules/keydown.rule.enter';
import { A } from '../../../../../src/core/event/actions';

describe('Enter Rule', () => {
	let mockPorts;
	let mockCtx;
	let actions;
	let wysiwygDiv;
	let formatEl;
	let textNode;

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

		// Create mock DOM elements
		wysiwygDiv = document.createElement('div');
		wysiwygDiv.setAttribute('data-se-wysiwyg', 'true');
		formatEl = document.createElement('p');
		textNode = document.createTextNode('Hello World');
		formatEl.appendChild(textNode);
		wysiwygDiv.appendChild(formatEl);
		document.body.appendChild(wysiwygDiv);

		const range = document.createRange();
		range.setStart(textNode, 5);
		range.setEnd(textNode, 5);

		mockPorts = {
			format: {
				isNormalLine: jest.fn().mockReturnValue(true),
				isBrLine: jest.fn().mockReturnValue(false),
				isLine: jest.fn().mockReturnValue(true),
				getLine: jest.fn().mockReturnValue(formatEl),
				getBlock: jest.fn().mockReturnValue(null),
				isEdgeLine: jest.fn().mockReturnValue(false),
				isClosureBlock: jest.fn().mockReturnValue(false),
				isClosureBrLine: jest.fn().mockReturnValue(false),
				getBrLine: jest.fn().mockReturnValue(null)
			},
			component: {
				is: jest.fn().mockReturnValue(false),
				get: jest.fn().mockReturnValue(null)
			},
			selection: {
				getRange: jest.fn().mockReturnValue(range),
				get: jest.fn(() => window.getSelection())
			},
			enterPrevent: jest.fn()
		};

		mockCtx = {
			fc: new Map([['wysiwyg', wysiwygDiv]]),
			options: new Map([['defaultLine', 'P']]),
			frameOptions: new Map([
				['charCounter_type', 'char'],
				['resizingBar', true]
			]),
			range,
			formatEl,
			selectionNode: textNode,
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

	it('should push componentDeselect action', () => {
		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(actions[0]).toEqual(A.componentDeselect());
		expect(result).toBe(true);
	});

	it('should handle enter for BR insertion', () => {
		const div = document.createElement('div');
		const textNode = document.createTextNode('text');
		div.appendChild(textNode);
		wysiwygDiv.appendChild(div);

		mockCtx.shift = false;
		mockCtx.formatEl = div;
		mockCtx.selectionNode = textNode;
		mockPorts.format.getBrLine.mockReturnValue(div);
		mockPorts.format.isBrLine.mockReturnValue(true);

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
		expect(actions.some(a => a.t === 'enter.format.insertBrNode')).toBe(true);
	});

	it('should handle normal enter in paragraph', () => {
		const newRange = document.createRange();
		newRange.setStart(textNode, 5);
		newRange.setEnd(textNode, 5);
		mockCtx.range = newRange;

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'event.prevent')).toBe(true);
		expect(result).toBe(true);
	});

	it('should handle enter in list item', () => {
		const ul = document.createElement('ul');
		const li = document.createElement('li');
		li.appendChild(document.createTextNode('Item'));
		ul.appendChild(li);
		wysiwygDiv.appendChild(ul);

		mockCtx.formatEl = li;
		mockCtx.selectionNode = li.firstChild;
		mockPorts.format.getLine.mockReturnValue(li);
		mockPorts.format.getBlock.mockReturnValue(ul);

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'event.prevent')).toBe(true);
		expect(result).toBe(true);
	});

	it('should handle enter in empty list item to exit list', () => {
		const ul = document.createElement('ul');
		const li = document.createElement('li');
		const br = document.createElement('br');
		li.appendChild(br);
		ul.appendChild(li);
		wysiwygDiv.appendChild(ul);

		mockCtx.formatEl = li;
		mockCtx.selectionNode = li;
		mockPorts.format.getLine.mockReturnValue(li);
		mockPorts.format.getBlock.mockReturnValue(ul);

		const newRange = document.createRange();
		newRange.setStart(li, 0);
		newRange.setEnd(li, 0);
		mockCtx.range = newRange;

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
		expect(actions.some(a => a.t === 'enter.format.exitEmpty')).toBe(true);
	});

	it('should handle enter at start of heading', () => {
		const h1 = document.createElement('h1');
		const headingText = document.createTextNode('Heading');
		h1.appendChild(headingText);
		wysiwygDiv.appendChild(h1);

		mockCtx.formatEl = h1;
		mockCtx.selectionNode = headingText;
		mockPorts.format.getLine.mockReturnValue(h1);
		mockPorts.format.isEdgeLine.mockReturnValue(true);

		const newRange = document.createRange();
		newRange.setStart(headingText, 0);
		newRange.setEnd(headingText, 0);
		mockCtx.range = newRange;

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(mockPorts.enterPrevent).toHaveBeenCalled();
		expect(result).toBe(true);
	});

	it('should handle enter at end of heading to add default line', () => {
		const h1 = document.createElement('h1');
		const headingText = document.createTextNode('Heading');
		h1.appendChild(headingText);
		wysiwygDiv.appendChild(h1);

		mockCtx.formatEl = h1;
		mockCtx.selectionNode = headingText;
		mockPorts.format.getLine.mockReturnValue(h1);
		mockPorts.format.isEdgeLine.mockReturnValue(true);

		const newRange = document.createRange();
		newRange.setStart(headingText, headingText.length);
		newRange.setEnd(headingText, headingText.length);
		mockCtx.range = newRange;

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(mockPorts.enterPrevent).toHaveBeenCalled();
		expect(result).toBe(true);
		expect(actions.some(a => a.t === 'enter.line.addDefault')).toBe(true);
	});

	it('should handle enter with selection range', () => {
		const newRange = document.createRange();
		newRange.setStart(textNode, 0);
		newRange.setEnd(textNode, 5);
		mockCtx.range = newRange;

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'event.prevent')).toBe(true);
		expect(actions.some(a => a.t === 'enter.format.breakWithSelection')).toBe(true);
		expect(result).toBe(true);
	});

	it('should handle enter in figcaption within list', () => {
		const figure = document.createElement('figure');
		const figcaption = document.createElement('figcaption');
		const ul = document.createElement('ul');
		const li = document.createElement('li');
		const captionText = document.createTextNode('Caption');
		li.appendChild(captionText);
		ul.appendChild(li);
		figcaption.appendChild(ul);
		figure.appendChild(figcaption);
		wysiwygDiv.appendChild(figure);

		mockCtx.formatEl = li;
		mockCtx.selectionNode = captionText;
		mockCtx.shift = true;
		mockPorts.format.getLine.mockReturnValue(li);
		mockPorts.format.getBlock.mockReturnValue(ul);

		const newRange = document.createRange();
		newRange.setStart(captionText, 3);
		newRange.setEnd(captionText, 3);
		mockCtx.range = newRange;

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(mockPorts.enterPrevent).toHaveBeenCalled();
		expect(result).toBe(true);
	});

	it('should handle enter in BR line', () => {
		const div = document.createElement('div');
		const br = document.createElement('br');
		div.appendChild(br);
		wysiwygDiv.appendChild(div);

		mockCtx.shift = false;
		mockCtx.formatEl = div;
		mockCtx.selectionNode = div;
		mockPorts.format.getBrLine.mockReturnValue(div);
		mockPorts.format.isBrLine.mockReturnValue(true);

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(mockPorts.enterPrevent).toHaveBeenCalled();
		expect(result).toBe(true);
	});

	it('should handle enter to split paragraph at cursor', () => {
		const newRange = document.createRange();
		newRange.setStart(textNode, 5);
		newRange.setEnd(textNode, 5);
		mockCtx.range = newRange;

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'event.prevent')).toBe(true);
		expect(result).toBe(true);
		expect(actions.some(a => a.t === 'enter.format.breakAtCursor')).toBe(true);
	});

	it('should add scrollTo action', () => {
		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'enter.scrollTo')).toBe(true);
		expect(result).toBe(true);
	});

	it('should handle nested list enter', () => {
		const ul = document.createElement('ul');
		const li1 = document.createElement('li');
		const nestedUl = document.createElement('ul');
		const li2 = document.createElement('li');
		li2.appendChild(document.createTextNode('Nested item'));
		nestedUl.appendChild(li2);
		li1.appendChild(document.createTextNode('Parent item'));
		li1.appendChild(nestedUl);
		ul.appendChild(li1);
		wysiwygDiv.appendChild(ul);

		mockCtx.formatEl = li2;
		mockCtx.selectionNode = li2.firstChild;
		mockPorts.format.getLine.mockReturnValue(li2);
		mockPorts.format.getBlock.mockReturnValue(nestedUl);

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'event.prevent')).toBe(true);
		expect(result).toBe(true);
	});

	it('should add prevent action', () => {
		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'event.prevent')).toBe(true);
		expect(result).toBe(true);
	});

	it('should handle enter in BR mode', () => {
		const div = document.createElement('div');
		const br = document.createElement('br');
		div.appendChild(br);
		wysiwygDiv.appendChild(div);

		mockCtx.shift = false;
		mockCtx.formatEl = div;
		mockCtx.selectionNode = div;
		mockPorts.format.getBrLine.mockReturnValue(div);
		mockPorts.format.isBrLine.mockReturnValue(true);

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(mockPorts.enterPrevent).toHaveBeenCalled();
		expect(result).toBe(true);
	});

	it('should handle enter at edge of format element', () => {
		mockPorts.format.isEdgeLine.mockReturnValue(true);

		const newRange = document.createRange();
		newRange.setStart(textNode, 0);
		newRange.setEnd(textNode, 0);
		mockCtx.range = newRange;

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(mockPorts.enterPrevent).toHaveBeenCalled();
		expect(result).toBe(true);
	});

	it('should handle enter with closure block', () => {
		const blockquote = document.createElement('blockquote');
		const p = document.createElement('p');
		p.appendChild(document.createTextNode('Quote'));
		blockquote.appendChild(p);
		wysiwygDiv.appendChild(blockquote);

		mockCtx.formatEl = p;
		mockCtx.selectionNode = p.firstChild;
		mockPorts.format.getLine.mockReturnValue(p);
		mockPorts.format.getBlock.mockReturnValue(p);
		mockPorts.format.isClosureBlock.mockReturnValue(true);
		mockPorts.format.isLine.mockReturnValue(true);

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(mockPorts.enterPrevent).toHaveBeenCalled();
		expect(result).toBe(true);
	});

	// Edge case tests for byte-html charCounter
	it('should prevent enter when byte-html char limit exceeded with shift', () => {
		mockCtx.frameOptions.set('charCounter_type', 'byte-html');
		mockCtx.shift = true;

		mockPorts.char = {
			check: jest.fn().mockReturnValue(false)
		};

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'event.prevent')).toBe(true);
		expect(result).toBe(false);
	});

	it('should prevent enter when byte-html char limit exceeded without shift', () => {
		mockCtx.frameOptions.set('charCounter_type', 'byte-html');
		mockCtx.shift = false;
		mockPorts.format.getBrLine.mockReturnValue(null);

		mockPorts.char = {
			check: jest.fn().mockReturnValue(false)
		};

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'event.prevent')).toBe(true);
		expect(result).toBe(false);
	});

	it('should handle enter with HR element', () => {
		const hr = document.createElement('hr');
		wysiwygDiv.appendChild(hr);

		mockCtx.formatEl = hr;
		mockCtx.selectionNode = hr;
		mockPorts.format.getLine.mockReturnValue(hr);
		mockPorts.format.isEdgeLine.mockReturnValue(true);

		const newRange = document.createRange();
		newRange.setStart(hr, 0);
		newRange.setEnd(hr, 0);
		mockCtx.range = newRange;

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	it('should handle enter when next sibling is a list', () => {
		const p = document.createElement('p');
		const ul = document.createElement('ul');
		const li = document.createElement('li');
		li.appendChild(document.createTextNode('Item'));
		ul.appendChild(li);

		const textNode = document.createTextNode('Text');
		p.appendChild(textNode);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(p);
		wysiwygDiv.appendChild(ul);

		mockCtx.formatEl = p;
		mockCtx.selectionNode = textNode;
		mockPorts.format.getLine.mockReturnValue(p);
		mockPorts.format.getBlock.mockReturnValue(wysiwygDiv);

		const newRange = document.createRange();
		newRange.setStart(textNode, textNode.length);
		newRange.setEnd(textNode, textNode.length);
		mockCtx.range = newRange;

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	it('should handle enter in table cell', () => {
		const table = document.createElement('table');
		const tbody = document.createElement('tbody');
		const tr = document.createElement('tr');
		const td = document.createElement('td');
		const p = document.createElement('p');
		const textNode = document.createTextNode('Cell');

		p.appendChild(textNode);
		td.appendChild(p);
		tr.appendChild(td);
		tbody.appendChild(tr);
		table.appendChild(tbody);
		wysiwygDiv.appendChild(table);

		mockCtx.formatEl = p;
		mockCtx.selectionNode = textNode;
		mockPorts.format.getLine.mockReturnValue(p);
		mockPorts.format.getBlock.mockReturnValue(td);

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	it('should handle shift+enter in BR line with closure', () => {
		const div = document.createElement('div');
		const br = document.createElement('br');
		div.appendChild(br);
		wysiwygDiv.appendChild(div);

		mockCtx.shift = true;
		mockCtx.formatEl = div;
		mockCtx.selectionNode = div;
		mockPorts.format.getBrLine.mockReturnValue(div);
		mockPorts.format.isBrLine.mockReturnValue(true);
		mockPorts.format.isClosureBrLine.mockReturnValue(true);
		mockPorts.format.isClosureBlock.mockReturnValue(false);
		mockPorts.format.getBlock.mockReturnValue(null);

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	it('should handle enter with non-collapsed selectRange', () => {
		mockCtx.shift = true;

		const newRange = document.createRange();
		newRange.setStart(textNode, 0);
		newRange.setEnd(textNode, 5);
		mockCtx.range = newRange;

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'enter.scrollTo')).toBe(true);
		expect(result).toBe(true);
	});

	it('should handle enter when formatEl is null', () => {
		mockCtx.formatEl = null;
		mockCtx.shift = false;

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	it('should handle enter in figcaption not in list', () => {
		const figure = document.createElement('figure');
		const figcaption = document.createElement('figcaption');
		const captionText = document.createTextNode('Caption');
		figcaption.appendChild(captionText);
		figure.appendChild(figcaption);
		wysiwygDiv.appendChild(figure);

		mockCtx.formatEl = figcaption;
		mockCtx.selectionNode = captionText;
		mockCtx.shift = true;
		mockPorts.format.getLine.mockReturnValue(figcaption);
		mockPorts.format.getBlock.mockReturnValue(figure);

		const result = reduceEnterDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});
});
