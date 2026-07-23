import { dom } from '../../../helper';
import { isRtlBidiMismatch } from '../effects/ruleHelpers';
import { A } from '../actions';

/**
 * @description Decide what an Enter should do inside a normal brLine
 * @param {Node} brBlock The brLine element (e.g. `PRE`).
 * @param {Selection} sel The live DOM selection.
 * @returns {{ shouldExit: boolean }}
 */
function analyzeBrLineEnter(brBlock, sel) {
	const kids = Array.from(brBlock.childNodes);

	// Split into rows by <br>; drop the trailing placeholder row (last child is a <br>).
	const rows = [[]];
	for (const n of kids) {
		if (dom.check.isBreak(n)) rows.push([]);
		else rows[rows.length - 1].push(n);
	}
	if (kids.length && dom.check.isBreak(kids[kids.length - 1])) rows.pop();
	const rowEmpty = (row) => !row || row.every((n) => dom.check.isZeroWidth(n.textContent));

	// Caret's row = number of <br>s strictly before the caret anchor.
	const a = sel.anchorNode;
	let brBefore = 0;
	if (a === brBlock) {
		for (let i = 0; i < sel.anchorOffset && i < kids.length; i++) if (dom.check.isBreak(kids[i])) brBefore++;
	} else {
		for (const n of kids) {
			if (n === a || (n.nodeType === 1 && n.contains(a))) break;
			if (dom.check.isBreak(n)) brBefore++;
		}
	}

	const N = Math.max(rows.length, 1);
	const R = Math.min(brBefore, N - 1);
	const shouldExit = R === N - 1 && rowEmpty(rows[R]) && R >= 1 && rowEmpty(rows[R - 1]);
	return { shouldExit };
}

/**
 * @typedef {import('../actions').Action[]} EventActions
 * @typedef {import('../ports').EventReducerPorts} EventPorts
 * @typedef {import('../reducers/keydown.reducer').KeydownReducerCtx} EventKeydownCtx
 */

/**
 * @this {void}
 * @description Enter key down rule
 * @param {EventActions} actions - Action list
 * @param {EventPorts} ports - Ports for interacting with editor
 * @param {EventKeydownCtx} ctx - Context object
 * @returns {boolean} Return `false` to stop the processing
 */
export function reduceEnterDown(actions, ports, ctx) {
	const { format, char, selection } = ports;
	const { frameOptions, range, formatEl, selectionNode, shift, e } = ctx;
	const selectRange = !range.collapsed || range.startContainer !== range.endContainer;

	actions.push(A.componentDeselect());

	const brBlock = format.getBrLine(selectionNode, null);
	const rangeEl = format.getBlock(formatEl, null);

	if (frameOptions.get('charCounter_type') === 'byte-html') {
		let enterHTML = '';
		if ((!shift && brBlock) || shift) {
			enterHTML = '<br>';
		} else {
			enterHTML = '<' + formatEl.nodeName + '><br></' + formatEl.nodeName + '>';
		}

		if (!char.check(enterHTML)) {
			actions.push(A.prevent());
			return false;
		}
	}

	if (shift) {
		ports.enterPrevent(e);
		actions.push(A.enterShiftBr(range));
		actions.push(A.caretScrollTo(range));
		return true;
	}

	if (!shift) {
		let formatEndEdge = format.isEdgeLine(range.endContainer, range.endOffset, 'end');
		let formatStartEdge = format.isEdgeLine(range.startContainer, range.startOffset, 'front');

		// RTL bidi edge correction: when LTR text (e.g. numbers) is inside an RTL line,
		// the browser places the caret at the logically opposite offset at bidi boundaries.
		let bidiSwapped = false;
		if (ctx.options.get('_rtl') && formatEl && range.collapsed && formatStartEdge !== formatEndEdge) {
			const _wd = ctx.fc.get('_wd');
			if (formatStartEdge && isRtlBidiMismatch(range, formatEl, 'front', _wd)) {
				formatStartEdge = false;
				formatEndEdge = true;
				bidiSwapped = true;
			} else if (formatEndEdge && isRtlBidiMismatch(range, formatEl, 'end', _wd)) {
				formatEndEdge = false;
				formatStartEdge = true;
				bidiSwapped = true;
			}
		}

		// add default format line
		if (formatEndEdge && (/^H[1-6]$/i.test(formatEl.nodeName) || /^HR$/i.test(formatEl.nodeName))) {
			ports.enterPrevent(e);
			actions.push(A.enterLineAddDefault(formatEl));
			actions.push(A.caretScrollTo(range));
			return true;
		} else if (rangeEl && formatEl && !dom.check.isTableCell(rangeEl) && !/^FIGCAPTION$/i.test(rangeEl.nodeName)) {
			// add default List line
			const rangeEnt = selection.getRange();
			if (
				dom.check.isEdgePoint(rangeEnt.endContainer, rangeEnt.endOffset) &&
				dom.check.isList(selectionNode.nextSibling)
			) {
				ports.enterPrevent(e);
				actions.push(A.enterListAddItem(formatEl, selectionNode));
				actions.push(A.caretScrollTo(range));
				return true;
			}

			if (
				(rangeEnt.commonAncestorContainer.nodeType === 3
					? !(/** @type {HTMLElement} */ (rangeEnt.commonAncestorContainer).nextElementSibling)
					: true) &&
				dom.check.isZeroWidth(formatEl.innerText.trim()) &&
				!dom.check.isListCell(formatEl.nextElementSibling)
			) {
				ports.enterPrevent(e);
				actions.push(A.enterFormatExitEmpty(formatEl, rangeEl));
				return true;
			}
		}

		// br line | closure block exception
		if (brBlock || (rangeEl === formatEl && format.isClosureBlock(rangeEl) && format.isLine(formatEl))) {
			ports.enterPrevent(e);

			// Normal brLine (e.g. PRE)
			if (brBlock && !format.isClosureBrLine(brBlock)) {
				if (analyzeBrLineEnter(brBlock, selection.get()).shouldExit) {
					actions.push(A.enterBrLineExit(brBlock));
				} else {
					actions.push(A.enterBrLineInsert(range));
				}
				actions.push(A.caretScrollTo(range));
				return true;
			}

			// Closure brLine / closure block
			const wSelection = selection.get();
			if (selectionNode === brBlock) {
				actions.push(A.enterFormatInsertBrHtml(brBlock, range, wSelection, wSelection.focusOffset));
			} else {
				actions.push(A.enterFormatInsertBrNode(wSelection));
			}
			actions.push(A.caretScrollTo(range));
			return true;
		}

		// set format attrs - edge
		if (range.collapsed && (formatStartEdge || formatEndEdge)) {
			ports.enterPrevent(e);
			actions.push(
				A.enterFormatBreakAtEdge(formatEl, selectionNode, formatStartEdge, formatEndEdge, bidiSwapped),
			);
			actions.push(A.caretScrollTo(range));
			return true;
		}

		if (formatEl) {
			actions.push(A.prevent());

			/** @type {HTMLElement} */
			if (selectRange) {
				// RTL bidi edge correction for selection ranges (formatStartEdge only)
				// formatEndEdge insert-after behavior is already correct for RTL selections
				if (ctx.options.get('_rtl') && formatStartEdge && !formatEndEdge) {
					const _wd = ctx.fc.get('_wd');
					const testRange = _wd.createRange();
					testRange.setStart(range.startContainer, range.startOffset);
					testRange.collapse(true);
					if (isRtlBidiMismatch(testRange, formatEl, 'front', _wd)) {
						formatStartEdge = false;
						formatEndEdge = true;
						bidiSwapped = true;
					}
				}
				actions.push(A.enterFormatBreakWithSelection(formatEl, range, formatStartEdge, formatEndEdge));
			} else {
				actions.push(A.enterFormatBreakAtCursor(formatEl, range));
			}

			actions.push(A.caretScrollTo(range));
			return true;
		}
	}

	if (selectRange) {
		actions.push(A.caretScrollTo(range));
		return true;
	}

	if (
		rangeEl &&
		dom.query.getParentElement(rangeEl, 'FIGCAPTION') &&
		dom.query.getParentElement(rangeEl, dom.check.isList)
	) {
		ports.enterPrevent(e);
		actions.push(A.enterFigcaptionExitInList(formatEl));
		actions.push(A.caretScrollTo(range));
	}

	return true;
}
