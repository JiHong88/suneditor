/**
 * @fileoverview Unit tests for delete rule
 */

import { reduceDeleteDown } from '../../../../../src/core/event/rules/keydown.rule.delete';
import { A } from '../../../../../src/core/event/actions';

describe('Delete Rule', () => {
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
			focusManager: {
				focus: jest.fn(),
				blur: jest.fn(),
				focusEdge: jest.fn(),
				nativeFocus: jest.fn()
			}
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

	it('should push componentDeselect and cacheStyleNode actions', () => {
		const result = reduceDeleteDown(actions, mockPorts, mockCtx);

		expect(actions[0]).toEqual(A.componentDeselect());
		expect(actions[1]).toEqual(A.cacheStyleNode());
		expect(result).toBe(true);
	});

	it('should return true for normal delete', () => {
		const result = reduceDeleteDown(actions, mockPorts, mockCtx);
		expect(result).toBe(true);
	});

	it('should handle non-collapsed range', () => {
		const p1 = document.createElement('p');
		const p2 = document.createElement('p');
		p1.appendChild(document.createTextNode('Start'));
		p2.appendChild(document.createTextNode('End'));
		wysiwygDiv.appendChild(p1);
		wysiwygDiv.appendChild(p2);

		const newRange = document.createRange();
		newRange.setStart(p1.firstChild, 0);
		newRange.setEnd(p2.firstChild, 3);

		mockCtx.range = newRange;
		mockPorts.selection.getRange.mockReturnValue(newRange);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);
		expect(result).toBe(true);
	});

	it('should handle delete at end of line with next element', () => {
		// Create next element
		const nextElement = document.createElement('p');
		nextElement.appendChild(document.createTextNode('Next'));

		// Rebuild DOM
		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(formatEl);
		wysiwygDiv.appendChild(nextElement);

		mockPorts.format.isEdgeLine.mockReturnValue(true);
		mockPorts.format.isLine.mockReturnValue(true);

		const newRange = document.createRange();
		newRange.setStart(textNode, textNode.length);
		newRange.setEnd(textNode, textNode.length);
		mockCtx.range = newRange;

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);
		expect(result).toBe(true);
	});

	it('should handle delete with component at next position', () => {
		const img = document.createElement('img');
		img.src = 'test.jpg';

		// Append img after textNode
		formatEl.appendChild(img);

		mockPorts.component.is.mockReturnValue(true);
		mockPorts.component.get.mockReturnValue({
			target: img,
			pluginName: 'image'
		});

		mockCtx.selectionNode = textNode;

		const newRange = document.createRange();
		newRange.setStart(textNode, textNode.length);
		newRange.setEnd(textNode, textNode.length);
		mockCtx.range = newRange;

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);
		expect(result).toBe(true);
	});

	it('should handle delete in list', () => {
		const ul = document.createElement('ul');
		const li = document.createElement('li');
		li.appendChild(document.createTextNode('Item'));
		ul.appendChild(li);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(ul);

		mockCtx.formatEl = li;
		mockCtx.selectionNode = li.firstChild;
		mockPorts.format.getLine.mockReturnValue(li);
		mockPorts.format.getBlock.mockReturnValue(ul);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);
		expect(result).toBe(true);
	});

	it('should handle delete at end of last element', () => {
		// Ensure formatEl is the last child
		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(formatEl);

		const newRange = document.createRange();
		newRange.setStart(textNode, textNode.length);
		newRange.setEnd(textNode, textNode.length);
		mockCtx.range = newRange;
		mockCtx.selectionNode = textNode;

		mockPorts.format.isLine.mockReturnValue(true);
		mockPorts.format.isBrLine.mockReturnValue(false);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);
		expect(result).not.toBeUndefined();
	});

	it('should handle nested list delete', () => {
		const ul = document.createElement('ul');
		const li = document.createElement('li');
		const nestedUl = document.createElement('ul');
		const nestedLi = document.createElement('li');

		nestedLi.appendChild(document.createTextNode('Nested'));
		nestedUl.appendChild(nestedLi);
		li.appendChild(document.createTextNode('Parent'));
		li.appendChild(nestedUl);
		ul.appendChild(li);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(ul);

		mockCtx.formatEl = nestedLi;
		mockCtx.selectionNode = nestedLi.firstChild;

		const newRange = document.createRange();
		newRange.setStart(nestedLi.firstChild, nestedLi.firstChild.length);
		newRange.setEnd(nestedLi.firstChild, nestedLi.firstChild.length);
		mockCtx.range = newRange;

		mockPorts.format.getLine.mockReturnValue(nestedLi);
		mockPorts.format.getBlock.mockReturnValue(nestedUl);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);
		expect(result).toBe(true);
	});

	it('should add actions array', () => {
		reduceDeleteDown(actions, mockPorts, mockCtx);
		expect(Array.isArray(actions)).toBe(true);
		expect(actions.length).toBeGreaterThan(0);
	});

	it('should handle format attributes caching with next element', () => {
		// Create next element with attributes
		const nextElement = document.createElement('p');
		nextElement.setAttribute('class', 'test-class');
		nextElement.setAttribute('data-value', 'test');
		nextElement.appendChild(document.createTextNode('Next'));

		// Rebuild DOM
		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(formatEl);
		wysiwygDiv.appendChild(nextElement);

		mockPorts.format.isEdgeLine.mockReturnValue(true);
		mockPorts.format.isLine.mockReturnValue(true);

		const newRange = document.createRange();
		newRange.setStart(textNode, textNode.length);
		newRange.setEnd(textNode, textNode.length);
		mockCtx.range = newRange;

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);

		const cacheAction = actions.find(a => a.t === 'cache.formatAttrsTemp');
		if (cacheAction) {
			expect(cacheAction.p.attrs).toBeTruthy();
		}

		expect(result).toBe(true);
	});

	it('should handle delete with hardDelete scenario', () => {
		const table = document.createElement('table');
		const tbody = document.createElement('tbody');
		const tr1 = document.createElement('tr');
		const tr2 = document.createElement('tr');
		const td1 = document.createElement('td');
		const td2 = document.createElement('td');

		td1.appendChild(document.createTextNode('Cell 1'));
		td2.appendChild(document.createTextNode('Cell 2'));
		tr1.appendChild(td1);
		tr2.appendChild(td2);
		tbody.appendChild(tr1);
		tbody.appendChild(tr2);
		table.appendChild(tbody);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(table);

		const newRange = document.createRange();
		newRange.setStart(td1.firstChild, 0);
		newRange.setEnd(td2.firstChild, 6);
		mockCtx.range = newRange;

		mockPorts.format.getBlock.mockReturnValueOnce(td1).mockReturnValueOnce(td2);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);
		expect(result).toBe(true);
	});

	it('should handle delete between two paragraphs', () => {
		const p1 = document.createElement('p');
		const p2 = document.createElement('p');
		p1.appendChild(document.createTextNode('First'));
		p2.appendChild(document.createTextNode('Second'));

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(p1);
		wysiwygDiv.appendChild(p2);

		mockCtx.formatEl = p1;
		mockCtx.selectionNode = p1.firstChild;

		const newRange = document.createRange();
		newRange.setStart(p1.firstChild, p1.firstChild.length);
		newRange.setEnd(p1.firstChild, p1.firstChild.length);
		mockCtx.range = newRange;

		mockPorts.format.getLine.mockReturnValue(p1);
		mockPorts.format.isEdgeLine.mockReturnValue(true);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);
		expect(result).toBe(true);
	});

	it('should handle closure block scenario', () => {
		const blockquote = document.createElement('blockquote');
		const p = document.createElement('p');
		p.appendChild(document.createTextNode('Quote'));
		blockquote.appendChild(p);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(blockquote);

		mockCtx.formatEl = p;
		mockCtx.selectionNode = p.firstChild;

		const newRange = document.createRange();
		newRange.setStart(p.firstChild, p.firstChild.length);
		newRange.setEnd(p.firstChild, p.firstChild.length);
		mockCtx.range = newRange;

		mockPorts.format.getLine.mockReturnValue(p);
		mockPorts.format.isClosureBlock.mockReturnValue(true);
		mockPorts.format.isLine.mockReturnValue(true);

		const result = reduceDeleteDown(actions, mockPorts, mockCtx);
		expect(result).not.toBeUndefined();
	});
});
