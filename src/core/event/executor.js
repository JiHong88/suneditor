import common from './effects/common.registry';
import keydown from './effects/keydown.registry';

const HALT = 'action.stop';

/**
 * @typedef {import('./actions').Action[]} EventActions
 */

/**
 * @description Execute actions sequentially
 * @param {EventActions} actions - Array of actions to execute
 * @param {*} effContext - Effect context containing ports, ctx, and event
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
