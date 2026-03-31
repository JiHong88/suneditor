import { dom } from '../../../helper';
import { cleanRemovedTags, hardDelete, isUneditableNode, setDefaultLine } from '../effects/ruleHelpers';
import { A } from '../actions';

/**
 * @typedef {import('../actions').Action[]} EventActions
 * @typedef {import('../ports').EventReducerPorts} EventPorts
 * @typedef {import('../reducers/keydown.reducer').KeydownReducerCtx} EventKeydownCtx
 */

/**
 * @this {void}
 * @description Backspace key down rule
 * @param {EventActions} actions - Action list
 * @param {EventPorts} ports - Ports for interacting with editor
 * @param {EventKeydownCtx} ctx - Context object
 * @returns {boolean} Return `false` to stop the processing
 */
export function reduceBackspaceDown(actions, ports, ctx) {
	const { format, component } = ports;
	const { fc, options, range, selectionNode } = ctx;
	let { formatEl } = ctx;

	const selectRange = !range.collapsed || range.startContainer !== range.endContainer;

	actions.push(A.componentDeselect());
	actions.push(A.cacheStyleNode());

	if (selectRange && hardDelete(ports)) {
		actions.push(A.preventStop());
		return true;
	}

	if (!format.isNormalLine(formatEl) && !format.isBrLine(formatEl) && !fc.get('wysiwyg').firstElementChild && !component.is(selectionNode) && setDefaultLine(ports, options.get('defaultLine')) !== null) {
		actions.push(A.preventStop());
		return false;
	}

	// line delete
	if (
		format.isLine(formatEl) &&
		selectRange &&
		dom.check.isEdgePoint(range.startContainer, range.startOffset, 'front') &&
		(!range.startContainer.previousSibling || dom.check.isZeroWidth(range.startContainer.previousSibling)) &&
		format.getLine(range.startContainer) !== format.getLine(range.endContainer) &&
		(format.isLine(formatEl.previousElementSibling) || dom.check.isListCell(formatEl))
	) {
		actions.push(A.preventStop());
		actions.push(A.delFormatRemoveAndMove(range.startContainer, formatEl));
		actions.push(A.historyPush(true));
		return false;
	}

	// closure, default
	if (
		!selectRange &&
		!formatEl.previousElementSibling &&
		range.startOffset === 0 &&
		!selectionNode.previousSibling &&
		!dom.check.isListCell(formatEl) &&
		format.isLine(formatEl) &&
		(!format.isBrLine(formatEl) || format.isClosureBrLine(formatEl) || dom.check.isWysiwygFrame(formatEl.parentNode))
	) {
		// closure range
		if (format.isClosureBlock(formatEl.parentNode)) {
			actions.push(A.preventStop());
			return false;
		}

		// brLine (pre): strip tag to default line(s)
		if (format.isBrLine(formatEl) && dom.check.isWysiwygFrame(formatEl.parentNode)) {
			actions.push(A.preventStop());
			actions.push(A.backspaceBrLineStrip(formatEl));
			actions.push(A.historyPush(true));
			return false;
		}

		// maintain default format
		if (dom.check.isWysiwygFrame(formatEl.parentNode) && formatEl.childNodes.length <= 1 && (!formatEl.firstChild || dom.check.isZeroWidth(formatEl.textContent))) {
			actions.push(A.preventStop());
			actions.push(A.backspaceFormatMaintain(formatEl));
		}

		actions.push(A.editorNativeFocus());
		return false;
	}

	// clean remove tag
	const startCon = range.startContainer;
	if (formatEl && !formatEl.previousElementSibling && range.startOffset === 0 && startCon.nodeType === 3 && dom.check.isZeroWidth(startCon)) {
		if (cleanRemovedTags(ports, startCon, formatEl) === true) return true;
	}

	// line component
	if (!selectRange && formatEl && (range.startOffset === 0 || selectionNode === formatEl)) {
		const sel =
			selectionNode === formatEl
				? isUneditableNode(ports, range, true)
				: dom.check.isElement(selectionNode.previousSibling)
					? selectionNode.previousSibling
					: dom.check.isEdgePoint(range.startContainer, range.startOffset)
						? dom.query.getPreviousDeepestNode(range.startContainer)
						: null;
		if (component.is(sel)) {
			const fileComponentInfo = component.get(sel);
			if (fileComponentInfo) {
				actions.push(A.preventStop());
				actions.push(A.backspaceComponentSelect(selectionNode, range, fileComponentInfo));
				return true;
			}
		}
	}

	// tag[contenteditable='false']
	if (isUneditableNode(ports, range, true)) {
		actions.push(A.preventStop());
		return true;
	}

	// format attributes
	if (!selectRange && format.isEdgeLine(range.startContainer, range.startOffset, 'front')) {
		if (format.isLine(formatEl.previousElementSibling)) {
			actions.push(A.cacheFormatAttrsTemp(formatEl.previousElementSibling.attributes));
		}
	}

	// nested list
	formatEl = format.getLine(range.startContainer, null);
	const rangeEl = format.getBlock(formatEl, null);
	const commonCon = range.commonAncestorContainer;
	if (rangeEl && formatEl && !dom.check.isTableCell(rangeEl) && !/^FIGCAPTION$/i.test(rangeEl.nodeName)) {
		if (
			dom.check.isListCell(formatEl) &&
			dom.check.isList(rangeEl) &&
			(dom.check.isListCell(rangeEl.parentElement) || formatEl.previousElementSibling) &&
			(selectionNode === formatEl || (selectionNode.nodeType === 3 && (!selectionNode.previousSibling || dom.check.isList(selectionNode.previousSibling)))) &&
			(format.getLine(range.startContainer, null) !== format.getLine(range.endContainer, null) ? rangeEl.contains(range.startContainer) : range.startOffset === 0 && range.collapsed)
		) {
			if (range.startContainer !== range.endContainer) {
				actions.push(A.prevent());
				actions.push(A.backspaceListRemoveNested(range));
				actions.push(A.historyPush(true));
			} else {
				let prev = formatEl.previousElementSibling || rangeEl.parentElement;
				if (dom.check.isListCell(prev)) {
					actions.push(A.prevent());

					let prevLast = prev;
					if (!prev.contains(formatEl) && dom.check.isListCell(prevLast) && dom.check.isList(prevLast.lastElementChild)) {
						prevLast = /** @type {HTMLLIElement} */ (prevLast.lastElementChild.lastElementChild);
						while (dom.check.isListCell(prevLast) && dom.check.isList(prevLast.lastElementChild)) {
							prevLast = /** @type {HTMLLIElement} */ (prevLast.lastElementChild && prevLast.lastElementChild.lastElementChild);
						}
						prev = prevLast;
					}

					actions.push(A.backspaceListMergePrev(prev, formatEl, rangeEl));
					actions.push(A.historyPush(true));
				}
			}

			return true;
		}

		// detach range
		if (!selectRange && range.startOffset === 0) {
			let detach = true;
			let comm = commonCon;
			while (comm && comm !== rangeEl && !dom.check.isWysiwygFrame(comm)) {
				if (comm.previousSibling) {
					if (comm.previousSibling.nodeType === 1 || !dom.check.isZeroWidth(comm.previousSibling.textContent.trim())) {
						detach = false;
						break;
					}
				}
				comm = comm.parentNode;
			}

			if (detach && rangeEl.parentNode) {
				actions.push(A.prevent());
				actions.push(A.formatRemoveBlock(rangeEl, dom.check.isListCell(formatEl) ? [formatEl] : null, null, false, false));
				actions.push(A.historyPush(true));
				return true;
			}
		}
	}

	// component
	if (!selectRange && formatEl && (range.startOffset === 0 || (selectionNode === formatEl ? formatEl.childNodes[range.startOffset] : false))) {
		const isList = dom.check.isListCell(formatEl);
		const sel = selectionNode === formatEl ? formatEl.childNodes[range.startOffset] : selectionNode;
		const prev = (isList ? sel : formatEl).previousSibling;
		// select file component
		const ignoreZWS = isList || ((commonCon.nodeType === 3 || dom.check.isBreak(commonCon)) && !commonCon.previousSibling && range.startOffset === 0);
		if (sel && (isList || !sel.previousSibling) && ((commonCon && component.is(commonCon.previousSibling)) || (ignoreZWS && component.is(prev)))) {
			const fileComponentInfo = component.get(prev);
			if (fileComponentInfo) {
				actions.push(A.preventStop());
				actions.push(A.backspaceComponentRemove(isList, sel, formatEl, fileComponentInfo));
			} else if (component.is(prev)) {
				actions.push(A.preventStop());
				actions.push(A.domUtilsRemoveItem(prev));
			}
			return true;
		}

		// delete nonEditable
		if (sel && dom.check.isNonEditable(sel.previousSibling)) {
			actions.push(A.preventStop());
			actions.push(A.domUtilsRemoveItem(sel.previousSibling));
			return true;
		}
	}

	return true;
}
