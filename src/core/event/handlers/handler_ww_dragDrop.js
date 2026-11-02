import { dom, env } from '../../../helper';
import { _DragHandle } from '../../../modules/ui';

const { _w } = env;

/**
 * @typedef {import('../eventOrchestrator').default} EventManagerThis_handler_ww_dragDrop
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
	// Block-handle drag uses its own indicator + drop logic — skip the component
	if (e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('application/x-suneditor-block-drag')) {
		return;
	}

	const { sc, so, ec, eo } = _getDropPoint.call(this, e);
	if (!sc) return;

	e.preventDefault();

	const cursorRange = fc.get('_wd').createRange();
	cursorRange.setStart(sc, so);
	cursorRange.setEnd(ec, eo);

	const _offset = { y: 0, x: 0 };
	if (_iframeTopArea) {
		const iframeOffset = this.$.offset.getGlobal(_iframeTopArea);
		const toolbarH = _innerToolbar ? this.$.context.get('toolbar_main').offsetHeight : 0;
		_offset.y = iframeOffset.top + toolbarH - _w.scrollY;
		_offset.x = iframeOffset.left - _w.scrollX;
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
		dragCursor.style.left = `${rect.right + _w.scrollX + _offset.x + frameX}px`;
		dragCursor.style.top = `${rect.top + _w.scrollY + _offset.y - 5 + frameY}px`;
		dragCursor.style.height = `${rect.height + 10}px`;
		dragCursor.style.display = 'block';
		try {
			dragCursor.showPopover?.();
		} catch {
			// ignore
		}
	} else {
		try {
			dragCursor.hidePopover?.();
		} catch {
			// ignore
		}
		dragCursor.style.display = 'none';
	}
}

/**
 * @description Keeps a caret position valid while the dragged selection is removed (`html.remove()`).
 * - In a text node the removal keeps, the point keeps its distance from the text on the far side of the selection.
 * - Otherwise a live `Range` follows the DOM: removed children before the point shift its offset,
 *   and a removed container moves it to where that container was.
 * @param {Document} wd Document that owns the point
 * @param {Node} root The editable root (`wysiwyg`) the point must stay in
 * @param {Node} container The point container
 * @param {number} offset The point offset
 * @param {boolean} after `true` when the point lies after the selection
 * @returns {() => {container: Node, offset: number}} Call after the removal to get the updated point
 */
function _trackPoint(wd, root, container, offset, after) {
	const live = wd.createRange();
	live.setStart(container, offset);
	live.collapse(true);

	const text = container.nodeType === 3 ? /** @type {Text} */ (container) : null;
	const kept = text ? (after ? text.length - offset : offset) : 0;

	return () => {
		if (text && root.contains(text)) {
			const so = after ? text.length - kept : kept;
			return { container: text, offset: Math.max(0, Math.min(so, text.length)) };
		}
		return { container: live.startContainer, offset: live.startOffset };
	};
}

/**
 * @description Turns an element caret position into the text position it stands for; a drop places text reliably only there.
 * - The end of the deepest text before it, or else the start of the deepest text after it (between two blocks, the text after it comes first).
 * - The walk does not enter a component or a non-editable element; with no such text, the point is returned as is.
 * @param {Node} container The point container
 * @param {number} offset The point offset
 * @param {(el: Node) => boolean} isOpaque Returns `true` for an element whose inside must not be entered
 * @param {(el: Node) => boolean} isBlockLevel Returns `true` for a line or block element
 * @returns {{container: Node, offset: number}} The text position, or the given point
 */
function _toTextPoint(container, offset, isOpaque, isBlockLevel) {
	if (container.nodeType === 3) return { container, offset };

	const edgeText = (node, last) => {
		while (node?.nodeType === 1 && !isOpaque(node) && node.childNodes.length > 0) {
			node = last ? node.lastChild : node.firstChild;
		}
		return node?.nodeType === 3 ? /** @type {Text} */ (node) : null;
	};

	const textBefore = () => {
		const text = edgeText(container.childNodes[offset - 1], true);
		return text ? { container: text, offset: text.length } : null;
	};
	const textAfter = () => {
		const text = edgeText(container.childNodes[offset], false);
		return text ? { container: text, offset: 0 } : null;
	};

	const betweenBlocks = isBlockLevel(container.childNodes[offset - 1]);
	return (betweenBlocks ? textAfter() || textBefore() : textBefore() || textAfter()) || { container, offset };
}

/**
 * @description Finds the component a drop point falls inside; an editable line or block in it (a table cell, a caption) holds the point itself.
 * @param {Node} container The point container
 * @param {(el: Node) => boolean} isBlockLevel Returns `true` for a line or block element
 * @returns {?Element} The component container, or `null` when the point is not inside one
 */
function _getEnclosingComponent(container, isBlockLevel) {
	for (let node = container; node && !dom.check.isWysiwygFrame(node); node = node.parentNode) {
		if (dom.check.isComponentContainer(node)) return /** @type {Element} */ (node);
		if (isBlockLevel(node)) return null;
	}
	return null;
}

/**
 * @this {EventManagerThis_handler_ww_dragDrop}
 * @description Resolves the drop point of a drag event.
 * - A point inside a component (block or inline) moves to just before or after it,
 * - by the half the pointer is over: the top or bottom half of a block one, the start or end half of an inline one.
 * @param {DragEvent} e The drag event
 * @returns {{sc: Node, so: number, ec: Node, eo: number}} The drop point
 */
function _getDropPoint(e) {
	const point = this.$.selection.getDragEventLocationRange(e);
	if (!point.sc) return point;

	const isBlockLevel = (el) => this.$.format.isLine(el) || this.$.format.isBlock(el);
	const comp = _getEnclosingComponent(point.sc, isBlockLevel);
	if (!comp) return point;

	const rect = comp.getBoundingClientRect();
	const before = this.$.component.isInline(comp)
		? e.clientX < rect.left + rect.width / 2 !== this.$.options.get('_rtl')
		: e.clientY < rect.top + rect.height / 2;
	const index = dom.query.getPositionIndex(comp);

	const isOpaque = (el) => dom.check.isNonEditable(el) || this.$.component.is(el);
	const { container, offset } = _toTextPoint(comp.parentNode, before ? index : index + 1, isOpaque, isBlockLevel);
	return { sc: container, so: offset, ec: container, eo: offset };
}

/**
 * @this {EventManagerThis_handler_ww_dragDrop}
 * @description Indicates that a drag operation has begun within the editor body.
 */
export function OnDragStart_wysiwyg() {
	this._dragFromWysiwyg = true;
}

/**
 * @this {EventManagerThis_handler_ww_dragDrop}
 * @param {HTMLElement} dragCursor - Drag cursor element
 */
export function OnDragEnd_wysiwyg(dragCursor) {
	this._dragFromWysiwyg = false;
	try {
		dragCursor.hidePopover?.();
	} catch {
		// ignore
	}
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

		// Block-handle drag handles its own drop — skip the text-insertion path.
		if (Array.from(dataTransfer.types || []).includes('application/x-suneditor-block-drag')) {
			return;
		}

		let { sc, so, ec, eo } = _getDropPoint.call(this, e);
		if (!sc) return;

		if (dom.query.getParentElement(sc, '.se-disable-pointer')) {
			e.preventDefault();
			return;
		}

		if (_DragHandle.get('__dragContainer')) {
			e.preventDefault();
			if (_DragHandle.get('__dragContainer').contains(e.target)) {
				this.$.component.deselect();
				return;
			}

			const dragContainer = _DragHandle.get('__dragContainer');
			this.$.component.deselect();
			this.$.selection.setRange(sc, so, ec, eo);
			this.$.html.insertNode(dragContainer, { afterNode: null, skipCharCount: true });

			// document type page
			if (fc.has('documentType_use_page')) {
				fc.get('documentTypePageMirror').innerHTML = fc.get('wysiwyg').innerHTML;
				fc.get('documentType').rePage(true);
			}

			return;
		}

		const dragRange = this.$.selection.getRange();
		const isMove =
			this._dragFromWysiwyg &&
			!dragRange.collapsed &&
			fc.get('wysiwyg').contains(dragRange.commonAncestorContainer);

		if (isMove && dragRange.isPointInRange(sc, so)) {
			e.preventDefault();
			return false;
		}

		const dropPoint = isMove
			? _trackPoint(fc.get('_wd'), fc.get('wysiwyg'), sc, so, dragRange.comparePoint(sc, so) > 0)
			: null;

		this.$.html.remove();

		if (dropPoint) {
			const { container, offset } = dropPoint();
			const isOpaque = (el) => dom.check.isNonEditable(el) || this.$.component.is(el);
			const isBlockLevel = (el) => this.$.format.isLine(el) || this.$.format.isBlock(el);
			({ container: sc, offset: so } = _toTextPoint(container, offset, isOpaque, isBlockLevel));
			ec = sc;
			eo = so;
		}

		if (!dom.check.isText(sc) && !this.$.format.getLine(sc, null)) {
			const line = dom.utils.createElement(this.$.options.get('defaultLine'), null, '<br>');
			sc.insertBefore(line, sc.childNodes[so] || null);
			sc = ec = line;
			so = eo = 0;
		}

		this.$.selection.setRange(sc, so, ec, eo);
		return this._dataTransferAction('drop', e, dataTransfer, fc);
	} finally {
		this._dragFromWysiwyg = false;
		try {
			dragCursor.hidePopover?.();
		} catch {
			// ignore
		}
		dragCursor.style.display = 'none';
	}
}
