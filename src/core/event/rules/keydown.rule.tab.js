import { dom } from '../../../helper';
import { A } from '../actions';

/**
 * @typedef {import('../actions').Action[]} EventActions
 * @typedef {import('../ports').EventReducerPorts} EventPorts
 * @typedef {import('../reducers/keydown.reducer').KeydownReducerCtx} EventKeydownCtx
 */

/**
 * @this {void}
 * @description Tab key down rule
 * @param {EventActions} actions - Action list
 * @param {EventPorts} _ports - Ports for interacting with editor
 * @param {EventKeydownCtx} ctx - Context object
 * @returns {boolean} Return `false` to stop the processing
 */
export function reduceTabDown(actions, _ports, ctx) {
	const { options, selectionNode, range, formatEl, ctrl, alt, shift } = ctx;

	if (options.get('tabDisable')) {
		return true;
	}

	actions.push(A.prevent());

	if (ctrl || alt || dom.check.isWysiwygFrame(selectionNode)) {
		return true;
	}

	actions.push(A.tabFormatIndent(range, formatEl, shift));
	actions.push(A.historyPush(false));

	return true;
}
