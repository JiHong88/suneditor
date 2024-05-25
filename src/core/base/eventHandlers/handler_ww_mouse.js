import { domUtils, env } from '../../../helper';
import { _DragHandle } from '../../../modules';

const { _w } = env;

export function OnMouseDown_wysiwyg(frameContext, e) {
	if (frameContext.get('isReadOnly') || domUtils.isNonEditable(frameContext.get('wysiwyg'))) return;
	if (this.format._isExcludeSelectionElement(e.target)) {
		e.preventDefault();
		return;
	}

	this._setSelectionSync();

	this._w.setTimeout(this.selection._init.bind(this.selection), 0);

	// user event
	if (this.triggerEvent('onMouseDown', { frameContext, event: e }) === false) return;

	// plugin event
	if (this._callPluginEvent('onMouseDown', { frameContext, event: e }) === false) return;

	if (this.editor.isBalloon) {
		this._hideToolbar();
	} else if (this.editor.isSubBalloon) {
		this._hideToolbar_sub();
	}

	if (/FIGURE/i.test(e.target.nodeName)) e.preventDefault();
}

export function OnMouseUp_wysiwyg(frameContext, e) {
	// user event
	if (this.triggerEvent('onMouseUp', { frameContext, event: e }) === false) return;

	// plugin event
	if (this._callPluginEvent('onMouseUp', { frameContext, event: e }) === false) return;
}

export function OnClick_wysiwyg(frameContext, e) {
	const targetElement = e.target;

	if (frameContext.get('isReadOnly')) {
		e.preventDefault();
		if (domUtils.isAnchor(targetElement)) {
			_w.open(targetElement.href, targetElement.target);
		}
		return false;
	}

	if (domUtils.isNonEditable(frameContext.get('wysiwyg'))) return;

	// user event
	if (this.triggerEvent('onClick', { frameContext, event: e }) === false) return;
	// plugin event
	if (this._callPluginEvent('onClick', { frameContext, event: e }) === false) return;

	const componentInfo = this.component.get(targetElement);
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
	if (!formatEl && !domUtils.isNonEditable(targetElement) && !domUtils.isList(rangeEl)) {
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

			this.format.removeTextStyle();

			if (n) {
				const insertedNode = this.format.applyTextStyle(n, null, [n.nodeName], false);
				const { parent, inner } = this.nodeTransform.createNestedNode(_styleNode);
				insertedNode.parentNode.insertBefore(parent, insertedNode);
				inner.appendChild(insertedNode);

				this.selection.setRange(insertedNode, domUtils.isZeroWith(insertedNode) ? 1 : 0, insertedNode, 1);
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

export function OnMouseMove_wysiwyg(frameContext, e) {
	if (frameContext.get('isReadOnly') || frameContext.get('isDisabled')) return false;

	// over component
	if (_DragHandle.get('__overInfo') !== false) {
		this._overComponentSelect(e.target);
	}

	this._callPluginEvent('onMouseMove', { frameContext, event: e });
}

export function OnMouseLeave_wysiwyg(frameContext, e) {
	// user event
	if (this.triggerEvent('onMouseLeave', { frameContext, event: e }) === false) return;
	// plugin event
	if (this._callPluginEvent('onMouseLeave', { frameContext, event: e }) === false) return;
}
