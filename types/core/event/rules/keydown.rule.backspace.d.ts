import type {} from '../../../typedef';
/**
 * @typedef {import('../actions').Action[]} EventActions
 * @typedef {import('../ports').EventReducerPorts} EventPorts
 * @typedef {import('../reducers/keydown.reducer').KeydownReducerCtx} EventKeydownCtx
 */
/**
 * @this {void}
 * @description Backspace key down rule
 * @param {EventActions} actions - Action list
 * @param {EventPorts} ports - Ports for interacting with editor
 * @param {EventKeydownCtx} ctx - Context object
 * @returns {boolean} Return `false` to stop the processing
 */
export function reduceBackspaceDown(this: void, actions: EventActions, ports: EventPorts, ctx: EventKeydownCtx): boolean;
export type EventActions = import('../actions').Action[];
export type EventPorts = import('../ports').EventReducerPorts;
export type EventKeydownCtx = import('../reducers/keydown.reducer').KeydownReducerCtx;
