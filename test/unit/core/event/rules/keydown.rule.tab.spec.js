/**
 * @fileoverview Unit tests for tab rule
 */

import { reduceTabDown } from '../../../../../src/core/event/rules/keydown.rule.tab';
import { A } from '../../../../../src/core/event/actions';

describe('Tab Rule', () => {
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
			options: new Map([
				['defaultLine', 'P'],
				['tabDisable', false]
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

	it('should push prevent action', () => {
		const result = reduceTabDown(actions, mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'event.prevent')).toBe(true);
	});

	it('should return true when tabDisable is true', () => {
		mockCtx.options.set('tabDisable', true);

		const result = reduceTabDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
		expect(actions.length).toBe(0);
	});

	it('should handle tab in list to indent', () => {
		const ul = document.createElement('ul');
		const li = document.createElement('li');
		li.appendChild(document.createTextNode('Item'));
		ul.appendChild(li);

		mockCtx.formatEl = li;
		mockCtx.selectionNode = li.firstChild;
		mockPorts.format.getLine.mockReturnValue(li);
		mockPorts.format.getBlock.mockReturnValue(ul);

		const result = reduceTabDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
		expect(actions.some(a => a.t === 'tab.format.indent')).toBe(true);
		expect(actions.some(a => a.t === 'event.prevent')).toBe(true);
	});

	it('should handle shift+tab in list to outdent', () => {
		mockCtx.shift = true;

		const ul = document.createElement('ul');
		const li = document.createElement('li');
		li.appendChild(document.createTextNode('Item'));
		ul.appendChild(li);

		mockCtx.formatEl = li;
		mockCtx.selectionNode = li.firstChild;
		mockPorts.format.getLine.mockReturnValue(li);
		mockPorts.format.getBlock.mockReturnValue(ul);

		const result = reduceTabDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
		const indentAction = actions.find(a => a.t === 'tab.format.indent');
		expect(indentAction).toBeTruthy();
		expect(indentAction.p.shift).toBe(true);
	});

	it('should handle tab in normal paragraph when not disabled', () => {
		const result = reduceTabDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
		expect(actions.some(a => a.t === 'event.prevent')).toBe(true);
	});

	it('should handle tab in non-list context', () => {
		mockPorts.format.getBlock.mockReturnValue(null);

		const result = reduceTabDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
		expect(actions.some(a => a.t === 'tab.format.indent')).toBe(true);
	});

	it('should handle tab in nested list', () => {
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

		const result = reduceTabDown(actions, mockPorts, mockCtx);

		expect(result).toBe(true);
		expect(actions.some(a => a.t === 'tab.format.indent')).toBe(true);
	});

	it('should return action array', () => {
		reduceTabDown(actions, mockPorts, mockCtx);
		expect(Array.isArray(actions)).toBe(true);
		expect(actions.length).toBeGreaterThan(0);
	});

	it('should add prevent action for tab', () => {
		const result = reduceTabDown(actions, mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'event.prevent')).toBe(true);
		expect(result).toBe(true);
	});
});
