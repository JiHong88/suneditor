/**
 * @fileoverview Unit tests for EventOrchestrator._normalizeEditRange
 */

import EventOrchestrator from '../../../../src/core/event/eventOrchestrator';

/**
 * Builds an orchestrator whose `$` is the smallest surface `_normalizeEditRange` touches, with a
 * `resetRangeToTextNode` fake that reproduces what the real one does to an empty line: insert a
 * zero-width text node in front of the `<br>` and leave the range spanning it (offsets 0..1).
 * @param {string} lineHtml Inner HTML of the line
 * @returns {{ eo: Object, line: HTMLElement, wysiwyg: HTMLElement }}
 */
function makeEnv(lineHtml) {
	const wysiwyg = document.createElement('div');
	const line = document.createElement('p');
	line.innerHTML = lineHtml;
	wysiwyg.appendChild(line);
	document.body.appendChild(wysiwyg);

	let range = document.createRange();
	range.setStart(line, 0);
	range.setEnd(line, 0);

	const selection = {
		getRange: () => range,
		getNode: () => range.startContainer,
		setRange(sc, so, ec, eo) {
			const r = document.createRange();
			r.setStart(sc, so);
			r.setEnd(ec, eo);
			range = r;
			return r;
		},
		resetRangeToTextNode() {
			const anchor = line.firstChild;
			const zws = document.createTextNode('​');
			line.insertBefore(zws, anchor);
			selection.setRange(zws, 0, zws, 1);
			return true;
		},
	};

	const eo = Object.create(EventOrchestrator.prototype);
	eo.$ = { format: { isLine: (n) => n === line }, selection };

	return { eo, line, wysiwyg };
}

describe('EventOrchestrator._normalizeEditRange', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	// Regression: the filler used to be left behind, turning an empty line into `<p>{ZWS}<br></p>`.
	// Every downstream line-edge test reads the caret's siblings or the line's child count, so the
	// leftover silently disabled closure-block protection, default-line restore and cross-block merge.
	it('drops the zero-width filler when the caret moves onto the <br> of an empty line', () => {
		const { eo, line } = makeEnv('<br>');

		const node = eo._normalizeEditRange();

		expect(line.innerHTML).toBe('<br>');
		expect(node).toBe(line.firstChild);
		expect(node.nodeName).toBe('BR');
	});

	it('collapses the range onto the <br> so the line reports a clean front edge', () => {
		const { eo, line } = makeEnv('<br>');

		eo._normalizeEditRange();
		const range = eo.$.selection.getRange();

		expect(range.collapsed).toBe(true);
		expect(range.startContainer).toBe(line.querySelector('br'));
		expect(range.startOffset).toBe(0);
		expect(range.startContainer.previousSibling).toBeNull();
	});

	it('keeps the zero-width text node when the caret is not adjacent to a <br>', () => {
		const { eo, line } = makeEnv('<figure></figure>');

		eo._normalizeEditRange();
		const range = eo.$.selection.getRange();

		expect(line.firstChild.nodeType).toBe(3);
		expect(range.collapsed).toBe(true);
		expect(range.startContainer).toBe(line.firstChild);
		expect(range.startOffset).toBe(1);
	});

	it('returns null and leaves the DOM alone when the caret is not on a line', () => {
		const { eo, line } = makeEnv('<br>');
		eo.$.format.isLine = () => false;

		expect(eo._normalizeEditRange()).toBeNull();
		expect(line.innerHTML).toBe('<br>');
	});
});
