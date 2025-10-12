import { dom } from '../../../helper';
import { A } from '../actions';

/**
 * @this {void}
 * @description Arrow key down rule
 * @param {__se__EventActions} actions - Action list
 * @param {__se__EventPorts} ports - Ports for interacting with editor
 * @param {__se__EventKeydownCtx} ctx - Context object
 */
export function reduceArrowDown(actions, ports, ctx) {
	const { component } = ports;
	const { formatEl, range, selectionNode, keyCode } = ctx;

	// next component
	let cmponentInfo = null;
	switch (keyCode) {
		case 'ArrowUp' /** up key */:
			if (component.is(formatEl.previousElementSibling)) {
				cmponentInfo = component.get(formatEl.previousElementSibling);
			}
			break;
		case 'ArrowLeft' /** left key */:
			if (dom.check.isEdgePoint(selectionNode, range.startOffset, 'front')) {
				const prevEl = selectionNode.previousElementSibling || dom.query.getPreviousDeepestNode(selectionNode);
				if (prevEl) {
					if (component.is(prevEl)) cmponentInfo = component.get(prevEl);
				} else if (component.is(formatEl.previousElementSibling)) {
					cmponentInfo = component.get(formatEl.previousElementSibling);
				}
			}
			break;
		case 'ArrowDown' /** down key */:
			if (component.is(formatEl.nextElementSibling)) {
				cmponentInfo = component.get(formatEl.nextElementSibling);
			}
			break;
		case 'ArrowRight' /** right key */:
			if (dom.check.isEdgePoint(selectionNode, range.endOffset, 'end')) {
				const nextEl = selectionNode.nextElementSibling || dom.query.getNextDeepestNode(selectionNode);
				if (nextEl) {
					if (component.is(nextEl)) cmponentInfo = component.get(nextEl);
				} else if (component.is(formatEl.nextElementSibling)) {
					cmponentInfo = component.get(formatEl.nextElementSibling);
				}
			}
			break;
	}

	if (cmponentInfo && !cmponentInfo.options?.isInputComponent) {
		actions.push(A.prevent());
		actions.push(A.selectComponentFallback(cmponentInfo));
	}
}
