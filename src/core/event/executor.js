import common from './effects/common.registry';
import keydown from './effects/keydown.registry';

const HALT = 'action.stop';

/**
 * @typedef {import('./actions').Action[]} EventActions
 */

/**
 * @description Applies the event-control actions (`prevent` / `stop` / `preventStop`) to the event at once.
 * - Call it synchronously, before the handler's first `await`: a `preventDefault()` deferred past an `await`
 * can land after the browser's default action (an async `onKeyDown` hook, or a dispatch without a microtask
 * checkpoint between listeners), and then the native edit and the reduced one both apply.
 * - `actionExecutor` still runs these actions in order — calling them twice is harmless.
 * @param {EventActions} actions - Reduced action list
 * @param {Event} e - The DOM event the actions were reduced from
 */
export function applyEventControl(actions, e) {
	for (const a of actions) {
		if (a.t === HALT) return;
		if (a.t === 'event.prevent' || a.t === 'event.prevent.stop') e.preventDefault();
		if (a.t === 'event.stop' || a.t === 'event.prevent.stop') e.stopPropagation();
	}
}

/**
 * @description Execute actions sequentially by dispatching each action to its corresponding effect handler.
 * Stops execution early if a HALT action is encountered or if any effect returns `false`.
 * @param {EventActions} actions - Array of actions to execute
 * @param {*} effContext - Effect context containing ports, ctx, and event
 * @returns {Promise<false|undefined>} Returns `false` if execution was halted, `undefined` if all actions completed.
 */
export async function actionExecutor(actions, effContext) {
	const effects = { ...common, ...keydown };
	for (const a of actions) {
		if (a.t === HALT) return false;
		const eff = effects[a.t];
		if (eff) {
			const r = await eff(effContext, a.p);
			if (r === false) return false;
		}
	}
}
