/**
 * @fileoverview Unit tests for keydown reducer
 */

import { reduceKeydown } from '../../../../../src/core/event/reducers/keydown.reducer';

describe('Keydown Reducer', () => {
	let mockPorts;
	let mockCtx;

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
			options: new Map([
				['defaultLine', 'P'],
				['tabDisable', false]
			]),
			frameOptions: new Map([
				['charCounter_type', 'char'],
				['resizingBar', true]
			]),
			range,
			formatEl,
			selectionNode: textNode,
			keyCode: 'Backspace',
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

	it('should handle Backspace keyCode', async () => {
		mockCtx.keyCode = 'Backspace';

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
		expect(actions.length).toBeGreaterThan(0);
	});

	it('should handle Delete keyCode', async () => {
		mockCtx.keyCode = 'Delete';

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
		expect(actions.length).toBeGreaterThan(0);
	});

	it('should handle Enter keyCode', async () => {
		mockCtx.keyCode = 'Enter';

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
		expect(actions.length).toBeGreaterThan(0);
	});

	it('should handle Tab keyCode', async () => {
		mockCtx.keyCode = 'Tab';

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle ArrowLeft keyCode', async () => {
		mockCtx.keyCode = 'ArrowLeft';

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle ArrowRight keyCode', async () => {
		mockCtx.keyCode = 'ArrowRight';

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle ArrowUp keyCode', async () => {
		mockCtx.keyCode = 'ArrowUp';

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle ArrowDown keyCode', async () => {
		mockCtx.keyCode = 'ArrowDown';

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle Tab with shift (outdent)', async () => {
		mockCtx.keyCode = 'Tab';
		mockCtx.shift = true;

		const ul = document.createElement('ul');
		const li = document.createElement('li');
		li.appendChild(document.createTextNode('Item'));
		ul.appendChild(li);

		mockCtx.formatEl = li;
		mockCtx.selectionNode = li.firstChild;
		mockPorts.format.getLine.mockReturnValue(li);
		mockPorts.format.getBlock.mockReturnValue(ul);

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
		expect(actions.length).toBeGreaterThan(0);
	});

	it('should handle Enter with shift (BR insertion)', async () => {
		mockCtx.keyCode = 'Enter';
		mockCtx.shift = true;
		mockPorts.format.isBrLine.mockReturnValue(false);

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
	});

	it('should return empty array for unknown keyCode', async () => {
		mockCtx.keyCode = 'KeyA';

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
		expect(actions.length).toBe(0);
	});

	it('should handle Enter in list', async () => {
		mockCtx.keyCode = 'Enter';

		const ul = document.createElement('ul');
		const li = document.createElement('li');
		li.appendChild(document.createTextNode('Item'));
		ul.appendChild(li);

		mockCtx.formatEl = li;
		mockCtx.selectionNode = li.firstChild;
		mockPorts.format.getLine.mockReturnValue(li);
		mockPorts.format.getBlock.mockReturnValue(ul);

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle Backspace at start of line', async () => {
		mockCtx.keyCode = 'Backspace';

		const prevEl = document.createElement('p');
		prevEl.appendChild(document.createTextNode('Previous'));
		mockCtx.formatEl.parentElement.insertBefore(prevEl, mockCtx.formatEl);

		const textNode = mockCtx.formatEl.firstChild;
		mockCtx.range.setStart(textNode, 0);
		mockCtx.range.setEnd(textNode, 0);
		mockCtx.selectionNode = textNode;

		mockPorts.format.isEdgeLine.mockReturnValue(true);

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle Delete at end of line', async () => {
		mockCtx.keyCode = 'Delete';

		const nextEl = document.createElement('p');
		nextEl.appendChild(document.createTextNode('Next'));
		mockCtx.formatEl.parentElement.appendChild(nextEl);

		const textNode = mockCtx.formatEl.firstChild;
		mockCtx.range.setStart(textNode, textNode.length);
		mockCtx.range.setEnd(textNode, textNode.length);
		mockCtx.selectionNode = textNode;

		mockPorts.format.isEdgeLine.mockReturnValue(true);

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle Tab in normal paragraph', async () => {
		mockCtx.keyCode = 'Tab';
		mockCtx.options.set('tabDisable', false);

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle Enter at start of heading', async () => {
		mockCtx.keyCode = 'Enter';

		const h1 = document.createElement('h1');
		const textNode = document.createTextNode('Heading');
		h1.appendChild(textNode);

		mockCtx.formatEl = h1;
		mockCtx.selectionNode = textNode;

		const newRange = document.createRange();
		newRange.setStart(textNode, 0);
		newRange.setEnd(textNode, 0);
		mockCtx.range = newRange;

		mockPorts.format.getLine.mockReturnValue(h1);
		mockPorts.format.isEdgeLine.mockReturnValue(true);

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle Backspace with component', async () => {
		mockCtx.keyCode = 'Backspace';

		const componentDiv = document.createElement('div');
		componentDiv.className = 'se-component';
		mockCtx.formatEl.appendChild(componentDiv);

		mockPorts.component.is.mockReturnValue(true);
		mockPorts.component.get.mockReturnValue({
			target: componentDiv,
			pluginName: 'image'
		});

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle arrow keys with component', async () => {
		mockCtx.keyCode = 'ArrowLeft';

		const componentDiv = document.createElement('div');
		componentDiv.className = 'se-component';
		mockCtx.formatEl.appendChild(componentDiv);

		mockPorts.component.is.mockReturnValue(true);
		mockPorts.component.get.mockReturnValue({
			target: componentDiv,
			pluginName: 'image'
		});

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle Shift+Ctrl+Space for nbsp insertion', async () => {
		mockCtx.keyCode = 'Space';
		mockCtx.shift = true;
		mockCtx.ctrl = true;
		mockCtx.alt = false;

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'keydown.input.insertNbsp')).toBe(true);
		expect(actions.some(a => a.t === 'event.prevent.stop')).toBe(true);
	});

	it('should handle text key in break element for ZWS insertion', async () => {
		mockCtx.keyCode = 'KeyA';
		mockCtx.ctrl = false;
		mockCtx.alt = false;

		const br = document.createElement('br');
		mockCtx.formatEl.innerHTML = '';
		mockCtx.formatEl.appendChild(br);

		const newRange = document.createRange();
		newRange.setStart(br, 0);
		newRange.setEnd(br, 0);
		mockCtx.range = newRange;

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'keydown.input.insertZWS')).toBe(true);
	});

	it('should handle documentType header refresh for selection changes', async () => {
		mockCtx.keyCode = 'KeyA';
		mockCtx.ctrl = false;
		mockCtx.alt = false;
		mockCtx.shift = false;
		mockCtx.fc.set('documentType_use_header', true);

		const wysiwygDiv = mockCtx.fc.get('wysiwyg');
		const p1 = document.createElement('p');
		const p2 = document.createElement('p');
		p1.appendChild(document.createTextNode('First'));
		p2.appendChild(document.createTextNode('Second'));
		wysiwygDiv.appendChild(p1);
		wysiwygDiv.appendChild(p2);

		const newRange = document.createRange();
		newRange.setStart(p1.firstChild, 0);
		newRange.setEnd(p2.firstChild, 3);
		mockCtx.range = newRange;

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(actions.some(a => a.t === 'documentType.refreshHeader')).toBe(true);
	});

	it('should handle key with no specific rule', async () => {
		mockCtx.keyCode = 'KeyF';

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle Space key normally', async () => {
		mockCtx.keyCode = 'Space';
		mockCtx.shift = false;
		mockCtx.ctrl = false;
		mockCtx.alt = false;

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
	});

	it('should handle collapsed range scenarios', async () => {
		mockCtx.keyCode = 'KeyB';

		const textNode = mockCtx.formatEl.firstChild;
		const newRange = document.createRange();
		newRange.setStart(textNode, 5);
		newRange.setEnd(textNode, 5);
		mockCtx.range = newRange;

		const actions = await reduceKeydown(mockPorts, mockCtx);

		expect(Array.isArray(actions)).toBe(true);
	});
});
