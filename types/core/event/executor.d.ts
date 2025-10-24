import type {} from '../../typedef';
/**
 * @description Execute actions sequentially
 * @param {SunEditor.EventActions} actions - Array of actions to execute
 * @param {*} effContext - Effect context containing ports, ctx, and event
 */
export function actionExecutor(actions: SunEditor.EventActions, effContext: any): Promise<boolean>;
