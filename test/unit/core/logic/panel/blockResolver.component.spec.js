/**
 * @jest-environment jsdom
 */

/**
 * @fileoverview `resolveBlock` used to bail out of every component, so images and tables never got a
 * block handle and could not be reordered like other blocks. Only a *top-level* component earns one —
 * a component nested in a table cell is left to its host, which already owns the hover UI there.
 */

import { resolveBlock } from '../../../../../src/core/logic/panel/blockResolver';

const format = {
	getLine: (node) => {
		let el = node?.nodeType === 3 ? node.parentNode : node;
		while (el && el.nodeType === 1) {
			if (/^(P|H[1-6]|LI|PRE)$/.test(el.nodeName)) return el;
			el = el.parentNode;
		}
		return null;
	},
	getBlock: (node) => {
		let el = node?.nodeType === 3 ? node.parentNode : node;
		while (el && el.nodeType === 1) {
			if (/^(BLOCKQUOTE|UL|OL|TABLE|DIV)$/.test(el.nodeName)) return el;
			el = el.parentNode;
		}
		return null;
	},
	isLine: (el) => /^(P|H[1-6]|LI|PRE)$/.test(el?.nodeName || ''),
	isBlock: (el) => /^(BLOCKQUOTE|UL|OL|TABLE)$/.test(el?.nodeName || ''),
};

/** Builds a wysiwyg root recognised by `isWysiwygFrame`. */
function createFrame(html) {
	const frame = document.createElement('div');
	frame.className = 'se-wrapper-inner se-wrapper-wysiwyg sun-editor-editable';
	frame.setAttribute('contenteditable', 'true');
	frame.innerHTML = html;
	document.body.appendChild(frame);
	return frame;
}

describe('blockResolver - components', () => {
	afterEach(() => {
		document.querySelectorAll('.se-wrapper-wysiwyg').forEach((el) => el.remove());
	});

	it('resolves a top-level image component to its container', () => {
		const frame = createFrame(
			'<p>before</p><div class="se-component se-image-container"><figure><img src="a.svg"></figure></div><p>after</p>',
		);
		const img = frame.querySelector('img');

		const block = resolveBlock(img, format, frame);

		expect(block).not.toBeNull();
		expect(block.element).toBe(frame.querySelector('.se-component'));
		expect(block.type).toBe('component');
	});

	it('resolves a top-level table component to its container', () => {
		const frame = createFrame(
			'<figure class="se-flex-component se-input-component"><table><tbody><tr><td>a</td></tr></tbody></table></figure>',
		);
		const cell = frame.querySelector('td');

		const block = resolveBlock(cell, format, frame);

		expect(block).not.toBeNull();
		expect(block.element).toBe(frame.querySelector('.se-flex-component'));
	});

	it('reports the component siblings so it can be reordered', () => {
		const frame = createFrame(
			'<p>before</p><div class="se-component se-image-container"><figure><img src="a.svg"></figure></div><p>after</p>',
		);

		const block = resolveBlock(frame.querySelector('img'), format, frame);

		expect(block.siblings.prev.nodeName).toBe('P');
		expect(block.siblings.next.nodeName).toBe('P');
		expect(block.depth).toBe(0);
	});

	it('leaves a component nested inside a table cell alone', () => {
		const frame = createFrame(
			'<figure class="se-flex-component"><table><tbody><tr><td>' +
				'<div class="se-component se-image-container"><figure><img src="a.svg"></figure></div>' +
				'</td></tr></tbody></table></figure>',
		);
		const nestedImg = frame.querySelector('td img');

		const block = resolveBlock(nestedImg, format, frame);

		// resolves to the outer table component, never to the nested image
		expect(block.element).toBe(frame.querySelector('.se-flex-component'));
	});

	it('still resolves plain lines normally', () => {
		const frame = createFrame('<p>plain</p>');
		const block = resolveBlock(frame.querySelector('p').firstChild, format, frame);

		expect(block.element).toBe(frame.querySelector('p'));
		expect(block.type).toBe('p');
	});
});
