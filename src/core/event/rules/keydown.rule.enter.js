import { dom } from '../../../helper';
import { A } from '../actions';

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

	if (!shift) {
		const formatEndEdge = !range.endContainer.nextSibling && format.isEdgeLine(range.endContainer, range.endOffset, 'end');
		const formatStartEdge = !range.startContainer.previousSibling && format.isEdgeLine(range.startContainer, range.startOffset, 'front');

		// add default format line
		if (formatEndEdge && (/^H[1-6]$/i.test(formatEl.nodeName) || /^HR$/i.test(formatEl.nodeName))) {
			ports.enterPrevent(e);
			actions.push(A.enterLineAddDefault(formatEl));
			actions.push(A.enterScrollTo(range));
			return true;
		} else if (rangeEl && formatEl && !dom.check.isTableCell(rangeEl) && !/^FIGCAPTION$/i.test(rangeEl.nodeName)) {
			// add default List line
			const rangeEnt = selection.getRange();
			if (dom.check.isEdgePoint(rangeEnt.endContainer, rangeEnt.endOffset) && dom.check.isList(selectionNode.nextSibling)) {
				ports.enterPrevent(e);
				actions.push(A.enterListAddItem(formatEl, selectionNode));
				actions.push(A.enterScrollTo(range));
				return true;
			}

			if (
				(rangeEnt.commonAncestorContainer.nodeType === 3 ? !(/** @type {HTMLElement} */ (rangeEnt.commonAncestorContainer).nextElementSibling) : true) &&
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

			const selectionFormat = selectionNode === brBlock;
			const wSelection = selection.get();
			const children = selectionNode.childNodes,
				offset = wSelection.focusOffset,
				prev = selectionNode.previousElementSibling,
				next = selectionNode.nextSibling;

			if (
				!format.isClosureBrLine(brBlock) &&
				children &&
				((selectionFormat &&
					range.collapsed &&
					children.length - 1 <= offset + 1 &&
					dom.check.isBreak(children[offset]) &&
					(!children[offset + 1] || ((!children[offset + 2] || dom.check.isZeroWidth(children[offset + 2].textContent)) && children[offset + 1].nodeType === 3 && dom.check.isZeroWidth(children[offset + 1].textContent))) &&
					offset > 0 &&
					dom.check.isBreak(children[offset - 1])) ||
					(!selectionFormat &&
						dom.check.isZeroWidth(selectionNode.textContent) &&
						dom.check.isBreak(prev) &&
						(dom.check.isBreak(prev.previousSibling) || !dom.check.isZeroWidth(prev.previousSibling?.textContent)) &&
						(!next || (!dom.check.isBreak(next) && dom.check.isZeroWidth(next.textContent)))))
			) {
				actions.push(A.enterFormatCleanBrAndZWS(selectionNode, selectionFormat, brBlock, children, offset));
				actions.push(A.enterScrollTo(range));
				return true;
			}

			if (selectionFormat) {
				actions.push(A.enterFormatInsertBrHtml(brBlock, range, wSelection, offset));
			} else {
				actions.push(A.enterFormatInsertBrNode(wSelection));
			}

			actions.push(A.enterScrollTo(range));
			return true;
		}

		// set format attrs - edge
		if (range.collapsed && (formatStartEdge || formatEndEdge)) {
			ports.enterPrevent(e);
			actions.push(A.enterFormatBreakAtEdge(formatEl, selectionNode, formatStartEdge, formatEndEdge));
			actions.push(A.enterScrollTo(range));
			return true;
		}

		if (formatEl) {
			actions.push(A.prevent());

			/** @type {HTMLElement} */
			if (selectRange) {
				actions.push(A.enterFormatBreakWithSelection(formatEl, range, formatStartEdge, formatEndEdge));
			} else {
				actions.push(A.enterFormatBreakAtCursor(formatEl, range));
			}

			actions.push(A.enterScrollTo(range));
			return true;
		}
	}

	if (selectRange) {
		actions.push(A.enterScrollTo(range));
		return true;
	}

	if (rangeEl && dom.query.getParentElement(rangeEl, 'FIGCAPTION') && dom.query.getParentElement(rangeEl, dom.check.isList)) {
		ports.enterPrevent(e);
		actions.push(A.enterFigcaptionExitInList(formatEl));
		actions.push(A.enterScrollTo(range));
	}

	return true;
}
