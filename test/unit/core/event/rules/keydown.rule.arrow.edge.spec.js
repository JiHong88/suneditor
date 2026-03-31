/**
 * @fileoverview Edge case tests for arrow keys rule
 */

import { reduceArrowDown } from '../../../../../src/core/event/rules/keydown.rule.arrow';
import { A } from '../../../../../src/core/event/actions';

describe('Arrow Keys Rule - Edge Cases', () => {
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
			options: new Map([['defaultLine', 'P']]),
			range,
			formatEl,
			selectionNode: textNode,
			keyCode: 'ArrowRight',
			e: {
				preventDefault: jest.fn(),
				stopPropagation: jest.fn()
			}
		};
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('should select component when arrow up at previous sibling component', () => {
		const p1 = document.createElement('p');
		const img = document.createElement('img');
		img.src = 'test.jpg';
		img.className = 'se-component';
		const p2 = document.createElement('p');

		p1.appendChild(img);
		p2.appendChild(document.createTextNode('Text'));

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(p1);
		wysiwygDiv.appendChild(p2);

		mockCtx.formatEl = p2;
		mockCtx.keyCode = 'ArrowUp';

		mockPorts.component.is.mockReturnValue(true);
		mockPorts.component.get.mockReturnValue({
			target: img,
			pluginName: 'image',
			options: {}
		});

		reduceArrowDown(actions, mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'event.prevent')).toBe(true);
		expect(actions.some(a => a.t === 'select.component.fallback')).toBe(true);
	});

	it('should select component when arrow down at next sibling component', () => {
		const p1 = document.createElement('p');
		const p2 = document.createElement('p');
		const img = document.createElement('img');
		img.src = 'test.jpg';
		img.className = 'se-component';

		p1.appendChild(document.createTextNode('Text'));
		p2.appendChild(img);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(p1);
		wysiwygDiv.appendChild(p2);

		mockCtx.formatEl = p1;
		mockCtx.keyCode = 'ArrowDown';

		mockPorts.component.is.mockReturnValue(true);
		mockPorts.component.get.mockReturnValue({
			target: img,
			pluginName: 'image',
			options: {}
		});

		reduceArrowDown(actions, mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'event.prevent')).toBe(true);
	});

	it('should select component when arrow left at edge with previous component', () => {
		const img = document.createElement('img');
		img.src = 'test.jpg';
		img.className = 'se-component';

		formatEl.insertBefore(img, textNode);

		const newRange = document.createRange();
		newRange.setStart(textNode, 0);
		newRange.setEnd(textNode, 0);
		mockCtx.range = newRange;
		mockCtx.keyCode = 'ArrowLeft';

		mockPorts.component.is.mockReturnValue(true);
		mockPorts.component.get.mockReturnValue({
			target: img,
			pluginName: 'image',
			options: {}
		});

		reduceArrowDown(actions, mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'event.prevent')).toBe(true);
	});

	it('should select component when arrow right at edge with next component', () => {
		const img = document.createElement('img');
		img.src = 'test.jpg';
		img.className = 'se-component';

		formatEl.appendChild(img);

		const newRange = document.createRange();
		newRange.setStart(textNode, textNode.length);
		newRange.setEnd(textNode, textNode.length);
		mockCtx.range = newRange;
		mockCtx.keyCode = 'ArrowRight';

		mockPorts.component.is.mockReturnValue(true);
		mockPorts.component.get.mockReturnValue({
			target: img,
			pluginName: 'image',
			options: {}
		});

		reduceArrowDown(actions, mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'event.prevent')).toBe(true);
	});

	it('should not select input component', () => {
		const img = document.createElement('img');
		img.src = 'test.jpg';
		img.className = 'se-component';

		formatEl.appendChild(img);

		const newRange = document.createRange();
		newRange.setStart(textNode, textNode.length);
		newRange.setEnd(textNode, textNode.length);
		mockCtx.range = newRange;
		mockCtx.keyCode = 'ArrowRight';

		mockPorts.component.is.mockReturnValue(true);
		mockPorts.component.get.mockReturnValue({
			target: img,
			pluginName: 'input',
			options: {
				isInputComponent: true
			}
		});

		reduceArrowDown(actions, mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'event.prevent')).toBe(false);
	});

	it('should handle arrow left with component at previous format element', () => {
		const p1 = document.createElement('p');
		const img = document.createElement('img');
		img.src = 'test.jpg';
		img.className = 'se-component';
		p1.appendChild(img);

		const p2 = document.createElement('p');
		const text = document.createTextNode('Text');
		p2.appendChild(text);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(p1);
		wysiwygDiv.appendChild(p2);

		mockCtx.formatEl = p2;
		mockCtx.selectionNode = text;
		mockCtx.keyCode = 'ArrowLeft';

		const newRange = document.createRange();
		newRange.setStart(text, 0);
		newRange.setEnd(text, 0);
		mockCtx.range = newRange;

		mockPorts.component.is.mockReturnValue(true);
		mockPorts.component.get.mockReturnValue({
			target: img,
			pluginName: 'image',
			options: {}
		});

		reduceArrowDown(actions, mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'event.prevent')).toBe(true);
	});

	it('should handle arrow right with component at next format element', () => {
		const p1 = document.createElement('p');
		const text = document.createTextNode('Text');
		p1.appendChild(text);

		const p2 = document.createElement('p');
		const img = document.createElement('img');
		img.src = 'test.jpg';
		img.className = 'se-component';
		p2.appendChild(img);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(p1);
		wysiwygDiv.appendChild(p2);

		mockCtx.formatEl = p1;
		mockCtx.selectionNode = text;
		mockCtx.keyCode = 'ArrowRight';

		const newRange = document.createRange();
		newRange.setStart(text, text.length);
		newRange.setEnd(text, text.length);
		mockCtx.range = newRange;

		mockPorts.component.is.mockReturnValue(true);
		mockPorts.component.get.mockReturnValue({
			target: img,
			pluginName: 'image',
			options: {}
		});

		reduceArrowDown(actions, mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'event.prevent')).toBe(true);
	});

	it('should handle arrow in middle of text without component', () => {
		const newRange = document.createRange();
		newRange.setStart(textNode, 5);
		newRange.setEnd(textNode, 5);
		mockCtx.range = newRange;
		mockCtx.keyCode = 'ArrowRight';

		reduceArrowDown(actions, mockPorts, mockCtx);

		expect(actions.length).toBe(0);
	});

	it('should handle arrow with multiple components', () => {
		const img1 = document.createElement('img');
		img1.src = 'test1.jpg';
		img1.className = 'se-component';
		const img2 = document.createElement('img');
		img2.src = 'test2.jpg';
		img2.className = 'se-component';

		formatEl.innerHTML = '';
		formatEl.appendChild(img1);
		formatEl.appendChild(textNode);
		formatEl.appendChild(img2);

		const newRange = document.createRange();
		newRange.setStart(textNode, textNode.length);
		newRange.setEnd(textNode, textNode.length);
		mockCtx.range = newRange;
		mockCtx.keyCode = 'ArrowRight';

		mockPorts.component.is.mockReturnValue(true);
		mockPorts.component.get.mockReturnValue({
			target: img2,
			pluginName: 'image',
			options: {}
		});

		reduceArrowDown(actions, mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'event.prevent')).toBe(true);
	});

	it('should handle arrow keys in empty paragraph', () => {
		const emptyP = document.createElement('p');
		const br = document.createElement('br');
		emptyP.appendChild(br);

		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(emptyP);

		mockCtx.formatEl = emptyP;
		mockCtx.selectionNode = emptyP;
		mockCtx.keyCode = 'ArrowRight';

		const newRange = document.createRange();
		newRange.setStart(emptyP, 0);
		newRange.setEnd(emptyP, 0);
		mockCtx.range = newRange;

		reduceArrowDown(actions, mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle arrow in deeply nested structure', () => {
		const div = document.createElement('div');
		const blockquote = document.createElement('blockquote');
		const p = document.createElement('p');
		const span = document.createElement('span');
		const text = document.createTextNode('Nested');

		span.appendChild(text);
		p.appendChild(span);
		blockquote.appendChild(p);
		div.appendChild(blockquote);
		wysiwygDiv.innerHTML = '';
		wysiwygDiv.appendChild(div);

		mockCtx.formatEl = p;
		mockCtx.selectionNode = text;
		mockCtx.keyCode = 'ArrowRight';

		const newRange = document.createRange();
		newRange.setStart(text, text.length);
		newRange.setEnd(text, text.length);
		mockCtx.range = newRange;

		reduceArrowDown(actions, mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
	});
});
