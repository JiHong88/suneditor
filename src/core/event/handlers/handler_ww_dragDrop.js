import { dom } from '../../../helper';
import { _DragHandle } from '../../../modules/utils';

/**
 * @typedef {import('../eventManager').default} EventManagerThis_handler_ww_dragDrop
 */

/**
 * @this {EventManagerThis_handler_ww_dragDrop}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {HTMLElement} dragCursor - Drag cursor element
 * @param {?HTMLElement} _iframeTopArea - Iframe top area element
 * @param {?HTMLElement} _innerToolbar - Inner toolbar element
 * @param {DragEvent} e - Event object
 */
export function OnDragOver_wysiwyg(fc, dragCursor, _iframeTopArea, _innerToolbar, e) {
	const { sc, so, ec, eo } = this.selection.getDragEventLocationRange(e);
	if (!sc) return;

	e.preventDefault();

	const cursorRange = fc.get('_wd').createRange();
	cursorRange.setStart(sc, so);
	cursorRange.setEnd(ec, eo);

	const _offset = { y: 0, x: 0 };
	if (_iframeTopArea) {
		const iframeOffset = this.offset.getGlobal(_iframeTopArea);
		const toolbarH = _innerToolbar ? this.context.get('toolbar_main').offsetHeight : 0;
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

/**
 * @this {EventManagerThis_handler_ww_dragDrop}
 * @param {HTMLElement} dragCursor - Drag cursor element
 */
export function OnDragEnd_wysiwyg(dragCursor) {
	dragCursor.style.display = 'none';
}

/**
 * @this {EventManagerThis_handler_ww_dragDrop}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {HTMLElement} dragCursor - Drag cursor element
 * @param {DragEvent} e - Event object
 */
export function OnDrop_wysiwyg(fc, dragCursor, e) {
	try {
		if (fc.get('isReadOnly')) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}

		const dataTransfer = e.dataTransfer;
		if (!dataTransfer) return true;

		const { sc, so, ec, eo } = this.selection.getDragEventLocationRange(e);
		if (!sc) return;

		if (dom.query.getParentElement(sc, '.se-disable-pointer')) {
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
			if (fc.has('documentType_use_page')) {
				fc.get('documentTypePageMirror').innerHTML = fc.get('wysiwyg').innerHTML;
				fc.get('documentType').rePage(true);
			}

			return;
		}

		this.html.remove();
		this.selection.setRange(sc, so, ec, eo);
		return this._dataTransferAction('drop', e, dataTransfer, fc);
	} finally {
		dragCursor.style.display = 'none';
	}
}
