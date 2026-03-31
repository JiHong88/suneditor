/**
 * @fileoverview Edge case tests for delete rule
 */

import { reduceDeleteDown } from '../../../../../src/core/event/rules/keydown.rule.delete';
import { A } from '../../../../../src/core/event/actions';

describe('Delete Rule - Edge Cases', () => {
	let mockPorts;
	let mockCtx;
	let actions;
	let wysiwygDiv;
	let formatEl;
	let textNode;

	beforeEach(() => {
		actions = [];

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
				getRange: jest.fn().mockReturnValue(range)
			},
			editor: {
				_nativeFocus: jest.fn()
			},
			setDefaultLine: jest.fn()
		};

		mockCtx = {
			fc: new Map([['wysiwyg', wysiwygDiv]]),
			options: new Map([['defaultLine', 'P']]),
			range,
			formatEl,
			selectionNode: textNode,
			e: {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			}
		};
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('should handle delete at end when no next element', () => {
		const newRange = document.createRange();
		newRange.setStart(textNode, textNode.length);
		newRange.setEnd(textNode, textNode.length);
		mockCtx.range = newRange;

		mockPorts.format.isEdgeLine.mockReturnValue(true);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);

		expect(result).toBe(false);
		expect(actions.some(a => a.t === 'event.prevent.stop')).toBe(true);
	});

	it('should handle delete with component at next position in list', () => {
		const ul = document.createElement('ul');
		const li = document.createElement('li');
		const text = document.createTextNode('Text');
		const img = document.createElement('img');
		img.src = 'test.jpg';

		li.appendChild(text);
		li.appendChild(img);
		ul.appendChild(li);
		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(ul);

		mockCtx.formatEl = li;
		mockCtx.selectionNode = text;

		const newRange = document.createRange();
		newRange.setStart(text, text.length);
		newRange.setEnd(text, text.length);
		mockCtx.range = newRange;

		mockPorts.component.is.mockReturnValue(true);
		mockPorts.component.get.mockReturnValue({
			target: img,
			pluginName: 'image'
		});

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	it('should handle delete in nested list with next sibling', () => {
		const ul = document.createElement('ul');
		const li1 = document.createElement('li');
		const li2 = document.createElement('li');
		const nestedUl = document.createElement('ul');
		const nestedLi1 = document.createElement('li');
		const nestedLi2 = document.createElement('li');

		nestedLi1.appendChild(document.createTextNode('Nested'));
		nestedLi2.appendChild(document.createTextNode('Nested2'));
		nestedUl.appendChild(nestedLi1);
		nestedUl.appendChild(nestedLi2);
		li1.appendChild(document.createTextNode('First'));
		li1.appendChild(nestedUl);
		li2.appendChild(document.createTextNode('Second'));
		ul.appendChild(li1);
		ul.appendChild(li2);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(ul);

		mockCtx.formatEl = nestedLi1;
		mockCtx.selectionNode = nestedLi1.firstChild;

		const newRange = document.createRange();
		newRange.setStart(nestedLi1.firstChild, 6);
		newRange.setEnd(nestedLi1.firstChild, 6);
		mockCtx.range = newRange;

		mockPorts.format.getLine.mockReturnValue(nestedLi1);
		mockPorts.format.getBlock.mockReturnValue(nestedUl);
		mockPorts.format.isEdgeLine.mockReturnValue(false);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	it('should handle delete with closure block at end', () => {
		const blockquote = document.createElement('blockquote');
		const p = document.createElement('p');
		const text = document.createTextNode('Quote');
		p.appendChild(text);
		blockquote.appendChild(p);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(blockquote);

		mockCtx.formatEl = p;
		mockCtx.selectionNode = text;

		const newRange = document.createRange();
		newRange.setStart(text, text.length);
		newRange.setEnd(text, text.length);
		mockCtx.range = newRange;

		mockPorts.format.getLine.mockReturnValue(p);
		mockPorts.format.isLine.mockReturnValue(true);
		mockPorts.format.isClosureBlock.mockReturnValue(true);
		mockPorts.format.isEdgeLine.mockReturnValue(true);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);

		expect(result).toBe(false);
		expect(actions.some(a => a.t === 'event.prevent.stop')).toBe(true);
	});

	it('should handle delete with non-editable next sibling', () => {
		const nonEditable = document.createElement('div');
		nonEditable.setAttribute('contenteditable', 'false');
		nonEditable.textContent = 'Non-editable';

		formatEl.appendChild(nonEditable);

		const newRange = document.createRange();
		newRange.setStart(textNode, textNode.length);
		newRange.setEnd(textNode, textNode.length);
		mockCtx.range = newRange;

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	it('should handle delete at end of BR line', () => {
		const div = document.createElement('div');
		const br = document.createElement('br');
		div.appendChild(br);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(div);

		mockCtx.formatEl = div;
		mockCtx.selectionNode = div;

		const newRange = document.createRange();
		newRange.setStart(div, 1);
		newRange.setEnd(div, 1);
		mockCtx.range = newRange;

		mockPorts.format.isLine.mockReturnValue(true);
		mockPorts.format.isBrLine.mockReturnValue(true);
		mockPorts.format.isEdgeLine.mockReturnValue(true);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);

		expect(result).toBe(false);
		expect(actions.some(a => a.t === 'event.prevent.stop')).toBe(true);
	});

	it('should handle delete with empty next line', () => {
		const p1 = document.createElement('p');
		const p2 = document.createElement('p');
		const br = document.createElement('br');
		p1.appendChild(document.createTextNode('Text'));
		p2.appendChild(br);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(p1);
		wysiwygDiv.appendChild(p2);

		mockCtx.formatEl = p1;
		mockCtx.selectionNode = p1.firstChild;

		const newRange = document.createRange();
		newRange.setStart(p1.firstChild, 4);
		newRange.setEnd(p1.firstChild, 4);
		mockCtx.range = newRange;

		mockPorts.format.isEdgeLine.mockReturnValue(true);
		mockPorts.format.isLine.mockReturnValue(true);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	it('should handle delete in table cell at edge', () => {
		const table = document.createElement('table');
		const tbody = document.createElement('tbody');
		const tr = document.createElement('tr');
		const td = document.createElement('td');
		const p = document.createElement('p');
		const text = document.createTextNode('Cell');

		p.appendChild(text);
		td.appendChild(p);
		tr.appendChild(td);
		tbody.appendChild(tr);
		table.appendChild(tbody);
		wysiwygDiv.appendChild(table);

		mockCtx.formatEl = p;
		mockCtx.selectionNode = text;

		const newRange = document.createRange();
		newRange.setStart(text, text.length);
		newRange.setEnd(text, text.length);
		mockCtx.range = newRange;

		mockPorts.format.getLine.mockReturnValue(p);
		mockPorts.format.getBlock.mockReturnValue(td);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	it('should handle delete with multiple BR elements', () => {
		const div = document.createElement('div');
		const br1 = document.createElement('br');
		const br2 = document.createElement('br');
		div.appendChild(br1);
		div.appendChild(br2);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(div);

		mockCtx.formatEl = div;
		mockCtx.selectionNode = div;

		const newRange = document.createRange();
		newRange.setStart(div, 0);
		newRange.setEnd(div, 0);
		mockCtx.range = newRange;

		mockPorts.format.isBrLine.mockReturnValue(true);
		mockPorts.format.getBrLine.mockReturnValue(div);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	it('should handle delete with zero-width space after cursor', () => {
		const zws = document.createTextNode('\u200B');
		const text = document.createTextNode('Text');

		formatEl.innerHTML = '';
		formatEl.appendChild(text);
		formatEl.appendChild(zws);

		mockCtx.selectionNode = text;

		const newRange = document.createRange();
		newRange.setStart(text, 4);
		newRange.setEnd(text, 4);
		mockCtx.range = newRange;

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});
});
