import { dom } from '../../../helper';
import { A } from '../actions';

/**
 * @this {void}
 * @description Tab key down rule
 * @param {__se__EventActions} actions - Action list
 * @param {__se__EventPorts} _ports - Ports for interacting with editor
 * @param {__se__EventKeydownCtx} ctx - Context object
 * @returns {boolean} Return false to stop the processing
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
