/**
 * @fileoverview Edge case tests for tab rule
 */

import { reduceTabDown } from '../../../../../src/core/event/rules/keydown.rule.tab';
import { A } from '../../../../../src/core/event/actions';

describe('Tab Rule - Edge Cases', () => {
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
				getBlock: jest.fn().mockReturnValue(null)
			},
			component: {
				is: jest.fn().mockReturnValue(false),
				get: jest.fn().mockReturnValue(null)
			},
			selection: {
				getRange: jest.fn().mockReturnValue(range)
			}
		};

		mockCtx = {
			fc: new Map([['wysiwyg', wysiwygDiv]]),
			options: new Map([
				['defaultLine', 'P'],
				['tabDisable', false]
			]),
			range,
			formatEl,
			selectionNode: textNode,
			shift: false,
			ctrl: false,
			alt: false,
			e: {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			}
		};
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('should skip tab when ctrl is pressed', () => {
		mockCtx.ctrl = true;

		const result = reduceTabDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
		expect(actions.some(a => a.t === 'tab.format.indent')).toBe(false);
	});

	it('should skip tab when alt is pressed', () => {
		mockCtx.alt = true;

		const result = reduceTabDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
		expect(actions.some(a => a.t === 'tab.format.indent')).toBe(false);
	});

	it('should handle tab in list without previous sibling and shift', () => {
		const ul = document.createElement('ul');
		const li = document.createElement('li');
		li.appendChild(document.createTextNode('First item'));
		ul.appendChild(li);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(ul);

		mockCtx.formatEl = li;
		mockCtx.selectionNode = li.firstChild;
		mockCtx.shift = true;
		mockPorts.format.getLine.mockReturnValue(li);
		mockPorts.format.getBlock.mockReturnValue(ul);

		const result = reduceTabDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	it('should handle tab in ordered list', () => {
		const ol = document.createElement('ol');
		const li1 = document.createElement('li');
		const li2 = document.createElement('li');
		li1.appendChild(document.createTextNode('First'));
		li2.appendChild(document.createTextNode('Second'));
		ol.appendChild(li1);
		ol.appendChild(li2);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(ol);

		mockCtx.formatEl = li2;
		mockCtx.selectionNode = li2.firstChild;
		mockPorts.format.getLine.mockReturnValue(li2);
		mockPorts.format.getBlock.mockReturnValue(ol);

		const result = reduceTabDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
		expect(actions.some(a => a.t === 'tab.format.indent')).toBe(true);
	});

	it('should handle tab in mixed list (ul and ol)', () => {
		const ul = document.createElement('ul');
		const li1 = document.createElement('li');
		const ol = document.createElement('ol');
		const li2 = document.createElement('li');

		li2.appendChild(document.createTextNode('Ordered item'));
		ol.appendChild(li2);
		li1.appendChild(document.createTextNode('Unordered item'));
		li1.appendChild(ol);
		ul.appendChild(li1);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(ul);

		mockCtx.formatEl = li2;
		mockCtx.selectionNode = li2.firstChild;
		mockPorts.format.getLine.mockReturnValue(li2);
		mockPorts.format.getBlock.mockReturnValue(ol);

		const result = reduceTabDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	it('should handle tab in empty list item', () => {
		const ul = document.createElement('ul');
		const li = document.createElement('li');
		const br = document.createElement('br');
		li.appendChild(br);
		ul.appendChild(li);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(ul);

		mockCtx.formatEl = li;
		mockCtx.selectionNode = li;
		mockPorts.format.getLine.mockReturnValue(li);
		mockPorts.format.getBlock.mockReturnValue(ul);

		const result = reduceTabDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});

	it('should handle tab in blockquote', () => {
		const blockquote = document.createElement('blockquote');
		const p = document.createElement('p');
		const text = document.createTextNode('Quote');
		p.appendChild(text);
		blockquote.appendChild(p);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(blockquote);

		mockCtx.formatEl = p;
		mockCtx.selectionNode = text;
		mockPorts.format.getLine.mockReturnValue(p);
		mockPorts.format.getBlock.mockReturnValue(null);

		const result = reduceTabDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
		expect(actions.some(a => a.t === 'tab.format.indent')).toBe(true);
	});

	it('should handle tab with multiple spaces already present', () => {
		const spacedText = document.createTextNode('    Text with spaces');
		formatEl.innerHTML = '';
		formatEl.appendChild(spacedText);

		mockCtx.selectionNode = spacedText;

		const newRange = document.createRange();
		newRange.setStart(spacedText, 4);
		newRange.setEnd(spacedText, 4);
		mockCtx.range = newRange;

		const result = reduceTabDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
	});
});
