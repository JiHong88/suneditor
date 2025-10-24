import { dom } from '../../../helper';
import { A } from '../actions';

/**
 * @this {void}
 * @description Tab key down rule
 * @param {SunEditor.EventActions} actions - Action list
 * @param {SunEditor.EventPorts} _ports - Ports for interacting with editor
 * @param {SunEditor.EventKeydownCtx} ctx - Context object
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
