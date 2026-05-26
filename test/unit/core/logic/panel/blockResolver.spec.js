/**
 * @fileoverview Unit tests for core/logic/panel/blockResolver.js
 */

import { resolveBlock } from '../../../../../src/core/logic/panel/blockResolver';

/**
 * Create a mock wysiwyg frame element.
 */
function createWysiwyg() {
	const ww = document.createElement('div');
	ww.classList.add('se-wrapper-wysiwyg');
	return ww;
}

/**
 * Create mock format API.
 * getLine: walks up to find P, H1-H6, PRE, DIV, LI
 * getBlock: walks up to find BLOCKQUOTE, UL, OL, TABLE, THEAD, TBODY, TR, TD, TH
 * isLine: checks if element is a line-level format element
 * isBlock: checks if element is a block-level format element
 */
function createMockFormat() {
	const LINE_TAGS = /^(P|H[1-6]|PRE|DIV|LI)$/i;
	const BLOCK_TAGS = /^(BLOCKQUOTE|UL|OL|TABLE|THEAD|TBODY|TR|TD|TH|FIGCAPTION)$/i;

	return {
		getLine(node, validation) {
			while (node) {
				if (node.classList?.contains('se-wrapper-wysiwyg')) return null;
				if (node.nodeType === 1 && LINE_TAGS.test(node.nodeName)) return node;
				node = node.parentNode;
			}
			return null;
		},
		getBlock(element, validation) {
			while (element) {
				if (element.classList?.contains('se-wrapper-wysiwyg')) return null;
				if (element.nodeType === 1 && BLOCK_TAGS.test(element.nodeName) && !/^(THEAD|TBODY|TR)$/i.test(element.nodeName)) return element;
				element = element.parentNode;
			}
			return null;
		},
		isLine(element) {
			return element?.nodeType === 1 && LINE_TAGS.test(element.nodeName);
		},
		isBlock(element) {
			return element?.nodeType === 1 && BLOCK_TAGS.test(element.nodeName);
		}
	};
}

describe('resolveBlock', () => {
	let ww, format;

	beforeEach(() => {
		ww = createWysiwyg();
		format = createMockFormat();
	});

	it('returns null for null input', () => {
		expect(resolveBlock(null, format, ww)).toBeNull();
	});

	it('returns null for undefined wysiwyg frame', () => {
		const p = document.createElement('p');
		expect(resolveBlock(p, format, null)).toBeNull();
	});

	it('returns null for wysiwyg root itself', () => {
		expect(resolveBlock(ww, format, ww)).toBeNull();
	});

	it('resolves text node to parent paragraph', () => {
		const p = document.createElement('p');
		p.textContent = 'Hello world';
		ww.appendChild(p);

		const textNode = p.firstChild;
		const result = resolveBlock(textNode, format, ww);

		expect(result).not.toBeNull();
		expect(result.element).toBe(p);
		expect(result.type).toBe('p');
		expect(result.depth).toBe(0);
	});

	it('resolves inline element (strong) to parent paragraph', () => {
		const p = document.createElement('p');
		const strong = document.createElement('strong');
		strong.textContent = 'bold text';
		p.appendChild(strong);
		ww.appendChild(p);

		const result = resolveBlock(strong, format, ww);

		expect(result).not.toBeNull();
		expect(result.element).toBe(p);
		expect(result.type).toBe('p');
	});

	it('resolves paragraph directly', () => {
		const p = document.createElement('p');
		ww.appendChild(p);

		const result = resolveBlock(p, format, ww);

		expect(result).not.toBeNull();
		expect(result.element).toBe(p);
		expect(result.type).toBe('p');
		expect(result.depth).toBe(0);
	});

	it('resolves h2 as heading', () => {
		const h2 = document.createElement('h2');
		ww.appendChild(h2);

		const result = resolveBlock(h2, format, ww);

		expect(result).not.toBeNull();
		expect(result.element).toBe(h2);
		expect(result.type).toBe('heading');
		expect(result.depth).toBe(0);
	});

	it('resolves li to li itself as list-item', () => {
		const ul = document.createElement('ul');
		const li = document.createElement('li');
		li.textContent = 'item';
		ul.appendChild(li);
		ww.appendChild(ul);

		const result = resolveBlock(li, format, ww);

		expect(result).not.toBeNull();
		expect(result.element).toBe(li);
		expect(result.type).toBe('list-item');
	});

	it('resolves td to parent table', () => {
		const table = document.createElement('table');
		const tbody = document.createElement('tbody');
		const tr = document.createElement('tr');
		const td = document.createElement('td');
		td.textContent = 'cell';
		tr.appendChild(td);
		tbody.appendChild(tr);
		table.appendChild(tbody);
		ww.appendChild(table);

		const result = resolveBlock(td, format, ww);

		expect(result).not.toBeNull();
		expect(result.element).toBe(table);
		expect(result.type).toBe('table');
	});

	it('resolves nested p inside blockquote with depth 1', () => {
		const bq = document.createElement('blockquote');
		const p = document.createElement('p');
		p.textContent = 'quoted text';
		bq.appendChild(p);
		ww.appendChild(bq);

		const result = resolveBlock(p, format, ww);

		expect(result).not.toBeNull();
		expect(result.element).toBe(p);
		expect(result.type).toBe('p');
		expect(result.depth).toBe(1);
		expect(result.parent).toBe(bq);
	});

	it('resolves blockquote itself at depth 0', () => {
		const bq = document.createElement('blockquote');
		ww.appendChild(bq);

		// When blockquote is targeted directly (not a child line)
		// getLine returns null for blockquote, getBlock returns blockquote
		const result = resolveBlock(bq, format, ww);

		expect(result).not.toBeNull();
		expect(result.element).toBe(bq);
		expect(result.type).toBe('blockquote');
		expect(result.depth).toBe(0);
	});

	it('resolves pre element', () => {
		const pre = document.createElement('pre');
		pre.textContent = 'code here';
		ww.appendChild(pre);

		const result = resolveBlock(pre, format, ww);

		expect(result).not.toBeNull();
		expect(result.element).toBe(pre);
		expect(result.type).toBe('pre');
	});

	it('resolves figure element', () => {
		const figure = document.createElement('figure');
		ww.appendChild(figure);

		const result = resolveBlock(figure, format, ww);

		expect(result).not.toBeNull();
		expect(result.element).toBe(figure);
		expect(result.type).toBe('figure');
	});

	it('computes siblings correctly for middle block', () => {
		const p1 = document.createElement('p');
		const p2 = document.createElement('p');
		const p3 = document.createElement('p');
		ww.appendChild(p1);
		ww.appendChild(p2);
		ww.appendChild(p3);

		const result = resolveBlock(p2, format, ww);

		expect(result.siblings.prev).toBe(p1);
		expect(result.siblings.next).toBe(p3);
	});

	it('computes siblings correctly for first block', () => {
		const p1 = document.createElement('p');
		const p2 = document.createElement('p');
		ww.appendChild(p1);
		ww.appendChild(p2);

		const result = resolveBlock(p1, format, ww);

		expect(result.siblings.prev).toBeNull();
		expect(result.siblings.next).toBe(p2);
	});

	it('computes siblings correctly for last block', () => {
		const p1 = document.createElement('p');
		const p2 = document.createElement('p');
		ww.appendChild(p1);
		ww.appendChild(p2);

		const result = resolveBlock(p2, format, ww);

		expect(result.siblings.prev).toBe(p1);
		expect(result.siblings.next).toBeNull();
	});

	it('returns rect from getBoundingClientRect', () => {
		const p = document.createElement('p');
		ww.appendChild(p);

		const result = resolveBlock(p, format, ww);

		expect(result.rect).toBeDefined();
		// JSDOM returns zeroed DOMRect
		expect(result.rect).toHaveProperty('top');
		expect(result.rect).toHaveProperty('left');
	});
});
