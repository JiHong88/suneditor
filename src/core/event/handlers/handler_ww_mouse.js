import { dom, env } from '../../../helper';
import { _DragHandle } from '../../../modules/ui';

const { _w } = env;

/**
 * @typedef {import('../eventOrchestrator').default} EventManagerThis_handler_ww_mouse
 */

/**
 * @this {EventManagerThis_handler_ww_mouse}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export async function OnMouseDown_wysiwyg(fc, e) {
	const eventTarget = dom.query.getEventTarget(e);

	this.$.store.set('_mousedown', true);
	if (this.__onDownEv) _offDownFn.call(this);
	this.__onDownEv = this.$.eventManager.addGlobalEvent('mouseup', _offDownFn.bind(this));

	if (fc.get('isReadOnly') || dom.check.isNonEditable(fc.get('wysiwyg'))) return;
	if (this.$.format._isExcludeSelectionElement(eventTarget)) {
		e.preventDefault();
		return;
	}

	this._setSelectionSync();

	// Defer selection.init — browser finalizes selection/range after mousedown event returns
	_w.setTimeout(this.$.selection.init.bind(this.$.selection), 0);

	// user event
	if ((await this.$.eventManager.triggerEvent('onMouseDown', { frameContext: fc, event: e })) === false) return;

	// plugin event
	if ((await this._callPluginEventAsync('onMouseDown', { frameContext: fc, event: e })) === false) return;

	if (this.$.store.mode.isBalloon) {
		this._hideToolbar();
	} else if (this.$.store.mode.isSubBalloon) {
		this._hideToolbar_sub();
	}

	if (/FIGURE/i.test(eventTarget?.nodeName)) e.preventDefault();
}

/**
 * @this {EventManagerThis_handler_ww_mouse}
 */
function _offDownFn() {
	this.$.store.set('_mousedown', false);
	this.__onDownEv = this.$.eventManager.removeGlobalEvent(this.__onDownEv);
}

/**
 * @this {EventManagerThis_handler_ww_mouse}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export async function OnMouseUp_wysiwyg(fc, e) {
	// user event
	if ((await this.$.eventManager.triggerEvent('onMouseUp', { frameContext: fc, event: e })) === false) return;

	// plugin event
	await this._callPluginEventAsync('onMouseUp', { frameContext: fc, event: e });
}

/**
 * @this {EventManagerThis_handler_ww_mouse}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export async function OnClick_wysiwyg(fc, e) {
	const eventTarget = dom.query.getEventTarget(e);

	if (fc.get('isReadOnly')) {
		e.preventDefault();
		if (dom.check.isAnchor(eventTarget)) {
			_w.open(eventTarget.href, eventTarget.target);
		}
		return false;
	}

	if (dom.check.isNonEditable(fc.get('wysiwyg'))) return;

	// user event
	if ((await this.$.eventManager.triggerEvent('onClick', { frameContext: fc, event: e })) === false) return;
	// plugin event
	if ((await this._callPluginEventAsync('onClick', { frameContext: fc, event: e })) === false) return;

	// component
	const componentInfo = this.$.component.get(eventTarget);
	if (componentInfo) {
		e.preventDefault();
		this.$.component.select(componentInfo.target, componentInfo.pluginName);
		return;
	}

	this.$.selection.init();

	if (e.detail === 3) {
		const range = this.$.selection.getRange();
		if (this.$.format.isLine(range.endContainer) && range.endOffset === 0) {
			this.$.selection.setRange(range.startContainer, range.startOffset, range.startContainer, range.startContainer.textContent.length);
		}
	}

	const selectionNode = this.$.selection.getNode();
	const formatEl = this.$.format.getLine(selectionNode, null);
	const rangeEl = this.$.format.getBlock(selectionNode, null);
	if (!formatEl && !dom.check.isNonEditable(eventTarget) && !dom.check.isList(rangeEl)) {
		const range = this.$.selection.getRange();
		if (this.$.format.getLine(range.startContainer) === this.$.format.getLine(range.endContainer)) {
			if (dom.check.isList(rangeEl)) {
				e.preventDefault();
				const prevLi = selectionNode.nextElementSibling;
				const oLi = dom.utils.createElement('LI', null, selectionNode);
				rangeEl.insertBefore(oLi, prevLi);
				this.$.focusManager.focus();
			} else if (
				!dom.check.isWysiwygFrame(selectionNode) &&
				!this.$.component.is(selectionNode) &&
				(!dom.check.isTableElements(selectionNode) || dom.check.isTableCell(selectionNode)) &&
				this._setDefaultLine(this.$.format.isBlock(rangeEl) ? 'DIV' : this.$.options.get('defaultLine')) !== null
			) {
				e.preventDefault();
				this.$.focusManager.focus();
			}
		}
	}

	// copy format
	this.$.commandDispatcher._copyFormat();

	// Defer balloon toggle — selection range is finalized after mouseup event returns
	if (this.$.store.mode.isBalloon || this.$.store.mode.isSubBalloon) _w.setTimeout(this._toggleToolbarBalloon.bind(this), 0);
}

/**
 * @this {EventManagerThis_handler_ww_mouse}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export function OnMouseMove_wysiwyg(fc, e) {
	if (fc.get('isReadOnly') || fc.get('isDisabled')) return false;
	const eventTarget = dom.query.getEventTarget(e);

	// over component
	if (_DragHandle.get('__overInfo') !== false) {
		this.$.component.hoverSelect(eventTarget);
	}

	this._callPluginEvent('onMouseMove', { frameContext: fc, event: e });
}

/**
 * @this {EventManagerThis_handler_ww_mouse}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {MouseEvent} e - Event object
 */
export async function OnMouseLeave_wysiwyg(fc, e) {
	// user event
	if ((await this.$.eventManager.triggerEvent('onMouseLeave', { frameContext: fc, event: e })) === false) return;
	// plugin event
	await this._callPluginEventAsync('onMouseLeave', { frameContext: fc, event: e });
}
