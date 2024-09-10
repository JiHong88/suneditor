import { domUtils } from '../../../helper';
import { _DragHandle } from '../../../modules';

export function OnDragOver_wysiwyg(fc, dragCursor, _iframeTopArea, _innerToolbar, e) {
	e.preventDefault();

	const { sc, so, ec, eo } = this.selection.getEventLocationRange(e);

	const cursorRange = fc.get('_wd').createRange();
	cursorRange.setStart(sc, so);
	cursorRange.setEnd(ec, eo);

	const _offset = { y: 0, x: 0 };
	if (_iframeTopArea) {
		const iframeOffset = this.offset.getGlobal(_iframeTopArea);
		const toolbarH = _innerToolbar ? this.context.get('toolbar.main').offsetHeight : 0;
		_offset.y = iframeOffset.top + toolbarH - this._w.scrollY;
		_offset.x = iframeOffset.left - this._w.scrollX;
	}

	const rect = cursorRange.getBoundingClientRect();
	if (rect.height > 0) {
		const wwFrame = fc.get('wysiwygFrame');
		let frameX = 0;
		let frameY = 0;
		if (/^iframe$/i.test(wwFrame.nodeName)) {
			frameX = wwFrame.offsetLeft;
			frameY = wwFrame.offsetTop;
		}
		dragCursor.style.left = `${rect.right + this._w.scrollX + _offset.x + frameX}px`;
		dragCursor.style.top = `${rect.top + this._w.scrollY + _offset.y - 5 + frameY}px`;
		dragCursor.style.height = `${rect.height + 10}px`;
		dragCursor.style.display = 'block';
	} else {
		dragCursor.style.display = 'none';
	}
}

export function OnDragEnd_wysiwyg(dragCursor) {
	dragCursor.style.display = 'none';
}

export function OnDrop_wysiwyg(frameContext, dragCursor, e) {
	try {
		if (frameContext.get('isReadOnly')) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}

		const dataTransfer = e.dataTransfer;
		if (!dataTransfer) return true;

		const { sc, so, ec, eo } = this.selection.getEventLocationRange(e);

		if (domUtils.getParentElement(sc, '.se-disable-pointer')) {
			e.preventDefault();
			return;
		}

		if (_DragHandle.get('__dragContainer')) {
			e.preventDefault();
			if (_DragHandle.get('__dragContainer').contains(e.target)) {
				this.component.deselect();
				return;
			}

			const dragContainer = _DragHandle.get('__dragContainer');
			this.component.deselect();
			this.selection.setRange(sc, so, ec, eo);
			this.html.insertNode(dragContainer, { afterNode: null, skipCharCount: true });

			// document type page
			if (frameContext.has('documentType-use-page')) {
				frameContext.get('documentType').rePage(true);
			}

			return;
		}

		this.html.remove();
		this.selection.setRange(sc, so, ec, eo);
		return this._dataTransferAction('drop', e, dataTransfer, frameContext);
	} finally {
		dragCursor.style.display = 'none';
	}
}
