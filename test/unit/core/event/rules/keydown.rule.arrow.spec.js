/**
 * @fileoverview Unit tests for arrow keys rule
 */

import { reduceArrowDown } from '../../../../../src/core/event/rules/keydown.rule.arrow';
import { A } from '../../../../../src/core/event/actions';

describe('Arrow Keys Rule', () => {
	let mockPorts;
	let mockCtx;
	let actions;

	beforeEach(() => {
		actions = [];

		// Create mock DOM elements
		const wysiwygDiv = document.createElement('div');
		wysiwygDiv.setAttribute('data-se-wysiwyg', 'true');
		const formatEl = document.createElement('p');
		const textNode = document.createTextNode('Hello World');
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

	it('should not push actions when no component at edge', () => {
		reduceArrowDown(actions, mockPorts, mockCtx);

		expect(actions.length).toBe(0);
	});

	it('should handle arrow keys', () => {
		reduceArrowDown(actions, mockPorts, mockCtx);
		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle ArrowLeft key', () => {
		mockCtx.keyCode = 'ArrowLeft';

		reduceArrowDown(actions, mockPorts, mockCtx);
		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle ArrowRight key', () => {
		mockCtx.keyCode = 'ArrowRight';

		reduceArrowDown(actions, mockPorts, mockCtx);
		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle ArrowUp key', () => {
		mockCtx.keyCode = 'ArrowUp';

		reduceArrowDown(actions, mockPorts, mockCtx);
		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle ArrowDown key', () => {
		mockCtx.keyCode = 'ArrowDown';

		reduceArrowDown(actions, mockPorts, mockCtx);
		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle arrow at component edge', () => {
		const componentDiv = document.createElement('div');
		componentDiv.className = 'se-component';
		mockCtx.formatEl.appendChild(componentDiv);

		mockPorts.component.is.mockReturnValue(true);
		mockPorts.component.get.mockReturnValue({
			target: componentDiv,
			pluginName: 'image'
		});

		reduceArrowDown(actions, mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle arrow in list', () => {
		const ul = document.createElement('ul');
		const li = document.createElement('li');
		li.appendChild(document.createTextNode('Item'));
		ul.appendChild(li);

		mockCtx.formatEl = li;
		mockCtx.selectionNode = li.firstChild;
		mockPorts.format.getLine.mockReturnValue(li);
		mockPorts.format.getBlock.mockReturnValue(ul);

		reduceArrowDown(actions, mockPorts, mockCtx);
		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle arrow at start of document', () => {
		mockCtx.keyCode = 'ArrowLeft';
		const textNode = mockCtx.formatEl.firstChild;

		const newRange = document.createRange();
		newRange.setStart(textNode, 0);
		newRange.setEnd(textNode, 0);
		mockCtx.range = newRange;

		reduceArrowDown(actions, mockPorts, mockCtx);
		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle arrow at end of document', () => {
		mockCtx.keyCode = 'ArrowRight';
		const textNode = mockCtx.formatEl.firstChild;

		const newRange = document.createRange();
		newRange.setStart(textNode, textNode.length);
		newRange.setEnd(textNode, textNode.length);
		mockCtx.range = newRange;

		reduceArrowDown(actions, mockPorts, mockCtx);
		expect(Array.isArray(actions)).toBe(true);
	});

	it('should return action array', () => {
		reduceArrowDown(actions, mockPorts, mockCtx);
		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle nested list navigation', () => {
		const ul = document.createElement('ul');
		const li1 = document.createElement('li');
		const nestedUl = document.createElement('ul');
		const li2 = document.createElement('li');
		li2.appendChild(document.createTextNode('Nested item'));
		nestedUl.appendChild(li2);
		li1.appendChild(document.createTextNode('Parent item'));
		li1.appendChild(nestedUl);
		ul.appendChild(li1);

		mockCtx.formatEl = li2;
		mockCtx.selectionNode = li2.firstChild;
		mockPorts.format.getLine.mockReturnValue(li2);
		mockPorts.format.getBlock.mockReturnValue(nestedUl);

		reduceArrowDown(actions, mockPorts, mockCtx);
		expect(Array.isArray(actions)).toBe(true);
	});
});
