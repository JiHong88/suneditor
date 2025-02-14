/**
 * @typedef {Omit<import('../eventManager').default & Partial<EditorInjector>, 'eventManager'>} EventManagerThis
 */

/**
 * @private
 * @this {EventManagerThis}
 * @param {ClipboardEvent} e - Event object
 */
export function OnPaste_wysiwyg(frameContext, e) {
	const clipboardData = e.clipboardData;
	if (!clipboardData) return true;
	return this._dataTransferAction('paste', e, clipboardData, frameContext);
}

/**
 * @private
 * @this {EventManagerThis}
 * @param {ClipboardEvent} e - Event object
 */
export async function OnCopy_wysiwyg(frameContext, e) {
	const clipboardData = e.clipboardData;

	// user event
	if ((await this.triggerEvent('onCopy', { frameContext, event: e, clipboardData })) === false) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	const fcSelection = frameContext.get('_ww').getSelection();
	this.__secopy = fcSelection.toString();
}

/**
 * @private
 * @this {EventManagerThis}
 * @param {ClipboardEvent} e - Event object
 */
export async function OnCut_wysiwyg(frameContext, e) {
	const clipboardData = e.clipboardData;

	// user event
	if ((await this.triggerEvent('onCut', { frameContext, event: e, clipboardData })) === false) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	const fcSelection = frameContext.get('_ww').getSelection();
	this.__secopy = fcSelection.toString();

	this._w.setTimeout(() => {
		this.history.push(false);
	}, 0);
}
