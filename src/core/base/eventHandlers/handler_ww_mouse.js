import { domUtils, env } from '../../../helper';
import { _DragHandle } from '../../../modules';

const { _w } = env;

let _onDownEv = null;
function _offDownFn() {
	this.editor.status._onMousedown = false;
	_onDownEv = this.removeGlobalEvent(_onDownEv);
}

/**
 * @typedef {Omit<import('../eventManager').default & Partial<EditorInjector>, 'eventManager'>} EventManagerThis
 */

/**
 * @private
 * @this {EventManagerThis}
 * @param {FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export async function OnMouseDown_wysiwyg(fc, e) {
	const eventTarget = domUtils.getEventTarget(e);

	this.editor.status._onMousedown = true;
	if (_onDownEv) _offDownFn.call(this);
	_onDownEv = this.addGlobalEvent('mouseup', _offDownFn.bind(this));

	if (fc.get('isReadOnly') || domUtils.isNonEditable(fc.get('wysiwyg'))) return;
	if (this.format._isExcludeSelectionElement(eventTarget)) {
		e.preventDefault();
		return;
	}

	this._setSelectionSync();

	this._w.setTimeout(this.selection._init.bind(this.selection), 0);

	// user event
	if ((await this.triggerEvent('onMouseDown', { frameContext: fc, event: e })) === false) return;

	// plugin event
	if (this._callPluginEvent('onMouseDown', { frameContext: fc, event: e }) === false) return;

	if (this.editor.isBalloon) {
		this._hideToolbar();
	} else if (this.editor.isSubBalloon) {
		this._hideToolbar_sub();
	}

	if (/FIGURE/i.test(eventTarget.nodeName)) e.preventDefault();
}

/**
 * @private
 * @this {EventManagerThis}
 * @param {FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export async function OnMouseUp_wysiwyg(fc, e) {
	// user event
	if ((await this.triggerEvent('onMouseUp', { frameContext: fc, event: e })) === false) return;

	// plugin event
	if (this._callPluginEvent('onMouseUp', { frameContext: fc, event: e }) === false) return;
}

/**
 * @private
 * @this {EventManagerThis}
 * @param {FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export async function OnClick_wysiwyg(fc, e) {
	const eventTarget = domUtils.getEventTarget(e);

	if (fc.get('isReadOnly')) {
		e.preventDefault();
		if (domUtils.isAnchor(eventTarget)) {
			_w.open(eventTarget.getAttribute('href'), eventTarget.getAttribute('target'));
		}
		return false;
	}

	if (domUtils.isNonEditable(fc.get('wysiwyg'))) return;

	// user event
	if ((await this.triggerEvent('onClick', { frameContext: fc, event: e })) === false) return;
	// plugin event
	if (this._callPluginEvent('onClick', { frameContext: fc, event: e }) === false) return;

	const componentInfo = this.component.get(eventTarget);
	if (componentInfo) {
		e.preventDefault();
		this.component.select(componentInfo.target, componentInfo.pluginName, false);
		return;
	}

	this.selection._init();

	if (e.detail === 3) {
		let range = this.selection.getRange();
		if (this.format.isLine(range.endContainer) && range.endOffset === 0) {
			range = this.selection.setRange(range.startContainer, range.startOffset, range.startContainer, range.startContainer.length);
			this.selection._rangeInfo(range, this.selection.get());
		}
	}

	const selectionNode = this.selection.getNode();
	const formatEl = this.format.getLine(selectionNode, null);
	const rangeEl = this.format.getBlock(selectionNode, null);
	if (!formatEl && !domUtils.isNonEditable(eventTarget) && !domUtils.isList(rangeEl)) {
		const range = this.selection.getRange();
		if (this.format.getLine(range.startContainer) === this.format.getLine(range.endContainer)) {
			if (domUtils.isList(rangeEl)) {
				e.preventDefault();
				const prevLi = selectionNode.nextElementSibling;
				const oLi = domUtils.createElement('LI', null, selectionNode);
				rangeEl.insertBefore(oLi, prevLi);
				this.editor.focus();
			} else if (
				!domUtils.isWysiwygFrame(selectionNode) &&
				!this.component.is(selectionNode) &&
				(!domUtils.isTableElements(selectionNode) || domUtils.isTableCell(selectionNode)) &&
				this._setDefaultLine(this.format.isBlock(rangeEl) ? 'DIV' : this.options.get('defaultLine')) !== null
			) {
				e.preventDefault();
				this.editor.focus();
			}
		}
	}

	// copy format
	if (this.editor._onCopyFormatInfo) {
		try {
			const _styleNode = [...this.editor._onCopyFormatInfo];
			const n = _styleNode.pop();

			this.format.removeInlineElement();

			if (n) {
				const insertedNode = this.format.applyInlineElement(n, { stylesToModify: null, nodesToRemove: [n.nodeName], strictRemove: false });
				const { parent, inner } = this.nodeTransform.createNestedNode(_styleNode);
				insertedNode.parentNode.insertBefore(parent, insertedNode);
				inner.appendChild(insertedNode);

				this.selection.setRange(insertedNode, domUtils.isZeroWidth(insertedNode) ? 1 : 0, insertedNode, 1);
			}

			if (this.options.get('copyFormatKeepOn')) return;

			this.editor._onCopyFormatInitMethod();
		} catch (err) {
			console.warn('[SUNEDITOR.copyFormat.error] ', err);
			if (!this.editor._onCopyFormatInitMethod?.()) {
				this.editor._onCopyFormatInfo = null;
				this.editor._onCopyFormatInitMethod = null;
			}
		}
	}

	if (this.editor.isBalloon || this.editor.isSubBalloon) this._w.setTimeout(this._toggleToolbarBalloon.bind(this), 0);
}

/**
 * @private
 * @this {EventManagerThis}
 * @param {FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export function OnMouseMove_wysiwyg(fc, e) {
	if (fc.get('isReadOnly') || fc.get('isDisabled')) return false;
	const eventTarget = domUtils.getEventTarget(e);

	// over component
	if (_DragHandle.get('__overInfo') !== false) {
		this._overComponentSelect(eventTarget);
	}

	this._callPluginEvent('onMouseMove', { frameContext: fc, event: e });
}

/**
 * @private
 * @this {EventManagerThis}
 * @param {FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export async function OnMouseLeave_wysiwyg(fc, e) {
	// user event
	if ((await this.triggerEvent('onMouseLeave', { frameContext: fc, event: e })) === false) return;
	// plugin event
	if (this._callPluginEvent('onMouseLeave', { frameContext: fc, event: e }) === false) return;
}
