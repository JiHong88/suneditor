import { dom } from '../../../helper';
import { hardDelete, isUneditableNode, isRtlBidiMismatch } from '../effects/ruleHelpers';
import { A } from '../actions';

/**
 * @typedef {import('../actions').Action[]} EventActions
 * @typedef {import('../ports').EventReducerPorts} EventPorts
 * @typedef {import('../reducers/keydown.reducer').KeydownReducerCtx} EventKeydownCtx
 */

/**
 * @this {void}
 * @description Delete key down rule
 * @param {EventActions} actions - Action list
 * @param {EventPorts} ports - Ports for interacting with editor
 * @param {EventKeydownCtx} ctx - Context object
 * @returns {boolean} Return `false` to stop the processing
 */
export function reduceDeleteDown(actions, ports, ctx) {
	const { format, component } = ports;
	const { fc, range, selectionNode } = ctx;
	let { formatEl } = ctx;

	const selectRange = !range.collapsed || range.startContainer !== range.endContainer;
	// RTL bidi guard: if offset=length is actually at the visual start due to LTR text in RTL line, skip end-edge handling
	const bidiNotEnd = ctx.options.get('_rtl') && !selectRange && range.endOffset >= (range.endContainer.textContent?.length || 0) && isRtlBidiMismatch(range, formatEl, 'end', fc.get('_wd'));

	actions.push(A.componentDeselect());
	actions.push(A.cacheStyleNode());

	if (selectRange && hardDelete(ports)) {
		actions.push(A.preventStop());
		return true;
	}

	if (!selectRange && !bidiNotEnd && format.isEdgeLine(range.endContainer, range.endOffset, 'end') && !formatEl.nextSibling) {
		actions.push(A.preventStop());
		return false;
	}

	// line delete
	if (
		format.isLine(formatEl) &&
		selectRange &&
		dom.check.isEdgePoint(range.endContainer, range.endOffset, 'end') &&
		(!range.endContainer.nextSibling || dom.check.isZeroWidth(range.endContainer.nextSibling)) &&
		format.getLine(range.startContainer) !== format.getLine(range.endContainer) &&
		(format.isLine(formatEl.nextElementSibling) || dom.check.isListCell(formatEl))
	) {
		actions.push(A.preventStop());
		actions.push(A.delFormatRemoveAndMove(range.endContainer, formatEl));
		actions.push(A.historyPush(true));
		return false;
	}

	// line component
	if (!selectRange && formatEl && (range.endOffset === range.endContainer.textContent.length || selectionNode === formatEl)) {
		const sel =
			selectionNode === formatEl
				? isUneditableNode(ports, range, false)
				: dom.check.isElement(selectionNode.nextSibling)
					? selectionNode.nextSibling
					: dom.check.isEdgePoint(range.endContainer, range.endOffset)
						? dom.query.getNextDeepestNode(range.endContainer, null)
						: null;
		if (component.is(sel)) {
			const fileComponentInfo = component.get(sel);
			if (fileComponentInfo) {
				actions.push(A.preventStop());
				actions.push(A.deleteComponentSelect(formatEl, fileComponentInfo));
				return true;
			}
		}
	}

	// tag[contenteditable='false']
	if (isUneditableNode(ports, range, false)) {
		actions.push(A.preventStop());
		return true;
	}

	// component
	if (
		(format.isLine(selectionNode) || selectionNode.nextSibling === null || (dom.check.isZeroWidth(selectionNode.nextSibling) && selectionNode.nextSibling.nextSibling === null)) &&
		range.startOffset === selectionNode.textContent.length
	) {
		const nextEl = formatEl.nextElementSibling;
		if (!nextEl) return true;

		if (component.is(nextEl)) {
			actions.push(A.prevent());
			actions.push(A.deleteComponentSelectNext(formatEl, nextEl));
			return true;
		}
	}

	if (!selectRange && (dom.check.isEdgePoint(range.endContainer, range.endOffset) || (selectionNode === formatEl ? formatEl.childNodes[range.startOffset] : false))) {
		const sel = selectionNode === formatEl ? formatEl.childNodes[range.startOffset] || selectionNode : selectionNode;
		// delete nonEditable
		if (sel && dom.check.isNonEditable(sel.nextSibling)) {
			actions.push(A.preventStop());
			actions.push(A.domUtilsRemoveItem(sel.nextSibling));
			return true;
		} else if (component.is(sel)) {
			actions.push(A.preventStop());
			actions.push(A.domUtilsRemoveItem(sel));
			return true;
		}
	}

	// format attributes
	if (!selectRange && !bidiNotEnd && format.isEdgeLine(range.endContainer, range.endOffset, 'end')) {
		if (format.isLine(formatEl.nextElementSibling)) {
			actions.push(A.cacheFormatAttrsTemp(formatEl.attributes));
		}
	}

	// nested list
	formatEl = format.getLine(range.startContainer, null);
	const rangeEl = format.getBlock(formatEl, null);
	if (
		dom.check.isListCell(formatEl) &&
		dom.check.isList(rangeEl) &&
		(selectionNode === formatEl ||
			(selectionNode.nodeType === 3 &&
				(!selectionNode.nextSibling || dom.check.isList(selectionNode.nextSibling)) &&
				(format.getLine(range.startContainer, null) !== format.getLine(range.endContainer, null) ? rangeEl.contains(range.endContainer) : range.endOffset === selectionNode.textContent.length && range.collapsed && !bidiNotEnd)))
	) {
		actions.push(A.deleteListRemoveNested(range, formatEl, rangeEl));
		return true;
	}

	return true;
}
