/**
 * @module _DragHandle
 * @description A module that handles drag and drop events.
 * - this module is initialize in the `classes/component.js`.
 */

export const _DragHandle = new Map([
	['__figureInst', null],
	['__dragInst', null],
	['__dragHandler', null],
	['__dragContainer', null],
	['__dragCover', null],
	['__dragMove', null],
	['__overInfo', null]
]);

export default _DragHandle;
