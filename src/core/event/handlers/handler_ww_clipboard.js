import { env } from '../../../helper';

const { _w } = env;

/**
 * @typedef {import('../eventOrchestrator').default} EventManagerThis_handler_ww_clipboard
 */

/**
 * @this {EventManagerThis_handler_ww_clipboard}
 * @param {ClipboardEvent} e - Event object
 */
export function OnPaste_wysiwyg(frameContext, e) {
	const clipboardData = e.clipboardData;
	if (!clipboardData) return true;
	return this._dataTransferAction('paste', e, clipboardData, frameContext);
}

/**
 * @this {EventManagerThis_handler_ww_clipboard}
 * @param {ClipboardEvent} e - Event object
 */
export async function OnCopy_wysiwyg(frameContext, e) {
	const clipboardData = e.clipboardData;

	// user event
	if ((await this.$.eventManager.triggerEvent('onCopy', { frameContext, event: e, clipboardData })) === false) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	const fcSelection = frameContext.get('_ww').getSelection();
	this.__secopy = fcSelection.toString();
}

/**
 * @this {EventManagerThis_handler_ww_clipboard}
 * @param {ClipboardEvent} e - Event object
 */
export async function OnCut_wysiwyg(frameContext, e) {
	const clipboardData = e.clipboardData;

	// user event
	if ((await this.$.eventManager.triggerEvent('onCut', { frameContext, event: e, clipboardData })) === false) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	const fcSelection = frameContext.get('_ww').getSelection();
	this.__secopy = fcSelection.toString();

	_w.setTimeout(() => {
		this.$.history.push(false);
	}, 0);
}
