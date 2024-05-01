import { Figure } from '../../../modules';

export function OnDragOver_wysiwyg(dragCursor, _iframe, e) {
	e.preventDefault();

	const { sc, so, ec, eo } = this.selection.getEventLocationRange(e);

	const cursorRange = this._d.createRange();
	cursorRange.setStart(sc, so);
	cursorRange.setEnd(ec, eo);

	const _offset = { y: 0, x: 0 };
	if (_iframe) {
		const iframeOffset = this.offset.getGlobal(this.editor.frameContext.get('topArea'));
		_offset.y = iframeOffset.top - this._w.scrollY;
		_offset.x = iframeOffset.left - this._w.scrollX;
	}

	const rect = cursorRange.getBoundingClientRect();
	if (rect.height > 0) {
		dragCursor.style.left = `${rect.right + this._w.scrollX + _offset.x}px`;
		dragCursor.style.top = `${rect.top + this._w.scrollY + _offset.y - 5}px`;
		dragCursor.style.height = `${rect.height + 10}px`;
		dragCursor.style.display = 'block';
	} else {
		dragCursor.style.display = 'none';
	}
}

export function OnDrop_wysiwyg(frameContext, e) {
	if (frameContext.get('isReadOnly')) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	const dataTransfer = e.dataTransfer;
	if (!dataTransfer) return true;

	const { sc, so, ec, eo } = this.selection.getEventLocationRange(e);

	if (Figure.__dragContainer) {
		e.preventDefault();
		if (Figure.__dragContainer.contains(e.target)) {
			this.component.deselect();
			return;
		}

		const dragContainer = Figure.__dragContainer;
		this.component.deselect();
		this.selection.setRange(sc, so, ec, eo);
		this.html.insertNode(dragContainer, null, true);
		return;
	}

	this.html.remove();
	this.selection.setRange(sc, so, ec, eo);
	return this._dataTransferAction('drop', e, dataTransfer, frameContext);
}
