import { dom, keyCodeMap } from '../../../helper';

/**
 * @typedef {Omit<import('../eventManager').default & Partial<SunEditor.Injector>, 'eventManager'>} EventManagerThis_handler_ww_input
 */

/**
 * @private
 * @this {EventManagerThis_handler_ww_input}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {InputEvent} e - Event object
 */
export async function OnBeforeInput_wysiwyg(fc, e) {
	if (fc.get('isReadOnly') || fc.get('isDisabled')) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	const data = (e.data === null ? '' : e.data === undefined ? ' ' : e.data) || '';
	if (!keyCodeMap.isComposing(e)) {
		if (!this.char.test(data, false)) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
		this._handledInBefore = true;
	} else {
		this._handledInBefore = false;
	}

	// user event
	if ((await this.triggerEvent('onBeforeInput', { frameContext: fc, event: e, data })) === false) return;
	// plugin event
	if (this._callPluginEvent('onBeforeInput', { frameContext: fc, event: e, data }) === false) return;
}

/**
 * @private
 * @this {EventManagerThis_handler_ww_input}
 * @param {SunEditor.FrameContext} fc - Frame context object
 * @param {InputEvent} e - Event object
 */
export async function OnInput_wysiwyg(fc, e) {
	if (fc.get('isReadOnly') || fc.get('isDisabled')) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	const range = this.selection.getRange();
	const selectionNode = this.selection.getNode();
	const formatEl = this.format.getLine(selectionNode, null);
	if (!this.format.isNormalLine(formatEl) && !this.format.isBrLine(formatEl) && range.collapsed && !this.component.is(selectionNode) && !dom.check.isList(selectionNode)) {
		const rangeEl = this.format.getBlock(selectionNode, null);
		this._setDefaultLine(this.format.isBlock(rangeEl) ? 'DIV' : this.options.get('defaultLine'));
	}

	this.selection._init();

	const data = (e.data === null ? '' : e.data === undefined ? ' ' : e.data) || '';
	if (!this._handledInBefore) {
		if (!this.char.test(data, true)) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	}
	this._handledInBefore = false;

	// user event
	if ((await this.triggerEvent('onInput', { frameContext: fc, event: e, data })) === false) return;
	// plugin event
	if (this._callPluginEvent('onInput', { frameContext: fc, event: e, data }) === false) return;

	this.history.push(true);
}
