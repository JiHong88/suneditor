import type {} from '../../typedef';
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
export function applyEventControl(actions: EventActions, e: Event): void;
/**
 * @description Execute actions sequentially by dispatching each action to its corresponding effect handler.
 * Stops execution early if a HALT action is encountered or if any effect returns `false`.
 * @param {EventActions} actions - Array of actions to execute
 * @param {*} effContext - Effect context containing ports, ctx, and event
 * @returns {Promise<false|undefined>} Returns `false` if execution was halted, `undefined` if all actions completed.
 */
export function actionExecutor(actions: EventActions, effContext: any): Promise<false | undefined>;
export type EventActions = import('./actions').Action[];
