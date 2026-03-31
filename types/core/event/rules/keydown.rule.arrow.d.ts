import type {} from '../../../typedef';
/**
 * @typedef {import('../actions').Action[]} EventActions
 * @typedef {import('../ports').EventReducerPorts} EventPorts
 * @typedef {import('../reducers/keydown.reducer').KeydownReducerCtx} EventKeydownCtx
 */
/**
 */
/**
 * @this {void}
 * @description Arrow key down rule
 * @param {EventActions} actions - Action list
 * @param {EventPorts} ports - Ports for interacting with editor
 * @param {EventKeydownCtx} ctx - Context object
 */
export function reduceArrowDown(this: void, actions: EventActions, ports: EventPorts, ctx: EventKeydownCtx): void;
export type EventActions = import('../actions').Action[];
export type EventPorts = import('../ports').EventReducerPorts;
export type EventKeydownCtx = import('../reducers/keydown.reducer').KeydownReducerCtx;
