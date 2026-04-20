import { dom } from '../../../helper';
import { A } from '../actions';

/**
 * @typedef {import('../actions').Action[]} EventActions
 * @typedef {import('../ports').EventReducerPorts} EventPorts
 * @typedef {import('../reducers/keydown.reducer').KeydownReducerCtx} EventKeydownCtx
 */

/**
 */

/**
 * @this {void}
 * @description Arrow key down rule
 * @param {EventActions} actions - Action list
 * @param {EventPorts} ports - Ports for interacting with editor
 * @param {EventKeydownCtx} ctx - Context object
 */
export function reduceArrowDown(actions, ports, ctx) {
	const { component } = ports;
	const { formatEl, range, selectionNode, keyCode } = ctx;
	const rtl = ctx.options.get('_rtl');

	// In RTL, ArrowLeft is forward (toward end on the left), ArrowRight is backward (toward start on the right)
	const hDir = keyCode === 'ArrowLeft' ? (rtl ? 'forward' : 'back') : keyCode === 'ArrowRight' ? (rtl ? 'back' : 'forward') : null;

	// next component
	let cmponentInfo = null;
	switch (keyCode) {
		case 'ArrowUp' /** up key */:
			if (component.is(formatEl.previousElementSibling)) {
				cmponentInfo = component.get(formatEl.previousElementSibling);
			}
			break;
		case 'ArrowLeft' /** left key */:
		case 'ArrowRight' /** right key */:
			if (hDir === 'forward') {
				if (dom.check.isEdgePoint(selectionNode, range.endOffset, 'end')) {
					const nextEl = selectionNode.nextElementSibling || dom.query.getNextDeepestNode(selectionNode);
					if (nextEl) {
						if (component.is(nextEl)) cmponentInfo = component.get(nextEl);
					} else if (component.is(formatEl.nextElementSibling)) {
						cmponentInfo = component.get(formatEl.nextElementSibling);
					}
				}
			} else if (hDir === 'back') {
				if (dom.check.isEdgePoint(selectionNode, range.startOffset, 'front')) {
					const prevEl = selectionNode.previousElementSibling || dom.query.getPreviousDeepestNode(selectionNode);
					if (prevEl) {
						if (component.is(prevEl)) cmponentInfo = component.get(prevEl);
					} else if (component.is(formatEl.previousElementSibling)) {
						cmponentInfo = component.get(formatEl.previousElementSibling);
					}
				}
			}
			break;
		case 'ArrowDown' /** down key */:
			if (component.is(formatEl.nextElementSibling)) {
				cmponentInfo = component.get(formatEl.nextElementSibling);
			}
			break;
	}

	if (cmponentInfo && !cmponentInfo.options?.isInputComponent) {
		actions.push(A.prevent());
		actions.push(A.selectComponentFallback(cmponentInfo));
	}
}
