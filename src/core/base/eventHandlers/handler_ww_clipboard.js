export function OnPaste_wysiwyg(frameContext, e) {
	const clipboardData = e.clipboardData;
	if (!clipboardData) return true;
	return this._dataTransferAction('paste', e, clipboardData, frameContext);
}

export function OnCopy_wysiwyg(frameContext, e) {
	const clipboardData = e.clipboardData;

	// user event
	if (this.triggerEvent('onCopy', { frameContext, event: e, clipboardData }) === false) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	const fcSelection = frameContext.get('_ww').getSelection();
	this.__secopy = fcSelection.toString();
}

export function OnCut_wysiwyg(frameContext, e) {
	const clipboardData = e.clipboardData;

	// user event
	if (this.triggerEvent('onCut', { frameContext, event: e, clipboardData }) === false) {
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
