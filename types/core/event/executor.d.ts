import type {} from '../../typedef';
/**
 * @typedef {import('./actions').Action[]} EventActions
 */
/**
 * @description Execute actions sequentially
 * @param {EventActions} actions - Array of actions to execute
 * @param {*} effContext - Effect context containing ports, ctx, and event
 */
export function actionExecutor(actions: EventActions, effContext: any): Promise<boolean>;
export type EventActions = import('./actions').Action[];
