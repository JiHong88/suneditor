/**
 * @description Execute actions sequentially
 * @param {__se__EventActions} actions - Array of actions to execute
 * @param {*} effContext - Effect context containing ports, ctx, and event
 */
export function actionExecutor(actions: __se__EventActions, effContext: any): Promise<boolean>;
