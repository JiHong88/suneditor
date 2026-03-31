import type {} from '../../typedef';
/**
 * @typedef {import('./actions').Action[]} EventActions
 */
/**
 * @description Execute actions sequentially by dispatching each action to its corresponding effect handler.
 * Stops execution early if a HALT action is encountered or if any effect returns `false`.
 * @param {EventActions} actions - Array of actions to execute
 * @param {*} effContext - Effect context containing ports, ctx, and event
 * @returns {Promise<false|undefined>} Returns `false` if execution was halted, `undefined` if all actions completed.
 */
export function actionExecutor(actions: EventActions, effContext: any): Promise<false | undefined>;
export type EventActions = import('./actions').Action[];
